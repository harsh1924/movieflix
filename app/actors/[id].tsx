import LoginRequired from '@/components/LoginRequired'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { fetchActorDetails, fetchActorMovies } from '@/services/api'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type ActorState = {
  loading: boolean
  error: string | null
  actor: any
  movies: any[]
}

const ActorDetails = () => {
  const { isAuthenticated } = useAuth()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [state, setState] = useState<ActorState>({
    loading: true,
    error: null,
    actor: null,
    movies: [],
  })

  const { loading, error, actor, movies } = state

  useEffect(() => {
    const loadActor = async () => {
      if (!id) {
        setState((prev) => ({
          ...prev,
          error: 'Actor ID not found.',
          loading: false,
        }))
        return
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }))

        const [actorDetails, actorMovies] = await Promise.all([
          fetchActorDetails(id),
          fetchActorMovies(id),
        ])

        const sortedMovies = (actorMovies || [])
          .filter((movie: any) => movie?.poster_path)
          .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))

        setState((prev) => ({
          ...prev,
          actor: actorDetails,
          movies: sortedMovies,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load actor details',
        }))
      } finally {
        setState((prev) => ({
          ...prev,
          loading: false,
        }))
      }
    }

    loadActor()
  }, [id])

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-primary'>
        <ActivityIndicator size='large' color='#ffffff' />
      </View>
    )
  }

  if (error || !actor) {
    return (
      <View className='flex-1 items-center justify-center bg-primary px-6'>
        <Text className='text-red-400 text-center'>{error ?? 'Actor not found'}</Text>
      </View>
    )
  }

  if (!isAuthenticated) {
    return <LoginRequired />
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full h-full z-0' resizeMode='cover' />

      <ScrollView className='flex-1 px-5' contentContainerStyle={{ paddingBottom: 80 }}>
        <View className='mt-16 mb-3 flex-row items-center justify-between'>
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

        <View className='items-center'>
          <Image
            source={{
              uri: actor.profile_path
                ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                : 'https://placeholder.co/400x600/1a1a1a/ffffff.png',
            }}
            className='w-[220px] h-[320px] rounded-2xl'
            resizeMode='cover'
          />

          <Text className='text-white text-2xl font-bold mt-5 text-center'>
            {actor.name}
          </Text>

          <Text className='text-light-200 mt-1 text-center'>
            {actor.known_for_department || 'N/A'}
          </Text>

          <View className='flex-row items-center mt-4 text-light-200 bg-dark-100 p-2 rounded-lg self-center'>
            <Image source={icons.star} className='size-5 mr-2' />
            <Text className='text-white font-bold text-base'>
              {actor.popularity ? actor.popularity.toFixed(1) : 'N/A'}
            </Text>
            <Text className='text-light-200 ml-2'>Popularity</Text>
          </View>
        </View>

        <View className='mt-8'>
          <Text className='text-white text-lg font-semibold'>Biography</Text>
          <Text className='text-light-200 mt-2 leading-6'>
            {actor.biography || 'No biography available.'}
          </Text>
        </View>

        <View className='mt-6 flex-row'>
          <View className='flex-1'>
            <Text className='text-white text-lg font-semibold'>Birthday</Text>
            <Text className='text-light-200 mt-2'>
              {actor.birthday || 'N/A'}
            </Text>
          </View>

          <View className='flex-1'>
            <Text className='text-white text-lg font-semibold'>Place of Birth</Text>
            <Text className='text-light-200 mt-2'>
              {actor.place_of_birth || 'N/A'}
            </Text>
          </View>
        </View>

        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Also Known As</Text>
          {actor.also_known_as?.length ? (
            actor.also_known_as.slice(0, 5).map((name: string, index: number) => (
              <Text key={`${name}-${index}`} className='text-light-200 mt-2'>
                {name}
              </Text>
            ))
          ) : (
            <Text className='text-light-200 mt-2'>N/A</Text>
          )}
        </View>

        {movies.length > 0 && (
          <View className='mt-8'>
            <Text className='text-white text-lg font-semibold mb-3'>Movies</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movies.map((movie) => (
                <TouchableOpacity
                  key={movie.id}
                  className='mr-4 w-[140px]'
                  onPress={() => router.push(`/movies/${movie.id}`)}
                >
                  <Image
                    source={{
                      uri: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : 'https://placeholder.co/200x300',
                    }}
                    className='w-[140px] h-[200px] rounded-lg'
                    resizeMode='cover'
                  />

                  <Text className='text-white text-sm mt-2 font-semibold' numberOfLines={2}>
                    {movie.title}
                  </Text>

                  <Text className='text-light-200 text-xs mt-1' numberOfLines={1}>
                    {movie.character || 'N/A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          className='absolute bottom-5 left-0 right-0 mx-2 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50'
          onPress={() => router.back()}
        >
          <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor='#fff' />
          <Text className='text-white font-semibold text-base'>
            Go Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default ActorDetails
