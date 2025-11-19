// types/chatRoom.ts  (or put it wherever you keep your types)

export interface ChatParticipant {
  userId: string
  socketId?: string
  isTyping: boolean
  isOnline: boolean
  userRole: string
  lastOnline: string | null
  isRead: boolean
  unReadMessages: number
  lastReadAt: string | null
}

export interface MessageUser {
  id: string
  fullName: string
  email: string
  profileUrl: string | null
}

export interface LastMessage {
  id: string
  chatRoomId: string
  senderId: string
  messageType: string
  content: string
  fileName: string | null
  createdAt: string
  messageUser: MessageUser
}

export interface ParticipantSummary {
  id: string
  fullName: string
  email: string
  profileUrl: string | null
}

export interface ChatRoom {
  id: string
  shipId: string | null
  employerId: string | null
  chatRoomType: string          // e.g. "common"
  roomType: string              // e.g. "GROUP"
  participants: ChatParticipant[]
  companyDetails: Record<string, string>
  groupName: string
  description: string
  profileUrl: string | null
  groupCreatedBy: string | null
  isDefault: boolean
  status: string                // e.g. "ACTIVE"
  createdAt: string
  updatedAt: string
  lastMessage: LastMessage | null
  isUnReadMessage: boolean
  unReadMessages: number
  participantIds: ParticipantSummary[]
}

// For Redux state
export interface ChatListState {
  shipChatList: ChatRoom[]
  fleetChatList: ChatRoom[]
}