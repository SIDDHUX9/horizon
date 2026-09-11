import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Horizon Protocol view:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-16 p-8 rounded-3xl bg-white border border-rose-200 shadow-xl space-y-6 text-center animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#11161a]">View Encountered an Error</h2>
            <p className="text-xs text-[#525f6c] leading-relaxed">
              A state deserialization error occurred while rendering this page. You can recover immediately by clearing cached browser state and reloading.
            </p>
          </div>
          {this.state.error && (
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-left font-mono text-xs text-rose-800 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-full bg-[#11161a] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State & Reload App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
