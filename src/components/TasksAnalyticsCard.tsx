import React, { useState } from 'react';
import {
  BarChart3,
  Check,
  ListTodo,
  Plus,
} from 'lucide-react';
import {
  OnTimeWeekEntry,
  TaskItem,
  TaskStatus,
} from '../data/dashboardData';

interface TasksAnalyticsCardProps {
  tasks: TaskItem[];
  onTimeTrend: OnTimeWeekEntry[];
  activeStatusFilter: TaskStatus | 'all';
  onStatusFilterChange: (status: TaskStatus | 'all') => void;
  onToggleTaskDone: (taskId: string) => void;
  onOpenAddTask: () => void;
  viewMode: 'chart' | 'list';
  onViewModeChange: (mode: 'chart' | 'list') => void;
}

const STATUS_META: {
  key: TaskStatus;
  label: string;
  colorHex: string;
  dotClass: string;
  barClass: string;
  textClass: string;
}[] = [
  {
    key: 'overdue',
    label: 'Overdue',
    colorHex: '#DC2626',
    dotClass: 'bg-red-600',
    barClass: 'bg-red-600',
    textClass: 'text-red-700 dark:text-red-400',
  },
  {
    key: 'todo',
    label: 'To do',
    colorHex: '#94A3B8',
    dotClass: 'bg-slate-400',
    barClass: 'bg-slate-300 dark:bg-zinc-600',
    textClass: 'text-slate-700 dark:text-zinc-300',
  },
  {
    key: 'in_progress',
    label: 'In progress',
    colorHex: '#2563EB',
    dotClass: 'bg-blue-600',
    barClass: 'bg-blue-600',
    textClass: 'text-blue-700 dark:text-blue-400',
  },
  {
    key: 'done',
    label: 'Done',
    colorHex: '#16A34A',
    dotClass: 'bg-emerald-600',
    barClass: 'bg-emerald-600',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
];

export const TasksAnalyticsCard: React.FC<TasksAnalyticsCardProps> = ({
  tasks,
  onTimeTrend,
  activeStatusFilter,
  onStatusFilterChange,
  onToggleTaskDone,
  onOpenAddTask,
  viewMode,
  onViewModeChange,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<TaskStatus | null>(null);
  const [hoveredWeekIdx, setHoveredWeekIdx] = useState<number | null>(null);

  const totalTasks = tasks.length;
  const counts: Record<TaskStatus, number> = {
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const donutSize = 96;
  const radius = 37;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;
  const donutSegments = STATUS_META.map((meta) => {
    const count = counts[meta.key];
    const pct = totalTasks > 0 ? count / totalTasks : 0;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePct * circumference;
    cumulativePct += pct;
    return {
      ...meta,
      count,
      pct,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const focusedStatus = hoveredSlice ?? (activeStatusFilter === 'all' ? null : activeStatusFilter);
  const focusedMeta = focusedStatus
    ? donutSegments.find((s) => s.key === focusedStatus)
    : null;

  const svgW = 500;
  const svgH = 128;
  const padL = 32;
  const padR = 14;
  const padT = 16;
  const padB = 24;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const trendPoints = onTimeTrend.map((entry, idx) => {
    const slotW = plotW / onTimeTrend.length;
    const cx = padL + slotW * idx + slotW / 2;
    const cy = padT + (1 - entry.rate / 100) * plotH;
    const barH = (entry.rate / 100) * plotH;
    return { ...entry, cx, cy, barH, idx };
  });

  const linePath = trendPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.cx},${p.cy}`)
    .join(' ');

  const areaPath =
    trendPoints.length > 0
      ? `${linePath} L ${trendPoints[trendPoints.length - 1].cx},${padT + plotH} L ${trendPoints[0].cx},${padT + plotH} Z`
      : '';

  const slaY = padT + (1 - 0.85) * plotH;

  const filteredTasks =
    activeStatusFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === activeStatusFilter);

  return (
    <section
      id="tasks"
      aria-labelledby="tasks-card-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id="tasks-card-heading"
            className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
          >
            My tasks
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {totalTasks} tasks in October · Click a status to filter or mark done
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddTask}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>

          <div
            role="group"
            aria-label="Tasks view mode"
            className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('chart')}
              aria-label="Charts view"
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
              onClick={() => onViewModeChange('list')}
              aria-label="Task list view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Distribution Strip + Interactive Donut */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg
            width={donutSize}
            height={donutSize}
            viewBox={`0 0 ${donutSize} ${donutSize}`}
            className="-rotate-90"
            role="img"
            aria-label="Task status distribution donut chart"
          >
            <circle
              cx={donutSize / 2}
              cy={donutSize / 2}
              r={radius}
              fill="none"
              className="stroke-slate-100 dark:stroke-zinc-800"
              strokeWidth="11"
            />
            {donutSegments.map((seg) => {
              if (seg.count === 0) return null;
              const isHighlighted =
                hoveredSlice === seg.key || activeStatusFilter === seg.key;
              return (
                <circle
                  key={seg.key}
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.colorHex}
                  strokeWidth={isHighlighted ? 14 : 11}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(seg.key)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => {
                    onStatusFilterChange(
                      activeStatusFilter === seg.key ? 'all' : seg.key
                    );
                    onViewModeChange('list');
                  }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums leading-none">
              {focusedMeta ? focusedMeta.count : totalTasks}
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-slate-500 dark:text-zinc-400">
              {focusedMeta ? focusedMeta.label : 'Tasks'}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-zinc-800 gap-0.5">
            {donutSegments.map((seg) => {
              if (seg.count === 0) return null;
              const isDimmed =
                activeStatusFilter !== 'all' && activeStatusFilter !== seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onMouseEnter={() => setHoveredSlice(seg.key)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => {
                    onStatusFilterChange(
                      activeStatusFilter === seg.key ? 'all' : seg.key
                    );
                    onViewModeChange('list');
                  }}
                  aria-label={`Filter ${seg.label}: ${seg.count} tasks`}
                  className={`h-full transition-opacity duration-150 cursor-pointer ${seg.barClass} ${
                    isDimmed ? 'opacity-30' : 'opacity-100'
                  }`}
                  style={{ width: `${seg.pct * 100}%` }}
                />
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {donutSegments.map((seg) => {
              const isActive = activeStatusFilter === seg.key;
              return (
                <button
                  key={seg.key}
                  type="button"
                  onMouseEnter={() => setHoveredSlice(seg.key)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => {
                    const next = isActive ? 'all' : seg.key;
                    onStatusFilterChange(next);
                    if (next !== 'all') {
                      onViewModeChange('list');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                      : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white dark:bg-zinc-950' : seg.dotClass
                    }`}
                  />
                  <span className="font-mono tabular-nums font-semibold">
                    {seg.count}
                  </span>
                  <span>{seg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Area */}
      {viewMode === 'chart' ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
              On-time completion rate, last 8 weeks
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {hoveredWeekIdx !== null
                ? `${onTimeTrend[hoveredWeekIdx].week}: ${onTimeTrend[hoveredWeekIdx].rate}% (${onTimeTrend[hoveredWeekIdx].onTimeCount}/${onTimeTrend[hoveredWeekIdx].totalCount} on time)`
                : '85% SLA benchmark'}
            </span>
          </div>

          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-36 overflow-visible"
              role="img"
              aria-label="8-week task on-time completion combo chart"
            >
              <defs>
                <linearGradient id="onTimeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                </linearGradient>
                <pattern
                  id="diagHatch"
                  width="6"
                  height="6"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="6" height="6" fill="#3B82F6" />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="2.5"
                  />
                </pattern>
              </defs>

              {[0, 50, 100].map((val) => {
                const y = padT + (1 - val / 100) * plotH;
                return (
                  <g key={val}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      className="stroke-slate-100 dark:stroke-zinc-800"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 dark:fill-zinc-500 text-[10px] font-mono tabular-nums"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              <line
                x1={padL}
                y1={slaY}
                x2={svgW - padR}
                y2={slaY}
                className="stroke-slate-400 dark:stroke-zinc-600"
                strokeWidth="1"
                strokeDasharray="4 3"
              />

              <path d={areaPath} fill="url(#onTimeAreaGrad)" />

              {trendPoints.map((pt) => {
                const isHovered = hoveredWeekIdx === pt.idx;
                const barW = 18;
                return (
                  <g key={pt.week}>
                    <rect
                      x={pt.cx - barW / 2}
                      y={pt.cy}
                      width={barW}
                      height={pt.barH}
                      rx="3"
                      fill={
                        pt.inProgress
                          ? 'url(#diagHatch)'
                          : pt.rate < 80
                            ? '#F59E0B'
                            : isHovered
                              ? '#1D4ED8'
                              : '#3B82F6'
                      }
                      fillOpacity={isHovered ? 0.95 : 0.25}
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}

              <path
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {trendPoints.map((pt) => {
                const isHovered = hoveredWeekIdx === pt.idx;
                return (
                  <g
                    key={`node-${pt.week}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredWeekIdx(pt.idx)}
                    onMouseLeave={() => setHoveredWeekIdx(null)}
                  >
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r={isHovered ? 5 : 3.2}
                      fill={pt.rate < 80 ? '#D97706' : '#2563EB'}
                      className="stroke-white dark:stroke-[#121216]"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pt.cx}
                      y={svgH - 6}
                      textAnchor="middle"
                      className={`text-[10px] tabular-nums ${
                        isHovered || pt.inProgress
                          ? 'fill-slate-900 dark:fill-zinc-100 font-semibold'
                          : 'fill-slate-500 dark:fill-zinc-400'
                      }`}
                    >
                      {pt.week}
                    </text>
                    <rect
                      x={pt.cx - 24}
                      y={padT - 8}
                      width="48"
                      height={plotH + 28}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300 tabular-nums">
              Showing {filteredTasks.length}{' '}
              {activeStatusFilter === 'all'
                ? 'tasks'
                : `${STATUS_META.find((m) => m.key === activeStatusFilter)?.label.toLowerCase()} tasks`}
            </span>
            {activeStatusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onStatusFilterChange('all')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-44 overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <li className="py-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                No tasks in this status.
              </li>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.status === 'done';
                const meta = STATUS_META.find((m) => m.key === task.status)!;
                return (
                  <li
                    key={task.id}
                    className="py-2 flex items-center justify-between gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTaskDone(task.id)}
                      className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-zinc-600 group-hover:border-blue-500'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-xs font-medium truncate ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-zinc-500'
                              : 'text-slate-800 dark:text-zinc-200'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                          {task.project} · Due {task.dueDate} ·{' '}
                          <span className={meta.textClass}>{meta.label}</span>
                        </span>
                      </span>
                    </button>
                    <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums shrink-0">
                      {task.estimateHours}h
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </section>
  );
};
