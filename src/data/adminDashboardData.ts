import { OfficeLocation, TeamMember, TeamTaskItem } from './teamDashboardData';

export interface AdminSiteMetric {
  id: string;
  name: string;
  colorHex: string;
  dotClass: string;
  totalDue: number;
  neededToday: number;
  workingInOffice: number;
  workingFromHome: number;
  absentCount: number;
  geofenceRadiusM: number;
  updatedAt: string;
}

export type AckCategory = 'attendance' | 'payroll' | 'tickets' | 'rules';

export interface AcknowledgementItem {
  id: string;
  category: AckCategory;
  categoryLabel: string;
  title: string;
  detail: string;
  initials?: string;
  avatarBg?: string;
  iconType?: 'lock' | 'ticket' | 'clock_out' | 'rule';
  timestamp: string;
  actionType?: 'fix_behalf' | 'close_period' | 'view_tickets' | 'change_rule';
  actionLabel?: string;
  memberId?: string;
}

export interface AuditLogEntry {
  id: string;
  title: string;
  detail: string;
  actor: string;
  timestamp: string;
  source: 'acknowledged' | 'admin_action';
  originalAckItem?: AcknowledgementItem;
}

export interface HourlyAttendancePoint {
  hour: string;
  gulberg: number;
  dha: number;
  isCurrentHour?: boolean;
  isPlanned?: boolean;
}

export interface AttendanceRuleConfig {
  version: number;
  graceMinutes: number;
  autoClockOutTime: string;
  overtimeAfterHours: number;
  wfhPresenceCheckIntervalMin: number;
  updatedBy: string;
  effectiveFrom: string;
}

export type ReportId = 'attendance' | 'hours_overtime' | 'tasks' | 'payroll';

export interface AdminReportSpec {
  id: ReportId;
  title: string;
  description: string;
  fileName: string;
}

export const INITIAL_ADMIN_SITES: AdminSiteMetric[] = [
  {
    id: 'site-gulberg',
    name: 'Gulberg',
    colorHex: '#2563EB',
    dotClass: 'bg-blue-600',
    totalDue: 7,
    neededToday: 5,
    workingInOffice: 6,
    workingFromHome: 0,
    absentCount: 1,
    geofenceRadiusM: 120,
    updatedAt: '16:14',
  },
  {
    id: 'site-dha',
    name: 'DHA Phase 6',
    colorHex: '#0D9488',
    dotClass: 'bg-teal-600',
    totalDue: 4,
    neededToday: 4,
    workingInOffice: 3,
    workingFromHome: 1,
    absentCount: 0,
    geofenceRadiusM: 150,
    updatedAt: '16:14',
  },
];

export const INITIAL_ACKNOWLEDGEMENTS: AcknowledgementItem[] = [
  {
    id: 'ack-1',
    category: 'attendance',
    categoryLabel: 'Attendance',
    title: 'Usman Tariq did not come in',
    detail: 'No clock-in by 10:30 · Gulberg · manager told',
    initials: 'UT',
    avatarBg: 'bg-emerald-600 text-white',
    timestamp: '10:32',
    actionType: 'fix_behalf',
    actionLabel: 'Fix clock-in',
    memberId: 'm10',
  },
  {
    id: 'ack-2',
    category: 'payroll',
    categoryLabel: 'Payroll',
    title: 'October 2026 closes in 3 days',
    detail: 'Close on Sat 31 Oct · 4 timesheets not approved yet',
    iconType: 'lock',
    timestamp: '09:00',
    actionType: 'close_period',
    actionLabel: 'Review close',
  },
  {
    id: 'ack-3',
    category: 'attendance',
    categoryLabel: 'Attendance',
    title: 'Farhan Qureshi missed a presence check',
    detail: 'Working from home · no answer to the 13:30 check',
    initials: 'FQ',
    avatarBg: 'bg-orange-500 text-white',
    timestamp: '13:45',
    actionType: 'fix_behalf',
    actionLabel: 'Update status',
    memberId: 'm6',
  },
  {
    id: 'ack-4',
    category: 'tickets',
    categoryLabel: 'Support',
    title: '2 support tickets waiting for a reply',
    detail:
      'Nida: Locked out after changing my phone · Zain: September overtime missing from payslip',
    iconType: 'ticket',
    timestamp: '14:18',
    actionType: 'fix_behalf',
    actionLabel: 'Resolve',
  },
  {
    id: 'ack-5',
    category: 'attendance',
    categoryLabel: 'Geofence',
    title: 'Auto clock-out · Tue 27 Oct 22:30',
    detail:
      'Clocked out by the system at 22:30 for Bilal Ahmed (left the office geofence)',
    iconType: 'clock_out',
    timestamp: 'Yesterday',
    actionType: 'fix_behalf',
    actionLabel: 'Adjust punch',
    memberId: 'm9',
  },
  {
    id: 'ack-6',
    category: 'rules',
    categoryLabel: 'Rules',
    title: 'Rules version 3 is in effect',
    detail: 'Grace period 15 to 10 min · from Fri 16 Oct · Sana Qureshi',
    iconType: 'rule',
    timestamp: '16 Oct',
    actionType: 'change_rule',
    actionLabel: 'Edit rules',
  },
];

