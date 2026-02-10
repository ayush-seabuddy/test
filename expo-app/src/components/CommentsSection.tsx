import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { t } from 'i18next';
import {
  PencilIcon,
  Reply,
  SendHorizonal,
  Trash,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getallcomments, likecommentpost } from '../apis/apiService';
import { ImagesAssets } from '../utils/ImageAssets';
import BottomSheet from './BottomSheet';
import CommonLoader from './CommonLoader';
import { showToast } from './GlobalToast';

const ColorsLight = {
  textPrimary: '#1F2937',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  likeColor: '#8DAF02',
  deleteColor: '#EF4444',
  cardBackground: '#FFFFFF',
  inputBg: '#F3F4F6',
  inputText: '#1F2937',
  inputBorder: '#D1D5DB',
  modalBackground: '#FFFFFF',
};

type User = {
  id?: string | number | null;
  profileUrl?: string | null;
  fullName?: string | null;
};

type Reply = {
  commentId: string;
  _realReplyId?: string | null;
  parentCommentId?: string | null;
  comment: string;
  userId?: string | number | null;
  commentedAt?: string | null;
  commentUser?: User | null;
};

type Comment = {
  commentId: string;
  _realCommentId?: string | null;
  _realReplyId?: string | null;
  comment: string;
  userId?: string | number | null;
  commentedAt?: string | null;
  commentUser?: User | null;
  reply: Reply[];
  parentCommentId?: string | null;
};

