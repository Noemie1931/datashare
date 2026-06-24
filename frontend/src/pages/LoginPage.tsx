import { useState } from 'react';
import api from '../services/api';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
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
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, { email, password });
      localStorage.setItem('token', res.data.access_token);
      onLogin();
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
    <div style={bg}>
      <div style={card}>
        <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '24px' }}>
          {isRegister ? 'Créer un compte' : 'Connexion'}
        </h2>

        {error && <div style={errorBox}>{error}</div>}

        <label style={label}>Email</label>
        <input
          type="email"
          placeholder="Saisissez votre email..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={input}
        />

        <label style={label}>Mot de passe</label>
        <input
          type="password"
          placeholder="Saisissez votre mot de passe..."
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={isRegister ? { ...input, marginBottom: '4px' } : input}
        />
        {isRegister && (
          <p style={{ fontSize: '11px', color: '#999', marginBottom: '16px' }}>
            Mot de passe : minimum 8 caractères.
          </p>
        )}

        {isRegister && (
          <>
            <label style={label}>Vérification du mot de passe</label>
            <input
              type="password"
              placeholder="Saisissez-le à nouveau..."
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={input}
            />
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', marginBottom: '14px' }}>
          <span onClick={switchMode} style={{ color: '#E07A3A', cursor: 'pointer' }}>
            {isRegister ? 'J\'ai déjà un compte' : 'Créer un compte'}
          </span>
        </p>

        <button onClick={handleSubmit} disabled={loading} style={primaryBtn}>
          {loading ? 'Chargement…' : isRegister ? 'Créer mon compte' : 'Connexion'}
        </button>
      </div>

      <footer style={footer}>
        Copyright DataShare® 2025
      </footer>
    </div>
  );
}

const bg: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(172.84deg, #FFB88C 2.29%, #DE6262 97.71%)',
  padding: '80px 20px 40px',
};

const card: React.CSSProperties = {
  background: 'white',
  padding: '32px 36px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#555',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #e8e8e8',
  fontSize: '14px',
  outline: 'none',
  background: 'white',
  boxSizing: 'border-box',
  color: '#111',
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  background: '#FBE4D8',
  color: '#E07A3A',
  border: '1px solid #F0B89A',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

const footer: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '0 48px',
  fontSize: '12px',
  color: 'rgba(255,255,255,0.7)',
};

const errorBox: React.CSSProperties = {
  background: '#fff5f4',
  border: '1px solid #fcc',
  borderRadius: '8px',
  padding: '10px 14px',
  marginBottom: '16px',
  fontSize: '13px',
  color: '#c0392b',
};
