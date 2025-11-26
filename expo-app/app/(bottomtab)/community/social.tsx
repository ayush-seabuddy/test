// app/(bottomtab)/community/social.tsx OR HomeTab.tsx
import Announcements from '@/src/components/Announcements';
import Posts from '@/src/components/Posts';
import SocialHeader from '@/src/screens/community/SocialHeader';
import Colors from '@/src/utils/Colors';
import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';

const HomeTab = () => {
  return (
    <View style={styles.container}>
      <SocialHeader />
      <FlatList
        ListHeaderComponent={
          <>
            <Announcements onlyAnnouncement={true} page={1} limit={5} />
          </>
        }
        data={[]}
        renderItem={null}
        ListEmptyComponent={null}
        ListFooterComponent={<>
          <Posts />
          <View style={{ marginBottom: 100 }}>
          </View>
        </>}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
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