import React from 'react'
import { Text, View } from 'react-native'
import AchievementsCard from './AchievementsCard'

const Completed = () => {
  return (
    <View style={{paddingHorizontal:10,}}>
    {[...new Array(5)].map((_,index)=>{
        return(
            <View key={index} style={{marginTop:8}}>
                <AchievementsCard />
            </View>
        )
    })}
    </View>
  )
}

export default Completed
