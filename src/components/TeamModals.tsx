import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Send,
  X,
} from 'lucide-react';
import {
  PendingRequest,
  PendingTimesheet,
  TeamMember,
  TeamScheduleBlock,
  TeamTaskItem,
} from '../data/teamDashboardData';

export type TeamModalState =
  | null
  | { type: 'approvals'; tab: 'requests' | 'timesheets' }
  | { type: 'assign_task'; preselectedMemberId?: string }
  | { type: 'message_team'; preselectedRecipient?: string }
  | { type: 'team_schedule' }
  | { type: 'inspect_member'; memberId: string }
  | { type: 'rebalance'; focusMemberId?: string };

export interface RebalanceMove {
  taskId: string;
  toMemberId: string;
}

interface TeamModalsProps {
  modal: TeamModalState;
  onClose: () => void;
  members: TeamMember[];
  requests: PendingRequest[];
  timesheets: PendingTimesheet[];
  tasks: TeamTaskItem[];
  schedule: TeamScheduleBlock[];
  onApproveRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onApproveAllRequests: () => void;
  onApproveTimesheet: (id: string) => void;
  onAssignTask: (
    title: string,
    memberId: string,
    project: string,
    dueLabel: string,
    estimateHours: number
  ) => void;
  onSendMessage: (recipient: string, text: string) => void;
  onToggleTaskDone: (taskId: string) => void;
  onReassignTask: (taskId: string, newMemberId: string) => void;
  onApplyRebalance: (moves: RebalanceMove[]) => void;
}

