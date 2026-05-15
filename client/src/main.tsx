import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { InventoryListPage } from './pages/InventoryListPage';
import { WineDetailPage } from './pages/WineDetailPage';
import { AddWinePage } from './pages/AddWinePage';
import { EditWinePage } from './pages/EditWinePage';
import { HistoryPage } from './pages/HistoryPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <InventoryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wines/:id"
            element={
              <ProtectedRoute>
                <WineDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wines/add"
            element={
              <ProtectedRoute>
                <AddWinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wines/:id/edit"
            element={
              <ProtectedRoute>
                <EditWinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
