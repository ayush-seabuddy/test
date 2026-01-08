import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { ImagesAssets } from '../utils/ImageAssets';

type EmptyComponentProps = {
    text: string;
};

const EmptyComponent: React.FC<EmptyComponentProps> = ({ text }) => {
    return (
        <View style={styles.container}>
            <Image
                source={ImagesAssets.nodatafound}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

export default EmptyComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    text: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#8A8A8A',
        textAlign: 'center',
    },
});
