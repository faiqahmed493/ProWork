import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AttendancePoint, TaskStatus } from '../data/dashboardData';

export type ActiveModalType =
  | null
  | 'leave'
  | 'wfh'
  | 'task'
  | 'plan'
  | 'attendance';

interface ActionDrawerModalProps {
  modalType: ActiveModalType;
  onClose: () => void;
  attendanceSeries: AttendancePoint[];
  onSubmitLeave: (quotaId: string, days: number, note: string) => void;
  onSubmitTask: (title: string, project: string, dueDate: string, status: TaskStatus) => void;
  onSubmitSchedule: (time: string, title: string, duration: string, category: 'Meeting' | 'Focus' | 'Break') => void;
}

export const ActionDrawerModal: React.FC<ActionDrawerModalProps> = ({
  modalType,
  onClose,
  attendanceSeries,
  onSubmitLeave,
  onSubmitTask,
  onSubmitSchedule,
}) => {
  const [leaveType, setLeaveType] = useState('annual');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveNote, setLeaveNote] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState('Release 2.4');
  const [taskDue, setTaskDue] = useState('30 Oct');

  const [schedTime, setSchedTime] = useState('17:00');
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDuration, setSchedDuration] = useState('30m');
  const [schedCategory, setSchedCategory] = useState<'Meeting' | 'Focus' | 'Break'>('Focus');

  useEffect(() => {
    if (!modalType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalType, onClose]);

  if (!modalType) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/70 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100">
            {modalType === 'leave' && 'Request leave'}
            {modalType === 'wfh' && 'Schedule work from home'}
            {modalType === 'task' && 'Add new task'}
            {modalType === 'plan' && 'Add block to today'}
            {modalType === 'attendance' && 'October attendance log'}
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

        <div className="p-5">
          {(modalType === 'leave' || modalType === 'wfh') && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitLeave(
                  modalType === 'wfh' ? 'wfh' : leaveType,
                  leaveDays,
                  leaveNote || 'Submitted from workspace'
                );
                onClose();
              }}
              className="space-y-4"
            >
              {modalType === 'leave' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Leave category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="annual">Annual leave (8 left)</option>
                    <option value="sick">Sick leave (5 left)</option>
                    <option value="casual">Casual leave (2 left)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Number of days
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Note for team
                </label>
                <input
                  type="text"
                  value={leaveNote}
                  onChange={(e) => setLeaveNote(e.target.value)}
                  placeholder={
                    modalType === 'wfh'
                      ? 'e.g., Working remotely on Release 2.4 QA'
                      : 'Optional handover note'
                  }
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
                  {modalType === 'wfh' ? 'Book WFH day' : 'Submit request'}
                </button>
              </div>
            </form>
          )}

          {modalType === 'task' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                onSubmitTask(taskTitle.trim(), taskProject, taskDue, 'todo');
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
                  placeholder="e.g., Review landing page hero variants"
                  autoFocus
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Due date
                  </label>
                  <input
                    type="text"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  Add task
                </button>
              </div>
            </form>
          )}

          {modalType === 'plan' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!schedTitle.trim()) return;
                onSubmitSchedule(
                  schedTime,
                  schedTitle.trim(),
                  schedDuration,
                  schedCategory
                );
                onClose();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Block title
                </label>
                <input
                  type="text"
                  required
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  placeholder="e.g., Handover notes & desk wrap-up"
                  autoFocus
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Type
                  </label>
                  <select
                    value={schedCategory}
                    onChange={(e) =>
                      setSchedCategory(
                        e.target.value as 'Meeting' | 'Focus' | 'Break'
                      )
                    }
                    className="w-full text-sm px-2 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Focus">Focus</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Break">Break</option>
                  </select>
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
                  Save block
                </button>
              </div>
            </form>
          )}

          {modalType === 'attendance' && (
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
                10-minute grace period applies after 09:00 at Gulberg office.
              </p>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {attendanceSeries
                  .slice()
                  .reverse()
                  .map((pt) => (
                    <div
                      key={pt.date}
                      className="py-2 flex items-center justify-between tabular-nums"
                    >
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        {pt.date}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-zinc-400">
                        In {pt.checkIn}
                      </span>
                      <span
                        className={`font-medium ${
                          pt.status === 'late'
                            ? 'text-red-600 dark:text-red-400'
                            : pt.status === 'wfh'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {pt.status === 'late'
                          ? `Late (+${pt.minutesDelta}m)`
                          : pt.status === 'wfh'
                            ? 'WFH · On time'
                            : 'On time'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
