import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  BackHandler,
  FlatList,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";
import { useSelector } from "react-redux";
import ChatSearchComponent from "./ChatSearchComponent";
import FastImage from "react-native-fast-image";
import RBSheet from "react-native-raw-bottom-sheet";

const { height } = Dimensions.get("screen");

// ✅ Memoized User Item
const UserItem = React.memo(({ item, onPress }) => {
  const [loaded, setLoaded] = useState(false);

  const isBoarded = item?.ship?.crewMembers?.find(
    (member) => member.userId === item?.id
  )?.isBoarded;

  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.userItemWrapper}>
      <View style={styles.userItemContainer}>
        <FastImage
          source={
            item.profileUrl
              ? { uri: item.profileUrl }
              : require("../../assets/images/AnotherImage/Man.png")
          }
          style={styles.userImage}
          onLoadStart={() => setLoaded(false)}
          onLoadEnd={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
        {!loaded && (
          <FastImage
            source={require("../../assets/images/AnotherImage/Man.png")}
            style={[styles.userImage, { position: "absolute" }]}
          />
        )}

        <View>
          <Text style={styles.userItem}>
            {item.fullName} ({item?.designation})
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
                ({isBoarded ? "Onboard" : "Onleave"})
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const ChatRoomHeader = ({
  navigation,
  data,
  participant,
  GroupName,
  setSearchValue,
  participantIds,
}) => {
  const typingStatus = useSelector((state) => state.chat.typingStatus);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [renderList, setRenderList] = useState(false);
  const bottomSheetRef = useRef(null);

  const dummyUsers = useMemo(
    () => participantIds || data.participantIds,
    [participantIds, data]
  );

  const openSheet = () => {
    setSheetVisible(true);
    bottomSheetRef.current?.open();
    setTimeout(() => setRenderList(true), 50); // ✅ small delay so sheet opens instantly
  };

  const closeSheet = () => {
    setRenderList(false);
    setSheetVisible(false);
    bottomSheetRef.current?.close();
  };

  const handleCardPress = (user) => {
    closeSheet();
    navigation.navigate("CrewProfile", { item: user });
  };

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Home", {
        screen: "SeaBuddy",
        params: { name: "chat" },
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
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
          <View style={styles.leftContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Home", {
                  screen: "SeaBuddy",
                  params: { name: "chat" },
                });
                }}
                style={{ padding: 12 }}
            >
              <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
            </TouchableOpacity>
              <TouchableOpacity onPress={openSheet}>
                <View style={styles.textContainer}>
                  <Text style={styles.name}>{GroupName || "Group Name"}</Text>
                  <TouchableOpacity onPress={openSheet}>
                    <Text style={styles.role}>
                      {typingStatus?.isTyping
                        ? "typing..."
                        : participant
                          ? Number(participant) === 1
                            ? participant + " Member"
                            : participant + " Members"
                          : ""}
                    </Text>
                  </TouchableOpacity>
                </View>
            </TouchableOpacity>
          </View>

          <View style={styles.rightContainer}>
            <TouchableOpacity
              onPress={() => setSearchOpen(true)}
              style={[styles.headerButton, styles.searchButton]}
            >
              <Image
                source={ImagesAssets.searchWhite}
                style={[styles.headerIcon, { height: 20, width: 20 }]}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ✅ Optimized RBSheet */}
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={height * 0.7}
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
          <Text style={styles.modalTitle}>Group Members</Text>

          {renderList && (
            <FlatList
              data={dummyUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <UserItem item={item} onPress={handleCardPress} />
              )}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews
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
      android: { elevation: 5 },
    }),
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  textContainer: { marginLeft: 8 },
  name: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#161616",
  },
  role: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: "#949494",
    textDecorationLine: "underline",
  },
  rightContainer: { flexDirection: "row" },
  headerButton: { marginLeft: 10 },
  searchButton: {
    backgroundColor: "#82934b",
    borderRadius: 8,
    padding: 8,
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  sheetContent: { paddingVertical: 20 },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    textAlign: "center",
  },
  userItemWrapper: { paddingVertical: 10 },
  userItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "98%",
  },
  userItem: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
    marginRight: 40,
  },
  userImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusDotOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  statusDotInner: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9 },
});

export default ChatRoomHeader;
