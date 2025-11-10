import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView, Linking, Alert, Platform } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Icon from "react-native-vector-icons/FontAwesome";
import { FlatList, Switch } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from "moment";
import { apiServerUrl } from "../../Api";
import Colors from "../../colors/Colors";
import { Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("screen");

// Memoized components (unchanged)
const CertificationItem = memo(({ item }) => {
  const formatDateRange = useMemo(() => {
    if (!item.from && !item.to) return "N/A";
    const start = moment(item.from, ["D/M/YYYY", "DD/MM/YYYY"], true);
    const end = moment(item.to, ["D/M/YYYY", "DD/MM/YYYY"], true);
    const startFormatted = start.isValid() ? start.format("MMMM YYYY") : "Invalid";
    const endFormatted = end.isValid() ? end.format("MMMM YYYY") : "Invalid";
    return startFormatted === "Invalid" && endFormatted === "Invalid" ? "Invalid date" : `${startFormatted} - ${endFormatted}`;
  }, [item.from, item.to]);

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.shipText}>{item?.role || "N/A"}</Text>
      <Text style={styles.yearText}>{formatDateRange}</Text>
      <Text style={styles.roleText}>{item?.companyName || "N/A"}</Text>
    </View>
  );
});

const ExperienceItem = memo(({ item }) => {
  const formatDateRange = useMemo(() => {
    if (!item.from && !item.to) return "N/A";
    const start = moment(item.from, ["D/M/YYYY", "DD/MM/YYYY"], true);
    const end = moment(item.to, ["D/M/YYYY", "DD/MM/YYYY"], true);
    const startFormatted = start.isValid() ? start.format("MMMM YYYY") : "Invalid";
    const endFormatted = end.isValid() ? end.format("MMMM YYYY") : "Invalid";
    return startFormatted === "Invalid" && endFormatted === "Invalid" ? "Invalid date" : `${startFormatted} - ${endFormatted}`;
  }, [item.from, item.to]);

  return (
    <View style={styles.itemContainer}>
      <Text style={styles.shipText}>{item?.companyName || "N/A"}</Text>
      <Text style={styles.yearText}>{formatDateRange}</Text>
      <Text style={styles.roleText}>{item?.role ? item.role.slice(0, 30) : "N/A"}</Text>
    </View>
  );
});

const SocialMediaItem = memo(({ item }) => {
  const handlePress = useCallback(() => {
    if (item.link) {
      Linking.openURL(item.link).catch(() => {
        Alert.alert("Error", `Unable to open URL: ${item.link}`);
      });
    } else {
      Alert.alert("Invalid URL", `No URL provided for ${item.platform}`);
    }
  }, [item.link, item.platform]);

  return (
    <TouchableOpacity style={styles.socialMediaButton} onPress={handlePress}>
      <Icon name={item.platform} size={18} color="#B2C1BA" style={styles.icon} />
      <Text style={styles.socialMediaText}>
        {item.platform ? item.platform.charAt(0).toUpperCase() + item.platform.slice(1) : "N/A"}
      </Text>
      <Icon name="external-link" size={16} color="#B0DB02" style={styles.externalLinkIcon} />
    </TouchableOpacity>
  );
});

