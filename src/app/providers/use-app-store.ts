import { useContext } from 'react';
import { AppStoreContext } from './app-store-context';

export const useAppStore = () => {
  const store = useContext(AppStoreContext);

  if (!store) {
    throw new Error('AppStoreProvider is missing.');
  }

  return store;
};
