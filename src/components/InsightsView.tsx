import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Trophy,
  Flame,
  Shield,
  Activity,
  Calendar,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseType, EXERCISES } from '../types';

export const InsightsView: React.FC = () => {
  const {
    sessions,
    goals,
    personalRecords,
    deleteSession,
    totalPushups,
    totalPlankSeconds,
    currentStreak,
    bestStreak
  } = useWorkout();

  const [historyFilter, setHistoryFilter] = useState<'all' | ExerciseType>('all');
  const [chartDays, setChartDays] = useState<7 | 14>(7);

  // Build daily data for the chart (past 7 or 14 days)
  const chartData = useMemo(() => {
    const days: { dateStr: string; label: string; pushups: number; goal: number }[] = [];
    const now = new Date();

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const label = d.toLocaleDateString([], { weekday: 'short' });

      const dayPushups = sessions
        .filter(s => s.dateStr === dateStr && (s.exercise === 'standard_pushup' || s.exercise === 'raw_pushup'))
        .reduce((sum, s) => sum + s.reps, 0);

      days.push({
        dateStr,
        label,
        pushups: dayPushups,
        goal: goals.dailyPushups
      });
    }

    return days;
  }, [sessions, chartDays, goals.dailyPushups]);

  // Max value in chart for scaling
  const maxChartVal = useMemo(() => {
    const highestLogged = Math.max(...chartData.map(d => d.pushups), 0);
    return Math.max(highestLogged, goals.dailyPushups) * 1.25 || 100;
  }, [chartData, goals.dailyPushups]);

  // Breakdown metrics
  const rawPushupTotal = useMemo(() => {
    return sessions.filter(s => s.exercise === 'raw_pushup').reduce((a, b) => a + b.reps, 0);
  }, [sessions]);

  const standardPushupTotal = useMemo(() => {
    return sessions.filter(s => s.exercise === 'standard_pushup').reduce((a, b) => a + b.reps, 0);
  }, [sessions]);

  // Filtered session history
  const filteredSessions = useMemo(() => {
    if (historyFilter === 'all') return sessions;
    return sessions.filter(s => s.exercise === historyFilter);
  }, [sessions, historyFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-cyan-950/20 border border-zinc-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Analytics Engine
          </span>
          <span className="text-xs text-zinc-400">Progress & Performance</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
          Insights & Personal Records
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-xl">
          Visual charts tracking your volume over time, personal records, and comprehensive workout log.
        </p>
      </div>

      {/* PR Showcase Hall of Fame */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Max Single Set</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {personalRecords.maxSingleSetPushups} <span className="text-xs font-normal text-zinc-400">reps</span>
          </div>
          <span className="text-[10px] text-zinc-500">Unbroken single session record</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Max Daily Total</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {personalRecords.maxDailyPushups} <span className="text-xs font-normal text-zinc-400">reps</span>
          </div>
          <span className="text-[10px] text-zinc-500">Highest volume in 24 hours</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Longest Plank</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-heading">
            {personalRecords.maxSinglePlankSeconds} <span className="text-xs font-normal text-zinc-400">sec</span>
          </div>
          <span className="text-[10px] text-zinc-500">Continuous core hold</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Best Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-heading">
            {bestStreak} <span className="text-xs font-normal text-zinc-400">days</span>
          </div>
          <span className="text-[10px] text-zinc-500">Current: {currentStreak} active days</span>
        </div>
      </div>

      {/* Main Interactive Volume Chart */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Push-up Volume vs Daily Target
            </h3>
            <p className="text-xs text-zinc-400">Reps completed each day with your target threshold line</p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setChartDays(7)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartDays === 7 ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setChartDays(14)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                chartDays === 14 ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Last 14 Days
            </button>
          </div>
        </div>

        {/* SVG Bar Chart with Goal Line */}
        <div className="relative pt-6 pb-2">
          {/* Target line label */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-amber-500/50 pointer-events-none z-10 flex items-center justify-end pr-2"
            style={{ bottom: `${(goals.dailyPushups / maxChartVal) * 100}%` }}
          >
            <span className="text-[10px] font-bold text-amber-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-amber-500/30 -translate-y-1/2">
              Daily Goal: {goals.dailyPushups}
            </span>
          </div>

          {/* Bars */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-zinc-800">
            {chartData.map((d, idx) => {
              const heightPct = Math.min(100, (d.pushups / maxChartVal) * 100);
              const metGoal = d.pushups >= goals.dailyPushups;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-zinc-950 border border-zinc-700 text-white text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-20">
                    {d.pushups} reps ({d.dateStr})
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[40px] bg-zinc-950 rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        metGoal
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : d.pushups > 0
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                          : 'bg-zinc-800'
                      }`}
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                  </div>

                  {/* X-axis Label */}
                  <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 mt-2">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exercise Distribution Split */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Flame className="w-4 h-4" />
              Raw Push-ups
            </div>
            <div className="text-2xl font-black text-white font-heading mt-1">
              {rawPushupTotal}
            </div>
            <span className="text-[11px] text-zinc-500">
              {totalPushups > 0 ? Math.round((rawPushupTotal / totalPushups) * 100) : 0}% of all push-ups
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Shield className="w-4 h-4" />
              Standard Push-ups
            </div>
            <div className="text-2xl font-black text-white font-heading mt-1">
              {standardPushupTotal}
            </div>
            <span className="text-[11px] text-zinc-500">
              {totalPushups > 0 ? Math.round((standardPushupTotal / totalPushups) * 100) : 0}% of all push-ups
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Activity className="w-4 h-4" />
              Planks Hold
            </div>
            <div className="text-2xl font-black text-white font-heading mt-1">
              {Math.round(totalPlankSeconds / 60)}m {totalPlankSeconds % 60}s
            </div>
            <span className="text-[11px] text-zinc-500">
              Total isometric core time
            </span>
          </div>
        </div>
      </div>

      {/* Complete Workout Session History */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="text-base font-bold text-white font-heading">
              Session History Log
            </h3>
            <span className="text-xs text-zinc-500">({filteredSessions.length} logged sets)</span>
          </div>

          {/* Exercise Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                historyFilter === 'all' ? 'bg-zinc-800 text-white border-zinc-700' : 'text-zinc-400 border-zinc-850'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setHistoryFilter('raw_pushup')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                historyFilter === 'raw_pushup' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'text-zinc-400 border-zinc-850'
              }`}
            >
              Raw
            </button>
            <button
              onClick={() => setHistoryFilter('standard_pushup')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                historyFilter === 'standard_pushup' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'text-zinc-400 border-zinc-850'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setHistoryFilter('plank')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                historyFilter === 'plank' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'text-zinc-400 border-zinc-850'
              }`}
            >
              Planks
            </button>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800/80">
            <p className="text-xs text-zinc-400">No workout records matching this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80 max-h-[400px] overflow-y-auto">
            {filteredSessions.map((s) => {
              const isPlank = s.exercise === 'plank';
              const ex = EXERCISES[s.exercise];

              return (
                <div
                  key={s.id}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-zinc-850/40 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-sm">
                      {s.exercise === 'raw_pushup' ? '🔥' : s.exercise === 'plank' ? '🛡️' : '💪'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{ex.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-semibold">
                          {s.mode === 'camera_vision' ? 'AI Vision' : s.mode === 'screen_tap' ? 'Chest Tap' : 'Quick Log'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{s.dateStr}</span>
                        <span>&bull;</span>
                        <span>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {s.notes && (
                          <>
                            <span>&bull;</span>
                            <span className="text-zinc-400 italic truncate max-w-[150px]">{s.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-white">
                        +{s.reps} {isPlank ? 'sec' : 'reps'}
                      </span>
                      {s.accuracyScore && (
                        <span className="text-[10px] text-emerald-400 block font-semibold">
                          {s.accuracyScore}% accuracy
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => deleteSession(s.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
