export const KATEGORI_USIA_LIST = [
  'Anak-anak (TK/PAUD - SD)',
  'Pemuda/i (SMP - Kuliah/Kerja)',
  'Dewasa / Umum',
  'Pengurus DKM',
];

export const KATEGORI_KEGIATAN_LIST = [
  'Pengajian Rutin Umum',
  'Pengajian Anak-anak',
  'Pengajian Pemuda/i',
  'Musyawarah Pengurus DKM',
  'Olahraga',
  'Keakraban',
  'Kerja Bakti',
];

export function formatTanggalIndonesia(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatWaktu(timeStr) {
  if (!timeStr) return '-';
  return timeStr.slice(0, 5);
}