export const INITIAL_HOURLY_ATTENDANCE: HourlyAttendancePoint[] = [
  { hour: '09:00', gulberg: 3, dha: 2 },
  { hour: '10:00', gulberg: 3, dha: 2 },
  { hour: '11:00', gulberg: 3, dha: 2 },
  { hour: '12:00', gulberg: 4, dha: 3 },
  { hour: '13:00', gulberg: 4, dha: 3 },
  { hour: '14:00', gulberg: 6, dha: 4 },
  { hour: '15:00', gulberg: 6, dha: 4 },
  { hour: '16:00', gulberg: 6, dha: 4, isCurrentHour: true },
  { hour: '17:00', gulberg: 6, dha: 4, isPlanned: true },
  { hour: '18:00', gulberg: 3, dha: 2, isPlanned: true },
  { hour: '19:00', gulberg: 3, dha: 2, isPlanned: true },
  { hour: '20:00', gulberg: 2, dha: 1, isPlanned: true },
  { hour: '21:00', gulberg: 2, dha: 1, isPlanned: true },
];

export const INITIAL_RULE_CONFIG: AttendanceRuleConfig = {
  version: 3,
  graceMinutes: 10,
  autoClockOutTime: '22:30',
  overtimeAfterHours: 8,
  wfhPresenceCheckIntervalMin: 120,
  updatedBy: 'Sana Qureshi',
  effectiveFrom: 'Fri 16 Oct',
};

export const ADMIN_REPORT_SPECS: AdminReportSpec[] = [
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Present, late, absent and leave per person',
    fileName: 'pulsedesk-attendance-2026-10-28.csv',
  },
  {
    id: 'hours_overtime',
    title: 'Hours and overtime',
    description: 'Worked against expected, with overtime',
    fileName: 'pulsedesk-hours-overtime-2026-10-28.csv',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Open, done and overdue per person',
    fileName: 'pulsedesk-tasks-2026-10-28.csv',
  },
  {
    id: 'payroll',
    title: 'Payroll file',
    description: 'October 2026 · draft until the period is locked',
    fileName: 'pulsedesk-payroll-october-2026.csv',
  },
];

export function buildReportPreviewRows(
  reportId: ReportId,
  members: TeamMember[],
  tasks: TeamTaskItem[],
  officeFilter: 'all' | OfficeLocation,
  periodLocked: boolean
): { headers: string[]; rows: string[][] } {
  const scopedMembers =
    officeFilter === 'all'
      ? members
      : members.filter((m) => m.office === officeFilter);

  const scopedTasks =
    officeFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.office === officeFilter);

  if (reportId === 'attendance') {
    return {
      headers: ['Employee', 'Site', 'Shift', 'Status', 'Clock-in', 'Hours today'],
      rows: scopedMembers.map((m) => [
        m.name,
        m.office,
        m.shiftWave,
        m.presence === 'working'
          ? 'In office'
          : m.presence === 'wfh'
            ? 'From home'
            : 'Absent',
        m.checkInTime ?? '—',
        `${m.hoursToday.toFixed(1)}h`,
      ]),
    };
  }

  if (reportId === 'hours_overtime') {
    return {
      headers: [
        'Employee',
        'Site',
        'Worked today',
        'Expected',
        'Variance',
        'Overtime',
      ],
      rows: scopedMembers.map((m) => {
        const diff = m.hoursToday - m.expectedToday;
        const ot = Math.max(0, m.hoursToday - 8);
        return [
          m.name,
          m.office,
          `${m.hoursToday.toFixed(1)}h`,
          `${m.expectedToday.toFixed(1)}h`,
          m.presence === 'absent'
            ? 'Absent'
            : `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}h`,
          `${ot.toFixed(1)}h`,
        ];
      }),
    };
  }

  if (reportId === 'tasks') {
    return {
      headers: ['Task', 'Owner', 'Site', 'Project', 'Due', 'Status', 'Est.'],
      rows: scopedTasks.map((t) => [
        t.title,
        t.assigneeLabel,
        t.office,
        t.project,
        t.dueLabel,
        t.status === 'done'
          ? 'Done'
          : t.status === 'overdue'
            ? 'Overdue'
            : 'Due today',
        `${t.estimateHours.toFixed(1)}h`,
      ]),
    };
  }

  return {
    headers: [
      'Employee',
      'Site',
      'Period',
      'Regular (h)',
      'Overtime (h)',
      'Payroll State',
    ],
    rows: scopedMembers.map((m) => {
      const reg = m.presence === 'absent' ? 152 : 160;
      const ot = m.id === 'm3' ? 2.5 : m.id === 'm9' ? 1.2 : 0;
      return [
        m.name,
        m.office,
        'Oct 2026',
        `${reg.toFixed(1)}`,
        `${ot.toFixed(1)}`,
        periodLocked ? 'Locked' : 'Draft',
      ];
    }),
  };
}

export function triggerCsvDownload(
  fileName: string,
  headers: string[],
  rows: string[][]
): void {
  const escapeCell = (val: string) => {
    const clean = val.replace(/"/g, '""');
    return /[",\n]/.test(clean) ? `"${clean}"` : clean;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}
