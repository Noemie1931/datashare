import { useState } from 'react';
import api from '../services/api';
import { formatSize } from '../utils/format';

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
      const res = await api.post('/files/upload', formData);
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
    <div style={bg}>
      {/* Idle — no file selected */}
      {!file && !downloadUrl && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '22px', fontWeight: 600, color: '#111', marginBottom: '28px' }}>
            Tu veux partager un fichier ?
          </p>
          <label style={{ cursor: 'pointer', display: 'inline-block' }}>
            <div style={uploadCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* File selected — show form */}
      {file && !downloadUrl && (
        <div style={card}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700, color: '#111' }}>Ajouter un fichier</h2>

          {error && <p style={{ color: '#e05a4e', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <div style={fileChip}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: '13px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
              <p style={{ fontSize: '11px', color: '#888' }}>{formatSize(file.size)}</p>
            </div>
            <label style={{ cursor: 'pointer' }}>
              <span style={changerBtn}>Changer</span>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>

          <label style={label}>Mot de passe</label>
          <input
            type="password"
            placeholder="Optionnel"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...input, marginBottom: '4px' }}
          />
          <p style={{ fontSize: '11px', color: '#999', marginBottom: '16px' }}>
            Mot de passe : minimum 6 caractères.
          </p>

          <label style={label}>Expiration</label>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ ...input, marginBottom: 0, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}>
              <option value={1}>Une journée</option>
              <option value={3}>3 jours</option>
              <option value={7}>Une semaine</option>
            </select>
            <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <button onClick={handleUpload} disabled={loading} style={primaryBtn}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {loading ? 'Envoi en cours…' : 'Téléverser'}
            </span>
          </button>
        </div>
      )}

      {/* Success */}
      {downloadUrl && (
        <div style={card}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', fontWeight: 700, color: '#111' }}>Ajouter un fichier</h2>

          <div style={fileChip}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: '13px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file?.name}</p>
              <p style={{ fontSize: '11px', color: '#888' }}>{file ? formatSize(file.size) : '0 Ko'}</p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#111', marginBottom: '12px', lineHeight: '1.5' }}>
            Félicitations, ton fichier sera conservé chez nous pendant {days === 1 ? 'une journée' : days === 3 ? '3 jours' : 'une semaine'} !
          </p>

          <div style={linkBox}>
            <a href={downloadUrl} style={{ fontSize: '13px', color: '#E07A3A', wordBreak: 'break-all', textDecoration: 'underline' }}>
              {downloadUrl}
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={copyLink} style={copyBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? 'Lien copié !' : 'Copier le lien'}
            </button>
          </div>

        </div>
      )}

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

const uploadCircle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: '#1a1a1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  transition: 'opacity 0.15s',
};

const fileChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'transparent',
  padding: '10px 0',
  marginBottom: '18px',
};

const changerBtn: React.CSSProperties = {
  padding: '5px 14px',
  background: 'white',
  color: '#E07A3A',
  border: '1px solid #F0B89A',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const copyBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: '#FBE4D8',
  color: '#E07A3A',
  border: '1px solid #F0B89A',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

const linkBox: React.CSSProperties = {
  background: '#f5f5f5',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '12px 14px',
  marginBottom: '20px',
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
  marginBottom: '14px',
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
