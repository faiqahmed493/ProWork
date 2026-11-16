import React, { useState } from 'react';
import {
  CalendarPlus,
  Check,
  Send,
} from 'lucide-react';
import {
  ChatThread,
  LeaveQuota,
  MonthlyLeaveTrend,
  ScheduleItem,
} from '../data/dashboardData';

interface WorkspaceLowerRowProps {
  schedule: ScheduleItem[];
  onToggleScheduleItem: (id: string) => void;
  onOpenPlanDay: () => void;
  threads: ChatThread[];
  highlightedChatId: string | null;
  onMarkThreadRead: (id: string) => void;
  onReplyThread: (id: string, replyText: string) => void;
  quotas: LeaveQuota[];
  monthlyLeaveTrend: MonthlyLeaveTrend[];
  onOpenRequestLeave: (defaultType?: string) => void;
}

export const WorkspaceLowerRow: React.FC<WorkspaceLowerRowProps> = ({
  schedule,
  onToggleScheduleItem,
  onOpenPlanDay,
  threads,
  highlightedChatId,
  onMarkThreadRead,
  onReplyThread,
  quotas,
  monthlyLeaveTrend,
  onOpenRequestLeave,
}) => {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [leaveView, setLeaveView] = useState<'quotas' | 'trend'>('quotas');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const todayItems = schedule.filter((s) => s.dayGroup === 'today');
  const tomorrowItems = schedule.filter((s) => s.dayGroup === 'tomorrow');
  const waitingQuestions = threads.filter((t) => t.needsReply).length;
  const pendingRequests = quotas.reduce((sum, q) => sum + q.pending, 0);

  const handleSendReply = (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    const trimmed = replyDraft.trim();
    if (!trimmed) return;
    onReplyThread(threadId, trimmed);
    setReplyDraft('');
    setReplyingToId(null);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Up Next Today */}
      <article
        id="schedule"
        className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100">
                Up next today
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                {todayItems.filter((i) => !i.completed).length} items left today · Current time 14:15
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPlanDay}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Plan</span>
            </button>
          </div>

          <div className="mt-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1.5">
              <span>Today&apos;s remaining blocks</span>
              <span className="font-mono tabular-nums">50m scheduled</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex gap-0.5">
              <div
                className="bg-blue-600 h-full"
                style={{ width: '58%' }}
                title="Focus work"
              />
              <div
                className="bg-indigo-500 h-full"
                style={{ width: '25%' }}
                title="Meetings (30m)"
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: '17%' }}
                title="Break / Asr (20m)"
              />
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {todayItems.map((item) => {
              const dotColor =
                item.category === 'Meeting'
                  ? 'bg-blue-600'
                  : item.category === 'Break'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600';
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onToggleScheduleItem(item.id)}
                    className="w-full flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer group"
                  >
                    <span className="font-mono text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums w-11 shrink-0">
                      {item.time}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-sm font-medium truncate ${
                          item.completed
                            ? 'line-through text-slate-400 dark:text-zinc-500'
                            : 'text-slate-900 dark:text-zinc-100'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-zinc-400">
                        {item.duration} · {item.category}
                      </span>
                    </span>
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-200 dark:border-zinc-700 text-transparent group-hover:border-slate-300 dark:group-hover:border-zinc-600'
                      }`}
                    >
                      <Check className="w-3 h-3" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <p className="text-xs font-medium text-slate-400 dark:text-zinc-500 mb-2">
              Tomorrow · Thu 29 Oct
            </p>
            <ul className="space-y-1.5">
              {tomorrowItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-1 text-left"
                >
                  <span className="font-mono text-xs font-medium text-slate-500 dark:text-zinc-400 tabular-nums w-11 shrink-0">
                    {item.time}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full bg-teal-600 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-slate-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-zinc-400">
                      {item.duration} · {item.category}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      {/* 2. Chat & Questions */}
      <article
        id="chat"
        className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100">
                Chat
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                {waitingQuestions > 0
                  ? `${waitingQuestions} question for you · usual reply 34m`
                  : 'All questions answered · usual reply 34m'}
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {threads.reduce((acc, t) => acc + t.unreadCount, 0)} unread
            </span>
          </div>

          <ul className="mt-4 divide-y divide-slate-100 dark:divide-zinc-800">
            {threads.map((thread) => {
              const isHighlighted = highlightedChatId === thread.id;
              const isReplying = replyingToId === thread.id;
              const lastMsg = thread.messages[thread.messages.length - 1];

              return (
                <li
                  key={thread.id}
                  className={`py-3 transition-colors rounded-lg ${
                    isHighlighted ? 'bg-amber-50/70 dark:bg-amber-950/30 px-2 -mx-2' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${thread.avatarBg}`}
                    >
                      {thread.initials}
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onMarkThreadRead(thread.id)}
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                        {thread.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {thread.messages.length > 1
                          ? `${lastMsg.author}: ${lastMsg.text}`
                          : thread.subtitle}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {thread.needsReply ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(isReplying ? null : thread.id);
                            setReplyDraft('');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-md hover:bg-red-100 dark:hover:bg-red-950/80 transition-colors cursor-pointer"
                        >
                          {isReplying ? 'Cancel' : 'Reply'}
                        </button>
                      ) : thread.unreadCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => onMarkThreadRead(thread.id)}
                          aria-label={`${thread.unreadCount} unread messages. Mark as read`}
                          className="w-5 h-5 rounded-full bg-red-600 text-white font-mono text-[11px] font-semibold flex items-center justify-center hover:bg-red-700 cursor-pointer tabular-nums"
                        >
                          {thread.unreadCount}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">Read</span>
                      )}
                    </div>
                  </div>

                  {isReplying && (
                    <form
                      onSubmit={(e) => handleSendReply(e, thread.id)}
                      className="mt-2.5 pl-11 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder={`Reply to ${thread.sender}...`}
                        autoFocus
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" aria-hidden="true" />
                        <span>Send</span>
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </article>

      {/* 3. Leave and Home Days */}
      <article
        id="leave"
        className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100">
                Leave and home days
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                {pendingRequests} request waiting for a decision
              </p>
            </div>

            <div
              role="group"
              aria-label="Leave panel view"
              className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800 shrink-0"
            >
              <button
                type="button"
                onClick={() => setLeaveView('quotas')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  leaveView === 'quotas'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                Balances
              </button>
              <button
                type="button"
                onClick={() => setLeaveView('trend')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  leaveView === 'trend'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                Trend
              </button>
            </div>
          </div>

          {leaveView === 'quotas' ? (
            <div className="mt-5 space-y-4">
              {quotas.map((q) => {
                const remaining = Math.max(0, q.total - q.used - q.pending);
                const usedPct = (q.used / q.total) * 100;
                const pendingPct = (q.pending / q.total) * 100;
                const remainingPct = (remaining / q.total) * 100;
                const fillClass =
                  q.accent === 'emerald' ? 'bg-emerald-600' : 'bg-blue-600';

                return (
                  <div key={q.id}>
                    <div className="flex items-baseline justify-between gap-2 text-xs mb-1.5">
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {q.label}
                        {q.pending > 0 && (
                          <span className="ml-1.5 text-[11px] font-normal text-amber-700 dark:text-amber-400">
                            · {q.pending} pending
                          </span>
                        )}
                      </span>
                      <span className="tabular-nums text-slate-500 dark:text-zinc-400">
                        <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                          {remaining} {q.id === 'wfh' ? '' : `${q.unit} `}
                        </strong>
                        left of {q.total} {q.id === 'wfh' ? q.unit : ''}
                      </span>
                    </div>

                    <div
                      className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex"
                      title={`${remaining} remaining · ${q.used} used · ${q.pending} pending`}
                    >
                      <div
                        className={`${fillClass} h-full transition-all duration-300`}
                        style={{ width: `${remainingPct}%` }}
                      />
                      {pendingPct > 0 && (
                        <div
                          className="bg-amber-400 h-full transition-all duration-300"
                          style={{ width: `${pendingPct}%` }}
                        />
                      )}
                      {usedPct > 0 && (
                        <div
                          className="bg-slate-200 dark:bg-zinc-700 h-full transition-all duration-300"
                          style={{ width: `${usedPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Pending
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-zinc-700" />
                    Used
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenRequestLeave('Annual leave')}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  Request →
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-3">
                <span>Leave &amp; WFH days used (Jul–Oct)</span>
                <span className="font-mono text-[11px] tabular-nums">
                  {hoveredMonthIdx !== null
                    ? `${monthlyLeaveTrend[hoveredMonthIdx].month}: ${monthlyLeaveTrend[hoveredMonthIdx].wfhDays} WFH · ${monthlyLeaveTrend[hoveredMonthIdx].leaveDays} Leave`
                    : 'Hover bars'}
                </span>
              </div>

              <div className="h-36 flex items-end justify-around gap-4 pt-3 pb-6 border-b border-slate-100 dark:border-zinc-800">
                {monthlyLeaveTrend.map((m, idx) => {
                  const maxDays = 6;
                  const wfhH = (m.wfhDays / maxDays) * 96;
                  const leaveH = (m.leaveDays / maxDays) * 96;
                  const isHovered = hoveredMonthIdx === idx;
                  return (
                    <div
                      key={m.month}
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                      className="flex flex-col items-center justify-end h-full flex-1 cursor-pointer"
                    >
                      <div className="flex items-end gap-1.5">
                        <div
                          className={`w-4 rounded-t bg-emerald-500 transition-all duration-150 ${
                            isHovered ? 'brightness-110' : ''
                          }`}
                          style={{ height: `${Math.max(6, wfhH)}px` }}
                          title={`WFH: ${m.wfhDays} days`}
                        />
                        <div
                          className={`w-4 rounded-t bg-blue-600 transition-all duration-150 ${
                            isHovered ? 'brightness-110' : ''
                          }`}
                          style={{ height: `${Math.max(6, leaveH)}px` }}
                          title={`Leave: ${m.leaveDays} days`}
                        />
                      </div>
                      <span className="mt-2 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                    Home days
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                    Leave days
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenRequestLeave('Home days')}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  Book WFH →
                </button>
              </div>
            </div>
          )}
        </div>
      </article>
    </section>
  );
};
