import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";

const HeaderForAllMedia = ({ navigation, title, setContentType }) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filters = ["All", "Watch", "Listen", "Read"];

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

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Left Section: Back Button + Title */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>

        <Text style={styles.health}>
          {title.length > 15 ? `${title.slice(0, 15)} ...` : title}
        </Text>
      </View>

      {/* Right Section: Filter Dropdown */}
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownText}>{selectedFilter}</Text>
          <Image source={ImagesAssets.arrow_icon} style={styles.dropdownIcon} />
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

export default HeaderForAllMedia;
