import GlobalHeader from '@/src/components/GlobalHeader';
import Colors from '@/src/utils/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import { ArrowLeft, ChevronLeft, ExternalLink, Facebook, Globe, Instagram, Linkedin, Mars, Maximize2, Twitter } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { formatHobbies, formatShipName } from '@/src/utils/helperFunctions';
import moment from 'moment-timezone';
import Svg, { Defs, FeGaussianBlur, Filter, Rect } from 'react-native-svg';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import { viewProfile } from '@/src/apis/apiService';

const { width, height } = Dimensions.get('window');

// Centralized Color Palette
const ProfileColors = {
  background: 'rgba(255, 255, 255, 0.27)',
  blurOverlay: 'rgba(136, 135, 135, 0.59)',
  textPrimary: '#000000',
  textSecondary: 'rgba(6, 54, 31, 1)',
  textMuted: 'rgba(99, 99, 99, 1)',
  textLight: 'rgba(69, 69, 69, 1)',
  textDate: 'rgb(83, 83, 83)',
  pillBg: 'rgba(232, 232, 232, 0.4)',
  cardBg: 'rgba(255, 255, 255, 0.07)',
  cardBlurBg: 'rgba(255, 255, 255, 0.4)',
  rankingBg: 'rgba(170, 170, 170, 0.27)',
  experienceBg: 'rgba(255, 255, 255, 0.5)',
  border: '#b4b2b2',
  socialText: '#636363',
  linkIcon: Colors.primary,
  sectionTitle: '#454545',
};

// Interfaces
interface SocialMediaLink {
  id: string;
  platform: string;
  link: string;
}

interface WorkingExperience {
  companyName: string;
  role: string;
  from: string;
  to: string;
}

interface CrewProfile {
  id?: string;
  fullName?: string;
  designation?: string;
  bio?: string;
  profileUrl?: string;
  nationality?: string;
  gender?: string;
  age?: string;
  relationshipStatus?: string;
  shipName?: string;
  department?: string;
  hobbies?: string[];
  favoriteActivity?: string[];
  userLeaderBoardPosition?: number;
  experience?: string;
  workingExperience?: WorkingExperience[];
  SocialMediaLinks?: SocialMediaLink[];
  crewMembers?: Array<{ userId: string; isBoarded: boolean }>;
}

