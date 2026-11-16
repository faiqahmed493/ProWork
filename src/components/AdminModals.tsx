import React, { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Download,
  Lock,
  LockOpen,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  ADMIN_REPORT_SPECS,
  AdminSiteMetric,
  AttendanceRuleConfig,
  AuditLogEntry,
  buildReportPreviewRows,
  ReportId,
} from '../data/adminDashboardData';
import {
  OfficeLocation,
  PendingTimesheet,
  PresenceStatus,
  TeamMember,
  TeamTaskItem,
} from '../data/teamDashboardData';

export type AdminModalState =
  | null
  | { type: 'add_site' }
  | { type: 'fix_on_behalf'; memberId?: string }
  | { type: 'close_period' }
  | { type: 'change_rule' }
  | { type: 'audit_log' }
  | { type: 'live_board' }
  | { type: 'all_reports'; initialReportId?: ReportId };

interface AdminModalsProps {
  modal: AdminModalState;
  onClose: () => void;
  sites: AdminSiteMetric[];
  members: TeamMember[];
  tasks: TeamTaskItem[];
  timesheets: PendingTimesheet[];
  auditLog: AuditLogEntry[];
  periodLocked: boolean;
  ruleConfig: AttendanceRuleConfig;
  officeFilter: 'all' | OfficeLocation;
  onAddSite: (
    name: string,
    neededToday: number,
    totalDue: number,
    geofenceRadiusM: number
  ) => void;
  onFixAttendance: (
    memberId: string,
    presence: PresenceStatus,
    checkInTime: string | null,
    reason: string
  ) => void;
  onApproveTimesheet: (id: string) => void;
  onTogglePeriodLock: () => void;
  onSaveRuleConfig: (next: Omit<AttendanceRuleConfig, 'version' | 'effectiveFrom'>) => void;
  onRestoreAuditItem: (auditId: string) => void;
  onDownloadReport: (reportId: ReportId) => void;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
  modal,
  onClose,
  sites,
  members,
  tasks,
  timesheets,
  auditLog,
  periodLocked,
  ruleConfig,
  officeFilter,
  onAddSite,
  onFixAttendance,
  onApproveTimesheet,
  onTogglePeriodLock,
  onSaveRuleConfig,
  onRestoreAuditItem,
  onDownloadReport,
}) => {
  // Add site state
  const [siteName, setSiteName] = useState('');
  const [siteDue, setSiteDue] = useState(4);
  const [siteNeeded, setSiteNeeded] = useState(3);
  const [siteRadius, setSiteRadius] = useState(120);

  // Fix on behalf state
  const [fixMemberId, setFixMemberId] = useState('m10');
  const [fixPresence, setFixPresence] = useState<PresenceStatus>('working');
  const [fixClockIn, setFixClockIn] = useState('09:05');
  const [fixReason, setFixReason] = useState(
    'Verified with site lead; manual punch applied'
  );

  // Rule editor state
  const [graceMinutes, setGraceMinutes] = useState(ruleConfig.graceMinutes);
  const [autoClockOutTime, setAutoClockOutTime] = useState(
    ruleConfig.autoClockOutTime
  );
  const [overtimeAfterHours, setOvertimeAfterHours] = useState(
    ruleConfig.overtimeAfterHours
  );
  const [wfhInterval, setWfhInterval] = useState(
    ruleConfig.wfhPresenceCheckIntervalMin
  );

  // Audit log search
  const [auditQuery, setAuditQuery] = useState('');

  // Report preview tab
  const [activeReportId, setActiveReportId] = useState<ReportId>('attendance');

  useEffect(() => {
    if (!modal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, onClose]);

  useEffect(() => {
    if (!modal) return;
    if (modal.type === 'add_site') {
      setSiteName('');
      setSiteDue(4);
      setSiteNeeded(3);
      setSiteRadius(120);
    } else if (modal.type === 'fix_on_behalf') {
      const targetId =
        modal.memberId ??
        members.find((m) => m.presence === 'absent')?.id ??
        members[0]?.id ??
        'm10';
      const target = members.find((m) => m.id === targetId);
      setFixMemberId(targetId);
      setFixPresence(
        target?.presence === 'absent'
          ? 'working'
          : target?.presence ?? 'working'
      );
      setFixClockIn(target?.checkInTime ?? '09:05');
      setFixReason('Verified with site lead; manual punch applied');
    } else if (modal.type === 'change_rule') {
      setGraceMinutes(ruleConfig.graceMinutes);
      setAutoClockOutTime(ruleConfig.autoClockOutTime);
      setOvertimeAfterHours(ruleConfig.overtimeAfterHours);
      setWfhInterval(ruleConfig.wfhPresenceCheckIntervalMin);
    } else if (modal.type === 'audit_log') {
      setAuditQuery('');
    } else if (modal.type === 'all_reports') {
      setActiveReportId(modal.initialReportId ?? 'attendance');
    }
  }, [modal, members, ruleConfig]);

  if (!modal) return null;

  const filteredAudit = auditLog.filter((entry) => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.detail.toLowerCase().includes(q) ||
      entry.actor.toLowerCase().includes(q)
    );
  });

  const activeReportSpec =
    ADMIN_REPORT_SPECS.find((s) => s.id === activeReportId) ??
    ADMIN_REPORT_SPECS[0];
  const reportPreview = buildReportPreviewRows(
    activeReportId,
    members,
    tasks,
    officeFilter,
    periodLocked
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
            {modal.type === 'add_site' && 'Add a site'}
            {modal.type === 'fix_on_behalf' && 'Fix attendance on behalf'}
            {modal.type === 'close_period' && 'Close period · October 2026'}
            {modal.type === 'change_rule' &&
              `Attendance rules (currently v${ruleConfig.version})`}
            {modal.type === 'audit_log' && 'Admin Audit Log'}
            {modal.type === 'live_board' && 'Live attendance board'}
            {modal.type === 'all_reports' && 'Admin reports & CSV export'}
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
          {/* 1. Add a Site */}
          {modal.type === 'add_site' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!siteName.trim()) return;
                onAddSite(siteName.trim(), siteNeeded, siteDue, siteRadius);
                onClose();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Site / office name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g., Johar Town Hub"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Staff assigned (due)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={siteDue}
                    onChange={(e) => setSiteDue(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Min needed daily
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={siteNeeded}
                    onChange={(e) => setSiteNeeded(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Geofence radius (m)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    step={10}
                    value={siteRadius}
                    onChange={(e) => setSiteRadius(Number(e.target.value))}
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
                  Create site
                </button>
              </div>
            </form>
          )}

          {/* 2. Fix on Behalf */}
          {modal.type === 'fix_on_behalf' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onFixAttendance(
                  fixMemberId,
                  fixPresence,
                  fixPresence === 'absent' ? null : fixClockIn,
                  fixReason.trim() || 'Admin manual adjustment'
                );
                onClose();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Team member
                </label>
                <select
                  value={fixMemberId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setFixMemberId(nextId);
                    const found = members.find((m) => m.id === nextId);
                    if (found) {
                      setFixPresence(
                        found.presence === 'absent' ? 'working' : found.presence
                      );
                      setFixClockIn(found.checkInTime ?? '09:05');
                    }
                  }}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.office}) · Currently{' '}
                      {m.presence === 'working'
                        ? `Working (${m.checkInTime})`
                        : m.presence === 'wfh'
                          ? `WFH (${m.checkInTime})`
                          : 'Absent'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Updated status
                  </label>
                  <select
                    value={fixPresence}
                    onChange={(e) =>
                      setFixPresence(e.target.value as PresenceStatus)
                    }
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="working">Working on-site</option>
                    <option value="wfh">Working from home</option>
                    <option value="absent">Excused / Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Clock-in time
                  </label>
                  <input
                    type="time"
                    disabled={fixPresence === 'absent'}
                    value={fixClockIn}
                    onChange={(e) => setFixClockIn(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Audit note
                </label>
                <input
                  type="text"
                  required
                  value={fixReason}
                  onChange={(e) => setFixReason(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
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
                  Apply fix &amp; log
                </button>
              </div>
            </form>
          )}

          {/* 3. Close the Period */}
          {modal.type === 'close_period' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {periodLocked
                      ? 'October 2026 payroll period is locked'
                      : 'October 2026 closes on Sat 31 Oct (in 3 days)'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    {periodLocked
                      ? 'Payroll CSV export is finalized and ready for finance sign-off.'
                      : 'Review remaining timesheets below before locking payroll edits.'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                    periodLocked
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {periodLocked ? (
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <LockOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{periodLocked ? 'Locked' : 'Open (Draft)'}</span>
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                  Unapproved timesheets ({timesheets.length})
                </h4>
                {timesheets.length === 0 ? (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 py-2 font-medium">
                    All team timesheets for October 2026 are confirmed.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {timesheets.map((ts) => (
                      <li
                        key={ts.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 ${ts.avatarBg}`}
                          >
                            {ts.initials}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                              {ts.memberName} · {ts.office}
                            </p>
                            <p className="text-slate-500 dark:text-zinc-400 tabular-nums">
                              {ts.loggedHours.toFixed(1)}h of {ts.targetHours}h ·{' '}
                              {ts.statusNote}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onApproveTimesheet(ts.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shrink-0 cursor-pointer"
                        >
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>Confirm</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTogglePeriodLock();
                    onClose();
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                    periodLocked
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {periodLocked
                    ? 'Reopen October 2026'
                    : 'Lock October 2026 & finalize payroll'}
                </button>
              </div>
            </div>
          )}

          {/* 4. Change a Rule */}
          {modal.type === 'change_rule' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveRuleConfig({
                  graceMinutes,
                  autoClockOutTime,
                  overtimeAfterHours,
                  wfhPresenceCheckIntervalMin: wfhInterval,
                  updatedBy: 'Ayesha Khan (Admin)',
                });
                onClose();
              }}
              className="space-y-4"
            >
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Last updated by {ruleConfig.updatedBy} ({ruleConfig.effectiveFrom}
                ). Saving publishes Rules version {ruleConfig.version + 1} and
                records the change in the Audit Log.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Late arrival grace period (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={5}
                    value={graceMinutes}
                    onChange={(e) => setGraceMinutes(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Geofence auto clock-out
                  </label>
                  <input
                    type="time"
                    value={autoClockOutTime}
                    onChange={(e) => setAutoClockOutTime(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Overtime threshold (hours/day)
                  </label>
                  <input
                    type="number"
                    min={6}
                    max={12}
                    step={0.5}
                    value={overtimeAfterHours}
                    onChange={(e) =>
                      setOvertimeAfterHours(Number(e.target.value))
                    }
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    WFH presence check (minutes)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={240}
                    step={30}
                    value={wfhInterval}
                    onChange={(e) => setWfhInterval(Number(e.target.value))}
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
                  Publish Rules v{ruleConfig.version + 1}
                </button>
              </div>
            </form>
          )}

          {/* 5. Audit Log */}
          {modal.type === 'audit_log' && (
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  placeholder="Filter audit entries..."
                  aria-label="Filter audit entries"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {filteredAudit.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    No audit entries yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Acknowledgements and admin rule/punch adjustments appear
                    here automatically.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredAudit.map((entry) => (
                    <li
                      key={entry.id}
                      className="py-3 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {entry.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                          {entry.detail}
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-slate-400 dark:text-zinc-500 tabular-nums">
                          {entry.actor} · {entry.timestamp}
                        </p>
                      </div>

                      {entry.originalAckItem && (
                        <button
                          type="button"
                          onClick={() => onRestoreAuditItem(entry.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" aria-hidden="true" />
                          <span>Restore</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 6. Live Board */}
          {modal.type === 'live_board' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {sites.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800"
                  >
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-xs ${s.dotClass}`}
                        aria-hidden="true"
                      />
                      <span>{s.name}</span>
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
                      {s.workingInOffice + s.workingFromHome} / {s.totalDue} in ·{' '}
                      {s.neededToday} needed
                    </p>
                  </div>
                ))}
              </div>

              <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 ${m.avatarBg}`}
                      >
                        {m.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" aria-hidden="true" />
                            {m.office}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {m.checkInTime ? `In ${m.checkInTime}` : 'No punch'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-medium ${
                          m.presence === 'working'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : m.presence === 'wfh'
                              ? 'text-violet-700 dark:text-violet-400'
                              : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {m.presence === 'working'
                          ? 'In office'
                          : m.presence === 'wfh'
                            ? 'From home'
                            : 'Absent'}
                      </span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300 tabular-nums w-10 text-right">
                        {m.hoursToday.toFixed(1)}h
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 7. All Reports Preview & Export */}
          {modal.type === 'all_reports' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div
                  role="group"
                  aria-label="Report dataset"
                  className="inline-flex flex-wrap items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
                >
                  {ADMIN_REPORT_SPECS.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setActiveReportId(spec.id)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        activeReportId === spec.id
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {spec.title}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadReport(activeReportSpec.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-[#121216]">
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                      {reportPreview.headers.map((h) => (
                        <th key={h} className="py-2 pr-3 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                    {reportPreview.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className={`py-2 pr-3 whitespace-nowrap ${
                              cellIdx === 0
                                ? 'font-medium text-slate-900 dark:text-zinc-100'
                                : 'text-slate-600 dark:text-zinc-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
