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

const Terms = () => {
  const navigation = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@seabuddy.com.sg');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins-SemiBold' }}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>SeaBuddy App – Terms and Conditions</Text>
        <Text style={styles.subText}>Last updated: June 6, 2025</Text>

        <Text style={styles.paragraph}>
          Welcome aboard! By creating an account or using SeaBuddy, you agree to the following Terms and Conditions. Please read them carefully before proceeding.
        </Text>

        <Text style={styles.subSectionTitle}>1. Your Agreement with SeaBuddy</Text>
        <Text style={styles.paragraph}>
          SeaBuddy is a mental health and community platform designed exclusively for seafarers. By using our app, you agree to these Terms, our Privacy Policy, and any updates we may issue from time to time. SeaBuddy is owned and operated by The Social Maritime Pte Ltd, registered in Singapore (UEN: 202403057M).
        </Text>

        <Text style={styles.subSectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          To use SeaBuddy, you must:{"\n"}
          - Be at least 18 years old.{"\n"}
          - Be a seafarer or employee associated with a shipping company.{"\n"}
          - Provide accurate and truthful information during onboarding and assessments.
        </Text>

        <Text style={styles.subSectionTitle}>3. Your Data & Privacy</Text>
        <Text style={styles.paragraph}>
          We take your peace of mind seriously. All your personal data, including mental health inputs and personality assessments, are kept confidential and secure. Only authorized personnel from SeaBuddy and your employer (if the account is employer-linked) can view anonymized or necessary information. We do not sell your data. For more details, refer to our Privacy Policy.
        </Text>

        <Text style={styles.subSectionTitle}>4. Purpose of Assessments</Text>
        <Text style={styles.paragraph}>
          The psychological assessments (e.g., Nautical Nature's Survey, Happiness Index Survery, Big Five test) are designed to provide supportive insights into your personality and well-being. These assessments:{"\n"}
          - Do not diagnose or treat mental illnesses.{"\n"}
          - Are meant to enhance your onboard experience and optimize role suitability.{"\n"}
          - May be used by your employer as a non-binding reference for crew placement or support.
        </Text>

        <Text style={styles.subSectionTitle}>5. Use of AI & Chatbots</Text>
        <Text style={styles.paragraph}>
          SeaBuddy includes AI features such as Jolli - your friendly AI companion. Jolli can:{"\n"}
          - Help you reflect on your mood{"\n"}
          - Suggest self-care content{"\n"}
          - Prompt you to log well-being updates{"\n"}
          Important: Jolli is not a licensed therapist. For real mental health concerns, please reach out to our human counselors or emergency helplines listed in the app.
        </Text>

        <Text style={styles.subSectionTitle}>6. Content & Interaction</Text>
        <Text style={styles.paragraph}>
          SeaBuddy is also your crew's private social network. You agree to:{"\n"}
          - Respect fellow crew members while posting or chatting.{"\n"}
          - Avoid uploading offensive, harmful, or illegal content.{"\n"}
          - Keep all communication professional, safe, and inclusive.{"\n"}
          SeaBuddy reserves the right to flag or remove inappropriate content and temporarily suspend or restrict access if necessary.
        </Text>

        <Text style={styles.subSectionTitle}>7. Gamified Activities & Rewards</Text>
        <Text style={styles.paragraph}>
          Points earned via Seafarer's Quest, mood logs, and group events will reflect on your profile leaderboard. These points may be used for recognition or rewards. Reward schemes may vary based on company policy or SeaBuddy incentives.{"\n"}
          Note: Participation is voluntary and meant to encourage well-being - no penalty exists for non-participation.
        </Text>

        <Text style={styles.subSectionTitle}>8. Counseling Services</Text>
        <Text style={styles.paragraph}>
          If your assessment results suggest follow-up counseling:{"\n"}
          - You may be contacted by a licensed SeaBuddy partner counselor.{"\n"}
          - Counseling is confidential and intended for personal development, not disciplinary action.{"\n"}
          - Your participation in counseling will never impact your employment status.
        </Text>

        <Text style={styles.subSectionTitle}>9. App Modifications & Availability</Text>
        <Text style={styles.paragraph}>
          SeaBuddy is continuously evolving. We may:{"\n"}
          - Add, remove, or modify features{"\n"}
          - Temporarily suspend access for maintenance or upgrades{"\n"}
          We'll do our best to notify you ahead of major changes.
        </Text>

        <Text style={styles.subSectionTitle}>10. Account Termination</Text>
        <Text style={styles.paragraph}>
          You may stop using SeaBuddy anytime. We reserve the right to suspend or terminate accounts that violate these Terms or cause harm to the community.
        </Text>

        <Text style={styles.subSectionTitle}>11. Limitations of Liability</Text>
        <Text style={styles.paragraph}>
          SeaBuddy is a supportive tool, not a medical or emergency service. We are not liable for:{"\n"}
          - Personal decisions made based on app content{"\n"}
          - Internet connectivity issues during use{"\n"}
          - Third-party service availability (e.g., helplines, counselors){"\n"}
          In emergencies, please use the 24/7 helpline or reach out to local medical professionals.
        </Text>

        <Text style={styles.subSectionTitle}>12. Feedback & Suggestions</Text>
        <Text style={styles.paragraph}>
          We love hearing from you! Any feedback submitted may be used to improve SeaBuddy. While we appreciate your ideas, we're not obligated to compensate for suggestions.
        </Text>

        <Text style={styles.subSectionTitle}>13. Jurisdiction</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by Singapore law. Any disputes shall be settled under the jurisdiction of Singapore courts.
        </Text>

        <Text style={styles.paragraph}>
          By clicking "Agree," you accept these Terms and start your journey with SeaBuddy - your companion at sea. Together, we're creating happier, healthier voyages.
        </Text>

        <Text style={styles.subSectionTitle}>14. Contact Information</Text>
        <Text style={styles.paragraph}>
          For any issues or questions about these terms, contact:{' '}
          <Text style={styles.link} onPress={handleEmailPress}>
            info@seabuddy.com.sg
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
    paddingTop: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
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