// AppContainer.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AppContainer = ({ children }) => {
  return (
    <View style={styles.container}>
     
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp('100%'), // 90% of screen width
    height: hp('90%'), // 80% of screen height
    // paddingVertical:30
    // paddingTop:30
   
  },
});

export default AppContainer;
