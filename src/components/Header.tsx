import React from 'react';
import { Flame, Target, User, Video, LayoutDashboard, Trophy, LineChart } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { getRankTier } from '../utils/motivation';

interface HeaderProps {
  activeTab: 'dashboard' | 'camera' | 'leaderboard' | 'insights';
  setActiveTab: (tab: 'dashboard' | 'camera' | 'leaderboard' | 'insights') => void;
  onOpenGoalModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGoalModal,
  onOpenProfileModal
}) => {
  const { profile, goals, todayPushups, currentStreak, totalPushups } = useWorkout();
  const rank = getRankTier(totalPushups);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 text-zinc-950 fill-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white">
                  PUSHUP<span className="text-amber-500">HERO</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  AI Vision
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Smart Reps &bull; Daily Streak &bull; Social Rank
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'camera'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Video className="w-4 h-4 text-emerald-400" />
              Vision Workout
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'insights'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <LineChart className="w-4 h-4 text-cyan-400" />
              Insights
            </button>
          </nav>

          {/* User Controls: Streaks & Goals & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                currentStreak > 0
                  ? 'bg-orange-950/40 border-orange-500/40 text-orange-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={`${currentStreak} day consecutive workout streak!`}
            >
              <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-600'}`} />
              <span>{currentStreak}d</span>
            </div>

            {/* Quick Goal Trigger */}
            <button
              onClick={onOpenGoalModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
              title="Click to change your daily or weekly push-up goal"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Goal: <strong className="text-white font-semibold">{todayPushups}/{goals.dailyPushups}</strong></span>
            </button>

            {/* Profile Pill */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-all hover:border-zinc-700"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-sm border border-zinc-700">
                {profile.avatar || '🦾'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-none truncate max-w-[90px]">
                  {profile.username}
                </div>
                <div className="text-[10px] text-zinc-400 leading-tight">
                  {rank.title}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs (Bottom / Secondary Bar) */}
      <div className="md:hidden flex items-center justify-around bg-zinc-900/90 border-t border-zinc-800/80 px-2 py-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-all relative ${
            activeTab === 'camera' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <div className="relative">
            <Video className="w-4 h-4 text-emerald-400" />
            <span className="animate-ping absolute -top-0.5 -right-0.5 inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          </div>
          <span>Vision</span>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'leaderboard' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>Ranks</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-medium transition-all ${
            activeTab === 'insights' ? 'text-amber-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <LineChart className="w-4 h-4 text-cyan-400" />
          <span>Insights</span>
        </button>
      </div>
    </header>
  );
};
