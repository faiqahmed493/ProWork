import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  AttendancePoint,
  ChatReplyMetric,
  TimeframeKey,
} from '../data/dashboardData';

interface KpiRowProps {
  timeframe: TimeframeKey;
  attendanceSeries: AttendancePoint[];
  totalHoursLogged: number;
  monthlyTargetHours: number;
  tasksOnTimeRate: number;
  overdueCount: number;
  chatReplySeries: ChatReplyMetric[];
  waitingQuestionsCount: number;
  onInspectAttendance: () => void;
  onFilterOverdueTasks: () => void;
  onFocusPendingChat: () => void;
  onInspectHours: () => void;
}

export const KpiRow: React.FC<KpiRowProps> = ({
  timeframe,
  attendanceSeries,
  totalHoursLogged,
  monthlyTargetHours,
  tasksOnTimeRate,
  overdueCount,
  chatReplySeries,
  waitingQuestionsCount,
  onInspectAttendance,
  onFilterOverdueTasks,
  onFocusPendingChat,
  onInspectHours,
}) => {
  const [hoveredAttIdx, setHoveredAttIdx] = useState<number | null>(null);
  const [hoveredChatIdx, setHoveredChatIdx] = useState<number | null>(null);
  const [hoverHoursGauge, setHoverHoursGauge] = useState(false);

  const attendancePct =
    timeframe === 'week' ? 96 : timeframe === 'quarter' ? 91 : 89;
  const lateDaysLabel =
    timeframe === 'week'
      ? '0 late days · All on time'
      : timeframe === 'quarter'
        ? '6 late days · Q3 avg 92%'
        : '3 late days · September 92%';

  const displayedHours =
    timeframe === 'week'
      ? 20.4
      : timeframe === 'quarter'
        ? 542.6
        : totalHoursLogged;
  const displayedTarget =
    timeframe === 'week' ? 40 : timeframe === 'quarter' ? 560 : monthlyTargetHours;
  const hoursPct = Math.min(100, Math.round((displayedHours / displayedTarget) * 100));

  const expectedByToday = timeframe === 'week' ? 24.0 : timeframe === 'quarter' ? 548.0 : 180.4;
  const paceDelta = displayedHours - expectedByToday;
  const paceBehindAbs = Math.abs(paceDelta);
  const paceHours = Math.floor(paceBehindAbs);
  const paceMins = Math.round((paceBehindAbs - paceHours) * 60);

  const avgChatMinutes = Math.round(
    chatReplySeries.reduce((sum, item) => sum + item.minutes, 0) /
      chatReplySeries.length
  );

  const sparkW = 112;
  const sparkH = 42;
  const minScore = 78;
  const maxScore = 98;
  const activePoint =
    hoveredAttIdx !== null
      ? attendanceSeries[hoveredAttIdx]
      : attendanceSeries[attendanceSeries.length - 1];

  const sparkPoints = attendanceSeries.map((pt, idx) => {
    const x =
      6 + (idx / Math.max(1, attendanceSeries.length - 1)) * (sparkW - 12);
    const norm = (pt.score - minScore) / (maxScore - minScore);
    const y = sparkH - 6 - norm * (sparkH - 12);
    return { x, y, pt };
  });

  const polylineStr = sparkPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPathStr = `M ${sparkPoints[0].x},${sparkH - 4} L ${sparkPoints
    .map((p) => `${p.x},${p.y}`)
    .join(' L ')} L ${sparkPoints[sparkPoints.length - 1].x},${sparkH - 4} Z`;

  const ringRadius = 21;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (hoursPct / 100) * ringCircumference;

  const taskRingRadius = 21;
  const taskRingCircumference = 2 * Math.PI * taskRingRadius;
  const taskRingOffset =
    taskRingCircumference - (tasksOnTimeRate / 100) * taskRingCircumference;

  return (
    <section
      aria-label="Key performance metrics"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {/* 1. Attendance KPI */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              <span>Attendance</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {attendancePct}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 tabular-nums">
                <TrendingDown className="w-3 h-3" aria-hidden="true" />
                {timeframe === 'week' ? '+4%' : '-3%'}
              </span>
            </div>
          </div>

          <div className="relative flex flex-col items-end">
            <svg
              width={sparkW}
              height={sparkH}
              viewBox={`0 0 ${sparkW} ${sparkH}`}
              className="overflow-visible"
              role="img"
              aria-label="Attendance punctuality sparkline"
            >
              <defs>
                <linearGradient id="attAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPathStr} fill="url(#attAreaGrad)" />
              <polyline
                fill="none"
                className="stroke-slate-500 dark:stroke-zinc-400"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
              {sparkPoints.map((p, idx) => {
                const isHovered = hoveredAttIdx === idx;
                const isLate = p.pt.status === 'late';
                const isLast = idx === sparkPoints.length - 1;
                return (
                  <g key={p.pt.date}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 4.5 : isLate ? 3 : isLast ? 3.5 : 0}
                      fill={isLate ? '#DC2626' : '#2563EB'}
                      className="stroke-white dark:stroke-[#121216] transition-all duration-150"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={8}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredAttIdx(idx)}
                      onMouseLeave={() => setHoveredAttIdx(null)}
                      onClick={onInspectAttendance}
                    />
                  </g>
                );
              })}
            </svg>
            <span className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400">
              {activePoint.date} · {activePoint.checkIn}
              {activePoint.status === 'late' ? ' (Late)' : ''}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 truncate">{lateDaysLabel}</span>
          <button
            type="button"
            onClick={onInspectAttendance}
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            Log →
          </button>
        </div>
      </article>

      {/* 2. Hours this month KPI */}
      <article
        className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700 relative"
        onMouseEnter={() => setHoverHoursGauge(true)}
        onMouseLeave={() => setHoverHoursGauge(false)}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
              <span>
                {timeframe === 'week'
                  ? 'Hours this week'
                  : timeframe === 'quarter'
                    ? 'Hours this quarter'
                    : 'Hours this month'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {displayedHours.toFixed(1)}h
              </span>
              <span className="text-sm text-slate-500 dark:text-zinc-400 tabular-nums">
                of {displayedTarget}h
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onInspectHours}
            aria-label={`Monthly hours completion ${hoursPct}%`}
            className="relative w-13 h-13 flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-full"
          >
            <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
              <circle
                cx="26"
                cy="26"
                r={ringRadius}
                fill="none"
                className="stroke-slate-200 dark:stroke-zinc-800"
                strokeWidth="4.5"
              />
              <circle
                cx="26"
                cy="26"
                r={ringRadius}
                fill="none"
                stroke="#2563EB"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute text-[11px] font-mono font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
              {hoursPct}%
            </span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className={`font-medium tabular-nums ${
                paceDelta < 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {paceDelta < 0
                ? `${paceHours}h ${paceMins}m behind pace`
                : `${paceHours}h ${paceMins}m ahead of pace`}
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {hoverHoursGauge ? 'Need 8.5h/day' : `Target ${expectedByToday}h`}
            </span>
          </div>
          <div className="relative h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${hoursPct}%` }}
            />
            <div
              aria-hidden="true"
              title={`Expected pace: ${expectedByToday}h`}
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900/50 dark:bg-zinc-100/60"
              style={{
                left: `${Math.min(99, Math.round((expectedByToday / displayedTarget) * 100))}%`,
              }}
            />
          </div>
        </div>
      </article>

      {/* 3. Tasks on time KPI */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <CheckCircle2
                className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span>Tasks on time</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {tasksOnTimeRate}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                <TrendingUp className="w-3 h-3" aria-hidden="true" />
                +2%
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onFilterOverdueTasks}
            aria-label={`Tasks on time ${tasksOnTimeRate}%`}
            className="relative w-13 h-13 flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-full"
          >
            <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
              <circle
                cx="26"
                cy="26"
                r={taskRingRadius}
                fill="none"
                className="stroke-red-100 dark:stroke-red-950/60"
                strokeWidth="4.5"
              />
              <circle
                cx="26"
                cy="26"
                r={taskRingRadius}
                fill="none"
                stroke="#16A34A"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={taskRingCircumference}
                strokeDashoffset={taskRingOffset}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute text-[11px] font-mono font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
              {tasksOnTimeRate}%
            </span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 truncate">Finished by due date</span>
          {overdueCount > 0 ? (
            <button
              type="button"
              onClick={onFilterOverdueTasks}
              className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline tabular-nums"
            >
              {overdueCount} overdue →
            </button>
          ) : (
            <span className="font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
              0 overdue
            </span>
          )}
        </div>
      </article>

      {/* 4. Chat replies KPI */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <MessageSquare
                className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500"
                aria-hidden="true"
              />
              <span>Chat replies</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {avgChatMinutes}m
              </span>
              <span className="text-sm text-slate-500 dark:text-zinc-400">average</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div
              className="h-[42px] flex items-end gap-[3px]"
              role="img"
              aria-label="Last 12 chat reply response times"
            >
              {chatReplySeries.map((reply, idx) => {
                const barH = Math.max(8, Math.round((reply.minutes / 60) * 38));
                const isSlow = reply.minutes > 45;
                const isHovered = hoveredChatIdx === idx;
                return (
                  <button
                    key={reply.index}
                    type="button"
                    onMouseEnter={() => setHoveredChatIdx(idx)}
                    onMouseLeave={() => setHoveredChatIdx(null)}
                    onClick={onFocusPendingChat}
                    aria-label={`${reply.colleague}: ${reply.minutes}m`}
                    className={`w-[5px] rounded-t-sm transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 ${
                      isHovered
                        ? 'bg-blue-600 scale-y-105'
                        : isSlow
                          ? 'bg-amber-400'
                          : 'bg-slate-300 dark:bg-zinc-700 hover:bg-blue-500'
                    }`}
                    style={{ height: `${barH}px` }}
                  />
                );
              })}
            </div>
            <span className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500 dark:text-zinc-400">
              {hoveredChatIdx !== null
                ? `${chatReplySeries[hoveredChatIdx].colleague} · ${chatReplySeries[hoveredChatIdx].minutes}m`
                : `${chatReplySeries.length} replies · target 30m`}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 truncate">
            {chatReplySeries.length} answers this month
          </span>
          {waitingQuestionsCount > 0 ? (
            <button
              type="button"
              onClick={onFocusPendingChat}
              className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline tabular-nums"
            >
              {waitingQuestionsCount} waiting →
            </button>
          ) : (
            <span className="font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
              All answered
            </span>
          )}
        </div>
      </article>
    </section>
  );
};
