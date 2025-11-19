
import Colors from '@/src/utils/Colors'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image';
import { Menu } from "react-native-paper";
import { EllipsisVertical, Heart, MessageCircle, Pencil, Trash2, TrendingUp, TriangleAlert } from 'lucide-react-native';
import { t } from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateTime, formatShipName, isVideo } from '@/src/utils/helperFunctions';
import Video from "react-native-video";


interface Props {
    item: any;
    index: number;
    setHandOut: any;
    refreshPost: any;
    updatePost: any;
    setDisplayedPosts: any;
    locale: any;
}

const DEFAULT_IMAGE_PROFILE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
const DEFAULT_IMAGE = "https://raw.githubusercontent.com/Prince26lmp/assets/main/placeholderseabuddy.png";



const { width , height} = Dimensions.get('window');

const PostCard: React.FC<Props> = React.memo(({ item, index, setHandOut, refreshPost, updatePost, setDisplayedPosts, locale }) => {

    const [postEditMenuVisible, setPostEditMenuVisible] = React.useState<boolean>(false);
       const [isCaptionExpanded, setIsCaptionExpanded] = React.useState<boolean>(false);

    const openPostEditMenu = useCallback(() => setPostEditMenuVisible(true), []);
    const closePostEditMenu = useCallback(() => setPostEditMenuVisible(false), []);
    const [userId, setUserId] = React.useState<string>("");

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedId = await AsyncStorage.getItem("userId");
                if (storedId) {
                    setUserId(storedId);
                }
            } catch (error) {
                console.error("Error fetching userId:", error);
            }
        };

        fetchUserId();
    }, []);

    const handleCardPress = () => { }

    const PostUris = useMemo(() => item?.imageUrls ?? [], [item?.imageUrls]);





    const TaggedUsersRow = React.memo(
        () => {
            return (
                <TouchableOpacity
                // onPress={openTaggedUsersSheet}
                >
                    <View style={styles.avatarRow}>
                        {item?.taggedUsers.slice(0, 3).map((user: any, index: number) => (

                            <Image
                                key={user.id}
                                style={[styles.tagUserAvatar, { marginLeft: index > 0 ? -15 : 0 }]}
                                source={{ uri: user?.profileUrl || DEFAULT_IMAGE_PROFILE }}
                                contentFit="cover" // equivalent to resizeMode
                            />

                        ))}
                        {item?.taggedUsers?.length > 3 && (
                            <View style={styles.additionalUsers}>
                                <Text style={styles.additionalUsersText}>+{item?.taggedUsers?.length - 3}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            );
        }
    );


    interface PostHeaderProps {
        item: any;
        handleCardPress: (user: any) => void;
    }

    const PostHeader = React.memo<PostHeaderProps>(({
        item,
        handleCardPress,
    }) => {
        return (
            <Pressable style={[styles.postHeaderContainer]}>
                <Pressable style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => handleCardPress(item?.userDetails)}
                    >


                        <Image
                            style={[styles.avatar]}
                            source={{ uri: item?.userDetails?.profileUrl || DEFAULT_IMAGE_PROFILE }}
                            contentFit="cover" // equivalent to resizeMode
                        />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "column", width: '65%' }}>
                        <TouchableOpacity
                            onPress={() => handleCardPress(item?.userDetails)}
                        >
                            <Text style={[styles.userName]}>
                                {item?.userDetails?.fullName
                                    ? item.userDetails.fullName.charAt(0).toUpperCase() + item.userDetails.fullName.slice(1)
                                    : ""}
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.userDesignation]}>
                            {item?.userDetails?.designation}
                        </Text>
                        <TaggedUsersRow />
                    </View>
                </Pressable>
                <TouchableOpacity style={[styles.menuButton]}
                    onPress={openPostEditMenu}
                >
                    <Menu
                        visible={postEditMenuVisible}
                        onDismiss={closePostEditMenu}
                        anchor={
                            <TouchableOpacity style={[styles.baseIconsWrapper, styles.crewParentFlexBox]}
                                onPress={openPostEditMenu}
                            >
                                <EllipsisVertical size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        }
                        style={[Platform.OS === 'android' && {}]}
                        contentStyle={{ backgroundColor: '#fff' }}
                        {...(Platform.OS === 'android' ? { anchorPosition: 'bottom' } : {})}
                    >

                        {String(item?.userDetails?.id) === String(userId) ? (
                            <View style={{ flexDirection: "column", gap: 10 }}>
                                <Menu.Item
                                    style={{ height: 35, width: 40 }}
                                    onPress={() => {
                                        closePostEditMenu();
                                    }}
                                    title={t('edit')}
                                    titleStyle={{ color: "black" }}
                                    leadingIcon={() => <Pencil size={20} color="black" />}
                                />
                                <Menu.Item
                                    style={{ height: 35, marginRight: -30 }}
                                    // onPress={() => setModalVisible(true)}
                                    title={t('delete')}
                                    titleStyle={{ color: "red" }}
                                    leadingIcon={() => <Trash2 size={22} color="red" />}
                                />
                            </View>
                        ) : (
                            <Menu.Item
                                style={{ height: 35, marginRight: -30 }}
                                // onPress={() => setReportModalVisible(true)}
                                title={t('report')}
                                titleStyle={{ color: "red", fontSize: 16 }}
                                leadingIcon={() =>
                                    <TriangleAlert size={20} color={'red'} />}
                            />
                        )}
                    </Menu>
                </TouchableOpacity>
            </Pressable>
        );
    });  


  const ExpandableCaption: React.FC<{ caption: string; isExpanded: boolean; onToggle: () => void; maxLines?: number }> = ({ caption, isExpanded, onToggle, maxLines = 1 }) => {
    const [fullLines, setFullLines] = useState(0);
    const needsTruncation = fullLines > maxLines;
    return (
        <View style={[styles.captionContainer, { marginBottom: 0 }]}>
            <Text
                numberOfLines={isExpanded ? undefined : maxLines}
                style={styles.caption}
            >
                {caption}
            </Text>
            <Text
                style={[styles.caption, { position: 'absolute', opacity: 0, width: '100%' }]}
                onTextLayout={(e) => setFullLines(e.nativeEvent.lines.length)}
            >
                {caption}
            </Text>
            {needsTruncation && (
                <TouchableOpacity onPress={onToggle}>
                    <Text style={styles.seeMoreText}>
                        {isExpanded ? t('seeless') : t('seemore')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
    
    
    const renderCaption = useCallback(() => {
        return (
            <ExpandableCaption
                caption={item.caption}
                isExpanded={isCaptionExpanded}
                onToggle={() => setIsCaptionExpanded(!isCaptionExpanded)}
                maxLines={1}
            />
        );
    }, [item.caption, isCaptionExpanded]);


    const hashtagsDisplay = useMemo(() => (
        <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
            {(item.groupActivityId) && (
                <View style={{ backgroundColor: "#FBCF21", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" }}>
                    <Text style={{ color: "black", fontSize: 9, textTransform: "capitalize" }}>buddyUp Events</Text>
                </View>
            )}
            {(formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName)) && (
                <View style={{ backgroundColor: Colors.lightGreen, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start", }}>
                    <Text style={{ color: "black", fontSize: 9 }}>
                        {formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName || '')}
                    </Text>
                </View>
            )}
            {item.hashtags.slice(0, 2).map((hashtag: any, index: number) => (
                <View key={index} style={{ backgroundColor: "#FBCF21", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" }}>
                    <Text style={{ color: "#06361F", fontSize: 9 }}>
                        {hashtag ? hashtag.charAt(0).toUpperCase() + hashtag.slice(1) : ""}
                    </Text>
                </View>
            ))}
        </View>
    ), [item.groupActivityId, item?.userDetails?.ship, item?.userDetails?.associatedShip, item.hashtags,]);


// const handleMediaPress = useCallback((uri, index) => {
//         setSelectedMedia({ mediaItems: images, initialIndex: index });
//         setMediaModalVisible(true);
//     }, [images]);

const handleMediaPress = useCallback((uri: string, index:number) => {
    
},[])
    //     const renderItem = useCallback(({ item: imageItem, index }: { item: any; index: number }) => (
    //     <TouchableOpacity 
    //     // onPress={() => handleMediaPress(imageItem.uri, index)}
    //     >
    //         <View style={styles.imageContainer}>
    //             {isVideo(imageItem.uri) ? (
    //                 <>
    //                     <Video
    //                         source={{ uri: imageItem.uri }}
    //                         style={styles.imageStyle}
    //                         resizeMode='cover'
    //                         muted
    //                         repeat
    //                         paused={currentIndex !== index}
    //                         playInBackground={false}
    //                         playWhenInactive={false}
    //                         ignoreSilentSwitch="obey"
    //                         controls={false}
    //                     />
    //                     {/* <View style={styles.playIconContainer}>
    //                         <Image source={ImagesAssets.vedioPlaybutton} style={styles.playIcon} resizeMode="contain" />
    //                     </View> */}
    //                 </>
    //             ) : (
    //                 <View>
    //                     {imageLoading[imageItem.uri] && <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color={Colors.secondary} />}
    //                     <FastImage
    //                         style={styles.imageStyle}
    //                         source={{ uri: imageItem.uri || DEFAULT_IMAGE, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }}
    //                         resizeMode={FastImage.resizeMode.cover}
    //                         onLoadStart={() => setImageLoading(prev => ({ ...prev, [imageItem.uri]: true }))}
    //                         onLoadEnd={() => setImageLoading(prev => ({ ...prev, [imageItem.uri]: false }))}
    //                     />
    //                 </View>
    //             )}
    //         </View>
    //     </TouchableOpacity>
    // ), [handleMediaPress, imageLoading, currentIndex]);



    return (
        <View style={{flex:1 , backgroundColor:"red"}}>
            <PostHeader item={item} handleCardPress={handleCardPress} />
            <View style={[
                styles.bottomContent,
                PostUris?.length ? styles.mediaBottomContent : styles.textPostContainer
            ]}>
                {PostUris?.length == 0 ? (
                    <>
                        <View style={styles.captionContainer}>
                            <Text style={styles.caption}>{item.caption}</Text>
                        </View>

                        <View style={styles.metaContainer}>
                            {hashtagsDisplay}
                        </View>

                        {item.createdTime && (
                            <Text style={styles.timestamp}>

                                <CreateTime createdTime={item?.createdTime} locale={'en'} />
                            </Text>
                        )}
                    </>
                ) : (
                    /* MEDIA POST: Time → Hashtags → Caption */
                    <>
                        <View style={styles.metaContainer}>
                            {PostUris?.length && PostUris.length > 1 && (
                                <View style={styles.pagination}>
                                    {PostUris.map((_: any, i:number) => (
                                        <View key={i} style={{
                                            width: 8, height: 8, borderRadius: 4,
                                            // backgroundColor: currentIndex === i ? '#8DAF02' : '#bbb',
                                            marginHorizontal: 4,
                                        }} />
                                    ))}
                                </View>
                            )}
                            {item.createdTime && (
                                <Text style={styles.timestamp}>

                                    <CreateTime createdTime={item?.createdTime} locale={'en'} />
                                </Text>
                            )}
                            {hashtagsDisplay}

                        </View>

                        {renderCaption()}
                    </>
                )}

                <View style={styles.interactionButtons}>
                    <View style={styles.iconRow}>
                        <TouchableOpacity style={styles.iconButton}
                        // onPress={handleLikeToggle} disabled={isLikeLoading}
                        >
                            <Heart
                                fill={item?.isLiked ? "red" : "transparent"}
                                size={22}
                                color={item?.isLiked ? "red" : "black"}
                                strokeWidth={1.7}
                            />

                            {item?.totalLike ? (
                                <Pressable
                                    // onPress={openLikesSheet}
                                    style={{ width: 30, marginLeft: 5 }}
                                >
                                    <Text style={styles.likesCountText}>{item?.totalLike}</Text>
                                </Pressable>
                            ) : null}

                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton}
                        // onPress={openCommentSheet}
                        >
                            <View style={styles.iconContainer}>
                                <MessageCircle size={22} color="black" strokeWidth={1.7} />
                                {item?.totalComments > 0 && <Text style={styles.likesCountText}>{item?.totalComments}</Text>}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton}>
                            <View style={styles.iconContainer}>
                                <TrendingUp size={22} color="black" strokeWidth={1.7} />
                                {item?.viewCount > 0 && <Text style={styles.likesCountText}>{item.viewCount}</Text>}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
})

export default PostCard

const styles = StyleSheet.create({
    ListContainer: {
        flex: 1,
        marginVertical: 10,
        marginHorizontal: 14,
        overflow:'hidden',
        borderRadius: 10,
        position: 'relative',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textPostOuterContainer: {
        borderRadius: 10,
    },
    postHeaderContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        alignItems: 'center',
        backgroundColor: "white",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    mediaPostHeader: {
        position: "absolute",
        width: "100%",
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        right: 0,
        zIndex: 2,
        alignItems: 'center',
    },
    avatar: { height: 40, width: 40, borderRadius: 100, borderWidth: 2, borderColor: "#FFFFFF66" },
    mediaAvatar: { borderColor: "rgba(255, 255, 255, 0.6)" },
    userName: { lineHeight: 20, fontSize: 14, fontWeight: "bold", color: "#000", fontFamily: "Poppins-SemiBold" },
    mediaUserName: { color: "#FFFFFF" },
    userDesignation: { fontSize: 12, lineHeight: 15, color: "#666", marginTop: 3, fontFamily: "Poppins-Regular" },
    mediaUserDesignation: { color: "#FFFFFF" },
    menuButton: { backgroundColor: "rgba(0, 0, 0, 0.2)", height: 32, width: 32, alignItems: "center", justifyContent: "center", borderRadius: 10 },
    mediaMenuButton: { backgroundColor: "rgba(0, 0, 0, 0.2)" },
    imageContainer: { overflow: "hidden", borderTopLeftRadius: 10, borderTopRightRadius: 10 ,width:width,height: 400 },
    imageStyle: { width: width, height: 400 },
    playIconContainer: { position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -30 }, { translateY: -30 }], justifyContent: "center", alignItems: "center", zIndex: 1 },
    playIcon: { width: 40, height: 40, tintColor: "#fff" },
    bottomContent: { padding: 16, paddingTop: 10, backgroundColor: 'white' },
    mediaBottomContent: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
    textPostContainer: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
    metaContainer: { marginBottom: 10 },
    timestamp: { fontSize: 10, lineHeight: 15, color: "#666", fontFamily: "Poppins-Regular", marginBottom: 5 },
    captionContainer: { marginBottom: 10 },
    caption: { fontSize: 14, lineHeight: 18, fontFamily: 'Poppins-Regular', color: 'black' },
    seeMoreText: {
        fontSize: 14,
        color: '#8DAF02',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 4,
    },
    interactionButtons: { flexDirection: "column", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    iconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    iconContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    iconButton: { flexDirection: 'row', alignItems: 'center' },
    likesCountText: { color: "black", fontSize: 16, lineHeight: 25, marginTop: 3, textAlignVertical: 'center', fontFamily: "Poppins-Regular", marginLeft: 5 },
    commentContainer: { flexDirection: "row", padding: 10, paddingVertical: 12, marginBottom: 7, backgroundColor: 'white', marginHorizontal: 10, borderRadius: 10 },
    commentImage: { width: 50, height: 50, borderRadius: 50 },
    replyImage: { width: 32, height: 32, borderRadius: 16 },
    commentContent: { flex: 1, marginLeft: 12 },
    replyContent: { marginLeft: 8, width: '84%' },
    commentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    timeText: { color: "#666", fontSize: 10, fontFamily: 'Poppins-Regular' },
    editText: { color: "#666", fontSize: 10, marginLeft: 5, fontFamily: 'Poppins-Regular' },
    commentText: { fontSize: 12, lineHeight: 20, fontFamily: 'Poppins-Regular' },
    replyToText: { color: "#007bff", fontWeight: "500", fontSize: 12 },
    replyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: 'black' },
    actionText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: 'black',
    },
    replyList: { marginTop: 16 },
    inputContainer: { padding: 10, backgroundColor: "#ededed", borderTopWidth: 1, borderColor: "#eee" },
    replyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingBottom: 5 },
    editHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingBottom: 5 },
    inputWrapper: { flexDirection: "row", alignItems: "center" },
    textInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, fontSize: 15, maxHeight: 100 },
    sendButton: { marginLeft: 10, padding: 8, backgroundColor: '#82934b', borderRadius: 50 },
    emptyText: { textAlign: "center", marginTop: 20, color: "#666", fontSize: 16 },
    modalContent: { backgroundColor: "#fff", padding: 20, marginHorizontal: 20, borderRadius: 10, alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    modalText: { fontSize: 16, color: "#333", marginBottom: 20, textAlign: "center" },
    modalButtons: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, minWidth: 100, alignItems: "center" },
    cancelButton: { backgroundColor: "#f0f0f0" },
    deleteButton: { backgroundColor: "#ff4d4d" },
    buttonText: { fontSize: 16, fontWeight: "600", color: "#333" },
    avatarRow: { marginTop: 3, flexDirection: "row", alignItems: "center" },
    avatar1: { width: 32, height: 32, borderRadius: 35, borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.4)" },
    additionalUsers: { height: 32, width: 32, borderRadius: 20, backgroundColor: "#000", justifyContent: "center", alignItems: "center", marginLeft: -15 },
    additionalUsersText: { color: "#fff", fontWeight: "bold" },
    baseIcons: { width: 20, height: 20 },
    baseIconsWrapper: { alignItems: "center", justifyContent: "center" },
    crewParentFlexBox: { alignItems: "center", justifyContent: "center" },
    pagination: { flexDirection: "row", alignItems: 'center', justifyContent: "center" },
    userItemContainer: { borderColor: "gray", backgroundColor: "#f3f3f3", flexDirection: "row", paddingHorizontal: 20, paddingVertical: 5, alignItems: "center", marginBottom: 10 },
    userItem: { paddingVertical: 8, fontSize: 14, fontFamily: "Poppins-Regular", color: "black" },
    userImage: { height: 40, width: 40, borderRadius: 20, marginRight: 20 },
    noLikesText: { fontSize: 16, color: "black", textAlign: "center", paddingVertical: 20 },
    sheetContent: { paddingVertical: 20, zIndex: 1001 },
    sheetTitle: { fontSize: 14, fontFamily: "Poppins-Regular", color: "black", textAlign: "center", marginBottom: 10 },
    commentSheetHeader: { alignItems: "center", justifyContent: 'center' },
    replyContainer: { marginTop: 5, flexDirection: 'row' },
    operationLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
});



// import Colors from '@/src/utils/Colors'
// import React from 'react'
// import { StyleSheet, Text, View } from 'react-native'

// const PostCard = () => {
//   return (
//     <View style={{flex:1 , justifyContent:"center", alignItems:"center" , backgroundColor:Colors.white}}>
//         <Text>post card</Text>   
//     </View>
//   )
// }

// export default PostCard

// const styles = StyleSheet.create({})