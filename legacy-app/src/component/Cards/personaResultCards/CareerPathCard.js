import * as React from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  Padding,
  FontSize,
  Color,
  Gap,
  FontFamily,
  Border,
} from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
const CareerPathCard = ({ data }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [rotateAnimation] = React.useState(new Animated.Value(0));

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);

    Animated.timing(rotateAnimation, {
      toValue: isExpanded ? 0 : 1, // Toggle between 0 and 1 for rotation
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Rotate dropdown icon 180 degrees when expanded
  const rotateIcon = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const numberOfLinesToShow = 1;

  return (
    <View style={styles.careerPath}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={30}
        reducedTransparencyFallbackColor="white"
      />
      <View style={styles.parentFlexBox}>
        <View
          style={[styles.careerPathParent, styles.careerPathParentSpaceBlock]}
        >
          <Text style={styles.careerPath1}>Career Path</Text>
          <TouchableOpacity
            style={[styles.baseIconsWrapper, styles.baseIconsWrapperSpaceBlock]}
            onPress={toggleExpand}
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
          <Text style={styles.asAnIntj}>
            {Object.entries(data?.insights?.career_path || {})
              .slice(0, numberOfLinesToShow)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n")}
          </Text>
        )}
        {isExpanded && (
          <View style={styles.frameGroupFlexBox}>
            {Object.entries(data?.insights?.career_path || {}).map(([heading, text]) => (
              <View key={heading} style={{ marginBottom: 10, width: '100%' }}>
                <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: 'bold', flexWrap: 'wrap' }}>
                  {heading}
                </Text>
                <Text style={styles.asAnIntj}>
                  {text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  careerPathParentSpaceBlock: {
    alignItems: "center",
    flexDirection: "row",
  },
  baseParentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  baseIconsWrapperSpaceBlock: {
    padding: Padding.p_5xs,
    borderRadius: Border.br_5xs,
  },
  youWrapperFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  demandingTypo1: {
    lineHeight: 21,
    fontSize: 16,
    textAlign: "left",
    color: "black",
  },
  parentFlexBox: {
    gap: 16,
    width: "100%",
  },
  yourLayout: {
    width: "100%",
    lineHeight: 21,
    fontSize: FontSize.bodyB14Regular_size,
    textAlign: "left",
  },
  demandingTypo: {
    fontFamily: FontFamily.bodyB14Medium,
    fontWeight: "500",
  },
  youExcelAtTypo: {
    fontSize: FontSize.bodyB12Regular_size,
    textAlign: "left",
  },
  careerPath1: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "500",
    fontFamily: FontFamily.whyteInktrap,
    textAlign: "left",
    color: "black",
  },
  baseIcons: {
    width: 16,
    height: 16,
    overflow: "hidden",
  },
  baseIconsWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    flexDirection: "row",
  },
  careerPathParent: {
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  inYourProfessional: {
    fontFamily: FontFamily.bodyB14Regular,
    alignSelf: "stretch",
  },
  inYourProfessionalLifeYouWrapper: {
    paddingVertical: 0,
    paddingHorizontal: Padding.p_5xs,
  },
  yourStrengths: {
    color: Color.primaryNightlyWoodsNormal,
    fontFamily: FontFamily.bodyB14Regular,
  },
  strategicVisionary: {
    width: "100%",
    lineHeight: 21,
    fontSize: FontSize.bodyB14Regular_size,
    textAlign: "left",
    color: "black",
  },
  frameGroupFlexBox: {
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  baseIconsParent: {
    gap: Gap.gap_md,
  },
  youExcelAt: {
    lineHeight: 18,
    fontFamily: FontFamily.bodyB14Regular,
    color: "black",
    flex: 1,
  },
  youExcelAtSeeingTheBigPiWrapper: {
    paddingLeft: Padding.p_5xl,
    flexDirection: "row",
  },
  frameContainer: {
    gap: Gap.gap_sm,
    alignSelf: "stretch",
  },
  frameGroup: {
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  yourStrengthsParent: {
    borderRadius: Border.br_5xl,
    backgroundColor: "white",
    padding: Padding.p_base,
    marginVertical: 5,
  },
  asAnIntj: {
    fontFamily: FontFamily.captionC10Regular,
    lineHeight: 21,
    fontSize: FontSize.bodyB14SemiBold_size,
    textAlign: "left",
    color: "black",
    width: "100%",
    marginBottom: 7,
  },
  yourWeaknesses: {
    color: Color.primaryLemonPunchNormalHover,
    fontFamily: FontFamily.bodyB14Regular,
  },
  demanding: {
    lineHeight: 21,
    fontSize: FontSize.bodyB14Regular_size,
    textAlign: "left",
    color: "black",
    flex: 1,
  },
  baseIconsParent2: {
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  influentialTraits: {
    color: Color.textText500,
    fontFamily: FontFamily.bodyB14Regular,
  },
  perfectionism: {
    lineHeight: 14,
    color: Color.textText300,
    fontFamily: FontFamily.bodyB14Medium,
    fontWeight: "500",
  },
  perfectionismWrapper: {
    borderRadius: Border.br_31xl,
    backgroundColor: Color.primaryKingLimeNormal,
    paddingHorizontal: Padding.p_base,
    paddingVertical: Padding.p_3xs,
  },
  frameParent8: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: Gap.gap_md,
    flexDirection: "row",
    alignSelf: "stretch",
  },
  careerPath: {
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: "100%",
    paddingHorizontal: Padding.p_base,
    paddingTop: 24,
    paddingBottom: Padding.p_base,
    flex: 1,
    overflow: "hidden",
  },
});

export default CareerPathCard;
