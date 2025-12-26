
import { useLoadShipChatRooms } from "@/src/hooks/useChatRooms";
import ChatLoungeList from "@/src/screens/chat";


export default function Index() {
 useLoadShipChatRooms();
  return <ChatLoungeList />;
}