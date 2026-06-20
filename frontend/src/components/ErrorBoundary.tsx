import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#19181c] text-slate-300">
          <div className="glass-card max-w-md w-full p-8 text-center border-red-500/20">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-6">
              A critical error occurred while rendering this page.
            </p>
            {this.state.error && (
              <div className="bg-black/40 rounded-lg p-3 text-left overflow-x-auto mb-6 text-xs font-mono text-red-300/80 border border-red-500/10">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
