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

type Filter = 'all' | 'active' | 'expired';

export default function MySpacePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const copyLink = (file: FileItem) => {
    navigator.clipboard.writeText(`${window.location.origin}/d/${file.downloadToken}`);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tout' },
    { key: 'active', label: 'Actifs' },
    { key: 'expired', label: 'Expirés' },
  ];

  return (
    <div style={layout}>
      {/* Left gradient panel */}
      <aside style={sidebar}>
        <div style={{ marginTop: 'auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Mon espace
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
            Gérez vos fichiers partagés, copiez les liens ou supprimez-les.
          </p>
        </div>
        <div style={{ marginTop: '32px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          {files.length} fichier{files.length !== 1 ? 's' : ''}
        </div>
      </aside>

      {/* Right content panel */}
      <main style={content}>
        <div style={{ padding: '32px 36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0 }}>Mes fichiers</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={filterBtn(filter === f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {files.length === 0 ? (
            <div style={emptyState}>
              <span style={{ fontSize: '40px' }}>📭</span>
              <p style={{ marginTop: '12px', color: '#888', fontSize: '14px' }}>Aucun fichier trouvé</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {files.map(file => {
                const expired = new Date(file.expiresAt) < new Date();
                return (
                  <div key={file.id} style={fileRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>📄</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.originalName}
                        </p>
                        <p style={{ fontSize: '12px', color: expired ? '#e05a4e' : '#888', marginTop: '2px' }}>
                          {expired ? '⚠ Expiré' : `Expire le ${new Date(file.expiresAt).toLocaleDateString('fr-FR')}`}
                          {' · '}{(file.sizeBytes / 1024).toFixed(1)} Ko
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => copyLink(file)}
                        style={actionBtn('#f0f0f0', '#444')}
                      >
                        {copiedId === file.id ? '✓ Copié' : 'Partager'}
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        style={actionBtn('#fff0ef', '#e05a4e')}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const layout: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebar: React.CSSProperties = {
  width: '280px',
  flexShrink: 0,
  background: 'linear-gradient(160deg, #f5a89a 0%, #e05a4e 100%)',
  padding: '100px 28px 40px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
};

const content: React.CSSProperties = {
  flex: 1,
  background: '#f9f9f9',
  overflowY: 'auto',
  paddingTop: '64px',
};

const emptyState: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #eee',
};

const fileRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
  gap: '12px',
};

function filterBtn(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    background: active ? '#e05a4e' : '#f0f0f0',
    color: active ? 'white' : '#555',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    transition: 'background 0.15s',
  };
}

function actionBtn(bg: string, color: string): React.CSSProperties {
  return {
    padding: '7px 14px',
    background: bg,
    color,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  };
}
