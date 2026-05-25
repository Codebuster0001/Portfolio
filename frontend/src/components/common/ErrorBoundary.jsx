import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Premium dark-mode fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background glowing sphere */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Animated Warning Icon */}
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                An unexpected rendering error occurred in this view. We've captured the diagnostics.
              </p>

              {/* Collapsible details (useful for developer debugging) */}
              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <div className="text-left bg-black/50 border border-neutral-800 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto text-xs font-mono text-red-400/90 scrollbar-thin">
                  <div className="font-semibold text-neutral-300 mb-1">{this.state.error.toString()}</div>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReload}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-md text-sm cursor-pointer"
                >
                  Reload Page
                </button>
                <a
                  href="/"
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold py-3 px-4 rounded-xl transition duration-200 text-sm block text-center"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
