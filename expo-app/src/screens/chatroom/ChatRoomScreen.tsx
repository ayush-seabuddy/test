// src/screens/chat/ChatRoomScreen.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import KeyboardAvoidingWrapper from '@/src/components/KeyboardAvoidingWrapper';
// ChatHeader is optional in some builds; keep import commented to avoid missing module errors
// import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInputBar from './components/ChatInputBar';
import ReplyPreviewBar from './components/ReplyPreviewBar';
import MessageActionsModal from './components/MessageItem/MessageActionsModal';

const ChatRoomScreen = () => {
  const route = useRoute<ChatRoomRouteProp>();
  const { id: senderId } = useSelector((state: RootState) => state.userDetails);
  const chatRoomDetails = (route.params as any) || {};

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  const flatListRef = useRef(null);

  const handleSend = () => { /* send logic */ };
  const handleLongPress = (msg: ChatMessage) => {
    setSelectedMessage(msg);
    setShowActions(true);
  };

  return (
    <KeyboardAvoidingWrapper style={styles.container}>
      <View style={styles.container}>
        <ChatHeader chatRoom={chatRoomDetails} />

        <ChatMessageList
          messages={messages}
          senderId={senderId}
          flatListRef={flatListRef}
          onLongPress={handleLongPress}
          replyingTo={replyingTo}
        />

        {replyingTo && (
          <ReplyPreviewBar
            message={replyingTo}
            onCancel={() => setReplyingTo(null)}
          />
        )}

        <ChatInputBar
          content={content}
          setContent={setContent}
          onSend={handleSend}
          replyingTo={replyingTo}
          editingMessageId={editingMessageId}
          onCancelEdit={() => {
            setEditingMessageId(null);
            setContent('');
          }}
        />

        <MessageActionsModal
          visible={showActions}
          message={selectedMessage}
          currentUserId={senderId}
          onClose={() => setShowActions(false)}
          onReply={(msg) => {
            setReplyingTo(msg);
            setShowActions(false);
          }}
          onEdit={(msg) => {
            setContent(msg.content);
            setEditingMessageId(msg.id);
            setShowActions(false);
          }}
          onDelete={(msg) => { /* delete */ }}
          onReact={(msg, emoji) => { /* react */ }}
        />
      </View>
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
});

export default ChatRoomScreen;