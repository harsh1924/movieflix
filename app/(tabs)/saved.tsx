import LoginRequired from '@/components/LoginRequired'
import MovieCard from '@/components/MovieCard'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { getSavedMovies } from '@/services/savedMovies'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'

const Saved = () => {
  const { isAuthenticated, logout } = useAuth();

  const [movies, setMovies] = useState<SavedMovie[]>([])
  const [loading, setLoading] = useState(true)

  const loadSaved = useCallback(async () => {
    setLoading(true)
    const savedMovies = await getSavedMovies()
    setMovies(savedMovies)
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadSaved()
    }, [loadSaved])
  )

  if (!isAuthenticated) {
    return <LoginRequired />
  }

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className='absolute w-full z-0' resizeMode='cover' />

      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieCard {...item} />}
        numColumns={3}
        className='px-5'
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          gap: 16,
          marginBottom: 14,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View className='w-full mt-20 mb-8'>
            <View className="flex-row mt-5 mb-10 items-center justify-between px-5">
              <Image source={icons.logo} className="w-12 h-10" />
              {isAuthenticated ? (
                <TouchableOpacity
                  className="bg-accent px-4 py-2 rounded"
                  onPress={async () => {
                    await logout();
                    router.replace("/");
                  }}
                >
                  <Text className="text-white">Log Out</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-accent px-4 py-2 rounded"
                  onPress={() => router.push("/sign-in")}>
                  <Text className="text-white">Log In</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text className='text-white text-2xl font-bold'>Saved Movies</Text>
            <Text className='text-light-200 mt-2'>Your bookmarked movies are listed here.</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size='large' color='#ffffff' className='mt-10' />
          ) : (
            <View className='mt-10'>
              <Text className='text-light-200 text-center'>No saved movies yet.</Text>
              <Text className='text-light-300 text-center mt-1'>Tap Save on any movie card to add it here.</Text>
            </View>
          )
        }
      />
    </View>
  )
}

export default Saved