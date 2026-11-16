import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Home,
  MessageSquare,
  Moon,
  Plus,
  Send,
  Sun,
} from 'lucide-react';
import { TopBar } from './components/TopBar';
import { KpiRow } from './components/KpiRow';
import { HoursChartCard } from './components/HoursChartCard';
import { TasksAnalyticsCard } from './components/TasksAnalyticsCard';
import { WorkspaceLowerRow } from './components/WorkspaceLowerRow';
import {
  ActionDrawerModal,
  ActiveModalType,
} from './components/ActionDrawerModal';
import { TeamPresenceBanner } from './components/TeamPresenceBanner';
import { TeamKpiRow } from './components/TeamKpiRow';
import { HoursSortMode, TeamHoursCard } from './components/TeamHoursCard';
import { OpenQuestionsCard } from './components/OpenQuestionsCard';
import { TaskFilterTab, TeamTasksCard } from './components/TeamTasksCard';
import { TeamWorkloadCard } from './components/TeamWorkloadCard';
import {
  RebalanceMove,
  TeamModals,
  TeamModalState,
} from './components/TeamModals';
import { AdminKpiRow } from './components/AdminKpiRow';
import { AdminAcknowledgementsCard } from './components/AdminAcknowledgementsCard';
import { AdminSiteAttendanceCard } from './components/AdminSiteAttendanceCard';
import { AdminHourlyChartCard } from './components/AdminHourlyChartCard';
import { AdminReportsCard } from './components/AdminReportsCard';
import { AdminModals, AdminModalState } from './components/AdminModals';
import {
  ADMIN_REPORT_SPECS,
  AcknowledgementItem,
  AdminSiteMetric,
  AttendanceRuleConfig,
  AuditLogEntry,
  buildReportPreviewRows,
  INITIAL_ACKNOWLEDGEMENTS,
  INITIAL_ADMIN_SITES,
  INITIAL_HOURLY_ATTENDANCE,
  INITIAL_RULE_CONFIG,
  ReportId,
  triggerCsvDownload,
} from './data/adminDashboardData';
import {
  INITIAL_ATTENDANCE_SERIES,
  INITIAL_CHAT_REPLY_SERIES,
  INITIAL_CHAT_THREADS,
  INITIAL_LEAVE_QUOTAS,
  INITIAL_ON_TIME_TREND,
  INITIAL_SCHEDULE,
  INITIAL_TASKS,
  INITIAL_WEEKLY_HOURS,
  MONTHLY_LEAVE_TREND,
  TaskItem,
  TaskStatus,
  TimeframeKey,
} from './data/dashboardData';
import {
  INITIAL_OPEN_QUESTIONS,
  INITIAL_PENDING_REQUESTS,
  INITIAL_PENDING_TIMESHEETS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_TEAM_SCHEDULE,
  INITIAL_TEAM_TASKS,
  OfficeLocation,
  OpenQuestion,
  PendingRequest,
  PendingTimesheet,
  PresenceStatus,
  TeamMember,
  TeamTaskItem,
  TeamTaskStatus,
} from './data/teamDashboardData';

