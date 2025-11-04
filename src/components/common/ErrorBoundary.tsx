import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-neutral-950 text-white p-8">
            <div className="max-w-md text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-800/30 animate-pulse-slow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="white"
                    className="w-10 h-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m0 3.75h.007v.008H12v-.008zm9.75-3.75a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-light tracking-wide mb-3">
                Une erreur est survenue
              </h2>
              <p className="text-neutral-400 mb-6">
                Il semble qu’un problème soit survenu. Vous pouvez essayer de
                recharger la page pour continuer.
              </p>

              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 hover:from-red-400 hover:to-pink-500 transition-all shadow-lg shadow-pink-800/30 text-white font-medium"
              >
                🔄 Recharger la page
              </button>

              <p className="mt-8 text-sm text-neutral-600">
                Si le problème persiste, contactez le support technique.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
