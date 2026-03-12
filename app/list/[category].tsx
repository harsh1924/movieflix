import MovieCard from '@/components/MovieCard'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import {
    fetchPopularMovies,
    fetchPopularTV,
    fetchTopRatedMovies,
    fetchTopRatedTV,
} from '@/services/api'
import useFetch from '@/services/useFetch'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

type CategoryKey = 'movie-popular' | 'movie-top-rated' | 'tv-popular' | 'tv-top-rated'

const ListByCategory = () => {
  const { category } = useLocalSearchParams<{ category: CategoryKey }>()
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [category])

  const { title, mediaType } = useMemo(() => {
    switch (category) {
      case 'movie-popular':
        return { title: 'Popular Movies', mediaType: 'movie' as const }
      case 'movie-top-rated':
        return { title: 'Top Rated Movies', mediaType: 'movie' as const }
      case 'tv-popular':
        return { title: 'Popular TV Shows', mediaType: 'tv' as const }
      case 'tv-top-rated':
        return { title: 'Top Rated TV Shows', mediaType: 'tv' as const }
      default:
        return { title: 'Browse', mediaType: 'movie' as const }
    }
  }, [category])

  const { data, loading, error } = useFetch(() => {
    switch (category) {
      case 'movie-popular':
        return fetchPopularMovies(page)
      case 'movie-top-rated':
        return fetchTopRatedMovies(page)
      case 'tv-popular':
        return fetchPopularTV(page)
      case 'tv-top-rated':
        return fetchTopRatedTV(page)
      default:
        return Promise.resolve([])
    }
  }, [category, page])

  const startPage = Math.max(1, page - 2)
  const pages = Array.from({ length: 5 }, (_, i) => startPage + i)

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full h-full z-0' resizeMode='cover' />

      <FlatList
        data={data || []}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        className='px-5'
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          gap: 20,
          paddingRight: 5,
          marginBottom: 10,
        }}
        renderItem={({ item }) => (
          <MovieCard
            id={item.id}
            title={item.title || item.name || 'Untitled'}
            poster_path={item.poster_path ?? ''}
            vote_average={item.vote_average ?? 0}
            release_date={item.release_date || item.first_air_date || ''}
            media_type={mediaType}
          />
        )}
        ListHeaderComponent={
          <>
            <View className='mt-16 mb-4 flex-row items-center justify-between'>
              <TouchableOpacity
                className='bg-black/70 border border-gray-500 rounded-lg p-2 self-start'
                onPress={() => router.back()}
              >
                <Image source={icons.arrow} className='size-5 rotate-180' tintColor='#fff' />
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={() => router.replace('/')}>
                <Image source={icons.logo} className='w-12 h-10' />
              </TouchableOpacity>
            </View>

            <Text className='text-2xl font-bold text-white mb-4'>{title}</Text>

            {loading ? (
              <ActivityIndicator size='large' color='#0000ff' className='my-4' />
            ) : null}

            {error ? (
              <Text className='text-red-500 my-4'>Error: {error.message}</Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className='mt-10'>
              <Text className='text-center text-light-300'>No results found.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          !loading && !error ? (
            <View className='flex-row justify-center items-center gap-2 mt-6 mb-10'>
              <TouchableOpacity
                disabled={page === 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-2 rounded-lg ${page === 1 ? 'bg-dark-200/40' : 'bg-dark-200'}`}
              >
                <Text className='text-white text-lg'>{'<'}</Text>
              </TouchableOpacity>

              {pages.map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => setPage(num)}
                  className={`px-4 py-2 rounded-lg ${page === num ? 'bg-accent' : 'bg-dark-200'}`}
                >
                  <Text className={`font-semibold ${page === num ? 'text-black' : 'text-white'}`}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setPage((p) => p + 1)}
                className='px-3 py-2 rounded-lg bg-dark-200'
              >
                <Text className='text-white text-lg'>{'>'}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default ListByCategory
