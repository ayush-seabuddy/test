import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { getallhelplines } from '@/src/apis/apiService';
import { showToast } from '../GlobalToast';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import Colors from '@/src/utils/Colors';
import AIJollieCard from './AIJollieCard';
import * as Haptics from 'expo-haptics';
import EmergencyModal from '../Modals/EmergencyModal';

interface Helpline {
    id: string;
    helplineName: string;
    helplineDescription: string;
    iconUrl: any;
}

const HelplineAndAICards = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [helplineData, setHelplineData] = useState<Helpline[]>([]);
    const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

    const staticHelpline: Helpline[] = [
        {
            id: 'static-1',
            helplineName: t('emergencyandsos'),
            helplineDescription: t('emergencyandsos_description'),
            iconUrl: ImagesAssets.sosImage,
        },
        {
            id: 'static-2',
            helplineName: t('sailorssocietylive'),
            helplineDescription: t('sailorssocietylive_description'),
            iconUrl: ImagesAssets.sailorsIcon,
        },
    ];

    const getHelplines = async () => {
        try {
            setLoading(true);
            const apiResponse = await getallhelplines({ helplineType: 'HELPLINE' });

            if (apiResponse.success && apiResponse.status === 200) {
                setHelplineData([...staticHelpline, ...(apiResponse.data || [])]);
            } else {
                showToast.error(t('oops'), apiResponse.message || t('somethingwentwrong'));
                setHelplineData(staticHelpline);
            }
        } catch (error: any) {
            showToast.error(t('oops'), t('somethingwentwrong'));
            setHelplineData(staticHelpline);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getHelplines();
    }, []);

    const openEmergencyModal = () => {
        Haptics.selectionAsync?.();
        setEmergencyModalVisible(true);
    };

    const renderItem = ({ item }: { item: Helpline }) => {
        const isEmergencySOS = item.id === 'static-1';

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => isEmergencySOS && openEmergencyModal()}
                disabled={!isEmergencySOS}
                style={!isEmergencySOS && { opacity: 0.95 }}
            >
                <View style={styles.card}>
                    <View style={styles.content}>
                        <Image source={item.iconUrl} style={styles.icon} contentFit="contain" />

                        <View style={styles.textContainer}>
                            <Text style={[styles.title, isEmergencySOS && styles.titleEmergency]}>
                                {item.helplineName}
                            </Text>
                            <Text style={styles.description}>{item.helplineDescription}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.lightGreen} />
            </View>
        );
    }

    return (
        <>
            <FlatList
                data={helplineData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    helplineData.length === 0 && styles.emptyListContent,
                ]}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>{t('no_helplines_available')}</Text>
                    </View>
                }
                ListFooterComponent={<AIJollieCard />}
            />

            {/* Emergency Modal */}
            <EmergencyModal
                visible={emergencyModalVisible}
                onClose={() => setEmergencyModalVisible(false)}
            />
        </>
    );
};

export default HelplineAndAICards;

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(185,185,185,0.3)',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 16,
        gap: 16,
    },
    icon: {
        width: 38,
        height: 38,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'WhyteInktrap-Bold',
        color: '#000000',
        lineHeight: 20,
    },
    titleEmergency: {
        color: '#D32F2F',
        fontWeight: '700',
    },
    description: {
        fontSize: 10,
        lineHeight: 15,
        color: '#454545',
        fontFamily: 'Poppins-Regular',
    },
    chevron: {
        fontSize: 24,
        color: '#D32F2F',
        fontWeight: '300',
    },
    listContent: {
        paddingBottom: 55,
        flexGrow: 1,
    },
    emptyListContent: {
        flex: 1,
        justifyContent: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
});