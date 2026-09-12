import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { StudySessionPage } from './pages/StudySessionPage';
import { FeynmanCheckPage } from './pages/FeynmanCheckPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardData } from './types';
import { api } from './lib/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic-arrays');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setDashboardData(data);
      if (data.topics && data.topics.length > 0) {
        const firstAvailable = data.topics.find((t) => t.status === 'available' || t.status === 'in_progress');
        if (firstAvailable) {
          setSelectedTopicId(firstAvailable.id);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: string, topicIdParam?: string) => {
    if (topicIdParam) {
      setSelectedTopicId(topicIdParam);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await fetchDashboard();
      showNotification('Curriculum reset to Demo: Introduction to Data Structures');
      setCurrentPage('dashboard');
    } catch (err: any) {
      alert(`Failed to reset demo: ${err.message}`);
    }
  };

  const handleResetProgress = async () => {
    try {
      await api.resetProgress();
      await fetchDashboard();
      showNotification('Learning progress reset successfully.');
      setCurrentPage('dashboard');
    } catch (err: any) {
      alert(`Failed to reset progress: ${err.message}`);
    }
  };

  const handleCompleteRevision = async (revisionId: string) => {
    try {
      await api.completeRevision(revisionId);
      await fetchDashboard();
      showNotification('Revision marked as completed!');
    } catch (err: any) {
      console.error('Failed to complete revision:', err);
    }
  };

  const handleSelectDocument = async (documentId: string) => {
    try {
      await api.selectDocument(documentId);
      await fetchDashboard();
      showNotification('Switched active curriculum.');
    } catch (err: any) {
      console.error('Failed to select document:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        stats={dashboardData?.stats}
        onResetDemo={handleResetDemo}
      />

      {/* Ephemeral Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onStartLearning={() => setCurrentPage('dashboard')}
            onTryDemo={() => {
              handleResetDemo();
              setCurrentPage('dashboard');
            }}
          />
        )}

        {currentPage === 'dashboard' && dashboardData && (
          <DashboardPage
            data={dashboardData}
            onOpenTopic={(id) => handleNavigate('study', id)}
            onStartStudy={(id) => handleNavigate('study', id)}
            onStartFeynman={(id) => handleNavigate('feynman', id)}
            onNavigateUpload={() => handleNavigate('upload')}
            onCompleteRevision={handleCompleteRevision}
            onSelectDocument={handleSelectDocument}
          />
        )}

        {currentPage === 'upload' && (
          <UploadPage
            onUploadSuccess={() => {
              fetchDashboard();
              showNotification('PDF analyzed! Your personalized learning path is ready.');
              setCurrentPage('dashboard');
            }}
            onTryDemo={() => {
              handleResetDemo();
              setCurrentPage('dashboard');
            }}
          />
        )}

        {currentPage === 'study' && (
          <StudySessionPage
            topicId={selectedTopicId}
            onBackToDashboard={() => {
              fetchDashboard();
              setCurrentPage('dashboard');
            }}
            onStartFeynman={(id) => handleNavigate('feynman', id)}
          />
        )}

        {currentPage === 'feynman' && (
          <FeynmanCheckPage
            topicId={selectedTopicId}
            onBackToDashboard={() => {
              fetchDashboard();
              setCurrentPage('dashboard');
            }}
            onBackToStudy={(id) => handleNavigate('study', id)}
            onTopicMastered={() => {
              fetchDashboard();
              showNotification('Congratulations! Topic mastered and progress updated.');
            }}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            onResetDemo={handleResetDemo}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>
    </div>
  );
}
export default App;
