interface FilmStripDecorProps {
  side: 'left' | 'right';
  className?: string;
}

export default function FilmStripDecor({ side, className = '' }: FilmStripDecorProps) {
  const perforationCount = 12;

  return (
    <div
      data-testid={`film-strip-${side}`}
      className={[
        'pointer-events-none select-none',
        'fixed top-0 bottom-0 z-10 flex flex-col items-center',
        side === 'left' ? 'left-0' : 'right-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {/* Film strip body */}
      <div className="h-full w-8 bg-gray-900/80 flex flex-col items-center justify-between py-4">
        {Array.from({ length: perforationCount }, (_, i) => (
          <div
            key={i}
            className="w-4 h-3 rounded-sm bg-gray-700/60 shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
