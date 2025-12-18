/**
 * Error Boundary component for graceful error handling.
 * Catches JavaScript errors in child components and displays a fallback UI.
 */
import { Component, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { AlertCircleIcon } from "./icons";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// ============== Default Fallback UI ==============

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div
        className={cn(
          "max-w-md w-full text-center",
          "bg-white rounded-2xl border border-slate-200",
          "shadow-lg p-8"
        )}
      >
        <div
          className={cn(
            "inline-flex items-center justify-center",
            "w-16 h-16 rounded-full",
            "bg-red-100 text-red-600 mb-4"
          )}
        >
          <AlertCircleIcon size={32} />
        </div>

        <h2 className="text-xl font-semibold text-content mb-2">
          Something went wrong
        </h2>

        <p className="text-content-secondary mb-4">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          {onReset && (
            <Button variant="primary" onClick={onReset}>
              Try Again
            </Button>
          )}
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && error?.stack && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-content-tertiary cursor-pointer hover:text-content-secondary">
              Error details
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-slate-100 text-xs text-content-secondary overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

