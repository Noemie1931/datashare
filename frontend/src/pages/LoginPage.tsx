import { useState } from 'react';
import api from '../services/api';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
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

  return (
    <div style={bg}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '36px' }}>🔐</span>
          <h2 style={{ marginTop: '10px' }}>
            {isRegister ? 'Créer un compte' : 'Connexion'}
          </h2>
          <p style={{ fontSize: '14px', color: '#888' }}>
            {isRegister ? 'Rejoignez DataShare dès aujourd\'hui' : 'Bienvenue sur DataShare'}
          </p>
        </div>

        {error && (
          <div style={errorBox}>{error}</div>
        )}

        <label style={label}>Adresse email</label>
        <input
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={input}
        />

        <label style={label}>Mot de passe</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ ...input, marginBottom: '24px' }}
        />

        <button onClick={handleSubmit} disabled={loading} style={primaryBtn}>
          {loading ? 'Chargement…' : isRegister ? 'Créer mon compte' : 'Se connecter'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: '#888' }}>
          {isRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: '#e05a4e', cursor: 'pointer', fontWeight: 600 }}
          >
            {isRegister ? 'Se connecter' : 'Créer un compte'}
          </span>
        </p>
      </div>
    </div>
  );
}

const bg: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5a89a 0%, #e05a4e 100%)',
  padding: '80px 20px 40px',
};

const card: React.CSSProperties = {
  background: 'white',
  padding: '36px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#555',
  marginBottom: '6px',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  marginBottom: '14px',
  borderRadius: '10px',
  border: '1px solid #e0e0e0',
  fontSize: '14px',
  outline: 'none',
  background: '#fafafa',
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  padding: '13px',
  background: '#e05a4e',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
};

const errorBox: React.CSSProperties = {
  background: '#fff5f4',
  border: '1px solid #fcc',
  borderRadius: '10px',
  padding: '10px 14px',
  marginBottom: '16px',
  fontSize: '13px',
  color: '#c0392b',
};
