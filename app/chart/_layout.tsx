import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { Tabs } from 'expo-router'
import React from 'react'
import { Image, ImageBackground, Text, View } from 'react-native'

const TabIcon = ({ focused, icon, title }: any) => {
    if (focused) {
        return (
            <ImageBackground
                source={images.highlight}
                className='flex flex-row w-full flex-1 min-w-[200px] min-h-14 mt-[12px] justify-center items-center rounded-full overflow-hidden'
            >
                <Image
                    source={icon}
                    tintColor="#151312"
                    className='size-5'
                />
                <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
            </ImageBackground>
        )
    }

    return (
        <View className='size-full mt-4 rounded-full justify-center items-center'>
            <Image source={icon} tintColor="#a8b5db" className='size-5' />
        </View>
    )
}
export default function ChartLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false, 
                headerShown: false,
                tabBarItemStyle: {
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                },
                tabBarStyle: {
                    backgroundColor: "#0f0d23",
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 36,
                    height: 52,
                    position: "absolute",
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "#0f0d23"
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ focused }) => (
                        <>
                            <TabIcon
                                focused={focused}
                                icon={icons.home}
                                title="Home"
                            />
                        </>
                    )
                }}
            />

            <Tabs.Screen
                name="chart"
                options={{
                    headerShown: false,
                    title: "Charts",
                    tabBarIcon: ({ focused }) => (
                        <>
                            <TabIcon
                                focused={focused}
                                icon={icons.star}
                                title="Charts"
                            />
                        </>
                    )
                }}
            />
            <Text>ChartLayout</Text>
        </Tabs>
    )
}