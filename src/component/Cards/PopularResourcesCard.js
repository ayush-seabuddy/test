import * as React from "react";
import {Text, StyleSheet, View, Image, TouchableOpacity} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const PopularResourcesCard = () => {
  	
  	return (
    		<View style={[styles.frameParent, styles.frameFlexBox]}>
      			<View style={[styles.frameGroup, styles.frameFlexBox]}>
        				<View style={styles.popularResourcesWrapper}>
          					<Text style={styles.popularResources}>Popular Resources</Text>
        				</View>
        				
						<View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
						<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon1} />
							</View>
      			</View>
      			<View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.materialicon}/>
          					<Text style={styles.workoutSessionIn}>Workout session in tiny space</Text>
          					
							<View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.materialicon} />
          					<Text style={styles.workoutSessionIn}>Workout session in tiny space</Text>
          					<View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.ph_books} />
          					<Text style={styles.workoutSessionIn}>(Books/Novel Title)</Text>
          					<View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.ph_books}/>
          					<Text style={styles.workoutSessionIn}>(Books/Novel Title)</Text>
          					<View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.musicicon} />
          					<Text style={styles.workoutSessionIn}>Binaural playlist</Text>
          					<View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.musicicon} />
          					<Text style={styles.workoutSessionIn}>Binaural playlist</Text>
							  <View style={{backgroundColor:"white",padding:8,borderRadius:8}}>
							<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
							</View>
        				</View>
        				<TouchableOpacity>
                        <Text style={styles.viewMore}>View more</Text>
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
  	popularResources: {
    		fontSize: 16,
    		lineHeight: 25,
    		fontWeight: "500",
    		fontFamily:"WhyteInktrap-Bold",
    		color: "#262626",
    		width: 270,
    		textAlign: "left"
  	},
  	popularResourcesWrapper: {
    		paddingHorizontal: 16,
    		paddingVertical: 0,
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
  	materialSymbolslibraryBooksIcon: {
    		width: 16,
    		height: 16,
    		overflow: "hidden"
  	},
  	workoutSessionIn: {
    		fontSize: 12,
    		lineHeight: 18,
    		color: "#454545",
    		fontFamily: "Poppins-Regular",
    		textAlign: "left",
    		flex: 1
  	},
  	materialSymbolslibraryBooksParent: {
    		alignItems: "center",
    		flexDirection: "row",
            marginVertical:5
  	},
  	viewMore: {
    		fontSize: 10,
    		lineHeight: 14,
    		color: "#06361f",
    		textAlign: "center",
    		fontFamily: "Poppins-Regular",
    		alignSelf: "stretch"
  	},
  	frameContainer: {
    		paddingLeft: 16,
    		paddingRight: 8
  	},
  	frameParent: {
    		borderRadius: 32,
    		backgroundColor: "rgba(220, 220, 220, 0.4)",
    		width: "100%",
    		paddingHorizontal: 8,
    		paddingVertical: 24,
    		flex: 1
  	}
});

export default PopularResourcesCard;
