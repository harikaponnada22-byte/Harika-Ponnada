import React, { useState, useEffect } from 'react';
import { DeskSensor, Student, Period } from '../types';
import { soundAlert } from '../utils/audioAlarm';
import { Bell, BellOff, Volume2, ShieldAlert, CheckCircle2, UserX, AlertTriangle, MessageSquare, Play, Square } from 'lucide-react';

interface DeskSensorMonitorProps {
  deskSensors: DeskSensor[];
  students: Student[];
  activePeriod: Period;
  isMuted: boolean;
  onToggleMute: () => void;
  onUpdateSensorState: (deskId: string, updates: Partial<DeskSensor>) => void;
  onNotifyParent: (student: Student, periodId: number) => void;
  onSelectStudent: (student: Student) => void;
}

export const DeskSensorMonitor: React.FC<DeskSensorMonitorProps> = ({
  deskSensors,
  students,
  activePeriod,
  isMuted,
  onToggleMute,
  onUpdateSensorState,
  onNotifyParent,
  onSelectStudent,
}) => {
  const [alarmTone, setAlarmTone] = useState<'beep' | 'siren'>('beep');
  const [isContinuousPlaying, setIsContinuousPlaying] = useState(false);
  const [thresholdDistance, setThresholdDistance] = useState<number>(80); // cm

  // Count active alarms
  const activeAlarms = deskSensors.filter((d) => d.status === 'vacant_alarm' && !d.silenced);
  const totalOccupied = deskSensors.filter((d) => d.status === 'occupied').length;

  // Handle continuous audio alarm if alarms are active and not muted
  useEffect(() => {
    if (activeAlarms.length > 0 && !isMuted) {
      if (!soundAlert.getAlarmState()) {
        soundAlert.startContinuousAlarm(alarmTone);
        setIsContinuousPlaying(true);
      }
    } else {
      if (soundAlert.getAlarmState()) {
        soundAlert.stopContinuousAlarm();
        setIsContinuousPlaying(false);
      }
    }

    return () => {
      soundAlert.stopContinuousAlarm();
    };
  }, [activeAlarms.length, isMuted, alarmTone]);

  const handleTestTone = () => {
    if (alarmTone === 'beep') {
      soundAlert.playAbsenceBeep();
    } else {
      soundAlert.playBuzzerSiren();
    }
  };

  const handleToggleContinuous = () => {
    if (isContinuousPlaying) {
      soundAlert.stopContinuousAlarm();
      setIsContinuousPlaying(false);
    } else {
      soundAlert.startContinuousAlarm(alarmTone);
      setIsContinuousPlaying(true);
    }
  };

  const handleSilenceAll = () => {
    soundAlert.stopContinuousAlarm();
    setIsContinuousPlaying(false);
    deskSensors.forEach((d) => {
      if (d.status === 'vacant_alarm') {
        onUpdateSensorState(d.deskId, { silenced: true });
      }
    });
  };

  const handleSimulateLeave = (desk: DeskSensor) => {
    // Vacate seat: distance goes high, pressure drops to 0, alarm turns on!
    onUpdateSensorState(desk.deskId, {
      status: 'vacant_alarm',
      distanceCm: 180 + Math.floor(Math.random() * 20),
      pressurePsi: 0.0,
      alarmActive: true,
      silenced: false,
      lastChanged: new Date().toLocaleTimeString(),
    });

    if (!isMuted) {
      soundAlert.playAbsenceBeep();
    }
  };

  const handleSimulateReturn = (desk: DeskSensor) => {
    // Return to seat
    onUpdateSensorState(desk.deskId, {
      status: 'occupied',
      distanceCm: 42 + Math.floor(Math.random() * 8),
      pressurePsi: 13.5 + Math.random() * 2,
      alarmActive: false,
      silenced: false,
      lastChanged: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Sensor Control Center Header */}
      <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Physical IoT Sensor Network
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Room: LH-301 (20 Desks Instrumented)
              </span>
            </div>
            <h2 className="text-xl font-bold mt-0.5">
              Classroom Seat Presence &amp; Absence Sound System
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ultrasonic proximity + seat pad pressure transducers monitor physical presence during <strong className="text-white">{activePeriod.label}</strong>. Absence trips real-time acoustic alerts and notifies parents automatically.
            </p>
          </div>

          {/* Sound Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Tone selector */}
            <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setAlarmTone('beep')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  alarmTone === 'beep' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Piezo Buzzer (880Hz)
              </button>
              <button
                onClick={() => setAlarmTone('siren')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  alarmTone === 'siren' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Security Siren
              </button>
            </div>

            {/* Test Sound Button */}
            <button
              onClick={handleTestTone}
              title="Test Buzzer Audio Output"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test Tone</span>
            </button>

            {/* Silence / Continuous Toggle */}
            <button
              onClick={handleToggleContinuous}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                isContinuousPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isContinuousPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{isContinuousPlaying ? 'Stop Alarm Loop' : 'Play Alarm Loop'}</span>
            </button>

            {/* Mute Master */}
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isMuted
                  ? 'border-slate-700 bg-slate-800 text-slate-400'
                  : 'border-amber-500/50 bg-amber-500/20 text-amber-300'
              }`}
            >
              {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Alarm Alert Bar */}
        {activeAlarms.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>
                <strong>Acoustic Alarm Triggered!</strong> {activeAlarms.length} student desk{activeAlarms.length > 1 ? 's are' : ' is'} vacant during active class ({activePeriod.timeRange}).
                {isMuted && ' (Audio output is currently muted)'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSilenceAll}
                className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
              >
                Silence All Alarms
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sensors Nominal: {totalOccupied} of 20 desks occupied. Acoustic alarms armed for unauthorized seat abandonment.</span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">Proximity Threshold: &lt; {thresholdDistance} cm</span>
          </div>
        )}
      </div>

      {/* Classroom Physical Seating Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {/* Front of Room: Podium / Smartboard */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Teacher Podium &amp; Interactive Smart Board (Front)
          </div>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">
            Room LH-301 · Ultrasonic Proximity Array + Load Cell Matrix
          </span>
        </div>

        {/* 4 Rows x 5 Desks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {deskSensors.map((desk) => {
            const student = students.find((s) => s.id === desk.studentId);
            const isAlarm = desk.status === 'vacant_alarm' && !desk.silenced;
            const isVacant = desk.status.includes('vacant');

            return (
              <div
                key={desk.deskId}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between min-h-[175px] ${
                  isAlarm
                    ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 shadow-sm ring-2 ring-rose-500/20'
                    : isVacant
                    ? 'border-amber-300 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
              >
                {/* Desk Header */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {desk.deskId}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isAlarm
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 font-semibold animate-pulse'
                          : isVacant
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                      }`}
                    >
                      {isAlarm ? 'ALARM VACANT' : isVacant ? 'VACANT' : 'OCCUPIED'}
                    </span>
                  </div>

                  {/* Student Assigned */}
                  {student ? (
                    <button
                      onClick={() => onSelectStudent(student)}
                      className="text-left w-full group"
                    >
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {student.rollNo}
                      </div>
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Unassigned Desk</div>
                  )}

                  {/* Physical Sensor Telemetry */}
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono space-y-0.5 text-slate-500 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Sonar Dist:</span>
                      <strong className={desk.distanceCm > thresholdDistance ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {desk.distanceCm} cm
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Seat Pressure:</span>
                      <strong className={desk.pressurePsi < 2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {desk.pressurePsi.toFixed(1)} PSI
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Desk Interactive Actions */}
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px]">
                  {isAlarm ? (
                    <>
                      <button
                        onClick={() => onUpdateSensorState(desk.deskId, { silenced: true })}
                        className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 font-medium transition-colors"
                        title="Silence sound for this desk"
                      >
                        Silence
                      </button>
                      {student && (
                        <button
                          onClick={() => onNotifyParent(student, activePeriod.id)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors flex items-center gap-1"
                          title="Send instant absent notification to parent"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Alert Parent</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleSimulateReturn(desk)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        title="Simulate student return"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </>
                  ) : isVacant ? (
                    <>
                      <button
                        onClick={() => handleSimulateReturn(desk)}
                        className="w-full py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium text-center transition-colors"
                      >
                        Student Returned
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSimulateLeave(desk)}
                        className="w-full py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 hover:text-rose-700 text-slate-600 dark:text-slate-400 font-medium transition-colors flex items-center justify-center gap-1"
                        title="Simulate student walking away from desk"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Simulate Vacate</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
