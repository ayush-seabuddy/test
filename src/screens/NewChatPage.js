import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Platform, ScrollView, RefreshControl, Pressable } from "react-native";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import VesselChat from "./VesselChat";
import FleetChat from "./FleetChat";
import FastImage from "react-native-fast-image";
import { ImagesAssets } from "../assets/ImagesAssets";
import { FontFamily } from "../GlobalStyle";
import socketService from "../Socket/Socket";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

// Memoize child components to prevent unnecessary re-renders
const MemoizedVesselChat = React.memo(VesselChat);
const MemoizedFleetChat = React.memo(FleetChat);

const NewChatPage = ({ navigation }) => {
  const [showVesselChat, setShowVesselChat] = useState(true);
  const [showFleetChat, setShowFleetChat] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    // Initialize socket only once on mount
    socketService.initilizeSocket();

    // Set components to visible immediately
    setShowVesselChat(true);
    setShowFleetChat(true);

    return () => {
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setShowVesselChat(false);
    setShowFleetChat(false);

    // Immediately reset to re-render components
    setShowVesselChat(true);
    setShowFleetChat(true);
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
          progressViewOffset={Platform.OS === "android" ? 60 : 0}
          nativeDriver={true} // Enable native driver for smoother animations
        />
      }
      contentContainerStyle={styles.contentContainer}
    >
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      {/* Vessel Section */}
      <Pressable style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <FastImage
            style={styles.icon}
            resizeMode="cover"
            source={ImagesAssets.shipIcon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.sectionTitle}>{t('shiplounge')}</Text>
            <Text style={styles.sectionSubTitle}>{t('shiplounge_description')}</Text>
          </View>
        </View>
        {showVesselChat && <MemoizedVesselChat refreshing={refreshing} />}
      </Pressable>

      {/* Fleet Section */}
      <Pressable style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <FastImage
            style={[styles.icon, { borderRadius: 30 }]}
            resizeMode="cover"
            source={ImagesAssets.fleetIcon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.sectionTitle}>{t('fleetlounge')}</Text>
            <Text style={styles.sectionSubTitle}>{t('fleetlounge_description')}</Text>
          </View>
        </View>
        {showFleetChat && <MemoizedFleetChat refreshing={refreshing} />}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom:60,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 150,
    marginTop: 70,
    gap: 25,
  },
  sectionContainer: {
    marginHorizontal: 10,
    backgroundColor: "rgba(232, 232, 232, 1)",
    borderRadius: 15,
  },
  sectionHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    height: 50,
    width: 50,
  },
  textContainer: {
    justifyContent: "center",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: FontFamily.whyteInktrap,
    lineHeight: 24,
    color: "black",
  },
  sectionSubTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    color: "#6f8406",
  },
});

export default NewChatPage;