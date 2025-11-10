import React, { useRef, useEffect } from 'react';
import { Image, StyleSheet, View, Text, Platform, TouchableOpacity } from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import ResultModal from "../../component/Modals/ResultModal";
import { ScrollView } from "react-native-gesture-handler";

const Mbti_Test_3 = ({ navigation }) => {


	const [modalVisible, setModalVisible] = React.useState(false);
	const scrollViewRef = useRef(null);

	useEffect(() => {
		// This will scroll the view to a specific y-coordinate, e.g., 100 pixels down
		scrollViewRef.current?.scrollTo({ y: 100, animated: true });

		// Alternatively, you can scroll to the end:
		// scrollViewRef.current?.scrollToEnd({ animated: true });
	}, []);
	return (
		<ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
			<View style={styles.mbti}>
				<ResultModal
					visible={modalVisible}
					onClose={() => setModalVisible(false)}
					navigation={navigation}
				/>
				<FocusAwareStatusBar
					barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
					backgroundColor={Colors.white}
					hidden={false}
				/>
				<View style={[styles.mbtiChild, styles.mbtiChildPosition]} />

				<View style={[styles.frameParent, styles.parentFlexBox]}>
					<View style={styles.frameGroup}>
						<View style={styles.frameFlexBox}>
							<View style={[styles.personalityTestParent, styles.stateParentFlexBox]}>
								<Text style={styles.personalityTest}>Personality Test</Text>
								<Text style={styles.personalityTest}>4/60</Text>
							</View>
							<View style={styles.frameFlexBox}>
								<View style={[styles.youRegularlyMakeNewFriendsParent, styles.youParentSpaceBlock]}>
									<Text style={[styles.youRegularlyMake, styles.personalityTypo]}>You regularly make new friends.</Text>
									<View style={[styles.frameParent1, styles.frameFlexBox]}>
										<View style={[styles.frameParent2, styles.stateParentFlexBox]}>
											<View style={[styles.radioButtonsParent, styles.stateParentFlexBox]}>
												<Image style={[styles.radioButtonsIcon, styles.radioLayout2]} resizeMode="cover" source={ImagesAssets.Radio} />
												<View style={[styles.radioButtons, styles.radioLayout1]} />
												<View style={[styles.radioButtons1, styles.radioLayout]} />
											</View>
											<View style={styles.radioShadowBox1} />
											<View style={[styles.radioButtonsParent, styles.stateParentFlexBox]}>
												<View style={[styles.radioButtons3, styles.radioShadowBox]} />
												<View style={[styles.radioButtons4, styles.radioShadowBox]} />
												<View style={[styles.radioButtons5, styles.radioShadowBox]} />
											</View>
										</View>
										<View style={[styles.agreeParent, styles.parentFlexBox]}>
											<Text style={[styles.agree, styles.agreeTypo]}>Agree</Text>
											<Text style={[styles.disagree, styles.agreeTypo]}>Disagree</Text>
										</View>
									</View>
								</View>
								<View style={[styles.youRegularlyMakeNewFriendsParent, styles.youParentSpaceBlock]}>
									<Text style={[styles.complexAndNovel, styles.personalityTypo]}>Complex and novel ideas excite you more than simple and straightforward ones.</Text>
									<View style={[styles.frameParent1, styles.frameFlexBox]}>
										<View style={[styles.frameParent2, styles.stateParentFlexBox]}>
											<View style={[styles.radioButtonsParent, styles.stateParentFlexBox]}>
												<View style={[styles.radioButtons6, styles.radioShadowBox2]} />
												<View style={[styles.radioButtons7, styles.radioLayout1]} />
												<View style={[styles.radioButtons8, styles.radioLayout]} />
											</View>
											<View style={styles.radioShadowBox1} />
											<View style={[styles.radioButtonsParent, styles.stateParentFlexBox]}>
												<View style={[styles.radioButtons10, styles.radioShadowBox]} />

												<View style={[styles.radioButtons10, styles.radioShadowBox]} />
												<View style={[styles.radioButtons11, styles.radioShadowBox]} />
											</View>
										</View>
										<View style={[styles.agreeParent, styles.parentFlexBox]}>
											<Text style={[styles.agree, styles.agreeTypo]}>Agree</Text>
											<Text style={[styles.disagree, styles.agreeTypo]}>Disagree</Text>
										</View>
									</View>
								</View>
								<View style={[styles.youUsuallyFeelMorePersuadeParent, styles.youParentSpaceBlock]}>
									<Text style={[styles.complexAndNovel, styles.personalityTypo]}>You usually feel more persuaded by what resonates emotionally with you than by factual arguments.</Text>
									<View style={[styles.frameParent1, styles.frameFlexBox]}>
										<View style={[styles.frameParent2, styles.stateParentFlexBox]}>
											<View style={[styles.radioButtonsParent, styles.stateParentFlexBox]}>
												<View style={[styles.radioButtons12, styles.radioShadowBox2]} />
												<View style={[styles.radioButtons13, styles.radioLayout1]} />
												<View style={[styles.radioButtons14, styles.radioLayout]} />
											</View>
											<View style={styles.radioShadowBox1} />
											<View style={[styles.radioButtonsParent, styles.stateParentFlexBox]}>
												<View style={[styles.radioButtons16, styles.radioShadowBox]} />
												<View style={[styles.radioButtons17, styles.radioShadowBox]} />
												<View style={[styles.radioButtons18, styles.radioShadowBox]} />
											</View>
										</View>
										<View style={[styles.agreeParent, styles.parentFlexBox]}>
											<Text style={[styles.agree, styles.agreeTypo]}>Agree</Text>
											<Text style={[styles.disagree, styles.agreeTypo]}>Disagree</Text>
										</View>
									</View>
								</View>
							</View>
						</View>
						<TouchableOpacity style={[styles.button, styles.buttonShadowBox]} onPress={() => setModalVisible(true)}>
							<View style={[styles.stateLayer, styles.stateParentFlexBox]}>
								<Text style={[styles.button1, styles.buttonTypo]}>Next</Text>
							</View>
						</TouchableOpacity>
					</View>
					<Image style={[styles.frameItem, styles.dateIconLayout]} resizeMode="cover" source={ImagesAssets.Mbti_line} />
				</View>
				<TouchableOpacity style={[styles.button2, styles.button2FlexBox]} onPress={() => { navigation.replace('HelperLanding') }}>
					<View style={[styles.stateLayer1, styles.frameFlexBox]}>
						<Text style={[styles.button3, styles.buttonTypo]}>Skip</Text>
						<Image style={styles.heroiconsOutlinearrowRight} resizeMode="cover" source={ImagesAssets.arrowRight} />
					</View>
				</TouchableOpacity>
				<Text style={styles.personalityMap}>
					<Text style={styles.personalityTypo}>{`Personality `}</Text>
					<Text style={styles.map}>Map</Text>
				</Text>
				<View style={[styles.progressBar, styles.button2FlexBox]}>
					<View style={styles.progressBar1}>
						<View style={[styles.background, styles.progressPosition]} />
						<View style={[styles.progress, styles.progressPosition]} />
						<View style={[styles.tooltip, styles.buttonShadowBox]}>

							<View style={[styles.content, styles.buttonBg]}>
								<Text style={styles.text1}>4%</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	groupChildPosition: {
		borderRadius: 48,
		left: "0%",
		bottom: "0%",
		right: "0%",
		top: "0%",
		height: "100%",
		position: "absolute",
		width: "100%"
	},
	mbtiChildPosition: {
		backgroundColor: "rgba(255, 255, 255, 0.6)",
		top: 0,
		width: "100%",
		left: 0,
		position: "absolute"
	},
	dateIconLayout: {
		maxHeight: "100%",
		position: "absolute"
	},
	parentFlexBox: {
		gap: 10,
		flexDirection: "row"
	},
	stateParentFlexBox: {
		flexDirection: "row",
		alignItems: "center"
	},
	youParentSpaceBlock: {
		gap: 16,
		paddingVertical: 24,
		borderRadius: 16,
		alignSelf: "stretch",
		paddingHorizontal: 16
	},
	personalityTypo: {
		fontWeight: "700",
		fontFamily: "Whyte Inktrap"
	},
	frameFlexBox: {
		gap: 8,
		alignSelf: "stretch"
	},
	radioLayout2: {
		height: 24,
		width: 24
	},
	radioLayout1: {
		height: 20,
		width: 20
	},
	radioLayout: {
		height: 16,
		width: 16
	},
	radioShadowBox: {
		shadowColor: "rgba(251, 207, 33, 0.16)",
		shadowOpacity: 1,
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
		backgroundColor: "#fff"
	},
	agreeTypo: {
		lineHeight: 21,
		fontFamily: "Poppins-Regular",
		color: "#fff",
		fontSize: 14,
		flex: 1
	},
	radioShadowBox2: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	buttonShadowBox: {
		shadowOpacity: 1,
		borderRadius: 8
	},
	buttonTypo: {
		fontFamily: "Poppins-SemiBold",
		fontWeight: "600",
		textAlign: "center",
		lineHeight: 21,
		fontSize: 14
	},
	button2FlexBox: {
		alignItems: "flex-end",
		position: "absolute"
	},
	progressPosition: {
		borderRadius: 4,
		height: 8,
		top: 0,
		left: 0,
		position: "absolute"
	},
	buttonBg: {
		backgroundColor: "#fff",
		alignSelf: "stretch",
		// For iOS
		shadowColor: "#000", // Color of the shadow
		shadowOffset: {
			width: 0, // Horizontal offset
			height: 2, // Vertical offset
		},
		shadowOpacity: 0.25, // Opacity of the shadow
		shadowRadius: 3.5, // Blur radius of the shadow
		// For Android
		elevation: 5, // Elevation for shadow on Android
	},
	frameChild: {
		top: -600,
		left: -619,
		width: 2054,
		height: 2072,
		zIndex: 0,
		position: "absolute"
	},
	component5Inner: {
		paddingHorizontal: 187,
		paddingVertical: 279,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	groupChild: {
		backgroundColor: "rgba(212, 212, 212, 0.2)"
	},
	component5Child: {
		left: "0%",
		bottom: "0%",
		right: "0%",
		top: "0%",
		height: "100%",
		position: "absolute",
		width: "100%"
	},
	component5: {
		top: 38,
		height: 871,
		width: "100%",
		left: 0,
		position: "absolute"
	},
	mbtiChild: {
		borderBottomRightRadius: 48,
		borderBottomLeftRadius: 48,
		height: 218
	},
	batteryIcon: {
		top: "0.02%",
		bottom: "-0.02%",
		width: 24,
		maxHeight: "100%",
		right: 0,
		height: "100%",
		position: "absolute"
	},
	wifiIcon: {
		width: 15,
		height: 11
	},
	mobileSignalIcon: {
		width: 17,
		height: 11
	},
	right: {
		height: "29.74%",
		bottom: "36.05%",
		width: 67,
		right: 16,
		top: "34.21%",
		position: "absolute"
	},
	dateIcon: {
		height: "29.21%",
		bottom: "36.58%",
		width: 28,
		left: 16,
		top: "34.21%"
	},
	iphoneMockupStatusBar: {
		height: 38,
		overflow: "hidden"
	},
	personalityTest: {
		lineHeight: 17,
		textAlign: "left",
		color: "#fff",
		fontSize: 14,
		fontFamily: "Whyte Inktrap",
		textTransform: "capitalize"
	},
	personalityTestParent: {
		alignSelf: "stretch",
		justifyContent: "space-between"
	},
	youRegularlyMake: {
		lineHeight: 19,
		fontSize: 16,
		fontWeight: "700",
		textAlign: "left",
		color: "#fff",
		textTransform: "capitalize"
	},
	radioButtonsIcon: {
		borderRadius: 100,
		overflow: "hidden"
	},
	radioButtons: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	radioButtons1: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	radioButtonsParent: {
		gap: 24
	},
	radioShadowBox1: {
		shadowColor: "rgba(103, 110, 118, 0.16)",
		height: 16,
		width: 16,
		shadowOpacity: 1,
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
		backgroundColor: "#fff"
	},
	radioButtons3: {
		height: 16,
		width: 16
	},
	radioButtons4: {
		height: 20,
		width: 20
	},
	radioButtons5: {
		height: 24,
		width: 24
	},
	frameParent2: {
		gap: 32
	},
	agree: {
		fontFamily: "Poppins-Regular",
		textAlign: "left"
	},
	disagree: {
		textAlign: "right",
		fontFamily: "Poppins-Regular"
	},
	agreeParent: {
		alignSelf: "stretch"
	},
	frameParent1: {
		alignItems: "center"
	},
	youRegularlyMakeNewFriendsParent: {
		backgroundColor: "rgba(0, 0, 0, 0.6)"
	},
	complexAndNovel: {
		lineHeight: 19,
		fontSize: 16,
		fontWeight: "700",
		textAlign: "left",
		color: "#fff",
		textTransform: "capitalize",
		alignSelf: "stretch"
	},
	radioButtons6: {
		height: 24,
		width: 24
	},
	radioButtons7: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	radioButtons8: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	radioButtons10: {
		height: 16,
		width: 16
	},
	radioButtonsIcon1: {
		borderRadius: 100,
		overflow: "hidden"
	},
	radioButtons11: {
		height: 24,
		width: 24
	},
	radioButtons12: {
		height: 24,
		width: 24
	},
	radioButtons13: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	radioButtons14: {
		backgroundColor: "#f7fbe6",
		elevation: 0,
		shadowRadius: 0,
		shadowOffset: {
			width: 0,
			height: 0
		},
		shadowColor: "rgba(176, 219, 2, 0.16)",
		shadowOpacity: 1,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden"
	},
	radioButtons16: {
		height: 16,
		width: 16
	},
	radioButtons17: {
		height: 20,
		width: 20
	},
	radioButtons18: {
		height: 24,
		width: 24
	},
	youUsuallyFeelMorePersuadeParent: {
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		opacity: 0.4
	},
	button1: {
		color: "#06361f",
		textAlign: "center"
	},
	stateLayer: {
		alignSelf: "stretch",
		justifyContent: "center"
	},
	button: {
		shadowColor: "rgba(103, 110, 118, 0.08)",
		shadowRadius: 5,
		elevation: 5,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		alignSelf: "stretch",
		justifyContent: "center",
		overflow: "hidden",
		backgroundColor: "#fff"
	},
	frameGroup: {
		height: 594,
		justifyContent: "space-between",
		width: "100%",
		zIndex: 0
	},
	frameItem: {
		top: 16,
		left: 125,
		width: 140,
		zIndex: 1,
		height: 7,
		borderRadius: 25
	},
	frameParent: {
		top: 178,
		borderTopLeftRadius: 48,
		borderTopRightRadius: 48,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
		height: 666,
		paddingTop: 48,
		paddingBottom: 24,
		paddingHorizontal: 16,
		gap: 10,
		alignItems: "center",
		width: "100%",
		left: 0,
		position: "absolute"
	},
	button3: {
		color: "#161616",
		textAlign: "center"
	},
	heroiconsOutlinearrowRight: {
		width: 18,
		height: 18,
		overflow: "hidden"
	},
	stateLayer1: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center"
	},
	button2: {
		top: 65,
		paddingHorizontal: 2,
		paddingVertical: 0,
		borderRadius: 8,
		right: 16,
		justifyContent: "center",
		overflow: "hidden"
	},
	map: {
		fontFamily: "Whyte Inktrap"
	},
	personalityMap: {
		top: 67,
		fontSize: 20,
		lineHeight: 24,
		color: "#161616",
		textAlign: "left",
		textTransform: "capitalize",
		left: 16,
		position: "absolute"
	},
	background: {
		backgroundColor: "#f2f4f7",
		right: 0,
		borderRadius: 4
	},
	progress: {
		right: 312,
		backgroundColor: "#b0db02"
	},
	tooltipIcon: {
		height: 6,
		width: 16
	},
	text1: {
		fontSize: 12,
		lineHeight: 18,
		color: "#344054",
		textAlign: "center",
		fontFamily: "Poppins-Regular"
	},
	content: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		alignSelf: "stretch"
	},
	tooltip: {
		marginLeft: -176.5,
		top: 12,
		left: "50%",
		shadowColor: "rgba(16, 24, 40, 0.08)",
		shadowRadius: 16,
		elevation: 16,
		borderRadius: 8,
		alignItems: "center",
		position: "absolute"
	},
	progressBar1: {
		height: 8,
		borderRadius: 8,
		alignSelf: "stretch"
	},
	progressBar: {
		top: 110,
		width: 358,
		left: 16
	},
	mbti: {
		height: 844,
		overflow: "hidden",
		width: "100%",
		flex: 1,
		backgroundColor: "#fff"
	}
});

export default Mbti_Test_3;
