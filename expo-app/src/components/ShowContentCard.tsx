import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import EmptyComponent from "./EmptyComponent";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const ShowContentCard = ({ data, keyId }: { data: any, keyId: any }) => {
    const displayData = data.allContents || data;
    const { t } = useTranslation();
    const getContentTypeConfig = (contentType: 'ARTICLE' | 'VIDEO' | 'MUSIC') => {
        switch (contentType) {
            case "ARTICLE":
                return {
                    navigationScreen: "ArticlesDetails",
                    emptyMessage: "No Article Found",
                    imageComponent: Image,
                    imageStyle: styles.imageBackground,
                    cardStyle: styles.cardContainer,
                    cardContentStyle: styles.cardContent,
                    textContainerStyle: styles.textContainer,
                    showPlayIcon: false,
                };
            case "VIDEO":
                return {
                    navigationScreen: "VideosDetails",
                    emptyMessage: "No Video Found",
                    imageComponent: Image,
                    imageStyle: styles.imageBackground,
                    cardStyle: styles.cardContainer,
                    cardContentStyle: styles.cardContent,
                    textContainerStyle: styles.textContainer,
                    showPlayIcon: false,
                };
            case "MUSIC":
                return {
                    navigationScreen: "MusicPlayer",
                    emptyMessage: "No Audio Found",
                    imageComponent: Image,
                    imageStyle: styles.imageBackground,
                    cardStyle: styles.cardContainer,
                    cardContentStyle: styles.cardContent,
                    textContainerStyle: styles.textContainer,
                    showPlayIcon: false,
                };
            default:
                return null;
        }
    };

    const RenderData = ({ item }: { item: any, index: number }) => {

        const config = getContentTypeConfig(item.contentType);
        if (!config) return null;
        if (item.contentType === "VIDEO") {
            if (keyId === "Home" && item.contentCategory !== "VIDEO") return null;
            if (keyId !== "Home" && item.contentCategory === "TRAINING") return null;
        }


        return (
            <TouchableOpacity
                style={config.cardStyle}
                onPress={() =>
                    router.push({
                        pathname: "/contentDetails/[contentId]",
                        params: { contentId: item.id },
                    })
                }
            >
                <View style={config.cardContentStyle}>

                    <Image
                        style={config.imageStyle}
                        contentFit="cover"
                        source={{
                            uri: item?.thumbnail
                        }} />
                    <View style={styles.textContainer}>
                        <Text
                            style={[styles.titleText, styles.textColorWhite]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item?.contentTitle.slice(0, 25)}
                        </Text>
                    </View>
                    <LinearGradient
                        colors={['transparent', 'rgba(65, 65, 65, 0.56)']}
                        style={styles.gradientOverlay}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    />

                </View>
            </TouchableOpacity>
        );
    };

    const contentType =
        data.contentType || (data.allContents && data.allContents[0]?.contentType);
    const config = getContentTypeConfig(contentType);

    if (!config) {
        return (
            <View style={styles.emptyContainer}>
                <EmptyComponent text={t('nodataavailable')}/>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={displayData}
                renderItem={RenderData}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyComponent text={config.emptyMessage}/>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 5,
        alignSelf: "center",
        marginRight: 10,
    },
    cardContent: {
        borderRadius: 5,
        overflow: "hidden",
    },
    imageBackground: {
        height: width * 0.5 * (9 / 16),
        width: width * 0.5,
        justifyContent: "space-between",
    },
    textContainer: {
        padding: 8,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    titleText: {
        fontSize: 12,
        fontFamily: "Poppins-SemiBold",
    },
    gradientOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
    },
    textColorWhite: {
        color: "#fff",
    },
    emptyContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 30,
        width,
    },
});

export default ShowContentCard;