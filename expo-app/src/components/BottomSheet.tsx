import React from "react";
import {
    View,
    StyleSheet,
    Pressable,
    Dimensions,
    Modal,
} from "react-native";

const { height } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const BottomSheet: React.FC<Props> = ({ visible, onClose, children }) => {
    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={styles.sheet} pointerEvents="box-none">
                {children}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
});

export default BottomSheet;
