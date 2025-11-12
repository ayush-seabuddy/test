
import { getAllSocialPost } from '@/app/apis/apiService'
import Colors from '@/src/utils/Colors'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const HomeTab = () => {

  useEffect(() => {
   let getData = async () => {
      let postData = await getAllSocialPost({page:6 , limit:1})
    }
    getData()
    
  }, [])
  return (
    <View style={{flex:1 , justifyContent:"center", alignItems:"center" , backgroundColor:Colors.white}}>
        <Text>socialpost</Text>
        
    </View>
  )
}

export default HomeTab

const styles = StyleSheet.create({})