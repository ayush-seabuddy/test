import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { getAllDoctors } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import WellnessOfficerCard from "@/src/screens/WellnessOfficerList/WellnessOfficerCard";
import { useTranslation } from "react-i18next";
import Header from "./Header";

const { width } = Dimensions.get("window");

const WellnessOfficerList = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors({ page: 1, limit: 50 });

      if (response?.data?.doctorsList) {
        setData(response.data.doctorsList);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          {loading && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><CommonLoader fullScreen /></View>}

          {data.length > 0 ? (
            <View style={styles.cardsContainer}>
              {data.map((item, index) => (
                <View key={index} style={styles.cardWrapper}>
                  <WellnessOfficerCard data={item} />
                </View>
              ))}
            </View>
          ) : (
            !loading && (
              <View style={styles.emptyState}>
                <EmptyComponent text={t('nodatafound')} />
              </View>
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default WellnessOfficerList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  contentContainer: {
    flex: 1,
  },

  cardsContainer: {
    marginTop: "1%",
  },

  cardWrapper: {
    marginTop: 7,
  },

  emptyState: {
    flex: 1,
    width: width - 32,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyImage: {
    height: 130,
    width: 130,
  },

  emptyText: {
    fontSize: 20,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
    marginTop: 8,
  },
});
