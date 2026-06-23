import { useState } from 'react';
import api from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(7);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (password) formData.append('password', password);
      formData.append('expires_in_days', String(days));
      const res = await api.post('/files/upload', formData);
      setDownloadUrl(res.data.download_url);
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

  const reset = () => {
    setFile(null);
    setPassword('');
    setDays(7);
    setDownloadUrl('');
    setError('');
  };

  return (
    <div style={bg}>
      {/* Idle — no file selected */}
      {!file && !downloadUrl && (
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Partagez vos fichiers
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px' }}>
            Simple, rapide et sécurisé.
          </p>
          <label style={dropZone}>
            <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>⬆</span>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Cliquez pour sélectionner un fichier</span>
            <span style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px', display: 'block' }}>ou glissez-déposez ici</span>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* File selected — show form */}
      {file && !downloadUrl && (
        <div style={card}>
          <h2>Ajouter un fichier</h2>

          <div style={fileChip}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{file.name}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{(file.size / 1024).toFixed(1)} Ko</p>
            </div>
            <button onClick={() => setFile(null)} style={ghostBtn}>✕</button>
          </div>

          {error && <p style={{ color: '#e05a4e', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <label style={label}>Mot de passe (optionnel)</label>
          <input
            type="password"
            placeholder="Laisser vide si aucun"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={input}
          />

          <label style={label}>Durée de validité</label>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={input}>
            <option value={1}>1 jour</option>
            <option value={3}>3 jours</option>
            <option value={7}>7 jours</option>
          </select>

          <button onClick={handleUpload} disabled={loading} style={primaryBtn}>
            {loading ? 'Envoi en cours…' : 'Téléverser le fichier'}
          </button>
        </div>
      )}

      {/* Success */}
      {downloadUrl && (
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '48px' }}>✅</span>
            <h2 style={{ marginTop: '12px' }}>Fichier partagé !</h2>
            <p style={{ fontSize: '14px', color: '#888' }}>Copiez le lien ci-dessous pour le partager.</p>
          </div>

          <div style={linkBox}>
            <span style={{ fontSize: '13px', color: '#e05a4e', wordBreak: 'break-all', lineHeight: '1.4' }}>
              {downloadUrl}
            </span>
          </div>

          <button onClick={copyLink} style={primaryBtn}>
            {copied ? '✓ Lien copié !' : '📋 Copier le lien'}
          </button>
          <button onClick={reset} style={{ ...ghostBtn, width: '100%', marginTop: '10px', padding: '10px', fontSize: '14px' }}>
            Partager un autre fichier
          </button>
        </div>
      )}
    </div>
  );
}

const bg: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5a89a 0%, #e05a4e 100%)',
  padding: '80px 20px 40px',
};

const card: React.CSSProperties = {
  background: 'white',
  padding: '36px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

const dropZone: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.15)',
  border: '2px dashed rgba(255,255,255,0.5)',
  borderRadius: '16px',
  padding: '48px 40px',
  cursor: 'pointer',
  color: 'white',
  width: '320px',
  transition: 'background 0.15s',
};

const fileChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#f9f9f9',
  borderRadius: '10px',
  padding: '12px 14px',
  marginBottom: '20px',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#555',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  marginBottom: '16px',
  borderRadius: '10px',
  border: '1px solid #e0e0e0',
  fontSize: '14px',
  outline: 'none',
  background: '#fafafa',
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '13px',
  background: '#e05a4e',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  marginTop: '4px',
};

const ghostBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#888',
  fontSize: '13px',
  marginLeft: 'auto',
  padding: '4px 8px',
  borderRadius: '6px',
};

const linkBox: React.CSSProperties = {
  background: '#fff5f4',
  border: '1px solid #fdd',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '16px',
};
