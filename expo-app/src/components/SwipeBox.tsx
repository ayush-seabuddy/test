import { Reply } from "lucide-react-native";
import { ReactNode, useRef } from "react";
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type SwipeBoxProps = {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disableLeft?: boolean;
  disableRight?: boolean;
  width?: ViewStyle["width"];
  swipeThreshold?: number;
};

export default function SwipeBox({
  children,
  onSwipeLeft,
  onSwipeRight,
  disableLeft = false,
  disableRight = false,
  width = "100%",
  swipeThreshold = 50,
}: SwipeBoxProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 5,

      onPanResponderMove: (_e, g: PanResponderGestureState) => {
        let dx = g.dx;

        // APPLY SLOW MOTION (less movement than finger)
        dx *= 0.4; // <--- 0.4 = 40% speed (change to adjust)

        if (disableLeft && dx < 0) dx = 0;
        if (disableRight && dx > 0) dx = 0;

        translateX.setValue(dx);
      },

      onPanResponderRelease: (_e, g: PanResponderGestureState) => {
        const dx = g.dx * 0.4;

        if (dx > swipeThreshold && !disableRight && onSwipeRight) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          onSwipeRight();
          return;
        }

        if (dx < -swipeThreshold && !disableLeft && onSwipeLeft) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          onSwipeLeft();
          return;
        }

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width }]}>
      {/* RIGHT SWIPE ICON */}
      <Animated.View
        style={[
          styles.replyIconWrapper,
          {
            opacity: translateX.interpolate({
              inputRange: [0, 60],
              outputRange: [0, 1],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <Reply size={26} color="#4a8ef7" />
      </Animated.View>

      <Animated.View
        style={[styles.box, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  box: {
    backgroundColor: "#fff",
    width: "100%",
    zIndex: 10,
  },

  replyIconWrapper: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
});
