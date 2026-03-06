import React from 'react'
import { Link } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { icons } from '@/constants/icons'

const MovieCard = ({ title, id, poster_path, vote_average, release_date }: Movie) => {
    return (
        <Link href={`/movies/${id}`} asChild className='flex-1'>
            <TouchableOpacity className='text-white text-sm w-[30%]'>
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
                    <Text className='text-white text-sm font-bold uppercase'>{vote_average.toFixed(1)}</Text>
                </View>

                {/* Release Date */}
                <View className='flex-row items-center justify-between'>
                    <Text className='text-xs text-light-300 font-medium mt-1'>
                        {new Date(release_date).getFullYear()}
                    </Text>
                    <Text className='text-xs font-medium text-light-300 uppercase'>
                        Movie
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    )
}

export default MovieCard