import Colors from "@/src/utils/Colors";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { ReactNode } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface GlobalHeaderProps {
  title?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showShadow?: boolean;
  backgroundColor?: string;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title = "",
  onLeftPress,
  onRightPress,
  leftIcon,
  rightIcon,
  containerStyle,
  titleStyle,
  showShadow = true,
  backgroundColor = "#fff",
}) => {
  /** Default back behavior */
  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else {
     router.canGoBack() ? router.back() : router.replace('/home'); 
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        showShadow && styles.bottomShadow,
        containerStyle,
      ]}
    >
      {/* LEFT ICON */}
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleLeftPress}
        activeOpacity={0.7}
      >
        {leftIcon ?? (
          <ChevronLeft size={24} color={Colors.textPrimary || "#000"} />
        )}
      </TouchableOpacity>

      {/* TITLE */}
      <View style={styles.titleWrapper}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* RIGHT ICON */}
      <TouchableOpacity
        style={[styles.iconContainer, { marginRight: 10 }]}
        onPress={onRightPress}
        activeOpacity={0.7}
        disabled={!onRightPress}
      >
        {rightIcon ?? <View style={{ width: 24 }} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  bottomShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 0,
      },
    }),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.background,
  },

  iconContainer: {
    width: 45,
    height: 45,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  titleWrapper: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    marginTop: Platform.OS === 'ios' ? 0 : 3,
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary || "#000",
  },
});

export default GlobalHeader;
