import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import ChatRoomHeader from '../component/headers/ChatRoomHeader';
import Colors from '../colors/Colors';
import { ImagesAssets } from '../assets/ImagesAssets';
import FocusAwareStatusBar from '../statusbar/FocusAwareStatusBar';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import AiChatHeader from '../component/headers/AiChatHeader';
const AiChat = ({ navigation }) => {

  AvoidSoftInput.setAdjustResize(true)
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <AiChatHeader navigation={navigation} />

    
        <ScrollView contentContainerStyle={styles.chatContainer}>
          {/* Received message */}
          <View>
            <View style={[styles.messageContainer, styles.receivedMessage]}>
              <Text style={{ color: 'black' }}>Hey, Sup?</Text>
            </View>
            <Text style={{ fontSize: 10 }}>Today, 2:01pm</Text>
          </View>

          <View>
            <View style={[styles.messageContainer, styles.receivedMessage]}>
              <Text style={{ color: 'black' }}>Hey, Sup?</Text>
            </View>
            <Text style={{ fontSize: 10 }}>Today, 2:01pm</Text>
          </View>
          <View>
            <View style={[styles.messageContainer, styles.receivedMessage]}>
              <Text style={{ color: 'black' }}>Hey, Sup?</Text>
            </View>
            <Text style={{ fontSize: 10 }}>Today, 2:01pm</Text>
          </View>
          <View>
            <View style={[styles.messageContainer, styles.receivedMessage]}>
              <Text style={{ color: 'black' }}>Hey, Sup?</Text>
            </View>
            <Text style={{ fontSize: 10 }}>Today, 2:01pm</Text>
          </View>
          <View>
            <View style={[styles.messageContainer, styles.receivedMessage]}>
              <Text style={{ color: 'black' }}>Hey, Sup?</Text>
            </View>
            <Text style={{ fontSize: 10 }}>Today, 2:01pm</Text>
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

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputInnerContainer}>
            <TouchableOpacity>
              <Image style={styles.icon} source={ImagesAssets.emojibtnimg} resizeMode='cover' />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image style={styles.icon} source={ImagesAssets.attechment} resizeMode='cover' />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder='Type something..'
              placeholderTextColor="gray"
            />
          </View>
          <TouchableOpacity style={styles.microphoneButton}>
            <Image style={styles.microphoneIcon} source={ImagesAssets.microphone} resizeMode='cover' />
          </TouchableOpacity>
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
    flexGrow: 1,
    padding: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(230, 230, 230, 0.5)',
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    height:55
  },
  inputInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    color: 'black',
  },
  microphoneButton: {
    backgroundColor: '#84A402',
    padding: 8,
    borderRadius: 50,
    marginLeft: 10,
  },
  microphoneIcon: {
    width: 22,
    height: 22,
  },
});

export default AiChat;
