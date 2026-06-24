import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import MySpacePage from './pages/MySpacePage';
import DownloadPage from './pages/DownloadPage';

function AppRoutes({ isLoggedIn, onLogin, onLogout }: { isLoggedIn: boolean; onLogin: () => void; onLogout: () => void }) {
  const location = useLocation();
  const hideHeader = location.pathname === '/my-space';

  return (
    <>
      {!hideHeader && <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />}
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/my-space" element={isLoggedIn ? <MySpacePage onLogout={onLogout} /> : <Navigate to="/login" />} />
        <Route path="/d/:token" element={<DownloadPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <AppRoutes isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  );
}
