import { ImagesAssets } from "@/src/utils/ImageAssets";
import { router } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import ChatSearchComponent from "./ChatSearchComponent";
import { Image } from "expo-image";
import { t } from "i18next";
import EmptyComponent from "@/src/components/EmptyComponent";
import { useTranslation } from "react-i18next";

const { height } = Dimensions.get("screen");

const UserItem = React.memo(
  ({ item, onPress }: { item: any; onPress: (user: any) => void }) => {
    const isBoarded = item?.ship?.crewMembers?.find(
      (member: any) => member.userId === item?.id,
    )?.isBoarded;

    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={styles.userItemWrapper}
      >
        <View style={styles.userItemContainer}>
          <Image
            style={styles.userImage}
            contentFit="cover"
            placeholder={ImagesAssets.userIcon}
            placeholderContentFit="cover"
            source={
              item.profileUrl ? { uri: item.profileUrl } : ImagesAssets.userIcon
            }
            cachePolicy="memory-disk"
          />

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.userItem}>
              {item.fullName.length > 30
                ? `${item.fullName.slice(0, 30)}...`
                : item.fullName}
            </Text>

            {item?.department !== "Shore_Staff" && (
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDotOuter,
                    { backgroundColor: isBoarded ? "#66FF66" : "#FF6666" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDotInner,
                      { backgroundColor: isBoarded ? "#00CC00" : "#CC0000" },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.statusText,
                    { color: isBoarded ? "green" : "#f43d3d" },
                  ]}
                >
                  ({isBoarded ? t("onboard") : t("onleave")})
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

UserItem.displayName = "ChatRoomUserItem";

type ChatRoomHeaderProps = {
  navigation: any;
  data: any;
  participant?: number;
  GroupName?: string;
  setSearchValue: (value: string) => void;
  participantIds?: any[];
};

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({
  navigation,
  data,
  participant,
  GroupName,
  setSearchValue,
  participantIds,
}) => {
  type RBSheetRef = {
    open: () => void;
    close: () => void;
  };

  const [isSearchOpen, setSearchOpen] = useState(false);
  const [renderList, setRenderList] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const { t } = useTranslation();
  const bottomSheetRef = useRef<RBSheetRef>(null);

  const dummyUsers = useMemo(
    () => participantIds || data?.participantIds || [],
    [participantIds, data],
  );

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return dummyUsers;

    const text = memberSearch.toLowerCase();

    return dummyUsers.filter((user: any) =>
      user?.fullName?.toLowerCase().includes(text),
    );
  }, [memberSearch, dummyUsers]);

  const openSheet = () => {
    bottomSheetRef.current?.open();
    setTimeout(() => setRenderList(true), 100);
  };

  const closeSheet = () => {
    setRenderList(false);
    setMemberSearch("");
    bottomSheetRef.current?.close();
  };

  const handleCardPress = (user: any) => {
    closeSheet();
    router.push({
      pathname: "/crewProfile",
      params: { crewId: user.id },
    });
  };

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <>
      {isSearchOpen ? (
        <ChatSearchComponent
          setSearchValue={setSearchValue}
          close={() => setSearchOpen(false)}
        />
      ) : (
        <View style={styles.container}>
          <View style={styles.shadow} />

          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(bottomtab)/(community)/chats")
            }
            style={{ padding: 12 }}
          >
            <ChevronLeft color="black" size={25} />
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text style={styles.name}>{GroupName || "Group"}</Text>
            <TouchableOpacity onPress={openSheet}>
              <Text style={styles.role}>
                {participant
                  ? `${participant} ${participant === 1 ? t("member") : t("members")}`
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightContainer}>
            <TouchableOpacity
              onPress={() => setSearchOpen(true)}
              style={[styles.headerButton, styles.searchButton]}
            >
              <Search color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <RBSheet
        ref={bottomSheetRef}
        closeOnPressMask
        height={height * 0.7}
        onClose={() => {
          setRenderList(false);
          setMemberSearch("");
        }}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "white",
          },
          draggableIcon: { display: "none" },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.modalTitle}>{t("groupmembers")}</Text>

          <View style={styles.searchBox}>
            <Search size={22} color="#999" />
            <TextInput
              placeholder={t("typetosearch")}
              value={memberSearch}
              onChangeText={setMemberSearch}
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
          </View>

          {renderList && (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <UserItem item={item} onPress={handleCardPress} />
              )}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 100,
                flexGrow: filteredMembers.length === 0 ? 1 : undefined,
              }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={12}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews
              ListEmptyComponent={
                <View style={{ marginTop: "30%" }}>
                  <EmptyComponent text={t("nocrewfound")} />
                </View>
              }
            />
          )}
        </View>
      </RBSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
    marginBottom: 5,
  },
  shadow: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#000",
    opacity: 0.15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#161616",
  },
  role: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#949494",
    textDecorationLine: "underline",
  },
  rightContainer: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 10,
  },
  searchButton: {
    backgroundColor: "#82934b",
    borderRadius: 8,
    padding: 8,
  },
  sheetContent: {
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
  },
  searchInput: {
    flex: 1,
    marginLeft: 5,
    marginTop: 3,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#000",
  },
  userItemWrapper: {
    paddingVertical: 10,
  },
  userItemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userItem: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDotOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  statusDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
  },
});

export default ChatRoomHeader;
