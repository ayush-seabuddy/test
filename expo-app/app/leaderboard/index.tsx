import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import ActiveSailorsCard from '@/src/components/LeaderboardComponent/ActiveSailorsCard'
import GlobalHeader from '@/src/components/GlobalHeader'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, InfoIcon, X } from 'lucide-react-native'
import { router } from 'expo-router'
import { showToast } from '@/src/components/GlobalToast'
import { getallshipslist, getleaderboard } from '@/src/apis/apiService'
import OverallCrewRankingCard from '@/src/components/LeaderboardComponent/OverallCrewRankingCard'
import GlobalPopOver from '@/src/components/GlobalPopover'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import HowMilesWorkPopup from '@/src/components/ShipLifeComponent/HowMilesWorkPopup'
import Colors from '@/src/utils/Colors'
import { Dropdown } from 'react-native-element-dropdown'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { getUserDetails } from '@/src/utils/helperFunctions'

interface SailorsOfTheMonth {
    id: string
    fullName: string
    profileUrl: string
    designation: string
    rewardPoints: string
}

interface OverallCrewRanking {
    id: string
    fullName: string
    profileUrl: string
    designation: string
    rewardPoints: string
    rank: number
}

const LeaderboardScreen = () => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [isFiltering, setIsFiltering] = useState(false)
    const [sailorsOfTheMonth, setSailorsOfTheMonth] = useState<SailorsOfTheMonth[]>([])
    const [overallCrewListing, setOverallCrewListing] = useState<OverallCrewRanking[]>([])
    const [shipDropDown, setshipDropDown] = useState<{ label: string; value: string }[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [selectedDesignation, setSelectedDesignation] = useState<string>('')
    const [selectedShip, setSelectedShip] = useState<string>('')
    const filterSheetRef = useRef<BottomSheet>(null)
    const snapPoints = useMemo(() => ['55%'], [])

    const openFilterSheet = useCallback(() => filterSheetRef.current?.snapToIndex(0), [])
    const closeFilterSheet = useCallback(() => filterSheetRef.current?.close(), [])

    // Check if Active Sailors should be visible
    const isSailorsVisible = useMemo(() => sailorsOfTheMonth.length > 0, [sailorsOfTheMonth])

    const designationDropDown = useMemo(() => [
        { label: t("designationDropDown.captain"), value: "Captain" },
        { label: t("designationDropDown.chief_officer"), value: "Chief officer" },
        { label: t("designationDropDown.second_officer"), value: "Second officer" },
        { label: t("designationDropDown.third_officer"), value: "Third officer" },
        { label: t("designationDropDown.deck_cadet"), value: "Deck cadet" },
        { label: t("designationDropDown.deck_fitter"), value: "Deck Fitter" },
        { label: t("designationDropDown.bosun"), value: "Bosun" },
        { label: t("designationDropDown.able_seaman"), value: "Able seaman" },
        { label: t("designationDropDown.ordinary_seaman"), value: "Ordinary Seaman" },
        { label: t("designationDropDown.chief_cook"), value: "Chief cook" },
        { label: t("designationDropDown.messman"), value: "Messman" },
        { label: t("designationDropDown.chief_engineer"), value: "Chief engineer" },
        { label: t("designationDropDown.second_engineer"), value: "Second engineer" },
        { label: t("designationDropDown.third_engineer"), value: "Third engineer" },
        { label: t("designationDropDown.fourth_engineer"), value: "Fourth engineer" },
        { label: t("designationDropDown.junior_engineer"), value: "Junior engineer" },
        { label: t("designationDropDown.engine_cadet"), value: "Engine cadet" },
        { label: t("designationDropDown.electrical_engineer"), value: "Electrical engineer / ETO" },
        { label: t("designationDropDown.electrical_cadet"), value: "Electrical cadet" },
        { label: t("designationDropDown.engine_fitter"), value: "Engine fitter" },
        { label: t("designationDropDown.motorman_oiler"), value: "Motorman/ Oiler" },
        { label: t("designationDropDown.wiper"), value: "Wiper" }
    ], [t])

    useEffect(() => {
        getAllShipsList()
        fetchLeaderboardData(1, false)
    }, [])

    const getAllShipsList = async () => {
        const userData = await getUserDetails()
        setLoading(true)
        try {
            const apiResponse = await getallshipslist({ employerId: userData.employerId })
            
            if (apiResponse.success && apiResponse.status === 200) {
                const shipsData = apiResponse.data.map((ship: any) => ({
                    label: ship.shipName,
                    value: ship.id,
                }))
                setshipDropDown(shipsData)
            } else {
                showToast.error(t('oops'), apiResponse.message)
            }
        } catch (error) {
            showToast.error(t('oops'), t('somethingwentwrong'))
        } finally {
            setLoading(false)
        }
    }

    const fetchLeaderboardData = async (
        page = 1, 
        isLoadMore = false, 
        filters?: { designation?: string; ship?: string }
    ) => {
        if (isLoadMore) {
            setLoadingMore(true)
        } else {
            setLoading(true)
            setIsFiltering(true)
        }

        try {
            const params: any = { page, limit: 100 }
            if (filters?.designation) params.designation = filters.designation
            if (filters?.ship) params.shipId = filters.ship

            const apiResponse = await getleaderboard(params)

            if (apiResponse.success && apiResponse.status === 200) {
                // Only update sailors of the month on initial load (no filters)
                if (!isLoadMore && page === 1 && !filters?.designation && !filters?.ship) {
                    const filteredTop = (apiResponse.data.topEmployees || []).filter(
                        (e: any) => Number(e.rewardPoints) > 0
                    )
                    setSailorsOfTheMonth(filteredTop)
                }

                const usersList = apiResponse.data.allUsers?.usersList || []
                const totalPages = apiResponse.data.allUsers?.totalPages || 1
                setHasMore(page < totalPages)

                if (isLoadMore) {
                    // Load more - append to existing list with proper ranking
                    const previousLength = overallCrewListing.length
                    const newUsers = usersList.map((user: any, idx: number) => {
                        const points = Number(user.rewardPoints)
                        let rank = previousLength + idx + 1
                        
                        // Check if same points as previous user in new batch
                        if (idx > 0 && points === Number(usersList[idx - 1].rewardPoints)) {
                            rank = overallCrewListing[previousLength + idx - 1]?.rank || rank
                        } 
                        // Check if same points as last user in existing list
                        else if (previousLength > 0 && points === Number(overallCrewListing[previousLength - 1].rewardPoints)) {
                            rank = overallCrewListing[previousLength - 1].rank
                        }
                        
                        return { ...user, rank }
                    })
                    setOverallCrewListing(prev => [...prev, ...newUsers])
                } else {
                    // Initial load or filter - replace list with proper ranking
                    const sorted = [...usersList].sort((a: any, b: any) => 
                        Number(b.rewardPoints) - Number(a.rewardPoints)
                    )
                    
                    let rank = 1
                    const ranked = sorted.map((user: any, idx: number) => {
                        if (idx > 0 && Number(user.rewardPoints) !== Number(sorted[idx - 1].rewardPoints)) {
                            rank = idx + 1
                        }
                        return { ...user, rank }
                    })
                    
                    setOverallCrewListing(ranked)
                }

                setCurrentPage(page)
                setIsInitialLoad(false)
            } else {
                if (!isLoadMore) {
                    showToast.error(t('oops'), apiResponse.message)
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
            if (!isLoadMore) {
                showToast.error(t('oops'), t('somethingwentwrong'))
            }
        } finally {
            setLoading(false)
            setLoadingMore(false)
            setIsFiltering(false)
        }
    }

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchLeaderboardData(currentPage + 1, true, {
                designation: selectedDesignation || undefined,
                ship: selectedShip || undefined,
            })
        }
    }, [currentPage, loadingMore, hasMore, selectedDesignation, selectedShip])

    const handleApplyFilter = useCallback(() => {
        closeFilterSheet()
        setCurrentPage(1)
        setOverallCrewListing([])
        fetchLeaderboardData(1, false, {
            designation: selectedDesignation || undefined,
            ship: selectedShip || undefined,
        })
    }, [selectedDesignation, selectedShip])

    const handleClearFilter = useCallback(() => {
        setSelectedDesignation('')
        setSelectedShip('')
        closeFilterSheet()
        setCurrentPage(1)
        setOverallCrewListing([])
        fetchLeaderboardData(1, false)
    }, [])

    const handleCardPress = useCallback((item: SailorsOfTheMonth) => {
        router.push({ pathname: '/crewProfile', params: { crewId: item.id } })
    }, [])

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop 
                {...props} 
                disappearsOnIndex={-1} 
                appearsOnIndex={0} 
                opacity={0.5} 
                pressBehavior="close" 
            />
        ),
        []
    )

    const renderSailorItem = useCallback(({ item, index }: { item: SailorsOfTheMonth; index: number }) => (
        <ActiveSailorsCard 
            activeSailorsOfMonth={item} 
            rank={index + 1} 
            onPress={() => handleCardPress(item)} 
        />
    ), [handleCardPress])

    const keyExtractorSailor = useCallback((_: any, i: number) => `sailor-${i}`, [])

    return (
        <View style={styles.main}>
            <GlobalHeader 
                title={t('leaderboard')} 
            />

            <FlatList
                ListHeaderComponent={
                    <>
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
                                    keyExtractor={keyExtractorSailor}
                                    renderItem={renderSailorItem}
                                    contentContainerStyle={styles.sailorsListContainer}
                                />
                            </>
                        )}

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
                                    <TouchableOpacity style={styles.filterView} onPress={openFilterSheet}>
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
                data={[{ key: 'crew-ranking' }]}
                keyExtractor={item => item.key}
                renderItem={() => (
                    <OverallCrewRankingCard
                        overallCrewList={overallCrewListing}
                        loading={loading && isInitialLoad}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        isFiltering={isFiltering}
                        onLoadMore={handleLoadMore}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
            />

            <BottomSheet
                ref={filterSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView contentContainerStyle={styles.bottomSheetScrollContent}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>{t('filter')}</Text>
                        <TouchableOpacity onPress={closeFilterSheet}>
                            <X size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bottomSheetContent}>
                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>{t('selectRole')}</Text>
                            <Dropdown
                                style={styles.dropdownStyle}
                                placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                itemTextStyle={styles.dropdownItemText}
                                data={designationDropDown}
                                labelField="label"
                                valueField="value"
                                placeholder={t('selectarole')}
                                value={selectedDesignation}
                                onChange={item => setSelectedDesignation(item.value)}
                                maxHeight={300}
                            />
                        </View>

                        <View style={styles.filterItem}>
                            <Text style={styles.filterLabel}>{t('selectShip')}</Text>
                            <Dropdown
                                style={styles.dropdownStyle}
                                placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                itemTextStyle={styles.dropdownItemText}
                                data={shipDropDown}
                                labelField="label"
                                valueField="value"
                                placeholder={t('selectaship')}
                                value={selectedShip}
                                onChange={item => setSelectedShip(item.value)}
                                maxHeight={300}
                            />
                        </View>

                        <View style={styles.filterButtons}>
                            <TouchableOpacity 
                                style={[styles.filterButton, styles.clearButton]} 
                                onPress={handleClearFilter}
                            >
                                <Text style={styles.clearButtonText}>{t('clearFilter')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.filterButton, styles.applyButton]} 
                                onPress={handleApplyFilter}
                            >
                                <Text style={styles.applyButtonText}>{t('applyFilter')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    )
}

