import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Menu } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image'; // Ensure this is installed
import { ImagesAssets } from '../assets/ImagesAssets'; // Ensure this path is correct

const DEFAULT_IMAGE_PROFILE = 'https://picsum.photos/200'; // Fallback dummy profile image
const DEFAULT_CONTENT_IMAGE = 'https://cdn.pixabay.com/photo/2020/03/10/04/48/animal-4917802_1280.jpg'; // Fallback content image

// Theme configuration
const themes = {
    light: {
        background: '#FFFFFF',
        border: '#E5E7EB',
        shadow: '#000',
        textPrimary: '#1F2937',
        textSecondary: '#374151',
        textTertiary: '#6B7280',
        avatarBg: '#D1D5DB',
        menuButtonBg: '#D1D5DB',
        menuContentBg: '#FFFFFF',
        tagBg: '#FBCF21',
        tagSecondaryBg: '#E5E7EB',
        tagText: '#000000',
        iconColor: '#4B5563',
        additionalUsersBg: '#D1D5DB',
        contentTextColor: '#374151', // Light theme content text
    },
    dark: {
        background: '#000000',
        border: '#333333',
        shadow: '#000000',
        textPrimary: '#F9FAFB',
        textSecondary: '#D1D5DB',
        textTertiary: '#9CA3AF',
        avatarBg: '#333333',
        menuButtonBg: '#333333',
        menuContentBg: '#1F2937',
        tagBg: '#F59E0B',
        tagSecondaryBg: '#4B5563',
        tagText: '#FFFFFF',
        iconColor: '#E5E7EB',
        additionalUsersBg: '#333333',
        contentTextColor: '#FFFFFF', // Dark theme content text (white as per snippet)
    },
};

// Styles function
const styles = (theme) => ({
    container: {
        backgroundColor: themes[theme].background,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: themes[theme].shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: themes[theme].border,
        flexShrink: 1, // Allow dynamic height
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: themes[theme].avatarBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: themes[theme].textSecondary,
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
        color: themes[theme].textPrimary,
    },
    timestamp: {
        fontSize: 12,
        color: themes[theme].textTertiary,
        marginBottom: 5,
    },
    contentContainer: {
        marginBottom: 2,
    },
    contentImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: themes[theme].border,
    },
    content: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: themes[theme].contentTextColor,
        flex: 1,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: '100%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: themes[theme].border,
        paddingTop: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        color: themes[theme].iconColor,
        marginLeft: 4,
    },
    menuButton: {
        backgroundColor: themes[theme].menuButtonBg,
        height: 32,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 'auto',
    },
    baseIconsWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    crewParentFlexBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    baseIcons: {
        width: 16,
        height: 16,
    },
    menuContent: {
        paddingTop: 10,
        backgroundColor: themes[theme].menuContentBg,
    },
    menuItems: {
        flexDirection: 'column',
        gap: 10,
    },
    menuItem: {
        height: 35,
        marginRight: -30,
    },
    menuItemText: {
        color: themes[theme].tagText,
    },
    taggedUsersContainer: {
        height: 30,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar1: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: themes[theme].background,
    },
    additionalUsers: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: themes[theme].additionalUsersBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -15,
    },
    additionalUsersText: {
        fontSize: 12,
        color: themes[theme].textSecondary,
        fontWeight: '600',
    },
    hashtagsContainer: {
        flexDirection: 'row',
        gap: 5,
        borderRadius: 10,
        marginBottom: 16,
    },
    tag: {
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 5,
        alignSelf: 'flex-start',
    },
    tagText: {
        fontSize: 9,
        textTransform: 'capitalize',
    },
    postTimestamp: {
        fontSize: 11,
        color: themes[theme].textTertiary,
        marginBottom: 10,
    },
});

// Simple formatShipName function for dummy data
const formatShipName = (shipName) => {
    if (!shipName) return '';
    return shipName.charAt(0).toUpperCase() + shipName.slice(1).toLowerCase();
};

