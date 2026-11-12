export type Branch = 'CSE' | 'ECE' | 'IT' | 'MECH' | 'AIDS';

export type Semester = 4 | 6;

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type VerificationMethod = 'manual' | 'facial_recognition' | 'biometric_fingerprint' | 'desk_sensor';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  branch: Branch;
  semester: Semester;
  section: string;
  email: string;
  avatar: string;
  deskNumber: string;
  parentName: string;
  parentRelation: 'Father' | 'Mother' | 'Guardian';
  parentPhone: string;
  parentEmail: string;
  facialEnrolled: boolean;
  biometricEnrolled: boolean;
  overallAttendanceRate: number; // e.g. 88.5%
  consecutiveAbsences: number;
}

export interface Period {
  id: number;
  label: string;
  timeRange: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isLunchBreakAfter?: boolean;
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  periodId: number;
  branch: Branch;
  semester: Semester;
  subjectCode: string;
  subjectName: string;
  faculty: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  periodId: number;
  status: AttendanceStatus;
  verificationMethod: VerificationMethod;
  verifiedAt: string;
  parentNotified: boolean;
  notificationId?: string;
  sensorAlertTriggered?: boolean;
  notes?: string;
}

export interface DeskSensor {
  deskId: string;
  studentId: string;
  seatRow: number;
  seatCol: number;
  status: 'occupied' | 'vacant_normal' | 'vacant_alarm' | 'sensor_offline';
  distanceCm: number;       // ultrasonic readout (e.g. 45cm = seated, 160cm = empty desk)
  pressurePsi: number;      // pressure sensor under seat pad
  alarmActive: boolean;     // triggers sound when student is absent during class
  silenced: boolean;
  lastChanged: string;
}

export type NotificationChannel = 'sms' | 'whatsapp' | 'email';

export interface ParentNotification {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  channel: NotificationChannel;
  periodId: number;
  subjectName: string;
  date: string;
  timestamp: string;
  status: 'queued' | 'sent' | 'delivered' | 'acknowledged' | 'failed';
  messageText: string;
  parentResponse?: string;
}

export interface BiometricLog {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  branch: Branch;
  method: 'facial_recognition' | 'biometric_fingerprint';
  periodId: number;
  timestamp: string;
  confidenceScore: number; // e.g. 98.4%
  deviceLocation: string;  // e.g. "Room 302 Entrance Kiosk"
  status: 'verified' | 'rejected' | 'spoof_flagged';
}

export type ActiveTab = 'attendance' | 'timetable' | 'biometric' | 'sensors' | 'notifications' | 'reports';
