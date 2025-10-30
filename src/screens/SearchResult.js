import React from 'react';
import { View, Image, Text, ScrollView,Platform } from 'react-native';
import { ImagesAssets } from '../assets/ImagesAssets';
import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
import Colors from '../colors/Colors';

import SearchResultHeader from '../component/headers/SearchResultHeader';
import EventCrad from '../component/Cards/EventCrad';
import PopularResourcesCard from '../component/Cards/PopularResourcesCard';
import BooksCard from '../component/Cards/BooksCard';
import SearchTabs from '../component/SearchTabs';
const SearchResult = () => {
  return (
    <View style={{flex:1}}>
          <SearchResultHeader/>
          <SearchTabs/>
  <View style={{padding:20,flex:1}}>
  
     <ScrollView showsVerticalScrollIndicator={false}>
          <FocusAwareStatusBar
            barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={{marginVertical:10}}>
      <PopularResourcesCard/>
      </View>
       <BooksCard/>
  <View style={{marginVertical:10}}>
  <EventCrad/>
  </View >
   
    </ScrollView>
   </View>
    </View>
 
  );
};

export default SearchResult;
