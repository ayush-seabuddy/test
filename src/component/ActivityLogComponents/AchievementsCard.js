import React from 'react'
import { Image, Text, View } from 'react-native'
import { ImagesAssets } from '../../assets/ImagesAssets'

const AchievementsCard = () => {
  return (
    <View style={{ flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:
   "rgba(180, 180, 180, 0.4)", width:"100%" ,padding:8,borderRadius:8}}>
      <View style={{borderRadius:16,flexDirection:"row",alignItems:"center",gap:7}}>
      

       
      
       <View>
       <Text style={{fontSize:10,color:"rgba(22, 22, 22, 1)",fontFamily:"Poppins-Regular",fontWeight:"500",lineHeight:14}}>
        Gymnastic
        </Text>
        <Text style={{fontSize:12,color:"rgba(22, 22, 22, 1)",fontFamily:"Poppins-Medium",fontWeight:"500",lineHeight:18}}>
        Gymnastic
        </Text>
        <Text style={{fontSize:10,color:"#636363",fontFamily:"Poppins-Regular",fontWeight:"400",lineHeight:12,}}>
        Tuesday, October 11, 2024 08:00 AM
        </Text>
       </View>
      </View>
     
       <View style={{alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255, 255, 255, 0.4)",borderRadius:16,paddingHorizontal:16,paddingVertical:6,}}>
       <Text style={{fontSize:14,color:"#06361F",fontFamily:"Poppins-Medium",fontWeight:"600",lineHeight:18}}>
       34500
        </Text>
        <Text style={{fontSize:10,color:"#B7B7B7",fontFamily:"Poppins-Regular",fontWeight:"400",lineHeight:12,textAlign:"center"}}>
        Miles
        </Text>
       </View>
    </View>
  )
}

export default AchievementsCard
