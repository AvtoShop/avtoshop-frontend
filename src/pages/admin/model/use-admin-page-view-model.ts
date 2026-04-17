import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../app/providers/use-app-store';
import { AdminPageViewModel } from './admin-page-view-model';

export const useAdminPageViewModel = () => {
  const navigate = useNavigate();
  const { sessionStore } = useAppStore();
  const [viewModel] = useState(() => new AdminPageViewModel(sessionStore, navigate));

  useEffect(() => {
    void viewModel.load();
  }, [viewModel]);

  return viewModel;
};
