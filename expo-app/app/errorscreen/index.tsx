import GlobalButton from '@/src/components/GlobalButton';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';

interface ErrorScreenProps {
    error?: any;
    onReload?: () => void;
    onGoHome?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
    error,
    onReload,
    onGoHome,
}) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const message =
        error?.message ?? String(error ?? 'An unexpected error occurred');

    const handleReload = async () => {
        try {
            setLoading(true);

            if (onReload) {
                onReload();
                return;
            }

            if (Platform.OS === 'web') {
                window.location.reload();
            } else {
                await Updates.reloadAsync();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={ImagesAssets.Somethingwentwrong}
                style={styles.image}
                contentFit="contain"
            />

            <GlobalButton
                title={loading ? t('reloading', 'Reloading...') : t('reloadapp')}
                onPress={handleReload}
                disabled={loading}
            />

            {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

            {onGoHome && (
                <TouchableOpacity onPress={onGoHome} style={styles.secondaryAction}>
                    <Text style={styles.secondaryText}>
                        {t('goHome', 'Go to Home')}
                    </Text>
                </TouchableOpacity>
            )}

            {!!message && (
                <TouchableOpacity
                    onPress={() => setShowDetails(prev => !prev)}
                    style={styles.detailsToggle}
                >
                    <Text style={styles.detailsToggleText}>
                        {showDetails
                            ? t('hideDetails', 'Hide details ▲')
                            : t('showDetails', 'Show details ▼')}
                    </Text>
                </TouchableOpacity>
            )}

            {showDetails && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{message}</Text>
                </View>
            )}
        </View>
    );
};

export default ErrorScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 400,
        height: 300,
        marginBottom: 24,
    },
    secondaryAction: {
        marginTop: 16,
    },
    secondaryText: {
        color: '#007AFF',
        fontSize: 14,
    },
    detailsToggle: {
        marginTop: 24,
    },
    detailsToggleText: {
        fontSize: 13,
        color: '#888',
    },
    errorBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FDECEA',
        borderRadius: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#B00020',
    },
});
