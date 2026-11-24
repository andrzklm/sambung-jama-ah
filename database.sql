-- ============================================================================
-- Database: db_sambung_jamaah
-- Platform Informasi Jadwal Kegiatan Masjid & Presensi Kehadiran Digital
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `db_sambung_jamaah`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_sambung_jamaah`;

SHOW TABLES;

-- Hapus tabel jika sudah ada (urutan memperhatikan foreign key)
DROP TABLE IF EXISTS `presensi`;
DROP TABLE IF EXISTS `kegiatan`;
DROP TABLE IF EXISTS `users`;

-- ============================================================================
-- 1. Tabel users
-- ============================================================================
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `kategori_usia` ENUM(
    'Anak-anak (TK/PAUD - SD)',
    'Pemuda/i (SMP - Kuliah/Kerja)',
    'Dewasa / Umum',
    'Pengurus DKM'
  ) NOT NULL DEFAULT 'Dewasa / Umum',
  `no_hp` VARCHAR(25) DEFAULT NULL,
  `role` ENUM('jamaah', 'dkm') NOT NULL DEFAULT 'jamaah',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. Tabel kegiatan
-- ============================================================================
CREATE TABLE `kegiatan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `judul_kegiatan` VARCHAR(180) NOT NULL,
  `kategori` ENUM(
    'Pengajian Rutin Umum',
    'Pengajian Anak-anak',
    'Pengajian Pemuda/i',
    'Musyawarah Pengurus DKM',
    'Olahraga',
    'Keakraban',
    'Kerja Bakti'
  ) NOT NULL,
  `deskripsi` TEXT NOT NULL,
  `tanggal` DATE NOT NULL,
  `waktu_mulai` TIME NOT NULL,
  `waktu_selesai` TIME NOT NULL,
  `tempat` VARCHAR(160) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. Tabel presensi
