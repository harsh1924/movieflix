import { View, Text, TextInput } from 'react-native'
import React, { useState } from 'react'

const CustomInput = ({
    placeholder = 'Enter text',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = "default"
}: CustomInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className='w-full'>
            {label && <Text className='label text-white mb-3 font-bold'>{label}</Text>}

            <TextInput
                value={value}
                autoCorrect={false}
                autoCapitalize='none'
                placeholder={placeholder}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                placeholderTextColor="#ffffff"
                secureTextEntry={secureTextEntry}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={isFocused ? 'border border-accent w-full  px-3 rounded mb-4 text-light-100' : 'w-full border-white border px-3 rounded mb-4 text-light-100'}
            />
        </View>
    )
}

export default CustomInput