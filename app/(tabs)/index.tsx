import HorizontalMovieSection from "@/components/HorizontalMovieSection";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMovies,
  fetchPopularMovies,
  fetchPopularTV,
  fetchTopRatedMovies,
  fetchTopRatedTV,
  fetchTrendingMovies,
  fetchTrendingTV,
  fetchTVShows,
  fetchUpcomingMovies
} from "@/services/api";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [contentType, setContentType] = useState<"movie" | "tv">("movie");

  // ⭐ NEW state for trending filter
  const [trendType, setTrendType] = useState<"day" | "week">("day");

  const { isAuthenticated, logout } = useAuth();

  const startPage = Math.max(1, page - 2);
  const pages = Array.from({ length: 5 }, (_, i) => startPage + i);

  // ⭐ UPDATED trending fetch
  const {
    data: trendingMovies,
    loading: trendingMoviesLoading,
    error: trendingMoviesError
  } = useFetch(() => fetchTrendingMovies(trendType), [trendType]);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies(
    { query: '', page }
  ), [page]);

  const {
    data: popularMovies,
    loading: popularMoviesLoading,
    error: popularMoviesError,
  } = useFetch(() => fetchPopularMovies(), []);

  const {
    data: topRatedMovies,
    loading: topRatedMoviesLoading,
    error: topRatedMoviesError,
  } = useFetch(() => fetchTopRatedMovies(), []);

  const {
    data: upcomingMovies,
    loading: upcomingMoviesLoading,
    error: upcomingMoviesError,
  } = useFetch(() => fetchUpcomingMovies(), []);

  const {
    data: trendingTV,
    loading: trendingTVLoading,
    error: trendingTVError,
  } = useFetch(() => fetchTrendingTV(trendType), [trendType]);

  const {
    data: tvShows,
    loading: tvShowsLoading,
    error: tvShowsError,
  } = useFetch(() => fetchTVShows({ query: '', page }), [page]);

  const {
    data: popularTV,
    loading: popularTVLoading,
    error: popularTVError,
  } = useFetch(() => fetchPopularTV(), []);

  const {
    data: topRatedTV,
    loading: topRatedTVLoading,
    error: topRatedTVError,
  } = useFetch(() => fetchTopRatedTV(), []);

  useEffect(() => {
    setPage(1);
  }, [contentType]);

  const hasMovieLoadError =
    moviesError ||
    trendingMoviesError ||
    popularMoviesError ||
    topRatedMoviesError ||
    upcomingMoviesError;

  const isLoadingMovieSections =
    moviesLoading ||
    trendingMoviesLoading ||
    popularMoviesLoading ||
    topRatedMoviesLoading ||
    upcomingMoviesLoading;

  const hasTVLoadError =
    tvShowsError ||
    trendingTVError ||
    popularTVError ||
    topRatedTVError;

  const isLoadingTVSections =
    tvShowsLoading ||
    trendingTVLoading ||
    popularTVLoading ||
    topRatedTVLoading;

  const hasSectionLoadError = contentType === "movie" ? hasMovieLoadError : hasTVLoadError;
  const isLoadingMainSections = contentType === "movie" ? isLoadingMovieSections : isLoadingTVSections;

  return (
    <View className="flex-1 bg-primary">
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
          isLoadingMainSections ? (
            <ActivityIndicator size="large" color="#0000ff" className="mt-10 self-center" />
          ) : (
            hasSectionLoadError ? (
              <View className="mt-10 self-center">
                <Text className="text-red-500">{moviesError?.message || trendingMoviesError?.message || popularMoviesError?.message || topRatedMoviesError?.message || upcomingMoviesError?.message}</Text>
              </View>
            ) : (
              <View className="flex-1 mt-5">
                {/* Search Bar */}
                <SearchBar
                  onPress={() => router.push("/search")}
                  placeholder={contentType === "movie" ? "Search for Movies, TV shows, Actors..." : "Search for Movies, TV shows, Actors..."}
                />

                <View className="mt-6 flex-row bg-dark-200 rounded-xl p-1 self-start">
                  <TouchableOpacity
                    className={`px-5 py-2 rounded-lg ${contentType === "movie" ? "bg-accent" : "bg-transparent"}`}
                    onPress={() => setContentType("movie")}
                  >
                    <Text className={`font-semibold ${contentType === "movie" ? "text-black" : "text-white"}`}>
                      Movies
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`px-5 py-2 rounded-lg ${contentType === "tv" ? "bg-accent" : "bg-transparent"}`}
                    onPress={() => setContentType("tv")}
                  >
                    <Text className={`font-semibold ${contentType === "tv" ? "text-black" : "text-white"}`}>
                      TV Shows
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Toggle Buttons */}
                {contentType === "movie" && trendingMovies && trendingMovies.length > 0 && (
                  <>
                    <View className="mt-10 flex-row items-center justify-between">
                      <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>

                      {/* ⭐ NEW Toggle Buttons */}
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => setTrendType("day")}
                          className={`px-3 py-2 rounded ${trendType === "day" ? "bg-accent" : "bg-dark-200"}`}
                        >
                          <Text className={`${trendType === "day" ? "text-black" : "text-white"}`}>
                            Today
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setTrendType("week")}
                          className={`px-3 py-2 rounded ${trendType === "week" ? "bg-accent" : "bg-dark-200"}`}
                        >
                          <Text className={`${trendType === "week" ? "text-black" : "text-white"}`}>
                            Week
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                {/* Trending Movies */}
                {contentType === "movie" ? (
                  <>
                    <FlatList
                      horizontal
                      data={trendingMovies}
                      className="mb-4 mt-3"
                      renderItem={({ item, index }) => (
                        <TrendingCard
                          movie={{
                            movie_id: item.id,
                            title: item.title,
                            poster_url: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                            searchTerm: "",
                            count: 0
                          }}
                          index={index}
                        />
                      )}
                      keyExtractor={(item) => item.id.toString()}
                      showsHorizontalScrollIndicator={false}
                      ItemSeparatorComponent={() => <View className="w-4" />}
                    />

                    <HorizontalMovieSection
                      title="Popular Movies"
                      movies={popularMovies || []}
                      sectionKey="popular"
                      mediaType="movie"
                      showAllCategory="movie-popular"
                    />

                    <HorizontalMovieSection
                      title="Top Rated Movies"
                      movies={topRatedMovies || []}
                      sectionKey="top"
                      mediaType="movie"
                      showAllCategory="movie-top-rated"
                    />

                    <HorizontalMovieSection
                      title="Upcoming Movies"
                      movies={upcomingMovies || []}
                      sectionKey="upcoming"
                      mediaType="movie"
                    />

                    <Text className="text-xl font-bold text-white mt-5 mb-3">
                      Discover Movies
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
                          <TouchableOpacity
                            disabled={page === 1}
                            onPress={() => setPage((p) => Math.max(1, p - 1))}
                            className={`px-3 py-2 rounded-lg ${page === 1 ? "bg-dark-200/40" : "bg-dark-200"}`}
                          >
                            <Text className="text-white text-lg">{'<'}</Text>
                          </TouchableOpacity>

                          {pages.map((num) => (
                            <TouchableOpacity
                              key={num}
                              onPress={() => setPage(num)}
                              className={`px-4 py-2 rounded-lg ${page === num ? "bg-accent" : "bg-dark-200"}`}
                            >
                              <Text className={`font-semibold ${page === num ? "text-black" : "text-white"}`}>
                                {num}
                              </Text>
                            </TouchableOpacity>
                          ))}

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
                ) : (
                  <>
                  {/* TV Shows */}
                    <View className="mt-10 flex-row items-center justify-between">
                      <Text className="text-lg text-white font-bold mb-3">Trending TV Shows</Text>

                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => setTrendType("day")}
                          className={`px-3 py-2 rounded ${trendType === "day" ? "bg-accent" : "bg-dark-200"}`}
                        >
                          <Text className={`${trendType === "day" ? "text-black" : "text-white"}`}>
                            Today
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setTrendType("week")}
                          className={`px-3 py-2 rounded ${trendType === "week" ? "bg-accent" : "bg-dark-200"}`}
                        >
                          <Text className={`${trendType === "week" ? "text-black" : "text-white"}`}>
                            Week
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <FlatList
                      horizontal
                      data={trendingTV}
                      className="mt-3"
                      renderItem={({ item, index }) => (
                        <TrendingCard
                          movie={{
                            movie_id: item.id,
                            title: item.name,
                            poster_url: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                            searchTerm: "",
                            count: 0
                          }}
                          index={index}
                          mediaType="tv"
                        />
                      )}
                      keyExtractor={(item) => item.id.toString()}
                      showsHorizontalScrollIndicator={false}
                      ItemSeparatorComponent={() => <View className="w-4" />}
                    />

                    <HorizontalMovieSection
                      title="Popular TV Shows"
                      movies={popularTV || []}
                      sectionKey="tv-popular"
                      mediaType="tv"
                      showAllCategory="tv-popular"
                    />

                    <HorizontalMovieSection
                      title="Top Rated TV Shows"
                      movies={topRatedTV || []}
                      sectionKey="tv-top"
                      mediaType="tv"
                      showAllCategory="tv-top-rated"
                    />

                    <Text className="text-xl font-bold text-white mt-8 mb-3">
                      Discover TV Shows
                    </Text>

                    <FlatList
                      data={tvShows}
                      renderItem={({ item }) => (
                        <MovieCard
                          id={item.id}
                          title={item.name}
                          poster_path={item.poster_path ?? ''}
                          vote_average={item.vote_average ?? 0}
                          release_date={item.first_air_date ?? ''}
                          media_type='tv'
                        />
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
                          <TouchableOpacity
                            disabled={page === 1}
                            onPress={() => setPage((p) => Math.max(1, p - 1))}
                            className={`px-3 py-2 rounded-lg ${page === 1 ? "bg-dark-200/40" : "bg-dark-200"}`}
                          >
                            <Text className="text-white text-lg">{'<'}</Text>
                          </TouchableOpacity>

                          {pages.map((num) => (
                            <TouchableOpacity
                              key={num}
                              onPress={() => setPage(num)}
                              className={`px-4 py-2 rounded-lg ${page === num ? "bg-accent" : "bg-dark-200"}`}
                            >
                              <Text className={`font-semibold ${page === num ? "text-black" : "text-white"}`}>
                                {num}
                              </Text>
                            </TouchableOpacity>
                          ))}

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
                )}
              </View>
            )
          )
        }

      </ScrollView>

    </View>
  );
}