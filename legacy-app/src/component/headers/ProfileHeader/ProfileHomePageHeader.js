// CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { ImagesAssets } from '../../../assets/ImagesAssets';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useNavigation } from '@react-navigation/native';

const ProfileHomePageHeader = ({  navigateProfile }) => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <TouchableOpacity onPress={() => { navigation.navigate('Setting') }} style={styles.headerButton}>
                    <View style={styles.iconBackground}>
                        <Image source={ImagesAssets.setting_icon} style={styles.headerIcon} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.headerButtonsContainer}>
                {/* <TouchableOpacity onPress={() => { navigateProfile() }} style={styles.headerButton}>
                    <Image source={ImagesAssets.threeDot_icon} style={styles.headerIconRight} />
                </TouchableOpacity> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 10,
        backgroundColor:'#fff'
        // ...Platform.select({
        //   ios: {
        //     shadowColor: '#000',
        //     shadowOffset: {
        //       width: 0,
        //       height: 2,
        //     },
        //     shadowOpacity: 0.25,
        //     shadowRadius: 3.5,
        //   },
        //   android: {
        //     elevation: 5,
        //   },
        // }),
    },
    health: {
        fontSize: 18,
        lineHeight: 29,
        fontFamily: 'Poppins-Regular',
        color: '#262626',
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        marginRight: 10,
        padding: 5
    },
    headerButton: {
        marginLeft: 10,
    },
    headerIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    headerIconRight: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    iconBackground: {
        borderRadius: 8,
        paddingHorizontal: 3,
        paddingVertical: 3,
    },
    searchIconBackground: {
        backgroundColor: Colors.secondary,
        borderRadius: 8
    },
});

export default ProfileHomePageHeader;
