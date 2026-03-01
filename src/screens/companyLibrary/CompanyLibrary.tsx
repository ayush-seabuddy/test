import { getallcontents } from "@/src/apis/apiService";
import GlobalHeader from "@/src/components/GlobalHeader";
import { showToast } from "@/src/components/GlobalToast";
import { router } from "expo-router";
import { t } from "i18next";
import { ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RelatedContentCard from "../ContentDetails/RelatedContentCard";
import CompanyAnnouncements from "./CompanyAnnouncements";
import MusicCard from "./MusicCard";
import { useNetwork } from "@/src/hooks/useNetworkStatusHook";
import EmptyComponent from "@/src/components/EmptyComponent";

const CompanyLibrary = () => {
  const isOnline = useNetwork();
  const contentList = ["MUSIC", "READ", "VIDEO"];
  const [loading, setLoading] = React.useState(true);
  const [contentListData, setContentListData] = React.useState({
    MUSIC: [],
    READ: [],
    VIDEO: [],
  });

  const getContentList = async (item: string) => {
    if (!isOnline) return;
    try {
      const apiResponse = await getallcontents({
        page: 1,
        limit: 10,
        contentCategory: "COMPANY_LIBRARY",
        contentType: item,
      });
      if (apiResponse.success && apiResponse.status === 200) {
        setContentListData((prevData) => ({
          ...prevData,
          [item]: apiResponse.data.allContents,
        }));
      } else {
        showToast.error(t("oops"), apiResponse.message);
      }
    } catch (error) {
      showToast.error(t("oops"), t("somethingwentwrong"));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!isOnline) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all(contentList.map((item) => getContentList(item)));
      } catch (error) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  return (
    <View style={{ flex: 1 }}>
      <GlobalHeader title={t("companyLibrary")} />
      {!isOnline ? (
        <EmptyComponent text={t("nointernetconnection")} />
      ) : loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={() => "unique"}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 16,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    lineHeight: 22,
                    fontSize: 18,
                    fontWeight: "500",
                    color: "black",
                    fontFamily: "WhyteInktrap-Medium",
                  }}
                >
                  {t("bulletin")}
                </Text>
              </View>
              <CompanyAnnouncements />
              {contentListData?.VIDEO?.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      {t("watch")}
                    </Text>
                    {contentListData?.VIDEO?.length > 3 && (
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/companyContentList",
                            params: {
                              title: `${t("watch")}`,
                              contentType: `VIDEO`,
                            },
                          });
                        }}
                      >
                        <ChevronRight size={24} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <RelatedContentCard data={contentListData?.VIDEO} />
                  </View>
                </>
              )}

              {contentListData?.MUSIC?.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      {t("listen")}
                    </Text>
                    {contentListData?.MUSIC?.length > 3 && (
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/companyContentList",
                            params: {
                              title: `${t("listen")}`,
                              contentType: `MUSIC`,
                            },
                          });
                        }}
                      >
                        <ChevronRight size={24} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <MusicCard data={contentListData?.MUSIC} />
                </>
              )}

              {contentListData?.READ?.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      {t("read")}
                    </Text>
                    {contentListData?.READ?.length > 3 && (
                      <TouchableOpacity
                        onPress={() => {
                          router.push({
                            pathname: "/companyContentList",
                            params: {
                              title: `${t("read")}`,
                              contentType: `READ`,
                            },
                          });
                        }}
                      >
                        <ChevronRight size={24} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={{ paddingHorizontal: 10 }}>
                    <RelatedContentCard data={contentListData?.READ} />
                  </View>
                </>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

export default CompanyLibrary;
