import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import Colors from '@/src/utils/Colors'

interface CrewMember {
    fullName: string
    profileUrl: string
    designation: string
    rewardPoints: string
    rank: number
}

interface OverallCrewRankingCardProps {
    overallCrewList: CrewMember[]
    loading?: boolean
    loadingMore?: boolean
    hasMore?: boolean
    onLoadMore?: () => void
}

const OverallCrewRankingCard: React.FC<OverallCrewRankingCardProps> = ({
    overallCrewList,
    loading = false,
    loadingMore = false,
    hasMore = false,
    onLoadMore,
}) => {
    const { t } = useTranslation()
    const flatListRef = useRef<FlatList>(null)
    const [hasTriggeredLoadMore, setHasTriggeredLoadMore] = useState(false)

    const handleCardPress = (item: CrewMember) => {
        console.log('Crew member pressed:', item)
    }

    const renderItem = ({ item }: { item: CrewMember }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{item.rank}</Text>
            </View>

            <Image
                source={item.profileUrl ? { uri: item.profileUrl } : ImagesAssets.userIcon}
                style={styles.userImage}
                contentFit="cover"
            />

            <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
                <Text style={styles.userDesignation} numberOfLines={1}>{item.designation}</Text>
            </View>

            <View style={styles.milesView}>
                <Text style={styles.rewardText}>{item.rewardPoints}</Text>
                <Text style={styles.milesText}>{t('miles')}</Text>
            </View>
        </TouchableOpacity>
    )

    const handleEndReached = () => {
        console.log('End reached - Loading More:', loadingMore, 'Has More:', hasMore)
        if (!loading && !loadingMore && hasMore && !hasTriggeredLoadMore) {
            setHasTriggeredLoadMore(true)
            if (onLoadMore) {
                onLoadMore()
            }
        }
    }

    const renderFooter = () => {
        if (loadingMore) {
            return (
                <View style={styles.footerLoader}>
                    <ActivityIndicator size="small" color="#06361F" />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            )
        }

        return null
    }

    useEffect(() => {
        if (!loadingMore) {
            setHasTriggeredLoadMore(false)
        }
    }, [loadingMore])

    if (loading && overallCrewList.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06361F" />
                <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
            </View>
        )
    }

    if (overallCrewList.length === 0 && !loading) {
        return (
            <View style={styles.emptyContainer}>
                <Image
                    source={ImagesAssets.EmergencyJollieImage}
                    style={styles.nodatafoundImage}
                    contentFit="contain"
                />
                <Text style={styles.emptyText}>{t('noDataAvailable')}</Text>
            </View>
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={overallCrewList}
            keyExtractor={(item, index) => `crew-${item.fullName}-${item.rank}-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.7}
            ListFooterComponent={renderFooter}
            scrollEnabled={true}
            nestedScrollEnabled={true}
        />
    )
}

export default OverallCrewRankingCard

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        height: 70,
        marginVertical: 3,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginHorizontal: 16,
        gap: 8,
    },
    rankCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGreen,
        height: 30,
        width: 30,
        borderRadius: 15,
    },
    rankText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#fff',
    },
    userImage: {
        height: 45,
        width: 45,
        borderRadius: 22.5,
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontSize: 12,
        color: '#636363',
        fontFamily: 'Poppins-Medium',
        lineHeight: 15,
    },
    userDesignation: {
        fontSize: 10,
        color: '#949494',
        fontFamily: 'Poppins-Regular',
        lineHeight: 14,
    },
    milesView: {
        padding: 10,
        height: 50,
        width: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ededed',
    },
    rewardText: {
        fontSize: 12,
        color: '#06361F',
        fontFamily: 'Poppins-SemiBold',
    },
    milesText: {
        fontSize: 8,
        color: '#B7B7B7',
        fontFamily: 'Poppins-Regular',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        textAlign: 'center',
        color: '#454545',
        fontSize: 14,
        marginTop: 20,
        fontFamily: 'Poppins-Regular',
    },
    nodatafoundImage: {
        height: 150,
        width: 150,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 12,
        color: '#06361F',
        fontFamily: 'Poppins-Regular',
    },
    loadMoreButton: {
        backgroundColor: Colors.lightGreen,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    loadMoreText: {
        color: '#06361F',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },
})