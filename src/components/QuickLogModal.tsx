import React, { useState } from 'react';
import { PlusCircle, X, Check, Flame, Shield, Activity } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseType, EXERCISES } from '../types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose }) => {
  const { logSession, goals } = useWorkout();
  const [exercise, setExercise] = useState<ExerciseType>(goals.preferredExercise || 'standard_pushup');
  const [count, setCount] = useState<number>(exercise === 'plank' ? 60 : 20);
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const isPlank = exercise === 'plank';
  const unit = isPlank ? 'seconds' : 'reps';

  const presets = isPlank ? [30, 45, 60, 90, 120] : [10, 15, 20, 25, 30, 50];

  const handleExerciseChange = (type: ExerciseType) => {
    setExercise(type);
    if (type === 'plank') {
      setCount(60);
    } else if (count > 100) {
      setCount(20);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) return;

    logSession({
      exercise,
      reps: count,
      durationSeconds: isPlank ? count : Math.round(count * 1.8),
      mode: 'quick_log',
      notes: notes.trim() || undefined,
      accuracyScore: 90
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">Quick Log Set</h2>
              <p className="text-xs text-zinc-400">Record reps directly into your daily total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Exercise Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleExerciseChange('standard_pushup')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                exercise === 'standard_pushup'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <div className="text-xs font-bold">Standard</div>
            </button>
            <button
              type="button"
              onClick={() => handleExerciseChange('raw_pushup')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                exercise === 'raw_pushup'
                  ? 'bg-amber-950/40 border-amber-500 text-white'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <Flame className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <div className="text-xs font-bold">Raw Power</div>
            </button>
            <button
              type="button"
              onClick={() => handleExerciseChange('plank')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                exercise === 'plank'
                  ? 'bg-cyan-950/40 border-cyan-500 text-white'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <Activity className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <div className="text-xs font-bold">Plank</div>
            </button>
          </div>

          {/* Reps/Seconds input & presets */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 block">
              {isPlank ? 'Hold Time (Seconds)' : 'Completed Reps'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="5000"
                value={count || ''}
                onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-2xl font-black outline-none text-center"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 uppercase">
                {unit}
              </span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setCount(val)}
                  className={`px-3 py-1 text-xs rounded-lg border font-semibold transition-all ${
                    count === val
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Explosive morning set, felt great!"
              className="w-full bg-zinc-950 border border-zinc-750 focus:border-zinc-500 text-white rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Logged!</span>
                </>
              ) : (
                <span>Add to Daily Goal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
