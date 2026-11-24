import {
  getPool,
  isUsingMysql,
  readFallbackStore,
  writeFallbackStore,
} from '../config/db.mjs';

export const KATEGORI_KEGIATAN = [
  'Pengajian Rutin Umum',
  'Pengajian Anak-anak',
  'Pengajian Pemuda/i',
  'Musyawarah Pengurus DKM',
  'Olahraga',
  'Keakraban',
  'Kerja Bakti',
];

export const KegiatanModel = {
  async findAll(filters) {
    if (isUsingMysql()) {
      const clauses = [];
      const params = [];

      if (filters?.kategori && filters.kategori !== 'Semua') {
        clauses.push('kategori = ?');
        params.push(filters.kategori);
      }
      if (filters?.search && filters.search.trim()) {
        clauses.push('(judul_kegiatan LIKE ? OR tempat LIKE ? OR deskripsi LIKE ?)');
        const q = `%${filters.search.trim()}%`;
        params.push(q, q, q);
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      const [rows] = await getPool().execute(
        `SELECT id, judul_kegiatan, kategori, deskripsi, tanggal, waktu_mulai, waktu_selesai, tempat, created_at
         FROM kegiatan
         ${whereSql}
         ORDER BY tanggal ASC, waktu_mulai ASC`,
        params
      );
      return rows;
    }

    const store = readFallbackStore();
    let list = [...store.kegiatan];

    if (filters?.kategori && filters.kategori !== 'Semua') {
      list = list.filter((k) => k.kategori === filters.kategori);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (k) =>
          k.judul_kegiatan.toLowerCase().includes(q) ||
          k.tempat.toLowerCase().includes(q) ||
          k.deskripsi.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      const cmp = a.tanggal.localeCompare(b.tanggal);
      return cmp !== 0 ? cmp : a.waktu_mulai.localeCompare(b.waktu_mulai);
    });
  },

  async findById(id) {
    if (isUsingMysql()) {
      const [rows] = await getPool().execute(
        'SELECT id, judul_kegiatan, kategori, deskripsi, tanggal, waktu_mulai, waktu_selesai, tempat, created_at FROM kegiatan WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    }

    const store = readFallbackStore();
    return store.kegiatan.find((k) => k.id === id) || null;
  },

  async create(data) {
    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        `INSERT INTO kegiatan (judul_kegiatan, kategori, deskripsi, tanggal, waktu_mulai, waktu_selesai, tempat)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.judul_kegiatan.trim(),
          data.kategori,
          data.deskripsi.trim(),
          data.tanggal,
          data.waktu_mulai,
          data.waktu_selesai,
          data.tempat.trim(),
        ]
      );
      const created = await KegiatanModel.findById(result.insertId);
      if (!created) throw new Error('Gagal membuat kegiatan baru');
      return created;
    }

    const store = readFallbackStore();
    const record = {
      id: store.nextId.kegiatan++,
      judul_kegiatan: data.judul_kegiatan.trim(),
      kategori: data.kategori,
      deskripsi: data.deskripsi.trim(),
      tanggal: data.tanggal,
      waktu_mulai: data.waktu_mulai,
      waktu_selesai: data.waktu_selesai,
      tempat: data.tempat.trim(),
      created_at: new Date().toISOString(),
    };
    store.kegiatan.push(record);
    writeFallbackStore(store);
    return record;
  },

  async update(id, data) {
    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        `UPDATE kegiatan
         SET judul_kegiatan = ?, kategori = ?, deskripsi = ?, tanggal = ?, waktu_mulai = ?, waktu_selesai = ?, tempat = ?
         WHERE id = ?`,
        [
          data.judul_kegiatan.trim(),
          data.kategori,
          data.deskripsi.trim(),
          data.tanggal,
          data.waktu_mulai,
          data.waktu_selesai,
          data.tempat.trim(),
          id,
        ]
      );
      if (result.affectedRows === 0) return null;
      return KegiatanModel.findById(id);
    }

    const store = readFallbackStore();
    const idx = store.kegiatan.findIndex((k) => k.id === id);
    if (idx === -1) return null;

    store.kegiatan[idx] = {
      ...store.kegiatan[idx],
      judul_kegiatan: data.judul_kegiatan.trim(),
      kategori: data.kategori,
      deskripsi: data.deskripsi.trim(),
      tanggal: data.tanggal,
      waktu_mulai: data.waktu_mulai,
      waktu_selesai: data.waktu_selesai,
      tempat: data.tempat.trim(),
    };
    writeFallbackStore(store);
    return store.kegiatan[idx];
  },

  async delete(id) {
    if (isUsingMysql()) {
      const [result] = await getPool().execute(
        'DELETE FROM kegiatan WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    }

    const store = readFallbackStore();
    const prevLen = store.kegiatan.length;
    store.kegiatan = store.kegiatan.filter((k) => k.id !== id);
    if (store.kegiatan.length === prevLen) return false;
    store.presensi = store.presensi.filter((p) => p.kegiatan_id !== id);
    writeFallbackStore(store);
    return true;
  },
};
