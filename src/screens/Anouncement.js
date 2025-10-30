import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Platform, ImageBackground, FlatList } from 'react-native';
import ProfleSettingHeader from '../component/headers/ProfileHeader/ProfleSettingHeader';
import Task from '../component/ProfileListComponents/Task';
import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
import Colors from '../colors/Colors';
import LinearGradient from "react-native-linear-gradient";
import { ImagesAssets } from '../assets/ImagesAssets';


const { width, height } = Dimensions.get("screen");

const Anouncement = ({ navigation }) => {
    const TaskCard = ({ title, description, daysLeft }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.required}>Required</Text>
                    <Text style={styles.daysLeft}>{daysLeft}</Text>
                </View>
                {/* <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>{description}</Text>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Image source={ImagesAssets.NextCircleIcon} style={styles.headerIconRight} />
                    </TouchableOpacity>
                </View> */}

            </View>
        );
    };
    const TaskNewCard = ({ title, description, daysLeft }) => {
        return (
            <View style={styles.card2}>
                <View style={styles.cardContent}>
                    {/* <Text style={styles.title}>{title}</Text> */}
                    <Image style={styles.layer2Icon2} resizeMode="cover" source={ImagesAssets.Layer_2} />

                </View>
                {/* <View style={styles.descriptionContainer}>
                    <Text style={styles.required}>Required</Text>
                    <Text style={styles.daysLeft}>{daysLeft}</Text>
                </View> */}
                <View style={styles.descriptionContainer2}>
                    <Text style={styles.description2}>{description}</Text>
                    <TouchableOpacity style={styles.iconContainer}>
                        <Image source={require('../assets/images/NewPostImage/rightArrowwhite.png')} style={styles.headerIconRight} />
                    </TouchableOpacity>
                </View>

            </View>
        );
    };

    const tasks = [
        { id: '1', title: 'Weekly meeting in Deck', description: '100 Points for Completing MBTI Test', daysLeft: "every tuesday 09:00 AM" },
        // { id: '2', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
        // { id: '3', title: 'Submit Feedback', description: '50 Points for Providing Feedback', daysLeft: 2 },
        // { id: '4', title: 'Submit Feedback', description: '50 Points for Providing Feedback', daysLeft: 2 },
        // { id: '5', title: 'Submit Feedback', description: '50 Points for Providing Feedback', daysLeft: 2 },
        // { id: '6', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
        // { id: '7', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
        // { id: '8', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
        // { id: '9', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
    ];

    const renderTaskCard = ({ item }) => (
        <TaskCard title={item.title} description={item.description} daysLeft={item.daysLeft} />
    );
    const renderCard = ({ item }) => (
        <TaskNewCard title={item.title} description={item.description} daysLeft={item.daysLeft} />
    );
    return (
        <>
            <FocusAwareStatusBar
                barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
                backgroundColor={Colors.white}
                hidden={false}
            />
            <ProfleSettingHeader navigation={navigation} title={"Announcement"} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.List}>
                        <Text style={styles.ListToDo}>To Do List</Text>
                        <TouchableOpacity style={styles.ListAllBtn}><Text style={styles.ListAll}>View All</Text></TouchableOpacity>
                    </View>
                    <Task />
                    <FlatList
                        contentContainerStyle={styles.containerFlatlist}
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTaskCard}
                    />
                    <FlatList
                        contentContainerStyle={styles.containerFlatlist}
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCard}
                    />
                </View>
                <View style={styles.container}>
                    <View style={styles.List}>
                        <Text style={styles.ListToDo}>History</Text>
                        <TouchableOpacity style={styles.ListAllBtn}><Text style={styles.ListAll}>View All</Text></TouchableOpacity>
                    </View>
                    {[...new Array(3)].map((_, index) => {
                        return (
                            <TouchableOpacity key={index} style={[styles.frameParent, styles.parentFlexBox]} onPress={() => { }}>
                                <LinearGradient style={styles.wrapperLayout} locations={[0, 1]} colors={['rgba(0, 0, 0, 0)', '#000']} useAngle={true} angle={140.38}>
                                    <ImageBackground style={[styles.icon, styles.iconLayout]} resizeMode="cover" source={ImagesAssets.cardimg}>
                                        <Text style={[styles.weeklyMeetingDeckContainer, styles.pointForCompletingTypo]}>
                                            {/* <Text style={styles.weeklyMeeting}>Anouncement & Event </Text> */}
                                            <Text style={styles.deck}>Anouncement & Event</Text>
                                            {/* /<Text style={styles.weeklyMeeting}> 17.00pm</Text> */}
                                        </Text>
                                        <Image style={styles.layer1Icon} resizeMode="cover" source={ImagesAssets.Layer_2} />
                                        <Text style={[styles.weeklyMeetingDeckContainer, styles.pointForCompletingTypo]}>
                                            <Text style={styles.weeklyMeeting}>Weekly Meeting </Text>
                                            <Text style={styles.deck}>@Deck</Text>
                                            {/* /<Text style={styles.weeklyMeeting}> 17.00pm</Text> */}
                                        </Text>
                                    </ImageBackground>
                                </LinearGradient>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,

    },
    List: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    ListToDo: {
        color: '#262626',
        fontSize: 18,
        fontWeight: '500',
        fontFamily: "WhyteInktrap-Bold",
    },
    ListAll: {
        color: '#B7B7B7',
        fontSize: 12,
        fontWeight: '400',
        fontFamily: "Poppins-Regular"
    },
    ListAllBtn: {
        //backgroundColor:'#F7F7F7',
    },
    containerFlatlist: {
        paddingHorizontal: 20,
    },
    parentFlexBox: {
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 16,
    },
    scrollView: {
        marginTop: 15, // Optional: Add some padding for aesthetics
    },
    iconLayout: {
        backgroundColor: "transparent",
        alignItems: "flex-end",
        height: 144,
        width: width - 40,
        borderRadius: 16, // Add border radius to icon layout
        overflow: "hidden", // Ensure the border radius takes effect
    },
    pointForCompletingTypo: {
        textAlign: "left",
        color: "#fff",
        lineHeight: 17,
        fontSize: 14,
    },
    layer1Icon: {
        width: 38,
        height: 38,
        overflow: "hidden",
        position: 'absolute',
        right: 20,
        top: 10,
    },
    layer2Icon2: {
        width: 38,
        height: 38,
        overflow: "hidden",
        position: 'absolute',
        left: 20,
        top: 5,
    },
    weeklyMeeting: {
        fontFamily: "Poppins-Regular",
    },
    deck: {
        fontWeight: "600",
        fontFamily: "Poppins-SemiBold",
    },
    weeklyMeetingDeckContainer: {
        alignSelf: "stretch",
    },
    icon: {
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 25, // Add border radius to the icon
        backgroundColor: "transparent",
        alignItems: "flex-end",
        height: "100%",
        width: "100%",
    },
    wrapperLayout: {
        height: 144,
        width: width - 40, // Corrected width calculation
        // paddingHorizontal: 20, // Moved outside of width calculation
        borderRadius: 16, // Proper border radius
        overflow: "hidden", // Ensure the border radius takes effect
    },

    frameParent: {
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
        paddingHorizontal: 20,
        marginVertical: 5,

    },
    card: {
        backgroundColor: '#B4B4B4',
        padding: 16,
        marginVertical: 4,
        borderRadius: 12,
        width: width * 0.9,
        height: height * 0.1,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    card2: {
        backgroundColor: '#B0DB02',
        padding: 16,
        marginVertical: 4,
        borderRadius: 12,
        width: width * 0.9,
        height: height * 0.15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    cardContent: {
        marginRight: 10,
        flexDirection: 'column',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    required: {
        fontSize: 12,
        color: '#780000',
        fontFamily: 'Poppins',
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    description2: {
        fontSize: 14,
        color: Colors.white,
    },
    daysLeft: {
        fontSize: 14,
        color: '#454545',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIconRight: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    descriptionContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
        alignItems: 'center'
    },
    descriptionContainer2: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 55,
        alignItems: 'center'
    },

});

export default Anouncement;
