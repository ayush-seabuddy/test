import * as React from "react";
import {Text, StyleSheet, Image, View,Animated,TouchableOpacity} from "react-native";
import { Padding, FontFamily, Color, Gap, FontSize, Border } from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
const RelationshipsCard = () => {
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
    		<View style={styles.relationships}>
				     <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} reducedTransparencyFallbackColor="white" />
      			<View style={styles.parentFlexBox}>
        				<View style={[styles.yourRelationshipsParent, styles.yourSpaceBlock]}>
          					<Text style={styles.yourRelationships}>Your Relationships</Text>
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
                <Text style={[styles.inYourRelationships, styles.onceCommittedYoureTypo]}>{`In your relationships, you value depth, authenticity, and intellectual connection above all else. You seek partners and friends...`}</Text>
                )}
                 {isExpanded && (
        		<View>
               
                <View style={[styles.inYourRelationshipsYouValWrapper, styles.wrapperFlexBox]}>
          					<Text style={[styles.inYourRelationships, styles.onceCommittedYoureTypo]}>{`In your relationships, you value depth, authenticity, and intellectual connection above all else. You seek partners and friends who can engage in meaningful conversations and appreciate your unique perspective on the world. Your loyalty and commitment run deep, even if you don’t always express your feelings openly.

          					However, your tendency to prioritize logic over emotion can create challenges in your personal connections. You may struggle to understand or respond to others’ emotional needs, and your direct communication style might sometimes come across as harsh or insensitive. Learning to balance your natural rationality with empathy and emotional expression is crucial for building and maintaining fulfilling relationships, whether romantic, friendly, or familial.`}</Text>
      			</View>
      			<View style={[styles.yourStrengthsParent, styles.parentFlexBox]}>
        				<Text style={[styles.yourStrengths, styles.yourTypo]}>Your Strengths</Text>
        				<View style={styles.frameParentFlexBox}>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon} />
              							<Text style={[styles.loyal, styles.loyalTypo]}>Loyal</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>Once committed, you’re a devoted and trustworthy partner, friend, or family member.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon} />
              							<Text style={[styles.loyal, styles.loyalTypo]}>Honest Communicator</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>Your straightforward approach fosters trust and authentic connections.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon}/>
              							<Text style={[styles.loyal, styles.loyalTypo]}>Intellectual Stimulator</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>You bring depth and fascinating insights to your relationships.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.check_icon} />
              							<Text style={[styles.loyal, styles.loyalTypo]}>Problem-Solver</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>Your analytical skills make you an invaluable ally in tackling life’s challenges.</Text>
            						</View>
          					</View>
        				</View>
      			</View>
      			<View style={[styles.yourStrengthsParent, styles.parentFlexBox]}>
        				<Text style={[styles.yourWeaknesses, styles.yourTypo]}>Your Weaknesses</Text>
        				<View style={styles.frameParentFlexBox}>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon}/>
              							<Text style={[styles.loyal, styles.loyalTypo]}>Emotionally Reserved</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>You may find it difficult to verbalize or show affection, potentially leaving others unsure about your feelings.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon}/>
              							<Text style={[styles.loyal, styles.loyalTypo]}>Overly Independent</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>Your need for alone time might be misinterpreted as disinterest or aloofness.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon} />
              							<Text style={[styles.loyal, styles.loyalTypo]}>Small Talk Averse</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>Your dislike for superficial conversation can make social gatherings challenging.</Text>
            						</View>
          					</View>
          					<View style={styles.frameContainer}>
            						<View style={[styles.baseIconsParent, styles.frameParentFlexBox]}>
              							<Image style={styles.baseIcons} resizeMode="cover" tintColor="#E2BA1E" source={ImagesAssets.info_icon}/>
              							<Text style={[styles.loyal, styles.loyalTypo]}>High Expectations</Text>
            						</View>
            						<View style={[styles.onceCommittedYoureADevotWrapper, styles.wrapperFlexBox]}>
              							<Text style={[styles.onceCommittedYoure, styles.resilienceTypo]}>Your standards for yourself and others can create tension in relationships.</Text>
            						</View>
          					</View>
        				</View>
      			</View>
      			<View style={[styles.yourStrengthsParent, styles.parentFlexBox]}>
        				<Text style={[styles.influentialTraits, styles.yourTypo]}>Influential Traits</Text>
        				<View style={[styles.frameParent8, styles.frameParentFlexBox]}>
          					<View style={[styles.resilienceWrapper, styles.baseParentFlexBox]}>
            						<Text style={[styles.resilience, styles.resilienceTypo]}>Resilience</Text>
          					</View>
          					<View style={[styles.resilienceWrapper, styles.baseParentFlexBox]}>
            						<Text style={[styles.resilience, styles.resilienceTypo]}>Confidence⁠⁠</Text>
          					</View>
          					<View style={[styles.resilienceWrapper, styles.baseParentFlexBox]}>
            						<Text style={[styles.resilience, styles.resilienceTypo]}>Grit⁠</Text>
          					</View>
          					<View style={[styles.resilienceWrapper, styles.baseParentFlexBox]}>
            						<Text style={[styles.resilience, styles.resilienceTypo]}>Sense of Control⁠</Text>
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
baseParentFlexBox: {
  	alignItems: "center",
  	flexDirection: "row"
},
wrapperFlexBox: {
  	justifyContent: "center",
  	alignItems: "center",
  	alignSelf: "stretch"
},
onceCommittedYoureTypo: {
  	fontFamily: FontFamily.bodyB14Regular,
  	color: "black"
},
parentFlexBox: {
  	gap: Gap.gap_lg,
  	alignSelf: "stretch"
},
yourTypo: {
  	width: "100%",
  	fontFamily: FontFamily.bodyB14Regular,
  	lineHeight: 21,
  	fontSize: FontSize.bodyB14Regular_size,
  	textAlign: "left"
},
frameParentFlexBox: {
  	gap: Gap.gap_md,
  	alignSelf: "stretch"
},
loyalTypo: {
  	fontFamily: FontFamily.bodyB14Medium,
  	fontWeight: "500"
},
resilienceTypo: {
  	fontSize: FontSize.bodyB12Regular_size,
  	textAlign: "left"
},
yourRelationships: {
  	fontSize: 18,
  	lineHeight: 25,
  	fontFamily: FontFamily.whyteInktrap,
  	textAlign: "left",
  	fontWeight: "500",
  	color: "black"
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
yourRelationshipsParent: {
  	justifyContent: "space-between",
  	alignItems: "center",
  	flexDirection: "row",
  	alignSelf: "stretch"
},
inYourRelationships: {
  	lineHeight: 21,
  	fontSize: FontSize.bodyB14Regular_size,
  	textAlign: "left",
  	alignSelf: "stretch",
	  marginBottom: 7,
  	paddingHorizontal: Padding.p_5xs
},
inYourRelationshipsYouValWrapper: {
  	paddingVertical: 0,
  	paddingHorizontal: Padding.p_5xs
},
yourStrengths: {
  	color: Color.primaryNightlyWoodsNormal
},
loyal: {
  	lineHeight: 21,
  	fontSize: FontSize.bodyB14Regular_size,
  	textAlign: "left",
  	color: "black",
  	fontFamily: FontFamily.bodyB14Medium,
  	flex: 1
},
baseIconsParent: {
  	alignItems: "center",
  	flexDirection: "row"
},
onceCommittedYoure: {
  	lineHeight: 18,
  	fontFamily: FontFamily.bodyB14Regular,
  	color: "black",
  	flex: 1,
  	fontSize: FontSize.bodyB12Regular_size
},
onceCommittedYoureADevotWrapper: {
  	paddingLeft: Padding.p_5xl,
  	flexDirection: "row"
},
frameContainer: {
  	gap: Gap.gap_sm,
  	alignSelf: "stretch"
},
yourStrengthsParent: {
  	borderRadius: Border.br_5xl,
  	backgroundColor: "white",
  	padding: Padding.p_base,
	marginVertical:5
},
yourWeaknesses: {
  	color: Color.primaryLemonPunchNormalHover
},
influentialTraits: {
  	color: Color.textText500
},
resilience: {
  	lineHeight: 14,
  	color: Color.textText300,
  	fontFamily: FontFamily.bodyB14Medium,
  	fontWeight: "500"
},
resilienceWrapper: {
  	borderRadius: Border.br_31xl,
  	backgroundColor: Color.primaryKingLimeNormal,
  	paddingHorizontal: Padding.p_base,
  	paddingVertical: Padding.p_3xs
},
frameParent8: {
  	flexWrap: "wrap",
  	alignContent: "flex-start",
  	flexDirection: "row"
},
relationships: {
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

export default RelationshipsCard;
