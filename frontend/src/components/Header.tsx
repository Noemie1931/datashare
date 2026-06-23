import { useNavigate } from 'react-router-dom';

export default function Header({ isLoggedIn, onLogout }: { isLoggedIn: boolean; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px 28px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      <span
        onClick={() => navigate('/')}
        style={{
          fontWeight: 700,
          fontSize: '18px',
          color: 'white',
          cursor: 'pointer',
          letterSpacing: '-0.3px',
        }}
      >
        DataShare
      </span>

      <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => navigate('/my-space')}
              style={navBtn()}
            >
              Mon espace
            </button>
            <button
              onClick={onLogout}
              style={{ ...navBtn(), background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} style={navBtn()}>
            Se connecter
          </button>
        )}
      </nav>
    </header>
  );
}

function navBtn(): React.CSSProperties {
  return {
    padding: '8px 18px',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    backdropFilter: 'blur(4px)',
    transition: 'background 0.15s',
  };
}
