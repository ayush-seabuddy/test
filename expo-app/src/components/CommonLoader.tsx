// src/components/CommonLoader.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/src/utils/Colors';

interface CommonLoaderProps {
    /**
     * Size of the ActivityIndicator
     * Default: 'large' for fullScreen, 'small' for footer
     */
    size?: 'small' | 'large' | number;
    /**
     * Color of the loader
     */
    color?: string;
    /**
     * If true, renders as full-screen centered loader
     */
    fullScreen?: boolean;
    /**
     * Optional custom style for the container
     */
    containerStyle?: ViewStyle;
}

const CommonLoader: React.FC<CommonLoaderProps> = ({
    size,
    color = Colors.lightGreen,
    fullScreen = false,
    containerStyle,
}) => {
    // Automatically choose size based on type if not explicitly provided
    const resolvedSize = size ?? (fullScreen ? 'large' : 'small');

    const containerStyleArray = [
        fullScreen ? styles.fullScreen : styles.footer,
        containerStyle,
    ];

    return (
        <View style={containerStyleArray}>
            <ActivityIndicator size={resolvedSize} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Light semi-transparent overlay
    },
    footer: {
        paddingVertical: 20,
        paddingBottom: 140, // Keeps space for tab bar/navigation
        alignItems: 'center',
    },
});

export default CommonLoader;