import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import GlobalHeader from '@/src/components/GlobalHeader'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, EllipsisVertical, X } from 'lucide-react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import Colors from '@/src/utils/Colors'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Dropdown } from 'react-native-element-dropdown'
import { listallusers } from '@/src/apis/apiService'
import { getUserDetails } from '@/src/utils/helperFunctions'
import { showToast } from '@/src/components/GlobalToast'

interface UserProfile {
    id: string;
    fullName: string;
    profileUrl: string;
    department: string;
    designation: string;
    hobbies: string[];
    favoriteActivity: string[];
    isBoarded: boolean;
}

const PAGE_SIZE = 10;

const CrewListingScreen = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [crewList, setCrewList] = useState<UserProfile[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const filterSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['50%'], []);

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
    );

    const fetchCrewMembers = async (page: number, department: string = '', append: boolean = false) => {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const userDetails = await getUserDetails();
            const apiResponse = await listallusers({
                shipId: userDetails.shipId,
                limit: PAGE_SIZE,
                page,
                department: department || undefined
            });

            if (apiResponse.success && apiResponse.status === 200) {
                const newUsers = apiResponse.data.usersList || [];

                if (append) {
                    setCrewList(prev => [...prev, ...newUsers]);
                } else {
                    setCrewList(newUsers);
                }

                setHasMore(newUsers.length === PAGE_SIZE);
            } else {
                showToast.error(t('oops'), apiResponse.message || t('somethingwentwrong'));
            }
        } catch (error) {
            showToast.error(t('error'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchCrewMembers(1, '');
    }, []);

    const applyFilter = useCallback(() => {
        setCurrentPage(1);
        setHasMore(true);
        fetchCrewMembers(1, selectedDepartment, false);
        closeFilterSheet();
    }, [selectedDepartment]);

    const clearFilter = useCallback(() => {
        setSelectedDepartment('');
        setCurrentPage(1);
        setHasMore(true);
        fetchCrewMembers(1, '', false);
        closeFilterSheet();
    }, []);

    const loadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchCrewMembers(nextPage, selectedDepartment, true);
        }
    };

    const departmentDropDown = useMemo(() => [
        { label: t("deck"), value: "Deck" },
        { label: t("engine"), value: "Engine" },
        { label: t("catering"), value: "Catering" },
    ], [t]);

    const openFilterSheet = useCallback(() => filterSheetRef.current?.snapToIndex(0), []);
    const closeFilterSheet = useCallback(() => filterSheetRef.current?.close(), []);

    const renderInterestChip = (text: string) => (
        <View style={styles.hobbiesView}>
            <Text style={styles.hobbiesText}>{text}</Text>
        </View>
    );

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('crewlist')}
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.back()}
                rightIcon={<Image
                    source={ImagesAssets.FilterIcon}
                    style={styles.filterIcon}
                    contentFit="contain"
                />}
                onRightPress={openFilterSheet}
            />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.lightGreen} />
                </View>
            ) : (
                <FlatList
                    data={crewList}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => loadingMore ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={Colors.lightGreen} />
                        </View>
                    ) : null}
                    renderItem={({ item }) => {
                        const hasHobby = Array.isArray(item.hobbies) && item.hobbies.length > 0;
                        const hasActivity = Array.isArray(item.favoriteActivity) && item.favoriteActivity.length > 0;

                        return (
                            <View style={styles.crewlistView}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                    <View style={styles.rowView}>
                                        {/* Profile Image Container with Overlay Dot */}
                                        <View style={styles.profileContainer}>
                                            <Image
                                                source={item.profileUrl}
                                                style={styles.profileIcon}
                                                placeholder={ImagesAssets.userIcon}
                                                contentFit="cover"
                                            />
                                            {/* Red dot if user is boarded */}
                                            {item.isBoarded && (
                                                <View style={styles.onlineDot} />
                                            )}
                                        </View>

                                        <View style={styles.nameanddesignationView}>
                                            <Text style={styles.name}>{item.fullName}</Text>
                                            <Text style={styles.designation}>{item.designation}</Text>

                                            {(hasHobby || hasActivity) && (
                                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                                                    {hasActivity && renderInterestChip(item.favoriteActivity[0])}
                                                    {hasHobby && renderInterestChip(item.hobbies[0])}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.menuButton}>
                                        <EllipsisVertical size={20} color={Colors.disabled} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    contentContainerStyle={{ paddingBottom: 50 }}
                />
            )}

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
                            <Text style={styles.filterLabel}>{t('selectdepartment')}</Text>
                            <Dropdown
                                style={styles.dropdownStyle}
                                placeholderStyle={styles.dropdownPlaceholder}
                                selectedTextStyle={styles.dropdownSelectedText}
                                itemTextStyle={styles.dropdownItemText}
                                data={departmentDropDown}
                                labelField="label"
                                valueField="value"
                                placeholder={t('selectdepartment')}
                                value={selectedDepartment}
                                onChange={item => setSelectedDepartment(item.value)}
                                maxHeight={300}
                            />
                        </View>

                        <View style={styles.filterButtons}>
                            <TouchableOpacity
                                style={[styles.filterButton, styles.clearButton]}
                                onPress={clearFilter}
                            >
                                <Text style={styles.clearButtonText}>{t('clearFilter')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterButton, styles.applyButton]}
                                onPress={applyFilter}
                            >
                                <Text style={styles.applyButtonText}>{t('applyFilter')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
};

export default CrewListingScreen;

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    crewlistView: {
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5'
    },
    rowView: {
        gap: 10,
        flexDirection: 'row'
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
    filterText: {
        marginRight: 8,
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold'
    },
    profileIcon: {
        height: 50,
        width: 50,
        borderRadius: 50,
    },
    hobbiesText: {
        fontSize: 8,
        color: "#fff",
        fontFamily: "Poppins-Regular",
        fontWeight: "400",
        lineHeight: 12,
    },
    name: {
        fontSize: 12,
        fontFamily: "Poppins-SemiBold",
        lineHeight: 20,
    },
    designation: {
        fontSize: 10,
        color: "#636363",
        fontFamily: "Poppins-Regular",
        fontWeight: "400",
        lineHeight: 12,
    },
    nameanddesignationView: {
        gap: 4,
    },
    profileContainer: {
        position: 'relative',
    },
    onlineDot: {
        position: 'absolute',
        top: 1,
        left: 1,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.darkGreen,
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 1,
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
        fontSize: 12,
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
    filterIcon: { height: 20, width: 20, tintColor: 'rgba(69, 69, 69, 1)' },
    hobbiesView: {
        marginTop: 3,
        alignItems: "center",
        backgroundColor: Colors.lightGreen,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
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
    bottomSheetContent: { paddingHorizontal: 16, paddingBottom: 30 },
    filterItem: { marginBottom: 10 },
    filterLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
        fontFamily: 'Poppins-SemiBold'
    },
    filterView: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    menuButton: {
        justifyContent: 'center',
    }
});