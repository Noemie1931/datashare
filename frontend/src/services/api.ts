import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  // Envoie le cookie d'authentification (HttpOnly) avec chaque requête.
  withCredentials: true,
});

// Le JWT voyage désormais dans un cookie HttpOnly géré par le navigateur : plus
// besoin d'ajouter manuellement un en-tête Authorization côté client.

// Si le cookie est invalide ou expiré (401), on déconnecte et on renvoie vers /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;