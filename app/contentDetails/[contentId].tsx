import { viewContentDetails } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import GlobalHeader from "@/src/components/GlobalHeader";
import { showToast } from "@/src/components/GlobalToast";
import { useNetwork } from "@/src/hooks/useNetworkStatusHook";
import ArticleDetails from "@/src/screens/ContentDetails/ArticleDetails";
import AudioDetails from "@/src/screens/ContentDetails/AudioDetails";
import VideoDetails from "@/src/screens/ContentDetails/VideoDetails";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Logger } from "@/src/utils/logger";

interface ContentUser {
  email: string;
  fullName: string;
  id: string;
  profileUrl: string;
  userType: "ADMIN" | "USER" | string;
}

interface Content {
  id: string;
  contentTitle: string;
  description: string;
  contentType:
    | "VIDEO"
    | "AUDIO"
    | "ARTICLE"
    | "ANNOUNCEMENT"
    | "MUSIC"
    | string;
  contentUrl: string[];
  thumbnail: string;
  contentCategory: string;
  contentSubCategory: string;
  contentAcknowledge: any[];
  hashtags: string[];
  highPriority: boolean;
  isPublic: boolean;
  order: number | null;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  contentUser: ContentUser;
}

const ContentDetailsScreen = () => {
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const { t } = useTranslation();
  const isOnline = useNetwork();

  const [data, setData] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  const getContentDetail = useCallback(async () => {
    if (!contentId || !isOnline) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await viewContentDetails({
        contentId,
        isHtml: true,
      });

      if (response?.success && response?.status === 200) {
        setData(response.data);
      } else {
        showToast.error(t("oops"), response?.message);
      }
    } catch (error) {
      Logger.error("Content detail error:", { Error: String(error) });
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
    }
  }, [contentId, isOnline, t]);

  useEffect(() => {
    getContentDetail();
  }, [getContentDetail]);

  if (loading) {
    return (
      <View style={styles.container}>
        <GlobalHeader title={t("content")} />
        <View style={styles.loaderWrapper}>
          <CommonLoader fullScreen />
        </View>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={styles.container}>
        <GlobalHeader title={t("content")} />
        <EmptyComponent text={t("nointernetconnection")} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <GlobalHeader title={t("content")} />
        <EmptyComponent text={t("nodataavailable")} />
      </View>
    );
  }

  switch (data.contentType) {
    case "ARTICLE":
    case "ANNOUNCEMENT":
      return <ArticleDetails data={data} />;

    case "VIDEO":
      return <VideoDetails data={data} />;

    case "MUSIC":
    case "AUDIO":
      return <AudioDetails data={data} />;

    default:
      return <VideoDetails data={data} />;
  }
};

export default ContentDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
