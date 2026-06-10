import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import MySpacePage from './pages/MySpacePage';
import DownloadPage from './pages/DownloadPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/my-space" element={isLoggedIn ? <MySpacePage /> : <Navigate to="/login" />} />
        <Route path="/d/:token" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}