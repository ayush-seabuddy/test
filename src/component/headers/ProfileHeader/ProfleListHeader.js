import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileListHeader = ({ activeTab, setActiveTab }) => {
  const tabs = ['About', 'Posts', 'BuddyUp', 'Assessments'];

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveTab(item)}
            style={[styles.tab, activeTab === item && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === item && styles.activeTabText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginHorizontal: 20,
    justifyContent: 'space-between',
  },
  tab: {
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'rgba(176, 219, 2, 1)',
  },
  tabText: {
    fontSize: 13,
    color: 'rgba(183, 183, 183, 1)',
    fontFamily: 'Poppins-Regular',
    lineHeight: 18,
  },
  activeTabText: {
    color: 'rgba(176, 219, 2, 1)',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 18,
  },
});

export default ProfileListHeader;
