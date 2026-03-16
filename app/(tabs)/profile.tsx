import LoginRequired from '@/components/LoginRequired'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { getSavedMovies } from '@/services/savedMovies'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const Profile = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([])

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const saved = await getSavedMovies()
        setSavedMovies(saved)
      }

      load()
    }, [])
  )

  const averageRating = useMemo(() => {
    if (!savedMovies.length) return '0.0'

    const total = savedMovies.reduce((sum, movie) => sum + movie.vote_average, 0)
    return (total / savedMovies.length).toFixed(1)
  }, [savedMovies])

  const latestSavedYear = useMemo(() => {
    if (!savedMovies.length) return 'N/A'

    return savedMovies
      .map((movie) => Number(new Date(movie.release_date).getFullYear()))
      .filter((year) => !Number.isNaN(year))
      .sort((a, b) => b - a)[0]
      ?.toString() ?? 'N/A'
  }, [savedMovies])

  if (!isAuthenticated) return <LoginRequired />

  function getMovieTitle(count: number) {
    if (count === 0) return "The Screen Awaits Your First Adventure";
    if (count <= 3) return "Curious Explorer of the Silver Screen";
    if (count <= 7) return "Rising Star of the Movie Night Kingdom";
    if (count <= 12) return "Devoted Guardian of the Watchlist Realm";
    if (count <= 20) return "Passionate Seeker of Cinematic Treasures";
    if (count <= 35) return "Fearless Voyager Across the Film Universe";
    if (count <= 50) return "Distinguished Keeper of the Silver Screen Archives";
    if (count <= 75) return "Legendary Collector of Unforgettable Stories";
    if (count <= 100) return "Grand Master of the Cinematic Universe";
    return "Eternal Legend of the Infinite Movie Multiverse";
  }

  function getNextTitleProgress(count: number) {
    const milestones = [4, 8, 13, 21, 36, 51, 76, 101];

    const next = milestones.find((m) => count < m);

    if (!next) return "You have reached the highest cinematic rank.";

    const remaining = next - count;

    return `Save ${remaining} more movie${remaining > 1 ? "s" : ""} to unlock your next cinematic title.`;
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full h-full z-0' resizeMode='cover' />

      <ScrollView className='flex-1 px-5' contentContainerStyle={{ paddingBottom: 120 }}>
        <View className='mt-16 items-end'>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.replace('/')}>
            <Image source={icons.logo} className='w-12 h-10' />
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
          onPress={() => router.push('/chart')}
        >
          <Text className='text-white'>Chart</Text>
        </TouchableOpacity> */}

        <View className='mt-4 items-center'>
          <View className='size-24 rounded-full bg-light-100/20 items-center justify-center'>
            <Image source={icons.person} className='size-12' tintColor='#fff' />
          </View>

          <Text className='text-white text-2xl font-bold mt-4'>{user?.name || 'Movie Explorer'}</Text>
          <Text className='text-light-200 mt-1'>{user?.email || 'movie@explorer.com'}</Text>
          <Text className='text-accent mt-1 text-center px-6'>
            {getMovieTitle(savedMovies.length)}
          </Text>

          <Text className='text-light-200 mt-2 text-xs text-center px-8'>
            {getNextTitleProgress(savedMovies.length)}
          </Text>
        </View>

        <View className='flex-row gap-3 mt-8'>
          <TouchableOpacity onPress={() => router.push('/(tabs)/saved')} className='flex-1 bg-dark-200/70 border border-accent rounded-2xl p-4'>
            <Text className='text-light-200 text-xs uppercase'>Saved Movies</Text>
            <Text className='text-white text-2xl font-bold mt-2'>{savedMovies.length}</Text>
          </TouchableOpacity>

          <View className='flex-1 bg-dark-200/70 border border-accent rounded-2xl p-4'>
            <Text className='text-light-200 text-xs uppercase'>Avg Rating</Text>
            <View className='flex-row items-center mt-2'>
              <Image source={icons.star} className='size-4 mr-1' />
              <Text className='text-white text-2xl font-bold'>{averageRating}</Text>
            </View>
          </View>
        </View>

        <View className='mt-6 bg-dark-200/70 border border-white/10 rounded-2xl p-5'>
          <Text className='text-white text-lg font-semibold'>Watch Goals</Text>

          <View className='mt-4 flex-row items-center justify-between'>
            <Text className='text-light-200'>Recent release in saved</Text>
            <Text className='text-white font-semibold'>{latestSavedYear}</Text>
          </View>

          <View className='mt-3 flex-row items-center justify-between'>
            <Text className='text-light-200'>Next milestone</Text>
            <Text className='text-white font-semibold'>{Math.max(savedMovies.length, 0) + (10 - (savedMovies.length % 10 || 10))} movies</Text>
          </View>
        </View>

        <View className='mt-6'>
          <TouchableOpacity
            className='bg-accent rounded-xl py-4 mb-3'
            onPress={() => router.push('/search')}
            activeOpacity={0.85}
          >
            <Text className='text-black text-center font-bold text-base'>Discover New Movies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='bg-white/10 border border-white/15 rounded-xl py-4'
            onPress={() => router.push('/(tabs)/saved')}
            activeOpacity={0.85}
          >
            <Text className='text-white text-center font-semibold text-base'>Open Saved Collection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className='border-accent border rounded-xl mt-10 py-4 mb-3'
            onPress={async () => {
              await logout();
              router.replace("/");
            }}
            activeOpacity={0.85}
          >
            <Text className='text-white text-center font-bold text-base'>Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  )
}

export default Profile