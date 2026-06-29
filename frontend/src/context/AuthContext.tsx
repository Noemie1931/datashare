import { createContext, useContext, useState, type ReactNode } from 'react';
import api from '../services/api';

// Contexte d'authentification : centralise l'état de connexion et les actions
// login/logout, au lieu de les faire descendre en cascade par les props
// (prop drilling). N'importe quel composant les lit via le hook useAuth().

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Le JWT est dans un cookie HttpOnly (illisible par JS). On ne garde qu'un
  // indicateur NON sensible en localStorage pour piloter l'affichage connecté.
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth'));

  const login = () => {
    localStorage.setItem('auth', '1');
    setIsLoggedIn(true);
  };

  const logout = async () => {
    // Seul le serveur peut supprimer le cookie HttpOnly.
    try {
      await api.post('/auth/logout');
    } catch {
      // on déconnecte côté client quoi qu'il arrive
    }
    localStorage.removeItem('auth');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
