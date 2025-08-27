import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './lib/auth/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { DashboardPage } from './pages/dashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="smartfarm-theme">
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              
              <Toaster position="top-right" richColors />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
