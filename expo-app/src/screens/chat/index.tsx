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
import { router, useFocusEffect } from 'expo-router'
import { t } from 'i18next'

import CommonLoader from '@/src/components/CommonLoader'
import EmptyComponent from '@/src/components/EmptyComponent'
import ChatHeader from './chatListHeader'

import { saveChatRooms } from '@/src/database/chatRoomService'
import { updateOneFleetChat, updateOneShipChat } from '@/src/redux/chatListSlice'
import { RootState } from '@/src/redux/store'
import { ChatRoom } from '@/src/screens/chat/types/chatRoom'
import Colors from '@/src/utils/Colors'
import { formatChatTime, viewUserProfile } from '@/src/utils/helperFunctions'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import socketService from '@/src/utils/socketService'

const ChatLoungeList = () => {
  const dispatch = useDispatch()
  const { shipChatList, fleetChatList } = useSelector(
    (state: RootState) => state.chatList
  )

  const [loading, setLoading] = useState(true)
  const [shipList, setShipList] = useState<ChatRoom[]>([])
  const [fleetList, setFleetList] = useState<ChatRoom[]>([])

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
      const rooms = data?.groupChatRooms || []
      rooms.forEach((item: ChatRoom) => dispatch(updateOneShipChat(item)))
      setShipList(rooms)
    })

    socketService.on('groupChatRoomsEmployer', (data) => {
      const rooms = data?.groupChatRooms || []
      rooms.forEach((item: ChatRoom) => dispatch(updateOneFleetChat(item)))
      setFleetList(rooms)
    })
  }

  const updateChatCount = async (data: any) => {
    const userId = await AsyncStorage.getItem('userId')

    shipChatList.forEach((item: ChatRoom) => {
      if (item.id === data.chatRoomId) {
        dispatch(
          updateOneShipChat({
            ...item,
            lastMessage: data.data,
            isUnReadMessage: true,
            unReadMessages:
              data?.participants?.find((p: any) => p.userId === userId)
                ?.unReadMessages ?? 0,
          })
        )
      }
    })

    fleetChatList.forEach((item: ChatRoom) => {
      if (item.id === data.chatRoomId) {
        dispatch(
          updateOneFleetChat({
            ...item,
            lastMessage: data.data,
            isUnReadMessage: true,
            unReadMessages:
              data?.participants?.find((p: any) => p.userId === userId)
                ?.unReadMessages ?? 0,
          })
        )
      }
    })
  }

  useFocusEffect(
    useCallback(() => {
      socketService.on('newMessage', updateChatCount)
      return () => socketService.off('newMessage', updateChatCount)
    }, [dispatch, shipChatList, fleetChatList])
  )

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      fetchChatRooms()

      const timer = setTimeout(() => setLoading(false), 4000)

      return () => {
        socketService.off('groupChatRooms')
        socketService.off('groupChatRoomsEmployer')
        clearTimeout(timer)
      }
    }, [dispatch])
  )

  useEffect(() => {
    const chatList = [...shipList, ...fleetList]
    if (chatList.length > 0) saveChatRooms(chatList)
  }, [shipList, fleetList])

  useEffect(() => {
    viewUserProfile(dispatch)
  }, [])

  const renderChatRow = (room: ChatRoom, index: number) => {
    const hasUnread = room.isUnReadMessage && room.unReadMessages > 0
    const lastMsg = room.lastMessage

    return (
      <TouchableOpacity
        key={index}
        style={styles.chatRow}
        onPress={() =>
          router.push({
            pathname: `/chatroom/[chatRoomId]`,
            params: {
              chatRoomId: room.id,
              chatRoomDetails: JSON.stringify(room),
            },
          })
        }
      >
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
                .slice(0, 35) +
              (lastMsg?.content?.trim().length > 35 ? '...' : '')}
          </Text>
        </View>

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

  const isEmpty =
    !loading && shipChatList.length === 0 && fleetChatList.length === 0

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ChatHeader />

        {loading && (
          <View style={styles.centerContainer}>
            <CommonLoader fullScreen />
          </View>
        )}

        {isEmpty && (
          <View style={styles.centerContainer}>
            <EmptyComponent text={t('nochatroomfound')} />
          </View>
        )}

        {!loading && !isEmpty && (
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
                      <Text style={styles.sectionTitle}>
                        {section.title}
                      </Text>
                      <Text style={styles.sectionDescription}>
                        {section.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chatRowContainer}>
                    {section.rooms.map(renderChatRow)}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ededed' },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  centerContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatListContainer: {
    marginTop: 70,
  },

  sectionContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'rgba(232, 232, 232, 1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
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
    fontFamily: 'WhyteInktrap-Bold',
    color: 'black',
  },

  sectionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6f8406',
  },

  chatRowContainer: {
    backgroundColor: '#fff',
  },

  chatRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderColor: '#e0e0e0',
  },

  chatMiddle: { flex: 1 },

  groupName: {
    fontSize: 16,
    fontFamily: 'WhyteInktrap-Bold',
    color: '#052B19',
  },

  groupNameUnread: { color: '#052B19' },

  lastMessage: {
    fontSize: 13,
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
