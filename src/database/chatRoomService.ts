import { ChatRoom } from "../screens/chat/types/chatRoom";
import { db } from "./chatDB";

export function saveChatRooms(chatRooms: ChatRoom[]) {
  db.withTransactionSync(() => {
    db.runSync(`DELETE FROM chat_rooms`);
    db.runSync(`DELETE FROM last_messages`);
    db.runSync(`DELETE FROM chat_participants`,);
    db.runSync(`DELETE FROM participants_details`);
    chatRooms.forEach((room) => {

      db.runSync(
        `REPLACE INTO chat_rooms 
        (id, shipId, employerId, chatRoomType, roomType, companyDetails, groupName, description, profileUrl, groupCreatedBy, isDefault, status, createdAt, updatedAt, isUnReadMessage, unReadMessages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          room.id,
          room.shipId,
          room.employerId,
          room.chatRoomType,
          room.roomType,
          JSON.stringify(room.companyDetails),
          room.groupName,
          room.description,
          room.profileUrl,
          room.groupCreatedBy,
          room.isDefault ? 1 : 0,
          room.status,
          room.createdAt,
          room.updatedAt,
          room.isUnReadMessage ? 1 : 0,
          room.unReadMessages
        ]
      );


      room.participants.forEach((p) => {
        db.runSync(
          `INSERT INTO chat_participants 
          (chatRoomId, userId, socketId, isTyping, isOnline, userRole, lastOnline, isRead, unReadMessages, lastReadAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            room.id,
            p.userId,
            p.socketId ?? null,
            p.isTyping ? 1 : 0,
            p.isOnline ? 1 : 0,
            p.userRole,
            p.lastOnline,
            p.isRead ? 1 : 0,
            p.unReadMessages,
            p.lastReadAt
          ]
        );
      });
      room.participantIds.forEach((p) => {
        db.runSync(
          `INSERT INTO participants_details 
          (chatRoomId,id, email, fullName, profileUrl )
          VALUES (?, ?, ?, ?, ?)`,
          [
            room.id,
            p.id,
            p.email,
            p.fullName,
            p.profileUrl
          ]
        );
      });

      // 3. Replace last message (if exists)
      if (room.lastMessage) {
        db.runSync(
          `REPLACE INTO last_messages
          (id, chatRoomId, senderId, messageType, content, fileName, createdAt, userData)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            room.lastMessage.id,
            room.id,
            room.lastMessage.senderId,
            room.lastMessage.messageType,
            room.lastMessage.content,
            room.lastMessage.fileName,
            room.lastMessage.createdAt,
            JSON.stringify(room.lastMessage.messageUser)
          ]
        );
      } else {
        // Optional: clear last message if now null
        db.runSync(`DELETE FROM last_messages WHERE chatRoomId = ?`, [room.id]);
      }
    });
  });
}