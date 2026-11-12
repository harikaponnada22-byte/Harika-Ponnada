import React, { useState } from 'react';
import { Branch, Period, Student, AttendanceRecord, TimetableSlot } from '../types';
import { Search, CheckCheck, Send, BellRing, Filter, AlertTriangle, UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttendanceRegisterProps {
  branches: Branch[];
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  periods: Period[];
  activePeriodId: number;
  onSelectPeriod: (periodId: number) => void;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  timetable: TimetableSlot[];
  selectedDate: string;
  onUpdateStatus: (studentId: string, periodId: number, status: 'present' | 'absent' | 'late' | 'excused') => void;
  onMarkAllPresent: (periodId: number) => void;
  onNotifyAbsentParents: (periodId: number) => void;
  onSelectStudent: (student: Student) => void;
}

export const AttendanceRegister: React.FC<AttendanceRegisterProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  periods,
  activePeriodId,
  onSelectPeriod,
  students,
  attendanceRecords,
  timetable,
  selectedDate,
  onUpdateStatus,
  onMarkAllPresent,
  onNotifyAbsentParents,
  onSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'absent' | 'present' | 'late'>('all');

  // Filter students for branch
  const branchStudents = students.filter((s) => s.branch === selectedBranch);

  // Active period slot info
  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];
  const currentSlot = timetable.find(
    (t) => t.branch === selectedBranch && t.periodId === activePeriodId && t.day === 'Monday'
  );

  // Period records for active period
  const periodRecords = attendanceRecords.filter((r) => r.periodId === activePeriodId);

  // Filter by search & status
  const filteredStudents = branchStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.deskNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const record = periodRecords.find((r) => r.studentId === student.id);
    const status = record?.status || 'unmarked';

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && status === statusFilter;
  });

  // Calculate stats for current period
  const totalStudents = branchStudents.length;
  const presentCount = periodRecords.filter((r) => branchStudents.some((s) => s.id === r.studentId) && r.status === 'present').length;
  const absentCount = periodRecords.filter((r) => branchStudents.some((s) => s.id === r.studentId) && r.status === 'absent').length;
  const lateCount = periodRecords.filter((r) => branchStudents.some((s) => s.id === r.studentId) && r.status === 'late').length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Branch & Period Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        {/* Top Controls: Branch tabs + Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => onSelectBranch(branch)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedBranch === branch
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {branch === 'CSE' && 'Computer Science (CSE)'}
                {branch === 'ECE' && 'Electronics (ECE)'}
                {branch === 'IT' && 'Info Tech (IT)'}
                {branch === 'MECH' && 'Mechanical (MECH)'}
                {branch === 'AIDS' && 'AI & Data Science'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Date: <strong>{selectedDate}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Semester 6</span>
          </div>
        </div>

        {/* Periods Tabs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {periods.map((p) => {
            const isSelected = p.id === activePeriodId;
            const pRecs = attendanceRecords.filter((r) => r.periodId === p.id && branchStudents.some((s) => s.id === r.studentId));
            const pAbsents = pRecs.filter((r) => r.status === 'absent').length;

            return (
              <button
                key={p.id}
                onClick={() => onSelectPeriod(p.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                    {p.label}
                  </span>
                  {pAbsents > 0 && (
                    <span className="text-[10px] font-mono px-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {pAbsents} Absent
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {p.timeRange}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Class Details Strip */}
        {currentSlot && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {currentSlot.subjectCode}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentSlot.subjectName}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-600 dark:text-slate-300">
                Faculty: <strong>{currentSlot.faculty}</strong>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-500 font-mono">
                Room: {currentSlot.room} ({currentSlot.type})
              </span>
            </div>

            {/* Attendance Rate Pill */}
            <div className="flex items-center gap-2 font-mono shrink-0">
              <span className="text-slate-500">Period Attendance:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {attendanceRate}%
              </span>
              <span className="text-slate-400 text-[11px]">
                ({presentCount} Present · {absentCount} Absent · {lateCount} Late)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, or desk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All ({branchStudents.length})
            </button>
            <button
              onClick={() => setStatusFilter('absent')}
              className={`px-2 py-1 rounded ${statusFilter === 'absent' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Absent ({absentCount})
            </button>
          </div>
        </div>

        {/* Batch Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onMarkAllPresent(activePeriodId)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All Present</span>
          </button>

          {absentCount > 0 && (
            <button
              onClick={() => onNotifyAbsentParents(activePeriodId)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Notify All Absentee Parents ({absentCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Desk ID</th>
                <th className="px-4 py-3">Status for {activePeriod.label}</th>
                <th className="px-4 py-3">Verification Source</th>
                <th className="px-4 py-3">Parent Notification</th>
                <th className="px-4 py-3 text-right">Term Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No students matching search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const record = periodRecords.find((r) => r.studentId === student.id);
                  const currentStatus = record?.status || 'unmarked';
                  const isChronic = student.overallAttendanceRate < 75;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Roll Number */}
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-white">
                        {student.rollNo}
                      </td>

                      {/* Student Profile */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                            {student.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Parent: {student.parentName}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Desk ID */}
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {student.deskNumber}
                      </td>

                      {/* Period Status Toggle Buttons */}
                      <td className="px-4 py-3">
                        <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                          <button
                            onClick={() => onUpdateStatus(student.id, activePeriod.id, 'present')}
                            className={`px-2.5 py-1 transition-colors ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white font-medium'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => onUpdateStatus(student.id, activePeriod.id, 'absent')}
                            className={`px-2.5 py-1 transition-colors ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white font-medium'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => onUpdateStatus(student.id, activePeriod.id, 'late')}
                            className={`px-2.5 py-1 transition-colors ${
                              currentStatus === 'late'
                                ? 'bg-amber-600 text-white font-medium'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            L
                          </button>
                          <button
                            onClick={() => onUpdateStatus(student.id, activePeriod.id, 'excused')}
                            className={`px-2.5 py-1 transition-colors ${
                              currentStatus === 'excused'
                                ? 'bg-sky-600 text-white font-medium'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            E
                          </button>
                        </div>
                      </td>

                      {/* Verification Source */}
                      <td className="px-4 py-3 text-slate-500">
                        {record ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {record.verificationMethod === 'facial_recognition' && (
                              <span className="text-indigo-600 dark:text-indigo-400">Face Recognition</span>
                            )}
                            {record.verificationMethod === 'biometric_fingerprint' && (
                              <span className="text-emerald-600 dark:text-emerald-400">Fingerprint Kiosk</span>
                            )}
                            {record.verificationMethod === 'desk_sensor' && (
                              <span className="text-amber-600 dark:text-amber-400">Desk IoT Sensor</span>
                            )}
                            {record.verificationMethod === 'manual' && (
                              <span>Manual Register</span>
                            )}
                            {record.verifiedAt && (
                              <span className="font-mono text-slate-400">({record.verifiedAt})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* Parent Notification */}
                      <td className="px-4 py-3">
                        {currentStatus === 'absent' ? (
                          record?.parentNotified ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                            </span>
                          ) : (
                            <button
                              onClick={() => onUpdateStatus(student.id, activePeriod.id, 'absent')}
                              className="px-2 py-0.5 rounded text-[11px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch Alert</span>
                            </button>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Term Attendance Rate */}
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        <div className="flex items-center justify-end gap-1.5">
                          {isChronic && (
                            <span title="Chronic Absenteeism (<75%)">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            </span>
                          )}
                          <span className={`font-semibold ${isChronic ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {student.overallAttendanceRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
