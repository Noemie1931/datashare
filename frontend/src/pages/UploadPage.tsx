import { useState } from 'react';
import api from '../services/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(7);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (password) formData.append('password', password);
      formData.append('expires_in_days', String(days));
      const res = await api.post('/files/upload', formData);
      setDownloadUrl(res.data.download_url);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur upload');
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    alert('Lien copié !');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f5a89a, #e05a4e)' }}>
      {!file && !downloadUrl && (
        <div style={{ textAlign: 'center', color: 'white' }}>
          <p style={{ fontSize: '24px', marginBottom: '24px' }}>Tu veux partager un fichier ?</p>
          <label style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '32px' }}>
            ⬆️
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {file && !downloadUrl && (
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '400px' }}>
          <h2 style={{ marginBottom: '24px' }}>Ajouter un fichier</h2>
          <p style={{ marginBottom: '16px' }}>📄 {file.name} — {(file.size / 1024).toFixed(1)} Ko</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input
            type="password"
            placeholder="Mot de passe (optionnel)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value={1}>1 jour</option>
            <option value={3}>3 jours</option>
            <option value={7}>7 jours</option>
          </select>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#e05a4e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
          >
            {loading ? 'Envoi...' : '⬆️ Téléverser'}
          </button>
        </div>
      )}

      {downloadUrl && (
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '400px' }}>
          <h2 style={{ marginBottom: '16px' }}>✅ Fichier partagé !</h2>
          <p style={{ marginBottom: '16px', wordBreak: 'break-all', color: '#e05a4e' }}>{downloadUrl}</p>
          <button
            onClick={copyLink}
            style={{ width: '100%', padding: '12px', background: '#e05a4e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
          >
            📋 Copier le lien
          </button>
        </div>
      )}
    </div>
  );
}