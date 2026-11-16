export type TimeframeKey = 'week' | 'october' | 'quarter';

export type TaskStatus = 'overdue' | 'todo' | 'in_progress' | 'done';

export interface TaskItem {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  status: TaskStatus;
  estimateHours: number;
}

export interface DailyHourEntry {
  day: string;
  date: string;
  office: number;
  wfh: number;
  target: number;
  note: string;
}

export interface WeeklyHourEntry {
  id: string;
  label: string;
  range: string;
  office: number;
  wfh: number;
  target: number;
  inProgress?: boolean;
  projectedTotal?: number;
  daily: DailyHourEntry[];
}

export interface OnTimeWeekEntry {
  week: string;
  rate: number;
  onTimeCount: number;
  totalCount: number;
  inProgress?: boolean;
}

export interface AttendancePoint {
  date: string;
  checkIn: string;
  minutesDelta: number; // negative = early, positive = late
  status: 'on_time' | 'late' | 'wfh';
  score: number;
}

export interface ChatReplyMetric {
  index: number;
  colleague: string;
  topic: string;
  minutes: number;
}

export interface ChatThread {
  id: string;
  initials: string;
  avatarBg: string;
  sender: string;
  title: string;
  subtitle: string;
  unreadCount: number;
  needsReply?: boolean;
  replyDeadline?: string;
  messages: { author: string; text: string; time: string }[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  duration: string;
  category: 'Meeting' | 'Break' | 'Focus';
  dayGroup: 'today' | 'tomorrow';
  completed?: boolean;
}

export interface LeaveQuota {
  id: string;
  label: string;
  used: number;
  pending: number;
  total: number;
  unit: string;
  accent: 'blue' | 'emerald';
  subtitleNote?: string;
}

export interface MonthlyLeaveTrend {
  month: string;
  wfhDays: number;
  leaveDays: number;
}

export const INITIAL_ATTENDANCE_SERIES: AttendancePoint[] = [
  { date: '1 Oct', checkIn: '08:56', minutesDelta: -4, status: 'on_time', score: 94 },
  { date: '2 Oct', checkIn: '09:01', minutesDelta: 1, status: 'on_time', score: 93 },
  { date: '5 Oct', checkIn: '09:16', minutesDelta: 16, status: 'late', score: 86 },
  { date: '7 Oct', checkIn: '08:54', minutesDelta: -6, status: 'wfh', score: 88 },
  { date: '9 Oct', checkIn: '09:03', minutesDelta: 3, status: 'on_time', score: 89 },
  { date: '12 Oct', checkIn: '09:22', minutesDelta: 22, status: 'late', score: 83 },
  { date: '14 Oct', checkIn: '08:58', minutesDelta: -2, status: 'on_time', score: 85 },
  { date: '16 Oct', checkIn: '08:51', minutesDelta: -9, status: 'wfh', score: 87 },
  { date: '19 Oct', checkIn: '09:14', minutesDelta: 14, status: 'late', score: 84 },
  { date: '21 Oct', checkIn: '08:59', minutesDelta: -1, status: 'on_time', score: 86 },
  { date: '23 Oct', checkIn: '08:55', minutesDelta: -5, status: 'on_time', score: 88 },
  { date: '26 Oct', checkIn: '09:02', minutesDelta: 2, status: 'on_time', score: 89 },
  { date: '28 Oct', checkIn: '09:04', minutesDelta: 4, status: 'on_time', score: 89 },
];

export const INITIAL_CHAT_REPLY_SERIES: ChatReplyMetric[] = [
  { index: 1, colleague: 'Sana', topic: 'Desk handover', minutes: 18 },
  { index: 2, colleague: 'Imran', topic: 'Banner specs', minutes: 42 },
  { index: 3, colleague: 'Bilal', topic: 'QA sign-off', minutes: 26 },
  { index: 4, colleague: 'Zara', topic: 'Color tokens', minutes: 54 },
  { index: 5, colleague: 'Sana', topic: 'Grace policy', minutes: 15 },
  { index: 6, colleague: 'Imran', topic: 'Hero crop', minutes: 38 },
  { index: 7, colleague: 'Hamza', topic: 'API keys', minutes: 29 },
  { index: 8, colleague: 'Zara', topic: 'Asset export', minutes: 47 },
  { index: 9, colleague: 'Bilal', topic: 'Staging URL', minutes: 21 },
  { index: 10, colleague: 'Sana', topic: 'Lunch roster', minutes: 33 },
  { index: 11, colleague: 'Imran', topic: 'Sprint notes', minutes: 48 },
  { index: 12, colleague: 'Hamza', topic: 'Briefing deck', minutes: 37 },
];

export const INITIAL_WEEKLY_HOURS: WeeklyHourEntry[] = [
  {
    id: 'w1',
    label: '1 Oct',
    range: '1–2 Oct',
    office: 23.5,
    wfh: 8.0,
    target: 32,
    daily: [
      { day: 'Thu', date: '1 Oct', office: 7.5, wfh: 8.0, target: 16, note: 'Sprint kickoff + remote afternoon' },
      { day: 'Fri', date: '2 Oct', office: 16.0, wfh: 0, target: 16, note: 'On-site Gulberg design review' },
    ],
  },
  {
    id: 'w2',
    label: '5 Oct',
    range: '5–9 Oct',
    office: 30.2,
    wfh: 8.0,
    target: 40,
    daily: [
      { day: 'Mon', date: '5 Oct', office: 7.4, wfh: 0, target: 8, note: 'Late arrival (09:16)' },
      { day: 'Tue', date: '6 Oct', office: 8.1, wfh: 0, target: 8, note: 'Release 2.4 wireframes' },
      { day: 'Wed', date: '7 Oct', office: 0, wfh: 8.0, target: 8, note: 'Work from home day' },
      { day: 'Thu', date: '8 Oct', office: 7.5, wfh: 0, target: 8, note: 'Security workshop' },
      { day: 'Fri', date: '9 Oct', office: 7.2, wfh: 0, target: 8, note: 'Weekly wrap-up' },
    ],
  },
  {
    id: 'w3',
    label: '12 Oct',
    range: '12–16 Oct',
    office: 35.0,
    wfh: 8.0,
    target: 40,
    daily: [
      { day: 'Mon', date: '12 Oct', office: 8.4, wfh: 0, target: 8, note: 'Component library audit' },
      { day: 'Tue', date: '13 Oct', office: 9.1, wfh: 0, target: 8, note: 'Landing page milestone' },
      { day: 'Wed', date: '14 Oct', office: 8.5, wfh: 0, target: 8, note: 'Team sync & QA' },
      { day: 'Thu', date: '15 Oct', office: 9.0, wfh: 0, target: 8, note: 'Client deck revisions' },
      { day: 'Fri', date: '16 Oct', office: 0, wfh: 8.0, target: 8, note: 'Work from home day' },
    ],
  },
  {
    id: 'w4',
    label: '19 Oct',
    range: '19–23 Oct',
    office: 33.0,
    wfh: 8.0,
    target: 40,
    daily: [
      { day: 'Mon', date: '19 Oct', office: 7.8, wfh: 0, target: 8, note: 'Late arrival (09:14)' },
      { day: 'Tue', date: '20 Oct', office: 8.4, wfh: 0, target: 8, note: 'Hero illustration pass' },
      { day: 'Wed', date: '21 Oct', office: 8.6, wfh: 0, target: 8, note: 'Cross-browser review' },
      { day: 'Thu', date: '22 Oct', office: 0, wfh: 8.0, target: 8, note: 'Work from home day' },
      { day: 'Fri', date: '23 Oct', office: 8.2, wfh: 0, target: 8, note: 'Sprint demo prep' },
    ],
  },
  {
    id: 'w5',
    label: '26 Oct',
    range: '26–30 Oct (Active)',
    office: 20.4,
    wfh: 0,
    target: 40,
    inProgress: true,
    projectedTotal: 40.4,
    daily: [
      { day: 'Mon', date: '26 Oct', office: 7.9, wfh: 0, target: 8, note: 'Gulberg desk 2 · planning' },
      { day: 'Tue', date: '27 Oct', office: 7.3, wfh: 0, target: 8, note: 'Asset pipeline sync' },
      { day: 'Wed', date: '28 Oct', office: 5.2, wfh: 0, target: 8, note: 'Clocked in at 09:04 (active)' },
      { day: 'Thu', date: '29 Oct', office: 0, wfh: 0, target: 8, note: 'Scheduled · Stand-up 09:15' },
      { day: 'Fri', date: '30 Oct', office: 0, wfh: 0, target: 8, note: 'Scheduled · WFH planned' },
    ],
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Prepare hero images for Release 2.4 landing page',
    project: 'Release 2.4',
    dueDate: '27 Oct',
    status: 'overdue',
    estimateHours: 3.5,
  },
  {
    id: 't2',
    title: 'Submit Q3 Gulberg handover notes & asset archive',
    project: 'Operations',
    dueDate: '26 Oct',
    status: 'overdue',
    estimateHours: 1.5,
  },
  {
    id: 't3',
    title: 'Finalize Security briefing presentation slides',
    project: 'Security',
    dueDate: '28 Oct · 15:00',
    status: 'in_progress',
    estimateHours: 2.0,
  },
  {
    id: 't4',
    title: 'Responsive QA check on dashboard analytics view',
    project: 'Release 2.4',
    dueDate: '29 Oct',
    status: 'in_progress',
    estimateHours: 4.0,
  },
  {
    id: 't5',
    title: 'Export updated design tokens for mobile web',
    project: 'Design System',
    dueDate: '29 Oct',
    status: 'todo',
    estimateHours: 2.5,
  },
  {
    id: 't6',
    title: 'Update Gulberg office seating & desk roster',
    project: 'Operations',
    dueDate: '30 Oct',
    status: 'todo',
    estimateHours: 1.0,
  },
  {
    id: 't7',
    title: 'Review onboarding slide copy with Imran',
    project: 'People Ops',
    dueDate: '30 Oct',
    status: 'todo',
    estimateHours: 1.5,
  },
  {
    id: 't8',
    title: 'Draft November sprint capacity proposal',
    project: 'Planning',
    dueDate: '31 Oct',
    status: 'todo',
    estimateHours: 2.0,
  },
  {
    id: 't9',
    title: 'Sprint 14 retrospective summary notes',
    project: 'Planning',
    dueDate: '16 Oct',
    status: 'done',
    estimateHours: 1.5,
  },
  {
    id: 't10',
    title: 'Sign off photography vendor invoice #408',
    project: 'Operations',
    dueDate: '19 Oct',
    status: 'done',
    estimateHours: 0.5,
  },
  {
    id: 't11',
    title: 'Publish October Gulberg team feedback poll',
    project: 'People Ops',
    dueDate: '22 Oct',
    status: 'done',
    estimateHours: 1.0,
  },
];

export const INITIAL_ON_TIME_TREND: OnTimeWeekEntry[] = [
  { week: '31 Aug', rate: 82, onTimeCount: 9, totalCount: 11 },
  { week: '7 Sep', rate: 92, onTimeCount: 11, totalCount: 12 },
  { week: '14 Sep', rate: 91, onTimeCount: 10, totalCount: 11 },
  { week: '21 Sep', rate: 75, onTimeCount: 6, totalCount: 8 },
  { week: '28 Sep', rate: 64, onTimeCount: 7, totalCount: 11 },
  { week: '5 Oct', rate: 92, onTimeCount: 12, totalCount: 13 },
  { week: '12 Oct', rate: 91, onTimeCount: 10, totalCount: 11 },
  { week: '19 Oct', rate: 89, onTimeCount: 8, totalCount: 9, inProgress: true },
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    time: '15:00',
    title: 'Security briefing',
    duration: '30m',
    category: 'Meeting',
    dayGroup: 'today',
  },
  {
    id: 's2',
    time: '16:20',
    title: 'Asr',
    duration: '20m',
    category: 'Break',
    dayGroup: 'today',
  },
  {
    id: 's3',
    time: '09:15',
    title: 'Daily stand-up',
    duration: '15m',
    category: 'Meeting',
    dayGroup: 'tomorrow',
  },
];

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'c1',
    initials: 'IB',
    avatarBg: 'bg-rose-500 text-white',
    sender: 'Imran',
    title: 'Ayesha, will the hero images be ready before the 15:00 briefing?',
    subtitle: 'Release 2.4 landing page · reply by 12:00',
    unreadCount: 1,
    needsReply: true,
    replyDeadline: '12:00',
    messages: [
      {
        author: 'Imran',
        text: 'Ayesha, will the hero images be ready before the 15:00 briefing?',
        time: '11:24',
      },
    ],
  },
  {
    id: 'c2',
    initials: 'SI',
    avatarBg: 'bg-indigo-500 text-white',
    sender: 'Sana',
    title: 'Gulberg office team',
    subtitle: 'Sana: Clocked in, starting at desk 2. @Ayesha can you leave the handover notes in the drawer before you go?',
    unreadCount: 2,
    messages: [
      {
        author: 'Sana',
        text: 'Clocked in, starting at desk 2. @Ayesha can you leave the handover notes in the drawer before you go?',
        time: '09:18',
      },
    ],
  },
  {
    id: 'c3',
    initials: 'SQ',
    avatarBg: 'bg-pink-600 text-white',
    sender: 'Sana',
    title: 'Announcements',
    subtitle: 'Sana: The grace period is now 10 minutes at both offices.',
    unreadCount: 1,
    messages: [
      {
        author: 'Sana',
        text: 'The grace period is now 10 minutes at both offices.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 'c4',
    initials: 'IB',
    avatarBg: 'bg-rose-500 text-white',
    sender: 'Imran',
    title: 'Plan for today - Gulberg',
    subtitle: 'Imran: @Ayesha please check in with your plan when you are back from the desk.',
    unreadCount: 1,
    messages: [
      {
        author: 'Imran',
        text: '@Ayesha please check in with your plan when you are back from the desk.',
        time: '10:05',
      },
    ],
  },
];

export const INITIAL_LEAVE_QUOTAS: LeaveQuota[] = [
  {
    id: 'annual',
    label: 'Annual leave',
    used: 5,
    pending: 1,
    total: 14,
    unit: 'days',
    accent: 'blue',
    subtitleNote: '1 day pending approval',
  },
  {
    id: 'sick',
    label: 'Sick leave',
    used: 3,
    pending: 0,
    total: 8,
    unit: 'days',
    accent: 'blue',
  },
  {
    id: 'casual',
    label: 'Casual leave',
    used: 4,
    pending: 0,
    total: 6,
    unit: 'days',
    accent: 'blue',
  },
  {
    id: 'wfh',
    label: 'Home days',
    used: 1,
    pending: 0,
    total: 4,
    unit: 'in October',
    accent: 'emerald',
  },
];

export const MONTHLY_LEAVE_TREND: MonthlyLeaveTrend[] = [
  { month: 'Jul', wfhDays: 3, leaveDays: 2 },
  { month: 'Aug', wfhDays: 4, leaveDays: 1 },
  { month: 'Sep', wfhDays: 3, leaveDays: 3 },
  { month: 'Oct', wfhDays: 1, leaveDays: 2 },
];
