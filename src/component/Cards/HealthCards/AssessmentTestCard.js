import * as React from "react";
import { Image, StyleSheet, Text, View, Pressable, Dimensions } from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const isProMax = height >= 926;
const AssessmentTestCard = ({ navigation, data, ApiData , testArray }) => {
  const { t } = useTranslation();
  return (
    <Pressable
      style={styles.frameParent}
      onPress={() => {
        console.log(data);
        {
          testArray && testArray[2] && testArray[2].open
            ?  navigation.navigate("Mbti_Test_2", { from: "HelthScreen" ,isRequired: testArray[2]?.isRequires })
            : navigation.navigate("PersonaResult", { from: "HelthScreen" });
        }
        // navigation.navigate("PersonaResult");
      }}
    >
      <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
        <Image
          style={styles.frameChild}
          resizeMode="cover"
          source={ImagesAssets.personality}
        />
        <View style={[styles.frameContainer, styles.frameFlexBox]}>
          <View style={styles.personalityMapParent}>
            <Text style={[styles.personalityMap,{color: data === false ? '#06361f' : 'grey'}]}>{t('personalitymap')}</Text>
            <Text style={[styles.music, { color: "#444444", fontSize: 10, lineHeight: 16 }]}>{t('personalitymap_description')}</Text>
            {ApiData?.insights?.maritime_title &&
              <View style={[styles.frameView, styles.frameFlexBox]}>
                <View style={[styles.musicWrapper, styles.frameGroupFlexBox]}>
                  <Text style={styles.music}>{ApiData?.insights?.maritime_title || "Discover your working style and strengths at sea"}</Text>
                </View>

              </View>
            }
          </View>
          <View
            style={{ backgroundColor: "white", padding: 8, borderRadius: 8 }}
          >
            <Image
              style={styles.frameItem}
              resizeMode="cover"
              source={ImagesAssets.baseicon2}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  frameGroupFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  frameFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  frameChild: {
    borderRadius: 20,
    width: 70,
    height: 70,
    backgroundColor: "white"
  },
  personalityMap: {
    fontSize: isProMax ? 14 : 12,
    lineHeight: 18,
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    color: "#1e1f1e",
    textAlign: "left",
    alignSelf: "stretch",
  },
  music: {
    fontSize: 10,
    // lineHeight: 10,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    textAlign: "left",

  },
  musicWrapper: {
    backgroundColor: "#D1AF90",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  frameView: {
    gap: 4,
    alignSelf: "stretch",
  },
  personalityMapParent: {
    gap: 4,
    flex: 1,
    paddingTop: 10
  },
  frameItem: {
    width: 12,
    height: 12,
  },
  frameContainer: {
    gap: 8,
    flex: 1,
  },
  frameGroup: {
    gap: 16,
    alignSelf: "stretch",
  },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    borderRadius: 10,
    alignSelf: "stretch",
  },
});

export default AssessmentTestCard;
