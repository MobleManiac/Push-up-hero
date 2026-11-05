import React, { useState } from 'react';
import { WorkoutProvider } from './context/WorkoutContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CameraWorkout } from './components/CameraWorkout';
import { LeaderboardView } from './components/LeaderboardView';
import { InsightsView } from './components/InsightsView';
import { GoalModal } from './components/GoalModal';
import { ProfileModal } from './components/ProfileModal';
import { QuickLogModal } from './components/QuickLogModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'camera' | 'leaderboard' | 'insights'>('dashboard');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onStartCamera={() => setActiveTab('camera')}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
            onOpenGoals={() => setIsGoalModalOpen(true)}
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
          />
        )}

        {activeTab === 'camera' && (
          <CameraWorkout onFinishWorkout={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView />}

        {activeTab === 'insights' && <InsightsView />}
      </main>

      {/* Floating Action / Quick Goal bar on mobile */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-600">
        <p>
          PushUp Hero &bull; Vision-Powered Push-up & Plank Tracker &bull; Built for Daily Consistency
        </p>
      </footer>

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}
