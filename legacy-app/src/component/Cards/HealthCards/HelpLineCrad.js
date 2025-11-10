import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const isProMax = height >= 926;
const HelpLineCrad = ({ navigation, setModalVisible }) => {
  const { t } = useTranslation();
  // () => { navigation.replace('HelpLine') }
  return (
    <View style={styles.frameParent}>
      <TouchableOpacity
        style={[styles.frameGroup]}
        onPress={() => {
          navigation.navigate("BookAppoinment");
        }}
      >
        <View style={styles.helplinesParent}>
          <Text style={[styles.helplines, styles.helplinesFlexBox]}>
            {t('speaktowellnessofficer')}
          </Text>
          <Text
            style={[styles.supportServicesOffering, styles.helplinesFlexBox]}
          >
            {t('speaktowellnesssofficer_description')}
          </Text>
        </View>
        <View style={{ width: "20%", height: "100%" }}>
          <Image
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            source={ImagesAssets.helpline_img}
          />
        </View>
        {/* <Image
          style={styles.default4dCartoonPixarHighlIcon}
          resizeMode="cover"
          source={ImagesAssets.helpline_img}
        /> */}
      </TouchableOpacity>
      <View style={[styles.frameContainer, styles.frameFlexBox]}>
        {/* <TouchableOpacity style={[styles.baseIconsParent, styles.frameFlexBox]}  onPress={() => { navigation.replace('Articles') }}>
          					<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.folder_icon} />
          					<View>
            						<Text style={[styles.articles, styles.articlesTypo]}>Articles</Text>
          					</View>
        				</TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.baseIconsParent, styles.frameFlexBox]}
          onPress={() => {
            navigation.navigate("MoodTracker");
          }}
        >
          <Image
            style={styles.baseIcons}
            resizeMode="cover"
            tintColor="white"
            source={ImagesAssets.emojibtnimg}
          />
          <View>
            <Text style={[styles.articles, styles.articlesTypo]}>
              {t('moodTracker')}
            </Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.baseIconsParent, styles.frameFlexBox]}
          onPress={() => {
            navigation.navigate("Leaderboard");
          }}
        >
          <Image
            style={styles.baseIcons}
            resizeMode="cover"
            tintColor="white"
            source={ImagesAssets.emojibtnimg}
          />
          <View>
            <Text style={[styles.articles, styles.articlesTypo]}>
              Leaderboard
            </Text>
          </View>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.baseIconsParent, styles.frameFlexBox]}
          onPress={() => {
            navigation.navigate("Analytics");
            // navigation.replace("Home", { screen: "Profile" });
            // navigation.navigate("Home", {
            //   screen: "Profile",
            //   params: { activeTab: "Assessment" },
            // });
          }}
        >
          <Image
            style={styles.baseIcons}
            resizeMode="cover"
            tintColor="white"
            source={ImagesAssets.analitics}
          />
          <View>
            <Text style={[styles.articles, styles.articlesTypo]}>
              {t('analytics')}
            </Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity style={[styles.baseIconsParent, styles.frameFlexBox]}>
          					<Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.uil_calendar} />
          					<View>
            						<Text style={[styles.articles, styles.articlesTypo]}>Calendar</Text>
          					</View>
        				</TouchableOpacity> */}
      </View>
      {/* <View style={[styles.frameContainer, styles.frameFlexBox]}>
        				<TouchableOpacity style={[styles.baseIconsParent, styles.frameFlexBox]}  onPress={() => { navigation.replace('EventList') }}>
          					<Image style={styles.baseIcons} resizeMode="cover" tintColor="black" source={ImagesAssets.emojibtnimg} />
          					<View>
            						<Text style={[styles.articles, styles.articlesTypo]}>Mood Tracker</Text>
          					</View>
        				</TouchableOpacity>
        				<TouchableOpacity style={[styles.baseIconsParent, styles.frameFlexBox]}  onPress={() => {  navigation.navigate('MoodTracker')  }}>
          					<Image style={styles.baseIcons} resizeMode="cover" tintColor="white" source={ImagesAssets.emojibtnimg} />
          					<View>
            						<Text style={[styles.articles, styles.articlesTypo]}>Mood Tracker</Text>
          					</View>
        				</TouchableOpacity>
        				<TouchableOpacity style={[styles.baseIconsParent, styles.frameFlexBox]} >
						<Image style={styles.baseIcons} resizeMode="cover" tintColor="white" source={ImagesAssets.emojibtnimg} />
          					<View>
            						<Text style={[styles.articles, styles.articlesTypo]}>Assessment</Text>
          					</View>
        				</TouchableOpacity>
						
      			</View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  frameFlexBox: {
    alignItems: "center",
    gap: 8,
  },
  helplinesFlexBox: {
    textAlign: "left",
    alignSelf: "stretch",
  },
  articlesTypo: {
    color: "#fff",
    fontFamily: "WhyteInktrap-Medium",

    lineHeight: 18,
    fontSize: 14,
  },
  helplines: {
    color: "#fff",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    lineHeight: 30,
    fontSize: isProMax ? 20 :17,
  },
  supportServicesOffering: {
    fontSize: isProMax ? 12 :10,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    marginTop: -4,

    width: "90%",
  },
  helplinesParent: {
    width: "80%",
    // backgroundColor: "red",
    zIndex: 0,
    flex: 1,
    gap: 5,
      paddingVertical: 25,
    paddingBottom: 30,
    paddingLeft: 15,

  },
  default4dCartoonPixarHighlIcon: {
    // position: "absolute",
    // top: Platform.OS === "ios" ? "-16%" : "-20%",
    // right: "-2%",
    width: "100%",
    // height: 103,
    height: Platform.OS === "ios" ? "100%" : "100%",
    zIndex: 1,
  },
  frameGroup: {
    height: "54%",
    // paddingVertical: 25,
    // paddingBottom: 30,
    // paddingHorizontal: 15,
    // paddingRight: 70,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
    backgroundColor: "#06361f",
    borderRadius: 8,
  },
  baseIcons: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  articles: {
    textAlign: "center",
    alignSelf: "stretch",
    fontFamily: "WhyteInktrap-Medium",

    fontSize: 12,
  },
  baseIconsParent: {
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#06361f",
    borderRadius: 8,

    flex: 1,
  },
  frameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameParent: {
    width: "100%",
    gap: 8,
    flex: 1,
  },
});

export default HelpLineCrad;
