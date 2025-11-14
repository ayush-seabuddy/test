import { Text } from 'react-native';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import zh from "javascript-time-ago/locale/zh.json";

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