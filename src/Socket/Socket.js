import { io } from "socket.io-client";
import { SocketApiUri } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = SocketApiUri;

class WSService {
  socket = null;

  initilizeSocket = async () => {
    
    try {
      console.log(this?.socket?.id, "dsfdslj");

      // const userDetails = await AsyncStorage.getItem("userDetails");
      // const userId = userDetails ? JSON?.parse(userDetails)?.id : "";
      // console.log('userId: ', userId);

      if (this?.socket?.id) {
        return
      }
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        // auth: {
        //   userId: userId, // Send userId in the auth object
        // },
      });

      this.socket?.on("connect", (data) => {
        console.log("Connected with socket ID:", this?.socket?.id);
      });
      this.socket?.on("disconnect", (data) => {
      });
      this.socket?.on("error", (data) => {
      });
    } catch (error) {
      console.log(error);
    }
  };

  isConnected = () => {
    if(this.socket) console.log("this.socket.id: ", this.socket.id);
    return this.socket && this.socket.id;
  };

  async emit(event, data = {}) {
    try {
      if (this.socket) {
        this.socket.emit(event, data);
      } else {
        console.error("Failed to emit, socket not connected:", event);
      }
    } catch (error) {
      console.error("Error emitting event:", event, error);
    }
  }

  on(event, cb) {
    if (this.socket) {
      console.log("Registering listener for event:", event);
      this.socket.on(event, cb);
    } else {
      console.error("Cannot register listener, socket not initialized:", event);
    }
  }

  off(event, cb) {
    if (this.socket) {
      console.log("Removing listener for event:", event);
      this.socket.off(event, cb);
    }
  }

  removeListener(listenerName) {
    if (this.socket) {
      console.log("Removing listener:", listenerName);
      this.socket.removeListener(listenerName);
    }
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketService = new WSService();

export default socketService;