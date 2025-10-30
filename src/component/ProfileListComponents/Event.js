import React from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { ImagesAssets } from '../../assets/ImagesAssets';

const {height, width } = Dimensions.get('screen');

// CardComponent for individual event cards
const CardComponent = ({ title, subtitle, time, onSignInPress }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreIconContainer}>
        {/* <MaterialIcons name="more-vert" size={24} color="gray" /> */}
        <Image source={ImagesAssets.dots} style={styles.headerIconRight} />
      </TouchableOpacity>
    </View>
  );
};

// Events screen containing the list of event cards
const Events = () => {
  const data = [
    {
      id: '1',
      title: 'Workout Buddies',
      subtitle: 'Daily Group Activity',
      time: 'Today 17:45pm',
    },
    {
      id: '2',
      title: 'Yoga with Friends',
      subtitle: 'Evening Relaxation',
      time: 'Today 18:30pm',
    },
    {
      id: '3',
      title: 'Yoga with Friends',
      subtitle: 'Evening Relaxation',
      time: 'Today 18:30pm',
    },
    {
      id: '4',
      title: 'Yoga with Friends',
      subtitle: 'Evening Relaxation',
      time: 'Today 18:30pm',
    },
    {
      id: '5',
      title: 'Yoga with Friends',
      subtitle: 'Evening Relaxation',
      time: 'Today 18:30pm',
    },
  ];

  // Handle sign-in button press
  const handleSignIn = (id) => {
    alert(`Sign In button clicked for item ${id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardComponent
            title={item.title}
            subtitle={item.subtitle}
            time={item.time}
            onSignInPress={() => handleSignIn(item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  cardContainer: {
    backgroundColor: '#B4B4B4',
    borderRadius: 10,
    marginBottom: 15,
    height:height *0.15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  time: {
    fontSize: 14,
    color: '#333',
  },
  signInButton: {
    marginTop: 10,
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moreIconContainer: {
    backgroundColor: '#c4c2c2',
    padding: 5,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  headerIconRight: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default Events;
