import { ArrowLeft, Search } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type ChatSearchComponentProps = {
  setSearchValue: (value: string) => void;
  close: () => void;
};

const ChatSearchComponent: React.FC<ChatSearchComponentProps> = ({ setSearchValue, close }) => {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setSearchValue(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.shadow} />
      <TouchableOpacity onPress={close} style={styles.backButton}>
        <ArrowLeft color="black" size={25} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <View style={{ marginRight: 10 }}>
          <Search color="black" size={24} />

        </View>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search messages..."
          placeholderTextColor="#B7B7B7"
          value={searchText}
          onChangeText={handleTextChange}
          autoFocus={false}
          returnKeyType="search"
          clearButtonMode="never"
        />
      </View>
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
    elevation: 5,
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
    fontFamily: "Poppins-Regular",
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