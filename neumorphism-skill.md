---
name: neumorphism-ecommerce-ui
description: Gunakan skill ini setiap kali diminta membuat UI/landing page/dashboard/komponen bergaya "neumorphism / soft UI" (permukaan abu-lavender terang, bayangan timbul & tenggelam, aksen oranye, tipografi Inter bold). Hasil harus identik secara visual dengan referensi "CloudStride Pro" (hero sneaker e-commerce). Jangan pakai gaya lain (flat, glassmorphism, material) kecuali diminta.
---

# Neumorphism Skill — Referensi "CloudStride Pro"

## 0. Aturan Utama (WAJIB)

1. **Satu warna permukaan.** Semua elemen (kartu, tombol, input, navbar) memakai warna yang SAMA dengan latar (`--surface`). Kedalaman dibuat HANYA dengan bayangan ganda (terang kiri-atas + gelap kanan-bawah). Jangan memberi elemen warna latar berbeda kecuali kartu produk (sedikit lebih terang) dan tombol aktif (oranye).
2. **Satu aksen: oranye** (`--accent`). Dipakai hanya untuk: kata sorotan headline, dot aktif, badge keranjang, ukuran terpilih, indikator menu aktif, fokus. Maksimal 1–2 titik oranye per viewport area.
3. **Cahaya datang dari kiri-atas.** Bayangan terang selalu `-x -y`, gelap selalu `+x +y`. Tidak boleh dibalik.
4. **Timbul (raised) = elemen bisa diklik / kontainer. Tenggelam (inset) = state ditekan / area input / lingkaran ikon kecil.**
5. **Sudut sangat membulat.** Kartu besar 36px, tile 28px, tombol pill 999px, kotak kecil 14–20px. Tidak ada sudut tajam.
6. **Tidak ada border tebal, gradien warna, atau drop-shadow hitam.** Satu-satunya border: outline 1px tipis pada navbar dan kotak "Select Size".
7. **Ikon outline** (Lucide / Phosphor Regular), stroke 1.5, warna `--text-strong`. Ikon "play" solid.
8. **Whitespace lapang.** Jarak antar-blok besar; jangan padat.
9. Bahasa konten mengikuti permintaan user; struktur/komposisi tetap sama dengan referensi.

---

## 1. Design Tokens