export const TeamModals: React.FC<TeamModalsProps> = ({
  modal,
  onClose,
  members,
  requests,
  timesheets,
  tasks,
  schedule,
  onApproveRequest,
  onDeclineRequest,
  onApproveAllRequests,
  onApproveTimesheet,
  onAssignTask,
  onSendMessage,
  onToggleTaskDone,
  onReassignTask,
  onApplyRebalance,
}) => {
  const [approvalTab, setApprovalTab] = useState<'requests' | 'timesheets'>(
    'requests'
  );
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMemberId, setTaskMemberId] = useState('m2');
  const [taskProject, setTaskProject] = useState('Release 2.4');
  const [taskDue, setTaskDue] = useState('Due 17:00');
  const [taskHours, setTaskHours] = useState(1.5);

  const [msgRecipient, setMsgRecipient] = useState('All team (10)');
  const [msgText, setMsgText] = useState('');
  const [memberMsg, setMemberMsg] = useState('');

  const [rebalanceDraft, setRebalanceDraft] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (!modal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, onClose]);

  const membersByCapacity = useMemo(
    () =>
      [...members]
        .filter((m) => m.presence !== 'absent')
        .sort(
          (a, b) =>
            b.workTimeLeft -
            b.workloadHours -
            (a.workTimeLeft - a.workloadHours)
        ),
    [members]
  );

  const suggestedMoves = useMemo(() => {
    if (!modal || modal.type !== 'rebalance') return [];

    const bottleneckMembers = members.filter((m) => {
      if (modal.focusMemberId) return m.id === modal.focusMemberId;
      return (
        (m.presence === 'absent' && m.workloadHours > 0) ||
        m.workloadHours > m.workTimeLeft
      );
    });

    const bottleneckIds = new Set(bottleneckMembers.map((m) => m.id));
    const candidateTasks = tasks.filter(
      (t) =>
        t.status !== 'done' &&
        t.assigneeIds.some((id) => bottleneckIds.has(id))
    );

    const simulatedLoad = new Map<string, number>();
    membersByCapacity.forEach((m) => simulatedLoad.set(m.id, m.workloadHours));

    return candidateTasks.map((task) => {
      const fromId =
        task.assigneeIds.find((id) => bottleneckIds.has(id)) ??
        task.assigneeIds[0];
      const fromMember = members.find((m) => m.id === fromId);

      const bestTarget = [...membersByCapacity]
        .filter((m) => m.id !== fromId)
        .sort((a, b) => {
          const spareA = a.workTimeLeft - (simulatedLoad.get(a.id) ?? 0);
          const spareB = b.workTimeLeft - (simulatedLoad.get(b.id) ?? 0);
          if (Math.abs(spareB - spareA) > 0.4) return spareB - spareA;
          const officeBonusA = a.office === task.office ? 0.5 : 0;
          const officeBonusB = b.office === task.office ? 0.5 : 0;
          return spareB + officeBonusB - (spareA + officeBonusA);
        })[0];

      if (bestTarget) {
        simulatedLoad.set(
          bestTarget.id,
          (simulatedLoad.get(bestTarget.id) ?? 0) + task.estimateHours
        );
      }

      return {
        task,
        fromMember,
        recommendedToId: bestTarget?.id ?? '',
      };
    });
  }, [modal, members, tasks, membersByCapacity]);

  useEffect(() => {
    if (!modal) return;
    if (modal.type === 'approvals') {
      setApprovalTab(modal.tab);
    } else if (modal.type === 'assign_task') {
      setTaskTitle('');
      if (modal.preselectedMemberId) {
        setTaskMemberId(modal.preselectedMemberId);
      } else if (membersByCapacity[0]) {
        setTaskMemberId(membersByCapacity[0].id);
      }
    } else if (modal.type === 'message_team') {
      setMsgRecipient(modal.preselectedRecipient || 'All team (10)');
      setMsgText('');
    } else if (modal.type === 'inspect_member') {
      setMemberMsg('');
    } else if (modal.type === 'rebalance') {
      const nextDraft: Record<string, string> = {};
      suggestedMoves.forEach((item) => {
        if (item.recommendedToId) {
          nextDraft[item.task.id] = item.recommendedToId;
        }
      });
      setRebalanceDraft(nextDraft);
    }
  }, [modal, membersByCapacity, suggestedMoves]);

  if (!modal) return null;

  const inspectedMember =
    modal.type === 'inspect_member'
      ? members.find((m) => m.id === modal.memberId) ?? null
      : null;

  const inspectedMemberTasks = inspectedMember
    ? tasks.filter((t) => t.assigneeIds.includes(inspectedMember.id))
    : [];

  const activeRebalanceMoves: RebalanceMove[] = Object.entries(rebalanceDraft)
    .filter(([, toMemberId]) => Boolean(toMemberId))
    .map(([taskId, toMemberId]) => ({ taskId, toMemberId }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
            {modal.type === 'approvals' && 'Approvals queue'}
            {modal.type === 'assign_task' && 'Assign a task'}
            {modal.type === 'message_team' && 'Message team'}
            {modal.type === 'team_schedule' && 'Team schedule'}
            {modal.type === 'inspect_member' &&
              (inspectedMember ? inspectedMember.name : 'Team member')}
            {modal.type === 'rebalance' && 'Rebalance team workload'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[78vh] overflow-y-auto">
          {/* 1. Approvals Queue */}
          {modal.type === 'approvals' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div
                  role="group"
                  aria-label="Approval categories"
                  className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
                >
                  <button
                    type="button"
                    onClick={() => setApprovalTab('requests')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      approvalTab === 'requests'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    Requests ({requests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalTab('timesheets')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      approvalTab === 'timesheets'
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    Timesheets ({timesheets.length})
                  </button>
                </div>

                {approvalTab === 'requests' && requests.length > 1 && (
                  <button
                    type="button"
                    onClick={onApproveAllRequests}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                  >
                    Approve all ({requests.length})
                  </button>
                )}
              </div>

              {approvalTab === 'requests' ? (
                requests.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                      All requests reviewed
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      There are no pending leave, WFH, clock-fix, or overtime
                      requests waiting.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-2 divide-y divide-slate-100 dark:divide-zinc-800">
                    {requests.map((req) => (
                      <li key={req.id} className="py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <span
                              className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${req.avatarBg}`}
                            >
                              {req.initials}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                {req.memberName}{' '}
                                <span className="font-normal text-slate-500 dark:text-zinc-400">
                                  · {req.categoryLabel} · {req.summary}
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                {req.note}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                                {req.office} · Submitted {req.submittedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onDeclineRequest(req.id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => onApproveRequest(req.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                            >
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              ) : timesheets.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    All timesheets confirmed
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Last week&apos;s hours (19 Oct – 25 Oct) are fully approved.
                  </p>
                </div>
              ) : (
                <ul className="mt-2 divide-y divide-slate-100 dark:divide-zinc-800">
                  {timesheets.map((ts) => (
                    <li key={ts.id} className="py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${ts.avatarBg}`}
                          >
                            {ts.initials}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                              {ts.memberName}{' '}
                              <span className="font-normal text-slate-500 dark:text-zinc-400">
                                · {ts.office}
                              </span>
                            </p>
                            <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
                              <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">
                                {ts.loggedHours.toFixed(1)}h
                              </span>{' '}
                              of {ts.targetHours}h · {ts.statusNote}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onApproveTimesheet(ts.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0 cursor-pointer"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>Confirm</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 2. Assign Task */}
          {modal.type === 'assign_task' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                onAssignTask(
                  taskTitle.trim(),
                  taskMemberId,
                  taskProject,
                  taskDue,
                  taskHours
                );
                onClose();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Task title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Prepare DHA client demo checklist"
                  autoFocus
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Assignee (sorted by spare capacity)
                </label>
                <select
                  value={taskMemberId}
                  onChange={(e) => setTaskMemberId(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {membersByCapacity.map((m) => {
                    const free = m.workTimeLeft - m.workloadHours;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} ·{' '}
                        {free >= 0
                          ? `${free.toFixed(1)}h free`
                          : `${Math.abs(free).toFixed(1)}h over capacity`}{' '}
                        · {m.office}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Project
                  </label>
                  <input
                    type="text"
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Due
                  </label>
                  <input
                    type="text"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Est. hours
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={8}
                    value={taskHours}
                    onChange={(e) => setTaskHours(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Assign task
                </button>
              </div>
            </form>
          )}

          {/* 3. Message Team */}
          {modal.type === 'message_team' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!msgText.trim()) return;
                onSendMessage(msgRecipient, msgText.trim());
                onClose();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Recipient
                </label>
                <select
                  value={msgRecipient}
                  onChange={(e) => setMsgRecipient(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="All team (10)">All team (10)</option>
                  <option value="Gulberg office (6)">Gulberg office (6)</option>
                  <option value="DHA Phase 6 (4)">DHA Phase 6 (4)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.office})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Write an update or question..."
                  autoFocus
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setMsgText(
                        'Quick reminder: 15:00 Security briefing starts in 15 mins.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-md cursor-pointer"
                  >
                    15:00 briefing reminder
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMsgText(
                        'Please confirm your Release 2.4 tasks before EOD.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-md cursor-pointer"
                  >
                    EOD task check-in
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Send message</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. Team Schedule */}
          {modal.type === 'team_schedule' && (
            <div className="space-y-5">
              {(['today', 'tomorrow'] as const).map((dayKey) => {
                const items = schedule.filter((s) => s.dayGroup === dayKey);
                return (
                  <div key={dayKey}>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">
                      {dayKey === 'today'
                        ? 'Today · Wed 28 Oct'
                        : 'Tomorrow · Thu 29 Oct'}
                    </h4>
                    <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="py-2.5 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300 tabular-nums w-12 pt-0.5">
                              {item.time}
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                {item.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                                {item.duration} · {item.office} ·{' '}
                                {item.attendees}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 shrink-0">
                            {item.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. Member Quick-Inspect */}
          {modal.type === 'inspect_member' && inspectedMember && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-full text-sm font-semibold flex items-center justify-center ${inspectedMember.avatarBg}`}
                  >
                    {inspectedMember.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {inspectedMember.role}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" aria-hidden="true" />
                        {inspectedMember.office}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {inspectedMember.checkInTime
                          ? `In ${inspectedMember.checkInTime}`
                          : 'Absent today'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 text-xs tabular-nums">
                  <div>
                    <span className="block text-slate-500 dark:text-zinc-400">Today</span>
                    <span className="font-mono text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {inspectedMember.hoursToday.toFixed(1)}h /{' '}
                      {inspectedMember.expectedToday.toFixed(1)}h
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-zinc-400">Week load</span>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        inspectedMember.workloadHours >
                        inspectedMember.workTimeLeft
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {inspectedMember.workloadHours.toFixed(1)}h /{' '}
                      {inspectedMember.workTimeLeft.toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Member's open tasks */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                  Assigned tasks ({inspectedMemberTasks.length})
                </h4>
                {inspectedMemberTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
                    No active tasks assigned.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {inspectedMemberTasks.map((t) => {
                      const isDone = t.status === 'done';
                      return (
                        <li
                          key={t.id}
                          className="py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleTaskDone(t.id)}
                            className="flex items-center gap-2 text-left min-w-0 cursor-pointer"
                          >
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 dark:border-zinc-600'
                              }`}
                            >
                              {isDone && (
                                <Check className="w-3 h-3" aria-hidden="true" />
                              )}
                            </span>
                            <span
                              className={`truncate ${
                                isDone
                                  ? 'line-through text-slate-400 dark:text-zinc-500'
                                  : 'text-slate-800 dark:text-zinc-200 font-medium'
                              }`}
                            >
                              {t.title}
                            </span>
                          </button>

                          {!isDone && (
                            <select
                              defaultValue=""
                              aria-label={`Reassign ${t.title}`}
                              onChange={(e) => {
                                if (!e.target.value) return;
                                onReassignTask(t.id, e.target.value);
                              }}
                              className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 shrink-0"
                            >
                              <option value="" disabled>
                                Reassign...
                              </option>
                              {membersByCapacity
                                .filter((m) => m.id !== inspectedMember.id)
                                .map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} (
                                    {(m.workTimeLeft - m.workloadHours).toFixed(
                                      1
                                    )}
                                    h free)
                                  </option>
                                ))}
                            </select>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Direct Quick Message */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!memberMsg.trim()) return;
                  onSendMessage(inspectedMember.name, memberMsg.trim());
                  setMemberMsg('');
                  onClose();
                }}
                className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={memberMsg}
                  onChange={(e) => setMemberMsg(e.target.value)}
                  placeholder={`Send direct message to ${inspectedMember.name}...`}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  <Send className="w-3 h-3" aria-hidden="true" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* 6. Smart Rebalance Plan */}
          {modal.type === 'rebalance' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Suggested reassignments move open tasks off absent or
                overloaded team members onto teammates with available weekly
                capacity. Uncheck any move or adjust the target assignee before
                applying.
              </p>

              {suggestedMoves.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    Workload is balanced
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    No active tasks are assigned to absent or overloaded team
                    members.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {suggestedMoves.map(({ task, fromMember, recommendedToId }) => {
                    const selectedToId = rebalanceDraft[task.id] ?? '';
                    const isChecked = Boolean(selectedToId);
                    return (
                      <li key={task.id} className="py-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setRebalanceDraft((prev) => ({
                                  ...prev,
                                  [task.id]: e.target.checked
                                    ? recommendedToId
                                    : '',
                                }));
                              }}
                              className="mt-0.5 rounded border-slate-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-600"
                            />
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                {task.title}
                              </span>
                              <span className="block text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                                {task.project} · {task.dueLabel} ·{' '}
                                <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">
                                  {task.estimateHours}h
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>

                        <div className="pl-6 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-600 dark:text-zinc-300">
                            {fromMember?.name ?? task.assigneeLabel}
                            <span
                              className={`ml-1 text-[11px] font-medium ${
                                fromMember?.presence === 'absent'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              (
                              {fromMember?.presence === 'absent'
                                ? 'Absent'
                                : 'Overloaded'}
                              )
                            </span>
                          </span>
                          <ArrowRight
                            className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0"
                            aria-hidden="true"
                          />
                          <select
                            disabled={!isChecked}
                            value={selectedToId || recommendedToId}
                            onChange={(e) =>
                              setRebalanceDraft((prev) => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            aria-label={`New assignee for ${task.title}`}
                            className="text-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            {membersByCapacity
                              .filter((m) => m.id !== fromMember?.id)
                              .map((m) => {
                                const free = m.workTimeLeft - m.workloadHours;
                                return (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({free.toFixed(1)}h free ·{' '}
                                    {m.office})
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                  {activeRebalanceMoves.length} of {suggestedMoves.length} moves
                  selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={activeRebalanceMoves.length === 0}
                    onClick={() => {
                      onApplyRebalance(activeRebalanceMoves);
                      onClose();
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                  >
                    Apply {activeRebalanceMoves.length} move
                    {activeRebalanceMoves.length === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
