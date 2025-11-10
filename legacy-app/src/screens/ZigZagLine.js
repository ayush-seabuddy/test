import React, { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { height, width } = Dimensions.get("screen");
// Function to create a Catmull-Rom spline (smooth interpolation between points)
const createSmoothPath = (data, width, height) => {
  const points = data.map((y, i) => [
    (i * width) / (data.length - 1),
    height - y,
  ]);

  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    d += ` Q ${x1},${y1} ${midX},${midY}`;
  }

  d += ` T ${points[points.length - 1][0]},${points[points.length - 1][1]}`;
  return d;
};

const GlowingSmoothLines = ({
  data1,
  // data2,
  width,
  height,
  lineColor1,
  // lineColor2,
  strokeWidth,
}) => {
  const path1 = createSmoothPath(data1, width, height);
  // const path2 = createSmoothPath(data2, width, height);

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        {/* Line 1 - Outer Glow */}
        <Path
          d={path1}
          fill="none"
          stroke="limegreen"
          strokeWidth={strokeWidth + 12}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
        {/* Line 1 - Inner Glow */}
        <Path
          d={path1}
          fill="none"
          stroke="limegreen"
          strokeWidth={strokeWidth + 2}
          strokeOpacity={0.5}
          strokeLinecap="round"
        />
        {/* Line 1 - Main Line */}
        <Path
          d={path1}
          fill="none"
          stroke={lineColor1}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Line 2 - Outer Glow */}
        {/* <Path
          d={path2}
          fill="none"
          stroke="lightblue"
          strokeWidth={strokeWidth + 12}
          strokeOpacity={0.2}
          strokeLinecap="round"
        /> */}
        {/* Line 2 - Inner Glow */}
        {/* <Path
          d={path2}
          fill="none"
          stroke="lightblue"
          strokeWidth={strokeWidth + 6}
          strokeOpacity={0.5}
          strokeLinecap="round"
        /> */}
        {/* Line 2 - Main Line */}
        {/* <Path
          d={path2}
          fill="none"
          stroke={lineColor2}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        /> */}
      </Svg>
    </View>
  );
};

export default function ZigZagLine({ stressLevelGraph }) {
  const [stressLevel, setStressLevel] = useState([0, 0, 0, 0, 0]);

  const transformData = (stressLevelGraph) => {
    if (!stressLevelGraph || stressLevelGraph.length === 0) {
      return [0, 0, 0, 0, 0]; // Keep default if no data
    }

    const data = stressLevelGraph.map((item) => item.TMD);
    return [0, ...data]; // Ensure 0 is always at the start
  };

  // Update state when stressLevelGraph changes
  useEffect(() => {
    const transformedData = transformData(stressLevelGraph);
    setStressLevel(transformedData);
  }, [stressLevelGraph]);

  // const data1 = [0, 29, 27, 0, 60];
  const data2 = [20, 30, 50, 20, 50, 20, 30, 10, 20, 50, 20];

  return (
    <SafeAreaView style={styles.container}>
      <GlowingSmoothLines
        data1={stressLevel}
        // data2={data2}
        // width={350}
        // height={200}
        width={width * 0.4}
        height={width * 0.15}
        // lineColor1="border: 7.41px solid;border-image-source: linear-gradient(263.54deg, rgba(255, 255, 255, 0.0651) -2.48%, rgba(176, 219, 2, 0.21) 36.53%, rgba(176, 219, 2, 0.21) 76.16%, rgba(255, 255, 255, 0) 99.89%);" // Line 1 color
        lineColor1="#B0DB02" // Line 1 color
        // lineColor2="#4F6301" // Line 2 color
        strokeWidth={1} // Line thickness
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: '#000',
  },
});
