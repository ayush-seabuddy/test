
import Colors from '@/src/utils/Colors'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
    item: any;
    index: number;
    setHandOut: any;
    refreshPost: any;
    updatePost: any;
    setDisplayedPosts: any;
    locale: any;
}

const PostCard: React.FC<Props> = React.memo(({ item, index, setHandOut, refreshPost, updatePost, setDisplayedPosts, locale }) => {
  return (
    <View style={styles.container}>
        <Text>chat</Text>   
    </View>
  )
})

export default PostCard

const styles = StyleSheet.create({
  container:{
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  }
})