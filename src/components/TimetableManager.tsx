import React, { useState } from 'react';
import { Branch, DayOfWeek, Period, TimetableSlot } from '../types';
import { Calendar, Clock, BookOpen, MapPin, User, ChevronRight, LayoutGrid, List } from 'lucide-react';

interface TimetableManagerProps {
  timetable: TimetableSlot[];
  periods: Period[];
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  activePeriodId: number;
  onNavigateToPeriod: (periodId: number) => void;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  timetable,
  periods,
  selectedBranch,
  onSelectBranch,
  activePeriodId,
  onNavigateToPeriod,
}) => {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Filter slots for branch
  const branchSlots = timetable.filter((s) => s.branch === selectedBranch);

  return (
    <div className="space-y-6">
      {/* Timetable Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                Department Academic Schedule
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Semester 6 · 2026 Academic Term
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Weekly Branch Timetable &amp; Period Syllabus
            </h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Full Week Matrix</span>
            </button>
          </div>
        </div>

        {/* Branch Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['CSE', 'ECE', 'IT', 'MECH', 'AIDS'] as Branch[]).map((branch) => (
            <button
              key={branch}
              onClick={() => onSelectBranch(branch)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedBranch === branch
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {branch === 'CSE' && 'Computer Science (CSE)'}
              {branch === 'ECE' && 'Electronics (ECE)'}
              {branch === 'IT' && 'Information Tech (IT)'}
              {branch === 'MECH' && 'Mechanical (MECH)'}
              {branch === 'AIDS' && 'AI & Data Science (AIDS)'}
            </button>
          ))}
        </div>

        {/* Day Selector Tabs (if Day View) */}
        {viewMode === 'day' && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-200 dark:border-slate-800">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Timetable Content */}
      {viewMode === 'day' ? (
        /* Day Timeline View */
        <div className="space-y-3">
          {periods.map((period) => {
            const slot = branchSlots.find((s) => s.day === selectedDay && s.periodId === period.id);
            const isCurrentPeriod = period.id === activePeriodId;

            return (
              <div
                key={period.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentPeriod
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Period Time block */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center font-mono">
                      <span className="text-[10px] text-slate-500 uppercase">Period</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white leading-none">
                        {period.id}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {period.timeRange}
                        </span>
                        {isCurrentPeriod && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                            ACTIVE NOW
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        50 min duration · Attendance window open
                      </span>
                    </div>
                  </div>

                  {/* Subject Details */}
                  {slot ? (
                    <div className="flex-1 md:px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                          {slot.subjectCode}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {slot.subjectName}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded font-medium ${
                            slot.type === 'Lab'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {slot.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.faculty}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{slot.room}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 md:px-4 text-xs text-slate-400 italic">
                      No lecture scheduled (Free Period / Library Self-Study)
                    </div>
                  )}

                  {/* Action Link */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToPeriod(period.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Take Attendance</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Full Week Matrix View */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 w-28">Day</th>
                {periods.map((p) => (
                  <th key={p.id} className="px-3 py-3 font-mono">
                    <div>{p.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal lowercase">{p.timeRange}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white bg-slate-50/30 dark:bg-slate-800/20">
                    {day}
                  </td>
                  {periods.map((period) => {
                    const slot = branchSlots.find((s) => s.day === day && s.periodId === period.id);
                    return (
                      <td key={period.id} className="px-3 py-2.5 align-top">
                        {slot ? (
                          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] space-y-0.5">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                              {slot.subjectCode}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white block truncate" title={slot.subjectName}>
                              {slot.subjectName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {slot.room}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
