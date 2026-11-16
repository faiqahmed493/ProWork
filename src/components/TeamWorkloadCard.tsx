import React, { useState } from 'react';
import { ArrowRightLeft, BarChart3, Table2 } from 'lucide-react';
import { TeamMember } from '../data/teamDashboardData';

type WorkloadSortMode = 'load_desc' | 'capacity' | 'name';

interface TeamWorkloadCardProps {
  members: TeamMember[];
  onInspectMember: (memberId: string) => void;
  onAssignToMember: (memberId: string) => void;
  onOpenRebalance: () => void;
}

const AXIS_TICKS = [0, 1.5, 3, 4.5, 6, 7.5];
const MAX_SCALE_HOURS = 7.5;

export const TeamWorkloadCard: React.FC<TeamWorkloadCardProps> = ({
  members,
  onInspectMember,
  onAssignToMember,
  onOpenRebalance,
}) => {
  const [sortMode, setSortMode] = useState<WorkloadSortMode>('load_desc');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sortedMembers = [...members].sort((a, b) => {
    if (sortMode === 'capacity') {
      const capA = a.workTimeLeft - a.workloadHours;
      const capB = b.workTimeLeft - b.workloadHours;
      return capB - capA;
    }
    if (sortMode === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.workloadHours - a.workloadHours;
  });

  const overloadedMembers = members.filter(
    (m) => m.workloadHours > m.workTimeLeft
  );
  const absentWithLoad = members.filter(
    (m) => m.presence === 'absent' && m.workloadHours > 0
  );
  const spareCapacityCount = members.filter(
    (m) => m.presence !== 'absent' && m.workTimeLeft - m.workloadHours >= 3.5
  ).length;

  const hasBottleneck =
    overloadedMembers.length > 0 || absentWithLoad.length > 0;

  return (
    <section
      id="team-workload"
      aria-labelledby="team-workload-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="team-workload-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Workload this week
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              Assigned task hours vs work time left · {overloadedMembers.length}{' '}
              overloaded · {spareCapacityCount} with capacity
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label="Sort workload"
              className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
            >
              {(
                [
                  { id: 'load_desc', label: 'Highest' },
                  { id: 'capacity', label: 'Capacity' },
                  { id: 'name', label: 'A–Z' },
                ] as { id: WorkloadSortMode; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortMode(opt.id)}
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
              aria-label="Workload view mode"
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

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-zinc-400 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
              Within capacity
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
              Overflow
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
              Absent w/ open tasks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-0.5 h-3 bg-slate-900 dark:bg-zinc-100" />
              Time left
            </span>
          </div>
          {hoveredId && (
            <span className="font-mono text-slate-700 dark:text-zinc-300 tabular-nums">
              {(() => {
                const m = sortedMembers.find((x) => x.id === hoveredId);
                if (!m) return '';
                const spare = m.workTimeLeft - m.workloadHours;
                return spare < 0
                  ? `${Math.abs(spare).toFixed(1)}h over capacity`
                  : `${spare.toFixed(1)}h spare capacity`;
              })()}
            </span>
          )}
        </div>

        {viewMode === 'chart' ? (
          <div className="mt-3">
            {/* Numeric X-Axis Scale Header */}
            <div className="hidden sm:flex items-center gap-3 pb-1.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 tabular-nums">
              <span className="w-7 shrink-0" aria-hidden="true" />
              <span className="w-32 sm:w-36 shrink-0">Member · Balance</span>
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
              <span className="w-24 text-right shrink-0">Assigned</span>
            </div>

            <div className="space-y-1">
              {sortedMembers.map((member) => {
                const tickPct = Math.min(
                  98,
                  (member.workTimeLeft / MAX_SCALE_HOURS) * 100
                );
                const totalBarPct = Math.min(
                  100,
                  (member.workloadHours / MAX_SCALE_HOURS) * 100
                );
                const isOver = member.workloadHours > member.workTimeLeft;
                const isAbsentLoad =
                  member.presence === 'absent' && member.workloadHours > 0;
                const spare = member.workTimeLeft - member.workloadHours;

                const basePct = isOver ? tickPct : totalBarPct;
                const overflowPct = isOver
                  ? Math.max(0, totalBarPct - tickPct)
                  : 0;

                return (
                  <div
                    key={member.id}
                    onMouseEnter={() => setHoveredId(member.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => onInspectMember(member.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
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
                        <span
                          className={`block text-[11px] truncate tabular-nums ${
                            isOver
                              ? 'text-red-600 dark:text-red-400 font-medium'
                              : isAbsentLoad
                                ? 'text-amber-700 dark:text-amber-400 font-medium'
                                : 'text-slate-400 dark:text-zinc-500'
                          }`}
                        >
                          {isOver
                            ? `+${Math.abs(spare).toFixed(1)}h over`
                            : isAbsentLoad
                              ? 'Absent · Reassign'
                              : `${spare.toFixed(1)}h free`}
                        </span>
                      </span>

                      {/* Split Overflow Workload Track + Gridlines */}
                      <div className="flex-1 relative h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-visible">
                        {AXIS_TICKS.slice(1, -1).map((tick) => (
                          <span
                            key={tick}
                            aria-hidden="true"
                            className="hidden sm:block absolute top-0 bottom-0 w-px bg-slate-200/80 dark:bg-zinc-700/70 pointer-events-none"
                            style={{
                              left: `${(tick / MAX_SCALE_HOURS) * 100}%`,
                            }}
                          />
                        ))}

                        {/* Base bar up to capacity tick */}
                        <div
                          className={`relative z-10 h-full transition-all duration-300 ${
                            overflowPct > 0 ? 'rounded-l-full' : 'rounded-full'
                          } ${isAbsentLoad ? 'bg-amber-500' : 'bg-blue-600'}`}
                          style={{ width: `${basePct}%` }}
                        />

                        {/* Overflow segment past capacity tick */}
                        {overflowPct > 0 && (
                          <div
                            className="absolute z-10 top-0 bottom-0 bg-red-600 rounded-r-full transition-all duration-300"
                            style={{
                              left: `${tickPct}%`,
                              width: `${overflowPct}%`,
                            }}
                          />
                        )}

                        {/* Capacity tick */}
                        <span
                          aria-hidden="true"
                          className="absolute z-20 -top-1 -bottom-1 w-0.5 bg-slate-900 dark:bg-zinc-100 rounded-full"
                          style={{ left: `${tickPct}%` }}
                        />
                      </div>

                      <span
                        className={`w-24 text-right font-mono text-xs font-semibold tabular-nums shrink-0 ${
                          isOver
                            ? 'text-red-600 dark:text-red-400'
                            : isAbsentLoad
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-900 dark:text-zinc-100'
                        }`}
                      >
                        {member.workloadHours.toFixed(1)}h
                        <span className="font-normal text-slate-400 dark:text-zinc-500">
                          /{member.workTimeLeft.toFixed(1)}
                        </span>
                      </span>
                    </button>

                    {member.presence !== 'absent' && !isOver && (
                      <button
                        type="button"
                        onClick={() => onAssignToMember(member.id)}
                        className="hidden sm:inline-flex text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        + Task
                      </button>
                    )}
                  </div>
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
                  <th className="py-2 font-medium text-right">Assigned</th>
                  <th className="py-2 font-medium text-right">Time left</th>
                  <th className="py-2 font-medium text-right">Spare</th>
                  <th className="py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {sortedMembers.map((m) => {
                  const spare = m.workTimeLeft - m.workloadHours;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <td className="py-2 font-medium text-slate-900 dark:text-zinc-100">
                        <button
                          type="button"
                          onClick={() => onInspectMember(m.id)}
                          className="hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer"
                        >
                          {m.name}
                        </button>
                      </td>
                      <td className="py-2 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100">
                        {m.workloadHours.toFixed(1)}h
                      </td>
                      <td className="py-2 text-right font-mono text-slate-500 dark:text-zinc-400">
                        {m.workTimeLeft.toFixed(1)}h
                      </td>
                      <td
                        className={`py-2 text-right font-mono font-medium ${
                          spare < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {spare >= 0
                          ? `+${spare.toFixed(1)}h`
                          : `${spare.toFixed(1)}h`}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => onAssignToMember(m.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottleneck Smart Rebalance Bar */}
      {hasBottleneck && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 dark:text-zinc-400 tabular-nums">
            {overloadedMembers.length > 0 && absentWithLoad.length > 0
              ? `${overloadedMembers[0].name.split(' ')[0]} is over capacity & ${absentWithLoad[0].name.split(' ')[0]} is absent with open tasks`
              : overloadedMembers.length > 0
                ? `${overloadedMembers[0].name} is over weekly capacity`
                : `${absentWithLoad[0].name} is absent with ${absentWithLoad[0].workloadHours.toFixed(1)}h open`}
          </span>
          <button
            type="button"
            onClick={onOpenRebalance}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Rebalance plan</span>
          </button>
        </div>
      )}
    </section>
  );
};
