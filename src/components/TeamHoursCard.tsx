import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { TeamMember } from '../data/teamDashboardData';

export type HoursSortMode = 'behind' | 'hours_desc' | 'shift' | 'name';

interface TeamHoursCardProps {
  members: TeamMember[];
  sortMode: HoursSortMode;
  onSortModeChange: (mode: HoursSortMode) => void;
  onInspectMember: (memberId: string) => void;
}

const AXIS_TICKS = [0, 1.5, 3, 4.5, 6];
const MAX_SCALE_HOURS = 6.0;

export const TeamHoursCard: React.FC<TeamHoursCardProps> = ({
  members,
  sortMode,
  onSortModeChange,
  onInspectMember,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const shiftOrder: Record<TeamMember['shiftWave'], number> = {
    Morning: 0,
    Midday: 1,
    Afternoon: 2,
  };

  const sortedMembers = [...members].sort((a, b) => {
    if (sortMode === 'behind') {
      const gapA = a.expectedToday - a.hoursToday;
      const gapB = b.expectedToday - b.hoursToday;
      return gapB - gapA;
    }
    if (sortMode === 'shift') {
      const diff = shiftOrder[a.shiftWave] - shiftOrder[b.shiftWave];
      return diff !== 0 ? diff : b.hoursToday - a.hoursToday;
    }
    if (sortMode === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.hoursToday - a.hoursToday;
  });

  const hoveredMember = hoveredId
    ? sortedMembers.find((m) => m.id === hoveredId) ?? null
    : null;

  return (
    <section
      id="team-hours"
      aria-labelledby="team-hours-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        {/* Card Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="team-hours-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Team hours today
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Logged vs shift-adjusted pace tick (Morning · Midday · Afternoon)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label="Sort team hours"
              className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
            >
              {(
                [
                  { id: 'hours_desc', label: 'Most' },
                  { id: 'behind', label: 'Behind' },
                  { id: 'shift', label: 'Shift' },
                  { id: 'name', label: 'A–Z' },
                ] as { id: HoursSortMode; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSortModeChange(opt.id)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    sortMode === opt.id
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="Team hours view mode"
              className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
            >
              <button
                type="button"
                onClick={() => setViewMode('chart')}
                aria-label="Chart view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'chart'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend & Live Precision Readout */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
              On pace
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
              Behind pace
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-0.5 h-3 bg-slate-900 dark:bg-zinc-100" />
              Expected by now
            </span>
          </div>
          <span className="font-mono text-slate-600 dark:text-zinc-300 tabular-nums">
            {hoveredMember
              ? hoveredMember.presence === 'absent'
                ? `${hoveredMember.name} · Absent (expected ${hoveredMember.expectedToday.toFixed(1)}h)`
                : `${hoveredMember.shiftWave} shift · In ${hoveredMember.checkInTime} · Expected ${hoveredMember.expectedToday.toFixed(1)}h`
              : 'Click any row to inspect'}
          </span>
        </div>

        {viewMode === 'chart' ? (
          <div className="mt-3">
            {/* Numeric X-Axis Scale Header */}
            <div className="hidden sm:flex items-center gap-3 pb-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 tabular-nums">
              <span className="w-7 shrink-0" aria-hidden="true" />
              <span className="w-32 sm:w-36 shrink-0">Member · Shift</span>
              <div className="flex-1 relative h-3.5">
                {AXIS_TICKS.map((tick) => {
                  const leftPct = (tick / MAX_SCALE_HOURS) * 100;
                  return (
                    <span
                      key={tick}
                      className="absolute top-0 -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                      style={{ left: `${leftPct}%` }}
                    >
                      {tick}h
                    </span>
                  );
                })}
              </div>
              <span className="w-28 text-right shrink-0">Logged · Pace</span>
            </div>

            {/* Bullet Rows with Subtle Vertical Gridlines */}
            <div className="relative space-y-1">
              {sortedMembers.map((member) => {
                const barPct = Math.min(
                  100,
                  (member.hoursToday / MAX_SCALE_HOURS) * 100
                );
                const tickPct = Math.min(
                  98,
                  (member.expectedToday / MAX_SCALE_HOURS) * 100
                );
                const delta = member.hoursToday - member.expectedToday;
                const isBehind =
                  member.presence !== 'absent' && delta <= -0.3;
                const isAbsent = member.presence === 'absent';
                const deltaLabel = isAbsent
                  ? 'Absent'
                  : delta >= 0
                    ? `+${delta.toFixed(1)}h`
                    : `${delta.toFixed(1)}h`;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onMouseEnter={() => setHoveredId(member.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onInspectMember(member.id)}
                    className="w-full flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <span
                      className={`w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 ${member.avatarBg}`}
                    >
                      {member.initials}
                    </span>

                    <span className="w-32 sm:w-36 shrink-0 min-w-0">
                      <span className="block text-xs font-medium text-slate-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                        {member.name}
                      </span>
                      <span className="block text-[11px] text-slate-400 dark:text-zinc-500 truncate tabular-nums">
                        {member.office}
                        {member.presence === 'wfh' ? ' · WFH' : ''} ·{' '}
                        {member.shiftWave}
                      </span>
                    </span>

                    {/* Bullet Progress Track + Gridlines */}
                    <div className="flex-1 relative h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-visible">
                      {AXIS_TICKS.slice(1, -1).map((tick) => (
                        <span
                          key={tick}
                          aria-hidden="true"
                          className="hidden sm:block absolute top-0 bottom-0 w-px bg-slate-200/80 dark:bg-zinc-700/70 pointer-events-none"
                          style={{ left: `${(tick / MAX_SCALE_HOURS) * 100}%` }}
                        />
                      ))}

                      {!isAbsent && (
                        <div
                          className={`relative z-10 h-full rounded-full transition-all duration-300 ${
                            isBehind ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${barPct}%` }}
                        />
                      )}

                      {/* Expected by now vertical tick */}
                      <span
                        aria-hidden="true"
                        className="absolute z-20 -top-1 -bottom-1 w-0.5 bg-slate-900 dark:bg-zinc-100 rounded-full"
                        style={{ left: `${tickPct}%` }}
                      />
                    </div>

                    {/* Right Logged + Pace Delta */}
                    <span className="w-28 text-right shrink-0 font-mono text-xs tabular-nums flex items-center justify-end gap-2">
                      {isAbsent ? (
                        <span className="font-sans font-semibold text-red-600 dark:text-red-400">
                          Absent
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-900 dark:text-zinc-100">
                            {member.hoursToday.toFixed(1)}h
                          </span>
                          <span
                            className={`w-11 text-right text-[11px] font-medium ${
                              isBehind
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {deltaLabel}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                  <th className="py-2 font-medium">Team member</th>
                  <th className="py-2 font-medium">Shift · Office</th>
                  <th className="py-2 font-medium text-right">Check-in</th>
                  <th className="py-2 font-medium text-right">Worked</th>
                  <th className="py-2 font-medium text-right">Expected</th>
                  <th className="py-2 font-medium text-right">Pace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {sortedMembers.map((m) => {
                  const delta = m.hoursToday - m.expectedToday;
                  const isBehind = m.presence !== 'absent' && delta <= -0.3;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => onInspectMember(m.id)}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                    >
                      <td className="py-2 font-medium text-slate-900 dark:text-zinc-100">
                        {m.name}
                      </td>
                      <td className="py-2 text-slate-500 dark:text-zinc-400">
                        {m.shiftWave} · {m.office}
                        {m.presence === 'wfh' ? ' (WFH)' : ''}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-600 dark:text-zinc-400">
                        {m.checkInTime ?? '—'}
                      </td>
                      <td className="py-2 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100">
                        {m.hoursToday.toFixed(1)}h
                      </td>
                      <td className="py-2 text-right font-mono text-slate-500 dark:text-zinc-400">
                        {m.expectedToday.toFixed(1)}h
                      </td>
                      <td className="py-2 text-right font-mono font-medium">
                        {m.presence === 'absent' ? (
                          <span className="font-sans text-red-600 dark:text-red-400">
                            Absent
                          </span>
                        ) : isBehind ? (
                          <span className="text-amber-700 dark:text-amber-400">
                            {delta.toFixed(1)}h behind
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {delta >= 0
                              ? `+${delta.toFixed(1)}h`
                              : `${delta.toFixed(1)}h`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
