declare module 'react-native-freshchat-sdk' {
  export class FreshchatConfig {
    constructor(
      appId: string,
      appKey: string,
      options?: {
        domain?: string;
        cameraEnabled?: boolean;
        gallerySelectionEnabled?: boolean;
        responseExpectationEnabled?: boolean;
        teamMemberInfoVisible?: boolean;
        showNotificationBanner?: boolean;
      }
    );
  }

  // Fixed: Add actual properties used by Freshchat SDK
  export class FreshchatUser {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phoneCountryCode?: string;

    // Constructor is not needed in JS, but for completeness
    constructor();

    // These are the setter methods actually used under the hood
    setFirstName(firstName: string): void;
    setLastName(lastName: string): void;
    setEmail(email: string): void;
    setPhone(phone: string, countryCode: string): void;
  }

  export class ConversationOptions {
    tags?: string[];
    filteredViewTitle?: string;
    constructor();
  }

  export const Freshchat: {
    init(config: FreshchatConfig): void;

    // Note: setUser expects an instance with setters called, OR direct property assignment works in JS
    setUser(user: FreshchatUser, callback?: (error?: any) => void): void;
    setUserProperties(props: Record<string, string>, cb?: (err?: any) => void): void;
    identifyUser(externalId: string, restoreId: string | null, cb?: (err?: any) => void): void;

    showConversations(options?: ConversationOptions): void;
    getUnreadCountAsync(cb: (data: { status: boolean; count?: number }) => void): void;

    addEventListener(event: string, listener: () => void): void;
    removeEventListeners(event: string): void;

    EVENT_UNREAD_MESSAGE_COUNT_CHANGED: 'FreshchatUnreadCountChanged';
  };

  export { FreshchatConfig, FreshchatUser, ConversationOptions };
}