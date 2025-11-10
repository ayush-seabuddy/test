import React from 'react';
import { View, Image, Text, ScrollView,Platform } from 'react-native';
import { ImagesAssets } from '../assets/ImagesAssets';
import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
import Colors from '../colors/Colors';
import SearchComponent from '../component/headers/SearchComponent';
const SearchType = () => {
  return (
   <View>
<SearchComponent/>
     <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
          <FocusAwareStatusBar
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor={Colors.white}
        hidden={false}
      />
      {[...new Array(3)].map((_, index) => {
        return (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
            <View >
              <Image style={{ width: 18, height: 18, marginRight: 7,backgroundColor:"rgba(183, 183, 183, 0.1)",borderRadius:25 }} source={ImagesAssets.timer} resizeMode='cover' />
            
            </View>
            <Text style={{ fontSize: 16 }}>Instrumental music for sleep</Text>
          </View>
        );
      })}

      
    </ScrollView>
   </View>
  );
};

export default SearchType;
