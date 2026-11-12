import React from 'react';
import { Student, AttendanceRecord, Period } from '../types';
import { X, Phone, Mail, MessageSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  periods: Period[];
  attendanceRecords: AttendanceRecord[];
  onUpdateStatus: (studentId: string, periodId: number, status: 'present' | 'absent' | 'late' | 'excused') => void;
  onSendNotification: (student: Student, periodId: number) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  periods,
  attendanceRecords,
  onUpdateStatus,
  onSendNotification,
}) => {
  if (!student) return null;

  const studentRecords = attendanceRecords.filter((r) => r.studentId === student.id);
  const isChronic = student.overallAttendanceRate < 75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-100 font-semibold text-lg overflow-hidden border border-slate-300 dark:border-slate-600">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {student.name}
                </h3>
                {isChronic && (
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Chronic Risk ({student.overallAttendanceRate}%)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-mono">{student.rollNo}</span>
                <span aria-hidden="true">·</span>
                <span>{student.branch} Sem {student.semester} (Sec {student.section})</span>
                <span aria-hidden="true">·</span>
                <span>Desk: <strong className="text-slate-700 dark:text-slate-300">{student.deskNumber}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Guardian Information Card */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Parent &amp; Emergency Contact
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Guardian Name</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {student.parentName} ({student.parentRelation})
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Phone / WhatsApp</span>
                <div className="flex items-center gap-2 font-mono text-slate-900 dark:text-white">
                  <span>{student.parentPhone}</span>
                  <a
                    href={`https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="Send WhatsApp Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${student.parentPhone}`}
                    className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title="Call Parent"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Email Address</span>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-mono text-xs">
                  <span>{student.parentEmail}</span>
                  <a
                    href={`mailto:${student.parentEmail}`}
                    className="p-1 rounded text-slate-500 hover:text-slate-900"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Biometric Credentials</span>
                <div className="flex items-center gap-3 text-xs mt-0.5">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3 h-3" /> Face Enrolled
                  </span>
                  <span className={`flex items-center gap-1 ${student.biometricEnrolled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {student.biometricEnrolled ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {student.biometricEnrolled ? 'Fingerprint Active' : 'Fingerprint Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Period-wise Attendance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Today's Period-Wise Attendance
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                Date: 2026-11-12
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              {periods.map((period) => {
                const record = studentRecords.find((r) => r.periodId === period.id);
                const currentStatus = record?.status || 'unmarked';

                return (
                  <div
                    key={period.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {period.label}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          ({period.timeRange})
                        </span>
                        {record?.sensorAlertTriggered && (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Desk Vacant
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {record ? (
                          <span>
                            Verified via <strong className="capitalize">{record.verificationMethod.replace('_', ' ')}</strong>
                            {record.verifiedAt ? ` at ${record.verifiedAt}` : ''}
                            {record.notes ? ` · Note: ${record.notes}` : ''}
                          </span>
                        ) : (
                          <span className="italic">Class not yet marked</span>
                        )}
                      </div>
                    </div>

                    {/* Status Toggle & Parent Alert */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs">
                        <button
                          onClick={() => onUpdateStatus(student.id, period.id, 'present')}
                          className={`px-2.5 py-1 transition-colors ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onUpdateStatus(student.id, period.id, 'absent')}
                          className={`px-2.5 py-1 transition-colors ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => onUpdateStatus(student.id, period.id, 'late')}
                          className={`px-2.5 py-1 transition-colors ${
                            currentStatus === 'late'
                              ? 'bg-amber-600 text-white font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => onUpdateStatus(student.id, period.id, 'excused')}
                          className={`px-2.5 py-1 transition-colors ${
                            currentStatus === 'excused'
                              ? 'bg-sky-600 text-white font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Excused
                        </button>
                      </div>

                      {/* Parent Alert button */}
                      {currentStatus === 'absent' && (
                        <button
                          onClick={() => onSendNotification(student, period.id)}
                          className={`px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1 ${
                            record?.parentNotified
                              ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{record?.parentNotified ? 'Notified' : 'Notify Parent'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 font-mono">
            Overall Academic Standing: {student.overallAttendanceRate}%
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
