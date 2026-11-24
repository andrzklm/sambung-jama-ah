import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiRequest, ApiError } from '../services/api';
import { KATEGORI_USIA_LIST } from '../types';

export default function EditProfilePage() {
  const { user, updateCurrentUser } = useAuth();

  const [nama, setNama] = useState(user?.nama || '');
  const [email, setEmail] = useState(user?.email || '');
  const [kategoriUsia, setKategoriUsia] = useState(
    user?.kategori_usia || 'Dewasa / Umum'
  );
  const [noHp, setNoHp] = useState(user?.no_hp || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const res = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          nama,
          email,
          kategori_usia: kategoriUsia,
          no_hp: noHp,
          ...(password.trim() ? { password: password.trim() } : {}),
        }),
      });
      updateCurrentUser(res.user, res.token);
      setPassword('');
      setSuccessMsg('Data profil Anda berhasil diperbarui.');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal memperbarui profil.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Edit Profil Pengguna
          </h1>
          <p className="text-base text-slate-600">
            Lengkapi atau perbarui data diri Anda untuk memudahkan pencatatan presensi masjid.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="text-sm text-slate-500 pb-2 border-b border-slate-200">
            Peran akun: <strong className="text-slate-800">{user?.role === 'dkm' ? 'Pengurus DKM' : "Jama'ah"}</strong>
          </div>

          <div>
            <label
              htmlFor="prof-nama"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Nama Lengkap
            </label>
            <input
              id="prof-nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="prof-email"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Alamat Email
            </label>
            <input
              id="prof-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="prof-kategori"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Kategori Usia
            </label>
            <select
              id="prof-kategori"
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
              htmlFor="prof-hp"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Nomor HP / WhatsApp
            </label>
            <input
              id="prof-hp"
              type="tel"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="prof-pass"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Kata Sandi Baru (Kosongkan jika tidak ingin mengubah)
            </label>
            <input
              id="prof-pass"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 text-base font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
