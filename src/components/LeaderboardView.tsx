import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  UserPlus,
  Share2,
  Medal,
  Check,
  Search,
  Sparkles,
  Shield,
  Activity,
  X
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { ExerciseType, LeaderboardUser } from '../types';

export const LeaderboardView: React.FC = () => {
  const { friends, addFriend, profile } = useWorkout();

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'all'>('today');
  const [exerciseFilter, setExerciseFilter] = useState<'all' | ExerciseType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);

  // Add friend state
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendAvatar, setNewFriendAvatar] = useState('⚡');
  const [newFriendScore, setNewFriendScore] = useState(50);

  // Filtered and sorted leaderboard
  const sortedLeaderboard = useMemo(() => {
    let list = [...friends];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.username.toLowerCase().includes(q));
    }

    // Sort by metric based on timeframe and exercise filter
    list.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (exerciseFilter === 'raw_pushup') {
        scoreA = a.rawPushups;
        scoreB = b.rawPushups;
      } else if (exerciseFilter === 'standard_pushup') {
        scoreA = a.standardPushups;
        scoreB = b.standardPushups;
      } else if (exerciseFilter === 'plank') {
        scoreA = a.plankSeconds;
        scoreB = b.plankSeconds;
      } else {
        if (timeframe === 'today') {
          scoreA = a.dailyReps;
          scoreB = b.dailyReps;
        } else if (timeframe === 'week') {
          scoreA = a.weeklyReps;
          scoreB = b.weeklyReps;
        } else {
          scoreA = a.totalReps;
          scoreB = b.totalReps;
        }
      }

      return scoreB - scoreA;
    });

    return list;
  }, [friends, timeframe, exerciseFilter, searchQuery]);

  // Current user's rank position
  const currentUserRank = useMemo(() => {
    const idx = sortedLeaderboard.findIndex(f => f.isCurrentUser);
    return idx !== -1 ? idx + 1 : 1;
  }, [sortedLeaderboard]);

  const handleShareChallenge = () => {
    const text = `🏆 I'm currently Rank #${currentUserRank} on PushUp Hero with username @${profile.username}! Can you beat my push-up score? Join the daily battle!`;
    navigator.clipboard.writeText(text);
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2500);
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    addFriend({
      username: newFriendName.trim(),
      avatar: newFriendAvatar,
      dailyReps: Number(newFriendScore) || 30,
      weeklyReps: (Number(newFriendScore) || 30) * 6,
      plankSeconds: 120,
    });

    setNewFriendName('');
    setIsAddFriendOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-yellow-950/20 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              Community Ranks
            </span>
            <span className="text-xs text-zinc-400">Live Peer Standings</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
            Leaderboard & Friends
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Compare daily and weekly push-up volume with friends. Every rep you complete moves you higher!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddFriendOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Add Friend</span>
          </button>

          <button
            onClick={handleShareChallenge}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            {challengeCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Challenge Friends</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Your Current Rank Spotlight */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-heading font-black text-xl flex items-center justify-center">
            #{currentUserRank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Your Current Position</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded bg-amber-500 text-zinc-950">YOU</span>
            </div>
            <p className="text-xs text-zinc-400">
              {currentUserRank === 1 ? "You are at the top of the leaderboard! Defend your crown." : `You are #${currentUserRank} out of ${sortedLeaderboard.length} athletes. Keep pushing to take the lead!`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters: Timeframe & Exercise */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
        {/* Timeframe switch */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              timeframe === 'today' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              timeframe === 'week' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              timeframe === 'all' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Exercise Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setExerciseFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              exerciseFilter === 'all'
                ? 'bg-zinc-800 text-white border-zinc-700 font-bold'
                : 'text-zinc-400 border-transparent hover:bg-zinc-850'
            }`}
          >
            All Reps
          </button>
          <button
            onClick={() => setExerciseFilter('raw_pushup')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
              exerciseFilter === 'raw_pushup'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold'
                : 'text-zinc-400 border-transparent hover:bg-zinc-850'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            Raw
          </button>
          <button
            onClick={() => setExerciseFilter('standard_pushup')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
              exerciseFilter === 'standard_pushup'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                : 'text-zinc-400 border-transparent hover:bg-zinc-850'
            }`}
          >
            <Shield className="w-3 h-3 text-emerald-400" />
            Standard
          </button>
          <button
            onClick={() => setExerciseFilter('plank')}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
              exerciseFilter === 'plank'
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 font-bold'
                : 'text-zinc-400 border-transparent hover:bg-zinc-850'
            }`}
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            Planks
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="divide-y divide-zinc-800">
          {sortedLeaderboard.map((user, index) => {
            const rankNum = index + 1;
            const isTop3 = rankNum <= 3;
            const isMe = user.isCurrentUser;

            // Display score depending on filter
            let displayScore = 0;
            let displayUnit = 'reps';

            if (exerciseFilter === 'raw_pushup') {
              displayScore = user.rawPushups;
              displayUnit = 'raw reps';
            } else if (exerciseFilter === 'standard_pushup') {
              displayScore = user.standardPushups;
              displayUnit = 'standard';
            } else if (exerciseFilter === 'plank') {
              displayScore = user.plankSeconds;
              displayUnit = 'sec plank';
            } else {
              if (timeframe === 'today') {
                displayScore = user.dailyReps;
                displayUnit = 'reps today';
              } else if (timeframe === 'week') {
                displayScore = user.weeklyReps;
                displayUnit = 'reps this week';
              } else {
                displayScore = user.totalReps;
                displayUnit = 'total reps';
              }
            }

            return (
              <div
                key={user.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all ${
                  isMe
                    ? 'bg-amber-500/10 border-l-4 border-amber-500'
                    : 'hover:bg-zinc-850/50'
                }`}
              >
                {/* Left: Rank & Avatar & User Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Rank Badge */}
                  <div className="w-8 sm:w-10 text-center font-heading font-black">
                    {rankNum === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : rankNum === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : rankNum === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-sm font-bold text-zinc-500">#{rankNum}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
                    {user.avatar}
                  </div>

                  {/* Name & Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm sm:text-base font-bold ${isMe ? 'text-amber-400 font-extrabold' : 'text-white'}`}>
                        {user.username}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-500 text-zinc-950">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="hidden sm:inline">{user.badge}</span>
                      <span className="hidden sm:inline text-zinc-600">&bull;</span>
                      <span className="flex items-center gap-1 text-orange-400 font-semibold text-[11px]">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        {user.streak}d streak
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-white font-heading">
                    {displayScore}
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {displayUnit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Friend Modal */}
      {isAddFriendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading">Add Friend to Leaderboard</h3>
              <button
                onClick={() => setIsAddFriendOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFriendSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Friend&apos;s Username
                </label>
                <input
                  type="text"
                  required
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder="e.g. Spartan_Dev"
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Avatar Icon
                </label>
                <div className="flex items-center gap-2">
                  {['🦁', '⚡', '🦅', '🦍', '🥋', '🔥'].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewFriendAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center ${
                        newFriendAvatar === emoji ? 'border-amber-400 bg-amber-500/20' : 'border-zinc-800 bg-zinc-950'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Initial Daily Push-ups
                </label>
                <input
                  type="number"
                  min="0"
                  value={newFriendScore}
                  onChange={(e) => setNewFriendScore(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFriendOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-md"
                >
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
