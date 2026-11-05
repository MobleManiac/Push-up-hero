/**
 * Computer Vision Pose Detector & Motion Engine
 * Handles MediaPipe Pose skeleton detection with automatic Canvas Optical Motion fallback.
 */

import { ExerciseType } from '../types';

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseFrameResult {
  landmarks?: PoseLandmark[];
  elbowAngle?: number;
  bodyAngle?: number;
  depthPercentage: number;
  state: 'up' | 'down' | 'holding' | 'searching';
  feedback: string;
  isGoodForm: boolean;
  repCountDelta: number; // 1 if a rep just completed in this frame
  plankSecondDelta: number; // 1 if 1 clean plank second accrued
}

// Calculate 2D angle between three points in degrees (vertex at B)
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return Math.round(angle);
}

// MediaPipe Pose connection pairs for skeleton drawing
export const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
];

export class VisionWorkoutTracker {
  private exercise: ExerciseType = 'standard_pushup';
  private repState: 'up' | 'down' = 'up';
  private lastRepTime = 0;
  private plankAccumulatorMs = 0;
  private lastFrameTime = 0;
  
  // Motion difference fallback tracker
  private prevMotionCanvas: HTMLCanvasElement | null = null;
  private prevImageData: ImageData | null = null;
  private smoothedMotionY = 0.5;
  private motionBaselineY = 0.5;
  private motionState: 'up' | 'down' = 'up';

  constructor(exercise: ExerciseType) {
    this.exercise = exercise;
    this.lastFrameTime = performance.now();
  }

  public setExercise(exercise: ExerciseType) {
    this.exercise = exercise;
    this.repState = 'up';
    this.motionState = 'up';
    this.plankAccumulatorMs = 0;
  }

  /**
   * Process a landmark set from MediaPipe Pose
   */
  public processLandmarks(landmarks: PoseLandmark[]): PoseFrameResult {
    const now = performance.now();
    const dt = this.lastFrameTime > 0 ? (now - this.lastFrameTime) : 16;
    this.lastFrameTime = now;

    // Pick best visible arm (left or right)
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftHip = landmarks[23];
    const leftAnkle = landmarks[27];

    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];
    const rightHip = landmarks[24];
    const rightAnkle = landmarks[28];

    const leftVis = (leftShoulder?.visibility ?? 0.8) + (leftElbow?.visibility ?? 0.8);
    const rightVis = (rightShoulder?.visibility ?? 0.8) + (rightElbow?.visibility ?? 0.8);

    const shoulder = leftVis >= rightVis ? leftShoulder : rightShoulder;
    const elbow = leftVis >= rightVis ? leftElbow : rightElbow;
    const wrist = leftVis >= rightVis ? leftWrist : rightWrist;
    const hip = leftVis >= rightVis ? leftHip : rightHip;
    const ankle = leftVis >= rightVis ? leftAnkle : rightAnkle;

    if (!shoulder || !elbow || !wrist) {
      return {
        landmarks,
        depthPercentage: 0,
        state: 'searching',
        feedback: 'Position camera to see your upper body',
        isGoodForm: false,
        repCountDelta: 0,
        plankSecondDelta: 0,
      };
    }

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const bodyAngle = hip && ankle ? calculateAngle(shoulder, hip, ankle) : 175;

    // PLANK LOGIC
    if (this.exercise === 'plank') {
      const isBodyStraight = bodyAngle >= 150 && bodyAngle <= 195;
      let feedback = 'Perfect plank! Hold tight.';
      if (bodyAngle < 150) {
        feedback = 'Hips sagging! Tighten core & raise hips.';
      } else if (bodyAngle > 195) {
        feedback = 'Hips too high! Lower hips in line with shoulders.';
      }

      let plankSec = 0;
      if (isBodyStraight) {
        this.plankAccumulatorMs += dt;
        if (this.plankAccumulatorMs >= 1000) {
          plankSec = Math.floor(this.plankAccumulatorMs / 1000);
          this.plankAccumulatorMs %= 1000;
        }
      }

      return {
        landmarks,
        elbowAngle,
        bodyAngle,
        depthPercentage: Math.min(100, Math.max(0, 100 - Math.abs(180 - bodyAngle) * 2)),
        state: 'holding',
        feedback,
        isGoodForm: isBodyStraight,
        repCountDelta: 0,
        plankSecondDelta: plankSec,
      };
    }

    // PUSH-UP LOGIC (Standard vs Raw)
    // In Raw Push-up, depth must be deeper (<78° chest-to-deck) vs Standard (<95°)
    const downThreshold = this.exercise === 'raw_pushup' ? 80 : 95;
    const upThreshold = 155;

    // Depth percent: 0% at 170°, 100% at downThreshold
    const maxRange = 170 - downThreshold;
    const currentProg = Math.max(0, Math.min(170, 170 - elbowAngle));
    const depthPercentage = Math.min(100, Math.max(0, Math.round((currentProg / maxRange) * 100)));

    let repDelta = 0;
    let feedback = 'Drop down into rep';
    let isGoodForm = true;

    // Check torso alignment
    if (bodyAngle < 145) {
      feedback = 'Keep your back flat! Avoid sagging.';
      isGoodForm = false;
    }

