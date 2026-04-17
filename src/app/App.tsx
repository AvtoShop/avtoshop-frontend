import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStoreProvider } from './providers/app-store-context';
import { ProtectedRoute } from './router/ProtectedRoute';
import { ScrollToHash } from './router/ScrollToHash';
import HomePage from '../pages/home/page';
import LoginPage from '../pages/login/page';
import AdminPage from '../pages/admin/page';
import { Footer } from '../shared/ui/Footer';
import { Header } from '../shared/ui/Header';
import { PageShell } from '../shared/ui/kit';

function AppRoutes() {
  return (
    <PageShell header={<Header />} footer={<Footer />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </PageShell>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <ScrollToHash />
        <AppRoutes />
        <Analytics />
      </BrowserRouter>
    </AppStoreProvider>
  );
}
