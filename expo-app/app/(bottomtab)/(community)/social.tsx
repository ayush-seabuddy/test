import Announcements from '@/src/components/Announcements';
import Posts from '@/src/components/Posts';
import SocialHeader from '@/src/screens/community/SocialHeader';
import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const HomeTab = () => {
  return (
    <View style={styles.container}>
      <SocialHeader />

      <FlatList
        ListHeaderComponent={
          <Announcements onlyAnnouncement={true} page={1} limit={5} />
        }
        data={[]}
        renderItem={null}
        ListEmptyComponent={null}
        ListFooterComponent={
          <>
            <Posts />
            <View style={{ marginBottom: 120 }} />
          </>
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={21}
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => {
          router.push('/newpost');
        }}
      >
        <Image source={ImagesAssets.PlusImage} style={{ height: 20, width: 20 }} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: 'rgba(84, 97, 94, 0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
