import React from 'react';
import { 
  Bot, 
  ExternalLink, 
  Music, 
  Ticket, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Terminal
} from 'lucide-react';
import { BOT_GUIDES } from '../data/discordTemplates';

export const BotGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
            <Bot className="w-3.5 h-3.5" />
            <span>// Ecosystem: Official Companion Bots</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Companion Bots Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Rekomendasi bot pendukung yang disesuaikan dengan arsitektur channel{' '}
            <strong className="text-slate-200 font-mono">The Boomers</strong> (Musik 24/7 di Voice Lounge, Ticket Support di Information, dan Auto Role di Rules).
          </p>
        </div>
      </div>

      {/* Bot Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {BOT_GUIDES.map((bot) => (
          <div
            key={bot.name}
            className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={bot.avatarUrl}
                    alt={bot.name}
                    className="w-11 h-11 rounded object-cover border border-slate-700 shadow"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide font-mono">
                      {bot.name}
                    </h3>
                    <span className="text-[11px] text-blue-400 font-medium line-clamp-1 font-mono">
                      {bot.tagline}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {bot.purpose}
              </p>

              {/* Recommended Channel */}
              <div className="bg-[#020617] rounded p-2.5 border border-slate-800 mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-1">
                  Target Channel:
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  #{bot.recommendedChannel}
                </span>
              </div>

              {/* Features list */}
              <div className="space-y-1.5 mb-4 font-mono text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Key Capabilities:
                </span>
                {bot.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 font-sans text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Commands list */}
              <div className="bg-[#020617] rounded p-3 border border-slate-800 mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1 font-mono">
                  <Terminal className="w-3 h-3 text-amber-400" />
                  <span>Setup Commands:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {bot.setupCommands.map((cmd, i) => (
                    <code
                      key={i}
                      className="text-[11px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {cmd}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite Action Button */}
            <a
              href={bot.inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-center font-mono"
            >
              <span>Invite {bot.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
