import HorizontalMovieSection from '@/components/HorizontalMovieSection';
import LoginRequired from '@/components/LoginRequired';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useAuth } from '@/context/AuthContext';
import { useReminder } from "@/hooks/useReminder";
import { fetchCollection, fetchFullMovieDetails, fetchFullTVDetails } from '@/services/api';
import { isMovieSaved, removeSavedMovie, saveMovie } from '@/services/savedMovies';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe";

const MovieDetails = () => {
  const { isAuthenticated, user } = useAuth();
  const initial = user!.name.charAt(0).toUpperCase() || "";
  const { id } = useLocalSearchParams<{ id: string }>()
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const [state, setState] = useState<{
    saved: boolean
    cast: any[]
    loading: boolean
    clips: any[]
    trailer: any
    playTrailer: boolean
    error: string | null
    providers: any[]
    reviews: any[]
    collection: any
    movie: MovieDetails | null
    relatedMovies: any[]
    galleryImages: any[]
    selectedBackdrop: string | null
  }>({
    saved: false,
    cast: [],
    loading: true,
    clips: [],
    trailer: null,
    playTrailer: false,
    error: null,
    providers: [],
    reviews: [],
    collection: null,
    movie: null,
    relatedMovies: [],
    galleryImages: [],
    selectedBackdrop: null,
  })

  const {
    saved,
    cast,
    loading,
    clips,
    trailer,
    playTrailer,
    error,
    providers,
    collection,
    movie,
    relatedMovies,
    galleryImages,
    selectedBackdrop,
  } = state

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) {
        setState((prev) => ({
          ...prev,
          error: 'Movie ID not found.',
          loading: false,
        }))
        return
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          playTrailer: false,
          selectedBackdrop: null,
        }))

        const fullDetails = await fetchFullMovieDetails(id)

        // Handle legacy saved TV entries that were routed to movie details.
        if (fullDetails?.success === false || (!fullDetails?.title && fullDetails?.name)) {
          const fullTVDetails = await fetchFullTVDetails(id)

          if (fullTVDetails?.id && fullTVDetails?.name) {
            router.replace({
              pathname: '/tv/[id]',
              params: { id: String(id) },
            })
            return
          }

          throw new Error(fullDetails?.status_message || 'Movie not found')
        }

        if (!fullDetails?.id || !fullDetails?.title) {
          throw new Error('Movie not found')
        }

        const details = fullDetails as MovieDetails
        const videos = fullDetails?.videos?.results || []

        const clipVideos = videos?.filter(
          (video: any) =>
            (video.type === "Teaser" || video.type === "Clip") &&
            video.site === "YouTube"
        ) || [];

        const trailerData = videos.find(
          (video: any) => video.type === "Trailer" && video.site === "YouTube"
        ) || null

        const exists = await isMovieSaved(details.id)
        const castData = fullDetails?.credits?.cast?.slice(0, 10) || []
        const watchProviders = fullDetails?.['watch/providers']?.results?.IN?.flatrate || []
        const topReviews = fullDetails?.reviews?.results?.slice(0, 3) || []
        const movieImages = fullDetails?.images?.backdrops || []
        const similar = fullDetails?.recommendations?.results || []

        let collectionData: any = null

        if (details.belongs_to_collection?.id) {
          collectionData = await fetchCollection(String(details.belongs_to_collection.id))
        }

        setState((prev) => ({
          ...prev,
          movie: details,
          trailer: trailerData,
          saved: exists,
          cast: castData,
          providers: watchProviders,
          reviews: topReviews,
          collection: collectionData,
          relatedMovies: similar?.slice(0, 10) || [],
          clips: clipVideos,
          galleryImages: movieImages.slice(0, 15),
        }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to load movie details',
        }))
      } finally {
        setState((prev) => ({
          ...prev,
          loading: false,
        }))
      }
    }

    loadMovie()
  }, [id])

  const { reminderSet, addReminder, removeReminder } = useReminder({
    id: movie?.id,
    title: movie?.title,
    runtime: movie?.runtime
  });

  const [date, setDate] = useState(
    movie?.release_date ? new Date(movie.release_date) : new Date()
  )

  const handleToggleSave = async () => {
    if (!movie) return

    const movieCardData: SavedMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ?? '',
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      media_type: 'movie',
    }

    if (saved) {
      await removeSavedMovie(movie.id)
      setState((prev) => ({
        ...prev,
        saved: false,
      }))
    } else {
      await saveMovie(movieCardData)
      setState((prev) => ({
        ...prev,
        saved: true,
      }))
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
        {/* Back Button and Logo */}
        <View className='mt-14 mb-3 flex-row items-center justify-between'>
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

        <View className='rounded-3xl overflow-hidden relative' >

          {/* Image and Trailer */}
          {playTrailer && trailer ? (
            <YoutubePlayer
              height={320}
              play={playTrailer}
              videoId={trailer.key}
              onChangeState={(state: any) => {
                if (state === "ended") {
                  setState((prev) => ({
                    ...prev,
                    playTrailer: false,
                  }))
                }
              }}
            />
          ) : (
            <Image
              source={{
                uri: selectedBackdrop
                  ? `https://image.tmdb.org/t/p/w1280${selectedBackdrop}`
                  : movie.backdrop_path
                    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
                    : "https://placeholder.co/1280x720/1a1a1a/ffffff.png",
              }}
              className="w-full h-[420px]"
              resizeMode="cover"
            />
          )}

          {playTrailer && trailer && (
            <View className="absolute bottom-3 right-3">
              <TouchableOpacity
                className="bg-black/75 border border-gray-400 px-4 py-2 rounded-lg"
                onPress={() =>
                  setState((prev) => ({
                    ...prev,
                    playTrailer: false,
                  }))
                }
              >
                <Text className="text-white font-bold">Stop Trailer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Title */}
          {!playTrailer && (
            <>
              <LinearGradient
                colors={['rgba(3,0,20,0)', 'rgba(3,0,20,0.25)', 'rgba(3,0,20,0.95)']}
                start={{ x: 0.5, y: 0.15 }}
                end={{ x: 0.5, y: 1 }}
                className='absolute inset-0'
              />
              <View className="absolute left-0 right-0 bottom-0 px-4 pb-5">

                {/* Title */}
                <Text className="text-white text-3xl font-bold" numberOfLines={1}>
                  {movie.title}
                </Text>

                {/* Release Date, Runtime */}
                <View className="flex-row gap-2 mt-1" >
                  <Text className='text-light-200 text-sm'>
                    {new Date(movie.release_date).getFullYear()}
                  </Text>
                  <Text className='text-light-200 text-sm'>•</Text>
                  <Text className='text-light-200 text-sm'>
                    {movie.runtime
                      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60 ? `${movie.runtime % 60}m` : ''}`
                      : 'N/A'}
                  </Text>
                </View>

                {/* Rating */}
                <View className='flex-row items-center mt-2 self-start bg-dark-100 px-2 py-1 rounded-lg'>
                  <Image source={icons.star} className='size-4 mr-1' />
                  <Text className='text-white font-bold text-sm'>{movie.vote_average.toFixed(1)}/10</Text>
                  {/* <Text? className='text-light-200 ml-2 text-xs'>({movie.vote_count} votes)</Text> */}
                </View>

                <View className="flex-row mt-3 gap-2">

                  {/* Trailer Play/Stop */}
                  {trailer && (
                    <TouchableOpacity
                      className="bg-accent rounded-lg px-4 py-3"
                      onPress={() =>
                        setState((prev) => ({
                          ...prev,
                          playTrailer: !prev.playTrailer,
                        }))
                      }
                    >
                      <Text className="text-black font-bold">
                        {playTrailer ? "Stop" : "Play Trailer"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Save Movie */}
                  <TouchableOpacity
                    onPress={handleToggleSave}
                    className="px-4 py-2 border border-white rounded-lg items-center justify-center"
                  >
                    <Ionicons
                      name={saved ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={saved ? "#FFD700" : "#fff"}
                    />
                  </TouchableOpacity>

                  {/* Reminder */}
                  <TouchableOpacity
                    className={`rounded-lg px-4 py-2 border ${reminderSet ? "border-green-500" : "border-white"} items-center justify-center
                      }`}
                    onPress={() => {
                      if (reminderSet) {
                        removeReminder();
                      } else {
                        setPickerMode("date");
                        setShowPicker(true);
                      }
                    }}
                  >
                    <Ionicons
                      name={reminderSet ? "notifications" : "notifications-outline"}
                      size={20}
                      color={reminderSet ? "#22c55e" : "#fff"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Overview</Text>
          <Text className='text-light-200 mt-2 leading-6'>{movie.overview || 'No overview available.'}</Text>
        </View>

        {/* Movie Details */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Movie Details</Text>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200'>Title</Text>
              <Text className='text-white mt-1'>{movie.title || 'N/A'}</Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200'>Original Title</Text>
              <Text className='text-white mt-1'>{movie.original_title || 'N/A'}</Text>
            </View>
          </View>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200'>Release Date</Text>
              <Text className='text-white mt-1'>{movie.release_date || 'N/A'}</Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200'>Runtime</Text>
              <Text className='text-white mt-1'>
                {movie.runtime
                  ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60 ? `${movie.runtime % 60}m` : ''}`
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200'>Budget</Text>
              <Text className='text-white mt-1'>
                {movie.budget ? `$${(movie.budget / 1000000).toFixed(0)}M` : 'N/A'}
              </Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200'>Revenue</Text>
              <Text className='text-white mt-1'>
                {movie.revenue ? `$${(movie.revenue / 1000000).toFixed(0)}M` : 'N/A'}
              </Text>
            </View>
          </View>

          <View className='mt-3 flex-row justify-between gap-x-4'>
            <View className='w-[48%]'>
              <Text className='text-light-200'>Popularity</Text>
              <Text className='text-white mt-1'>
                {typeof movie.popularity === 'number' ? movie.popularity.toFixed(1) : 'N/A'}
              </Text>
            </View>

            <View className='w-[48%]'>
              <Text className='text-light-200'>Languages</Text>
              <Text className='text-white mt-1'>
                {movie.spoken_languages?.length
                  ? movie.spoken_languages.map((lang) => lang.english_name).join(', ')
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Genre */}
        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Genres</Text>
          <View className="flex-row flex-wrap mt-2">
            {movie.genres?.length ? (
              movie.genres.map((genre) => (
                <Text
                  key={genre.id}
                  className="bg-dark-100/70 text-white px-3 py-2 rounded-full text-sm mr-2 mb-2"
                >
                  {genre.name}
                </Text>
              ))
            ) : (
              <Text className="text-light-200">N/A</Text>
            )}
          </View>
        </View>

        <View className='mt-6'>
          <Text className='text-white text-lg font-semibold'>Tagline</Text>
          <Text className='text-light-200 mt-2 leading-6'>{movie.tagline || 'N/A'}</Text>
        </View>

        {/* Cast Section */}
        {cast.length > 0 && (
          <View className="mt-8">
            <Text className="text-white text-lg font-bold mb-3">
              Cast
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cast.map((actor) => (
                <TouchableOpacity
                  key={actor.id}
                  className="mr-4 w-[90px]"
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
                        : "https://placeholder.co/100x150"
                    }}
                    className="w-[90px] h-[120px] rounded-lg"
                    resizeMode="cover"
                  />

                  <Text className="text-white text-center font-bold text-sm mt-2" numberOfLines={1}>
                    {actor.name}
                  </Text>

                  <Text className="text-light-200 text-center text-xs" numberOfLines={1}>
                    {actor.character}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Image Gallery */}
        {galleryImages.length > 0 && (
          <View className="mt-8">
            <Text className="text-white text-lg font-semibold mb-3">
              Image Gallery
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {galleryImages.map((img, index) => {
                const isActive = selectedBackdrop
                  ? selectedBackdrop === img.file_path
                  : movie.backdrop_path === img.file_path

                return (
                  <TouchableOpacity
                    key={`${img.file_path}-${index}`}
                    className={`mr-3 rounded-xl overflow-hidden border ${isActive ? 'border-accent' : 'border-transparent'}`}
                    onPress={() =>
                      setState((prev) => ({
                        ...prev,
                        selectedBackdrop: img.file_path,
                      }))
                    }
                  >
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500${img.file_path}` }}
                      className="w-[170px] h-[100px]"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* Production / Creators / Networks */}
        <View className='mt-8'>
          <Text className='text-white text-lg font-semibold mb-3'>Production / Creators / Networks</Text>

          <View className='flex-row gap-x-4'>
            <View className='flex-1 bg-dark-100/70 rounded-xl p-3'>
              <Text className='text-light-200'>Production Companies</Text>
              {movie.production_companies?.length ? (
                movie.production_companies.map((company) => (
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
              <Text className='text-white mt-2'>N/A</Text>

              <View className='h-px bg-white/15 mt-5 mb-4' />

              <Text className='text-light-200'>Available on</Text>
              {providers.length > 0 ? (
                <View className='mt-2'>
                  {providers.map((provider) => (
                    <View key={provider.provider_id} className='flex-row items-center mt-2'>
                      {provider.logo_path ? (
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
                          }}
                          className='w-6 h-6 rounded mr-2'
                          resizeMode='cover'
                        />
                      ) : (
                        <View className='w-6 h-6 rounded mr-2 bg-dark-200' />
                      )}
                      <Text className='text-white flex-1' numberOfLines={1}>
                        {provider.provider_name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className='text-white mt-2'>N/A</Text>
              )}
            </View>
          </View>
        </View>

        {/* Collection */}
        {collection?.parts?.length > 0 && (
          <View className="mt-8">
            <Text className="text-white text-lg font-semibold mb-3">
              Collection
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {collection.parts.map((m: any) => (
                <TouchableOpacity
                  key={m.id}
                  className="mr-4 w-[140px]"
                  onPress={() => router.push(`/movies/${m.id}`)}
                >
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w500${m.poster_path}`
                    }}
                    className="w-[140px] h-[200px] rounded-lg"
                  />

                  <Text className="text-white text-sm mt-2" numberOfLines={2}>
                    {m.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Clips Section */}
        {clips.length > 0 && (
          <View className="mt-8">
            <Text className="text-white text-lg font-semibold mb-3">
              More Clips
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {clips.slice(0, 5).map((clip) => (
                <View key={clip.id} className="mr-4 w-[250px]">
                  <YoutubePlayer
                    height={140}
                    play={false}
                    videoId={clip.key}
                  />

                  <Text className="text-light-200 mt-2 text-sm">
                    {clip.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <View className="mt-5">
            <HorizontalMovieSection title="Related Movies" movies={relatedMovies} sectionKey="related" />
          </View>
        )}

        {showPicker && (
          <DateTimePicker
            value={date}
            mode={pickerMode}
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === "dismissed") {
                setShowPicker(false);
                return;
              }

              if (!selectedDate) return;

              if (pickerMode === "date") {
                setDate(selectedDate);
                setPickerMode("time");
                setShowPicker(true);
              } else {
                const finalDate = new Date(date);

                finalDate.setHours(selectedDate.getHours());
                finalDate.setMinutes(selectedDate.getMinutes());

                setDate(finalDate);
                setShowPicker(false);

                addReminder(finalDate);
              }
            }}
          />
        )}

      </ScrollView>
    </View>
  )
}

export default MovieDetails