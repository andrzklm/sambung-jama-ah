import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiRequest, ApiError } from '../services/api';
import {
  formatTanggalIndonesia,
  formatWaktu,
  KATEGORI_KEGIATAN_LIST,
} from '../types';

const EMPTY_FORM = {
  judul_kegiatan: '',
  kategori: 'Pengajian Umum',
  deskripsi: '',
  tanggal: '2026-12-01',
  waktu_mulai: '19:30',
  waktu_selesai: '21:30',
  tempat: 'Ruang Utama Masjid Al-Ikhlas',
};

export default function InformasiKegiatanPage() {
  const { user } = useAuth();
  const isDKM = user?.role === 'dkm';

  const [kegiatanList, setKegiatanList] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal Create / Edit (DKM)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirm Delete Modal (DKM)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadKegiatan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedKategori !== 'Semua') {
        params.set('kategori', selectedKategori);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiRequest(`/kegiatan${query}`);
      setKegiatanList(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal memuat jadwal kegiatan.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedKategori, searchQuery]);

  useEffect(() => {
    loadKegiatan();
  }, [loadKegiatan]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormState({
      judul_kegiatan: item.judul_kegiatan,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      tanggal: item.tanggal.split('T')[0],
      waktu_mulai: item.waktu_mulai.slice(0, 5),
      waktu_selesai: item.waktu_selesai.slice(0, 5),
      tempat: item.tempat,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveKegiatan = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await apiRequest(`/kegiatan/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formState),
        });
      } else {
        await apiRequest('/kegiatan', {
          method: 'POST',
          body: JSON.stringify(formState),
        });
      }
      setModalOpen(false);
      await loadKegiatan();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Gagal menyimpan data kegiatan.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/kegiatan/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadKegiatan();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal menghapus jadwal kegiatan.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const filterCategories = ['Semua', ...KATEGORI_KEGIATAN_LIST];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Informasi Jadwal Kegiatan
            </h1>
            <p className="text-base text-slate-600">
              Daftar agenda pengajian sambung kelompok, caberawit, muda/i, galades, pasang giri dan amal sholeh mendatang.
            </p>
          </div>
          {isDKM && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tambah Kegiatan</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
          <div className="relative">
            <Search
              className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kegiatan atau lokasi..."
              aria-label="Cari kegiatan"
              className="w-full min-h-11 pl-11 pr-4 py-2 text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter kategori kegiatan"
            className="flex flex-wrap gap-2"
          >
            {filterCategories.map((kat) => {
              const active = selectedKategori === kat;
              return (
                <button
                  key={kat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedKategori(kat)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {kat}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* List Jadwal */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-52 bg-white border border-slate-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : kegiatanList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <p className="text-base font-medium text-slate-800">
              Belum ada kegiatan untuk kategori atau pencarian ini.
            </p>
            <p className="text-sm text-slate-500">
              Coba pilih kategori &ldquo;Semua&rdquo; atau ubah kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {kegiatanList.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-teal-800">
                    <span>{item.kategori}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums text-slate-500">
                      {formatTanggalIndonesia(item.tanggal)}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-slate-900 leading-snug">
                    {item.judul_kegiatan}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {item.deskripsi}
                  </p>

                  <div className="pt-2 space-y-1.5 text-sm text-slate-700">
                    <div className="flex items-center gap-2 tabular-nums">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{formatTanggalIndonesia(item.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-2 tabular-nums">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>
                        {formatWaktu(item.waktu_mulai)} – {formatWaktu(item.waktu_selesai)} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{item.tempat}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to={`/presensi?kegiatan_id=${item.id}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    Isi Presensi
                  </Link>

                  {isDKM && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Kegiatan (DKM) */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-kegiatan-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2
                id="modal-kegiatan-title"
                className="font-display text-xl font-bold text-slate-900"
              >
                {editingId ? 'Edit Jadwal Kegiatan' : 'Tambah Jadwal Kegiatan'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup dialog"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveKegiatan} className="space-y-4">
              <div>
                <label
                  htmlFor="keg-judul"
                  className="block text-sm font-medium text-slate-800 mb-1"
                >
                  Judul Kegiatan
                </label>
                <input
                  id="keg-judul"
                  type="text"
                  required
                  value={formState.judul_kegiatan}
                  onChange={(e) =>
                    setFormState({ ...formState, judul_kegiatan: e.target.value })
                  }
                  placeholder="Contoh: Pengajian Rutin Malam Rabu"
                  className="w-full min-h-11 px-3.5 py-2 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="keg-kategori"
                  className="block text-sm font-medium text-slate-800 mb-1"
                >
                  Kategori Kegiatan
                </label>
                <select
                  id="keg-kategori"
                  value={formState.kategori}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      kategori: e.target.value,
                    })
                  }
                  className="w-full min-h-11 px-3.5 py-2 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {KATEGORI_KEGIATAN_LIST.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="keg-tanggal"
                    className="block text-sm font-medium text-slate-800 mb-1"
                  >
                    Tanggal
                  </label>
                  <input
                    id="keg-tanggal"
                    type="date"
                    required
                    value={formState.tanggal}
                    onChange={(e) =>
                      setFormState({ ...formState, tanggal: e.target.value })
                    }
                    className="w-full min-h-11 px-3 py-2 text-base border border-slate-300 rounded-xl tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="keg-mulai"
                    className="block text-sm font-medium text-slate-800 mb-1"
                  >
                    Waktu Mulai
                  </label>
                  <input
                    id="keg-mulai"
                    type="time"
                    required
                    value={formState.waktu_mulai}
                    onChange={(e) =>
                      setFormState({ ...formState, waktu_mulai: e.target.value })
                    }
                    className="w-full min-h-11 px-3 py-2 text-base border border-slate-300 rounded-xl tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="keg-selesai"
                    className="block text-sm font-medium text-slate-800 mb-1"
                  >
                    Waktu Selesai
                  </label>
                  <input
                    id="keg-selesai"
                    type="time"
                    required
                    value={formState.waktu_selesai}
                    onChange={(e) =>
                      setFormState({ ...formState, waktu_selesai: e.target.value })
                    }
                    className="w-full min-h-11 px-3 py-2 text-base border border-slate-300 rounded-xl tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="keg-tempat"
                  className="block text-sm font-medium text-slate-800 mb-1"
                >
                  Tempat / Lokasi
                </label>
                <input
                  id="keg-tempat"
                  type="text"
                  required
                  value={formState.tempat}
                  onChange={(e) =>
                    setFormState({ ...formState, tempat: e.target.value })
                  }
                  placeholder="Ruang Utama Masjid Al-Ikhlas"
                  className="w-full min-h-11 px-3.5 py-2 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label
                  htmlFor="keg-deskripsi"
                  className="block text-sm font-medium text-slate-800 mb-1"
                >
                  Deskripsi Kegiatan
                </label>
                <textarea
                  id="keg-deskripsi"
                  required
                  rows={3}
                  value={formState.deskripsi}
                  onChange={(e) =>
                    setFormState({ ...formState, deskripsi: e.target.value })
                  }
                  placeholder="Jelaskan pemateri, materi singkat, atau perlengkapan yang perlu dibawa..."
                  className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 rounded-xl hover:bg-teal-800 disabled:opacity-60 cursor-pointer"
                >
                  {saving
                    ? 'Menyimpan...'
                    : editingId
                    ? 'Simpan Perubahan'
                    : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Kegiatan */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-kegiatan-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2
              id="delete-kegiatan-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Hapus Jadwal Kegiatan?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kegiatan <strong className="text-slate-900">{deleteTarget.judul_kegiatan}</strong> beserta seluruh catatan presensi terkait akan dihapus permanen.
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
