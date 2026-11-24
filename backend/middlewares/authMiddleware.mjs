import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Gunakan JWT_SECRET dari environment; fallback acak di memori bila belum diatur
export const JWT_SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0
    ? process.env.JWT_SECRET
    : crypto.randomBytes(32).toString('hex');

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) return {};
  const result = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      result[key] = val;
    }
  }
  return result;
}

function isSameOriginOrCustomHeader(req) {
  if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
    return true;
  }
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host === host;
  } catch {
    return false;
  }
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  let token;
  let viaCookie = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    const cookies = parseCookieHeader(req.headers.cookie);
    if (cookies.sj_token) {
      token = cookies.sj_token;
      viaCookie = true;
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak. Silakan masuk terlebih dahulu.',
    });
    return;
  }

  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (viaCookie && mutatingMethods.includes(req.method) && !isSameOriginOrCustomHeader(req)) {
    res.status(403).json({
      success: false,
      message: 'Permintaan tidak terverifikasi (CSRF protection).',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Sesi Anda telah berakhir atau token tidak valid. Silakan masuk kembali.',
    });
  }
}

export function isDKM(req, res, next) {
  if (!req.user || req.user.role !== 'dkm') {
    res.status(403).json({
      success: false,
      message: 'Akses terbatas. Fitur ini hanya untuk Pengurus DKM.',
    });
    return;
  }
  next();
}
