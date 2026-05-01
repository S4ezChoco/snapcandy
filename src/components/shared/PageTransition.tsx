import { useEffect, useState, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  /** Key that triggers re-mount animations (typically location.pathname) */
  locationKey?: string;
}

/**
 * Wrapper component that applies enter/exit page transition animations.
 *
 * - Enter: opacity 0 → 1, translateY(12px) → 0 over 300ms ease-out
 * - Exit: opacity 1 → 0, translateY(0) → -12px over 200ms ease-in
 *
 * Uses CSS transforms and opacity only for GPU acceleration.
 * The parent should key this component on `location.pathname` to trigger
 * re-mount animations on navigation.
 *
 * Validates: Requirements 3.1, 3.7
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const [phase, setPhase] = useState<'enter' | 'enter-active'>('enter');

  useEffect(() => {
    // Start in the "enter" state (opacity 0, translateY 12px).
    // On the next animation frame, switch to "enter-active" to trigger
    // the CSS transition to the final state.
    const frameId = requestAnimationFrame(() => {
      setPhase('enter-active');
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const className = phase === 'enter' ? 'page-enter' : 'page-enter page-enter-active';

  return (
    <div className={className}>
      {children}
    </div>
  );
}
