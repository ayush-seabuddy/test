import { StyleSheet, Text, View, Pressable } from 'react-native';
import React from 'react';
import Colors from '@/src/utils/Colors';
import * as Progress from 'react-native-progress';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';

const PersonalityMapTestScreen = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <View style={styles.main}>
      <View style={styles.outerView}>
        <View style={styles.innerView}>
          <Text style={styles.personalitymaptext}>{t('personalitymap')}</Text>
          <View style={styles.skipView}>
            <Text style={styles.skip}>{t('skip')}</Text>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </View>
        </View>

        <Text style={styles.personalitymapdesc}>{t('personalitymapdesc')}</Text>

        <Progress.Bar
          progress={0.6}
          color={"rgba(132, 164, 2, 1)"}
          height={7}
          unfilledColor={Colors.iconColor}
          borderWidth={0}
          width={null}
          style={styles.progressbar}
        />

        <Text style={styles.progresspercentage}>80%</Text>
        <Text style={styles.mandatoryText}>{t('mandatorydesc')}</Text>
      </View>

      <View style={styles.testView}>
        <View style={styles.centerline} />
        <Text style={styles.totalquestions}>3/5</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            Love To Read Challenging Material
          </Text>

          {/* Radio Buttons */}
          <View style={styles.radioRow}>
            {[0, 1, 2, 3, 4].map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.radioOuter,
                  selected === item && styles.radioOuterActive,
                ]}
                onPress={() => setSelected(item)}
              >
                {selected === item && <View style={styles.radioInner} />}
              </Pressable>
            ))}
          </View>

          {/* Labels under first & last */}
          <View style={styles.radioLabelRow}>
            <Text style={styles.radioLabelText}>Disaggree</Text>
            <Text style={styles.radioLabelText}>Agree</Text>
          </View>
        </View>

      </View>
    </View>
  );
};

export default PersonalityMapTestScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.captainanimatedlayoutbg,
  },
  outerView: {
    margin: 16,
    gap: 10,
  },
  innerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personalitymaptext: {
    fontSize: 20,
    lineHeight: 22,
    color: "#161616",
    fontFamily: "WhyteInktrap-Bold",
  },
  personalitymapdesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'black',
  },
  skip: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  skipView: {
    flexDirection: 'row',
    gap: 5,
  },
  progressbar: {
    marginTop: 10,
  },
  progresspercentage: {
    marginTop: 5,
    textAlign: 'right',
    color: "#161616",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  mandatoryText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#808080",
  },
  testView: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    height: 500,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  centerline: {
    height: 3,
    width: '28%',
    backgroundColor: '#FFFFFF66',
    alignSelf: 'center',
    marginTop: 5,
    borderRadius: 10,
  },
  totalquestions: {
    textAlign: 'right',
    color: '#fff',
    fontSize: 14,
    marginRight: 20,
    marginTop: 16,
    fontFamily: 'WhyteInktrap-Medium',
  },
  questionContainer: {
    margin: 16,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 24,
  },
  questionText: {
    lineHeight: 19,
    fontSize: 16,
    textAlign: "left",
    color: "#fff",
    fontFamily: "WhyteInktrap-Bold",
    textTransform: "capitalize",
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: "space-between",
    marginVertical: 10,
    // marginHorizontal:10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#888",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: {
    borderColor: "#84A402",
  },
  radioInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#84A402",
  },
  radioLabelRow: {
    flexDirection: 'row',
    justifyContent: "space-between",
  },
  radioLabelText: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
});
