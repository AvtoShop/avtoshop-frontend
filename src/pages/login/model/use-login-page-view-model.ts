import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../app/providers/use-app-store';
import { LoginPageViewModel } from './login-page-view-model';

export const useLoginPageViewModel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionStore } = useAppStore();
  const redirectTo =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? ((location.state as { from: string }).from ?? '/admin')
      : '/admin';

  const [viewModel] = useState(() => new LoginPageViewModel(sessionStore, navigate, redirectTo));

  return viewModel;
};
