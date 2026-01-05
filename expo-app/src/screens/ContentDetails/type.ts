  export interface ContentUser {
    email: string;
    fullName: string;
    id: string;
    profileUrl: string;
    userType: "ADMIN" | "USER" | string;
  }

  export interface Content {
    id: string;
    contentTitle: string;
    description: string;
    contentType: "VIDEO" | "AUDIO" | "ARTICLE" | string;
    contentUrl: string[];
    thumbnail: string;
    contentCategory: string;
    contentSubCategory: string;
    contentAcknowledge: any[];
    hashtags: string[];
    highPriority: boolean;
    isPublic: boolean;
    order: number | null;
    status: "ACTIVE" | "INACTIVE" | string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    contentUser: ContentUser;
  }



  interface User {
  id: string;
  fullName: string;
  email: string;
  profileUrl: string | null;
  designation?: string; // from userDetails
  associatedShip?: {
    shipName: string;
  };
  ship?: {
    shipName: string;
  };
}

interface Ship {
  shipName: string;
}

interface UserDetails {
  id: string;
  fullName: string;
  email: string;
  profileUrl: string;
  designation: string;
  associatedShip: {
    shipName: string;
  };
  ship: Ship;
}

interface TaggedUser {
  id: string;
  fullName: string;
  email: string;
  profileUrl: string | null;
}

export interface PostInterface {
  id: string;
  caption: string;
  comments: any[]; // assuming comments are not detailed here, could be any[]
  createdAt: string; // ISO date string
  createdTime: string; // timestamp as string
  groupActivityId: string | null;
  hangoutDetails: any[]; // empty in example, unknown structure
  hashtags: string[];
  imageUrls: string[];
  imageresizeMode: 'cover' | string; // likely an enum, but string for flexibility
  isLiked: boolean;
  likeUser: any[]; // empty, possibly User[]
  likes: any[]; // empty
  location: string | null;
  ratioValue: number;
  status: 'ACTIVE' | string;
  taggedUsers: TaggedUser[];
  tags: string[]; // user IDs
  totalComments: number;
  totalLike: number;
  updatedAt: string; // ISO date string
  userDetails: UserDetails;
  userId: string;
  videoresizeMode: 'cover' | string;
  viewCount: number;
}