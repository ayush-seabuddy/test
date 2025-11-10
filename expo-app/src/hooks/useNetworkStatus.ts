import NetInfo from "@react-native-community/netinfo";

let isConnected = true;

NetInfo.addEventListener(state => {
  isConnected = state.isConnected ?? false;
});

export const checkNetwork = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

export const getNetworkStatus = () => isConnected;
