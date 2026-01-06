import { getAllBookedAppointments } from "@/src/apis/apiService";
import CustomLottie from "@/src/components/CustomLottie";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppointmentCard from "./AppointmentCard";
import Header from "./Header";

const { width, height } = Dimensions.get("window");

const AppointmentHistory = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 Fetch Data (supports pagination)
  const fetchAppointments = async (pageNumber = 1) => {
    if (loading || loadingMore) return;

    try {
      pageNumber === 1 ? setLoading(true) : setLoadingMore(true);

      const response = await getAllBookedAppointments({
        page: pageNumber,
        limit: 20,
      });

      if (response.data) {
        const newData = response.data.appointmentsList || [];

        // If less than limit → no more data
        if (newData.length < 20) setHasMore(false);

        // Append or Set
        setData(prev =>
          pageNumber === 1 ? newData : [...prev, ...newData]
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, []);

  // 🔥 Load more when end reached
  const handleEndReached = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAppointments(nextPage);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <AppointmentCard data={item} />
    </View>
  );

  const ListEmptyComponent = () => (
    !loading && (
      <View style={styles.emptyContainer}>
        <Image style={{ height: 130, width: 130 }} source={ImagesAssets.NoContent} />
        <Text style={styles.emptyText}>No booked appointment found!</Text>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      <Header />

      {loading && data.length === 0 ? (
        <ActivityIndicator size="large" color="#06361F" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={ListEmptyComponent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#06361F" style={{ marginVertical: 10 }} />
            ) : null
          }
        />
      )}

      {/* Bottom Animation */}
      <View style={styles.bottomCard}>
        <CustomLottie isBlurView={Platform.OS === 'ios' ? true : false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" , alignContent:"flex-start" },

  flatListContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
    alignContent:"flex-start"
  },

  cardWrapper: {
    marginTop: 7,
  },

  emptyContainer: {
    flex: 1,
    width: width - 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
    marginTop: 20,
  },

  bottomCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: -1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

export default AppointmentHistory;
