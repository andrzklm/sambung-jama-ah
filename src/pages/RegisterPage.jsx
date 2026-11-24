import { AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { KATEGORI_USIA_LIST } from '../types';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kategoriUsia, setKategoriUsia] = useState('Dewasa / Umum');
  const [noHp, setNoHp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        nama,
        email,
        password,
        kategori_usia: kategoriUsia,
        no_hp: noHp,
      });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal mendaftarkan akun. Silakan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-lg w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 sm:p-10">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <img
              src="/assets/aistudio/logo-horizontal-icon-type-green_7de31e69.png"
              alt="Sambung Jama'ah"
              className="w-36 h-12 object-cover object-[50%_43%]"
            />
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-800 whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Kembali Masuk</span>
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Daftar Akun Jama'ah Baru
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Satu akun orang tua dapat digunakan untuk mengisi presensi diri sendiri sekaligus mewakilkan anak.
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
              htmlFor="reg-nama"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Nama Lengkap
            </label>
            <input
              id="reg-nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Bapak Budi Santoso"
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Alamat Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Kata Sandi (minimal 6 karakter)
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Buat kata sandi yang mudah diingat"
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="reg-kategori"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Kategori Usia / Kelompok
            </label>
            <select
              id="reg-kategori"
              value={kategoriUsia}
              onChange={(e) => setKategoriUsia(e.target.value)}
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              {KATEGORI_USIA_LIST.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reg-hp"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Nomor HP / WhatsApp (Opsional)
            </label>
            <input
              id="reg-hp"
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-12 px-6 py-3 flex items-center justify-center gap-2 text-base font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            <span>{submitting ? 'Mendaftarkan...' : "Buat Akun Jama'ah"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
