import * as Updates from 'expo-updates';
import React from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

const CRASH_KEY = 'app_crash_count';
const MAX_CRASHES = 3;

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

    async componentDidCatch(error: any, info: any) {
        console.error('ErrorBoundary caught:', error, info);
        // Optionally, you can still track crash count for analytics or future use
        // const count = Number((await AsyncStorage.getItem(CRASH_KEY)) || 0);
        // await AsyncStorage.setItem(CRASH_KEY, String(count + 1));
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
            const message =
                this.state.error?.message ??
                String(this.state.error ?? 'Unknown error');

            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Something went wrong</Text>
                    {/* <Text style={styles.error}>{message}</Text> */}
                    <Button title='Reload App' onPress={this.reload} />
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    error: {
        color: 'red',
        marginBottom: 24,
        textAlign: 'center',
    },
});
