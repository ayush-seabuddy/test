export interface ChatParticipant {
  userId: string
  socketId?: string
  isTyping: boolean
  isOnline: boolean
  userRole: string
  lastOnline: string | null
  isRead: boolean
  unreadMessages: number
  lastReadAt: string | null
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
  unreadMessages: number
  participantIds: ParticipantSummary[]
}

// For Redux state
export interface ChatListState {
  shipChatList: ChatRoom[]
  fleetChatList: ChatRoom[]
}



export interface CrewMember {
  userId: string;
  isBoarded?: boolean;
}

export interface ShipInfo {
  crewMembers: CrewMember[];
}

export interface MessageUser {
  id: string;
  fullName: string;
  email: string;
  profileUrl: string|null;
  designation: string;
  department: string;
  ship?: ShipInfo;
}

export interface MessageReaction {
  id?: string;
  userId: string;
  messageId: string;
  reaction: string;       // "❤️" | "😂" | "😊" etc.
  createdAt?: string;
  updatedAt?: string;
}

export interface ParentMessage {
  id: string;
  senderId: string;
  chatRoomId: string;
  messageType: string;
  replyTo?: string | null;
  content: string;
  caption?: string | null;
  fileName?: string | null;
  thumbnail?: string | null;
  createdAtId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageUser: MessageUser;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  chatRoomId: string;
  messageType: "MESSAGE" | "IMAGE" | "FILE" | "VIDEO" | string;
  replyTo: string | null;
  content: string;
  caption: string | null;
  fileName: string | null;
  thumbnail: string | null;
  createdAtId: string|number;
  status: "ACTIVE" | "EDIT" | "DELETE" | string;
  createdAt: string;
  updatedAt: string;
  messageUser: MessageUser;
  parentMessage?: ParentMessage | null;
  chatReactionDetails: MessageReaction[];
  participants: ChatParticipant[];
}
