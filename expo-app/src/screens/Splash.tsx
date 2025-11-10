import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated, Platform, Dimensions, StatusBar } from 'react-native';
// import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
// import { ImagesAssets } from '../assets/ImagesAssets';
// import { GetAssessment } from '../CommonApi';
import AppContainer from '../components/AppContainer';
import { ImagesAssets } from '../utils/ImageAssets';

const { height } = Dimensions.get('window');

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-height)).current; // Start above screen
  const slideAnim = useRef(new Animated.Value(0)).current; // For slide-in animation
  const headingSlideAnim = useRef(new Animated.Value(0)).current; // For heading slide-out animation
  const [data, setData] = useState([]);
  useEffect(() => {


    // Animate fade-in and slide-down for Splash component to center of the screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0, // Slide down to center
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();



    // Start the slide-in animation and then slide out after a delay
    Animated.sequence([
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1, // Slide to original position
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(headingSlideAnim, {
          toValue: 1, // Prepare to slide out after delay
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000), // Wait for a second before sliding out
      Animated.timing(headingSlideAnim, {
        toValue: 0, // Slide out back up
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim, slideAnim, headingSlideAnim]);


//   useEffect(() => {
//     // Define async function inside useEffect
//     const fetchData = async () => {
//       await GetAssessment();
//     };
//     fetchData();
//   }, []);

//   // Print data whenever it changes
//   useEffect(() => {
//     if (data.length > 0) {
//       console.log("GetAssessment data:", data);
//     }
//   }, [data]);
  return (
    <AppContainer>
      <StatusBar
        // barStyle={Platform.OS === 'ios' ? 'light-content' : 'light'}
        backgroundColor="#ECECEC99"
        hidden={false}
      />
      <View style={styles.container}>
        <Animated.View
          style={[
            // styles.logoView,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          <Image source={ImagesAssets.splashHeadingImage} style={styles.logoImage} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            zIndex: 7,
            bottom: "20%",
            right: "10%", // Adjust as needed
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0], // Move from below (300) to original position (0)
              })
            }],
          }}
        >
          <Image source={ImagesAssets.splashCaptainImage} style={{ height: 160, width: 120 }} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            zIndex: 8,
            bottom: 300, // Adjust according to your layout
            right: 50,
            transform: [{
              translateY: headingSlideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -300], // Move from its original position to above (300)
              })
            }],
          }}
        >
          <Image source={ImagesAssets.splashHeadingImage} style={styles.logoImage} />
        </Animated.View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative"
  },
  logoImage: {
    width: '100%',
    height: "95%",
    resizeMode: "stretch",
    backgroundColor: "white",
    //  borderRadius:65,
    borderBottomLeftRadius: 65,
    borderBottomRightRadius: 65

  },

});

export default Splash;