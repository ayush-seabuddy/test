import * as React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  FontSize,
  Color,
  FontFamily,
  Padding,
} from "../../../GlobalStyle";

const BookedAppoinmentCard = ({ navigation, data }) => {
  const [item, setitem] = React.useState(data);

  return (
    <TouchableOpacity
      style={[styles.frameParent, styles.frameFlexBox]}
      onPress={() => {
        navigation.navigate("BookedDoctorProfile", {
          item: item,
        });
      }}
    >
      <View style={[styles.frameGroup, styles.parentFlexBox]}>
        {/* Doctor Image */}
        <View style={[styles.rectangleParent, styles.parentFlexBox]}>
          {/* <View style={[styles.frameChild, styles.frameFlexBox]}> */}
          <Image
            style={styles.doctorImage}
            resizeMode="cover"
            source={{ uri: item?.doctorDetails?.profileUrl }}
          />
          {/* </View> */}
        </View>

        {/* Doctor Info */}
        <View style={styles.frameWrapper}>
          <View style={styles.drStrangeParent}>
            <Text style={styles.drStrange}>
              {item?.doctorDetails?.doctorName}
            </Text>
            <View style={styles.frameContainer}>
              <View style={styles.counselingPsychologyParent}>
                {item?.doctorDetails?.country && (
                  <Text
                    style={[styles.birminghamUk, styles.ratingTypo, { fontSize: 14 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item?.doctorDetails?.country}
                  </Text>
                )}
                <Text
                  style={[styles.birminghamUk, styles.ratingTypo]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.doctorDetails?.language.map((quali, index) => {
                    if (index === item?.doctorDetails?.language.length - 1) return quali;
                    else return quali + ", ";
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  frameFlexBox: {
    borderRadius: 50,
    flex: 1,
    alignSelf: "stretch",
  },
  parentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  ratingTypo: {
    fontSize: 12,
    color: Color.textText400,
    lineHeight: 14,
  },
  frameChild: {
    backgroundColor: "#d9d9d9",
    width: 90,
    height: 90,
    borderRadius: 53.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  birminghamUk: {
    fontFamily: FontFamily.captionC10Medium,
    fontSize: FontSize.captionC10Regular_size,
    fontWeight: "500",
    paddingRight: 10,
  },
  doctorImage: {
    width: 90,
    height: "100%",
    borderRadius: 53.5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  rectangleParent: {
    width: "30%",
    height: 90,
  },
  drStrange: {
    fontSize: 14,
    lineHeight: 10,
    fontFamily: FontFamily.whyteInktrap,
    color: "#262626",
    paddingTop: 20,
    alignSelf: "stretch",
  },
  counselingPsychology: {
    fontSize: 12,
    color: Color.textText400,
    fontFamily: FontFamily.captionC10Regular,
  },
  counselingPsychologyParent: {
    alignSelf: "stretch",
    marginTop: 4,
  },
  frameContainer: {
    alignSelf: "stretch",
  },
  drStrangeParent: {
    flex: 1,
    gap: 2,
    alignItems: "center",
  },
  frameWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "start",
  },
  frameGroup: {
    gap: 16,
    paddingHorizontal: 10,
    alignSelf: "stretch",
  },
  frameParent: {
    width: "100%",
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
  },
});

export default BookedAppoinmentCard;
