import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { HourlyAttendancePoint } from '../data/adminDashboardData';
import { OfficeLocation } from '../data/teamDashboardData';

interface AdminHourlyChartCardProps {
  hourlyData: HourlyAttendancePoint[];
  gulbergTarget: number;
  dhaTarget: number;
  officeFilter: 'all' | OfficeLocation;
}

export const AdminHourlyChartCard: React.FC<AdminHourlyChartCardProps> = ({
  hourlyData,
  gulbergTarget,
  dhaTarget,
  officeFilter,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [hoveredHour, setHoveredHour] = useState<string | null>(null);

  const showGulberg = officeFilter === 'all' || officeFilter === 'Gulberg';
  const showDha = officeFilter === 'all' || officeFilter === 'DHA Phase 6';

  const maxStaff = Math.max(
    8,
    gulbergTarget + 1,
    dhaTarget + 1,
    ...hourlyData.map((d) =>
      Math.max(showGulberg ? d.gulberg : 0, showDha ? d.dha : 0)
    )
  );

  const yTicks = [0, Math.round(maxStaff / 2), maxStaff];
  const gulbergTargetPct = (gulbergTarget / maxStaff) * 100;
  const dhaTargetPct = (dhaTarget / maxStaff) * 100;

  const hoveredPoint = hourlyData.find((d) => d.hour === hoveredHour) ?? null;

  return (
    <section
      aria-labelledby="admin-hourly-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="admin-hourly-heading"
            className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
          >
            At work by hour
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Clocked in until 16:00 (Now), then planned from work hours
          </p>
        </div>

        <div
          role="group"
          aria-label="Hourly view mode"
          className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800 shrink-0"
        >
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            aria-label="Chart view"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
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
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="mt-5">
          {/* Interactive Hover Summary Bar */}
          <div className="mb-3 h-5 flex items-center justify-between text-xs tabular-nums">
            {hoveredPoint ? (
              <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-zinc-300">
                <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                  {hoveredPoint.hour}
                  {hoveredPoint.isCurrentHour
                    ? ' (Now)'
                    : hoveredPoint.isPlanned
                      ? ' (Planned)'
                      : ''}
                </span>
                {showGulberg && (
                  <span>
                    Gulberg:{' '}
                    <strong className="font-mono">{hoveredPoint.gulberg}</strong>{' '}
                    (need {gulbergTarget})
                  </span>
                )}
                {showDha && (
                  <span>
                    DHA Phase 6:{' '}
                    <strong className="font-mono">{hoveredPoint.dha}</strong>{' '}
                    (need {dhaTarget})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-zinc-500">
                Hover an hour bar to inspect headcount against site targets
              </span>
            )}
          </div>

          {/* Chart Canvas */}
          <div className="relative pl-7 pr-2">
            {/* Y-axis scale + horizontal gridlines */}
            <div className="relative h-44 flex items-end gap-1.5 sm:gap-2">
              {yTicks.map((tick) => {
                const bottomPct = (tick / maxStaff) * 100;
                return (
                  <div
                    key={tick}
                    style={{ bottom: `${bottomPct}%` }}
                    className="absolute left-0 right-0 pointer-events-none flex items-center"
                  >
                    <span className=" -ml-7 w-5 text-right font-mono text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                      {tick}
                    </span>
                    <div className="flex-1 border-t border-slate-100 dark:border-zinc-800/90" />
                  </div>
                );
              })}

              {/* Gulberg target dashed line */}
              {showGulberg && (
                <div
                  style={{ bottom: `${gulbergTargetPct}%` }}
                  className="absolute left-0 right-0 border-t border-dashed border-blue-500/75 dark:border-blue-400/75 pointer-events-none z-10"
                >
                  <span className="absolute right-0 -top-4 bg-white/90 dark:bg-[#121216]/90 px-1 font-medium text-[10px] text-blue-600 dark:text-blue-400 tabular-nums">
                    Gulberg needs {gulbergTarget}
                  </span>
                </div>
              )}

              {/* DHA target dashed line */}
              {showDha && (
                <div
                  style={{ bottom: `${dhaTargetPct}%` }}
                  className="absolute left-0 right-0 border-t border-dashed border-teal-500/75 dark:border-teal-400/75 pointer-events-none z-10"
                >
                  <span className="absolute left-1 -top-4 bg-white/90 dark:bg-[#121216]/90 px-1 font-medium text-[10px] text-teal-700 dark:text-teal-400 tabular-nums">
                    DHA needs {dhaTarget}
                  </span>
                </div>
              )}

              {/* Grouped Hourly Columns */}
              {hourlyData.map((point) => {
                const gulbergHeightPct = (point.gulberg / maxStaff) * 100;
                const dhaHeightPct = (point.dha / maxStaff) * 100;
                const isHovered = hoveredHour === point.hour;

                return (
                  <div
                    key={point.hour}
                    onMouseEnter={() => setHoveredHour(point.hour)}
                    onMouseLeave={() => setHoveredHour(null)}
                    className={`relative flex-1 h-full flex items-end justify-center gap-0.5 sm:gap-1 rounded-t transition-colors z-20 ${
                      isHovered
                        ? 'bg-slate-100/70 dark:bg-zinc-800/40'
                        : ''
                    }`}
                  >
                    {showGulberg && (
                      <div
                        style={{
                          height: `${gulbergHeightPct}%`,
                          backgroundImage: point.isCurrentHour
                            ? 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.28) 3px, transparent 3px, transparent 6px)'
                            : undefined,
                        }}
                        className={`w-2.5 sm:w-3 rounded-t-sm transition-all duration-200 ${
                          point.isPlanned
                            ? 'bg-blue-300/75 dark:bg-blue-400/40'
                            : 'bg-blue-600 dark:bg-blue-500'
                        }`}
                        title={`${point.hour} · Gulberg: ${point.gulberg}`}
                      />
                    )}
                    {showDha && (
                      <div
                        style={{
                          height: `${dhaHeightPct}%`,
                          backgroundImage: point.isCurrentHour
                            ? 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.28) 3px, transparent 3px, transparent 6px)'
                            : undefined,
                        }}
                        className={`w-2.5 sm:w-3 rounded-t-sm transition-all duration-200 ${
                          point.isPlanned
                            ? 'bg-teal-300/75 dark:bg-teal-400/40'
                            : 'bg-teal-600 dark:bg-teal-500'
                        }`}
                        title={`${point.hour} · DHA Phase 6: ${point.dha}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* X-axis Hours */}
            <div className="mt-2 flex items-center justify-between gap-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500 tabular-nums">
              {hourlyData.map((point, idx) => (
                <span
                  key={point.hour}
                  className={`flex-1 text-center ${
                    point.isCurrentHour
                      ? 'font-semibold text-slate-900 dark:text-zinc-100'
                      : idx % 2 === 0
                        ? 'inline'
                        : 'hidden sm:inline'
                  }`}
                >
                  {point.hour}
                </span>
              ))}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
            {showGulberg && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs bg-blue-600 dark:bg-blue-500"
                  aria-hidden="true"
                />
                <span>Gulberg</span>
              </span>
            )}
            {showDha && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-teal-500"
                  aria-hidden="true"
                />
                <span>DHA Phase 6</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs bg-blue-600"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(-45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 2px, transparent 2px, transparent 4px)',
                }}
                aria-hidden="true"
              />
              <span>Current hour (16:00)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs bg-blue-300/80 dark:bg-blue-400/40"
                aria-hidden="true"
              />
              <span>Planned</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-[#121216]">
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                <th className="py-2 font-medium">Hour</th>
                <th className="py-2 font-medium">Phase</th>
                {showGulberg && (
                  <th className="py-2 font-medium text-right">Gulberg</th>
                )}
                {showDha && (
                  <th className="py-2 font-medium text-right">DHA Phase 6</th>
                )}
                <th className="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
              {hourlyData.map((point) => {
                const total =
                  (showGulberg ? point.gulberg : 0) + (showDha ? point.dha : 0);
                return (
                  <tr
                    key={point.hour}
                    className={
                      point.isCurrentHour
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 font-semibold'
                        : 'hover:bg-slate-50/70 dark:hover:bg-zinc-900/60'
                    }
                  >
                    <td className="py-2 font-mono text-slate-900 dark:text-zinc-100">
                      {point.hour}
                    </td>
                    <td className="py-2 text-slate-500 dark:text-zinc-400">
                      {point.isCurrentHour
                        ? 'Current hour'
                        : point.isPlanned
                          ? 'Planned'
                          : 'Actual'}
                    </td>
                    {showGulberg && (
                      <td className="py-2 text-right font-mono text-slate-800 dark:text-zinc-200">
                        {point.gulberg} / {gulbergTarget}
                      </td>
                    )}
                    {showDha && (
                      <td className="py-2 text-right font-mono text-slate-800 dark:text-zinc-200">
                        {point.dha} / {dhaTarget}
                      </td>
                    )}
                    <td className="py-2 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
