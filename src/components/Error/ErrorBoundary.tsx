import type { ErrorInfo, ReactNode } from 'react';
import React from 'react';
import { ErrorView } from '@/components/Error/ErrorView';

interface Props {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorView
          title={this.props.title}
          description={this.props.description}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
