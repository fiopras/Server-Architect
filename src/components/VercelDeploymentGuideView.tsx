import React, { useState } from 'react';
import { 
  Rocket, 
  ExternalLink, 
  Copy, 
  Check, 
  Key, 
  Globe, 
  Terminal, 
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

interface VercelDeploymentGuideViewProps {
  appId: string | null;
  guildId: string | null;
}

export const VercelDeploymentGuideView: React.FC<VercelDeploymentGuideViewProps> = ({
  appId,
  guildId,
}) => {
  const [vercelDomain, setVercelDomain] = useState('server-architect-the-boomers.vercel.app');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const calculatedAppId = appId || 'YOUR_APPLICATION_ID';
  const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${calculatedAppId}&permissions=8&scope=bot%20applications.commands`;
  const interactionEndpointUrl = `https://${vercelDomain.trim().replace(/^https?:\/\//, '')}/api/interactions`;

  const copyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-semibold mb-3">
            <Rocket className="w-3.5 h-3.5" />
            <span>// Serverless Deployment Guide</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Vercel & Discord Portal Deployment
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Ikuti 4 langkah di bawah ini untuk menghubungkan bot <strong className="text-slate-200 font-mono">Server Architect</strong> di Vercel Serverless ke server Discord <strong className="text-slate-200 font-mono">The Boomers</strong>.
          </p>
        </div>
      </div>

      {/* 4-Step Interactive Guide */}
      <div className="space-y-4">
        {/* Step 1: Discord Dev Portal */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <span className="w-7 h-7 rounded bg-blue-900/40 border border-blue-500/40 text-blue-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs">
              01
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-white">
                  Dapatkan Kredensial dari Discord Developer Portal
                </h3>
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Dev Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buka aplikasi bot "Server Architect" Anda di Discord Developer Portal, lalu salin ketiga kredensial berikut:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 font-mono">
                <div className="bg-[#020617] p-3 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    1. Application ID
                  </span>
                  <span className="text-xs text-slate-300">
                    General Information → Application ID
                  </span>
                </div>
                <div className="bg-[#020617] p-3 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    2. Public Key (Ed25519)
                  </span>
                  <span className="text-xs text-slate-300">
                    General Information → Public Key
                  </span>
                </div>
                <div className="bg-[#020617] p-3 rounded border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    3. Bot Token
                  </span>
                  <span className="text-xs text-slate-300">
                    Bot → Reset Token
                  </span>
                </div>
              </div>

              {/* Bot Invite Link Box */}
              <div className="mt-4 bg-[#050a1a] rounded p-3.5 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <span className="text-xs font-bold text-blue-300 block">
                    // Invite Bot ke Server The Boomers
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Otomatis menyertakan izin Administrator (8) dan Scope Slash Commands.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={botInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Invite Bot</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => copyText(botInviteUrl, 'invite')}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
                    title="Salin Link"
                  >
                    {copiedSection === 'invite' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Deploy to Vercel */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <span className="w-7 h-7 rounded bg-purple-900/40 border border-purple-500/40 text-purple-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs">
              02
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-white">
                  Deploy ke Vercel & Masukkan Environment Variables
                </h3>
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Vercel Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Push project ini ke GitHub dan import ke Vercel (atau gunakan Vercel CLI <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded font-mono border border-slate-800">vercel --prod</code>). Pastikan variabel berikut dimasukkan di Vercel:
              </p>

              {/* Env Var Table */}
              <div className="bg-[#020617] rounded border border-slate-800 overflow-hidden font-mono">
                <div className="divide-y divide-slate-800 text-xs">
                  <div className="p-2.5 flex items-center justify-between bg-[#0b1329] font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                    <span>KEY</span>
                    <span>NILAI / SUMBER</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-slate-200">
                    <span className="text-amber-400">GEMINI_API_KEY</span>
                    <span className="text-slate-400">Google AI Studio API Key</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-slate-200">
                    <span className="text-emerald-400">DISCORD_TOKEN</span>
                    <span className="text-slate-400">Bot Token dari Discord Dev Portal</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-slate-200">
                    <span className="text-blue-400">DISCORD_PUBLIC_KEY</span>
                    <span className="text-slate-400">Public Key Ed25519 untuk signature validation</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-slate-200">
                    <span className="text-cyan-400">DISCORD_APPLICATION_ID</span>
                    <span className="text-slate-400">Application ID dari General Information</span>
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-slate-200">
                    <span className="text-pink-400">GUILD_ID</span>
                    <span className="text-slate-400">ID Server The Boomers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Interactions Endpoint URL */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <span className="w-7 h-7 rounded bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs">
              03
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1">
                Setting Interactions Endpoint URL di Discord Dev Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Setelah dideploy ke Vercel, salin URL endpoint interaksi di bawah ini dan tempelkan ke:
                <br />
                <span className="font-semibold text-slate-200 font-mono">Discord Developer Portal → General Information → Interactions Endpoint URL</span>
              </p>

              {/* Live URL Builder */}
              <div className="bg-[#020617] rounded p-4 border border-slate-800 space-y-3 font-mono">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Domain Vercel Anda:
                  </label>
                  <input
                    type="text"
                    value={vercelDomain}
                    onChange={(e) => setVercelDomain(e.target.value)}
                    placeholder="nama-project-anda.vercel.app"
                    className="w-full bg-[#050a1a] border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-emerald-400 block mb-1 font-semibold">
                    // Discord Portal Endpoint Target:
                  </label>
                  <div className="flex items-center gap-2 bg-[#050a1a] p-2.5 rounded border border-emerald-500/30">
                    <code className="text-xs text-emerald-300 flex-1 truncate font-mono">
                      {interactionEndpointUrl}
                    </code>
                    <button
                      onClick={() => copyText(interactionEndpointUrl, 'endpoint')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 shadow"
                    >
                      {copiedSection === 'endpoint' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Discord akan langsung mengirimkan verifikasi <code className="text-slate-200 font-mono">PING</code> (Type 1) dan bot kita otomatis membalas <code className="text-slate-200 font-mono">PONG</code>.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Register Slash Commands */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <span className="w-7 h-7 rounded bg-cyan-900/40 border border-cyan-500/40 text-cyan-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs">
              04
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white mb-1">
                Registrasi Perintah & Uji Coba di Discord
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Jalankan registrasi slash commands, lalu buka server <strong className="text-slate-200 font-mono">The Boomers</strong> di Discord dan coba jalankan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="bg-[#020617] p-3 rounded border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <span>/setup-server</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Membuat otomatis semua kategori dan channel (Information, General, Gaming Zone, Voice Lounge).
                  </p>
                </div>

                <div className="bg-[#020617] p-3 rounded border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                    <span>/ask prompt: Halo Server Architect!</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Memanggil Gemini Flash AI untuk menjawab pertanyaan member secara instan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
