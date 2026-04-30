import { useNavigate } from 'react-router-dom';
import FilmStripDecor from '../shared/FilmStripDecor';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      data-testid="landing-page"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Film strip decorations */}
      <FilmStripDecor side="left" />
      <FilmStripDecor side="right" />

      {/* Center content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4">
        {/* Logo with pulsing glow */}
        <div className="relative mb-6">
          <div className="logo-glow absolute inset-0 rounded-full blur-2xl opacity-50" />
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent drop-shadow-lg">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-4 drop-shadow-[0_2px_10px_rgba(244,162,97,0.3)]">
          SnapCandy
        </h1>

        {/* Tagline */}
        <p className="font-body text-lg md:text-xl text-white/70 max-w-md mb-3 leading-relaxed">
          Sweet moments, perfectly captured.
        </p>

        {/* Subtitle */}
        <p className="text-xs tracking-widest uppercase text-white/40 mb-10">
          Free · Runs in your browser · No install
        </p>

        {/* START button */}
        <button
          onClick={() => navigate('/layout')}
          className="group flex items-center gap-3 rounded-full bg-accent px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-dark-teal cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:scale-110">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          START
        </button>
      </div>

      {/* Inline styles for the pulsing glow animation */}
      <style>{`
        .logo-glow {
          background: radial-gradient(circle, rgba(244,162,97,0.5) 0%, transparent 70%);
          width: 120px;
          height: 120px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulseGlow 3s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}
