import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Check,
  Plus,
  Search,
} from 'lucide-react';
import {
  TeamMember,
  TeamTaskItem,
  TeamTaskStatus,
} from '../data/teamDashboardData';

export type TaskFilterTab = 'all' | 'absent_owner' | TeamTaskStatus;

interface TeamTasksCardProps {
  tasks: TeamTaskItem[];
  members: TeamMember[];
  activeFilter: TaskFilterTab;
  onFilterChange: (filter: TaskFilterTab) => void;
  onToggleTaskDone: (taskId: string) => void;
  onReassignTask: (taskId: string, newMemberId: string) => void;
  onOpenAssignTask: () => void;
}

export const TeamTasksCard: React.FC<TeamTasksCardProps> = ({
  tasks,
  members,
  activeFilter,
  onFilterChange,
  onToggleTaskDone,
  onReassignTask,
  onOpenAssignTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const overdueCount = tasks.filter((t) => t.status === 'overdue').length;
  const dueTodayCount = tasks.filter((t) => t.status === 'due_today').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const isTaskAssignedToAbsent = (task: TeamTaskItem) =>
    task.status !== 'done' &&
    task.assigneeIds.some(
      (id) => members.find((m) => m.id === id)?.presence === 'absent'
    );

  const absentOwnerCount = tasks.filter(isTaskAssignedToAbsent).length;

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      activeFilter === 'all'
        ? true
        : activeFilter === 'absent_owner'
          ? isTaskAssignedToAbsent(t)
          : t.status === activeFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.assigneeLabel.toLowerCase().includes(q) ||
      t.project.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const visibleLimit = 6;
  const displayedTasks =
    showAll || searchQuery.trim() || activeFilter !== 'all'
      ? filteredTasks
      : filteredTasks.slice(0, visibleLimit);
  const hiddenCount = Math.max(0, filteredTasks.length - displayedTasks.length);

  const membersByCapacity = [...members]
    .filter((m) => m.presence !== 'absent')
    .sort(
      (a, b) =>
        b.workTimeLeft - b.workloadHours - (a.workTimeLeft - a.workloadHours)
    );

  return (
    <section
      id="team-tasks"
      aria-labelledby="team-tasks-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="team-tasks-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Tasks due today
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {dueTodayCount} left today · {overdueCount} overdue
              {absentOwnerCount > 0
                ? ` · ${absentOwnerCount} owned by absent staff`
                : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAssignTask}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Assign</span>
          </button>
        </div>

        {/* Filter Tabs + Search Row */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div
            role="group"
            aria-label="Filter team tasks"
            className="inline-flex flex-wrap items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800 self-start"
          >
            {(
              [
                { id: 'all', label: `All (${tasks.length})` },
                { id: 'overdue', label: `Overdue (${overdueCount})` },
                { id: 'due_today', label: `Today (${dueTodayCount})` },
                ...(absentOwnerCount > 0
                  ? [
                      {
                        id: 'absent_owner' as TaskFilterTab,
                        label: `Absent (${absentOwnerCount})`,
                      },
                    ]
                  : []),
                { id: 'done', label: `Done (${doneCount})` },
              ] as { id: TaskFilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-44">
            <Search
              className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search team tasks"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Task List */}
        <ul className="mt-2 divide-y divide-slate-100 dark:divide-zinc-800">
          {displayedTasks.length === 0 ? (
            <li className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
              No matching tasks found.
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-1.5 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </li>
          ) : (
            displayedTasks.map((task) => {
              const isDone = task.status === 'done';
              const isOverdue = task.status === 'overdue';
              const isReassigning = reassigningId === task.id;
              const isAssignedToAbsent = isTaskAssignedToAbsent(task);

              return (
                <li key={task.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTaskDone(task.id)}
                        aria-label={`Mark "${task.title}" as ${
                          isDone ? 'not done' : 'done'
                        }`}
                        className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-zinc-600 hover:border-blue-600 dark:hover:border-blue-500'
                        }`}
                      >
                        {isDone && (
                          <Check className="w-3 h-3" aria-hidden="true" />
                        )}
                      </button>

                      <span
                        className={`w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center shrink-0 ${task.avatarBg}`}
                      >
                        {task.assigneeInitials}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-zinc-500'
                              : 'text-slate-900 dark:text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                          <span>{task.assigneeLabel}</span>
                          {isAssignedToAbsent && (
                            <span className="text-rose-600 dark:text-rose-400 font-medium">
                              {' '}
                              (Absent)
                            </span>
                          )}
                          <span aria-hidden="true"> · </span>
                          <span
                            className={
                              isOverdue
                                ? 'text-red-600 dark:text-red-400 font-medium'
                                : ''
                            }
                          >
                            {task.dueLabel}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{task.project}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono">
                            {task.estimateHours}h
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status + Quick Reassign */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          isDone
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {isDone
                          ? 'Done'
                          : isOverdue
                            ? 'Overdue'
                            : 'Due today'}
                      </span>

                      {!isDone && (
                        <button
                          type="button"
                          onClick={() =>
                            setReassigningId(isReassigning ? null : task.id)
                          }
                          aria-label={`Reassign "${task.title}"`}
                          title="Reassign task"
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                            isReassigning
                              ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-slate-900 dark:border-zinc-100'
                              : isAssignedToAbsent
                                ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                                : 'text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" aria-hidden="true" />
                          {isAssignedToAbsent && (
                            <span className="hidden sm:inline">Cover</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isReassigning && (
                    <div className="mt-2 ml-7 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-600 dark:text-zinc-300 font-medium">
                        Reassign to:
                      </span>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          onReassignTask(task.id, e.target.value);
                          setReassigningId(null);
                        }}
                        aria-label="Choose new assignee"
                        className="text-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="" disabled>
                          Select member (most spare time first)...
                        </option>
                        {membersByCapacity.map((m) => {
                          const free = m.workTimeLeft - m.workloadHours;
                          return (
                            <option key={m.id} value={m.id}>
                              {m.name} ·{' '}
                              {free >= 0
                                ? `${free.toFixed(1)}h free`
                                : `${Math.abs(free).toFixed(1)}h over capacity`}{' '}
                              ({m.office})
                            </option>
                          );
                        })}
                      </select>
                      <button
                        type="button"
                        onClick={() => setReassigningId(null)}
                        className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer ml-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Expand / Collapse Footer */}
      {filteredTasks.length > visibleLimit &&
        activeFilter === 'all' &&
        !searchQuery.trim() && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
              Showing {displayedTasks.length} of {filteredTasks.length} tasks
            </span>
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
            >
              {showAll
                ? 'Show fewer'
                : `Show ${hiddenCount} more tasks →`}
            </button>
          </div>
        )}
    </section>
  );
};
