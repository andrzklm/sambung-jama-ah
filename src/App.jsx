import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardDKMPage from './pages/DashboardDKMPage';
import EditProfilePage from './pages/EditProfilePage';
import HomePage from './pages/HomePage';
import InformasiKegiatanPage from './pages/InformasiKegiatanPage';
import LoginPage from './pages/LoginPage';
import PresensiPage from './pages/PresensiPage';
import RegisterPage from './pages/RegisterPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <img
          src="/assets/aistudio/logo-vertical-icon-type-green_335209e4.png"
          alt="Sambung Jama'ah"
          className="w-20 h-20 object-contain"
        />
        <div className="text-sm font-medium text-slate-500">
          Memuat aplikasi...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function GuestOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <img
          src="/assets/aistudio/logo-vertical-icon-type-green_335209e4.png"
          alt="Sambung Jama'ah"
          className="w-20 h-20 object-contain"
        />
        <div className="text-sm font-medium text-slate-500">
          Memuat aplikasi...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kegiatan"
            element={
              <ProtectedRoute>
                <InformasiKegiatanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/presensi"
            element={
              <ProtectedRoute>
                <PresensiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dkm"
            element={
              <ProtectedRoute>
                <DashboardDKMPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
