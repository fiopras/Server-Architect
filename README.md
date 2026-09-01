# 🤖 Server Architect - Discord Bot (Serverless + Gemini AI)

Bot Discord resmi untuk server **"The Boomers"** yang menggunakan arsitektur **Serverless Interactions API** siap deploy ke **Vercel** dan terintegrasi dengan **Google Generative AI (Gemini 3.7 Flash)**.

---

## 🌟 Fitur Utama

1. **⚡ Serverless / Interactions API (Vercel Ready)**:
   - Tidak memerlukan server 24/7 (Zero cost scale-to-zero).
   - Validasi keamanan tanda tangan Discord Ed25519 (`DISCORD_PUBLIC_KEY`).
   - Penanganan Deferred Reply (`Type 5`) untuk mencegah timeout 3 detik Discord.

2. **🏛️ Server Architect Slash Command (`/setup-server`)**:
   - Otomatis membuat struktur kategori dan channel lengkap untuk **The Boomers**:
     - 📌 **INFORMATION**: `📢・announcements`, `📜・rules`, `👋・welcome`
     - 💬 **GENERAL CHAT**: `💭・chat-santai`, `🤖・bot-commands`, `📷・media-memes`
     - 🎮 **GAMING ZONE**: `🎮・gaming-chat`, `🧱・loblox-chat`, `🔊・Duo 1` (limit 2), `🔊・Squad Room` (limit 5), `🔊・Loblox Room`
     - 🎙️ **VOICE LOUNGE**: `☕・Chill Lounge`, `🎵・Music Room`, `💤・AFK Room`

3. **🧠 AI Chatbot Powered by Google Gemini (`/ask <prompt>`)**:
   - Menjawab pertanyaan, brainstorming ide server, tips game, coding, dan obrolan santai.
   - Menggunakan model `gemini-3.7-flash` melalui `@google/genai` SDK.
   - Format markdown Discord rapi & pemotongan otomatis di bawah 2000 karakter.

4. **👑 Role Hierarchy Generator (`/setup-roles`)**:
   - Membuat hierarki role resmi: 👑 Server Architect, 🛡️ Administrator, ⚔️ Moderator, 🌟 VIP Boomer, 🎮 Gamer, 🤖 Bots, 👥 Member.

5. **🤖 Rekomendasi Bot Pendukung (`/bot-guide`)**:
   - Panduan & 1-Click invite untuk bot pelengkap (Jockie Music/FredBoat, Ticket Tool, Carl-bot).

---

## 🔑 Environment Variables

Tambahkan variabel ini di Vercel Project Settings (`Settings` -> `Environment Variables`):

| Variable | Deskripsi | Diperoleh dari |
|---|---|---|
| `GEMINI_API_KEY` | API Key Google Gemini | Google AI Studio |
| `DISCORD_TOKEN` | Bot Token Discord | Discord Dev Portal -> Bot -> Reset Token |
| `DISCORD_PUBLIC_KEY` | Public Key Ed25519 | Discord Dev Portal -> General Information |
| `DISCORD_APPLICATION_ID` | Application ID | Discord Dev Portal -> General Information |
| `GUILD_ID` | Server ID "The Boomers" | Klik kanan nama server di Discord -> Copy Server ID |

---

## 🚀 Panduan Registrasi Slash Commands

### Cara 1: Jalankan CLI Script
```bash
# Pastikan .env sudah terisi
npm run register
```

### Cara 2: Melalui Web Dashboard
Buka dashboard Server Architect dan klik tombol **"⚡ Register Slash Commands"** pada tab Slash Commands.

---

## 🌐 Panduan Deployment ke Vercel

### Langkah 1: Push ke GitHub & Import ke Vercel
1. Hubungkan repository ke [Vercel Dashboard](https://vercel.com).
2. Tambahkan semua Environment Variables di atas pada saat setup project.
3. Klik **Deploy**.

### Langkah 2: Setting Interactions Endpoint URL di Discord
1. Buka [Discord Developer Portal](https://discord.com/developers/applications).
2. Pilih aplikasi bot Anda -> Masuk ke menu **General Information**.
3. Di bagian **Interactions Endpoint URL**, masukkan:
   ```
   https://<nama-project-vercel-anda>.vercel.app/api/interactions
   ```
4. Klik **Save Changes**. Discord akan memvalidasi endpoint Anda dengan mengirimkan request PING (Type 1).

---

## 📋 Struktur Folder Project

```
├── api/
│   ├── interactions.ts      # Vercel Serverless Webhook Handler (Discord Interaction Endpoint)
│   └── register.ts          # API Route untuk registrasi Slash Commands
├── scripts/
│   ├── register-commands.ts # CLI Script registrasi command ke Discord REST API
│   └── setup-server-direct.ts # CLI Script direct server builder
├── src/
│   ├── components/          # UI Components & Control Center
│   ├── data/                # Blueprint channel, roles, bot guides
│   ├── services/            # Discord API & Gemini AI services
│   ├── App.tsx              # Main Dashboard Application
│   └── types/               # TypeScript Definitions
├── vercel.json              # Konfigurasi deployment Vercel
└── server.ts                # Full-stack dev server & API proxy
```
