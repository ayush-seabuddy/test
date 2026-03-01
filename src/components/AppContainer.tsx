import React from 'react';
import { View, StyleSheet, Dimensions, ViewProps } from 'react-native';

const { width, height } = Dimensions.get('window');

// 1. Define the props shape
interface AppContainerProps extends ViewProps {
  children?: React.ReactNode;   // optional, can be any valid JSX
}

// 2. Use it on the component
const AppContainer: React.FC<AppContainerProps> = ({ children, ...rest }) => {
  return (
    <View style={styles.container} {...rest}>
      {children}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height*.9, 
  },
});

export default AppContainer;
