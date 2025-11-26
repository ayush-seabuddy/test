// src/components/TextBasedPost.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageCircle, TrendingUp, EllipsisVertical } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Colors from '../utils/Colors';
const { width } = Dimensions.get('window');

// Custom Time component wrapper for ReactTimeAgo
interface TimeProps {
    date?: Date | number | string;
    verboseDate?: boolean;
    tooltip?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
}

const Time: React.FC<TimeProps> = ({ date, verboseDate, tooltip, children, ...rest }) => {
    return <Text {...rest}>{children}</Text>;
};

interface TextBasedPostProps {
    post: {
        id: string;
        caption: string;
        hashtags: string[];
        totalLike: number;
        totalComments: number;
        viewCount: number;
        createdAt: string | number | Date;
        createdTime?: string | number;
        userDetails: {
            fullName: string;
            designation: string;
            profileUrl: string;
            ship?: { shipName: string };
            associatedShip?: { shipName: string };
        };
        taggedUsers: { id: string; fullName: string; profileUrl: string }[];
        isLiked: boolean;
        groupActivityId?: string | null;
    };
}

const TextBasedPost: React.FC<TextBasedPostProps> = ({ post }) => {
    const { t, i18n } = useTranslation();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.totalLike);

    const shipName = post.userDetails.ship?.shipName || post.userDetails.associatedShip?.shipName;
    const isBuddyUpEvent = !!post.groupActivityId;

    const toggleLike = () => {
        setIsLiked(prev => !prev);
        setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    };

    return (
        <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.textHeaderContainer}>
                <View style={styles.headerLeft}>
                    <Image
                        source={{ uri: post.userDetails.profileUrl }}
                        style={styles.profileImage}
                        placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
                        transition={200}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{post.userDetails.fullName}</Text>
                        <Text style={styles.userDesignation}>{post.userDetails.designation}</Text>

                        {post.taggedUsers.length > 0 && (
                            <View style={styles.taggedRow}>
                                {post.taggedUsers.slice(0, 3).map((user, i) => (
                                    <Image
                                        key={user.id}
                                        source={{ uri: user.profileUrl }}
                                        style={[styles.taggedAvatar, i > 0 && styles.overlap]}
                                    />
                                ))}
                                {post.taggedUsers.length > 3 && (
                                    <View style={[styles.moreTagged, styles.overlap]}>
                                        <Text style={styles.moreText}>+{post.taggedUsers.length - 3}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.menuBtn}>
                    <EllipsisVertical size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.caption}>{post.caption}</Text>

                {/* Tags */}
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
                    {post.hashtags.map((tag, i) => (
                        <View key={i} style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
                            <Text style={[styles.tagText, { color: '#06361F' }]}>{tag}</Text>
                        </View>
                    ))}
                </View>

                {post.createdAt && (
                    <Text style={styles.timeText}>
                        <ReactTimeAgo
                            date={post?.createdTime ? new Date(Number(post.createdTime)) : new Date(post.createdAt)}
                            locale={i18n.language}
                            component={Time}
                            timeStyle="short"
                        />
                    </Text>
                )}
            </View>

            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}>
                    <Heart
                        size={24}
                        color={isLiked ? '#8DAF02' : '#000'}
                        fill={isLiked ? '#8DAF02' : 'none'}
                        strokeWidth={1.7}
                    />
                    <Text style={styles.countText}>{likesCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                    <MessageCircle size={24} color="#000" strokeWidth={1.7} />
                    <Text style={styles.countText}>{post.totalComments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                    <TrendingUp size={24} color="#000" strokeWidth={1.7} />
                    <Text style={styles.countText}>{post.viewCount}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
        elevation: 4,
        marginBottom: 10,
    },
    textHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
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
        borderColor: '#ddd',
    },
    userInfo: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        color: '#000',
    },
    userDesignation: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#444',
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
        borderColor: '#fff',
    },
    overlap: {
        marginLeft: -12,
    },
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
        backgroundColor: '#ededed',
        borderRadius: 10,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    caption: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#000',
        lineHeight: 22,
        marginBottom: 5,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginVertical: 5,
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
    timeText: {
        fontSize: 10,
        color: '#666',
        marginTop: 8,
        fontFamily: 'Poppins-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
        marginHorizontal:16,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    countText: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'Poppins-Medium',
    },
});

export default TextBasedPost;