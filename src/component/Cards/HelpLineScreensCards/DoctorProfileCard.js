import * as React from "react";
import { Text, StyleSheet, View, Image, Dimensions, TouchableOpacity } from "react-native";
import {
  FontSize,
  Color,
  FontFamily,
  Padding,
  Border,
} from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
import { ScrollView } from "react-native-gesture-handler";
import Colors from "../../../colors/Colors";
const { width } = Dimensions.get("window");
const DoctorProfileCard = ({ data }) => {
  const [expanded, setExpanded] = React.useState(false);
  const maxLength = 300;


  const isLong = data?.description.length > maxLength;
  const displayText = expanded || !isLong ? data?.description : data?.description.substring(0, maxLength) + '...';

  return (

    <View style={styles.frameParent}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <View style={styles.frameGroup}>
        <View style={styles.frameWrapper}>
          <View style={styles.drStrangeParent}>
            <Text style={styles.drStrange}>{data?.doctorName}</Text>
            {data?.contactDetails &&
              <Text style={{ fontSize: 12, fontFamily: "poppins-regular", lineHeight: 15 }}>
                {data?.contactDetails}
              </Text>
            }
            <Text
              style={[styles.drStrange, { fontSize: 18, lineHeight: 20, marginTop: 25 }]}
            >
              Details
            </Text>
            {data?.language && <Text style={{ fontSize: 12, marginTop: 10, fontFamily: "poppins-regular", lineHeight: 15 }}>
              <Text
                style={[styles.drStrange, { fontSize: 13 }]}
              >
                Languages:{" "}
              </Text> {data?.language.map((quali, index) => {
                if (index == data?.language.length - 1) return quali
                else return quali + ", "
              })}
            </Text>}
            <View style={styles.frameContainer}>
              <View style={[styles.counselingPsychologyParent]}>
                {data?.expertise.length > 0 &&
                  <Text style={[styles.counselingPsychology, { fontSize: 12, marginTop: 5, fontFamily: "poppins-regular", lineHeight: 15 }]}>
                    <Text
                      style={[styles.drStrange, { fontSize: 13 }]}
                    >
                      Specialization:{" "}
                    </Text>
                    {data?.expertise.map((quali, index) => {
                      if (index == data?.expertise.length - 1) return quali
                      else return quali + " , "
                    })}
                  </Text>
                }
                <Text style={[styles.counselingPsychology, { fontSize: 12, fontFamily: "poppins-regular", lineHeight: 15 }]}>
                  <Text
                    style={[styles.drStrange, { fontSize: 13, lineHeight: 22 }]}
                  >
                    Experience:{" "}
                  </Text>
                  {data?.experience}
                </Text>

                {data?.nationality && <Text style={[styles.counselingPsychology, { fontSize: 12, fontFamily: "poppins-regular", lineHeight: 15 }]}>
                  <Text
                    style={[styles.drStrange, { fontSize: 13, lineHeight: 22 }]}
                  >
                    Nationality:{"  "}
                  </Text>
                  {data?.nationality}
                </Text>}



                {/* {data?.qualification?.length > 0 && 
                <Text style={{fontSize:12, marginTop:5,fontFamily: "poppins-regular" , lineHeight:15}}>
                   <Text
                    style={[styles.drStrange, { fontSize: 13 , lineHeight: 22 }]}
                  >
                    Qualifications:{" "}
                  </Text>
                  {data?.qualification.map((quali, index) =>{ 
                    if(index == data?.qualification.length - 1) return quali
                    else return quali + " , "
                    })}
                </Text>
                } */}
                <Text
                  style={[styles.drStrange, { fontSize: 17, lineHeight: 19, marginTop: 10 }]}
                >
                  About your wellness officer
                </Text>
                <Text style={[styles.birminghamUk, styles.ratingTypo, { fontSize: 12, marginTop: 2, fontFamily: "poppins-regular", lineHeight: 19, textAlign: "justify" }]}>

                  {displayText}
                </Text>
                {isLong && (
                  <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ width: "100%", alignItems: "flex-end", }}>
                    <Text style={{ color: Colors.green, marginBottom: 20, }}>
                      {expanded ? '- Read less' : '+ Read more'}
                    </Text>

                  </TouchableOpacity>
                )}
              </View>
              {/* <View style={styles.frameView}>
                <View style={styles.starIconParent}>
                  <Image
                    style={styles.starIcon}
                    resizeMode="cover"
                    source={ImagesAssets.Star}
                  />
                  <Text style={[styles.rating, styles.ratingTypo]}>
                    {data?.rating} Rating
                  </Text>
                </View>
              </View> */}
            </View>
          </View>
        </View>
        <View style={styles.frameParent1}>
          <View style={styles.akarIconsdotGridWrapper}>
            {/* <Image
              style={styles.akarIconsdotGrid}
              resizeMode="cover"
              source={ImagesAssets.dots}
            /> */}
          </View>
          {/* <Image
            style={styles.iconLike}
            resizeMode="cover"
            source={ImagesAssets.likeicon}
          /> */}
        </View>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  ratingTypo: {
    fontSize: FontSize.captionC10Regular_size,
    color: Color.textText400,
    lineHeight: 14,
    textAlign: "left",
  },
  drStrange: {
    fontSize: 21,
    lineHeight: 24,
    fontFamily: FontFamily.whyteInktrap,
    color: "#262626",
    textAlign: "left",
    fontWeight: "500",
    alignSelf: "stretch",
  },
  counselingPsychology: {
    fontSize: FontSize.labelL12Regular_size,
    color: Color.textText400,

    fontFamily: FontFamily.captionC10Regular,

    alignSelf: "stretch",
  },
  birminghamUk: {
    fontFamily: FontFamily.captionC10Medium,
    fontSize: FontSize.captionC10Regular_size,
    fontWeight: "500",
  },
  counselingPsychologyParent: {
    gap: 4,
    alignSelf: "stretch",
  },
  starIcon: {
    width: 16,
    height: 16,
    overflow: "hidden",
  },
  rating: {
    fontFamily: FontFamily.captionC10Regular,
    fontSize: FontSize.captionC10Regular_size,
  },
  starIconParent: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: 101,
    padding: Padding.p_5xs,
    gap: 8,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: Border.br_13xl,
  },
  frameView: {
    alignItems: "center",
    flexDirection: "row",
  },
  frameContainer: {
    gap: 24,
    alignSelf: "stretch",
  },
  drStrangeParent: {
    alignSelf: "stretch",
  },
  frameWrapper: {
    paddingTop: Padding.p_5xs,
    flex: 1,
  },
  akarIconsdotGrid: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  akarIconsdotGridWrapper: {
    borderRadius: 8,
    backgroundColor: "rgba(157, 157, 157, 0.1)",
    padding: 6,
    alignItems: "center",
    flexDirection: "row",
  },
  iconLike: {
    width: 24,
    height: 24,
    overflow: "hidden",
  },
  frameParent1: {
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  frameGroup: {
    width: width * 0.84,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    width: "100%",
    paddingHorizontal: 23,
    paddingVertical: 25,
    borderRadius: Border.br_13xl,
    alignSelf: "stretch",
    overflow: "hidden", // Ensures blur is contained within the rounded border
  },
});

export default DoctorProfileCard;
