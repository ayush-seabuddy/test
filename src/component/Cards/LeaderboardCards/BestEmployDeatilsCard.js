import React, { useCallback } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Linking,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
import moment from "moment";
import Icon from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import socketService from "../../../Socket/Socket";
import { clearChatList, fetchUsers } from "../../../Redux/Socket/Socket";
import { useDispatch } from "react-redux";
import { Modal } from "react-native-paper";
import MediaPreviewModal from "../../Modals/MediaPreviewModal";
import { formatShipName } from "../../../Api";

const { width, height } = Dimensions.get("screen");
const BestEmployDeatilsCard = ({ crew }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  // navigation.navigate("ChatRoom", { data: item });


  const handleOpenLink = async (item) => {
    const url = item.link;

    if (url !== "") {
      await Linking.openURL(url);
    } else {
      Alert.alert(`This URL (${url}) is wrong!`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      socketService.initilizeSocket();
      dispatch(fetchUsers());

      return () => {
        socketService.removeListener("usersChatList");
        dispatch(clearChatList());

        socketService.on("userDisconnected", (data) => {
        });
      };
    }, [dispatch])
  );
  const renderSocialMediaItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          // backgroundColor: "#E6EBE9",
          borderBottomWidth: 1,
          borderColor: "#b4b2b2",
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
        }}
        onPress={() => handleOpenLink(item)}
      >
        <Icon
          name={item.platform}
          size={20}
          color="#B2C1BA"
          style={{ marginRight: 10 }}
        />
        <Text style={{ flex: 1, color: "#636363", fontSize: 12, fontFamily: 'Poppins-Regular' }}>
          {item?.platform?.charAt(0).toUpperCase() + item?.platform?.slice(1)}
        </Text>
        <Icon
          name="external-link"
          size={16}
          color="#B0DB02"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>
    );
  };

  const formatHobbies = (input) => {
    if (!input || (Array.isArray(input) && input.length === 0)) {
      return 'N/A';
    }

    const normalize = (text) =>
      text
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());

    if (Array.isArray(input)) {
      return input.map(normalize).join(', ');
    }

    if (typeof input === 'string') {
      return normalize(input);
    }

    return 'N/A';
  };






  return (
    <View>

      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.07)",
          paddingHorizontal: 25,
          paddingVertical: 40,
          borderRadius: 32,
          overflow: "hidden",
        }}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={15}
          reducedTransparencyFallbackColor="white"
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "black",
              fontFamily: "WhyteInktrap-Bold",
              paddingTop: Platform.OS === "ios" ? 15 : 0,
              // height: Platform.OS === "ios" ? 28 : 28,
              lineHeight: 24
            }}
          >
            {crew?.fullName ? crew?.fullName.charAt(0).toUpperCase() + crew?.fullName.slice(1) : "N/A"}

          </Text>




          {/* <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: 6,
              borderRadius: 8,
            }}
            onPress={() => navigation.navigate("ChatRoom", { data: crew })}
          >
            <Image
              style={{ width: 16, height: 16 }}
              tintColor="white"
              source={ImagesAssets.helper_img_7}
            />
          </TouchableOpacity> */}
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "rgba(6, 54, 31, 1)",
            fontFamily: "Poppins-Medium",
            fontWeight: "500",
          }}
        >
          {crew?.designation || ""}
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "rgba(99, 99, 99, 5)",
            fontFamily: "Poppins-Regular",
            fontWeight: "500",
          }}
        >
          {crew?.bio || ""}
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 4,
            marginVertical: 3,
          }}
        >
          {crew?.nationality ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "rgba(232, 232, 232, 0.4)",
                alignItems: "center",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Image
                style={{ width: 16, height: 16 }}
                source={ImagesAssets.CountryIcon}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 14.4,
                  textTransform: "capitalize",
                }}
              >
                {crew?.nationality || ""}
                {/* Birmingham, UK */}
              </Text>
            </View>
          ) : null}

          {crew?.gender ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "rgba(232, 232, 232, 0.4)",
                alignItems: "center",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Image
                style={{ width: 16, height: 16 }}
                source={ImagesAssets.male_iconq}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 14.4,
                  textTransform: "capitalize",
                }}
              >
                {crew?.gender || ""}
              </Text>
            </View>
          ) : null}

          {crew?.age ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "rgba(232, 232, 232, 0.4)",
                alignItems: "center",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 14.4,
                }}
              >
                {crew?.age || ""}
              </Text>
            </View>
          ) : null}

          {crew?.relationshipStatus ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "rgba(232, 232, 232, 0.4)",
                alignItems: "center",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 14.4,
                  textTransform: "capitalize",
                }}
              >
                {crew?.relationshipStatus || ""}
              </Text>
            </View>
          ) : null}


          {/* {crew?.mbtiType ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "rgba(231, 244, 177, 1)",
                alignItems: "center",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 14.4,
                }}
              >
                {crew?.mbtiType || ""}
              </Text>
            </View>
          ) : null} */}
        </View>


        <Text style={styles.aboutText}>More Information</Text>
        <View style={{ paddingVertical: 10 }}>


          {crew?.shipName ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 5,
              }}
            >
              <Text
                style={styles.aboutTextHeading}
              >
                Vessel
              </Text>
              <Text
                style={styles.aboutTextItem}
              >
                {/* {crew?.shipName || ""} */}
                {formatShipName(crew?.shipName) || ""}
              </Text>
            </View>
          ) : null}

          {crew?.department !== 'Shore_Staff' && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 5,
              }}
            >
              <Text
                style={styles.aboutTextHeading}
              >
                Status
              </Text>
              <Text
                style={styles.aboutTextItem}
              >
                {crew?.crewMembers?.find((member) => member.userId === crew?.id)
                  ?.isBoarded
                  ? "Onboard"
                  : "Onleave"}
              </Text>
            </View>
          )}



          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 5,
            }}
          >
            <Text
              style={styles.aboutTextHeading}
            >
              Hobbies
            </Text>
            <Text
              style={styles.aboutTextItem}
            >
              {formatHobbies(crew?.hobbies)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 5,
            }}
          >
            <Text
              style={styles.aboutTextHeading}
            >
              Onboard interests
            </Text>
            <Text
              style={styles.aboutTextItem}
            >
              {/* {crew?.favoriteActivity && crew?.favoriteActivity.length > 0 ? crew?.favoriteActivity.join(", ") : "N/A"} */}
              {formatHobbies(crew?.favoriteActivity)}
            </Text>
          </View>




        </View>


        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            marginVertical: 3,
          }}
        >

          {crew?.department !== 'Shore_Staff' && (
            <View
              style={{
                paddingHorizontal: 32,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.4)",
                alignItems: "center",
                width: "48%",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-SemiBold",
                  lineHeight: 39.2,
                }}
              >
                <Text style={{ fontSize: 13 }}>#</Text>
                {crew?.userLeaderBoardPosition || "0"}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "rgba(99, 99, 99, 1)",
                  fontFamily: "Poppins-Reguler",
                  lineHeight: 14.4,
                }}
              >
                Crew Ranking
              </Text>
            </View>
          )}

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              alignItems: "center",
              width: crew?.department === 'Shore_Staff' ? "100%" : "48%", // Dynamic width
            }}
          >
            <Text
              style={{
                fontSize: 28,
                color: "rgba(99, 99, 99, 1)",
                fontFamily: "Poppins-SemiBold",
                lineHeight: 39.2,
              }}
            >
              {crew?.experience || "0"}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "rgba(99, 99, 99, 1)",
                fontFamily: "Poppins-Reguler",
                lineHeight: 14.4,
                width: "100%",
                textAlign: "center",
              }}
            >
              Years of Experience
            </Text>
          </View>

        </View>
      </View>
      {/* Experience */}
      {crew?.workingExperience?.length > 0 ? (
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            padding: 16,
            borderRadius: 32,
            overflow: "hidden",
            marginTop: 7,
          }}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="white"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",

            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "black",
                fontFamily: "WhyteInktrap-Bold",
                paddingTop: 20
              }}
            >
              Experience
            </Text>
          </View>

          {crew?.workingExperience?.map((item, index) => {
            const formatDate = (date) => {
              if (!date) return "N/A";
              const parsedDate = moment(date, ["D/M/YYYY", "DD/MM/YYYY"], true);
              if (!parsedDate.isValid()) {
                return "Invalid date";
              }
              return parsedDate.format("MMM/YYYY");
            };

            const formattedFrom = formatDate(item.from);
            const formattedTo = formatDate(item.to);
            return (
              <View key={index} style={{ marginVertical: 5 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginVertical: 3,
                    // backgroundColor: "red",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: "rgba(69, 69, 69, 1)",
                        fontFamily: "Poppins-SemiBold",
                        lineHeight: 18,
                        fontFamily: 'Poppins-Regular'
                      }}
                    >
                      {item?.companyName.slice(0, 30) || ""}
                    </Text>
                    {/* <Text
                    style={{
                      fontSize: 12,
                      color: "rgba(69, 69, 69, 1)",
                      fontFamily: "Poppins-Reguler",
                      lineHeight: 12,
                    }}
                  >
                    2Months
                  </Text> */}
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(148, 148, 148, 1)",
                      fontFamily: 'Poppins-Regular',
                      lineHeight: 18,
                    }}
                  >
                    {formattedFrom || ""} - {formattedTo || ""}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 5,
                    color: "rgba(69, 69, 69, 1)",
                    fontFamily: 'Poppins-Regular',
                    lineHeight: 12,
                  }}
                >
                  {item?.role.slice(0, 30) || ""}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Socials */}

      {crew?.SocialMediaLinks?.length > 0 ? (
        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            padding: 16,
            borderRadius: 32,
            overflow: "hidden",
            marginTop: 7,
          }}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="white"
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",

            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: "black",
                fontFamily: "WhyteInktrap-Bold",
                paddingTop: Platform.OS === "ios" ? 20 : null,
              }}
            >
              Socials
            </Text>
          </View>

          <>
            <FlatList
              data={crew?.SocialMediaLinks}
              renderItem={renderSocialMediaItem}
              keyExtractor={(item) => item.id}
            />
          </>

          {/* <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderColor: "rgba(189, 189, 189, 0.4)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Image
                style={{ height: 24, width: 24 }}
                source={ImagesAssets.linkdin_icon}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(69, 69, 69, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 18,
                }}
              >
                Linked In
              </Text>
            </View>
            <Image
              style={{ height: 20, width: 20 }}
              source={ImagesAssets.shear_icon_green}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderColor: "rgba(189, 189, 189, 0.4)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Image
                style={{ height: 24, width: 24 }}
                source={ImagesAssets.insta_icon}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(69, 69, 69, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 18,
                }}
              >
                Instagram
              </Text>
            </View>
            <Image
              style={{ height: 20, width: 20 }}
              source={ImagesAssets.shear_icon_green}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderColor: "rgba(189, 189, 189, 0.4)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Image
                style={{ height: 24, width: 24 }}
                source={ImagesAssets.fb_icon}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(69, 69, 69, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 18,
                }}
              >
                Facebook
              </Text>
            </View>
            <Image
              style={{ height: 20, width: 20 }}
              source={ImagesAssets.shear_icon_green}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Image
                style={{ height: 24, width: 24 }}
                source={ImagesAssets.twit_icon}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(69, 69, 69, 1)",
                  fontFamily: "Poppins-Medium",
                  lineHeight: 18,
                }}
              >
                Telegram
              </Text>
            </View>
            <Image
              style={{ height: 20, width: 20 }}
              source={ImagesAssets.shear_icon_green}
            />
          </View>
        </View> */}
        </View>
      ) : null}


    </View>
  );
};


const styles = StyleSheet.create({

  aboutText: {
    color: "#454545",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    paddingTop: 10,
  },
  aboutTextHeading: {
    flex: 0.5,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  aboutTextItem: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    // textTransform: "capitalize",
  }
});

export default BestEmployDeatilsCard;