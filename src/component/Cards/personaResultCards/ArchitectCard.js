import * as React from "react";
import { Text, StyleSheet, View, Image, TouchableOpacity, Alert } from "react-native";
import {
  FontFamily,
  FontSize,
  Padding,
  Border,
  Gap,
  Color,
} from "../GlobalStyles";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { GlassView } from "@metafic-co/react-native-glassmorphism";
import FastImage from "react-native-fast-image";
import { Modal } from "react-native-paper";
import PersonalityResultInfoPopup from "../../../screens/PersonalityMapInfoPopup";
const ArchitectCard = ({ data }) => {
  const getTypeDescription = (mbtiType) => {
    const descriptions = {
      INTJ: "Architect",
      INTP: "Logician",
      ENTJ: "Commander",
      ENTP: "Debater",
      INFJ: "Advocate",
      INFP: "Mediator",
      ENFJ: "Protagonist",
      ENFP: "Campaigner",
      ISTJ: "Logistician",
      ISFJ: "Defender",
      ESTJ: "Executive",
      ESFJ: "Consul",
      ISTP: "Virtuoso",
      ISFP: "Adventurer",
      ESTP: "Entrepreneur",
      ESFP: "Entertainer",
    };
    return descriptions[mbtiType] || "Type description not available";
  };
  // const getTypeDescription = (mbtiType) => {
  //   const descriptions = {
  //     INTJ: "Architect - Imaginative and strategic thinkers",
  //     INTP: "Logician - Innovative inventors with an unquenchable thirst for knowledge",
  //     ENTJ: "Commander - Bold, imaginative and strong-willed leaders",
  //     ENTP: "Debater - Smart and curious thinkers who cannot resist an intellectual challenge",
  //     INFJ: "Advocate - Quiet and mystical, yet very inspiring and tireless idealists",
  //     INFP: "Mediator - Poetic, kind and altruistic people, always eager to help a good cause",
  //     ENFJ: "Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners",
  //     ENFP: "Campaigner - Enthusiastic, creative and sociable free spirits",
  //     ISTJ: "Logistician - Practical and fact-minded individuals",
  //     ISFJ: "Defender - Very dedicated and warm protectors",
  //     ESTJ: "Executive - Excellent administrators, unsurpassed at managing things or people",
  //     ESFJ: "Consul - Extraordinarily caring, social and popular people",
  //     ISTP: "Virtuoso - Bold and practical experimenters, masters of all kinds of tools",
  //     ISFP: "Adventurer - Flexible and charming artists, always ready to explore and experience something new",
  //     ESTP: "Entrepreneur - Smart, energetic and very perceptive people",
  //     ESFP: "Entertainer - Spontaneous, energetic and enthusiastic people",
  //   };
  //   return descriptions[mbtiType] || "Type description not available";
  // };

  // const getTypeDescription = (mbtiType) => {
  //   const descriptions = {
  //     INTJ: "Architect - Imaginative and strategic thinkers",
  //     INTP: "Logician - Innovative inventors with an unquenchable thirst for knowledge",
  //     ENTJ: "Commander - Bold, imaginative and strong-willed leaders",
  //     ENTP: "Debater - Smart and curious thinkers who cannot resist an intellectual challenge",
  //     INFJ: "Advocate - Quiet and mystical, yet very inspiring and tireless idealists",
  //     INFP: "Mediator - Poetic, kind and altruistic people, always eager to help a good cause",
  //     ENFJ: "Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners",
  //     ENFP: "Campaigner - Enthusiastic, creative and sociable free spirits",
  //     ISTJ: "Logistician - Practical and fact-minded individuals",
  //     ISFJ: "Defender - Very dedicated and warm protectors",
  //     ESTJ: "Executive - Excellent administrators, unsurpassed at managing things or people",
  //     ESFJ: "Consul - Extraordinarily caring, social and popular people",
  //     ISTP: "Virtuoso - Bold and practical experimenters, masters of all kinds of tools",
  //     ISFP: "Adventurer - Flexible and charming artists, always ready to explore and experience something new",
  //     ESTP: "Entrepreneur - Smart, energetic and very perceptive people",
  //     ESFP: "Entertainer - Spontaneous, energetic and enthusiastic people",
  //   };
  //   return descriptions[mbtiType] || "Type description not available";
  // };
  const [modalVisible, setModalVisible] = React.useState(false);
  const [iconPosition, setIconPosition] = React.useState(null);
  const iconRef = React.useRef(null);
  const showModal = () => {
    let title = data.personality_type
     Alert.alert(
    title,
    data?.insights?.big_five_type_full || "No data available",
    [{ text: "OK", onPress: () => console.log("OK Pressed") }]
  );
  };
  return (
    <View style={styles.frameParent}>
      <View style={styles.frameGroup}>
        <View style={[styles.frameContainer, styles.frameFlexBox]}>
          <View style={styles.architectParent}>
              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
            <Text style={styles.architect}>
              {data.insights.maritime_title}
            </Text>
                          {data?.insights?.big_five_type_full &&
                <TouchableOpacity onPress={showModal}>
                  <Image
                    ref={iconRef}
                    style={{ width: 20, height: 20, backgroundColor: "transparent" }}
                    resizeMode="cover"
                    source={ImagesAssets.info_icon}
                  />
                </TouchableOpacity>}
             
            </View>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%" }}>

              <Text style={styles.intjT}>({data.personality_type})</Text>

            </View>
          </View>
          <View style={styles.akarIconsdotGridWrapper}>
            {/* <Image
              style={styles.akarIconsdotGrid}
              resizeMode="cover"
              tintColor="black"
              source={ImagesAssets.dots}
            /> */}
          </View>
        </View>
        <View style={styles.frameView}>
          <View style={[styles.frameWrapper, styles.frameFlexBox]}>
            <View style={styles.famousPeopleWithTheSameReParent}>
              <Text style={[styles.famousPeopleWith, styles.elonMuskTypo]}>
                Famous people with the same personality type
              </Text>
              <View style={styles.frameParent1}>
                {data.insights.famous_individuals.map((individual, index) => (
                  <View
                    key={index}
                    style={[
                      styles.imageParent,
                      styles.imageParentFlexBox,
                      {
                        height: 30,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <Text style={[styles.elonMusk, styles.elonMuskTypo]}>
                      {individual}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          {data.insights.compatibility && data.insights.compatibility.length > 0 && (
            <View style={[styles.frameWrapper, styles.frameFlexBox]}>
              <View style={styles.famousPeopleWithTheSameReParent}>
                <Text style={[styles.famousPeopleWith, styles.elonMuskTypo]}>
                  You are more compatible with
                </Text>
                <View style={styles.frameParent1}>
                  {data.insights.compatibility.map((individual, index) => (
                    <View style={styles.intjWrapper}>
                      <Text style={[styles.elonMusk, styles.elonMuskTypo]}>
                        {individual}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frameFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  elonMuskTypo: {
    fontFamily: "Poppins-Regular",
    // lineHeight: 14,
    fontSize: 12,
    // textAlign: "left",
    fontWeight: "500",
  },
  imageParentFlexBox: {
    // paddingRight: 16,
    borderRadius: 50,
    gap: 8,
    // alignItems: "center",
    // flexDirection: "row",
    paddingHorizontal: 10,
  },
  architect: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "left",
    color: "#262626",
    // fontFamily: "WhyteInktrap-Bold",
    fontWeight: "500",
    fontFamily: "Whyte-Inktrap-Regular",
  },
  intjT: {
    lineHeight: 17,
    // marginTop: -1,
    fontSize: 14,
    textAlign: "left",
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
    fontWeight: "500",
  },
  architectParent: {
    justifyContent: "center",
    // backgroundColor:'gray'
  },
  akarIconsdotGrid: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  akarIconsdotGridWrapper: {
    // borderRadius: 8,
    // backgroundColor: "rgba(255, 255, 255, 0.1)",
    // padding: 6,
    marginBottom: 40,
  },
  frameContainer: {
    alignItems: "center",
  },
  famousPeopleWith: {
    color: "#06361f",
  },
  imageIcon: {
    width: 32,
    height: 32,
  },
  elonMusk: {
    color: "#636363",
  },
  imageParent: {
    backgroundColor: "#b0db02",
  },
  imageParent2: {
    backgroundColor: "white",
  },
  frameParent1: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 8,
    flexDirection: "row",
    alignSelf: "stretch",
  },
  famousPeopleWithTheSameReParent: {
    gap: 8,
    justifyContent: "center",
    flex: 1,
  },
  frameWrapper: {
    alignItems: "flex-end",
  },
  intjWrapper: {
    paddingVertical: 10,
    backgroundColor: "#b0db02",
    borderRadius: 50,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  frameView: {
    gap: 24,
    alignSelf: "stretch",
  },
  frameGroup: {
    width: "100%",
    gap: 16,
  },
  frameParent: {
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    flex: 1,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    maxWidth: "80%",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "WhyteInktrap-Bold",
  },
  closeButton: {
    backgroundColor: "#b0db02",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ArchitectCard;
