import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_MOVIES_KEY = '@myapp/saved-movies';

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  try {
    const data = await AsyncStorage.getItem(SAVED_MOVIES_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data) as SavedMovie[];
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.error('Error reading saved movies:', error);
    return [];
  }
};

const writeSavedMovies = async (movies: SavedMovie[]) => {
  await AsyncStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(movies));
};

export const isMovieSaved = async (movieId: number): Promise<boolean> => {
  const movies = await getSavedMovies();
  return movies.some((movie) => movie.id === movieId);
};

export const saveMovie = async (movie: SavedMovie): Promise<SavedMovie[]> => {
  const movies = await getSavedMovies();
  const alreadySaved = movies.some((item) => item.id === movie.id);

  if (alreadySaved) return movies;

  const updated = [movie, ...movies];
  await writeSavedMovies(updated);
  return updated;
};

export const removeSavedMovie = async (movieId: number): Promise<SavedMovie[]> => {
  const movies = await getSavedMovies();
  const updated = movies.filter((movie) => movie.id !== movieId);
  await writeSavedMovies(updated);
  return updated;
};

export const toggleSavedMovie = async (movie: SavedMovie): Promise<{ saved: boolean; movies: SavedMovie[] }> => {
  const movies = await getSavedMovies();
  const exists = movies.some((item) => item.id === movie.id);

  if (exists) {
    const updated = movies.filter((item) => item.id !== movie.id);
    await writeSavedMovies(updated);
    return { saved: false, movies: updated };
  }

  const updated = [movie, ...movies];
  await writeSavedMovies(updated);
  return { saved: true, movies: updated };
};
