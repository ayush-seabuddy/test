import {
    addeditdeletebuddyupevent,
    getalladminbuddyupcategories,
    listallusersfortag,
    uploadfile
} from '@/src/apis/apiService'
import CommonLoader from '@/src/components/CommonLoader'
import GlobalButton from '@/src/components/GlobalButton'
import GlobalHeader from '@/src/components/GlobalHeader'
import { showToast } from '@/src/components/GlobalToast'
import BuddyCalendarModal from '@/src/components/Modals/BuddyCalendarModal'
import CreateCustomCategoryModal from '@/src/components/Modals/CreateCustomCategoryModal'
import Colors from '@/src/utils/Colors'
import { getUserDetails } from '@/src/utils/helperFunctions'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Image } from 'expo-image'
import ImagePicker from 'react-native-image-crop-picker'
import { router, useLocalSearchParams } from 'expo-router'
import {
    CalendarDays,
    CircleArrowRight,
    Hash,
    InfoIcon,
    MapPin,
    Plus,
    SquarePen,
    Users
} from 'lucide-react-native'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

type AllParticipants = {
    id: string
    fullName: string
    profileUrl: string | null
    designation: string
}

type AllEvents = {
    id: string
    categoryName: string
    categoryImage: string
    points: string
    creatorPoints: string
    isAdmin: boolean
    isDefault: boolean
    label?: string
    value?: string
}

type MediaItem = {
    uri: string
    type: any
    id: string
    isExisting?: boolean
    fileName?: any
    fileSize?: any
}

