import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/toast';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Global error boundary fallback
const GlobalErrorFallback = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
    <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
    <p className="mt-2 text-muted-foreground">
      An unexpected error occurred. Please try refreshing the page.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
    >
      Refresh Page
    </button>
  </div>
);

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ErrorBoundary fallback={<GlobalErrorFallback />}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                  </Route>
                </Routes>
              </Router>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