```css
:root{
  /* Permukaan */
  --backdrop:       #7D8895;   /* latar luar artboard (opsional, hanya untuk presentasi) */
  --surface:        #EEEEF3;   /* SEMUA elemen utama */
  --surface-raised: #F3F3F8;   /* kartu info produk (sedikit lebih terang) */

  /* Bayangan */
  --sd: #C6C6D6;              /* bayangan gelap (lavender, BUKAN hitam) */
  --sl: #FFFFFF;              /* bayangan terang */

  /* Teks */
  --text-strong: #4B4B50;     /* headline, nama produk, label tombol */
  --text:        #3A3A3F;     /* harga, angka besar */
  --muted:       #666676;     /* paragraf, sub-label (kontras ≥ 4.5:1) */
  --muted-2:     #9A9AA8;     /* dot nonaktif, placeholder */

  /* Aksen */
  --accent:      #F26A0F;
  --accent-dark: #D95A05;
  --accent-glow: rgba(242,106,15,.35);

  /* Garis */
  --outline:     rgba(110,110,135,.28);
  --divider:     #D8D8E3;

  /* Shadow recipes */
  --sh-xs: 3px 3px 6px var(--sd), -3px -3px 6px var(--sl);
  --sh-sm: 5px 5px 10px var(--sd), -5px -5px 10px var(--sl);
  --sh-md: 8px 8px 18px var(--sd), -8px -8px 18px var(--sl);
  --sh-lg: 14px 14px 30px var(--sd), -14px -14px 30px var(--sl);
  --in-sm: inset 3px 3px 6px var(--sd), inset -3px -3px 6px var(--sl);
  --in-md: inset 6px 6px 12px var(--sd), inset -6px -6px 12px var(--sl);

  /* Radius */
  --r-card: 36px; --r-tile: 28px; --r-box: 20px; --r-sm: 14px; --r-pill: 999px;

  /* Font */
  --font: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

**Pemakaian shadow:** kartu besar → `--sh-lg`; tombol/tile/search → `--sh-md`; tombol kecil/lingkaran ukuran → `--sh-sm`/`--sh-xs`; ditekan/aktif-tekan → `--in-sm`/`--in-md`.

## 2. Tipografi

Font: **Inter** (Google Fonts: 400, 500, 600, 700, 800). Fallback boleh Poppins untuk strip fitur bawah.

| Elemen | Size | Weight | Line-height | Letter-spacing | Warna |
|---|---|---|---|---|---|
| H1 hero (3 baris) | 64px | 700–800 | 62px (≈0.97) | -0.02em | `--text-strong`; kata terakhir `--accent` |
| Paragraf hero | 14.5px | 400 | 18px | 0 | `--muted` |
| Nav link | 15px | 500 (aktif 600) | – | 0 | `--text-strong` (nonaktif `--muted`) |
| Label tombol ("Shop Now") | 17px | 600 | – | 0 | `--text-strong` |
| "Watch video" | 17px | 500 | – | 0 | `--muted` |
| Label tile fitur | 11.5px | 500 | – | 0 | `--muted` |
| Nama produk | 22px | 700 | 1.1 | -0.01em | `--text` |
| Deskripsi produk | 12px | 400 | 1.3 | 0 | `--muted` |
| Harga | 28px | 700 | 1 | -0.01em | `--text` |
| "Select Size" | 12px | 500 | – | 0 | `--text-strong` |
| Angka ukuran | 14px | 600 | – | 0 | `--text-strong` (aktif putih) |
| Counter "01" / "/05" | 28px 600 / 15px 400 | – | – | – | `--text` / `--muted` |
| Strip judul / sub | 14px 600 / 11.5px 400 | – | – | – | `--text-strong` / `--muted` |

Headline wajib 3 baris: **"Step into" / "comfort" / "Everyday."** dengan titik oranye ikut berwarna oranye.

## 3. Layout (desktop 1280 × 800, skala referensi ×1.4)

```
┌ Artboard (bg --surface, padding 20px, radius 0; di dalam backdrop abu-biru) ──────────────┐
│ NAVBAR  (tinggi 88px, radius 30px, outline 1px, margin 0 0 40px)                          │
│ ┌ HERO GRID: 2 kolom `5fr 6fr`, gap 48px, align-items: start ────────────────────────┐   │
│ │ KIRI                              │ KANAN                                           │   │
│ │  H1 (3 baris)                     │  Hero Card 613×444 (radius 36, --sh-lg)         │   │
│ │  paragraf (3 baris, max 290px)    │     dot paginasi vertikal (kiri-atas)           │   │
│ │  [Shop Now ➜]   Watch video ▶     │     counter 01/05 (kanan-atas)                  │   │
│ │  (gap 40px)                       │     burst putih + sepatu                        │   │
│ │  4 tile fitur (100×118, gap 21)   │     info produk (kiri-bawah) + size box (kanan) │   │
│ │                                   │  Strip fitur pill 613×87 (margin-top 32px)      │   │
│ └─────────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

- Padding horizontal konten kiri sejajar dengan sisi dalam navbar + 20px (kira-kira 70px dari tepi artboard).
- Kolom kiri: blok teks di atas, tile fitur **terdorong ke bawah** (sejajar dengan bawah hero card/awal strip) — gunakan `display:flex; flex-direction:column; justify-content:space-between` pada kolom kiri, tinggi = tinggi kolom kanan.
- Kolom kanan: hero card lalu strip fitur di bawahnya, lebar sama.

## 4. Spesifikasi Komponen

