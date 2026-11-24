import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiRequest, ApiError } from '../services/api';
import { formatTanggalIndonesia, formatWaktu } from '../types';

export default function PresensiPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('kegiatan_id');

  const [kegiatanList, setKegiatanList] = useState([]);
  const [myPresensi, setMyPresensi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [kegiatanId, setKegiatanId] = useState(preselectedId || '');
  const [isPerwakilan, setIsPerwakilan] = useState(false);
  const [namaPeserta, setNamaPeserta] = useState('');
  const [statusKehadiran, setStatusKehadiran] = useState('Hadir');
  const [alasanIzin, setAlasanIzin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(false);

  // Edit Modal State
  const [editTarget, setEditTarget] = useState(null);
  const [editIsPerwakilan, setEditIsPerwakilan] = useState(false);
  const [editNamaPeserta, setEditNamaPeserta] = useState('');
  const [editStatus, setEditStatus] = useState('Hadir');
  const [editAlasan, setEditAlasan] = useState('');
  const [editError, setEditError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [kegData, myData] = await Promise.all([
        apiRequest('/kegiatan'),
        apiRequest('/presensi/me'),
      ]);
      setKegiatanList(kegData);
      setMyPresensi(myData);
      setKegiatanId((prev) => {
        if (prev && kegData.some((k) => String(k.id) === prev)) return prev;
        if (preselectedId && kegData.some((k) => String(k.id) === preselectedId)) {
          return preselectedId;
        }
        return kegData[0] ? String(kegData[0].id) : '';
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal memuat data kegiatan dan riwayat presensi.'
      );
    } finally {
      setLoading(false);
    }
  }, [preselectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!kegiatanId) {
      setError('Silakan pilih kegiatan terlebih dahulu.');
      return;
    }
    if (isPerwakilan && !namaPeserta.trim()) {
      setError('Silakan tuliskan nama anak atau anggota keluarga yang diwakilkan.');
      return;
    }
    if (statusKehadiran === 'Izin' && !alasanIzin.trim()) {
      setError('Alasan izin wajib diisi jika memilih status Izin.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/presensi', {
        method: 'POST',
        body: JSON.stringify({
          kegiatan_id: Number(kegiatanId),
          is_perwakilan: isPerwakilan,
          nama_peserta: isPerwakilan ? namaPeserta.trim() : user?.nama,
          status_kehadiran: statusKehadiran,
          alasan_izin: statusKehadiran === 'Izin' ? alasanIzin.trim() : null,
        }),
      });
      setSubmittedRecord(true);
      setNamaPeserta('');
      setAlasanIzin('');
      setStatusKehadiran('Hadir');
      setIsPerwakilan(false);
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal mengirim presensi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    setEditIsPerwakilan(item.is_perwakilan);
    setEditNamaPeserta(item.nama_peserta);
    setEditStatus(item.status_kehadiran);
    setEditAlasan(item.alasan_izin || '');
    setEditError('');
  };

  const handleUpdatePresensi = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');

    if (editIsPerwakilan && !editNamaPeserta.trim()) {
      setEditError('Nama peserta wajib diisi.');
      return;
    }
    if (editStatus === 'Izin' && !editAlasan.trim()) {
      setEditError('Alasan izin wajib diisi jika status adalah Izin.');
      return;
    }

    setUpdating(true);
    try {
      await apiRequest(`/presensi/${editTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          kegiatan_id: editTarget.kegiatan_id,
          is_perwakilan: editIsPerwakilan,
          nama_peserta: editIsPerwakilan ? editNamaPeserta.trim() : user?.nama,
          status_kehadiran: editStatus,
          alasan_izin: editStatus === 'Izin' ? editAlasan.trim() : null,
        }),
      });
      setEditTarget(null);
      await loadData();
    } catch (err) {
      setEditError(
        err instanceof ApiError ? err.message : 'Gagal memperbarui presensi.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePresensi = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/presensi/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal menghapus presensi.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Formulir Presensi Kehadiran
          </h1>
          <p className="text-base text-slate-600">
            Isi kehadiran untuk diri sendiri atau wakilkan anak usia TK/PAUD–SD dan anggota keluarga lainnya.
          </p>
        </div>

        {/* Pesan Sukses Setelah Submit */}
        {submittedRecord ? (
          <div className="bg-white border border-emerald-300 rounded-2xl p-8 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Presensi Berhasil Dicatat
              </h2>
              <p className="text-base text-slate-600 max-w-md mx-auto">
                Jazakumullahu khairan. Data kehadiran telah tersimpan di sistem masjid dan dapat dilihat pada riwayat di bawah.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Homepage</span>
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedRecord(false)}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Isi Presensi Lagi (Untuk Anak / Keluarga)
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6"
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

            {/* 1. Pilih Kegiatan */}
            <div>
              <label
                htmlFor="presensi-kegiatan"
                className="block text-base font-semibold text-slate-900 mb-2"
              >
                1. Pilih Kegiatan
              </label>
              <select
                id="presensi-kegiatan"
                required
                disabled={loading || kegiatanList.length === 0}
                value={kegiatanId}
                onChange={(e) => setKegiatanId(e.target.value)}
                className="w-full min-h-12 px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {kegiatanList.length === 0 ? (
                  <option value="">Belum ada kegiatan tersedia</option>
                ) : (
                  kegiatanList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.judul_kegiatan} ({formatTanggalIndonesia(k.tanggal)} · {formatWaktu(k.waktu_mulai)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 2. Diri Sendiri vs Perwakilan */}
            <fieldset className="space-y-3">
              <legend className="text-base font-semibold text-slate-900">
                2. Siapa yang Akan Mengikuti Kegiatan?
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    !isPerwakilan
                      ? 'border-teal-700 bg-teal-50/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenis_pengisian"
                    checked={!isPerwakilan}
                    onChange={() => setIsPerwakilan(false)}
                    className="mt-1 w-4 h-4 accent-teal-700"
                  />
                  <div>
                    <span className="block text-base font-semibold text-slate-900">
                      Untuk Diri Sendiri
                    </span>
                    <span className="block text-sm text-slate-600 mt-0.5">
                      Atas nama: {user?.nama}
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    isPerwakilan
                      ? 'border-teal-700 bg-teal-50/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenis_pengisian"
                    checked={isPerwakilan}
                    onChange={() => setIsPerwakilan(true)}
                    className="mt-1 w-4 h-4 accent-teal-700"
                  />
                  <div>
                    <span className="block text-base font-semibold text-slate-900">
                      Mewakilkan Anak / Keluarga
                    </span>
                    <span className="block text-sm text-slate-600 mt-0.5">
                      Untuk anak TK/PAUD–SD atau anggota keluarga lain
                    </span>
                  </div>
                </label>
              </div>

              {isPerwakilan && (
                <div className="pt-2">
                  <label
                    htmlFor="presensi-nama-peserta"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Nama Anak / Anggota Keluarga yang Diwakilkan
                  </label>
                  <input
                    id="presensi-nama-peserta"
                    type="text"
                    required
                    value={namaPeserta}
                    onChange={(e) => setNamaPeserta(e.target.value)}
                    placeholder="Contoh: Zaidan Al-Farizi (Anak TK)"
                    className="w-full min-h-11.5 px-4 py-2.5 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              )}
            </fieldset>

            {/* 3. Status Kehadiran */}
            <fieldset className="space-y-3">
              <legend className="text-base font-semibold text-slate-900">
                3. Status Kehadiran
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    statusKehadiran === 'Hadir'
                      ? 'border-emerald-700 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status_kehadiran"
                    checked={statusKehadiran === 'Hadir'}
                    onChange={() => setStatusKehadiran('Hadir')}
                    className="w-4 h-4 accent-emerald-700"
                  />
                  <div>
                    <span className="block text-base font-semibold text-slate-900">
                      Hadir
                    </span>
                    <span className="block text-sm text-slate-600">
                      InsyaAllah dapat hadir mengikuti kegiatan
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    statusKehadiran === 'Izin'
                      ? 'border-amber-600 bg-amber-50/50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status_kehadiran"
                    checked={statusKehadiran === 'Izin'}
                    onChange={() => setStatusKehadiran('Izin')}
                    className="w-4 h-4 accent-amber-600"
                  />
                  <div>
                    <span className="block text-base font-semibold text-slate-900">
                      Izin
                    </span>
                    <span className="block text-sm text-slate-600">
                      Berhalangan hadir dengan keterangan
                    </span>
                  </div>
                </label>
              </div>

              {statusKehadiran === 'Izin' && (
                <div className="pt-2">
                  <label
                    htmlFor="presensi-alasan"
                    className="block text-sm font-medium text-slate-800 mb-1.5"
                  >
                    Alasan Izin <span className="text-red-700">(Wajib diisi)</span>
                  </label>
                  <textarea
                    id="presensi-alasan"
                    required
                    rows={3}
                    value={alasanIzin}
                    onChange={(e) => setAlasanIzin(e.target.value)}
                    placeholder="Contoh: Sedang kurang sehat / ada keperluan keluarga di luar kota"
                    className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              )}
            </fieldset>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || kegiatanList.length === 0}
                className="w-full min-h-12.5 px-6 py-3.5 text-base font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submitting ? 'Menyimpan Presensi...' : 'Kirim Presensi Kehadiran'}
              </button>
            </div>
          </form>
        )}

        {/* Riwayat Presensi User */}
        <section className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Riwayat Presensi Saya
            </h2>
            <span className="text-sm text-slate-500 tabular-nums">
              {myPresensi.length} catatan
            </span>
          </div>

          {loading ? (
            <div className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ) : myPresensi.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
              Anda belum memiliki catatan presensi. Silakan isi formulir di atas.
            </div>
          ) : (
            <div className="space-y-3">
              {myPresensi.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                      <span>{formatTanggalIndonesia(item.tanggal_kegiatan)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.kategori_kegiatan}</span>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900">
                      {item.judul_kegiatan}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-medium text-slate-800">
                        Peserta: {item.nama_peserta}
                      </span>
                      {item.is_perwakilan && (
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Users className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Diwakilkan</span>
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-300">
                        |
                      </span>
                      <span
                        className={`font-semibold ${
                          item.status_kehadiran === 'Hadir'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        Status: {item.status_kehadiran}
                      </span>
                    </div>

                    {item.status_kehadiran === 'Izin' && item.alasan_izin && (
                      <p className="text-sm text-slate-600">
                        Alasan izin: {item.alasan_izin}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal Edit Presensi */}
      {editTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-presensi-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="edit-presensi-title"
                className="font-display text-lg font-bold text-slate-900"
              >
                Ubah Data Presensi
              </h2>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                aria-label="Tutup"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {editError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdatePresensi} className="space-y-4">
              <div className="text-sm text-slate-600">
                Kegiatan:{' '}
                <strong className="text-slate-900">{editTarget.judul_kegiatan}</strong>
              </div>

              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    checked={!editIsPerwakilan}
                    onChange={() => setEditIsPerwakilan(false)}
                    className="accent-teal-700"
                  />
                  <span>Diri Sendiri</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    checked={editIsPerwakilan}
                    onChange={() => setEditIsPerwakilan(true)}
                    className="accent-teal-700"
                  />
                  <span>Mewakilkan Anak / Keluarga</span>
                </label>
              </div>

              {editIsPerwakilan && (
                <div>
                  <label
                    htmlFor="edit-nama-peserta"
                    className="block text-sm font-medium text-slate-800 mb-1"
                  >
                    Nama Peserta
                  </label>
                  <input
                    id="edit-nama-peserta"
                    type="text"
                    required
                    value={editNamaPeserta}
                    onChange={(e) => setEditNamaPeserta(e.target.value)}
                    className="w-full min-h-11 px-3.5 py-2 text-base border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <span className="block text-sm font-medium text-slate-800 mb-1.5">
                  Status Kehadiran
                </span>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={editStatus === 'Hadir'}
                      onChange={() => setEditStatus('Hadir')}
                      className="accent-emerald-700"
                    />
                    <span>Hadir</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={editStatus === 'Izin'}
                      onChange={() => setEditStatus('Izin')}
                      className="accent-amber-600"
                    />
                    <span>Izin</span>
                  </label>
                </div>
              </div>

              {editStatus === 'Izin' && (
                <div>
                  <label
                    htmlFor="edit-alasan-izin"
                    className="block text-sm font-medium text-slate-800 mb-1"
                  >
                    Alasan Izin (Wajib diisi)
                  </label>
                  <textarea
                    id="edit-alasan-izin"
                    required
                    rows={3}
                    value={editAlasan}
                    onChange={(e) => setEditAlasan(e.target.value)}
                    className="w-full px-3.5 py-2 text-base border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 disabled:opacity-60 cursor-pointer"
                >
                  {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Presensi */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-presensi-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2
              id="delete-presensi-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Hapus Catatan Presensi?
            </h2>
            <p className="text-sm text-slate-600">
              Catatan presensi atas nama <strong className="text-slate-900">{deleteTarget.nama_peserta}</strong> untuk kegiatan{' '}
              <strong className="text-slate-900">{deleteTarget.judul_kegiatan}</strong> akan dihapus.
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
                onClick={handleDeletePresensi}
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
