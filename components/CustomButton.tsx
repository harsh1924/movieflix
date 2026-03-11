import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'

const CustomButton = ({
  onPress,
  title = "Click Me",
  style,
  textStyle,
  leftIcon,
  isLoading = false
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      className=""
      onPress={onPress}
    >
      {leftIcon}
      <View className='flex-center flex-row'>
        {isLoading
          ? <ActivityIndicator size="small" color="white" />
          : (
            <Text className="">
              {title}
            </Text>
          )}
      </View>
    </TouchableOpacity>
  )
}

export default CustomButton