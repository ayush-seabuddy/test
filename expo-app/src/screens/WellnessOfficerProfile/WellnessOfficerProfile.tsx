import GlobalHeader from '@/src/components/GlobalHeader';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import { Maximize2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import GlobalButton from '@/src/components/GlobalButton';
import EmptyComponent from '@/src/components/EmptyComponent';

const { height } = Dimensions.get('window');

const WellnessOfficerProfile = () => {
    const { item }: { item?: string } = useLocalSearchParams();
    const data = useMemo(() => JSON.parse(item || '{}'), [item]);

    const [expanded, setExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState('');

    const maxLength = 300;
    const isLongDescription = data?.description && data.description.length > maxLength;
    const displayDescription = expanded || !isLongDescription
        ? data?.description
        : `${data?.description?.substring(0, maxLength)}...`;

    const openImageModal = () => {
        if (data?.profileUrl) {
            setSelectedMedia(data.profileUrl);
            setModalVisible(true);
        }
    };

    const renderDetailItem = (label: string, value?: string | string[]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        const text = Array.isArray(value) ? value.join(', ') : value;

        return (
            <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t(label)}</Text>
                <Text style={styles.detailValue}>{text}</Text>
            </View>
        );
    };

    if (!data?.doctorName) {
        return (
            <View style={styles.emptyContainer}>
                <EmptyComponent text={t('nodataavailable')} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GlobalHeader title={t('WellnessOfficerProfile')} />

            <View style={styles.headerContainer}>
                <Image
                    source={{ uri: data.profileUrl || ImagesAssets.userIcon }}
                    style={styles.headerImage}
                    resizeMode="contain"
                />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                    style={StyleSheet.absoluteFillObject}
                />

                <TouchableOpacity style={styles.expandIcon} onPress={openImageModal}>
                    <Maximize2 size={18} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>

                <View style={styles.nameOverlay}>
                    <Text style={styles.doctorNameLarge}>{data.doctorName}</Text>
                    {data.contactDetails && (
                        <Text style={styles.contactOverlay}>{data.contactDetails}</Text>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.contentCard}>
                    <Text style={styles.sectionTitle}>{t('details')}</Text>
                    <View>
                        {renderDetailItem(t('languages'), data?.language)}
                        {renderDetailItem(t('experience'), data?.experience)}
                        {renderDetailItem(t('nationality'), data?.nationality)}
                        {renderDetailItem(t('specialization'), data?.expertise)}
                    </View>

                    <View style={styles.sectionDivider} />

                    <Text style={styles.sectionTitle}>{t('aboutyourwellnessofficer')}</Text>
                    <Text style={styles.descriptionText}>
                        {displayDescription}
                    </Text>

                    {isLongDescription && (
                        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.readMoreButton}>
                            <Text style={styles.readMoreText}>
                                {expanded ? t('readless') : t('readmore')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <View style={styles.bottomButtonContainer}>
                <GlobalButton
                    title={t('Book_an_appointment')}
                    buttonStyle={styles.bottomButton}
                    onPress={() => {
                        router.push({
                            pathname: '/AppointmentForm',
                            params: { data: JSON.stringify(data) },
                        });
                    }}
                />
            </View>

            <MediaPreviewModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                uri={selectedMedia}
                type="image"
            />
        </View>
    );
};

export default WellnessOfficerProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'Poppins-Regular',
    },
    headerContainer: {
        height: height * 0.30,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    expandIcon: {
        position: 'absolute',
        top: 10,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 12,
        zIndex: 10,
    },
    nameOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    doctorNameLarge: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    contactOverlay: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#fff',
        opacity: 0.95,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 100,
    },
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
    sectionTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#1a1a1a',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    detailLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#444',
        flex: 0.4,
    },
    detailValue: {
        textTransform: 'capitalize',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#222',
        flex: 0.6,
        textAlign: 'right',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 14,
    },
    descriptionText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        lineHeight: 24,
        color: '#333',
    },
    readMoreButton: {
        marginTop: 16,
        alignSelf: 'flex-end',
    },
    readMoreText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#00695c',
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    bottomButton: {
        width: '100%',
    },
});