import Colors from '@/src/utils/Colors';
import { t } from 'i18next';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const tabs = ['about', 'posts', 'buddyuponprofile', 'assessments'] as const;
type TabKey = (typeof tabs)[number];

interface ProfileTabsProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsWrapper}>
        {tabs.map((tabKey) => {
          const isActive = activeTab === tabKey;

          return (
            <TouchableOpacity
              key={tabKey}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tabKey)}
              style={styles.tab}>
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.activeTabText,
                ]}
                numberOfLines={1}
              >
                {t(tabKey)}
              </Text>

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ProfileTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  tabsWrapper: {
    flexDirection: 'row',
    padding: 10,
  },

  tab: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#8a8a8a',
  },

  activeTabText: {
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },

  activeIndicator: {
    height: 2,
    width: '80%',
    borderRadius: 2,
    backgroundColor: Colors.lightGreen || '#000',
  },
});
