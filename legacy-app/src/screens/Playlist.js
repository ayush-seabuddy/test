import React from 'react';
import { View, StyleSheet, Text, Platform, ImageBackground, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import PlaylistHeader from '../component/headers/PlaylistHeader';
import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
import Colors from '../colors/Colors';
import { ImagesAssets } from '../assets/ImagesAssets';
import AssessmentTestCard from '../component/Cards/HealthCards/AssessmentTestCard';
import LottieView from 'lottie-react-native';
import CustomLottie from '../component/CustomLottie';
const { width, height } = Dimensions.get('window');
const Playlist = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <PlaylistHeader navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Playlist</Text>
          <TouchableOpacity style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: 8, padding: 7 }} onPress={""}>
            <Image style={{ width: 20, height: 20 }} resizeMode="cover" source={ImagesAssets.filter_icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          {[...Array(3)].map((_, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <AssessmentTestCard />
            </View>
          ))}
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Recommended</Text>
        </View>
        <View style={styles.cardsContainer}>
          {[...Array(3)].map((_, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <AssessmentTestCard />
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.bottomCard}>
        <CustomLottie />


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    paddingBottom: 20, // Adjust this value for spacing from the bottom
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 29,
    fontFamily: 'WhyteInktrap-Medium',
  },
  cardsContainer: {

    paddingHorizontal: 20,
    marginBottom: 10, // Space at the bottom of the cards
  },
  cardWrapper: {
    width: '48%', // Make each card take up about half the available width
    marginBottom: 10, // Space between rows
  },
  imageBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400, // Adjust as needed
    zIndex: -1, // Make sure the background is behind the content
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "50%",
    bottom: 0,
    overflow: "hidden",
    paddingHorizontal: 16,
    elevation: -5,
    zIndex: -1

  },
  lottieBackground: {
    position: 'absolute',
    width: width,
    height: height * 0.5,
    bottom: 0,
    elevation: -5
  },
});

export default Playlist;
