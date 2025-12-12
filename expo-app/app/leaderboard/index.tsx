import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ActiveSailorsCard from '@/src/components/LeaderboardComponent/ActiveSailorsCard'

const LeaderboardScreen = () => {
    return (
        <View style={styles.main}>
            <ActiveSailorsCard />
        </View>
    )
}

export default LeaderboardScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff'
    }
})