import { useNavigate } from 'react-router-dom';

export default function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '72px',
      padding: '0 48px',
      gap: '10px',
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
          color: '#111',
          cursor: 'pointer',
          letterSpacing: '-0.3px',
        }}
      >
        DataShare
      </span>

      <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <button onClick={() => navigate('/my-space')} style={navBtn()}>
              Mon espace
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
    padding: '8px 20px',
    background: '#1a1a1a',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  };
}