### 4.1 Navbar
- Kontainer: tinggi 88px, `border:1px solid var(--outline)`, `border-radius:30px`, background `--surface`, tanpa shadow luar. Padding 0 22px. `display:grid; grid-template-columns:auto 1fr auto auto; align-items:center`.
- **Logo button:** 48×48, radius 14, `--sh-sm`, berisi ikon logo (panah konvergen, lihat §6) 24px.
- **Menu:** Home, Shop, Collections, About; gap 40px; posisi mulai sejajar kira-kira 150px dari logo. Menu aktif (Home): bold + dot oranye 5px di bawah teks (jarak 8px, tengah).
- **Search:** pill 255×50, `--sh-md`, ikon search kiri (20px), placeholder "Search…" `--muted`, input transparan tanpa border. Diletakkan di tengah-kanan navbar.
- **My Account:** ikon user solid-gelap 22px + teks 15px, gap 10px. Tanpa kotak.
- **Cart:** 56×56, radius 16, `--sh-md`, ikon shopping-bag solid gelap (fill `--text-strong`) 24px, **badge oranye 10px** di pojok kanan-atas (offset -2px) dengan ring 2px `--surface`.

### 4.2 Hero Teks
- H1 sesuai §2. Margin-bottom 24px.
- Paragraf teks tepat: *"Discover sneakers designed for movement, made for you. Lightweight. Durable. Timeless."* `max-width:290px`.
- **CTA Primary "Shop Now":** pill 190×55, `--sh-md`, padding kiri 28px; di kanan lingkaran 48px (`--sh-xs` + ring `inset 0 0 0 1px var(--outline)`) berisi ikon arrow-right 20px.
- **CTA Sekunder "Watch video":** tanpa kotak, teks `--muted`, di kanan lingkaran 50px raised (`--sh-sm`) berisi ikon play solid `--text-strong` 18px. Gap antar CTA 40px.
- Hover CTA: translateY(-1px) + `--sh-lg`. Active: `--in-md`, tanpa translate.

### 4.3 Tile Fitur (4 buah)
- 100×118, radius 28, `--sh-md`, flex-column center, gap 12px.
- Ikon 30px stroke 1.5 `--text-strong`, label 11.5px `--muted`.
- Urutan & ikon: **Lightweight** (leaf), **Durable** (shield), **Breathable** (cloud), **Easy Returns** (package/box). Gap antar tile 21px.

### 4.4 Hero Card (produk)
- 613×444, radius 36, `--sh-lg`, `position:relative`, overflow visible, background `--surface`.
- **Dot paginasi:** vertikal di kiri-atas (left 28px, top 28px), 4 dot 9px, gap 14px. Dot 1 `--accent`, lainnya `--muted-2` opacity .6. (5 slide = counter "/05"; boleh 5 dot, referensi menampilkan 4–5.)
- **Counter:** kotak 60×84 di kanan-atas (top 14px, right 14px), radius 20, `--sh-sm`; "01" 28px/600 dan "/05" 15px di bawahnya, rata tengah.
- **Burst putih:** SVG 3 batang tebal bersilang (asterisk 6 lengan), warna `#FFFFFF`, tebal batang ≈ 38px, ujung membulat, panjang ≈ 300px, diputar ≈ -15°, diletakkan di tengah area atas kartu (di belakang sepatu). Opacity 1. Tidak ada shadow.
- **Sepatu:** PNG transparan sneaker putih/krem tampak samping ¾, ujung (toe) ke kiri-bawah, tumit kanan-atas, rotasi sekitar -8°…-12°, lebar ≈ 330px, tengah-atas kartu (top ≈ 0px, menimpa sedikit tepi atas kartu boleh). Tambah `filter: drop-shadow(0 26px 22px rgba(120,120,150,.35))` agar tampak melayang.
- **Info produk (kiri-bawah):** kotak 353×105 pada left 17px, bottom 24px, radius 16, background `--surface-raised`, `--sh-md`, padding 20px 22px. Kiri: nama "CloudStride Pro" 22px/700 di atas, "Minimal design. / Maximum comfort." 12px (2 baris) di bawahnya. Kanan: harga "300.00€" 28px/700, rata kanan-bawah (baseline dengan deskripsi).
- **Size box (kanan-bawah):** 204×143, radius 20, `border:1px solid var(--outline)`, tanpa shadow luar, right 14px, bottom 24px, padding 14px 16px. Isi: "Select Size" (12px/500); baris 4 lingkaran 36px (7, 8, 9, 10) gap 8px, `--sh-sm`; lalu **Add to Cart** pill 175×44 (`--sh-md`) dengan teks 13px/600 kiri dan ikon shopping-bag kanan.
  - **Ukuran terpilih (8):** background `--accent`, teks putih, `box-shadow: 0 6px 14px var(--accent-glow)`, tanpa shadow neumorphic.
  - Hover ukuran: `--sh-md`. Pressed: `--in-sm`.

