import { updateprofile, viewProfile } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { RootState } from '@/src/redux/store';
import { Edit, Trash2 } from 'lucide-react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CommonLoader from '@/src/components/CommonLoader';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import { useNetwork } from '@/src/hooks/useNetworkStatusHook';

const { width } = Dimensions.get('screen');

interface SocialLink {
  platform: string;
  link: string;
}

const ProfileColors = {
  linkIcon: '#666',
};

const URL_PATTERNS: Record<string, RegExp> = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+$/i,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+$/i,
  facebook: /^https?:\/\/(www\.)?facebook\.com\/.+$/i,
  x: /^https?:\/\/(www\.)?(x|twitter)\.com\/.+$/i,
};

const SocialMediaLinks = () => {
  const { t } = useTranslation();
  const userDetails = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();
  const isOnline = useNetwork();
  const [links, setLinks] = useState({
    linkedin: '',
    instagram: '',
    facebook: '',
    x: '',
  });

  const [savedLinks, setSavedLinks] = useState<SocialLink[]>(
    userDetails.SocialMediaLinks || []
  );

  const [loading, setLoading] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deletePlatform, setDeletePlatform] = useState('');

  useEffect(() => {
    getProfileDetails();
  }, []);

  useEffect(() => {
    const initialLinks = userDetails.SocialMediaLinks || [];
    const mapped = initialLinks.reduce((acc: any, { platform, link }: SocialLink) => {
      acc[platform.toLowerCase()] = link || '';
      return acc;
    }, {});
    setLinks((prev) => ({ ...prev, ...mapped }));
  }, [userDetails.SocialMediaLinks]);

  const getProfileDetails = async () => {
    if (!isOnline) {
      showToast.error(t('oops'), t('nointernetconnection'));
      return;
    }
    try {
      setLoading(true);
      const response = await viewProfile();
      if (response.status === 200) {
        const fetchedLinks = response.data.SocialMediaLinks || [];

        for (const property in response.data) {
          dispatch(updateUserField({ key: property, value: response.data[property] }));
        }

        setSavedLinks(fetchedLinks);

        const mapped = fetchedLinks.reduce((acc: any, { platform, link }: SocialLink) => {
          acc[platform.toLowerCase()] = link || '';
          return acc;
        }, {});
        setLinks((prev) => ({ ...prev, ...mapped }));
      }
    } catch {
      showToast.error(t('error'), t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };


  const updateSocialMediaLinks = async () => {
    const filledLinks = Object.entries(links).filter(
      ([, value]) => value.trim() !== ''
    );

    if (filledLinks.length === 0) {
      showToast.error(t('oops'), t('atleastOneLinkRequired'));
      return;
    }

    // 🔐 URL validation
    for (const [platform, link] of filledLinks) {
      const regex = URL_PATTERNS[platform];
      if (regex && !regex.test(link.trim())) {
        showToast.error(
          t('invalidUrlTitle'),
          t(`invalid_${platform}_url`)
        );
        return;
      }
    }

    try {
      setLoading(true);

      const validLinks: SocialLink[] = filledLinks.map(([platform, link]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        link: link.trim(),
      }));

      const updatedLinks = savedLinks.filter(
        (item) =>
          !validLinks.some(
            (newItem) =>
              newItem.platform.toLowerCase() === item.platform.toLowerCase()
          )
      );

      updatedLinks.push(...validLinks);

      const response = await updateprofile({
        userId: userDetails.id,
        SocialMediaLinks: updatedLinks,
      });

      if (response.status === 200) {
        setSavedLinks(updatedLinks);
        setEditingPlatform(null);
        showToast.success(t('success'), t('socialmediaaddedsuccessfully'));
      }
    } catch {
      showToast.error(t('error'), t('failedToSaveLinks'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (platform: string, link: string) => {
    setEditingPlatform(platform.toLowerCase());
    setLinks((prev) => ({ ...prev, [platform.toLowerCase()]: link }));
  };

  const handleDelete = (platform: string) => {
    setDeletePlatform(platform);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);

      const updatedLinks = savedLinks.filter(
        (item) => item.platform.toLowerCase() !== deletePlatform.toLowerCase()
      );

      await updateprofile({
        userId: userDetails.id,
        SocialMediaLinks: updatedLinks,
      });

      setSavedLinks(updatedLinks);
      setLinks((prev) => ({ ...prev, [deletePlatform.toLowerCase()]: '' }));
      showToast.success(t('success'), t('linkdeletedsuccessfully'));
    } catch {
      showToast.error(t('error'), t('failedToDeleteLink'));
    } finally {
      setLoading(false);
      setModalVisible(false);
      setDeletePlatform('');
    }
  };

  const renderPlatformIcon = (platform: string) => {
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
  };

  return (
    <View style={styles.main}>
      <GlobalHeader title={t('social_media')} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
      >
        {['linkedin', 'instagram', 'facebook', 'x'].map((platform) => (
          <View key={platform} style={styles.inputContainer}>
            {renderPlatformIcon(platform)}
            <TextInput
              style={styles.textInput}
              placeholder={t(`${platform}_url`)}
              placeholderTextColor="#B7B7B7"
              value={(links as any)[platform]}
              onChangeText={(text) =>
                setLinks((prev) => ({ ...prev, [platform]: text }))
              }
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={updateSocialMediaLinks}
          style={styles.updateButton}
          disabled={loading}
        >
          {loading ? (
            <CommonLoader color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>
              {editingPlatform ? t('updatelink') : t('savesocialmedialinks')}
            </Text>
          )}
        </TouchableOpacity>

        <FlatList
          data={savedLinks}
          keyExtractor={(item) => item.platform}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.experienceCard}>
              <View style={styles.experienceContent}>
                <View style={styles.platformRow}>
                  {renderPlatformIcon(item.platform)}
                  <Text style={styles.companyName}>{item.platform}</Text>
                </View>
                <Text style={styles.role}>{item.link}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item.platform, item.link)}>
                  <Edit size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.platform)}>
                  <Trash2 size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </KeyboardAwareScrollView>

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderText}>{t('deletelink')}</Text>
            <Text style={styles.modalText}>
              {t('remove')} {deletePlatform}?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>{t('no')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <CommonLoader color="#fff" />
                ) : (
                  <Text style={styles.deleteText}>{t('yes')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SocialMediaLinks;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#ededed' },
  container: { padding: 10, },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#454545',
  },
  updateButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  experienceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#fff',
  },
  experienceContent: { flex: 1 },
  platformRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  companyName: {
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  role: { fontSize: 12, color: '#666' },
  actions: { flexDirection: 'row', gap: 10 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalHeaderText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'red',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: { fontSize: 13 },
  deleteText: { fontSize: 13, color: '#fff' },
});
