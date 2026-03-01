import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from 'i18next';
import { ImagesAssets } from '@/src/utils/ImageAssets';

interface DoctorProfileDetailsCardProps {
  data: {
    profileUrl?: string;
    doctorName?: string;
    expertise?: string[];
    nationality?: string;
  };
}

const DoctorProfileDetailsCard: React.FC<DoctorProfileDetailsCardProps> = ({ data }) => {
  const mainExpertise = data?.expertise?.[0] || '';
  const truncatedExpertise =
    mainExpertise.length > 35 ? `${mainExpertise.substring(0, 35)}...` : mainExpertise;

  return (
    <View style={styles.card}>
      <View style={styles.innerContent}>
        <View style={styles.imageWrapper}>
          <View style={styles.placeholder} />
          <Image
            source={{ uri: data?.profileUrl || ImagesAssets.userIcon }}
            style={styles.profileImage}
            contentFit="contain"
            transition={300}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.doctorName}>{data?.doctorName}</Text>
          {truncatedExpertise ? (
            <Text style={styles.expertise}>{truncatedExpertise}</Text>
          ) : null}
          {data?.nationality ? (
            <Text style={styles.nationality}>
              {t('nationality')}: {data.nationality}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e8e8e8',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  expertise: {
    fontSize: 12,
    textTransform: 'capitalize',
    fontFamily: 'Poppins-Medium',
    color: '#555',
  },
  nationality: {
    fontSize: 12,
    textTransform: 'capitalize',
    fontFamily: 'Poppins-Regular',
    color: '#777',
  },
});

export default DoctorProfileDetailsCard;