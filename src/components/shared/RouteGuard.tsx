import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePhotoboothStore } from '../../store/usePhotoboothStore';

interface RouteGuardProps {
  children: ReactNode;
  route: string;
}

export default function RouteGuard({ children, route }: RouteGuardProps) {
  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedTheme = usePhotoboothStore((s) => s.selectedTheme);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);

  switch (route) {
    case '/theme':
      if (!selectedLayout) return <Navigate to="/" replace />;
      break;

    case '/capture':
      if (!selectedTheme) return <Navigate to="/" replace />;
      break;

    case '/review':
      if (capturedPhotos.length === 0) return <Navigate to="/" replace />;
      break;

    case '/customize':
      if (
        !selectedLayout ||
        capturedPhotos.length !== selectedLayout.photoCount
      ) {
        return <Navigate to="/" replace />;
      }
      break;

    case '/export':
      if (
        capturedPhotos.length === 0 ||
        !selectedLayout ||
        !selectedTheme
      ) {
        return <Navigate to="/" replace />;
      }
      break;
  }

  return <>{children}</>;
}
