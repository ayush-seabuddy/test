// HomeTab.tsx
import { getAllSocialPost } from '@/app/apis/apiService';
import Colors from '@/src/utils/Colors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';



const HomeTab = () => {

  const [postData , setPostData] = useState([])



useEffect(() => {
 async function getData() {
  let data  = await getAllSocialPost({limit:3 , page :2})
  console.log("data: ", JSON.stringify(data?.data?.result?.hangoutsList[0]));
  if(data?.data?.result){
    setPostData(data?.data?.result?.hangoutsList)
  }
}
  getData()
},[])
  // const renderItem = ({ item , index }: { item: any , index : number}) => (
  //   <PostCard item={item} index={index}
  //   />
  // );

  return (
    <View style={styles.container}>
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
