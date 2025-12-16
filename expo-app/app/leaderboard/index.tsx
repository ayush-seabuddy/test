import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import ActiveSailorsCard from '@/src/components/LeaderboardComponent/ActiveSailorsCard'
import GlobalHeader from '@/src/components/GlobalHeader'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, InfoIcon } from 'lucide-react-native'
import { router } from 'expo-router'
import { showToast } from '@/src/components/GlobalToast'
import { getleaderboard } from '@/src/apis/apiService'
import OverallCrewRankingCard from '@/src/components/LeaderboardComponent/OverallCrewRankingCard'
import GlobalPopOver from '@/src/components/GlobalPopover'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import HowMilesWorkPopup from '@/src/components/ShipLifeComponent/HowMilesWorkPopup'
import Colors from '@/src/utils/Colors'

interface SailorsOfTheMonth {
    fullName: string
    profileUrl: string
    designation: string
    rewardPoints: string
}

interface OverallCrewRanking {
    fullName: string
    profileUrl: string
    designation: string
    rewardPoints: string
    rank: number
}

const LeaderboardScreen = () => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [sailorsOfTheMonth, setSailorsOfTheMonth] = useState<SailorsOfTheMonth[]>([])
    const [overallCrewListing, setOverallCrewListing] = useState<OverallCrewRanking[]>([])
    const [isSailorsVisible, setIsSailorsVisible] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Track when load more should be triggered
    const [shouldLoadMore, setShouldLoadMore] = useState(false)

    useEffect(() => {
        fetchLeaderboardData()
    }, [])

    // Use effect to handle load more when triggered from child component
    useEffect(() => {
        if (shouldLoadMore && !loadingMore && hasMore) {
            handleLoadMore()
            setShouldLoadMore(false)
        }
    }, [shouldLoadMore, loadingMore, hasMore])

    const fetchLeaderboardData = async (page = 1, isLoadMore = false) => {
        console.log('API Called - Page:', page, 'isLoadMore:', isLoadMore)

        if (isLoadMore) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }

        try {
            const apiResponse = await getleaderboard({ page, limit: 100 })

            if (!isLoadMore) {
                setLoading(false)
            }

            if (apiResponse.success && apiResponse.status === 200) {
                // Process top employees (only on initial load)
                if (!isLoadMore) {
                    const filteredTopEmployees = (apiResponse.data.topEmployees || []).filter(
                        (employee: any) => Number(employee.rewardPoints) > 0
                    )
                    setIsSailorsVisible(filteredTopEmployees.length > 0)
                    setSailorsOfTheMonth(filteredTopEmployees)
                }

                // Process all users with pagination
                const usersList = apiResponse.data.allUsers?.usersList || []
                const totalPages = apiResponse.data.allUsers?.totalPages || 1

                console.log('Total Pages:', totalPages, 'Current Page:', page)

                // Check if there are more pages
                setHasMore(page < totalPages)

                if (isLoadMore) {
                    // For load more, append to existing list
                    const previousLength = overallCrewListing.length

                    const newRankedUsers = usersList.map((user: any, index: number) => {
                        const rewardPoints = Number(user.rewardPoints)

                        // Calculate rank based on existing data
                        let rank = previousLength + index + 1

                        // Handle ties (same reward points as previous item)
                        if (index > 0 && rewardPoints === Number(usersList[index - 1].rewardPoints)) {
                            rank = overallCrewListing[previousLength + index - 1]?.rank || rank
                        } else if (previousLength > 0 && rewardPoints === Number(overallCrewListing[previousLength - 1].rewardPoints)) {
                            rank = overallCrewListing[previousLength - 1].rank
                        }

                        return {
                            fullName: user.fullName,
                            profileUrl: user.profileUrl,
                            designation: user.designation,
                            rewardPoints: user.rewardPoints,
                            rank: rank
                        }
                    })

                    setOverallCrewListing(prev => [...prev, ...newRankedUsers])
                    setLoadingMore(false)
                } else {
                    // For initial load, set new list
                    const rankedUsers = usersList
                        .map((user: any) => ({
                            fullName: user.fullName,
                            profileUrl: user.profileUrl,
                            designation: user.designation,
                            rewardPoints: user.rewardPoints
                        }))
                        .sort((a: any, b: any) => Number(b.rewardPoints) - Number(a.rewardPoints))

                    let currentRank = 1
                    const rankedList: OverallCrewRanking[] = rankedUsers.map((user: any, index: number) => {
                        if (index > 0 && Number(user.rewardPoints) === Number(rankedUsers[index - 1].rewardPoints)) {
                            // Tie: keep same rank
                        } else {
                            currentRank = index + 1
                        }
                        return { ...user, rank: currentRank }
                    })

                    setOverallCrewListing(rankedList)
                }

                setCurrentPage(page)
                setIsInitialLoad(false)
            } else {
                if (!isLoadMore) {
                    showToast.error(t('oops'), apiResponse.message)
                }
                setLoadingMore(false)
            }
        } catch (error) {
            setLoading(false)
            setLoadingMore(false)
            console.log('Error', error)
            if (!isLoadMore) {
                showToast.error(t('oops'), t('somethingwentwrong'))
            }
        }
    }

    const handleCardPress = (item: SailorsOfTheMonth) => {
        console.log('Card pressed:', item)
    }

    const handleLoadMore = () => {
        console.log('Handle Load More - Current Page:', currentPage, 'Has More:', hasMore)
        if (!loadingMore && hasMore) {
            fetchLeaderboardData(currentPage + 1, true)
        }
    }

    const handleChildLoadMore = () => {
        console.log('Child requested load more')
        setShouldLoadMore(true)
    }

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('leaderboard')}
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.back()}
            />

            <FlatList
                ListHeaderComponent={
                    <>
                        {/* Active Sailors Section */}
                        {isSailorsVisible && (
                            <>
                                <View style={styles.sailorsHeaderContainer}>
                                    <View style={styles.textContainer}>
                                        <View style={styles.titleRow}>
                                            <Text style={styles.title}>{t('activeSailors')}</Text>
                                            <GlobalPopOver popOverText={t('leaderboardinfo_description')}>
                                                <InfoIcon size={16} color="#555" style={styles.infoIcon} />
                                            </GlobalPopOver>
                                        </View>
                                        <Text style={styles.description} numberOfLines={2}>
                                            {t('activeSailors_description')}
                                        </Text>
                                    </View>

                                    <Image
                                        source={ImagesAssets.LeaderboardSailorsIcon}
                                        style={styles.sailorsIcon}
                                        contentFit="contain"
                                    />
                                </View>

                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={sailorsOfTheMonth}
                                    keyExtractor={(_, index) => `sailor-${index}`}
                                    renderItem={({ item, index }) => (
                                        <ActiveSailorsCard
                                            activeSailorsOfMonth={item}
                                            rank={index + 1}
                                            onPress={() => handleCardPress(item)}
                                        />
                                    )}
                                    contentContainerStyle={styles.sailorsListContainer}
                                    ListEmptyComponent={() => (
                                        <Text style={styles.emptyText}>{t('noDataAvailable')}</Text>
                                    )}
                                />
                            </>
                        )}

                        {/* Overall Crew Ranking Header */}
                        <View style={styles.overallHeaderContainer}>
                            <View style={styles.overallHeader}>
                                <Text style={styles.overallTitle}>{t('overallcrewranking')}</Text>
                                <View style={styles.infoandfilterView}>
                                    <GlobalPopOver
                                        showOkButton
                                        buttonText={t('close')}
                                        buttonStyle={styles.okBtnStyle}
                                        popOverContent={<HowMilesWorkPopup />}
                                    >
                                        <InfoIcon size={18} color="grey" />
                                    </GlobalPopOver>
                                    <TouchableOpacity
                                        style={styles.filterView}
                                        onPress={() => console.log('Filter pressed')}
                                    >
                                        <Image
                                            source={ImagesAssets.FilterIcon}
                                            style={styles.filterIcon}
                                            contentFit="contain"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text style={styles.overallDescription}>
                                {t('overallcrewranking_description')}
                            </Text>
                        </View>
                    </>
                }
                data={[{ key: 'overall-crew-ranking' }]}
                keyExtractor={(item) => item.key}
                renderItem={() => (
                    <OverallCrewRankingCard
                        overallCrewList={overallCrewListing}
                        loading={loading && isInitialLoad}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        onLoadMore={handleChildLoadMore}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
            // Remove onEndReached from here - let child component handle it
            // onEndReached={handleLoadMore}
            // onEndReachedThreshold={0.5}
            />
        </View>
    )
}

export default LeaderboardScreen

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    flatListContent: {
        flexGrow: 1,
    },
    sailorsHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 18,
        color: 'rgba(42, 43, 42, 0.8)',
        fontFamily: 'WhyteInktrap-Bold',
    },
    description: {
        fontSize: 10,
        color: 'gray',
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
    },
    infoIcon: {
        marginTop: 2,
    },
    sailorsIcon: {
        height: 50,
        width: 50,
    },
    sailorsListContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: 'gray',
        padding: 20,
        fontFamily: 'Poppins-Regular',
    },
    overallHeaderContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    overallHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    overallTitle: {
        fontSize: 22,
        lineHeight: 27,
        color: 'black',
        fontFamily: 'WhyteInktrap-Bold',
    },
    okBtnStyle: { backgroundColor: Colors.lightGreen },
    infoandfilterView: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    filterView: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterIcon: {
        height: 16,
        width: 16,
        tintColor: 'rgba(69, 69, 69, 1)',
    },
    overallDescription: {
        color: 'gray',
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        width: '85%',
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
})