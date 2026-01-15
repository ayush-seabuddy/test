import { RootState } from '@/src/redux/store';
import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<
  string,
  { focused: any; unfocused: any }
> = {
  '(community)': {
    focused: ImagesAssets.selectedHome,
    unfocused: ImagesAssets.unselectedHome,
  },
  health: {
    focused: ImagesAssets.selectedHealth,
    unfocused: ImagesAssets.unselectedHealth,
  },
  helpline: {
    focused: ImagesAssets.selectedHelpline,
    unfocused: ImagesAssets.unselectedHelpline,
  },
  shiplife: {
    focused: ImagesAssets.selectedShiplife,
    unfocused: ImagesAssets.unselectedShiplife,
  },
};

const BottomTabbarLayout = () => {
  const userDetails = useSelector(
    (state: RootState) => state.userDetails
  );

  const insets = useSafeAreaInsets();

  /**
   * Bottom spacing logic:
   * - Gesture navigation → insets.bottom = 0–8
   * - Button navigation → insets.bottom = 24–48
   */
  const bottomSpacing =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 20)
      : insets.bottom;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.bottomNavbar,
          {
            marginBottom: bottomSpacing,
          },
        ],
        tabBarIcon: ({ focused }) => {
          const isProfile = route.name === 'profile';

          const iconSource = isProfile
            ? userDetails.profileUrl ?? ImagesAssets.userIcon
            : TAB_ICONS[route.name]?.[
            focused ? 'focused' : 'unfocused'
            ];

          return (
            <View
              style={[
                styles.iconContainer,
                focused
                  ? styles.iconFocusedBackground
                  : styles.iconDefaultBackground,
              ]}
            >
              <Image
                source={iconSource}
                cachePolicy="memory-disk"
                style={[
                  styles.tabIcon,
                  {
                    resizeMode: isProfile ? 'cover' : 'contain',
                  },
                  isProfile
                    ? focused && {
                      borderColor: Colors.lightGreen,
                      borderWidth: 0.5,
                    }
                    : {
                      tintColor: focused
                        ? Colors.lightGreen
                        : 'white',
                    },
                ]}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="(community)" />
      <Tabs.Screen name="health" />
      <Tabs.Screen name="helpline" />
      <Tabs.Screen name="shiplife" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default BottomTabbarLayout;

const styles = StyleSheet.create({
  bottomNavbar: {
    position: 'absolute',
    height: 55,
    borderRadius: 25,
    backgroundColor: 'rgba(84, 97, 94, 1)',
    marginHorizontal: 10,
    paddingTop: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    height: 65,
    width: 65,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 27,
    height: 27,
    borderRadius: 50,
  },
  iconDefaultBackground: {
    backgroundColor: 'transparent',
  },
  iconFocusedBackground: {
    backgroundColor: '#262626',
    borderWidth: 4,
    borderColor: 'rgba(54, 75, 56, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 0,
  },
});
