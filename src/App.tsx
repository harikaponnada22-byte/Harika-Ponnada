import React, { useState, useEffect } from 'react';
import { ActiveTab, Branch, Student, AttendanceRecord, DeskSensor, ParentNotification, Period } from './types';
import {
  PERIODS,
  INITIAL_STUDENTS,
  TIMETABLE_DATA,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_DESK_SENSORS,
  INITIAL_PARENT_NOTIFICATIONS,
} from './data/mockData';
import { soundAlert } from './utils/audioAlarm';
import { TopNav } from './components/TopNav';
import { AttendanceRegister } from './components/AttendanceRegister';
import { TimetableManager } from './components/TimetableManager';
import { BiometricScanner } from './components/BiometricScanner';
import { DeskSensorMonitor } from './components/DeskSensorMonitor';
import { NotificationCenter } from './components/NotificationCenter';
import { AdminReporting } from './components/AdminReporting';
import { StudentDetailModal } from './components/StudentDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');
  const [selectedBranch, setSelectedBranch] = useState<Branch>('CSE');
  const [activePeriodId, setActivePeriodId] = useState<number>(3); // Period 3 is currently active!
  const [selectedDate] = useState<string>('2026-11-12');

  // Application Data States
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [deskSensors, setDeskSensors] = useState<DeskSensor[]>(INITIAL_DESK_SENSORS);
  const [notifications, setNotifications] = useState<ParentNotification[]>(INITIAL_PARENT_NOTIFICATIONS);

  // Audio & Notification State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Live Simulated Time
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('10:35 AM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute active alarms
  const activeAlarmsCount = deskSensors.filter((d) => d.status === 'vacant_alarm' && !d.silenced).length;
  const unreadAlertsCount = notifications.filter((n) => n.status === 'sent' || n.status === 'delivered').length;

  const handleToggleMute = () => {
    const newMuted = soundAlert.toggleMute();
    setIsMuted(newMuted);
  };

  // Update Period Attendance Status for a Student
  const handleUpdateStatus = (
    studentId: string,
    periodId: number,
    status: 'present' | 'absent' | 'late' | 'excused'
  ) => {
    const verifiedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex((r) => r.studentId === studentId && r.periodId === periodId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          verificationMethod: 'manual',
          verifiedAt,
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `ATT-P${periodId}-${Date.now()}`,
          studentId,
          date: selectedDate,
          periodId,
          status,
          verificationMethod: 'manual',
          verifiedAt,
          parentNotified: false,
        };
        return [...prev, newRecord];
      }
    });

    // If marked absent, update corresponding desk sensor to vacant and check audio alert
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setDeskSensors((prev) =>
        prev.map((d) => {
          if (d.studentId === studentId) {
            const isVacant = status === 'absent';
            return {
              ...d,
              status: isVacant ? 'vacant_alarm' : 'occupied',
              distanceCm: isVacant ? 185 : 45,
              pressurePsi: isVacant ? 0.0 : 14.0,
              alarmActive: isVacant,
              silenced: false,
              lastChanged: verifiedAt,
            };
          }
          return d;
        })
      );

      // Play absence beep if unmuted and marked absent
      if (status === 'absent' && !isMuted) {
        soundAlert.playAbsenceBeep();
      }
    }
  };

  // Record Biometric / Facial Punch
  const handleRecordPunch = (
    studentId: string,
    periodId: number,
    method: 'facial_recognition' | 'biometric_fingerprint',
    confidence: number
  ) => {
    const verifiedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Mark attendance as present
    setAttendanceRecords((prev) => {
      const existingIndex = prev.findIndex((r) => r.studentId === studentId && r.periodId === periodId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'present',
          verificationMethod: method,
          verifiedAt,
          notes: `Confidence: ${confidence}%`,
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `ATT-P${periodId}-${Date.now()}`,
          studentId,
          date: selectedDate,
          periodId,
          status: 'present',
          verificationMethod: method,
          verifiedAt,
          parentNotified: false,
          notes: `Confidence: ${confidence}%`,
        };
        return [...prev, newRecord];
      }
    });

    // Occupy student's desk
    setDeskSensors((prev) =>
      prev.map((d) => {
        if (d.studentId === studentId) {
          return {
            ...d,
            status: 'occupied',
            distanceCm: 45,
            pressurePsi: 14.2,
            alarmActive: false,
            silenced: false,
            lastChanged: verifiedAt,
          };
        }
        return d;
      })
    );
  };

  // Update Desk Sensor State (e.g. Vacated seat or Silenced)
  const handleUpdateSensorState = (deskId: string, updates: Partial<DeskSensor>) => {
    setDeskSensors((prev) =>
      prev.map((d) => (d.deskId === deskId ? { ...d, ...updates } : d))
    );

    // If desk was marked vacant_alarm, mark student absent in current active period
    if (updates.status === 'vacant_alarm') {
      const targetDesk = deskSensors.find((d) => d.deskId === deskId);
      if (targetDesk?.studentId) {
        const verifiedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAttendanceRecords((prev) => {
          const existingIndex = prev.findIndex(
            (r) => r.studentId === targetDesk.studentId && r.periodId === activePeriodId
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              status: 'absent',
              verificationMethod: 'desk_sensor',
              sensorAlertTriggered: true,
              verifiedAt,
            };
            return updated;
          } else {
            return [
              ...prev,
              {
                id: `ATT-P${activePeriodId}-${Date.now()}`,
                studentId: targetDesk.studentId,
                date: selectedDate,
                periodId: activePeriodId,
                status: 'absent',
                verificationMethod: 'desk_sensor',
                sensorAlertTriggered: true,
                verifiedAt,
                parentNotified: false,
              },
            ];
          }
        });
      }
    }
  };

  // Dispatch Parent Missed Class Alert
  const handleNotifyParent = (student: Student, periodId: number) => {
    const period = PERIODS.find((p) => p.id === periodId) || PERIODS[0];
    const message = `Dear ${student.parentName}, your ward ${student.name} (${student.rollNo}) missed ${period.label} (${period.timeRange}). Ultrasonic seat sensor detected absence. Kindly contact academic office.`;

    const newNotification: ParentNotification = {
      id: `NOTIF-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      channel: 'whatsapp',
      periodId,
      subjectName: `${period.label} Lecture`,
      date: selectedDate,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'delivered',
      messageText: message,
    };

    soundAlert.playNotificationPing();
    setNotifications((prev) => [newNotification, ...prev]);

    // Update attendance record parentNotified flag
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.studentId === student.id && r.periodId === periodId
          ? { ...r, parentNotified: true, notificationId: newNotification.id }
          : r
      )
    );
  };

  // Mark all students present for a period
  const handleMarkAllPresent = (periodId: number) => {
    const branchStudents = students.filter((s) => s.branch === selectedBranch);
    const verifiedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords((prev) => {
      const updated = [...prev];
      branchStudents.forEach((student) => {
        const index = updated.findIndex((r) => r.studentId === student.id && r.periodId === periodId);
        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            status: 'present',
            verificationMethod: 'manual',
            verifiedAt,
          };
        } else {
          updated.push({
            id: `ATT-P${periodId}-${student.id}-${Date.now()}`,
            studentId: student.id,
            date: selectedDate,
            periodId,
            status: 'present',
            verificationMethod: 'manual',
            verifiedAt,
            parentNotified: false,
          });
        }
      });
      return updated;
    });

    // Mark desks as occupied
    setDeskSensors((prev) =>
      prev.map((d) => {
        if (branchStudents.some((s) => s.id === d.studentId)) {
          return {
            ...d,
            status: 'occupied',
            distanceCm: 45,
            pressurePsi: 14.1,
            alarmActive: false,
            silenced: false,
            lastChanged: verifiedAt,
          };
        }
        return d;
      })
    );
  };

  // Notify all absentee parents for a period
  const handleNotifyAbsentParents = (periodId: number) => {
    const branchStudents = students.filter((s) => s.branch === selectedBranch);
    const periodRecords = attendanceRecords.filter((r) => r.periodId === periodId);
    const absentees = branchStudents.filter((s) => {
      const rec = periodRecords.find((r) => r.studentId === s.id);
      return rec?.status === 'absent';
    });

    if (absentees.length === 0) return;

    soundAlert.playNotificationPing();
    absentees.forEach((stu) => {
      handleNotifyParent(stu, periodId);
    });
  };

  // Send new custom notification from composer
  const handleSendNewNotification = (notifData: Omit<ParentNotification, 'id' | 'timestamp' | 'status'>) => {
    const newNotif: ParentNotification = {
      ...notifData,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'delivered',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Update attendance record
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.studentId === notifData.studentId && r.periodId === notifData.periodId
          ? { ...r, parentNotified: true, notificationId: newNotif.id }
          : r
      )
    );
  };

  const handleRetryNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'delivered', timestamp: new Date().toLocaleTimeString() } : n))
    );
  };

  const activePeriod = PERIODS.find((p) => p.id === activePeriodId) || PERIODS[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Top Bar Contract compliant Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeAlarmsCount={activeAlarmsCount}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        unreadAlertsCount={unreadAlertsCount}
        currentTimeStr={currentTimeStr}
      />

      {/* Main Viewport Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'attendance' && (
          <AttendanceRegister
            branches={['CSE', 'ECE', 'IT', 'MECH', 'AIDS']}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            periods={PERIODS}
            activePeriodId={activePeriodId}
            onSelectPeriod={setActivePeriodId}
            students={students}
            attendanceRecords={attendanceRecords}
            timetable={TIMETABLE_DATA}
            selectedDate={selectedDate}
            onUpdateStatus={handleUpdateStatus}
            onMarkAllPresent={handleMarkAllPresent}
            onNotifyAbsentParents={handleNotifyAbsentParents}
            onSelectStudent={setSelectedStudentForModal}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableManager
            timetable={TIMETABLE_DATA}
            periods={PERIODS}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            activePeriodId={activePeriodId}
            onNavigateToPeriod={(pId) => {
              setActivePeriodId(pId);
              setActiveTab('attendance');
            }}
          />
        )}

        {activeTab === 'biometric' && (
          <BiometricScanner
            students={students}
            periods={PERIODS}
            activePeriodId={activePeriodId}
            selectedBranch={selectedBranch}
            onRecordPunch={handleRecordPunch}
          />
        )}

        {activeTab === 'sensors' && (
          <DeskSensorMonitor
            deskSensors={deskSensors}
            students={students}
            activePeriod={activePeriod}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onUpdateSensorState={handleUpdateSensorState}
            onNotifyParent={handleNotifyParent}
            onSelectStudent={setSelectedStudentForModal}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            students={students}
            periods={PERIODS}
            onSendNewNotification={handleSendNewNotification}
            onRetryNotification={handleRetryNotification}
          />
        )}

        {activeTab === 'reports' && (
          <AdminReporting
            students={students}
            attendanceRecords={attendanceRecords}
            periods={PERIODS}
            notifications={notifications}
            onSelectStudent={setSelectedStudentForModal}
          />
        )}
      </main>

      {/* Student Profile & Quick Actions Modal */}
      <StudentDetailModal
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
        periods={PERIODS}
        attendanceRecords={attendanceRecords}
        onUpdateStatus={handleUpdateStatus}
        onSendNotification={handleNotifyParent}
      />
    </div>
  );
}
