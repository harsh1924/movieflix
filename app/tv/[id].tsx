import HorizontalMovieSection from '@/components/HorizontalMovieSection'
import LoginRequired from '@/components/LoginRequired'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { fetchFullTVDetails } from '@/services/api'
import { isMovieSaved, removeSavedMovie, saveMovie } from '@/services/savedMovies'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import YoutubePlayer from 'react-native-youtube-iframe'

const TvDetails = () => {
  const { isAuthenticated, user } = useAuth();
  const initial = user!.name.charAt(0).toUpperCase() || ""
  const { id } = useLocalSearchParams<{ id: string }>()

  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    saved: boolean
    tv: any
    cast: any[]
    reviews: any[]
    relatedShows: any[]
    galleryImages: any[]
    trailer: any
    playTrailer: boolean
    selectedBackdrop: string | null
  }>({
    loading: true,
    error: null,
    saved: false,
    tv: null,
    cast: [],
    reviews: [],
    relatedShows: [],
    galleryImages: [],
    trailer: null,
    playTrailer: false,
    selectedBackdrop: null,
  })

  const {
    loading,
    error,
    saved,
    tv,
    cast,
    relatedShows,
    galleryImages,
    trailer,
    playTrailer,
    selectedBackdrop,
  } = state

  useEffect(() => {
    const loadTV = async () => {
      if (!id) {
        setState((prev) => ({ ...prev, error: 'TV show ID not found.', loading: false }))
        return
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null, playTrailer: false, selectedBackdrop: null }))

        const fullDetails = await fetchFullTVDetails(id)
        const videos = fullDetails?.videos?.results || []
        const trailerData = videos.find((video: any) => video.type === 'Trailer' && video.site === 'YouTube') || null
        const exists = await isMovieSaved(fullDetails.id)

        setState((prev) => ({
          ...prev,
          saved: exists,
          tv: fullDetails,
          cast: fullDetails?.credits?.cast?.slice(0, 12) || [],
          reviews: fullDetails?.reviews?.results?.slice(0, 3) || [],
          relatedShows: fullDetails?.recommendations?.results?.slice(0, 10) || [],
          galleryImages: fullDetails?.images?.backdrops?.slice(0, 15) || [],
          trailer: trailerData,
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load TV show details',
        }))
      } finally {
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    loadTV()
  }, [id])

  const handleToggleSave = async () => {
    if (!tv) return

    const tvCardData: SavedMovie = {
      id: tv.id,
      title: tv.name,
      poster_path: tv.poster_path ?? '',
      release_date: tv.first_air_date ?? '',
      vote_average: tv.vote_average,
      media_type: 'tv',
    }

    if (saved) {
      await removeSavedMovie(tv.id)
      setState((prev) => ({ ...prev, saved: false }))
    } else {
      await saveMovie(tvCardData)
      setState((prev) => ({ ...prev, saved: true }))
    }
  }

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-primary'>
        <ActivityIndicator size='large' color='#ffffff' />
      </View>
    )
  }

  if (error || !tv) {
    return (
      <View className='flex-1 items-center justify-center bg-primary px-6'>
        <Text className='text-red-400 text-center'>{error ?? 'TV show not found'}</Text>
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
        {/* Header row: back button, app logo, and user initial avatar */}
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

        {/* Hero section: trailer/backdrop preview with title, rating, and primary actions */}
        <View className='rounded-3xl overflow-hidden relative'>
          {playTrailer && trailer ? (
            <YoutubePlayer
              height={320}
              play={playTrailer}
              videoId={trailer.key}
              onChangeState={(playerState: any) => {
                if (playerState === 'ended') {
                  setState((prev) => ({ ...prev, playTrailer: false }))
                }
              }}
            />
          ) : (
            <Image
              source={{
                uri: selectedBackdrop
                  ? `https://image.tmdb.org/t/p/w1280${selectedBackdrop}`
                  : tv.backdrop_path
                    ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`
                    : 'https://placeholder.co/1280x720/1a1a1a/ffffff.png',
              }}
              className='w-full h-[420px]'
              resizeMode='cover'
            />
          )}

          {playTrailer && trailer && (
            <View className='absolute bottom-3 right-3'>
              <TouchableOpacity
                className='bg-black/75 border border-gray-400 px-4 py-2 rounded-lg'
                onPress={() => setState((prev) => ({ ...prev, playTrailer: false }))}
              >
                <Text className='text-white font-bold'>Stop Trailer</Text>
              </TouchableOpacity>
            </View>
          )}

          {!playTrailer && (
            <>
              <LinearGradient
                colors={['rgba(3,0,20,0)', 'rgba(3,0,20,0.25)', 'rgba(3,0,20,0.95)']}
                start={{ x: 0.5, y: 0.15 }}
                end={{ x: 0.5, y: 1 }}
                className='absolute inset-0'
              />
              <View className='absolute left-0 right-0 bottom-0 px-4 pb-5'>
                <Text className='text-white text-3xl font-bold' numberOfLines={1}>
                  {tv.name}
                </Text>

                <Text className='text-light-200 text-sm mt-1' numberOfLines={1}>
                  {tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 'N/A'} • {tv.number_of_seasons || 0} Seasons
                </Text>

                <View className='flex-row items-center mt-2 self-start bg-dark-100 px-2 py-1 rounded-lg'>
                  <Image source={icons.star} className='size-4 mr-1' />
                  <Text className='text-white font-bold text-sm'>{tv.vote_average?.toFixed(1) || 'N/A'}/10</Text>
                </View>

                <View className='flex-row mt-3 gap-2'>
                  {trailer && (
                    <TouchableOpacity
                      className='bg-accent px-4 py-2 rounded-lg'
                      onPress={() => setState((prev) => ({ ...prev, playTrailer: true }))}
                    >
                      <Text className='text-black font-bold'>Play Trailer</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className='bg-black/70 border border-gray-500 px-4 py-2 rounded-lg'
                    onPress={handleToggleSave}
                    activeOpacity={0.85}
                  >
                    <Text className='text-white font-bold'>
                      {saved ? 'In My List' : '+ My List'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Overview section: short synopsis of the TV show */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Overview</Text>
          <Text className='text-light-200 mt-2 leading-6'>{tv.overview || 'No overview available.'}</Text>
        </View>

        {/* Details grid: core metadata like dates, seasons, runtime, language, status, and type */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>TV Details</Text>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200 '>Name</Text>
              <Text className='text-white mt-1'>{tv.name || 'N/A'}</Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200 '>Original Name</Text>
              <Text className='text-white mt-1'>{tv.original_name || 'N/A'}</Text>
            </View>
          </View>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200 '>First Air Date</Text>
              <Text className='text-white mt-1'>{tv.first_air_date || 'N/A'}</Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200 '>Last Air Date</Text>
              <Text className='text-white mt-1'>{tv.last_air_date || 'N/A'}</Text>
            </View>
          </View>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200 '>Seasons</Text>
              <Text className='text-white mt-1'>{tv.number_of_seasons ?? 'N/A'}</Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200 '>Episodes</Text>
              <Text className='text-white mt-1'>{tv.number_of_episodes ?? 'N/A'}</Text>
            </View>
          </View>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200 '>Languages</Text>
              <Text className='text-white mt-1 uppercase'>
                {tv.languages?.length ? tv.languages.join(', ') : 'N/A'}
              </Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200 '>Popularity</Text>
              <Text className='text-white mt-1'>
                {typeof tv.popularity === 'number' ? tv.popularity.toFixed(1) : 'N/A'}
              </Text>
            </View>
          </View>

        </View>

        {/* Genre chips: category tags for quick classification */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Genres</Text>
          <View className='flex-row flex-wrap mt-2'>
            {tv.genres?.length ? (
              tv.genres.map((genre: any) => (
                <Text key={genre.id} className='bg-dark-100/70 text-white px-3 py-2 rounded-full text-sm mr-2 mb-2'>
                  {genre.name}
                </Text>
              ))
            ) : (
              <Text className='text-light-200'>N/A</Text>
            )}
          </View>
        </View>



        {/* Cast strip: actor cards with profile, role, and navigation to actor details */}
        {cast.length > 0 && (
          <View className='mt-8'>
            <Text className='text-white text-lg font-semibold mb-3'>Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cast.map((actor) => (
                <TouchableOpacity
                  key={actor.id}
                  className='mr-4 w-[90px]'
                  onPress={() =>
                    router.push({
                      pathname: '/actors/[id]',
                      params: { id: String(actor.id) },
                    })
                  }
                >
                  <Image
                    source={{
                      uri: actor.profile_path
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : 'https://placeholder.co/100x150',
                    }}
                    className='w-[90px] h-[120px] rounded-lg'
                  />
                  <Text className='text-white  mt-2' numberOfLines={1}>{actor.name}</Text>
                  <Text className='text-light-200 ' numberOfLines={1}>{actor.character}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Gallery strip: selectable backdrops that update the hero image */}
        {galleryImages.length > 0 && (
          <View className='mt-8'>
            <Text className='text-white text-lg font-semibold mb-3'>Image Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {galleryImages.map((img: any, index: number) => (
                <TouchableOpacity
                  key={`${img.file_path}-${index}`}
                  className='mr-3 rounded-xl overflow-hidden'
                  onPress={() => setState((prev) => ({ ...prev, selectedBackdrop: img.file_path }))}
                >
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500${img.file_path}` }}
                    className='w-[170px] h-[100px]'
                    resizeMode='cover'
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Production block: studios, creators, and broadcasting networks */}
        <View className='mt-8'>
          <Text className='text-white text-lg font-semibold mb-3'>Production / Creators / Networks</Text>

          <View className='flex-row gap-x-4'>
            <View className='flex-1 bg-dark-100/70 rounded-xl p-3'>
              <Text className='text-light-200'>Production Companies</Text>
              {tv.production_companies?.length ? (
                tv.production_companies.map((company: any) => (
                  <Text key={company.id} className='text-white mt-2'>
                    {company.name}
                  </Text>
                ))
              ) : (
                <Text className='text-white mt-2'>N/A</Text>
              )}
            </View>

            <View className='flex-1 bg-dark-100/70 rounded-xl p-3'>
              <Text className='text-light-200'>Created By</Text>
              {tv.created_by?.length ? (
                tv.created_by.map((creator: any) => (
                  <Text key={creator.id} className='text-white mt-2'>
                    {creator.name}
                  </Text>
                ))
              ) : (
                <Text className='text-white mt-2'>N/A</Text>
              )}

              <View className='h-px bg-white/15 mt-5 mb-4' />

              <Text className='text-light-200'>Available on</Text>
              {tv.networks?.length ? (
                tv.networks.map((network: any) => (
                  <Text key={network.id} className='text-white mt-2'>
                    {network.name}
                  </Text>
                ))
              ) : (
                <Text className='text-white mt-2'>N/A</Text>
              )}
            </View>
          </View>
        </View>

        {tv.seasons?.length > 0 && (
          /* Seasons strip: season posters and quick facts with navigation to season details */
          <View className='mt-8'>
            <Text className='text-white text-lg font-semibold mb-3'>Seasons</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tv.seasons.map((season: any) => (
                <TouchableOpacity
                  key={season.id}
                  className='mr-4 w-[140px]'
                  onPress={() =>
                    router.push({
                      pathname: '/tv/[id]/season/[seasonNumber]',
                      params: {
                        id: String(tv.id),
                        seasonNumber: String(season.season_number ?? 1),
                      },
                    } as any)
                  }
                >
                  <Image
                    source={{
                      uri: season.poster_path
                        ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                        : 'https://placeholder.co/200x300',
                    }}
                    className='w-[140px] h-[200px] rounded-lg'
                    resizeMode='cover'
                  />
                  <Text className='text-white text-sm mt-2 font-semibold' numberOfLines={2}>
                    {season.name}
                  </Text>
                  <Text className='text-light-200  mt-1'>
                    Season {season.season_number ?? 'N/A'}
                  </Text>
                  <Text className='text-light-200  mt-1'>
                    {season.episode_count || 0} Episodes
                  </Text>
                  <Text className='text-light-200  mt-1'>
                    {season.air_date || 'Air date N/A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

{/* Recommendations: related TV titles rendered as a horizontal section */}
        {relatedShows.length > 0 && (
          <View className='mt-6'>
            <HorizontalMovieSection
              title='Related TV Shows'
              movies={relatedShows}
              sectionKey='related-tv'
              mediaType='tv'
            />
          </View>
        )}

      </ScrollView>
    </View>
  )
}

export default TvDetails