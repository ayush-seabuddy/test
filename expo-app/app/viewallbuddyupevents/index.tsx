import BuddyUpEventList from '@/src/components/BuddyUpEventList';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const AllBuddyUpEvents = () => {
    const { eventType } = useLocalSearchParams<{ eventType: 'ON_GOING' | 'PAST' | 'REQUESTED' }>();
    return (
        <BuddyUpEventList from='shiplifescreen' type={eventType} />
    )
}

export default AllBuddyUpEvents