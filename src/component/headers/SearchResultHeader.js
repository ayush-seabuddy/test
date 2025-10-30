// CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, TextInput } from 'react-native';
import { ImagesAssets } from '../../assets/ImagesAssets';
import Colors from '../../colors/Colors';

const SearchResultHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={() => goBack()}>
          <Image style={{ width: 25, height: 25 }} source={ImagesAssets.backArrow} resizeMode='cover' />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContainer}>
        <Image style={{ width: 25, height: 25 }} source={ImagesAssets.search} tintColor="#B7B7B7" resizeMode='cover' />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#B7B7B7"
          // Add any additional props or methods for handling input changes
        />
      </View>
      <View style={styles.rightContainer}>
        <TouchableOpacity style={{backgroundColor:Colors.secondary,padding:7,borderRadius:8}} onPress={() => alert('Settings clicked!')}>
          <Image style={{ width: 25, height: 25 }} tintColor="black" source={ImagesAssets.dots} resizeMode='cover' />
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
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 5,
    alignItems: 'center',
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(183, 183, 183, 0.1)",
    borderRadius: 5, 
    paddingHorizontal:10,
    paddingVertical:3,
    borderRadius:25
  },
  searchInput: {
    flex: 1,
    height: 40, // Adjust height as needed
    paddingLeft: 10, // Space between icon and text input
    color: '#000', // Text color for input
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
});

export default SearchResultHeader;
