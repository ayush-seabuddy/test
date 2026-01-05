import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SurveyScreen = () => {
  return (
    <View style={styles.main}>
      <Text>SurveyScreen</Text>
    </View>
  )
}

export default SurveyScreen

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff'
  }
})