
import { getallcontents } from '@/src/apis/apiService'
import GlobalHeader from '@/src/components/GlobalHeader'
import { showToast } from '@/src/components/GlobalToast'
import { router } from 'expo-router'
import { t } from 'i18next'
import { ChevronRight } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import RelatedContentCard from '../ContentDetails/RelatedContentCard'
import CompanyAnnouncements from './CompanyAnnouncements'
import MusicCard from './MusicCard'

const CompanyLibrary = () => {
    const contentList = ["MUSIC", "READ", "VIDEO"];
    const [loading, setLoading] = React.useState(true);
    const [contentListData, setContentListData] = React.useState({

        MUSIC: [],
        READ: [],
        VIDEO: []
    });


    const getContentList = async (item: string) => {
        try {
            const apiResponse = await getallcontents({
                page: 1,
                limit: 10,
                contentCategory: "COMPANY_LIBRARY",
                contentType: item
            });
            if (apiResponse.success && apiResponse.status === 200) {
                console.log("apiResponse.data.allContents: ", apiResponse.data.allContents);
                setContentListData((prevData) => ({
                    ...prevData,
                    [item]: apiResponse.data.allContents
                }))
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            console.log('Error', error)
            showToast.error(t('oops'), t('somethingwentwrong'));
        }
    };

    useEffect(() => {
        try {
            setLoading(true);
            contentList.forEach(async (item) => {
                await getContentList(item);
            });

        } catch (error) {
            console.log('Error', error)

        } finally {
            setLoading(false);
        }

    }, []);

    return (
        <View style={{ flex: 1 }}>
            <GlobalHeader title={t("companyLibrary")} />
            <ScrollView>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginVertical: 10,
                    paddingHorizontal: 14,
                }}
            >
                <Text
                    style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                    }}
                >
                        {t('bulletin')}
                </Text>
            </View>
            <CompanyAnnouncements />
            {contentListData?.VIDEO?.length > 0 && <>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical: 10,
                        paddingHorizontal: 14,
                    }}
                >
                    <Text
                        style={{
                            lineHeight: 22,
                            fontSize: 18,
                            fontWeight: "500",
                            color: "black",
                            fontFamily: "WhyteInktrap-Medium",
                        }}
                    >
                            {t('watch')}
                    </Text>
                    {contentListData?.VIDEO?.length > 3 && (
                        <TouchableOpacity
                            onPress={() => {
                                router.push({
                                    pathname: "/companyContentList",
                                    params: {
                                        title: `Watch`,
                                        contentType: `VIDEO`
                                    },
                                });
                            }}
                        >
                            <ChevronRight size={24} />
                        </TouchableOpacity>
                    )}
                </View>
                {!loading && <View style={{ paddingHorizontal: 16 }}>
                    <RelatedContentCard data={contentListData?.VIDEO} />
                </View>}


            </>}

            {contentListData?.MUSIC?.length > 0 && <>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical: 10,
                        paddingHorizontal: 14,
                    }}
                >
                    <Text
                        style={{
                            lineHeight: 22,
                            fontSize: 18,
                            fontWeight: "500",
                            color: "black",
                            fontFamily: "WhyteInktrap-Medium",
                        }}
                    >
                            {t('listen')}
                    </Text>
                    {contentListData?.MUSIC?.length > 3 && (
                        <TouchableOpacity
                            onPress={() => {
                                router.push({
                                    pathname: "/companyContentList",
                                    params: {
                                        title: `Listen`,
                                        contentType: `MUSIC`
                                    },
                                });
                            }}
                        >
                            <ChevronRight size={24} />
                        </TouchableOpacity>
                    )}
                </View>
                    {!loading &&
                        <MusicCard data={contentListData?.MUSIC} />}

            </>}


            {contentListData?.READ?.length > 0 && <>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical: 10,
                        paddingHorizontal: 14,
                    }}
                >
                    <Text
                        style={{
                            lineHeight: 22,
                            fontSize: 18,
                            fontWeight: "500",
                            color: "black",
                            fontFamily: "WhyteInktrap-Medium",
                        }}
                    >
                            {t('read')}
                    </Text>
                    {contentListData?.READ?.length > 3 && (
                        <TouchableOpacity
                            onPress={() => {
                                router.push({
                                    pathname: "/companyContentList",
                                    params: {
                                        title: `Read`,
                                        contentType: `READ`
                                    },
                                });
                            }}
                        >
                            <ChevronRight size={24} />
                        </TouchableOpacity>
                    )}
                </View>
                {!loading && <View style={{ paddingHorizontal: 16 }}>
                    <RelatedContentCard data={contentListData?.READ} />
                </View>}


                </>}
            </ScrollView>
        </View>
    )
}

export default CompanyLibrary