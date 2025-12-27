import Colors from "@/src/utils/Colors";
import { router, Tabs, usePathname } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function CommunityLayout() {
  const unreadCount = 5;
  const pathname = usePathname();
  const routes = ["/social", "/chats"] as const;
  


  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>


      <View
        style={{
          flexDirection: "row",
          alignSelf: "center",
          width: 200,
          backgroundColor: "#364B3866",
          borderRadius: 25,
          marginTop: 70,
          padding: 5,
          position: "absolute",
          top: 0,
          zIndex: 1,
        }}
      >
        {['social', 'chat'].map((name, index) => {
          const isFocused =
          () => {
            if(name === 'social' && pathname === '/') {
              return true;
            }
            return pathname.includes(name);
          };
          return (
            <TouchableOpacity
              key={name}
              onPress={() => router.push(routes[index])}
              style={{
                flex: 1,
                height: 35,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isFocused()
                  ? Colors.lightGreen
                  : "transparent",
                position: "relative",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "500",
                  fontSize: 13,
                }}
              >
                {name === "social" ? "Hangout" : "Chats"}
              </Text>


            </TouchableOpacity>
          );
        })}
        {unreadCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -5,
              right: 0,
              backgroundColor: Colors.lightGreen,
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 4,
              borderWidth: 0.5,
              borderColor: "#fff",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              {unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* ✅ Tabs below header */}
      <Tabs
        initialRouteName="social"
        backBehavior="history"
        screenOptions={{
          tabBarPosition: "top",
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}

      >
        <Tabs.Screen
          name="social"
          options={{ title: "Hangout" }}
        />
        <Tabs.Screen
          name="chats"
          options={{ title: "Chats" }}
        />
      </Tabs>
    </View>
  );
}
