import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

const Terms = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const handleEmailPress = () => {
        Linking.openURL('mailto:info@seabuddy.com.sg');
    };

    return (
        <View>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins-SemiBold' }}>{t('back')}</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>{t('termstitle')}</Text>
                <Text style={styles.subText}>{t('lastUpdated')}</Text>

                <Text style={styles.paragraph}>
                    {t('termssubdescription')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('youragreementwithseabuddy')}</Text>
                <Text style={styles.paragraph}>
                    {t('youragreementwithseabuddy_description')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('eligibility')}</Text>
                <Text style={styles.paragraph}>
                    {t('eligibility_description.useApp')}{"\n"}
                    - {t('eligibility_description.ageRequirement')}{"\n"}
                    - {t('eligibility_description.seafarerRequirement')}{"\n"}
                    - {t('eligibility_description.accurateInfoRequirement')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('yourdataandprivacy')}</Text>
                <Text style={styles.paragraph}>
                    {t('yourdataandprivacy_description')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('purposeofassessments')}</Text>
                <Text style={styles.paragraph}>
                    {t('purposeofassessments_description.description')}{"\n"}
                    - {t('purposeofassessments_description.noDiagnosis')}{"\n"}
                    - {t('purposeofassessments_description.enhanceExperience')}{"\n"}
                    - {t('purposeofassessments_description.employerUse')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('useofaiandchatbots')}</Text>
                <Text style={styles.paragraph}>
                    {t('useofaiandchatbots_description.description')}{"\n"}
                    - {t('useofaiandchatbots_description.reflectMood')}{"\n"}
                    - {t('useofaiandchatbots_description.suggestContent')}{"\n"}
                    - {t('useofaiandchatbots_description.promptUpdates')}{"\n"}
                    {t('useofaiandchatbots_description.disclaimer')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('contentandinteraction')}</Text>
                <Text style={styles.paragraph}>
                    {t('contentandinteraction_description.description')}{"\n"}
                    - {t('contentandinteraction_description.respectOthers')}{"\n"}
                    - {t('contentandinteraction_description.noOffensiveContent')}{"\n"}
                    - {t('contentandinteraction_description.professionalCommunication')}{"\n"}
                    {t('contentandinteraction_description.enforcement')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('gamifiedactivitiesandrewards')}</Text>
                <Text style={styles.paragraph}>
                    {t('gamifiedactivitiesandrewards_description.description')}{"\n"}
                    {t('gamifiedactivitiesandrewards_description.note')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('counselingservices')}</Text>
                <Text style={styles.paragraph}>
                    {t('counselingservices_description.description')}{"\n"}
                    - {t('counselingservices_description.contact')}{"\n"}
                    - {t('counselingservices_description.confidential')}{"\n"}
                    - {t('counselingservices_description.noImpact')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('appmodificationandavailability')}</Text>
                <Text style={styles.paragraph}>
                    {t('appmodificationandavailability_description.description')}{"\n"}
                    - {t('appmodificationandavailability_description.modifyFeatures')}{"\n"}
                    - {t('appmodificationandavailability_description.maintenance')}{"\n"}
                    {t('appmodificationandavailability_description.notification')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('accounttermination')}</Text>
                <Text style={styles.paragraph}>
                    {t('accounttermination_description')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('limitationsofliability')}</Text>
                <Text style={styles.paragraph}>
                    {t('limitationsofliability_description.description')}{"\n"}
                    - {t('limitationsofliability_description.personalDecisions')}{"\n"}
                    - {t('limitationsofliability_description.connectivityIssues')}{"\n"}
                    - {t('limitationsofliability_description.thirdPartyAvailability')}{"\n"}
                    {t('limitationsofliability_description.emergencyNote')}
                </Text>


                <Text style={styles.subSectionTitle}>{t('feedbackandsuggestions')}</Text>
                <Text style={styles.paragraph}>
                    {t('feedbackandsuggestions_description')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('jurisdiction')}</Text>
                <Text style={styles.paragraph}>
                    {t('jurisdiction_description')}
                </Text>

                <Text style={styles.subSectionTitle}>{t('contactinformation')}</Text>
                <Text style={styles.paragraph}>
                    {t('contactinformation_description.description')}{' '}
                    <Text
                        style={styles.link}
                        onPress={handleEmailPress}
                    >
                        {t('contactinformation_description.email')}
                    </Text>
                </Text>

            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 30 : 0,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        marginRight: 12,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
    },
    subText: {
        fontSize: 12,
        marginBottom: 20,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 10,
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
    },
    subSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
    },
    paragraph: {
        fontSize: 11,
        lineHeight: 22,
        color: '#444',
        fontFamily: 'Poppins-Regular',
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
        fontFamily: 'Poppins-Regular',
    },
});

export default Terms;