# Product Requirements Document (PRD)
## Aplikasi Pelacak Progress Harian

---

## 1. Ringkasan Eksekutif & Tujuan
**Pelacak Progress Harian** adalah aplikasi manajemen kebiasaan dan tugas yang dirancang untuk membantu pengguna membangun konsistensi, mengacak/memantau perkembangan harian, serta menganalisis tren performa pribadi secara berkala (mingguan & bulanan).

### Tujuan Utama:
- Memudahkan pengguna mencatat dan memverifikasi kegiatan harian.
- Menyediakan visualisasi progress yang intuitif untuk menjaga motivasi.
- Memberikan evaluasi berkala (mingguan dan bulanan) guna membantu pengguna mencapai target jangka panjang.

---

## 2. Struktur Fitur & Persyaratan Spesifik

### 2.1. Checklist Harian
*Fitur utama untuk eksekusi tugas harian.*
- **Daftar Kegiatan Harian:** Menampilkan seluruh daftar tugas/kegiatan yang harus diselesaikan pada hari berjalan.
- **Tandai Selesai:** Checkbox atau toggle interaktif untuk mengubah status kegiatan menjadi *Done/Selesai*.
- **Progress Harian:** Indikator visual (seperti *progress bar* atau persentase) yang memperlihatkan sejauh mana tugas hari ini telah diselesaikan.

---

### 2.2. Grafik Progress
*Fitur analitik visual untuk mengukur performa harian.*
- **Grafik Nilai Harian:** Diagram/grafik batang atau garis yang memperlihatkan tingkat penyelesaian tugas dari hari ke hari.
- **Laporan per Kategori:** Breakdown statistik berdasarkan kategori kegiatan (misal: Kesehatan, Produktivitas, Belajar).
- **Pencapaian Terbaik:** Ringkasan *high score* atau rekor penyelesaian terbanyak yang diraih pengguna.

---

### 2.3. Kelola Kegiatan
*Fitur manajemen CRUD (Create, Read, Update, Delete) untuk daftar aktivitas.*
- **Tambah Kegiatan:** Formulir pembuatan kegiatan baru lengkap dengan judul, deskripsi, dan frekuensi.
- **Atur Target & Kategori:** Pengelompokan kegiatan berdasarkan kategori serta penentuan target spesifik (misal: "30 menit", "10.000 langkah").
- **Ubah & Hapus:** Opsi untuk memperbarui detail kegiatan atau menghapus kegiatan yang sudah tidak relevan.

---

### 2.4. Rekap Mingguan
*Fitur analisis berkala skala 7 hari.*
- **Ringkasan Mingguan:** Rangkuman total kegiatan yang berhasil diselesaikan selama satu minggu.
- **Bandingkan Antar Minggu:** Komparasi persentase keberhasilan minggu ini dibandingkan dengan minggu sebelumnya.
- **Kegiatan Paling Konsisten:** Sorotan khusus pada aktivitas yang memiliki tingkat penyelesaian paling tinggi sepanjang minggu.

---

### 2.5. Rekap Bulanan
*Fitur analisis makro berkala skala 30 hari.*
- **Ringkasan Bulanan:** Overview performa total dalam rentang waktu satu bulan.
- **Tren Bulanan:** Grafik statistik yang memperlihatkan fluktuasi konsistensi pengguna dari awal hingga akhir bulan.
- **Pola dan Target:** Evaluasi apakah pola kebiasaan pengguna sudah sesuai dengan target jangka panjang yang ditetapkan.

---

### 2.6. Riwayat & Catatan
*Fitur jurnal dan arsip aktivitas.*
- **Kalender Riwayat:** Tampilan kalender interaktif untuk melihat log aktivitas pada tanggal-tanggal lampau.
- **Catatan Harian:** Ruang refleksi atau jurnal singkat bagi pengguna untuk mencatat kendala/pencapaian harian.
- **Cari Riwayat:** Fitur pencarian (*search bar*) dan filter untuk menemukan catatan atau aktivitas lama.

---

### 2.7. Pengingat Harian
*Fitur notifikasi untuk menjaga keterlibatan (retention) pengguna.*
- **Atur Jam Pengingat:** Kustomisasi waktu pengiriman notifikasi sesuai jadwal harian pengguna.
- **Ingatkan yang Belum Selesai:** Push notification otomatis pada jam tertentu jika masih ada kegiatan yang bertanda *unfinished*.
- **Pesan Penyemangat:** Pesan motivasi acak/kustom yang disertakan dalam notifikasi pengingat.

---

### 2.8. Akun & Sinkronisasi
*Fitur autentikasi dan keamanan data.*
- **Daftar & Masuk:** Sistem otentikasi pengguna (Email, Google Auth, dll.).
- **Simpan Data / Sinkron Data:** Sinkronisasi cloud agar data pengguna tidak hilang dan dapat diakses dari beberapa perangkat.
- **Atur Profil:** Pengaturan informasi akun, foto profil, dan preferensi pribadi.

---

## 3. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Responsivitas & UI/UX:**
   - Desain antarmuka yang bersih, intuitif, dan *mobile-friendly*.
   - Loading time yang cepat saat memuat grafik atau kalender riwayat.
2. **Aksesibilitas & Keamanan:**
   - Enkripsi data pengguna terutama pada catatan harian (*journaling*).
   - Dukungan Mode Gelap (Dark Mode) dan Mode Terang (Light Mode).
3. **Ketersediaan (Availability):**
   - Aplikasi dapat diakses secara *offline* untuk centang checklist, lalu disinkronkan secara otomatis saat terhubung kembali ke internet.

---

## 4. Matriks Keberhasilan (KPIs)
- **Daily Active Users (DAU):** Tingkat penggunaan harian pengguna saat mengisi checklist.
- **Retention Rate (Day 7 & Day 30):** Persentase pengguna yang tetap aktif menggunakan aplikasi dalam 1 minggu dan 1 bulan.
- **Completion Rate:** Rata-rata persentase kegiatan yang diselesaikan oleh pengguna setiap harinya.