import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import {
  Freshchat,
  FreshchatConfig,
  FreshchatUser,
  FreshchatMessage,
  ConversationOptions,
  FaqOptions,
} from 'react-native-freshchat-sdk';

const APP_ID = 'd3f0a0cc-c399-4f7d-a766-aa6178b81a2d';
const APP_KEY = '6284ec56-b238-4a42-b2ac-8685a420c73d';
const DOMAIN = 'msdk.freshchat.com';

const AppWithFreshchat = () => {
  useEffect(() => {
    // Initialize Freshchat
    try {
      const freshchatConfig = new FreshchatConfig(APP_ID, APP_KEY);
      freshchatConfig.domain = DOMAIN; // Set domain if required
      Freshchat.init(freshchatConfig);
    } catch (error) {
      console.error('Freshchat init error:', error);
    }

    // Set User Properties
    try {
      const freshchatUser = new FreshchatUser();
      freshchatUser.firstName = 'John';
      freshchatUser.lastName = 'Doe';
      freshchatUser.email = 'johndoe@dead.man';
      freshchatUser.phoneCountryCode = '+91';
      freshchatUser.phone = '1234234123';
      Freshchat.setUser(freshchatUser, (error) => {
        if (error) {
          console.error('Set user error:', error);
        } else {
        }
      });
    } catch (error) {
      console.error('Set user error:', error);
    }

    // Set Custom User Properties
    const userPropertiesJson = {
      user_type: 'Paid',
      plan: 'Gold',
    };
    Freshchat.setUserProperties(userPropertiesJson, (error) => {
      if (error) {
        console.error('Set user properties error:', error);
      } else {
      }
    });

    // Identify and Restore User
    const externalId = 'USER_12345'; // Replace with your unique user ID
    const restoreId = null; // Set to stored restoreId if available
    Freshchat.identifyUser(externalId, restoreId, (error) => {
      if (error) {
        console.error('Identify user error:', error);
      } else {
      }
    });

    // Listen for Restore ID Generation
    Freshchat.addEventListener(Freshchat.EVENT_USER_RESTORE_ID_GENERATED, () => {
      Freshchat.getUser((user) => {
        const restoreId = user.restoreId;
        const externalId = user.externalId;
        // Store restoreId in your backend for future use
      });
    });

    // Listen for Unread Message Count Changes
    Freshchat.addEventListener(Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED, () => {
      Freshchat.getUnreadCountAsync((data) => {
        if (data.status) {
        } else {
          console.error('Failed to get unread count');
        }
      });
    });

    // Cleanup listeners on component unmount
    return () => {
      Freshchat.removeEventListeners(Freshchat.EVENT_USER_RESTORE_ID_GENERATED);
      Freshchat.removeEventListeners(Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED);
    };
  }, []);

  // Function to Show Conversations
  const showConversations = () => {
    const conversationOptions = new ConversationOptions();
    conversationOptions.tags = ['premium'];
    conversationOptions.filteredViewTitle = 'Premium Support';
    Freshchat.showConversations(conversationOptions);
  };

  // Function to Show FAQs
  const showFAQs = () => {
    const faqOptions = new FaqOptions();
    faqOptions.tags = ['premium'];
    faqOptions.filteredViewTitle = 'Premium FAQs';
    faqOptions.filterType = FaqOptions.FilterType.ARTICLE;
    Freshchat.showFAQs(faqOptions);
  };

  // Function to Send a Message
  const sendMessage = () => {
    const freshchatMessage = new FreshchatMessage();
    freshchatMessage.tag = 'premium';
    freshchatMessage.message = 'Hello, I need assistance!';
    Freshchat.sendMessage(freshchatMessage);
  };

  // Function to Reset User
  const resetUser = () => {
    Freshchat.resetUser();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Freshchat Integration</Text>
      <Button title="Show Conversations" onPress={showConversations} />
      <Button title="Show FAQs" onPress={showFAQs} />
      <Button title="Send Message" onPress={sendMessage} />
      <Button title="Reset User" onPress={resetUser} />
    </View>
  );
};

export default AppWithFreshchat;