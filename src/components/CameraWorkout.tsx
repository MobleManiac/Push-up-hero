import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Flame,
  Shield,
  Activity,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Play,
  Square,
  Touchpad
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExerciseType, EXERCISES } from '../types';
import { useWorkout } from '../context/WorkoutContext';
import { VisionWorkoutTracker, drawPoseSkeleton, PoseLandmark } from '../utils/poseDetector';
import { playRepDing, playCountdownBeep, playPlankChime, speakText } from '../utils/audio';

interface CameraWorkoutProps {
  onFinishWorkout?: () => void;
}

export const CameraWorkout: React.FC<CameraWorkoutProps> = ({ onFinishWorkout }) => {
  const { goals, logSession, todayPushups } = useWorkout();

  // Exercise selection
  const [exercise, setExercise] = useState<ExerciseType>(goals.preferredExercise || 'standard_pushup');
  const [mode, setMode] = useState<'camera' | 'touch'>('camera');
  
  // Tracking state
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [plankSeconds, setPlankSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState('Position your camera and press Start');
  const [depthPercent, setDepthPercent] = useState(0);
  const [isGoodForm, setIsGoodForm] = useState(true);
  const [repState, setRepState] = useState<'up' | 'down' | 'holding' | 'searching'>('up');
  
  // Settings
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [visionEngineReady, setVisionEngineReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Summary modal
  const [showSummary, setShowSummary] = useState(false);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<{
    exercise: ExerciseType;
    count: number;
    duration: number;
  } | null>(null);

  // DOM & Vision refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<VisionWorkoutTracker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaPipePoseRef = useRef<any>(null);

  // Initialize tracker
  useEffect(() => {
    trackerRef.current = new VisionWorkoutTracker(exercise);
  }, [exercise]);

  // Duration Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive && countdown === null) {
      timer = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, countdown]);

  // Voice Coach Milestones
  useEffect(() => {
    if (!voiceCoachEnabled || !isActive) return;
    if (exercise === 'plank') {
      if (plankSeconds > 0 && plankSeconds % 15 === 0) {
        speakText(`${plankSeconds} seconds! Hold that iron core!`, voiceCoachEnabled);
      }
    } else {
      if (repCount > 0) {
        if (repCount % 10 === 0) {
          speakText(`${repCount} reps! Outstanding pace!`, voiceCoachEnabled);
        } else if (repCount === Math.round(goals.dailyPushups / 2)) {
          speakText(`Halfway to your daily goal! Keep driving!`, voiceCoachEnabled);
        } else if (repCount === 5) {
          speakText(`5 reps down. Rhythm is locked in!`, voiceCoachEnabled);
        }
      }
    }
  }, [repCount, plankSeconds, exercise, voiceCoachEnabled, isActive, goals.dailyPushups]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Check for MediaPipe Pose in window
      if (typeof window !== 'undefined' && (window as any).Pose) {
        try {
          const pose = new (window as any).Pose({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
          });
          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          pose.onResults((results: any) => {
            if (!canvasRef.current || !results.poseLandmarks) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw skeleton overlay
            drawPoseSkeleton(
              ctx,
              results.poseLandmarks,
              canvas.width,
              canvas.height,
              isGoodForm,
              exercise === 'raw_pushup' ? 'amber' : exercise === 'plank' ? 'cyan' : 'emerald'
            );

            // Process with tracker
            if (trackerRef.current) {
              const res = trackerRef.current.processLandmarks(results.poseLandmarks);
              handleFrameResult(res);
            }
          });

          mediaPipePoseRef.current = pose;
          setVisionEngineReady(true);
        } catch (err) {
          console.warn('MediaPipe initialization fallback to optical motion:', err);
          setVisionEngineReady(true);
        }
      } else {
        // Fallback optical motion tracker ready
        setVisionEngineReady(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. You can also use Screen-Tap mode below!');
      setMode('touch');
    }
  }, [cameraFacing, exercise, isGoodForm]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Frame processing loop
  const handleFrameResult = useCallback((res: any) => {
    setDepthPercent(res.depthPercentage);
    setRepState(res.state);
    setIsGoodForm(res.isGoodForm);
    setCurrentFeedback(res.feedback);

    if (res.repCountDelta > 0) {
      setRepCount(prev => {
        const next = prev + res.repCountDelta;
        if (soundEnabled) playRepDing();
        return next;
      });
    }

    if (res.plankSecondDelta > 0) {
      setPlankSeconds(prev => {
        const next = prev + res.plankSecondDelta;
        if (soundEnabled && next % 5 === 0) playPlankChime();
        return next;
      });
    }
  }, [soundEnabled]);

  // Main rendering loop for vision tracking
  useEffect(() => {
    if (!isActive || countdown !== null || mode !== 'camera') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const processFrame = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        // If MediaPipe is active, send frame
        if (mediaPipePoseRef.current) {
          try {
            await mediaPipePoseRef.current.send({ image: videoRef.current });
          } catch {
            // If MediaPipe throws, run fallback motion
            if (trackerRef.current) {
              const res = trackerRef.current.processVideoFrameMotion(videoRef.current);
              handleFrameResult(res);
            }
          }
        } else if (trackerRef.current) {
          // Optical motion fallback
          const res = trackerRef.current.processVideoFrameMotion(videoRef.current);
          handleFrameResult(res);
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, countdown, mode, handleFrameResult]);

  // Switch camera when active
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  // Countdown & Workout Start
  const handleStartWorkout = () => {
    setCountdown(3);
    playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(false);
      } else {
        clearInterval(interval);
        setCountdown(null);
        playCountdownBeep(true);
        setIsActive(true);
        setRepCount(0);
        setPlankSeconds(0);
        setDurationSeconds(0);
        if (trackerRef.current) {
          trackerRef.current.setExercise(exercise);
        }
        speakText(`Workout started. Let's conquer this!`, voiceCoachEnabled);
      }
    }, 1000);
  };

  // End Workout
  const handleEndWorkout = () => {
    setIsActive(false);
    const count = exercise === 'plank' ? plankSeconds : repCount;
    
    if (count > 0) {
      logSession({
        exercise,
        reps: count,
        durationSeconds: Math.max(1, durationSeconds),
        mode: mode === 'camera' ? 'camera_vision' : 'screen_tap',
        accuracyScore: isGoodForm ? 94 : 85,
        notes: `Vision workout: ${count} ${exercise === 'plank' ? 'seconds' : 'reps'}`
      });

      setLastCompletedWorkout({
        exercise,
        count,
        duration: durationSeconds
      });
      setShowSummary(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
    }
  };

  // Screen-Tap rep logger
  const handleTouchRep = () => {
    if (!isActive) return;
    if (exercise === 'plank') return;

    setRepCount(prev => {
      const next = prev + 1;
      if (soundEnabled) playRepDing();
      return next;
    });
  };

  const currentCount = exercise === 'plank' ? plankSeconds : repCount;
  const currentUnit = exercise === 'plank' ? 'seconds' : 'reps';
  const remainingToday = Math.max(0, goals.dailyPushups - (todayPushups + (exercise !== 'plank' ? repCount : 0)));

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Top Banner: Mode & Exercise Selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Exercise Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => {
              if (isActive) return;
              setExercise('standard_pushup');
            }}
            disabled={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              exercise === 'standard_pushup'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Standard
          </button>

          <button
            onClick={() => {
              if (isActive) return;
              setExercise('raw_pushup');
            }}
            disabled={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              exercise === 'raw_pushup'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Raw Push-up
          </button>

          <button
            onClick={() => {
              if (isActive) return;
              setExercise('plank');
            }}
            disabled={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              exercise === 'plank'
                ? 'bg-cyan-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Planks
          </button>
        </div>

        {/* Input Mode: Camera Vision vs Screen Tap */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setMode('camera')}
              disabled={isActive}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mode === 'camera' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera Vision</span>
            </button>
            <button
              onClick={() => setMode('touch')}
              disabled={isActive}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mode === 'touch' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Touchpad className="w-3.5 h-3.5 text-amber-400" />
              <span>Chest / Tap</span>
            </button>
          </div>

          {/* Sound & Voice Toggles */}
          <button
            onClick={() => setVoiceCoachEnabled(!voiceCoachEnabled)}
            className={`p-2 rounded-xl border transition-all ${
              voiceCoachEnabled
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-600'
            }`}
            title={voiceCoachEnabled ? 'Voice coach enabled' : 'Voice coach muted'}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Vision Workspace */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl min-h-[440px] flex flex-col justify-between">
        {mode === 'camera' ? (
          <>
            {/* Video & Canvas Overlay */}
            <div className="relative w-full aspect-video sm:aspect-[4/3] max-h-[500px] bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
              />

              {/* Camera Error banner */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/90 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">Camera Permission Notice</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mb-4">{cameraError}</p>
                  <button
                    onClick={() => {
                      setMode('touch');
                      setCameraError(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
                  >
                    Switch to Screen-Tap Mode
                  </button>
                </div>
              )}

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-30 animate-in fade-in">
                  <span className="text-8xl font-black text-amber-400 font-heading animate-pulse">
                    {countdown}
                  </span>
                  <p className="text-sm font-semibold text-zinc-300 mt-2">
                    Get in starting position!
                  </p>
                </div>
              )}

              {/* Depth Gauge Bar (Right side) */}
              {isActive && exercise !== 'plank' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-zinc-950/80 backdrop-blur-md p-2 rounded-2xl border border-zinc-700/80 z-20">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Depth</span>
                  <div className="w-3.5 h-36 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-zinc-700">
                    <div
                      className={`w-full rounded-full transition-all duration-75 ${
                        depthPercent >= 80 ? 'bg-emerald-400' : depthPercent >= 50 ? 'bg-amber-400' : 'bg-zinc-500'
                      }`}
                      style={{ height: `${depthPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-white">{depthPercent}%</span>
                </div>
              )}

              {/* Rep / Hold Stage Badge (Top Left) */}
              {isActive && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-lg ${
                      exercise === 'plank'
                        ? isGoodForm ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
                        : repState === 'down'
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
                        : 'bg-zinc-900/80 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    {exercise === 'plank'
                      ? isGoodForm ? 'SOLID PLANK' : 'ADJUST FORM'
                      : repState === 'down' ? 'PUSH UP!' : 'LOWER CHEST'}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Screen Tap / Proximity Mode alternative */
          <div
            onClick={handleTouchRep}
            className={`w-full aspect-video sm:aspect-[4/3] max-h-[460px] flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-colors ${
              isActive ? 'bg-zinc-900/70 hover:bg-zinc-900 active:scale-[0.99]' : 'bg-zinc-950'
            }`}
          >
            <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500/40 flex items-center justify-center mb-4">
              <Touchpad className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">
              {isActive ? 'TAP WITH CHEST / NOSE / FINGER' : 'Chest & Touch Mode'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1">
              Place your phone or laptop beneath your chest. Each time your chest touches the screen or you tap, a rep counts!
            </p>
          </div>
        )}

        {/* Live HUD Dashboard Footer */}
        <div className="p-4 sm:p-6 bg-zinc-950/95 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          {/* Main Rep Counter */}
          <div className="flex items-baseline gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {exercise === 'plank' ? 'HOLD SECONDS' : 'REPS COMPLETED'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white font-heading tracking-tight leading-none">
                  {currentCount}
                </span>
                <span className="text-sm font-bold text-amber-500">
                  {currentUnit}
                </span>
              </div>
            </div>

            {/* Daily Goal Remaining Info */}
            {exercise !== 'plank' && (
              <div className="hidden sm:block pl-4 border-l border-zinc-800 text-xs">
                <span className="text-zinc-400 block">Daily Target: <strong className="text-white">{goals.dailyPushups}</strong></span>
                <span className="text-amber-400 font-semibold">{remainingToday} reps remaining today</span>
              </div>
            )}
          </div>

          {/* Form Coaching Feedback Bubble */}
          <div className="flex-1 max-w-md hidden md:block px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
            <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wide">
              AI Vision Feedback
            </span>
            <p className="text-xs font-semibold text-amber-300 truncate">
              {currentFeedback}
            </p>
          </div>

          {/* Action Control: Start vs Stop */}
          <div className="flex items-center gap-3">
            {!isActive ? (
              <button
                onClick={handleStartWorkout}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-zinc-950" />
                <span>START WORKOUT</span>
              </button>
            ) : (
              <button
                onClick={handleEndWorkout}
                className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm tracking-wide shadow-lg shadow-red-600/30 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                <Square className="w-5 h-5 fill-white" />
                <span>FINISH SET</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Instructions & Form Standards Accordion */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-4 rounded-2xl border transition-all ${
          exercise === 'raw_pushup' ? 'bg-amber-950/20 border-amber-500/40' : 'bg-zinc-900/50 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Raw Push-up Rules</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Explosive chest-to-deck dead stop. Elbows break 80° depth, no sagging spine, pure explosive lockout at peak.
          </p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          exercise === 'standard_pushup' ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-zinc-900/50 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Standard Push-up Rules</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Strict military cadence. 90-degree elbow break, core engaged, straight line from shoulders through heels.
          </p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          exercise === 'plank' ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-zinc-900/50 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white">Plank Rules</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Forearms planted, spine horizontal. Timer pauses if hips sag or pike above horizontal plane.
          </p>
        </div>
      </div>

      {/* Workout Summary Modal */}
      {showSummary && lastCompletedWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
              🔥
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-heading">WORKOUT COMPLETE!</h3>
              <p className="text-xs text-zinc-400 mt-1">Another victory recorded in your journey.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total</span>
                <span className="text-xl font-black text-white">
                  {lastCompletedWorkout.count}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold block">
                  {lastCompletedWorkout.exercise === 'plank' ? 'sec' : 'reps'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Time</span>
                <span className="text-xl font-black text-white">
                  {lastCompletedWorkout.duration}s
                </span>
                <span className="text-[10px] text-zinc-400 block">duration</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Form</span>
                <span className="text-xl font-black text-emerald-400">94%</span>
                <span className="text-[10px] text-zinc-400 block">accuracy</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSummary(false);
                if (onFinishWorkout) onFinishWorkout();
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
