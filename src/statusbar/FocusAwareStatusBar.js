import React from 'react';
import { StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export default function FocusAwareStatusBar(props) {
  // Destructure props with default values
  const { barStyle = 'default', backgroundColor = 'transparent', hidden = false } = props;
  const isFocused = useIsFocused();

  return isFocused ? (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      hidden={hidden}
    />
  ) : null;
}
