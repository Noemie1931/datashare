import { useState } from 'react';
import api from '../services/api';
import styles from './LoginPage.module.css';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    if (isRegister) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Email : format invalide.');
        return;
      }
      if (password.length < 8) {
        setError('Mot de passe : minimum 8 caractères.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }
    setLoading(true);
    try {
      const endpoint = isRegister ? '/v1/auth/register' : '/v1/auth/login';
      await api.post(endpoint, { email, password });
      // Le serveur a posé le cookie HttpOnly ; on met juste à jour l'état d'affichage.
      login();
      window.location.href = '/';
    } catch (e: any) {
      setError(e.response?.data?.message || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setConfirmPassword('');
  };

  return (
    <div className={styles.bg}>
      <main className={styles.card}>
        <h2 className={styles.title}>
          {isRegister ? 'Créer un compte' : 'Connexion'}
        </h2>

        {error && <div className={styles.errorBox} role="alert">{error}</div>}

        <label className={styles.label} htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Saisissez votre email..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />

        <label className={styles.label} htmlFor="login-password">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          placeholder="Saisissez votre mot de passe..."
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={isRegister ? `${styles.input} ${styles.inputTight}` : styles.input}
        />
        {isRegister && (
          <p className={styles.hint}>
            Mot de passe : minimum 8 caractères.
          </p>
        )}

        {isRegister && (
          <>
            <label className={styles.label} htmlFor="login-confirm">Vérification du mot de passe</label>
            <input
              id="login-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Saisissez-le à nouveau..."
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.input}
            />
          </>
        )}

        <p className={styles.switchWrap}>
          <button type="button" onClick={switchMode} className={styles.switchBtn}>
            {isRegister ? 'J\'ai déjà un compte' : 'Créer un compte'}
          </button>
        </p>

        <button type="button" onClick={handleSubmit} disabled={loading} className={styles.primaryBtn}>
          {loading ? 'Chargement…' : isRegister ? 'Créer mon compte' : 'Connexion'}
        </button>
      </main>

      <footer className={styles.footer}>
        Copyright DataShare® 2025
      </footer>
    </div>
  );
}