### 4.5 Strip Fitur (bawah)
- Pill 613×87 (radius 999), `--sh-md`, `display:grid; grid-template-columns:repeat(3,1fr)`, margin-top 32px.
- Setiap segmen: padding 0 24px, flex gap 14px, align center. Pemisah vertikal 1px `--divider` tinggi 60% antar segmen (bukan di tepi).
- Ikon: lingkaran 40px `--in-sm` (tenggelam), ikon 20px `--text-strong`.
- Isi: **Free Shipping / On all orders** (truck), **30 Days Return / No questions asked** (refresh-cw), **4.9 Rating / From our customers** (star). Judul 14px/600, sub 11.5px `--muted`.

## 5. Interaksi & State

| State | Perilaku |
|---|---|
| Hover tombol/tile | `transform:translateY(-2px)`, shadow naik satu level, transisi `.2s ease` |
| Active/pressed | `box-shadow: var(--in-md)`, `transform:none` |
| Fokus keyboard | `outline:2px solid var(--accent); outline-offset:3px` (jangan dihilangkan) |
| Ukuran terpilih | Toggle via `aria-pressed`; hanya satu aktif |
| Slide produk | Klik dot / swipe → ganti nama, harga, foto, counter "0N/05" dengan fade 250ms |
| Transisi umum | `transition: box-shadow .2s, transform .2s, background .2s` |

Gerak halus saja. Hormati `prefers-reduced-motion: reduce` (matikan transform/animasi).

## 6. Aset & Ikon

- **Ikon:** Lucide (`lucide.dev`) — `search, user, shopping-bag, arrow-right, play, leaf, shield, cloud, package, truck, refresh-cw, star`. Stroke 1.5, `stroke-linecap:round`, `stroke-linejoin:round`.
- **Logo (panah konvergen):** dua kelompok garis pendek dari kiri & kanan mengarah ke tengah (bentuk `›|‹`, 3 garis per sisi, tebal 2px, ujung membulat).
- **Burst:** `<svg viewBox="0 0 300 300">` 3 `<line>` putih stroke-width 38, `stroke-linecap:round`, rotasi 0°/60°/120° melewati titik (150,150), lalu dirotasi -15° keseluruhan.
- **Foto sepatu:** wajib PNG/WebP transparan, sneaker knit putih krem (monokrom, tanpa logo merek nyata). Bila tidak ada aset, gunakan `image_search`/placeholder `https://placehold.co/380x260/EEEEF3/9A9AA8?text=Sneaker` dan tandai agar user mengganti. Jangan menggambar sepatu asal-asalan dengan SVG sederhana.

## 7. Responsif

- **≥1100px:** layout penuh seperti §3.
- **768–1099px:** grid jadi 1 kolom; hero card tampil di bawah teks; tile fitur 4 kolom; strip tetap 3 kolom.
- **<768px:** navbar → logo + search ikon + cart (menu jadi hamburger raised); H1 40px/40px; tile 2×2; size box dan info produk menumpuk vertikal di dalam kartu; strip fitur 1 kolom (divider horizontal).
- Skala shadow turun satu level di mobile (`--sh-md`→`--sh-sm`) agar tidak terlalu berat.

## 8. Aksesibilitas (neumorphism berisiko kontras rendah)