const PostWithoutMedia = ({
    username = 'Prince Singh',
    timestamp = 'Captain',
    content = 'Welcome to SeaBuddy — your trusted companion for seamless social connections. Stay engaged, share moments, and experience community like never before.',
    taggedUsers = [
        { id: '1', profileUrl: 'https://picsum.photos/200?random=1' },
        { id: '2', profileUrl: 'https://picsum.photos/200?random=2' },
        { id: '3', profileUrl: 'https://picsum.photos/200?random=3' },
        { id: '4', profileUrl: 'https://picsum.photos/200?random=4' },
    ], // Dummy tagged users with placeholder images
    groupActivityId = '12345', // Dummy group activity ID
    shipName = 'starship', // Dummy ship name
    hashtags = ['# seaBuddy', '# social', '# community'], // Dummy hashtags
    theme = 'light', // Default to dark theme
    imageUrl = DEFAULT_CONTENT_IMAGE, // Content image prop
}) => {
    const [visible, setVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // For delete functionality
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const openMenu = useCallback(() => setVisible(true), []);
    const closeMenu = useCallback(() => setVisible(false), []);

    const handleEdit = () => {
        closeMenu();
        console.log('Edit post clicked');
        // Example: navigation.navigate('NewPost', { ...params });
    };

    const handleDelete = () => {
        setModalVisible(true);
        closeMenu();
        console.log('Delete post clicked');
    };

    const handleTextLayout = useCallback((event) => {
        const { lines } = event.nativeEvent;
        setShowMore(lines.length > 1); // Show "See more" if text spans more than one line
    }, []);

    const toggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const hashtagsDisplay = useMemo(() => (
        <View style={styles(theme).hashtagsContainer}>
            {formatShipName(shipName) && (
                <View style={[styles(theme).tag, { backgroundColor: themes[theme].tagSecondaryBg }]}>
                    <Text style={[styles(theme).tagText, { color: themes[theme].tagText }]}>
                        {formatShipName(shipName)}
                    </Text>
                </View>
            )}
            {hashtags.slice(0, 2).map((hashtag, index) => (
                <View key={index} style={[styles(theme).tag, { backgroundColor: themes[theme].tagBg }]}>
                    <Text style={[styles(theme).tagText, { color: themes[theme].tagText }]}>
                        {hashtag ? hashtag.charAt(0).toUpperCase() + hashtag.slice(1) : ''}
                    </Text>
                </View>
            ))}
        </View>
    ), [groupActivityId, shipName, hashtags, theme]);

    return (
        <View style={styles(theme).container}>
            {/* User Info and Timestamp */}
            <View style={styles(theme).header}>
                <View style={styles(theme).avatar}>
                    <Text style={styles(theme).avatarText}>{username[0].toUpperCase()}</Text>
                </View>
                <View style={styles(theme).userInfo}>
                    <Text style={styles(theme).username}>{username}</Text>
                    <Text style={styles(theme).timestamp}>{timestamp}</Text>
                    {/* Tagged Users Section */}
                    <View style={styles(theme).taggedUsersContainer}>
                        <TouchableOpacity>
                            <View style={styles(theme).avatarRow}>
                                {taggedUsers.slice(0, 3).map((user, index) => (
                                    <FastImage
                                        key={user.id}
                                        style={[styles(theme).avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
                                        source={{
                                            uri: user?.profileUrl || DEFAULT_IMAGE_PROFILE,
                                            priority: FastImage.priority.normal,
                                            cache: FastImage.cacheControl.immutable,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                ))}
                                {taggedUsers.length > 3 && (
                                    <View style={styles(theme).additionalUsers}>
                                        <Text style={styles(theme).additionalUsersText}>
                                            +{taggedUsers.length - 3}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles(theme).menuButton} onPress={openMenu}>
                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchor={
                            <TouchableOpacity
                                style={[styles(theme).baseIconsWrapper, styles(theme).crewParentFlexBox]}
                                onPress={openMenu}
                            >
                                <Image style={styles(theme).baseIcons} source={ImagesAssets.dots} />
                            </TouchableOpacity>
                        }
                        contentStyle={styles(theme).menuContent}
                    >
                        <View style={styles(theme).menuItems}>
                            <Menu.Item
                                style={styles(theme).menuItem}
                                onPress={handleEdit}
                                title="Edit"
                                titleStyle={styles(theme).menuItemText}
                                leadingIcon={() => (
                                    <Ionicons name="create-outline" size={20} color={themes[theme].tagText} />
                                )}
                            />
                            <Menu.Item
                                style={styles(theme).menuItem}
                                onPress={handleDelete}
                                title="Delete"
                                titleStyle={[styles(theme).menuItemText, { color: '#EF4444' }]}
                                leadingIcon={() => (
                                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                )}
                            />
                        </View>
                    </Menu>
                </TouchableOpacity>
            </View>

            {/* Post Content */}
            <View style={styles(theme).contentContainer}>
                {imageUrl && (
                    <FastImage
                        style={styles(theme).contentImage}
                        source={{
                            uri: imageUrl || DEFAULT_CONTENT_IMAGE,
                            priority: FastImage.priority.normal,
                            cache: FastImage.cacheControl.immutable,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                )}
                <View style={styles(theme).contentRow}>
                    <Text
                        numberOfLines={isExpanded ? undefined : 1}
                        ellipsizeMode="tail"
                        onTextLayout={handleTextLayout}
                        style={styles(theme).content}
                    >
                        {content}
                        {isExpanded && showMore && (
                            <Text
                                onPress={toggleExpand}
                                style={{ color: '#8DAF02', fontFamily: 'Poppins-SemiBold', fontSize: 14 }}
                            >
                                {' See less'}
                            </Text>
                        )}
                    </Text>
                    {!isExpanded && showMore && (
                        <TouchableOpacity onPress={toggleExpand}>
                            <Text style={{ color: '#8DAF02', fontFamily: 'Poppins-SemiBold', fontSize: 14, marginTop: 5 }}>
                                See more
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Timestamp */}
            <Text style={styles(theme).postTimestamp}>10 min ago</Text>

            {/* Hashtags Section */}
            {hashtagsDisplay}

            {/* Interaction Buttons */}
            <View style={styles(theme).footer}>
                <TouchableOpacity style={styles(theme).button}>
                    <Ionicons name="heart-outline" size={24} color={themes[theme].iconColor} />
                    <Text style={styles(theme).buttonText}>10</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles(theme).button}>
                    <Ionicons name="chatbubble-outline" size={24} color={themes[theme].iconColor} />
                    <Text style={styles(theme).buttonText}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles(theme).button}>
                    <Ionicons name="trending-up" size={24} color={themes[theme].iconColor} />
                    <Text style={styles(theme).buttonText}>2</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PostWithoutMedia;