import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  FileText, 
  Code,
  Sparkles,
  Layers
} from 'lucide-react';

export const CodeExporterView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<
    'interactions' | 'vercel' | 'register' | 'setup' | 'env' | 'readme'
  >('interactions');
  const [copied, setCopied] = useState(false);

  const files = {
    interactions: {
      name: 'api/interactions.ts',
      desc: 'Vercel Serverless Webhook Handler (Discord Interaction Endpoint with Ed25519 & Gemini AI)',
      lang: 'typescript',
      content: `import type { Request, Response } from 'express';
import nacl from 'tweetnacl';
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
};

const DISCORD_API_BASE = 'https://discord.com/api/v10';

function verifySignature(rawBody: string, signature?: string, timestamp?: string, publicKey?: string): boolean {
  if (!signature || !timestamp || !publicKey) return false;
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex')
    );
  } catch (e) {
    return false;
  }
}

async function editOriginalInteractionResponse(applicationId: string, token: string, body: any) {
  const url = \`\${DISCORD_API_BASE}/webhooks/\${applicationId}/\${token}/messages/@original\`;
  await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'online', bot: 'Server Architect' });
  }

  const signature = req.headers['x-signature-ed25519'] as string | undefined;
  const timestamp = req.headers['x-signature-timestamp'] as string | undefined;
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const botToken = process.env.DISCORD_TOKEN;
  const applicationId = process.env.DISCORD_APPLICATION_ID;

  let rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  if (publicKey && !verifySignature(rawBody, signature, timestamp, publicKey)) {
    return res.status(401).send('Bad request signature');
  }

  const interaction = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Discord PING (Type 1)
  if (interaction.type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }

  // Application Commands (Type 2)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name;
    const guildId = interaction.guild_id || process.env.GUILD_ID;
    const interactionToken = interaction.token;
    const appId = interaction.application_id || applicationId;
    const member = interaction.member;
    const user = member?.user || interaction.user;

    const permissions = BigInt(member?.permissions || '0');
    const isAdmin = (permissions & 8n) === 8n;

    // 1. /ask <prompt> (Gemini 3.7 Flash)
    if (commandName === 'ask') {
      const promptOption = interaction.data.options?.find((opt: any) => opt.name === 'prompt');
      const prompt = promptOption?.value || 'Halo!';

      res.status(200).json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      (async () => {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });

          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: {
              systemInstruction: 'Kamu adalah Server Architect, asisten AI ramah untuk server Discord The Boomers. Format jawaban dengan markdown Discord rapi di bawah 1900 karakter.',
            },
          });

          const aiText = response.text || 'Maaf, tidak ada jawaban.';

          await editOriginalInteractionResponse(appId, interactionToken, {
            embeds: [
              {
                title: \`🧠 Gemini AI: "\${prompt}"\`,
                description: aiText,
                color: 0x4285f4,
                footer: { text: 'Server Architect • Powered by Google Gemini 3.7 Flash' },
                timestamp: new Date().toISOString(),
              },
            ],
          });
        } catch (err: any) {
          await editOriginalInteractionResponse(appId, interactionToken, {
            content: \`❌ Error: \${err?.message}\`,
          });
        }
      })();

      return;
    }

    // 2. /setup-server (Auto Channel Architect)
    if (commandName === 'setup-server') {
      if (!isAdmin) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: '❌ Hanya Administrator yang dapat menjalankan /setup-server.', flags: 64 },
        });
      }

      res.status(200).json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      (async () => {
        try {
          for (const cat of BOOMERS_SERVER_TEMPLATE) {
            const catRes = await fetch(\`\${DISCORD_API_BASE}/guilds/\${guildId}/channels\`, {
              method: 'POST',
              headers: { Authorization: \`Bot \${botToken}\`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: cat.name, type: 4 }),
            });
            const catData = await catRes.json();

            for (const ch of cat.channels) {
              await new Promise((r) => setTimeout(r, 250));
              await fetch(\`\${DISCORD_API_BASE}/guilds/\${guildId}/channels\`, {
                method: 'POST',
                headers: { Authorization: \`Bot \${botToken}\`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: ch.name, type: ch.type, parent_id: catData.id }),
              });
            }
          }

          await editOriginalInteractionResponse(appId, interactionToken, {
            embeds: [
              {
                title: '🎉 Setup Server "The Boomers" Berhasil!',
                description: 'Semua kategori dan channel resmi telah dibangun oleh Server Architect.',
                color: 0x57f287,
              },
            ],
          });
        } catch (err: any) {
          await editOriginalInteractionResponse(appId, interactionToken, {
            content: \`❌ Setup Error: \${err?.message}\`,
          });
        }
      })();

      return;
    }
  }

  return res.status(400).json({ error: 'Unknown interaction' });
}`,
    },
    vercel: {
      name: 'vercel.json',
      desc: 'Konfigurasi deployment Vercel Serverless',
      lang: 'json',
      content: `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Signature-Ed25519, X-Signature-Timestamp" }
      ]
    }
  ]
}`,
    },
    register: {
      name: 'scripts/register-commands.ts',
      desc: 'CLI Script untuk mendaftarkan Slash Commands ke Discord API',
      lang: 'typescript',
      content: `import dotenv from 'dotenv';
dotenv.config();
import { SLASH_COMMANDS } from '../src/data/discordTemplates.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const appId = process.env.DISCORD_APPLICATION_ID;
  const guildId = process.env.GUILD_ID;

  const url = guildId
    ? \`\${DISCORD_API_BASE}/applications/\${appId}/guilds/\${guildId}/commands\`
    : \`\${DISCORD_API_BASE}/applications/\${appId}/commands\`;

  console.log('Registering commands to Discord REST API...');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: \`Bot \${token}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(SLASH_COMMANDS),
  });

  const data = await response.json();
  console.log('Success! Registered commands:', data);
}

main();`,
    },
    setup: {
      name: 'scripts/setup-server-direct.ts',
      desc: 'CLI Script untuk auto channel builder The Boomers langsung via Terminal',
      lang: 'typescript',
      content: `import dotenv from 'dotenv';
dotenv.config();
import { executeSetupServer, executeSetupRoles } from '../src/services/discordApi.js';

async function main() {
  const token = process.env.DISCORD_TOKEN!;
  const guildId = process.env.GUILD_ID!;

  console.log('Step 1: Building Roles...');
  await executeSetupRoles(token, guildId, (e) => console.log(e.message));

  console.log('Step 2: Building Categories and Channels...');
  await executeSetupServer(token, guildId, (e) => console.log(e.message));

  console.log('Done! The Boomers server is ready.');
}

main();`,
    },
    env: {
      name: '.env.example',
      desc: 'Daftar environment variables yang wajib disetting',
      lang: 'bash',
      content: `GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
DISCORD_TOKEN="YOUR_DISCORD_BOT_TOKEN"
DISCORD_PUBLIC_KEY="YOUR_DISCORD_PUBLIC_KEY"
DISCORD_APPLICATION_ID="YOUR_DISCORD_APPLICATION_ID"
GUILD_ID="YOUR_DISCORD_GUILD_ID"
APP_URL="https://your-project.vercel.app"`,
    },
    readme: {
      name: 'README.md',
      desc: 'Dokumentasi lengkap dan petunjuk penggunaan',
      lang: 'markdown',
      content: `# Server Architect - Discord Bot (Vercel Serverless + Gemini AI)
Bot resmi untuk server "The Boomers".

Fitur:
- /setup-server (Struktur Channel & Kategori otomatis)
- /ask <prompt> (Gemini AI 3.7 Flash)
- /setup-roles (Hierarki Role)
- /bot-guide (Companion Bots)

Deploy ke Vercel:
1. Import repo ke Vercel.
2. Tambahkan environment variables.
3. Salin https://<domain-vercel>/api/interactions ke Discord Developer Portal -> Interactions Endpoint URL.`,
    },
  };

  const currentFile = files[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentFile.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentFile.name.split('/').pop() || 'file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold mb-3">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>// Code Exporter: Standalone Vercel Modules</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Export Standalone Files for Vercel
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Semua file siap pakai dan bersih dari dependensi framework berlebih. Anda dapat menyalin atau mengunduh kode ini langsung ke folder project Vercel Anda.
          </p>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap gap-2 font-mono">
        {Object.entries(files).map(([key, file]) => (
          <button
            key={key}
            onClick={() => setSelectedFile(key as any)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              selectedFile === key
                ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm'
                : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer Box */}
      <div className="bg-[#020617] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-[#0b1329] px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              // File: {currentFile.name}
            </span>
            <span className="text-[11px] text-slate-400 font-sans">{currentFile.desc}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-blue-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-x-auto max-h-[550px] bg-[#050a1a]">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
