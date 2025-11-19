// HomeTab.tsx
import { getAllSocialPost } from '@/src/apis/apiService';
import PostCard from '@/src/screens/community/PostCard';
import SocialHeader from '@/src/screens/community/SocialHeader';
import Colors from '@/src/utils/Colors';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';



const HomeTab = () => {

  const [postData , setPostData] = useState([])



// useEffect(() => {
//  async function getData() {
//   let data  = await getAllSocialPost({limit:6 , page :2})
//   console.log("data: ", data.data?.hangoutsList);
//   // if(data.data?.hangoutsList[0]){
//   //   router.push({
//   //     pathname: '/crewProfile',
//   //     params: { crewId: data.data?.hangoutsList[0].userId },
//   //   });
//   // }
//   if(data?.data){
//     setPostData(data.data?.hangoutsList)
//   }
// }
//   getData()
// },[])
  // const renderItem = ({ item , index }: { item: any , index : number}) => (
  //   <PostCard item={item} index={index}
  //   />
  // );

  return (
    <View style={styles.container}>
       <SocialHeader />
      {/* <FlatList
        data={postData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      /> */}
    </View>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
});
