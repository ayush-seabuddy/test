import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import ChatRoomHeader from '../component/headers/ChatRoomHeader';
import Colors from '../colors/Colors';
import { ImagesAssets } from '../assets/ImagesAssets';
import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
const GroupChat = ({ navigation }) => {
  AvoidSoftInput.setAdjustResize(true)
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ChatRoomHeader navigation={navigation} />

    
        <View style={styles.chatContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Received message */}
            <View style={styles.frameParent}>
              <View style={styles.frameWrapper}>
                <View style={styles.frameGroup}>
                  <ImageBackground style={styles.ellipseWrapper} resizeMode="cover" source={ImagesAssets.Chat_image}>
                    <Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.Active_image} />
                  </ImageBackground>
                  <View style={styles.frameContainer}>
                    <View style={styles.frameView}>
                      <View>
                        <View style={styles.groupChildLayout}>
                          <View style={[styles.groupChild, styles.groupChildLayout]} />
                          <Text style={[styles.goodMorningEveryone, styles.today801amTypo]}>Good morning everyone, have a blessed day!</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.today801am, styles.today801amTypo]}>Today, 8:01am</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Sent message */}
            <View>
              <View style={[styles.messageContainer, styles.sentMessage]}>
                <Text style={styles.messageText}>I'm good! How about you?</Text>
              </View>
              <Text style={styles.timeText}>Today, 2:05pm</Text>
            </View>

            <View style={{ marginVertical: 5 }}>
              <View style={[styles.messageContainer, styles.sentMessage]}>
                <Image style={{ width: 80, height: 25 }} source={ImagesAssets.recording} resizeMode='cover' />
                <TouchableOpacity>
                  <Image style={{ width: 25, height: 25 }} source={ImagesAssets.playbtn} resizeMode='cover' />
                </TouchableOpacity>
              </View>
              <Text style={styles.timeText}>Today, 2:05pm</Text>
            </View>
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputInnerContainer}>
              <TouchableOpacity>
                <Image style={styles.icon} source={ImagesAssets.emojibtnimg} resizeMode='cover' />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image style={styles.icon} source={ImagesAssets.attechment} resizeMode='cover' />
              </TouchableOpacity>
              <TextInput style={styles.textInput} placeholder='Type something..' />
            </View>
            <TouchableOpacity style={styles.microphoneButton}>
              <Image style={styles.microphoneIcon} source={ImagesAssets.microphone} resizeMode='cover' />
            </TouchableOpacity>
          </View>
        </View>
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1, // Allow chatContainer to take full height
    padding: 20,
  },
  scrollViewContent: {
    paddingBottom: 80, // Add padding to avoid overlapping with the input
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  receivedMessage: {
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  sentMessage: {
    backgroundColor: '#84A402',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  messageText: {
    color: 'white',
  },
  timeText: {
    fontSize: 10,
    color: 'gray',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    height:55
  },
  inputInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
  },
  microphoneButton: {
    backgroundColor: '#84A402',
    padding: 8,
    borderRadius: 50,
  },
  microphoneIcon: {
    width: 22,
    height: 22,
  },
  groupChildLayout: {
    height: 60,
    width: 259,
  },
  today801amTypo: {
    textAlign: "left",
    fontFamily: "Poppins-Regular",
  },
  frameChild: {
    top: 24,
    left: 24,
    width: 8,
    height: 8,
    zIndex: 0,
    position: "absolute",
  },
  ellipseWrapper: {
    borderRadius: 16,
    width: 36,
    height: 36,
    alignItems: "center",
    flexDirection: "row",
  },
  groupChild: {
    top: 0,
    left: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    position: "absolute",
  },
  goodMorningEveryone: {
    top: 10,
    left: 12,
    fontSize: 14,
    lineHeight: 21,
    color: "#131313",
    width: 247,
    position: "absolute",
  },
  frameView: {
    width: 118,
  },
  today801am: {
    fontSize: 10,
    lineHeight: 14,
    color: "rgba(19, 19, 19, 0.25)",
    alignSelf: "stretch",
  },
  frameContainer: {
    gap: 8,
    flex: 1,
  },
  frameGroup: {
    gap: 8,
    flexDirection: "row",
    alignSelf: "stretch",
  },
  frameWrapper: {
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignSelf: "stretch",
  },
  frameParent: {
    width: "100%",
    flex: 1,
  },
});

export default GroupChat;
