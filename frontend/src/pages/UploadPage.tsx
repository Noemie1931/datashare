import { useState } from 'react';
import api from '../services/api';
import { formatSize } from '../utils/format';
import styles from './UploadPage.module.css';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    if (password && password.length < 6) {
      setError('Mot de passe : minimum 6 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (password) formData.append('password', password);
      formData.append('expires_in_days', String(days));
      const res = await api.post('/v1/files/upload', formData);
      const token = res.data.download_token;
      setDownloadUrl(`${window.location.origin}/d/${token}`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de l\'upload');
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className={styles.bg}>
      {/* Idle — no file selected */}
      {!file && !downloadUrl && (
        <div className={styles.idle}>
          <p className={styles.idleTitle}>
            Tu veux partager un fichier ?
          </p>
          <label className={styles.uploadLabel}>
            <div className={styles.uploadCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <input id="upload-file-initial" type="file" aria-label="Choisir un fichier" onChange={e => setFile(e.target.files?.[0] || null)} className={styles.srOnly} />
          </label>
        </div>
      )}

      {/* File selected — show form */}
      {file && !downloadUrl && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Ajouter un fichier</h2>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.fileChip}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.fileIcon} aria-hidden="true" focusable="false">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>{formatSize(file.size)}</p>
            </div>
            <label className={styles.changerLabel}>
              <span className={styles.changerBtn}>Changer</span>
              <input id="upload-file-change" type="file" aria-label="Choisir un fichier" onChange={e => setFile(e.target.files?.[0] || null)} className={styles.srOnly} />
            </label>
          </div>

          <label className={styles.label} htmlFor="upload-password">Mot de passe</label>
          <input
            id="upload-password"
            type="password"
            placeholder="Optionnel"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`${styles.input} ${styles.passwordInput}`}
          />
          <p className={styles.passwordHint}>
            Mot de passe : minimum 6 caractères.
          </p>

          <label className={styles.label} htmlFor="upload-expires">Expiration</label>
          <div className={styles.selectWrap}>
            <select id="upload-expires" value={days} onChange={e => setDays(Number(e.target.value))} className={`${styles.input} ${styles.select}`}>
              <option value={1}>Une journée</option>
              <option value={3}>3 jours</option>
              <option value={7}>Une semaine</option>
            </select>
            <svg className={styles.selectArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" aria-hidden="true" focusable="false">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <button type="button" onClick={handleUpload} disabled={loading} className={styles.primaryBtn}>
            <span className={styles.primaryBtnInner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {loading ? 'Envoi en cours…' : 'Téléverser'}
            </span>
          </button>
        </div>
      )}

      {/* Success */}
      {downloadUrl && (
        <div className={styles.card}>
          <h2 className={styles.cardTitleCenter}>Ajouter un fichier</h2>

          <div className={styles.fileChip}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.fileIcon} aria-hidden="true" focusable="false">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{file?.name}</p>
              <p className={styles.fileSize}>{file ? formatSize(file.size) : '0 Ko'}</p>
            </div>
          </div>

          <p className={styles.successText}>
            Félicitations, ton fichier sera conservé chez nous pendant {days === 1 ? 'une journée' : days === 3 ? '3 jours' : 'une semaine'} !
          </p>

          <div className={styles.linkBox}>
            <a href={downloadUrl} className={styles.downloadLink}>
              {downloadUrl}
            </a>
          </div>

          <div className={styles.copyRow}>
            <button type="button" onClick={copyLink} className={styles.copyBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? 'Lien copié !' : 'Copier le lien'}
            </button>
          </div>

        </div>
      )}

      <footer className={styles.footer}>
        Copyright DataShare® 2025
      </footer>
    </main>
  );
}
