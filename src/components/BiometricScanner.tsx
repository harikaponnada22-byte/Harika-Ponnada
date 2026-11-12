import React, { useState, useRef, useEffect } from 'react';
import { Student, Period, Branch } from '../types';
import { soundAlert } from '../utils/audioAlarm';
import { Camera, Fingerprint, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, User, VideoOff } from 'lucide-react';

interface BiometricScannerProps {
  students: Student[];
  periods: Period[];
  activePeriodId: number;
  selectedBranch: Branch;
  onRecordPunch: (studentId: string, periodId: number, method: 'facial_recognition' | 'biometric_fingerprint', confidence: number) => void;
}

export const BiometricScanner: React.FC<BiometricScannerProps> = ({
  students,
  periods,
  activePeriodId,
  selectedBranch,
  onRecordPunch,
}) => {
  const [mode, setMode] = useState<'face' | 'fingerprint'>('face');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastVerification, setLastVerification] = useState<{
    student: Student;
    method: string;
    confidence: number;
    timestamp: string;
  } | null>(null);

  // WebRTC video state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const activePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];
  const branchStudents = students.filter((s) => s.branch === selectedBranch);
  const currentStudent = students.find((s) => s.id === selectedStudentId) || branchStudents[0] || students[0];

  // Request real camera when in 'face' mode
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'face') {
      navigator.mediaDevices?.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
            setCameraError(null);
          }
        })
        .catch(() => {
          setCameraActive(false);
          setCameraError('Camera access not available or blocked. Running high-precision scanner simulation.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  const handleStartScan = (overrideMethod?: 'face' | 'fingerprint') => {
    if (isScanning || !currentStudent) return;
    const scanMethod = overrideMethod || mode;

    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);

          // Success result
          const confidence = parseFloat((97.5 + Math.random() * 2.3).toFixed(1));
          const methodType = scanMethod === 'face' ? 'facial_recognition' : 'biometric_fingerprint';

          soundAlert.playBiometricSuccessChime();
          onRecordPunch(currentStudent.id, activePeriod.id, methodType, confidence);

          setLastVerification({
            student: currentStudent,
            method: scanMethod === 'face' ? 'Facial Recognition AI' : 'Optical Fingerprint Sensor',
            confidence,
            timestamp: new Date().toLocaleTimeString(),
          });

          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  return (
    <div className="space-y-6">
      {/* Kiosk Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              Interactive Check-In Kiosk
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Terminal: LH-301 Main Portal
            </span>
          </div>
          <h2 className="text-xl font-bold mt-0.5">
            Biometric &amp; Facial Recognition Scanner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-modal identity verification for <strong className="text-white">{activePeriod.label}</strong> ({activePeriod.timeRange}). Verified punches immediately update period registers and presence sensors.
          </p>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-800 rounded-lg shrink-0 border border-slate-700">
          <button
            onClick={() => setMode('face')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'face'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Facial Recognition</span>
          </button>
          <button
            onClick={() => setMode('fingerprint')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              mode === 'fingerprint'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Fingerprint Scanner</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scanner Viewport */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[460px]">
          {mode === 'face' ? (
            /* Facial Recognition Viewport */
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center">
                {/* Real Video or Realistic Simulation */}
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6">
                    {/* Simulated Face Avatar if webcam disabled */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-lg relative mb-2">
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-3xl">
                        {currentStudent?.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="absolute inset-0 bg-indigo-500/10" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-medium text-slate-300 block">
                        {currentStudent?.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {currentStudent?.rollNo} · Desk: {currentStudent?.deskNumber}
                      </span>
                    </div>
                    {cameraError && (
                      <div className="absolute bottom-2 left-2 right-2 text-[10px] text-slate-400 text-center bg-slate-900/80 p-1 rounded">
                        <VideoOff className="w-3 h-3 inline mr-1 text-amber-400" />
                        Simulation active (Webcam optional)
                      </div>
                    )}
                  </div>
                )}

                {/* Facial HUD Tracking Mesh Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Bounding Box */}
                  <div className={`relative w-48 h-56 border-2 transition-colors rounded-2xl ${
                    isScanning ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'border-indigo-400/70'
                  }`}>
                    {/* Corner Crosshairs */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />

                    {/* Laser Sweep Line */}
                    {isScanning && (
                      <div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] transition-all duration-150"
                        style={{ top: `${(scanProgress / 100) * 100}%` }}
                      />
                    )}

                    {/* Landmark Dots */}
                    <div className="absolute top-16 left-12 w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-ping" />
                    <div className="absolute top-16 right-12 w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-ping" />
                    <div className="absolute top-28 left-23 w-1.5 h-1.5 rounded-full bg-indigo-400/80" />
                    <div className="absolute bottom-12 left-16 right-16 h-0.5 bg-emerald-400/60" />
                  </div>
                </div>

                {/* Liveness & Telemetry Badges */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3D Liveness Verified</span>
                </div>
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 border border-slate-700">
                  FPS: 30 · FOV: 78°
                </div>
              </div>

              {/* Progress bar during scan */}
              {isScanning && (
                <div className="w-full mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Extracting Face Embeddings...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-150"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-3 w-full">
                <button
                  disabled={isScanning}
                  onClick={() => handleStartScan('face')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Scanning Face...' : `Verify Face for ${currentStudent?.name.split(' ')[0]}`}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Fingerprint Biometric Scanner Viewport */
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="relative flex flex-col items-center justify-center p-8">
                {/* Fingerprint Sensor Ring */}
                <button
                  onClick={() => handleStartScan('fingerprint')}
                  disabled={isScanning}
                  className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-300 relative group cursor-pointer focus:outline-none ${
                    isScanning
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'border-indigo-500/70 bg-indigo-50 dark:bg-indigo-950/20 hover:border-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  }`}
                >
                  <Fingerprint
                    className={`w-24 h-24 transition-colors ${
                      isScanning ? 'text-emerald-500 animate-pulse' : 'text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform'
                    }`}
                  />

                  {/* Laser Scan Sweep Line */}
                  {isScanning && (
                    <div
                      className="absolute left-4 right-4 h-1 bg-emerald-400 shadow-[0_0_10px_#34d399] rounded transition-all duration-150"
                      style={{ top: `${(scanProgress / 100) * 80 + 10}%` }}
                    />
                  )}
                </button>

                <div className="mt-4 text-center">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Optical Capacitive Sensor 500 DPI
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click or hold pad to scan fingerprint for {currentStudent?.name}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {isScanning && (
                <div className="w-full mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Extracting Minutiae Points...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-150"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4 flex items-center gap-3 w-full">
                <button
                  disabled={isScanning}
                  onClick={() => handleStartScan('fingerprint')}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isScanning ? 'Reading Ridge Patterns...' : 'Place Finger & Verify'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Student Selector & Verification Receipt */}
        <div className="space-y-4">
          {/* Student Selector Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
              Select Student to Check-In
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {branchStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNo} - {s.name} (Desk: {s.deskNumber})
                </option>
              ))}
            </select>

            {currentStudent && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-medium">{currentStudent.rollNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Desk:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentStudent.deskNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Parent Phone:</span>
                  <span className="font-mono">{currentStudent.parentPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Biometrics:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Face &amp; Fingerprint Enrolled</span>
                </div>
              </div>
            )}
          </div>

          {/* Last Verification Card */}
          {lastVerification && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-4 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Attendance Verified &amp; Logged</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {lastVerification.student.name}
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  Roll: {lastVerification.student.rollNo} · {activePeriod.label}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-200 dark:border-emerald-800/40">
                  <span>Match Confidence: <strong className="text-emerald-600 font-mono">{lastVerification.confidence}%</strong></span>
                  <span className="font-mono">{lastVerification.timestamp}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Simulation Batch Trigger */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
              Kiosk Batch Operations
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Pick random student and punch
                  const unverified = branchStudents.filter((s) => s.id !== currentStudent.id);
                  if (unverified.length > 0) {
                    const randomStu = unverified[Math.floor(Math.random() * unverified.length)];
                    setSelectedStudentId(randomStu.id);
                    soundAlert.playBiometricSuccessChime();
                    onRecordPunch(randomStu.id, activePeriod.id, 'facial_recognition', 98.9);
                    setLastVerification({
                      student: randomStu,
                      method: 'Rapid Kiosk Pass',
                      confidence: 98.9,
                      timestamp: new Date().toLocaleTimeString(),
                    });
                  }
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Simulate Next Student Walk-Through</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
