import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStoreProvider } from './providers/app-store-context';
import { ProtectedRoute } from './router/ProtectedRoute';
import { ScrollToHash } from './router/ScrollToHash';
import { Footer } from '../shared/ui/Footer';
import { Header } from '../shared/ui/Header';
import { PageShell } from '../shared/ui/kit';

const HomePage = lazy(() => import('../pages/home/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));

function AppRoutes() {
  return (
    <PageShell header={<Header />} footer={<Footer />}>
      <Suspense fallback={<main className="px-5 py-12 text-sm text-muted">Загружаем страницу...</main>}>
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
      </Suspense>
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
