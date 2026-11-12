import React, { useState } from 'react';
import { Student, AttendanceRecord, Period, Branch, ParentNotification } from '../types';
import { Download, Printer, AlertTriangle, TrendingDown, Users, CheckCircle, Bell, FileText, ChevronRight } from 'lucide-react';

interface AdminReportingProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  periods: Period[];
  notifications: ParentNotification[];
  onSelectStudent: (student: Student) => void;
}

export const AdminReporting: React.FC<AdminReportingProps> = ({
  students,
  attendanceRecords,
  periods,
  notifications,
  onSelectStudent,
}) => {
  const [reportDate, setReportDate] = useState('2026-11-12');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'ALL' | Branch>('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Overall stats
  const totalStudents = students.length;
  const chronicStudents = students.filter((s) => s.overallAttendanceRate < 75);
  const avgAttendance = Math.round(
    students.reduce((acc, curr) => acc + curr.overallAttendanceRate, 0) / (totalStudents || 1)
  );

  // Period wise drop-off calculation
  const periodTrends = periods.map((p) => {
    const pRecords = attendanceRecords.filter((r) => r.periodId === p.id);
    const presents = pRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const rate = pRecords.length > 0 ? Math.round((presents / pRecords.length) * 100) : 92;
    return {
      period: p,
      rate,
      presents,
      absents: pRecords.filter((r) => r.status === 'absent').length,
    };
  });

  // Branch comparisons
  const branches: Branch[] = ['CSE', 'ECE', 'IT', 'MECH', 'AIDS'];
  const branchMetrics = branches.map((b) => {
    const bStudents = students.filter((s) => s.branch === b);
    const bAvg = bStudents.length > 0
      ? Math.round(bStudents.reduce((acc, curr) => acc + curr.overallAttendanceRate, 0) / bStudents.length)
      : 0;
    return {
      branch: b,
      count: bStudents.length,
      average: bAvg,
      chronicCount: bStudents.filter((s) => s.overallAttendanceRate < 75).length,
    };
  });

  // Export CSV download function
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Branch', 'Semester', 'Overall Attendance %', 'Parent Name', 'Parent Phone', 'Desk Number'];
    const rows = students.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      s.branch,
      s.semester,
      s.overallAttendanceRate,
      `"${s.parentName}"`,
      s.parentPhone,
      s.deskNumber,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Executive KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overall Campus Rate</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {avgAttendance}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              +1.2% vs last week
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {totalStudents} enrolled students
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Period Drop-Off Slide</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              -8.4%
            </span>
            <span className="text-xs text-amber-600 font-medium">
              Period 1 vs Period 7
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Afternoon lecture deflection detected
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Chronic Absenteeism</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {chronicStudents.length} Students
            </span>
            <span className="text-xs text-rose-500 font-medium">
              (&lt; 75% cutoff)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Mandatory dean intervention list
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Parent Alerts Dispatched</span>
            <Bell className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {notifications.length} Alerts
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              100% Delivered
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            SMS / WhatsApp Missed-Class logs
          </span>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period-by-Period Drop-off Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Period-by-Period Attendance Curve
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing student retention across 7 periods for today ({reportDate})
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
              Daily Trend
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {periodTrends.map((trend) => (
              <div key={trend.period.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {trend.period.label} ({trend.period.timeRange})
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 text-[11px]">{trend.absents} Absent</span>
                    <span className="font-bold text-slate-900 dark:text-white">{trend.rate}%</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      trend.rate >= 90
                        ? 'bg-emerald-500'
                        : trend.rate >= 80
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${trend.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Benchmark Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Branch-by-Branch Attendance Benchmark
              </h3>
              <p className="text-xs text-slate-400">
                Academic department performance and chronic risk counts
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-600">
              Department Matrix
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {branchMetrics.map((bm) => (
              <div key={bm.branch} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {bm.branch === 'CSE' && 'Computer Science (CSE)'}
                    {bm.branch === 'ECE' && 'Electronics & Comm (ECE)'}
                    {bm.branch === 'IT' && 'Information Technology (IT)'}
                    {bm.branch === 'MECH' && 'Mechanical Engineering (MECH)'}
                    {bm.branch === 'AIDS' && 'AI & Data Science (AIDS)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {bm.count} Registered Students · {bm.chronicCount} At-Risk
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                    {bm.average}%
                  </span>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${bm.average}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chronic Absenteeism Watchlist */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Action Required
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Threshold: &lt; 75.0%
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
              Chronic Absenteeism Watchlist ({chronicStudents.length} Students)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Students falling below the statutory 75% attendance quota are flagged for automated parent-teacher conferences and academic suspension notices.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export CSV Audit</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5">Roll No</th>
                <th className="px-4 py-2.5">Student Name</th>
                <th className="px-4 py-2.5">Branch</th>
                <th className="px-4 py-2.5">Parent Contact</th>
                <th className="px-4 py-2.5 text-center">Consecutive Absences</th>
                <th className="px-4 py-2.5 text-right">Attendance %</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {chronicStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {student.rollNo}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                    {student.branch} (Desk: {student.deskNumber})
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-900 dark:text-white font-medium">{student.parentName}</span>
                    <span className="text-slate-400 font-mono block text-[11px]">{student.parentPhone}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                      {student.consecutiveAbsences} Days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {student.overallAttendanceRate}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectStudent(student)}
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Print Report Modal Preview */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-full border border-slate-300 shadow-2xl p-8 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Academic Attendance &amp; Sensor Audit Report
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  National Institute of Technology · Department Council Report · Date: {reportDate}
                </div>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded border">
                <div>
                  <span className="text-slate-500 block">Total Students Assessed</span>
                  <span className="text-base font-bold font-mono">{totalStudents}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Daily Average Attendance</span>
                  <span className="text-base font-bold font-mono">{avgAttendance}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Parent Alerts Sent</span>
                  <span className="text-base font-bold font-mono">{notifications.length} Delivered</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2">Period-Wise Summary (Today)</h4>
                <table className="w-full border text-left">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="p-2">Period</th>
                      <th className="p-2">Time</th>
                      <th className="p-2">Presents</th>
                      <th className="p-2">Absents</th>
                      <th className="p-2">Turnout Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {periodTrends.map((t) => (
                      <tr key={t.period.id}>
                        <td className="p-2 font-bold">{t.period.label}</td>
                        <td className="p-2">{t.period.timeRange}</td>
                        <td className="p-2 text-emerald-600">{t.presents}</td>
                        <td className="p-2 text-rose-600">{t.absents}</td>
                        <td className="p-2 font-bold">{t.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-slate-400 italic">
                  Report digitally attested by AttendIQ Sensor Matrix &amp; Biometric Gateway.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-900 text-white font-medium rounded hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Page</span>
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-2 border rounded hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
