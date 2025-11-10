import CaptainAnimatedLayout from '@/src/screens/auth/CaptainAnimatedLayout'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Login = () => {
    return (
        <SafeAreaView style={styles.main}>
            <CaptainAnimatedLayout>
              <View style={{backgroundColor:'red',height:200}}></View>
            </CaptainAnimatedLayout>

        </SafeAreaView>
    )
}

export default Login

const styles = StyleSheet.create({
    main: {
        flex: 1,
    }
})