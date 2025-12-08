import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    StyleSheet,
    View,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import Colors from "@/src/utils/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type MediaItem = {
    uri: string;
    type: "image" | "video";
};

const FullScreenMediaPreview = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const mediaString = Array.isArray(params.media) ? params.media[0] : params.media;
    const mediaArray: MediaItem[] = JSON.parse(mediaString as string);

    const startIndex = Array.isArray(params.index)
        ? Number(params.index[0])
        : Number(params.index || 0);

    const [activeIndex, setActiveIndex] = useState(startIndex);
    const [showUI, setShowUI] = useState(true);
    const [showVideoControls, setShowVideoControls] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    // Extract all video URIs upfront
    const videoPaths = useMemo(
        () => mediaArray.filter((item) => item.type === "video").map((item) => item.uri),
        [mediaArray]
    );

    // Create stable video players for all videos
    const players = videoPaths.map((uri) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useVideoPlayer(uri, (p) => {
            p.loop = true;
            p.muted = false;
            p.staysActiveInBackground = false;
        })
    );

    // Map URIs to players for easy lookup
    const videoPlayerMap = useMemo(() => {
        const map = new Map<string, any>();
        videoPaths.forEach((uri, index) => {
            map.set(uri, players[index]);
        });
        return map;
    }, [videoPaths, players]);

    useEffect(() => {
        // Auto-scroll to start index
        scrollViewRef.current?.scrollTo({
            x: startIndex * SCREEN_WIDTH,
            animated: false,
        });
    }, [startIndex]);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    // Play/pause videos based on active index
    useEffect(() => {
        mediaArray.forEach((item, index) => {
            if (item.type === "video") {
                const player = videoPlayerMap.get(item.uri);
                if (player) {
                    if (index === activeIndex) {
                        player.play();
                    } else {
                        player.pause();
                    }
                }
            }
        });
    }, [activeIndex, mediaArray, videoPlayerMap]);

    const renderMedia = (item: MediaItem, index: number) => {
        if (item.type === "video") {
            const player = videoPlayerMap.get(item.uri);

            return (
                <View key={index} style={styles.mediaWrapper}>
                    <VideoView
                        player={player}
                        style={StyleSheet.absoluteFillObject}
                        contentFit="contain"
                        allowsPictureInPicture={false}
                        nativeControls={showVideoControls}
                    />
                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                        onPress={() => {
                            setShowUI((prev) => !prev);
                            setShowVideoControls((prev) => !prev);
                        }}
                        pointerEvents="box-none"
                    >
                        <View style={{ flex: 1 }} pointerEvents="none" />
                    </Pressable>
                </View>
            );
        }

        return (
            <TouchableOpacity
                key={index}
                activeOpacity={1}
                onPress={() => setShowUI((prev) => !prev)}
                style={styles.mediaWrapper}
            >
                <Image
                    source={{ uri: item.uri }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                    placeholder={{ blurhash: "LEHV6nWB2yk8pyo0adR*.7kCMdkI" }}
                    transition={300}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity
                style={[styles.closeBtn, !showUI && styles.hidden]}
                onPress={() => router.back()}
            >
                <X size={20} color="black" strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Media Carousel */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                contentContainerStyle={{ width: SCREEN_WIDTH * mediaArray.length }}
            >
                {mediaArray.map(renderMedia)}
            </ScrollView>

            {/* Pagination Dots */}
            {mediaArray.length > 1 && (
                <View style={[styles.paginationWrapper, !showUI && styles.hidden]}>
                    {mediaArray.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === activeIndex ? styles.dotActive : styles.dotInactive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default FullScreenMediaPreview;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    closeBtn: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 20,
        padding: 10,
        borderRadius: 30,
        backgroundColor: "#fff",
    },
    hidden: {
        opacity: 0,
    },
    mediaWrapper: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    paginationWrapper: {
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        zIndex: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    dotActive: {
        width: 24,
        backgroundColor: Colors.lightGreen,
        borderRadius: 4,
    },
    dotInactive: {
        backgroundColor: "rgba(255,255,255,0.5)",
    },
});