import LoginRequired from '@/components/LoginRequired'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useAuth } from '@/context/AuthContext'
import { fetchTVDetails, fetchTVSeasonDetails } from '@/services/api'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const TVSeasonDetails = () => {
    const { isAuthenticated } = useAuth()
    const { id, seasonNumber } = useLocalSearchParams<{ id: string; seasonNumber: string }>()

    const [state, setState] = useState<{
        loading: boolean
        error: string | null
        season: any
        tvShow: any
    }>({
        loading: true,
        error: null,
        season: null,
        tvShow: null,
    })
    const [showFullOverview, setShowFullOverview] = useState(false)

    const { loading, error, season, tvShow } = state

    useEffect(() => {
        const loadSeason = async () => {
            if (!id || !seasonNumber) {
                setState((prev) => ({ ...prev, error: 'TV ID or season number missing.', loading: false }))
                return
            }

            try {
                setState((prev) => ({ ...prev, loading: true, error: null }))

                const [seasonData, tvData] = await Promise.all([
                    fetchTVSeasonDetails(id, Number(seasonNumber)),
                    fetchTVDetails(id),
                ])

                setState((prev) => ({ ...prev, season: seasonData, tvShow: tvData }))
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

    const episodeCount = season?.episodes?.length || 0

    const averageRuntime = useMemo(() => {
        const runtimes = (season?.episodes || [])
            .map((episode: any) => episode?.runtime)
            .filter((runtime: any) => typeof runtime === 'number')

        if (!runtimes.length) return 'N/A'
        const avg = Math.round(runtimes.reduce((sum: number, runtime: number) => sum + runtime, 0) / runtimes.length)
        return `${avg} min`
    }, [season])

    const seasonCast = useMemo(() => {
        const castList = season?.aggregate_credits?.cast || season?.credits?.cast || []
        const seen = new Set<number>()
        return castList
            .filter((actor: any) => {
                if (!actor?.id || seen.has(actor.id)) return false
                seen.add(actor.id)
                return true
            })
            .slice(0, 18)
    }, [season])

    const seasonGallery = useMemo(() => {
        const posters = season?.images?.posters || []
        const stills = season?.images?.stills || []
        const backdrops = season?.images?.backdrops || []
        const merged = [...posters, ...stills, ...backdrops]

        const seen = new Set<string>()
        return merged
            .filter((img: any) => {
                if (!img?.file_path || seen.has(img.file_path)) return false
                seen.add(img.file_path)
                return true
            })
            .slice(0, 14)
    }, [season])

    const relatedSeasons = useMemo(() => {
        return (tvShow?.seasons || [])
            .filter((item: any) => item?.season_number !== season?.season_number)
            .slice(0, 10)
    }, [season, tvShow])

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

            <ScrollView
                className='flex-1 px-5'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
            >
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

                <View className='rounded-3xl overflow-hidden relative'>
                    <Image
                        source={{
                            uri: season.poster_path
                                ? `https://image.tmdb.org/t/p/w1280${season.poster_path}`
                                : season?.episodes?.[0]?.still_path
                                    ? `https://image.tmdb.org/t/p/w1280${season.episodes[0].still_path}`
                                    : 'https://placeholder.co/1200x900/090513/ffffff.png',
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
                        <Text className='text-white text-3xl font-bold' numberOfLines={2}>
                            {(tvShow?.name || 'TV Show')} - {season.name || `Season ${season.season_number ?? ''}`}
                        </Text>
                        <Text className='text-light-200 mt-1' numberOfLines={1}>
                            {season.air_date || 'Air date N/A'} • {episodeCount} Episodes
                        </Text>
                    </View>
                </View>

                <View className='mt-6'>
                    <Text className='text-white text-lg font-semibold'>Season Details</Text>

                    <View className='mt-3 flex-row justify-between gap-x-4'>
                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Air Date</Text>
                            <Text className='text-white mt-1'>{season.air_date || 'N/A'}</Text>
                        </View>

                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Episode Count</Text>
                            <Text className='text-white mt-1'>{episodeCount}</Text>
                        </View>
                    </View>

                    <View className='mt-3 flex-row justify-between gap-x-4'>
                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Season Number</Text>
                            <Text className='text-white mt-1'>Season {season.season_number ?? 'N/A'}</Text>
                        </View>

                        <View className='w-[48%]'>
                            <Text className='text-light-200'>Avg Runtime</Text>
                            <Text className='text-white mt-1'>{averageRuntime}</Text>
                        </View>
                    </View>
                </View>

                <View className='mt-6'>
                    <Text className='text-white text-lg font-semibold'>Season Overview</Text>
                    <Text className='text-light-200 mt-2 leading-6'>
                        {season.overview
                            ? showFullOverview
                                ? season.overview
                                : `${season.overview.slice(0, 220)}${season.overview.length > 220 ? '...' : ''}`
                            : 'No overview available.'}
                    </Text>
                    {season.overview?.length > 220 && (
                        <TouchableOpacity
                            className='self-start mt-3 bg-black/70 border border-gray-500 rounded-lg px-3 py-1.5'
                            onPress={() => setShowFullOverview((prev) => !prev)}
                        >
                            <Text className='font-semibold text-white'>
                                {showFullOverview ? 'Read Less' : 'Read More'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className='mt-8'>
                    <Text className='text-white text-lg font-semibold mb-3'>Episodes</Text>
                    {season.episodes?.length ? (
                        season.episodes.map((episode: any) => (
                            /* Episode card: large still image on left + compact details on right */
                            <View
                                key={episode.id}
                                className='bg-dark-100 rounded-xl p-3 mb-4'
                            >
                                <View className='flex-row'>
                                    {/* Left column: episode still image */}
                                    <Image
                                        source={{
                                            uri: episode.still_path
                                                ? `https://image.tmdb.org/t/p/w780${episode.still_path}`
                                                : season.poster_path
                                                    ? `https://image.tmdb.org/t/p/w780${season.poster_path}`
                                                    : 'https://placeholder.co/900x500/1a1a1a/ffffff.png',
                                        }}
                                        className='w-[136px] h-[102px] rounded-xl'
                                        resizeMode='cover'
                                    />

                                    {/* Right column: title, runtime, air date, and short overview */}
                                    <View className='flex-1 ml-3 justify-between'>
                                        <View>
                                            <View className='flex-row items-start justify-between'>
                                                <Text className='text-white text-base font-semibold flex-1 mr-2' numberOfLines={2}>
                                                    EP {episode.episode_number ?? 'N/A'} - {episode.name || 'Untitled'}
                                                </Text>                                                
                                            </View>

                                            <Text className='text-light-200 mt-2 text-xs'>
                                                {episode.air_date || 'N/A'} • {typeof episode.runtime === 'number' ? `${episode.runtime} min` : 'N/A'}</Text>
                                            <Text className='text-light-200 mt-2 leading-5 text-xs' numberOfLines={2}>
                                                {episode.overview || 'No episode description available.'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className='text-light-200'>No episodes available.</Text>
                    )}
                </View>

                {seasonCast.length > 0 && (
                    <View className='mt-4'>
                        <Text className='text-white text-lg font-semibold mb-3'>Cast This Season</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {seasonCast.map((actor: any) => (
                                <TouchableOpacity
                                    key={actor.id}
                                    className='mr-3 w-[96px]'
                                    activeOpacity={0.88}
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
                                                : 'https://placeholder.co/100x150/161428/ffffff.png',
                                        }}
                                        className='w-[96px] h-[128px] rounded-xl'
                                        resizeMode='cover'
                                    />
                                    <Text className='text-white mt-2 text-xs font-semibold' numberOfLines={1}>{actor.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {seasonGallery.length > 0 && (
                    <View className='mt-8'>
                        <Text className='text-white text-lg font-semibold mb-3'>Season Gallery</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {seasonGallery.map((image: any, index: number) => (
                                <Image
                                    key={`${image.file_path}-${index}`}
                                    source={{ uri: `https://image.tmdb.org/t/p/w780${image.file_path}` }}
                                    className='w-[190px] h-[120px] rounded-2xl mr-3'
                                    resizeMode='cover'
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {relatedSeasons.length > 0 && (
                    <View className='mt-8'>
                        <Text className='text-white text-lg font-semibold mb-3'>Related Seasons</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {relatedSeasons.map((item: any) => (
                                <TouchableOpacity
                                    key={item.id || item.season_number}
                                    className='mr-3 w-[132px]'
                                    onPress={() =>
                                        router.push({
                                            pathname: '/tv/[id]/season/[seasonNumber]',
                                            params: {
                                                id: String(id),
                                                seasonNumber: String(item.season_number),
                                            },
                                        } as any)
                                    }
                                >
                                    <Image
                                        source={{
                                            uri: item.poster_path
                                                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                                                : 'https://placeholder.co/200x300/151225/ffffff.png',
                                        }}
                                        className='w-[132px] h-[188px] rounded-2xl'
                                        resizeMode='cover'
                                    />
                                    <Text className='text-white text-sm font-semibold mt-2' numberOfLines={2}>
                                        {item.name || `Season ${item.season_number}`}
                                    </Text>
                                    <Text className='text-light-200 text-xs mt-1'>Season {item.season_number ?? 'N/A'}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default TVSeasonDetails
