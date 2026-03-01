// src/components/common/GlobalPopOver.tsx

import React, { ReactNode, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from "react-native";
import Popover from "react-native-popover-view";
import Colors from "@/src/utils/Colors";
import { Placement } from "react-native-popover-view/dist/Types";

interface GlobalPopOverProps {
  children: ReactNode;
  popOverText?: string;
  popOverContent?: ReactNode;
  showOkButton?: boolean;
  buttonText?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
}

const GlobalPopOver: React.FC<GlobalPopOverProps> = ({
  children,
  popOverText,
  popOverContent,
  showOkButton = false,
  buttonText = "Ok",
  buttonStyle,
  buttonTextStyle
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      isVisible={visible}
      placement={Placement.BOTTOM}
      onRequestClose={() => setVisible(false)}
      from={
        <TouchableOpacity onPress={() => setVisible(true)}>
          {children}
        </TouchableOpacity>
      }
      popoverStyle={styles.popover}
    >
      <View style={{ padding: 10 }}>

        {popOverContent ? (
          popOverContent
        ) : (
          <Text style={styles.text}>{popOverText}</Text>
        )}

        {showOkButton && (
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={[styles.okButton, buttonStyle]}   // <-- applied here
          >
            <Text style={[styles.okButtonText, buttonTextStyle]}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Popover>
  );
};

const styles = StyleSheet.create({
  popover: {
    padding: 12,
    borderRadius: 10,
    width: 300,
    backgroundColor: "white",
  },
  text: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  okButton: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  okButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
});

export default GlobalPopOver;