const CommentItem = React.memo(function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onProfilePress,
  level = 0,
  onReply,
}: {
  comment: Comment;
  currentUserId?: string | number | null;
  onEdit: (comment: Comment, isReply?: boolean) => void;
  onDelete: (comment: Comment, isReply?: boolean) => void;
  onProfilePress: (id?: string | number | null) => void;
  level?: number;
  onReply: (comment: Comment) => void;
}) {
  const isOwnComment = comment.userId === currentUserId;
  const user = comment.commentUser || ({} as User);
  const marginLeft = level * 40;
  const { t } = useTranslation();

  return (
    <View style={{ marginLeft }}>
      <View style={styles.commentContainer}>
        <TouchableOpacity onPress={() => onProfilePress(user.id)}>
          <Image
            source={{ uri: user.profileUrl as string | undefined }}
            style={styles.commentAvatar}
            contentFit="cover"
            placeholder={ImagesAssets.userIcon}
          />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <View>
            <TouchableOpacity onPress={() => onProfilePress(user.id)}>
              <Text style={[styles.commentUserName, { color: ColorsLight.textPrimary, fontWeight: '600' }]}>
                {user.fullName || 'Unknown'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.commentText, { color: ColorsLight.textPrimary }]}>{comment.comment}</Text>
          </View>

          <View style={styles.commentActions}>
            {!isOwnComment && (
              <TouchableOpacity
                onPress={() => onReply(comment)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <Reply size={14} color={ColorsLight.textSecondary} />
                <Text style={{ fontSize: 12, color: ColorsLight.textSecondary }}>{t('reply')}</Text>
              </TouchableOpacity>
            )}

            {isOwnComment && (
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  onPress={() => onEdit(comment, level > 0)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                >
                  <PencilIcon size={12} color={ColorsLight.textSecondary} />
                  <Text style={{ fontSize: 12, color: ColorsLight.textSecondary }}>{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(comment, level > 0)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                >
                  <Trash size={11} color={ColorsLight.deleteColor} />
                  <Text style={{ fontSize: 12, color: ColorsLight.deleteColor }}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {comment.reply && comment.reply.length > 0 && (
        <View>
          {comment.reply.map((rep) => (
            <CommentItem
              key={rep.commentId}
              comment={rep as unknown as Comment}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onProfilePress={onProfilePress}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
});

CommentItem.displayName = 'CommentItem';

const CommentsSection: React.FC<{
  visible: boolean;
  onClose: () => void;
  postId: string | number;
  currentUserId?: string | number | null;
  currentUser?: any;
  onProfilePress?: (id?: string | number | null) => void;
  onCommentCountChange?: (delta: number) => void;
}> = ({
  visible,
  onClose,
  postId,
  currentUserId,
  currentUser,
  onProfilePress = () => {},
  onCommentCountChange,
}) => {
  const { t } = useTranslation();
  const listRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; userName: string } | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const [editingCommentRealId, setEditingCommentRealId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<null | { comment: Comment; isReply: boolean; parentCommentId?: string | null }>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchComments = useCallback(async () => {
    setCommentLoading(true);
    try {
      // ensure hangoutId is a string as API expects
      const res = await getallcomments({ hangoutId: String(postId) });
      if (res.success && res.status === 200) {
        const raw = res.data?.comments || [];
        const formatted: Comment[] = raw.map((c: any) => ({
          commentId: c.commentId,
          _realCommentId: c.commentId,
          comment: c.comment,
          userId: c.userId,
          commentedAt: c.commentedAt,
          commentUser: c.commentUser,
          reply: (c.reply || []).map((r: any) => ({
            commentId: r.replyCommentId || r.commentId,
            _realReplyId: r.replyCommentId || r.commentId,
            parentCommentId: c.commentId,
            comment: r.comment,
            userId: r.repliedPersonUserID || r.userId,
            commentedAt: r.commentedAt || new Date().toISOString(),
            commentUser: r.commentUser || r.replyUser || c.commentUser,
          })),
        }));
        setComments(formatted);
      }
    } catch (err) {
      console.log('Error', err);
      showToast.error(t('error'), t('somethingwentwrong'));
    } finally {
      setCommentLoading(false);
    }
  }, [postId, t]);

  useEffect(() => {
    if (visible) fetchComments();
  }, [visible, fetchComments]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const postComment = async () => {
    if (!commentText.trim() || sendingComment) return;

    const text = commentText.trim();
    setSendingComment(true);

    const isReply = !!replyingTo;
    const isEdit = !!editingComment;

    if (isEdit && editingComment) {
      const previousComments = [...comments];

      setComments((prev) =>
        prev.map((c) => {
          if (isEditingReply) {
            return {
              ...c,
              reply: c.reply.map((r) => (r.commentId === editingComment.commentId ? { ...r, comment: text } : r)),
            };
          }
          return c.commentId === editingComment.commentId ? { ...c, comment: text } : c;
        })
      );

      try {
        const payload: any = {
          likeComments: [
            {
              hangoutId: postId,
              comment: text,
              ...(isEditingReply
                ? {
                    replyCommentId: editingCommentRealId,
                    commentId: parentCommentId,
                    type: 'EDITREPLY',
                  }
                : {
                    commentId: editingCommentRealId,
                    type: 'UPDATE',
                  }),
            },
          ],
        };

        await likecommentpost(payload);

        setCommentText('');
        setEditingComment(null);
        setIsEditingReply(false);
        setParentCommentId(null);
        setEditingCommentRealId(null);
        setReplyingTo(null);
        Keyboard.dismiss();
      } catch (err) {
        console.log('Error', err);
        setComments(previousComments);
        showToast.error(t('error'), t('somethingwentwrong'));
      } finally {
        setSendingComment(false);
      }
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempComment: Comment = {
      commentId: tempId,
      _realCommentId: null,
      _realReplyId: null,
      comment: text,
      userId: currentUser?.id,
      commentedAt: new Date().toISOString(),
      commentUser: {
        id: currentUser?.id,
        fullName: currentUser?.fullName || 'You',
        profileUrl: currentUser?.profileUrl,
      },
      reply: [],
      ...(isReply && { parentCommentId: replyingTo?.commentId }),
    } as Comment;

    const previousComments = [...comments];

    if (isReply && replyingTo) {
      setComments((prev) =>
        prev.map((c) => (c.commentId === replyingTo.commentId ? { ...c, reply: [...c.reply, tempComment] } : c))
      );
    } else {
      setComments((prev) => [tempComment, ...prev]);
      onCommentCountChange?.(1);
    }

    try {
      const payload: any = {
        likeComments: [
          {
            hangoutId: postId,
            comment: text,
            ...(isReply && { commentId: replyingTo?.commentId, type: 'REPLY' }),
          },
        ],
      };

  const res = await likecommentpost(payload);
  // response shape varies; use any to safely read dynamic fields
  const anyRes = res as any;
  const realReplyId = anyRes?.data?.replyCommentId || anyRes?.replyCommentId;
  const realCommentId = anyRes?.data?.commentId || anyRes?.commentId || realReplyId;

      setComments((prev) =>
        prev.map((c) => {
          if (c.commentId === tempId) {
            return {
              ...c,
              commentId: realCommentId || tempId,
              _realCommentId: realCommentId || tempId,
            };
          }

          return {
            ...c,
            reply: c.reply.map((r) =>
              r.commentId === tempId
                ? {
                    ...r,
                    commentId: realReplyId || tempId,
                    _realReplyId: realReplyId || tempId,
                  }
                : r
            ),
          };
        })
      );

      setCommentText('');
      setReplyingTo(null);
      setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 400);
    } catch (err) {
      console.log('Error', err);
      setComments(previousComments);
      if (!isReply) onCommentCountChange?.(-1);
      showToast.error(t('error'), t('somethingwentwrong'));
    } finally {
      setSendingComment(false);
    }
  };

  const handleEdit = useCallback(
    (comment: Comment, isReply = false) => {
      let realCommentId: string | null = null;
      let parentId: string | null = null;

      if (isReply) {
        const parent = comments.find((c) => c.reply.some((r) => r.commentId === comment.commentId));
        parentId = parent?.commentId || null;
        realCommentId = (comment as any)._realReplyId || comment.commentId;
      } else {
        realCommentId = (comment as any)._realCommentId || comment.commentId;
      }

      setEditingComment(comment);
      setIsEditingReply(isReply);
      setParentCommentId(parentId);
      setEditingCommentRealId(realCommentId);
      setCommentText(comment.comment);
      setReplyingTo(null);
      setTimeout(() => inputRef.current?.focus(), 300);
    },
    [comments]
  );

  const handleDelete = useCallback(
    (comment: Comment, isReply = false) => {
      let parentId: string | null = null;
      if (isReply) {
        const parent = comments.find((c) => c.reply.some((r) => r.commentId === comment.commentId));
        parentId = parent?.commentId || null;
      }

      setCommentToDelete({ comment, isReply, parentCommentId: parentId });
      setDeleteConfirmVisible(true);
    },
    [comments]
  );

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    setDeleting(true);
    const { comment, isReply, parentCommentId } = commentToDelete;

    const realCommentId = isReply ? (comment._realReplyId || comment.commentId) : (comment._realCommentId || comment.commentId);

    const previousComments = [...comments];

    if (isReply) {
      setComments((prev) => prev.map((c) => ({ ...c, reply: c.reply.filter((r) => r.commentId !== comment.commentId) })));
    } else {
      setComments((prev) => prev.filter((c) => c.commentId !== comment.commentId));
      onCommentCountChange?.(-1);
    }

    try {
      const payload: any = {
        likeComments: [
          {
            hangoutId: postId,
            comment: 'true',
            [isReply ? 'replyCommentId' : 'commentId']: realCommentId,
            ...(isReply && parentCommentId ? { commentId: parentCommentId } : {}),
            type: isReply ? 'DELETEREPLY' : 'DELETE',
          },
        ],
      };

      await likecommentpost(payload);
    } catch (err) {
      console.log('Error', err);
      setComments(previousComments);
      if (!isReply) onCommentCountChange?.(1);
      showToast.error(t('error'), t('somethingwentwrong'));
    } finally {
      setDeleting(false);
      setDeleteConfirmVisible(false);
      setCommentToDelete(null);
    }
  };

  const handleReply = useCallback((comment: Comment) => {
    setReplyingTo({ commentId: comment.commentId, userName: comment.commentUser?.fullName || 'User' });
    setCommentText('');
    setEditingComment(null);
    setIsEditingReply(false);
    setParentCommentId(null);
    setEditingCommentRealId(null);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleClose = useCallback(() => {
    setCommentText('');
    setReplyingTo(null);
    setEditingComment(null);
    setIsEditingReply(false);
    setParentCommentId(null);
    setEditingCommentRealId(null);
    onClose();
  }, [onClose]);

  return (
    <>
      <BottomSheet visible={visible} onClose={handleClose} snapPoints={["60%", "80%"]}>
        <View style={{ flex: 1 }}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: ColorsLight.textPrimary }]}>{t('comments')}</Text>
          </View>

          <View style={{ flex: 1 }}>
            {commentLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <CommonLoader fullScreen />
              </View>
            ) : (
              <FlashList
                ref={listRef}
                data={comments}
                keyExtractor={(item) => item.commentId}
                renderItem={({ item }) => (
                  <CommentItem
                    comment={item}
                    currentUserId={currentUserId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onProfilePress={(id) => onProfilePress?.(id)}
                    onReply={handleReply}
                    level={0}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <Text style={{ color: ColorsLight.textTertiary, fontSize: 16 }}>{t('nocommentsyet')}</Text>
                    <Text style={{ color: ColorsLight.textTertiary, fontSize: 14, marginTop: 8 }}>{t('bethefirsttocomment')}</Text>
                  </View>
                }
              />
            )}

            <View style={[styles.commentInputContainer, { backgroundColor: ColorsLight.cardBackground, marginBottom: Platform.OS === 'ios' ? keyboardHeight : 0 }]}>
              {replyingTo && (
                <View style={styles.replyingToBanner}>
                  <Text style={{ color: ColorsLight.textSecondary, fontSize: 13 }}>
                    {t('replyingTo')}{' '}
                    <Text style={{ fontWeight: '600', color: ColorsLight.likeColor }}>{replyingTo.userName}</Text>
                  </Text>
                  <TouchableOpacity onPress={() => { setReplyingTo(null); setCommentText(''); }}>
                    <Text style={{ color: ColorsLight.deleteColor, marginLeft: 10 }}>{t('cancel')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {editingComment && (
                <View style={styles.replyingToBanner}>
                  <Text style={{ color: ColorsLight.textSecondary, fontSize: 13 }}>{t('editing')}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingComment(null);
                      setIsEditingReply(false);
                      setParentCommentId(null);
                      setEditingCommentRealId(null);
                      setCommentText('');
                    }}
                  >
                    <Text style={{ color: ColorsLight.deleteColor, marginLeft: 10 }}>{t('cancel')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 20, paddingTop: 10 }}>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: ColorsLight.inputBg,
                      color: ColorsLight.inputText,
                      borderColor: ColorsLight.inputBorder,
                    },
                  ]}
                  placeholder={editingComment ? t('edityourcomment') : replyingTo ? t('writearreply') : t('writecomment')}
                  placeholderTextColor={ColorsLight.textTertiary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  textAlignVertical="center"
                />
                <TouchableOpacity onPress={postComment} disabled={!commentText.trim() || sendingComment}>
                  {sendingComment ? (
                    <CommonLoader />
                  ) : (
                    <View
                      style={{
                        backgroundColor: commentText.trim() ? ColorsLight.likeColor : ColorsLight.textTertiary,
                        padding: 10,
                        borderRadius: 10,
                      }}
                    >
                      <SendHorizonal size={20} color={'white'} strokeWidth={1.5} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {deleteConfirmVisible && (
            <View style={styles.deleteOverlay}>
              <View style={[styles.modalContainer, { backgroundColor: ColorsLight.modalBackground }]}>
                <Text style={[styles.modalTitle, { color: ColorsLight.textPrimary }]}>{t('deletecomment')}</Text>
                <Text style={[styles.modalSubtitle, { color: ColorsLight.textSecondary }]}>{t('areyousure')}</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: ColorsLight.inputBg, borderColor: ColorsLight.inputBorder }]}
                    onPress={() => setDeleteConfirmVisible(false)}
                    disabled={deleting}
                  >
                    <Text style={[styles.modalButtonTextCancel, { color: ColorsLight.textPrimary }]}>{t('no')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: 'red' }]} onPress={confirmDelete} disabled={deleting}>
                    {deleting ? <CommonLoader color="#FFFFFF" /> : <Text style={styles.modalButtonTextConfirm}>{t('yes')}</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sheetTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  commentContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 19,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 16,
  },
  deleteOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  commentInputContainer: {
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
  },
  replyingToBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#ededed',
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 114,
    paddingTop: Platform.OS === 'ios' ? 13 : 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {},
  modalButtonTextCancel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  modalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CommentsSection;
