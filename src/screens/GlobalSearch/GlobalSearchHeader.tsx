import { router } from 'expo-router';
import { t } from 'i18next';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const GlobalSearchHeader = ({SearchData}: {SearchData: (text: string) => void}) => {
    const [dataSearch, setDataSearch] = useState("");

    return (
        <View style={styles.container}>
            <View>
                <TouchableOpacity
                   onPress={() => {
                     router.back();
                   }}
                >

                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.centerContainer}>
                <Search size={20} color="#B7B7B7" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('typetosearch')}
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

export default GlobalSearchHeader