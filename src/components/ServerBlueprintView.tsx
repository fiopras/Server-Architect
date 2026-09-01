import React, { useState } from 'react';
import { 
  Hash, 
  Volume2, 
  Megaphone, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Sparkles,
  RefreshCw,
  FolderTree,
  Sliders,
  ExternalLink,
  Shield
} from 'lucide-react';
import { BOOMERS_SERVER_TEMPLATE } from '../data/discordTemplates';

interface ServerBlueprintViewProps {
  onExecuteSetup: (customGuildId?: string) => Promise<void>;
  isExecuting: boolean;
  setupLogs: string[];
  hasDiscordToken: boolean;
  configuredGuildId: string | null;
}

export const ServerBlueprintView: React.FC<ServerBlueprintViewProps> = ({
  onExecuteSetup,
  isExecuting,
  setupLogs,
  hasDiscordToken,
  configuredGuildId,
}) => {
  const [customGuildId, setCustomGuildId] = useState(configuredGuildId || '');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  const totalChannels = BOOMERS_SERVER_TEMPLATE.reduce(
    (acc, cat) => acc + cat.channels.length,
    0
  );
  const totalVoice = BOOMERS_SERVER_TEMPLATE.reduce(
    (acc, cat) => acc + cat.channels.filter((c) => c.type === 2).length,
    0
  );
  const totalText = totalChannels - totalVoice;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
              <FolderTree className="w-3.5 h-3.5" />
              <span>// Blueprint: The Boomers Architecture</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Server Architecture Blueprint
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Struktur kategori dan channel siap buat secara otomatis melalui Slash Command{' '}
              <code className="text-blue-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">/setup-server</code>{' '}
              atau eksekusi langsung ke Discord REST API via backend.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 bg-[#020617] px-3 py-1 rounded border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <strong>{BOOMERS_SERVER_TEMPLATE.length}</strong> Kategori
              </span>
              <span className="flex items-center gap-1.5 bg-[#020617] px-3 py-1 rounded border border-slate-800">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <strong>{totalText}</strong> Text / Info
              </span>
              <span className="flex items-center gap-1.5 bg-[#020617] px-3 py-1 rounded border border-slate-800">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <strong>{totalVoice}</strong> Voice Rooms
              </span>
            </div>
          </div>

          {/* Action Trigger Box */}
          <div className="bg-[#050a1a] border border-slate-800 rounded-lg p-5 w-full lg:w-96 shadow-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2 flex items-center justify-between">
              <span>// Direct REST Trigger</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] normal-case font-mono">
                <Shield className="w-3 h-3" /> Admin Auth
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Guild ID:</label>
                <input
                  type="text"
                  value={customGuildId}
                  onChange={(e) => setCustomGuildId(e.target.value)}
                  placeholder="e.g. 123456789012345678"
                  className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                id="btn-execute-setup-server"
                onClick={() => onExecuteSetup(customGuildId)}
                disabled={isExecuting}
                className="w-full py-2.5 px-4 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-blue-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="font-mono">Sedang Membuat Channel di Discord...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Jalankan /setup-server Sekarang</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center font-mono leading-tight">
                *Membutuhkan Bot Token di <code className="text-slate-400">.env</code> & izin <code className="text-slate-400">Manage Channels</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blueprint Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BOOMERS_SERVER_TEMPLATE.map((category, catIndex) => (
          <div
            key={category.name}
            className="bg-[#0f172a] border border-slate-800 rounded-lg overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col"
          >
            {/* Category Header */}
            <div className="bg-[#0b1329] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white tracking-wide font-mono">
                  {category.name}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                {category.channels.length} channel
              </span>
            </div>

            {/* Channels List */}
            <div className="p-3 space-y-2 flex-1">
              {category.channels.map((chan) => {
                const isVoice = chan.type === 2;
                const isAnnouncement = chan.type === 5;

                return (
                  <div
                    key={chan.name}
                    className="group bg-[#020617] hover:bg-[#050a1a] border border-slate-800/80 rounded p-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="text-slate-400 group-hover:text-slate-200 flex-shrink-0">
                          {isVoice ? (
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                          ) : isAnnouncement ? (
                            <Megaphone className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Hash className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-200 font-mono truncate">
                          {chan.name}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {chan.user_limit !== undefined && chan.user_limit > 0 && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                            Limit: {chan.user_limit}
                          </span>
                        )}
                        {chan.readOnly && (
                          <span className="text-[10px] font-mono font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                            Read-Only
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/50 px-1.5 py-0.5 rounded">
                          {isVoice ? 'Voice' : isAnnouncement ? 'Announce' : 'Text'}
                        </span>
                      </div>
                    </div>

                    {chan.topic && (
                      <p className="text-[11px] text-slate-400 mt-1 pl-6 line-clamp-1">
                        {chan.topic}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Live Setup Activity Terminal */}
      {setupLogs.length > 0 && (
        <div className="bg-[#020617] border border-slate-800 rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                // Setup Execution Console
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {setupLogs.length} events logged
            </span>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1.5 max-h-64 overflow-y-auto pr-2">
            {setupLogs.map((log, index) => (
              <div
                key={index}
                className={`p-1.5 rounded flex items-start gap-2 ${
                  log.includes('[SUCCESS]')
                    ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/40'
                    : log.includes('[ERROR]')
                    ? 'text-red-400 bg-red-950/30 border border-red-900/40'
                    : log.includes('[WARNING]')
                    ? 'text-amber-400 bg-amber-950/30 border border-amber-900/40'
                    : 'text-slate-300 bg-[#0f172a]/60'
                }`}
              >
                <span className="text-slate-500 select-none">[{index + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
