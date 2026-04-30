import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import ProgressStepper from './ProgressStepper';

interface StepLayoutProps {
  children: ReactNode;
}

const ROUTE_TO_STEP: Record<string, number> = {
  '/layout': 1,
  '/theme': 2,
  '/capture': 3,
  '/review': 4,
  '/customize': 5,
  '/export': 6,
};

export default function StepLayout({ children }: StepLayoutProps) {
  const location = useLocation();
  const currentStep = ROUTE_TO_STEP[location.pathname] ?? 1;

  return (
    <div className="min-h-screen text-white flex flex-col">
      <ProgressStepper currentStep={currentStep} />

      {/* Step content area */}
      <div className="flex-1 animate-fade-slide-in">
        {children}
      </div>
    </div>
  );
}
