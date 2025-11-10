import React from 'react';
import { Dimensions, StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { ImagesAssets } from '../../assets/ImagesAssets';
import { useNavigation } from '@react-navigation/native';

const {height, width } = Dimensions.get('screen');

const TaskCard = ({ title, description, daysLeft }) => {
  const navigation= useNavigation();
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.required}>Required</Text>
          <Text style={styles.daysLeft}>{daysLeft} days left</Text>
        </View>
      <View style={styles.descriptionContainer}>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity style={styles.iconContainer} onPress={()=>{navigation.navigate('AnouncementDetails')}}>
        <Image source={ImagesAssets.NextCircleIcon} style={styles.headerIconRight} />
      </TouchableOpacity>
      </View>
     
    </View>
  );
};

const Task = () => {
  // Sample data for tasks
  const tasks = [
    { id: '1', title: 'Complete Personal Details', description: '100 Points for Completing MBTI Test', daysLeft: 3 },
    // { id: '2', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
    // { id: '3', title: 'Submit Feedback', description: '50 Points for Providing Feedback', daysLeft: 2 },
    // { id: '4', title: 'Submit Feedback', description: '50 Points for Providing Feedback', daysLeft: 2 },
    // { id: '5', title: 'Submit Feedback', description: '50 Points for Providing Feedback', daysLeft: 2 },
    // { id: '6', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
    // { id: '7', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
    // { id: '8', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
    // { id: '9', title: 'Complete Personality Map', description: '100 Points for Completing MBTI Test', daysLeft: 5 },
  ];

  const renderTaskCard = ({ item }) => (
    <TaskCard title={item.title} description={item.description} daysLeft={item.daysLeft} />
  );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={renderTaskCard}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    //paddingBottom: 60,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#B4B4B4',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    width: width * 0.9,
    height:height *0.15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: {
    marginRight: 10,
    flexDirection:'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  required: {
    fontSize: 12,
    color: '#780000',
    fontFamily:'Poppins',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  daysLeft: {
    fontSize: 14,
    color: '#454545',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconRight: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  descriptionContainer:{
    flex: 1,
    flexDirection:'row',
    justifyContent:'space-between',
    marginVertical:5,
    alignItems:'center'
  }
});

export default Task;
