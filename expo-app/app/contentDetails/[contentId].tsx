import { viewContentDetails } from '@/src/apis/apiService';
import ArticleDetails from '@/src/screens/ContentDetails/ArticleDetails';
import AudioDetails from '@/src/screens/ContentDetails/AudioDetails';
import VideoDetails from '@/src/screens/ContentDetails/VideoDetails';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const ContentDetailsScreen = () => {
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
    contentType: "VIDEO" | "AUDIO" | "ARTICLE" | string;
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

  const { contentId } = useLocalSearchParams();
  const [data, setData] = useState<Content | null>(null);
  console.log("data: sdfsdlfsd", data);
  const [loading, setLoading] = useState<boolean>(true);

  const getVideoDetail = async () => {
    try {
      setLoading(true);
      const response = await viewContentDetails({
        contentId: contentId as string,
      });

      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVideoDetail();
  }, []);

  // 🔵 **Show loader while loading**
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔴 **if no content found**
  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No content found</Text>
      </View>
    );
  }

  // 🟢 **Render based on content type**
  switch (data.contentType) {
    case "ARTICLE":
      return <ArticleDetails data={data} />;
   case "ANNOUNCEMENT":
      return <ArticleDetails data={data} />;
    case "VIDEO":
      return <VideoDetails data={data} />;

    case "MUSIC":
      return <AudioDetails data={data} />;

    default:
      return <VideoDetails data={data} />;
  }
};

export default ContentDetailsScreen;
