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