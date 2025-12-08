import React from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

interface TopEmployee {
  id: string,
  fullName: string,
  profileUrl: string,
  rewardPoints: string
}

const TopThreeEmployees = ({ topEmployee }: { topEmployee: TopEmployee[] }) => {
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30 }}>
      {topEmployee.length > 0 && (
        <FlatList
          data={topEmployee.slice(0, 3)}
          horizontal
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.topEmployeeView} onPress={() => {
              router.push({
                pathname: '/crewProfile',
                params: {
                  crewId: item.id
                }
              })
            }}>
              <Image source={item.profileUrl} style={styles.topEmployeeImage} />
              <Text style={styles.topEmployeeName}>{item.rewardPoints} {t('miles')}</Text>
              <Text style={styles.topEmployeeName}>{item?.fullName?.split(" ")[0] || ""}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.rightArrow}>
        <ArrowRight size={24} />
      </View>
    </View>
  )
}

export default TopThreeEmployees;

const styles = StyleSheet.create({
  topEmployeeView: { flexDirection: 'column', marginRight: 20, justifyContent: 'center', alignItems: 'center' },
  topEmployeeImage: { height: 65, width: 65, borderRadius: 50, marginBottom: 10 },
  topEmployeeName: { textAlign: 'center', fontFamily: 'Poppins-Regular', fontSize: 10 },
  rightArrow: { marginBottom: 37 }
});
