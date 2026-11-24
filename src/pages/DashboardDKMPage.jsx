import {
  AlertCircle,
  Download,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiRequest, ApiError } from '../services/api';
import { formatTanggalIndonesia } from '../types';

export default function DashboardDKMPage() {
  const { user } = useAuth();

  const [kegiatanList, setKegiatanList] = useState([]);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_keseluruhan: 0,
    total_hadir: 0,
    total_izin: 0,
    total_perwakilan: 0,
  });

  const [filterKegiatanId, setFilterKegiatanId] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (user?.role !== 'dkm') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterKegiatanId) params.set('kegiatan_id', filterKegiatanId);
      if (filterStatus !== 'Semua') params.set('status_kehadiran', filterStatus);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const [kegData, dkmData] = await Promise.all([
        apiRequest('/kegiatan'),
        apiRequest(`/presensi/dkm/all${queryStr}`),
      ]);

      setKegiatanList(kegData);
      setRecords(dkmData.records);
      setStats(dkmData.stats);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal memuat rekapitulasi presensi DKM.'
      );
    } finally {
      setLoading(false);
    }
  }, [user?.role, filterKegiatanId, filterStatus, searchQuery]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/presensi/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal menghapus data presensi.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const header = [
      'ID',
      'Tanggal Kegiatan',
      'Judul Kegiatan',
      'Kategori',
      'Nama Peserta',
      'Jenis Pengisian',
      'Pengisi Akun',
      'Status Kehadiran',
      'Alasan Izin',
    ];
    const rows = records.map((r) => [
      r.id,
      r.tanggal_kegiatan,
      r.judul_kegiatan,
      r.kategori_kegiatan,
      r.nama_peserta,
      r.is_perwakilan ? 'Perwakilan' : 'Diri Sendiri',
      r.nama_pengisi,
      r.status_kehadiran,
      r.alasan_izin || '-',
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map((val) => {
            const str = String(val);
            const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
            return `"${safe.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rekap-presensi-sambung-jamaah.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'dkm') {
    return (
      <Layout>
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold text-slate-900">
            Akses Khusus Pengurus DKM
          </h1>
          <p className="text-sm text-slate-600">
            Halaman rekapitulasi presensi dan evaluasi bulanan hanya dapat diakses oleh akun Pengurus DKM.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Dashboard Rekap Presensi 
            </h1>
            <p className="text-base text-slate-600">
              Pantau kehadiran jama'ah dan evaluasi bulanan kegiatan masjid.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={records.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Unduh CSV</span>
          </button>
        </div>

        {/* Summary Metrics Strip */}
        <section
          aria-label="Ringkasan statistik kehadiran"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="text-sm text-slate-500">Total Catatan</div>
            <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {stats.total_keseluruhan}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="text-sm text-emerald-700 font-medium">Total Hadir</div>
            <div className="font-display text-3xl font-bold text-emerald-700 tabular-nums">
              {stats.total_hadir}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="text-sm text-amber-700 font-medium">Total Izin</div>
            <div className="font-display text-3xl font-bold text-amber-700 tabular-nums">
              {stats.total_izin}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="text-sm text-slate-500">Via Perwakilan Anak/Keluarga</div>
            <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">
              {stats.total_perwakilan}
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="dkm-filter-kegiatan"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Filter Kegiatan
            </label>
            <select
              id="dkm-filter-kegiatan"
              value={filterKegiatanId}
              onChange={(e) => setFilterKegiatanId(e.target.value)}
              className="w-full min-h-10.5 px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="">Semua Kegiatan</option>
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.judul_kegiatan} ({k.tanggal.split('T')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Status Kehadiran
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {['Semua', 'Hadir', 'Izin'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    filterStatus === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="dkm-search"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Cari Nama Peserta / Pengisi
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="dkm-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama..."
                className="w-full min-h-10.5 pl-9 pr-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Attendance Table */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-base font-medium text-slate-800">
                Tidak ada data presensi yang sesuai dengan filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterKegiatanId('');
                  setFilterStatus('Semua');
                  setSearchQuery('');
                }}
                className="text-sm font-semibold text-teal-800 hover:underline cursor-pointer"
              >
                Reset semua filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3.5 px-4">Nama Peserta</th>
                    <th className="py-3.5 px-4">Kegiatan & Tanggal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Keterangan / Alasan Izin</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {records.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {row.nama_peserta}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {row.is_perwakilan
                            ? `Diwakilkan oleh ${row.nama_pengisi}`
                            : `Diisi sendiri · ${row.kategori_usia_pengisi}`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-medium text-slate-800">
                          {row.judul_kegiatan}
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                          {formatTanggalIndonesia(row.tanggal_kegiatan)} · {row.kategori_kegiatan}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            row.status_kehadiran === 'Hadir'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {row.status_kehadiran}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top text-slate-600 max-w-xs">
                        {row.status_kehadiran === 'Izin'
                          ? row.alasan_izin || '-'
                          : 'Hadir mengikuti kegiatan'}
                      </td>
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dkm-delete-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2
              id="dkm-delete-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Hapus Data Presensi Jama'ah?
            </h2>
            <p className="text-sm text-slate-600">
              Data presensi atas nama <strong className="text-slate-900">{deleteTarget.nama_peserta}</strong> pada kegiatan{' '}
              <strong className="text-slate-900">{deleteTarget.judul_kegiatan}</strong> akan dihapus permanen.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-red-700 rounded-xl hover:bg-red-800 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
