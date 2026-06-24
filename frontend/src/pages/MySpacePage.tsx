import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface FileItem {
  id: string;
  originalName: string;
  sizeBytes: number;
  uploadedAt: string;
  expiresAt: string;
  downloadToken: string;
  hasPassword?: boolean;
}

type Filter = 'all' | 'active' | 'expired';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'active', label: 'Actifs' },
  { key: 'expired', label: 'Expiré' },
];

export default function MySpacePage({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<FileItem | null>(null);

  const loadFiles = async () => {
    const res = await api.get(`/files?filter=${filter}`);
    setFiles(res.data);
  };

  useEffect(() => { loadFiles(); }, [filter]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    await api.delete(`/files/${toDelete.id}`);
    setToDelete(null);
    loadFiles();
  };

  const openFile = (file: FileItem) => {
    window.open(`${window.location.origin}/d/${file.downloadToken}`, '_blank');
  };

  const expiryLabel = (dateStr: string) => {
    const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (d <= 0) return null;
    if (d === 1) return 'Expire demain';
    return `Expire dans ${d} jours`;
  };

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={{ padding: '24px 20px' }}>
          <span
            onClick={() => navigate('/')}
            style={{ fontWeight: 700, fontSize: '18px', color: 'white', cursor: 'pointer', letterSpacing: '-0.3px' }}
          >
            DataShare
          </span>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <button style={sidebarTab}>Mes fichiers</button>
        </div>
        <div style={{ marginTop: 'auto', padding: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.75)' }}>
          Copyright DataShare® 2025
        </div>
      </aside>

      {/* Right side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FDF8F4' }}>
        {/* Top bar */}
        <div style={topBar}>
          <button onClick={() => navigate('/')} style={darkPill}>
            Ajouter des fichiers
          </button>
          <button onClick={onLogout} style={logoutBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>

        {/* Content */}
        <main style={{ padding: '28px 36px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 700, color: '#111' }}>Mes fichiers</h2>

          {/* Switch */}
          <div style={switchContainer}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={switchSegment(filter === f.key)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* File list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {files.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '14px' }}>Aucun fichier trouvé</p>
            ) : (
              files.map(file => {
                const expired = new Date(file.expiresAt) < new Date();
                return (
                  <div key={file.id} style={fileRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.originalName}
                        </p>
                        <p style={{ fontSize: '12px', color: expired ? '#c0392b' : '#111', marginTop: '2px' }}>
                          {expired ? 'Expiré' : expiryLabel(file.expiresAt)}
                        </p>
                      </div>
                    </div>

                    {expired ? (
                      <p style={{ fontSize: '13px', color: '#aaa', flexShrink: 0 }}>
                        Ce fichier a expiré, il n'est plus stocké chez nous
                      </p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        {file.hasPassword && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        )}
                        <button onClick={() => setToDelete(file)} style={outlineBtn}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Supprimer
                        </button>
                        <button onClick={() => openFile(file)} style={outlineBtn}>
                          Accéder
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {toDelete && (
        <div style={modalOverlay} onClick={() => setToDelete(null)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#111' }}>
              Supprimer ce fichier ?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666', wordBreak: 'break-all' }}>
              {toDelete.originalName} sera définitivement supprimé.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setToDelete(null)} style={cancelBtn}>Annuler</button>
              <button onClick={confirmDelete} style={deleteBtn}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const layout: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebar: React.CSSProperties = {
  width: '200px',
  flexShrink: 0,
  background: 'linear-gradient(172.84deg, #FFB88C 2.29%, #DE6262 97.71%)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const sidebarTab: React.CSSProperties = {
  padding: '8px 18px',
  background: '#FDF0E9',
  color: '#333',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  width: '100%',
  textAlign: 'left',
};

const topBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '12px',
  height: '64px',
  padding: '0 28px',
  background: '#FCEEE6',
};

const darkPill: React.CSSProperties = {
  padding: '9px 18px',
  background: '#1a1a1a',
  color: 'white',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
};

const logoutBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 14px',
  background: 'transparent',
  color: '#E07A3A',
  border: 'none',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
};

const switchContainer: React.CSSProperties = {
  display: 'inline-flex',
  gap: '2px',
  padding: '3px',
  background: '#FBE9E0',
  borderRadius: '999px',
};

function switchSegment(active: boolean): React.CSSProperties {
  return {
    padding: '6px 20px',
    background: active ? '#E8836B' : 'transparent',
    color: active ? 'white' : '#888',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 500,
    transition: 'background 0.15s',
  };
}

const fileRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  background: '#FCEEE6',
  border: '1px solid #F5EBE3',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  gap: '12px',
};

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalCard: React.CSSProperties = {
  background: 'white',
  padding: '24px 28px',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '360px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
};

const cancelBtn: React.CSSProperties = {
  padding: '9px 18px',
  background: '#FBE4D8',
  color: '#E07A3A',
  border: '1px solid #F0B89A',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
};

const deleteBtn: React.CSSProperties = {
  padding: '9px 18px',
  background: '#E07A3A',
  color: 'white',
  border: '1px solid #E07A3A',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
};

const outlineBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '7px 14px',
  background: 'white',
  color: '#E07A3A',
  border: '1px solid #F0B89A',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
};
