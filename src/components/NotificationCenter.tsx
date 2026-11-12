import React, { useState } from 'react';
import { ParentNotification, Student, Period } from '../types';
import { soundAlert } from '../utils/audioAlarm';
import { Send, MessageSquare, Phone, Mail, CheckCheck, Clock, RefreshCw, AlertCircle, Plus, Filter } from 'lucide-react';

interface NotificationCenterProps {
  notifications: ParentNotification[];
  students: Student[];
  periods: Period[];
  onSendNewNotification: (notification: Omit<ParentNotification, 'id' | 'timestamp' | 'status'>) => void;
  onRetryNotification: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  students,
  periods,
  onSendNewNotification,
  onRetryNotification,
}) => {
  const [channelFilter, setChannelFilter] = useState<'all' | 'sms' | 'whatsapp' | 'email'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'acknowledged' | 'sent'>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Form state for new notification
  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || '');
  const [targetPeriodId, setTargetPeriodId] = useState<number>(3);
  const [targetChannel, setTargetChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [customNote, setCustomNote] = useState('');

  const targetStudent = students.find((s) => s.id === targetStudentId) || students[0];
  const targetPeriod = periods.find((p) => p.id === targetPeriodId) || periods[0];

  const filteredNotifications = notifications.filter((n) => {
    const matchesChannel = channelFilter === 'all' || n.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesChannel && matchesStatus;
  });

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudent) return;

    const message = targetChannel === 'whatsapp'
      ? `Dear Mr./Mrs. ${targetStudent.parentName}, your ward ${targetStudent.name} (Roll: ${targetStudent.rollNo}) was marked ABSENT for ${targetPeriod.label} (${targetPeriod.timeRange}). Desk IoT sensor registered vacancy. ${customNote ? `Note: ${customNote}` : 'Kindly contact the department office if this absence was unexcused.'}`
      : `ATTENDANCE ALERT: ${targetStudent.name} (${targetStudent.rollNo}) absent for ${targetPeriod.label} (${targetPeriod.timeRange}). Sensor triggered. ${customNote}`;

    soundAlert.playNotificationPing();

    onSendNewNotification({
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      rollNo: targetStudent.rollNo,
      parentName: targetStudent.parentName,
      parentPhone: targetStudent.parentPhone,
      parentEmail: targetStudent.parentEmail,
      channel: targetChannel,
      periodId: targetPeriod.id,
      subjectName: `${targetPeriod.label} Class`,
      date: '2026-11-12',
      messageText: message,
    });

    setIsComposeOpen(false);
    setCustomNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                Automated Missed-Class Dispatch
              </span>
              <span className="text-xs text-slate-400 font-mono">
                SMS Gateway &amp; WhatsApp Business API
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Parent Notification Center
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated parent alerts trigger instantaneously when a student is marked absent or desk sensors detect unauthorized vacancy.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Missed Class Alert</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block">Total Alerts Dispatched</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
              {notifications.length}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block">Delivery Success Rate</span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              100%
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block">Parent Responses</span>
            <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {notifications.filter((n) => n.parentResponse).length} Acknowledged
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 block">Avg Dispatch Latency</span>
            <span className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5 block">
              1.4 seconds
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel Filter */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${channelFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All Channels
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`px-2.5 py-1 rounded transition-colors ${channelFilter === 'whatsapp' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setChannelFilter('sms')}
              className={`px-2.5 py-1 rounded transition-colors ${channelFilter === 'sms' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              SMS
            </button>
            <button
              onClick={() => setChannelFilter('email')}
              className={`px-2.5 py-1 rounded transition-colors ${channelFilter === 'email' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Email
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('acknowledged')}
              className={`px-2.5 py-1 rounded transition-colors ${statusFilter === 'acknowledged' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Replies
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredNotifications.length} of {notifications.length} alerts
        </span>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
            No notification logs found matching filter.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:border-slate-300"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  {/* Meta Strip */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        notif.channel === 'whatsapp'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : notif.channel === 'sms'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {notif.channel}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {notif.studentName}
                    </span>
                    <span className="text-slate-400 font-mono">({notif.rollNo})</span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      Parent: <strong>{notif.parentName}</strong> ({notif.parentPhone})
                    </span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500 text-[11px]">{notif.timestamp}</span>
                  </div>

                  {/* Message Bubble Content */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                    {notif.messageText}
                  </div>

                  {/* Parent Response (if any) */}
                  {notif.parentResponse && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold text-[11px]">
                        <MessageSquare className="w-3 h-3" />
                        <span>Parent Acknowledged / Reply Received:</span>
                      </div>
                      <p className="italic text-slate-700 dark:text-slate-300">
                        "{notif.parentResponse}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Status Actions */}
                <div className="flex items-center gap-2 shrink-0 md:pt-1">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Delivered</span>
                  </span>
                  <button
                    onClick={() => {
                      soundAlert.playNotificationPing();
                      onRetryNotification(notif.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Resend Notification"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Notification Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Dispatch Parent Missed-Class Alert
              </h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatch} className="p-6 space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Absent Student
                </label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rollNo} - {s.name} ({s.branch}) · Parent: {s.parentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Period */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Missed Period
                </label>
                <select
                  value={targetPeriodId}
                  onChange={(e) => setTargetPeriodId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.timeRange})
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Channel */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dispatch Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetChannel('whatsapp')}
                    className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                      targetChannel === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    WhatsApp API
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetChannel('sms')}
                    className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                      targetChannel === 'sms'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    SMS Gateway
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetChannel('email')}
                    className={`py-2 rounded-lg border text-center font-medium transition-colors ${
                      targetChannel === 'email'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Email Notice
                  </button>
                </div>
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Additional Note / Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Desk sensor vacant for entire 50-minute lecture."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Message Live Preview */}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                <span className="text-slate-500 uppercase tracking-wider block font-semibold">
                  Live Dispatch Preview ({targetChannel.toUpperCase()})
                </span>
                <p className="text-slate-800 dark:text-slate-200">
                  {targetStudent ? (
                    `Dear Mr./Mrs. ${targetStudent.parentName}, your ward ${targetStudent.name} (Roll: ${targetStudent.rollNo}) was marked ABSENT for ${targetPeriod.label} (${targetPeriod.timeRange}). Desk IoT sensor registered vacancy. ${customNote || 'Kindly contact the department office.'}`
                  ) : ''}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Recipient: {targetStudent?.parentPhone}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
