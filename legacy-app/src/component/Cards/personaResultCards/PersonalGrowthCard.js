import * as React from "react";
import {Text, StyleSheet, Image, View,TouchableOpacity,Animated} from "react-native";
import { Padding, Color, FontFamily, Gap, FontSize, Border } from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
const PersonalGrowthCard = () => {
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
  	return (
    		<View style={styles.personalGrowth}>
				     <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} reducedTransparencyFallbackColor="white" />
      			<View style={styles.parentFlexBox}>
        				<View style={[styles.yourPersonalGrowthParent, styles.yourSpaceBlock]}>
          					<Text style={[styles.yourPersonalGrowth, styles.selfImproverTypo]}>Your Personal Growth</Text>
                              <TouchableOpacity 
                        style={[styles.baseIconsWrapper, styles.baseIconsWrapperSpaceBlock]} 
                        onPress={toggleExpand}
                    >
                        <Animated.Image 
                            style={[styles.baseIcons, { transform: [{ rotate: rotateIcon }] }]} 
                            resizeMode="cover" 
                            source={ImagesAssets.dropdown_icon} 
                        />
                    </TouchableOpacity>
        				</View>
                        {!isExpanded && (
                        <Text style={[styles.yourPathTo, styles.yourTypo1]}>{`Your path to personal growth is paved with intellectual pursuits and self-reflection. You’re constantly seeking to expand your knowled...`}</Text>
                        )}
                         {isExpanded && (
        		     <View>
                     <View style={[styles.yourPathToPersonalGrowthIWrapper, styles.yourWrapperFlexBox]}>
          					<Text style={[styles.yourPathTo, styles.yourTypo1]}>{`Your path to personal growth is paved with intellectual pursuits and self-reflection. You’re constantly seeking to expand your knowledge and improve your skills, driven by an internal desire for mastery. This quest for self-improvement often leads you to explore diverse subjects and challenge your own assumptions, fostering a rich inner life.

          					Yet, true personal growth for you also involves developing your emotional intelligence and interpersonal skills. While it may feel uncomfortable at first, learning to recognize and express your emotions, as well as understanding those of others, can greatly enhance your relationships and overall life satisfaction. Balancing your logical approach with emotional awareness is key to becoming a well-rounded individual.`}</Text>
      			</View>
      			<View style={[styles.yourStrengthsParent, styles.parentFlexBox]}>
        				<Text style={[styles.yourStrengths, styles.yourTypo]}>Your Strengths</Text>
        				<View style={styles.frameGroupFlexBox}>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon}/>
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Self-Improver</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>Your constant quest for knowledge fuels personal growth.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon}/>
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Long-Term Planner</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>Your ability to set and pursue ambitious goals propels your personal development.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon}/>
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Rational Thinker</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>You excel at objectively analyzing your own thoughts and behaviors.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon} />
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Curious Learner</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>Your thirst for knowledge keeps you engaged and growing throughout life.</Text>
            						</View>
          					</View>
        				</View>
      			</View>
      			<View style={[styles.yourStrengthsParent, styles.parentFlexBox]}>
        				<Text style={[styles.yourWeaknesses, styles.yourTypo]}>Your Weaknesses</Text>
        				<View style={styles.frameGroupFlexBox}>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon}/>
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Emotionally Distant</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>You may overlook the importance of emotional intelligence in your growth journey.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon} />
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Pursuit of Perfection</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>Your high standards might lead to unnecessary stress and self-criticism.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon} />
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Overthinker</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>Your tendency to analyze can sometimes prevent you from taking action.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameGroupFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon} />
              							<Text style={[styles.selfImprover, styles.yourPathToLayout]}>Control Seeker</Text>
            						</View>
            						<View style={[styles.yourConstantQuestForKnowleWrapper, styles.yourWrapperFlexBox]}>
              							<Text style={[styles.yourConstantQuest, styles.yourTypo1]}>Your need for certainty can limit your ability to adapt and grow in uncertain situations.</Text>
            						</View>
          					</View>
        				</View>
      			</View>
                     </View>
                        )}
    		</View>
  	</View>);
};

const styles = StyleSheet.create({
yourSpaceBlock: {
  	paddingVertical: 0,
  	paddingHorizontal: Padding.p_5xs
},
selfImproverTypo: {
  	textAlign: "left",
  	color: "black",
  	fontWeight: "500"
},
baseParentFlexBox: {
  	alignItems: "center",
  	flexDirection: "row"
},
yourWrapperFlexBox: {
  	justifyContent: "center",
  	alignItems: "center",
  	alignSelf: "stretch"
},
yourTypo1: {
  	fontFamily: FontFamily.bodyB12Regular,
  	textAlign: "left",
  	color: "black"
},
parentFlexBox: {
  	gap: Gap.gap_lg,
  	alignSelf: "stretch"
},
yourTypo: {
  	width: "100%",
  	fontFamily: FontFamily.bodyB12Regular,
  	lineHeight: 21,
  	fontSize: FontSize.bodyB14Medium_size,
  	textAlign: "left"
},
frameGroupFlexBox: {
  	gap: Gap.gap_md,
  	alignSelf: "stretch"
},
yourPathToLayout: {
  	lineHeight: 21,
  	fontSize: FontSize.bodyB14Medium_size
},
yourPersonalGrowth: {
  	fontSize: 18,
  	lineHeight: 25,
  	fontFamily: FontFamily.whyteInktrap
},
baseIcons: {
  	width: 16,
  	height: 16,
  	overflow: "hidden"
},
baseIconsWrapper: {
  	borderRadius: 8,
  	backgroundColor: "rgba(255, 255, 255, 0.6)",
  	padding: Padding.p_5xs
},
yourPersonalGrowthParent: {
  	justifyContent: "space-between",
  	alignItems: "center",
  	flexDirection: "row",
  	alignSelf: "stretch"
},
yourPathTo: {
  	lineHeight: 21,
  	fontSize: FontSize.bodyB14Medium_size,
  	alignSelf: "stretch",
	  marginBottom: 7,
  	paddingHorizontal: Padding.p_5xs
},
yourPathToPersonalGrowthIWrapper: {
  	paddingVertical: 0,
  	paddingHorizontal: Padding.p_5xs
},
yourStrengths: {
  	color: Color.primaryNightlyWoodsNormal
},
selfImprover: {
  	fontFamily: FontFamily.bodyB14Medium,
  	textAlign: "left",
  	color: "black",
  	fontWeight: "500",
  	flex: 1
},
baseIconsParent: {
  	alignItems: "center",
  	flexDirection: "row"
},
yourConstantQuest: {
  	fontSize: FontSize.bodyB12Regular_size,
  	lineHeight: 18,
  	flex: 1
},
yourConstantQuestForKnowleWrapper: {
  	paddingLeft: Padding.p_5xl,
  	flexDirection: "row",
  	justifyContent: "center"
},
frameContainer: {
  	gap: Gap.gap_sm,
  	alignSelf: "stretch"
},
yourStrengthsParent: {
  	borderRadius: Border.br_5xl,
  	backgroundColor: Color.colorGray_200,
  	padding: Padding.p_base,
	marginHorizontal:5
},
yourWeaknesses: {
  	color: Color.primaryLemonPunchNormalHover
},
personalGrowth: {
  	borderRadius: 32,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
  	width: "100%",
  	paddingTop: Padding.p_5xl,
  	paddingBottom: Padding.p_base,
  	paddingHorizontal: Padding.p_5xs,
  	flex: 1,
	overflow:"hidden"
}
});

export default PersonalGrowthCard;
