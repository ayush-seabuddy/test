import * as React from "react";
import {Text, StyleSheet, View, Image, TouchableOpacity} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const BooksCard = () => {
  	
  	return (
    		<View style={[styles.frameParent, styles.frameFlexBox]}>
      			<View style={[styles.frameGroup, styles.frameFlexBox]}>
        				<View style={styles.popularResourcesWrapper}>
          					<Text style={styles.popularResources}>Popular Resources</Text>
        				</View>
        				<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon1} />
      			</View>
      			<View style={[styles.frameContainer, styles.frameContainerFlexBox]}>
        				
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.ph_books} />
          					<Text style={styles.workoutSessionIn}>(Books/Novel Title)</Text>
          					<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2} />
        				</View>
        				<View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.ph_books}/>
          					<Text style={styles.workoutSessionIn}>(Books/Novel Title)</Text>
          					<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2}/>
        				</View>
                        <View style={[styles.materialSymbolslibraryBooksParent, styles.frameContainerFlexBox]}>
          					<Image style={styles.materialSymbolslibraryBooksIcon} resizeMode="cover" source={ImagesAssets.ph_books}/>
          					<Text style={styles.workoutSessionIn}>(Books/Novel Title)</Text>
          					<Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.baseicon2}/>
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
    		gap: 8,
    		alignSelf: "stretch"
  	},
  	popularResources: {
    		fontSize: 18,
    		lineHeight: 25,
    		fontWeight: "500",
    		fontFamily: "Whyte Inktrap",
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
    		width: 18,
    		height: 18,
            backgroundColor:'white',
            padding:10
            
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
            marginVertical:7
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

export default BooksCard;
