import {
  getPool,
  isUsingMysql,
  readFallbackStore,
  writeFallbackStore,
} from '../config/db.mjs';

export const PresensiModel = {
  async findById(id) {
    if (isUsingMysql()) {
      const [rows] = await getPool().execute(
        'SELECT id, user_id, kegiatan_id, nama_peserta, is_perwakilan, status_kehadiran, alasan_izin, created_at FROM presensi WHERE id = ? LIMIT 1',
        [id]
      );
      if (!rows[0]) return null;
      return { ...rows[0], is_perwakilan: Boolean(rows[0].is_perwakilan) };
    }

    const store = readFallbackStore();
    return store.presensi.find((p) => p.id === id) || null;
  },

  async findByUserId(userId) {
    if (isUsingMysql()) {
      const [rows] = await getPool().execute(
        `SELECT
           p.id, p.user_id, p.kegiatan_id, p.nama_peserta, p.is_perwakilan,
           p.status_kehadiran, p.alasan_izin, p.created_at,
           k.judul_kegiatan, k.kategori AS kategori_kegiatan, k.tanggal AS tanggal_kegiatan,
           k.waktu_mulai, k.waktu_selesai, k.tempat,
           u.nama AS nama_pengisi, u.email AS email_pengisi, u.kategori_usia AS kategori_usia_pengisi
         FROM presensi p
         INNER JOIN kegiatan k ON p.kegiatan_id = k.id
         INNER JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC, p.id DESC`,
        [userId]
      );
      return rows.map((r) => ({
        ...r,
        is_perwakilan: Boolean(r.is_perwakilan),
      }));
    }

    const store = readFallbackStore();
    return store.presensi
      .filter((p) => p.user_id === userId)
      .map((p) => {
        const k = store.kegiatan.find((item) => item.id === p.kegiatan_id);
        const u = store.users.find((usr) => usr.id === p.user_id);
        return {
          ...p,
          judul_kegiatan: k?.judul_kegiatan || 'Kegiatan Dihapus',
          kategori_kegiatan: k?.kategori || '-',
          tanggal_kegiatan: k?.tanggal || '',
          waktu_mulai: k?.waktu_mulai || '',
          waktu_selesai: k?.waktu_selesai || '',
          tempat: k?.tempat || '',
          nama_pengisi: u?.nama || 'Jamaah',
          email_pengisi: u?.email || '',
          kategori_usia_pengisi: u?.kategori_usia || '',
        };
      })
      .sort((a, b) => b.id - a.id);
  },

  async findAllForDKM(filters) {
    if (isUsingMysql()) {
      const clauses = [];
      const params = [];

      if (filters?.kegiatan_id) {
        clauses.push('p.kegiatan_id = ?');
        params.push(filters.kegiatan_id);
      }
      if (
        filters?.status_kehadiran === 'Hadir' ||
        filters?.status_kehadiran === 'Izin'
      ) {
        clauses.push('p.status_kehadiran = ?');
        params.push(filters.status_kehadiran);
      }
      if (filters?.search && filters.search.trim()) {
        clauses.push(
          '(p.nama_peserta LIKE ? OR u.nama LIKE ? OR k.judul_kegiatan LIKE ?)'
        );
        const q = `%${filters.search.trim()}%`;
        params.push(q, q, q);
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const [rows] = await getPool().execute(
        `SELECT
           p.id, p.user_id, p.kegiatan_id, p.nama_peserta, p.is_perwakilan,
           p.status_kehadiran, p.alasan_izin, p.created_at,
           k.judul_kegiatan, k.kategori AS kategori_kegiatan, k.tanggal AS tanggal_kegiatan,
           k.waktu_mulai, k.waktu_selesai, k.tempat,
           u.nama AS nama_pengisi, u.email AS email_pengisi, u.kategori_usia AS kategori_usia_pengisi
         FROM presensi p
         INNER JOIN kegiatan k ON p.kegiatan_id = k.id
         INNER JOIN users u ON p.user_id = u.id
         ${whereSql}
         ORDER BY k.tanggal ASC, p.created_at DESC`,
        params
      );

      const records = rows.map((r) => ({
        ...r,
        is_perwakilan: Boolean(r.is_perwakilan),
      }));

      const stats = {
        total_keseluruhan: records.length,
        total_hadir: records.filter((r) => r.status_kehadiran === 'Hadir').length,
        total_izin: records.filter((r) => r.status_kehadiran === 'Izin').length,
        total_perwakilan: records.filter((r) => r.is_perwakilan).length,
      };

      return { records, stats };
    }

    const store = readFallbackStore();
    let records = store.presensi.map((p) => {
      const k = store.kegiatan.find((item) => item.id === p.kegiatan_id);
      const u = store.users.find((usr) => usr.id === p.user_id);
      return {
        ...p,
        judul_kegiatan: k?.judul_kegiatan || 'Kegiatan Dihapus',
        kategori_kegiatan: k?.kategori || '-',
        tanggal_kegiatan: k?.tanggal || '',
        waktu_mulai: k?.waktu_mulai || '',
        waktu_selesai: k?.waktu_selesai || '',
        tempat: k?.tempat || '',
        nama_pengisi: u?.nama || 'Jamaah',
        email_pengisi: u?.email || '',
        kategori_usia_pengisi: u?.kategori_usia || '',
      };
    });

    if (filters?.kegiatan_id) {
      records = records.filter((r) => r.kegiatan_id === filters.kegiatan_id);
    }
    if (
      filters?.status_kehadiran === 'Hadir' ||
      filters?.status_kehadiran === 'Izin'
    ) {
      records = records.filter(
        (r) => r.status_kehadiran === filters.status_kehadiran
      );
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      records = records.filter(
        (r) =>
          r.nama_peserta.toLowerCase().includes(q) ||
          r.nama_pengisi.toLowerCase().includes(q) ||
          r.judul_kegiatan.toLowerCase().includes(q)
      );
    }

    records.sort((a, b) => b.id - a.id);

    const stats = {
      total_keseluruhan: records.length,
      total_hadir: records.filter((r) => r.status_kehadiran === 'Hadir').length,
      total_izin: records.filter((r) => r.status_kehadiran === 'Izin').length,
      total_perwakilan: records.filter((r) => r.is_perwakilan).length,
    };

    return { records, stats };
  },

  async create(data) {
    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        `INSERT INTO presensi (user_id, kegiatan_id, nama_peserta, is_perwakilan, status_kehadiran, alasan_izin)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.user_id,
          data.kegiatan_id,
          data.nama_peserta.trim(),
          data.is_perwakilan ? 1 : 0,
          data.status_kehadiran,
          data.alasan_izin,
        ]
      );
      const created = await PresensiModel.findById(result.insertId);
      if (!created) throw new Error('Gagal menyimpan presensi');
      return created;
    }

    const store = readFallbackStore();
    const record = {
      id: store.nextId.presensi++,
      user_id: data.user_id,
      kegiatan_id: data.kegiatan_id,
      nama_peserta: data.nama_peserta.trim(),
      is_perwakilan: Boolean(data.is_perwakilan),
      status_kehadiran: data.status_kehadiran,
      alasan_izin: data.alasan_izin,
      created_at: new Date().toISOString(),
    };
    store.presensi.push(record);
    writeFallbackStore(store);
    return record;
  },

  async update(id, data) {
    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        `UPDATE presensi
         SET kegiatan_id = ?, nama_peserta = ?, is_perwakilan = ?, status_kehadiran = ?, alasan_izin = ?
         WHERE id = ?`,
        [
          data.kegiatan_id,
          data.nama_peserta.trim(),
          data.is_perwakilan ? 1 : 0,
          data.status_kehadiran,
          data.alasan_izin,
          id,
        ]
      );
      if (result.affectedRows === 0) return null;
      return PresensiModel.findById(id);
    }

    const store = readFallbackStore();
    const idx = store.presensi.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    store.presensi[idx] = {
      ...store.presensi[idx],
      kegiatan_id: data.kegiatan_id,
      nama_peserta: data.nama_peserta.trim(),
      is_perwakilan: Boolean(data.is_perwakilan),
      status_kehadiran: data.status_kehadiran,
      alasan_izin: data.alasan_izin,
    };
    writeFallbackStore(store);
    return store.presensi[idx];
  },

  async delete(id) {
    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        'DELETE FROM presensi WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    }

    const store = readFallbackStore();
    const prevLen = store.presensi.length;
    store.presensi = store.presensi.filter((p) => p.id !== id);
    if (store.presensi.length === prevLen) return false;
    writeFallbackStore(store);
    return true;
  },
};
