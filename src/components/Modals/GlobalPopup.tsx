import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from "react-native";

interface GlobalPopupProps {
    visible: boolean;
    onClose: () => void;
    month?: string;
    title?: string;
    subTitle?: string;
    message?: string;
    buttonText?: string;
    icon?: React.ReactNode; // Pass custom icon
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    subTitleStyle?: TextStyle;
    messageStyle?: TextStyle;
    buttonStyle?: ViewStyle;
    buttonTextStyle?: TextStyle;
    onButtonPress?: () => void;
    animationType?: "none" | "slide" | "fade";
}

const GlobalPopup: React.FC<GlobalPopupProps> = ({
    visible,
    onClose,
    month = "",
    title = "",
    subTitle = "",
    message = "",
    buttonText = "OK",
    icon,
    containerStyle,
    titleStyle,
    subTitleStyle,
    messageStyle,
    buttonStyle,
    buttonTextStyle,
    onButtonPress,
    animationType = "fade",
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType={animationType}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, containerStyle]}>
                    {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
                    {month ? <Text style={[styles.month, titleStyle]}>{month}</Text> : null}
                    {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
                    {subTitle ? (
                        <Text style={[styles.subTitle, subTitleStyle]}>{subTitle}</Text>
                    ) : null}
                    {message ? (
                        <Text style={[styles.message, messageStyle]}>{message}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.button, buttonStyle]}
                        activeOpacity={0.8}
                        onPress={onButtonPress || onClose}
                    >
                        <Text style={[styles.buttonText, buttonTextStyle]}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default GlobalPopup;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    iconContainer: {
        backgroundColor: '#fff7d1',
        padding: 15,
        borderRadius: 40,
        marginBottom: 15,
    },
    month: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24,
    },
    subTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#777',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    message: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#555',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 15,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
});
