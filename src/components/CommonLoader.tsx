// src/components/CommonLoader.tsx
import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import Colors from '@/src/utils/Colors';

interface CommonLoaderProps {
    /**
     * Color of the loader
     */
    color?: string;

    /**
     * If true, shows large loader, otherwise small
     */
    fullScreen?: boolean;

    /**
     * Optional wrapper style
     */
    containerStyle?: ViewStyle;
}

const CommonLoader: React.FC<CommonLoaderProps> = ({
    color = Colors.darkGreen,
    fullScreen = false,
    containerStyle,
}) => {
    const size = fullScreen ? 'large' : 'small';

    return (
        <View style={containerStyle}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

export default CommonLoader;
