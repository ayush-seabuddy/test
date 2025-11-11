import AuthLayout from '@/src/screens/auth/CaptainAnimatedLayout'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const HomeTab = () => {
  return (
    <View style={{flex:1 , justifyContent:"center", alignItems:"center"}}>
      <AuthLayout >
        <Text style={{color:"red"}}>I am Rishabh2</Text>
        </AuthLayout>
      <Text>HomeTab</Text>
    </View>
  )
}

export default HomeTab

const styles = StyleSheet.create({})