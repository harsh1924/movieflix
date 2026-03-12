/* eslint-disable react-hooks/exhaustive-deps */
import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchSearchResults } from '@/services/api'
import useFetch from '@/services/useFetch'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter()

  const {
    data: results,
    loading: resultsLoading,
    error: resultsError,
    refetch: loadResults,
    reset
  } = useFetch(() => fetchSearchResults({
    query: searchQuery
  }), [], false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadResults();
      } else reset();
    }, 500)

    return () => clearTimeout(timeoutId);

  }, [searchQuery])

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode='cover' />

      <FlatList
        data={results}
        renderItem={({ item }) => {
          if (item.media_type === 'person') {
            return (
              <View className='flex-1 w-[30%] mb-3'>
                <TouchableOpacity
                  className='text-white text-sm'
                  onPress={() =>
                    router.push({
                      pathname: '/actors/[id]',
                      params: { id: String(item.id) },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: item.profile_path
                        ? `https://image.tmdb.org/t/p/w500${item.profile_path}`
                        : 'https://placeholder.co/600x900/1a1a1a/ffffff.png',
                    }}
                    className='w-full h-52 rounded-lg'
                    resizeMode='cover'
                  />

                  <Text className='text-sm-center font-bold text-white mt-2' numberOfLines={1}>
                    {item.name || 'Unknown Actor'}
                  </Text>

                  <Text className='text-xs text-light-300 font-medium mt-1' numberOfLines={1}>
                    {item.known_for_department || 'Actor'}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }

          return (
            <MovieCard
              id={item.id}
              title={item.title || item.name || 'Untitled'}
              poster_path={item.poster_path ?? ''}
              vote_average={item.vote_average ?? 0}
              release_date={item.release_date || item.first_air_date || ''}
              media_type={item.media_type === 'tv' ? 'tv' : 'movie'}
            />
          )
        }}
        keyExtractor={(item) => item.id.toString()}
        className='px-5'
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className='w-full flex-row justify-center mt-20 items-center'>
              <Image source={icons.logo} className='w-12 h-10' />
            </View>
            <View className='my-5' focusable>
              <SearchBar
                placeholder='Search Movies, TV shows, Actors...'
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
                autoFocus={true}
              />
            </View>

            {resultsLoading && (
              <ActivityIndicator size="large" color="#0000ff" className='my-3' />
            )}
            {resultsError && (
              <Text className='text-red-500 px-5 my-3'>Error: {resultsError.message}</Text>
            )}

            {!resultsLoading && !resultsError && searchQuery.trim() && results?.length > 0 && (
              <Text className='text-xl text-white font-bold'>
                Search Results for {" "}
                <Text className='text-accent'>{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <>
            {!resultsLoading && !resultsError ? (
              <View className='mt-10 px-5'>
                <Text className='text-center text-gray-400'>{searchQuery.trim() ? 'No movies, TV shows, or actors found' : 'Search for a movie, TV show, or actor'}</Text>
              </View>
            ) : null}
          </>
        }
      />
    </View>
  )
}

export default Search