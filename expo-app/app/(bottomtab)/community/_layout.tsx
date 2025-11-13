import SocialHeader from "@/src/screens/community/SocialHeader";
import Colors from "@/src/utils/Colors";
import { Tabs } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function CommunityLayout() {
  const unreadCount = 5;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* ✅ Custom Header */}
      {/* <Header /> */}
      <SocialHeader />

      {/* ✅ Tabs below header */}
      <Tabs
        initialRouteName="social"
        screenOptions={{
          tabBarPosition: "top",
          headerShown: false, // hide Expo header (we have custom one)
        }}
        tabBar={({ state, descriptors, navigation }) => (
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              width: 200,
              backgroundColor: "#364B3866",
              borderRadius: 25,
              marginTop: 10,
              padding: 5,
              position: "relative",
            }}
          >
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const { options } = descriptors[route.key];

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => navigation.navigate(route.name)}
                  style={{
                    flex: 1,
                    height: 35,
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isFocused
                      ? Colors.lightGreen
                      : "transparent",
                    position: "relative",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {options.title || route.name}
                  </Text>

                  
                </TouchableOpacity>
              );
            })}
             { unreadCount > 0 && (
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
        )}
        
      >
        {/* ✅ Each screen content below the custom header + tabs */}
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