const CreateYourBuddyUpEvent = () => {
    const { t } = useTranslation()
    const params = useLocalSearchParams()
    const [eventDescription, setEventDescription] = useState('')
    const [eventLocation, setEventLocation] = useState<string | null>(null)
    const [eventType, setEventType] = useState<string | null>(null)
    const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null)
    const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)
    const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null)
    const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null)
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
    const [hashtagInput, setHashtagInput] = useState('')
    const [hashtags, setHashtags] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [allEvents, setAllEvents] = useState<AllEvents[]>([])
    const [availableUsers, setAvailableUsers] = useState<AllParticipants[]>([])
    const [selectedParticipants, setSelectedParticipants] = useState<AllParticipants[]>([])
    const [isFetchingUsers, setIsFetchingUsers] = useState(false)
    const [eventName, setEventName] = useState<string | null>(null)
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
    const [preEvent, setPreEvent] = useState<AllEvents>()
    const [defaultEventImage, setDefaultEventImage] = useState<string | null>(null)
    const [calendarModalVisible, setCalendarModalVisible] = useState(false)
    const [customCategoryModalVisible, setCustomCategoryModalVisible] = useState(false)
    const [dateSelected, setDateSelected] = useState(false)
    const [customCategories, setCustomCategories] = useState<AllEvents[]>([])
    const [preInvitedUserIds, setPreInvitedUserIds] = useState<string[]>([]);

    // Edit mode states
    const [isEditMode, setIsEditMode] = useState(false)
    const [existingEventId, setExistingEventId] = useState<string | null>(null)
    const [hasPrefilled, setHasPrefilled] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isFromCategoryList, setIsFromCategoryList] = useState(false)

    const mediaSheetRef = useRef<BottomSheetModal>(null)
    const participantsSheetRef = useRef<BottomSheetModal>(null)
    const hasFetchedEvents = useRef(false)

    const LOCATION_LIST = React.useMemo(() => [
        { label: t('officers_smoke_room'), value: "Officer's smoke room" },
        { label: t('crew_smoke_room'), value: "Crew smoke room" },
        { label: t('gymnasium'), value: "Gymnasium" },
        { label: t('poop_deck'), value: "Poop Deck" },
        { label: t('pool'), value: "Pool" },
        { label: t('crew_messroom'), value: "Crew Messroom" },
        { label: t('officer_messroom'), value: "Officer Messroom" },
        { label: t('activity_deck'), value: "Activity Deck" },
    ], [t])

    const EVENT_LIST = React.useMemo(() => [
        { label: t('public_all_crew'), value: 'Public (All Crew)' },
        { label: t('invite_buddy'), value: 'Invite Buddy' },
    ], [t])

    const snapPoints = ['25%']
    const participantsSnapPoints = ['70%']

    // Static "Create Your Own" option
    const CREATE_YOUR_OWN_OPTION = React.useMemo(() => ({
        id: 'create_your_own',
        categoryName: t('createyourown'),
        categoryImage: '',
        points: '0',
        creatorPoints: '0',
        isAdmin: false,
        isDefault: false,
        label: t('createyourown'),
        value: 'create_your_own',
        isCustomOption: true,
    }), [t])

    // Initialize component - runs once on mount
    useEffect(() => {
        console.log('DEBUG: Component mounted');
        console.log('DEBUG: Params received:', params);

        const initializeComponent = async () => {
            if (isInitialized) return;

            console.log('DEBUG: Initializing component');

            // Check if we're in edit mode
            if (params.editMode === 'true') {
                console.log('DEBUG: EDIT mode detected from params');
                setIsEditMode(true);
                setExistingEventId(params.eventId as string);

                // Set all params directly
                if (params.eventName) {
                    console.log('DEBUG: Setting eventName from params:', params.eventName);
                    setEventName(params.eventName as string);
                }
                if (params.categoryId) {
                    console.log('DEBUG: Setting selectedEventId from params:', params.categoryId);
                    setSelectedEventId(params.categoryId as string);
                }
                if (params.imageUrl) {
                    console.log('DEBUG: Setting defaultEventImage from params:', params.imageUrl);
                    setDefaultEventImage(params.imageUrl as string);
                }

                if (params.description) {
                    setEventDescription(params.description as string);
                }
                if (params.location) {
                    setEventLocation(params.location as string);
                }
                if (params.isPublic) {
                    setEventType(params.isPublic as string);
                }

                if (params.startDateTime) {
                    const start = moment(params.startDateTime as string);
                    setSelectedStartDate(start.format('YYYY-MM-DD'));
                    setSelectedStartTime(start.toDate());
                }
                if (params.endDateTime) {
                    const end = moment(params.endDateTime as string);
                    if (end.isValid() && end.isAfter(moment(params.startDateTime))) {
                        setSelectedEndDate(end.format('YYYY-MM-DD'));
                        setSelectedEndTime(end.toDate());
                    }
                }
                if (params.hashtags) {
                    try {
                        const tags = JSON.parse(params.hashtags as string);
                        if (Array.isArray(tags)) setHashtags(tags);
                    } catch (e) { }
                }

                if (params.invitedPeoples) {
                    try {
                        const invitedIds = JSON.parse(params.invitedPeoples as string);
                        if (Array.isArray(invitedIds)) {
                            setPreInvitedUserIds(invitedIds);
                        }
                    } catch (e) {
                        console.log("Could not parse invitedPeoples", e);
                    }
                }

                setDateSelected(true);
                setHasPrefilled(true);
            }
            // Check if we're coming from category list
            else if (params.isFromCategoryList === 'true') {
                console.log('DEBUG: FROM CATEGORY LIST detected');
                setIsFromCategoryList(true);

                if (params.selectedEventId) {
                    console.log('DEBUG: Setting selectedEventId from category:', params.selectedEventId);
                    setSelectedEventId(params.selectedEventId as string);
                }
                if (params.selectedEventName) {
                    console.log('DEBUG: Setting eventName from category:', params.selectedEventName);
                    setEventName(params.selectedEventName as string);
                }
                if (params.selectedEventImage) {
                    console.log('DEBUG: Setting defaultEventImage from category:', params.selectedEventImage);
                    setDefaultEventImage(params.selectedEventImage as string);
                }

                setHasPrefilled(true);
            }
            else {
                console.log('DEBUG: CREATE mode detected (normal)');
                setHasPrefilled(true);
            }

            setIsInitialized(true);
        };

        initializeComponent();
    }, []); // Empty dependency array - runs only once on mount

    // Fetch events after initialization
    useEffect(() => {
        if (isInitialized && !hasFetchedEvents.current) {
            console.log('DEBUG: Fetching events after initialization');
            getallbuddyevents();
        }
    }, [isInitialized]);

    const getallbuddyevents = async () => {
        if (hasFetchedEvents.current) {
            console.log('DEBUG: Skipping API call, already fetched');
            return;
        }

        console.log('DEBUG: getallbuddyevents called');
        console.log('DEBUG: Current state:', {
            isEditMode,
            isFromCategoryList,
            eventName,
            selectedEventId,
            defaultEventImage,
            hasPrefilled
        });

        setLoading(true);
        hasFetchedEvents.current = true;

        try {
            const apiResponse = await getalladminbuddyupcategories({ limit: 100 });

            if (apiResponse.success && apiResponse.status == 200) {
                const resultData = apiResponse.data;
                const eventsList = resultData?.groupActivityCategoriesList || [];

                const formattedEvents = eventsList.map((event: any) => ({
                    id: event.id,
                    categoryName: event.categoryName,
                    categoryImage: event.categoryImage,
                    points: event.points,
                    creatorPoints: event.creatorPoints,
                    isAdmin: event.isAdmin,
                    isDefault: event.isDefault,
                    label: event.categoryName,
                    value: event.id,
                    isCustomOption: false,
                }));

                // Combine API events with custom categories and add "Create Your Own" option
                const allEventsList = [...formattedEvents, ...customCategories, CREATE_YOUR_OWN_OPTION];
                setAllEvents(allEventsList);

                console.log('DEBUG: API response received. Formatted events count:', formattedEvents.length);

                if (isEditMode) {
                    console.log('DEBUG: EDIT mode processing');
                    // In edit mode, we should already have the correct event set from params
                    // Just verify that the event exists in the list
                    if (selectedEventId) {
                        const matchingEvent = formattedEvents.find((e: AllEvents) => e.id === selectedEventId);
                        if (matchingEvent) {
                            console.log('DEBUG: Matching event found in list:', matchingEvent.categoryName);
                            // Only update if not already set from params
                            if (!eventName) {
                                setEventName(matchingEvent.categoryName);
                            }
                            if (!defaultEventImage) {
                                setDefaultEventImage(matchingEvent.categoryImage);
                            }
                        }
                    }
                }
                else if (isFromCategoryList) {
                    console.log('DEBUG: FROM CATEGORY LIST processing');
                    // We already have the event data from params
                    // Just verify the event exists in the list
                    if (selectedEventId) {
                        const matchingEvent = formattedEvents.find((e: AllEvents) => e.id === selectedEventId);
                        if (matchingEvent) {
                            console.log('DEBUG: Matching event found in list for category selection:', matchingEvent.categoryName);
                            // Ensure we have the latest data
                            if (!eventName) {
                                setEventName(matchingEvent.categoryName);
                            }
                            if (!defaultEventImage) {
                                setDefaultEventImage(matchingEvent.categoryImage);
                            }
                        }
                    }
                }
                else {
                    console.log('DEBUG: NORMAL CREATE mode processing');
                    // Normal create mode: use first event as default only if not already set
                    if (formattedEvents.length > 0) {
                        const firstEvent = formattedEvents[0];
                        console.log('DEBUG: First event:', firstEvent.categoryName);

                        // Only set defaults if nothing is already set
                        if (!eventName && !selectedEventId && !defaultEventImage) {
                            console.log('DEBUG: Setting first event as default:', firstEvent.categoryName);
                            setEventName(firstEvent.categoryName);
                            setSelectedEventId(firstEvent.id);
                            setDefaultEventImage(firstEvent.categoryImage);
                        }
                        // If we have eventName or selectedEventId but no image, set image
                        else if ((eventName || selectedEventId) && !defaultEventImage) {
                            // Try to find the event that matches what we have
                            const eventToUse = selectedEventId
                                ? formattedEvents.find((e: any) => e.id === selectedEventId)
                                : firstEvent;

                            if (eventToUse && !defaultEventImage) {
                                setDefaultEventImage(eventToUse.categoryImage);
                            }
                        }
                    }
                }

                console.log('DEBUG: Final state after API:', {
                    eventName,
                    selectedEventId,
                    defaultEventImage,
                    isFromCategoryList
                });
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            showToast.error(t('oops'), t('somethingwentwrong'));
            hasFetchedEvents.current = false; // Reset on error
        } finally {
            setLoading(false);
        }
    }

    const isFormValid = () => {
        return (
            selectedEventId !== null &&
            selectedEventId !== 'create_your_own' &&
            eventDescription.trim() !== '' &&
            eventLocation !== null &&
            selectedStartDate !== null &&
            selectedStartTime !== null
        )
    }

    const handleEventSelect = (item: AllEvents, id?: string | null) => {
        console.log('DEBUG: handleEventSelect called with:', item);

        // Check if it's the "Create Your Own" option
        if (item.id === 'create_your_own') {
            setCustomCategoryModalVisible(true);
            if (id) {
                setPreEvent(allEvents.find(e => e.id === id))
            }
            return;
        } else {
            setEventName(item.categoryName)
            setSelectedEventId(item.id)
            if (!selectedMedia) {
                setDefaultEventImage(item.categoryImage)
            }
        }


    }

    const handleCustomCategoryCreated = (newCategory: AllEvents) => {
        console.log('DEBUG: New custom category created:', newCategory);

        // Add the new category to the custom categories list
        setCustomCategories(prev => [...prev, newCategory]);

        // Add to all events list
        setAllEvents(prev => [...prev.filter(item => item.id !== 'create_your_own'), newCategory, CREATE_YOUR_OWN_OPTION]);

        // Select the new category
        setEventName(newCategory.categoryName);
        setSelectedEventId(newCategory.id);
        setDefaultEventImage(newCategory.categoryImage || null);

        // Close the modal
        setCustomCategoryModalVisible(false);

        showToast.success(t('success'), t('custom_category_created'));
    }

    const handleCustomEventCancelled = () => {

        if (!preEvent || !preEvent.id) {
            return
        }


        // Add to all events list
        setAllEvents(prev => [...prev.filter(item => item.id !== preEvent.id && item.id !== 'create_your_own'), preEvent, CREATE_YOUR_OWN_OPTION]);

        // Select the new category
        setEventName(preEvent.categoryName);
        setSelectedEventId(preEvent.id);
        setDefaultEventImage(preEvent.categoryImage || null);

        // Close the modal
        setCustomCategoryModalVisible(false);
    }

    const handleDateSelect = (dates: {
        startDate: string
        endDate: string
        startTime: Date
        endTime: Date
    }) => {
        setSelectedStartDate(dates.startDate)
        setSelectedEndDate(dates.endDate)
        setSelectedStartTime(dates.startTime)
        setSelectedEndTime(dates.endTime)
        setDateSelected(true)
        setCalendarModalVisible(false)
    }

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.5}
            pressBehavior="close"
        />
    )

    const pickMedia = useCallback(async (type: 'camera' | 'gallery') => {
        try {
            mediaSheetRef.current?.close();

            const commonOptions: any = {
                cropping: true,
                freeStyleCropEnabled: true,
                cropperCircleOverlay: false,
                compressImageQuality: 0.7,
                mediaType: "photo",
                includeBase64: false,
                maxFiles: 1,
                forceJpg: false,
                width: 600,
                height: 600,
            }

            let result: any;
            if (type === 'camera') {
                result = await ImagePicker.openCamera(commonOptions)
            } else if (type === 'gallery') {
                result = await ImagePicker.openPicker({
                    ...commonOptions,
                    multiple: false,
                })
            } else {
                showToast.error(t('error'), t('invalidmediatype'));
                return;
            }

            if (result && result.path) {
                const mediaItem: MediaItem = {
                    uri: result.path,
                    type: result.mime || 'image/jpeg',
                    id: `${result.path}-${Date.now()}-${Math.random()}`,
                    fileName: result.filename || result.path.split('/').pop(),
                    fileSize: result.size,
                }
                // Reduce memory pressure by not storing image binary in state — only path/metadata
                setSelectedMedia(mediaItem)
                showToast.success(t('success'), t('mediaitemsadded', { count: 1 }))
            }
        } catch (error: any) {
            // image-crop-picker throws on cancel with message that may contain 'cancel' or 'User cancelled'
            const msg = String(error?.message || '')
            if (msg.toLowerCase().includes('cancel')) {
                // user cancelled — nothing to do
                return
            }
            console.error('Error picking media:', error)
            showToast.error(t('error'), t('imagePickFailed'))
        }
    }, [t])

    const removeCustomImage = () => {
        // try to cleanup temporary file from picker
        if (selectedMedia?.uri && ImagePicker.cleanSingle) {
            ImagePicker.cleanSingle(selectedMedia.uri).catch(() => { /* ignore */ })
        }
        setSelectedMedia(null)
        const currentEvent = allEvents.find(e => e.id === selectedEventId)
        if (currentEvent) {
            setDefaultEventImage(currentEvent.categoryImage)
        }
    }

    const addHashtag = () => {
        const tag = hashtagInput.trim()
        if (!tag) return

        const formatted = tag.startsWith('#') ? tag : `#${tag}`
        if (hashtags.includes(formatted)) {
            showToast.error(t('oops'), `${formatted} is already added`)
            return
        }

        setHashtags(prev => [...prev, formatted])
        setHashtagInput('')
    }

    const removeHashtag = (index: number) => {
        setHashtags(prev => prev.filter((_, i) => i !== index))
    }

    const formatDateTime = (date: string | null, time: Date | null) => {
        if (!date || !time) return ''
        return `${moment(date).format('MMM DD, YYYY')} • ${moment(time).format('hh:mm A')}`
    }

    const openTagSheet = useCallback(async () => {
        if (eventType !== 'Invite Buddy') return
        if (isFetchingUsers) return

        setIsFetchingUsers(true)

        try {
            const userData = await getUserDetails()

            const apiResponse = await listallusersfortag({
                shipId: userData.shipId,
            })

            if (apiResponse.success && apiResponse.status === 200) {
                const usersList = apiResponse.data?.usersList || []
                const filteredUsers = usersList.filter(
                    (user: any) => user.id !== userData.id
                )

                setAvailableUsers(filteredUsers)
                if (isEditMode && preInvitedUserIds.length > 0 && selectedParticipants.length === 0) {
                    const preSelected = filteredUsers.filter((user: any) =>
                        preInvitedUserIds.includes(user.id)
                    );

                    if (preSelected.length > 0) {
                        setSelectedParticipants(preSelected);
                        console.log(`Pre-selected ${preSelected.length} invited users`);
                    }
                }
                if (filteredUsers.length === 0) {
                    showToast.error(t('oops'), t('nousersboarded'))
                } else {
                    participantsSheetRef.current?.expand()
                }
            } else {
                showToast.error(
                    t('oops'),
                    apiResponse.message || 'Failed to fetch users'
                )
            }
        } catch (error: any) {
            console.log('Error fetching users:', error)
            showToast.error(t('error'), 'Failed to load users')
        } finally {
            setIsFetchingUsers(false)
        }
    }, [t, eventType, isFetchingUsers, preInvitedUserIds])



    const addTagUser = useCallback(async () => {
        try {
            const userData = await getUserDetails()

            const apiResponse = await listallusersfortag({
                shipId: userData.shipId,
            })


            if (apiResponse.success && apiResponse.status === 200) {
                const usersList = apiResponse.data?.usersList || []
                const filteredUsers = usersList.filter(
                    (user: any) => user.id !== userData.id
                )


                if (isEditMode && preInvitedUserIds.length > 0 && selectedParticipants.length === 0) {

                    const preSelected = filteredUsers.filter((user: any) =>
                        preInvitedUserIds.includes(user.id)
                    );

                    if (preSelected.length > 0) {
                        setSelectedParticipants(preSelected);
                    }
                }
            }
        } catch (error: any) {
            console.log('Error fetching users:', error)
            showToast.error(t('error'), 'Failed to load users')
        } finally {
        }
    }, [preInvitedUserIds])

    useEffect(() => {
        console.log('preInvitedUserIds changed:', preInvitedUserIds);

        addTagUser()
    }, [preInvitedUserIds])


    const toggleTagUser = useCallback((user: AllParticipants) => {
        setSelectedParticipants(prev =>
            prev.some(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        )
    }, [])

    const renderUserItem = useCallback(
        ({ item }: { item: AllParticipants }) => {
            const isSelected = selectedParticipants.some(u => u.id === item.id)
            return (
                <TouchableOpacity
                    style={[styles.userItem, isSelected && styles.selectedUserItem]}
                    onPress={() => toggleTagUser(item)}
                >
                    <Image
                        source={item.profileUrl ? { uri: item.profileUrl } : ImagesAssets.userIcon}
                        style={styles.userAvatar}
                        contentFit="cover"
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.fullName}</Text>
                        <Text style={styles.userDesignation}>{item.designation}</Text>
                    </View>
                </TouchableOpacity>
            )
        },
        [selectedParticipants, toggleTagUser]
    )

    const getDisplayImage = React.useCallback(() => {
        console.log('DEBUG: getDisplayImage memo - selectedMedia:', selectedMedia?.uri, 'defaultEventImage:', defaultEventImage);
        if (selectedMedia?.uri) {
            return { uri: selectedMedia.uri }
        }
        if (defaultEventImage) {
            return { uri: defaultEventImage }
        }
        return ImagesAssets.SeabuddyPlaceholder
    }, [selectedMedia?.uri, defaultEventImage])

    const handleCreateEvent = async () => {
        if (!isFormValid()) return

        setLoading(true)

        let finalImageUrl: string | null = defaultEventImage || null

        try {
            if (selectedMedia && selectedMedia.uri) {
                const uploadResponse = await uploadfile({
                    file: selectedMedia.uri,
                    fileName: selectedMedia.fileName,
                    fileSize: selectedMedia.fileSize,
                    type: selectedMedia.type
                })
                if (uploadResponse.success && uploadResponse.status === 200) {
                    finalImageUrl = uploadResponse.data
                    showToast.success(t('success'), t('imageuploadedsuccessfully'))
                } else {
                    setLoading(false)
                    showToast.error(t('oops'), t('somethingwentwrong') || t('failedtouploadimage'))
                    return
                }
            }

            const userData = await getUserDetails()

            const startDateTime = moment(selectedStartDate)
                .hour(selectedStartTime!.getHours())
                .minute(selectedStartTime!.getMinutes())
                .second(0)
                .millisecond(0)
                .format('YYYY-MM-DD HH:mm:ss');

            let endDateTime = startDateTime;
            if (selectedEndDate && selectedEndTime) {
                endDateTime = moment(selectedEndDate)
                    .hour(selectedEndTime.getHours())
                    .minute(selectedEndTime.getMinutes())
                    .second(0)
                    .millisecond(0)
                    .format('YYYY-MM-DD HH:mm:ss');
            }

            const imageUrls: string[] = []
            if (finalImageUrl) imageUrls.push(finalImageUrl)

            const joinedPeople = selectedParticipants.map(p => p.id)

            const payload = {
                groupActivities: [{
                    ...(isEditMode && existingEventId ? { eventId: existingEventId } : {}),
                    eventName: eventName,
                    description: eventDescription.trim(),
                    startDateTime,
                    endDateTime,
                    location: eventLocation,
                    imageUrls,
                    invitedPeoples: eventType === 'Invite Buddy' ? joinedPeople : [],
                    categoryId: selectedEventId,
                    hashtags: hashtags.length > 0 ? hashtags : undefined,
                    isPublic: eventType === 'Public (All Crew)',
                    shipId: userData.shipId,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }]
            }

            const apiResponse = await addeditdeletebuddyupevent(payload)

            if (apiResponse.success && apiResponse.status === 200) {
                const msg = isEditMode
                    ? t('activityupdatedsuccessfully') || 'Activity updated successfully'
                    : t('activitycreatedsuccessfully') || 'Activity created successfully'
                showToast.success(t('success'), msg)
                router.back()
            } else {
                showToast.error(t('oops'), apiResponse.message || (isEditMode ? 'Failed to update event' : 'Failed to create event'))
            }
        } catch (error: any) {
            console.error('Event operation error:', error)
            showToast.error(t('oops'), t('somethingwentwrong'))
        } finally {
            setLoading(false)
        }
    }

    const renderDropdownItem = React.useCallback((item: AllEvents) => {
        if (item.id === 'create_your_own') {
            return (
                <View style={[styles.dropdownItem, styles.createYourOwnItem]}>
                    <Plus color={Colors.lightGreen} size={20} />
                    <Text style={[styles.dropdownItemText, styles.createYourOwnText]}>{item.categoryName}</Text>
                </View>
            )
        }

        return (
            <View style={styles.dropdownItem}>
                {item.categoryImage && (
                    <Image
                        source={{ uri: item.categoryImage }}
                        style={styles.eventImageThumbnail}
                        contentFit="cover"
                    />
                )}
                <Text style={styles.dropdownItemText}>{item.categoryName}</Text>
            </View>
        )
    }, [])

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.main}>
                {isFetchingUsers && (
                    <View style={styles.globalLoaderOverlay}>
                        <View style={styles.globalLoaderContainer}>
                            <CommonLoader fullScreen />
                        </View>
                    </View>
                )}

                <GlobalHeader
                    title={isEditMode ? t('editbuddyup') : t('createbuddyup')}
                />

                <View style={{ position: 'relative' }}>
                    <Image
                        source={getDisplayImage()}
                        style={styles.buddyupeventImage}
                        contentFit="cover"
                    />
                    {selectedMedia && (
                        <TouchableOpacity style={styles.removeImageBtn} onPress={removeCustomImage}>
                            <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.editIconView}
                        onPress={() => mediaSheetRef.current?.expand()}
                    >
                        <SquarePen strokeWidth={1.5} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <ScrollView>
                    <View style={styles.formView}>
                        <Text style={styles.infoText}>
                            {t('hostanevent')}{' '}
                            <Text style={styles.boldText}>{t('25miles')}</Text>
                        </Text>
                        <Text style={styles.infoText}>{t('hostanevent_description')}</Text>

                        {/* Event Category Dropdown */}
                        {loading && allEvents.length === 0 ? (
                            <View style={styles.dropdownContainer}>
                                <MaterialIcons name="category" size={20} color={Colors.lightGreen} />
                                <View style={styles.loadingContainerInline}>
                                    <CommonLoader />
                                    <Text style={styles.loadingTextInline}>{t('loading')}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.dropdownContainer}>
                                <MaterialIcons name="category" size={20} color={Colors.lightGreen} />
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={[styles.placeholderStyle, { color: '#000' }]}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={allEvents}
                                    labelField="categoryName"
                                    valueField="id"
                                    placeholder={eventName || t('selectabuddyup')}
                                    value={selectedEventId}
                                    onChange={(item: AllEvents) => handleEventSelect(item, selectedEventId)}
                                    renderItem={renderDropdownItem}
                                />
                            </View>
                        )}

                        {/* Description */}
                        <View style={styles.dropdownContainer}>
                            <InfoIcon color={Colors.lightGreen} size={20} />
                            <View style={styles.inputView}>
                                <TextInput
                                    placeholder={t('addeventdescription')}
                                    placeholderTextColor="grey"
                                    style={styles.textInput}
                                    value={eventDescription}
                                    onChangeText={setEventDescription}
                                    multiline
                                />
                            </View>
                        </View>

                        {/* Location */}
                        <View style={styles.dropdownContainer}>
                            <MapPin color={Colors.lightGreen} size={20} />
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                data={LOCATION_LIST}
                                labelField="label"
                                valueField="value"
                                placeholder={t('selectlocation')}
                                value={eventLocation}
                                onChange={item => setEventLocation(item.value)}
                            />
                        </View>

                        {/* Date Selection */}
                        {!dateSelected ? (
                            <TouchableOpacity
                                style={styles.dropdownContainer}
                                onPress={() => setCalendarModalVisible(true)}
                            >
                                <View style={styles.dateRow}>
                                    <View style={styles.dateLeft}>
                                        <CalendarDays color={Colors.lightGreen} size={20} />
                                        <Text style={styles.placeholderStyle}>{t('date')}</Text>
                                    </View>
                                    <CircleArrowRight color={Colors.lightGreen} size={20} />
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.dropdownContainer}
                                    onPress={() => setCalendarModalVisible(true)}
                                >
                                    <View style={styles.dateRow}>
                                        <View style={styles.dateLeft}>
                                            <CalendarDays color={Colors.lightGreen} size={20} />
                                            <Text style={styles.selectedTextStyle}>
                                                {t('startdate')}: {formatDateTime(selectedStartDate, selectedStartTime)}
                                            </Text>
                                        </View>
                                        <CircleArrowRight color={Colors.lightGreen} size={20} />
                                    </View>
                                </TouchableOpacity>

                                {(selectedEndDate || selectedEndTime) && (
                                    <TouchableOpacity
                                        style={styles.dropdownContainer}
                                        onPress={() => setCalendarModalVisible(true)}
                                    >
                                        <View style={styles.dateRow}>
                                            <View style={styles.dateLeft}>
                                                <CalendarDays color={Colors.lightGreen} size={20} />
                                                <Text style={styles.selectedTextStyle}>
                                                    {t('enddate')}: {formatDateTime(selectedEndDate, selectedEndTime)}
                                                </Text>
                                            </View>
                                            <CircleArrowRight color={Colors.lightGreen} size={20} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}

                        {/* Event Type */}
                        <View style={styles.dropdownContainer}>
                            <Users color={Colors.lightGreen} size={20} />
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                data={EVENT_LIST}
                                labelField="label"
                                valueField="value"
                                placeholder={t('selecteventtype')}
                                value={eventType}
                                onChange={item => {
                                    setEventType(item.value)
                                    if (item.value !== 'Invite Buddy') {
                                        setSelectedParticipants([])
                                    }
                                }}
                            />
                        </View>

                        {/* Participants (Invite Only) */}
                        {eventType === 'Invite Buddy' && (
                            <TouchableOpacity
                                style={styles.dropdownContainer}
                                onPress={openTagSheet}
                                disabled={isFetchingUsers}
                            >
                                <View style={styles.dateRow}>
                                    <View style={styles.dateLeft}>
                                        <Users color={Colors.lightGreen} size={20} />
                                        {selectedParticipants.length === 0 ? (
                                            <Text style={styles.placeholderStyle}>{t('addparticipants')}</Text>
                                        ) : (
                                            <View style={styles.avatarContainer}>
                                                {selectedParticipants.slice(0, 3).map((user, index) => (
                                                    <Image
                                                        key={user.id}
                                                        source={user.profileUrl ? { uri: user.profileUrl } : ImagesAssets.userIcon}
                                                        style={[
                                                            styles.overlappingAvatar,
                                                            { marginLeft: index === 0 ? 0 : -14 }
                                                        ]}
                                                        contentFit="cover"
                                                    />
                                                ))}
                                                {selectedParticipants.length > 3 && (
                                                    <View style={[styles.overlappingAvatar, styles.plusAvatar]}>
                                                        <Text style={styles.plusText}>
                                                            +{selectedParticipants.length - 3}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                    <CircleArrowRight color={Colors.lightGreen} size={20} />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Hashtags */}
                        <View style={styles.dropdownContainer}>
                            <Hash color={Colors.lightGreen} size={20} />
                            <View style={styles.hashtagInputContainer}>
                                <TextInput
                                    placeholder={t('addhashtags')}
                                    placeholderTextColor="grey"
                                    style={styles.hashtagInput}
                                    value={hashtagInput}
                                    onChangeText={setHashtagInput}
                                    onSubmitEditing={addHashtag}
                                />
                                <TouchableOpacity onPress={addHashtag} disabled={!hashtagInput.trim()}>
                                    <Text
                                        style={[
                                            styles.addHashtagBtn,
                                            !hashtagInput.trim() && styles.disabledAddHashtagText,
                                        ]}
                                    >
                                        {t('plusAdd')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.hashtagsList}>
                            {hashtags.map((tag, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.hashtagPill}
                                    onPress={() => removeHashtag(index)}
                                >
                                    <Text style={styles.hashtagText}>{tag}</Text>
                                    <Text style={styles.hashtagRemove}>×</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Submit Button */}
                        <GlobalButton
                            title={isEditMode ? t('updateActivity') : t('createActivity')}
                            onPress={handleCreateEvent}
                            disabled={!isFormValid() || loading}
                            loading={loading}
                        />
                    </View>
                </ScrollView>

                {/* Calendar Modal */}
                <BuddyCalendarModal
                    visible={calendarModalVisible}
                    onClose={() => setCalendarModalVisible(false)}
                    onDateSelect={handleDateSelect}
                    prefillStartDate={selectedStartDate || undefined}
                    prefillEndDate={selectedEndDate || undefined}
                    prefillStartTime={selectedStartTime?.toISOString() || undefined}
                    prefillEndTime={selectedEndTime?.toISOString() || undefined}
                />

                {/* Custom Category Modal */}
                <CreateCustomCategoryModal
                    visible={customCategoryModalVisible}
                    onClose={() => {
                        let eventId = selectedEventId
                        setSelectedEventId(eventId)
                        handleCustomEventCancelled()
                        setCustomCategoryModalVisible(false)
                    }
                    }
                    onCategoryCreated={handleCustomCategoryCreated}
                />

                {/* Media Picker Bottom Sheet */}
                <BottomSheet
                    ref={mediaSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    enablePanDownToClose
                    handleIndicatorStyle={{ height: 3, backgroundColor: '#ededed', width: 50 }}
                >
                    <BottomSheetView style={styles.sheetContent}>
                        <Text style={[styles.sheetTitle, { marginBottom: 10 }]}>{t('selectImage')}</Text>
                        <TouchableOpacity style={styles.sheetBtn} onPress={() => pickMedia('camera')}>
                            <Text style={styles.sheetBtnText}>{t('takephoto')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetBtn} onPress={() => pickMedia('gallery')}>
                            <Text style={styles.sheetBtnText}>{t('choosefromgallery')}</Text>
                        </TouchableOpacity>
                        {selectedMedia && (
                            <TouchableOpacity style={styles.cancelBtn} onPress={removeCustomImage}>
                                <Text style={[styles.cancelText, { color: 'red' }]}>{t('removephoto')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => mediaSheetRef.current?.close()}>
                            <Text style={styles.cancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheet>

                {/* Participants Bottom Sheet */}
                <BottomSheet
                    ref={participantsSheetRef}
                    index={-1}
                    snapPoints={participantsSnapPoints}
                    enablePanDownToClose
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ height: 3, backgroundColor: '#ededed', width: 50 }}
                >
                    <View style={styles.tagSheetHeader}>
                        <Text style={styles.sheetTitle}>{t('tagpeople')}</Text>
                        <TouchableOpacity
                            style={[
                                styles.doneBtn,
                                selectedParticipants.length === 0 && styles.disabledDoneBtn,
                            ]}
                            onPress={() => participantsSheetRef.current?.close()}
                            disabled={selectedParticipants.length === 0}
                        >
                            <Text style={styles.doneText}>{t('done')}</Text>
                        </TouchableOpacity>
                    </View>

                    {availableUsers.length === 0 && !isFetchingUsers ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>{t('nousersboarded')}</Text>
                        </View>
                    ) : (
                        <BottomSheetFlatList
                            data={availableUsers}
                            keyExtractor={(item: any) => item.id}
                            renderItem={renderUserItem}
                            contentContainerStyle={styles.flatListContent}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews
                        />
                    )}
                </BottomSheet>
            </View>
        </KeyboardAvoidingView>
    )
}

export default React.memo(CreateYourBuddyUpEvent)

const styles = StyleSheet.create({
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    main: {
        flex: 1,
        backgroundColor: '#ededed',
    },
    buddyupeventImage: {
        height: 250,
        width: '100%',
    },
    editIconView: {
        position: 'absolute',
        top: 190,
        right: 25,
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 7,
        borderColor: '#ededed',
        borderWidth: 1,
    },
    divider: {
        height: 2,
        backgroundColor: '#ededed',
    },
    formView: {
        padding: 16,
    },
    infoText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginHorizontal: 8,
    },
    boldText: {
        fontFamily: 'Poppins-SemiBold',
    },
    dropdownContainer: {
        marginTop: 10,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 0.3,
        borderColor: 'grey',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 10,
    },
    inputView: {
        flex: 1,
    },
    dropdown: {
        flex: 1,
        height: 50,
    },
    placeholderStyle: {
        fontSize: 14,
        color: 'grey',
        fontFamily: 'Poppins-Regular',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    textInput: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        minHeight: 40,
    },
    dateRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    hashtagInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hashtagInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    addHashtagBtn: {
        fontSize: 14,
        color: Colors.lightGreen,
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 10,
    },
    disabledAddHashtagText: {
        color: 'grey',
    },
    hashtagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginVertical: 10,
    },
    hashtagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FBCF21',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        gap: 6,
    },
    hashtagText: {
        fontSize: 11,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    hashtagRemove: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    sheetContent: {
        paddingHorizontal: 20,
        flex: 1
    },
    sheetTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
    sheetBtn: {
        padding: 12,
        borderWidth: 0.5,
        borderColor: 'grey',
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    sheetBtnText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    },
    cancelBtn: {
        alignItems: 'center'
    },
    cancelText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 20,
        fontFamily: 'Poppins-Regular'
    },
    tagSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    doneBtn: {
        backgroundColor: Colors.lightGreen,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 5,
    },
    disabledDoneBtn: {
        backgroundColor: '#aaaaaa'
    },
    doneText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold'
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ededed',
        marginVertical: 4,
        borderRadius: 10,
    },
    selectedUserItem: {
        backgroundColor: '#ededed',
        borderColor: '#ededed',
    },
    userAvatar: {
        width: 35,
        height: 35,
        borderRadius: 25
    },
    userInfo: {
        flex: 1,
        marginLeft: 15
    },
    userName: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
    },
    userDesignation: {
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        color: '#777',
        marginTop: 2,
    },
    flatListContent: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    globalLoaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    globalLoaderContainer: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    dropdownItem: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dropdownItemText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#000',
        flex: 1,
    },
    eventImageThumbnail: {
        width: 30,
        height: 30,
        borderRadius: 5,
    },
    loadingContainerInline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    loadingTextInline: {
        fontSize: 14,
        color: 'grey',
        fontFamily: 'Poppins-Regular',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    overlappingAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#fff',
    },
    plusAvatar: {
        backgroundColor: Colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -14,
    },
    plusText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
    },
    createYourOwnItem: {
        backgroundColor: Colors.lightGreen + '15',
    },
    createYourOwnText: {
        color: Colors.lightGreen,
        fontFamily: 'Poppins-SemiBold',
    },
})