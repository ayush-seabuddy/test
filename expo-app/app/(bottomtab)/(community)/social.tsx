import Announcements from '@/src/components/Announcements';
import { MoodCheckInModal } from '@/src/components/Modals/MoodCheckInModal';
import Posts from '@/src/components/Posts';
import { RootState } from '@/src/redux/store';
import SocialHeader from '@/src/screens/community/SocialHeader';
import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

const HomeTab = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isTodayChecked, setIsTodayChecked] = useState(false);
  const userDetails = useSelector((state: RootState) => state.userDetails);

  useFocusEffect(
    useCallback(() => {
      const checkMoodTracker = async () => {
        const checkToday = await AsyncStorage.getItem("MoodTrackerOpen");

        if (checkToday) {
          const lastOpenDate = Number(checkToday);
          const ONE_DAY = 24 * 60 * 60 * 1000;

          if (Date.now() > lastOpenDate + ONE_DAY) {
            setModalVisible(true);
            await AsyncStorage.setItem(
              "MoodTrackerOpen",
              String(Date.now())
            );
          }
        } else {
          setModalVisible(true);
          await AsyncStorage.setItem("MoodTrackerOpen", String(Date.now()));
        }
      };

      checkMoodTracker();

      return () => { };
    }, [])
  );

  return (
    <View style={styles.container}>
      <SocialHeader />

      <Posts
        ListHeaderComponent={
          <Announcements onlyAnnouncement={true} page={1} limit={5} />
        }
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

      <MoodCheckInModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setIsTodayChecked(true);
        }}
        userName={userDetails?.fullName?.split(" ")?.[0]}
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