// CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { ImagesAssets } from '../../assets/ImagesAssets';


const AiChatHeader = ({ navigation }) => {
  return (
    <View style={styles.container}>
     <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
     <TouchableOpacity onPress={() => {navigation.navigate('Home', { screen: 'Ai' })}}style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
    
     </View>
     <Text style={styles.health}>Jolli</Text>
      <View style={styles.headerButtonsContainer}>
      
        <TouchableOpacity onPress={() => { navigation.replace('Search') }} style={styles.headerButton}>
          <View style={[styles.iconBackground, styles.searchIconBackground]}>
            <Image source={ImagesAssets.tabler_menu} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
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
    fontSize: 24,
    lineHeight: 28.8,
    fontFamily: 'WhyteInktrap-Bold',
    color: '#262626',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    marginRight: 10,
    padding:5
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
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  searchIconBackground: {
    
    borderRadius:8
  },
});

export default AiChatHeader;
