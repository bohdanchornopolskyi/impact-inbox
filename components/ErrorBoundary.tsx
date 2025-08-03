"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // 1. Check if it's the specific Convex validation error.
    // The error message from Convex will contain "ArgumentValidationError".
    if (
      error.message.includes("ArgumentValidationError") ||
      error.message.includes("NotFoundError")
    ) {
      // 2. If it is, perform the redirect.
      window.location.href = "/templates?error=not_found";
    }
  }

  public render() {
    if (this.state.error) {
      // 3. Check for the error type again for rendering.
      if (this.state.error.message.includes("ArgumentValidationError")) {
        return <div>Redirecting...</div>;
      }

      // 4. For any other error, show a helpful message so you can debug.
      return (
        <div className="p-4">
          <h2 className="text-xl font-bold text-destructive">
            Something went wrong.
          </h2>
          <pre className="mt-2 p-2 bg-muted rounded-md text-sm">
            {this.state.error.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
