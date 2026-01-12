import { getallcontents } from '@/src/apis/apiService';
import Colors from '@/src/utils/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from './Header';
import CommonLoader from '@/src/components/CommonLoader';
import { Image } from 'expo-image';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import EmptyComponent from '@/src/components/EmptyComponent';

const { width } = Dimensions.get('window');

const ContentList = () => {
  const { item } = useLocalSearchParams();
  const data2 = typeof item === 'string' ? JSON.parse(item) : null;

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);           // pagination loading
  const [initialLoading, setInitialLoading] = useState(true); // first load
  const [hasMore, setHasMore] = useState(false);
  const [contentType, setContentType] = useState<string>('');

  const getContentTypeConfig = (
    contentType: 'ARTICLE' | 'VIDEO' | 'MUSIC'
  ) => {
    switch (contentType) {
      case 'ARTICLE':
      case 'VIDEO':
      case 'MUSIC':
      default:
        return {
          navigationScreen: 'contentDetails',
          emptyMessage: 'No Content Found',
          imageStyle: styles.imageBackground,
          cardContentStyle: styles.cardContent,
        };
    }
  };

  const RenderData = ({ item, index }: { item: any; index: number }) => {
    const config = getContentTypeConfig(item.contentType);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        key={index}
        onPress={() =>
          router.push({
            pathname: '/contentDetails/[contentId]',
            params: { item: JSON.stringify(item), contentId: item?.id },
          })
        }
      >
        <View style={config.cardContentStyle}>
          <Image
            style={config.imageStyle}
            contentFit="cover"
            placeholder={ImagesAssets.PlaceholderImage}
            source={{ uri: item?.thumbnail }}
          />

          <View style={styles.textContainer}>
            <Text
              style={styles.titleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.contentTitle?.slice(0, 25)}
            </Text>
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(65, 65, 65, 0.56)']}
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
        page,
        limit: perPage,
        subCategory: data2?.id,
        ...(contentType && { contentType }),
      });

      if (response?.data) {
        setHasMore(response.data.totalPages > page);
        return response.data.allContents || [];
      }

      return [];
    } catch (error) {
      console.log('error:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [contentType]);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);
      const newData = await generateDummyData(1);
      setData(newData);
      setPage(1);
    } catch (error) {
      console.log(error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  const loadMoreItems = async () => {
    if (loading || initialLoading || !hasMore) return;

    const nextPage = page + 1;
    setLoading(true);

    const newItems = await generateDummyData(nextPage);
    if (newItems.length > 0) {
      setData(prev => [...prev, ...newItems]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  const renderFooter = () => {
    if (!loading || initialLoading) return null;

    return (
      <View style={styles.loader}>
        <CommonLoader />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t('contentList')} setContentType={setContentType} />

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
            {initialLoading ? (
              <CommonLoader fullScreen />
            ) : (
              <EmptyComponent text={t('nodataavailable')} />
            )}
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
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
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
  cardContent: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  loader: {
    paddingVertical: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  imageBackground: {
    height: width * 0.5 * (9 / 16),
    width: width * 0.5,
  },
  textContainer: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
});

export default ContentList;
