import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { formatSize } from '../utils/format';
import styles from './DownloadPage.module.css';

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function ExpiryCallout({ expiresAt }: { expiresAt: string }) {
  const days = daysUntil(expiresAt);
  if (days <= 0) return null;
  const isWarning = days <= 1;
  const text = days === 1 ? 'Ce fichier expirera demain.' : `Ce fichier expirera dans ${days} jours.`;
  return (
    <div
      role="status"
      className={`${styles.callout} ${isWarning ? styles.calloutWarning : styles.calloutInfo}`}
    >
      {isWarning
        ? <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        : <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {text}
    </div>
  );
}

function ErrorCallout({ text }: { text: string }) {
  return (
    <div role="alert" className={styles.errorCallout}>
      <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {text}
    </div>
  );
}

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/d/${token}`)
      .then(res => setFileInfo(res.data))
      .catch((e: any) => {
        if (e.response?.status === 404) {
          setError('Ce lien est invalide : aucun fichier ne correspond.');
        } else if (e.response?.status === 403) {
          setError('Ce fichier n\'est plus disponible car le lien a expiré.');
        } else {
          setError('Ce fichier n\'est plus disponible.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await api.post(`/d/${token}/download`, { password }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.file_name;
      a.click();
    } catch (e: any) {
      let message = 'Le téléchargement a échoué, réessayez.';
      try {
        const data = e.response?.data;
        if (data instanceof Blob) {
          message = JSON.parse(await data.text()).message || message;
        } else if (data?.message) {
          message = data.message;
        }
      } catch {
        // on garde le message par défaut
      }
      setError(message);
    }
    setDownloading(false);
  };

  if (loading) {
    return <div className={styles.bg}></div>;
  }

  return (
    <div className={styles.bg}>
      <main className={styles.card}>
        <h2 className={styles.title}>
          Télécharger un fichier
        </h2>

        {!fileInfo ? (
          <ErrorCallout text={error || 'Ce fichier n\'est plus disponible en téléchargement car il a expiré.'} />
        ) : (
          <>
            <div className={styles.fileChip}>
              <svg aria-hidden="true" focusable="false" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.fileChipIcon}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div>
                <p className={styles.fileName}>{fileInfo.file_name}</p>
                <p className={styles.fileSize}>{formatSize(fileInfo.size)}</p>
              </div>
            </div>

            <ExpiryCallout expiresAt={fileInfo.expires_at} />

            {error && <ErrorCallout text={error} />}

            {fileInfo.has_password && (
              <>
                <label htmlFor="download-password" className={styles.label}>Mot de passe</label>
                <input
                  id="download-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Saisissez le mot de passe..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDownload()}
                  className={styles.input}
                />
              </>
            )}

            <button type="button" onClick={handleDownload} disabled={downloading} className={styles.primaryBtn}>
              <span className={styles.btnInner}>
                {downloading ? 'Téléchargement…' : 'Télécharger'}
                <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </span>
            </button>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        Copyright DataShare® 2025
      </footer>
    </div>
  );
}
