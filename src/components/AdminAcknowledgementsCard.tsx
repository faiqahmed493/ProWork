import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Inbox,
  Lock,
  LogOut,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AckCategory,
  AcknowledgementItem,
  AuditLogEntry,
} from '../data/adminDashboardData';

interface AdminAcknowledgementsCardProps {
  items: AcknowledgementItem[];
  auditLog: AuditLogEntry[];
  onAcknowledgeItem: (id: string) => void;
  onAcknowledgeAll: () => void;
  onUndoLastAck: () => void;
  onOpenAuditLog: () => void;
  onTriggerItemAction: (item: AcknowledgementItem) => void;
}

export const AdminAcknowledgementsCard: React.FC<
  AdminAcknowledgementsCardProps
> = ({
  items,
  auditLog,
  onAcknowledgeItem,
  onAcknowledgeAll,
  onUndoLastAck,
  onOpenAuditLog,
  onTriggerItemAction,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | AckCategory>(
    'all'
  );

  const acknowledgedTodayCount = auditLog.filter(
    (entry) => entry.source === 'acknowledged'
  ).length;

  const filteredItems =
    categoryFilter === 'all'
      ? items
      : items.filter((item) => item.category === categoryFilter);

  const attendanceCount = items.filter((i) => i.category === 'attendance').length;
  const payrollRulesCount = items.filter(
    (i) => i.category === 'payroll' || i.category === 'rules'
  ).length;
  const ticketsCount = items.filter((i) => i.category === 'tickets').length;

  const renderLeadingVisual = (item: AcknowledgementItem) => {
    if (item.initials) {
      return (
        <span
          className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${item.avatarBg}`}
        >
          {item.initials}
        </span>
      );
    }

    if (item.iconType === 'lock') {
      return (
        <span className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4" aria-hidden="true" />
        </span>
      );
    }

    if (item.iconType === 'ticket') {
      return (
        <span className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Inbox className="w-4 h-4" aria-hidden="true" />
        </span>
      );
    }

    if (item.iconType === 'clock_out') {
      return (
        <span className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </span>
      );
    }

    return (
      <span className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
      </span>
    );
  };

  return (
    <section
      id="admin-ack"
      aria-labelledby="admin-ack-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="admin-ack-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Needs your acknowledgement
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {items.length} {items.length === 1 ? 'item' : 'items'} · one tap
              moves it to the Audit Log
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={onAcknowledgeAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Acknowledge all</span>
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-4 pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Filter acknowledgements"
            className="inline-flex flex-wrap items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
          >
            {(
              [
                { id: 'all', label: `All (${items.length})` },
                { id: 'attendance', label: `Attendance (${attendanceCount})` },
                { id: 'tickets', label: `Tickets (${ticketsCount})` },
                {
                  id: 'payroll',
                  label: `Period (${items.filter((i) => i.category === 'payroll').length})`,
                },
              ] as { id: 'all' | AckCategory; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {payrollRulesCount > 0 && categoryFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap cursor-pointer"
            >
              Show all
            </button>
          )}
        </div>

        {/* Queue Items */}
        {filteredItems.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
              {items.length === 0
                ? 'All operational alerts acknowledged'
                : 'No alerts in this category'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              {items.length === 0
                ? 'Every acknowledged item is recorded in the Audit Log.'
                : 'Switch filter tabs to view remaining queue items.'}
            </p>
          </div>
        ) : (
          <ul className="mt-1 divide-y divide-slate-100 dark:divide-zinc-800">
            {filteredItems.map((item) => (
              <li key={item.id} className="py-3.5">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {renderLeadingVisual(item)}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {item.title}
                        </p>
                        <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                        {item.detail}
                      </p>
                      {item.actionLabel && (
                        <button
                          type="button"
                          onClick={() => onTriggerItemAction(item)}
                          className="mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                        >
                          {item.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAcknowledgeItem(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
            {acknowledgedTodayCount === 0
              ? 'Nothing acknowledged yet today'
              : `${acknowledgedTodayCount} acknowledged today`}
          </span>
          {acknowledgedTodayCount > 0 && (
            <button
              type="button"
              onClick={onUndoLastAck}
              className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Undo</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenAuditLog}
          className="font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 whitespace-nowrap cursor-pointer"
        >
          See them in the Audit Log →
        </button>
      </div>
    </section>
  );
};
