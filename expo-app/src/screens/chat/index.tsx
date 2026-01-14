
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import CommonLoader from '@/src/components/CommonLoader'
import { saveChatRooms } from '@/src/database/chatRoomService'
import { updateOneFleetChat, updateOneShipChat } from '@/src/redux/chatListSlice'
import { RootState } from '@/src/redux/store'
import { ChatRoom } from '@/src/screens/chat/types/chatRoom'
import Colors from '@/src/utils/Colors'
import { formatChatTime, viewUserProfile } from '@/src/utils/helperFunctions'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import socketService from '@/src/utils/socketService'
import { router, useFocusEffect } from 'expo-router'
import { t } from 'i18next'
import ChatHeader from './chatListHeader'

const ChatLoungeList = () => {
  const dispatch = useDispatch()
  const { shipChatList, fleetChatList } = useSelector((state: RootState) => state.chatList)
  const [loading, setLoading] = useState(true)
  const [shipList, setShipList] = useState([])
  const [fleetList, setFleetList] = useState([])

  const loungeSections = [
    {
      title: t('shiplounge'),
      description: t('shiplounge_description'),
      icon: ImagesAssets.shipIcon,
      rooms: shipChatList,
    },
    {
      title: t('fleetlounge'),
      description: t('fleetlounge_description'),
      icon: ImagesAssets.fleetIcon,
      rooms: fleetChatList,
    },
  ]

  const fetchChatRooms = async () => {
    const [userId, shipId, employerId] = await Promise.all([
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('shipId'),
      AsyncStorage.getItem('employerId'),
    ])

    socketService.emit('getAllGroupChatRooms', { userId, shipId })
    socketService.emit('getAllGroupChatRooms', { userId, employerId })

    socketService.on('groupChatRooms', (data) => {
      data?.groupChatRooms?.map((item: ChatRoom) => {
        dispatch(updateOneShipChat(item))
      })
      setShipList(data?.groupChatRooms || [])
    }
    )
    socketService.on('groupChatRoomsEmployer', (data) => {
      data?.groupChatRooms?.map((item: ChatRoom) => {
        dispatch(updateOneFleetChat(item))
      })
      setFleetList(data?.groupChatRooms)
    }
    )
  }




  const updateChatCount = async (data: any) => {
    console.log("data: ", data);
    const userId = await AsyncStorage.getItem('userId')
    

    const preShipChatList = shipChatList.map((item: ChatRoom) =>
      item.id === data.chatRoomId ? {
        ...item,
        lastMessage:data.data,
        isUnReadMessage: true,
        unReadMessages:  data?.participants?.find((p: any) => p.userId === userId)?.unReadMessages ?? 0,
      } : item
    )

    const preFleetChatList = fleetChatList.map((item: ChatRoom) =>
      item.id === data.chatRoomId ? {
        ...item,
        lastMessage:data.data,
        isUnReadMessage: true,
        unReadMessages:  data?.participants?.find((p: any) => p.userId === userId)?.unReadMessages ?? 0,
      } : item
    )

    preShipChatList?.map((item: ChatRoom) => {
      console.log("item: ", item);
        dispatch(updateOneShipChat(item))
      })
      preFleetChatList?.map((item: ChatRoom) => {
        console.log("item: ", item);
        dispatch(updateOneFleetChat(item))
      })

  }


  useFocusEffect(useCallback(() => {
    socketService.on("newMessage", updateChatCount);

    return () => {
      socketService.off("newMessage", updateChatCount);
    }
  }, [dispatch]))


  useFocusEffect(
    useCallback(() => {

      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
      }, 4000);
      fetchChatRooms()
      return () => {
        socketService.off('groupChatRooms')
        socketService.off('groupChatRoomsEmployer')
        clearTimeout(timer);
      }
    }, [dispatch])
  );

  const renderChatRow = (room: ChatRoom, index: number) => {
    const hasUnread = room.isUnReadMessage && room.unReadMessages > 0
    const lastMsg = room.lastMessage
    const handChatListPress = (room: ChatRoom) => {
      router.push({
        pathname: `/chatroom/[chatRoomId]`,
        params: { chatRoomId: room.id, chatRoomDetails: JSON.stringify(room) },
      })
    }

    return (
      <TouchableOpacity key={index} style={styles.chatRow} onPress={() => handChatListPress(room)} >
        <View style={styles.chatMiddle}>
          <Text
            style={[styles.groupName, hasUnread && styles.groupNameUnread]}
            numberOfLines={1}
          >
            {room.groupName}
          </Text>

          <Text
            style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {lastMsg?.messageUser?.fullName
              ? `${lastMsg.messageUser.fullName.split(' ')[0]}: `
              : ''}
            {lastMsg?.messageType !== 'MESSAGE'
              ? lastMsg?.messageType
              : (lastMsg?.content || '')
                .replace(/\n/g, ' ')
                .trim()
                .slice(0, 35) + (lastMsg?.content?.trim().length > 35 ? '...' : '')}
          </Text>
        </View>

        {/* Right: Time + Unread Badge */}
        <View style={styles.chatRight}>
          {lastMsg && (
            <Text style={[styles.time, hasUnread && styles.timeHighlighted]}>
              {formatChatTime(lastMsg.createdAt)}
            </Text>
          )}
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {room.unReadMessages > 9 ? '9+' : room.unReadMessages}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    let chatList = [...shipList, ...fleetList];

    if (chatList.length > 0) {
      saveChatRooms(chatList);
    }


  }, [shipList, fleetList])

  useEffect(() => {
    viewUserProfile(dispatch)
  }, [])

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <ChatHeader />

        {
          shipChatList.length === 0 && fleetChatList.length === 0 && 
        (loading ? (
          <View style={{ alignItems: 'center',flex:1,justifyContent:'center' }}>
            <CommonLoader fullScreen/>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: Colors.lightGreen }}>No messages yet</Text>
          </View>
        ))
        }

        <View style={styles.chatListContainer}>
          {loungeSections.map((section) => {
            if (section.rooms.length === 0) return null

            return (
              <View key={section.title} style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Image
                    source={section.icon}
                    style={styles.sectionIcon}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.headerText}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>{section.description}</Text>
                  </View>
                </View>
                <View style={styles.chatRowContainer}>
                  {section.rooms.map(renderChatRow)}
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ededed" },
  contentContainer: {
    paddingBottom: 150,
    gap: 25,
  },
  sectionContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "rgba(232, 232, 232, 1)",
    borderRadius: 15,
    borderWidth:1,
    borderColor:'#fff',
    overflow: 'hidden',
  },
  chatListContainer: {
    marginTop: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: { width: 50, height: 50 },
  headerText: { flex: 1 },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'WhyteInktrap-Bold',
    color: 'black',
  },
  sectionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6f8406',
    marginTop: 2,
  },

  chatRowContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderColor: '#e0e0e0',
  },
  chatMiddle: { flex: 1, },
  groupName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'WhyteInktrap-Bold',
    color: '#052B19',
    marginBottom: 4,
  },
  groupNameUnread: {
    fontFamily: 'WhyteInktrap-Bold',
    color: '#052B19',
  },
  lastMessage: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  lastMessageUnread: {
    fontFamily: 'Poppins-SemiBold',
    color: '#052B19',
  },
  chatRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginBottom: 6,
  },
  timeHighlighted: { color: Colors.lightGreen },
  unreadBadge: {
    backgroundColor: Colors.lightGreen,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
})

export default ChatLoungeList