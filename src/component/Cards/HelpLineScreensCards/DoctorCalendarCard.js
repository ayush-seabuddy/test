import * as React from "react";
import {Text, StyleSheet, Image, View, TouchableOpacity,Dimensions} from "react-native";
import { Color, FontSize, Gap, Padding, Border, FontFamily } from "../../../GlobalStyle";
import { BlurView } from "@react-native-community/blur";
import { ImagesAssets } from "../../../assets/ImagesAssets";
const { width } = Dimensions.get('window');
const DoctorCalendarCard = () => {
  	
  	return (
    		<View style={styles.frameParent}>
                <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} reducedTransparencyFallbackColor="white" />
      			<View style={styles.frameGroup}>
        				<View style={[styles.availableParent, styles.frameContainerFlexBox1]}>
          					<Text style={[styles.available, styles.availableTypo]}>Available</Text>
          					<View style={{flexDirection:"row",alignItems:"center",gap:3}}>
            						<TouchableOpacity>
										<Image style={{width:16,height:16}} source={ImagesAssets.left_arrow}/>
									</TouchableOpacity>
            						<Text style={[styles.august2024, styles.monLayout]}>August 2024</Text>
            						<TouchableOpacity>
										<Image style={{width:16,height:16}} source={ImagesAssets.right_arrow}/>
									</TouchableOpacity>
          					</View>
        				</View>
        				<View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.mon, styles.monTypo]}>Mon</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text, styles.textLayout1]}>16</Text>
            						</View>
          					</View>
          					<View style={[styles.tueParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Tue</Text>
            						<View style={[styles.container, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>17</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Wed</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>18</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Thu</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>19</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Fri</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text4, styles.textLayout]}>20</Text>
            						</View>
          					</View>
          					<View style={[styles.satParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.sat, styles.satTypo]}>Sat</Text>
            						<View style={[styles.wrapper2, styles.wrapperFlexBox]}>
              							<Text style={[styles.text5, styles.satTypo]}>21</Text>
            						</View>
          					</View>
          					<View style={[styles.satParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.sat, styles.satTypo]}>Sun</Text>
            						<View style={[styles.wrapper2, styles.wrapperFlexBox]}>
              							<Text style={[styles.text5, styles.satTypo]}>22</Text>
            						</View>
          					</View>
        				</View>
        				<View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Mon</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>22</Text>
            						</View>
          					</View>
          					<View style={[styles.tueParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Tue</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>23</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Wed</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text9, styles.textTypo]}>24</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Thu</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text9, styles.textTypo]}>25</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Fri</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text9, styles.textTypo]}>26</Text>
            						</View>
          					</View>
          					<View style={[styles.satParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.sat, styles.satTypo]}>Sat</Text>
            						<View style={[styles.wrapper2, styles.wrapperFlexBox]}>
              							<Text style={[styles.text5, styles.satTypo]}>27</Text>
            						</View>
          					</View>
          					<View style={[styles.satParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.sat, styles.satTypo]}>Sun</Text>
            						<View style={[styles.wrapper2, styles.wrapperFlexBox]}>
              							<Text style={[styles.text5, styles.satTypo]}>28</Text>
            						</View>
          					</View>
        				</View>
        				<View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Mon</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text9, styles.textTypo]}>29</Text>
            						</View>
          					</View>
          					<View style={[styles.tueParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Tue</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text9, styles.textTypo]}>30</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Wed</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>31</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Thu</Text>
            						<View style={[styles.wrapper, styles.wrapperFlexBox1]}>
              							<Text style={[styles.text1, styles.textTypo]}>01</Text>
            						</View>
          					</View>
          					<View style={[styles.monParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.tue, styles.textTypo]}>Fri</Text>
            						<View style={[styles.wrapper1, styles.wrapperFlexBox]}>
              							<Text style={[styles.text4, styles.textLayout]}>02</Text>
            						</View>
          					</View>
          					<View style={[styles.satParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.sat, styles.satTypo]}>Sat</Text>
            						<View style={[styles.wrapper2, styles.wrapperFlexBox]}>
              							<Text style={[styles.text5, styles.satTypo]}>03</Text>
            						</View>
          					</View>
          					<View style={[styles.satParent, styles.parentSpaceBlock]}>
            						<Text style={[styles.sat, styles.satTypo]}>Sun</Text>
            						<View style={[styles.wrapper2, styles.wrapperFlexBox]}>
              							<Text style={[styles.text5, styles.satTypo]}>04</Text>
            						</View>
          					</View>
        				</View>
      			</View>
    		</View>);
};

