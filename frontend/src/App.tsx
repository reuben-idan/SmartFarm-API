import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/auth/LoginPage';

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="smartfarm-theme">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