- Teks penting minimal 4.5:1 (`--muted` #666676 di atas `--surface` ≈ 4.9:1). Jangan pakai `--muted-2` untuk teks bermakna.
- Putih di atas oranye hanya untuk teks tebal ≥14px/600.
- Setiap elemen interaktif memakai `<button>`/`<a>` asli, `aria-label` untuk tombol ikon, `aria-pressed` pada pilihan ukuran, `aria-current="page"` pada menu aktif.
- Fokus harus selalu terlihat (outline oranye).

## 9. Template Referensi Lengkap (salin & sesuaikan konten)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CloudStride</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --backdrop:#7D8895; --surface:#EEEEF3; --surface-raised:#F3F3F8;
  --sd:#C6C6D6; --sl:#FFFFFF;
  --text-strong:#4B4B50; --text:#3A3A3F; --muted:#666676; --muted-2:#9A9AA8;
  --accent:#F26A0F; --accent-glow:rgba(242,106,15,.35);
  --outline:rgba(110,110,135,.28); --divider:#D8D8E3;
  --sh-xs:3px 3px 6px var(--sd),-3px -3px 6px var(--sl);
  --sh-sm:5px 5px 10px var(--sd),-5px -5px 10px var(--sl);
  --sh-md:8px 8px 18px var(--sd),-8px -8px 18px var(--sl);
  --sh-lg:14px 14px 30px var(--sd),-14px -14px 30px var(--sl);
  --in-sm:inset 3px 3px 6px var(--sd),inset -3px -3px 6px var(--sl);
  --in-md:inset 6px 6px 12px var(--sd),inset -6px -6px 12px var(--sl);
  --font:"Inter",system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0}
