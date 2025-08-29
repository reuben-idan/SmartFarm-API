import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            Something went wrong!
          </h2>
          <p className="mt-2 text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={this.handleReset}
            icon={<RefreshCw className="mr-2 h-4 w-4" />}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
/*
<ErrorBoundary 
  fallback={
    <div className="p-4 text-center">
      <p>Failed to load dashboard. Please try again later.</p>
      <Button onClick={() => window.location.reload()} className="mt-2">
        Reload Page
      </Button>
    </div>
  }
>
  <Dashboard />
</ErrorBoundary>
*/
