import React, { useCallback, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  Pressable,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  Color,
  Padding,
  Border,
  Gap,
  FontSize,
  FontFamily,
} from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../../Api";
import { useFocusEffect } from "@react-navigation/native";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const HelpLineCard = ({ navigation, setModalVisible, showConversations }) => {
  const [data, setData] = useState(null);
  const { t } = useTranslation();
  const fetchUserList = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);



      const result = await apiCallWithToken(
        `${apiServerUrl}/helpline/getAllHelplines?helplineType=HELPLINE`,
        "GET",
        null,
        userDetails.authToken
      );


      if (result.responseCode === 200) {
        setData(result.result);
      }
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserList();
      return () => console.log("Screen unfocused");
    }, [])
  );

  const helplineKeyMap = {
    "Marpol - Whistle Blower": {
      title: "marpoltitle",
      desc: "marpol_description"
    },
    "Sexual Harassment & Bullying": {
      title: "sexualharassmenttitle",
      desc: "sexualharassment_description"
    },
    "MLC": {
      title: "mlctitle",
      desc: "mlc_description"
    }
  };

  const renderItem = ({ item }) => {
    const keySet = helplineKeyMap[item.helplineName];

    return (
      <TouchableOpacity
        style={[styles.baseIconsGroup, styles.baseFlexBox]}
        onPress={() => {
          navigation.navigate("HelpLineForm", {
            dataType: item?.id,
            name: item.helplineName,
          });
        }}
      >
        <Image style={styles.baseIcons} resizeMode="cover" source={{ uri: item?.iconUrl }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.mlc, styles.mlcLayout]}>
            {keySet ? t(keySet.title) : item.helplineName}
          </Text>
          <Text style={styles.loremIpsum}>
            {keySet ? t(keySet.desc) : item.helplineDescription}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };



  // const renderItem = ({ item }) => {
  //   return (
  //     <TouchableOpacity
  //       style={[styles.baseIconsGroup, styles.baseFlexBox]}
  //       onPress={() => {
  //         navigation.navigate("HelpLineForm", {
  //           dataType: item?.id,
  //           name: item.helplineName,
  //         });
  //       }}
  //     >
  //       <Image
  //         style={styles.baseIcons}
  //         resizeMode="cover"
  //         source={{ uri: item?.iconUrl }}
  //       />
  //       <View style={{ flex: 1 }}>
  //         <Text style={[styles.mlc, styles.mlcLayout]}>
  //           {item?.helplineName}
  //         </Text>
  //         <Text style={styles.loremIpsum}>
  //           {item?.helplineDescription}
  //         </Text>
  //       </View>

  //     </TouchableOpacity>
  //   );
  // };


  return (
    <View style={styles.weStillNeedCopyInHereParent}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={15}
        reducedTransparencyFallbackColor="white"
      />

      <View style={styles.frameParent}>

        <View style={styles.frameGroup}>

          <TouchableOpacity
            style={[styles.baseIconsGroup, styles.baseFlexBox]}
            onPress={() => setModalVisible(true)}
          >
            <Image
              style={styles.baseIcons}
              resizeMode="cover"
              source={ImagesAssets.sosImage}
            />
            <View>
              <Text style={[styles.emergencyText, styles.mlcLayout]}>
                {t('emergencyandsos')}
              </Text>
              <Text style={styles.loremIpsum}>{t('emergencyandsos_description')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.baseIconsParent, styles.baseFlexBox]}
            onPress={showConversations}
          >
            <Image
              style={[styles.baseIcons]}
              resizeMode="cover"
              source={ImagesAssets.SailorsIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.mlc, styles.mlcLayout]}>
                {t('sailorssocietylive')}
              </Text>
              <Text style={styles.loremIpsum}>{t('sailorssocietylive_description')}</Text>

            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.baseIconsGroup, styles.baseFlexBox]}
            onPress={() => setModalVisible(true)}
          >
            <Image
              style={styles.baseIcons}
              resizeMode="cover"
              source={ImagesAssets.folder_icon}
            />
            <View>
              <Text style={[styles.mlc, styles.mlcLayout]}>
                Marpol-Whistle Blower
              </Text>
              <Text style={styles.loremIpsum}>lorem Ipsum</Text>
            </View>
          </TouchableOpacity> */}
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </View>
        {/* <View style={styles.frameGroup}>
          <TouchableOpacity
            style={[styles.baseIconsGroup, styles.baseFlexBox]}
            onPress={() => {
              navigation.replace("HelpLineForm");
            }}
          >
            <Image
              style={styles.baseIcons}
              resizeMode="cover"
              source={ImagesAssets.database_icon}
            />
            <View>
              <Text style={[styles.mlc, styles.mlcLayout]}>
                Sexual Harassment & Bullying
              </Text>
              <Text style={styles.loremIpsum}>lorem Ipsum</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.baseIconsGroup, styles.baseFlexBox]}
            onPress={() => setModalVisible(true)}
          >
            <Image
              style={styles.baseIcons}
              resizeMode="cover"
              source={ImagesAssets.emargncy_icon}
            />
            <View>
              <Text style={[styles.mlc, styles.mlcLayout]}>MLC</Text>
              <Text style={styles.loremIpsum}>lorem Ipsum</Text>
            </View>
          </TouchableOpacity>
        </View> */}
      </View>
      {/* <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate("BookAppoinment")}}>
          <View style={styles.stateLayer}>
            <Text style={[styles.button1, styles.mlcLayout]}>Booking a Therapy</Text>
          </View>
        </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  mlcClr: {
    color: "black",
    textAlign: "left",
  },
  heyGladYou: {
    width: "100%",
    textAlign: "left",
    fontSize: 20,
    lineHeight: 25,
    color: "#262626",
    fontWeight: "500",
    fontFamily: "WhyteInktrap-Medium",
  },
  baseFlexBox: {
    padding: Padding.p_base,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: Border.br_5xs,
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  baseIconsWrapper: {
    // backgroundColor: "#06361f",
    // padding: 4,
    backgroundColor: "#B0DB0266",
    padding: 6,
    borderRadius: 8,
    marginLeft: 16,
  },
  mlcLayout: {
    lineHeight: 21,
    fontSize: FontSize.bodyB14SemiBold_size,
  },
  weStillNeed: {
    fontSize: FontSize.bodyB12Regular_size,
    lineHeight: 18,
    width: "100%",
    textAlign: "left",
    fontFamily: FontFamily.captionC10Regular,
  },
  baseIcons: {
    width: 25,
    height: 25,
    overflow: "hidden",
  },
  mlc: {
    fontWeight: "500",
    fontFamily: FontFamily.whyteInktrap,
    textAlign: "left",
    color: "black",
    alignSelf: "stretch",
    paddingRight: 8,
  },
  emergencyText: {
    fontWeight: "500",
    fontFamily: FontFamily.whyteInktrap,
    textAlign: "left",
    color: "#CD5C5C",
    alignSelf: "stretch",
  },
  loremIpsum: {
    fontSize: FontSize.captionC10Regular_size,
    lineHeight: 14,
    color: Color.textText400,
    marginTop: 0,
    textAlign: "left",
    fontFamily: FontFamily.captionC10Regular,
    alignSelf: "stretch",
    paddingRight: 14,

  },
  baseIconsParent: {
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  baseIconsGroup: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 5,
    // marginRight:8,
    paddingRight: 8
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
    paddingVertical: 30,
    gap: 14,
    alignSelf: "stretch",
    // borderColor:'rgba(183, 183, 183, 0.5)',
    // borderWidth:0.5,
    backgroundColor: "rgba(183, 183, 183, 0.1)",
    overflow: "hidden", // Add a fallback color if needed
  },
});

export default HelpLineCard;