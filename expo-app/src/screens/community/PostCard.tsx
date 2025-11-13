
import Colors from '@/src/utils/Colors'
import React from 'react'
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'

interface Props {
    item: any;
    index: number;
    setHandOut: any;
    refreshPost: any;
    updatePost: any;
    setDisplayedPosts: any;
    locale: any;
}

const PostCard: React.FC<Props> = React.memo(({ item, index, setHandOut, refreshPost, updatePost, setDisplayedPosts, locale }) => {

  const PostHeader = React.memo(({
    item,
    // handleCardPress,
    // finalUri,
    // taggedUsersDisplay,
    // openMenu,
    // visible1,
    // closeMenu,
    // yourActivity,
    // setModalVisible,
    // setReportModalVisible,
    // navigation,
    isMediaPost = false
}) => {
    return (
        <Pressable style={[styles.postHeaderContainer, isMediaPost && styles.mediaPostHeader]}>
            <Pressable style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 10 }}>
                <TouchableOpacity 
                // onPress={() => handleCardPress(item?.userDetails)}
                >
                    {/* <FastImage
                        style={[styles.avatar, isMediaPost && styles.mediaAvatar]}
                        source={{ uri: finalUri, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                        resizeMode={FastImage.resizeMode.cover}
                    /> */}
                </TouchableOpacity>
                <View style={{ flexDirection: "column", width: '65%' }}>
                    <TouchableOpacity 
                    // onPress={() => handleCardPress(item?.userDetails)}
                    >
                        <Text style={[styles.userName, isMediaPost && styles.mediaUserName]}>
                            {item?.userDetails?.fullName
                                ? item.userDetails.fullName.charAt(0).toUpperCase() + item.userDetails.fullName.slice(1)
                                : ""}
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.userDesignation, isMediaPost && styles.mediaUserDesignation]}>
                        {item?.userDetails?.designation}
                    </Text>
                    {/* {taggedUsersDisplay} */}
                </View>
            </Pressable>
            {/* <TouchableOpacity style={[styles.menuButton, isMediaPost && styles.mediaMenuButton]} onPress={openMenu}>
                <Menu
                    visible={visible1}
                    onDismiss={closeMenu}
                    anchor={
                        <TouchableOpacity style={[styles.baseIconsWrapper, styles.crewParentFlexBox]} onPress={openMenu}>
                            <Image style={[styles.baseIcons, isMediaPost && { tintColor: '#fff' }]} source={ImagesAssets.dots} />
                        </TouchableOpacity>
                    }
                    style={[Platform.OS === 'android' && visible1 ? { paddingTop: 15 } : {}]}
                    contentStyle={{ backgroundColor: '#fff' }}
                    {...(Platform.OS === 'android' ? { anchorPosition: 'bottom' } : {})}
                >
                    {yourActivity ? (
                        <View style={{ flexDirection: "column", gap: 10 }}>
                            <Menu.Item
                                style={{ height: 35, width: 40 }}
                                onPress={() => {
                                    closeMenu();
                                    navigation.navigate("NewPost", {
                                        mediaFiles: item.imageUrls,
                                        caption: item.caption,
                                        taggedUsers: item.taggedUsers,
                                        hashtags: item.hashtags,
                                        postId: item.id,
                                    });
                                }}
                                title={t('edit')}
                                titleStyle={{ color: "black" }}
                                leadingIcon={() => <Ionicons name="create-outline" size={20} color="black" />}
                            />
                            <Menu.Item
                                style={{ height: 35, marginRight: -30 }}
                                onPress={() => setModalVisible(true)}
                                title={t('delete')}
                                titleStyle={{ color: "red" }}
                                leadingIcon={() => <Ionicons name="trash-outline" size={22} color="red" />}
                            />
                        </View>
                    ) : (
                        <Menu.Item
                            style={{ height: 35, marginRight: -30 }}
                            onPress={() => setReportModalVisible(true)}
                            title={t('report')}
                            titleStyle={{ color: "red", fontSize: 16 }}
                            leadingIcon={() => <Ionicons name="warning-outline" size={22} color="red" />}
                        />
                    )}
                </Menu>
            </TouchableOpacity> */}
        </Pressable>
    );
});



  return (
    <View style={styles.container}>
      <PostHeader item={item} />
        <Text>chat</Text>   
    </View>
  )
})

export default PostCard

const styles = StyleSheet.create({
  container:{
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
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
})