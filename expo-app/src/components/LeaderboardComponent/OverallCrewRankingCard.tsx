import Colors from '@/src/utils/Colors'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CommonLoader from '../CommonLoader'
import EmptyComponent from '../EmptyComponent'
import { getUserDetails } from '@/src/utils/helperFunctions'

interface CrewMember {
    id: string
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
    isFiltering?: boolean
    onLoadMore?: () => void
}

const OverallCrewRankingCard: React.FC<OverallCrewRankingCardProps> = ({
    overallCrewList,
    loading = false,
    loadingMore = false,
    hasMore = true,
    isFiltering = false,
    onLoadMore,
}) => {
    const { t } = useTranslation()
    const flatListRef = useRef<FlatList>(null)
    const [hasTriggeredLoadMore, setHasTriggeredLoadMore] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserDetails()
            setUserId(userData?.id)
        }
        fetchUser()
    }, [])

    const handleCardPress = useCallback((item: CrewMember) => {
        router.push({
            pathname: '/crewProfile',
            params: { crewId: item.id },
        })
    }, [])

    const renderItem = useCallback(
        ({ item }: { item: CrewMember }) => {
            const isCurrentUser = userId === item.id

            return (
                <TouchableOpacity
                    style={[styles.card, isCurrentUser && styles.currentUserCard]}
                    onPress={() => handleCardPress(item)}
                    activeOpacity={0.7}
                >
                    {/* Rank */}
                    <View style={[styles.rankCircle, isCurrentUser && styles.currentUserRankCircle]}>
                        <Text style={[styles.rankText, isCurrentUser && styles.currentUserRankText]}>
                            {item.rank}
                        </Text>
                    </View>

                    {/* Profile Image */}
                    <Image
                        source={
                            item.profileUrl
                                ? { uri: item.profileUrl }
                                : ImagesAssets.userIcon
                        }
                        style={[
                            styles.userImage,
                            isCurrentUser && styles.currentUserImage,
                        ]}
                        contentFit="cover"
                    />

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text
                            style={[styles.userName, isCurrentUser && styles.currentUserName]}
                            numberOfLines={1}
                        >
                            {item.fullName}
                        </Text>
                        <Text
                            style={[
                                styles.userDesignation,
                                isCurrentUser && styles.currentUserDesignation,
                            ]}
                            numberOfLines={1}
                        >
                            {item.designation}
                        </Text>
                    </View>

                    {/* Miles */}
                    <View style={[styles.milesView, isCurrentUser && styles.currentUserMilesView]}>
                        <Text
                            style={[styles.rewardText, isCurrentUser && styles.currentUserRewardText]}
                        >
                            {item.rewardPoints}
                        </Text>
                        <Text
                            style={[styles.milesText, isCurrentUser && styles.currentUserMilesText]}
                        >
                            {t('miles')}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        },
        [handleCardPress, t, userId]
    )

    const handleEndReached = useCallback(() => {
        if (!loading && !loadingMore && hasMore && !hasTriggeredLoadMore && onLoadMore) {
            setHasTriggeredLoadMore(true)
            onLoadMore()
        }
    }, [loading, loadingMore, hasMore, hasTriggeredLoadMore, onLoadMore])

    const renderFooter = useCallback(() => {
        if (loadingMore) {
            return (
                <View style={styles.footerLoader}>
                    <CommonLoader />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            )
        }
        return null
    }, [loadingMore, t])

    useEffect(() => {
        if (!loadingMore) {
            setHasTriggeredLoadMore(false)
        }
    }, [loadingMore])

    if (loading || (isFiltering && overallCrewList.length === 0)) {
        return (
            <View style={styles.loadingContainer}>
                <CommonLoader fullScreen />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        )
    }

    if (overallCrewList.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <EmptyComponent text={t('nocrewfound')} />
            </View>
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={overallCrewList}
            keyExtractor={(item) => `crew-${item.id}-${item.rank}`}
            renderItem={renderItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.7}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            removeClippedSubviews
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
        />
    )
}

export default OverallCrewRankingCard

const styles = StyleSheet.create({
    listContent: { paddingBottom: 20 },

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
        elevation: 1,
    },

    currentUserCard: {
        backgroundColor: Colors.lightGreen,
    },

    rankCircle: {
        height: 30,
        width: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGreen,
    },

    currentUserRankCircle: {
        backgroundColor: Colors.white,
    },

    rankText: {
        fontSize: 12,
        color: '#fff',
        fontFamily: 'Poppins-Regular',
    },

    currentUserRankText: {
        color: '#06361F',
    },

    userImage: {
        height: 45,
        width: 45,
        borderRadius: 22.5,
        borderWidth: 0.5,
        borderColor: '#B0B0B0',
    },

    currentUserImage: {
        borderColor: Colors.white,
    },

    userInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 12,
        color: '#636363',
        fontFamily: 'Poppins-Medium',
    },

    currentUserName: {
        color: Colors.white,
    },

    userDesignation: {
        fontSize: 10,
        color: '#949494',
        fontFamily: 'Poppins-Regular',
    },

    currentUserDesignation: {
        color: '#EAF5EF',
    },

    milesView: {
        height: 50,
        width: 50,
        borderRadius: 10,
        backgroundColor: '#ededed',
        justifyContent: 'center',
        alignItems: 'center',
    },

    currentUserMilesView: {
        backgroundColor: Colors.white,
    },

    rewardText: {
        fontSize: 12,
        color: '#06361F',
        fontFamily: 'Poppins-SemiBold',
    },

    currentUserRewardText: {
        color: '#06361F',
    },

    milesText: {
        fontSize: 8,
        color: '#B7B7B7',
        fontFamily: 'Poppins-Regular',
    },

    currentUserMilesText: {
        color: '#6A8F7D',
    },

    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },

    loadingContainer: {
        marginTop: 150,
        alignItems: 'center',
    },

    emptyContainer: {
        marginTop: '20%',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 8,
        fontSize: 12,
        color: '#06361F',
        fontFamily: 'Poppins-Regular',
    },
})
