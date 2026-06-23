import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

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
      .catch(() => setError('Lien invalide ou expiré'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const res = await api.post(`/d/${token}/download`,
        { password },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.file_name;
      a.click();
    } catch {
      setError('Mot de passe incorrect ou lien expiré');
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div style={bg}>
        <div style={{ color: 'white', fontSize: '16px' }}>Chargement…</div>
      </div>
    );
  }

  return (
    <div style={bg}>
      <div style={card}>
        {error && !fileInfo ? (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '56px' }}>❌</span>
            <h2 style={{ marginTop: '16px', color: '#c0392b' }}>Lien invalide</h2>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
              Ce lien est expiré ou n'existe pas.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '44px' }}>⬇️</span>
              <h2 style={{ marginTop: '10px' }}>Télécharger un fichier</h2>
            </div>

            <div style={fileChip}>
              <span style={{ fontSize: '20px' }}>📄</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{fileInfo.file_name}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {(fileInfo.size / 1024).toFixed(1)} Ko · Expire le {new Date(fileInfo.expires_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {fileInfo.has_password && (
              <>
                <label style={label}>Mot de passe requis</label>
                <input
                  type="password"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={input}
                />
              </>
            )}

            {error && (
              <div style={errorBox}>{error}</div>
            )}

            <button onClick={handleDownload} disabled={downloading} style={primaryBtn}>
              {downloading ? 'Téléchargement…' : 'Télécharger le fichier'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const bg: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5a89a 0%, #e05a4e 100%)',
  padding: '40px 20px',
};

const card: React.CSSProperties = {
  background: 'white',
  padding: '36px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

const fileChip: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#f9f9f9',
  borderRadius: '10px',
  padding: '14px 16px',
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
};

const errorBox: React.CSSProperties = {
  background: '#fff5f4',
  border: '1px solid #fcc',
  borderRadius: '10px',
  padding: '10px 14px',
  marginBottom: '16px',
  fontSize: '13px',
  color: '#c0392b',
};
