---
name: glassmorphism-ui
version: 1.0.0
description: Panduan membangun antarmuka modern bergaya glassmorphism dengan panel kaca transparan, blur berlapis, nuansa biru-abu, dan dashboard futuristik seperti referensi visual.
---

# Glassmorphism UI Skill

## Tujuan

Gunakan skill ini saat membuat atau memperbaiki UI web yang memakai **glassmorphism**: permukaan seperti kaca semi-transparan, latar belakang yang tampak melalui blur, garis tepi tipis, pantulan cahaya lembut, bayangan dalam, dan komposisi panel yang terasa melayang.

Arah visual utama mengikuti referensi dashboard smart-home futuristik:

- Latar belakang berupa foto/visual interior atau abstraksi gelap dengan kedalaman dan kontras yang cukup.
- Panel utama besar dengan permukaan kaca abu-abu kebiruan yang transparan.
- Kartu turunan untuk metrik, perangkat, grafik, kontrol, dan navigasi.
- Radius sudut lebar, garis tepi tipis, dan pencahayaan yang halus.
- Aksen biru terang secukupnya untuk status aktif, grafik, slider, dan tombol utama.
- Tipografi modern dan ringkas, dengan hierarki yang jelas.

Hasil akhirnya harus terlihat **elegan, tenang, berlapis, mudah dibaca, dan tetap fungsional**—bukan sekadar kumpulan kotak transparan.

## Instruksi untuk AI coding agent

Saat mengerjakan UI berdasarkan skill ini:

1. Periksa struktur project dan gunakan framework, pola komponen, serta sistem styling yang sudah ada. Jangan mengganti stack tanpa alasan.
2. Prioritaskan komposisi, hierarki informasi, dan keterbacaan sebelum menambahkan dekorasi.
3. Bangun efek kaca melalui kombinasi transparansi, `backdrop-filter`, border halus, highlight, dan shadow. Jangan hanya menurunkan opacity seluruh komponen.
4. Pastikan konten di balik panel tidak mengganggu teks atau kontrol.
5. Buat komponen yang konsisten dan dapat digunakan ulang, misalnya `GlassPanel`, `GlassCard`, `MetricCard`, `DeviceCard`, `SegmentedNav`, dan `Toggle`.
6. Pertahankan semua tombol, tab, toggle, slider, dan kontrol agar benar-benar berfungsi apabila UI memerlukan interaksi. Jangan membuat kontrol interaktif yang hanya dekoratif.
7. Uji tampilan di desktop, tablet, dan mobile. Jangan mengecilkan seluruh dashboard desktop secara paksa pada layar kecil.
8. Hormati preferensi reduced motion, kontras yang memadai, navigasi keyboard, serta label aksesibel.
9. Hindari efek blur yang terlalu berat atau terlalu banyak lapisan sehingga performa turun.
10. Jika aset atau data tidak tersedia, gunakan placeholder yang masuk akal dan tandai data demonstrasi dengan jelas.

## Prinsip visual

### 1. Latar belakang berlapis

- Gunakan gambar interior, pemandangan malam, gradasi gelap, atau tekstur abstrak yang lembut.
- Tambahkan overlay biru-abu gelap agar panel dan teks tetap terbaca.
- Hindari latar yang terlalu ramai, terlalu tajam, atau penuh warna jenuh.
- Bila memakai foto, gunakan `background-size: cover` dan pilih posisi gambar yang menjaga fokus visual.

### 2. Material kaca

Setiap permukaan kaca sebaiknya menggabungkan sebagian besar unsur berikut:

- `background` transparan, umumnya putih dengan alpha rendah.
- `backdrop-filter: blur(...) saturate(...)` untuk melembutkan latar di belakang panel.
- `border` putih dengan alpha tipis untuk menangkap tepi kaca.
- Highlight halus pada bagian atas atau sisi yang terkena cahaya.
- Shadow lebar dan lembut untuk memberi kesan panel melayang.

Gunakan variasi intensitas menurut kedalaman:

- **Glass utama:** cukup terang dan jelas, untuk panel dashboard terpenting.
- **Glass sekunder:** lebih gelap atau lebih transparan, untuk kartu, widget, dan panel kontrol.
- **Glass interaktif:** memiliki perbedaan visual saat hover, focus, selected, dan disabled.

Jangan memberi blur dan opacity yang sama ke semua elemen. Variasi yang terukur membuat kedalaman terasa lebih alami.

### 3. Warna dan aksen

Palet dasar yang disarankan:

