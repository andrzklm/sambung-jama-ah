import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  UserCog,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { formatTanggalIndonesia, formatWaktu } from '../types';

export default function HomePage() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadUpcoming() {
      try {
        const list = await apiRequest('/kegiatan');
        if (active) {
          setUpcoming(list.slice(0, 3));
        }
      } catch {
        // Tetap tampilkan menu utama meski preview jadwal gagal dimuat
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadUpcoming();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-10">
        {/* Greeting Header */}
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{user?.kategori_usia}</span>
            <span aria-hidden="true">·</span>
            <span>
              {user?.role === 'dkm' ? 'Pengurus DKM' : "Akun Jama'ah"}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
            Assalamu'alaikum, {user?.nama}
          </h1>
          <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
            Silakan pilih menu di bawah untuk melihat jadwal terobosan yang akan datang atau mengisi daftar hadir anda dan keluarga!
          </p>
        </section>

        {/* 2 Menu Kartu Utama yang Besar dan Jelas */}
        <section aria-label="Menu utama" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/kegiatan"
            className="group bg-white border border-slate-200 rounded-2xl p-7 sm:p-8 flex flex-col justify-between gap-6 hover:border-teal-700 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <CalendarDays className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  Informasi Terobosan
                </h2>
                <p className="text-base text-slate-600 leading-relaxed">
                  Lihat daftar lengkap jadwal pengajian sambung kelompok, muda/i,caberawit, galades, pasang giri dan amal sholeh terbaru.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-base font-semibold text-teal-800">
              <span>Buka Jadwal Kegiatan</span>
              <ArrowRight
                className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>

          <Link
            to="/presensi"
            className="group bg-teal-700 border border-teal-800 rounded-2xl p-7 sm:p-8 text-white flex flex-col justify-between gap-6 hover:bg-teal-800 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 text-white flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-white">
                  Presensi Kehadiran
                </h2>
                <p className="text-base text-teal-50 leading-relaxed">
                  Memudahkan mengisi daftar kehadiran atau izin bagi seluruh jama'ah mulai dari caberawit hingga usia lanjut. 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-base font-semibold text-white">
              <span>Isi Formulir Presensi</span>
              <ArrowRight
                className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        </section>

        {/* Akses Sekunder: Edit Profil & Dashboard DKM */}
        <section
          aria-label="Pengaturan akun dan pengelolaan"
          className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/profil"
            className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <UserCog className="w-5 h-5 text-slate-600 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-base font-semibold text-slate-900">
                  Edit Profil Pengguna
                </div>
                <div className="text-sm text-slate-500">
                  Perbarui nama, email, usia dan nomor HP
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          </Link>

          {user?.role === 'dkm' && (
            <Link
              to="/dkm"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:border-teal-700 hover:bg-teal-50/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className="w-5 h-5 text-teal-700 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-base font-semibold text-slate-900">
                    Dashboard DKM
                  </div>
                  <div className="text-sm text-slate-500">
                    Rekap kehadiran jama'ah, statistik, dan evaluasi bulanan
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </section>

        {/* Pratinjau Jadwal Terdekat */}
        <section className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Agenda Terdekat
            </h2>
            <Link
              to="/kegiatan"
              className="text-sm font-semibold text-teal-800 hover:underline whitespace-nowrap shrink-0"
            >
              Lihat semua jadwal
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-36 bg-white border border-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600 text-sm">
              Belum ada jadwal kegiatan yang tercatat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-teal-800">
                      {item.kategori}
                    </div>
                    <h3 className="font-display text-base font-semibold text-slate-900 leading-snug">
                      {item.judul_kegiatan}
                    </h3>
                    <div className="text-xs text-slate-500 tabular-nums space-y-0.5">
                      <div>{formatTanggalIndonesia(item.tanggal)}</div>
                      <div>
                        {formatWaktu(item.waktu_mulai)} – {formatWaktu(item.waktu_selesai)} WIB · {item.tempat}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/presensi?kegiatan_id=${item.id}`}
                    className="text-sm font-semibold text-teal-800 hover:underline"
                  >
                    Isi presensi kegiatan ini
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
