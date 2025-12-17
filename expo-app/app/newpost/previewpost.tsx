import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react-native'
import GlobalHeader from '@/src/components/GlobalHeader'
import Video from 'react-native-video'

const { width } = Dimensions.get('window')

type MediaItem =
  | string
  | {
    uri: string
    type?: 'image' | 'video'
  }

type TaggedUser = {
  id: string | number
  fullName: string
  profileUrl?: string
}

type FrameOption = {
  id: number
  label: string
  ratio: number
}

const frameOptions: FrameOption[] = [
  { id: 1, label: 'Landscape', ratio: 0.75 },
  { id: 2, label: 'Square', ratio: 1 },
  { id: 3, label: 'Portrait', ratio: 1.25 },
  { id: 4, label: 'Full', ratio: 1.5 },
]


const PreviewPostScreen: React.FC = () => {
  const { t } = useTranslation()

  const mediaFiles: MediaItem[] = [
    'https://img.freepik.com/free-photo/beautiful-lake-mountains_395237-44.jpg?semt=ais_hybrid&w=740&q=80',
    'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
  ]

  const caption = 'A beautiful view from the mountains 🌄'
  const hashtags = ['#nature', '#travel', '#mountains']
  const taggedUsers: TaggedUser[] = [
    {
      id: 1,
      fullName: 'John Doe',
      profileUrl:
        'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
    },
    {
      id: 2,
      fullName: 'Prince Singh',
      profileUrl:
        'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
    },
    {
      id: 3,
      fullName: 'Shyam Mohan Tripathi',
      profileUrl:
        'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
    },
    {
      id: 4,
      fullName: 'Vinay Gupta',
      profileUrl:
        'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
    },
  ]

  const [frame, setFrame] = useState<FrameOption>(frameOptions[1])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const renderMedia = ({ item }: { item: MediaItem }) => {
    const height = width * frame.ratio
    const uri = typeof item === 'string' ? item : item.uri
    const isVideo =
      typeof item === 'string'
        ? item.match(/\.(mp4|mov|avi)$/i)
        : item.type === 'video'

    return (
      <View style={[styles.mediaWrapper, { height }]}>
        {isVideo ? (
          <Video
            source={{ uri }}
            style={styles.media}
            resizeMode="cover"
            repeat
            muted
          />
        ) : (
          <Image
            source={{ uri }}
            style={styles.media}
            contentFit="cover"
          />
        )}
      </View>
    )
  }

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  return (
    <View style={styles.container}>
      <GlobalHeader title={t('previewpost')} leftIcon={<ChevronLeft />} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={mediaFiles}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderMedia}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />

        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {activeIndex + 1}/{mediaFiles.length}
          </Text>
        </View>

        <View style={styles.frameContainer}>
          {frameOptions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.frameButton,
                frame.id === item.id && styles.activeFrame,
              ]}
              onPress={() => setFrame(item)}
            >
              <Text
                style={[
                  styles.frameText,
                  frame.id === item.id && styles.activeText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {caption.length > 0 && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        )}

        {taggedUsers.length > 0 && (
          <View style={styles.taggedContainer}>
            <Text style={styles.sectionLabel}>
              {t('with')}:
            </Text>

            <View style={styles.taggedRow}>
              {taggedUsers.map(user => (
                <View key={user.id} style={styles.taggedUser}>
                  <Image
                    source={{ uri: user.profileUrl }}
                    style={styles.taggedAvatar}
                  />
                  <Text style={styles.taggedName}>
                    {user.fullName}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {hashtags.length > 0 && (
          <View style={styles.hashtagContainer}>
            {hashtags.map((tag, i) => (
              <Text key={i} style={styles.hashtag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default PreviewPostScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mediaWrapper: {
    width,
    backgroundColor: '#000',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  counterContainer: {
    position: 'absolute',
    top: 15,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  frameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  frameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeFrame: {
    backgroundColor: '#02130B',
  },
  frameText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  captionContainer: {
    padding: 16,
  },
  captionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    color: '#333',
  },
  taggedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  taggedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taggedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    paddingRight: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  taggedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  taggedName: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  hashtag: {
    color: '#1DA1F2',
    marginRight: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular'
  },
})
