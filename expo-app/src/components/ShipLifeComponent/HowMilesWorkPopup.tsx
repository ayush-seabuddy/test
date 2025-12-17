import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

const HowMilesWorkPopup = () => {
  const { t } = useTranslation();

  const tableData = [
    [t('miles'), t('badge')],
    [t('fivehundred'), t('beacon')],
    [t('onethousand'), t('harbour')],
    [t('twothousand'), t('chief_anchor')],
  ];

  return (
    <View>
      <Text style={styles.popupTitle}>{t('howmileswork')}</Text>
      <Text style={styles.popupText}>{t('howmileswork_description1')}</Text>
      <Text style={styles.popupText}>{t('howmileswork_description2')}</Text>

      <Text style={[styles.popupTitle, { marginTop: 10 }]}>{t('badgemilestones')}</Text>

      <View style={styles.table}>
        {tableData.map(([m, b], i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellHeader}>{m}</Text>
            <Text style={styles.cell}>{b}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default HowMilesWorkPopup

const styles = StyleSheet.create({
  popupTitle: { fontSize: 14, fontWeight: "bold", color: "#000", marginBottom: 6, fontFamily: "Poppins-SemiBold" },
  popupText: { fontSize: 12, lineHeight: 18, color: "#454545", fontFamily: "Poppins-Regular", marginBottom: 4 },
  table: { marginTop: 8, width: "100%" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  cellHeader: { fontWeight: "bold", fontSize: 12, width: "50%", fontFamily: "Poppins-SemiBold" },
  cell: { fontSize: 12, width: "50%", fontFamily: "Poppins-Regular" },
});