body{font-family:var(--font);background:var(--backdrop);min-height:100vh;display:grid;place-items:center;padding:40px 20px;color:var(--text-strong)}
button{font:inherit;color:inherit;border:0;background:var(--surface);cursor:pointer;transition:box-shadow .2s,transform .2s,background .2s}
button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.ico{width:1em;height:1em;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.ico.solid{fill:currentColor;stroke:none}

.artboard{width:min(1220px,100%);background:var(--surface);padding:20px 20px 36px}

/* NAV */
.nav{height:88px;border:1px solid var(--outline);border-radius:30px;padding:0 22px;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:28px;margin-bottom:44px}
.logo{width:48px;height:48px;border-radius:14px;box-shadow:var(--sh-sm);display:grid;place-items:center;font-size:24px}
.menu{display:flex;gap:40px;margin-left:100px;list-style:none;padding:0}
.menu a{position:relative;text-decoration:none;font-size:15px;font-weight:500;color:var(--muted)}
.menu a[aria-current]{color:var(--text-strong);font-weight:600}
.menu a[aria-current]::after{content:"";position:absolute;left:50%;bottom:-12px;width:5px;height:5px;border-radius:50%;background:var(--accent);transform:translateX(-50%)}
.search{width:255px;height:50px;border-radius:999px;box-shadow:var(--sh-md);display:flex;align-items:center;gap:10px;padding:0 20px;font-size:20px}
.search input{border:0;background:transparent;font:500 15px var(--font);color:var(--text-strong);width:100%}
.search input::placeholder{color:var(--muted)}
.account{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:500;background:none;box-shadow:none}
.account .ico{font-size:22px}
.cart{position:relative;width:56px;height:56px;border-radius:16px;box-shadow:var(--sh-md);display:grid;place-items:center;font-size:24px}
.cart .ico{fill:var(--text-strong)}
.cart i{position:absolute;top:-2px;right:-2px;width:11px;height:11px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 2px var(--surface)}

/* HERO */
.hero{display:grid;grid-template-columns:5fr 6fr;gap:48px;padding:0 20px}
.left{display:flex;flex-direction:column;justify-content:space-between;gap:48px}
h1{font-size:64px;line-height:62px;font-weight:800;letter-spacing:-.02em;color:var(--text-strong);margin-bottom:26px}
h1 em{font-style:normal;color:var(--accent)}
.lead{max-width:290px;font-size:14.5px;line-height:18px;color:var(--muted);margin-bottom:34px}
.cta{display:flex;align-items:center;gap:40px}
.btn-primary{height:55px;border-radius:999px;box-shadow:var(--sh-md);display:flex;align-items:center;gap:22px;padding:0 4px 0 28px;font-size:17px;font-weight:600}
.btn-primary .circ{width:48px;height:48px;border-radius:50%;box-shadow:var(--sh-xs),inset 0 0 0 1px var(--outline);display:grid;place-items:center;font-size:20px}
.btn-video{display:flex;align-items:center;gap:14px;background:none;font-size:17px;font-weight:500;color:var(--muted)}
.btn-video .circ{width:50px;height:50px;border-radius:50%;box-shadow:var(--sh-sm);display:grid;place-items:center;font-size:18px;color:var(--text-strong)}
.btn-primary:hover,.btn-video:hover .circ,.tile:hover,.size:hover,.add:hover,.cart:hover,.logo:hover{transform:translateY(-2px);box-shadow:var(--sh-lg)}
.btn-primary:active,.add:active,.size:active,.tile:active{transform:none;box-shadow:var(--in-md)}
.tiles{display:flex;gap:21px}
.tile{width:100px;height:118px;border-radius:28px;box-shadow:var(--sh-md);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-size:30px}
.tile span{font-size:11.5px;font-weight:500;color:var(--muted)}

/* PRODUCT CARD */
.card{position:relative;height:444px;border-radius:36px;background:var(--surface);box-shadow:var(--sh-lg)}
.dots{position:absolute;left:28px;top:28px;display:grid;gap:14px}
.dots button{width:9px;height:9px;border-radius:50%;background:var(--muted-2);opacity:.6;padding:0}
.dots button[aria-current]{background:var(--accent);opacity:1}
.counter{position:absolute;top:14px;right:14px;width:60px;height:84px;border-radius:20px;box-shadow:var(--sh-sm);display:grid;place-content:center;text-align:center;line-height:1.1}
.counter b{font-size:28px;font-weight:600;color:var(--text)}
.counter small{font-size:15px;color:var(--muted)}
.burst{position:absolute;left:50%;top:28px;width:300px;height:300px;transform:translateX(-46%) rotate(-15deg)}
.shoe{position:absolute;left:50%;top:10px;width:340px;transform:translateX(-52%) rotate(-9deg);filter:drop-shadow(0 26px 22px rgba(120,120,150,.35))}
.info{position:absolute;left:17px;bottom:24px;width:353px;height:105px;border-radius:16px;background:var(--surface-raised);box-shadow:var(--sh-md);padding:20px 22px;display:flex;justify-content:space-between;align-items:flex-end}
.info h2{font-size:22px;font-weight:700;color:var(--text);letter-spacing:-.01em}
.info p{font-size:12px;line-height:1.3;color:var(--muted);margin-top:8px}
.price{font-size:28px;font-weight:700;color:var(--text);letter-spacing:-.01em}
.sizebox{position:absolute;right:14px;bottom:24px;width:204px;height:143px;border:1px solid var(--outline);border-radius:20px;padding:14px 16px}
.sizebox small{display:block;font-size:12px;font-weight:500;margin-bottom:10px}
.sizes{display:flex;gap:8px;margin-bottom:12px}
.size{width:36px;height:36px;border-radius:50%;box-shadow:var(--sh-sm);font-size:14px;font-weight:600}
.size[aria-pressed="true"]{background:var(--accent);color:#fff;box-shadow:0 6px 14px var(--accent-glow)}
.add{width:100%;height:44px;border-radius:999px;box-shadow:var(--sh-md);display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:13px;font-weight:600}
.add .ico{font-size:18px}

/* STRIP */
.strip{margin-top:32px;height:87px;border-radius:999px;box-shadow:var(--sh-md);display:grid;grid-template-columns:repeat(3,1fr)}
.strip div{display:flex;align-items:center;gap:14px;padding:0 22px;position:relative}
.strip div+div::before{content:"";position:absolute;left:0;top:20%;height:60%;width:1px;background:var(--divider)}
.strip .ic{width:40px;height:40px;border-radius:50%;box-shadow:var(--in-sm);display:grid;place-items:center;font-size:20px;flex:none}
.strip b{display:block;font-size:14px;font-weight:600}
.strip small{font-size:11.5px;color:var(--muted)}

/* RESPONSIVE */
@media (max-width:1099px){.hero{grid-template-columns:1fr}.menu{margin-left:20px;gap:24px}}
@media (max-width:767px){
  .nav{grid-template-columns:auto 1fr auto;height:auto;padding:14px;gap:12px;border-radius:24px}
  .menu,.account span,.search input{display:none}.search{width:50px;padding:0;justify-content:center}
  h1{font-size:40px;line-height:40px}.tiles{flex-wrap:wrap}.tile{width:calc(50% - 11px)}
  .card{height:auto;padding:20px;display:grid;gap:16px}.card>*{position:static!important}
  .shoe{width:100%;transform:none}.burst{display:none}.info,.sizebox{width:auto}
  .strip{grid-template-columns:1fr;height:auto;border-radius:36px;padding:8px 0}
  .strip div{padding:14px 22px}.strip div+div::before{left:10%;top:0;height:1px;width:80%}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
  <symbol id="i-bag" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M6 3 20 12 6 21Z"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></symbol>
  <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></symbol>
  <symbol id="i-box" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/></symbol>
  <symbol id="i-truck" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></symbol>
</svg>

<main class="artboard">
  <nav class="nav" aria-label="Main">
    <button class="logo" aria-label="CloudStride home">
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#4B4B50" stroke-width="2" stroke-linecap="round"><path d="M3 6l5 3M3 12h6M3 18l5-3"/><path d="M21 6l-5 3M21 12h-6M21 18l-5-3"/></svg>
    </button>
    <ul class="menu">
      <li><a href="#" aria-current="page">Home</a></li>
      <li><a href="#">Shop</a></li>
      <li><a href="#">Collections</a></li>
      <li><a href="#">About</a></li>
    </ul>
    <label class="search"><svg class="ico"><use href="#i-search"/></svg><input type="search" placeholder="Search…" aria-label="Search"></label>
    <div style="display:flex;align-items:center;gap:28px">
      <button class="account"><svg class="ico solid"><use href="#i-user"/></svg><span>My Account</span></button>
      <button class="cart" aria-label="Cart"><svg class="ico"><use href="#i-bag"/></svg><i></i></button>
    </div>
  </nav>

  <section class="hero">
    <div class="left">
      <div>
        <h1>Step into<br>comfort<br><em>Everyday.</em></h1>
        <p class="lead">Discover sneakers designed for movement, made for you. Lightweight. Durable. Timeless.</p>
        <div class="cta">
          <button class="btn-primary">Shop Now <span class="circ"><svg class="ico"><use href="#i-arrow"/></svg></span></button>
          <button class="btn-video" style="box-shadow:none">Watch video <span class="circ"><svg class="ico solid"><use href="#i-play"/></svg></span></button>
        </div>
      </div>
      <div class="tiles">
        <button class="tile"><svg class="ico"><use href="#i-leaf"/></svg><span>Lightweight</span></button>
        <button class="tile"><svg class="ico"><use href="#i-shield"/></svg><span>Durable</span></button>
        <button class="tile"><svg class="ico"><use href="#i-cloud"/></svg><span>Breathable</span></button>
        <button class="tile"><svg class="ico"><use href="#i-box"/></svg><span>Easy Returns</span></button>
      </div>
    </div>

    <div>
      <article class="card">
        <div class="dots"><button aria-current="true" aria-label="Slide 1"></button><button aria-label="Slide 2"></button><button aria-label="Slide 3"></button><button aria-label="Slide 4"></button></div>
        <div class="counter"><b>01</b><small>/05</small></div>
        <svg class="burst" viewBox="0 0 300 300" aria-hidden="true" stroke="#fff" stroke-width="38" stroke-linecap="round">
          <line x1="150" y1="10" x2="150" y2="290"/><line x1="29" y1="80" x2="271" y2="220"/><line x1="29" y1="220" x2="271" y2="80"/>
        </svg>
        <img class="shoe" src="shoe.png" alt="CloudStride Pro sneaker">
        <div class="info">
          <div><h2>CloudStride Pro</h2><p>Minimal design.<br>Maximum comfort.</p></div>
          <div class="price">300.00€</div>
        </div>
        <div class="sizebox">
          <small>Select Size</small>
          <div class="sizes" role="group" aria-label="Size">
            <button class="size" aria-pressed="false">7</button>
            <button class="size" aria-pressed="true">8</button>
            <button class="size" aria-pressed="false">9</button>
            <button class="size" aria-pressed="false">10</button>
          </div>
          <button class="add">Add to Cart <svg class="ico"><use href="#i-bag"/></svg></button>
        </div>
      </article>

      <div class="strip">
        <div><span class="ic"><svg class="ico"><use href="#i-truck"/></svg></span><span><b>Free Shipping</b><small>On all orders</small></span></div>
        <div><span class="ic"><svg class="ico"><use href="#i-refresh"/></svg></span><span><b>30 Days Return</b><small>No questions asked</small></span></div>
        <div><span class="ic"><svg class="ico"><use href="#i-star"/></svg></span><span><b>4.9 Rating</b><small>From our customers</small></span></div>
      </div>
    </div>
  </section>
</main>

<script>
document.querySelectorAll('.size').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.size').forEach(x=>x.setAttribute('aria-pressed',x===b));
}));
</script>
</body>
</html>
```

## 10. Adaptasi ke Halaman/Komponen Lain

Bila diminta halaman lain (dashboard, login, profil, checkout, dll.), pertahankan semua token §1–2 dan pola berikut:

| Kebutuhan | Pola neumorphism |
|---|---|
| Kartu / panel | `--surface`, radius 28–36, `--sh-lg` |
| Tombol utama | pill raised `--sh-md` + lingkaran ikon raised di kanan |
| CTA terpenting (sekali per layar) | pill oranye solid, teks putih, glow `--accent-glow` |
| Input teks | pill/kotak **inset** `--in-sm`, tinggi 50px, fokus → ring oranye 2px |
| Toggle / switch | track inset, knob raised `--sh-xs`, aktif → knob oranye |
| Checkbox / radio | lingkaran 22px inset; terpilih → titik oranye |
| Tab / segmented | wadah inset; tab aktif raised |
| Tabel/list | baris tanpa border, pemisah 1px `--divider`, ikon dalam lingkaran inset |
| Badge/notifikasi | titik oranye 10px dengan ring `--surface` 2px |
| Modal | kartu `--sh-lg`, overlay `rgba(125,136,149,.55)` + blur 4px |

## 11. Larangan (Anti-Pattern)

- ❌ Warna latar berbeda antar-kartu (selain `--surface-raised` & oranye aktif).
- ❌ Bayangan hitam/abu netral murni (`rgba(0,0,0,…)`) — gunakan `--sd` lavender.
- ❌ Gradien, glassmorphism, blur latar pada elemen UI utama.
- ❌ Border tebal, outline selain navbar & size box.
- ❌ Lebih dari satu warna aksen; hijau/biru/merah tidak dipakai (error → teks `#D9480F` + ikon, bukan blok warna).
- ❌ Sudut < 14px pada elemen interaktif.
- ❌ Font selain Inter (kecuali fallback), teks all-caps berlebihan, heading tipis (<600).
- ❌ Shadow terlalu pekat/menyatu: jangan menaikkan offset > 14px atau blur > 30px.
- ❌ Menghilangkan fokus keyboard.

