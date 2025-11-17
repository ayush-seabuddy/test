
import { updateFleetList, updateShipList } from '@/src/redux/chatListSlice'
import { RootState } from '@/src/redux/store'
import Colors from '@/src/utils/Colors'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import socketService from '@/src/utils/socketService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import { t } from 'i18next'
import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

const ChatRoomList = () => {
  const {shipChatList , fleetChatList} = useSelector((state: RootState) => state.chatList)
  console.log("fleetChatList: ", fleetChatList);
  console.log("shipChatList: ", shipChatList);
  const [userId, setUserId] = useState<string|null>('')
  const [shipId, setShipId] = useState<string|null>('')
  const [employerId, setEmployerId] = useState<string|null>('')
  const chatSection = [
    {
      title: t('shiplounge'),
      description: t('shiplounge_description'),
      icon: ImagesAssets.shipIcon,

    },
    {
      title: t('fleetlounge'),
      description: t('fleetlounge_description'),
      icon: ImagesAssets.fleetIcon
    }
  ]
  const dispatch = useDispatch()

  const getChatList = async () => {
    let storeUserId = await AsyncStorage.getItem('userId')
    let storeShipId = await AsyncStorage.getItem('shipId')
    let storeEmployerId = await AsyncStorage.getItem('employerId')
    setUserId(storeUserId)
    setShipId(storeShipId)
    setEmployerId(storeEmployerId)
    const payloadShip = { userId: storeUserId, shipId: storeShipId };
    socketService.emit("getAllGroupChatRooms", payloadShip);
    const payloadFleet = { userId: storeUserId, employerId: storeEmployerId };
    socketService.emit("getAllGroupChatRooms", payloadFleet);
    socketService.on("groupChatRoomsEmployer", (data) => {
      dispatch(updateFleetList(data?.groupChatRooms));
    });
    socketService.on("groupChatRooms", (data) => {
      dispatch(updateShipList(data?.groupChatRooms));
    });
  }

  useEffect(() => {
    getChatList()
  }, [])
  return (
    <ScrollView
      style={styles.container}
      // refreshControl={
      //   <RefreshControl
      //     refreshing={refreshing}
      //     onRefresh={onRefresh}
      //     colors={[Colors.primary]}
      //     tintColor={Colors.primary}
      //     progressViewOffset={Platform.OS === "android" ? 60 : 0}
      //     nativeDriver={true} // Enable native driver for smoother animations
      //   />
      // }
      contentContainerStyle={styles.contentContainer}
    >
      {chatSection.map((item, index) => {
        return <View style={styles.sectionContainer} key={index}>
          <View style={styles.sectionHeader}>
            <Image
              source={item.icon}
              style={[styles.icon]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={styles.textContainer}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <Text style={styles.sectionSubTitle}>{item.description}</Text>
            </View>
          </View>
          {/* {showVesselChat && <MemoizedVesselChat refreshing={refreshing} />} */}
        </View>
      })
      }

    </ScrollView>
  )
}

export default ChatRoomList

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 150,
    marginTop: 70,
    gap: 25,
  },
  sectionContainer: {
    marginHorizontal: 10,
    backgroundColor: "rgba(232, 232, 232, 1)",
    borderRadius: 15,
  },
  sectionHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textContainer: {
    justifyContent: "center",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 24,
    color: "black",
  },
  sectionSubTitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    color: "#6f8406",
  },
  icon: {
    height: 50,
    width: 50,
  },
})