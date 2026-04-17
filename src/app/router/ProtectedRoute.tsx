import { observer } from 'mobx-react-lite';
import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../providers/use-app-store';

export const ProtectedRoute = observer(({ children }: PropsWithChildren) => {
  const location = useLocation();
  const { sessionStore } = useAppStore();

  if (!sessionStore.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
});
