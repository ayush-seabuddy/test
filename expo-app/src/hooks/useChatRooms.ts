import { updateFleetList, updateShipList } from "@/src/redux/chatListSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { db } from "../database/chatDB";
import { ChatRoom } from "../screens/chat/types/chatRoom";
import { Logger } from "../utils/logger";



export function useLoadShipChatRooms() {
  const dispatch = useDispatch();


function getShipChatRooms(): ChatRoom[] {
  // 1. Get all rooms + last message
  const rooms: any[] = db.getAllSync(`
    SELECT 
      cr.*,
      lm.id AS lm_id,
      lm.senderId AS lm_senderId,
      lm.messageType AS lm_messageType,
      lm.content AS lm_content,
      lm.fileName AS lm_fileName,
      lm.createdAt AS lm_createdAt,
      lm.userData AS lm_userData
    FROM chat_rooms cr
    LEFT JOIN last_messages lm ON cr.id = lm.chatRoomId
    WHERE cr.shipId IS NOT NULL
    ORDER BY cr.updatedAt DESC
  `);

  // 2. Get participants (no JOIN with users table!)
  const rawParticipants: any[] = db.getAllSync(`
    SELECT *
    FROM chat_participants
    ORDER BY chatRoomId
  `);

  // Group participants by room
  const participantsMap = new Map<string, any[]>();
  rawParticipants.forEach(p => {
    const arr = participantsMap.get(p.chatRoomId) || [];
    arr.push({
      userId: p.userId,
      socketId: p.socketId || null,
      isTyping: !!p.isTyping,
      isOnline: !!p.isOnline,
      userRole: p.userRole,
      lastOnline: p.lastOnline,
      isRead: !!p.isRead,
      unReadMessages: p.unReadMessages || 0,
      lastReadAt: p.lastReadAt,
    });
    participantsMap.set(p.chatRoomId, arr);
  });

  // 3. Build final list
  return rooms.map(room => {
    const participants = participantsMap.get(room.id) || [];

    // For participantIds we need user profile (name, email, photo)
    // We'll extract it from lastMessage.userData if exists, or fallback to empty
    let userProfileMap = new Map<string, any>();

    if (room.lm_userData) {
      try {
        const sender = JSON.parse(room.lm_userData);
        if (sender.id) {
          userProfileMap.set(sender.id, {
            id: sender.id,
            fullName: sender.fullName || sender.name || "Unknown",
            email: sender.email || "",
            profileUrl: sender.profileUrl || null,
          });
        }
      } catch (error) {
        Logger.error('Error', {Error:String(error)})
      }
    }

    // You can enhance this later by storing user profile JSON in chat_participants if needed

    const participantIds = participants.map(p => {
      const cached = userProfileMap.get(p.userId);
      return cached || {
        id: p.userId,
        fullName: "Unknown User",
        email: "",
        profileUrl: null,
      };
    });

    const lastMessage = room.lm_id
      ? {
          id: room.lm_id,
          chatRoomId: room.id,
          senderId: room.lm_senderId,
          messageType: room.lm_messageType,
          content: room.lm_content,
          fileName: room.lm_fileName || null,
          createdAt: room.lm_createdAt,
          messageUser: room.lm_userData ? JSON.parse(room.lm_userData) : null,
        }
      : null;

    return {
      id: room.id,
      shipId: room.shipId,
      employerId: room.employerId,
      chatRoomType: room.chatRoomType,
      roomType: room.roomType,
      companyDetails: room.companyDetails ? JSON.parse(room.companyDetails) : null,
      groupName: room.groupName,
      description: room.description,
      profileUrl: room.profileUrl,
      groupCreatedBy: room.groupCreatedBy,
      isDefault: !!room.isDefault,
      status: room.status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      isUnReadMessage: !!room.isUnReadMessage,
      unReadMessages: room.unReadMessages || 0,

      participants,
      lastMessage,
      participantIds, // This matches exactly your desired output
    } as ChatRoom;
  });
}

function getFleetChatRooms(): ChatRoom[] {
  // 1. Get all rooms + last message
  const rooms: any[] = db.getAllSync(`
    SELECT 
      cr.*,
      lm.id AS lm_id,
      lm.senderId AS lm_senderId,
      lm.messageType AS lm_messageType,
      lm.content AS lm_content,
      lm.fileName AS lm_fileName,
      lm.createdAt AS lm_createdAt,
      lm.userData AS lm_userData
    FROM chat_rooms cr
    LEFT JOIN last_messages lm ON cr.id = lm.chatRoomId
    WHERE cr.employerId IS NOT NULL
    ORDER BY cr.updatedAt DESC
  `);

  // 2. Get participants (no JOIN with users table!)
  const rawParticipants: any[] = db.getAllSync(`
    SELECT *
    FROM chat_participants
    ORDER BY chatRoomId
  `);

  // Group participants by room
  const participantsMap = new Map<string, any[]>();
  rawParticipants.forEach(p => {
    const arr = participantsMap.get(p.chatRoomId) || [];
    arr.push({
      userId: p.userId,
      socketId: p.socketId || null,
      isTyping: !!p.isTyping,
      isOnline: !!p.isOnline,
      userRole: p.userRole,
      lastOnline: p.lastOnline,
      isRead: !!p.isRead,
      unReadMessages: p.unReadMessages || 0,
      lastReadAt: p.lastReadAt,
    });
    participantsMap.set(p.chatRoomId, arr);
  });


// 3. Load participant details from participants_details table
  const rawDetails: any[] = db.getAllSync(`
    SELECT *
    FROM participants_details
    ORDER BY chatRoomId
  `);

    const participantDetailsMap = new Map<string, any[]>();
  rawDetails.forEach(d => {
    const arr = participantDetailsMap.get(d.chatRoomId) || [];
    arr.push({
      id: d.id,
      email: d.email || "",
      fullName: d.fullName || "Unknown User",
      profileUrl: d.profileUrl || null,
    });
    arr.sort((a, b) => a.fullName.localeCompare(b.fullName)); // optional
    participantDetailsMap.set(d.chatRoomId, arr);
  });
  // 3. Build final list
  return rooms.map(room => {
    const participants = participantsMap.get(room.id) || [];
    const participantIds = participantDetailsMap.get(room.id) || [];

    const lastMessage = room.lm_id
      ? {
          id: room.lm_id,
          chatRoomId: room.id,
          senderId: room.lm_senderId,
          messageType: room.lm_messageType,
          content: room.lm_content,
          fileName: room.lm_fileName || null,
          createdAt: room.lm_createdAt,
          messageUser: room.lm_userData ? JSON.parse(room.lm_userData) : null,
        }
      : null;

    return {
      id: room.id,
      shipId: room.shipId,
      employerId: room.employerId,
      chatRoomType: room.chatRoomType,
      roomType: room.roomType,
      companyDetails: room.companyDetails ? JSON.parse(room.companyDetails) : null,
      groupName: room.groupName,
      description: room.description,
      profileUrl: room.profileUrl,
      groupCreatedBy: room.groupCreatedBy,
      isDefault: !!room.isDefault,
      status: room.status,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      isUnReadMessage: !!room.isUnReadMessage,
      unReadMessages: room.unReadMessages || 0,

      participants,
      lastMessage,
      participantIds, // This matches exactly your desired output
    } as ChatRoom;
  });
}

  useEffect(() => {
    const shipChats:ChatRoom[] = getShipChatRooms();
    dispatch(updateShipList(shipChats || []));

    const fleetChats:ChatRoom[] = getFleetChatRooms();
    dispatch(updateFleetList(fleetChats || []));
  }, []); // only once
}
