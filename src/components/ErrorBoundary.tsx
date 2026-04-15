"use client";

import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

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
        <div className="flex align-items-center justify-content-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <div className="text-center">
              <i className="pi pi-exclamation-triangle text-red-500 text-6xl mb-4"></i>
              <h3 className="text-900 mb-3">Something went wrong</h3>
              <p className="text-600 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <div className="flex gap-2 justify-content-center">
                <Button
                  label="Refresh Page"
                  icon="pi pi-refresh"
                  onClick={() => window.location.reload()}
                />
                <Button
                  label="Go Home"
                  icon="pi pi-home"
                  outlined
                  onClick={() => (window.location.href = "/")}
                />
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-500">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 border-round overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}