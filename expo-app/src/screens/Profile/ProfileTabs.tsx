// components/ProfileTabs.tsx
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

// List of tab keys (must match your i18n keys)
const tabs = ['about', 'posts', 'buddyuponprofile', 'assessments'] as const;

// Type for the tab keys
type TabKey = (typeof tabs)[number];

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: 'about' | 'posts' | 'buddyuponprofile' | 'assessments') => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabsWrapper}>
        {tabs.map((tabKey: TabKey) => {
          const translatedTab = tabKey;
          const isActive = activeTab === translatedTab;

          return (
            <TouchableOpacity
              key={tabKey}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(translatedTab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {t(translatedTab) }
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsWrapper: {
    flexDirection: 'row',
    width: width,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  activeTab: {
    // You can add a subtle background here if desired
    // backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  activeIndicator: {
    marginTop: 8,
    height: 3,
    width: '60%',
    backgroundColor: Colors.lightGreen || '#000', // fallback to black if Colors.secondary is undefined
    borderRadius: 2,
  },
});

export default ProfileTabs;