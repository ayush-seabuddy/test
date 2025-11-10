export const HomeHangoutPost = ({
  HandOut,
  loading,
  handleLikeToggle,
  currentPages,
}) => {
  setIslikepost(item.isLiked);

  // setIslikepost(item.isLiked);
  const defaultImage =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";

  // const isLiked = likedItems[item.id];
  // const isLiked = likedItems[item.id];


  const handleLikeToggleBtn = async (item) => {
    const isCurrentlyLiked = item.item.isLiked;
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      setLoading(true);
      const response = await axios({
        method: "put",
        url: `${apiServerUrl}/user/likeCommentHangoutPost`,
        headers: {
          authToken: userDetails.authToken,
        },
        data: {
          likeComments: [
            {
              hangoutId: item.item.id,
              isLiked: !isCurrentlyLiked,
            },
          ],
        },
      });

      if (response.data.responseCode === 200) {
        setIslikepost(!isCurrentlyLiked);
        showMessage({
          message: "Like this post",
          type: "success",
          icon: "success",
          duration: 500,
          textStyle: {
            fontFamily: "Poppins-Regular",
            fontSize: 12,
            color: "#fff",
          },
          style: {
            width: Platform.OS === "android" ? width * 0.92 : null,
            borderRadius: Platform.OS === "android" ? 5 : null,
            margin: Platform.OS === "android" ? 15 : null,
            alignItems: Platform.OS === "android" ? "center" : null,
          },
        });
      }
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);
      showMessage({
        message: "Something went wrong!",
        type: "danger",
        icon: "danger",
        duration: 500,
        textStyle: {
          fontFamily: "Poppins-Regular",
          fontSize: 12,
          color: "#fff",
        },
        style: {
          width: Platform.OS === "android" ? width * 0.92 : null,
          borderRadius: Platform.OS === "android" ? 5 : null,
          margin: Platform.OS === "android" ? 15 : null,
          alignItems: Platform.OS === "android" ? "center" : null,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item: imageUrl }) => (
    <View style={[styles.imageContainer]}>
      <Image
        style={[styles.imageStyle]}
        source={{ uri: imageUrl || defaultImage }}
        resizeMode="cover"
      />
    </View>
  );

  const createdAt = new Date(item.createdAt);
  const now = new Date();
  const differenceInMs = now - createdAt;
  const differenceInHours = Math.floor(differenceInMs / (1000 * 60 * 60));
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x || 0;
    const newPage = Math.round(offsetX / width);

    // Update currentPages to store the new page for the specific item
    setCurrentPages((prev) => ({
      ...prev,
      [item.id]: newPage, // Update only the page for the specific item
    }));
  };

  return (
    <View
      style={[
        styles.ListContainer,
        index === HandOut.length - 1 && { marginBottom: 50 },
      ]}
    >
      <View>
        <FlatList
          data={item.imageUrls.length > 0 ? item.imageUrls : [defaultImage]}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScroll={(event) => handleScroll(event)}
          keyExtractor={(image, index) => index.toString()}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          top: 10,
          left: 20,
          alignItems: "center",
        }}
      >
        <Image
          style={[styles.avatar]}
          source={{
            uri:
              item?.userDetails?.profileUrl ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
          }}
        />
        <View>
          <View>
            <Text style={styles.caption}>
              {item?.userDetails?.fullName || ""}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.hashtags.slice(0, 2).map((hashtag, index) => (
                <View
                  key={index}
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#FBCF21",
                    marginRight: 5,
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    borderRadius: 50,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 10,
                      color: "#06361F",
                    }}
                  >
                    {hashtag?.length > 10
                      ? `${hashtag?.substring(0, 10)}...`
                      : hashtag}
                  </Text>
                </View>
              ))}

              <Text style={styles.timestamp}>
                {calculateTimeSince(item?.createdAt) || ""}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 30,
          top: "5%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          height: 32,
          width: 32,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
        }}
      >
        <Entypo name={"dots-three-vertical"} size={20} color={"#fff"} />
      </TouchableOpacity>

      <View style={{ position: "absolute", top: 70, left: 60 }}>
        <View style={styles.avatarRow}>
          {item?.taggedUsers.slice(0, 3).map((user, index) => (
            <Image
              key={user.id}
              style={[styles.avatar1, { marginLeft: index > 0 ? -20 : 0 }]} // Overlapping avatars
              source={{
                uri:
                  user.profileUrl.toString() ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
              }}
            />
          ))}
          {/* Additional Users Count */}
          {item?.taggedUsers?.length > 3 && (
            <View style={styles.additionalUsers}>
              <Text style={styles.additionalUsersText}>
                +{item?.taggedUsers?.length - 3}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.textOverlay}>
        <View style={styles.interactionButtons}>
          <View style={{ flexDirection: "row" }}>
            {islikepost ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleLikeToggleBtn({ item })}
              >
                {/* <FontAwesome
                    name={isLiked ? "heart" : "heart-o"}
                    size={23}
                    color={"#8DAF02"}
                  /> */}
                <FontAwesome name={"heart"} size={23} color={"#8DAF02"} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleLikeToggleBtn({ item })}
              >
                {/* <FontAwesome
                  name={isLiked ? "heart" : "heart-o"}
                  size={23}
                  color={"#8DAF02"}
                /> */}
                <FontAwesome name={"heart-o"} size={23} color={"#8DAF02"} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                navigation.navigate("Comment", { data: item, type: "button" })
              }
            >
              <Image
                style={styles.iconLike}
                resizeMode="cover"
                source={ImagesAssets.comenticon}
              />
            </TouchableOpacity>
          </View>

          {item.imageUrls.length > 1 && (
            <View style={styles.pagination}>
              {item.imageUrls.map((_, imageIndex) => (
                <View
                  key={imageIndex}
                  style={[
                    styles.dot,
                    (currentPages[item.id] ?? 0) === imageIndex // Check if this is the current active page
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{}}>
          <Text
            style={[
              styles.author,
              {
                fontWeight: "bold",
                fontSize: 16,
                fontFamily: "Poppins-SemiBold",
              },
            ]}
          >
            {item?.userDetails?.fullName}{" "}
            <Text
              style={[
                styles.author,
                {
                  fontSize: 16,
                  fontFamily: "Poppins-Regular",
                  textAlign: "center",
                },
              ]}
            >
              {item.caption.length > 70
                ? `${item.caption.slice(0, 70)}  ...`
                : item.caption}
            </Text>
          </Text>
        </View>

        {item.comments.length > 0 ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("Comment", { data: item })}
          >
            <Text style={styles.viewAllComments}>View all comments</Text>
          </TouchableOpacity>
        ) : null}

        {item.comments.slice(0, 1).map((comment, index) => (
          <View key={index} style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUserName}>
                {comment?.commentUser?.fullName || ""}
              </Text>
            </View>
            {/* Display the comment text */}
            <Text
              style={styles.commentText}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {comment?.comment || ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
