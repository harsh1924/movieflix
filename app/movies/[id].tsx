import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchMovieDetails, fetchMovieTrailer } from '@/services/api'
import { isMovieSaved, removeSavedMovie, saveMovie } from '@/services/savedMovies'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import YoutubePlayer from "react-native-youtube-iframe";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import LoginRequired from '@/components/LoginRequired'

const MovieDetails = () => {
  const { isAuthenticated } = useAuth();

  const { id } = useLocalSearchParams<{ id: string }>()

  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [trailer, setTrailer] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false);
  const [playTrailer, setPlayTrailer] = useState(false)

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
        const trailerData = await fetchMovieTrailer(id)
        setTrailer(trailerData)
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

  if (!isAuthenticated) {
    return <LoginRequired />
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full h-full z-0' resizeMode='cover' />

      <ScrollView className='flex-1 px-5' contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="mt-16 rounded-2xl overflow-hidden">

          {playTrailer && trailer ? (
            <YoutubePlayer
              height={250}
              play={playTrailer}
              videoId={trailer.key}
              onChangeState={(state: any) => {
                if (state === "ended") {
                  setPlayTrailer(false)
                }
              }}
            />
          ) : (
            <Image
              source={{
                uri: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                  : "https://placeholder.co/600x400/1a1a1a/ffffff.png",
              }}
              className="w-full h-[450px]"
              resizeMode="stretch"
            />
          )}
        </View>

        <View className="flex-row items-center mt-5">
          <Text className="text-white text-2xl font-bold flex-1">
            {movie.title}
          </Text>

          {trailer && (
            <TouchableOpacity
              className="bg-accent px-3 py-2 rounded-lg ml-3"
              onPress={() => setPlayTrailer(!playTrailer)}
            >
              <Text className="text-black font-bold">
                {playTrailer ? "■ Stop" : "▶ Play"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className='text-light-200 mt-1'>
          {new Date(movie.release_date).getFullYear()} • {movie.runtime ? `${movie.runtime} min` : 'N/A'}
        </Text>

        <View className='flex-row items-center mt-4 text-light-200 bg-dark-100 p-2 rounded-lg self-start'>
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

        {/* Genre */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Genres</Text>
          <View className="flex-row flex-wrap mt-2">
            {movie.genres?.length ? (
              movie.genres.map((genre) => (
                <Text
                  key={genre.id}
                  className="text-light-200 bg-dark-100 px-3 py-1 mr-2 mb-2 rounded-lg"
                >
                  {genre.name}
                </Text>
              ))
            ) : (
              <Text className="text-light-200">N/A</Text>
            )}
          </View>
        </View>

        {/* Budget and Revenue */}
        <View className='mt-6 flex-row'>
          <View className='flex-1'>
            <Text className='text-white text-lg font-semibold'>Budget</Text>
            <Text className='text-light-200 mt-2'>
              ${(movie.budget / 1000000).toFixed(0)}M
            </Text>
          </View>

          <View className='flex-1'>
            <Text className='text-white text-lg font-semibold'>Revenue</Text>
            <Text className='text-light-200 mt-2'>
              ${(movie.revenue / 1000000).toFixed(0)}M
            </Text>
          </View>
        </View>

        {/* Original Language and Popularity */}
        <View className='mt-6 flex-row'>
          <View className='flex-1'>
            <Text className='text-white text-lg font-semibold'>Language</Text>
            <Text className='text-light-200 mt-2 uppercase'>
              {movie.original_language}
            </Text>
          </View>

          <View className='flex-1'>
            <Text className='text-white text-lg font-semibold'>Popularity</Text>
            <Text className='text-light-200 mt-2'>
              {movie.popularity.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Production Companies */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Production Companies</Text>
          {movie.production_companies?.length ? (
            movie.production_companies.map((company) => (
              <Text key={company.id} className='text-light-200 mt-2'>
                {company.name}
              </Text>
            ))
          ) : (
            <Text className='text-light-200 mt-2'>No production companies available.</Text>
          )}
        </View>

        {/* Tagline */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Tagline</Text>
          <Text className='text-light-200 mt-2 leading-6'>{movie.tagline || 'No overview available.'}</Text>
        </View>

        {/* Production Countries */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Production Countries</Text>
          {movie.production_countries?.length ? (
            movie.production_countries.map((country) => (
              <Text key={country.iso_3166_1} className='text-light-200 mt-2'>
                {country.name}
              </Text>
            ))
          ) : (
            <Text className='text-light-200 mt-2'>No production countries available.</Text>
          )}
        </View>

        <TouchableOpacity className='absolute bottom-5 left-0 right-0 mx-2 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50' onPress={() => router.back()}>
          <Image source={icons.arrow} className='size-5 mr-1 mt-0.5 rotate-180' tintColor="#fff" />
          <Text className="text-white font-semibold text-base">
            Go Back
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

export default MovieDetails