import React, { ReactNode } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ScrollView } from "react-native-gesture-handler";

interface Props {
  children: ReactNode;
}

const KeyboardWrapper: React.FC<Props> = ({ children }) => {
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1}}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      enableAutomaticScroll
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default KeyboardWrapper;
