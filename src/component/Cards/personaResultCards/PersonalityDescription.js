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
  Border,
  Gap,
  Color,
  FontSize,
  FontFamily,
} from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
const PersonalityDescription = ({ data }) => {
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
  const numberOfLinesToShow = 135;

  return (
    <View style={styles.personalTraits}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={30}
        reducedTransparencyFallbackColor="white"
      />
      <View style={styles.frameParent}>
        <View
          style={[
            styles.personalityTraitsParent,
            styles.baseIconsWrapperFlexBox,
          ]}
        >
          <Text style={styles.personalityTraits}>Personality Description</Text>
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
            {data?.insights?.description
              ?.slice(0, numberOfLinesToShow)}
          </Text>
        )}
        {isExpanded && (
          <View style={styles.frameGroupFlexBox}>
            <Text style={styles.asAnIntj}>
              {data?.insights?.description}
            </Text>
            {/* <View
              style={[
                styles.introvertedParent,
                styles.baseIconsWrapperSpaceBlock,
              ]}
            >
              <Text style={styles.introverted}>
                <Text style={styles.text}>54%</Text>
                <Text style={styles.introverted1}> Introverted</Text>
              </Text>
              <View style={[styles.frameChild, styles.frameChildLayout]} />
              <View
                style={[styles.extravertedParent, styles.frameGroupFlexBox]}
              >
                <Text style={[styles.extraverted, styles.extravertedTypo]}>
                  Extraverted
                </Text>
                <Text style={[styles.introverted2, styles.extravertedTypo]}>
                  Introverted
                </Text>
              </View>
              <Image
                style={[styles.frameItem, styles.frameChildPosition]}
                resizeMode="cover"
                source={ImagesAssets.progress_eclips_img_1}
              />
            </View>
            <View
              style={[
                styles.introvertedParent,
                styles.baseIconsWrapperSpaceBlock,
              ]}
            >
              <Text style={styles.introverted}>
                <Text style={styles.text1}>67%</Text>
                <Text style={styles.introverted1}> Intuitive</Text>
              </Text>
              <View style={[styles.frameInner, styles.frameChildLayout]} />
              <View
                style={[styles.extravertedParent, styles.frameGroupFlexBox]}
              >
                <Text style={[styles.extraverted, styles.extravertedTypo]}>
                  Intuitive
                </Text>
                <Text style={[styles.introverted2, styles.extravertedTypo]}>
                  Observant
                </Text>
              </View>
              <Image
                style={[styles.ellipseIcon, styles.frameChildPosition]}
                resizeMode="cover"
                source={ImagesAssets.progress_eclips_img_2}
              />
            </View>
            <View
              style={[
                styles.introvertedParent,
                styles.baseIconsWrapperSpaceBlock,
              ]}
            >
              <Text style={styles.introverted}>
                <Text style={styles.text2}>64%</Text>
                <Text style={styles.introverted1}> Thinking</Text>
              </Text>
              <View style={[styles.rectangleView, styles.frameChildLayout]} />
              <View
                style={[styles.extravertedParent, styles.frameGroupFlexBox]}
              >
                <Text style={[styles.extraverted, styles.extravertedTypo]}>
                  Thinking
                </Text>
                <Text style={[styles.introverted2, styles.extravertedTypo]}>
                  Feeling
                </Text>
              </View>
              <Image
                style={[styles.frameChild1, styles.frameChildPosition]}
                resizeMode="cover"
                source={ImagesAssets.progress_eclips_img_3}
              />
            </View>
            <View
              style={[
                styles.introvertedParent,
                styles.baseIconsWrapperSpaceBlock,
              ]}
            >
              <Text style={styles.introverted}>
                <Text style={styles.text3}>68%</Text>
                <Text style={styles.introverted1}> Judging</Text>
              </Text>
              <View style={[styles.frameChild2, styles.frameChildLayout]} />
              <View
                style={[styles.extravertedParent, styles.frameGroupFlexBox]}
              >
                <Text style={[styles.extraverted, styles.extravertedTypo]}>
                  Judging
                </Text>
                <Text style={[styles.introverted2, styles.extravertedTypo]}>
                  Prospecting
                </Text>
              </View>
              <Image
                style={[styles.frameChild3, styles.frameChildPosition]}
                resizeMode="cover"
                source={ImagesAssets.progress_eclips_img_4}
              />
            </View>
            <View
              style={[
                styles.introvertedParent,
                styles.baseIconsWrapperSpaceBlock,
              ]}
            >
              <Text style={styles.introverted}>
                <Text style={styles.text4}>68%</Text>
                <Text style={styles.introverted1}> Turbulent</Text>
              </Text>
              <View style={[styles.frameChild4, styles.frameChildLayout]} />
              <View
                style={[styles.extravertedParent, styles.frameGroupFlexBox]}
              >
                <Text style={[styles.extraverted, styles.extravertedTypo]}>
                  Assertive
                </Text>
                <Text style={[styles.introverted2, styles.extravertedTypo]}>
                  Turbulent
                </Text>
              </View>
              <Image
                style={[styles.frameChild3, styles.frameChildPosition]}
                resizeMode="cover"
                source={ImagesAssets.progress_eclips_img_5}
              />
            </View> */}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  baseIconsWrapperFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  baseIconsWrapperSpaceBlock: {
    padding: Padding.p_5xs,
    borderRadius: Border.br_5xs,
  },
  frameChildLayout: {
    zIndex: 1,
    height: 10,
    borderRadius: Border.br_11xl,
    alignSelf: "stretch",
  },
  frameGroupFlexBox: {
    gap: Gap.gap_md,
    alignSelf: "stretch",
  },
  extravertedTypo: {
    color: Color.textText300,
    lineHeight: 14,
    fontSize: FontSize.captionC10Regular_size,
    fontFamily: FontFamily.captionC10Regular,
    flex: 1,
  },
  frameChildPosition: {
    zIndex: 3,
    width: 10,
    top: 33,
    position: "absolute",
    height: 10,
  },
  personalityTraits: {
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
  personalityTraitsParent: {
    justifyContent: "space-between",
    alignSelf: "stretch",
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
  text: {
    color: Color.colorCadetblue,
  },
  introverted1: {
    color: "black",
  },
  introverted: {
    fontWeight: "600",
    fontFamily: FontFamily.bodyB14SemiBold,
    zIndex: 0,
    lineHeight: 21,
    fontSize: FontSize.bodyB14SemiBold_size,
    textAlign: "left",
    width: "100%",
  },
  frameChild: {
    backgroundColor: Color.colorCadetblue,
  },
  extraverted: {
    textAlign: "left",
  },
  introverted2: {
    textAlign: "right",
  },
  extravertedParent: {
    zIndex: 2,
    flexDirection: "row",
    gap: Gap.gap_md,
  },
  frameItem: {
    left: "54%",
  },
  introvertedParent: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    gap: Gap.gap_sm,
    alignSelf: "stretch",
  },
  text1: {
    color: Color.colorYellowgreen,
  },
  frameInner: {
    backgroundColor: Color.colorYellowgreen,
  },
  ellipseIcon: {
    left: "67%",
  },
  text2: {
    color: Color.colorLimegreen,
  },
  rectangleView: {
    backgroundColor: Color.colorLimegreen,
  },
  frameChild1: {
    left: "64%",
  },
  text3: {
    color: Color.colorBlueviolet,
  },
  frameChild2: {
    backgroundColor: Color.colorBlueviolet,
  },
  frameChild3: {
    left: "68%",
  },
  text4: {
    color: Color.colorMediumvioletred,
  },
  frameChild4: {
    backgroundColor: Color.colorMediumvioletred,
  },
  frameParent: {
    gap: 16,
    width: "100%",
  },
  personalTraits: {
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

export default PersonalityDescription;
