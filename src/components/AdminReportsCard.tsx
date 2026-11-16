import React from 'react';
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  Lock,
  LockOpen,
} from 'lucide-react';
import { ADMIN_REPORT_SPECS, ReportId } from '../data/adminDashboardData';

interface AdminReportsCardProps {
  periodLocked: boolean;
  onDownloadReport: (reportId: ReportId) => void;
  onOpenAllReports: (initialReportId?: ReportId) => void;
}

export const AdminReportsCard: React.FC<AdminReportsCardProps> = ({
  periodLocked,
  onDownloadReport,
  onOpenAllReports,
}) => {
  const renderIcon = (id: ReportId) => {
    switch (id) {
      case 'attendance':
        return <CheckCircle2 className="w-4 h-4" aria-hidden="true" />;
      case 'hours_overtime':
        return <Clock className="w-4 h-4" aria-hidden="true" />;
      case 'tasks':
        return <CheckSquare className="w-4 h-4" aria-hidden="true" />;
      case 'payroll':
        return periodLocked ? (
          <LockOpen className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Lock className="w-4 h-4" aria-hidden="true" />
        );
    }
  };

  return (
    <section
      id="admin-reports"
      aria-labelledby="admin-reports-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="admin-reports-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Reports
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Download a CSV for this week or inspect the full report
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenAllReports('attendance')}
            className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 whitespace-nowrap shrink-0 cursor-pointer"
          >
            All reports →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADMIN_REPORT_SPECS.map((spec) => {
            const description =
              spec.id === 'payroll'
                ? periodLocked
                  ? 'October 2026 · locked and ready for payroll'
                  : 'October 2026 · draft until the period is locked'
                : spec.description;

            return (
              <div
                key={spec.id}
                className="bg-slate-50/80 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpenAllReports(spec.id)}
                  className="flex items-start gap-3 min-w-0 text-left cursor-pointer group"
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      spec.id === 'payroll' && periodLocked
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-400'
                        : 'bg-white dark:bg-zinc-800 border-slate-200/80 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {renderIcon(spec.id)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {spec.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 leading-snug">
                      {description}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDownloadReport(spec.id)}
                  aria-label={`Download ${spec.title} CSV`}
                  title={`Download ${spec.fileName}`}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
