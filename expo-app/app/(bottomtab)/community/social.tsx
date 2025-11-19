import { getallcontents } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import SocialHeader from '@/src/screens/community/SocialHeader';
import Colors from '@/src/utils/Colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, FlatList, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Announcement = {
  alreadySeen: boolean;
  contentTitle: string;
  createdAt: string;
  description: string;
  thumbnail: string;
};

const HomeTab = () => {
  const [loading, setloading] = useState(false);
  const [announcement, setannouncement] = useState<Announcement[]>([]);
  const { t } = useTranslation();
  const flatListRef = React.useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const getAllAnnouncements = async () => {
    setloading(true);
    try {
      const apiResponse = await getallcontents({
        page: 1,
        limit: 10,
        onlyAnnouncement: true,
      });

      setloading(false);

      if (apiResponse.success && apiResponse.status === 200) {
        setannouncement(apiResponse.data.allContents);
      } else {
        showToast.error(t('oops'), apiResponse.message);
      }
    } catch (error) {
      setloading(false);
      showToast.error(t('oops'), t('somethingwentwrong'));
    }
  };

  useEffect(() => {
    getAllAnnouncements();
  }, []);
  useEffect(() => {
    if (announcement.length === 0) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;

      if (nextIndex >= announcement.length) {
        nextIndex = 0; // Loop back to first item
      }

      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex, announcement]);


  const renderAnnouncement = ({ item }: { item: Announcement }) => {
    const isNew = !item.alreadySeen;

    return (
      <View style={[styles.card, { width: SCREEN_WIDTH - 20 }]}>
        <Image source={{ uri: item.thumbnail }} style={styles.image} contentFit="cover" />
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.34)", "rgba(0, 0, 0, 0.4)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>{t('new')}</Text>
            </View>
          )}
          <Text style={styles.title}>{item.contentTitle}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item?.description?.replace(/<[^>]*>/g, "") || ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SocialHeader />

      {announcement.length > 0 && (
        <FlatList
          ref={flatListRef}
          horizontal
          data={announcement}
          renderItem={renderAnnouncement}
          keyExtractor={(item, index) => index.toString()}
          style={styles.horizontalList}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH - 20,
            offset: (SCREEN_WIDTH - 20) * index,
            index,
          })}
        />

      )}
    </View>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  horizontalList: {
    marginTop: 63,
  },

  card: {
    height: 165,
    borderRadius: 20,
    // marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  image: {
    height: '100%',
    width: '100%',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    padding: 15,
    justifyContent: 'space-between',
  },

  newBadge: {
    position: 'absolute',
    top: 15,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.lightGreen,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },

  newText: {
    color: "#06361f",
    fontSize: 8,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
  },

  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    width: '80%',
  },

  description: {
    opacity: 0.9,
    marginBottom: 5,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
});