## 12. Checklist Verifikasi Sebelum Menyerahkan Hasil

- [ ] Permukaan seragam `#EEEEF3`; hanya info card yang `#F3F3F8`.
- [ ] Bayangan terang kiri-atas, gelap kanan-bawah di SEMUA elemen raised.
- [ ] Headline 3 baris, baris terakhir + titik berwarna oranye.
- [ ] Navbar: logo raised, menu + dot oranye di aktif, search pill, My Account, cart + badge oranye.
- [ ] CTA "Shop Now" (pill + lingkaran panah) dan "Watch video" (lingkaran play).
- [ ] 4 tile fitur kiri-bawah, sejajar dengan bagian bawah kolom kanan.
- [ ] Hero card: dot vertikal, counter 01/05, burst putih, sepatu melayang, info produk, size box (8 aktif oranye), Add to Cart.
- [ ] Strip fitur pill 3 segmen dengan pemisah vertikal & ikon dalam lingkaran inset.
- [ ] Hover/active/focus state berfungsi; responsif ≤1099px dan ≤767px tidak overflow horizontal.
- [ ] Kontras teks ≥ 4.5:1, semua tombol ikon punya `aria-label`.
- [ ] Bandingkan screenshot hasil dengan referensi; selisih proporsi/spacing > 8px harus diperbaiki.
