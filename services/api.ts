export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
    }
}

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

export const fetchMovieDetails = async (id: string): Promise<MovieDetails> => {
    try {
        const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${id}`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch movie details: ${response.statusText}`);
        }

        const data = await response.json();
        return data as MovieDetails;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
};

export const fetchMovieTrailer = async (id: string) => {
    try {
        const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${id}/videos`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch trailer`);
        }

        const data = await response.json();

        const trailer = data.results.find(
            (video: any) =>
                video.type === "Trailer" &&
                video.site === "YouTube"
        );

        return trailer;
    } catch (error) {
        console.error("Error fetching trailer:", error);
        throw error;
    }
};