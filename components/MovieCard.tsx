import { icons } from '@/constants/icons'
import { useAuth } from '@/context/AuthContext'
import { isMovieSaved, removeSavedMovie, saveMovie } from '@/services/savedMovies'
import { Link } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const MovieCard = ({ title, id, poster_path, vote_average, release_date, media_type }: SavedMovie) => {
    const [saved, setSaved] = useState(false)
    const { isAuthenticated } = useAuth();
    const cardHref = media_type === 'tv'
        ? ({ pathname: '/tv/[id]', params: { id: String(id) } } as any)
        : ({ pathname: '/movies/[id]', params: { id: String(id) } } as any)

    useEffect(() => {
        let mounted = true

        const loadSavedState = async () => {
            const exists = await isMovieSaved(id)
            if (mounted) {
                setSaved(exists)
            }
        }

        loadSavedState()

        return () => {
            mounted = false
        }
    }, [id])

    const handleToggleSave = async () => {
        const movie: SavedMovie = { title, id, poster_path, vote_average, release_date, media_type }

        if (saved) {
            await removeSavedMovie(id)
            setSaved(false)
        } else {
            await saveMovie(movie)
            setSaved(true)
        }
    }

    return (
        <View className='flex-1 w-[30%] mb-3'>
            <Link href={cardHref} asChild className='flex-1'>
                <TouchableOpacity className='text-white text-sm'>
                    {/* Poster and Title */}
                    <Image
                        source={{
                            uri: poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : 'https://placeholder.co/600x400/1a1a1a/ffffff.png'
                        }}
                        className='w-full h-52 rounded-lg'
                        resizeMode='cover'
                    />
                    <Text className='text-sm-center font-bold text-white mt-2' numberOfLines={1}>{title}</Text>

                    {/* Review */}
                    <View className='flex-row items-center justify-start gap-x-1'>
                        <Image source={icons.star} className='size-4' />
                        <Text className='text-white text-sm font-bold uppercase'>{(vote_average ?? 0).toFixed(1)}</Text>
                    </View>

                    {/* Release Date */}
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-xs text-light-300 font-medium mt-1'>
                            {release_date ? new Date(release_date).getFullYear() : 'N/A'}
                        </Text>
                        <Text className='text-xs font-medium text-light-300 uppercase'>
                            {media_type === 'tv' ? 'TV Show' : 'Movie'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Link>

            {isAuthenticated && (
                <TouchableOpacity
                    onPress={handleToggleSave}
                    className='absolute top-2 right-2 rounded-full px-2 py-1 bg-black/60'
                    hitSlop={8}
                >
                    <Text className='text-xs font-bold text-white'>{saved ? 'Saved' : 'Save'}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default MovieCard