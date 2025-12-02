import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions, Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const Header = ({  title, setContentType }: { title: string; setContentType: (contentType: string) => void;}) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filters: ("All" | "Watch" | "Listen" | "Read")[] = ["All", "Watch", "Listen", "Read"];

  useEffect(() => {
    switch (selectedFilter) {
      case "All":
        setContentType("");
        break;
      case "Watch":
        setContentType("VIDEO");
        break;
      case "Listen":
        setContentType("MUSIC");
        break;
      case "Read":
        setContentType("ARTICLE");
        break;
      default:
        setContentType("");
        break;
    }
  }, [selectedFilter]);

  const handleFilterSelect = (filter: "All" | "Watch" | "Listen" | "Read") => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  return (
    <View style={{ height: 60, flex:1 , flexDirection:"column", width: Dimensions.get("window").width}}>
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity 
        onPress={() => router.back()}
         style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <ChevronLeft size={24} color="black" />
          </View>
        </TouchableOpacity>

        <Text style={styles.health}>
          {title.length > 15 ? `${title.slice(0, 15)} ...` : title}
        </Text>
      </View>

      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownText}>{selectedFilter}</Text>
          <ChevronDown size={20} color="black" />  
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={styles.dropdownItem}
                onPress={() => handleFilterSelect(filter)}
              >
                <Text style={styles.dropdownItemText}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
    </View>
    <View style={{ height: 1 , ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: { elevation: 5 },
    }), backgroundColor: "#FFFFFF" , width: "100%"}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    zIndex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },
  health: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    marginRight: 10,
    padding: 5,
    position: "relative",
  },
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    marginLeft: 5,
    resizeMode: "contain",
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    zIndex: 10,
    width: 120,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: { elevation: 5 },
    }),
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
});

export default Header;
