interface ProgressStepperProps {
  currentStep: number; // 1-6
}

const STEP_LABELS = [
  'Layout',
  'Theme',
  'Take Photos',
  'Review',
  'Customize',
  'Your Strip',
];

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <nav
      data-testid="progress-stepper"
      aria-label="Progress"
      className="w-full px-4 py-3"
    >
      <div className="max-w-2xl mx-auto">
        {/* Pill-shaped container */}
        <div className="bg-gray-900/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5 flex items-center">
          {STEP_LABELS.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <div key={stepNum} className="flex items-center flex-1 last:flex-none">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  <div
                    data-testid={`step-indicator-${stepNum}`}
                    data-status={
                      isCompleted ? 'completed' : isActive ? 'active' : 'upcoming'
                    }
                    className={[
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors duration-200',
                      isCompleted
                        ? 'bg-accent text-dark-teal'
                        : isActive
                          ? 'bg-accent text-dark-teal'
                          : 'bg-gray-700/60 text-gray-400',
                    ].join(' ')}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>

                  {/* Label shown only for active step */}
                  {isActive && (
                    <span className="text-xs font-medium text-white whitespace-nowrap hidden sm:inline">
                      {label}
                    </span>
                  )}
                </div>

                {/* Connecting line (not after last step) */}
                {stepNum < 6 && (
                  <div
                    data-testid={`step-line-${stepNum}`}
                    className={[
                      'flex-1 h-px mx-2 transition-colors duration-200',
                      isCompleted ? 'bg-accent' : 'bg-gray-700/60',
                    ].join(' ')}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
