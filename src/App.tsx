import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import LayoutSelector from './components/layout/LayoutSelector';
import ThemeSelector from './components/theme/ThemeSelector';
import CameraScreen from './components/capture/CameraScreen';
import ReviewScreen from './components/review/ReviewScreen';
import CustomizeScreen from './components/customize/CustomizeScreen';
import ExportScreen from './components/export/ExportScreen';
import StepLayout from './components/shared/StepLayout';
import RouteGuard from './components/shared/RouteGuard';
import SparkleOverlay from './components/shared/SparkleOverlay';
import CursorTrailOverlay from './components/shared/CursorTrailOverlay';
import ToastContainer from './components/shared/ToastContainer';
import SkeletonLoader from './components/shared/SkeletonLoader';
import { useSessionPersistence, clearSession } from './hooks/useSessionPersistence';

/** Maps a step number (1-6) to its corresponding route path. */
const STEP_TO_ROUTE: Record<number, string> = {
  1: '/layout',
  2: '/theme',
  3: '/capture',
  4: '/review',
  5: '/customize',
  6: '/export',
};

function App() {
  const navigate = useNavigate();
  const { restoredStep, hadPhotos, isRestoring } = useSessionPersistence();
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Navigate to restored step on session recovery
  useEffect(() => {
    if (hasNavigated || restoredStep === null) return;

    if (hadPhotos) {
      // Photos can't be restored — show recovery prompt instead of navigating
      setShowRecoveryPrompt(true);
    } else {
      const route = STEP_TO_ROUTE[restoredStep];
      if (route) {
        navigate(route, { replace: true });
      }
    }
    setHasNavigated(true);
  }, [restoredStep, hadPhotos, navigate, hasNavigated]);

  const handleContinueFromCapture = useCallback(() => {
    setShowRecoveryPrompt(false);
    navigate('/capture', { replace: true });
  }, [navigate]);

  const handleStartFresh = useCallback(() => {
    setShowRecoveryPrompt(false);
    clearSession();
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <>
    {/* Session recovery prompt */}
    {showRecoveryPrompt && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        data-testid="recovery-prompt-overlay"
      >
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4 shadow-xl text-center">
          <div className="flex justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Session Recovered
          </h2>
          <p className="text-sm text-white/70 mb-6">
            We found a previous session, but your photos couldn't be restored. You can continue from the capture step or start fresh.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleContinueFromCapture}
              className="w-full rounded-full px-6 py-3 text-sm font-semibold bg-accent text-white shadow-lg shadow-accent/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/40 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/60"
              data-testid="recovery-continue-btn"
            >
              Continue from Capture
            </button>
            <button
              type="button"
              onClick={handleStartFresh}
              className="w-full rounded-full px-6 py-3 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
              data-testid="recovery-start-fresh-btn"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Session restoration skeleton */}
    {isRestoring && (
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[#0a0a0f]"
        data-testid="session-restore-skeleton"
        aria-label="Restoring session"
      >
        <SkeletonLoader width="60%" height="2rem" borderRadius="0.5rem" />
        <SkeletonLoader width="80%" height="20rem" borderRadius="1rem" />
        <div className="flex gap-4">
          <SkeletonLoader width="7.5rem" height="2.5rem" borderRadius="9999px" />
          <SkeletonLoader width="7.5rem" height="2.5rem" borderRadius="9999px" />
        </div>
      </div>
    )}

    {/* Responsive message for viewports below 768px */}
    <div className="small-viewport-message">
      <div>
        <div className="icon" style={{display:'flex',justifyContent:'center'}}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <p>
          For the best <span className="accent">SnapCandy</span> experience, please switch to a screen that is at least <span className="accent">768px</span> wide.
        </p>
      </div>
    </div>

    <div className="app-content">
    <SparkleOverlay />
    <CursorTrailOverlay />
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/layout"
        element={
          <StepLayout>
            <LayoutSelector />
          </StepLayout>
        }
      />

      <Route
        path="/theme"
        element={
          <RouteGuard route="/theme">
            <StepLayout>
              <ThemeSelector />
            </StepLayout>
          </RouteGuard>
        }
      />

      <Route
        path="/capture"
        element={
          <RouteGuard route="/capture">
            <StepLayout>
              <CameraScreen />
            </StepLayout>
          </RouteGuard>
        }
      />

      <Route
        path="/review"
        element={
          <RouteGuard route="/review">
            <StepLayout>
              <ReviewScreen />
            </StepLayout>
          </RouteGuard>
        }
      />

      <Route
        path="/customize"
        element={
          <RouteGuard route="/customize">
            <StepLayout>
              <CustomizeScreen />
            </StepLayout>
          </RouteGuard>
        }
      />

      <Route
        path="/export"
        element={
          <RouteGuard route="/export">
            <StepLayout>
              <ExportScreen />
            </StepLayout>
          </RouteGuard>
        }
      />
    </Routes>
    </div>
    <ToastContainer />
    </>
  );
}

export default App;
