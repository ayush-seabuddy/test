import { globalSearch } from '@/src/apis/apiService';
import BuddyUpEventList from '@/src/components/BuddyUpEventList';
import CommonLoader from '@/src/components/CommonLoader';
import ContentListing from '@/src/components/ContentListing';
import PostScreen from '@/src/components/PostScreen';
import { UserDetails } from '@/src/redux/userDetailsSlice';
import Colors from '@/src/utils/Colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { t } from 'i18next';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { PostInterface } from '../ContentDetails/type';
import MusicCard from '../companyLibrary/MusicCard';

const GlobalSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'users' | 'posts' | 'bulletin' | 'read' | 'buddyup' | 'listen' | 'watch'>("users");

  const sections = useMemo(() => [
    { id: "users" as const, title: "Users", dataKey: "users.usersList" },
    { id: "posts" as const, title: "Posts", dataKey: "posts.hangoutsList" },
    { id: "bulletin" as const, title: "Bulletin", dataKey: "announcements.allAnnouncements" },
    { id: "read" as const, title: "Read", dataKey: "articles.allContents" },
    { id: "buddyup" as const, title: "BuddyUp Events", dataKey: "groupActivities.groupActivityList" },
    { id: "listen" as const, title: "Listen", dataKey: "musics.allContents" },
    { id: "watch" as const, title: "Watch", dataKey: "videos.allContents" },
  ], []);

  const hasData = useCallback((key: string, section: typeof sections[0]): {
    visible: boolean,
    section: typeof sections[0],
    data: any[]
  } => {
    try {
      const keys = key.split(".");
      let data = results;
      for (const k of keys) {
        data = data?.[k];
        if (!data) return { visible: false, section, data: [] };
      }
      const visible = Array.isArray(data) ? data.length > 0 : !!data;
      return { visible, section, data: Array.isArray(data) ? data : [] };
    } catch {
      return { visible: false, section, data: [] };
    }
  }, [results]);

  const visibleSections = useMemo(
    () => sections.map((section) => hasData(section.dataKey, section)),
    [results, sections, hasData]
  );

  useEffect(() => {
    const isCurrentSectionVisible = visibleSections.find(
      (s) => s.section.id === activeSection
    )?.visible;

    if (!isCurrentSectionVisible) {
      const firstVisibleSection = visibleSections.find((s) => s.visible);
      if (firstVisibleSection) {
        setActiveSection(firstVisibleSection.section.id);
      }
    }
  }, [visibleSections, activeSection]);

  const debounceTimeout = useRef<NodeJS.Timeout | number | null>(null);

  const searchQuery = async (query: string) => {
    if (!query.trim()) {
      setResults({});
      return;
    }

    try {
      setLoading(true);
      const response = await globalSearch(query);
      if (response.status === 200 && response.data) {
        setResults(response.data);
      } else {
        setResults({});
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults({});
    } finally {
      setLoading(false);
    }
  };

  const handlePostReported = useCallback((reportedId: string | number) => {
    setResults((prev: any) => ({
      ...prev,
      posts: {
        ...prev.posts,
        hangoutsList: prev.posts?.hangoutsList?.filter(
          (p: PostInterface) => p.id !== reportedId
        ) || [],
      },
    }));
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const query = searchText.trim();

    if (!query) {
      setResults({});
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimeout.current = setTimeout(() => {
      searchQuery(query);
    }, 500); // Reduced to 500ms for better UX

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchText]);

  const renderPosts = useCallback((postData: PostInterface[]) => {
    return (
      <FlatList
        data={postData}
        renderItem={({ item }) => (
          <PostScreen
            index={item.id}
            post={item}
            key={item.id}
            onPostDeleted={() => {
              setResults((prev: any) => ({
                ...prev,
                posts: {
                  ...prev.posts,
                  hangoutsList: prev.posts?.hangoutsList?.filter((p: PostInterface) => p.id !== item.id) || [],
                },
              }));
            }}
            i18nIsDynamicList={false}
            onPostReported={handlePostReported}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    );
  }, [handlePostReported]);

  const renderUsers = useCallback((userData: UserDetails[]) => {
    return (
      <FlatList
        data={userData}
        renderItem={({ item }) => <RenderUsers item={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    );
  }, []);

  const RenderUsers = useCallback(({ item }: { item: UserDetails }) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() =>
        router.push({
          pathname: "/crewProfile",
          params: {
            crewId: item?.id,
          },
        })
      }
    >
      <Image
        source={{
          uri:
            item.profileUrl ||
            "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
        }}
        style={styles.image}
      />
      <View>
        <Text style={styles.name}>
          {item.fullName?.length > 22
            ? `${item.fullName.slice(0, 22)}...`
            : item.fullName || ""}
        </Text>
        <Text style={styles.designation}>{item.designation}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  const renderSection = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <CommonLoader fullScreen />
          <Text style={styles.loadingText}>{t('searching')}</Text>
        </View>
      );
    }

    const section = visibleSections.find(s => s.section.id === activeSection);
    const data = section?.data || [];

    switch (activeSection) {
      case 'posts':
        return renderPosts(data);
      case 'users':
        return renderUsers(data);
      case 'bulletin':
      case 'read':
      case 'watch':
        return <ContentListing data={data} />;
      case 'listen':
        return (
          <View style={styles.sectionContainer}>
            <MusicCard data={data} />
          </View>
        );
      case 'buddyup':
        // Ensure BuddyUpEventList properly wraps text content
        return <BuddyUpEventList ActivitiesData={data} />;
      default:
        return null;
    }
  }, [activeSection, visibleSections, loading, renderPosts, renderUsers]);

  const hasVisibleSections = useMemo(() =>
    visibleSections.some((section) => section.visible),
    [visibleSections]
  );

  return (
    <View style={styles.container}>
      {/* ---------- Header with Loading Indicator ---------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Search size={20} color="#B7B7B7" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('typetosearch')}
            placeholderTextColor="#B7B7B7"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {loading && (
            <CommonLoader />
          )}
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* ---------- Tabs Section ---------- */}
      {!loading && hasVisibleSections && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContentContainer}
          >
            {visibleSections
              .filter((section) => section.visible)
              .map(({ section }) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.tab,
                    activeSection === section.id && styles.activeTab
                  ]}
                  onPress={() => setActiveSection(section.id)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeSection === section.id && styles.activeTabText
                    ]}
                  >
                    {section.title}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {/* ---------- Content Section ---------- */}
      <View style={styles.contentContainer}>
        {!loading && !hasVisibleSections && searchText.trim() !== '' ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('norecordsfound')}
            </Text>
          </View>
        ) : (
          renderSection
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(183, 183, 183, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 39,
    color: '#000',
    paddingLeft: 10,
    paddingRight: 10,
  },
  headerLoader: {
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
  },
  tabsContainer: {
    marginVertical: 10,
  },
  tabsContentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  activeTab: {
    backgroundColor: Colors.lightGreen,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontFamily: "Poppins-Medium",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.darkGreen,
  },
  userContainer: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#E8E8E8",
    backgroundColor: "#ededed",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    gap: 10,
    alignItems: "center",
    marginHorizontal: 16,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  name: {
    color: "#636363",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  designation: {
    color: "#636363",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
});

export default GlobalSearch;