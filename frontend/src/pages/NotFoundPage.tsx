import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
