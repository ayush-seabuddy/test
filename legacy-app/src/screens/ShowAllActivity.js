import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ImageBackground,
  Platform,
  Dimensions,
} from "react-native";
// import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import AnouncementDetailsHeader from "../component/headers/AnouncementDetailsHeader";
import ArticleCard from "../component/Cards/HealthCards/ArticleCard";
import LottieView from "lottie-react-native";
import CustomLottie from "../component/CustomLottie";
import Colors from "../colors/Colors";
const { width, height } = Dimensions.get("window");

const ShowAllActivity = ({ navigation, route }) => {
  const Data = route.params.data;
  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <AnouncementDetailsHeader
          navigation={navigation}
          title={"All Articles"}
        />

        {/* StatusBar */}
        <FocusAwareStatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={Colors.white}
          hidden={false}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }} // Optional for spacing at bottom
          style={{ marginBottom: 20 }}
        >
          <View>
            {Data ? (
              // <VedioCard navigation={navigation}  />
              <ArticleCard navigation={navigation} data={Data?.READ || {}} />
            ) : null}
          </View>
        </ScrollView>

        {/* <Image
        source={{ uri: data?.thumbnail }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.frameGroup}>
          <View style={[styles.frameWrapper, styles.wrapperSpaceBlock]}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.frameContainer}>
              <View
                style={[
                  styles.bestStreetFoodInUkParent,
                  styles.picturesWrapperFlexBox,
                ]}
              >
                <Text style={[styles.bestStreetFood, styles.bestClr]}>
                  {data?.title || ""}
                </Text>
               
              </View>
              <View style={styles.frameView}>
                
              </View>
              <View style={styles.loremIpsumIsSimplyDummyTeParent}>
                <Text style={[styles.loremIpsumIsSimply, styles.bestClr]}>
                  {data?.description?.replace(/<[^>]*>/g, "") || ""}
                 
                </Text>
              </View>
              <View style={styles.frameWrapper1}>
                <View style={styles.frameParent1}>
                  <View>
                    <Text style={styles.writenBy}>Written by</Text>
                  </View>
                  <View style={styles.ellipseWrapper}>
                    <Image
                      style={styles.frameChild}
                      resizeMode="cover"
                      source={
                        data?.announcementUser?.profileUrl
                          ? { uri: data.announcementUser.profileUrl }
                          : ImagesAssets.ellipsimage
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
         
        </View>
        <View style={styles.frameParent4}>
          
        </View>
      </ScrollView> */}
      </View>
      <View
        style={{
          // flex: 1,
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          height: "50%",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          zIndex: -1,
          // flexBasis: 200,
          position: "absolute",
          bottom: 0,
        }}
      >
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // position: "absolute",
    // bottom: 0,
  },
  container: {
    flex: 1,
    // backgroundColor: "#fff",
  },
  backgroundImage: {
    width: "100%",
    height: Dimensions.get("window").height * 0.42,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1, // Ensures it stays behind the content
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    position: "absolute",
    bottom: "23%",
    left: "50%",
  },
  activeDot: {
    width: 6,
    height: 6,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    tintColor: "rgba(217, 217, 217, 0.3)",
  },
  scrollViewContent: {
    paddingTop: "45%",
    paddingBottom: "10%",

    // flexGrow: 1,
  },
  cardContainer: {
    gap: 16,
  },

  contentPosition: {
    left: 0,
    width: "100%",
    position: "absolute",
  },
  wrapperSpaceBlock: {
    paddingHorizontal: 16,
    alignSelf: "stretch",
  },
  picturesWrapperFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  bestClr: {
    color: "#262626",
    textAlign: "left",
  },
  akarFlexBox: {
    padding: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pointsTypo: {
    lineHeight: 10,
    fontSize: 8,
    fontFamily: "Poppins-Regular",
  },

  contentDetailsChild: {
    top: "0%",
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    height: "15%",
    width: "100%",
  },
  bestStreetFood: {
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    fontSize: 18,
    lineHeight: 25,
  },
  akarIconsdotGrid: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  akarIconsdotGridWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  bestStreetFoodInUkParent: {
    alignItems: "center",
  },
  groupAct: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  groupActWrapper: {
    backgroundColor: "#06361f",
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 32,
    alignItems: "center",
  },
  frameView: {
    gap: 4,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
  },
  loremIpsumIsSimply: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    alignSelf: "stretch",
  },
  loremIpsumIsSimplyDummyTeParent: {
    gap: 16,
    alignSelf: "stretch",
  },
  writenBy: {
    lineHeight: 14,
    color: "#06361f",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    textAlign: "left",
    fontWeight: "500",
  },
  frameChild: {
    borderRadius: 64,
    width: 32,
    height: 32,
  },
  ellipseWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameParent1: {
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  frameWrapper1: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  frameContainer: {
    gap: 24,
    width: "100%",
  },
  frameWrapper: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: 32,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  frameItem: {
    width: "31%",
    height: 96,
    borderRadius: 8,
  },
  frameParent3: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 8,
    width: "100%",
  },
  frameParent2: {
    gap: 4,
    width: "100%",
  },
  frameGroup: {
    width: "100%",
    gap: 8,
    paddingHorizontal: 16,
  },
  recommendationArticles: {
    lineHeight: 27,
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    fontSize: 18,
    flex: 1,
  },
  recommendationArticlesWrapper: {
    paddingVertical: 0,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },

  points: {
    fontFamily: "Poppins-Regular",
    lineHeight: 10,
    fontSize: 8,
  },

  frameParent4: {
    alignSelf: "stretch",
    gap: 8,
  },
  frameParent: {
    top: "7%",
    gap: 32,
    alignItems: "center",
    width: "100%",
  },

  right: {
    height: "29.74%",
    right: 16,
    bottom: "36.05%",
    width: 67,
    top: "34.21%",
    position: "absolute",
  },

  icon: {
    height: "100%",
    overflow: "hidden",
    width: "100%",
  },

  contentDetails: {
    // height: 1714,
    backgroundColor: "red",
    // overflow: "hidden",
    width: "100%",
    flex: 1,
  },
});

export default ShowAllActivity;
