import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middlewares/authMiddleware.mjs';
import { sanitizeUser, UserModel } from '../models/userModel.mjs';
import { KATEGORI_USIA_OPTIONS, setSessionCookie } from './authController.mjs';

export const UserController = {
  async getProfile(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
        return;
      }
      res.status(200).json({
        success: true,
        data: sanitizeUser(user),
      });
    } catch (err) {
      console.error('[UserController.getProfile]', err);
      res.status(500).json({ success: false, message: 'Gagal memuat profil pengguna.' });
    }
  },

  async updateProfile(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }

      const { nama, email, kategori_usia, no_hp, password } = req.body || {};

      if (!nama || !nama.trim()) {
        res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        res.status(400).json({ success: false, message: 'Format email tidak valid.' });
        return;
      }
      if (!kategori_usia || !KATEGORI_USIA_OPTIONS.includes(kategori_usia)) {
        res.status(400).json({
          success: false,
          message: 'Kategori usia tidak valid.',
        });
        return;
      }

      if (password && password.trim().length > 0 && password.trim().length < 6) {
        res.status(400).json({
          success: false,
          message: 'Kata sandi baru minimal 6 karakter.',
        });
        return;
      }

      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail && existingEmail.id !== req.user.id) {
        res.status(409).json({
          success: false,
          message: 'Email sudah digunakan oleh pengguna lain.',
        });
        return;
      }

      const passwordHash =
        password && password.trim().length >= 6
          ? await bcrypt.hash(password.trim(), 10)
          : undefined;

      const updated = await UserModel.update(req.user.id, {
        nama,
        email,
        kategori_usia,
        no_hp: no_hp && no_hp.trim() ? no_hp.trim() : null,
        passwordHash,
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
        return;
      }

      const payload = {
        id: updated.id,
        nama: updated.nama,
        email: updated.email,
        role: updated.role,
        kategori_usia: updated.kategori_usia,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      setSessionCookie(req, res, token);

      res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: { user: updated, token },
      });
    } catch (err) {
      console.error('[UserController.updateProfile]', err);
      res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
    }
  },
};
