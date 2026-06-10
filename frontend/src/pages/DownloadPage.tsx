import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/d/${token}`)
      .then(res => setFileInfo(res.data))
      .catch(() => setError('Lien invalide ou expiré'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
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
    } catch (e: any) {
      setError('Mot de passe incorrect ou lien expiré');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f5a89a, #e05a4e)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '400px' }}>
        {error ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '48px' }}>❌</p>
            <h2>{error}</h2>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '24px' }}>Télécharger un fichier</h2>
            <p style={{ marginBottom: '8px' }}>📄 {fileInfo.file_name}</p>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
              {(fileInfo.size / 1024).toFixed(1)} Ko — Expire le {new Date(fileInfo.expires_at).toLocaleDateString()}
            </p>
            {fileInfo.has_password && (
              <input
                type="password"
                placeholder="Mot de passe requis"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            )}
            {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
            <button
              onClick={handleDownload}
              style={{ width: '100%', padding: '12px', background: '#e05a4e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
            >
              ⬇️ Télécharger
            </button>
          </>
        )}
      </div>
    </div>
  );
}