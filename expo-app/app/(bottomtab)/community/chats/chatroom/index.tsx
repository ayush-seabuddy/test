// src/screens/chat/ChatRoom.tsx
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import { ChatRoom } from '@/src/screens/chat/types/chatRoom' // <-- your type
import ChatRoomHeader from '@/src/screens/chatroom/ChatRoomHeader'
import { router } from 'expo-router'

type ChatRoomScreenParams = {
  chatRoomDetails: ChatRoom
}
type ChatRoomRouteProp = RouteProp<{ ChatRoom: ChatRoomScreenParams }, 'ChatRoom'>

const ChatRoomScreen = () => {
  const route = useRoute<ChatRoomRouteProp>()
  const chatRoomDetails = typeof route.params?.chatRoomDetails === 'string' ? JSON.parse(route.params?.chatRoomDetails) : route.params?.chatRoomDetails

  const headerPops = {
    navigation: ()=>router.back(),
    data: chatRoomDetails,
    participant: chatRoomDetails?.participants?.length,
    GroupName: chatRoomDetails?.groupName,
    setSearchValue: () => {},
    participantIds: chatRoomDetails?.participantIds
  }

 

  return (
    <View style={styles.container}>
      <ChatRoomHeader  {...headerPops}/> 
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

})

export default ChatRoomScreen