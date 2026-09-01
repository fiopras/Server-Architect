import {
  Client,
  GatewayIntentBits,
  ActivityType,
  Message,
  Events,
} from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import { BOT_GUIDES } from './data/discordTemplates.js';
import { executeSetupServer, executeSetupRoles } from './services/discordApi.js';

let discordClient: Client | null = null;

export function startGatewayBot(token?: string) {
  const botToken = token || process.env.DISCORD_TOKEN;
  if (!botToken) {
    console.log('[GatewayBot] No DISCORD_TOKEN found. Skipping WebSocket client.');
    return null;
  }

  if (discordClient) {
    return discordClient;
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  discordClient.once(Events.ClientReady, (c) => {
    console.log(`[GatewayBot] 🟢 Bot is ONLINE as ${c.user.tag}`);
    c.user.setPresence({
      status: 'online',
      activities: [
        {
          name: 'The Boomers | by Mang Pio 😎',
          type: ActivityType.Custom,
          state: '💬 !ask <prompt> | by Mang Pio 😎',
        },
      ],
    });
  });

  discordClient.on(Events.MessageCreate, async (message: Message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    const content = message.content.trim();
    const lowerContent = content.toLowerCase();

    // Check prefixes: "tb!", "!", "m!" (if configured)
    let command = '';
    let args = '';

    if (lowerContent.startsWith('tb!')) {
      const parts = content.slice(3).trim().split(/\s+/);
      command = parts[0]?.toLowerCase() || '';
      args = content.slice(3).trim().slice(command.length).trim();
    } else if (lowerContent.startsWith('!')) {
      const parts = content.slice(1).trim().split(/\s+/);
      command = parts[0]?.toLowerCase() || '';
      args = content.slice(1).trim().slice(command.length).trim();
    } else {
      return;
    }

    // ----------------------------------------------------
    // Command: !ping / tb!ping
    // ----------------------------------------------------
    if (command === 'ping') {
      const latency = Math.max(5, Date.now() - message.createdTimestamp);
      await message.reply(
        `🏓 **Pong!** (\`${latency}ms\`)\n🟢 Server Architect aktif dan online untuk **The Boomers**! Dibuat oleh **Mang Pio 😎** & didukung oleh **Google Gemini AI**.`
      );
      return;
    }

    // ----------------------------------------------------
    // Command: !ask <prompt> / tb!ask <prompt>
    // ----------------------------------------------------
    if (command === 'ask' || command === 'tanya' || command === 'ai') {
      if (!args) {
        await message.reply(
          `Halo **${message.author.displayName || message.author.username}**! Mau tanya apa ke AI? Ketik contoh:\n\`!ask siapa yang buat kamu?\`\natau\n\`!ask buatkan ide acara gaming seru untuk The Boomers\``
        );
        return;
      }

      const lowerPrompt = args.toLowerCase();
      const isAskingCreator =
        lowerPrompt.includes('siapa yang buat') ||
        lowerPrompt.includes('siapa pencipta') ||
        lowerPrompt.includes('siapa develop') ||
        lowerPrompt.includes('siapa pembuat') ||
        lowerPrompt.includes('lu siapa') ||
        lowerPrompt.includes('kamu siapa') ||
        lowerPrompt.includes('mang pio');

      if (isAskingCreator) {
        await message.reply(
          `Halo bro! 😎\n\nPerkenalkan, aku adalah **Server Architect**, asisten AI resmi khusus komunitas **The Boomers**!\n\n👑 **Pencipta & Mastermind**: Aku dirancang, dikembangkan, dan dibesarkan oleh **Mang Pio 😎** sang arsitek server The Boomers!\n\n🧠 **Teknologi**: Ditenagai oleh **Google Gemini AI**. Ada yang bisa aku bantu untuk server ini? 🚀`
        );
        return;
      }

      // Show typing indicator
      try {
        await message.channel.sendTyping();
      } catch {}

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        await message.reply(
          `⚠️ **Konfigurasi Kurang**: \`GEMINI_API_KEY\` belum dimasukkan di file .env.`
        );
        return;
      }

      try {
        const ai = new GoogleGenAI({
          apiKey: geminiApiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const systemInstruction = `Kamu adalah "Server Architect", asisten AI resmi berteknologi Google Gemini untuk komunitas Discord "The Boomers".
IDENTITAS & PENCIPTA:
- Kamu dibuat, dirancang, dan dikembangkan secara khusus oleh **Mang Pio 😎** (Sang Mastermind & Founder server Discord The Boomers).
- Jika ada yang bertanya siapa yang buat kamu / penciptamu, sebutkan selalu **Mang Pio 😎** dengan bangga dan santai!
- Karakter: Cerdas, ramah, solutif, gaul tapi sopan, responsif, fasih berbahasa Indonesia dan Inggris.
- Tugas: Membantu member (${message.author.displayName || message.author.username}), menjawab pertanyaan gaming/coding/setup, dan meramaikan The Boomers.
- Format: Gunakan format teks chat Discord yang rapi (**bold**, *italic*, \`code\`, bullet point). Batasi panjang di bawah 1900 karakter.`;

        const candidateModels = [
          'gemini-3.7-flash',
          'gemini-2.5-flash',
          'gemini-flash-latest',
        ];
        let aiResponse = '';

        for (const modelName of candidateModels) {
          try {
            const resp = await ai.models.generateContent({
              model: modelName,
              contents: args,
              config: { systemInstruction },
            });
            if (resp && resp.text) {
              aiResponse = resp.text;
              break;
            }
          } catch (mErr: any) {
            console.warn(`[Gateway AI] ${modelName} error:`, mErr?.message);
          }
        }

        if (!aiResponse) {
          aiResponse = `Halo **${message.author.displayName || message.author.username}**! Server Google Gemini saat ini sedang sibuk sesaat. Silakan ulangi pertanyaanmu sebentar lagi ya! 🚀`;
        }

        if (aiResponse.length > 1950) {
          aiResponse = aiResponse.substring(0, 1940) + '... *(jawaban terpotong)*';
        }

        await message.reply(aiResponse);
      } catch (err: any) {
        await message.reply(
          `❌ Maaf bro, terjadi kendala saat memproses jawaban: ${err?.message || 'Error'}`
        );
      }
      return;
    }

    // ----------------------------------------------------
    // Command: !status / tb!status
    // ----------------------------------------------------
    if (command === 'status' || command === 'server-status') {
      const guild = message.guild;
      await message.reply(
        `📊 **Status Server: ${guild?.name || 'The Boomers'}**\n\n` +
          `• **Total Member**: \`${guild?.memberCount || 'Aktif'}\` anggota\n` +
          `• **Owner Server**: <@${guild?.ownerId}>\n` +
          `• **Bot Status**: 🟢 **Online (24/7 Gateway Connected)**\n` +
          `• **Creator Bot**: **Mang Pio 😎**\n` +
          `• **AI Engine**: Google Gemini AI`
      );
      return;
    }

    // ----------------------------------------------------
    // Command: !botguide / tb!botguide
    // ----------------------------------------------------
    if (command === 'botguide' || command === 'bot-guide') {
      const guideText = BOT_GUIDES.map(
        (b, idx) =>
          `**${idx + 1}. 🤖 ${b.name}** — *${b.tagline}*\n` +
          `${b.purpose}\n` +
          `• **Channel**: \`${b.recommendedChannel}\`\n` +
          `• **Invite**: [Klik untuk Invite ${b.name}](${b.inviteUrl})\n`
      ).join('\n');

      await message.reply(`🤖 **Rekomendasi Bot Pendukung The Boomers:**\n\n${guideText}`);
      return;
    }

    // ----------------------------------------------------
    // Command: !setupserver (Admin only)
    // ----------------------------------------------------
    if (command === 'setupserver' || command === 'setup-server') {
      if (!message.member?.permissions.has('Administrator')) {
        await message.reply('❌ **Akses Ditolak**: Perintah ini hanya untuk **Administrator**.');
        return;
      }

      if (!message.guild) return;
      const progressMsg = await message.reply('⚡ **Sedang membangun arsitektur The Boomers...**');

      try {
        const results: string[] = [];
        await executeSetupServer(botToken, message.guild.id, (e) => {
          results.push(`• ${e.message}`);
        });

        await progressMsg.edit(
          `⚡ **Arsitektur Server The Boomers Berhasil Dibangun!**\n\n` +
            results.slice(0, 10).join('\n') +
            `\n\n*(Dibuat oleh Server Architect • Mang Pio 😎)*`
        );
      } catch (err: any) {
        await progressMsg.edit(`❌ Gagal membangun server: ${err?.message}`);
      }
      return;
    }

    // ----------------------------------------------------
    // Command: !setuproles (Admin only)
    // ----------------------------------------------------
    if (command === 'setuproles' || command === 'setup-roles') {
      if (!message.member?.permissions.has('Administrator')) {
        await message.reply('❌ **Akses Ditolak**: Perintah ini hanya untuk **Administrator**.');
        return;
      }

      if (!message.guild) return;
      const progressMsg = await message.reply('👑 **Sedang mengatur hierarki roles The Boomers...**');

      try {
        const roleResults: string[] = [];
        await executeSetupRoles(botToken, message.guild.id, (e) => {
          roleResults.push(`• ${e.message}`);
        });

        await progressMsg.edit(
          `👑 **Hierarki Roles The Boomers Berhasil Dibuat!**\n\n` +
            roleResults.join('\n') +
            `\n\n*(Dibuat oleh Server Architect • Mang Pio 😎)*`
        );
      } catch (err: any) {
        await progressMsg.edit(`❌ Gagal membuat roles: ${err?.message}`);
      }
      return;
    }
  });

  discordClient.login(botToken).catch((err) => {
    console.error('[GatewayBot] ❌ Failed to login to Discord Gateway:', err.message);
  });

  return discordClient;
}
