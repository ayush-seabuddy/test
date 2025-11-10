import React from 'react';
import { View, ScrollView, ImageBackground } from 'react-native';
import PopularResourcesCard from '../component/Cards/PopularResourcesCard';
import EventCrad from '../component/Cards/EventCrad';
import { ImagesAssets } from '../assets/ImagesAssets';
import PlayListCard from '../component/Cards/PlayListCard';
const HomeExplore = () => {
  return (
    <View style={{ flex: 1}}>
      <ImageBackground 
        source={ImagesAssets.bghomeexplor} // Replace with your image URL
        style={{  justifyContent: 'flex-end',paddingBottom:30,paddingTop:30 }} // Use 'flex-end' to align content to the bottom
       
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{padding:16}}>
          <View style={{ marginTop: 25 , overflow:'hidden'}}>
            <PopularResourcesCard />
          </View>
          <View style={{ marginVertical: 10 }}>
            <EventCrad />
          </View>
          <View>
            <PlayListCard />
          </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

export default HomeExplore;
