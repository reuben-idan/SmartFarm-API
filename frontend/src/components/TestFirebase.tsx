import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAx4cWyRyQc762CWg8nbuEEL7kecOpu38w",
  authDomain: "smartfarm-api-e7b4d.firebaseapp.com",
  projectId: "smartfarm-api-e7b4d",
  storageBucket: "smartfarm-api-e7b4d.firebasestorage.app",
  messagingSenderId: "713358372669",
  appId: "1:713358372669:web:27c0f7b527db9f98615f54"
};

// Initialize Firebase
let app;
let auth;

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export default function TestFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setError('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('Auth state changed:', user);
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Set a timeout in case the listener doesn't fire
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth state check timed out');
        setLoading(false);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [loading]);

  if (loading) {
    return <div className="text-muted-foreground">Loading auth state...</div>;
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">Authentication Status:</p>
        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              user ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          <span>{user ? 'Authenticated' : 'Not Authenticated'}</span>
        </div>
      </div>

      {user && (
        <div className="space-y-2">
          <p className="font-medium">User Info:</p>
          <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(
              {
                email: user.email,
                uid: user.uid,
                emailVerified: user.emailVerified,
                providerData: user?.providerData?.map((p: any) => ({
                  providerId: p.providerId,
                  email: p.email,
                })),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Refresh Auth State
        </Button>
      </div>
    </div>
  );
}
