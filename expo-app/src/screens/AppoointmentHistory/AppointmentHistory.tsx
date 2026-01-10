import { getAllBookedAppointments } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import WellnessOfficerCard, {
  type WellnessOfficer,
} from "../WellnessOfficerList/WellnessOfficerCard";

const { width } = Dimensions.get("window");

const AppointmentHistory = () => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { t } = useTranslation();

  const fetchAppointments = async (pageNumber = 1) => {
    if (loading || loadingMore) return;

    try {
      pageNumber === 1 ? setLoading(true) : setLoadingMore(true);

      const response = await getAllBookedAppointments({
        page: pageNumber,
        limit: 20,
      });

      const newData = response?.data?.appointmentsList || [];

      if (newData.length < 20) setHasMore(false);

      setData(prev =>
        pageNumber === 1 ? newData : [...prev, ...newData]
      );
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

  const handleEndReached = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAppointments(nextPage);
  };
  const renderItem = ({ item }: { item: any }) => {
    const doctor = item?.doctorDetails;

    const wellnessOfficerData: WellnessOfficer = {
      id: doctor?.id,
      doctorName: doctor?.doctorName,
      country: doctor?.country,
      language: doctor?.language,
      profileUrl: doctor?.profileUrl,
    };

    return (
      <View style={styles.cardWrapper}>
        <WellnessOfficerCard
          data={wellnessOfficerData}
          onPress={() => {
            router.push({
              pathname: "/wellnessOfficerProfile",
              params: { item: JSON.stringify(item) },
            });
          }}
        />
      </View>
    );
  };


  const ListEmptyComponent = () =>
    !loading ? (
      <View style={styles.emptyContainer}>
        <EmptyComponent text={t("nobookedappointmentfound")} />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <Header />

      {loading && data.length === 0 ? (
        <CommonLoader containerStyle={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item?.id?.toString() || index.toString()
          }
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={ListEmptyComponent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <CommonLoader containerStyle={{ marginVertical: 10 }} />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  cardWrapper: {
    marginTop: 6,
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppointmentHistory;
