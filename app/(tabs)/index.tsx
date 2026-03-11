import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { isAuthenticated, logout } = useAuth();

  const pages = Array.from({ length: 5 }, (_, i) => page - 2 + i).filter(
    (p) => p > 0
  );
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
    { query: '', page }
  ), [page]);

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
        <View className="flex-row mt-20 mb-5 items-center justify-between px-5">
          <Image source={icons.logo} className="w-12 h-10" />
          {isAuthenticated ? (
            <TouchableOpacity
              className="bg-accent px-4 py-2 rounded"
              onPress={async () => {
                await logout();
                router.replace("/");
              }}
            >
              <Text className="text-white">Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-accent px-4 py-2 rounded"
              onPress={() => router.push("/sign-in")}>
              <Text className="text-white">Log In</Text>
            </TouchableOpacity>
          )}
        </View>

        {
          moviesLoading || trendingMoviesLoading ? (
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

                {/* Trending Movies */}
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

                {/* Latest Movies */}
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
                    ListFooterComponent={
                      <View className="flex-row justify-center items-center gap-2 mt-6">
                        {/* Previous */}
                        <TouchableOpacity
                          disabled={page === 1}
                          onPress={() => setPage((p) => Math.max(1, p - 1))}
                          className={`px-3 py-2 rounded-lg ${page === 1 ? "bg-dark-200/40" : "bg-dark-200"
                            }`}
                        >
                          <Text className="text-white text-lg">{'<'}</Text>
                        </TouchableOpacity>

                        {/* Page Numbers */}
                        {pages.map((num) => (
                          <TouchableOpacity
                            key={num}
                            onPress={() => setPage(num)}
                            className={`px-4 py-2 rounded-lg ${page === num ? "bg-accent" : "bg-dark-200"
                              }`}
                          >
                            <Text
                              className={`font-semibold ${page === num ? "text-black" : "text-white"
                                }`}
                            >
                              {num}
                            </Text>
                          </TouchableOpacity>

                        ))}
                        {/* Next */}
                        <TouchableOpacity
                          onPress={() => setPage((p) => p + 1)}
                          className="px-3 py-2 rounded-lg bg-dark-200"
                        >
                          <Text className="text-white text-lg">{'>'}</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                </>
              </View>
            )
          )
        }

      </ScrollView >

    </View >
  );
}