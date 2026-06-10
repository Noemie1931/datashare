import { useState } from 'react';
import api from '../services/api';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleSubmit = async () => {
  try {
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const res = await api.post(endpoint, { email, password });
    localStorage.setItem('token', res.data.access_token);
    onLogin();
    window.location.href = '/';
  } catch (e: any) {
    setError(e.response?.data?.message || 'Erreur');
  }
};

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #f5a89a, #e05a4e)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '360px' }}>
        <h2 style={{ marginBottom: '24px' }}>{isRegister ? 'Créer un compte' : 'Connexion'}</h2>
        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '12px', background: '#e05a4e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
        >
          {isRegister ? 'Créer mon compte' : 'Connexion'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer', color: '#e05a4e' }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Déjà un compte ? Se connecter' : 'Créer un compte'}
        </p>
      </div>
    </div>
  );
}