const About = ({ profile, setProfile }) => {
  const [age, setAge] = useState("");
  const [userDepartment, setUserDepartment] = useState(null);
  const [showAgeToOther, setShowAgeToOther] = useState(profile?.showAge || false);
  const [showReligionToOther, setShowReligionToOther] = useState(profile?.showReligion || false);
  const { t } = useTranslation();
  const colorCombination = useMemo(() => [
    { color: "#70611B", backgroundColor: "#F9CF23" },
    { color: "#436E0E", backgroundColor: "#B1DC02" },
    { color: "#73A04F", backgroundColor: "#053621" },
    { color: "#424B3E", backgroundColor: "#ededed" },
  ], []);

  const calculateAge = useCallback(() => {
    if (!profile?.dob) return "N/A";
    const [day, month, year] = profile.dob.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    if (isNaN(birthDate)) return "Invalid Date";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  }, [profile?.dob]);

  const fetchUserDepartment = useCallback(async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = dbResult ? JSON.parse(dbResult) : null;
      setUserDepartment(userDetails?.department || null);
    } catch (error) {
      console.error("Failed to fetch userDetails:", error);
      Alert.alert("Error", "Failed to load department information.");
    }
  }, []);

  const handleToggle = useCallback(async (field, value) => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = dbResult ? JSON.parse(dbResult) : null;
      if (!userDetails) {
        Alert.alert("Error", "User details not found. Please log in.");
        return;
      }

      const body = {
        userId: userDetails.id,
        showAge: field === "age" ? value : showAgeToOther,
        showReligion: field === "religion" ? value : showReligionToOther,
      };

      // Attempt to update profile via API
      await axios.put(`${apiServerUrl}/user/updateProfile`, body, {
        headers: {
          authToken: userDetails.authToken,
          "Content-Type": "application/json",
        },
      });

      // Update local profile state
      setProfile((prev) => ({ ...prev, ...body }));
      // Cache updated profile
      await AsyncStorage.setItem("cachedProfile", JSON.stringify({ ...profile, ...body }));
    } catch (error) {
      console.error("Toggle update failed:", error);
      // Update local state and cache even if API fails
      setProfile((prev) => ({ ...prev, [field === "age" ? "showAge" : "showReligion"]: value }));
      await AsyncStorage.setItem("cachedProfile", JSON.stringify({ ...profile, [field === "age" ? "showAge" : "showReligion"]: value }));
      Alert.alert("Offline Mode", "Changes saved locally. Will sync when online.");
    }
  }, [showAgeToOther, showReligionToOther, profile, setProfile]);

  useEffect(() => {
    setAge(calculateAge());
    fetchUserDepartment();
    setShowAgeToOther(profile?.showAge || false);
    setShowReligionToOther(profile?.showReligion || false);
  }, [profile, calculateAge, fetchUserDepartment]);

  const combinedHobbies = useMemo(() => [
    ...(profile?.favoriteActivity || []),
    ...(profile?.hobbies || []),
  ], [profile?.favoriteActivity, profile?.hobbies]);

  const hasMoreInfo = useMemo(() => (
    profile?.shipName || profile?.gender || profile?.experience ||
    profile?.ethnicity || profile?.relationshipStatus || profile?.religion ||
    profile?.smoker || profile?.alcohol || profile?.healthCondition
  ), [profile]);

  const capitalize = useCallback((str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "N/A", []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {!profile && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('noprofiledata')}</Text>
        </View>
      )}
      {userDepartment !== "Shore_Staff" && profile && (
        <View style={styles.leaderboardContainer}>
          <View style={styles.headerCard}>
            <View style={styles.leaderboardRow}>
              <Text style={styles.labelText}>{t('leaderboardrank')}</Text>
              <Text style={styles.countText}>
                <Text style={styles.hashSymbol}>#</Text>
                {profile?.userLeaderBoardPosition || "0"}
              </Text>
              <FontAwesome5 name="trophy" size={30} color={Colors.secondary} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <FontAwesome5 name="users" size={16} color="grey" style={styles.statIcon} />
                <Text style={styles.countTextOther}>{profile?.groupActivityCount || "0"}</Text>
              </View>
              <Text style={styles.labelTextOther}>{t('buddyupevents')}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <FontAwesome5 name="coins" size={16} color="grey" style={styles.statIcon} />
                <Text style={styles.countTextOther}>{profile?.rewardPoints || "0"}</Text>
              </View>
              <Text style={styles.labelTextOther}>{t('buddyupmiles')}</Text>
            </View>
          </View>
        </View>
      )}

      {combinedHobbies.length > 0 && (
        <View style={styles.section}>
          <View style={styles.hobbiesContainer}>
            {combinedHobbies.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.hobbyItem,
                  { backgroundColor: colorCombination[index % 4].backgroundColor },
                ]}
              >
                <Text
                  style={[
                    styles.hobbyText,
                    { color: colorCombination[index % 4].color },
                  ]}
                >
                  {capitalize(item)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {(profile?.bio || profile?.nationality || profile?.dob || profile?.mobileNumber || profile?.email) && (
        <View style={styles.chipCard}>
          {profile?.bio && (
            <View style={styles.section}>
              <Text style={[styles.chipTitle, { fontSize: 16, marginTop: 10 }]}>{t('personalinformation')}</Text>
              <Divider style={{ marginVertical: 10, marginHorizontal: 0 }} />
              <Text style={styles.chipTitle}>{t('bio')}</Text>
              <Text style={styles.sectionText}>{profile.bio}</Text>
            </View>
          )}
          {profile?.nationality && (
            <View style={styles.section}>
              <Text style={styles.chipTitle}>{t('location')}</Text>
              <Text style={styles.chipText}>{capitalize(profile.nationality)}</Text>
            </View>
          )}
          {profile?.dob && (
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.chipTitle}>{t('age')}</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>{showAgeToOther ? "Shown" : "Hidden"}</Text>
                  <Switch
                    trackColor={{ false: "#ccc", true: "#4cd137" }}
                    thumbColor="#ffffff"
                    ios_backgroundColor="#ccc"
                    onValueChange={(value) => {
                      setShowAgeToOther(value);
                      handleToggle("age", value);
                    }}
                    value={showAgeToOther}
                  />
                </View>
              </View>
              <Text style={styles.chipText}>{`${profile.dob} (${age})`}</Text>
            </View>
          )}
          {(profile?.mobileNumber || profile?.email) && (
            <View style={styles.section}>
              <Text style={styles.chipTitle}>{t('contact')}</Text>
              {profile?.mobileNumber && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('phone')}</Text>
                  <Text style={styles.value}>{profile.mobileNumber}</Text>
                </View>
              )}
              {profile?.email && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('email')}</Text>
                  <Text style={styles.value}>{profile.email}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {profile?.workingExperience?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle]}>{t('shipboard_experience')}</Text>
            <Divider style={{ marginVertical: 10, marginHorizontal: 0 }} />
            <FlatList
              data={profile.workingExperience}
              renderItem={({ item }) => <ExperienceItem item={item} />}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              inverted
            />
          </View>
        </View>
      )}

      {profile?.certifications?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('certifications')}</Text>
            <Divider style={{ marginVertical: 10, marginHorizontal: 0 }} />
            <FlatList
              data={profile.certifications}
              renderItem={({ item }) => <CertificationItem item={item} />}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              inverted
            />
          </View>
        </View>
      )}

      {profile?.SocialMediaLinks?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('social_media')}</Text>
            <FlatList
              data={profile.SocialMediaLinks}
              renderItem={({ item }) => <SocialMediaItem item={item} />}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            />
          </View>
        </View>
      )}

      {hasMoreInfo && (
        <View style={styles.card}>
          <View style={styles.section}>
            <View>
              <Text style={styles.sectionTitle}>{t('moreinformation')}</Text>
              <Divider style={{ marginVertical: 10, marginHorizontal: 0 }} />
            </View>
            <View style={styles.containerText}>
              {profile?.shipName && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('vessel')}</Text>
                  <Text style={styles.value}>{capitalize(profile.shipName)}</Text>
                </View>
              )}
              {profile?.gender && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('gender')}</Text>
                  <Text style={styles.value}>{capitalize(profile.gender)}</Text>
                </View>
              )}
              {profile?.experience && (
                <View style={styles.row}>
                  <Text style={[styles.title]}>{t('experience')}</Text>
                  <Text style={[styles.value, { color: "purple", fontWeight: "bold" }]}>
                    {`${profile.experience} Years`}
                  </Text>
                </View>
              )}
              {profile?.ethnicity && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('ethnicity')}</Text>
                  <Text style={styles.value}>{capitalize(profile.ethnicity)}</Text>
                </View>
              )}
              {profile?.relationshipStatus && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('relationship')}</Text>
                  <Text style={styles.value}>{capitalize(profile.relationshipStatus)}</Text>
                </View>
              )}
              {profile?.religion && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('religion')}</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.value}>{capitalize(profile.religion)}</Text>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>
                        {showReligionToOther ? t('shown') : t('hidden')}
                      </Text>
                      <Switch
                        trackColor={{ false: "#ccc", true: "#4cd137" }}
                        thumbColor="#ffffff"
                        ios_backgroundColor="#ccc"
                        onValueChange={(value) => {
                          setShowReligionToOther(value);
                          handleToggle("religion", value);
                        }}
                        value={showReligionToOther}
                      />
                    </View>
                  </View>
                </View>
              )}
              {profile?.smoker && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('smoking')}</Text>
                  <Text style={styles.value}>{capitalize(profile.smoker)}</Text>
                </View>
              )}
              {profile?.alcohol && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('alcohol')}</Text>
                  <Text style={styles.value}>{capitalize(profile.alcohol)}</Text>
                </View>
              )}
              {profile?.healthCondition && (
                <View style={styles.row}>
                  <Text style={styles.title}>{t('healthcondition')}</Text>
                  <Text style={styles.value}>{capitalize(profile.healthCondition)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: height * 0.1,
    backgroundColor: "#fff",
  },
  leaderboardContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#ebebeb",
    borderRadius: 15,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  headerCard: {
    width: "100%",
    height: height * 0.095,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: "#d4d4d4",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    marginRight: 8,
  },
  countText: {
    fontSize: 25,
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
  },
  countTextOther: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  labelText: {
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
  },
  labelTextOther: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
  },
  section: {
    width: "100%",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#454545",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  sectionText: {
    color: "#949494",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  itemContainer: {
    marginBottom: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  shipText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    fontWeight: '600',
    color: "#333",
  },
  yearText: {
    fontSize: 12,
    color: "#949494",
    fontFamily: "Poppins-Regular",
  },
  roleText: {
    fontSize: 12,
    color: "#949494",
    fontFamily: "Poppins-Regular",
  },
  socialMediaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6EBE9",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
    width: 30,
  },
  socialMediaText: {
    flex: 1,
    color: "#636363",
    fontSize: 16,
  },
  externalLinkIcon: {
    marginLeft: 10,
  },
  containerText: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    fontWeight: '600',
    color: "#333",
  },
  value: {
    marginHorizontal: 20,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "#333",
    marginRight: 6,
  },
  hashSymbol: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#666",
  },
  hobbiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
  },
  hobbyItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    alignItems: "center",
    flexDirection: "row",
  },
  hobbyText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    lineHeight: 14.4,
    textTransform: "capitalize",
  },
  chipCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
    borderColor: 'rgba(180,180,180,1)',
    borderWidth: 0.4,
  },
  chipTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: "600",
    color: "#333",
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
    borderColor: 'rgba(180,180,180,1)',
    borderWidth: 0.4,
  },
});

export default About;