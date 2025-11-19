import { Stack } from "expo-router";

export default function ChatsLayout() {
  return <Stack screenOptions={{ headerShown: false }} >
    <Stack.Screen name="index" options={{}} />
    <Stack.Screen name="chatroom" options={{}} />
    <Stack.Screen name="home" options={{}} />
  </Stack>;
}