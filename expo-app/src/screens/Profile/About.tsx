import { showToast } from '@/src/components/GlobalToast';
import { RootState } from '@/src/redux/store';
import Colors from '@/src/utils/Colors';
import { height, isShipStaff } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { AntDesign, Entypo, MaterialIcons } from '@expo/vector-icons'; // Added vector icons
import { Image } from 'expo-image';
import { ExternalLink } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

interface SocialLink {
  platform: string;
  link: string;
}
const About = () => {
  const { t } = useTranslation();
  const userDetails = useSelector((state: RootState) => state.userDetails);

  const capitalize = useCallback((str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : 'N/A'), []);

  const colorCombination = useMemo(
    () => [
      { color: '#70611B', backgroundColor: '#F9CF23' },
      { color: '#436E0E', backgroundColor: '#B1DC02' },
      { color: '#73A04F', backgroundColor: '#053621' },
      { color: '#424B3E', backgroundColor: '#ededed' },
    ],
    []
  );

  const combinedHobbies = useMemo(
    () => [...(userDetails?.favoriteActivity || []), ...(userDetails?.hobbies || [])],
    [userDetails?.favoriteActivity, userDetails?.hobbies]
  );

  const age = useMemo(() => {
    if (!userDetails?.dob) return 'N/A';
    const [day, month, year] = userDetails.dob.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    if (isNaN(birthDate.getTime())) return 'Invalid Date';
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge.toString();
  }, [userDetails?.dob]);

  const hasMoreInfo = useMemo(
    () =>
      userDetails?.shipName ||
      userDetails?.gender ||
      userDetails?.experience ||
      userDetails?.ethnicity ||
      userDetails?.relationshipStatus ||
      userDetails?.religion ||
      userDetails?.smoker ||
      userDetails?.alcohol ||
      userDetails?.healthCondition,
    [userDetails]
  );

  const handleSocialPress = useCallback((item: SocialLink) => {
    if (item.link) {
      Linking.openURL(item.link).catch(() => {
        showToast.error('Error', `Unable to open URL: ${item.link}`);
      });
    } else {
      showToast.error('Invalid URL', `No URL provided for ${item.platform}`);
    }
  }, []);

  const getSocialMediaIcon = useCallback((platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('facebook')) {
      return <Entypo name="facebook" size={18} color={Colors.primary} />;
    }
    if (lower.includes('twitter') || lower.includes('x')) {
      return <AntDesign name="x" size={18} color={Colors.primary} />;
    }
    if (lower.includes('instagram')) {
      return <Entypo name="instagram" size={18} color={Colors.primary} />;
    }
    if (lower.includes('linkedin')) {
      return <Entypo name="linkedin" size={18} color={Colors.primary} />;
    }
    return <MaterialIcons name="language" size={18} color={Colors.primary} />;
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!userDetails && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('noprofiledata')}</Text>
        </View>
      )}

      {/* Leaderboard Section */}
      {isShipStaff(userDetails?.department) && userDetails && (
        <View style={styles.leaderboardContainer}>
          <View style={styles.headerCard}>
            <View style={styles.leaderboardRow}>
              <Text style={styles.labelText}>{t('leaderboardrank')}</Text>
              <Text style={styles.countText}>
                <Text style={styles.hashSymbol}>#</Text>
                {userDetails?.userLeaderBoardPosition || '0'}
              </Text>
              <Image source={ImagesAssets.LeaderboardIcon} style={{ height: 30, width: 30, tintColor: Colors.lightGreen }} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Image source={ImagesAssets.users} style={styles.icon} />
                <Text style={styles.countTextOther}>{userDetails?.groupActivityCount || '0'}</Text>
              </View>
              <Text style={styles.labelTextOther}>{t('buddyupevents')}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Image source={ImagesAssets.coinStack} style={styles.icon} />
                <Text style={styles.countTextOther}>{userDetails?.rewardPoints || '0'}</Text>
              </View>
              <Text style={styles.labelTextOther}>{t('buddyupmiles')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Hobbies */}
      {combinedHobbies.length > 0 && (
        <View style={styles.section}>
          <View style={styles.hobbiesContainer}>
            {combinedHobbies.map((item, index) => (
              <View
                key={index}
                style={[styles.hobbyItem, { backgroundColor: colorCombination[index % 4].backgroundColor }]}
              >
                <Text style={[styles.hobbyText, { color: colorCombination[index % 4].color }]}>
                  {capitalize(item)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Personal Info Card */}
      {(userDetails?.bio || userDetails?.nationality || userDetails?.dob || userDetails?.mobileNumber || userDetails?.email) && (
        <View style={styles.chipCard}>
          {userDetails?.bio && (
            <View style={styles.section}>
              <Text style={[styles.chipTitle, { fontSize: 16, marginTop: 10 }]}>{t('personalinformation')}</Text>
              <Divider style={{ marginVertical: 10 }} />
              <Text style={styles.chipTitle}>{t('bio')}</Text>
              <Text style={styles.sectionText}>{userDetails.bio}</Text>
            </View>
          )}

          {userDetails?.nationality && (
            <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <Text style={styles.chipTitle}>{t('location')}</Text>
              <Text style={styles.chipText}>{capitalize(userDetails.nationality)}</Text>
            </View>
          )}

          {userDetails?.dob && (
            <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View style={styles.switchRow}>
                <Text style={styles.chipTitle}>{t('age')}</Text>
              </View>
              <Text style={styles.chipText}>{`${userDetails.dob} (${age})`}</Text>
            </View>
          )}

          {(userDetails?.mobileNumber || userDetails?.email) && (
            <View style={styles.section}>
              <Text style={styles.chipTitle}>{t('contact')}</Text>
              {userDetails?.mobileNumber && (
                <View style={styles.row}>
                  <Text style={styles.chipTitle}>{t('phone')}</Text>
                  <Text style={styles.value}>{userDetails.mobileNumber}</Text>
                </View>
              )}
              {userDetails?.email && (
                <View style={styles.row}>
                  <Text style={styles.chipTitle}>{t('email')}</Text>
                  <Text style={styles.value}>{userDetails.email}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Shipboard Experience */}
      {userDetails?.workingExperience?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('shipboard_experience')}</Text>
          <Divider style={{ marginVertical: 10 }} />
          {userDetails.workingExperience.slice().reverse().map((item: any) => (
            <View key={item.id || Math.random()} style={styles.itemContainer}>
              <Text style={styles.shipText}>{item?.companyName || 'N/A'}</Text>
              <Text style={styles.yearText}>
                {item.from && item.to
                  ? `${item.from.split('/').reverse().join('/')} - ${item.to.split('/').reverse().join('/')} `
                  : 'N/A'}
              </Text>
              <Text style={styles.roleText}>{(item?.role || 'N/A').slice(0, 30)}{item?.role?.length > 30 ? '...' : ''}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {userDetails?.certifications?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('certifications')}</Text>
          <Divider style={{ marginVertical: 10 }} />
          {userDetails.certifications.slice().reverse().map((item: any) => (
            <View key={item.id || Math.random()} style={styles.itemContainer}>
              <Text style={styles.shipText}>{item?.role || 'N/A'}</Text>
              <Text style={styles.yearText}>
                {item.from && item.to
                  ? `${item.from.split('/').reverse().join('/')} - ${item.to.split('/').reverse().join('/')} `
                  : 'N/A'}
              </Text>
              <Text style={styles.roleText}>{item?.companyName || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Social Media Links - Now with Vector Icons */}
      {userDetails?.SocialMediaLinks?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('social_media')}</Text>
          <Divider style={{ marginVertical: 10 }} />
          {userDetails.SocialMediaLinks.map((item: SocialLink) => (
            <TouchableOpacity
              key={item.platform}
              style={styles.socialMediaButton}
              onPress={() => handleSocialPress(item)}
            >
              {getSocialMediaIcon(item.platform)}
              <Text style={styles.socialMediaText}>{capitalize(item.platform)}</Text>
              <ExternalLink size={18} color="#B0DB02" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* More Information */}
      {hasMoreInfo && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('moreinformation')}</Text>
          <Divider style={{ marginVertical: 10 }} />
          <View style={styles.containerText}>
            {userDetails?.shipName && (
              <View style={styles.row}>
                <Text style={styles.title}>{t('vessel')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.shipName)}</Text>
              </View>
            )}
            {userDetails?.gender && (
              <View style={styles.row}>
                <Text style={styles.title}>{t('gender')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.gender)}</Text>
              </View>
            )}
            {userDetails?.experience && (
              <View style={styles.row}>
                <Text style={styles.title}>{t('experience')}</Text>
                <Text style={[styles.value, { color: 'purple', fontWeight: 'bold' }]}>
                  {`${userDetails.experience} Years`}
                </Text>
              </View>
            )}
            {userDetails?.ethnicity && (
              <View style={styles.row}>
                <Text style={styles.title}>{t('ethnicity')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.ethnicity)}</Text>
              </View>
            )}
            {userDetails?.relationshipStatus && (
              <View style={styles.row}>
                <Text style={styles.title}>{t('relationship')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.relationshipStatus)}</Text>
              </View>
            )}
            {userDetails?.religion && (
              <View style={styles.row}>
                <Text style={styles.title}>{t('religion')}</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.value}>{capitalize(userDetails.religion)}</Text>
                </View>
              </View>
            )}
            {userDetails?.smoker && (
              <View style={styles.row}>
                <Text style={styles.chipTitle}>{t('smoking')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.smoker)}</Text>
              </View>
            )}
            {userDetails?.alcohol && (
              <View style={styles.row}>
                <Text style={styles.chipTitle}>{t('alcohol')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.alcohol)}</Text>
              </View>
            )}
            {userDetails?.healthCondition && (
              <View style={styles.row}>
                <Text style={styles.chipTitle}>{t('healthcondition')}</Text>
                <Text style={styles.value}>{capitalize(userDetails.healthCondition)}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  // ... (your existing styles - unchanged)
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: height * 0.1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height,
  },
  errorText: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  leaderboardContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ebebeb',
    borderRadius: 15,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  headerCard: {
    width: '100%',
    height: height * 0.095,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#d4d4d4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 25,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  countTextOther: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Poppins-SemiBold',
  },
  labelText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  labelTextOther: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  hashSymbol: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#666',
  },
  section: {
    width: '100%',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#454545',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    color: '#949494',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  itemContainer: {
    marginBottom: 16,
  },
  shipText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  yearText: {
    fontSize: 14,
    color: '#949494',
    fontFamily: 'Poppins-Regular',
    marginVertical: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#949494',
    fontFamily: 'Poppins-Regular',
  },
  socialMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6EBE9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialMediaText: {
    flex: 1,
    color: '#636363',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 10,
  },
  containerText: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
    marginLeft: 'auto',
    width: "60%",
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#333',
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
  },
  hobbyItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  hobbyText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textTransform: 'capitalize',
  },
  chipCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  chipTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
});

export default About;