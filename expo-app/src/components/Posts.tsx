import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import {
    Heart,
    MessageCircle,
    TrendingUp,
    EllipsisVertical,
} from 'lucide-react-native';
import Colors from '../utils/Colors';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface PostProps {
    isMediaPost?: boolean;
    images?: string[];
    caption?: string;
    likes?: number;
    comments?: number;
    views?: number;
    userName?: string;
    designation?: string;
    profileUrl?: string;
    taggedUsers?: { profileUrl: string }[];
    hashtags?: string[];
    shipName?: string;
    timeAgo?: string;
    isBuddyUpEvent?: boolean;
}

const Posts: React.FC<PostProps> = ({
    isMediaPost = true,
    images = [
        "https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=",
    ],
    caption = "Being a seafarer means carrying responsibility far beyond yourself. Every voyage demands discipline, resilience, and teamwork. Long nights, unpredictable weather, and endless miles of ocean… yet we sail with pride, knowing our work keeps the world moving. Salute to every seafarer who sacrifices silently.",
    likes = 111,
    comments = 111,
    views = 111,
    userName = "Prince Singh",
    designation = "Captain",
    profileUrl = "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
    taggedUsers = [
        { profileUrl: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250" },
        { profileUrl: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250" },
        { profileUrl: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250" },
    ],
    hashtags = ["Seafarer"],
    shipName = "Testing Ship",
    timeAgo = "2 Weeks Ago",
    isBuddyUpEvent = true,
}) => {
    const { t } = useTranslation();
    const [numberOfLines, setNumberOfLines] = useState<number | undefined>(
        isMediaPost ? 2 : undefined
    );
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const toggleSeeMore = () => {
        setNumberOfLines(numberOfLines === 2 ? undefined : 2);
    };

    return (
        <View style={styles.cardContainer}>

            {/* MEDIA POST SECTION */}
            {isMediaPost && (
                <View style={styles.mediaWrapper}>
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, i) => i.toString()}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(
                                e.nativeEvent.contentOffset.x / (width - 20)
                            );
                            setCurrentImageIndex(index);
                        }}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item }}
                                style={styles.postImage}
                                contentFit="cover"
                            />
                        )}
                    />

                    {/* Pagination Dots */}
                    {images.length > 1 && (
                        <View style={styles.pagination}>
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor:
                                                i === currentImageIndex ? '#8DAF02' : '#ccc',
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {/* HEADER OVERLAY */}
                    <View style={styles.headerOverlay}>
                        <View style={styles.headerLeft}>
                            <Image source={{ uri: profileUrl }} style={styles.profileImage} />

                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{userName}</Text>
                                <Text style={styles.userDesignation}>{designation}</Text>

                                {/* TAGGED USERS */}
                                <View style={styles.taggedRow}>
                                    {taggedUsers.slice(0, 3).map((user, i) => (
                                        <Image
                                            key={i}
                                            source={{ uri: user.profileUrl }}
                                            style={[styles.taggedAvatar, i > 0 && styles.overlap]}
                                        />
                                    ))}
                                    {taggedUsers.length > 3 && (
                                        <View style={[styles.moreTagged, styles.overlap]}>
                                            <Text style={styles.moreText}>
                                                +{taggedUsers.length - 3}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.menuBtn}>
                            <EllipsisVertical size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* CONTENT SECTION */}
            <View style={styles.contentContainer}>

                {/* TEXT-BASED POST HEADER */}
                {!isMediaPost && (
                    <View style={styles.textHeaderContainer}>
                        <Image source={{ uri: profileUrl }} style={styles.profileImage} />

                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={[styles.userName, { color: '#000' }]}>{userName}</Text>
                            <Text style={[styles.userDesignation, { color: '#444' }]}>
                                {designation}
                            </Text>

                            {/* TAGGED USERS ROW */}
                            <View style={styles.taggedRow}>
                                {taggedUsers.slice(0, 3).map((user, i) => (
                                    <Image
                                        key={i}
                                        source={{ uri: user.profileUrl }}
                                        style={[styles.taggedAvatar, i > 0 && styles.overlap]}
                                    />
                                ))}
                                {taggedUsers.length > 3 && (
                                    <View style={[styles.moreTagged, styles.overlap]}>
                                        <Text style={styles.moreText}>
                                            +{taggedUsers.length - 3}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity style={[styles.menuBtn, { backgroundColor: "#ededed" }]}>
                            <EllipsisVertical size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}


                {/* TEXT-BASED POST ORDER FIX */}
                {!isMediaPost ? (
                    <>
                        {/* CAPTION FIRST */}
                        <Text style={styles.caption}>{caption}</Text>

                        {/* TAGS */}
                        <View style={[styles.tagsRow, { marginTop: 10 }]}>
                            {isBuddyUpEvent && (
                                <View style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
                                    <Text style={styles.tagText}>{t('buddyupevents')}</Text>
                                </View>
                            )}

                            {shipName && (
                                <View style={[styles.tagChip, { backgroundColor: Colors.lightGreen }]}>
                                    <Text style={styles.tagText}>{shipName}</Text>
                                </View>
                            )}

                            {hashtags.map((tag, i) => (
                                <View key={i} style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
                                    <Text style={[styles.tagText, { color: '#06361F' }]}>#{tag}</Text>
                                </View>
                            ))}
                        </View>

                        {/* TIME LAST */}
                        <Text style={styles.timeText}>{timeAgo}</Text>
                    </>
                ) : (
                    <>
                        {/* MEDIA POST ORIGINAL ORDER */}
                        <Text style={styles.timeText}>{timeAgo}</Text>

                        <View style={styles.tagsRow}>
                            {isBuddyUpEvent && (
                                <View style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
                                    <Text style={styles.tagText}>{t('buddyupevents')}</Text>
                                </View>
                            )}

                            {shipName && (
                                <View style={[styles.tagChip, { backgroundColor: Colors.lightGreen }]}>
                                    <Text style={styles.tagText}>{shipName}</Text>
                                </View>
                            )}

                            {hashtags.map((tag, i) => (
                                <View key={i} style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
                                    <Text style={[styles.tagText, { color: '#06361F' }]}>#{tag}</Text>
                                </View>
                            ))}
                        </View>

                        {/* CAPTION WITH SEE MORE */}
                        <Text style={styles.caption} numberOfLines={numberOfLines}>
                            {caption}
                        </Text>

                        {caption.length > 100 && (
                            <Text style={styles.seeMoreText} onPress={toggleSeeMore}>
                                {numberOfLines === 2 ? t('seemore') : t('seeless')}
                            </Text>
                        )}
                    </>
                )}

                <View style={styles.divider} />

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => setIsLiked(!isLiked)}
                    >
                        <Heart
                            size={24}
                            color={isLiked ? '#8DAF02' : '#000'}
                            fill={isLiked ? '#8DAF02' : 'none'}
                            strokeWidth={1.7}
                        />
                        <Text style={styles.countText}>{likes}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <MessageCircle size={24} color="#000" strokeWidth={1.7} />
                        <Text style={styles.countText}>{comments}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <TrendingUp size={24} color="#000" strokeWidth={1.7} />
                        <Text style={styles.countText}>{views}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Posts;

const styles = StyleSheet.create({
    cardContainer: {
        margin: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 4,
        marginBottom: 100,
    },

    mediaWrapper: {
        height: 420,
        position: 'relative',
    },
    postImage: {
        width: width - 20,
        height: 420,
    },
    pagination: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    headerOverlay: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    profileImage: {
        width: 46,
        height: 46,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
    },

    userInfo: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
    },
    userDesignation: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#fff',
    },

    taggedRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    taggedAvatar: {
        width: 32,
        height: 32,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    overlap: { marginLeft: -12 },

    moreTagged: {
        width: 32,
        height: 32,
        borderRadius: 50,
        backgroundColor: '#00000080',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
    },

    menuBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 10,
    },

    contentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    timeText: {
        fontSize: 10,
        color: '#666',
    },

    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginVertical: 10,
    },

    tagChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },

    tagText: {
        fontSize: 9,
        color: '#000',
        fontFamily: 'Poppins-Medium',
    },

    caption: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#000',
        lineHeight: 20,
    },

    seeMoreText: {
        color: '#8DAF02',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        marginTop: 4,
    },

    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },

    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },

    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    countText: {
        fontSize: 15,
        color: '#000',
    },
});
