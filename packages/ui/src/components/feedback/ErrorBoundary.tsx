import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in component [${this.props.name || "Unknown"}]:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 border border-border dark:border-gray-800 rounded-card text-center shadow-card select-none my-4">
          <span className="p-3 bg-danger/10 text-danger rounded-full mb-3">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h4 className="font-extrabold text-sm text-primaryText dark:text-white mb-1.5 uppercase tracking-wider">
            System Error Occurred
          </h4>
          <p className="text-xs text-muted max-w-xs mb-4.5 leading-relaxed">
            The {this.props.name ? `"${this.props.name}" component` : "application module"} encountered a processing error and could not be loaded.
          </p>
          <button
            onClick={this.handleReset}
            className="h-8.5 px-4 rounded border border-border hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-805 text-secondaryText hover:text-primaryText font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
