import * as React from "react";
import {Text, StyleSheet, View, Image, TouchableOpacity} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const EventCrad = () => {
  	
  	return (
    		<View style={[styles.frameParent, styles.frameFlexBox]}>
      			<View style={[styles.frameGroup, styles.frameFlexBox]}>
        				<View style={styles.eventsWrapper}>
          					<Text style={styles.events}>Events</Text>
        				</View>
        				
						<View style={{backgroundColor:"#E3E3E366",padding:8,borderRadius:8}}>
						<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon1}/>
							</View>
      			</View>
      			<View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
        				<View style={[styles.systemUiconscalendarDateParent, styles.frameContainerFlexBox]}>
          					<View style={styles.systemUiconscalendarDate}>
            						<View style={styles.group}>
              							<Image style={styles.vectorIcon} resizeMode="cover"  source={ImagesAssets.clendericon} />
              							<Text style={[styles.text, styles.textTypo]}>28</Text>
            						</View>
          					</View>
          					<Text style={styles.thanksgiving}>Thanksgiving</Text>
          					<View style={{backgroundColor:"#E3E3E366",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.systemUiconscalendarDateParent, styles.frameContainerFlexBox]}>
          					<View style={styles.systemUiconscalendarDate}>
            						<View style={styles.group}>
              							<Image style={styles.vectorIcon} resizeMode="cover"  source={ImagesAssets.clendericon} />
              							<Text style={[styles.text1, styles.textTypo]}>31</Text>
            						</View>
          					</View>
          					<Text style={styles.thanksgiving}>NYE on the deck</Text>
          					<View style={{backgroundColor:"#E3E3E366",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.systemUiconscalendarDateParent, styles.frameContainerFlexBox]}>
          					<View style={styles.systemUiconscalendarDate}>
            						<View style={styles.group}>
              							<Image style={styles.vectorIcon} resizeMode="cover" width={18} height={18}  source={ImagesAssets.clendericon} />
              							<Text style={[styles.text1, styles.textTypo]}>31</Text>
            						</View>
          					</View>
          					<Text style={styles.thanksgiving}>NYE on the deck</Text>
          					<View style={{backgroundColor:"#E3E3E366",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<TouchableOpacity>
                        <Text style={[styles.viewMore, styles.textTypo]}>View more</Text>
                        </TouchableOpacity>
      			</View>
    		</View>);
};

const styles = StyleSheet.create({
  	frameFlexBox: {
    		gap: 16,
    		alignSelf: "stretch"
  	},
  	frameContainerFlexBox: {
    		gap: 4,
    		alignSelf: "stretch"
  	},
  	textTypo: {
    		textAlign: "center",
    		lineHeight: 14,
    		fontSize: 10
  	},
  	events: {
    		fontSize: 16,
    		lineHeight: 25,
    		fontWeight: "500",
    		fontFamily:"WhyteInktrap-Bold",
    		width: 270,
    		textAlign: "left",
    		color: "#262626"
  	},
  	eventsWrapper: {
    		paddingLeft: 16,
    		flexDirection: "row",
    		flex: 1
  	},
  	frameChild: {
    		borderRadius: 8,
    		width: 12,
    		height: 12,
          
  	},
  	frameGroup: {
    		paddingRight: 8,
    		flexDirection: "row"
  	},
  	vectorIcon: {
    		height: "91.04%",
    		top: "0%",
    		right: "0%",
    		bottom: "8.96%",
    		left: "0%",
    		maxWidth: "100%",
    		maxHeight: "100%",
    		position: "absolute",
    		overflow: "hidden",
    		width: "100%"
  	},
  	text: {
    		width: "81.42%",
    		left: "9.37%",
    		fontFamily: "Poppins-SemiBold",
    		fontWeight: "600",
    		top: "20.61%",
    		height: "79.6%",
    		textAlign: "center",
    		lineHeight: 14,
    		fontSize: 10,
    		position: "absolute",
    		color: "#262626"
  	},
  	group: {
    		height: "83.75%",
    		width: "76.25%",
    		top: "11.9%",
    		right: "11.85%",
    		bottom: "4.35%",
    		left: "11.9%",
    		position: "absolute"
  	},
  	systemUiconscalendarDate: {
    		width: 24,
    		height: 24,
    		overflow: "hidden"
  	},
  	thanksgiving: {
    		fontSize: 12,
    		lineHeight: 18,
    		color: "#454545",
    		fontFamily: "Poppins-Regular",
    		textAlign: "left",
    		flex: 1
  	},
  	systemUiconscalendarDateParent: {
    		alignItems: "center",
    		flexDirection: "row",
            marginVertical:5
  	},
  	text1: {
    		width: "62.3%",
    		left: "17.17%",
    		fontFamily: "Poppins-SemiBold",
    		fontWeight: "600",
    		top: "20.61%",
    		height: "79.6%",
    		textAlign: "center",
    		lineHeight: 14,
    		fontSize: 10,
    		position: "absolute",
    		color: "#262626"
  	},
  	viewMore: {
    		color: "#06361f",
    		fontFamily: "Poppins-Regular",
    		textAlign: "center",
    		lineHeight: 14,
    		fontSize: 10,
    		alignSelf: "stretch"
  	},
  	frameContainer: {
    		paddingLeft: 16,
    		paddingRight: 8
  	},
  	frameParent: {
    		borderRadius: 32,
    		backgroundColor: "rgba(255, 255, 255, 0.6)",
    		paddingHorizontal: 8,
    		paddingVertical: 24,
			
    		width: "100%",
    		flex: 1
  	}
});

export default EventCrad;
