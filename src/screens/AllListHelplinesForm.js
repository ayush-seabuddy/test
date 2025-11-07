import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
// } from "../../../GlobalStyle";
import { BlurView } from "@react-native-community/blur";
import { ImagesAssets } from "../assets/ImagesAssets";
import {
  FontFamily,
  Color,
  Padding,
  Border,
  Gap,
  FontSize,
} from "../GlobalStyle";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import HelpLineHeader from "../component/headers/HelpLineScreensHeader/HelpLineHeader";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
const { width, height } = Dimensions.get("window");
const AllListHelplinesForm = ({ navigation }) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const allFormList = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 25,
      }).toString();
      const response = await apiCallWithToken(
        `${apiServerUrl}/helpline/getAllHelplineSubmittedForms?${queryParams}`,
        "GET",
        null,
        userDetails.authToken
      );
      if (response.responseCode === 200) {
        setData(response.result.allHelplineForms);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allFormList();
  }, []);

  const renderItem = ({ item }) => {
    const formatDate = (isoString) => {


      const date = new Date(isoString);

      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `${formattedDate.replace(" ", "-")} , ${formattedTime}`;
    };
    return (
      <>
        <TouchableOpacity
          style={[styles.baseIconsGroup, styles.baseFlexBox]}
          onPress={() => {
            navigation.navigate("HelpLineFormResult", { dataType: item?.id });
          }}
        >

          <View style={{ width: "100%" }}>
            <Text style={[styles.mlc, styles.mlcLayout]}>
              {item?.helpline?.helplineName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                flexWrap: "wrap",
                marginTop: 10,

                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >


              <Text style={[styles.loremIpsum]}>{item?.status}</Text>


              <Text
                style={[styles.loremIpsumSecond,]}
              >
                {formatDate(item?.updatedAt)}
              </Text>


            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.body}>
      <HelpLineHeader navigation={navigation} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />


      {data?.length > 0 ? (
        <View style={styles.weStillNeedCopyInHereParent}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="white"
          />
          <View style={styles.frameParent}>
            <View style={styles.frameGroup}>
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
              />
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            width: width,
            // height: height * 0.35,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            style={{ height: 150, width: 150 }}
            source={require("../assets/images/AnotherImage/no-content.png")}
          />
          <Text
            style={{
              fontSize: 20,
              color: "#000",
              fontFamily: "Poppins-SemiBold",
            }}
          >
            {t('nocomplaintHistoryFound')}
          </Text>
        </View>
      )}
      {/* <View style={styles.bottomCard}>
        <LottieView
          source={require("../assets/Background.json")}
          autoPlay
          loop
          style={styles.lottieBackground}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  lottieBackground: {
    position: "absolute",
    width: width,
    height: height * 0.5,
    bottom: 0,
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "50%",
    bottom: 0,
    overflow: "hidden",
    paddingHorizontal: 16,
    zIndex: -1,
  },
  mlcClr: {
    color: "black",
    textAlign: "left",
  },
  baseFlexBox: {
    padding: Padding.p_base,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: Border.br_5xs,
    gap: Gap.gap_md,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.27)"
  },
  baseIconsWrapper: {
    backgroundColor: "#06361f",
    padding: 4,
    borderRadius: 8,
    marginLeft: 16,
  },
  mlcLayout: {
    lineHeight: 21,
    fontSize: 16,
  },
  weStillNeed: {
    fontSize: FontSize.bodyB12Regular_size,
    lineHeight: 18,
    width: "100%",
    textAlign: "left",
    fontFamily: FontFamily.captionC10Regular,
  },
  baseIcons: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  mlc: {
    fontWeight: "500",
    fontFamily: FontFamily.whyteInktrap,
    textAlign: "left",
    color: "black",
    alignSelf: "stretch",
  },
  helplineContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingRight: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start", // Adjust based on layout
  },
  helplineContainerSecond: {
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingRight: 6,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start", // Adjust based on layout
  },
  loremIpsum: {
    fontSize: FontSize.bodyB12Regular_size,
    lineHeight: 18,
    color: Color.textText400,
    marginTop: 0,
    textAlign: "center",
    justifyContent: "center",
    fontFamily: FontFamily.captionC10Regular,
    alignSelf: "stretch",
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    // paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  loremIpsumSecond: {
    fontSize: FontSize.bodyB14SemiBold_size,
    lineHeight: 18,
    color: "#000",
    marginTop: 0,

    textAlign: "center",
    justifyContent: "center",
    fontFamily: FontFamily.captionC10Regular,
    alignSelf: "stretch",
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  baseIconsParent: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  baseIconsGroup: {
    backgroundColor: "rgb(255, 255, 255)",
    marginVertical: 5,
  },
  frameGroup: {
    justifyContent: "center",
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  frameParent: {
    alignItems: "flex-end",
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  button1: {
    fontWeight: "600",
    fontFamily: FontFamily.bodyB14SemiBold,
    color: Color.primaryNightlyWoodsNormal,
    textAlign: "center",
  },
  stateLayer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  button: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 5,
    shadowOpacity: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    overflow: "hidden",
    borderRadius: Border.br_5xs,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  weStillNeedCopyInHereParent: {
    borderRadius: 32,
    paddingHorizontal: Padding.p_base,
    paddingVertical: Platform.OS === 'ios' ? 10 : 30,
    marginVertical: 1,
    gap: 14,
    alignSelf: "stretch",
    backgroundColor: "rgba(201, 201, 201, 0.1)",
    overflow: "hidden", // Add a fallback color if needed
    flex: 1
  },
  body: {
    backgroundColor: "rgba(201, 201, 201, 0.1)",
    minHeight: "100%"
  }
});

export default AllListHelplinesForm;
