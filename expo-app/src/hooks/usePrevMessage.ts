import { useCallback } from "react";
import { db } from "../database/chatDB";
import { ChatMessage } from "../screens/chat/types/chatRoom";

/**
 * Hook to load previous messages with pagination using PAGE number
 * Page 1 = newest messages
 * Page 2 = older than page 1, etc.
 */
export function useLoadPreviousMessages(chatRoomId: string, limit = 30) {
  
  const loadPage = useCallback(
    async (page: number = 1): Promise<ChatMessage[]> => {
      if (page < 1) page = 1;

      const offset = (page - 1) * limit;

      const rows: any[] = db.getAllSync(`
        SELECT 
          m.*,
          mu.id               AS mu_id,
          mu.fullName         AS mu_fullName,
          mu.email            AS mu_email,
          mu.profileUrl       AS mu_profileUrl,
          mu.designation      AS mu_designation,
          mu.department       AS mu_department,
          mu.ship             AS mu_ship,
          -- reactions
          (
            SELECT json_group_array(
              json_object(
                'id',         mr.id,
                'userId',     mr.userId,
                'messageId',  mr.messageId,
                'reaction',   mr.reaction,
                'createdAt',  mr.createdAt,
                'updatedAt',  mr.updatedAt
              )
            )
            FROM message_reactions mr
            WHERE mr.messageId = m.id
          ) AS reactions_json,
          -- parent (reply-to) message
          pm.id               AS pm_id,
          pm.content          AS pm_content,
          pm.messageType      AS pm_messageType,
          pm.senderId         AS pm_senderId,
          pm.createdAtId      AS pm_createdAtId
        FROM messages m
        LEFT JOIN message_users mu ON mu.id = m.senderId
        LEFT JOIN messages pm      ON pm.id = m.parentMessageId
        WHERE m.chatRoomId = ?
          AND m.status != 'DELETE'  -- optional: hide deleted
        ORDER BY m.createdAtId DESC
        LIMIT ? OFFSET ?
      `, [chatRoomId, limit, offset]);

      
      let formateMessages = rows.map(row => {
        let reactions: any[] = [];
        if (row.reactions_json && row.reactions_json !== "null") {
          try {
            reactions = JSON.parse(row.reactions_json);
          } catch (e) {}
        }

        const messageUser = row.mu_id ? {
          id: row.mu_id,
          fullName: row.mu_fullName || "Unknown",
          email: row.mu_email || "",
          profileUrl: row.mu_profileUrl || null,
          designation: row.mu_designation,
          department: row.mu_department,
          ship: row.mu_ship ? JSON.parse(row.mu_ship) : null,
        } : null;

        const parentMessage = row.pm_id ? {
          id: row.pm_id,
          content: row.pm_content,
          messageType: row.pm_messageType,
          senderId: row.pm_senderId,
          createdAtId: row.pm_createdAtId,
        } : null;

        return {
          id: row.id,
          chatRoomId: row.chatRoomId,
          senderId: row.senderId,
          messageType: row.messageType,
          replyTo: row.replyTo,
          content: row.content,
          caption: row.caption,
          fileName: row.fileName,
          thumbnail: row.thumbnail,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          createdAtId: row.createdAtId,
          messageUser,
          parentMessage,
          chatReactionDetails: reactions,
        } as ChatMessage;
      });
      formateMessages.reverse();
      return formateMessages;
    },
    [chatRoomId, limit]
  );

  return { loadPage };
}