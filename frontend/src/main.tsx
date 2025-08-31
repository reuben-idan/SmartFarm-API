import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FirebaseAuthProvider } from '@/contexts/FirebaseAuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <FirebaseAuthProvider>
          <AuthProvider>
            <UserProfileProvider>
              <App />
            </UserProfileProvider>
          </AuthProvider>
        </FirebaseAuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
