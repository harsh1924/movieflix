import { images } from '@/constants/images';
import MaskedView from '@react-native-masked-view/masked-view';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const TrendingCard = ({ movie: { movie_id, title, poster_url }, index }: TrendingCardProps) => {
    if (!title) return null;

    return (
        <Link href={`/movie/${movie_id}` as any} asChild>
            <TouchableOpacity className='w-32 relative'>
                <Image
                    source={{ uri: poster_url }}
                    className="w-32 h-48 rounded-lg pl-5"
                    resizeMode='cover'
                />
                
                <View className='absolute bottom-9 -left-3.5 px-2 py-1 rounded-full'>
                    <MaskedView
                        maskElement={
                            <Text className='text-6xl text-accent font-bold'>
                                {index + 1}
                            </Text>
                        }
                    >
                        <Image source={images.rankingGradient} className='size-14' resizeMode='cover' />
                    </MaskedView>
                </View>

                    <Text className='text-accent mt-2 text-sm font-bold' numberOfLines={2}>{title}</Text>
            </TouchableOpacity>
        </Link>
    )
}

export default TrendingCard