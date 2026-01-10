import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native'
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
import { addupdateshipstatus, listallusers, offboardonboardcrew } from '@/src/apis/apiService'
import { getUserDetails } from '@/src/utils/helperFunctions'
import { showToast } from '@/src/components/GlobalToast'
import EmptyComponent from '@/src/components/EmptyComponent'
import CommonLoader from '@/src/components/CommonLoader'

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
    const [offboardonboardVisible, setoffboardonboardVisible] = useState(false);
    const [removefromshipVisible, setremovefromshipVisible] = useState(false);
    const [optionsModalVisible, setoptionsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const filterSheetRef = useRef<BottomSheet>(null);

    const filterSnapPoints = useMemo(() => ['50%'], []);

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
                const filteredUsers = newUsers.filter((user: UserProfile) => user.id !== userDetails.id);
                if (append) {
                    setCrewList(prev => [...prev, ...filteredUsers]);
                } else {
                    setCrewList(filteredUsers);
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

    const openOptionsSheet = useCallback((user: UserProfile) => {
        setSelectedUser(user);
        // Always show options modal first
        setoptionsModalVisible(true);
    }, []);

    const closeOptionsSheet = useCallback(() => {
        setoptionsModalVisible(false);
        // Don't clear selectedUser immediately here
    }, []);

    const handleOnboardPress = () => {
        // Close options modal and open onboard/offboard modal
        setoptionsModalVisible(false);
        setoffboardonboardVisible(true);
    };

    const handleRemoveFromShipPress = () => {
        // Close options modal and open remove from ship modal
        setoptionsModalVisible(false);
        setremovefromshipVisible(true);
    };

    const closeOffboardOnboardModal = () => {
        setoffboardonboardVisible(false);
        // Clear selected user after modal closes
        setTimeout(() => setSelectedUser(null), 300);
    };

    const closeRemoveModal = () => {
        setremovefromshipVisible(false);
        // Clear selected user after modal closes
        setTimeout(() => setSelectedUser(null), 300);
    };

    const handleToggleBoard = async (user: UserProfile) => {
        const newStatus = !user.isBoarded;
        const oldList = [...crewList];
        const index = crewList.findIndex(u => u.id === user.id);
        if (index === -1) return;

        const updatedList = [...crewList];
        updatedList[index] = { ...updatedList[index], isBoarded: newStatus };
        setCrewList(updatedList);

        setActionLoading(true);
        try {
            const userDetails = await getUserDetails();

            const payload = {
                shipId: userDetails.shipId,
                boardedStatus: [
                    {
                        userId: user.id,
                        isBoarded: newStatus
                    }
                ] as [{ userId: string; isBoarded: boolean }]
            };

            const apiResponse = await offboardonboardcrew(payload);

            if (apiResponse.success && apiResponse.status === 200) {
                showToast.success(t('success'), t('crew.statusUpdated'));
            } else {
                setCrewList(oldList);
                showToast.error(t('oops'), apiResponse.message || t('somethingwentwrong'));
            }
        } catch (error) {
            setCrewList(oldList);
            showToast.error(t('error'), t('somethingwentwrong'));
        } finally {
            setActionLoading(false);
            closeOffboardOnboardModal();
        }
    };

    const handleRemoveFromShip = async () => {
        if (!selectedUser) return;
        const oldList = [...crewList];
        const updatedList = crewList.filter(u => u.id !== selectedUser.id);
        setCrewList(updatedList);
        setActionLoading(true);
        try {
            const userDetails = await getUserDetails();
            const crewMembers = updatedList.map(user => ({
                userId: user.id
            }));
            const payload = {
                shipId: userDetails.shipId,
                crewMembers: crewMembers,
                employerId: userDetails.employerId
            };

            const apiResponse = await addupdateshipstatus(payload);
            if (apiResponse.success && apiResponse.status === 200) {
                showToast.success(t('success'), t('crew.removedFromShip'));
            } else {
                setCrewList(oldList);
                showToast.error(t('oops'), apiResponse.message || t('somethingwentwrong'));
            }
        } catch (error) {
            setCrewList(oldList);
            showToast.error(t('error'), t('somethingwentwrong'));
        } finally {
            setActionLoading(false);
            closeRemoveModal();
        }
    };

    const renderInterestChip = (text: string) => (
        <View style={styles.hobbiesView}>
            <Text style={styles.hobbiesText}>{text}</Text>
        </View>
    );

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('crewlist')}
                rightIcon={<Image source={ImagesAssets.FilterIcon} style={styles.filterIcon} contentFit="contain" />}
                onRightPress={openFilterSheet}
            />

            {selectedDepartment && <View style={{ height: 50, backgroundColor: '#f5f5f5', justifyContent: 'center', paddingHorizontal: 20, }}>
                <Text style={[styles.name, { fontSize: 14 }]}>{selectedDepartment}</Text>
            </View>
            }
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                   <CommonLoader fullScreen/>
                </View>
            ) : (
                <FlatList
                    data={crewList}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => loadingMore && (
                        <View style={{ paddingVertical: 20 }}>
                            <CommonLoader/>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const hasHobby = Array.isArray(item.hobbies) && item.hobbies.length > 0;
                        const hasActivity = Array.isArray(item.favoriteActivity) && item.favoriteActivity.length > 0;

                        return (
                            <View style={styles.crewlistView}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                                    <View style={styles.rowView}>
                                        <TouchableOpacity style={styles.profileContainer} onPress={() => {
                                            router.push({
                                                pathname: '/crewProfile',
                                                params: {
                                                    crewId: item.id
                                                }
                                            })
                                        }}>
                                            <Image
                                                source={item.profileUrl}
                                                style={styles.profileIcon}
                                                placeholder={ImagesAssets.userIcon}
                                                contentFit="cover"
                                            />
                                            {item.isBoarded && <View style={styles.onlineDot} />}
                                        </TouchableOpacity>

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

                                    <TouchableOpacity style={styles.menuButton} onPress={() => openOptionsSheet(item)}>
                                        <EllipsisVertical size={20} color={Colors.disabled} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    ListEmptyComponent={
                        <View style={styles.nocrewfound}>
                            <EmptyComponent text={t('nocrewfound')} />

                        </View>
                    }
                />
            )}

            {/* Filter Bottom Sheet */}
            <BottomSheet
                ref={filterSheetRef}
                index={-1}
                snapPoints={filterSnapPoints}
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
                            <TouchableOpacity style={[styles.filterButton, styles.clearButton]} onPress={clearFilter}>
                                <Text style={styles.clearButtonText}>{t('clearFilter')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.filterButton, styles.applyButton]} onPress={applyFilter}>
                                <Text style={styles.applyButtonText}>{t('applyFilter')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>

            {/* Options Modal for All Users */}
            <Modal animationType="fade" transparent visible={optionsModalVisible} onRequestClose={closeOptionsSheet}>
                <TouchableWithoutFeedback onPress={closeOptionsSheet}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.optionsModalContainer}>
                                {selectedUser?.isBoarded ? (
                                    // Options for boarded users
                                    <>
                                        <TouchableOpacity style={styles.optionModalItem} onPress={handleOnboardPress}>
                                            <Text style={styles.optionModalText}>{t('crew.offboardCrew')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.optionModalItem, styles.lastOptionItem]} onPress={handleRemoveFromShipPress}>
                                            <Text style={styles.optionModalTextDestructive}>{t('crew.removeFromShip')}</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    // Options for non-boarded users
                                    <>
                                        <TouchableOpacity style={styles.optionModalItem} onPress={handleOnboardPress}>
                                            <Text style={styles.optionModalText}>{t('crew.onboardCrew')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.optionModalItem, styles.lastOptionItem]} onPress={handleRemoveFromShipPress}>
                                            <Text style={styles.optionModalTextDestructive}>{t('crew.removeFromShip')}</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Onboard/Offboard Confirmation Modal */}
            <Modal animationType="fade" transparent visible={offboardonboardVisible} onRequestClose={closeOffboardOnboardModal}>
                <TouchableWithoutFeedback onPress={closeOffboardOnboardModal}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                {selectedUser?.isBoarded ? t('crew.offboardCrew') : t('crew.onboardCrew')}
                            </Text>
                            <Text style={styles.modalMessage}>
                                {t('crew.confirmStatusChange', {
                                    action: selectedUser?.isBoarded ? t('crew.offboard') : t('crew.onboard'),
                                    name: selectedUser?.fullName || t('crew.thisCrew'),
                                })}
                            </Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={closeOffboardOnboardModal} disabled={actionLoading}>
                                    <Text style={styles.cancelButtonText}>{t('no')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.exitButton, actionLoading && styles.exitButtonDisabled]}
                                    onPress={() => selectedUser && handleToggleBoard(selectedUser)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <CommonLoader color='#fff'/>: <Text style={styles.exitButtonText}>{t('yes')}</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Remove from Ship Confirmation Modal */}
            <Modal animationType="fade" transparent visible={removefromshipVisible} onRequestClose={closeRemoveModal}>
                <TouchableWithoutFeedback onPress={closeRemoveModal}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>{t('crew.removeFromShip')}</Text>
                            <Text style={styles.modalMessage}>
                                {t('crew.confirmRemove', {
                                    name: selectedUser?.fullName || t('crew.thisCrew')
                                })}
                            </Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={closeRemoveModal} disabled={actionLoading}>
                                    <Text style={styles.cancelButtonText}>{t('no')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.exitButton, actionLoading && styles.exitButtonDisabled]}
                                    onPress={handleRemoveFromShip}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? <CommonLoader color='#fff'/> : <Text style={styles.exitButtonText}>{t('yes')}</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default CrewListingScreen;

