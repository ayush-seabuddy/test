import { createTables } from "@/src/database/chatSchema";
import { useLoadShipChatRooms } from "@/src/hooks/useChatRooms";
import ChatLoungeList from "@/src/screens/chat";
import { useEffect } from "react";


export default function Index() {
 useLoadShipChatRooms();
  return <ChatLoungeList />;
}