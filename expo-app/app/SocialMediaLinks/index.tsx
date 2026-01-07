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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { height, width } = Dimensions.get('screen');

interface SocialLink {
  platform: string;
  link: string;
}

// Replace with your actual color value or import if defined elsewhere
const ProfileColors = {
  linkIcon: '#666', // fallback color matching WorkExperienceScreen icons
};

const SocialMediaLinks = () => {
  const { t } = useTranslation();
  const userDetails = useSelector((state: RootState) => state.userDetails);

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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [deletePlatform, setDeletePlatform] = useState<string>('');

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
    try {
      setLoading(true);
      const response = await viewProfile();

      if (response.status === 200) {
        const fetchedLinks = response.data.SocialMediaLinks || [];
        setSavedLinks(fetchedLinks);

        const mappedLinks = fetchedLinks.reduce((acc: any, { platform, link }: SocialLink) => {
          acc[platform.toLowerCase()] = link || '';
          return acc;
        }, {});

        setLinks((prev) => ({ ...prev, ...mappedLinks }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast.error(t('error'), t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMediaLinks = async () => {
    const validLinks = Object.entries(links)
      .filter(([, value]) => value.trim() !== '')
      .map(([platform, link]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        link: link.trim(),
      }));

    if (validLinks.length === 0) {
      showToast.error(t('oops'), t('atleastOneLinkRequired'));
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
        const mappedKeep = updatedLinks.reduce((acc: any, { platform, link }: SocialLink) => {
          acc[platform.toLowerCase()] = link || '';
          return acc;
        }, {});
        setLinks((prev) => ({ ...prev, ...mappedKeep }));
        showToast.success(
          t('success'),
          t('socialmediaaddedsuccessfully') || 'Links saved successfully!'
        );
      }
    } catch (error) {
      console.error('Update error:', error);
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
    const platformLower = deletePlatform.toLowerCase();

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
        showToast.success(t('success'), t('linkdeletedsuccessfully') || 'Link deleted successfully');
      }
    } catch (error) {
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
        showsVerticalScrollIndicator={false}
      >
        {/* LinkedIn Input */}
        <View style={styles.inputContainer}>
          {renderPlatformIcon('linkedin')}
          <TextInput
            style={styles.textInput}
            placeholder={t('enterhere')}
            placeholderTextColor="#B7B7B7"
            value={links.linkedin}
            onChangeText={(text) => setLinks((prev) => ({ ...prev, linkedin: text }))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Instagram Input */}
        <View style={styles.inputContainer}>
          {renderPlatformIcon('instagram')}
          <TextInput
            style={styles.textInput}
            placeholder={t('enterhere')}
            placeholderTextColor="#B7B7B7"
            value={links.instagram}
            onChangeText={(text) => setLinks((prev) => ({ ...prev, instagram: text }))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Facebook Input */}
        <View style={styles.inputContainer}>
          {renderPlatformIcon('facebook')}
          <TextInput
            style={styles.textInput}
            placeholder={t('enterhere')}
            placeholderTextColor="#B7B7B7"
            value={links.facebook}
            onChangeText={(text) => setLinks((prev) => ({ ...prev, facebook: text }))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* X Input */}
        <View style={styles.inputContainer}>
          {renderPlatformIcon('x')}
          <TextInput
            style={styles.textInput}
            placeholder={t('enterhere')}
            placeholderTextColor="#B7B7B7"
            value={links.x}
            onChangeText={(text) => setLinks((prev) => ({ ...prev, x: text }))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Save/Update Button */}
        <TouchableOpacity
          onPress={updateSocialMediaLinks}
          style={styles.updateButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>
              {editingPlatform ? t('updatelink') : t('savesocialmedialinks')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Saved Links List */}
        <FlatList
          data={savedLinks}
          keyExtractor={(item) => item.platform}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.experienceCard}>
              <View style={styles.experienceContent}>
                <View style={styles.platformRow}>
                  {renderPlatformIcon(item.platform)}
                  <Text style={styles.companyName}>
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </Text>
                </View>
                <Text style={styles.role}>{item.link}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleEdit(item.platform, item.link)}
                  style={styles.actionButton}
                >
                  <Edit size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.platform)}
                  style={styles.actionButton}
                >
                  <Trash2 size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </KeyboardAwareScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderText}>{t('deletelink')}</Text>
            <Text style={styles.modalText}>
              {t('remove')} {deletePlatform}?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setDeletePlatform('');
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>{t('no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={styles.deleteButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
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

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  container: {
    padding: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    marginTop: 5,
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
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 22,
  },
  experienceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  experienceContent: {
    flex: 1,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  role: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#666',
    marginLeft: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalHeaderText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 18,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#000',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  deleteText: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
});

export default SocialMediaLinks;