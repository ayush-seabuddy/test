import Announcements from '@/src/components/Announcements';
import Posts from '@/src/components/Posts';
import SocialHeader from '@/src/screens/community/SocialHeader';
import Colors from '@/src/utils/Colors';
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

const HomeTab = () => {
  return (
    <View style={styles.container}>
      <SocialHeader />
      <ScrollView>
        <Announcements onlyAnnouncement={true} page={1} limit={5} />
        <Posts isMediaPost={false} />
      </ScrollView>
    </View>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});