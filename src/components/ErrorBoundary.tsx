"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-[#FBFBFB]">
          <div className="w-full max-w-md bg-white border border-[#E1E4EA] rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <i className="pi pi-exclamation-triangle text-[#DC2626] text-6xl"></i>
              </div>
              <h3 className="text-[20px] font-bold text-[#111827] mb-3">
                Something went wrong
              </h3>
              <p className="text-[13px] text-[#525866] mb-6 leading-relaxed">
                An unexpected error occurred. Please try refreshing the page or go back home.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
                >
                  <i className="pi pi-refresh text-sm" />
                  Refresh Page
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-4 py-2 border border-[#E1E4EA] text-[#525866] rounded-lg text-[13px] font-semibold hover:bg-[#F9FAFB] transition-colors flex items-center gap-2"
                >
                  <i className="pi pi-home text-sm" />
                  Go Home
                </button>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-[12px] text-[#2563EB] font-semibold hover:underline">
                    Error Details (Development)
                  </summary>
                  <pre className="text-[11px] text-[#DC2626] mt-3 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg overflow-auto max-h-48 font-mono">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}