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
import {
    Freshchat,
    FreshchatConfig,
    FreshchatUser,
    ConversationOptions,
} from 'react-native-freshchat-sdk';
import { getUserDetails } from '@/src/utils/helperFunctions';

interface Helpline {
    id: string;
    helplineName: string;
    helplineDescription: string;
    iconUrl: any;
}

// Freshchat credentials
const APP_ID = "d3f0a0cc-c399-4f7d-a766-aa6178b81a2d";
const APP_KEY = "6284ec56-b238-4a42-b2ac-8685a420c73d";
const DOMAIN = "msdk.freshchat.com";

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

    useEffect(() => {
        const setupFreshchat = async () => {
            try {
                const config = new FreshchatConfig(APP_ID, APP_KEY, {
                    domain: DOMAIN,
                    cameraEnabled: true,
                    gallerySelectionEnabled: true,
                    responseExpectationEnabled: true,
                    teamMemberInfoVisible: true,
                    showNotificationBanner: true,
                });

                await Freshchat.init(config);

                const userData = await getUserDetails();
                console.log("User data loaded:", userData);

                const fcUser = new FreshchatUser();

                if (userData) {
                    const fullName = userData.fullName || userData.name || "Seafarer";
                    const nameParts = fullName.trim().split(" ");
                    fcUser.firstName = nameParts[0] || "Seafarer";
                    fcUser.lastName = nameParts.slice(1).join(" ") || "";

                    fcUser.email = userData.email || "";
                    fcUser.phone = userData.mobileNumber || userData.phone || "";
                    fcUser.phoneCountryCode = userData.countryCode || userData.phoneCountryCode || "+91";

                    Freshchat.setUser(fcUser);
                    Freshchat.identifyUser(userData.id || `guest_${Date.now()}`, null);

                    Freshchat.setUserProperties({
                        user_type: 'Seafarer',
                        employer: userData.companyName || 'Unknown Fleet',
                        vessel: userData.currentVessel || 'Not onboard',
                        rank: userData.designation || 'Not specified',
                        email: userData.email || '',
                        phone: userData.mobileNumber || '',
                    });

                    console.log(`Freshchat ready → ${fcUser.firstName} ${fcUser.lastName}`);
                } else {
                    Freshchat.setUser(fcUser);
                    Freshchat.identifyUser(`guest_${Date.now()}`, null);
                }
            } catch (err: any) {
                console.warn("Freshchat init failed:", err);
            }
        };

        setupFreshchat();
    }, []);

    useEffect(() => {
        const unreadListener = () => {
            Freshchat.getUnreadCountAsync((data) => {
                if (data?.status) console.log("Unread messages:", data.count);
            });
        };
        Freshchat.addEventListener(Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED, unreadListener);

        return () => {
            Freshchat.removeEventListeners(Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED);
        };
    }, []);

    /** API load */
    const getHelplines = async () => {
        try {
            setLoading(true);
            const res = await getallhelplines({ helplineType: "HELPLINE" });

            if (res.success && res.status === 200)
                setHelplineData([...staticHelpline, ...(res.data || [])]);
            else {
                showToast.error(t('oops'), res.message || t('somethingwentwrong'));
                setHelplineData(staticHelpline);
            }
        } catch (e) {
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
        Haptics.selectionAsync();
        setEmergencyModalVisible(true);
    };

    const openSailorsSocietyChat = () => {
        Haptics.selectionAsync();
        const options = new ConversationOptions();
        options.tags = ['sailorssociety', 'crisis', '24_7'];
        options.filteredViewTitle = "Sailors’ Society Crisis Support";
        Freshchat.showConversations(options);
    };

    const renderItem = ({ item }: { item: Helpline }) => {
        const SOS = item.id === "static-1";
        const Sailors = item.id === "static-2";

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    if (SOS) openEmergencyModal();
                    if (Sailors) openSailorsSocietyChat();
                }}
            >
                <View style={styles.card}>
                    <View style={styles.content}>
                        <Image source={item.iconUrl} style={styles.icon} contentFit="contain" />
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, SOS && styles.titleEmergency]}>
                                {item.helplineName}
                            </Text>
                            <Text style={styles.description}>{item.helplineDescription}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading)
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.lightGreen} />
            </View>
        );

    return (
        <>
            <FlatList
                data={helplineData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                nestedScrollEnabled
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
    icon: { width: 38, height: 38 },
    textContainer: { flex: 1 },
    title: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'WhyteInktrap-Bold',
        color: '#000',
        lineHeight: 20,
    },
    titleEmergency: { color: '#D32F2F', fontWeight: '700' },
    description: {
        fontSize: 10,
        lineHeight: 15,
        color: '#454545',
        fontFamily: 'Poppins-Regular',
    },
    listContent: { paddingBottom: 55, flexGrow: 1 },
    emptyListContent: { flex: 1, justifyContent: 'center' },
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
