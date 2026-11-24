import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middlewares/authMiddleware.mjs';
import { sanitizeUser, UserModel } from '../models/userModel.mjs';

export const KATEGORI_USIA_OPTIONS = [
  'Anak-anak (TK/PAUD - SD)',
  'Pemuda/i (SMP - Kuliah/Kerja)',
  'Dewasa / Umum',
  'Pengurus DKM',
];

function signAuthToken(user) {
  const payload = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
    kategori_usia: user.kategori_usia,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function setSessionCookie(req, res, token) {
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https';

  res.cookie('sj_token', token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    ...(isHttps ? { partitioned: true } : {}),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export const AuthController = {
  async register(req, res) {
    try {
      const { nama, email, password, kategori_usia, no_hp } = req.body || {};

      if (!nama || !nama.trim()) {
        res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        res.status(400).json({ success: false, message: 'Format email tidak valid.' });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Kata sandi minimal 6 karakter.',
        });
        return;
      }

      const validKategori = KATEGORI_USIA_OPTIONS.includes(kategori_usia)
        ? kategori_usia
        : 'Dewasa / Umum';

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan masuk dengan akun Anda.',
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        nama,
        email,
        password: passwordHash,
        kategori_usia: validKategori,
        no_hp: no_hp && no_hp.trim() ? no_hp.trim() : null,
        role: 'jamaah',
      });

      const token = signAuthToken(user);
      setSessionCookie(req, res, token);

      res.status(201).json({
        success: true,
        message: 'Pendaftaran akun jamaah berhasil.',
        data: { token, user },
      });
    } catch (err) {
      console.error('[AuthController.register]', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mendaftarkan akun.',
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email dan kata sandi wajib diisi.',
        });
        return;
      }

      const userRecord = await UserModel.findByEmail(email);
      if (!userRecord) {
        res.status(401).json({
          success: false,
          message: 'Email atau kata sandi tidak sesuai.',
        });
        return;
      }

      const isMatch = await bcrypt.compare(password, userRecord.password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Email atau kata sandi tidak sesuai.',
        });
        return;
      }

      const user = sanitizeUser(userRecord);
      const token = signAuthToken(user);
      setSessionCookie(req, res, token);

      res.status(200).json({
        success: true,
        message: "Berhasil masuk ke Sambung Jama'ah.",
        data: { token, user },
      });
    } catch (err) {
      console.error('[AuthController.login]', err);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat proses masuk.',
      });
    }
  },

  async me(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
        return;
      }
      const userRecord = await UserModel.findById(req.user.id);
      if (!userRecord) {
        res.status(401).json({ success: false, message: 'Akun tidak ditemukan.' });
        return;
      }
      const user = sanitizeUser(userRecord);
      const token = signAuthToken(user);
      res.status(200).json({
        success: true,
        data: { token, user },
      });
    } catch (err) {
      console.error('[AuthController.me]', err);
      res.status(500).json({ success: false, message: 'Gagal memuat sesi pengguna.' });
    }
  },

  async logout(req, res) {
    const isHttps =
      req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.clearCookie('sj_token', {
      httpOnly: true,
      secure: isHttps,
      sameSite: isHttps ? 'none' : 'lax',
      ...(isHttps ? { partitioned: true } : {}),
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil keluar dari sesi.',
    });
  },
};