| Token | Nilai awal | Penggunaan |
|---|---|---|
| `--bg-deep` | `#101720` | Latar gelap dan fallback |
| `--glass-tint` | `rgba(218, 228, 239, 0.14)` | Permukaan kaca utama |
| `--glass-tint-dark` | `rgba(22, 31, 43, 0.48)` | Panel sekunder |
| `--glass-border` | `rgba(255, 255, 255, 0.22)` | Garis tepi kaca |
| `--glass-highlight` | `rgba(255, 255, 255, 0.28)` | Pantulan/highlight lembut |
| `--text-primary` | `#F7FAFD` | Teks utama pada permukaan gelap |
| `--text-secondary` | `rgba(245, 249, 255, 0.72)` | Label dan informasi tambahan |
| `--accent-blue` | `#58B8FF` | Aksi utama dan status aktif |
| `--accent-blue-soft` | `rgba(88, 184, 255, 0.22)` | Glow atau permukaan aksen |

Nilai di atas adalah titik awal, bukan aturan mutlak. Sesuaikan warna sesuai gambar latar, merek, dan kebutuhan kontras.

### 4. Radius, jarak, dan bayangan

Gunakan skala yang konsisten:

- Radius kartu kecil: `12–16px`.
- Radius kartu besar: `20–28px`.
- Radius panel utama: `28–36px`.
- Jarak internal: `12`, `16`, `20`, `24`, atau `32px`.
- Shadow: lebar dan lembut, dengan opacity rendah; hindari garis bayangan hitam yang keras.

Komposisi harus memiliki ruang kosong. Jangan memadatkan setiap area dengan dekorasi atau data.

### 5. Tipografi dan ikon

- Gunakan sans-serif kontemporer seperti Inter, Geist, atau font bawaan sistem.
- Berikan kontras ukuran yang jelas antara judul, nilai metrik, label, dan teks bantu.
- Angka metrik boleh lebih besar dan sedikit lebih tebal daripada labelnya.
- Gunakan satu keluarga ikon yang konsisten, misalnya Lucide atau ikon SVG proyek.
- Hindari emoji sebagai pengganti ikon antarmuka jika desain membutuhkan tampilan produk yang profesional.

## Pola layout yang direkomendasikan

Untuk dashboard seperti referensi, gunakan struktur berlapis berikut dan ubah sesuai kebutuhan produk:

1. **Background scene** — foto atau gradasi yang mengisi viewport.
2. **Main glass shell** — wadah dashboard dengan padding besar, border tipis, blur, dan radius lebar.
3. **Primary content grid** — area konten utama yang dapat memuat kartu perangkat, grafik, dan metrik.
4. **Secondary control rail** — panel samping untuk kontrol suhu, media, filter, atau tindakan kontekstual.
5. **Compact cards** — kartu informasi ringkas yang konsisten dalam tinggi, radius, dan jarak.
6. **Navigation** — tab, segmented control, atau dock kecil yang tetap mudah ditemukan.

Untuk dashboard yang memiliki banyak data, tetapkan grid yang stabil. Jangan menempatkan elemen secara absolut hanya untuk meniru tangkapan layar, kecuali elemen itu memang berupa overlay dekoratif.

## CSS starter

Gunakan ini sebagai fondasi dan integrasikan dengan struktur project yang sudah tersedia.

