import React from 'react';
import {
  AlertCircle,
  CalendarCheck2,
  CheckSquare,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  PendingRequest,
  PendingTimesheet,
  TeamMember,
  TeamTaskItem,
} from '../data/teamDashboardData';

interface TeamKpiRowProps {
  requests: PendingRequest[];
  timesheets: PendingTimesheet[];
  members: TeamMember[];
  tasks: TeamTaskItem[];
  onOpenApprovals: (tab: 'requests' | 'timesheets') => void;
  onFilterBehindHours: () => void;
  onFilterOverdueTasks: () => void;
}

export const TeamKpiRow: React.FC<TeamKpiRowProps> = ({
  requests,
  timesheets,
  members,
  tasks,
  onOpenApprovals,
  onFilterBehindHours,
  onFilterOverdueTasks,
}) => {
  const leaveCount = requests.filter((r) => r.category === 'leave').length;
  const wfhCount = requests.filter((r) => r.category === 'home_day').length;
  const clockFixCount = requests.filter((r) => r.category === 'clock_fix').length;
  const overtimeCount = requests.filter((r) => r.category === 'overtime').length;
  const reqTotal = Math.max(1, requests.length);

  const breakdownParts = [
    leaveCount > 0 ? `${leaveCount} leave` : null,
    wfhCount > 0 ? `${wfhCount} home day` : null,
    clockFixCount > 0 ? `${clockFixCount} clock fix` : null,
    overtimeCount > 0 ? `${overtimeCount} overtime` : null,
  ].filter(Boolean);

  const totalMembersCount = Math.max(1, members.length);
  const confirmedTimesheets = Math.max(0, totalMembersCount - timesheets.length);
  const confirmedPct = Math.round((confirmedTimesheets / totalMembersCount) * 100);

  const totalWorked = members.reduce((sum, m) => sum + m.hoursToday, 0);
  const totalExpected = members.reduce((sum, m) => sum + m.expectedToday, 0);
  const behindMembers = members.filter(
    (m) => m.presence !== 'absent' && m.expectedToday - m.hoursToday >= 0.3
  );
  const absentCount = members.filter((m) => m.presence === 'absent').length;
  const hoursRatio =
    totalExpected > 0
      ? Math.min(100, Math.round((totalWorked / totalExpected) * 100))
      : 100;

  const overdueTasks = tasks.filter((t) => t.status === 'overdue');
  const dueTodayTasks = tasks.filter((t) => t.status === 'due_today');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const totalDueTodayPool = dueTodayTasks.length + doneTasks.length;
  const totalTaskPool = Math.max(1, tasks.length);

  return (
    <section
      aria-label="Team key metrics"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {/* 1. Requests waiting */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <ShieldCheck
                className={`w-3.5 h-3.5 ${
                  requests.length > 0
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
                aria-hidden="true"
              />
              <span>Requests waiting</span>
            </div>
            {requests.length > 0 ? (
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                Needs review
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Clear
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {requests.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {requests.length === 1 ? 'request' : 'requests'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="text-slate-500 dark:text-zinc-400 truncate tabular-nums">
              {breakdownParts.length > 0
                ? breakdownParts.join(' · ')
                : 'Queue cleared'}
            </span>
            <button
              type="button"
              onClick={() => onOpenApprovals('requests')}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {requests.length > 0 ? 'Review →' : 'History →'}
            </button>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
            {requests.length === 0 ? (
              <div className="h-full w-full bg-emerald-500 rounded-full" />
            ) : (
              <>
                {leaveCount > 0 && (
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(leaveCount / reqTotal) * 100}%` }}
                    title={`${leaveCount} leave`}
                  />
                )}
                {wfhCount > 0 && (
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${(wfhCount / reqTotal) * 100}%` }}
                    title={`${wfhCount} home day`}
                  />
                )}
                {clockFixCount > 0 && (
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(clockFixCount / reqTotal) * 100}%` }}
                    title={`${clockFixCount} clock fix`}
                  />
                )}
                {overtimeCount > 0 && (
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(overtimeCount / reqTotal) * 100}%` }}
                    title={`${overtimeCount} overtime`}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </article>

      {/* 2. Timesheets to approve */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <CalendarCheck2
                className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500"
                aria-hidden="true"
              />
              <span>Timesheets to approve</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              19–25 Oct
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {timesheets.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              of {totalMembersCount} pending
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span
              className={`truncate tabular-nums ${
                timesheets.length > 0
                  ? 'font-medium text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400 font-medium'
              }`}
            >
              {timesheets.length > 0
                ? `${confirmedTimesheets}/${totalMembersCount} confirmed (${confirmedPct}%)`
                : 'All team timesheets confirmed'}
            </span>
            <button
              type="button"
              onClick={() => onOpenApprovals('timesheets')}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {timesheets.length > 0
                ? `Approve ${timesheets.length} →`
                : 'View →'}
            </button>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                timesheets.length === 0 ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${confirmedPct}%` }}
            />
          </div>
        </div>
      </article>

      {/* 3. Team hours so far */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>Team hours so far</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {hoursRatio}% of pace
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {totalWorked.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              of {totalExpected.toFixed(1)}h expected
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-amber-700 dark:text-amber-400 tabular-nums truncate">
              {behindMembers.length} active behind · {absentCount} absent
            </span>
            <button
              type="button"
              onClick={onFilterBehindHours}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Inspect →
            </button>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${hoursRatio}%` }}
            />
          </div>
        </div>
      </article>

      {/* 4. Tasks due today */}
      <article className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-zinc-700">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              <CheckSquare
                className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400"
                aria-hidden="true"
              />
              <span>Tasks due today</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {doneTasks.length} of {totalDueTodayPool} done
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 tabular-nums">
              {dueTodayTasks.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">left today</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span
              className={`inline-flex items-center gap-1 font-semibold tabular-nums truncate ${
                overdueTasks.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {overdueTasks.length > 0 ? (
                <>
                  <AlertCircle
                    className="w-3.5 h-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{overdueTasks.length} tasks overdue</span>
                </>
              ) : (
                <span>0 tasks overdue</span>
              )}
            </span>
            <button
              type="button"
              onClick={onFilterOverdueTasks}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {overdueTasks.length > 0 ? 'Triage →' : 'View list →'}
            </button>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
            {overdueTasks.length > 0 && (
              <div
                className="h-full bg-red-600"
                style={{
                  width: `${(overdueTasks.length / totalTaskPool) * 100}%`,
                }}
                title={`${overdueTasks.length} overdue`}
              />
            )}
            {dueTodayTasks.length > 0 && (
              <div
                className="h-full bg-blue-600"
                style={{
                  width: `${(dueTodayTasks.length / totalTaskPool) * 100}%`,
                }}
                title={`${dueTodayTasks.length} due today`}
              />
            )}
            {doneTasks.length > 0 && (
              <div
                className="h-full bg-emerald-600"
                style={{
                  width: `${(doneTasks.length / totalTaskPool) * 100}%`,
                }}
                title={`${doneTasks.length} done`}
              />
            )}
          </div>
        </div>
      </article>
    </section>
  );
};
