# ScanItBroo - Bitunix Multi-Timeframe EMA 21 Confluence Scanner

Web aplikasi Crypto Scanner berbasis **Next.js 14 (App Router)** & **React.js** dengan desain **Glassmorphism Web3 Dark Mode**.

Aplikasi ini secara otomatis memindai seluruh pair **Futures USDT** di bursa **Bitunix**, menghitung **Exponential Moving Average 21 (EMA 21)** pada 3 timeframe sekaligus (**1 Jam, 4 Jam, dan 1 Hari**), dan menyaring koin yang mengalami **Bullish Confluence** (Harga berada di atas EMA 21 di ketiga timeframe tersebut secara simultan).

---

## ✨ Fitur Utama

- **Real-Time Confluence Engine:**
  $$\text{Price} > EMA_{21}^{(1H)} \quad \text{AND} \quad \text{Price} > EMA_{21}^{(4H)} \quad \text{AND} \quad \text{Price} > EMA_{21}^{(1D)}$$
- **Glassmorphism Web3 Dark Mode UI:** Desain futuristik dengan frosted glass blur, glowing confluence badges (`[🟢 1H] [🟢 4H] [🟢 1D]`), dan indikator visual jarak harga ke support EMA.
- **Built-in DNS-over-HTTPS (DoH) Bypass:** Terintegrasi langsung dengan edge DNS Cloudflare/SNI fallback sehingga kebal terhadap pemblokiran domain bursa oleh ISP lokal (*Internet Positif*).
- **Filter Likuiditas Khusus:** Opsi instan untuk menyaring koin tidak likuid (*Illiquid Gems* dengan turnover 24h < \$500K) atau koin likuid tinggi (> \$5M).
- **Background Worker & In-Memory Caching:** Hasil scan di-cache secara otomatis di backend Next.js sehingga halaman web terbuka instan tanpa resiko terkena *rate limit* Bitunix (10 req/s).
- **Direct Trading Link:** Satu klik langsung menuju chart trading pair di Bitunix Futures.

---

## 🚀 Cara Menjalankan

Buka terminal di folder proyek (`D:\ScanItBroo`):

### 1. Menjalankan Mode Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 2. Menjalankan Mode Production
```bash
npm run build
npm start
```

---

## 📁 Struktur Direktori

```
D:\ScanItBroo\
├── src/
│   ├── app/
│   │   ├── api/scan/route.ts      # API Endpoint & Background Scan Worker
│   │   ├── globals.css            # Glassmorphism & Neon Glow Styles
│   │   ├── layout.tsx             # Root Layout & Dark Theme Setup
│   │   └── page.tsx               # Dashboard Utama ScanItBroo
│   ├── components/
│   │   ├── Header.tsx             # Sticky Glass Header, Status & Scan Trigger
│   │   ├── StatsBar.tsx           # Bento Cards (Confluence, Illiquid, Top Gainer)
│   │   ├── FilterControls.tsx     # Search, Confluence Toggle, Volume Filter
│   │   └── CoinCard.tsx           # Kartu Koin Glassmorphism & Indikator EMA
│   ├── lib/
│   │   ├── bitunix.ts             # Bitunix Public API Client + DoH SNI Resolver
│   │   ├── indicators.ts          # Algoritma Matematika EMA 21
│   │   └── scanner.ts             # Multi-Timeframe Confluence Engine & Cache
│   └── types/
│       └── crypto.ts              # TypeScript Definitions
├── tailwind.config.js
├── tsconfig.json
└── package.json
```
