import React from 'react';
import { LogIn, LogOut } from 'lucide-react';

interface TopBarProps {
  workspaceMode: 'admin' | 'team' | 'personal';
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  clockedIn: boolean;
  clockInTime: string;
  elapsedLabel: string;
  onToggleClock: () => void;
}

const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'admin-ack', label: 'Acknowledgements' },
  { id: 'admin-sites', label: 'Sites & Hours' },
  { id: 'team-tasks', label: 'Tasks' },
  { id: 'admin-reports', label: 'Reports' },
];

const PERSONAL_NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'hours', label: 'Timesheet' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'leave', label: 'Leave' },
];

const TEAM_NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'team-presence', label: 'Team today' },
  { id: 'team-hours', label: 'Team hours' },
  { id: 'team-questions', label: 'Questions' },
  { id: 'team-tasks', label: 'Tasks & Load' },
];

export const TopBar: React.FC<TopBarProps> = ({
  workspaceMode,
  activeSection,
  onNavigate,
  clockedIn,
  clockInTime,
  elapsedLabel,
  onToggleClock,
}) => {
  const navItems =
    workspaceMode === 'admin'
      ? ADMIN_NAV_ITEMS
      : workspaceMode === 'team'
        ? TEAM_NAV_ITEMS
        : PERSONAL_NAV_ITEMS;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('overview');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          PulseDesk
        </a>

        <nav aria-label="Workspace sections" className="hidden md:flex items-center gap-6 h-full">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative h-full inline-flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
                  isActive
                    ? 'text-slate-900 dark:text-zinc-100'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-600 dark:bg-blue-500 rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleClock}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
              clockedIn
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 focus-visible:ring-emerald-600'
                : 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-white focus-visible:ring-slate-900 dark:focus-visible:ring-zinc-100'
            }`}
          >
            {clockedIn ? (
              <>
                <LogOut className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                <span>Clock out</span>
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-medium">
                  · {clockInTime} ({elapsedLabel})
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clock in</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
