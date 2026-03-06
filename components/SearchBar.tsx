import React from 'react'
import { View, Image, TextInput } from 'react-native'
import { icons } from '@/constants/icons'

// Read Acess - eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NGFhZGM5OWMxMDU0Y2Y5YjMwMDJhNjM3MmYxOTMwOCIsIm5iZiI6MTc3Mjc5MDE1NS40OTIsInN1YiI6IjY5YWFhMThiNGMzNmQyZTMyYWE1OGI4YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1U6d6JkEQO7zPvfRCai0taUKbIgpFsiXMN4kIsVMizM

// Key - 54aadc99c1054cf9b3002a6372f19308

interface Props {
    onPress?: () => void;
    placeholder: string;
}

const SearchBar = ({ onPress, placeholder }: Props) => {
    return (
        <View className='flex-row items-center bg-dark-200 rounded-full px-5 py-4'>
            <Image source={icons.search} className='size-5' resizeMode='contain' tintColor="#ab8bff" />
            <TextInput
                onPress={onPress}
                placeholder={placeholder}
                placeholderTextColor={"#a8b5db"}
                className='flex-1 ml-3 text-white'
                value=''
                onChange={() => { }}
            />
        </View>
    )
}

export default SearchBar