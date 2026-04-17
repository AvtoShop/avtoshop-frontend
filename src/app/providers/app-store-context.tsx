import { createContext, useState, type PropsWithChildren } from 'react';
import { AppStore } from '../store/app-store';

export const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => new AppStore());

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}
