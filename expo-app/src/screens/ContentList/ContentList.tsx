import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from './Header';

// Dummy data generator
const generateDummyData = (page: number, perPage: number = 10) => {
  const start = (page - 1) * perPage;
  const items = [];
  for (let i = 1; i <= perPage; i++) {
    const id = start + i;
    items.push({
      id: id.toString(),
      title: `Beautiful Car ${id}`,
      price: `$${(Math.random() * 300 + 50).toFixed(2)}K`,
      year: 2018 + Math.floor(Math.random() * 7),
      mileage: `${(Math.random() * 100 + 10).toFixed(0)}K mi`,
      imageUrl: `https://picsum.photos/seed/car${id}/300/200`, // Random placeholder images
    });
  }
  return items;
};

const CardItem = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
        <Text style={styles.cardDetails}>
          {item.year} • {item.mileage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ContentList = () => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initial load
  React.useEffect(() => {
    loadMoreItems();
  }, []);

  const loadMoreItems = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const newItems = generateDummyData(page);
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
      <Header title="Content List" setContentType={() => {}} />
      <FlatList
        data={data}
        renderItem={({ item }) => <CardItem item={item} />}
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
            <Text>No cars found</Text>
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
    paddingTop: 65,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
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
  cardContent: {
    padding: 10,
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
});

export default ContentList;