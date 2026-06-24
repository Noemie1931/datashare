import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { formatSize } from '../utils/format';

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function ExpiryCallout({ expiresAt }: { expiresAt: string }) {
  const days = daysUntil(expiresAt);
  if (days <= 0) return null;
  const isWarning = days <= 1;
  const text = days === 1 ? 'Ce fichier expirera demain.' : `Ce fichier expirera dans ${days} jours.`;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px',
      background: isWarning ? '#fff8f0' : '#f0f4ff',
      border: `1px solid ${isWarning ? '#f5c07a' : '#b3c6f5'}`,
      color: isWarning ? '#b07020' : '#3355bb',
    }}>
      {isWarning
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {text}
    </div>
  );
}

function ErrorCallout({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
      background: '#fff0f0', border: '1px solid #f5b3b3', color: '#c0392b',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
      .catch(() => setError('Ce fichier n\'est plus disponible en téléchargement car il a expiré.'))
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
    } catch {
      setError('Mot de passe incorrect ou lien expiré.');
    }
    setDownloading(false);
  };

  if (loading) {
    return <div style={bg}></div>;
  }

  return (
    <div style={bg}>
      <div style={card}>
        <h2 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '20px' }}>
          Télécharger un fichier
        </h2>

        {!fileInfo ? (
          <ErrorCallout text={error || 'Ce fichier n\'est plus disponible en téléchargement car il a expiré.'} />
        ) : (
          <>
            <div style={fileChip}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div>
                <p style={{ fontWeight: 500, fontSize: '13px', color: '#111' }}>{fileInfo.file_name}</p>
                <p style={{ fontSize: '11px', color: '#888' }}>{formatSize(fileInfo.size)}</p>
              </div>
            </div>

            <ExpiryCallout expiresAt={fileInfo.expires_at} />

            {error && <ErrorCallout text={error} />}

            {fileInfo.has_password && (
              <>
                <label style={label}>Mot de passe</label>
                <input
                  type="password"
                  placeholder="Saisissez le mot de passe..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDownload()}
                  style={input}
                />
              </>
            )}

            <button onClick={handleDownload} disabled={downloading} style={primaryBtn}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {downloading ? 'Téléchargement…' : 'Télécharger'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </span>
            </button>
          </>
        )}
      </div>

      <footer style={footer}>
        Copyright DataShare® 2025
      </footer>
    </div>
  );
}

const bg: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(172.84deg, #FFB88C 2.29%, #DE6262 97.71%)',
  padding: '80px 20px 40px',
};

const card: React.CSSProperties = {
  background: 'white',
  padding: '28px 32px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '380px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
};

const footer: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0 48px',
  fontSize: '12px',
  color: 'rgba(255,255,255,0.7)',
};

const fileChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#555',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #e8e8e8',
  fontSize: '14px',
  outline: 'none',
  background: 'white',
  boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  background: '#FBE4D8',
  color: '#E07A3A',
  border: '1px solid #F0B89A',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};