const Profile: React.FC = () => {
  const { crewId } = useLocalSearchParams<{ crewId: string }>();
  const [crewProfileDetails, setCrewProfileDetails] = useState<CrewProfile>({});
  console.log("crewProfileDetails: ", crewProfileDetails);

  useEffect(() => {
    if (crewId) {
      fetchProfile();
    }
  }, [crewId]);

  const fetchProfile = useCallback(async () => {
    if (!crewId) return;

    try {
      const { data } = await viewProfile({ userId: crewId });

      if (data) {
        setCrewProfileDetails(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [crewId]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  const getSocialMediaIcon = (item: SocialMediaLink) => {
    switch (item.platform) {
      case 'facebook':
        return <Facebook size={15} color={ProfileColors.linkIcon} />;
      case 'twitter':
        return <Twitter size={15} color={ProfileColors.linkIcon} />;
      case 'instagram':
        return <Instagram size={15} color={ProfileColors.linkIcon} />;
      case 'linkedin':
        return <Linkedin size={15} color={ProfileColors.linkIcon} />;
      default:
        return <></>;
    }
  };

  const handleOpenLink = async (item: SocialMediaLink) => {
    const url = item.link;

    if (url !== "") {
      await Linking.openURL(url);
    } else {
      Alert.alert(t('url_error', { url }));
    }
  };

  const renderSocialMediaItem = ({ item }: { item: SocialMediaLink }) => (
    <TouchableOpacity style={styles.socialItem} onPress={() => handleOpenLink(item)}>
      {getSocialMediaIcon(item)}
      <Text style={styles.socialPlatformText}>
        {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
      </Text>
      <ExternalLink size={20} color={ProfileColors.linkIcon} />
    </TouchableOpacity>
  );

  const formatDate = (date: string | undefined): string => {
    if (!date) return t("na");
    const parsed = moment(date, ['D/M/YYYY', 'DD/MM/YYYY'], true);
    return parsed.isValid() ? parsed.format('MMM/YYYY') : t("invalid_date");
  };

  const isOnboard = crewProfileDetails.crewMembers?.find(
    (member) => member.userId === crewProfileDetails.id
  )?.isBoarded;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string>("");


  const handleMediaPress = (url: string) => {
    setSelectedMedia(url);
    setModalVisible(true);

  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={t('crew_profile')}
        leftIcon={<ChevronLeft size={24} color={Colors.black} />}
        onLeftPress={handleBackPress}
        titleStyle={styles.headerTitle}
      />
      <TouchableOpacity
        onPress={() => handleMediaPress(crewProfileDetails?.profileUrl || "")}
        style={styles.viewIconContainer}
      >
        <Maximize2 size={20} color={Colors.black} />
      </TouchableOpacity>

      <ImageBackground
        source={{ uri: crewProfileDetails.profileUrl }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.cardContainer}>
          <BlurView
            intensity={200}
            tint="light"
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.crewDetailsContainer}>


            {/* Header Info */}
            <View style={styles.headerInfo}>
              <Text style={styles.fullName}>
                {crewProfileDetails.fullName
                  ? crewProfileDetails.fullName.charAt(0).toUpperCase() +
                  crewProfileDetails.fullName.slice(1)
                  : 'N/A'}
              </Text>
              <Text style={styles.designation}>{crewProfileDetails.designation || ''}</Text>
              <Text style={styles.bio}>{crewProfileDetails.bio || ''}</Text>
            </View>

            {/* Pills: Nationality, Gender, Age, Relationship */}
            <View style={styles.pillsContainer}>
              {crewProfileDetails.nationality && (
                <View style={styles.pill}>
                  <Globe size={16} color={ProfileColors.textMuted} />
                  <Text style={styles.pillText}>{crewProfileDetails.nationality}</Text>
                </View>
              )}
              {crewProfileDetails.gender && (
                <View style={styles.pill}>
                  <Mars size={16} color={ProfileColors.textMuted} />
                  <Text style={styles.pillText}>{crewProfileDetails.gender}</Text>
                </View>
              )}
              {crewProfileDetails.age && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{crewProfileDetails.age}</Text>
                </View>
              )}
              {crewProfileDetails.relationshipStatus && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    {crewProfileDetails.relationshipStatus}
                  </Text>
                </View>
              )}
            </View>

            {/* More Information Section */}
            <Text style={styles.sectionTitle}>{t('more_information')}</Text>
            <View style={styles.infoList}>
              {crewProfileDetails.shipName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t("vessel")}</Text>
                  <Text style={styles.infoValue}>
                    {formatShipName(crewProfileDetails.shipName)}
                  </Text>
                </View>
              )}

              {crewProfileDetails.department !== 'Shore_Staff' && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t("status")}</Text>
                  <Text style={styles.infoValue}>{isOnboard ? t("onboard") : t("onleave")}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("hobbies")}</Text>
                <Text style={styles.infoValue}>
                  {formatHobbies(crewProfileDetails.hobbies || [])}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t("onboard_interests")}</Text>
                <Text style={styles.infoValue}>
                  {formatHobbies(crewProfileDetails.favoriteActivity || [])}
                </Text>
              </View>
            </View>

            {/* Stats: Ranking & Experience */}
            <View style={styles.statsContainer}>
              {crewProfileDetails.department !== 'Shore_Staff' && (
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    <Text style={styles.statHash}>#</Text>
                    {crewProfileDetails.userLeaderBoardPosition || '0'}
                  </Text>
                  <Text style={styles.statLabel}>{t("crew_ranking")}</Text>
                </View>
              )}
              <View
                style={[
                  styles.statCard,
                  crewProfileDetails.department === 'Shore_Staff' && styles.fullWidthStat,
                ]}
              >
                <Text style={styles.statValue}>{crewProfileDetails.experience || '0'}</Text>
                <Text style={styles.statLabel}>{t("years_of_experience")}</Text>
              </View>
            </View>

            {/* Working Experience */}
            {crewProfileDetails.workingExperience?.length ? (
              <View style={styles.experienceCard}>
                <Text style={styles.experienceTitle}>{t("experience")}</Text>

                {crewProfileDetails.workingExperience.map((item) => (
                  <View
                    key={`${item.companyName}-${item.from}-${item.to}`}
                    style={styles.experienceItem}
                  >
                    <View style={styles.experienceHeader}>
                      <Text style={styles.companyName}>
                        {item.companyName.slice(0, 30)}
                      </Text>
                      <Text style={styles.dateRange}>
                        {formatDate(item.from)} - {formatDate(item.to)}
                      </Text>
                    </View>
                    <Text style={styles.role}>{item.role.slice(0, 30)}</Text>
                  </View>
                ))}
              </View>
            ) : null}


            {/* Social Media Links */}
            {crewProfileDetails.SocialMediaLinks?.length ? (
              <View style={styles.socialCard}>
                <Text style={styles.socialTitle}>{t("socials")}</Text>
                <FlatList
                  data={crewProfileDetails.SocialMediaLinks}
                  renderItem={renderSocialMediaItem}
                  keyExtractor={(item, index) => item.id || `${item.platform}-${index}`}
                  scrollEnabled={false}
                />

              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {modalVisible && <MediaPreviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        uri={selectedMedia}
        type="image"
      />}
    </View>
  );
};

export default Profile;

// Styles - All extracted, no inline
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b5b3b3',
  },
  headerTitle: {
    fontSize: 18,
  },
  headerImage: {
    width: '100%',
    height: height * 0.46,
    position: 'absolute',
    top: 51,
    left: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: height * 0.42,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: ProfileColors.background,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  crewDetailsContainer: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    backgroundColor: "rgba(0, 0, 0, 0.08)"
  },
  headerInfo: {
    paddingTop: Platform.OS === 'ios' ? 15 : 0,
  },
  fullName: {
    fontSize: 20,
    color: ProfileColors.textPrimary,
    fontFamily: 'WhyteInktrap-Bold',
    lineHeight: 24,
  },
  designation: {
    fontSize: 12,
    color: ProfileColors.textSecondary,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
  },
  bio: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgb(49, 49, 49)',
    fontFamily: 'Poppins-Regular',
    fontWeight: '500',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 3,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: ProfileColors.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillText: {
    fontSize: 12,
    color: ProfileColors.textMuted,
    fontFamily: 'Poppins-Medium',
    lineHeight: 14.4,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    color: ProfileColors.sectionTitle,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    paddingTop: 10,
  },
  infoList: {
    paddingVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 5
  },
  infoLabel: {
    flex: 0.5,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  infoValue: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 3,
  },
  statCard: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: ProfileColors.rankingBg,
    alignItems: 'center',
    width: '48%',
  },
  fullWidthStat: {
    width: '100%',
  },
  statValue: {
    fontSize: 28,
    color: ProfileColors.textMuted,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 39.2,
  },
  statHash: {
    fontSize: 13,
  },
  statLabel: {
    fontSize: 10,
    color: ProfileColors.textMuted,
    fontFamily: 'Poppins-Regular',
    lineHeight: 14.4,
    textAlign: 'center',
    width: '100%',
  },
  experienceCard: {
    backgroundColor: ProfileColors.rankingBg,
    padding: 16,
    borderRadius: 32,
    overflow: 'hidden',
    marginTop: 7,
    position: 'relative',
  },
  experienceTitle: {
    fontSize: 18,
    color: ProfileColors.textPrimary,
    fontFamily: 'WhyteInktrap-Bold',
    paddingTop: 20,
  },
  experienceItem: {
    marginVertical: 5,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  companyName: {
    fontSize: 12,
    color: ProfileColors.textLight,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  dateRange: {
    fontSize: 10,
    color: ProfileColors.textDate,
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  role: {
    fontSize: 12,
    marginTop: 5,
    color: ProfileColors.textLight,
    fontFamily: 'Poppins-Regular',
    lineHeight: 12,
  },
  socialCard: {
    backgroundColor: ProfileColors.rankingBg,
    padding: 16,
    borderRadius: 32,
    overflow: 'hidden',
    marginTop: 7,
    position: 'relative',
  },
  socialTitle: {
    fontSize: 18,
    color: ProfileColors.textPrimary,
    fontFamily: 'WhyteInktrap-Bold',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: ProfileColors.border,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    gap: 5
  },
  socialPlatformText: {
    flex: 1,
    color: ProfileColors.socialText,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  viewIconContainer: {
    borderRadius: 5,
    backgroundColor: "#D9D9D9",
    position: "absolute",
    right: 15,
    top: 80,
    zIndex: 30,
    padding: 10,
    opacity: 0.7,
  }
});