const styles = StyleSheet.create({
  	frameContainerFlexBox1: {
    		justifyContent: "space-between",
    		alignSelf: "stretch"
  	},
  	availableTypo: {
    		textAlign: "left",
    		color: "black",
    		
  	},
  	frameContainerFlexBox: {
    		alignItems: "center",
    		flexDirection: "row",
            marginHorizontal:16,
			justifyContent:"space-between",
			width: width * 0.84,
			gap:4
  	},
  	monLayout: {
    		lineHeight: 12,
    		fontSize: FontSize.size_3xs
  	},
  	parentSpaceBlock: {
    		gap: Gap.gap_md,
    		paddingBottom: Padding.p_7xs,
    		paddingTop: Padding.p_5xs,
    		paddingHorizontal: Padding.p_7xs,
    		borderRadius: Border.br_31xl
  	},
  	monTypo: {
    		textAlign: "center",
    		color: Color.textText200,
    		fontFamily: FontFamily.poppinsRegular
  	},
  	wrapperFlexBox1: {
    		padding: Padding.p_6xs,
    		justifyContent: "center",
    		borderRadius: Border.br_31xl,
    		alignItems: "center",
    		alignSelf: "stretch"
  	},
  	textLayout1: {
    		width: 14,
    		lineHeight: 14,
    		fontSize: FontSize.size_xs
  	},
  	textTypo: {
    		color: Color.textText500,
    		textAlign: "center",
    		fontFamily: FontFamily.poppinsRegular
  	},
  	wrapperFlexBox: {
    		paddingVertical: Padding.p_6xs,
    		justifyContent: "center",
    		paddingHorizontal: Padding.p_7xs,
    		borderRadius: Border.br_31xl,
    		alignItems: "center",
    		alignSelf: "stretch"
  	},
  	textLayout: {
    		height: 14,
    		lineHeight: 14,
    		fontSize: FontSize.size_xs,
    		width: 16
  	},
  	satTypo: {
    		color: Color.textText100,
    		textAlign: "center",
    		fontFamily: FontFamily.poppinsRegular
  	},
  	available: {
    		fontSize: 18,
    		lineHeight: 25,
    		fontFamily: "WhyteInktrap-Medium"
  	},
  	baseIcons: {
    		height: 16,
    		overflow: "hidden",
    		width: 16
  	},
  	august2024: {
    		fontFamily: FontFamily.poppinsMedium,
    		textAlign: "left",
    		color: "black",
    		fontWeight: "500"
  	},
  	baseIconsParent: {
    		gap: 8
  	},
  	availableParent: {
    		flexDirection: "row",
    		justifyContent: "space-between",
			paddingHorizontal:16,
			alignItems:"center"
  	},
  	mon: {
    		lineHeight: 12,
    		fontSize: FontSize.size_3xs,
    		alignSelf: "stretch"
  	},
  	text: {
    		textAlign: "center",
    		color: Color.textText200,
    		fontFamily: FontFamily.poppinsRegular
  	},
  	wrapper: {
    		backgroundColor: Color.colorGray_200
  	},
  	monParent: {
    		backgroundColor: Color.colorGray_300,
            borderRadius: Border.br_31xl
  	},
  	tue: {
    		lineHeight: 12,
    		fontSize: FontSize.size_3xs,
    		alignSelf: "stretch"
  	},
  	text1: {
    		width: 14,
    		lineHeight: 14,
    		fontSize: FontSize.size_xs
  	},
  	container: {
    		backgroundColor: Color.primaryKingLimeNormal
  	},
  	tueParent: {
    		backgroundColor: Color.colorGray_200
  	},
  	text4: {
    		color: Color.textText500,
    		textAlign: "center",
    		fontFamily: FontFamily.poppinsRegular
  	},
  	wrapper1: {
    		backgroundColor: Color.colorGray_200
  	},
  	sat: {
    		lineHeight: 12,
    		fontSize: FontSize.size_3xs,
    		alignSelf: "stretch"
  	},
  	text5: {
    		height: 14,
    		lineHeight: 14,
    		fontSize: FontSize.size_xs,
    		width: 16
  	},
  	wrapper2: {
    		backgroundColor: Color.colorGray_300,
            borderRadius: Border.br_31xl
  	},
  	satParent: {
    		backgroundColor: Color.colorGray_400,
            borderRadius: Border.br_31xl
  	},
  	frameContainer: {
    	
  	},
  	text9: {
    		lineHeight: 14,
    		fontSize: FontSize.size_xs,
    		color: Color.textText500,
    		width: 16
  	},
  	frameGroup: {
    		
    		gap: 16,
		 
  	},
  	frameParent: {
    		borderRadius: 32,
    		backgroundColor: "rgba(180, 180, 180, 0.6)",
    		
    		width: "100%",
    		
    		paddingTop: 18,
    		paddingBottom: Padding.p_base,
    		alignSelf: "stretch",
            overflow: "hidden",
			
  	}
});

export default DoctorCalendarCard;
