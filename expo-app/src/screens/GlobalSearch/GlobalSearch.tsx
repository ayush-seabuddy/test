import { globalSearch } from '@/src/apis/apiService';
import ContentListing from '@/src/components/ContentListing';
import PostScreen from '@/src/components/PostScreen';
import { UserDetails } from '@/src/redux/userDetailsSlice';
import Colors from '@/src/utils/Colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { t } from 'i18next';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [activeSection, setActiveSection] = useState<'users' | 'posts' | 'bulletin' | 'read' | 'buddyup' | 'listen' | 'watch'>("users");
  const [post, setPost] = useState<PostInterface[]>([]);
  const sections = [
    { id: "users", title: "Users", dataKey: "users.usersList" },
    { id: "posts", title: "Posts", dataKey: "posts.hangoutsList" },
    { id: "bulletin", title: "Bulletin", dataKey: "announcements.allAnnouncements" },
    { id: "read", title: "Read", dataKey: "articles.allContents" },
    { id: "buddyup", title: "BuddyUp Events", dataKey: "groupActivities.groupActivityList" },
    { id: "listen", title: "Listen", dataKey: "musics.allContents" },
    { id: "watch", title: "Watch", dataKey: "videos.allContents" },
  ];

  const hasData = (key: string,section:{ id:string, title: string, dataKey: string }): {visible:boolean , section:{ id:string, title: string, dataKey: string }, data:any[]} => {
    try {
      const keys = key.split(".");
      let data = results;
      for (const k of keys) {
        data = data?.[k];
        if (!data) return {visible:false , section , data:[]};
      }
      const visible = Array.isArray(data) ? data.length > 0 : !!data;
      return {visible , section , data};

    } catch {
      return {visible:false , section , data:[]};
    }
  };

  const visibleSections = useMemo(
    () => sections.map((section) => hasData(section.dataKey,section)),
    [results]
  );
  const debounceTimeout = useRef<any>(null);

  const searchQuery = async (query: string) => {
    try {

      const response = await globalSearch(query);
      if (response.status === 200 && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
      }

    } catch (error) {

    }
  }
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const query = searchText.trim();

      searchQuery(query);
      // -----------------------------------------
    }, 3000); // 3 seconds

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchText]);

  const renderPosts = (postData: PostInterface[] ) => {
    return <FlatList
      data={postData}
      renderItem={({ item }) => (
        <PostScreen
          index={item.id}
          post={item}
          key={item.id}
          onPostDeleted={() => {
            setPost((prev) => prev.filter((p) => p.id !== item.id));
          }}
          i18nIsDynamicList={false}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
    />
  }

  const renderUsers = (userData: UserDetails[] ) => {
    return <FlatList
      data={userData}
      renderItem={({ item }) => (
        <RenderUsers item={item} />
      )}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
    />
  }
  const RenderUsers = ({ item }:{item: UserDetails}) => (
    <TouchableOpacity
      style={styles.userContainer}
      // onPress={() => router.push("/crewProfile")}
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
  );


 const renderSection = () => {
  const postData = visibleSections.find(section => section.section.id === 'posts')?.data || [];
  if(activeSection === 'posts') {
    return renderPosts(postData);
  }else if(activeSection === 'users') {
    const userData = visibleSections.find(section => section.section.id === 'users')?.data || [];
    return renderUsers(userData);
  }
  else if(activeSection === 'bulletin') {
    const bulletinData = visibleSections.find(section => section.section.id === 'bulletin')?.data || [];
    return <ContentListing data={bulletinData} />
  }else if(activeSection === 'read') {
    const readData = visibleSections.find(section => section.section.id === 'read')?.data || [];
    return <ContentListing data={readData} />
  }else if(activeSection === 'listen') {
    const listenData = visibleSections.find(section => section.section.id === 'listen')?.data || [];
    return <View style={styles.sectionContainer}><MusicCard data={listenData} /></View>
  }else if(activeSection === 'watch') {
    const watchData = visibleSections.find(section => section.section.id === 'watch')?.data || [];
    return <ContentListing data={watchData} />
  }
  return <><Text>{activeSection}</Text></>
 }

  return (
    <View style={styles.container}>
      {/* ---------- Header (always visible) ---------- */}
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
        </View>

        <View style={{ width: 24 }} /> {/* spacer for balance */}
      </View>

      {visibleSections.filter((section) => section.visible).length === 0 ? (
        <>
          <View style={[styles.emptyContainer, { flex: 1, justifyContent: "center" }]}>
            <Text style={styles.emptyText}>
              {t('norecordsfound')}
            </Text>
          </View>
        </>
      ) : (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContentContainer}
          >
            {visibleSections?.filter((section) => section.visible)?.map(({section}) => (
              <TouchableOpacity
                key={section.id}
                style={[styles.tab, activeSection === section.id && styles.activeTab]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text
                  style={[styles.tabText, activeSection === section.id && styles.activeTabText]}
                >
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>)

      }

      {renderSection()}



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
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
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
  content: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 50,
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 50,
  },
  resultItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 16,
    color: '#000',
  },
  emptyContainer: { justifyContent: "center", alignItems: "center", paddingVertical: 10 },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  rootContainer: { backgroundColor: "white", flex: 1 },
  scrollViewContent: { paddingBottom: 100 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 8 },
  contentContainerNoPadding: { paddingHorizontal: 0 },
  tabsContainer: { marginVertical: 10 },
  tabsContentContainer: { flexDirection: "row" },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  activeTab: { backgroundColor: Colors.lightGreen },
  tabText: { fontSize: 14, fontFamily: "Poppins-Regular", color: "#666" },
  activeTabText: { color: "white", fontFamily: "Poppins-Medium" },
  HeaderTitle: { fontSize: 16, fontFamily: "Poppins-Medium", color: "#06361F" },
  columnWrapper: { flexDirection: "row", justifyContent: "space-between" },

  // Announcement
  scrollView: { marginTop: 15, marginHorizontal: 4, marginBottom: 5 },
  frameParent: { flex: 1 },
  parentFlexBox: { alignItems: "center", flexDirection: "row", borderRadius: 16 },
  wrapperLayout: { height: 144, width: 355, borderRadius: 16, overflow: "hidden" },
  icon: { justifyContent: "space-between", padding: 16, height: "100%", width: "100%" },
  iconLayout: { height: 144, width: 355, borderRadius: 16, overflow: "hidden" },
  pointForCompletingTypo: { textAlign: "left", color: "#fff", lineHeight: 17, fontSize: 14 },
  layer1Icon: { width: 38, height: 38, position: "absolute", right: 20, top: 10 },
  weeklyMeeting: { fontFamily: "Poppins-Regular", color: "#fff" },
  deck: { fontFamily: "Poppins-SemiBold", fontWeight: "600" },
  weeklyMeetingDeckContainer: { alignSelf: "stretch" },

  // Cards
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    padding: 8,
    marginVertical: 6,
    marginRight: 4,
    marginLeft: 4,
  },
  cardContent: { overflow: "hidden", borderRadius: 10 },
  imageBackground: { height: 80, borderRadius: 10, justifyContent: "flex-end", padding: 8 },
  textContainer: { paddingVertical: 5 },
  titleText: { fontSize: 12, fontFamily: "Poppins-SemiBold", color: "#161616" },
  textColor: { color: "#161616" },

  // Music
  cardContainerMusic: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  cardContentMusic: { flexDirection: "row" },
  imageBackgroundMusic: { borderRadius: 10, width: 65 },
  textContainerMusic: { flexDirection: "row", padding: 12, justifyContent: "space-between", flex: 1 },
  titleTextMusic: { marginTop: 4, width: "70%", fontSize: 12, fontFamily: "Poppins-SemiBold", color: "#161616" },
  playButton: { justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: 8, height: 28, width: 28 },
  frameItemMusic: { width: 14, height: 14 },

  image: { height: 50, width: 50, borderRadius: 10 },
  name: { color: "#636363", fontFamily: "Poppins-SemiBold", fontSize: 14 },
  designation: { color: "#636363", fontFamily: "Poppins-Regular", fontSize: 12 },
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
  sectionContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
});

export default GlobalSearch;