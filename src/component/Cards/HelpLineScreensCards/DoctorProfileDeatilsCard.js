import * as React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { Border, FontSize, Color, FontFamily, Padding } from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";

const DoctorProfileDeatilsCard = ({ navigation, data }) => {
  return (
    <View style={[styles.frameParent, styles.frameFlexBox]}>
      <View style={[styles.frameGroup, styles.parentFlexBox]}>
        <View style={[styles.rectangleParent, styles.parentFlexBox]}>
          <View style={[styles.frameChild, styles.frameFlexBox]} />
          <Image
            style={styles.happyWhiteHairedMedicalDocIcon}
            resizeMode="cover"
            source={{ uri: data?.profileUrl }}
          />
        </View>
        <View style={styles.frameWrapper}>
          <Text style={styles.drStrange}>{data?.doctorName}</Text>
          <Text style={[styles.counselingPsychology, { fontSize: 12 }]}>
            {data?.expertise[0]?.length > 30
              ? data?.expertise[0]?.substring(0, 30) + "..."
              : data?.expertise[0]}
          </Text>
          <Text
            style={[styles.birminghamUk, styles.ratingTypo, { fontSize: 12, paddingTop: 4 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {data?.nationality}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frameFlexBox: {
    borderRadius: Border.br_5xl,
    flex: 1,
    alignSelf: "stretch",
  },
  parentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  ratingTypo: {
    fontSize: FontSize.captionC10Regular_size,
    color: Color.textText400,
    lineHeight: 10,
  },
  frameChild: {
    backgroundColor: "#d9d9d9",
    zIndex: 0,
    flex: 1,
  },
  happyWhiteHairedMedicalDocIcon: {
    position: "absolute",
    top: -1,
    left: 0,
    width: "100%",
    height: 85,
    zIndex: 1,
    borderRadius: 20,
  },
  rectangleParent: {
    width: "25%",
    height: 84,
  },
  drStrange: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FontFamily.whyteInktrap,
    color: "#262626",
    fontWeight: "500",
  },
  counselingPsychology: {
    fontSize: FontSize.labelL12Regular_size,
    color: Color.textText400,
    fontFamily: FontFamily.captionC10Regular,
  },
  birminghamUk: {
    fontSize: 12,
    fontWeight: "500",
  },
  frameWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    gap:8
  },
  frameGroup: {
    gap: 16,
    alignSelf: "stretch",
  },
  frameParent: {
    width: "100%",
    paddingLeft: Padding.p_5xs,
    paddingTop: Padding.p_5xs,
    paddingBottom: Padding.p_5xs,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
});

export default DoctorProfileDeatilsCard;