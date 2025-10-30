import React from 'react'
import { Text, View } from 'react-native'
import AchievementsCard from './AchievementsCard'

const Achievements = () => {
  return (
    <View style={{paddingHorizontal:10,}}>
    {[...new Array(1)].map((_,index)=>{
        return(
            <View key={index} style={{marginTop:8}}>
                <AchievementsCard />
            </View>
        )
    })}
    </View>
  )
}

export default Achievements
