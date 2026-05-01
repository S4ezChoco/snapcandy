interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export default function SkeletonLoader({
  width,
  height,
  borderRadius,
  className = '',
}: SkeletonLoaderProps) {
  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }

  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  if (borderRadius !== undefined) {
    style.borderRadius = borderRadius;
  }

  return (
    <div
      data-testid="skeleton-loader"
      className={`animate-pulse bg-white/10 ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}
