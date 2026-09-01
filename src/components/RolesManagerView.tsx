import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Crown, 
  Play, 
  RefreshCw, 
  Terminal,
  Users,
  Eye,
  AtSign
} from 'lucide-react';
import { BOOMERS_ROLES_TEMPLATE } from '../data/discordTemplates';

interface RolesManagerViewProps {
  onExecuteRoles: (customGuildId?: string) => Promise<void>;
  isExecuting: boolean;
  setupLogs: string[];
  configuredGuildId: string | null;
}

export const RolesManagerView: React.FC<RolesManagerViewProps> = ({
  onExecuteRoles,
  isExecuting,
  setupLogs,
  configuredGuildId,
}) => {
  const [customGuildId, setCustomGuildId] = useState(configuredGuildId || '');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>// Role & Permission Hierarchy: The Boomers</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
              Role & Permission Architect
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Struktur tingkatan role resmi yang terpisah (hoisted) dengan perizinan otomatis dan kode warna terstandardisasi untuk member, gamer, moderator, dan administrator.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={customGuildId}
              onChange={(e) => setCustomGuildId(e.target.value)}
              placeholder="Guild ID (Optional)"
              className="bg-[#020617] border border-slate-700 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 w-full sm:w-44"
            />
            <button
              id="btn-execute-setup-roles"
              onClick={() => onExecuteRoles(customGuildId)}
              disabled={isExecuting}
              className="py-2.5 px-4 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="font-mono">Membuat Roles...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Buat Hierarki Roles (/setup-roles)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-[#0b1329] px-5 py-3 border-b border-slate-800 flex items-center justify-between font-mono">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            // Registered Role Hierarchy (Ordered High to Low)
          </span>
          <span className="text-xs text-slate-500">
            {BOOMERS_ROLES_TEMPLATE.length} Roles Active
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {BOOMERS_ROLES_TEMPLATE.map((role, idx) => {
            const hexColor = '#' + role.color.toString(16).padStart(6, '0');

            return (
              <div
                key={role.name}
                className="p-4 sm:px-6 hover:bg-[#020617]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                  
                  {/* Color circle */}
                  <span
                    className="w-3.5 h-3.5 rounded-sm flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: hexColor }}
                  ></span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white font-mono">
                        {role.name}
                      </span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase border border-slate-800"
                        style={{ color: hexColor, backgroundColor: `${hexColor}15` }}
                      >
                        {hexColor}
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{role.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs pl-8 sm:pl-0 font-mono">
                  {role.hoist && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-[#020617] px-2 py-1 rounded border border-slate-800">
                      <Eye className="w-3 h-3 text-blue-400" />
                      <span>Hoisted</span>
                    </span>
                  )}
                  {role.mentionable && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-[#020617] px-2 py-1 rounded border border-slate-800">
                      <AtSign className="w-3 h-3 text-amber-400" />
                      <span>Mentionable</span>
                    </span>
                  )}
                  {role.permissions === '8' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-1 rounded font-semibold">
                      <Crown className="w-3 h-3" />
                      <span>Administrator</span>
                    </span>
                  ) : role.permissions !== '0' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-1 rounded font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Moderation</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 bg-[#020617] px-2 py-1 rounded border border-slate-800/60">
                      Standard Member
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
