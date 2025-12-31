import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Define the props type
interface DoctorProfileDetailsCardProps {
  data: {
    profileUrl?: string;
    doctorName?: string;
    expertise?: string[];
    nationality?: string;
  };
}

const DoctorProfileDetailsCard: React.FC<DoctorProfileDetailsCardProps> = ({ data }) => {
    console.log("data: ", JSON.stringify(data));
  const expertiseText =
    data?.expertise?.[0] && data.expertise[0].length > 30
      ? `${data.expertise[0].substring(0, 30)}...`
      : data?.expertise?.[0] || '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder} />
          <Image
            source={{ uri: data?.profileUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.doctorName}>{data?.doctorName || 'Dr. Name'}</Text>
          {expertiseText ? <Text style={styles.expertise}>{expertiseText}</Text> : null}
          {data?.nationality ? (
            <Text style={styles.nationality}>{data.nationality}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    width: '25%',
    height: 84,
    position: 'relative',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d9d9d9',
    borderRadius: 20,
  },
  profileImage: {
    position: 'absolute',
    top: -1,
    left: 0,
    width: '100%',
    height: 85,
    borderRadius: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    gap: 8,
  },
  doctorName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: '#262626',
    fontFamily: 'WhyteInktrap', // Keep if you have this font loaded in Expo
  },
  expertise: {
    fontSize: 12,
    color: '#888888', // Assuming textText400 is a gray
    fontFamily: 'CaptionC10Regular', // Keep if custom font is loaded
  },
  nationality: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888888',
    paddingTop: 4,
  },
});

export default DoctorProfileDetailsCard;