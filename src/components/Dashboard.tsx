import React, { useState } from 'react';
import {
  Flame,
  Target,
  Trophy,
  PlusCircle,
  Video,
  Volume2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { getRandomQuote, getMotivationalStatus, getRankTier, Quote } from '../utils/motivation';
import { speakText } from '../utils/audio';
import { EXERCISES } from '../types';

interface DashboardProps {
  onStartCamera: () => void;
  onOpenQuickLog: () => void;
  onOpenGoals: () => void;
  onOpenLeaderboard: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartCamera,
  onOpenQuickLog,
  onOpenGoals,
  onOpenLeaderboard,
}) => {
  const {
    goals,
    todayPushups,
    todayRawPushups,
    todayStandardPushups,
    todayPlankSeconds,
    weekPushups,
    weekPlankSeconds,
    dailyPushupProgress,
    weeklyPushupProgress,
    currentStreak,
    bestStreak,
    sessions,
    totalPushups,
    deleteSession,
  } = useWorkout();

  const [currentQuote, setCurrentQuote] = useState<Quote>(getRandomQuote);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const status = getMotivationalStatus(todayPushups, goals.dailyPushups);
  const rank = getRankTier(totalPushups);
  const remainingToday = Math.max(0, goals.dailyPushups - todayPushups);

  const handleSpeakQuote = () => {
    setIsSpeaking(true);
    speakText(`"${currentQuote.quote}" - ${currentQuote.author}`, true);
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  const handleRefreshQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  // Recent 5 sessions
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Motivational Quote Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Daily Motivation
              </span>
              <span className="text-xs text-zinc-400 font-medium">&bull; {currentQuote.category}</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white italic leading-snug">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <span className="text-xs font-bold text-amber-400 block pt-0.5">
              &mdash; {currentQuote.author}
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSpeakQuote}
              className={`p-2.5 rounded-xl border transition-all ${
                isSpeaking
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 scale-105'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title="Listen to quote"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefreshQuote}
              className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors"
              title="Next motivational quote"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Goal Cards: Daily (Required) & Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Daily Push-up Goal (Required Flagship) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  Daily Push-Up Goal
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Required
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
                {todayPushups} <span className="text-zinc-500 text-lg font-normal">/ {goals.dailyPushups} reps</span>
              </h2>
            </div>

            <button
              onClick={onOpenGoals}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 transition-colors"
            >
              Change Goal
            </button>
          </div>

          {/* Progress Bar & Status */}
          <div className="my-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-400">{dailyPushupProgress}% Completed</span>
              <span className="text-zinc-400">
                {remainingToday > 0 ? `${remainingToday} reps remaining` : 'Target crushed!'}
              </span>
            </div>
            <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyPushupProgress >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 glow-emerald'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 glow-amber'
                }`}
                style={{ width: `${Math.min(100, dailyPushupProgress)}%` }}
              />
            </div>
          </div>

          {/* Motivational Status Pill & Subtext */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">{status.message}</span>
              <span className="text-[11px] text-zinc-400 block">{status.subtext}</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              {status.badge}
            </span>
          </div>

          {/* Quick Actions Footer inside Hero */}
          <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartCamera}
              className="flex-1 min-w-[170px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
            >
              <Video className="w-4 h-4 fill-zinc-950" />
              <span>Camera Vision Tracker</span>
            </button>

            <button
              onClick={onOpenQuickLog}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Quick Log Set</span>
            </button>
          </div>
        </div>

        {/* Card 2: Weekly Goal & Planks */}
        <div className="space-y-5">
          {/* Weekly Push-up Cumulative */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Weekly Target
              </span>
              <span className="text-xs font-bold text-zinc-400">7-Day Pacing</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-heading">{weekPushups}</span>
                <span className="text-xs text-zinc-400 font-medium">/ {goals.weeklyPushups} reps</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden mt-2 border border-zinc-800">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, weeklyPushupProgress)}%` }}
                />
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                {weeklyPushupProgress}% of weekly target achieved
              </span>
            </div>
          </div>

          {/* Daily Planks Hold */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Planks Target
              </span>
              <span className="text-xs text-zinc-400">{todayPlankSeconds}s / {goals.dailyPlankSeconds}s</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-white font-heading">{todayPlankSeconds}s</span>
                <p className="text-[11px] text-zinc-400">Core isometric hold today</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400">
                  {Math.round((todayPlankSeconds / goals.dailyPlankSeconds) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Breakdown & Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Raw Push-ups */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Raw Push-ups</span>
            <div className="text-xl font-black text-white font-heading">{todayRawPushups} <span className="text-xs font-normal text-zinc-500">reps today</span></div>
            <span className="text-[10px] text-zinc-500">Chest to deck strictly</span>
          </div>
        </div>

        {/* Standard Push-ups */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Standard Push-ups</span>
            <div className="text-xl font-black text-white font-heading">{todayStandardPushups} <span className="text-xs font-normal text-zinc-500">reps today</span></div>
            <span className="text-[10px] text-zinc-500">Military cadence form</span>
          </div>
        </div>

        {/* Active Streak */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Active Streak</span>
            <div className="text-xl font-black text-orange-400 font-heading">{currentStreak} Days <span className="text-xs font-normal text-zinc-500">(Best: {bestStreak}d)</span></div>
            <span className="text-[10px] text-zinc-500">Consistency beats intensity</span>
          </div>
        </div>
      </div>

      {/* Social Leaderboard Callout & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Social Rank Card */}
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Friends Leaderboard
              </span>
              <span className="text-xs text-zinc-400">Live Ranks</span>
            </div>
            <h3 className="text-lg font-bold text-white font-heading">
              Climb the Ranks Today
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every rep you do pushes you higher above your friends on the daily and weekly boards.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Recent Session Logs */}
        <div className="lg:col-span-2 rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Workout Logs</h3>
            </div>
            <span className="text-xs text-zinc-500">{sessions.length} total sessions</span>
          </div>

          {recentSessions.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/50 rounded-2xl border border-zinc-800/80">
              <p className="text-xs text-zinc-400">No sessions recorded yet. Start your first workout!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const isPlank = session.exercise === 'plank';
                const exInfo = EXERCISES[session.exercise];

                return (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm">
                        {session.exercise === 'raw_pushup' ? '🔥' : session.exercise === 'plank' ? '🛡️' : '💪'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{exInfo.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase font-semibold">
                            {session.mode === 'camera_vision' ? 'AI Vision' : 'Quick Log'}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {session.dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-white">
                          +{session.reps} {isPlank ? 'sec' : 'reps'}
                        </span>
                        {session.accuracyScore && (
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            {session.accuracyScore}% form
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