-- ============================================================================
CREATE TABLE `presensi` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `kegiatan_id` INT NOT NULL,
  `nama_peserta` VARCHAR(120) NOT NULL,
  `is_perwakilan` BOOLEAN NOT NULL DEFAULT FALSE,
  `status_kehadiran` ENUM('Hadir', 'Izin') NOT NULL,
  `alasan_izin` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_presensi_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_presensi_kegiatan` FOREIGN KEY (`kegiatan_id`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Dummy Data: users (Password untuk semua akun demo: amanah123)
-- Hash bcryptjs ($2b$10$oivgWjWqbzgArnr6xTo9i.7D6uzDcQ61VkiBTR0vE3KZWFcw6aEKq)
-- ============================================================================
INSERT INTO `users` (`nama`, `email`, `password`, `kategori_usia`, `no_hp`, `role`) VALUES
('H. Ahmad Fauzi', 'pengurus@sambungjamaah.id', '$2b$10$oivgWjWqbzgArnr6xTo9i.7D6uzDcQ61VkiBTR0vE3KZWFcw6aEKq', 'Pengurus DKM', '081234567890', 'dkm'),
('Ibu Siti Aminah', 'jamaah@sambungjamaah.id', '$2b$10$oivgWjWqbzgArnr6xTo9i.7D6uzDcQ61VkiBTR0vE3KZWFcw6aEKq', 'Dewasa / Umum', '081398765432', 'jamaah'),
('Rizky Pratama', 'rizky.pemuda@sambungjamaah.id', '$2b$10$oivgWjWqbzgArnr6xTo9i.7D6uzDcQ61VkiBTR0vE3KZWFcw6aEKq', 'Pemuda/i (SMP - Kuliah/Kerja)', '085611223344', 'jamaah'),
('Bapak Hendra Wijaya', 'hendra.wijaya@sambungjamaah.id', '$2b$10$oivgWjWqbzgArnr6xTo9i.7D6uzDcQ61VkiBTR0vE3KZWFcw6aEKq', 'Dewasa / Umum', '081299887766', 'jamaah');

-- ============================================================================
-- Dummy Data: kegiatan (Jadwal 1 minggu hingga 1 bulan ke depan)
-- ============================================================================
INSERT INTO `kegiatan` (`judul_kegiatan`, `kategori`, `deskripsi`, `tanggal`, `waktu_mulai`, `waktu_selesai`, `tempat`) VALUES
(
  'Pengajian Rutin Malam Rabu: Kajian Tafsir & Fiqih Sehari-hari',
  'Pengajian Rutin Umum',
  'Kajian rutin pekanan untuk seluruh jamaah bapak-bapak dan ibu-ibu bersama Ustadz Felix. Tersedia ruang belajar terpisah dan konsumsi ringan.',
  '2026-11-24',
  '19:30:00',
  '21:30:00',
  'Ruang Utama Masjid Al-Ikhlas'
),
(
  'TPA & Pengajian Anak-anak: Kisah Teladan Sahabat & Hafalan Juz Amma',
  'Pengajian Anak-anak',
  'Pembelajaran membaca Al-Quran metode Iqra, hafalan surat pendek, dan kisah keteladanan sahabat untuk anak usia TK/PAUD hingga SD. Orang tua dapat mengantar dan mengisi presensi perwakilan.',
  '2026-11-26',
  '16:30:00',
  '17:30:00',
  'Serambi Timur & Kelas TPA Masjid'
),
(
  'Kajian Pemuda/i Masjid: Adab Bermedsos & Kesiapan Karier Islami',
  'Pengajian Pemuda/i',
  'Forum diskusi interaktif remaja dan mahasiswa/pekerja muda bersama Kak Ustadz Farhan. Dilanjutkan ramah tamah hangat.',
  '2026-11-27',
  '19:30:00',
  '21:00:00',
  'Aula Serbaguna Lantai 2'
),
(
  'Olahraga Pagi Jamaah: Senam Bugar & Badminton Bersama',
  'Olahraga',
  'Kegiatan olahraga rutin setiap Ahad pagi untuk menjaga kebugaran jasmani dan mempererat ukhuwah lintas generasi jamaah.',
  '2026-11-29',
  '07:00:00',
  '10:00:00',
  'Halaman Masjid & Lapangan Serbaguna'
),
(
  'Kerja Bakti Bersih Masjid & Penataan Taman Serambi',
  'Kerja Bakti',
  'Gotong royong membersihkan ruang shalat utama, tempat wudhu, karpet, dan perapihan taman halaman masjid. Peralatan kebersihan disediakan DKM.',
  '2026-12-05',
  '07:30:00',
  '10:00:00',
  'Area Masjid & Halaman Parkir'
),
(
  'Musyawarah Pengurus DKM & Rapat Evaluasi Bulanan',
  'Musyawarah Pengurus DKM',
  'Musyawarah pengurus DKM untuk koordinasi kegiatan masjid, evaluasi program bulanan, laporan kas masjid, serta rekapitulasi kehadiran jamaah.',
  '2026-12-10',
  '20:00:00',
  '22:00:00',
  'Ruang Sekretariat DKM'
),
(
  'Malam Keakraban & Makan Bersama Keluarga Jamaah (Pasca Idul Adha / Ukhuwah)',
  'Keakraban',
  'Silaturahmi akbar dan ramah tamah seluruh keluarga besar jamaah untuk memperkuat tali persaudaraan antarwarga masjid.',
  '2026-12-19',
  '18:30:00',
  '21:00:00',
  'Halaman Tengah Masjid Al-Ikhlas'
);

-- ============================================================================
-- Dummy Data: presensi (Termasuk pengisian perwakilan oleh orang tua)
-- ============================================================================
INSERT INTO `presensi` (`user_id`, `kegiatan_id`, `nama_peserta`, `is_perwakilan`, `status_kehadiran`, `alasan_izin`) VALUES
(2, 1, 'Ibu Siti Aminah', FALSE, 'Hadir', NULL),
(2, 2, 'Zaidan Al-Farizi (Anak TK)', TRUE, 'Hadir', NULL),
(2, 2, 'Nayla Khairunnisa (Anak SD)', TRUE, 'Izin', 'Sedang demam ringan dan perlu istirahat di rumah'),
(3, 3, 'Rizky Pratama', FALSE, 'Hadir', NULL),
(4, 1, 'Bapak Hendra Wijaya', FALSE, 'Izin', 'Ada agenda dinas luar kota sampai hari Kamis'),
(4, 4, 'Bapak Hendra Wijaya', FALSE, 'Hadir', NULL),
(1, 6, 'H. Ahmad Fauzi', FALSE, 'Hadir', NULL);
