import React from 'react';
import { Platform, StatusBar, StatusBarStyle } from 'react-native';

interface CustomStatusBarProps {
  backgroundColor?: string;
  translucent?: boolean;
}

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor = 'transparent',
  translucent = true,
}) => {
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