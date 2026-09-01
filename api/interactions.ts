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
    // Command: /ping (Health & Latency Check)
    // ----------------------------------------------------
    if (commandName === 'ping') {
      const latency = Math.max(5, Math.round(Date.now() - (timestamp ? parseInt(timestamp, 10) * 1000 : Date.now())));
      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: '🏓 Pong! Server Architect Aktif',
              description: `🟢 **Status Bot**: Online (Vercel Serverless)\n⚡ **Estimasi Latensi**: \`~${latency}ms\`\n🧠 **AI Engine**: Google Gemini 3.7 Flash\n🏛️ **Komunitas**: The Boomers`,
              color: 0x57f287, // Discord Green
              footer: {
                text: 'Server Architect • Powered by Google Gemini',
              },
              timestamp: new Date().toISOString(),
            },
          ],
        },
      });
    }

    // ----------------------------------------------------
    // Command: /ask <prompt> (Gemini AI Assistant)
    // ----------------------------------------------------
    if (commandName === 'ask') {
      const promptOption = interaction.data.options?.find((opt: any) => opt.name === 'prompt');
      const prompt = promptOption?.value || 'Halo!';

      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        let aiText = '';

        if (!geminiApiKey) {
          aiText = '⚠️ **Konfigurasi Kurang**: `GEMINI_API_KEY` belum disetting di environment variable Vercel.';
        } else {
          const ai = new GoogleGenAI({
            apiKey: geminiApiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: {
              systemInstruction: `Kamu adalah "Server Architect", asisten AI resmi berteknologi Google Gemini untuk komunitas Discord "The Boomers".
Karakter: Cerdas, ramah, solutif, gaul tapi sopan, fasih berbahasa Indonesia dan Inggris.
Tugas: Menjawab pertanyaan member ${user?.username || 'Member'}, memberikan tips gaming/coding/server setup, dan menghidupkan komunitas.
Format output: Gunakan markdown Discord yang bersih (**bold**, *italic*, \`code\`, bullet point). Batasi panjang di bawah 1900 karakter.`,
            },
          });
          aiText = response.text || 'Maaf, tidak dapat menghasilkan jawaban.';
        }

        if (aiText.length > 1950) {
          aiText = aiText.substring(0, 1940) + '\n\n*(...dipotong karena limit 2000 karakter)*';
        }

        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `🧠 Gemini AI: "${prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt}"`,
                description: aiText,
                color: 0x4285f4, // Google Blue
                author: {
                  name: `Ditanyakan oleh ${user?.global_name || user?.username || 'Member'}`,
                  icon_url: user?.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                    : undefined,
                },
                footer: {
                  text: '⚡ Server Architect • Powered by Google Gemini 3.7 Flash',
                },
                timestamp: new Date().toISOString(),
              },
            ],
          },
        });
      } catch (err: any) {
        console.error('Error handling /ask command:', err);
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Gagal menghubungi Gemini AI: ${err?.message || 'Unknown error'}`,
          },
        });
      }
    }

    // ----------------------------------------------------
    // Command: /setup-server (Auto Architecture for The Boomers)
    // ----------------------------------------------------
    if (commandName === 'setup-server') {
      if (!isAdmin) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ **Akses Ditolak**: Perintah `/setup-server` hanya dapat dijalankan oleh **Administrator** atau Pemilik Server The Boomers.',
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
            embeds: [
              {
                title: '🎉 Arsitektur Server "The Boomers" Sukses!',
                description:
                  'Semua kategori dan channel resmi telah berhasil dibangun oleh **Server Architect**.\n\n' +
                  results.join('\n\n') +
                  '\n\n💡 *Tips: Gunakan `/setup-roles` untuk membuat hierarki role otomatis!*',
                color: 0x57f287, // Discord Green
                footer: {
                  text: 'Server Architect • The Boomers Community Edition',
                },
                timestamp: new Date().toISOString(),
              },
            ],
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
    // Command: /setup-roles (Auto Role Hierarchy)
    // ----------------------------------------------------
    if (commandName === 'setup-roles') {
      if (!isAdmin) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ **Akses Ditolak**: Perintah `/setup-roles` hanya dapat dijalankan oleh **Administrator**.',
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
            embeds: [
              {
                title: '👑 Hierarki Roles "The Boomers" Berhasil Dibuat!',
                description:
                  'Role berikut telah ditambahkan ke server dengan warna dan perizinan optimal:\n\n' +
                  roleResults.map((r, i) => `${i + 1}. ${r}`).join('\n'),
                color: 0xffd700, // Gold
                footer: {
                  text: 'Server Architect • Role Management Module',
                },
                timestamp: new Date().toISOString(),
              },
            ],
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
    // Command: /bot-guide (Companion Bots Recommendations)
    // ----------------------------------------------------
    if (commandName === 'bot-guide') {
      const guideEmbeds = BOT_GUIDES.map((b) => ({
        title: `🤖 ${b.name}`,
        description: `**${b.tagline}**\n${b.purpose}\n\n**Fitur Unggulan:**\n${b.features.map((f) => `• ${f}`).join('\n')}\n\n**Channel Rekomendasi:** \`${b.recommendedChannel}\`\n**Contoh Command:** \`${b.setupCommands.join('`, `')}\`\n\n[🔗 Klik di sini untuk Invite ${b.name}](${b.inviteUrl})`,
        color: 0x5865f2, // Blurple
      }));

      return res.status(200).json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Berikut adalah daftar bot pendukung resmi yang direkomendasikan untuk server **The Boomers**:',
          embeds: guideEmbeds,
        },
      });
    }

    // ----------------------------------------------------
    // Command: /server-status
    // ----------------------------------------------------
    if (commandName === 'server-status') {
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
            embeds: [
              {
                title: `📊 Status Server: ${guildData?.name || 'The Boomers'}`,
                description: `Informasi terkini mengenai kondisi dan arsitektur server.`,
                color: 0x3ba55d,
                thumbnail: guildData?.icon
                  ? { url: `https://cdn.discordapp.com/icons/${guildId}/${guildData.icon}.png` }
                  : undefined,
                fields: [
                  {
                    name: '👥 Total Anggota',
                    value: `${guildData?.approximate_member_count || 'N/A'} Members (${guildData?.approximate_presence_count || 'N/A'} Online)`,
                    inline: true,
                  },
                  {
                    name: '🛡️ Level Verifikasi',
                    value: `Level ${guildData?.verification_level || 'Default'}`,
                    inline: true,
                  },
                  {
                    name: '⚡ Bot Status',
                    value: '🟢 Online (Vercel Serverless Function)',
                    inline: true,
                  },
                  {
                    name: '🧠 AI Engine',
                    value: 'Google Gemini 3.7 Flash (@google/genai)',
                    inline: true,
                  },
                ],
                footer: { text: 'Server Architect Diagnostic Engine' },
                timestamp: new Date().toISOString(),
              },
            ],
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
    // Command: /clean-server
    // ----------------------------------------------------
    if (commandName === 'clean-server') {
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
