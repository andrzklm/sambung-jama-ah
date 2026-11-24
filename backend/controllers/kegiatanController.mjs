import { KATEGORI_KEGIATAN, KegiatanModel } from '../models/kegiatanModel.mjs';

function validateKegiatanPayload(body) {
  const judul_kegiatan = String(body.judul_kegiatan || '').trim();
  const kategori = String(body.kategori || '').trim();
  const deskripsi = String(body.deskripsi || '').trim();
  const tanggal = String(body.tanggal || '').trim();
  const waktu_mulai = String(body.waktu_mulai || '').trim();
  const waktu_selesai = String(body.waktu_selesai || '').trim();
  const tempat = String(body.tempat || '').trim();

  if (!judul_kegiatan) {
    return { valid: false, message: 'Judul kegiatan wajib diisi.' };
  }
  if (!KATEGORI_KEGIATAN.includes(kategori)) {
    return { valid: false, message: 'Kategori kegiatan tidak valid.' };
  }
  if (!deskripsi) {
    return { valid: false, message: 'Deskripsi kegiatan wajib diisi.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return { valid: false, message: 'Format tanggal harus YYYY-MM-DD.' };
  }
  if (!waktu_mulai || !waktu_selesai) {
    return { valid: false, message: 'Waktu mulai dan waktu selesai wajib diisi.' };
  }
  if (!tempat) {
    return { valid: false, message: 'Tempat kegiatan wajib diisi.' };
  }

  return {
    valid: true,
    data: {
      judul_kegiatan,
      kategori,
      deskripsi,
      tanggal,
      waktu_mulai: waktu_mulai.length === 5 ? `${waktu_mulai}:00` : waktu_mulai,
      waktu_selesai: waktu_selesai.length === 5 ? `${waktu_selesai}:00` : waktu_selesai,
      tempat,
    },
  };
}

export const KegiatanController = {
  async getAll(req, res) {
    try {
      const kategori =
        typeof req.query.kategori === 'string' ? req.query.kategori : undefined;
      const search =
        typeof req.query.search === 'string' ? req.query.search : undefined;

      const list = await KegiatanModel.findAll({ kategori, search });
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (err) {
      console.error('[KegiatanController.getAll]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil daftar kegiatan.',
      });
    }
  },

  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'ID kegiatan tidak valid.' });
        return;
      }

      const item = await KegiatanModel.findById(id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
        return;
      }

      res.status(200).json({ success: true, data: item });
    } catch (err) {
      console.error('[KegiatanController.getById]', err);
      res.status(500).json({ success: false, message: 'Gagal memuat detail kegiatan.' });
    }
  },

  async create(req, res) {
    try {
      const validation = validateKegiatanPayload(req.body || {});
      if (!validation.valid || !validation.data) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const created = await KegiatanModel.create(validation.data);
      res.status(201).json({
        success: true,
        message: 'Jadwal kegiatan berhasil ditambahkan.',
        data: created,
      });
    } catch (err) {
      console.error('[KegiatanController.create]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan jadwal kegiatan.',
      });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'ID kegiatan tidak valid.' });
        return;
      }

      const validation = validateKegiatanPayload(req.body || {});
      if (!validation.valid || !validation.data) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const updated = await KegiatanModel.update(id, validation.data);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Jadwal kegiatan berhasil diperbarui.',
        data: updated,
      });
    } catch (err) {
      console.error('[KegiatanController.update]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui jadwal kegiatan.',
      });
    }
  },

  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'ID kegiatan tidak valid.' });
        return;
      }

      const deleted = await KegiatanModel.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Jadwal kegiatan berhasil dihapus.',
      });
    } catch (err) {
      console.error('[KegiatanController.remove]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus jadwal kegiatan.',
      });
    }
  },
};
