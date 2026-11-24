import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('amanah123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Visual & Introduction Column */}
        <div className="lg:col-span-6 relative bg-teal-900 text-white flex flex-col justify-between min-h-70 lg:min-h-150">
          {!imgError ? (
            <img
              src="/src/assets/images/masjid_courtyard_hero_1795320517770.jpg"
              alt="Serambi Masjid Sambung Jama'ah dengan pencahayaan pagi"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-teal-900 via-teal-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/65 via-slate-950/35 to-slate-950/90" />

          <div className="relative p-8">
            <img
              src="/assets/aistudio/logo-horizontal-icon-type-white_befd671d.png"
              alt="Sambung Jama'ah"
              className="w-44 h-14 object-cover object-[50%_43%]"
            />
          </div>

          <div className="relative p-8 space-y-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold leading-snug text-white text-balance">
              Platform terpadu bagi seluruh Jama'ah
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-md">
              Dikembangkan untuk memudahkan Jama'ah Masjid mendapatkan informasi terkait kegiatan & mengisi presensi kehadiran pengajian.
            </p>
          </div>
        </div>

        {/* Right Login Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2 mb-7">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Masuk ke Akun Anda
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Gunakan email dan kata sandi yang terdaftar untuk melihat jadwal dan mengisi presensi.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Alamat Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full min-h-11.5 px-4 py-2.5 pr-12 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-12 px-6 py-3 flex items-center justify-center gap-2 text-base font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 disabled:opacity-60 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <span>{submitting ? 'Memproses...' : 'Masuk'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </button>
          </form>

          <p className="mt-6 text-sm sm:text-base text-slate-600 text-center">
            Belum memiliki akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-teal-800 hover:underline"
            >
              Daftar sebagai Jama'ah Baru
            </Link>
          </p>

          {/* Akun Uji Coba Cepat */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {/* <p className="text-xs font-medium text-slate-500 mb-3">
              Uji coba cepat (kata sandi terisi otomatis):
            </p> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('jamaah@sambungjamaah.id')}
                className="px-3.5 py-2.5 text-left text-xs border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="block font-semibold text-slate-800">
                  Isi Akun Jama'ah
                </span>
                <span className="text-slate-500">Ibu Siti Aminah</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('pengurus@sambungjamaah.id')}
                className="px-3.5 py-2.5 text-left text-xs border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="block font-semibold text-slate-800">
                  Isi Akun Pengurus DKM
                </span>
                <span className="text-slate-500">H. Ahmad Fauzi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
