import AsyncStorage from '@react-native-async-storage/async-storage';
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import moment from 'moment-timezone';
import { Text } from 'react-native';
import ReactTimeAgo from 'react-time-ago';
import { viewProfile } from '../apis/apiService';
import { updateFleetList, updateShipList } from '../redux/chatListSlice';
import { setUserDetails } from '../redux/userDetailsSlice';
import socketService from './socketService';

TimeAgo.addDefaultLocale(en);

export const formatShipName: (name: string) => string = (name) => {
  if (!name) return "";
  const words = name.split(" ");
  const formattedWords = words.map((word, index) => {
    const romanNumeralRegex = /^(I{1,3}|IV|VI{0,3}|IX|X{1,3}|XL|L|XC|C{1,3}|CD|D|CM|M{1,3})$/i;
    if (romanNumeralRegex.test(word)) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return formattedWords.join(" ");
};


export const formatHobbies = (input: string[]) => {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    return 'N/A';
  }

  const normalize = (text: string) =>
    text
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());

  if (Array.isArray(input)) {
    return input.map(normalize).join(', ');
  }

  if (typeof input === 'string') {
    return normalize(input);
  }

  return 'N/A';
};



interface CreateTimeProps {
  createdTime: string;
  locale?: string;
}

export const CreateTime: React.FC<CreateTimeProps> = ({ createdTime, locale = "en" }) => {
  const Time: React.FC<{
    date: Date;
    verboseDate?: boolean;
    tooltip?: boolean;
    children?: React.ReactNode;
  }> = ({ children, ...rest }) => {
    return <Text {...rest}>{children}</Text>;
  };

  return (
    <ReactTimeAgo
      date={new Date(Number(createdTime))}
      locale={locale}
      component={Time}
      timeStyle="short"
    />
  );
};



export const isVideo = (uri: string) => uri?.match(/\.(mp4|mov|avi)$/i);

export const getUserDetails = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("userDetails");
    if (!jsonValue) return null;
    return JSON.parse(jsonValue);
  } catch (error) {
    console.error("Error reading userDetails:", error);
    return null;
  }
};

export const formatChatTime = (timestamp: string) => {
  const messageDate = moment(timestamp);
  const today = moment().startOf("day");
  const yesterday = moment().subtract(1, "days").startOf("day");

  if (messageDate.isSame(today, "day")) {
    return messageDate.format("hh:mm A");
  } else if (messageDate.isSame(yesterday, "day")) {
    return "Yesterday";
  } else {
    return messageDate.format("DD/MM/YY");
  }
};

export const getChatList = async (dispatch: any) => {
  let storeUserId = await AsyncStorage.getItem('userId');
  let storeShipId = await AsyncStorage.getItem('shipId');
  let storeEmployerId = await AsyncStorage.getItem('employerId');

  const payloadShip = { userId: storeUserId, shipId: storeShipId };
  console.log("payloadShip: ", payloadShip);
  socketService.emit("getAllGroupChatRooms", payloadShip);

  const payloadFleet = { userId: storeUserId, employerId: storeEmployerId };
  console.log("payloadFleet: ", payloadFleet);
  socketService.emit("getAllGroupChatRooms", payloadFleet);

  socketService.on("groupChatRooms", (data) => {
    dispatch(updateShipList(data));
  });

  socketService.on("groupChatRoomsEmployer", (data) => {
    dispatch(updateFleetList(data));
  });
};

export  const formatDateSeparator = (date: Date|string) => {
    const messageDate = moment(date).local().startOf("day");
    const today = moment().local().startOf("day");
    const yesterday = moment().local().subtract(1, "days").startOf("day");

    if (messageDate.isSame(today, "day")) {
      return "Today";
    } else if (messageDate.isSame(yesterday, "day")) {
      return "Yesterday";
    } else {
      return messageDate.format("DD/MM/YYYY");
    }
  };



export const viewUserProfile = async (dispatch: any) => {
  let userDetailsString = await AsyncStorage.getItem("userDetails");
  if (!userDetailsString) return
  const userDetails = JSON.parse(userDetailsString) as Record<string, any>;



  const userProfileDetails = await viewProfile()

  const updateUserDetails = async () => {
    if (!userProfileDetails || !userProfileDetails.data) return

    const updatedUserDetails = {
      ...userDetails,...userProfileDetails.data
    };

    if (userProfileDetails.data?.shipId) {
      await AsyncStorage.setItem("shipId", userProfileDetails.data?.shipId);
    } else {
      await AsyncStorage.removeItem("shipId");
    }
    await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));
    dispatch(setUserDetails(updatedUserDetails));
  }


   setImmediate(() => {
      updateUserDetails()
    });

    return userProfileDetails
}