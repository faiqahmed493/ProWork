import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckSquare,
  Home,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import {
  PresenceStatus,
  TeamMember,
} from '../data/teamDashboardData';

interface TeamPresenceBannerProps {
  members: TeamMember[];
  pendingRequestCount: number;
  pendingTimesheetCount: number;
  onOpenApprovals: (tab: 'requests' | 'timesheets') => void;
  onOpenAssignTask: (preselectedMemberId?: string) => void;
  onOpenMessageTeam: (preselectedRecipient?: string) => void;
  onOpenSchedule: () => void;
  onInspectMember: (memberId: string) => void;
  onQuickReassignAbsent: (memberId: string) => void;
}

export const TeamPresenceBanner: React.FC<TeamPresenceBannerProps> = ({
  members,
  pendingRequestCount,
  pendingTimesheetCount,
  onOpenApprovals,
  onOpenAssignTask,
  onOpenMessageTeam,
  onOpenSchedule,
  onInspectMember,
  onQuickReassignAbsent,
}) => {
  const [expandedStatus, setExpandedStatus] = useState<PresenceStatus | null>(
    null
  );

  const working = members.filter((m) => m.presence === 'working');
  const wfh = members.filter((m) => m.presence === 'wfh');
  const absent = members.filter((m) => m.presence === 'absent');

  const total = Math.max(1, members.length);
  const workingPct = (working.length / total) * 100;
  const wfhPct = (wfh.length / total) * 100;
  const absentPct = (absent.length / total) * 100;

  // Office-level coverage breakdown
  const gulbergMembers = members.filter((m) => m.office === 'Gulberg');
  const gulbergActive = gulbergMembers.filter((m) => m.presence !== 'absent').length;
  const dhaMembers = members.filter((m) => m.office === 'DHA Phase 6');
  const dhaActive = dhaMembers.filter((m) => m.presence !== 'absent').length;

  const rosterForStatus =
    expandedStatus === 'working'
      ? working
      : expandedStatus === 'wfh'
        ? wfh
        : expandedStatus === 'absent'
          ? absent
          : [];

  const toggleStatus = (status: PresenceStatus) => {
    setExpandedStatus((prev) => (prev === status ? null : status));
  };

  return (
    <div className="space-y-4">
      {/* Quick Command Action Strip */}
      <section
        aria-label="Quick manager actions"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        <button
          type="button"
          onClick={() => onOpenApprovals('requests')}
          className={`rounded-xl px-4 py-3 flex items-center justify-between gap-2.5 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 border ${
            pendingRequestCount > 0
              ? 'bg-white dark:bg-[#121216] border-red-200/90 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50/30 dark:hover:bg-red-950/20'
              : 'bg-white dark:bg-[#121216] border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900'
          }`}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                pendingRequestCount > 0
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
                Approve requests
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                {pendingRequestCount > 0
                  ? `${pendingRequestCount} waiting review`
                  : 'Queue cleared'}
              </span>
            </span>
          </span>
          {pendingRequestCount > 0 && (
            <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400 tabular-nums shrink-0">
              {pendingRequestCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onOpenAssignTask()}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
              Assign a task
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
              Check free capacity
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenMessageTeam()}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
              Message team
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
              Office or direct
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenSchedule}
          className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
              View schedule
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
              Today &amp; tomorrow
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenApprovals('timesheets')}
          className="col-span-2 sm:col-span-1 bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between gap-2.5 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                pendingTimesheetCount > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap truncate">
                Team timesheets
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
                {pendingTimesheetCount > 0
                  ? `${pendingTimesheetCount} to confirm`
                  : 'All confirmed'}
              </span>
            </span>
          </span>
          {pendingTimesheetCount > 0 && (
            <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums shrink-0">
              {pendingTimesheetCount}
            </span>
          )}
        </button>
      </section>

      {/* Interactive Team Today Presence Strip */}
      <section
        id="team-presence"
        aria-labelledby="team-today-heading"
        className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-5 transition-colors"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="team-today-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Team today
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {members.length} people · Updated 15:23 · Click any segment or
              status below to inspect roster
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Compact Office Coverage Readout */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {gulbergMembers.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
                  <span>Gulberg:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                    {gulbergActive}/{gulbergMembers.length}
                  </span>
                </span>
              )}
              {gulbergMembers.length > 0 && dhaMembers.length > 0 && (
                <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">
                  ·
                </span>
              )}
              {dhaMembers.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span>DHA Phase 6:</span>
                  <span
                    className={`font-mono font-semibold ${
                      dhaActive < dhaMembers.length
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    {dhaActive}/{dhaMembers.length}
                  </span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setExpandedStatus((prev) => (prev ? null : 'working'))
              }
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {expandedStatus ? 'Hide roster' : 'Inspect roster →'}
            </button>
          </div>
        </div>

        {/* Interactive Segmented Presence Bar */}
        <div
          className="mt-3.5 h-3 w-full rounded-full overflow-hidden flex gap-0.5 bg-slate-100 dark:bg-zinc-800"
          role="group"
          aria-label="Team presence distribution"
        >
          {working.length > 0 && (
            <button
              type="button"
              onClick={() => toggleStatus('working')}
              title={`Working in office: ${working.length}`}
              aria-label={`Inspect ${working.length} people working in office`}
              className={`h-full bg-emerald-600 transition-opacity cursor-pointer ${
                expandedStatus && expandedStatus !== 'working'
                  ? 'opacity-35'
                  : 'opacity-100 hover:brightness-105'
              }`}
              style={{ width: `${workingPct}%` }}
            />
          )}
          {wfh.length > 0 && (
            <button
              type="button"
              onClick={() => toggleStatus('wfh')}
              title={`Working from home: ${wfh.length}`}
              aria-label={`Inspect ${wfh.length} people working from home`}
              className={`h-full bg-indigo-600 transition-opacity cursor-pointer ${
                expandedStatus && expandedStatus !== 'wfh'
                  ? 'opacity-35'
                  : 'opacity-100 hover:brightness-105'
              }`}
              style={{ width: `${wfhPct}%` }}
            />
          )}
          {absent.length > 0 && (
            <button
              type="button"
              onClick={() => toggleStatus('absent')}
              title={`Absent: ${absent.length}`}
              aria-label={`Inspect ${absent.length} people absent`}
              className={`h-full bg-rose-500 transition-opacity cursor-pointer ${
                expandedStatus && expandedStatus !== 'absent'
                  ? 'opacity-35'
                  : 'opacity-100 hover:brightness-105'
              }`}
              style={{ width: `${absentPct}%` }}
            />
          )}
        </div>

        {/* Interactive Filter Buttons + Inline Absent Coverage Action */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleStatus('working')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                expandedStatus === 'working'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800'
              }`}
            >
              <UserCheck
                className={`w-3.5 h-3.5 ${
                  expandedStatus === 'working'
                    ? 'text-emerald-300 dark:text-emerald-700'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono tabular-nums font-semibold">
                {working.length}
              </span>
              <span>Working</span>
            </button>

            <button
              type="button"
              onClick={() => toggleStatus('wfh')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                expandedStatus === 'wfh'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800'
              }`}
            >
              <Home
                className={`w-3.5 h-3.5 ${
                  expandedStatus === 'wfh'
                    ? 'text-indigo-300 dark:text-indigo-700'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono tabular-nums font-semibold">
                {wfh.length}
              </span>
              <span>From home</span>
            </button>

            <button
              type="button"
              onClick={() => toggleStatus('absent')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                expandedStatus === 'absent'
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800'
              }`}
            >
              <UserMinus
                className={`w-3.5 h-3.5 ${
                  expandedStatus === 'absent'
                    ? 'text-rose-300 dark:text-rose-700'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono tabular-nums font-semibold">
                {absent.length}
              </span>
              <span>Absent</span>
            </button>
          </div>

          {/* Direct Absent Coverage Quick Action */}
          {absent.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {absent.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400"
                >
                  <button
                    type="button"
                    onClick={() => onInspectMember(person.id)}
                    className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center ${person.avatarBg}`}
                    >
                      {person.initials}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {person.name}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      Absent
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">
                      ·
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                      {person.office} · {person.workloadHours.toFixed(1)}h open
                    </span>
                  </button>
                  {person.workloadHours > 0 && (
                    <button
                      type="button"
                      onClick={() => onQuickReassignAbsent(person.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3" aria-hidden="true" />
                      <span>Reassign tasks</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Interactive Roster Strip */}
        {expandedStatus && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                {expandedStatus === 'working' &&
                  `Working in office (${rosterForStatus.length})`}
                {expandedStatus === 'wfh' &&
                  `Working from home (${rosterForStatus.length})`}
                {expandedStatus === 'absent' &&
                  `Absent today (${rosterForStatus.length})`}
              </span>
              <button
                type="button"
                onClick={() => setExpandedStatus(null)}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            {rosterForStatus.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
                No team members in this status for the selected office filter.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 divide-y sm:divide-y-0 divide-slate-100 dark:divide-zinc-800">
                {rosterForStatus.map((member) => (
                  <div
                    key={member.id}
                    className="py-1.5 flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => onInspectMember(member.id)}
                      className="flex items-center gap-2.5 min-w-0 text-left hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer group"
                    >
                      <span
                        className={`w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 ${member.avatarBg}`}
                      >
                        {member.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                          {member.name}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                          {member.office} ·{' '}
                          {member.checkInTime
                            ? `In ${member.checkInTime}`
                            : 'Not clocked in'}
                        </span>
                      </span>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs text-slate-700 dark:text-zinc-300 tabular-nums">
                        {member.hoursToday.toFixed(1)}h
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenMessageTeam(member.name)}
                        aria-label={`Message ${member.name}`}
                        className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <Send className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
