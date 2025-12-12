import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "@/src/utils/Colors";

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
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        showShadow && styles.bottomShadow,
        containerStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={onLeftPress}
        activeOpacity={0.7}
        disabled={!onLeftPress}
      >
        {leftIcon && leftIcon}
      </TouchableOpacity>

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={onRightPress}
        activeOpacity={0.7}
        disabled={!onRightPress}
      >
        {rightIcon && rightIcon}
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
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary || "#000",
  },
});

export default GlobalHeader;
