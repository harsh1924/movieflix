export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
    }
}

// * MOVIES

export const fetchMovies = async ({ query, page = 1 }: { query: string; page?: number }) => {
    try {
        const endpoint = query
            ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
            : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: TMDB_CONFIG.headers
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
};

export const fetchSearchResults = async ({ query, page = 1 }: { query: string; page?: number }) => {
  try {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: TMDB_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to search content: ${response.statusText}`);
    }

    const data = await response.json();

    return (data.results || []).filter(
      (item: any) =>
        item?.media_type === 'movie' ||
        item?.media_type === 'tv' ||
        item?.media_type === 'person'
    );
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

export const fetchTrendingMovies = async (type: "day" | "week") => {
    try {
        const endpoint = `${TMDB_CONFIG.BASE_URL}/trending/movie/${type}`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) {
            throw new Error("Failed to fetch trending movies");
        }

        const data = await response.json();

        return data.results;
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return [];
    }
};

export const fetchCollection = async (collectionId: string) => {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/collection/${collectionId}`

    const res = await fetch(endpoint, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    return await res.json()
}

export const fetchPopularMovies = async (page = 1) => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/popular?page=${page}`, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    const data = await res.json()

    return data.results
}

export const fetchTopRatedMovies = async (page = 1) => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/top_rated?page=${page}`, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    const data = await res.json()

    return data.results
}

export const fetchUpcomingMovies = async () => {
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/movie/upcoming`, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    const data = await res.json()

    return data.results
}

export const fetchActorDetails = async (id: string) => {
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/person/${id}`, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    return await res.json()
}

export const fetchActorMovies = async (id: string) => {
    const res = await fetch(`${TMDB_CONFIG.BASE_URL}/person/${id}/movie_credits`, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    const data = await res.json()

    return data.cast
}

export const fetchFullMovieDetails = async (id: string) => {
  const endpoint =
    `${TMDB_CONFIG.BASE_URL}/movie/${id}?append_to_response=videos,credits,recommendations,reviews,images,watch/providers`

  const res = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  })

  const data = await res.json()

  return data
}


// * TV SHOWS
export const fetchTVShows = async ({ query, page = 1 }: { query: string; page?: number }) => {
  try {
    const endpoint = query
      ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`
      : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc&page=${page}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: TMDB_CONFIG.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tv shows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching tv shows:", error);
    throw error;
  }
};

export const fetchTVDetails = async (id: string) => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${id}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  const data = await res.json();
  return data;
};

export const fetchTrendingTV = async (type: "day" | "week") => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/trending/tv/${type}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  const data = await res.json();
  return data.results;
};

export const fetchPopularTV = async (page = 1) => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/popular?page=${page}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  const data = await res.json();
  return data.results;
};

export const fetchTopRatedTV = async (page = 1) => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/top_rated?page=${page}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  const data = await res.json();
  return data.results;
};

export const fetchAiringTodayTV = async () => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/airing_today`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  const data = await res.json();
  return data.results;
};

export const fetchOnTheAirTV = async () => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/on_the_air`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  const data = await res.json();
  return data.results;
};

export const fetchTVSeason = async (tvId: string, seasonNumber: number) => {
  const res = await fetch(`${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  return await res.json();
};

export const fetchTVEpisode = async (tvId: string, seasonNumber: number, episodeNumber: number) => {
  const res = await fetch(
    `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
    {
      method: "GET",
      headers: TMDB_CONFIG.headers
    }
  );

  return await res.json();
};

export const fetchFullTVDetails = async (id: string) => {
  const endpoint =
    `${TMDB_CONFIG.BASE_URL}/tv/${id}?append_to_response=videos,credits,recommendations,reviews,images`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers
  });

  return await res.json();
}; 

export const fetchTVSeasonDetails = async (tvId: string, seasonNumber: number) => {
  const res = await fetch(
    `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}`,
    {
      method: "GET",
      headers: TMDB_CONFIG.headers
    }
  )

  const data = await res.json()

  return data
}

export const fetchActors = async (query: string, page = 1) => {
  const res = await fetch(
    `${TMDB_CONFIG.BASE_URL}/search/person?query=${encodeURIComponent(query)}&page=${page}`,
    {
      method: "GET",
      headers: TMDB_CONFIG.headers
    }
  )

  const data = await res.json()

  return data.results
}

