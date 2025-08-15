'use client';

import React from 'react';
import { Alert, Button, Card, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
          <Card className="w-full max-w-md text-center shadow-lg">
            <Alert
              message="Something went wrong"
              description="An unexpected error occurred. Please try refreshing the page."
              type="error"
              showIcon
              className="mb-4"
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={this.handleReload}
              className="w-full"
            >
              Refresh Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
} 