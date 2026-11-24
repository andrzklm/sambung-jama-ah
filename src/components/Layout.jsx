import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/kegiatan', label: 'Jadwal' },
    { to: '/presensi', label: 'Presensi' },
    { to: '/profil', label: 'Profil' },
    ...(user?.role === 'dkm' ? [{ to: '/dkm', label: 'Dashboard DKM' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Logo */}
          <Link
            to="/"
            aria-label="Sambung Jama'ah Beranda"
            className="inline-flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 rounded-lg"
          >
            <img
              src="/assets/aistudio/logo-horizontal-icon-type-green_7de31e69.png"
              alt="Sambung Jama'ah"
              className="w-36 h-12 object-cover object-[50%_43%]"
            />
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6"
          >
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive(item.to)
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Keluar</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-medium ${
                  isActive(item.to)
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/logo-icon-green_6d5d6af6.png"
              alt=""
              aria-hidden="true"
              className="w-5 h-5 object-contain shrink-0"
            />
            <span>Sambung Jama'ah — Informasi Kegiatan & Presensi Digital</span>
          </div>
          <span>Dirancang untuk seluruh Jama'ah Masjid</span>
        </div>
      </footer>
    </div>
  );
}
