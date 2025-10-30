// CustomHeader.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setSearchData } from "../../Redux/Search/action";
import { useFocusEffect } from "@react-navigation/native";

const SearchComponent = ({ navigation }) => {
  const [dataSearch, setdataSearch] = useState(null);
  const dispatch = useDispatch();

  // ✅ Clear search data whenever user leaves this screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(setSearchData());
        setdataSearch('');
      };
    }, [dispatch])
  );

  const SearchData = async (_searchItem) => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      if (_searchItem) {
        const SearchData = await apiCallWithToken(

          apiServerUrl +
          "/user/globalSearch?search=" +
          _searchItem +
          "&shipId=" +
          userDetails.shipId,
          "GET",
          null,
          userDetails.authToken
        );

        if (SearchData.responseCode === 200) {
          console.log("dfgdfgfd", JSON.stringify(SearchData.result), "dsfsdf");

          setdataSearch(SearchData.result);
          dispatch(setSearchData(SearchData.result));
        }
      } else {
        dispatch(setSearchData());
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            style={{ width: 24, height: 24 }}
            source={ImagesAssets.backArrow}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContainer}>
        <Image
          style={{ width: 25, height: 25 }}
          source={ImagesAssets.search}
          tintColor="#B7B7B7"
          resizeMode="cover"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Type to search"
          placeholderTextColor="#B7B7B7"
          value={dataSearch}
          onChangeText={SearchData}
        />
      </View>
      <View>
        {/* <TouchableOpacity
          style={{
            backgroundColor: "rgba(176, 219, 2, 0.4)",
            padding: 6,
            borderRadius: 8,
          }}
          onPress={() => alert("Settings clicked!")}
        >
          <Image
            style={{ width: 24, height: 24 }}
            source={ImagesAssets.search}
            resizeMode="cover"
          />
        </TouchableOpacity> */}
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
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  centerContainer: {
    alignItems: "center",
    width: "90%",
    flexDirection: "row",
    backgroundColor: "rgba(183, 183, 183, 0.1)",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 25,
  },
  searchInput: {
    height: 39, // Adjust height as needed
    width: "100%",
    color: "#000", // Text color for input
    paddingLeft: 10,
    paddingRight: 30,
  },
});

export default SearchComponent;
