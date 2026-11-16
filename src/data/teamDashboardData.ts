export type OfficeLocation = 'Gulberg' | 'DHA Phase 6';
export type PresenceStatus = 'working' | 'wfh' | 'absent';

export type ShiftWave = 'Morning' | 'Midday' | 'Afternoon';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
  office: OfficeLocation;
  shiftWave: ShiftWave;
  presence: PresenceStatus;
  checkInTime: string | null;
  hoursToday: number;
  expectedToday: number;
  workloadHours: number;
  workTimeLeft: number;
}

export type ApprovalCategory = 'leave' | 'home_day' | 'clock_fix' | 'overtime';

export interface PendingRequest {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  avatarBg: string;
  office: OfficeLocation;
  category: ApprovalCategory;
  categoryLabel: string;
  summary: string;
  dateLabel: string;
  note: string;
  submittedAt: string;
}

export interface PendingTimesheet {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  avatarBg: string;
  office: OfficeLocation;
  period: string;
  loggedHours: number;
  targetHours: number;
  overtimeHours: number;
  statusNote: string;
}

export interface OpenQuestion {
  id: string;
  initials: string;
  avatarBg: string;
  sender: string;
  question: string;
  context: string;
  askedAt: string;
  mode: 'reply' | 'waiting' | 'answered';
  waitingOn?: string;
  replyText?: string;
  nudged?: boolean;
  quickReplies?: string[];
}

export type TeamTaskStatus = 'overdue' | 'due_today' | 'done';

export interface TeamTaskItem {
  id: string;
  title: string;
  assigneeIds: string[];
  assigneeLabel: string;
  assigneeInitials: string;
  avatarBg: string;
  office: OfficeLocation;
  dueLabel: string;
  project: string;
  status: TeamTaskStatus;
  estimateHours: number;
}

export interface TeamScheduleBlock {
  id: string;
  time: string;
  title: string;
  duration: string;
  office: 'All offices' | OfficeLocation;
  attendees: string;
  category: 'Meeting' | 'Break' | 'Deadline';
  dayGroup: 'today' | 'tomorrow';
}

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: 'Zain Malik',
    initials: 'ZM',
    avatarBg: 'bg-pink-500 text-white',
    role: 'Product Designer',
    office: 'Gulberg',
    shiftWave: 'Morning',
    presence: 'working',
    checkInTime: '08:58',
    hoursToday: 5.2,
    expectedToday: 5.1,
    workloadHours: 1.0,
    workTimeLeft: 5.3,
  },
  {
    id: 'm2',
    name: 'Nida Raza',
    initials: 'NR',
    avatarBg: 'bg-orange-600 text-white',
    role: 'Operations Coordinator',
    office: 'DHA Phase 6',
    shiftWave: 'Morning',
    presence: 'working',
    checkInTime: '09:01',
    hoursToday: 5.1,
    expectedToday: 5.1,
    workloadHours: 0.5,
    workTimeLeft: 5.3,
  },
  {
    id: 'm3',
    name: 'Ayesha Khan',
    initials: 'AK',
    avatarBg: 'bg-rose-500 text-white',
    role: 'Lead UI Engineer',
    office: 'Gulberg',
    shiftWave: 'Morning',
    presence: 'working',
    checkInTime: '09:04',
    hoursToday: 5.1,
    expectedToday: 5.1,
    workloadHours: 6.0,
    workTimeLeft: 5.3,
  },
  {
    id: 'm4',
    name: 'Hamza Ali',
    initials: 'HA',
    avatarBg: 'bg-blue-600 text-white',
    role: 'Backend Engineer',
    office: 'Gulberg',
    shiftWave: 'Morning',
    presence: 'working',
    checkInTime: '09:24',
    hoursToday: 4.7,
    expectedToday: 5.1,
    workloadHours: 1.0,
    workTimeLeft: 5.3,
  },
  {
    id: 'm5',
    name: 'Maryam Siddiqui',
    initials: 'MS',
    avatarBg: 'bg-amber-500 text-white',
    role: 'Release Coordinator',
    office: 'DHA Phase 6',
    shiftWave: 'Midday',
    presence: 'working',
    checkInTime: '12:55',
    hoursToday: 2.2,
    expectedToday: 2.1,
    workloadHours: 2.8,
    workTimeLeft: 5.1,
  },
  {
    id: 'm6',
    name: 'Farhan Qureshi',
    initials: 'FQ',
    avatarBg: 'bg-orange-500 text-white',
    role: 'Platform Engineer',
    office: 'Gulberg',
    shiftWave: 'Midday',
    presence: 'working',
    checkInTime: '13:02',
    hoursToday: 2.1,
    expectedToday: 2.1,
    workloadHours: 1.3,
    workTimeLeft: 5.1,
  },
  {
    id: 'm7',
    name: 'Sana Iqbal',
    initials: 'SI',
    avatarBg: 'bg-indigo-500 text-white',
    role: 'QA Specialist',
    office: 'Gulberg',
    shiftWave: 'Afternoon',
    presence: 'wfh',
    checkInTime: '13:54',
    hoursToday: 1.2,
    expectedToday: 0.9,
    workloadHours: 0.7,
    workTimeLeft: 5.5,
  },
  {
    id: 'm8',
    name: 'Hira Shah',
    initials: 'HS',
    avatarBg: 'bg-violet-500 text-white',
    role: 'Frontend Developer',
    office: 'DHA Phase 6',
    shiftWave: 'Afternoon',
    presence: 'working',
    checkInTime: '13:55',
    hoursToday: 1.2,
    expectedToday: 0.9,
    workloadHours: 1.0,
    workTimeLeft: 5.5,
  },
  {
    id: 'm9',
    name: 'Bilal Ahmed',
    initials: 'BA',
    avatarBg: 'bg-teal-600 text-white',
    role: 'QA Engineer',
    office: 'Gulberg',
    shiftWave: 'Afternoon',
    presence: 'working',
    checkInTime: '14:02',
    hoursToday: 1.1,
    expectedToday: 0.8,
    workloadHours: 2.8,
    workTimeLeft: 5.5,
  },
  {
    id: 'm10',
    name: 'Usman Tariq',
    initials: 'UT',
    avatarBg: 'bg-emerald-600 text-white',
    role: 'Ops & Support',
    office: 'DHA Phase 6',
    shiftWave: 'Morning',
    presence: 'absent',
    checkInTime: null,
    hoursToday: 0,
    expectedToday: 3.3,
    workloadHours: 4.8,
    workTimeLeft: 5.3,
  },
];

