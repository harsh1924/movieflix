# Movie Save Feature - Setup and Flow

## 1. Storage Setup

### Installed package

- Initial install:
  - `npm i @react-native-async-storage/async-storage`
- Final Expo-compatible install (important fix):
  - `npx expo install @react-native-async-storage/async-storage`

### Created file

- `services/savedMovies.ts`

### Functions added in `services/savedMovies.ts`

- `getSavedMovies(): Promise<SavedMovie[]>`
- `isMovieSaved(movieId: number): Promise<boolean>`
- `saveMovie(movie: SavedMovie): Promise<SavedMovie[]>`
- `removeSavedMovie(movieId: number): Promise<SavedMovie[]>`
- `toggleSavedMovie(movie: SavedMovie): Promise<{ saved: boolean; movies: SavedMovie[] }>`
- Internal helper: `writeSavedMovies(movies: SavedMovie[])`

## 2. Types Added

### Updated file

- `interfaces/interfaces.d.ts`

### Added type

```ts
interface SavedMovie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}
```

## 3. API Function Added

### Updated file

- `services/api.ts`

### Function added

- `fetchMovieDetails(id: string | number): Promise<MovieDetails>`

Purpose:

- Fetches detailed data for a single movie by id from TMDB.

## 4. Movie Details Page Implemented

### Updated file

- `app/movies/[id].tsx`

### Core logic used

- `useLocalSearchParams` to read route id
- `useEffect` to fetch details on mount/id change
- `useMemo` to compute formatted genres
- `handleToggleSave()` to save/remove movie in storage

### UI states handled

- Loading state (`ActivityIndicator`)
- Error state
- Content state with poster, metadata, overview, and save button

## 5. Save/Unsave in Movie Cards

### Updated file

- `components/MovieCard.tsx`

### Core logic used

- `useEffect` + `isMovieSaved(id)` for initial state
- `handleToggleSave()` using:
  - `saveMovie(movie)`
  - `removeSavedMovie(id)`

### UI added

- Save/Saved badge overlay on movie poster card

## 6. Saved Tab Built

### Updated file

- `app/(tabs)/saved.tsx`

### Core logic used

- `useFocusEffect` + `useCallback` to reload every time tab is focused
- `loadSaved()` calls `getSavedMovies()`

### UI states handled

- Loading state
- Empty state ("No saved movies yet")
- Populated grid state via `FlatList` + `MovieCard`

## 7. Trending Navigation Fix

### Updated file

- `components/TrendingCard.tsx`

### Route fix

- Changed:
  - `/movie/${movie_id}`
- To:
  - `/movies/${movie_id}`

Reason:

- Match actual route path (`app/movies/[id].tsx`).

## 8. Profile Page Built

### Updated file

- `app/(tabs)/profile.tsx`

### Core logic used

- `useFocusEffect` to reload saved movies when tab is active
- `useMemo` for computed stats:
  - `averageRating`
  - `latestSavedYear`
  - next milestone count
- `useRouter` for navigation actions:
  - `router.push('/search')`
  - `router.push('/saved')`

### UI added

- Profile header
- Stats cards
- Watch goals section
- CTA buttons

## 9. Validation and Troubleshooting Steps

### Diagnostics/checks used

- Problems check (TypeScript errors)
- Lint check:
  - `npm run lint`

### Runtime/start issues encountered

- Wrong command typed:
  - `fnpx expo start` (fails)
- Correct command:
  - `npx expo start`

### Port conflict case

- If `8081` is busy, Expo prompts for alternate port.
- Solution:
  - Accept suggested alternate port (example: `8082`), or
  - Free port `8081` and restart.

## 10. Final File Change Summary

- `services/savedMovies.ts` (new)
- `services/api.ts`
- `interfaces/interfaces.d.ts`
- `components/MovieCard.tsx`
- `components/TrendingCard.tsx`
- `app/movies/[id].tsx`
- `app/(tabs)/saved.tsx`
- `app/(tabs)/profile.tsx`
- `package.json`
- `package-lock.json`

---

## Copyable Quick Notes

```text
Install (Expo-safe): npx expo install @react-native-async-storage/async-storage
Run app: npx expo start
If port 8081 is busy: accept alternate port (e.g., 8082)

Main saved-movie functions:
- getSavedMovies
- isMovieSaved
- saveMovie
- removeSavedMovie
- toggleSavedMovie
```

Github account setup complete