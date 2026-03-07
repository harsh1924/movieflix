import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchMovieDetails } from '@/services/api'
import { isMovieSaved, removeSavedMovie, saveMovie } from '@/services/savedMovies'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const MovieDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) {
        setError('Movie ID not found.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const details = await fetchMovieDetails(id)
        setMovie(details)
        const exists = await isMovieSaved(details.id)
        setSaved(exists)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movie details')
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [id])

  const genres = useMemo(() => {
    if (!movie?.genres?.length) return 'N/A'
    return movie.genres.map((genre) => genre.name).join(', ')
  }, [movie?.genres])

  const handleToggleSave = async () => {
    if (!movie) return

    const movieCardData: SavedMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ?? '',
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    }

    if (saved) {
      await removeSavedMovie(movie.id)
      setSaved(false)
    } else {
      await saveMovie(movieCardData)
      setSaved(true)
    }
  }

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-primary'>
        <ActivityIndicator size='large' color='#ffffff' />
      </View>
    )
  }

  if (error || !movie) {
    return (
      <View className='flex-1 items-center justify-center bg-primary px-6'>
        <Text className='text-red-400 text-center'>{error ?? 'Movie not found'}</Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full h-full z-0' resizeMode='cover' />

      <ScrollView className='flex-1 px-5' contentContainerStyle={{ paddingBottom: 40 }}>
        <Image
          source={{
            uri: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
              : 'https://placeholder.co/600x400/1a1a1a/ffffff.png',
          }}
          className='w-full h-[420px] rounded-2xl mt-16'
          resizeMode='cover'
        />

        <Text className='text-white text-2xl font-bold mt-5'>{movie.title}</Text>
        <Text className='text-light-200 mt-1'>
          {new Date(movie.release_date).getFullYear()} • {movie.runtime ? `${movie.runtime} min` : 'N/A'}
        </Text>

        <View className='flex-row items-center mt-4'>
          <Image source={icons.star} className='size-5 mr-2' />
          <Text className='text-white font-bold text-base'>{movie.vote_average.toFixed(1)}</Text>
          <Text className='text-light-200 ml-2'>({movie.vote_count} votes)</Text>
        </View>

        <TouchableOpacity
          className='bg-accent rounded-xl py-3 mt-5'
          onPress={handleToggleSave}
          activeOpacity={0.85}
        >
          <Text className='text-black text-center font-bold text-base'>{saved ? 'Remove from Saved' : 'Save Movie'}</Text>
        </TouchableOpacity>

        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Overview</Text>
          <Text className='text-light-200 mt-2 leading-6'>{movie.overview || 'No overview available.'}</Text>
        </View>

        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Genres</Text>
          <Text className='text-light-200 mt-2'>{genres}</Text>
        </View>

        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Language</Text>
          <Text className='text-light-200 mt-2 uppercase'>{movie.original_language}</Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default MovieDetails