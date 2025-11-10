// CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { ImagesAssets } from '../../assets/ImagesAssets';
import Colors from '../../colors/Colors';

const ProfilDetailsHeader = ({ navigation, navigateProfile, handleBackButtonPress }) => {
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity onPress={() => { handleBackButtonPress() }} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.health}>Profile Details</Text>
      </View>
      <View style={styles.headerButtonsContainer}>


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  health: {
    fontSize: 18,
    lineHeight: 29,
    fontFamily: 'Poppins-Regular',
    color: '#262626',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    marginRight: 10,
    padding: 5
  },
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  searchIconBackground: {
    backgroundColor: Colors.secondary,
    borderRadius: 8
  },
});

export default ProfilDetailsHeader;
