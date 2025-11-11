// components/CustomStatusBar.tsx
import React from 'react';
import { StatusBar, StatusBarStyle, Platform } from 'react-native';
import { useColorScheme } from 'react-native';

interface CustomStatusBarProps {
  backgroundColor?: string;
  translucent?: boolean;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor = 'transparent',
  translucent = true,
}) => {
  const colorScheme = useColorScheme(); // 'light' | 'dark' | null

  // Determine barStyle based on platform
  const barStyle: StatusBarStyle = Platform.select({
    ios: 'light-content', // Always white icons on iOS
    android: 'dark-content', // Follow system
    default: 'dark-content',
  });

  return (
    <StatusBar
      animated={true}
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      translucent={translucent}
    />
  );
};

export default CustomStatusBar;