import { useEffect, useState } from 'react';
import api from '../services/api';

interface FileItem {
  id: string;
  originalName: string;
  sizeBytes: number;
  uploadedAt: string;
  expiresAt: string;
  downloadToken: string;
}

export default function MySpacePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState('all');

  const loadFiles = async () => {
    const res = await api.get(`/files?filter=${filter}`);
    setFiles(res.data);
  };

  useEffect(() => { loadFiles(); }, [filter]);

  const deleteFile = async (id: string) => {
    if (!confirm('Supprimer ce fichier ?')) return;
    await api.delete(`/files/${id}`);
    loadFiles();
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`http://localhost:3000/d/${token}`);
    alert('Lien copié !');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Mes fichiers</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'active', 'expired'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', background: filter === f ? '#e05a4e' : '#f0f0f0', color: filter === f ? 'white' : 'black', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            {f === 'all' ? 'Tout' : f === 'active' ? 'Actifs' : 'Expirés'}
          </button>
        ))}
      </div>

      {files.length === 0 && <p style={{ color: '#888' }}>Aucun fichier</p>}

      {files.map(file => (
        <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div>
            <p style={{ fontWeight: 500 }}>📄 {file.originalName}</p>
            <p style={{ fontSize: '12px', color: '#888' }}>Expire le {new Date(file.expiresAt).toLocaleDateString()}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => copyLink(file.downloadToken)} style={{ padding: '8px 12px', background: '#f0f0f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Partager
            </button>
            <button onClick={() => deleteFile(file.id)} style={{ padding: '8px 12px', background: '#fee', color: '#e05a4e', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}