```css
:root {
  color-scheme: dark;
  --bg-deep: #101720;
  --glass-tint: rgba(218, 228, 239, 0.14);
  --glass-tint-dark: rgba(22, 31, 43, 0.48);
  --glass-border: rgba(255, 255, 255, 0.22);
  --glass-highlight: rgba(255, 255, 255, 0.28);
  --text-primary: #f7fafd;
  --text-secondary: rgba(245, 249, 255, 0.72);
  --accent-blue: #58b8ff;
  --accent-blue-soft: rgba(88, 184, 255, 0.22);
  --radius-card: 18px;
  --radius-panel: 28px;
  --shadow-glass: 0 20px 60px rgba(3, 9, 18, 0.24);
}

.app-scene {
  min-height: 100vh;
  color: var(--text-primary);
  background:
    linear-gradient(120deg, rgba(10, 18, 29, 0.56), rgba(14, 25, 39, 0.34)),
    var(--app-background, linear-gradient(135deg, #202c3a, #101720));
  background-position: center;
  background-size: cover;
}

.glass-panel {
  background: linear-gradient(
    135deg,
    rgba(242, 248, 255, 0.17),
    rgba(183, 202, 224, 0.07) 48%,
    rgba(19, 30, 44, 0.18)
  );
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow-glass);
  -webkit-backdrop-filter: blur(24px) saturate(135%);
  backdrop-filter: blur(24px) saturate(135%);
}

.glass-card {
  position: relative;
  overflow: hidden;
  background: var(--glass-tint);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-card);
  box-shadow: 0 10px 32px rgba(3, 9, 18, 0.12);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
  backdrop-filter: blur(18px) saturate(125%);
}

.glass-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--glass-highlight),
    transparent
  );
  pointer-events: none;
}

.glass-interactive {
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.glass-interactive:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 16px 40px rgba(3, 9, 18, 0.2);
}

.glass-interactive:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 3px;
}

.status-active {
  color: var(--text-primary);
  background: var(--accent-blue-soft);
  border-color: rgba(88, 184, 255, 0.55);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Catatan penggunaan CSS

- `backdrop-filter` memburamkan konten **di belakang** elemen; elemen tetap perlu memiliki latar transparan agar efeknya terlihat.
- Siapkan warna latar solid sebagai fallback jika browser tidak mendukung blur.
- Jangan menggunakan `opacity` pada seluruh panel bila teks di dalamnya harus tetap terang; gunakan warna RGBA pada `background`.
- Gunakan `z-index` secara hati-hati untuk navigasi dan panel overlay.
- Terapkan blur paling kuat pada panel utama, bukan pada setiap elemen kecil.

Contoh fallback:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-panel {
    background: rgba(28, 40, 55, 0.94);
  }

  .glass-card {
    background: rgba(39, 53, 70, 0.96);
  }
}
```

## Komponen dan perilaku

### `GlassPanel`

- Menjadi wadah visual utama untuk satu kelompok konten.
- Memiliki padding konsisten, radius besar, border halus, dan background kaca.
- Jangan menambahkan heading jika hierarki halaman sudah menyediakan judul yang jelas.

### `MetricCard`

- Menampilkan satu angka utama, satu label, dan opsional indikator perubahan.
- Pastikan satuan seperti `kWh`, `%`, atau `°C` mudah dipahami.
- Hindari membuat semua angka sama besar; prioritaskan metrik terpenting.

### `DeviceCard`

- Memuat nama perangkat, tipe atau lokasi, status, dan kontrol singkat.
- Bedakan kondisi aktif dan nonaktif dengan lebih dari satu petunjuk visual jika memungkinkan, seperti teks status dan warna.
- Toggle harus dapat dikendalikan dengan keyboard serta mempunyai label aksesibel.

### `ChartPanel`

- Gunakan garis grid dan label seperlunya saja agar grafik tidak tenggelam di balik efek kaca.
- Pastikan teks, tooltip, dan sumbu grafik tetap terbaca.
- Jangan mengandalkan warna saja untuk membedakan seri data.

### `ControlPanel`

- Kelompokkan kontrol berdasarkan tujuan, misalnya suhu, pencahayaan, atau media.
- Gunakan state hover, focus, active, disabled, dan loading bila relevan.
- Kontrol yang berbahaya atau berdampak besar perlu label yang jelas; jangan menyamarkan fungsi sebagai dekorasi.

## Responsivitas

### Desktop

- Gunakan layout multi-kolom untuk dashboard dan panel kontrol samping.
- Pertahankan ruang kosong agar panel tidak terasa saling bertumpuk secara berlebihan.
- Batasi lebar konten utama agar teks dan kartu tidak terlalu melebar.

### Tablet

- Kurangi jumlah kolom ketika lebar ruang tidak cukup.
- Pindahkan panel samping ke baris berikutnya atau jadikan drawer bila sesuai.
- Pastikan setiap kontrol memiliki target sentuh yang nyaman.

### Mobile

- Susun kartu dalam satu kolom atau grid dua kolom hanya untuk kartu yang ringkas.
- Ganti kontrol samping permanen dengan tab, drawer, atau bagian yang bisa dilipat.
- Kurangi blur, shadow, dan dekorasi untuk menjaga performa serta keterbacaan.
- Jangan biarkan teks, grafik, tombol, atau panel meluber secara horizontal.
- Hindari mengecilkan desktop dashboard menjadi miniatur yang sulit digunakan.

