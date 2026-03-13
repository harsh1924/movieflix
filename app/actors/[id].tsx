import LoginRequired from '@/components/LoginRequired'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { fetchActorDetails, fetchActorMovies } from '@/services/api'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

type ActorState = {
  loading: boolean
  error: string | null
  actor: any
  movies: any[]
}

const ActorDetails = () => {
  const { isAuthenticated, user } = useAuth()
  const initial = user!.name.charAt(0).toUpperCase() || ""
  const { id } = useLocalSearchParams<{ id: string }>()

  const [state, setState] = useState<ActorState>({
    loading: true,
    error: null,
    actor: null,
    movies: [],
  })

  const { loading, error, actor, movies } = state

  const mostPopularMovieTitle = useMemo(() => {
    if (!movies.length) return 'N/A'
    return movies[0]?.title || 'N/A'
  }, [movies])

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

          <View className="w-10 h-10 rounded-full bg-[#ab8bff] items-center justify-center">
            <Text className="text-white text-lg font-bold">
              {initial}
            </Text>
          </View>
        </View>

        <View className='rounded-3xl overflow-hidden relative'>
          <Image
            source={{
              uri: actor.profile_path
                ? `https://image.tmdb.org/t/p/w780${actor.profile_path}`
                : 'https://placeholder.co/900x600/1a1a1a/ffffff.png',
            }}
            className='w-full h-[420px]'
            resizeMode='cover'
          />

          <LinearGradient
            colors={['rgba(3,0,20,0)', 'rgba(3,0,20,0.25)', 'rgba(3,0,20,0.95)']}
            start={{ x: 0.5, y: 0.15 }}
            end={{ x: 0.5, y: 1 }}
            className='absolute inset-0'
          />

          <View className='absolute bottom-0 left-0 right-0 px-4 pb-5'>
            <Text className='text-white text-2xl font-bold' numberOfLines={1}>
              {actor.name}
            </Text>

            <Text className='text-light-200 mt-1' numberOfLines={1}>
              Acting: {actor.known_for_department || 'N/A'}
            </Text>

            <Text className='text-light-200 mt-1' numberOfLines={1}>
              Known for: <Text className="text-accent">{mostPopularMovieTitle}</Text>
            </Text>
          </View>
        </View>

        <View className="flex-1">
          <View className="flex-row flex-wrap mt-6">

            <View className="w-1/2 mb-4 pl-2">
              <Text className="text-white text-lg font-semibold">Popularity</Text>
              <Text className="text-light-200 mt-2">
                {actor.popularity ? actor.popularity.toFixed(1) : 'N/A'}
              </Text>
            </View>

            <View className="w-1/2 mb-4 pr-2">
              <Text className="text-white text-lg font-semibold">Birthday</Text>
              <Text className="text-light-200 mt-2">
                {actor.birthday || 'N/A'}
              </Text>
            </View>

            <View className="w-1/2 mb-4 pl-2">
              <Text className="text-white text-lg font-semibold">Place of Birth</Text>
              <Text className="text-light-200 mt-2">
                {actor.place_of_birth || 'N/A'}
              </Text>
            </View>

            <View className="w-1/2 mb-4 pr-2">
              <Text className="text-white text-lg font-semibold">Gender</Text>
              <Text className="text-light-200 mt-2">
                {actor.gender === 2 ? "Male" : actor.gender === 1 ? "Female" : "N/A"}
              </Text>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-white text-lg font-semibold">Also Known As</Text>
            <Text className="text-light-200 mt-2">
              {actor.also_known_as?.length
                ? actor.also_known_as.slice(0, 3).join(', ')
                : 'N/A'}
            </Text>
          </View>

        </View>

        <View className='mt-8'>
          <Text className='text-white text-lg font-semibold'>Biography</Text>
          <Text className='text-light-200 mt-2 leading-6'>
            {actor.biography || 'No biography available.'}
          </Text>
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
