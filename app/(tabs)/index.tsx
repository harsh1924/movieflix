import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingMoviesLoading,
    error: trendingMoviesError
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies(
    { query: '' }
  ));

  return (
    // ? It is the main page of the app, which is rendered when the user opens the app. It is the entry point of the app.
    <View
      className="flex-1 bg-primary"
    >
      {/* BG Image */}
      <Image source={images.bg} className="absolute w-full z-0 " />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        {/* Logo */}
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {moviesLoading || trendingMoviesLoading ? (
          <ActivityIndicator size="large" color="#0000ff" className="mt-10 self-center" />
        ) : (
          moviesError || trendingMoviesError ? (
            <View className="mt-10 self-center">
              <Text className="text-red-500">{moviesError?.message || trendingMoviesError?.message}</Text>
            </View>
          ) : (
            <View className="flex-1 mt-5">
              {/* Search Bar */}
              <SearchBar
                onPress={() => router.push("/search")}
                placeholder="Search for movies, TV shows, actors..."
              />

              {trendingMovies && trendingMovies.length > 0 && (
                <>
                  <View className="mt-10">
                    <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
                  </View>
                </>
              )}

              <FlatList
                horizontal
                data={trendingMovies}
                className="mb-4 mt-3"
                renderItem={({ item, index }) => (
                  <TrendingCard movie={item} index={index} />
                )}
                keyExtractor={(item) => item.movie_id.toString()}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
              />

              <>
                <Text className="text-lg text-white mt-5 mb-3">
                  Latest Movies
                </Text>

                <FlatList
                  data={movies}
                  renderItem={({ item }) => (
                    <MovieCard {...item} />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={3}
                  columnWrapperStyle={{
                    justifyContent: "flex-start",
                    gap: 20,
                    paddingRight: 5,
                    marginBottom: 10
                  }}
                  className="mt-2 pb-32"
                  scrollEnabled={false}
                />
              </>
            </View>
          )
        )}

      </ScrollView>

    </View>
  );
}