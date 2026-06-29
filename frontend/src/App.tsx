import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import MySpacePage from './pages/MySpacePage';
import DownloadPage from './pages/DownloadPage';

function AppRoutes() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const hideHeader = location.pathname === '/my-space';

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/my-space" element={isLoggedIn ? <MySpacePage /> : <Navigate to="/login" />} />
        <Route path="/d/:token" element={<DownloadPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
