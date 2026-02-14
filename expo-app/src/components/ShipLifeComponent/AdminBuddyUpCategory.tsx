import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ImagesAssets } from '@/src/utils/ImageAssets';

interface BuddyUpEvent {
  id: string;
  categoryName: string;
  categoryImage: string;
  points?: string;
  creatorPoints?: string;
}

const bgColors = ["#FFA754", "#72BEFF", "#7153FE", "#FF7942", "#4F71FF", "#FE5F5E"];

const AdminBuddyUpCategory = ({ buddyupCategory }: { buddyupCategory: BuddyUpEvent[] }) => {
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const handleEventPress = (event: BuddyUpEvent) => {
    router.push({
      pathname: '/createyourbuddyupevent',
      params: {
        selectedEventId: event.id,
        selectedEventName: event.categoryName,
        selectedEventImage: event.categoryImage,
        isFromCategoryList: 'true'
      }
    });
  };

  useEffect(() => {
    if (buddyupCategory.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (index + 1) % buddyupCategory.length;
      setIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [index, buddyupCategory.length]);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={buddyupCategory}
        horizontal
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            onPress={() => handleEventPress(item)}
            activeOpacity={0.8}
          >
            <View style={[styles.buddyupeventsView, { backgroundColor: bgColors[index % bgColors.length] }]}>
              <Image source={{ uri: item.categoryImage }} style={styles.buddyupeventImage} placeholder={ImagesAssets.categoryIcon} placeholderContentFit='cover' />
              <Text style={styles.buddyupeventName}>{item.categoryName}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default AdminBuddyUpCategory;

const styles = StyleSheet.create({
  buddyupeventsView: {
    height: 120, 
    width: 120, 
    borderRadius: 16, 
    marginRight: 10,
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10, 
    marginVertical: 16,
  },
  buddyupeventImage: { 
    height: 45, 
    width: 45 
  },
  buddyupeventName: { 
    fontSize: 13, 
    color: "#fff", 
    fontFamily: "Poppins-SemiBold", 
    textAlign: 'center', 
    paddingHorizontal: 10 
  },
});