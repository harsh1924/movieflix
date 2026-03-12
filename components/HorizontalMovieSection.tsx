import { icons } from '@/constants/icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

type HorizontalMedia = {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  vote_average: number
}

type HorizontalMovieSectionProps = {
  title: string
  movies: HorizontalMedia[]
  sectionKey: string
  mediaType?: 'movie' | 'tv'
  enableNavigation?: boolean
  showAllCategory?: string
}

const HorizontalMovieSection = ({
  title,
  movies,
  sectionKey,
  mediaType = 'movie',
  enableNavigation = true,
  showAllCategory,
}: HorizontalMovieSectionProps) => {
  const router = useRouter()

  if (!movies?.length) return null

  return (
    <View className="mt-3">
      <View className="flex-row items-center justify-between mt-4 mb-3">
        <Text className="text-lg text-white font-bold">
          {title}
        </Text>

        {showAllCategory ? (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/list/[category]',
                params: { category: showAllCategory },
              })
            }
            activeOpacity={0.8}
          >
            <Text className="text-accent font-semibold text-sm">Show All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={movies.slice(0, 10)}
        keyExtractor={(item) => `${sectionKey}-${item.id}`}
        renderItem={({ item }) => {
          const cardTitle = item.title || item.name || 'Untitled'

          return (
          <TouchableOpacity
            className="mr-4 w-[120px]"
            onPress={() => {
              if (!enableNavigation) return
              if (mediaType === 'movie') {
                router.push({
                  pathname: '/movies/[id]',
                  params: { id: String(item.id) },
                })
              }
              if (mediaType === 'tv') {
                router.push({
                  pathname: '/tv/[id]',
                  params: { id: String(item.id) },
                })
              }
            }}
            activeOpacity={enableNavigation ? 0.7 : 1}
          >
            <View className="relative">
              <Image
                source={{
                  uri: item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : 'https://placeholder.co/200x300',
                }}
                className="w-full h-52 rounded-lg"
                resizeMode="cover"
              />

              <View className="absolute top-2 right-2 flex-row items-center bg-black/75 px-2 py-1 rounded-md">
                <Image source={icons.star} className="size-3 mr-1" />
                <Text className="text-white text-xs font-semibold">
                  {item.vote_average?.toFixed(1)}
                </Text>
              </View>
            </View>

            <Text className="text-white text-sm mt-2 font-semibold" numberOfLines={2}>
              {cardTitle}
            </Text>
          </TouchableOpacity>
          )
        }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

export default HorizontalMovieSection