export const INITIAL_PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'req1',
    memberId: 'm10',
    memberName: 'Usman Tariq',
    initials: 'UT',
    avatarBg: 'bg-emerald-600 text-white',
    office: 'DHA Phase 6',
    category: 'leave',
    categoryLabel: 'Sick leave',
    summary: '1 day · Today, 28 Oct',
    dateLabel: '28 Oct',
    note: 'Down with fever this morning; backlog handover shared with Nida.',
    submittedAt: '08:40',
  },
  {
    id: 'req2',
    memberId: 'm5',
    memberName: 'Maryam Siddiqui',
    initials: 'MS',
    avatarBg: 'bg-amber-500 text-white',
    office: 'DHA Phase 6',
    category: 'leave',
    categoryLabel: 'Annual leave',
    summary: '2 days · 4–5 Nov',
    dateLabel: '4–5 Nov',
    note: 'Family travel; release weekend rota already covered.',
    submittedAt: 'Yesterday',
  },
  {
    id: 'req3',
    memberId: 'm7',
    memberName: 'Sana Iqbal',
    initials: 'SI',
    avatarBg: 'bg-indigo-500 text-white',
    office: 'Gulberg',
    category: 'home_day',
    categoryLabel: 'Home day',
    summary: '1 day · Fri, 30 Oct',
    dateLabel: '30 Oct',
    note: 'Running Release 2.4 regression suite remotely.',
    submittedAt: '10:15',
  },
  {
    id: 'req4',
    memberId: 'm4',
    memberName: 'Hamza Ali',
    initials: 'HA',
    avatarBg: 'bg-blue-600 text-white',
    office: 'Gulberg',
    category: 'home_day',
    categoryLabel: 'Home day',
    summary: '1 day · Thu, 29 Oct',
    dateLabel: '29 Oct',
    note: 'Deep focus day to finish API rate-limiter tests.',
    submittedAt: '11:05',
  },
  {
    id: 'req5',
    memberId: 'm6',
    memberName: 'Farhan Qureshi',
    initials: 'FQ',
    avatarBg: 'bg-orange-500 text-white',
    office: 'Gulberg',
    category: 'clock_fix',
    categoryLabel: 'Clock fix',
    summary: '27 Oct · Clock-in 09:02',
    dateLabel: '27 Oct',
    note: 'Badge reader offline at Gulberg entrance; arrived at 09:02.',
    submittedAt: '09:30',
  },
  {
    id: 'req6',
    memberId: 'm9',
    memberName: 'Bilal Ahmed',
    initials: 'BA',
    avatarBg: 'bg-teal-600 text-white',
    office: 'Gulberg',
    category: 'clock_fix',
    categoryLabel: 'Clock fix',
    summary: '26 Oct · Clock-out 18:10',
    dateLabel: '26 Oct',
    note: 'Forgot to punch out after staging deployment.',
    submittedAt: 'Yesterday',
  },
  {
    id: 'req7',
    memberId: 'm3',
    memberName: 'Ayesha Khan',
    initials: 'AK',
    avatarBg: 'bg-rose-500 text-white',
    office: 'Gulberg',
    category: 'overtime',
    categoryLabel: 'Overtime',
    summary: '2.5h · Sat, 24 Oct',
    dateLabel: '24 Oct',
    note: 'Weekend hero illustration revisions for DHA client demo.',
    submittedAt: '25 Oct',
  },
];

