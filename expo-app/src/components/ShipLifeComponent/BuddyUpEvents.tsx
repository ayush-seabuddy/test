import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface BuddyUpEvent {
  id: string;
  categoryName: string;
  categoryImage: string;
}

const bgColors = ["#FFA754", "#72BEFF", "#7153FE", "#FF7942", "#4F71FF", "#FE5F5E"];

const BuddyUpEvents = ({ buddyupEvent }: { buddyupEvent: BuddyUpEvent[] }) => {
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (buddyupEvent.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (index + 1) % buddyupEvent.length;
      setIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [index, buddyupEvent.length]);

  return (
    <FlatList
      ref={flatListRef}
      data={buddyupEvent}
      horizontal
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      renderItem={({ item, index }) => (
        <View style={[styles.buddyupeventsView, { backgroundColor: bgColors[index % bgColors.length] }]}>
          <Image source={item.categoryImage} style={styles.buddyupeventImage} />
          <Text style={styles.buddyupeventName}>{item.categoryName}</Text>
        </View>
      )}
    />
  );
};

export default BuddyUpEvents;

const styles = StyleSheet.create({
  buddyupeventsView: {
    height: 120, width: 120, borderRadius: 16, marginRight: 10,
    justifyContent: 'center', alignItems: 'center', gap: 10, marginVertical: 16,
  },
  buddyupeventImage: { height: 45, width: 45 },
  buddyupeventName: { fontSize: 13, color: "#fff", fontFamily: "Poppins-SemiBold", textAlign: 'center', paddingHorizontal: 10 },
});
