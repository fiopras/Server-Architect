import React, { useState } from 'react';
import { 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Code, 
  Globe, 
  Server,
  Copy,
  Check
} from 'lucide-react';
import { SLASH_COMMANDS } from '../data/discordTemplates';

interface CommandsManagerViewProps {
  onRegisterCommands: (targetGuildId?: string) => Promise<void>;
  isRegistering: boolean;
  configuredGuildId: string | null;
  registrationResult: any;
}

export const CommandsManagerView: React.FC<CommandsManagerViewProps> = ({
  onRegisterCommands,
  isRegistering,
  configuredGuildId,
  registrationResult,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<'guild' | 'global'>('guild');
  const [customGuildId, setCustomGuildId] = useState(configuredGuildId || '');
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(SLASH_COMMANDS, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>// Discord REST Interactions API Registry</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Slash Commands Registry
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Daftar perintah garis miring (<code className="text-emerald-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">/</code>) yang siap didaftarkan ke Discord Developer REST API.
            </p>
          </div>

          {/* Registration Trigger Panel */}
          <div className="bg-[#050a1a] border border-slate-800 rounded-lg p-5 w-full lg:w-96 shadow-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center justify-between">
              <span>// Registration Console</span>
              <span className="text-blue-400 font-mono text-[11px]">{SLASH_COMMANDS.length} Commands</span>
            </div>

            <div className="space-y-3">
              {/* Target Selector */}
              <div className="grid grid-cols-2 gap-2 bg-[#020617] p-1 rounded border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTarget('guild')}
                  className={`py-1.5 px-2 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTarget === 'guild'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Guild (Instant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTarget('global')}
                  className={`py-1.5 px-2 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTarget === 'global'
                      ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Global (~1h)</span>
                </button>
              </div>

              {selectedTarget === 'guild' && (
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Guild ID:</label>
                  <input
                    type="text"
                    value={customGuildId}
                    onChange={(e) => setCustomGuildId(e.target.value)}
                    placeholder="Guild ID (The Boomers)"
                    className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <button
                id="btn-register-slash-commands"
                onClick={() =>
                  onRegisterCommands(selectedTarget === 'guild' ? customGuildId : undefined)
                }
                disabled={isRegistering}
                className="w-full py-2.5 px-4 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="font-mono">Mendaftarkan ke Discord API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Daftarkan Semua Slash Commands</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commands List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SLASH_COMMANDS.map((cmd) => (
          <div
            key={cmd.name}
            className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    /{cmd.name}
                  </span>
                  {cmd.default_member_permissions === '8' && (
                    <span className="px-1.5 py-0.5 rounded bg-red-950/40 border border-red-800/40 text-red-400 text-[10px] font-mono font-bold uppercase">
                      Admin Only
                    </span>
                  )}
                  {cmd.name === 'ask' && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {cmd.description}
              </p>

              {cmd.options && cmd.options.length > 0 && (
                <div className="bg-[#020617] rounded p-2.5 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                    Parameters / Options:
                  </span>
                  {cmd.options.map((opt) => (
                    <div key={opt.name} className="flex items-start gap-2 text-xs font-mono">
                      <span className="text-blue-400 font-bold">
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (String{opt.required ? ', Required' : ''})
                      </span>
                      <span className="text-slate-400 text-[11px] font-sans">- {opt.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Type: Chat Input</span>
              <span>DM: {cmd.dm_permission === false ? 'Disabled' : 'Enabled'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* JSON Schema Inspector */}
      <div className="bg-[#020617] border border-slate-800 rounded-lg p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              // Discord Slash Command Payload (JSON Schema)
            </h3>
          </div>
          <button
            onClick={copyJson}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <pre className="font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-64 p-3 bg-[#050a1a] rounded border border-slate-900">
          {JSON.stringify(SLASH_COMMANDS, null, 2)}
        </pre>
      </div>
    </div>
  );
};
