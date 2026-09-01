import { DiscordCategoryTemplate, DiscordRoleTemplate, BotGuideItem, SlashCommandDefinition } from '../types/discord';

export const BOOMERS_SERVER_TEMPLATE: DiscordCategoryTemplate[] = [
  {
    name: '📌 ━ INFORMATION',
    channels: [
      {
        name: '📢・announcements',
        type: 5, // GUILD_ANNOUNCEMENT (or 0 for text if community not enabled)
        topic: 'Pengumuman resmi dan update penting server The Boomers.',
        readOnly: true,
      },
      {
        name: '📜・rules',
        type: 0, // GUILD_TEXT
        topic: 'Peraturan dan norma komunitas server The Boomers. Wajib dibaca!',
        readOnly: true,
      },
      {
        name: '👋・welcome',
        type: 0, // GUILD_TEXT
        topic: 'Selamat datang para member baru di The Boomers! Sapa teman-temanmu di sini.',
      },
    ],
  },
  {
    name: '💬 ━ GENERAL CHAT',
    channels: [
      {
        name: '💭・chat-santai',
        type: 0,
        topic: 'Ruang ngobrol santai, diskusi bebas, dan sharing harian.',
      },
      {
        name: '🤖・bot-commands',
        type: 0,
        topic: 'Ketik command bot musik, AI (/ask), games, dan utility di sini.',
      },
      {
        name: '📷・media-memes',
        type: 0,
        topic: 'Bagikan foto, video lucu, meme, karya, atau setup kamu!',
      },
    ],
  },
  {
    name: '🎮 ━ GAMING ZONE',
    channels: [
      {
        name: '🎮・gaming-chat',
        type: 0,
        topic: 'Diskusi game, mabar, jadwal push rank, dan info game terbaru.',
      },
      {
        name: '🧱・loblox-chat',
        type: 0,
        topic: 'Khusus ngobrol seputar Roblox / Loblox, link private server, & trade!',
      },
      {
        name: '🔊・Duo 1',
        type: 2, // GUILD_VOICE
        user_limit: 2,
      },
      {
        name: '🔊・Squad Room',
        type: 2, // GUILD_VOICE
        user_limit: 5,
      },
      {
        name: '🔊・Loblox Room',
        type: 2, // GUILD_VOICE
        user_limit: 10,
      },
    ],
  },
  {
    name: '🎙️ ━ VOICE LOUNGE',
    channels: [
      {
        name: '☕・Chill Lounge',
        type: 2, // GUILD_VOICE
        user_limit: 0, // unlimited
      },
      {
        name: '🎵・Music Room',
        type: 2, // GUILD_VOICE
        user_limit: 0,
      },
      {
        name: '💤・AFK Room',
        type: 2, // GUILD_VOICE
        user_limit: 0,
      },
    ],
  },
];

export const BOOMERS_ROLES_TEMPLATE: DiscordRoleTemplate[] = [
  {
    name: '👑 ━ Server Architect',
    color: 0xffd700, // Gold
    hoist: true,
    mentionable: true,
    permissions: '8', // Administrator
    description: 'Pemilik & arsitek utama server The Boomers dengan akses penuh.',
  },
  {
    name: '🛡️ ━ Administrator',
    color: 0xe74c3c, // Red
    hoist: true,
    mentionable: true,
    permissions: '8', // Administrator
    description: 'Pengelola server & konfigurasi teknis.',
  },
  {
    name: '⚔️ ━ Moderator',
    color: 0x3498db, // Blue
    hoist: true,
    mentionable: true,
    permissions: '268435456', // Manage Messages, Kick, Ban, Mute, Deafen
    description: 'Penjaga ketertiban chat dan voice channel.',
  },
  {
    name: '🌟 ━ VIP Boomer',
    color: 0xf1c40f, // Yellow
    hoist: true,
    mentionable: false,
    permissions: '0',
    description: 'Member spesial dan donatur server The Boomers.',
  },
  {
    name: '🎮 ━ Gamer',
    color: 0x9b59b6, // Purple
    hoist: true,
    mentionable: false,
    permissions: '0',
    description: 'Pemain aktif game & party mabar.',
  },
  {
    name: '🤖 ━ Bots',
    color: 0x607d8b, // Blue Gray
    hoist: true,
    mentionable: false,
    permissions: '0',
    description: 'Bot utilitas, musik, dan AI pendukung.',
  },
  {
    name: '👥 ━ Member',
    color: 0x2ecc71, // Green
    hoist: true,
    mentionable: false,
    permissions: '0',
    description: 'Warga resmi komunitas The Boomers.',
  },
];

