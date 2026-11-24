import bcrypt from 'bcryptjs';
import fs from 'fs';
import mysql from 'mysql2/promise';
import os from 'os';
import path from 'path';

const STORE_PATH = path.join(os.tmpdir(), 'sambung_jamaah_store.json');

let pool = null;
let mysqlAvailable = false;

export async function initDatabase() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (DB_HOST && DB_USER && DB_NAME) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        port: Number(DB_PORT) || 3306,
        user: DB_USER,
        password: DB_PASSWORD || '',
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        dateStrings: true,
      });

      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      mysqlAvailable = true;
      console.log('[DB] Terhubung ke MySQL:', DB_NAME);
      return;
    } catch (err) {
      console.warn(
        '[DB] Koneksi MySQL tidak tersedia, menggunakan penyimpanan lokal sandbox:',
        err instanceof Error ? err.message : String(err)
      );
      pool = null;
      mysqlAvailable = false;
    }
  } else {
    console.log(
      '[DB] Variabel DB_HOST/DB_NAME belum dikonfigurasi, menggunakan penyimpanan lokal sandbox terstruktur.'
    );
  }

  ensureFallbackStore();
}

export function isUsingMysql() {
  return mysqlAvailable && pool !== null;
}

export function getPool() {
  if (!pool) {
    throw new Error('MySQL pool belum diinisialisasi');
  }
  return pool;
}

