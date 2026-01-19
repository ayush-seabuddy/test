import ErrorScreen from '@/app/errorscreen';
import * as Updates from 'expo-updates';
import React from 'react';
import { Platform } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  reload = async () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      await Updates.reloadAsync();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          error={this.state.error}
          onReload={this.reload}
        />
      );
    }

    return this.props.children;
  }
}
