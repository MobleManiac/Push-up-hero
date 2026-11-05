import React, { useState } from 'react';
import { Target, X, Check, Sparkles, Flame, Shield, Activity } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseType, EXERCISES } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose }) => {
  const { goals, updateGoals } = useWorkout();

  const [dailyPushups, setDailyPushups] = useState<number>(goals.dailyPushups);
  const [weeklyPushups, setWeeklyPushups] = useState<number>(goals.weeklyPushups);
  const [dailyPlankSeconds, setDailyPlankSeconds] = useState<number>(goals.dailyPlankSeconds);
  const [weeklyPlankSeconds, setWeeklyPlankSeconds] = useState<number>(goals.weeklyPlankSeconds);
  const [preferredExercise, setPreferredExercise] = useState<ExerciseType>(goals.preferredExercise);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDaily = Math.max(1, Number(dailyPushups) || 1);
    const finalWeekly = Math.max(1, Number(weeklyPushups) || finalDaily * 7);
    const finalDailyPlank = Math.max(5, Number(dailyPlankSeconds) || 60);
    const finalWeeklyPlank = Math.max(5, Number(weeklyPlankSeconds) || finalDailyPlank * 7);

    updateGoals({
      dailyPushups: finalDaily,
      weeklyPushups: finalWeekly,
      dailyPlankSeconds: finalDailyPlank,
      weeklyPlankSeconds: finalWeeklyPlank,
      preferredExercise,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleSetWeeklyMultiplier = (mult = 7) => {
    setWeeklyPushups(dailyPushups * mult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">Set Your Workout Goals</h2>
              <p className="text-xs text-zinc-400">Custom daily & weekly targets for push-ups and planks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Daily Push-up Goal (Required) */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Daily Push-up Goal</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Required
                </span>
              </div>
              <span className="text-xs text-zinc-400">Any custom number</span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                max="10000"
                value={dailyPushups || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setDailyPushups(isNaN(val) ? 0 : val);
                }}
                placeholder="e.g. 50"
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 uppercase">
                reps / day
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-500">Quick set:</span>
              {[20, 30, 50, 75, 100, 150, 200].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setDailyPushups(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    dailyPushups === preset
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Push-up Goal */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Weekly Push-up Goal</span>
              <button
                type="button"
                onClick={() => handleSetWeeklyMultiplier(7)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Match 7x Daily ({dailyPushups * 7})
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                max="70000"
                value={weeklyPushups || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setWeeklyPushups(isNaN(val) ? 0 : val);
                }}
                placeholder="e.g. 350"
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 uppercase">
                reps / week
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Tracks your 7-day cumulative total to keep you accountable even if life gets busy.
            </p>
          </div>

          {/* Planks Goal (Seconds) */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Planks Goal (Isometric Hold)</span>
              <span className="text-xs text-zinc-400">{Math.round(dailyPlankSeconds / 60 * 10) / 10} min/day</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Daily Planks</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={dailyPlankSeconds || ''}
                    onChange={(e) => setDailyPlankSeconds(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 text-white rounded-xl px-3 py-2 text-sm font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">sec</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Weekly Planks</label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    step="30"
                    value={weeklyPlankSeconds || ''}
                    onChange={(e) => setWeeklyPlankSeconds(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-cyan-500 text-white rounded-xl px-3 py-2 text-sm font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferred Exercise Focus */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Primary Focus Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreferredExercise('standard_pushup')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  preferredExercise === 'standard_pushup'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400 mb-2" />
                <div>
                  <div className="text-xs font-bold leading-tight">Standard</div>
                  <div className="text-[10px] text-zinc-500">90° Elbow break</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreferredExercise('raw_pushup')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  preferredExercise === 'raw_pushup'
                    ? 'bg-amber-950/40 border-amber-500 text-white'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400 mb-2" />
                <div>
                  <div className="text-xs font-bold leading-tight">Raw Push-up</div>
                  <div className="text-[10px] text-zinc-500">Chest to deck</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreferredExercise('plank')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  preferredExercise === 'plank'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-400 mb-2" />
                <div>
                  <div className="text-xs font-bold leading-tight">Planks</div>
                  <div className="text-[10px] text-zinc-500">Core isometric</div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Goals Saved!</span>
                </>
              ) : (
                <span>Confirm Goals</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
