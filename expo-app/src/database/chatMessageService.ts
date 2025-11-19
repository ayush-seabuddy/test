import { ChatMessage, MessageReaction, MessageUser } from "../screens/chat/types/chatRoom";
import { db } from "./chatDB";

// Fixed & optimized saveMessage function
export function saveMessage(messages: ChatMessage | ChatMessage[]) {
  const messageArray = Array.isArray(messages) ? messages : [messages];

  if (messageArray.length === 0) return;

  db.withTransactionSync(() => {
    messageArray.forEach((chat) => {
     
      db.runSync(
        `INSERT INTO messages 
         (chatRoomId, id, senderId, messageType, replyTo, content, caption, 
          fileName, thumbnail, status, createdAt, updatedAt, parentMessageId , createdAtId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           chatRoomId = excluded.chatRoomId,
           senderId = excluded.senderId,
           messageType = excluded.messageType,
           replyTo = excluded.replyTo,
           content = excluded.content,
           caption = excluded.caption,
           fileName = excluded.fileName,
           thumbnail = excluded.thumbnail,
           status = excluded.status,
           createdAt = excluded.createdAt,
           updatedAt = excluded.updatedAt,
           parentMessageId = excluded.parentMessageId,
           createdAtId = excluded.createdAtId`,
        [
          chat.chatRoomId,
          chat.id,
          chat.senderId,
          chat.messageType,
          chat.replyTo || null,
          chat.content || null,
          chat.caption || null,
          chat.fileName || null,
          chat.thumbnail || null,
          chat.status || "sent",
          chat.createdAt ?? Date.now(),
          chat.updatedAt ?? Date.now(),
          chat.parentMessage?.id || null,
          chat.createdAtId
        ]
      );
      if (chat.messageUser) {
     db.runSync(
  `INSERT INTO message_users 
  (id, fullName, email, profileUrl, designation, department, ship)
 VALUES (?, ?, ?, ?, ?, ?, ?)
 ON CONFLICT(id) DO UPDATE SET
   fullName = excluded.fullName,
   email = excluded.email,
   profileUrl = excluded.profileUrl,
   designation = excluded.designation,
   department = excluded.department,
   ship = excluded.ship
`,
  [
    chat.messageUser.id,
    chat.messageUser.fullName,
    chat.messageUser.email,
    chat.messageUser.profileUrl || null,
    chat.messageUser.designation,
    chat.messageUser.department,
    chat.messageUser.ship ? JSON.stringify(chat.messageUser.ship) : null
  ]
);

      }
      
      if(chat.chatReactionDetails && chat.chatReactionDetails.length > 0){
        chat.chatReactionDetails.forEach((chatReactionDetail: MessageReaction) => {
          db.runSync(
            `INSERT INTO message_reactions (id, userId, messageId, reaction, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             userId = excluded.userId,
             messageId = excluded.messageId,
             reaction = excluded.reaction,
             createdAt = excluded.createdAt,
             updatedAt = excluded.updatedAt
             `,
            [
              chatReactionDetail.userId,
              chatReactionDetail.messageId,
              chatReactionDetail.reaction,
              chatReactionDetail.createdAt ?? Date.now(),
              chatReactionDetail.updatedAt ?? Date.now()
            ]
          );
        });
      }
    });
  });
}