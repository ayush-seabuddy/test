// ShipLifeScreen.tsx
import { getalladminbuddyupevents, getleaderboard } from '@/src/apis/apiService'
import GlobalPopOver from '@/src/components/GlobalPopover'
import { showToast } from '@/src/components/GlobalToast'
import BuddyUpEvents from '@/src/components/ShipLifeComponent/BuddyUpEvents'
import TopThreeEmployees from '@/src/components/ShipLifeComponent/TopThreeEmployees'
import ShipLifeScreenHeader from '@/src/components/ShipLifeScreenHeader'
import HowMilesWorkPopup from '@/src/components/ShipLifeComponent/HowMilesWorkPopup'
import Colors from '@/src/utils/Colors'
import { Filter, InfoIcon, ListFilter, SlidersHorizontal } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Popover from 'react-native-popover-view'
import { Placement } from 'react-native-popover-view/dist/Types'
import BuddyUpEventCard from '@/src/components/ShipLifeComponent/BuddyUpEventCard'

interface BuddyUpEvent {
  id: string;
  categoryName: string;
  categoryImage: string;
}

interface TopEmployee {
  id: string,
  fullName: string,
  profileUrl: string,
  rewardPoints: string
}

const ShipLifeScreen = () => {
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);
  const [buddyupEvent, setbuddyupEvent] = useState<BuddyUpEvent[]>([]);
  const [topEmployee, settopEmployee] = useState<TopEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      const [buddyRes, topRes] = await Promise.all([
        getalladminbuddyupevents({ isAdmin: true }),
        getleaderboard({ isZero: false })
      ]);

      if (buddyRes.success && buddyRes.status === 200) {
        setbuddyupEvent(buddyRes.data.groupActivityCategoriesList ?? []);
      } else showToast.error(t('oops'), buddyRes.message);

      if (topRes.success && topRes.status === 200) {
        settopEmployee(topRes.data.allUsers?.usersList ?? []);
      } else showToast.error(t('oops'), topRes.message);

    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <View style={styles.main}>
      <ShipLifeScreenHeader />

      {isLoading ? (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={Colors.lightGreen} />
        </View>
      ) : (
        <View style={styles.outerView}>
          {/* Title & Info Popover */}
            {/* <View style={styles.titleView}>
            <Text style={styles.buddyuptext}>{t('buddyup')}</Text>

            <GlobalPopOver
              showOkButton
              buttonText={t('close')}
              buttonStyle={styles.okBtnStyle}
              popOverContent={<HowMilesWorkPopup />}>
              <InfoIcon size={20} />
            </GlobalPopOver>
          </View>

          <Text style={styles.buddyupdescription}>{t('buddyup_description')}</Text>

          <BuddyUpEvents buddyupEvent={buddyupEvent} />
          <TopThreeEmployees topEmployee={topEmployee} />

          <TouchableOpacity style={styles.createyourbuddyupButton}>
            <Text style={styles.createyourbuddyupText}>
              {t('createyourbuddyup')}
            </Text>
          </TouchableOpacity>
          <Popover
            isVisible={showPopover}
            placement={Placement.RIGHT}
            onRequestClose={() => setShowPopover(false)}
            from={
              <TouchableOpacity
                style={styles.filterView}
                onPress={() => setShowPopover(true)}
              >
                <Text style={styles.filterText}>Filter</Text>
                <SlidersHorizontal size={16} />
              </TouchableOpacity>
            }
          >
            <View style={styles.popup}>
              <TouchableOpacity style={styles.option} onPress={() => console.log("Ongoing")}>
                <Text style={styles.optionText}>Ongoing</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={() => console.log("Past")}>
                <Text style={styles.optionText}>Past</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={() => console.log("Requested")}>
                <Text style={styles.optionText}>Requested</Text>
              </TouchableOpacity>
            </View>
          </Popover> */}
          <BuddyUpEventCard />
        </View>
      )}
    </View>
  );
};

export default ShipLifeScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },
  outerView: { paddingHorizontal: 20, paddingVertical: 10 },

  titleView: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buddyuptext: { fontSize: 25, fontWeight: "600", color: 'grey', fontFamily: "Poppins-SemiBold" },
  buddyupdescription: { fontFamily: 'Poppins-Regular', fontSize: 13, color: 'grey' },

  okBtnStyle: { backgroundColor: Colors.lightGreen },

  createyourbuddyupButton: {
    backgroundColor: "#666161",
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  createyourbuddyupText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },

  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
    gap: 6,
    justifyContent: 'flex-end',
  },
  filterText: { fontSize: 16, fontFamily: 'Poppins-Regular', marginTop: 3 },

  popup: { paddingVertical: 10 },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  optionText: { fontSize: 13, fontFamily: 'Poppins-Regular' }
});
