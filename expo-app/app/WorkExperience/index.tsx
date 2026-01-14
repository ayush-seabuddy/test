import { updateprofile, viewProfile } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import EmptyComponent from '@/src/components/EmptyComponent';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { Edit, Plus, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface WorkExperience {
    id: string;
    companyName: string;
    role: string;
    from: string;
    to: string;
}

interface UserDetails {
    id: string;
    authToken: string;
}

const { width } = Dimensions.get('screen');

const WorkExperienceScreen = () => {
    const { t } = useTranslation();
    const userDetails = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch();
    const [experiences, setExperiences] = useState<WorkExperience[]>(userDetails.workingExperience || []);
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const fetchProfileDetails = useCallback(async () => {
        try {
            const result = await viewProfile();
            if (result?.data) {
                const workingExp = result.data.workingExperience || [];
                setExperiences(workingExp);
                const object = result.data
                for (const property in object) {
                    dispatch(updateUserField({ key: property, value: object[property] }))
                }
            }

        } catch (error) {
            console.error('Error fetching profile details:', error);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fetchProfileDetails();
    }, []));

    const handleDelete = async () => {
        try {
            setLoading(true);

            const dbResult = await AsyncStorage.getItem('userDetails');
            if (!dbResult) throw new Error('No user details found');

            const user: UserDetails = JSON.parse(dbResult);

            const response = await updateprofile({
                userId: user.id,
                workingExperience: [{ id: deleteId, status: 'DELETE' }],
            });

            if (response.status === 200) {
                await fetchProfileDetails();
                showToast.success(t('success'), t('workingexperiencedeleted'));
            }
        } catch (error: any) {
            console.error('Delete error:', error.response?.data || error.message);
            showToast.error(t('error'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
            setModalVisible(false);
            setDeleteId('');
        }
    };

    const handleEditExperience = (item: WorkExperience) => {
        router.push({
            pathname: '/WorkExperience/addExperience',
            params: {
                id: item.id,
                companyName: item.companyName,
                role: item.role,
                from: item.from,
                to: item.to,
                isEdit: 'true'
            }
        });
    };

    const handleAddExperience = () => {
        router.push({
            pathname: '/WorkExperience/addExperience',
            params: {
                isEdit: 'false'
            }
        });
    };

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('shipboard_experience')}
                rightIcon={<Plus />}
                onRightPress={handleAddExperience}
            />

            <View style={styles.container}>
                <FlatList
                    data={experiences}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <EmptyComponent text={t('noexperienceadded')} />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.experienceCard}>
                            <View style={styles.experienceContent}>
                                <Text style={styles.companyName}>{item.role}</Text>
                                <Text style={styles.role}>{item.companyName}</Text>
                                <Text style={styles.duration}>{item.from} - {item.to}</Text>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={() => handleEditExperience(item)}
                                    style={styles.actionButton}
                                >
                                    <Edit size={20} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDeleteId(item.id);
                                        setModalVisible(true);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Trash2 size={20} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderText}>{t('deletexperience')}</Text>
                        <Text style={styles.modalText}>{t('deleteexperiencetitle')}</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setDeleteId('');
                                    setModalVisible(false);
                                }}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelText}>{t('no')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={styles.deleteButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CommonLoader color="#fff" />
                                ) : (
                                    <Text style={styles.deleteText}>{t('yes')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#ededed',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    experienceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 10,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    experienceContent: {
        flex: 1,
    },
    companyName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    role: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    duration: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        paddingTop: '50%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: width * 0.85,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalHeaderText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#000',
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 18,
        color: '#000',
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#ccc',
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: 'red',
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: '#000',
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
    },
    deleteText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
    },
});

export default WorkExperienceScreen;