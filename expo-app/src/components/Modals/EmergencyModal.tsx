import React, { useCallback, useState } from "react";
import {
    Modal,
    Text,
    StyleSheet,
    View,
    Pressable,
    Image,
    TouchableOpacity,
    FlatList,
    Linking,
    Alert,
    ActivityIndicator,
    Dimensions
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getallhelplines } from "@/src/apis/apiService";
import { showToast } from "../GlobalToast";
import { useTranslation } from "react-i18next";
import { PhoneCall, X } from "lucide-react-native";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get("window");

interface EmergencyItem {
    id: number;
    helplineName?: string;
    helplineDescription?: string;
    emergencyNumber?: string;
    emergencyWhatsappNumber?: string;
}

interface UserDetails {
    fullName?: string;
}

interface EmergencyModalProps {
    visible: boolean;
    onClose: () => void;
}

const EmergencyModal: React.FC<EmergencyModalProps> = ({ visible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<EmergencyItem[]>([]);
    const [user, setUser] = useState<UserDetails | null>(null);
    const { t } = useTranslation();

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('userDetails');
            if (userJson) {
                const parsed = JSON.parse(userJson);
                setUser({ fullName: parsed.fullName || parsed.name || 'Friend' });
            }
        } catch (error) {
            console.log("User load error:", error);
        }
    };

    const getEmergencyData = async () => {
        try {
            setLoading(true);
            const res = await getallhelplines({ helplineType: 'EMERGENCY_NUMBER' });

            if (res.success && res.status === 200) {
                setList(res.data || []);
            } else showToast.error(t('oops'), res.message || t('somethingwentwrong'));
        } catch {
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally { setLoading(false); }
    };

    useFocusEffect(
        useCallback(() => {
            if (visible) {
                loadUser();
                getEmergencyData();
            }
        }, [visible])
    );

    const callNow = (num?: string) => {
        if (!num) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL(`tel:${num}`).catch(() => Alert.alert(t('error'), t('cannot_make_call')));
    };

    const chatWhatsApp = (url?: string) => {
        if (!url) return;
        Haptics.selectionAsync();
        Linking.openURL(url).catch(() => Alert.alert("WhatsApp", t('whatsapp_not_installed')));
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>

                <Image source={ImagesAssets.EmergencyJollieImage} style={styles.backgroundImage} />

                <Pressable style={styles.overlay} onPress={onClose} />

                <View style={styles.card}>
                    <View style={styles.closeBtn}>
                        <Text style={styles.helloText}>
                            {t('hey')} <Text style={styles.name}>{user?.fullName || 'there'}!</Text>
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.heading}>{t('emergency_lines')}</Text>

                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#D32F2F" />
                        </View>
                    ) : list.length === 0 ? (
                        <Text style={styles.noData}>{t('no_emergency_numbers')}</Text>
                    ) : (
                        <FlatList
                            data={list}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <View style={styles.row}>
                                    <TouchableOpacity style={styles.rowLeft} onPress={() => callNow(item.emergencyNumber)}>
                                        <View style={styles.iconBox}><PhoneCall size={22} color="#000" /></View>

                                        <View style={{ flexShrink: 1 }}>
                                            <Text style={styles.nameText}>{item.helplineName}</Text>
                                            <Text style={styles.desc}>
                                                {(item.helplineDescription || "").replace(/\s*--?\s*/, " -\n")}
                                            </Text>
                                            <Text style={styles.phone}>{item.emergencyNumber}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {index !== 0 && item.emergencyWhatsappNumber && (
                                        <TouchableOpacity onPress={() => chatWhatsApp(item.emergencyWhatsappNumber)}>
                                            <Image source={ImagesAssets.WhatsappIcon} style={styles.wIcon} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default EmergencyModal;

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: "flex-end", },

    backgroundImage: {
        position: "absolute",
        top: height * 0.10,
        left: width * 0.10,
        width: width * 0.80,
        height: height * 0.40,
        resizeMode: "contain",
        zIndex: 3
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 2
    },

    card: {
        width: "100%",
        height: height * 0.65,
        backgroundColor: "#f0f0f0",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        paddingTop: 24,
        zIndex: 3,
        position: "absolute",
        bottom: 0
    },

    closeBtn: { justifyContent: 'space-between', flexDirection: 'row' },

    helloText: { fontSize: 16, fontFamily: "Poppins-SemiBold", color: '#333' },
    name: { color: "#D32F2F", fontFamily: "WhyteInktrap-Bold" },
    heading: { fontSize: 18, marginVertical: 5, fontFamily: "WhyteInktrap-Bold", lineHeight: 30 },
    noData: { textAlign: 'center', color: '#666', marginTop: 20 },

    row: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    rowLeft: { flexDirection: "row", flex: 1, alignItems: "center", marginRight: 12 },
    iconBox: { backgroundColor: "#FFBF00", padding: 12, borderRadius: 14, marginRight: 14 },
    nameText: { fontSize: 12, fontFamily: "WhyteInktrap-Medium", lineHeight: 20 },
    desc: { fontSize: 11, marginVertical: 4, color: '#555', fontFamily: "Poppins-Regular" },
    phone: { fontSize: 12, fontFamily: "Poppins-SemiBold" },
    wIcon: { width: 32, height: 32, tintColor: "#25D366" }
});
