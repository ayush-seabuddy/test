import { viewProfile } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import PostsOnCrewProfile from '@/src/components/PostsOnCrewProfile';
import Colors from '@/src/utils/Colors';
import { formatHobbies, formatShipName } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import { ExternalLink, Globe, HeartPulseIcon, Mars, Maximize2 } from 'lucide-react-native';
import moment from 'moment-timezone';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

const { height } = Dimensions.get('window');

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
  crewMembers?: { userId: string; isBoarded: boolean }[];
}

const Profile: React.FC = () => {
  const { crewId } = useLocalSearchParams<{ crewId: string }>();
  const [crewProfileDetails, setCrewProfileDetails] = useState<CrewProfile>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!crewId) return;

    try {
      setImageLoading(true); // Start loading when fetching profile
      const { data } = await viewProfile({ userId: crewId });
      if (data) {
        setCrewProfileDetails(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      // We'll handle image loading separately
    }
  }, [crewId]);

  useEffect(() => {
    if (crewId) fetchProfile();
  }, [crewId, fetchProfile]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/home');
    }
  }, []);

  const handleMediaPress = useCallback((url: string) => {
    if (url) {
      setSelectedMedia(url);
      setModalVisible(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleImageLoadStart = useCallback(() => {
    setImageLoading(true);
  }, []);

  const handleImageLoadEnd = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Memoized values
  const isOnboard = useMemo(() => {
    return crewProfileDetails.crewMembers?.find(
      (member) => member.userId === crewProfileDetails.id
    )?.isBoarded;
  }, [crewProfileDetails.crewMembers, crewProfileDetails.id]);

  const isShoreStaff = crewProfileDetails.department === 'Shore_Staff';

  const formattedFullName = useMemo(() => {
    return crewProfileDetails.fullName
      ? crewProfileDetails.fullName.charAt(0).toUpperCase() + crewProfileDetails.fullName.slice(1)
      : 'N/A';
  }, [crewProfileDetails.fullName]);

  const experienceYears = useMemo(() => {
    return crewProfileDetails.experience
      ? crewProfileDetails.experience.replace(/\s*years?/i, '')
      : '0';
  }, [crewProfileDetails.experience]);

  const formatDate = useCallback((date: string | undefined): string => {
    if (!date) return t('na');
    const parsed = moment(date, ['D/M/YYYY', 'DD/MM/YYYY'], true);
    return parsed.isValid() ? parsed.format('MMM/YYYY') : t('invalid_date');
  }, []);

  const getSocialMediaIcon = useCallback((platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Entypo name="facebook" size={20} color={ProfileColors.linkIcon} />;
      case 'x':
        return <AntDesign name="x" size={20} color={ProfileColors.linkIcon} />;
      case 'instagram':
        return <Entypo name="instagram" size={20} color={ProfileColors.linkIcon} />;
      case 'linkedin':
        return <Entypo name="linkedin" size={20} color={ProfileColors.linkIcon} />;
      default:
        return null;
    }
  }, []);


  const handleOpenLink = useCallback(async (link: string, platform: string) => {
    if (!link) {
      showToast.error(t('url_error', { url: platform }));
      return;
    }
    try {
      await Linking.openURL(link);
    } catch {
      showToast.error(t('url_error', { url: platform }));
    }
  }, []);

  const renderSocialMediaItem = useCallback(
    ({ item }: { item: SocialMediaLink }) => (
      <TouchableOpacity
        style={styles.socialItem}
        onPress={() => handleOpenLink(item.link, item.platform)}
      >
        {getSocialMediaIcon(item.platform)}
        <Text style={styles.socialPlatformText}>
          {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
        </Text>
        <ExternalLink size={20} color={ProfileColors.linkIcon} />
      </TouchableOpacity>
    ),
    [getSocialMediaIcon, handleOpenLink]
  );

  const socialMediaKeyExtractor = useCallback(
    (item: SocialMediaLink, index: number) => item.id || `${item.platform}-${index}`,
    []
  );

  const workingExperienceItems = useMemo(() => {
    return crewProfileDetails.workingExperience?.map((item) => ({
      ...item,
      key: `${item.companyName}-${item.from}-${item.to}`,
    }));
  }, [crewProfileDetails.workingExperience]);

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={t('crew_profile')}
        onLeftPress={handleBackPress}
        titleStyle={styles.headerTitle}
      />

      {crewProfileDetails.profileUrl && (
        <TouchableOpacity
          onPress={() => handleMediaPress(crewProfileDetails.profileUrl!)}
          style={styles.viewIconContainer}
        >
          <Maximize2 size={20} color={Colors.black} />
        </TouchableOpacity>
      )}

      {/* Image Background with Loader */}
      <ImageBackground
        source={crewProfileDetails.profileUrl ? { uri: crewProfileDetails.profileUrl } : ImagesAssets.userIcon}
        style={[
          crewProfileDetails.profileUrl ? styles.headerImage : styles.placeholderImage,
          imageLoading && { opacity: 0.7 }
        ]}
        defaultSource={ImagesAssets.userIcon}
        resizeMode="cover"
        onLoadStart={handleImageLoadStart}
        onLoadEnd={handleImageLoadEnd}
        onError={handleImageError}
      >
        {/* Loader overlay */}
        {imageLoading && crewProfileDetails.profileUrl && (
          <View style={styles.loaderOverlay}>
            <CommonLoader fullScreen />
          </View>
        )}
      </ImageBackground>

      <FlatList
        data={[{ key: 'profile-content' }]}
        renderItem={() => (
          <View style={styles.scrollContent}>
            <View style={styles.cardContainer}>
              <BlurView intensity={200} tint="light" style={StyleSheet.absoluteFill} />

              <View style={styles.crewDetailsContainer}>
                {/* Header Info */}
                <View style={styles.headerInfo}>
                  <Text style={styles.fullName}>{formattedFullName}</Text>
                  {crewProfileDetails.designation && (
                    <Text style={styles.designation}>{crewProfileDetails.designation}</Text>
                  )}
                  {crewProfileDetails.bio && (
                    <Text style={styles.bio}>{crewProfileDetails.bio}</Text>
                  )}
                </View>

                {/* Pills */}
                {(crewProfileDetails.nationality ||
                  crewProfileDetails.gender ||
                  crewProfileDetails.age ||
                  crewProfileDetails.relationshipStatus) && (
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
                          <HeartPulseIcon size={16} color={ProfileColors.textMuted} />
                          <Text style={styles.pillText}>{crewProfileDetails.relationshipStatus}</Text>
                        </View>
                      )}
                    </View>
                  )}

                {/* More Information */}
                <Text style={styles.sectionTitle}>{t('more_information')}</Text>
                <View style={styles.infoList}>
                  {crewProfileDetails.shipName && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('vessel')}</Text>
                      <Text style={styles.infoValue}>{formatShipName(crewProfileDetails.shipName)}</Text>
                    </View>
                  )}

                  {!isShoreStaff && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{t('status')}</Text>
                      <Text style={styles.infoValue}>{isOnboard ? t('onboard') : t('onleave')}</Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('hobbies')}</Text>
                    <Text style={styles.infoValue}>
                      {formatHobbies(crewProfileDetails.hobbies || [])}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('onboard_interests')}</Text>
                    <Text style={styles.infoValue}>
                      {formatHobbies(crewProfileDetails.favoriteActivity || [])}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  {!isShoreStaff && crewProfileDetails.userLeaderBoardPosition != null && (
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>
                        <Text style={styles.statHash}>#</Text>
                        {crewProfileDetails.userLeaderBoardPosition}
                      </Text>
                      <Text style={styles.statLabel}>{t('crew_ranking')}</Text>
                    </View>
                  )}
                  <View style={[styles.statCard, isShoreStaff && styles.fullWidthStat]}>
                    <Text style={styles.statValue}>{experienceYears}</Text>
                    <Text style={styles.statLabel}>{t('years_of_experience')}</Text>
                  </View>
                </View>

                {/* Working Experience */}
                {workingExperienceItems?.length ? (
                  <View style={styles.experienceCard}>
                    <Text style={styles.experienceTitle}>{t('experience')}</Text>
                    {workingExperienceItems.map((item) => (
                      <View key={item.key} style={styles.experienceItem}>
                        <Text style={styles.companyName}>{item.companyName}</Text>
                        <Text style={styles.role}>{item.role}</Text>
                        <Text style={styles.dateRange}>
                          {formatDate(item.from)} - {formatDate(item.to)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Social Media */}
                {crewProfileDetails.SocialMediaLinks?.length ? (
                  <View style={styles.socialCard}>
                    <Text style={styles.socialTitle}>{t('socials')}</Text>
                    <FlatList
                      data={crewProfileDetails.SocialMediaLinks}
                      renderItem={renderSocialMediaItem}
                      keyExtractor={socialMediaKeyExtractor}
                      scrollEnabled={false}
                    />
                  </View>
                ) : null}
                <View style={{ marginVertical: 10}}>
                  <Text style={styles.socialTitle}>{t('posts')}</Text>
                  <PostsOnCrewProfile userId={crewId}/>
                </View>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <MediaPreviewModal
        visible={modalVisible}
        onClose={handleCloseModal}
        uri={selectedMedia}
        type="image"
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b5b3b3' },
  headerTitle: { fontSize: 18 },
  headerImage: {
    width: '100%',
    height: height * 0.46,
    position: 'absolute',
    top: 51,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  placeholderImage: {
    width: '100%',
    height: height * 0.46,
    position: 'absolute',
    top: 80,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  scrollContent: { paddingTop: height * 0.42, paddingHorizontal: 10 },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  crewDetailsContainer: {
    paddingHorizontal: 25,
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerInfo: { paddingTop: Platform.OS === 'ios' ? 15 : 0 },
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
    marginVertical: 10,
    fontSize: 12,
    lineHeight: 20,
    color: 'rgb(49, 49, 49)',
    fontFamily: 'Poppins-Regular',
    fontWeight: '500',
  },
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: ProfileColors.rankingBg,
    flexDirection: 'row',
    gap: 5,
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
    paddingTop: 20,
  },
  infoList: { paddingVertical: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 5 },
  infoLabel: { flex: 0.5, fontFamily: 'Poppins-Regular', fontSize: 12 },
  infoValue: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 12 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 3 },
  statCard: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: ProfileColors.rankingBg,
    alignItems: 'center',
    width: '48%',
  },
  fullWidthStat: { width: '100%' },
  statValue: {
    fontSize: 28,
    color: ProfileColors.textMuted,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 39.2,
  },
  statHash: { fontSize: 13 },
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
    borderRadius: 10,
    marginTop: 7,
  },
  experienceTitle: { fontSize: 18, color: ProfileColors.textPrimary, fontFamily: 'WhyteInktrap-Bold', lineHeight: 20 },
  experienceItem: { marginVertical: 5 },
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
    lineHeight: 20,
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
    lineHeight: 20,
  },
  socialCard: {
    backgroundColor: ProfileColors.rankingBg,
    padding: 16,
    borderRadius: 10,
    marginTop: 7,
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
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    gap: 16,
  },
  socialPlatformText: {
    flex: 1,
    color: ProfileColors.socialText,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  viewIconContainer: {
    borderRadius: 5,
    backgroundColor: '#D9D9D9',
    position: 'absolute',
    right: 15,
    top: 80,
    zIndex: 30,
    padding: 10,
    opacity: 0.7,
  },
});