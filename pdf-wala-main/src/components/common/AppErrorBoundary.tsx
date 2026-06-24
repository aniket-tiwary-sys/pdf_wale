import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '24px',
            background: '#fff',
            color: '#111',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ marginBottom: '12px' }}>App crashed during render</h1>
          <p style={{ marginBottom: '12px' }}>
            This replaces the blank screen so we can see the error.
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '8px',
            }}
          >
            {this.state.error?.message ?? 'Unknown runtime error'}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

