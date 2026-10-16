import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { ProjectStudioPage } from './pages/ProjectStudioPage';
import { AuthModal } from './components/AuthModal';

export function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'studio'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="w-screen h-screen font-sans antialiased text-[#1C2028]">
        {currentView === 'landing' ? (
          <LandingPage
            onStartDesigning={() => setCurrentView('studio')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : (
          <ProjectStudioPage
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
