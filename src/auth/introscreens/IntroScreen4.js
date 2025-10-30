import React from 'react';
import { Text, View, StyleSheet, Platform, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import FocusAwareStatusBar from '../../statusbar/FocusAwareStatusBar';
import AppContainer from '../../container/AppContainer';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Colors from '../../colors/Colors';
import { ImagesAssets } from '../../assets/ImagesAssets';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const IntroScreen4 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <Image source={ImagesAssets.arrowRight} style={styles.skipIcon} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>PEER SUPPORT COMMUNITY & PROFESSIONAL HELP</Text>
          </View>
        </View>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          {Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="white"
            />
          ) : (
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={10}
                overlayColor="rgba(255, 255, 255, 0.3)"
              />
            </View>
          )}
          <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'rgba(246, 225, 61, 1.5)']} // Gradient from white to yellow
          start={{ x: 1, y: 1 }} // Start point of the gradient
          end={{ x: 0, y: 0}} // End point of the gradient (horizontal)
          locations={[0.2, 1]} 
            style={styles.gradient}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Peer Support Community & Professional Help</Text>
              <Text style={styles.cardDescription}>
                Focuses on maritime-specific stressors, offering a customized wellness plan
              </Text>
              <View style={styles.loadingIcons}>
                <Image source={ImagesAssets.loding1} style={styles.loadingIcon} resizeMode="contain" />
                <Image source={ImagesAssets.loding1} style={styles.loadingIcon} resizeMode="contain" />
                <Image source={ImagesAssets.loding1} style={styles.loadingIcon} resizeMode="contain" />
                <Image source={ImagesAssets.loding1} style={styles.loadingIcon} resizeMode="contain" />
                <Image source={ImagesAssets.loding2} style={styles.loadingIcon} resizeMode="contain" />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.replace('IntroScreen5')}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.replace('IntroScreen3')}
              style={styles.backbutton}
            >
              <Text style={{color:"#636363",fontSize:14,fontWeight:600}}>Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F4B1",
   
  },
  content: {
    flex: 1,
    width:"100%",
    padding:20
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  skipText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  skipIcon: {
    width: 20,
    height: 20,
  },
  titleContainer: {
    width: '100%',
    marginTop: "17%",
  },
  titleText: {
    fontSize: 34,
    color: Colors.black,
    width: '100%',
    fontFamily:"WhyteInktrap-Bold",
    lineHeight:45
    
  },
  bottomCard: {
    flex: 1,
  width:"100%",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    overflow: 'hidden',
    height: "10%",
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  cardContent: {
    marginVertical: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  cardTitle: {
 
    fontSize: 20,
    color: Colors.black,
    width: '100%',
    fontFamily:"WhyteInktrap-Bold",
    lineHeight:28
  },
  cardDescription: {
    fontSize: 12.5,
    fontWeight: '400',
    color: Colors.black,
    width: '100%',
    marginTop: 10,
    fontFamily:"Poppins-Regular"
  },
  loadingIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 5,
  },
  loadingIcon: {
    width: 30,
    height: 30,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.text,
    padding: 15,
    borderRadius: 10,
  },
  backbutton: {
    alignItems: 'center',
    justifyContent: 'center',
   fontFamily:"Poppins-SemiBold",
   
    padding: 15,
    borderRadius: 10,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    fontFamily:"Poppins-SemiBold"
  },
});

export default IntroScreen4;
