// ChatSearchComponent.tsx
import { ArrowLeft, Search } from "lucide-react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
// import { ImagesAssets } from "../../assets/ImagesAssets";

type ChatSearchComponentProps = {
  setSearchValue: (value: string) => void;
  close: () => void;
};

const ChatSearchComponent: React.FC<ChatSearchComponentProps> = ({ setSearchValue, close }) => {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<TextInput>(null);

  // Auto-focus when component mounts
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setSearchValue(text); // Real-time search update
  };

  const handleClear = () => {
    setSearchText("");
    setSearchValue("");
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.shadow} />
      {/* Back Button */}
      <TouchableOpacity onPress={close} style={styles.backButton}>
        <ArrowLeft color="black" size={25} />
      </TouchableOpacity>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search color="black" size={25} />

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search messages..."
          placeholderTextColor="#B7B7B7"
          value={searchText}
          onChangeText={handleTextChange}
          autoFocus={false} // We control focus manually for smoother animation
          returnKeyType="search"
          clearButtonMode="never"
        />

        {/* Clear Button (appears only when there's text) */}
        {/* {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Image
              source={ImagesAssets.close} // Make sure you have a close/X icon
              style={styles.clearIcon}
              tintColor="#999"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )} */}
      </View>

      {/* Optional Right Action (currently empty) */}
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  shadow: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#000",
    opacity: 0.15,
    borderRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(183, 183, 183, 0.12)",
    borderRadius: 25,
    paddingHorizontal: 14,
    height: 44,
    marginHorizontal: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    paddingVertical: 10,
    fontFamily: "Poppins-Regular", // Optional: match your app font
  },
  clearButton: {
    padding: 6,
  },
  clearIcon: {
    width: 16,
    height: 16,
  },
});

export default ChatSearchComponent;