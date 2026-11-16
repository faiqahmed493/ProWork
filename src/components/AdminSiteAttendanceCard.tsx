import React from 'react';
import { AdminSiteMetric } from '../data/adminDashboardData';
import { OfficeLocation } from '../data/teamDashboardData';

interface AdminSiteAttendanceCardProps {
  sites: AdminSiteMetric[];
  activeOfficeFilter: 'all' | OfficeLocation;
  onSelectSiteFilter: (siteName: string) => void;
  onOpenLiveBoard: () => void;
}

export const AdminSiteAttendanceCard: React.FC<AdminSiteAttendanceCardProps> = ({
  sites,
  activeOfficeFilter,
  onSelectSiteFilter,
  onOpenLiveBoard,
}) => {
  const totalPeople = sites.reduce((sum, s) => sum + s.totalDue, 0);

  return (
    <section
      id="admin-sites"
      aria-labelledby="admin-sites-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="admin-sites-heading"
            className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
          >
            Attendance by site
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            Updated 16:14 · {totalPeople} people · vertical tick marks minimum
            staff needed
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenLiveBoard}
          className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Live board →
        </button>
      </div>

      {/* Site Rows */}
      <div className="mt-5 divide-y divide-slate-100 dark:divide-zinc-800">
        {sites.map((site) => {
          const totalIn = site.workingInOffice + site.workingFromHome;
          const totalCapacity = Math.max(1, site.totalDue);
          const officeWidth = (site.workingInOffice / totalCapacity) * 100;
          const wfhWidth = (site.workingFromHome / totalCapacity) * 100;
          const absentWidth = (site.absentCount / totalCapacity) * 100;
          const targetPct = Math.min(
            99,
            (site.neededToday / totalCapacity) * 100
          );
          const deltaVsNeeded = totalIn - site.neededToday;
          const isSelected = activeOfficeFilter === site.name;

          return (
            <div key={site.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => onSelectSiteFilter(site.name)}
                  className="inline-flex items-center gap-2 text-left group cursor-pointer"
                  title="Click to filter dashboard by this site"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-sm shrink-0 ${site.dotClass}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  >
                    {site.name}
                  </span>
                  {isSelected && (
                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      (Filtered)
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                  <span>
                    <strong className="font-semibold text-slate-800 dark:text-zinc-200">
                      {totalIn}
                    </strong>{' '}
                    of {site.totalDue} due are in · {site.neededToday} needed
                    today
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-medium ${
                      deltaVsNeeded > 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : deltaVsNeeded === 0
                          ? 'text-slate-700 dark:text-zinc-300'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {deltaVsNeeded > 0
                      ? `+${deltaVsNeeded} buffer`
                      : deltaVsNeeded === 0
                        ? 'At target'
                        : `${deltaVsNeeded} short`}
                  </span>
                </div>
              </div>

              {/* Coverage Bar with Target Staffing Tick */}
              <div className="relative h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-md overflow-visible flex">
                <div className="w-full h-full rounded-md overflow-hidden flex gap-0.5">
                  {site.workingInOffice > 0 && (
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${officeWidth}%` }}
                      title={`${site.workingInOffice} Working on-site`}
                    />
                  )}
                  {site.workingFromHome > 0 && (
                    <div
                      className="h-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${wfhWidth}%` }}
                      title={`${site.workingFromHome} From home`}
                    />
                  )}
                  {site.absentCount > 0 && (
                    <div
                      className="h-full bg-rose-400 dark:bg-rose-500/80 transition-all duration-300"
                      style={{ width: `${absentWidth}%` }}
                      title={`${site.absentCount} Absent`}
                    />
                  )}
                </div>

                {/* Minimum needed marker */}
                <span
                  aria-hidden="true"
                  title={`Minimum ${site.neededToday} staff needed today`}
                  style={{ left: `${targetPct}%` }}
                  className="absolute -top-1 -bottom-1 w-[2px] bg-slate-900 dark:bg-zinc-100 rounded-full z-10 pointer-events-none"
                />
              </div>

              {/* Legend Breakdown */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 dark:text-zinc-400 tabular-nums">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs bg-emerald-600"
                    aria-hidden="true"
                  />
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {site.workingInOffice}
                  </strong>{' '}
                  Working
                </span>

                {site.workingFromHome > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs bg-violet-600"
                      aria-hidden="true"
                    />
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {site.workingFromHome}
                    </strong>{' '}
                    From home
                  </span>
                )}

                {site.absentCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-xs bg-rose-400 dark:bg-rose-500"
                      aria-hidden="true"
                    />
                    <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                      {site.absentCount}
                    </strong>{' '}
                    Absent
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