export const INITIAL_PENDING_TIMESHEETS: PendingTimesheet[] = [
  {
    id: 'ts1',
    memberId: 'm10',
    memberName: 'Usman Tariq',
    initials: 'UT',
    avatarBg: 'bg-emerald-600 text-white',
    office: 'DHA Phase 6',
    period: '19 Oct – 25 Oct',
    loggedHours: 38.5,
    targetHours: 40,
    overtimeHours: 0,
    statusNote: '1.5h short on Tue · Not confirmed yet',
  },
  {
    id: 'ts2',
    memberId: 'm9',
    memberName: 'Bilal Ahmed',
    initials: 'BA',
    avatarBg: 'bg-teal-600 text-white',
    office: 'Gulberg',
    period: '19 Oct – 25 Oct',
    loggedHours: 41.2,
    targetHours: 40,
    overtimeHours: 1.2,
    statusNote: '+1.2h overtime on Thu · Not confirmed yet',
  },
];

export const INITIAL_OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: 'oq1',
    initials: 'ZM',
    avatarBg: 'bg-pink-500 text-white',
    sender: 'Zain Malik',
    question: 'Do we get the banner from Gulberg or print a new one?',
    context: 'Asked you · DHA client demo',
    askedAt: '14:12',
    mode: 'reply',
    quickReplies: [
      'Bring the existing Gulberg banner',
      'Print a fresh one for DHA',
    ],
  },
  {
    id: 'oq2',
    initials: 'MS',
    avatarBg: 'bg-amber-500 text-white',
    sender: 'Maryam Siddiqui',
    question:
      'Can we publish the release weekend rota today? Everyone has confirmed their shifts.',
    context: 'Asked you · Gulberg rota · release weekend',
    askedAt: '13:45',
    mode: 'reply',
    quickReplies: [
      'Yes, publish the rota now',
      'Hold until 16:00 check-in',
    ],
  },
  {
    id: 'oq3',
    initials: 'SQ',
    avatarBg: 'bg-pink-600 text-white',
    sender: 'Sana Qureshi',
    question: 'Can you send the release weekend effort budget?',
    context: 'Asked you · Imran Butt and Sana Qureshi',
    askedAt: '12:50',
    mode: 'reply',
    quickReplies: [
      'Sending the approved sheet shortly',
      'Same cap as Release 2.3 (24h)',
    ],
  },
  {
    id: 'oq4',
    initials: 'AK',
    avatarBg: 'bg-rose-500 text-white',
    sender: 'Ayesha Khan',
    question:
      'Ayesha, will the hero images be ready before the 15:00 briefing?',
    context: 'Waiting on Ayesha · Release 2.4 landing page',
    askedAt: '11:24',
    mode: 'waiting',
    waitingOn: 'Ayesha',
  },
];