export default LeaderboardScreen

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#f5f5f5' },
    flatListContent: { flexGrow: 1, paddingBottom: 30 },
    sailorsHeaderContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        marginTop: 16, 
        marginBottom: 12 
    },
    textContainer: { flex: 1, marginRight: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { 
        fontSize: 18, 
        lineHeight:20,
        color: 'rgba(42, 43, 42, 0.8)', 
        fontFamily: 'WhyteInktrap-Bold' 
    },
    description: { 
        fontSize: 10, 
        color: 'gray', 
        fontFamily: 'Poppins-Regular', 
        marginTop: 4 
    },
    infoIcon: { marginBottom: 8 },
    sailorsIcon: { height: 50, width: 50 },
    sailorsListContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    overallHeaderContainer: { marginTop: 20, paddingHorizontal: 16, paddingBottom: 10 },
    overallHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 8 
    },
    overallTitle: { 
        fontSize: 20, 
        lineHeight: 27, 
        color: 'rgba(42, 43, 42, 0.8)', 
        fontFamily: 'WhyteInktrap-Bold' 
    },
    okBtnStyle: { backgroundColor: Colors.lightGreen },
    infoandfilterView: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    filterView: { 
        padding: 6, 
        borderRadius: 8, 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    filterIcon: { height: 16, width: 16, tintColor: 'rgba(69, 69, 69, 1)' },
    overallDescription: { 
        color: 'gray', 
        fontSize: 10, 
        fontFamily: 'Poppins-Regular', 
        width: '85%' 
    },
    bottomSheetBackground: { 
        backgroundColor: 'white', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20 
    },
    handleIndicator: { backgroundColor: '#ccc', width: 40 },
    bottomSheetScrollContent: { paddingBottom: 30 },
    bottomSheetHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 20, 
        paddingHorizontal: 16, 
        paddingBottom: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    bottomSheetTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#333', 
        fontFamily: 'Poppins-SemiBold' 
    },
    bottomSheetContent: { paddingHorizontal: 16, paddingBottom: 30},
    filterItem: { marginBottom: 10 },
    filterLabel: { 
        fontSize: 14, 
        fontWeight: '500', 
        color: '#333', 
        marginBottom: 8, 
        fontFamily: 'Poppins-SemiBold' 
    },
    dropdownStyle: { 
        height: 50, 
        borderColor: '#e0e0e0', 
        borderWidth: 1, 
        borderRadius: 8, 
        backgroundColor: '#f8f8f8', 
        paddingHorizontal: 12 
    },
    dropdownPlaceholder: { 
        fontSize: 14, 
        color: '#666', 
        fontFamily: 'Poppins-Regular' 
    },
    dropdownSelectedText: { 
        fontSize: 14, 
        color: '#333', 
        fontFamily: 'Poppins-Regular' 
    },
    dropdownItemText: { 
        fontSize: 14, 
        color: '#333', 
        fontFamily: 'Poppins-Regular' 
    },
    filterButtons: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 10, 
        gap: 12 
    },
    filterButton: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    clearButton: { 
        backgroundColor: '#f8f8f8', 
        borderWidth: 1, 
        borderColor: '#e0e0e0' 
    },
    applyButton: { backgroundColor: Colors.lightGreen },
    clearButtonText: { 
        color: '#666', 
        fontSize: 14, 
        fontWeight: '500', 
        fontFamily: 'Poppins-Medium' 
    },
    applyButtonText: { 
        color: 'white', 
        fontSize: 14, 
        fontWeight: '500', 
        fontFamily: 'Poppins-Medium' 
    },
})