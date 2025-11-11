import React, { useState, useRef, useEffect } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    Animated,
    Image,
    TextInput,
    TouchableOpacity,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
} from "react-native";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckSquare,
    Square,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import GlobalButton from "@/src/components/GlobalButton";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [emailError, setEmailError] = useState("");
    const { t } = useTranslation();

    const logoTranslateY = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [logoTranslateY]);

    const validateEmail = (value: string): boolean => {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(value);
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError(t("emailvalidation"));
        } else {
            setEmailError("");
        }
    };

    const toggleTerms = () => setTermsAccepted((prev) => !prev);

    const isFormValid =
        email && validateEmail(email) && password.length >= 8 && termsAccepted;

    const handleLogin = () => {
        setLoading(true);
        setTimeout(() => {
            console.log("Login Attempt:", { email, password });
            setLoading(false);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.wrapper}>
                    <View style={styles.backgroundOverlay} />

                    <View style={styles.topSection} />

                    <Animated.Image
                        source={ImagesAssets.splashCaptainImage}
                        style={[styles.logo, { transform: [{ translateY: logoTranslateY }] }]}
                    />

                    <View style={styles.formCard}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.formContent}
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>{t("welcome")}</Text>
                                <Text style={styles.subtitle}>{t("logintoyouraccount")}</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputWrapper}>
                                    <Mail size={20} color={Colors.iconMuted} style={styles.inputIconLeft} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t("enteryouremail")}
                                        placeholderTextColor={Colors.textPlaceholder}
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                {email && emailError ? (
                                    <Text style={styles.errorText}>{emailError}</Text>
                                ) : null}
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputWrapper}>
                                    <Lock size={20} color={Colors.iconMuted} style={styles.inputIconLeft} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={t("enterpassword")}
                                        placeholderTextColor={Colors.textPlaceholder}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <Eye size={22} color={Colors.iconMuted} style={styles.inputIconRight} />
                                        ) : (
                                            <EyeOff size={22} color={Colors.iconMuted} style={styles.inputIconRight} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {password && password.length < 8 ? (
                                    <Text style={styles.errorText}>
                                        {t("passwordshould8charlong")}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.termsRow}>
                                <TouchableOpacity onPress={toggleTerms} style={styles.checkbox}>
                                    {termsAccepted ? (
                                        <CheckSquare size={20} color={Colors.primaryLight} />
                                    ) : (
                                        <Square size={20} color={Colors.iconMuted} />
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.termsText}>{t("iacceptthe")}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log('NAVIGATING');
                                      router.push('../termsandcondition')
                                    }}
                                >
                                    <Text style={styles.termsLink}>{t("termsandconditions")}</Text>
                                </TouchableOpacity>
                            </View>

                            <GlobalButton
                                title={t("login")}
                                onPress={handleLogin}
                                loading={loading}
                                disabled={!isFormValid}
                            />

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => {

                                }}
                            >
                                <Text style={styles.forgotPasswordText}>{t("forgotPassword")}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    wrapper: {
        flex: 1,
        overflow: "hidden",
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
    },
    topSection: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.42,
        backgroundColor: Colors.background,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    logo: {
        width: "100%",
        height: "35%",
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 50,
    },
    formCard: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.53,
        backgroundColor: Colors.loginformBackground,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingVertical: 20,
    },
    formContent: {
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontFamily: "WhyteInktrap-Bold",
        fontSize: 20,
        color: Colors.textPrimary,
        paddingTop: Platform.OS === "android" ? 0 : 10,
    },
    subtitle: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: Colors.textPrimary,
        marginTop: 12,
    },
    inputGroup: {
        alignItems: "center",
        marginVertical: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.inputBackground,
        width: "89%",
        height: 48,
        borderRadius: 8,
    },
    inputIconLeft: {
        marginLeft: 15,
        marginRight: 10,
    },
    inputIconRight: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontFamily: "Poppins-Regular",
        fontSize: 14,
    },
    errorText: {
        fontSize: 12,
        color: Colors.error,
        marginHorizontal: 25,
        marginTop: 4,
        fontFamily: "Poppins-Regular",
        alignSelf: "flex-start",
    },
    termsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 18,
        marginTop: 10,
        marginBottom: 16,
    },
    checkbox: {
        marginRight: 8,
    },
    termsText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontFamily: "Poppins-Regular",
    },
    termsLink: {
        fontSize: 12,
        color: Colors.blueLink,
        fontFamily: "Poppins-Regular",
        marginLeft: 5,
        textDecorationLine: "underline",
    },
    forgotPassword: {
        marginTop: 20,
        alignItems: "center",
    },
    forgotPasswordText: {
        fontSize: 12,
        color: Colors.textMuted,
        fontFamily: "Poppins-Regular",
    },
});