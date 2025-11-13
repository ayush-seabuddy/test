import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ImagesAssets } from "@/src/utils/ImageAssets";

type HeaderBannerProps = {
  companyLogo?: string;
  isProMax?: boolean;
};

const HeaderBanner: React.FC<HeaderBannerProps> = ({ companyLogo, isProMax = false }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={[styles.topRow, isProMax && styles.topRowProMax]}>
        {/* Company Logo */}
        <View style={styles.logoContainer}>
          {companyLogo ? (
            <Image
              style={styles.companyLogo}
              resizeMode="contain"
              source={{ uri: companyLogo }}
            />
          ) : null}
        </View>

        {/* Partner Section */}
        <View style={styles.partnerContainer}>
          <Text style={styles.partnerText}>{t("inpartnershipwith")}</Text>
          <Image
            style={styles.partnerLogo}
            resizeMode="cover"
            source={ImagesAssets.sailorsocietyimage}
          />
        </View>
      </View>

      {/* Bottom Image */}
      <Image
        style={styles.illustrativeIcon}
        resizeMode="contain"
        source={ImagesAssets.homePageJollie}
      />
    </View>
  );
};

export default HeaderBanner;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    width: "100%",
    marginHorizontal: 15,
    justifyContent: "space-between",
    marginTop: 10,
  },
  topRowProMax: {
    marginTop: 35,
  },
  logoContainer: {
    padding: 20,
  },
  companyLogo: {
    width: 55,
    height: 55,
  },
  partnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
    gap: 5,
  },
  partnerText: {
    color: "gray",
    fontFamily: "Poppins-Regular",
    fontSize: 9,
  },
  partnerLogo: {
    width: 55,
    height: 55,
  },
 illustrativeIcon: {
    width: "80%",
    height: "85%",
  },
});