Contoh breakpoint awal:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.8fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .glass-panel {
    border-radius: 22px;
    -webkit-backdrop-filter: blur(16px) saturate(120%);
    backdrop-filter: blur(16px) saturate(120%);
  }
}
```

## Aksesibilitas dan keterbacaan

- Uji kontras teks terhadap permukaan kaca di area latar yang paling ramai dan paling terang.
- Jangan menaruh teks penting di atas bagian gambar dengan kontras yang tidak stabil.
- Sediakan indikator `:focus-visible` yang jelas untuk pengguna keyboard.
- Gunakan elemen semantik seperti `button`, `nav`, `main`, `section`, dan heading berurutan.
- Berikan label aksesibel untuk ikon tanpa teks serta kontrol seperti slider dan toggle.
- Status aktif/nonaktif tidak boleh hanya dibedakan lewat warna.
- Pastikan ukuran teks isi dan target interaksi nyaman dibaca/ditekan.
- Hormati `prefers-reduced-motion` dan jangan membuat animasi sebagai satu-satunya cara menyampaikan perubahan status.

## Do and Don't

### Lakukan

- Gunakan lapisan blur, tint, border, highlight, dan shadow secara seimbang.
- Pertahankan palet terbatas dengan satu warna aksen utama.
- Gunakan spacing dan radius yang konsisten.
- Buat konten dan interaksi sebagai prioritas, lalu tambahkan ornamen seperlunya.
- Periksa UI dengan latar yang berbeda agar keterbacaan tidak bergantung pada satu gambar saja.

### Hindari

- Panel transparan yang terlalu bening sampai teks sulit dibaca.
- Blur ekstrem pada semua kartu.
- Glow neon, gradient warna-warni, atau shadow hitam pekat secara berlebihan.
- Border putih tebal yang membuat panel tampak seperti plastik.
- Teks kecil berwarna abu-abu di atas latar yang ramai.
- Menyusun semua elemen menggunakan posisi absolut hanya agar mirip screenshot.
- Menambahkan kartu atau grafik dekoratif yang tidak membantu tujuan pengguna.
- Membuat semua permukaan identik tanpa perbedaan kedalaman.

## Alur kerja implementasi

1. **Pahami konten:** catat metrik, perangkat, tindakan utama, dan navigasi yang dibutuhkan.
2. **Bentuk kerangka:** tentukan background, panel utama, grid konten, dan panel samping.
3. **Terapkan token:** gunakan variabel warna, radius, spacing, shadow, dan aksen secara konsisten.
4. **Bangun material kaca:** tambahkan tint, blur, border, highlight, dan shadow secara bertahap.
5. **Atur hierarki:** pastikan judul, metrik, label, kontrol, dan status memiliki prioritas visual yang tepat.
6. **Implementasikan interaksi:** tambahkan state yang nyata untuk kontrol dan navigasi.
7. **Adaptasikan responsif:** atur ulang struktur untuk tablet dan mobile, bukan hanya mengurangi ukuran.
8. **Evaluasi kualitas:** periksa keterbacaan, konsistensi, performa, aksesibilitas, dan overflow.
9. **Rapikan kode:** ekstrak style dan komponen berulang; hapus CSS atau dekorasi yang tidak digunakan.

## Checklist sebelum selesai

- [ ] Efek kaca terlihat melalui tint transparan, backdrop blur, border, highlight, dan shadow yang seimbang.
- [ ] Panel utama lebih menonjol daripada kartu sekunder.
- [ ] Hierarki tipografi dan metrik dapat dipahami sekilas.
- [ ] Warna aksen dipakai secara hemat dan konsisten.
- [ ] Semua teks penting tetap terbaca terhadap background.
- [ ] Tombol, tab, toggle, slider, dan kontrol lain memiliki perilaku yang sesuai.
- [ ] State hover, focus, active, dan disabled ditangani bila relevan.
- [ ] Tampilan tidak overflow pada desktop, tablet, maupun mobile.
- [ ] Ada fallback saat backdrop blur tidak didukung.
- [ ] Motion dikurangi saat `prefers-reduced-motion` aktif.
- [ ] Komponen menggunakan pola dan token yang konsisten.
- [ ] Tidak ada dekorasi yang mengorbankan kegunaan atau performa.

## Prompt ringkas untuk memulai implementasi

> Buat antarmuka web dengan gaya glassmorphism premium yang terinspirasi dashboard smart-home futuristik. Gunakan background gelap bernuansa biru-abu, panel kaca semi-transparan dengan `backdrop-filter`, border putih tipis, highlight lembut, shadow halus, radius lebar, tipografi sans-serif modern, dan aksen biru terang secukupnya. Susun konten dengan hierarki yang jelas, spacing konsisten, dan komponen reusable. Pastikan UI responsif di desktop/tablet/mobile, semua kontrol benar-benar berfungsi, kontras teks terjaga, keyboard focus terlihat, tersedia fallback blur, dan hormati reduced motion. Ikuti struktur serta stack proyek yang sudah ada; jangan menambahkan dekorasi yang mengurangi keterbacaan atau kegunaan.
