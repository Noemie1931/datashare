import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './MySpacePage.module.css';
import { useAuth } from '../context/AuthContext';

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

export default function MySpacePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<FileItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  const loadFiles = async () => {
    const res = await api.get(`/v1/files?filter=${filter}`);
    // Le back renvoie une réponse paginée { items, total, page, limit, totalPages }
    setFiles(res.data.items);
  };

  useEffect(() => { loadFiles(); }, [filter]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    await api.delete(`/v1/files/${toDelete.id}`);
    setToDelete(null);
    loadFiles();
  };

  const openFile = (file: FileItem) => {
    window.open(`${window.location.origin}/d/${file.downloadToken}`, '_blank');
  };

  const copyLink = async (file: FileItem) => {
    const url = `${window.location.origin}/d/${file.downloadToken}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Repli pour les contextes non securises (http hors localhost) ou
        // les navigateurs sans Clipboard API.
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(file.id);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Si la copie echoue, on ouvre le lien pour que l'utilisateur le copie a la main.
      openFile(file);
    }
  };

  // Nettoyage du minuteur pour eviter une mise a jour d'etat apres demontage.
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const expiryLabel = (dateStr: string) => {
    const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (d <= 0) return null;
    if (d === 1) return 'Expire demain';
    return `Expire dans ${d} jours`;
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.logo}
          >
            DataShare
          </button>
        </div>
        <div className={styles.sidebarTabWrap}>
          <button type="button" className={styles.sidebarTab}>Mes fichiers</button>
        </div>
        <div className={styles.copyright}>
          Copyright DataShare® 2025
        </div>
      </aside>

      {/* Right side */}
      <div className={styles.rightSide}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <button type="button" onClick={() => navigate('/')} className={styles.darkPill}>
            Ajouter des fichiers
          </button>
          <button type="button" onClick={logout} className={styles.logoutBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>

        {/* Content */}
        <main className={styles.content}>
          <h2 className={styles.title}>Mes fichiers</h2>

          {/* Annonce accessible (lecteurs d'ecran) du resultat de la copie */}
          <p className={styles.srOnly} role="status" aria-live="polite">
            {copiedId ? 'Lien de telechargement copie dans le presse-papier' : ''}
          </p>

          {/* Switch */}
          <div className={styles.switchContainer}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`${styles.switchSegment} ${filter === f.key ? styles.switchSegmentActive : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* File list */}
          <div className={styles.fileList}>
            {files.length === 0 ? (
              <p className={styles.emptyText}>Aucun fichier trouvé</p>
            ) : (
              files.map(file => {
                const expired = new Date(file.expiresAt) < new Date();
                return (
                  <div key={file.id} className={styles.fileRow}>
                    <div className={styles.fileInfo}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.fileIcon} aria-hidden="true" focusable="false">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <div className={styles.fileText}>
                        <p className={styles.fileName}>
                          {file.originalName}
                        </p>
                        <p className={`${styles.fileExpiry} ${expired ? styles.fileExpiryExpired : ''}`}>
                          {expired ? 'Expiré' : expiryLabel(file.expiresAt)}
                        </p>
                      </div>
                    </div>

                    {expired ? (
                      <p className={styles.expiredNote}>
                        Ce fichier a expiré, il n'est plus stocké chez nous
                      </p>
                    ) : (
                      <div className={styles.fileActions}>
                        {file.hasPassword && (
                          <span
                            className={styles.lockIcon}
                            role="img"
                            aria-label="Protégé par mot de passe"
                            title="Protégé par mot de passe"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          </span>
                        )}
                        <button type="button" onClick={() => setToDelete(file)} className={styles.outlineBtn}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Supprimer
                        </button>
                        <button type="button" onClick={() => copyLink(file)} className={styles.outlineBtn}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                          {copiedId === file.id ? 'Lien copié' : 'Copier le lien'}
                        </button>
                        <button type="button" onClick={() => openFile(file)} className={styles.outlineBtn}>
                          Accéder
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
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
        <div className={styles.modalOverlay} onClick={() => setToDelete(null)}>
          <div
            className={styles.modalCard}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <h3 id="delete-modal-title" className={styles.modalTitle}>
              Supprimer ce fichier ?
            </h3>
            <p className={styles.modalText}>
              {toDelete.originalName} sera définitivement supprimé.
            </p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setToDelete(null)} className={styles.cancelBtn} aria-label="Annuler la suppression">Annuler</button>
              <button type="button" onClick={confirmDelete} className={styles.deleteBtn} aria-label="Confirmer la suppression du fichier">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
