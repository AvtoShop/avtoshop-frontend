import { useEffect, useState } from 'react';
import { HomePageViewModel } from './home-page-view-model';

export const useHomePageViewModel = () => {
  const [viewModel] = useState(() => new HomePageViewModel());

  useEffect(() => {
    void viewModel.load();
  }, [viewModel]);

  return viewModel;
};
