import { KegiatanModel } from '../models/kegiatanModel.mjs';
import { PresensiModel } from '../models/presensiModel.mjs';
import { UserModel } from '../models/userModel.mjs';

export const PresensiController = {
  async create(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }

      const {
        kegiatan_id,
        is_perwakilan,
        nama_peserta,
        status_kehadiran,
        alasan_izin,
      } = req.body || {};

      const kegiatanIdNum = Number(kegiatan_id);
      if (!Number.isInteger(kegiatanIdNum) || kegiatanIdNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'Silakan pilih kegiatan terlebih dahulu.',
        });
        return;
      }

      const kegiatan = await KegiatanModel.findById(kegiatanIdNum);
      if (!kegiatan) {
        res.status(404).json({
          success: false,
          message: 'Kegiatan yang dipilih tidak ditemukan.',
        });
        return;
      }

      if (status_kehadiran !== 'Hadir' && status_kehadiran !== 'Izin') {
        res.status(400).json({
          success: false,
          message: 'Status kehadiran harus Hadir atau Izin.',
        });
        return;
      }

      const trimmedAlasan = alasan_izin ? alasan_izin.trim() : '';
      if (status_kehadiran === 'Izin' && trimmedAlasan.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Alasan izin wajib diisi jika memilih status Izin.',
        });
        return;
      }

      const currentUser = await UserModel.findById(req.user.id);
      if (!currentUser) {
        res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
        return;
      }

      const isProxy = Boolean(is_perwakilan);
      const finalNamaPeserta = isProxy
        ? (nama_peserta || '').trim()
        : currentUser.nama;

      if (!finalNamaPeserta) {
        res.status(400).json({
          success: false,
          message: 'Nama peserta wajib diisi jika mengisi sebagai perwakilan.',
        });
        return;
      }

      const created = await PresensiModel.create({
        user_id: req.user.id,
        kegiatan_id: kegiatanIdNum,
        nama_peserta: finalNamaPeserta,
        is_perwakilan: isProxy,
        status_kehadiran,
        alasan_izin: status_kehadiran === 'Izin' ? trimmedAlasan : null,
      });

      res.status(201).json({
        success: true,
        message: 'Presensi kehadiran berhasil dicatat.',
        data: created,
      });
    } catch (err) {
      console.error('[PresensiController.create]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menyimpan data presensi.',
      });
    }
  },

  async getMyPresensi(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }
      const list = await PresensiModel.findByUserId(req.user.id);
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      console.error('[PresensiController.getMyPresensi]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat riwayat presensi Anda.',
      });
    }
  },

  async updatePresensi(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }

      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'ID presensi tidak valid.' });
        return;
      }

      const existing = await PresensiModel.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Data presensi tidak ditemukan.' });
        return;
      }

      if (existing.user_id !== req.user.id && req.user.role !== 'dkm') {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengubah presensi ini.',
        });
        return;
      }

      const {
        kegiatan_id,
        is_perwakilan,
        nama_peserta,
        status_kehadiran,
        alasan_izin,
      } = req.body || {};

      const kegiatanIdNum = kegiatan_id ? Number(kegiatan_id) : existing.kegiatan_id;
      const kegiatan = await KegiatanModel.findById(kegiatanIdNum);
      if (!kegiatan) {
        res.status(404).json({
          success: false,
          message: 'Kegiatan yang dipilih tidak ditemukan.',
        });
        return;
      }

      if (status_kehadiran !== 'Hadir' && status_kehadiran !== 'Izin') {
        res.status(400).json({
          success: false,
          message: 'Status kehadiran harus Hadir atau Izin.',
        });
        return;
      }

      const trimmedAlasan = alasan_izin ? alasan_izin.trim() : '';
      if (status_kehadiran === 'Izin' && trimmedAlasan.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Alasan izin wajib diisi jika status kehadiran adalah Izin.',
        });
        return;
      }

      const ownerUser = await UserModel.findById(existing.user_id);
      const isProxy =
        typeof is_perwakilan === 'boolean' ? is_perwakilan : existing.is_perwakilan;
      const finalNama = isProxy
        ? (nama_peserta || '').trim()
        : ownerUser?.nama || existing.nama_peserta;

      if (!finalNama) {
        res.status(400).json({
          success: false,
          message: 'Nama peserta wajib diisi.',
        });
        return;
      }

      const updated = await PresensiModel.update(id, {
        kegiatan_id: kegiatanIdNum,
        nama_peserta: finalNama,
        is_perwakilan: isProxy,
        status_kehadiran,
        alasan_izin: status_kehadiran === 'Izin' ? trimmedAlasan : null,
      });

      res.status(200).json({
        success: true,
        message: 'Data presensi berhasil diperbarui.',
        data: updated,
      });
    } catch (err) {
      console.error('[PresensiController.updatePresensi]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memperbarui data presensi.',
      });
    }
  },

  async deletePresensi(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }

      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'ID presensi tidak valid.' });
        return;
      }

      const existing = await PresensiModel.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Data presensi tidak ditemukan.' });
        return;
      }

      if (existing.user_id !== req.user.id && req.user.role !== 'dkm') {
        res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk menghapus presensi ini.',
        });
        return;
      }

      await PresensiModel.delete(id);
      res.status(200).json({
        success: true,
        message: 'Data presensi berhasil dihapus.',
      });
    } catch (err) {
      console.error('[PresensiController.deletePresensi]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus data presensi.',
      });
    }
  },

  async getAllForDKM(req, res) {
    try {
      const kegiatanIdRaw = req.query.kegiatan_id;
      const kegiatan_id =
        kegiatanIdRaw && Number(kegiatanIdRaw) > 0
          ? Number(kegiatanIdRaw)
          : undefined;
      const status_kehadiran =
        typeof req.query.status_kehadiran === 'string'
          ? req.query.status_kehadiran
          : undefined;
      const search =
        typeof req.query.search === 'string' ? req.query.search : undefined;

      const result = await PresensiModel.findAllForDKM({
        kegiatan_id,
        status_kehadiran,
        search,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error('[PresensiController.getAllForDKM]', err);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat rekap presensi DKM.',
      });
    }
  },
};
