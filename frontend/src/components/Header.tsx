import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <header className={styles.header}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className={styles.logo}
      >
        DataShare
      </button>

      <nav className={styles.nav}>
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/my-space')}
              className={styles.navBtn}
            >
              Mon espace
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={styles.navBtn}
          >
            Se connecter
          </button>
        )}
      </nav>
    </header>
  );
}
