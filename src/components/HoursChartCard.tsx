import React, { useState } from 'react';
import { ArrowLeft, BarChart3, Table2 } from 'lucide-react';
import { TimeframeKey, WeeklyHourEntry } from '../data/dashboardData';

interface HoursChartCardProps {
  weeks: WeeklyHourEntry[];
  timeframe: TimeframeKey;
  onNavigateTimesheet: () => void;
}

export const HoursChartCard: React.FC<HoursChartCardProps> = ({
  weeks,
  timeframe,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [splitMode, setSplitMode] = useState<'total' | 'split'>('split');
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  const visibleWeeks =
    timeframe === 'week' ? weeks.slice(-1) : weeks;

  const activeDrillWeek =
    selectedWeekId !== null
      ? weeks.find((w) => w.id === selectedWeekId) ?? null
      : timeframe === 'week'
        ? weeks[weeks.length - 1]
        : null;

  const isDailyView = activeDrillWeek !== null;

  const maxY = isDailyView ? 18 : 50;
  const targetRef = isDailyView ? 8 : 40;
  const yTicks = isDailyView ? [0, 4, 8, 12, 16] : [0, 15, 30, 40, 50];

  const totalLogged = visibleWeeks.reduce(
    (sum, w) => sum + w.office + w.wfh,
    0
  );
  const totalWfh = visibleWeeks.reduce((sum, w) => sum + w.wfh, 0);
  const totalOffice = visibleWeeks.reduce((sum, w) => sum + w.office, 0);

  return (
    <section
      id="hours"
      aria-labelledby="hours-card-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isDailyView && timeframe !== 'week' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedWeekId(null);
                  setHoveredBarIdx(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer focus-visible:outline-none focus-visible:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>All weeks</span>
              </button>
            )}
            <h2
              id="hours-card-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              {isDailyView
                ? `Daily hours · ${activeDrillWeek.range}`
                : 'Hours by week'}
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {isDailyView
              ? 'Hover bars for session notes · Target 8h/day'
              : `October · ${totalLogged.toFixed(1)}h total (${totalOffice.toFixed(1)}h office · ${totalWfh.toFixed(1)}h WFH) · Click any bar to drill down`}
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {viewMode === 'chart' && (
            <div
              role="group"
              aria-label="Hours breakdown mode"
              className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
            >
              <button
                type="button"
                onClick={() => setSplitMode('split')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  splitMode === 'split'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                Office / WFH
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('total')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  splitMode === 'total'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                Combined
              </button>
            </div>
          )}

          <div
            role="group"
            aria-label="View mode"
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

      {/* Main Chart or Table Viewport */}
      {viewMode === 'chart' ? (
        <div className="mt-6">
          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              {splitMode === 'split' ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                    Office hours
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    Work from home
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  Logged hours
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 striped-bar border border-blue-600/30" />
                In progress
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-mono text-[11px] tabular-nums">
              <span className="w-4 border-t border-dashed border-slate-400 dark:border-zinc-500" />
              Target: {targetRef}h
            </span>
          </div>

          {/* Interactive Bar Chart Container */}
          <div className="relative h-56 pl-9 pr-2 pt-3 pb-7 select-none">
            {/* Horizontal Y-Axis Gridlines */}
            {yTicks.map((tick) => {
              const bottomPct = (tick / maxY) * 100;
              return (
                <div
                  key={tick}
                  className="absolute left-9 right-2 border-t border-slate-100 dark:border-zinc-800 pointer-events-none"
                  style={{ bottom: `calc(${bottomPct}% * 0.84 + 28px)` }}
                >
                  <span className="absolute -left-9 -top-2 w-7 text-right font-mono text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                    {tick}h
                  </span>
                </div>
              );
            })}

            {/* Target Reference Dashed Line */}
            <div
              className="absolute left-9 right-2 border-t border-dashed border-slate-400/80 dark:border-zinc-500/80 pointer-events-none z-10"
              style={{
                bottom: `calc(${(targetRef / maxY) * 100}% * 0.84 + 28px)`,
              }}
            >
              <span className="absolute right-0 -top-4 bg-white/90 dark:bg-[#121216]/90 px-1 font-mono text-[10px] font-medium text-slate-500 dark:text-zinc-400 tabular-nums">
                {targetRef}h goal
              </span>
            </div>

            {/* Bars Grid */}
            <div className="relative h-full flex items-end justify-around gap-3 z-20">
              {!isDailyView
                ? visibleWeeks.map((week, idx) => {
                    const total = week.office + week.wfh;
                    const totalHeightPct = Math.min(100, (total / maxY) * 100);
                    const officeRatio = total > 0 ? (week.office / total) * 100 : 100;
                    const wfhRatio = total > 0 ? (week.wfh / total) * 100 : 0;
                    const isHovered = hoveredBarIdx === idx;
                    const variance = total - week.target;

                    return (
                      <div
                        key={week.id}
                        className="relative flex-1 max-w-[76px] h-full flex flex-col items-center justify-end group"
                      >
                        {isHovered && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-30 w-44 bg-slate-900 dark:bg-zinc-950 text-white rounded-lg px-3 py-2 shadow-lg border border-slate-700 dark:border-zinc-700 pointer-events-none">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span>{week.range}</span>
                              <span className="font-mono tabular-nums">
                                {total.toFixed(1)}h
                              </span>
                            </div>
                            <div className="mt-1 space-y-0.5 text-[11px] text-slate-300 tabular-nums">
                              <div className="flex justify-between">
                                <span>Office:</span>
                                <span className="font-mono">{week.office.toFixed(1)}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Home (WFH):</span>
                                <span className="font-mono">{week.wfh.toFixed(1)}h</span>
                              </div>
                              <div className="flex justify-between pt-0.5 border-t border-slate-700/80">
                                <span>vs {week.target}h goal:</span>
                                <span
                                  className={`font-mono font-medium ${
                                    variance >= 0 ? 'text-emerald-400' : 'text-amber-300'
                                  }`}
                                >
                                  {variance >= 0 ? `+${variance.toFixed(1)}h` : `${variance.toFixed(1)}h`}
                                </span>
                              </div>
                            </div>
                            <div className="mt-1 text-[10px] text-blue-300">
                              Click bar for daily breakdown
                            </div>
                          </div>
                        )}

                        <span
                          className={`mb-1.5 font-mono text-[11px] tabular-nums transition-colors ${
                            isHovered || week.inProgress
                              ? 'font-semibold text-slate-900 dark:text-zinc-100'
                              : 'text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {total.toFixed(1)}h
                        </span>

                        <button
                          type="button"
                          onMouseEnter={() => setHoveredBarIdx(idx)}
                          onMouseLeave={() => setHoveredBarIdx(null)}
                          onClick={() => {
                            setSelectedWeekId(week.id);
                            setHoveredBarIdx(null);
                          }}
                          aria-label={`${week.range}: ${total.toFixed(1)} hours. Click for daily breakdown`}
                          className={`w-full max-w-[44px] rounded-t-md overflow-hidden flex flex-col-reverse transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
                            isHovered ? 'scale-x-105 brightness-105' : ''
                          }`}
                          style={{ height: `calc(${totalHeightPct}% * 0.84)` }}
                        >
                          {splitMode === 'split' ? (
                            <>
                              <div
                                className={`w-full bg-blue-600 transition-all duration-300 ${
                                  week.inProgress ? 'striped-bar' : ''
                                }`}
                                style={{ height: `${officeRatio}%` }}
                              />
                              {wfhRatio > 0 && (
                                <div
                                  className="w-full bg-emerald-500 transition-all duration-300"
                                  style={{ height: `${wfhRatio}%` }}
                                />
                              )}
                            </>
                          ) : (
                            <div
                              className={`w-full h-full bg-blue-600 transition-all duration-300 ${
                                week.inProgress ? 'striped-bar' : ''
                              }`}
                            />
                          )}
                        </button>

                        <span
                          className={`absolute -bottom-6 text-xs tabular-nums whitespace-nowrap ${
                            week.inProgress || isHovered
                              ? 'font-semibold text-slate-900 dark:text-zinc-100'
                              : 'text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {week.label}
                        </span>
                      </div>
                    );
                  })
                : activeDrillWeek.daily.map((day, idx) => {
                    const total = day.office + day.wfh;
                    const heightPct = Math.min(100, (total / maxY) * 100);
                    const isHovered = hoveredBarIdx === idx;
                    const isWfhOnly = day.wfh > 0 && day.office === 0;
                    const isScheduledEmpty = total === 0;

                    return (
                      <div
                        key={day.date}
                        className="relative flex-1 max-w-[76px] h-full flex flex-col items-center justify-end"
                      >
                        {isHovered && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-30 w-48 bg-slate-900 dark:bg-zinc-950 text-white rounded-lg px-3 py-2 shadow-lg border border-slate-700 dark:border-zinc-700 pointer-events-none">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span>
                                {day.day}, {day.date}
                              </span>
                              <span className="font-mono tabular-nums">
                                {total.toFixed(1)}h
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                              {day.note}
                            </p>
                          </div>
                        )}

                        <span className="mb-1.5 font-mono text-[11px] tabular-nums text-slate-600 dark:text-zinc-400">
                          {isScheduledEmpty ? '—' : `${total.toFixed(1)}h`}
                        </span>

                        <div
                          onMouseEnter={() => setHoveredBarIdx(idx)}
                          onMouseLeave={() => setHoveredBarIdx(null)}
                          className={`w-full max-w-[44px] rounded-t-md overflow-hidden flex flex-col-reverse transition-transform duration-150 cursor-pointer ${
                            isScheduledEmpty
                              ? 'border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900'
                              : isHovered
                                ? 'scale-x-105'
                                : ''
                          }`}
                          style={{
                            height: isScheduledEmpty
                              ? '24px'
                              : `calc(${heightPct}% * 0.84)`,
                          }}
                        >
                          {!isScheduledEmpty && (
                            <>
                              {splitMode === 'split' ? (
                                <>
                                  {day.office > 0 && (
                                    <div
                                      className="w-full bg-blue-600"
                                      style={{
                                        height: `${(day.office / total) * 100}%`,
                                      }}
                                    />
                                  )}
                                  {day.wfh > 0 && (
                                    <div
                                      className="w-full bg-emerald-500"
                                      style={{
                                        height: `${(day.wfh / total) * 100}%`,
                                      }}
                                    />
                                  )}
                                </>
                              ) : (
                                <div
                                  className={`w-full h-full ${
                                    isWfhOnly ? 'bg-emerald-500' : 'bg-blue-600'
                                  }`}
                                />
                              )}
                            </>
                          )}
                        </div>

                        <span className="absolute -bottom-6 text-xs tabular-nums whitespace-nowrap text-slate-600 dark:text-zinc-400">
                          {day.day} · {day.date.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                <th className="py-2 font-medium">
                  {isDailyView ? 'Day' : 'Week'}
                </th>
                <th className="py-2 font-medium text-right">Office</th>
                <th className="py-2 font-medium text-right">WFH</th>
                <th className="py-2 font-medium text-right">Total</th>
                <th className="py-2 font-medium text-right">Goal</th>
                <th className="py-2 font-medium text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
              {!isDailyView
                ? visibleWeeks.map((week) => {
                    const total = week.office + week.wfh;
                    const diff = total - week.target;
                    return (
                      <tr
                        key={week.id}
                        onClick={() => {
                          setSelectedWeekId(week.id);
                          setViewMode('chart');
                        }}
                        className="hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                          {week.range}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-600 dark:text-zinc-400">
                          {week.office.toFixed(1)}h
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">
                          {week.wfh.toFixed(1)}h
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100">
                          {total.toFixed(1)}h
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-500 dark:text-zinc-400">
                          {week.target}h
                        </td>
                        <td
                          className={`py-2.5 text-right font-mono font-medium ${
                            diff >= 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {diff >= 0 ? `+${diff.toFixed(1)}h` : `${diff.toFixed(1)}h`}
                        </td>
                      </tr>
                    );
                  })
                : activeDrillWeek.daily.map((day) => {
                    const total = day.office + day.wfh;
                    const diff = total - day.target;
                    return (
                      <tr key={day.date} className="hover:bg-slate-50 dark:hover:bg-zinc-900">
                        <td className="py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                          {day.day}, {day.date}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-600 dark:text-zinc-400">
                          {day.office.toFixed(1)}h
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">
                          {day.wfh.toFixed(1)}h
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-zinc-100">
                          {total.toFixed(1)}h
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-500 dark:text-zinc-400">
                          {day.target}h
                        </td>
                        <td
                          className={`py-2.5 text-right font-mono font-medium ${
                            diff >= 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {diff >= 0 ? `+${diff.toFixed(1)}h` : `${diff.toFixed(1)}h`}
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
