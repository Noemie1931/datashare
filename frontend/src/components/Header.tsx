import { useNavigate } from 'react-router-dom';

export default function Header({ isLoggedIn, onLogout }: { isLoggedIn: boolean; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <span style={{ fontWeight: 700, fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => navigate('/')}>
        DataShare
      </span>
      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/my-space')} style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Mon espace
          </button>
          <button onClick={onLogout} style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Se déconnecter
          </button>
        </div>
      ) : (
        <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid white', borderRadius: '6px', cursor: 'pointer' }}>
          Se connecter
        </button>
      )}
    </div>
  );
}