function createInitialSeed() {
  const seedHash = bcrypt.hashSync('amanah123', 10);
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: 1,
        nama: 'H. Ahmad Fauzi',
        email: 'pengurus@sambungjamaah.id',
        password: seedHash,
        kategori_usia: 'Pengurus DKM',
        no_hp: '081234567890',
        role: 'dkm',
        created_at: now,
      },
      {
        id: 2,
        nama: 'Ibu Siti Aminah',
        email: 'jamaah@sambungjamaah.id',
        password: seedHash,
        kategori_usia: 'Dewasa / Umum',
        no_hp: '081398765432',
        role: 'jamaah',
        created_at: now,
      },
      {
        id: 3,
        nama: 'Rizky Pratama',
        email: 'rizky.pemuda@sambungjamaah.id',
        password: seedHash,
        kategori_usia: 'Pemuda/i (SMP - Kuliah/Kerja)',
        no_hp: '085611223344',
        role: 'jamaah',
        created_at: now,
      },
      {
        id: 4,
        nama: 'Bapak Hendra Wijaya',
        email: 'hendra.wijaya@sambungjamaah.id',
        password: seedHash,
        kategori_usia: 'Dewasa / Umum',
        no_hp: '081299887766',
        role: 'jamaah',
        created_at: now,
      },
    ],
    kegiatan: [
      {
        id: 1,
        judul_kegiatan: 'Pengajian Rutin Malam Rabu: Kajian Tafsir & Fiqih Sehari-hari',
        kategori: 'Pengajian Rutin Umum',
        deskripsi:
          'Kajian rutin pekanan untuk seluruh jamaah bapak-bapak dan ibu-ibu bersama Ustadz Drs. H. Ridwan Kamil. Tersedia ruang belajar terpisah dan konsumsi ringan.',
        tanggal: '2026-11-24',
        waktu_mulai: '19:30:00',
        waktu_selesai: '21:30:00',
        tempat: 'Ruang Utama Masjid Al-Ikhlas',
        created_at: now,
      },
      {
        id: 2,
        judul_kegiatan: 'TPA & Pengajian Anak-anak: Kisah Teladan Sahabat & Hafalan Juz Amma',
        kategori: 'Pengajian Anak-anak',
        deskripsi:
          'Pembelajaran membaca Al-Quran metode Iqra, hafalan surat pendek, dan kisah keteladanan sahabat untuk anak usia TK/PAUD hingga SD. Orang tua dapat mengisi presensi perwakilan.',
        tanggal: '2026-11-26',
        waktu_mulai: '16:30:00',
        waktu_selesai: '17:30:00',
        tempat: 'Serambi Timur & Kelas TPA Masjid',
        created_at: now,
      },
      {
        id: 3,
        judul_kegiatan: 'Kajian Pemuda/i Masjid: Adab Bermedsos & Kesiapan Karier Islami',
        kategori: 'Pengajian Pemuda/i',
        deskripsi:
          'Forum diskusi interaktif remaja dan mahasiswa/pekerja muda bersama Ustadz Farhan Maulana. Dilanjutkan ramah tamah hangat.',
        tanggal: '2026-11-27',
        waktu_mulai: '19:30:00',
        waktu_selesai: '21:00:00',
        tempat: 'Aula Serbaguna Lantai 2',
        created_at: now,
      },
      {
        id: 4,
        judul_kegiatan: 'Olahraga Pagi Jamaah: Senam Bugar & Badminton Bersama',
        kategori: 'Olahraga',
        deskripsi:
          'Kegiatan olahraga rutin setiap Ahad pagi untuk menjaga kebugaran jasmani dan mempererat ukhuwah lintas generasi jamaah.',
        tanggal: '2026-11-29',
        waktu_mulai: '07:00:00',
        waktu_selesai: '10:00:00',
        tempat: 'Halaman Masjid & Lapangan Serbaguna',
        created_at: now,
      },
      {
        id: 5,
        judul_kegiatan: 'Kerja Bakti Bersih Masjid & Penataan Taman Serambi',
        kategori: 'Kerja Bakti',
        deskripsi:
          'Gotong royong membersihkan ruang shalat utama, tempat wudhu, karpet, dan perapihan taman halaman masjid. Peralatan kebersihan disediakan DKM.',
        tanggal: '2026-12-05',
        waktu_mulai: '07:30:00',
        waktu_selesai: '10:00:00',
        tempat: 'Area Masjid & Halaman Parkir',
        created_at: now,
      },
      {
        id: 6,
        judul_kegiatan: 'Musyawarah Pengurus DKM & Rapat Evaluasi Bulanan',
        kategori: 'Musyawarah Pengurus DKM',
        deskripsi:
          'Musyawarah pengurus DKM untuk koordinasi kegiatan masjid, evaluasi program bulanan, laporan kas masjid, serta rekapitulasi kehadiran jamaah.',
        tanggal: '2026-12-10',
        waktu_mulai: '20:00:00',
        waktu_selesai: '22:00:00',
        tempat: 'Ruang Sekretariat DKM',
        created_at: now,
      },
      {
        id: 7,
        judul_kegiatan: 'Malam Keakraban & Makan Bersama Keluarga Jamaah (Pasca Idul Adha)',
        kategori: 'Keakraban',
        deskripsi:
          'Silaturahmi akbar dan ramah tamah seluruh keluarga besar jamaah untuk memperkuat tali persaudaraan antarwarga masjid.',
        tanggal: '2026-12-19',
        waktu_mulai: '18:30:00',
        waktu_selesai: '21:00:00',
        tempat: 'Halaman Tengah Masjid Al-Ikhlas',
        created_at: now,
      },
    ],
    presensi: [
      {
        id: 1,
        user_id: 2,
        kegiatan_id: 1,
        nama_peserta: 'Ibu Siti Aminah',
        is_perwakilan: false,
        status_kehadiran: 'Hadir',
        alasan_izin: null,
        created_at: now,
      },
      {
        id: 2,
        user_id: 2,
        kegiatan_id: 2,
        nama_peserta: 'Zaidan Al-Farizi (Anak TK)',
        is_perwakilan: true,
        status_kehadiran: 'Hadir',
        alasan_izin: null,
        created_at: now,
      },
      {
        id: 3,
        user_id: 2,
        kegiatan_id: 2,
        nama_peserta: 'Nayla Khairunnisa (Anak SD)',
        is_perwakilan: true,
        status_kehadiran: 'Izin',
        alasan_izin: 'Sedang demam ringan dan perlu istirahat di rumah',
        created_at: now,
      },
      {
        id: 4,
        user_id: 3,
        kegiatan_id: 3,
        nama_peserta: 'Rizky Pratama',
        is_perwakilan: false,
        status_kehadiran: 'Hadir',
        alasan_izin: null,
        created_at: now,
      },
      {
        id: 5,
        user_id: 4,
        kegiatan_id: 1,
        nama_peserta: 'Bapak Hendra Wijaya',
        is_perwakilan: false,
        status_kehadiran: 'Izin',
        alasan_izin: 'Ada agenda dinas luar kota sampai hari Kamis',
        created_at: now,
      },
      {
        id: 6,
        user_id: 4,
        kegiatan_id: 4,
        nama_peserta: 'Bapak Hendra Wijaya',
        is_perwakilan: false,
        status_kehadiran: 'Hadir',
        alasan_izin: null,
        created_at: now,
      },
      {
        id: 7,
        user_id: 1,
        kegiatan_id: 6,
        nama_peserta: 'H. Ahmad Fauzi',
        is_perwakilan: false,
        status_kehadiran: 'Hadir',
        alasan_izin: null,
        created_at: now,
      },
    ],
    nextId: {
      users: 5,
      kegiatan: 8,
      presensi: 8,
    },
  };
}

function ensureFallbackStore() {
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      let changed = false;
      parsed.kegiatan = parsed.kegiatan.map((k) => {
        if (k.kategori === 'Pengajian Pengurus DKM') {
          changed = true;
          return {
            ...k,
            kategori: 'Musyawarah Pengurus DKM',
            judul_kegiatan:
              k.judul_kegiatan === 'Pengajian Khusus & Rapat Evaluasi Bulanan Pengurus DKM'
                ? 'Musyawarah Pengurus DKM & Rapat Evaluasi Bulanan'
                : k.judul_kegiatan,
            deskripsi:
              k.deskripsi && k.deskripsi.startsWith('Pembinaan ruhiyah pengurus DKM')
                ? 'Musyawarah pengurus DKM untuk koordinasi kegiatan masjid, evaluasi program bulanan, laporan kas masjid, serta rekapitulasi kehadiran jamaah.'
                : k.deskripsi,
          };
        }
        return k;
      });
      if (changed) {
        fs.writeFileSync(STORE_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    } catch {
      // Regenerate if corrupt
    }
  }
  const initial = createInitialSeed();
  fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

export function readFallbackStore() {
  return ensureFallbackStore();
}

export function writeFallbackStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}