export const INITIAL_TEAM_TASKS: TeamTaskItem[] = [
  {
    id: 'tt1',
    title: 'Security training module',
    assigneeIds: ['m3', 'm7'],
    assigneeLabel: 'Ayesha, Sana',
    assigneeInitials: 'AK',
    avatarBg: 'bg-rose-500 text-white',
    office: 'Gulberg',
    dueLabel: 'Due yesterday',
    project: 'Training',
    status: 'overdue',
    estimateHours: 1.5,
  },
  {
    id: 'tt2',
    title: 'Backlog clean-up',
    assigneeIds: ['m10'],
    assigneeLabel: 'Usman',
    assigneeInitials: 'UT',
    avatarBg: 'bg-emerald-600 text-white',
    office: 'DHA Phase 6',
    dueLabel: 'Due yesterday',
    project: 'Daily office ops',
    status: 'overdue',
    estimateHours: 2.0,
  },
  {
    id: 'tt3',
    title: 'Developer candidate shortlist',
    assigneeIds: ['m7'],
    assigneeLabel: 'Imran, Sana',
    assigneeInitials: 'IB',
    avatarBg: 'bg-pink-500 text-white',
    office: 'Gulberg',
    dueLabel: 'Due yesterday',
    project: 'Hiring',
    status: 'overdue',
    estimateHours: 1.5,
  },
  {
    id: 'tt4',
    title: 'Review pull requests',
    assigneeIds: ['m3'],
    assigneeLabel: 'Ayesha',
    assigneeInitials: 'AK',
    avatarBg: 'bg-rose-500 text-white',
    office: 'Gulberg',
    dueLabel: 'Due 09:45',
    project: 'Daily office ops',
    status: 'overdue',
    estimateHours: 1.5,
  },
  {
    id: 'tt5',
    title: 'Publish the 2.4 announcement',
    assigneeIds: ['m4'],
    assigneeLabel: 'Hamza',
    assigneeInitials: 'HA',
    avatarBg: 'bg-blue-600 text-white',
    office: 'Gulberg',
    dueLabel: 'Due 12:00',
    project: 'Release 2.4',
    status: 'overdue',
    estimateHours: 1.0,
  },
  {
    id: 'tt6',
    title: 'On-call rota for release weekend',
    assigneeIds: ['m5'],
    assigneeLabel: 'Maryam',
    assigneeInitials: 'MS',
    avatarBg: 'bg-amber-500 text-white',
    office: 'DHA Phase 6',
    dueLabel: 'Due 15:00',
    project: 'Release 2.4',
    status: 'overdue',
    estimateHours: 1.5,
  },
  {
    id: 'tt7',
    title: 'Finalize hero images for Release 2.4',
    assigneeIds: ['m3'],
    assigneeLabel: 'Ayesha',
    assigneeInitials: 'AK',
    avatarBg: 'bg-rose-500 text-white',
    office: 'Gulberg',
    dueLabel: 'Due 16:00',
    project: 'Release 2.4',
    status: 'due_today',
    estimateHours: 2.0,
  },
  {
    id: 'tt8',
    title: 'Confirm DHA Phase 6 desk allocation',
    assigneeIds: ['m2'],
    assigneeLabel: 'Nida',
    assigneeInitials: 'NR',
    avatarBg: 'bg-orange-600 text-white',
    office: 'DHA Phase 6',
    dueLabel: 'Due 17:00',
    project: 'Daily office ops',
    status: 'due_today',
    estimateHours: 0.5,
  },
  {
    id: 'tt9',
    title: 'Verify staging webhook keys',
    assigneeIds: ['m6'],
    assigneeLabel: 'Farhan',
    assigneeInitials: 'FQ',
    avatarBg: 'bg-orange-500 text-white',
    office: 'Gulberg',
    dueLabel: 'Due 17:30',
    project: 'Release 2.4',
    status: 'due_today',
    estimateHours: 1.3,
  },
  {
    id: 'tt10',
    title: 'Send DHA client demo agenda',
    assigneeIds: ['m10'],
    assigneeLabel: 'Usman',
    assigneeInitials: 'UT',
    avatarBg: 'bg-emerald-600 text-white',
    office: 'DHA Phase 6',
    dueLabel: 'Due 18:00',
    project: 'DHA client demo',
    status: 'due_today',
    estimateHours: 1.0,
  },
];

export const INITIAL_TEAM_SCHEDULE: TeamScheduleBlock[] = [
  {
    id: 'tsb1',
    time: '15:00',
    title: 'Security briefing & Release 2.4 readiness',
    duration: '30m',
    office: 'All offices',
    attendees: 'Ayesha, Hamza, Maryam, Sana',
    category: 'Meeting',
    dayGroup: 'today',
  },
  {
    id: 'tsb2',
    time: '16:20',
    title: 'Asr break window',
    duration: '20m',
    office: 'All offices',
    attendees: 'Team-wide',
    category: 'Break',
    dayGroup: 'today',
  },
  {
    id: 'tsb3',
    time: '17:15',
    title: 'DHA client demo banner sign-off',
    duration: '20m',
    office: 'DHA Phase 6',
    attendees: 'Zain, Nida',
    category: 'Meeting',
    dayGroup: 'today',
  },
  {
    id: 'tsb4',
    time: '09:15',
    title: 'Daily stand-up (Gulberg + DHA Phase 6)',
    duration: '15m',
    office: 'All offices',
    attendees: 'All 10 members',
    category: 'Meeting',
    dayGroup: 'tomorrow',
  },
  {
    id: 'tsb5',
    time: '11:30',
    title: 'Release weekend rota freeze',
    duration: '15m',
    office: 'Gulberg',
    attendees: 'Maryam, Sana, Bilal',
    category: 'Deadline',
    dayGroup: 'tomorrow',
  },
];