    if (this.repState === 'up') {
      if (elbowAngle <= downThreshold) {
        this.repState = 'down';
        feedback = this.exercise === 'raw_pushup' ? 'Chest to deck! Explode UP!' : 'Good depth! Push UP!';
      } else {
        feedback = depthPercentage > 50 ? 'Go deeper!' : 'Lower chest...';
      }
    } else {
      // Currently DOWN
      if (elbowAngle >= upThreshold) {
        // Must have been at least 400ms since last rep to avoid jitter
        if (now - this.lastRepTime > 400) {
          repDelta = 1;
          this.lastRepTime = now;
        }
        this.repState = 'up';
        feedback = 'Rep counted! Lock out at top.';
      } else {
        feedback = 'Push all the way up!';
      }
    }

    return {
      landmarks,
      elbowAngle,
      bodyAngle,
      depthPercentage,
      state: this.repState,
      feedback,
      isGoodForm,
      repCountDelta: repDelta,
      plankSecondDelta: 0,
    };
  }

  /**
   * High-speed Optical Motion Fallback Tracker
   * Uses frame differencing on video element to track vertical body movement
   */
  public processVideoFrameMotion(video: HTMLVideoElement): PoseFrameResult {
    const now = performance.now();
    const dt = this.lastFrameTime > 0 ? (now - this.lastFrameTime) : 16;
    this.lastFrameTime = now;

    if (!this.prevMotionCanvas) {
      this.prevMotionCanvas = document.createElement('canvas');
      this.prevMotionCanvas.width = 64;
      this.prevMotionCanvas.height = 48;
    }

    const ctx = this.prevMotionCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return {
        depthPercentage: 0,
        state: 'searching',
        feedback: 'Initializing vision...',
        isGoodForm: true,
        repCountDelta: 0,
        plankSecondDelta: 0,
      };
    }

    ctx.drawImage(video, 0, 0, 64, 48);
    const currImageData = ctx.getImageData(0, 0, 64, 48);
    const currData = currImageData.data;

    let repDelta = 0;
    let plankSec = 0;
    let depthPercentage = 0;
    let feedback = 'Camera motion tracking active';

    if (this.prevImageData) {
      const prevData = this.prevImageData.data;
      let totalMotionWeight = 0;
      let motionWeightedY = 0;

      // Sample differences across pixels
      for (let y = 8; y < 40; y++) {
        for (let x = 12; x < 52; x++) {
          const idx = (y * 64 + x) * 4;
          const diff = Math.abs(currData[idx] - prevData[idx]) +
                       Math.abs(currData[idx + 1] - prevData[idx + 1]) +
                       Math.abs(currData[idx + 2] - prevData[idx + 2]);
          if (diff > 45) {
            totalMotionWeight += diff;
            motionWeightedY += diff * (y / 48);
          }
        }
      }

      if (totalMotionWeight > 800) {
        const measuredY = motionWeightedY / totalMotionWeight;
        this.smoothedMotionY = this.smoothedMotionY * 0.7 + measuredY * 0.3;

        // Auto-adapt baseline
        this.motionBaselineY = this.motionBaselineY * 0.995 + this.smoothedMotionY * 0.005;

        // Relative displacement downwards
        const disp = this.smoothedMotionY - this.motionBaselineY;
        depthPercentage = Math.min(100, Math.max(0, Math.round((disp / 0.18) * 100)));

        if (this.exercise === 'plank') {
          // In plank, holding still with steady posture counts
          if (totalMotionWeight < 2500) {
            this.plankAccumulatorMs += dt;
            feedback = 'Plank hold locked in! Keep steady.';
            if (this.plankAccumulatorMs >= 1000) {
              plankSec = 1;
              this.plankAccumulatorMs %= 1000;
            }
          } else {
            feedback = 'Try to keep your body still!';
          }
        } else {
          // Pushup motion tracking
          if (this.motionState === 'up') {
            if (depthPercentage >= 65) {
              this.motionState = 'down';
              feedback = 'Down! Now push back up!';
            } else {
              feedback = 'Drop lower...';
            }
          } else {
            if (depthPercentage <= 20) {
              if (now - this.lastRepTime > 500) {
                repDelta = 1;
                this.lastRepTime = now;
              }
              this.motionState = 'up';
              feedback = 'Rep counted! Keep pushing!';
            } else {
              feedback = 'Push up to the top!';
            }
          }
        }
      } else {
        feedback = 'Movement steady. Start your reps!';
      }
    }

    this.prevImageData = currImageData;

    return {
      depthPercentage,
      state: this.motionState,
      feedback,
      isGoodForm: true,
      repCountDelta: repDelta,
      plankSecondDelta: plankSec,
    };
  }
}

/**
 * Draws landmarks and skeleton lines onto overlay canvas
 */
export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  width: number,
  height: number,
  isGoodForm: boolean,
  colorScheme: 'amber' | 'emerald' | 'cyan' = 'amber'
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Connect bones
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isGoodForm
    ? (colorScheme === 'amber' ? '#f59e0b' : colorScheme === 'cyan' ? '#06b6d4' : '#10b981')
    : '#ef4444';

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const p1 = landmarks[startIdx];
    const p2 = landmarks[endIdx];

    if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }
  }

  // Draw joints
  for (let i = 0; i < landmarks.length; i++) {
    // Only draw primary upper body & leg joints
    if ([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(i)) {
      const p = landmarks[i];
      if (p && (p.visibility ?? 1) > 0.4) {
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isGoodForm ? '#22c55e' : '#ef4444';
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}
