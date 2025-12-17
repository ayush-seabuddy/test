import { Image } from "expo-image";
import { router } from "expo-router";
import * as React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";


export interface WellnessOfficer {
  id?: string;
  doctorName?: string;
  description?: string;
  specialization?: string;
  experience?: string;
  expertise?: string[];
  qualification?: string[];
  language?: string[];
  nationality?: string;
  rating?: string;
  status?: string;

  address?: string;
  country?: string;
  contactDetails?: string;
  phoneNumber?: string | null;

  profileUrl?: string;

  certificates?: any[];

  createdAt?: string;
  updatedAt?: string;

  [key: string]: any; // additional dynamic fields
}


const WellnessOfficerCard = ({  data }:WellnessOfficer) => {
  console.log("data: ", data);
  const [item, setitem] = React.useState(data);
  return (
    <TouchableOpacity
      style={[styles.frameParent, styles.frameFlexBox]}
      onPress={() => {
        router.push({
          pathname: "/wellnessOfficerProfile",
          params: {
            item: JSON.stringify(item),
          },
        })
        
      }}
    >
      <View style={[styles.frameGroup, styles.parentFlexBox]}>
        <View style={[styles.rectangleParent, styles.parentFlexBox]}>
          <View style={[styles.frameChild, styles.frameFlexBox]}>
            <Image
              style={styles.happyWhiteHairedMedicalDocIcon}
              resizeMode="cover" // Changed to "cover" for better fit in a circle
              source={{ uri: item?.profileUrl }}
            />
          </View>
        </View>
        <View style={styles.frameWrapper}>
          <View style={styles.drStrangeParent}>
            <Text style={styles.drStrange}>{item?.doctorName}</Text>
            <View style={styles.frameContainer}>
              <View style={styles.counselingPsychologyParent}>
                {item?.country && (
                  <Text
                    style={[styles.birminghamUk, styles.ratingTypo, { fontSize: 12 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item?.country}
                  </Text>
                )}
                <Text
                  style={[styles.birminghamUk, styles.ratingTypo]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.language.map((quali: string, index: number) => {
                    if (index === item?.language.length - 1) return quali;
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
    // fontSize: FontSize.captionC10Regular_size,
    // color: Color.textText400,
    lineHeight: 18,
    fontSize: 11,
  },
  frameChild: {
    backgroundColor: "#d9d9d9",
    width: 90, // Equal width and height for a square base
    height: 90, // Equal width and height for a square base
    borderRadius: 53.5, // Half of width/height for a circle
    overflow: "hidden", // Ensures content is clipped to the circular shape
    justifyContent: "center",
    alignItems: "center",
   
  },
  happyWhiteHairedMedicalDocIcon: {
    width: 90,
    height: "100%",
    borderRadius: 53.5, // Half of width/height for a circle
     borderWidth: 2,
    borderColor: "#fff",
  },
  rectangleParent: {
    width: "30%",
    height: 90,
  },
  drStrange: {
    fontSize: 15,
    lineHeight:15,
    // fontFamily: FontFamily.bodyB14SemiBold,
    color: "#262626",
    paddingTop: 20,
    alignSelf: "stretch",
  },
  birminghamUk: {
    fontFamily: 'Poppins-Regular',
    // fontSize: FontSize.captionC10Regular_size,
    paddingRight: 10,
  },
  counselingPsychologyParent: {
    gap: 4,
    alignSelf: "stretch",
  },
  frameContainer: {
    gap: 20,
    alignSelf: "stretch",
  },
  drStrangeParent: {
    flex: 1,
    gap: 4,
    alignItems: "center",
  },
  frameWrapper: {
    flex: 1,
    justifyContent: "space-evenly",
    // alignItems: "start",
  },
  frameGroup: {
    gap: 16,
    alignSelf: "stretch",
  },
  frameParent: {
    width: "100%",
    // paddingLeft: Padding.p_5xs,
    paddingTop: 5,
    paddingBottom: 5,
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
});

export default WellnessOfficerCard;