export const BOT_GUIDES: BotGuideItem[] = [
  {
    name: 'Jockie Music / FredBoat',
    tagline: 'Bot Musik Kualitas Tinggi untuk Voice Channel',
    purpose: 'Memutar musik dari YouTube, Spotify, Soundcloud di channel 🎵・Music Room.',
    inviteUrl: 'https://top.gg/bot/jockiemusic',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80',
    features: ['High bitrate audio', '24/7 Voice support', 'Playlist loader', 'Soundcloud & Spotify support'],
    recommendedChannel: '🤖・bot-commands',
    setupCommands: ['m!play <lagu>', 'm!skip', 'm!queue', 'm!disconnect'],
  },
  {
    name: 'Ticket Tool',
    tagline: 'Sistem Tiket Support & Laporan Member',
    purpose: 'Membuat channel privat otomatis ketika member butuh bantuan admin.',
    inviteUrl: 'https://tickettool.xyz',
    avatarUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=100&auto=format&fit=crop&q=80',
    features: ['Reaction / Button Ticket', 'Transcript logger', 'Role permission sync', 'Auto close'],
    recommendedChannel: '📌・information',
    setupCommands: ['$setup', '$close', '$transcript'],
  },
  {
    name: 'Carl-bot',
    tagline: 'Reaction Roles, AutoMod, & Custom Logging',
    purpose: 'Memberikan role otomatis (Self-Roles seperti Gamer/Loblox) via tombol/emoji.',
    inviteUrl: 'https://carl.gg',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    features: ['Reaction Roles', 'Audit Logging', 'Custom Embeds', 'Auto Moderation'],
    recommendedChannel: '📜・rules / 👋・welcome',
    setupCommands: ['!rr make', '!autorole <role>'],
  },
];

export const SLASH_COMMANDS: SlashCommandDefinition[] = [
  {
    name: 'tb-ping',
    description: '🏓 [The Boomers] Cek latensi dan status Server Architect bot.',
  },
  {
    name: 'tb-ask',
    description: '🧠 [The Boomers] Tanya apa saja ke Gemini AI buatan Mang Pio 😎',
    options: [
      {
        name: 'prompt',
        description: 'Pertanyaan, instruksi, atau obrolan untuk AI',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: 'tb-setup-server',
    description: '⚡ [The Boomers - Admin] Buat otomatis struktur channel & kategori server.',
    default_member_permissions: '8', // ADMINISTRATOR
    dm_permission: false,
  },
  {
    name: 'tb-setup-roles',
    description: '👑 [The Boomers - Admin] Buat hierarki roles resmi The Boomers.',
    default_member_permissions: '8', // ADMINISTRATOR
    dm_permission: false,
  },
  {
    name: 'tb-server-status',
    description: '📊 [The Boomers] Tampilkan statistik & kesehatan server The Boomers.',
  },
  {
    name: 'tb-bot-guide',
    description: '🤖 [The Boomers] Rekomendasi bot musik, ticket & proteksi dengan link invite.',
  },
  {
    name: 'tb-clean-server',
    description: '🧹 [The Boomers - Admin] Audit atau rapikan channel server yang kosong.',
    default_member_permissions: '8',
    dm_permission: false,
  },
];
