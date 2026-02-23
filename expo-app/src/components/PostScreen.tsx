import FullScreenMediaModal from "@/app/fullscreenmediapreview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { t } from "i18next";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import {
  AlertTriangle,
  Heart,
  MessageCircle,
  MoreVertical,
  PencilIcon,
  Play,
  Trash,
  TrendingUp,
} from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import ReactTimeAgo from "react-time-ago";
import { likecommentpost, updatepost } from "../apis/apiService";
import Colors from "../utils/Colors";
import { ImagesAssets } from "../utils/ImageAssets";
import BottomSheet from "./BottomSheet";
import CommentsSection from "./CommentsSection";
import CommonLoader from "./CommonLoader";
import { showToast } from "./GlobalToast";
import { Logger } from "../utils/logger";
try {
  if (typeof TimeAgo.addLocale === "function") {
    TimeAgo.addLocale(en);
  }
} catch (e) {
  Logger.warn("Failed to ensure TimeAgo locale is registered:", {Error:String(e)});
}

const { width } = Dimensions.get("window");

const ColorsLight = {
  background: "#FFFFFF",
  cardBackground: "#FFFFFF",
  border: "#E5E7EB",
  shadow: "#000",
  textPrimary: "#1F2937",
  textSecondary: "#374151",
  textTertiary: "#6B7280",
  avatarBg: "#D1D5DB",
  menuButtonBg: "rgba(0,0,0,0.2)",
  tagBg: "#FBCF21",
  tagSecondaryBg: "#D4E4BC",
  tagText: "#000000",
  iconColor: "#4B5563",
  additionalUsersBg: "#D1D5DB",
  contentTextColor: "#374151",
  likeColor: "#8DAF02",
  deleteColor: "#EF4444",
  modalOverlay: "rgba(0,0,0,0.5)",
  modalBackground: "#FFFFFF",
  inputBg: "#F3F4F6",
  inputText: "#1F2937",
  inputBorder: "#D1D5DB",
  commentBg: "#F9FAFB",
};

const isVideo = (uri?: string | null) =>
  !!uri && /\.(mp4|mov|avi|m4v)$/i.test(uri || "");

// Types
type User = {
  id?: string | number | null;
  profileUrl?: string | null;
  fullName?: string | null;
  designation?: string | null;
  ship?: { shipName?: string } | null;
  associatedShip?: { shipName?: string } | null;
};

type MediaItem = { uri: string; type: "image" | "video" };

type Post = {
  id: string | number;
  userDetails?: User | null;
  imageUrls?: string[];
  isLiked?: boolean;
  totalLike?: number;
  likeUser?: User[];
  totalComments?: number;
  viewCount?: number;
  caption?: string;
  createdAt?: string | number;
  createdTime?: string | number;
  hashtags?: string[];
  taggedUsers?: User[];
  groupActivityId?: string | number | null;
  ratioValue?: number;
};

type PostScreenProps = {
  post: Post;
  index?: number;
  onPostDeleted?: (id: string | number) => void;
  onPostReported?: (id: string | number) => void;
};

type PostState = {
  isLiked: boolean;
  likesCount: number;
  currentIndex: number;
  expandedIndex: number | null;
  imageLoading: Record<string, boolean>;
  isLikeLoading: boolean;
  fullLines: number;
  likedUsers: User[];
};

