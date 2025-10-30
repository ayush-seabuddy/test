import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  FontSize,
  Color,
  FontFamily,
  Padding,
  Border,
} from "../../../GlobalStyle";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
const { width } = Dimensions.get("window");
const BookedDoctorProfileCard = ({ data }) => {
  const [selectedImageUri, setSelectedImageUri] = React.useState(null);
  const [showImageViewerModal, setShowImageViewerModal] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const maxLength = 300;


  const isLong = data?.description.length > maxLength;
  const displayText = expanded || !isLong ? data?.doctorDetails?.description : data?.doctorDetails?.description.substring(0, maxLength) + '...';
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);

    // Format time (12-hour with AM/PM)
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Format date (DD-MMM-YYYY)
    const dateStr = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return `${time} , ${dateStr}`;
  };
  const openImageModal = (uri) => {
    setSelectedImageUri(uri);
    setShowImageViewerModal(true);
  };

  const closeImageViewerModal = () => {
    setShowImageViewerModal(false);
    setSelectedImageUri(null);
  };
  const formattedDateTime = formatDateTime(data?.dateTime);

  return (
    <ScrollView>
      <View style={styles.frameParent}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        <View style={styles.frameGroup}>
          <View style={styles.frameWrapper}>
            <View style={styles.drStrangeParent}>
              <Text style={styles.drStrange}>{data?.doctorDetails?.doctorName}</Text>
              {data?.doctorDetails?.contactDetails &&
                <Text style={{ fontSize: 12, fontFamily: "poppins-regular", lineHeight: 15 }}>
                  {data?.doctorDetails?.contactDetails}
                </Text>
              }
              <Text
                style={[styles.drStrange, { fontSize: 18, lineHeight: 20, marginTop: 25 }]}
              >
                Details
              </Text>
              {data?.doctorDetails?.language && <Text style={{ fontSize: 12, marginTop: 10, fontFamily: "poppins-regular", lineHeight: 15 }}>
                <Text
                  style={[styles.drStrange, { fontSize: 13 }]}
                >
                  Languages:{" "}
                </Text> {data?.doctorDetails?.language.map((quali, index) => {
                  if (index == data?.doctorDetails?.language.length - 1) return quali
                  else return quali + ", "
                })}
              </Text>}
              <View style={styles.frameContainer}>
                <View style={[styles.counselingPsychologyParent]}>
                  {data?.doctorDetails?.expertise.length > 0 &&
                    <Text style={[styles.counselingPsychology, { fontSize: 12, marginTop: 5, fontFamily: "poppins-regular", lineHeight: 15 }]}>
                      <Text
                        style={[styles.drStrange, { fontSize: 13 }]}
                      >
                        Specialization:{" "}
                      </Text>
                      {data?.doctorDetails?.expertise.map((quali, index) => {
                        if (index == data?.doctorDetails?.expertise.length - 1) return quali
                        else return quali + " , "
                      })}
                    </Text>
                  }
                  <Text style={[styles.counselingPsychology, { fontSize: 12, fontFamily: "poppins-regular", lineHeight: 15 }]}>
                    <Text
                      style={[styles.drStrange, { fontSize: 13, lineHeight: 22 }]}
                    >
                      Experience:{" "}
                    </Text>
                    {data?.doctorDetails?.experience}
                  </Text>

                  {data?.doctorDetails?.nationality && <Text style={[styles.counselingPsychology, { fontSize: 12, fontFamily: "poppins-regular", lineHeight: 15 }]}>
                    <Text
                      style={[styles.drStrange, { fontSize: 13, lineHeight: 22 }]}
                    >
                      Nationality:{"  "}
                    </Text>
                    {data?.doctorDetails?.nationality}
                  </Text>}

                  <Text
                    style={[styles.drStrange, { fontSize: 17, lineHeight: 19, marginTop: 10 }]}
                  >
                    About your wellness officer
                  </Text>
                  <Text style={[styles.birminghamUk, styles.ratingTypo, { fontSize: 12, marginTop: 2, fontFamily: "poppins-regular", lineHeight: 19, textAlign: "justify" }]}>

                    {displayText}
                  </Text>
                  {isLong && (
                    <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ width: "100%", alignItems: "flex-end", }}>
                      <Text style={{ color: Colors.green, marginBottom: 20, }}>
                        {expanded ? '- Read less' : '+ Read more'}
                      </Text>

                    </TouchableOpacity>
                  )}
                </View>
                {/* <View style={styles.frameView}>
                <View style={styles.starIconParent}>
                  <Image
                    style={styles.starIcon}
                    resizeMode="cover"
                    source={ImagesAssets.Star}
                  />
                  <Text style={[styles.rating, styles.ratingTypo]}>
                    {data?.doctorDetails?.rating} Rating
                  </Text>
                </View>
              </View> */}
              </View>
            </View>

            <Text
              style={[styles.drStrange, { fontSize: 18, marginVertical: 10 }]}
            >
              Appointment Details
            </Text>

            <View style={styles.drStrangeParent}>
              {/* <Text style={styles.drStrange}>
              {data?.appointmentUser?.fullName}
            </Text> */}
              <View style={styles.frameContainer}>
                <View style={styles.counselingPsychologyParent}>
                  {/* <Text style={styles.counselingPsychology}>
                  {data?.doctorDetails?.specialization}
                </Text> */}
                  <Text style={styles.counselingPsychology}>
                    <Text
                      style={[
                        styles.drStrange,
                        { fontSize: 14, lineHeight: 22 },
                      ]}
                    >
                      Appointment Timing :{" "}
                    </Text>
                    {formattedDateTime}
                  </Text>
                  <Text style={styles.counselingPsychology}>
                    <Text
                      style={[
                        styles.drStrange,
                        { fontSize: 14, lineHeight: 22 },
                      ]}
                    >
                      Description:{" "}
                    </Text>
                    {data?.description}
                  </Text>
                </View>
                {data?.images?.length > 0 && (
                  <View style={{ marginTop: 7 }}>
                    <ScrollView horizontal style={{ marginTop: 8 }}>
                      {data?.images?.map((uri, index) => (
                        <View key={index} style={styles.imageContainer}>
                          <TouchableOpacity onPress={() => openImageModal(uri)}>
                            <Image
                              source={{ uri }}
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: 12,
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showImageViewerModal}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeImageViewerModal}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
          </Modal>

          <View style={styles.frameParent1}>
            <View style={styles.akarIconsdotGridWrapper}>
              {/* <Image
              style={styles.akarIconsdotGrid}
              resizeMode="cover"
              source={ImagesAssets.dots}
            /> */}
            </View>
            {/* <Image
            style={styles.iconLike}
            resizeMode="cover"
            source={ImagesAssets.likeicon}
          /> */}
          </View>
        </View>
      </View>

      <View style={[styles.frameParent, { marginTop: 20 ,marginBottom:50}]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        <View style={styles.frameGroup}>
          <View style={styles.frameWrapper}>
            <Text
              style={[styles.drStrange, { fontSize: 18, marginVertical: 10 }]}
            >
              Appointment Status
            </Text>
            <View style={styles.drStrangeParent}>
              <View style={styles.frameContainer}>
                <View style={styles.counselingPsychologyParent}>
                  <Text style={styles.counselingPsychology}>
                    <Text
                      style={[
                        styles.drStrange,
                        { fontSize: 14, lineHeight: 22 },
                      ]}
                    >
                      Status:{" "}
                    </Text>
                    {data?.status}
                  </Text>
                  <Text style={styles.counselingPsychology}>
                    <Text
                      style={[
                        styles.drStrange,
                        { fontSize: 14, lineHeight: 22 },
                      ]}
                    >
                      Feedback:{" "}
                    </Text>
                    {data?.feedback ? data?.feedback : "----"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalImage: {
    width: "90%",
    height: "80%",
    borderRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    borderRadius: 18,
    padding: 5,
  },
  closeText: {
    fontSize: 40,
    color: "white",
  },
  imageContainer: {
    position: "relative",
    marginRight: 8,
  },
  ratingTypo: {
    fontSize: FontSize.captionC10Regular_size,
    color: Color.textText400,
    lineHeight: 14,
    textAlign: "left",
  },
  drStrange: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: FontFamily.whyteInktrap,
    color: "#262626",
    textAlign: "left",
    fontWeight: "500",
    alignSelf: "stretch",
  },
  counselingPsychology: {
    fontSize: FontSize.labelL12Regular_size,
    color: Color.textText400,

    fontFamily: FontFamily.captionC10Regular,

    alignSelf: "stretch",
  },
  birminghamUk: {
    fontFamily: FontFamily.captionC10Medium,
    fontSize: FontSize.captionC10Regular_size,
    fontWeight: "500",
  },
  counselingPsychologyParent: {
    gap: 4,
    alignSelf: "stretch",
  },
  starIcon: {
    width: 16,
    height: 16,
    overflow: "hidden",
  },
  rating: {
    fontFamily: FontFamily.captionC10Regular,
    fontSize: FontSize.captionC10Regular_size,
  },
  starIconParent: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: 101,
    padding: Padding.p_5xs,
    gap: 8,
    alignItems: "center",
    flexDirection: "row",
    borderRadius: Border.br_13xl,
  },
  frameView: {
    alignItems: "center",
    flexDirection: "row",
  },
  frameContainer: {
    gap: 24,
    alignSelf: "stretch",
  },
  drStrangeParent: {
    alignSelf: "stretch",
  },
  frameWrapper: {
    paddingTop: Padding.p_5xs,
    flex: 1,
  },
  akarIconsdotGrid: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  akarIconsdotGridWrapper: {
    borderRadius: 8,
    backgroundColor: "rgba(157, 157, 157, 0.1)",
    padding: 6,
    alignItems: "center",
    flexDirection: "row",
  },
  iconLike: {
    width: 24,
    height: 24,
    overflow: "hidden",
  },
  frameParent1: {
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  frameGroup: {
    width: width * 0.84,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Border.br_13xl,
    alignSelf: "stretch",
    overflow: "hidden", // Ensures blur is contained within the rounded border
  },
});

export default BookedDoctorProfileCard;
