import React from 'react';
import {
  AlertTriangle,
  Building2,
  Clock,
  Download,
  Hourglass,
  Lock,
  LockOpen,
  Pencil,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import {
  AdminSiteMetric,
  AttendanceRuleConfig,
} from '../data/adminDashboardData';
import { TeamMember } from '../data/teamDashboardData';

interface AdminKpiRowProps {
  sites: AdminSiteMetric[];
  members: TeamMember[];
  approvalBadgeCount: number;
  periodLocked: boolean;
  ruleConfig: AttendanceRuleConfig;
  lateTodayCount: number;
  overtimeHoursToday: number;
  onAddSite: () => void;
  onFixOnBehalf: (memberId?: string) => void;
  onClosePeriod: () => void;
  onChangeRule: () => void;
  onExportReport: () => void;
  onOpenApprovals: () => void;
  onOpenLiveBoard: () => void;
}

export const AdminKpiRow: React.FC<AdminKpiRowProps> = ({
  sites,
  members,
  approvalBadgeCount,
  periodLocked,
  ruleConfig,
  lateTodayCount,
  overtimeHoursToday,
  onAddSite,
  onFixOnBehalf,
  onClosePeriod,
  onChangeRule,
  onExportReport,
  onOpenApprovals,
  onOpenLiveBoard,
}) => {
  const totalDue = sites.reduce((sum, s) => sum + s.totalDue, 0);
  const totalInOffice = sites.reduce((sum, s) => sum + s.workingInOffice, 0);
  const totalWfh = sites.reduce((sum, s) => sum + s.workingFromHome, 0);
  const totalInRightNow = totalInOffice + totalWfh;
  const totalAbsent = sites.reduce((sum, s) => sum + s.absentCount, 0);

  const inPct =
    totalDue > 0 ? Math.min(100, Math.round((totalInRightNow / totalDue) * 100)) : 0;
  const officePct =
    totalDue > 0 ? Math.min(100, (totalInOffice / totalDue) * 100) : 0;
  const wfhPct = totalDue > 0 ? Math.min(100, (totalWfh / totalDue) * 100) : 0;

  const firstAbsentMember = members.find((m) => m.presence === 'absent');

  return (
    <div className="space-y-4">
      {/* Admin Command Action Strip */}
      <section
        aria-label="Admin quick actions"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <button
          type="button"
          onClick={onAddSite}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
            Add a site
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFixOnBehalf()}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
            Fix on behalf
          </span>
        </button>

        <button
          type="button"
          onClick={onClosePeriod}
          className={`bg-white dark:bg-[#121216] border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            periodLocked
              ? 'border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
              : 'border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900'
          }`}
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              periodLocked
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
            }`}
          >
            {periodLocked ? (
              <LockOpen className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Lock className="w-4 h-4" aria-hidden="true" />
            )}
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
            {periodLocked ? 'Period locked' : 'Close the period'}
          </span>
        </button>

        <button
          type="button"
          onClick={onChangeRule}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
            Change a rule
          </span>
        </button>

        <button
          type="button"
          onClick={onExportReport}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Download className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
            Export a report
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenApprovals}
          className={`bg-white dark:bg-[#121216] border rounded-xl px-4 py-3 flex items-center justify-between gap-2 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            approvalBadgeCount > 0
              ? 'border-red-200/80 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50/30 dark:hover:bg-red-950/20'
              : 'border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                approvalBadgeCount > 0
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
              Approval
            </span>
          </span>
          {approvalBadgeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white font-mono text-[11px] font-semibold tabular-nums shrink-0">
              {approvalBadgeCount}
            </span>
          )}
        </button>
      </section>

      {/* Admin KPI Row */}
      <section
        aria-label="Admin attendance and rule metrics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* 1. In right now */}
        <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <Users
                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span>In right now</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {inPct}% coverage
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {totalInRightNow}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                of {totalDue} due
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Clocked in, of everyone due by now
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span className="text-slate-600 dark:text-zinc-300 tabular-nums">
                {totalInOffice} on-site · {totalWfh} from home
              </span>
              <button
                type="button"
                onClick={onOpenLiveBoard}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Live board →
              </button>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
              {officePct > 0 && (
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${officePct}%` }}
                  title={`${totalInOffice} working on-site`}
                />
              )}
              {wfhPct > 0 && (
                <div
                  className="h-full bg-violet-600"
                  style={{ width: `${wfhPct}%` }}
                  title={`${totalWfh} working from home`}
                />
              )}
            </div>
          </div>
        </article>

        {/* 2. Late today */}
        <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <Clock
                  className={`w-3.5 h-3.5 ${
                    lateTodayCount === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                  aria-hidden="true"
                />
                <span>Late today</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {ruleConfig.graceMinutes}m grace
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {lateTodayCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {lateTodayCount === 1 ? 'person' : 'people'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              {lateTodayCount === 0
                ? 'Everyone in arrived on time'
                : 'Arrived past configured grace period'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
                Rules v{ruleConfig.version} active
              </span>
              <button
                type="button"
                onClick={onChangeRule}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Adjust rule →
              </button>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  lateTodayCount === 0 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </article>

        {/* 3. Not in */}
        <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <AlertTriangle
                  className={`w-3.5 h-3.5 ${
                    totalAbsent > 0
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                  aria-hidden="true"
                />
                <span>Not in</span>
              </div>
              <span
                className={`text-[11px] font-medium ${
                  totalAbsent > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {totalAbsent > 0 ? 'Needs follow-up' : 'All accounted'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {totalAbsent}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                {totalAbsent === 1 ? 'person' : 'people'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 truncate">
              {totalAbsent > 0
                ? firstAbsentMember
                  ? `${firstAbsentMember.name} · ${firstAbsentMember.office}`
                  : `${totalAbsent} absent without clock-in`
                : 'Zero unrecorded absences'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span className="text-slate-600 dark:text-zinc-300 tabular-nums">
                {totalAbsent} absent · 0 unverified
              </span>
              <button
                type="button"
                onClick={() => onFixOnBehalf(firstAbsentMember?.id)}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Fix punch →
              </button>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalAbsent > 0 ? 'bg-red-500' : 'bg-emerald-600'
                }`}
                style={{
                  width: `${
                    totalAbsent > 0
                      ? Math.max(12, Math.round((totalAbsent / Math.max(1, totalDue)) * 100))
                      : 100
                  }%`,
                }}
              />
            </div>
          </div>
        </article>

        {/* 4. Overtime today */}
        <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <Hourglass
                  className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500"
                  aria-hidden="true"
                />
                <span>Overtime today</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                &gt;{ruleConfig.overtimeAfterHours}h cap
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
                {overtimeHoursToday}h
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              {overtimeHoursToday === 0
                ? 'Nobody is past their work hours'
                : 'Logged beyond standard shift length'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
              <span className="text-slate-600 dark:text-zinc-300 tabular-nums">
                Auto clock-out {ruleConfig.autoClockOutTime}
              </span>
              <button
                type="button"
                onClick={onExportReport}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                OT report →
              </button>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{
                  width: `${overtimeHoursToday === 0 ? 100 : Math.min(100, overtimeHoursToday * 15)}%`,
                }}
              />
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};
