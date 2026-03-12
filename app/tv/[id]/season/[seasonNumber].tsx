import LoginRequired from '@/components/LoginRequired'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { fetchTVSeasonDetails } from '@/services/api'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const TVSeasonDetails = () => {
    const { isAuthenticated } = useAuth()
    const { id, seasonNumber } = useLocalSearchParams<{ id: string; seasonNumber: string }>()

    const [state, setState] = useState<{
        loading: boolean
        error: string | null
        season: any
    }>({
        loading: true,
        error: null,
        season: null,
    })

    const { loading, error, season } = state

    useEffect(() => {
        const loadSeason = async () => {
            if (!id || !seasonNumber) {
                setState((prev) => ({ ...prev, error: 'TV ID or season number missing.', loading: false }))
                return
            }

            try {
                setState((prev) => ({ ...prev, loading: true, error: null }))
                const data = await fetchTVSeasonDetails(id, Number(seasonNumber))
                setState((prev) => ({ ...prev, season: data }))
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    error: err instanceof Error ? err.message : 'Failed to load season details',
                }))
            } finally {
                setState((prev) => ({ ...prev, loading: false }))
            }
        }

        loadSeason()
    }, [id, seasonNumber])

    if (loading) {
        return (
            <View className='flex-1 items-center justify-center bg-primary'>
                <ActivityIndicator size='large' color='#ffffff' />
            </View>
        )
    }

    if (error || !season) {
        return (
            <View className='flex-1 items-center justify-center bg-primary px-6'>
                <Text className='text-red-400 text-center'>{error ?? 'Season not found'}</Text>
            </View>
        )
    }

    if (!isAuthenticated) {
        return <LoginRequired />
    }

    return (
        <View className='flex-1 bg-primary'>
            <Image source={images.bg} className='absolute w-full h-full z-0' resizeMode='cover' />

            <ScrollView className='flex-1 px-5' contentContainerStyle={{ paddingBottom: 100 }}>
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

                <View className='rounded-2xl overflow-hidden'>
                    <Image
                        source={{
                            uri: season.poster_path
                                ? `https://image.tmdb.org/t/p/w780${season.poster_path}`
                                : 'https://placeholder.co/780x1100/1a1a1a/ffffff.png',
                        }}
                        className='w-full h-[320px]'
                        resizeMode='cover'
                    />
                </View>

                <View className='mt-6'>
                    <Text className='text-white text-3xl font-bold'>{season.name || 'N/A'}</Text>
                    <Text className='text-light-200 mt-1'>
                        Season {season.season_number ?? 'N/A'} • {season.air_date || 'Air date N/A'}
                    </Text>
                </View>

                <View className='mt-6'>
                    <Text className='text-white text-lg font-semibold'>Season Details</Text>

                    <View className='mt-3 flex-row justify-between gap-x-4'>
                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Name</Text>
                            <Text className='text-white mt-1'>{season.name || 'N/A'}</Text>
                        </View>
                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Season Number</Text>
                            <Text className='text-white mt-1'>{season.season_number ?? 'N/A'}</Text>
                        </View>
                    </View>

                    <View className='mt-3 flex-row justify-between gap-x-4'>


                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Air Date</Text>
                            <Text className='text-white mt-1'>{season.air_date || 'N/A'}</Text>
                        </View>

                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Episode Count</Text>
                            <Text className='text-white mt-1'>{season.episodes?.length ?? 'N/A'}</Text>
                        </View>
                    </View>

                    <View className='mt-3'>
                        <Text className='text-light-200'>Overview</Text>
                        <Text className='text-white mt-1 leading-6'>{season.overview || 'No overview available.'}</Text>
                    </View>

                </View>

                <View className='mt-8'>
                    <Text className='text-white text-lg font-semibold mb-3'>Episodes</Text>

                    {season.episodes?.length ? (
                        season.episodes.map((episode: any) => (
                            <View key={episode.id} className='bg-dark-100 rounded-xl p-3 mb-4'>
                                {episode.still_path ? (
                                    <Image
                                        source={{ uri: `https://image.tmdb.org/t/p/w780${episode.still_path}` }}
                                        className='w-full h-[160px] rounded-lg mb-3'
                                        resizeMode='cover'
                                    />
                                ) : null}

                                <Text className='text-white text-base font-semibold'>
                                    {episode.episode_number && episode.season_number ? `S${episode.season_number}E${episode.episode_number}` : 'N/A'}. {episode.name || 'N/A'}
                                </Text>

                                <View className='mt-3 flex-row justify-between gap-x-4'>
                                    <View className='w-[48%]'>
                                        <Text className='text-light-200 text-xs'>Season Number</Text>
                                        <Text className='text-white mt-1'>{episode.season_number ?? 'N/A'}</Text>
                                    </View>

                                    <View className='w-[48%]'>
                                        <Text className='text-light-200 text-xs'>Air Date</Text>
                                        <Text className='text-white mt-1'>{episode.air_date || 'N/A'}</Text>
                                    </View>
                                </View>

                                <View className='mt-3 flex-row justify-between gap-x-4'>
                                    <View className='w-[48%]'>
                                        <Text className='text-light-200 text-xs'>Runtime</Text>
                                        <Text className='text-white mt-1'>
                                            {typeof episode.runtime === 'number' ? `${episode.runtime} min` : 'N/A'}
                                        </Text>
                                    </View>

                                    <View className='w-[48%]'>
                                        <Text className='text-light-200 text-xs'>Vote Average</Text>
                                        <Text className='text-white mt-1'>
                                            {typeof episode.vote_average === 'number' ? episode.vote_average.toFixed(1) : 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                <View className='mt-3'>
                                    <Text className='text-light-200 text-xs'>Overview</Text>
                                    <Text className='text-white mt-1 leading-6'>
                                        {episode.overview || 'No overview available.'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className='text-light-200'>No episodes available.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

export default TVSeasonDetails
