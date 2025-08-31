import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import DashboardPage from '@/pages/dashboard/dashboard';
import { useFirebaseAuth, FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { UserProfileProvider, useUserProfile } from '@/contexts/UserProfileContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'sonner';
import { SettingsLayout } from '@/pages/settings/SettingsLayout';
import ProfileSettings from '@/pages/settings/ProfileSettingsPage';
import SecuritySettings from '@/pages/settings/SecuritySettings';
import NotificationsSettings from '@/pages/settings/NotificationsSettings';
import AppearanceSettings from '@/pages/settings/AppearanceSettings';
import LanguageSettings from '@/pages/settings/LanguageSettings';
import FarmersPage from '@/pages/farmers/FarmersPage';
import CropsPage from '@/pages/crops/CropsPage';
import SuppliersPage from '@/pages/suppliers/SuppliersPage';
import MarketPricesPage from '@/pages/market-prices/MarketPricesPage';
import RecommendationsPage from '@/pages/recommendations/RecommendationsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import CalendarPage from '@/pages/calendar/CalendarPage';
import ProfilePage from '@/pages/profile/ProfilePage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useFirebaseAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
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
    <ErrorBoundary fallback={<GlobalErrorFallback />}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <FirebaseAuthProvider>
          <UserProfileProvider>
            <WebSocketProvider>
              <Toaster position="top-right" />
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
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="farmers" element={<FarmersPage />} />
                  <Route path="crops" element={<CropsPage />} />
                  <Route path="suppliers" element={<SuppliersPage />} />
                  <Route path="prices" element={<MarketPricesPage />} />
                  <Route path="recommendations" element={<RecommendationsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsLayout />}>
                    <Route index element={<Navigate to="profile" replace />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                    <Route path="notifications" element={<NotificationsSettings />} />
                    <Route path="appearance" element={<AppearanceSettings />} />
                    <Route path="language" element={<LanguageSettings />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </WebSocketProvider>
          </UserProfileProvider>
        </FirebaseAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