const styles = StyleSheet.create({
    main: { flex: 1 },
    crewlistView: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f5f5f5' },
    rowView: { gap: 10, flexDirection: 'row' },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", alignItems: "center" },
    filterButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 12 },
    filterButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    clearButton: { backgroundColor: '#f8f8f8', borderWidth: 1, borderColor: '#e0e0e0' },
    applyButton: { backgroundColor: Colors.lightGreen },
    clearButtonText: { color: '#666', fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium' },
    applyButtonText: { color: 'white', fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium' },
    modalContainer: { width: "80%", backgroundColor: "#ffffff", borderRadius: 15, padding: 20, alignItems: "center", elevation: 10, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
    modalTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold", lineHeight: 26, color: "#333333" },
    modalMessage: { fontSize: 14, color: "#666666", fontFamily: "Poppins-Regular", lineHeight: 24, textAlign: "center", marginVertical: 15 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingBottom: 10 },
    cancelButton: { flex: 1, marginRight: 10, paddingVertical: 12, borderRadius: 10, backgroundColor: "#cccccc", alignItems: "center" },
    cancelButtonText: { color: "#333333", fontFamily: "Poppins-SemiBold", lineHeight: 24, fontSize: 12, fontWeight: "600" },
    exitButton: { flex: 1, marginLeft: 10, paddingVertical: 12, borderRadius: 10, backgroundColor: "#042013", alignItems: "center", justifyContent: 'center' },
    exitButtonDisabled: { opacity: 0.7 },
    exitButtonText: { color: "#ffffff", fontSize: 12, fontFamily: "Poppins-SemiBold", lineHeight: 24 },
    profileIcon: { height: 50, width: 50, borderRadius: 50 },
    hobbiesText: { fontSize: 8, color: "#fff", fontFamily: "Poppins-Regular", fontWeight: "400", lineHeight: 12 },
    name: { fontSize: 12, fontFamily: "Poppins-SemiBold", lineHeight: 20 },
    designation: { fontSize: 10, color: "#636363", fontFamily: "Poppins-Regular", fontWeight: "400", lineHeight: 12 },
    nameanddesignationView: { gap: 4 },
    profileContainer: { position: 'relative' },
    onlineDot: { position: 'absolute', top: 1, left: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.darkGreen, borderWidth: 2, borderColor: '#fff', zIndex: 1 },
    dropdownStyle: { height: 50, borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, backgroundColor: '#f8f8f8', paddingHorizontal: 12 },
    dropdownPlaceholder: { fontSize: 12, color: '#666', fontFamily: 'Poppins-Regular' },
    dropdownSelectedText: { fontSize: 14, color: '#333', fontFamily: 'Poppins-Regular' },
    dropdownItemText: { fontSize: 14, color: '#333', fontFamily: 'Poppins-Regular' },
    filterIcon: { height: 20, width: 20, tintColor: 'rgba(69, 69, 69, 1)' },
    hobbiesView: { marginTop: 3, alignItems: "center", backgroundColor: Colors.lightGreen, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    bottomSheetBackground: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    handleIndicator: { backgroundColor: '#ccc', width: 40 },
    bottomSheetScrollContent: { paddingBottom: 30 },
    bottomSheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    bottomSheetTitle: { fontSize: 18, fontWeight: '600', color: '#333', fontFamily: 'Poppins-SemiBold' },
    bottomSheetContent: { paddingHorizontal: 16, paddingBottom: 30 },
    filterItem: { marginBottom: 10 },
    filterLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8, fontFamily: 'Poppins-SemiBold' },
    menuButton: { justifyContent: 'center' },
    optionsModalContainer: { width: '80%', backgroundColor: '#ffffff', borderRadius: 15, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
    optionModalItem: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    lastOptionItem: { borderBottomWidth: 0 },
    nocrewfound: { justifyContent: 'center', alignItems: 'center', marginTop: "50%" },
    optionModalText: { fontSize: 14, color: '#333', fontFamily: 'Poppins-Medium', textAlign: 'center' },
    optionModalTextDestructive: { fontSize: 14, color: '#d32f2f', fontFamily: 'Poppins-Medium', textAlign: 'center' },
});