const UserItem: React.FC<{ user: User; onPress?: () => void }> = React.memo(
  ({ user, onPress }) => {
    const imageSource = user.profileUrl
      ? { uri: user.profileUrl }
      : ImagesAssets.userIcon;

    return (
      <TouchableOpacity
        style={styles.userItemContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={imageSource}
          placeholder={ImagesAssets.userIcon}
          style={styles.userAvatar}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.fullName}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

UserItem.displayName = "UserItem";

const TaggedUsersRow: React.FC<{ users?: User[]; onPress?: () => void }> = ({
  users = [],
  onPress,
}) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
    <View style={styles.avatarRow}>
      {users.slice(0, 3).map((user, index) => {
        const imageSource = user.profileUrl
          ? { uri: user.profileUrl }
          : ImagesAssets.userIcon;

        return (
          <Image
            key={user.id || index}
            source={imageSource}
            style={[styles.avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
            placeholder={ImagesAssets.userIcon}
            contentFit="cover"
          />
        );
      })}
      {users.length > 3 && (
        <View style={styles.additionalUsers}>
          <Text style={styles.additionalUsersText}>+{users.length - 3}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const PostHeader: React.FC<{
  profileUrl?: string | null | undefined;
  userName?: string | null | undefined;
  designation?: string | null | undefined;
  taggedUsers?: User[];
  onTaggedPress?: () => void;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
}> = ({
  profileUrl,
  userName,
  designation,
  taggedUsers,
  onTaggedPress,
  onProfilePress,
  onMenuPress,
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onProfilePress}>
      <Image
        source={{ uri: profileUrl || undefined }}
        style={styles.avatar}
        contentFit="cover"
        placeholder={ImagesAssets.userIcon}
      />
    </TouchableOpacity>

    <View style={styles.userInfo}>
      <TouchableOpacity onPress={onProfilePress}>
        <Text style={styles.username}>
          {userName
            ? (() => {
                const formatted =
                  userName.charAt(0).toUpperCase() + userName.slice(1);
                return formatted.length > 20
                  ? formatted.slice(0, 20) + "…"
                  : formatted;
              })()
            : ""}
        </Text>
      </TouchableOpacity>

      <Text style={styles.timestamp}>{designation}</Text>

      {(taggedUsers?.length ?? 0) > 0 && (
        <View style={styles.taggedUsersContainer}>
          <TaggedUsersRow users={taggedUsers} onPress={onTaggedPress} />
        </View>
      )}
    </View>

    <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
      <MoreVertical size={20} color="#4B5563" strokeWidth={1.7} />
    </TouchableOpacity>
  </View>
);

const VideoItem: React.FC<{
  uri: string;
  isActive: boolean;
  ratioValue: number;
  muted?: boolean;
  onPress?: () => void;
}> = ({ uri, isActive, ratioValue, muted = true, onPress }) => {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.bufferOptions = {
      minBufferForPlayback: 0,
      preferredForwardBufferDuration: 5,
      maxBufferBytes: 0,
      prioritizeTimeOverSizeThreshold: false,
      waitsToMinimizeStalling: true,
    };
    p.muted = muted;
  });

  useEffect(() => {
    isActive ? player.play() : player.pause();
  }, [isActive, player]);

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
      <View
        style={[styles.imageContainer, { height: (width - 66) * ratioValue }]}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
        />
        <View style={styles.playIconOverlay}>
          <View style={styles.playIconCircle}>
            <Play size={24} color="#fff" fill="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PostMedia: React.FC<{
  post: Post;
  images: MediaItem[];
  currentIndex: number;
  handleMediaPress: (i: number) => void;
  imageLoading: Record<string, boolean>;
  setImageLoading: (fn: any) => void;
  viewabilityConfigCallbackPairs: React.RefObject<any>;
  hashtagsDisplay?: React.ReactNode;
}> = ({
  post,
  images,
  currentIndex,
  handleMediaPress,
  imageLoading,
  setImageLoading,
  viewabilityConfigCallbackPairs,
  hashtagsDisplay,
}) => {
  const ratioValue = post?.ratioValue ?? 1;

  const renderItem = useCallback(
    ({ item, index }: { item: MediaItem; index: number }) => {
      const isActive = currentIndex === index;
      if (item.type === "video") {
        return (
          <VideoItem
            uri={item.uri}
            isActive={isActive}
            ratioValue={ratioValue}
            muted={true}
            onPress={() => handleMediaPress(index)}
          />
        );
      }
      return (
        <TouchableOpacity onPress={() => handleMediaPress(index)}>
          <View
            style={[
              styles.imageContainer,
              { height: (width - 66) * ratioValue },
            ]}
          >
            {imageLoading[item.uri] && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                size="small"
                color={Colors.darkGreen}
              />
            )}
            <Image
              style={{ width: "100%", height: "100%" }}
              source={{ uri: item.uri }}
              transition={0}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={item.uri}
              priority="normal"
              placeholder={ImagesAssets.PlaceholderImage}
              placeholderContentFit="cover"
              onLoadStart={() =>
                setImageLoading((prev: Record<string, boolean>) => ({
                  ...prev,
                  [item.uri]: true,
                }))
              }
              onLoad={() =>
                setImageLoading((prev: Record<string, boolean>) => ({
                  ...prev,
                  [item.uri]: false,
                }))
              }
            />
          </View>
        </TouchableOpacity>
      );
    },
    [currentIndex, handleMediaPress, imageLoading, setImageLoading, ratioValue],
  );

  return (
    <View style={{ position: "relative" }}>
      <FlashList
        data={images}
        horizontal
        pagingEnabled
        drawDistance={250}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        removeClippedSubviews={true}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />
      <View style={styles.mediaHashtagsOverlay}>{hashtagsDisplay}</View>
    </View>
  );
};

const PostContent: React.FC<{
  post: Post;
  expandedIndex: number | null;
  index?: number;
  toggleExpand: (i: number) => void;
  hashtagsDisplay?: React.ReactNode;
  images: MediaItem[];
  currentIndex: number;
  fullLines: number;
  setFullLines: (l: number) => void;
  hasMedia: boolean;
}> = ({
  post,
  expandedIndex,
  index = 0,
  toggleExpand,
  hashtagsDisplay,
  images,
  currentIndex,
  fullLines,
  setFullLines,
  hasMedia,
}) => {
  const { i18n } = useTranslation();
  const needsTruncation = hasMedia && fullLines > 1;
  const isExpanded = expandedIndex === index;

  return (
    <View style={styles.contentContainer}>
      {hasMedia && images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === idx ? "#8DAF02" : "#6B7280",
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>
      )}
      <View style={styles.captionContainer}>
        <Text
          numberOfLines={
            hasMedia && !isExpanded && needsTruncation ? 1 : undefined
          }
          style={styles.content}
        >
          {post.caption}
        </Text>
        <Text
          style={{ position: "absolute", opacity: 0, width: "100%" }}
          onTextLayout={(e) => setFullLines(e.nativeEvent.lines.length)}
        >
          {post.caption}
        </Text>
        {hasMedia && needsTruncation && (
          <TouchableOpacity
            onPress={() => toggleExpand(index)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isExpanded ? t("seeless") : t("seemore")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {post.createdAt && (
        <Text style={styles.postTimestamp}>
          <ReactTimeAgo
            date={
              post.createdTime
                ? new Date(Number(post.createdTime))
                : new Date(post.createdAt)
            }
            locale="en"
            component={Text}
            timeStyle="short"
          />
        </Text>
      )}
      {!hasMedia && hashtagsDisplay}
    </View>
  );
};

const PostFooter: React.FC<{
  post: Post;
  isLiked: boolean;
  likesCount: number;
  handleLikeToggle: () => void;
  isLikeLoading: boolean;
  openLikesSheet: () => void;
  openCommentSheet: () => void;
}> = ({
  post,
  isLiked,
  likesCount,
  handleLikeToggle,
  isLikeLoading,
  openLikesSheet,
  openCommentSheet,
}) => (
  <View style={styles.footer}>
    <TouchableOpacity
      style={styles.button}
      onPress={handleLikeToggle}
      disabled={isLikeLoading}
    >
      <Heart
        size={24}
        color={isLiked ? "#8DAF02" : "#4B5563"}
        fill={isLiked ? "#8DAF02" : "none"}
        strokeWidth={1.7}
      />
      {likesCount > 0 && (
        <TouchableOpacity onPress={openLikesSheet} style={{ marginLeft: 6 }}>
          <Text style={styles.buttonText}>{likesCount}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={openCommentSheet}>
      <MessageCircle size={22} color="#4B5563" strokeWidth={1.7} />
      {(post.totalComments ?? 0) > 0 && (
        <Text style={styles.buttonText}>{post.totalComments ?? 0}</Text>
      )}
    </TouchableOpacity>
    <View style={styles.button}>
      <TrendingUp size={22} color="#4B5563" strokeWidth={1.7} />
      {(post.viewCount ?? 0) > 0 && (
        <Text style={styles.buttonText}>{post.viewCount ?? 0}</Text>
      )}
    </View>
  </View>
);

// Menu as BottomSheet
const MenuBottomSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  isOwner: boolean;
  onEdit: () => void;
  onDeleteTrigger: () => void;
  onReportTrigger: () => void;
}> = ({
  visible,
  onClose,
  isOwner,
  onEdit,
  onDeleteTrigger,
  onReportTrigger,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={["23%"] as any}
    >
      <View style={styles.menuSheetContent}>
        {isOwner ? (
          <>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                onEdit();
              }}
            >
              <PencilIcon size={20} color="#1F2937" />
              <Text style={styles.menuText}>{t("edit")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                onDeleteTrigger();
              }}
            >
              <Trash size={18} color="#EF4444" />
              <Text style={[styles.menuText, { color: "#EF4444" }]}>
                {t("delete")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Text style={styles.reportdisclaimerText}>
              {t("report_description")}
            </Text>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                onClose();
                onReportTrigger();
              }}
            >
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={[styles.menuText, { color: "#EF4444" }]}>
                {t("report")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}> = ({ visible, onClose, onConfirm, loading }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{t("deletepost")}</Text>
        <Text style={styles.modalSubtitle}>{t("deletepost_description")}</Text>
        <View style={styles.modalButtonContainer}>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonCancel]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.modalButtonTextCancel}>{t("no")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonConfirm]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <CommonLoader color="#FFFFFF" />
            ) : (
              <Text style={styles.modalButtonTextConfirm}>{t("yes")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// Report as Modal (original)
const ReportModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading?: boolean;
}> = ({ visible, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState("");
  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason("");
  };
  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t("reportpost")}</Text>
          <Text style={styles.modalSubtitle}>
            {t("reportpost_description")}
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder={t("enteryourreason")}
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.modalButtonTextCancel}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={handleSubmit}
              disabled={loading || !reason.trim()}
            >
              {loading ? (
                <CommonLoader color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonTextConfirm}>{t("submit")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PostScreen: React.FC<PostScreenProps> = ({
  post,
  index = 0,
  onPostDeleted,
  onPostReported,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const navigateToProfile = useCallback(
    (userId?: string | number | null) => {
      if (!userId) return;
      setCommentSheetVisible(false);
      router.push({ pathname: "/crewProfile", params: { crewId: userId } });
    },
    [router],
  );

  const [currentUserId, setCurrentUserId] = useState<string | number | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("userDetails");
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUserId(user.id);
        setCurrentUser(user);
      }
    })();
  }, []);

  const [menuSheetVisible, setMenuSheetVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [yourActivity, setYourActivity] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [commentSheetVisible, setCommentSheetVisible] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const stored = await AsyncStorage.getItem("userDetails");
        if (!stored) return setYourActivity(false);
        const currentUser = JSON.parse(stored) as any;
        setYourActivity(
          Boolean(
            post.userDetails?.id && currentUser?.id === post.userDetails.id,
          ),
        );
      } catch {
        setYourActivity(false);
      }
    };
    checkOwnership();
  }, [post.userDetails?.id]);

  const [postState, setPostState] = useState<PostState>({
    isLiked: post.isLiked || false,
    likesCount: post.totalLike || 0,
    currentIndex: 0,
    expandedIndex: null,
    imageLoading: {},
    isLikeLoading: false,
    fullLines: 0,
    likedUsers: (post.likeUser as User[]) || [],
  });

  const [likesSheetVisible, setLikesSheetVisible] = useState(false);
  const [taggedSheetVisible, setTaggedSheetVisible] = useState(false);

  const images = useMemo<MediaItem[]>(
    () =>
      (post.imageUrls || []).map((uri) => ({
        uri,
        type: isVideo(uri) ? "video" : ("image" as "image"),
      })),
    [post.imageUrls],
  );
  const hasMedia = images.length > 0;
  const taggedUsers = useMemo(
    () => post.taggedUsers || ([] as User[]),
    [post.taggedUsers],
  );
  const shipName =
    post.userDetails?.ship?.shipName ||
    post.userDetails?.associatedShip?.shipName;
  const isBuddyUpEvent = !!post.groupActivityId;

  const handleMediaPress = useCallback((i: number) => {
    setSelectedMediaIndex(i);
    setMediaModalVisible(true);
  }, []);
  const toggleExpand = useCallback(
    (i: number) =>
      setPostState((prev) => ({
        ...prev,
        expandedIndex: prev.expandedIndex === i ? null : i,
      })),
    [],
  );
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
      if (viewableItems.length > 0)
        setPostState((prev) => ({
          ...prev,
          currentIndex: viewableItems[0].index ?? 0,
        }));
    },
    [],
  );
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 },
      onViewableItemsChanged,
    },
  ]);

  const handleLikeToggle = useCallback(() => {
    if (postState.isLikeLoading || !currentUser) return;

    const newLikeState = !postState.isLiked;
    const wasLiked = postState.isLiked;

    setPostState((prev) => {
      let updatedLikedUsers = [...(prev.likedUsers as User[])];
      if (newLikeState) {
        if (!updatedLikedUsers.some((u) => u.id === (currentUser as any).id)) {
          updatedLikedUsers.unshift({
            id: (currentUser as any).id,
            fullName: (currentUser as any).fullName || "You",
            profileUrl: (currentUser as any).profileUrl || null,
          });
        }
      } else {
        updatedLikedUsers = updatedLikedUsers.filter(
          (u) => u.id !== (currentUser as any).id,
        );
      }

      return {
        ...prev,
        isLiked: newLikeState,
        likesCount: newLikeState ? prev.likesCount + 1 : prev.likesCount - 1,
        likedUsers: updatedLikedUsers,
        isLikeLoading: true,
      };
    });

    likePost(newLikeState, wasLiked);
  }, [
    postState.isLiked,
    postState.likesCount,
    postState.isLikeLoading,
    currentUser,
  ]);

  const likePost = async (newLikeState: boolean, wasLiked: boolean) => {
    try {
      await likecommentpost({
        likeComments: [{ hangoutId: post.id, isLiked: newLikeState }],
      } as any);
    } catch (err) {
      Logger.error("Error", {Error:String(err)});
      setPostState((prev) => {
        let updatedLikedUsers = [...prev.likedUsers];
        if (newLikeState) {
          updatedLikedUsers = updatedLikedUsers.filter(
            (u) => u.id !== currentUser?.id,
          );
        } else {
          if (
            currentUser &&
            !updatedLikedUsers.some((u) => u.id === currentUser.id)
          ) {
            updatedLikedUsers.unshift({
              id: currentUser.id,
              fullName: currentUser.fullName || "You",
              profileUrl: currentUser.profileUrl || null,
            });
          }
        }

        return {
          ...prev,
          isLiked: wasLiked,
          likesCount: wasLiked ? prev.likesCount : prev.likesCount - 1,
          likedUsers: updatedLikedUsers,
          isLikeLoading: false,
        };
      });
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setPostState((prev) => ({ ...prev, isLikeLoading: false }));
    }
  };

  const handleCommentCountChange = useCallback(
    (delta: number) => {
      post.totalComments = Math.max(0, (post.totalComments || 0) + delta);
    },
    [post],
  );

  const openCommentSheet = () => setCommentSheetVisible(true);
  const closeCommentSheet = () => setCommentSheetVisible(false);

  const deletePost = async () => {
    setLoading(true);
    try {
      const res = await updatepost({
        hangouts: [{ hangoutId: post.id, status: "DELETE" }],
      } as any);
      if (res.success && res.status === 200) {
        showToast.success(t("success"), t("postdeleted"));
        onPostDeleted?.(post.id);
      }
    } catch {
      showToast.error(t("error"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
    }
  };

  const reportPost = async (reason: string) => {
    setLoading(true);
    try {
      const res = await updatepost({
        hangouts: [{ hangoutId: post.id, reason, status: "REPORTED" }],
      } as any);
      if (res.success && res.status === 200) {
        showToast.success(t("success"), t("reportsubmitted"));
        onPostReported?.(post.id);
      }
    } catch {
      showToast.error(t("error"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
      setReportModalVisible(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/newpost",
      params: {
        editMode: "true",
        postId: post.id,
        caption: post.caption || "",
        imageUrls: JSON.stringify(post.imageUrls || []),
        hashtags: JSON.stringify(post.hashtags || []),
        taggedUsers: JSON.stringify(
          (post.taggedUsers || []).map((u) => ({
            id: u.id,
            fullName: u.fullName,
            profileUrl: u.profileUrl || null,
            designation: u.designation || "",
          })),
        ),
      },
    });
  };

  const hashtagsDisplay = useMemo(() => {
    return (
      <View style={styles.hashtagsContainer}>
        {isBuddyUpEvent && (
          <View style={[styles.tag, { backgroundColor: ColorsLight.tagBg }]}>
            <Text style={[styles.tagText, { color: Colors.buttonWhiteText }]}>
              {t("buddyupevents")}
            </Text>
          </View>
        )}

        {shipName && (
          <View style={[styles.tag, { backgroundColor: Colors.lightGreen }]}>
            <Text style={styles.tagText}>{shipName}</Text>
          </View>
        )}

        {post.hashtags?.map((h, i) => (
          <View
            key={`${h}-${i}`}
            style={[styles.tag, { backgroundColor: ColorsLight.tagBg }]}
          >
            <Text style={[styles.tagText, { color: Colors.buttonWhiteText }]}>
              {h ? h.charAt(0).toUpperCase() + h.slice(1) : ""}
            </Text>
          </View>
        ))}
      </View>
    );
  }, [isBuddyUpEvent, shipName, post.hashtags, t]);

  return (
    <>
      <View style={styles.ListContainer}>
        <PostHeader
          profileUrl={post.userDetails?.profileUrl}
          userName={post.userDetails?.fullName}
          designation={post.userDetails?.designation}
          taggedUsers={taggedUsers}
          onTaggedPress={() => setTaggedSheetVisible(true)}
          onProfilePress={() => navigateToProfile(post.userDetails?.id)}
          onMenuPress={() => setMenuSheetVisible(true)}
        />

        {hasMedia && (
          <PostMedia
            post={post}
            images={images}
            currentIndex={postState.currentIndex}
            handleMediaPress={handleMediaPress}
            imageLoading={postState.imageLoading}
            setImageLoading={(fn) =>
              setPostState((prev) => ({
                ...prev,
                imageLoading:
                  typeof fn === "function" ? fn(prev.imageLoading) : fn,
              }))
            }
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
            hashtagsDisplay={hashtagsDisplay}
          />
        )}

        <PostContent
          post={post}
          expandedIndex={postState.expandedIndex}
          index={index}
          toggleExpand={toggleExpand}
          hashtagsDisplay={hashtagsDisplay}
          images={images}
          currentIndex={postState.currentIndex}
          fullLines={postState.fullLines}
          setFullLines={(l) =>
            setPostState((prev) => ({ ...prev, fullLines: l }))
          }
          hasMedia={hasMedia}
        />

        <PostFooter
          post={post}
          isLiked={postState.isLiked}
          likesCount={postState.likesCount}
          handleLikeToggle={handleLikeToggle}
          isLikeLoading={postState.isLikeLoading}
          openLikesSheet={() => setLikesSheetVisible(true)}
          openCommentSheet={openCommentSheet}
        />
      </View>

      {/* Menu - BottomSheet */}
      <MenuBottomSheet
        visible={menuSheetVisible}
        onClose={() => setMenuSheetVisible(false)}
        isOwner={yourActivity}
        onEdit={handleEdit}
        onDeleteTrigger={() => setDeleteModalVisible(true)}
        onReportTrigger={() => setReportModalVisible(true)}
      />

      {/* Delete Confirmation - Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={deletePost}
        loading={loading}
      />

      {/* Report - Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={reportPost}
        loading={loading}
      />

      {/* Likes BottomSheet */}
      <BottomSheet
        visible={likesSheetVisible}
        onClose={() => setLikesSheetVisible(false)}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t("likedUsers")}</Text>
        </View>
        <FlatList
          data={postState.likedUsers}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => (
            <UserItem
              user={item}
              onPress={() => {
                setLikesSheetVisible(false);
                navigateToProfile(item.id);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
      </BottomSheet>

      {/* Tagged Users BottomSheet */}
      <BottomSheet
        visible={taggedSheetVisible}
        onClose={() => setTaggedSheetVisible(false)}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t("taggedUsers")}</Text>
        </View>
        <FlatList
          data={taggedUsers}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => (
            <UserItem
              user={item}
              onPress={() => {
                setTaggedSheetVisible(false);
                navigateToProfile(item.id);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            paddingBottom: 50,
          }}
        />
      </BottomSheet>

      <CommentsSection
        visible={commentSheetVisible}
        onClose={closeCommentSheet}
        postId={post.id}
        currentUserId={currentUserId}
        currentUser={currentUser}
        onProfilePress={navigateToProfile}
        onCommentCountChange={handleCommentCountChange}
      />

      <FullScreenMediaModal
        visible={mediaModalVisible}
        media={images}
        initialIndex={selectedMediaIndex}
        onClose={() => setMediaModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  ListContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1D5DB",
    marginRight: 12,
  },
  userInfo: { flex: 1, marginLeft: 10 },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "Poppins-SemiBold",
  },
  timestamp: { fontSize: 12, color: "#6B7280", fontFamily: "Poppins-Regular" },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 8,
    width: width - 54,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  playIconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 10,
  },
  playIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: { marginBottom: 2 },
  captionContainer: { marginBottom: 5 },
  content: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    fontFamily: "Poppins-Regular",
    marginTop: 10,
  },
  toggleButton: { alignSelf: "flex-start" },
  toggleText: { color: "#8DAF02", fontWeight: "600", fontSize: 15 },
  postTimestamp: { fontSize: 11, color: "#6B7280", marginBottom: 10 },
  hashtagsContainer: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    marginBottom: 5,
  },
  tag: { borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 9, textTransform: "capitalize" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    alignItems: "center",
  },
  button: { flexDirection: "row", alignItems: "center" },
  buttonText: { fontSize: 14, color: "#4B5563", marginLeft: 4 },
  menuButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  taggedUsersContainer: { height: 30, marginTop: 3 },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar1: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  additionalUsers: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -15,
  },
  additionalUsersText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 10 },

  menuSheetContent: { paddingHorizontal: 20, paddingTop: 10 },
  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  menuText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
    marginTop: 2,
  },
  mediaHashtagsOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 0,
    zIndex: 10,
    pointerEvents: "none",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Poppins-Regular",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  modalButtonConfirm: { backgroundColor: "#8DAF02" },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "Poppins-SemiBold",
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  reportdisclaimerText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: 10,
  },
  sheetHeader: {
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sheetTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
  },
  userItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#B0B0B0",
  },
  userName: { fontSize: 13, fontFamily: "Poppins-Regular", color: "#1F2937" },
});

export default PostScreen;
