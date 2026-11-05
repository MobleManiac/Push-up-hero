import React, { useState } from 'react';
import { User, X, Check, Award, Flame, Shield, Calendar } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { getRankTier } from '../utils/motivation';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🦾', '⚡', '🦁', '🛡️', '🥋', '🦅', '🔥', '🏆', '💎', '🐺', '🦍', '⚔️'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateUsername, totalPushups, totalPlankSeconds, currentStreak, bestStreak } = useWorkout();
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const rank = getRankTier(totalPushups);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUsername(username, selectedAvatar);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">Athlete Profile</h2>
              <p className="text-xs text-zinc-400">Set your username and athletic avatar</p>
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
          {/* Rank Badge Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl shadow-inner">
              {selectedAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {rank.title}
                </span>
                <span className="text-sm">{rank.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{username || 'Athlete'}</h3>
              <p className="text-[11px] text-zinc-400">Lifetime Reps: {totalPushups} &bull; Streak: {currentStreak}d</p>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Username (displayed on Leaderboard)
            </label>
            <input
              type="text"
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold outline-none transition-all"
              required
            />
            <p className="text-[11px] text-zinc-500">
              Friends and rivals will see this name on the leaderboard.
            </p>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Choose Athletic Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === emoji
                      ? 'bg-amber-500/20 border-2 border-amber-400 scale-105 shadow-md'
                      : 'bg-zinc-950 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Reps</span>
              <span className="text-base font-bold text-white">{totalPushups}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Best Streak</span>
              <span className="text-base font-bold text-orange-400">{bestStreak}d</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Plank Total</span>
              <span className="text-base font-bold text-cyan-400">{Math.round(totalPlankSeconds / 60)}m</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
