// ChatRoomHeader.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
// import { ImagesAssets } from "../../assets/ImagesAssets";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { router } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import ChatSearchComponent from "./ChatSearchComponent";

const { height } = Dimensions.get("screen");

// ──────────────────────────────────────────────────────────────
// Memoized User Item – using Expo Image only
const UserItem = React.memo(({ item, onPress }: { item: any; onPress: (user: any) => void }) => {
  const isBoarded = item?.ship?.crewMembers?.find(
    (member: any) => member.userId === item?.id
  )?.isBoarded;

  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.userItemWrapper}>
      <View style={styles.userItemContainer}>
       

        <Image
          style={styles.userImage}
          resizeMode="contain"
          defaultSource={ImagesAssets.userIcon} 
          source={
            item.profileUrl
              ? { uri: item.profileUrl }
              : ImagesAssets.userIcon
          }
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.userItem}>
            {item.fullName} 
            {/* ({item?.designation}) */}
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
  // const typingStatus = useSelector((state: any) => state.chat?.typingStatus);

  type RBSheetRef = {
    open: () => void;
    close: () => void;
  };
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [renderList, setRenderList] = useState(false);
  const bottomSheetRef = useRef<RBSheetRef>(null);

  const dummyUsers = useMemo(
    () => participantIds || data?.participantIds,
    [participantIds, data]
  );

  const openSheet = () => {

    bottomSheetRef.current?.open();
    setTimeout(() => setRenderList(true), 100); // small delay for smooth opening
  };

  const closeSheet = () => {
    setRenderList(false);
    bottomSheetRef.current?.close();
  };

  const handleCardPress = (user: any) => {
    closeSheet();
    router.push({
      pathname: "/crewProfile",
      params: { crewId: user.id },
    });
  };

  // Back button handling
  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
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
          {/* ← Back Button */}
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/(bottomtab)/(community)/chats")
            }
            style={{ padding: 12 }}
          >
            <ChevronLeft color="black" size={25} />
          </TouchableOpacity>

          {/* Group Name + Members Count – NO onPress */}
          <View style={styles.textContainer}>
            <Text style={styles.name}>{GroupName || "Group Name"}</Text>
            <TouchableOpacity onPress={openSheet}>
              <Text style={styles.role}>
                {participant
                  ? `${participant} ${participant === 1 ? "Member" : "Members"}`
                  : ""}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Icon */}
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
        // closeOnDragDown
        closeOnPressMask
        height={height * 0.7}
        onClose={() => setRenderList(false)}
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
              renderItem={({ item }) => <UserItem item={item} onPress={handleCardPress} />}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={12}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews
            />
          )}
        </View>
      </RBSheet>
      
    </>
  );
}

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

  },
  shadow: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#000",
    opacity: 0.15,
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: 8,
  },
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
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  sheetContent: {
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    textAlign: "center",
    marginBottom: 10,
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
    marginRight: 10,
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