export default function App() {
  const [workspaceMode, setWorkspaceMode] = useState<
    'admin' | 'team' | 'personal'
  >('admin');
  const [activeSection, setActiveSection] = useState('overview');
  const [timeframe, setTimeframe] = useState<TimeframeKey>('october');
  const [officeFilter, setOfficeFilter] = useState<'all' | OfficeLocation>(
    'all'
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('pulsedesk-theme') === 'dark'
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('pulsedesk-theme', theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  // Clock-in live timer state
  const [clockedIn, setClockedIn] = useState(true);
  const [elapsedMinutes, setElapsedMinutes] = useState(311); // 5h 11m since 09:04

  useEffect(() => {
    if (!clockedIn) return;
    const id = window.setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60000);
    return () => window.clearInterval(id);
  }, [clockedIn]);

  const elapsedLabel = `${Math.floor(elapsedMinutes / 60)}h ${String(
    elapsedMinutes % 60
  ).padStart(2, '0')}m`;

  // Personal workspace state
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'all'>('all');
  const [taskViewMode, setTaskViewMode] = useState<'chart' | 'list'>('chart');
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [threads, setThreads] = useState(INITIAL_CHAT_THREADS);
  const [chatReplySeries, setChatReplySeries] = useState(
    INITIAL_CHAT_REPLY_SERIES
  );
  const [highlightedChatId, setHighlightedChatId] = useState<string | null>(
    null
  );
  const [quotas, setQuotas] = useState(INITIAL_LEAVE_QUOTAS);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  // Team workspace state
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(
    INITIAL_PENDING_REQUESTS
  );
  const [pendingTimesheets, setPendingTimesheets] = useState<
    PendingTimesheet[]
  >(INITIAL_PENDING_TIMESHEETS);
  const [openQuestions, setOpenQuestions] = useState<OpenQuestion[]>(
    INITIAL_OPEN_QUESTIONS
  );
  const [teamTasks, setTeamTasks] =
    useState<TeamTaskItem[]>(INITIAL_TEAM_TASKS);
  const [teamHoursSort, setTeamHoursSort] =
    useState<HoursSortMode>('hours_desc');
  const [teamTaskFilter, setTeamTaskFilter] = useState<TaskFilterTab>('all');
  const [teamModal, setTeamModal] = useState<TeamModalState>(null);

  // Admin workspace state
  const [adminSites, setAdminSites] = useState<AdminSiteMetric[]>(
    INITIAL_ADMIN_SITES
  );
  const [acknowledgements, setAcknowledgements] = useState<
    AcknowledgementItem[]
  >(INITIAL_ACKNOWLEDGEMENTS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [periodLocked, setPeriodLocked] = useState(false);
  const [ruleConfig, setRuleConfig] = useState<AttendanceRuleConfig>(
    INITIAL_RULE_CONFIG
  );
  const [lateTodayCount, setLateTodayCount] = useState(0);
  const [overtimeHoursToday] = useState(0);
  const [adminModal, setAdminModal] = useState<AdminModalState>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3200);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Personal handlers ---
  const totalHoursLogged = INITIAL_WEEKLY_HOURS.reduce(
    (sum, w) => sum + w.office + w.wfh,
    0
  );
  const overdueCount = tasks.filter((t) => t.status === 'overdue').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const tasksOnTimeRate =
    tasks.length > 0
      ? Math.round(((tasks.length - overdueCount) / tasks.length) * 100)
      : 100;
  const waitingQuestionsCount = threads.filter((t) => t.needsReply).length;

  const handleToggleTaskDone = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
        return { ...t, status: nextStatus };
      })
    );
    showToast('Task status updated');
  };

  const handleAddTask = (
    title: string,
    project: string,
    dueDate: string,
    status: TaskStatus
  ) => {
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title,
      project,
      dueDate,
      status,
      estimateHours: 2.0,
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskViewMode('list');
    showToast(`Added task "${title}"`);
  };

  const handleAddSchedule = (
    time: string,
    title: string,
    duration: string,
    category: 'Meeting' | 'Focus' | 'Break'
  ) => {
    setSchedule((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        time,
        title,
        duration,
        category,
        dayGroup: 'today',
      },
    ]);
    showToast(`Added "${title}" at ${time}`);
  };

  const handleToggleScheduleItem = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleMarkThreadRead = (id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
    );
  };

  const handleReplyThread = (id: string, replyText: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              needsReply: false,
              unreadCount: 0,
              messages: [
                ...t.messages,
                { author: 'Ayesha', text: replyText, time: 'Just now' },
              ],
            }
          : t
      )
    );
    setChatReplySeries((prev) => [
      ...prev,
      {
        index: prev.length + 1,
        colleague: 'Imran',
        topic: 'Hero images',
        minutes: 22,
      },
    ]);
    setHighlightedChatId(null);
    showToast('Reply sent · Average response time updated');
  };

  const handleSubmitLeave = (quotaId: string, days: number) => {
    setQuotas((prev) =>
      prev.map((q) =>
        q.id === quotaId ? { ...q, pending: q.pending + days } : q
      )
    );
    showToast(
      quotaId === 'wfh'
        ? `Booked ${days} home day${days > 1 ? 's' : ''}`
        : `Submitted ${days}-day leave request`
    );
  };

  const handleFocusPendingChat = () => {
    const pending = threads.find((t) => t.needsReply) ?? threads[0];
    if (pending) {
      setHighlightedChatId(pending.id);
      const chatEl = document.getElementById('chat');
      chatEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFilterOverdueTasks = () => {
    setTaskFilter('overdue');
    setTaskViewMode('list');
    document.getElementById('tasks')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // --- Team / Manager handlers ---
  const filteredMembers =
    officeFilter === 'all'
      ? teamMembers
      : teamMembers.filter((m) => m.office === officeFilter);

  const filteredRequests =
    officeFilter === 'all'
      ? pendingRequests
      : pendingRequests.filter((r) => r.office === officeFilter);

  const filteredTimesheets =
    officeFilter === 'all'
      ? pendingTimesheets
      : pendingTimesheets.filter((ts) => ts.office === officeFilter);

  const filteredTeamTasks =
    officeFilter === 'all'
      ? teamTasks
      : teamTasks.filter((t) => t.office === officeFilter);

  const handleApproveRequest = (id: string) => {
    const req = pendingRequests.find((r) => r.id === id);
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    if (req) {
      showToast(`Approved ${req.memberName}'s ${req.categoryLabel.toLowerCase()}`);
    }
  };

  const handleDeclineRequest = (id: string) => {
    const req = pendingRequests.find((r) => r.id === id);
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    if (req) {
      showToast(`Declined ${req.memberName}'s ${req.categoryLabel.toLowerCase()}`);
    }
  };

  const handleApproveAllRequests = () => {
    const count = filteredRequests.length;
    const ids = new Set(filteredRequests.map((r) => r.id));
    setPendingRequests((prev) => prev.filter((r) => !ids.has(r.id)));
    showToast(`Approved ${count} waiting requests`);
  };

  const handleApproveTimesheet = (id: string) => {
    const ts = pendingTimesheets.find((t) => t.id === id);
    setPendingTimesheets((prev) => prev.filter((t) => t.id !== id));
    if (ts) {
      showToast(`Confirmed ${ts.memberName}'s timesheet (${ts.period})`);
    }
  };

  const handleReplyQuestion = (id: string, replyText: string) => {
    setOpenQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, mode: 'answered', replyText } : q
      )
    );
    showToast('Reply sent');
  };

  const handleNudgeQuestion = (id: string) => {
    const q = openQuestions.find((item) => item.id === id);
    setOpenQuestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nudged: true } : item))
    );
    if (q) {
      showToast(`Sent reminder to ${q.waitingOn ?? q.sender}`);
    }
  };

  const handleToggleTeamTaskDone = (taskId: string) => {
    const target = teamTasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextStatus: TeamTaskStatus =
      target.status === 'done' ? 'due_today' : 'done';
    const delta = nextStatus === 'done' ? -target.estimateHours : target.estimateHours;

    setTeamTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
    setTeamMembers((prev) =>
      prev.map((m) =>
        target.assigneeIds.includes(m.id)
          ? {
              ...m,
              workloadHours: Math.max(
                0,
                Number((m.workloadHours + delta).toFixed(1))
              ),
            }
          : m
      )
    );
    showToast(
      nextStatus === 'done'
        ? `Completed "${target.title}"`
        : `Reopened "${target.title}"`
    );
  };

  const handleReassignTeamTask = (taskId: string, newMemberId: string) => {
    const target = teamTasks.find((t) => t.id === taskId);
    const nextAssignee = teamMembers.find((m) => m.id === newMemberId);
    if (!target || !nextAssignee) return;

    const oldIds = target.assigneeIds;
    setTeamTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeIds: [nextAssignee.id],
              assigneeLabel: nextAssignee.name.split(' ')[0],
              assigneeInitials: nextAssignee.initials,
              avatarBg: nextAssignee.avatarBg,
              office: nextAssignee.office,
            }
          : t
      )
    );

    if (target.status !== 'done') {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (oldIds.includes(m.id) && m.id !== nextAssignee.id) {
            return {
              ...m,
              workloadHours: Math.max(
                0,
                Number((m.workloadHours - target.estimateHours).toFixed(1))
              ),
            };
          }
          if (m.id === nextAssignee.id && !oldIds.includes(m.id)) {
            return {
              ...m,
              workloadHours: Number(
                (m.workloadHours + target.estimateHours).toFixed(1)
              ),
            };
          }
          return m;
        })
      );
    }

    showToast(`Reassigned "${target.title}" to ${nextAssignee.name}`);
  };

  const handleApplyRebalance = (moves: RebalanceMove[]) => {
    if (moves.length === 0) return;
    const moveMap = new Map(moves.map((m) => [m.taskId, m.toMemberId]));

    // Compute workload hour deltas per member
    const deltaByMember = new Map<string, number>();
    teamTasks.forEach((t) => {
      const toMemberId = moveMap.get(t.id);
      if (!toMemberId || t.status === 'done') return;
      t.assigneeIds.forEach((oldId) => {
        if (oldId !== toMemberId) {
          deltaByMember.set(
            oldId,
            (deltaByMember.get(oldId) ?? 0) - t.estimateHours
          );
        }
      });
      if (!t.assigneeIds.includes(toMemberId)) {
        deltaByMember.set(
          toMemberId,
          (deltaByMember.get(toMemberId) ?? 0) + t.estimateHours
        );
      }
    });

    setTeamTasks((prev) =>
      prev.map((t) => {
        const toMemberId = moveMap.get(t.id);
        if (!toMemberId) return t;
        const nextAssignee = teamMembers.find((m) => m.id === toMemberId);
        if (!nextAssignee) return t;
        return {
          ...t,
          assigneeIds: [nextAssignee.id],
          assigneeLabel: nextAssignee.name.split(' ')[0],
          assigneeInitials: nextAssignee.initials,
          avatarBg: nextAssignee.avatarBg,
          office: nextAssignee.office,
        };
      })
    );

    setTeamMembers((prev) =>
      prev.map((m) => {
        const delta = deltaByMember.get(m.id);
        if (!delta) return m;
        return {
          ...m,
          workloadHours: Math.max(0, Number((m.workloadHours + delta).toFixed(1))),
        };
      })
    );

    showToast(
      `Rebalanced ${moves.length} task${moves.length === 1 ? '' : 's'} across available capacity`
    );
  };

  const handleAssignTeamTask = (
    title: string,
    memberId: string,
    project: string,
    dueLabel: string,
    estimateHours: number
  ) => {
    const assignee = teamMembers.find((m) => m.id === memberId);
    if (!assignee) return;

    const newTask: TeamTaskItem = {
      id: `tt-${Date.now()}`,
      title,
      assigneeIds: [assignee.id],
      assigneeLabel: assignee.name.split(' ')[0],
      assigneeInitials: assignee.initials,
      avatarBg: assignee.avatarBg,
      office: assignee.office,
      dueLabel,
      project,
      status: 'due_today',
      estimateHours,
    };

    setTeamTasks((prev) => [newTask, ...prev]);
    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === assignee.id
          ? {
              ...m,
              workloadHours: Number(
                (m.workloadHours + estimateHours).toFixed(1)
              ),
            }
          : m
      )
    );
    showToast(`Assigned "${title}" to ${assignee.name}`);
  };

  // --- Admin workspace handlers ---
  const formatNowLabel = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
  };

  const handleAcknowledgeItem = (id: string) => {
    const item = acknowledgements.find((a) => a.id === id);
    if (!item) return;
    setAcknowledgements((prev) => prev.filter((a) => a.id !== id));
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        title: item.title,
        detail: item.detail,
        actor: 'Acknowledged by Ayesha Khan (Admin)',
        timestamp: formatNowLabel(),
        source: 'acknowledged',
        originalAckItem: item,
      },
      ...prev,
    ]);
    showToast(`Moved "${item.title}" to Audit Log`);
  };

  const handleAcknowledgeAll = () => {
    if (acknowledgements.length === 0) return;
    const count = acknowledgements.length;
    const stamp = formatNowLabel();
    const newEntries: AuditLogEntry[] = acknowledgements.map((item, idx) => ({
      id: `audit-${Date.now()}-${idx}`,
      title: item.title,
      detail: item.detail,
      actor: 'Batch acknowledged by Ayesha Khan (Admin)',
      timestamp: stamp,
      source: 'acknowledged',
      originalAckItem: item,
    }));
    setAuditLog((prev) => [...newEntries, ...prev]);
    setAcknowledgements([]);
    showToast(`Moved ${count} items to the Audit Log`);
  };

  const handleUndoLastAck = () => {
    const latestAck = auditLog.find(
      (entry) => entry.source === 'acknowledged' && entry.originalAckItem
    );
    if (!latestAck || !latestAck.originalAckItem) return;
    setAuditLog((prev) => prev.filter((entry) => entry.id !== latestAck.id));
    setAcknowledgements((prev) => [latestAck.originalAckItem!, ...prev]);
    showToast(`Restored "${latestAck.title}"`);
  };

  const handleRestoreAuditItem = (auditId: string) => {
    const target = auditLog.find((entry) => entry.id === auditId);
    if (!target || !target.originalAckItem) return;
    setAuditLog((prev) => prev.filter((entry) => entry.id !== auditId));
    setAcknowledgements((prev) => [target.originalAckItem!, ...prev]);
    showToast(`Restored "${target.title}" to acknowledgement queue`);
  };

  const handleAddSite = (
    name: string,
    neededToday: number,
    totalDue: number,
    geofenceRadiusM: number
  ) => {
    const nextSite: AdminSiteMetric = {
      id: `site-${Date.now()}`,
      name,
      colorHex: '#4F46E5',
      dotClass: 'bg-indigo-600',
      totalDue,
      neededToday,
      workingInOffice: Math.min(totalDue, neededToday),
      workingFromHome: 0,
      absentCount: Math.max(0, totalDue - neededToday),
      geofenceRadiusM,
      updatedAt: formatNowLabel(),
    };
    setAdminSites((prev) => [...prev, nextSite]);
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        title: `Added site "${name}"`,
        detail: `${totalDue} staff assigned · ${neededToday} minimum daily · ${geofenceRadiusM}m geofence`,
        actor: 'Ayesha Khan (Admin)',
        timestamp: formatNowLabel(),
        source: 'admin_action',
      },
      ...prev,
    ]);
    showToast(`Added site "${name}"`);
  };

  const handleFixAttendance = (
    memberId: string,
    presence: PresenceStatus,
    checkInTime: string | null,
    reason: string
  ) => {
    const target = teamMembers.find((m) => m.id === memberId);
    if (!target) return;
    const prevPresence = target.presence;

    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              presence,
              checkInTime,
              hoursToday:
                presence === 'absent'
                  ? 0
                  : m.hoursToday === 0
                    ? 4.2
                    : m.hoursToday,
            }
          : m
      )
    );

    if (prevPresence !== presence) {
      setAdminSites((prev) =>
        prev.map((site) => {
          if (site.name !== target.office) return site;
          let workingInOffice = site.workingInOffice;
          let workingFromHome = site.workingFromHome;
          let absentCount = site.absentCount;

          if (prevPresence === 'working')
            workingInOffice = Math.max(0, workingInOffice - 1);
          if (prevPresence === 'wfh')
            workingFromHome = Math.max(0, workingFromHome - 1);
          if (prevPresence === 'absent')
            absentCount = Math.max(0, absentCount - 1);

          if (presence === 'working') workingInOffice += 1;
          if (presence === 'wfh') workingFromHome += 1;
          if (presence === 'absent') absentCount += 1;

          return {
            ...site,
            workingInOffice,
            workingFromHome,
            absentCount,
            updatedAt: formatNowLabel(),
          };
        })
      );
    }

    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        title: `Updated punch for ${target.name}`,
        detail: `${presence === 'working' ? 'Working on-site' : presence === 'wfh' ? 'Working from home' : 'Absent'}${checkInTime ? ` at ${checkInTime}` : ''} · ${reason}`,
        actor: 'Ayesha Khan (Admin)',
        timestamp: formatNowLabel(),
        source: 'admin_action',
      },
      ...prev,
    ]);
    showToast(`Updated attendance for ${target.name}`);
  };

  const handleTogglePeriodLock = () => {
    const nextLocked = !periodLocked;
    setPeriodLocked(nextLocked);
    if (nextLocked) {
      setAcknowledgements((prev) => prev.filter((a) => a.id !== 'ack-2'));
    }
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        title: nextLocked
          ? 'Locked October 2026 payroll period'
          : 'Reopened October 2026 payroll period',
        detail: nextLocked
          ? 'Payroll CSV finalized for finance export'
          : 'Payroll CSV reverted to draft state',
        actor: 'Ayesha Khan (Admin)',
        timestamp: formatNowLabel(),
        source: 'admin_action',
      },
      ...prev,
    ]);
    showToast(
      nextLocked
        ? 'October 2026 locked · Payroll CSV finalized'
        : 'October 2026 reopened as draft'
    );
  };

  const handleSaveRuleConfig = (
    next: Omit<AttendanceRuleConfig, 'version' | 'effectiveFrom'>
  ) => {
    const nextVersion = ruleConfig.version + 1;
    setRuleConfig({
      ...next,
      version: nextVersion,
      effectiveFrom: 'Today, 28 Oct',
    });
    if (next.graceMinutes < 10) {
      setLateTodayCount(1);
    } else {
      setLateTodayCount(0);
    }
    setAuditLog((prev) => [
      {
        id: `audit-${Date.now()}`,
        title: `Published Rules version ${nextVersion}`,
        detail: `Grace period ${next.graceMinutes}m · Auto clock-out ${next.autoClockOutTime} · Overtime >${next.overtimeAfterHours}h`,
        actor: next.updatedBy,
        timestamp: formatNowLabel(),
        source: 'admin_action',
      },
      ...prev,
    ]);
    showToast(`Published Rules version ${nextVersion}`);
  };

  const handleDownloadAdminReport = (reportId: ReportId) => {
    const spec =
      ADMIN_REPORT_SPECS.find((s) => s.id === reportId) ??
      ADMIN_REPORT_SPECS[0];
    const { headers, rows } = buildReportPreviewRows(
      reportId,
      teamMembers,
      teamTasks,
      officeFilter,
      periodLocked
    );
    triggerCsvDownload(spec.fileName, headers, rows);
    showToast(`Downloaded ${spec.fileName}`);
  };

  const filteredAdminSites =
    officeFilter === 'all'
      ? adminSites
      : adminSites.filter((s) => s.name === officeFilter);

  const gulbergSite = adminSites.find((s) => s.name === 'Gulberg');
  const dhaSite = adminSites.find((s) => s.name === 'DHA Phase 6');
  const adminApprovalCount =
    filteredRequests.length +
    filteredTimesheets.length +
    (periodLocked ? 0 : 4);

  return (
    <div id="overview" className="min-h-screen bg-[#F5F7FA] dark:bg-[#09090B] text-slate-900 dark:text-zinc-100 transition-colors">
      <TopBar
        workspaceMode={workspaceMode}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        clockedIn={clockedIn}
        clockInTime="09:04"
        elapsedLabel={elapsedLabel}
        onToggleClock={() => {
          setClockedIn((prev) => !prev);
          showToast(
            clockedIn
              ? 'Clocked out for today · Hours saved'
              : 'Clocked in at Gulberg Office'
          );
        }}
      />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Contextual Workspace Header & Toolbar Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {workspaceMode === 'admin'
                ? 'Admin operations console'
                : workspaceMode === 'team'
                  ? 'Team operations today'
                  : 'Good afternoon, Ayesha'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 tabular-nums">
              {workspaceMode === 'admin'
                ? `Wednesday, 28 Oct · ${adminSites.length} active sites · ${acknowledgements.length} alerts waiting · October 2026 ${periodLocked ? 'locked' : 'closes in 3 days'}`
                : workspaceMode === 'team'
                  ? `Wednesday, 28 Oct · ${filteredMembers.length} team members · ${filteredRequests.length} requests & ${filteredTeamTasks.filter((t) => t.status === 'overdue').length} overdue tasks`
                  : `Wednesday, 28 Oct · Gulberg Office, Desk 2 · ${doneCount} of ${tasks.length} monthly tasks completed`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {workspaceMode !== 'personal' ? (
              <div
                role="group"
                aria-label="Filter by office"
                className="inline-flex items-center p-1 bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-lg"
              >
                {(
                  [
                    { id: 'all', label: 'All sites' },
                    { id: 'Gulberg', label: 'Gulberg' },
                    { id: 'DHA Phase 6', label: 'DHA Phase 6' },
                  ] as { id: 'all' | OfficeLocation; label: string }[]
                ).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setOfficeFilter(loc.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      officeFilter === loc.id
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            ) : (
              <div
                role="group"
                aria-label="Dashboard timeframe"
                className="inline-flex items-center p-1 bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-lg"
              >
                {(
                  [
                    { id: 'week', label: 'This week' },
                    { id: 'october', label: 'October' },
                    { id: 'quarter', label: 'Q4 trend' },
                  ] as { id: TimeframeKey; label: string }[]
                ).map((tf) => {
                  const isActive = timeframe === tf.id;
                  return (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setTimeframe(tf.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Workspace Mode Switcher */}
            <div
              role="group"
              aria-label="Workspace view"
              className="inline-flex items-center p-1 bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-lg"
            >
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('admin');
                  setActiveSection('overview');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  workspaceMode === 'admin'
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('team');
                  setActiveSection('overview');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  workspaceMode === 'team'
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                Team today
              </button>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceMode('personal');
                  setActiveSection('overview');
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  workspaceMode === 'personal'
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                My workspace
              </button>
            </div>

            {/* White / Black Theme Toggle */}
            <div
              role="group"
              aria-label="Color theme"
              className="inline-flex items-center p-1 bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-lg"
            >
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={theme === 'light'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>White</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Black</span>
              </button>
            </div>
          </div>
        </div>

        {workspaceMode === 'admin' ? (
          <>
            {/* Admin Quick Actions + 4 Attendance/Rule KPI Cards */}
            <AdminKpiRow
              sites={filteredAdminSites}
              members={filteredMembers}
              approvalBadgeCount={adminApprovalCount}
              periodLocked={periodLocked}
              ruleConfig={ruleConfig}
              lateTodayCount={lateTodayCount}
              overtimeHoursToday={overtimeHoursToday}
              onAddSite={() => setAdminModal({ type: 'add_site' })}
              onFixOnBehalf={(memberId) =>
                setAdminModal({ type: 'fix_on_behalf', memberId })
              }
              onClosePeriod={() => setAdminModal({ type: 'close_period' })}
              onChangeRule={() => setAdminModal({ type: 'change_rule' })}
              onExportReport={() =>
                setAdminModal({ type: 'all_reports', initialReportId: 'attendance' })
              }
              onOpenApprovals={() =>
                setTeamModal({ type: 'approvals', tab: 'requests' })
              }
              onOpenLiveBoard={() => setAdminModal({ type: 'live_board' })}
            />

            {/* Middle Grid: Acknowledgements Queue + Site Attendance & Hourly Capacity */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
              <div className="xl:col-span-6 flex flex-col [&>section]:flex-1">
                <AdminAcknowledgementsCard
                  items={acknowledgements}
                  auditLog={auditLog}
                  onAcknowledgeItem={handleAcknowledgeItem}
                  onAcknowledgeAll={handleAcknowledgeAll}
                  onUndoLastAck={handleUndoLastAck}
                  onOpenAuditLog={() => setAdminModal({ type: 'audit_log' })}
                  onTriggerItemAction={(item) => {
                    if (item.actionType === 'fix_behalf') {
                      setAdminModal({
                        type: 'fix_on_behalf',
                        memberId: item.memberId,
                      });
                    } else if (item.actionType === 'close_period') {
                      setAdminModal({ type: 'close_period' });
                    } else if (item.actionType === 'change_rule') {
                      setAdminModal({ type: 'change_rule' });
                    }
                  }}
                />
              </div>

              <div className="xl:col-span-6 flex flex-col gap-4">
                <AdminSiteAttendanceCard
                  sites={filteredAdminSites}
                  activeOfficeFilter={officeFilter}
                  onSelectSiteFilter={(siteName) => {
                    if (siteName === 'Gulberg' || siteName === 'DHA Phase 6') {
                      setOfficeFilter((prev) =>
                        prev === siteName ? 'all' : siteName
                      );
                    }
                  }}
                  onOpenLiveBoard={() => setAdminModal({ type: 'live_board' })}
                />

                <AdminHourlyChartCard
                  hourlyData={INITIAL_HOURLY_ATTENDANCE}
                  gulbergTarget={gulbergSite?.neededToday ?? 5}
                  dhaTarget={dhaSite?.neededToday ?? 4}
                  officeFilter={officeFilter}
                />
              </div>
            </div>

            {/* Bottom Grid: Tasks Due Today + Reports Export */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
              <div className="xl:col-span-6 flex flex-col [&>section]:flex-1">
                <TeamTasksCard
                  tasks={filteredTeamTasks}
                  members={teamMembers}
                  activeFilter={teamTaskFilter}
                  onFilterChange={setTeamTaskFilter}
                  onToggleTaskDone={handleToggleTeamTaskDone}
                  onReassignTask={handleReassignTeamTask}
                  onOpenAssignTask={() => setTeamModal({ type: 'assign_task' })}
                />
              </div>
              <div className="xl:col-span-6 flex flex-col [&>section]:flex-1">
                <AdminReportsCard
                  periodLocked={periodLocked}
                  onDownloadReport={handleDownloadAdminReport}
                  onOpenAllReports={(initialReportId) =>
                    setAdminModal({ type: 'all_reports', initialReportId })
                  }
                />
              </div>
            </div>
          </>
        ) : workspaceMode === 'team' ? (
          <>
            {/* Quick Actions + Interactive Team Today Roster */}
            <TeamPresenceBanner
              members={filteredMembers}
              pendingRequestCount={filteredRequests.length}
              pendingTimesheetCount={filteredTimesheets.length}
              onOpenApprovals={(tab) =>
                setTeamModal({ type: 'approvals', tab })
              }
              onOpenAssignTask={(memberId) =>
                setTeamModal({
                  type: 'assign_task',
                  preselectedMemberId: memberId,
                })
              }
              onOpenMessageTeam={(recipient) =>
                setTeamModal({
                  type: 'message_team',
                  preselectedRecipient: recipient,
                })
              }
              onOpenSchedule={() => setTeamModal({ type: 'team_schedule' })}
              onInspectMember={(memberId) =>
                setTeamModal({ type: 'inspect_member', memberId })
              }
              onQuickReassignAbsent={(memberId) =>
                setTeamModal({ type: 'rebalance', focusMemberId: memberId })
              }
            />

            {/* Row 2: 4 Actionable Team KPI Cards */}
            <TeamKpiRow
              requests={filteredRequests}
              timesheets={filteredTimesheets}
              members={filteredMembers}
              tasks={filteredTeamTasks}
              onOpenApprovals={(tab) =>
                setTeamModal({ type: 'approvals', tab })
              }
              onFilterBehindHours={() => {
                setTeamHoursSort('behind');
                handleNavigate('team-hours');
              }}
              onFilterOverdueTasks={() => {
                setTeamTaskFilter('overdue');
                handleNavigate('team-tasks');
              }}
            />

            {/* Row 3: Team Hours Today + Open Questions */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
              <div className="xl:col-span-7 flex flex-col [&>section]:flex-1">
                <TeamHoursCard
                  members={filteredMembers}
                  sortMode={teamHoursSort}
                  onSortModeChange={setTeamHoursSort}
                  onInspectMember={(memberId) =>
                    setTeamModal({ type: 'inspect_member', memberId })
                  }
                />
              </div>
              <div className="xl:col-span-5 flex flex-col [&>section]:flex-1">
                <OpenQuestionsCard
                  questions={openQuestions}
                  onReplyQuestion={handleReplyQuestion}
                  onNudgeQuestion={handleNudgeQuestion}
                  onOpenMessageTeam={() =>
                    setTeamModal({ type: 'message_team' })
                  }
                />
              </div>
            </div>

            {/* Row 4: Tasks Due Today & Overdue + Workload This Week */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
              <div className="xl:col-span-6 flex flex-col [&>section]:flex-1">
                <TeamTasksCard
                  tasks={filteredTeamTasks}
                  members={teamMembers}
                  activeFilter={teamTaskFilter}
                  onFilterChange={setTeamTaskFilter}
                  onToggleTaskDone={handleToggleTeamTaskDone}
                  onReassignTask={handleReassignTeamTask}
                  onOpenAssignTask={() => setTeamModal({ type: 'assign_task' })}
                />
              </div>
              <div className="xl:col-span-6 flex flex-col [&>section]:flex-1">
                <TeamWorkloadCard
                  members={filteredMembers}
                  onInspectMember={(memberId) =>
                    setTeamModal({ type: 'inspect_member', memberId })
                  }
                  onAssignToMember={(memberId) =>
                    setTeamModal({
                      type: 'assign_task',
                      preselectedMemberId: memberId,
                    })
                  }
                  onOpenRebalance={() => setTeamModal({ type: 'rebalance' })}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Quick Command Action Strip (Personal Workspace) */}
            <section
              aria-label="Quick workspace actions"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
            >
              <button
                type="button"
                onClick={() => setActiveModal('leave')}
                className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                  Request leave
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('wfh')}
                className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                  Work from home
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('task')}
                className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                  Add task
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('plan')}
                className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                  Plan my day
                </span>
              </button>

              <button
                type="button"
                onClick={handleFocusPendingChat}
                className="col-span-2 sm:col-span-1 bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/70 dark:hover:bg-zinc-900 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                    Open chat
                  </span>
                </span>
                {waitingQuestionsCount > 0 && (
                  <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums shrink-0">
                    {waitingQuestionsCount}
                  </span>
                )}
              </button>
            </section>

            {/* Row 2: Interactive KPI Cards */}
            <KpiRow
              timeframe={timeframe}
              attendanceSeries={INITIAL_ATTENDANCE_SERIES}
              totalHoursLogged={totalHoursLogged}
              monthlyTargetHours={208}
              tasksOnTimeRate={tasksOnTimeRate}
              overdueCount={overdueCount}
              chatReplySeries={chatReplySeries}
              waitingQuestionsCount={waitingQuestionsCount}
              onInspectAttendance={() => setActiveModal('attendance')}
              onFilterOverdueTasks={handleFilterOverdueTasks}
              onFocusPendingChat={handleFocusPendingChat}
              onInspectHours={() => handleNavigate('hours')}
            />

            {/* Row 3: Interactive Primary Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
              <HoursChartCard
                weeks={INITIAL_WEEKLY_HOURS}
                timeframe={timeframe}
                onNavigateTimesheet={() => handleNavigate('hours')}
              />
              <TasksAnalyticsCard
                tasks={tasks}
                onTimeTrend={INITIAL_ON_TIME_TREND}
                activeStatusFilter={taskFilter}
                onStatusFilterChange={setTaskFilter}
                onToggleTaskDone={handleToggleTaskDone}
                onOpenAddTask={() => setActiveModal('task')}
                viewMode={taskViewMode}
                onViewModeChange={setTaskViewMode}
              />
            </div>

            {/* Row 4: Lower Workspace Cards */}
            <WorkspaceLowerRow
              schedule={schedule}
              onToggleScheduleItem={handleToggleScheduleItem}
              onOpenPlanDay={() => setActiveModal('plan')}
              threads={threads}
              highlightedChatId={highlightedChatId}
              onMarkThreadRead={handleMarkThreadRead}
              onReplyThread={handleReplyThread}
              quotas={quotas}
              monthlyLeaveTrend={MONTHLY_LEAVE_TREND}
              onOpenRequestLeave={(defaultType) =>
                setActiveModal(defaultType === 'Home days' ? 'wfh' : 'leave')
              }
            />
          </>
        )}
      </main>

      <ActionDrawerModal
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        attendanceSeries={INITIAL_ATTENDANCE_SERIES}
        onSubmitLeave={handleSubmitLeave}
        onSubmitTask={handleAddTask}
        onSubmitSchedule={handleAddSchedule}
      />

      <TeamModals
        modal={teamModal}
        onClose={() => setTeamModal(null)}
        members={teamMembers}
        requests={filteredRequests}
        timesheets={filteredTimesheets}
        tasks={teamTasks}
        schedule={INITIAL_TEAM_SCHEDULE}
        onApproveRequest={handleApproveRequest}
        onDeclineRequest={handleDeclineRequest}
        onApproveAllRequests={handleApproveAllRequests}
        onApproveTimesheet={handleApproveTimesheet}
        onAssignTask={handleAssignTeamTask}
        onSendMessage={(recipient, text) =>
          showToast(`Sent to ${recipient}: "${text.slice(0, 36)}${text.length > 36 ? '…' : ''}"`)
        }
        onToggleTaskDone={handleToggleTeamTaskDone}
        onReassignTask={handleReassignTeamTask}
        onApplyRebalance={handleApplyRebalance}
      />

      <AdminModals
        modal={adminModal}
        onClose={() => setAdminModal(null)}
        sites={adminSites}
        members={teamMembers}
        tasks={teamTasks}
        timesheets={filteredTimesheets}
        auditLog={auditLog}
        periodLocked={periodLocked}
        ruleConfig={ruleConfig}
        officeFilter={officeFilter}
        onAddSite={handleAddSite}
        onFixAttendance={handleFixAttendance}
        onApproveTimesheet={handleApproveTimesheet}
        onTogglePeriodLock={handleTogglePeriodLock}
        onSaveRuleConfig={handleSaveRuleConfig}
        onRestoreAuditItem={handleRestoreAuditItem}
        onDownloadReport={handleDownloadAdminReport}
      />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 dark:border-zinc-300"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
