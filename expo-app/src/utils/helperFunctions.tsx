import { Text } from 'react-native';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import zh from "javascript-time-ago/locale/zh.json";
import AsyncStorage from '@react-native-async-storage/async-storage';

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



export const isVideo = (uri:string) => uri?.match(/\.(mp4|mov|avi)$/i);

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