// screens/SocialMediaLinks.tsx
import { updateprofile, viewProfile } from '@/src/apis/apiService';
import CustomLottie from '@/src/components/CustomLottie';
import GlobalHeader from '@/src/components/GlobalHeader';
import { RootState } from '@/src/redux/store';
import { router } from 'expo-router';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Dimensions,
    FlatList,
    TextInput as NativeTextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('screen');

interface SocialLink {
  platform: string;
  link: string;
}

interface UserDetails {
  id: string;
  authToken: string;
}

const SocialMediaLinks = () => {
  const { t } = useTranslation();

  const userDetails = useSelector((state: RootState) => state.userDetails);
  const [links, setLinks] = useState({
    linkedin: '',
    instagram: '',
    facebook: '',
    telegram: '',
  });

  useEffect(() => {
    const initialLinks = userDetails.SocialMediaLinks || [];
    const mapped = initialLinks.reduce((acc: any, { platform, link }: any) => {
      acc[platform.toLowerCase()] = link || '';
      return acc;
    }, {});
    setLinks((prev) => ({ ...prev, ...mapped }));
  }, [userDetails.SocialMediaLinks]);

  const [savedLinks, setSavedLinks] = useState<SocialLink[]>(userDetails.SocialMediaLinks || []);
  const [loading, setLoading] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);


  useEffect(() => {
    getProfileDetails();
  }, []);

  const getProfileDetails = async () => {
    try {
      setLoading(true);
      const response = await viewProfile();

      if (response.status === 200) {
        const fetchedLinks = response.data.SocialMediaLinks || [];
        setSavedLinks(fetchedLinks);

        // Map saved links to input fields
        const mappedLinks = fetchedLinks.reduce((acc: any, { platform, link }: SocialLink) => {
          acc[platform.toLowerCase()] = link;
          return acc;
        }, {});
        setLinks((prev) => ({ ...prev, ...mappedLinks }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Toast.show({ type: 'error', text1: t('somethingWentWrong') });
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMediaLinks = async () => {
    const validLinks = Object.entries(links)
      .filter(([, value]) => value.trim() !== '')
      .map(([platform, link]) => ({ platform: platform.charAt(0).toUpperCase() + platform.slice(1), link }));

    if (validLinks.length === 0) {
      Toast.show({ type: 'error', text1: t('atleastOneLinkRequired') });
      return;
    }

    try {
      setLoading(true);

      const updatedLinks = savedLinks.filter(
        (item) => !validLinks.some((newLink) => newLink.platform === item.platform)
      );

      updatedLinks.push(...validLinks);

      const body = {
        userId: userDetails.id,
        SocialMediaLinks: updatedLinks,
      };

      const response = await updateprofile(body);

      if (response.status === 200) {
        setSavedLinks(updatedLinks);
        setEditingPlatform(null);
        setLinks({ linkedin: '', instagram: '', facebook: '', telegram: '' });
        Toast.show({
          type: 'success',
          text1: t('socialmediaaddedsuccessfully') || 'Links saved successfully!',
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      Toast.show({ type: 'error', text1: t('failedToSaveLinks') });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (platform: string, link: string) => {
    setEditingPlatform(platform.toLowerCase());
    setLinks((prev) => ({
      ...prev,
      [platform.toLowerCase()]: link,
    }));
  };

  const handleDelete = (platformToDelete: string) => {
    const platformLower = platformToDelete.toLowerCase();

    // Show confirmation
    Alert.alert(
      t('deletelink'),
      `${t('remove')} ${platformToDelete}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const updatedLinks = savedLinks.filter(
                (item) => item.platform.toLowerCase() !== platformLower
              );

              const body = {
                userId: userDetails.id,
                SocialMediaLinks: updatedLinks,
              };

              const response = await updateprofile(body);

              if (response.status === 200) {
                setSavedLinks(updatedLinks);
                setLinks((prev) => ({ ...prev, [platformLower]: '' }));
                Toast.show({
                  type: 'success',
                  text1: t('linkdeletedsuccessfully') || 'Link deleted successfully',
                });
              }
            } catch (error) {
              Toast.show({ type: 'error', text1: t('failedToDeleteLink') });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Reusable Black Input Component
  const BlackInput = ({
    label,
    value,
    onChangeText,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
  }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <NativeTextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.nativeInput}
          placeholderTextColor="#666"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  return (
    <>
      <GlobalHeader
        title={t('social_media')}
        onLeftPress={() => router.back()}
        leftIcon={<ChevronLeft size={24} color="#000" />}
      />

      {/* {loading && <Loader />} */}

      <View style={{ flex: 1, padding: 14 }}>
        {/* Input Fields */}
        <BlackInput
          label={t('linkedin')}
          value={links.linkedin}
          onChangeText={(text) => setLinks({ ...links, linkedin: text })}
        />

        <BlackInput
          label={t('instagram')}
          value={links.instagram}
          onChangeText={(text) => setLinks({ ...links, instagram: text })}
        />

        <BlackInput
          label={t('facebook')}
          value={links.facebook}
          onChangeText={(text) => setLinks({ ...links, facebook: text })}
        />

        <BlackInput
          label={t('telegram')}
          value={links.telegram}
          onChangeText={(text) => setLinks({ ...links, telegram: text })}
        />

        <TouchableOpacity
          onPress={updateSocialMediaLinks}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>
            {editingPlatform ? t('updatelink') : t('savesocialmedialinks')}
          </Text>
        </TouchableOpacity>

        {/* Saved Links */}
        {savedLinks.length > 0 && (
          <FlatList
            data={savedLinks}
            keyExtractor={(item) => item.platform}
            renderItem={({ item }) => (
              <View style={styles.savedCard}>
                <View>
                  <Text style={styles.platformText}>
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </Text>
                  <Text style={styles.linkText}>{item.link}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item.platform, item.link)}>
                    <Edit size={20} color="#000" strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.platform)}>
                    <Trash2 size={20} color="red" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Background Lottie */}
      <View style={styles.backgroundLottie}>
        <CustomLottie />
      </View>

      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  nativeInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000', // Black text when typing
  },
  saveButton: {
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'WhyteInktrap-Medium',
    fontSize: 18,
  },
  savedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  platformText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  linkText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  backgroundLottie: {
    position: 'absolute',
    bottom: 0,
    height: height * 0.5,
    width: '100%',
    backgroundColor: '#c1c1c1',
    overflow: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: -1,
  },
});

export default SocialMediaLinks;