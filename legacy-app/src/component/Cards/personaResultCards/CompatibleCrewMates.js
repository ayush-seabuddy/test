import * as React from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
import { GlassView } from "@metafic-co/react-native-glassmorphism";
const CompatibleCrewMates = ({ data }) => {
  const crewMember = data?.insights?.compatible_crew_mates;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const rotation = React.useRef(new Animated.Value(0)).current;

  const toggleView = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(rotation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateIcon = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.crew}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={30}
        reducedTransparencyFallbackColor="white"
      />
      <View style={styles.frameParent}>
        {/* Header with Title and Dropdown Icon */}
        <View
          style={[styles.compatibleCrewMatesParent, styles.crewParentFlexBox]}
        >
          <Text style={styles.compatibleCrewMates}>Compatible Crew Mates</Text>
          <TouchableOpacity
            onPress={toggleView}
            style={[styles.baseIconsWrapper, styles.crewParentFlexBox]}
          >
            <Animated.Image
              style={[
                styles.baseIcons,
                { transform: [{ rotate: rotateIcon }] },
              ]}
              resizeMode="cover"
              source={ImagesAssets.dropdown_icon}
            />
          </TouchableOpacity>
        </View>
        {!isExpanded && (
          <View style={styles.crewParentFlexBox}>
            {crewMember &&
              crewMember
                .slice(0, 2)
                .map((member) => (
                  <Image
                    key={member.id}
                    style={styles.crewLayout}
                    resizeMode="cover"
                    source={{ uri: member.profileUrl }}
                  />
                ))}
            {crewMember.length > 2 && (
              <View style={[styles.frameGroup, styles.crewParentFlexBox]}>
                <View style={[styles.imageParent, styles.crewParentFlexBox]}>
                  <TouchableOpacity onPress={toggleView}>
                    <Image
                      style={styles.crewLayout}
                      resizeMode="cover"
                      source={ImagesAssets.ellipsimage}
                    />
                    <View style={styles.overlayLayer} />
                  </TouchableOpacity>
                  <Text style={[styles.more, styles.moreTypo]}>
                    +{crewMember.length - 2} More
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        {isExpanded && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 5,
            }}
          >
            {crewMember.map((member) => (
              <Image
                key={member.id}
                style={{ height: 50, width: 50, borderRadius: 25 }}
                resizeMode="cover"
                source={{ uri: member.profileUrl }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  crewParentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  crewLayout: {
    height: 32,
    width: 32,
    borderRadius: 16,
    marginRight: 2,
  },
  moreTypo: {
    lineHeight: 14,
    fontSize: 12,
    textAlign: "left",
  },
  compatibleCrewMates: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: "left",
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
    fontWeight: "500",
  },
  baseIcons: {
    width: 16,
    height: 16,
    overflow: "hidden",
  },
  baseIconsWrapper: {
    borderRadius: 8,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  compatibleCrewMatesParent: {
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  crewItem: {
    marginLeft: -12,
  },
  more: {
    fontFamily: "Poppins-Regular",
    color: "#636363",
    fontWeight: "500",
    lineHeight: 14,
    fontSize: 12,
  },
  imageParent: {
    borderRadius: 50,
    backgroundColor: "#e8e8e8",
    paddingRight: 16,
    gap: 8,
    zIndex: 0,
  },
  text: {
    position: "absolute",
    top: 10,
    left: 9,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    zIndex: 1,
  },
  frameGroup: {
    marginLeft: -12,
  },
  frameParent: {
    width: "100%",
    gap: 24,
  },
  crew: {
    borderRadius: 32,
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#06361FE5",
    borderRadius: 50,
  },
  overlayText: {
    position: "absolute",
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    top: "13%",
    left: "30%",
  },
});

export default CompatibleCrewMates;
