import { getallcontents } from '@/src/apis/apiService';
import Colors from '@/src/utils/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from './Header';

// Dummy data generator



const { width, height } = Dimensions.get('window')
const ContentList = () => {
  const { item } = useLocalSearchParams();
  const data2 = typeof item === "string" ? JSON.parse(item) : null;
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  console.log("loading: ", loading);
  const [hasMore, setHasMore] = useState(false);
  const [contentType, setContentType] = useState<string>("")


  const getContentTypeConfig = (contentType: 'ARTICLE' | 'VIDEO' | 'MUSIC') => {
    switch (contentType) {
      case "ARTICLE":
        return {
          navigationScreen: "contentDetails",
          emptyMessage: "No Article Found",
          imageComponent: Image,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
      case "VIDEO":
        return {
          navigationScreen: "contentDetails",
          emptyMessage: "No Video Found",
          imageComponent: Image,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
      case "MUSIC":
        return {
          navigationScreen: "contentDetails",
          emptyMessage: "No Audio Found",
          imageComponent: Image,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
      default:
        return {
          navigationScreen: "contentDetails",
          emptyMessage: "No Article Found",
          imageComponent: Image,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
    }
  };


  const RenderData = ({ item, index }: { item: any, index: number }) => {

    const config = getContentTypeConfig(item.contentType);
    if (!config) return null;



    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8} key={index} onPress={() =>
        router.push({
          pathname: "/contentDetails/[contentId]",
          params: { item: JSON.stringify(item), contentId: item?.id },
        })
      }>
        <View style={config.cardContentStyle}>

          <Image
            style={config.imageStyle}
            resizeMode="cover"
            source={{
              uri: item?.thumbnail
            }} />
          <View style={styles.textContainer}>
            <Text
              style={[styles.titleText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.contentTitle.slice(0, 25)}
            </Text>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(65, 65, 65, 0.56)']} // adjust opacity as you like
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

        </View>
      </TouchableOpacity>
    );
  };

  const generateDummyData = async (page: number, perPage: number = 18) => {

    try {
      const response = await getallcontents({
        page: page,
        limit: perPage,
        subCategory: data2?.id,
        ...(contentType && { contentType }),
      })
      if (response.data) {
        const { allContents, ...details } = response.data
        if (response.data.totalPages > page) {
          setHasMore(true)
        } else {
          setHasMore(false)
        }

        return response.data.allContents
      } else {
        return []
      }


    } catch (error) {
      console.log("error: ", error);
      return []
    }

  };

  React.useEffect(() => {
    getData();
  }, [contentType]);

  const getData = async () => {
    try {
      setLoading(true);
      const newData = await generateDummyData(1);
      setData(newData);
    } catch (error) {

    } finally {
      setLoading(false)
    }

  };


  const loadMoreItems = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(async () => {
      const newItems = await generateDummyData(page);
      setData((prev) => [...prev, ...newItems]);
      setPage((prev) => prev + 1);

      // Stop after 5 pages (50 items) for demo
      if (page >= 5) {
        setHasMore(false);
      }
      setLoading(false);
    }, 800);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <Header title={t("contentList")} setContentType={setContentType} />
      <FlatList
        data={data}
        renderItem={RenderData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={

          <View style={styles.empty}>

            {loading ? <ActivityIndicator size="large" color="#000" /> : <Text>No cars found</Text>}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 12,
    // paddingTop: 65,
    flexGrow: 1,
    // flex: 1,
    // backgroundColor:"red"
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    minHeight: 120,
    backgroundColor: 'gray',
    borderRadius: 12,
    margin: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: '48%',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginVertical: 4,
  },
  cardDetails: {
    fontSize: 12,
    color: '#777',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loader: {
    paddingVertical: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  cardContainer: {
    borderRadius: 5,
    alignSelf: "center",
    marginRight: 10,
  },
  cardContent: {
    borderRadius: 5,
    overflow: "hidden",
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white
  },
  imageBackground: {
    height: width * 0.5 * (9 / 16),
    width: width * 0.5,
    justifyContent: "space-between",
  },
  textContainer: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
});

export default ContentList;