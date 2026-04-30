import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
