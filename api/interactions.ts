import type { Request, Response } from 'express';
import { verifyKey } from 'discord-interactions';
import { GoogleGenAI } from '@google/genai';
import { BOOMERS_SERVER_TEMPLATE, BOOMERS_ROLES_TEMPLATE, BOT_GUIDES } from '../src/data/discordTemplates.js';

// Discord Interaction Types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
};

// Discord Interaction Response Types
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
};

const DISCORD_API_BASE = 'https://discord.com/api/v10';

/**
 * Helper to update deferred interaction response via Discord Webhook
 */
async function editOriginalInteractionResponse(applicationId: string, token: string, body: any) {
  const url = `${DISCORD_API_BASE}/webhooks/${applicationId}/${token}/messages/@original`;
  await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Helper to extract raw body buffer from express/vercel request
 */
async function getRawBody(req: Request): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf-8');
  }
  if (typeof req.body === 'object' && req.body !== null) {
    return Buffer.from(JSON.stringify(req.body), 'utf-8');
  }
  
  // Fallback: Read stream if body parser was not applied
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Vercel Serverless Handler & Express Handler
 */
export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'Server Architect - Discord Interactions Webhook',
      docs: 'https://discord.com/developers/docs/interactions/receiving-and-responding',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = (req.headers['x-signature-ed25519'] || req.headers['X-Signature-Ed25519']) as string | undefined;
  const timestamp = (req.headers['x-signature-timestamp'] || req.headers['X-Signature-Timestamp']) as string | undefined;
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const botToken = process.env.DISCORD_TOKEN;
  const applicationId = process.env.DISCORD_APPLICATION_ID;

  const rawBodyBuffer = await getRawBody(req);

  // Security Check: Discord signature validation
  if (publicKey) {
    if (!signature || !timestamp) {
      console.warn('⚠️ [Discord Security] Missing signature or timestamp headers.');
      return res.status(401).send('Bad request signature');
    }

    const isVerified = verifyKey(rawBodyBuffer, signature, timestamp, publicKey);
    if (!isVerified) {
      console.warn('⚠️ [Discord Security] Invalid signature rejected.');
      return res.status(401).send('Bad request signature');
    }
  } else {
    console.warn('⚠️ DISCORD_PUBLIC_KEY not set in environment.');
  }

  let interaction: any;
  try {
    const rawBodyString = rawBodyBuffer.toString('utf-8');
    interaction = rawBodyString ? JSON.parse(rawBodyString) : req.body;
  } catch (err) {
    interaction = req.body;
  }

  // 1. Discord PING Verification (Type 1)
  if (interaction.type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }

  // 2. Application Commands (Type 2)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name;
    const guildId = interaction.guild_id || process.env.GUILD_ID;
    const interactionToken = interaction.token;
    const appId = interaction.application_id || applicationId;
    const member = interaction.member;
    const user = member?.user || interaction.user;

    // Check Administrator permissions (Bitwise flag 8)
    const permissions = BigInt(member?.permissions || '0');
    const isAdmin = (permissions & 8n) === 8n || (permissions & 0x8n) === 0x8n;

    // ----------------------------------------------------
    // Command: /tb-ping or /ping (Health & Latency Check)
    // ----------------------------------------------------
    if (commandName === 'tb-ping' || commandName === 'ping') {
      const latency = Math.max(5, Math.round(Date.now() - (timestamp ? parseInt(timestamp, 10) * 1000 : Date.now())));
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🏓 **Pong!** (\`${latency}ms\`)\n🟢 Server Architect aktif dan siap membantu komunitas **The Boomers**!\n👑 Dibuat oleh **Mang Pio 😎** & ditenagai oleh **Google Gemini AI**.`,
        },
      });
    }

    // ----------------------------------------------------
    // Command: /tb-ask or /ask <prompt> (Gemini AI Assistant)
    // ----------------------------------------------------
    if (commandName === 'tb-ask' || commandName === 'ask') {
      const promptOption = interaction.data.options?.find((opt: any) => opt.name === 'prompt');
      const prompt = (promptOption?.value || 'Halo!').trim();
      const lowerPrompt = prompt.toLowerCase();

      // Quick Creator Check: Instant response if asking about creator
      const isAskingCreator = 
        lowerPrompt.includes('siapa yang buat') || 
        lowerPrompt.includes('siapa pencipta') || 
        lowerPrompt.includes('siapa develop') ||
        lowerPrompt.includes('siapa pembuat') ||
        lowerPrompt.includes('lu siapa') ||
        lowerPrompt.includes('kamu siapa') ||
        lowerPrompt.includes('mang pio');

      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        let aiText = '';

        if (isAskingCreator) {
          aiText = `Halo bro! 😎\n\nPerkenalkan, aku adalah **Server Architect**, asisten AI resmi khusus komunitas **The Boomers**!\n\n👑 **Pencipta & Mastermind**: Aku dirancang, dikembangkan, dan dibesarkan oleh **Mang Pio 😎** sang arsitek server The Boomers!\n\n🧠 **Teknologi**: Ditenagai oleh **Google Gemini AI** dengan arsitektur serverless modern Vercel. Ada yang bisa aku bantu untuk server ini? 🚀`;
        } else if (!geminiApiKey) {
          aiText = '⚠️ **Konfigurasi Kurang**: `GEMINI_API_KEY` belum disetting di environment variable Vercel.';
        } else {
          const ai = new GoogleGenAI({
            apiKey: geminiApiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });

          const systemInstruction = `Kamu adalah "Server Architect", asisten AI resmi berteknologi Google Gemini untuk komunitas Discord "The Boomers".
IDENTITAS & PENCIPTA:
- Kamu dibuat, dirancang, dan dikembangkan secara khusus oleh **Mang Pio 😎** (Sang Mastermind & Founder server Discord The Boomers).
- Jika ada yang bertanya siapa yang buat kamu / penciptamu, sebutkan selalu **Mang Pio 😎** dengan bangga dan santai!
- Karakter: Cerdas, ramah, solutif, gaul tapi sopan, responsif, fasih berbahasa Indonesia dan Inggris.
- Tugas: Membantu member (${user?.global_name || user?.username || 'Member'}), menjawab pertanyaan gaming/coding/setup, dan meramaikan The Boomers.
- Format: Gunakan format teks chat Discord yang rapi (**bold**, *italic*, \`code\`, bullet point). Batasi panjang di bawah 1900 karakter.`;

          // Multi-model fallback list in case one encounters 503 high demand
          const candidateModels = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.1-pro-preview'];
          let lastError: any = null;

          for (const modelName of candidateModels) {
            try {
              const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                  systemInstruction,
                },
              });
              if (response && response.text) {
                aiText = response.text;
                break; // Successfully got response
              }
            } catch (modelErr: any) {
              lastError = modelErr;
              console.warn(`[Gemini API] Model ${modelName} failed, trying next fallback...`, modelErr?.message || modelErr);
            }
          }

          if (!aiText) {
            if (lastError?.message?.includes('503') || lastError?.status === 'UNAVAILABLE' || lastError?.message?.includes('high demand')) {
              aiText = `Halo **${user?.global_name || user?.username || 'Member'}**! Server Google Gemini saat ini sedang mengalami lonjakan lalu lintas global sesaat (High Demand 503).\n\nTetapi jangan khawatir, aku **Server Architect** buatan **Mang Pio 😎** siap membantu kembali dalam beberapa detik! Silakan ulangi pertanyaanmu sekarang ya! 🚀`;
            } else {
              aiText = `Maaf, terjadi kendala saat memproses permintaan: ${lastError?.message || 'Silakan coba lagi sebentar lagi.'}`;
            }
          }
        }

        if (aiText.length > 1950) {
          aiText = aiText.substring(0, 1940) + '\n\n*(...dipotong karena limit 2000 karakter)*';
        }

        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: aiText,
          },
        });
      } catch (err: any) {
        console.error('Error handling /ask command:', err);
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Halo, ada kendala sementara di API: ${err?.message || 'Silakan coba lagi'}`,
          },
        });
      }
    }

    // ----------------------------------------------------
    // Command: /tb-setup-server or /setup-server (Auto Architecture)
    // ----------------------------------------------------
    if (commandName === 'tb-setup-server' || commandName === 'setup-server') {
      if (!isAdmin) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ **Akses Ditolak**: Perintah `/tb-setup-server` hanya dapat dijalankan oleh **Administrator** atau Pemilik Server The Boomers.',
            flags: 64, // Ephemeral
          },
        });
      }

      if (!botToken || !guildId) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '⚠️ **Konfigurasi Kurang**: Pastikan `DISCORD_TOKEN` dan `GUILD_ID` sudah terkonfigurasi di serverless environment.',
            flags: 64,
          },
        });
      }

      // Send immediate deferred response
      res.status(200).json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      // Background task: Create categories & channels via REST API
      (async () => {
        try {
          const results: string[] = [];

          for (const cat of BOOMERS_SERVER_TEMPLATE) {
            // Create Category (Type 4)
            const catRes = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
              method: 'POST',
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: cat.name, type: 4 }),
            });

            if (!catRes.ok) {
              results.push(`❌ Gagal kategori **${cat.name}**`);
              continue;
            }

            const catData = await catRes.json();
            const childChannels: string[] = [];

            for (const ch of cat.channels) {
              await new Promise((r) => setTimeout(r, 250)); // Rate limit protection
              const chPayload: any = {
                name: ch.name,
                type: ch.type,
                parent_id: catData.id,
              };
              if (ch.topic) chPayload.topic = ch.topic;
              if (ch.user_limit !== undefined) chPayload.user_limit = ch.user_limit;

              const chRes = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
                method: 'POST',
                headers: {
                  Authorization: `Bot ${botToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(chPayload),
              });

              if (chRes.ok) {
                childChannels.push(`\`${ch.name}\``);
              }
            }

            results.push(`✅ **${cat.name}** (${childChannels.join(', ')})`);
          }

          await editOriginalInteractionResponse(appId, interactionToken, {
            content:
              `⚡ **Arsitektur Server "The Boomers" Berhasil Dibuat!**\n\n` +
              results.join('\n') +
              `\n\n💡 *Gunakan \`/tb-setup-roles\` untuk melengkapi hierarki role! (Created by Mang Pio 😎)*`,
          });
        } catch (err: any) {
          console.error('Error executing /setup-server:', err);
          await editOriginalInteractionResponse(appId, interactionToken, {
            content: `❌ Gagal menyelesaikan setup server: ${err?.message || 'Unknown error'}`,
          });
        }
      })();

      return;
    }

    // ----------------------------------------------------
    // Command: /tb-setup-roles or /setup-roles (Auto Role Hierarchy)
    // ----------------------------------------------------
    if (commandName === 'tb-setup-roles' || commandName === 'setup-roles') {
      if (!isAdmin) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ **Akses Ditolak**: Perintah `/tb-setup-roles` hanya dapat dijalankan oleh **Administrator**.',
            flags: 64,
          },
        });
      }

      res.status(200).json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      (async () => {
        try {
          const roleResults: string[] = [];

          for (const r of BOOMERS_ROLES_TEMPLATE) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            const roleRes = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
              method: 'POST',
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: r.name,
                color: r.color,
                hoist: r.hoist,
                mentionable: r.mentionable,
                permissions: r.permissions,
              }),
            });

            if (roleRes.ok) {
              roleResults.push(`✨ **${r.name}**`);
            }
          }

          await editOriginalInteractionResponse(appId, interactionToken, {
            content:
              `👑 **Hierarki Roles "The Boomers" Berhasil Dibuat!**\n\n` +
              `Role berikut telah ditambahkan ke server:\n` +
              roleResults.map((r, i) => `${i + 1}. ${r}`).join('\n') +
              `\n\n*(Dibuat oleh Server Architect • Mang Pio 😎)*`,
          });
        } catch (err: any) {
          await editOriginalInteractionResponse(appId, interactionToken, {
            content: `❌ Error membuat roles: ${err?.message}`,
          });
        }
      })();

      return;
    }

    // ----------------------------------------------------
    // Command: /tb-bot-guide or /bot-guide (Companion Bots)
    // ----------------------------------------------------
    if (commandName === 'tb-bot-guide' || commandName === 'bot-guide') {
      const guideText = BOT_GUIDES.map(
        (b, idx) =>
          `**${idx + 1}. 🤖 ${b.name}** — *${b.tagline}*\n` +
          `${b.purpose}\n` +
          `• **Channel Rekomendasi**: \`${b.recommendedChannel}\`\n` +
          `• **Invite Link**: [Klik untuk Invite ${b.name}](${b.inviteUrl})\n`
      ).join('\n');

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🤖 **Rekomendasi Bot Pendukung The Boomers:**\n\n${guideText}`,
        },
      });
    }

    // ----------------------------------------------------
    // Command: /tb-server-status or /server-status
    // ----------------------------------------------------
    if (commandName === 'tb-server-status' || commandName === 'server-status') {
      try {
        let guildData: any = null;
        if (botToken && guildId) {
          const guildRes = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}?with_counts=true`, {
            headers: { Authorization: `Bot ${botToken}` },
          });
          if (guildRes.ok) guildData = await guildRes.json();
        }

        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              `📊 **Status Server: ${guildData?.name || 'The Boomers'}**\n\n` +
              `• **Total Anggota**: \`${guildData?.approximate_member_count || 'Aktif'}\` member (\`${guildData?.approximate_presence_count || 'Aktif'}\` online)\n` +
              `• **Server ID**: \`${guildId}\`\n` +
              `• **Creator Bot**: **Mang Pio 😎**\n` +
              `• **AI Engine**: Google Gemini AI\n` +
              `• **Status Bot**: 🟢 Online & Siap Pakai!`,
          },
        });
      } catch (err: any) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Gagal mengambil status server: ${err?.message}`,
          },
        });
      }
    }

    // ----------------------------------------------------
    // Command: /tb-clean-server or /clean-server
    // ----------------------------------------------------
    if (commandName === 'tb-clean-server' || commandName === 'clean-server') {
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '🧹 **Server Architect Cleaner**: Untuk membersihkan atau merapikan channel yang tidak terpakai, pastikan Anda memeriksa izin bot `MANAGE_CHANNELS` terlebih dahulu. Jalankan `/setup-server` untuk menyelaraskan kategori kembali.',
        },
      });
    }

    // Fallback unknown command
    return res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❓ Perintah \`/${commandName}\` diterima oleh Server Architect.`,
      },
    });
  }

  return res.status(400).json({ error: 'Unknown interaction type' });
}
