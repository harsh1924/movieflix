import * as Linking from "expo-linking";
import * as Location from "expo-location";

const providerSearchUrls: Record<string, string> = {
    Netflix: "https://www.netflix.com/search?q=",
    "Amazon Prime Video": "https://www.primevideo.com/search/ref=atv_nb_sr?phrase=",
    "Disney Plus": "https://www.disneyplus.com/search?q=",
    "Disney+": "https://www.disneyplus.com/search?q=",
    "Apple TV Plus": "https://tv.apple.com/search?term=",
    "Apple TV+": "https://tv.apple.com/search?term=",
    "Hulu": "https://www.hulu.com/search?q=",
    "HBO Max": "https://play.max.com/search?q=",
    "Max": "https://play.max.com/search?q=",
    "Paramount Plus": "https://www.paramountplus.com/search/?q=",
    "Paramount+": "https://www.paramountplus.com/search/?q=",
    "Peacock": "https://www.peacocktv.com/search?q=",
    "Sony LIV": "https://www.sonyliv.com/search?q=",
    "ZEE5": "https://www.zee5.com/search?q=",
    "JioCinema": "https://www.jiocinema.com/search?q=",
    "Hotstar": "https://www.hotstar.com/in/search?q=",
    "Disney+ Hotstar": "https://www.hotstar.com/in/search?q=",
    "Warner Bros": "https://play.max.com/search?q=",
    "The WB": "https://play.max.com/search?q=",
    "Warner Bros.": "https://play.max.com/search?q=",
};

export const openStreamingProvider = async (
    providerName: string,
    title: string
) => {
    const baseUrl = providerSearchUrls[providerName];

    if (!baseUrl) {
        console.warn("Streaming provider not supported:", providerName);
        return;
    }

    const url = `${baseUrl}${encodeURIComponent(title)}`;

    try {
        await Linking.openURL(url);
    } catch (error) {
        console.warn("Failed to open streaming provider:", error);
    }
};

export const openNearbyTheatres = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            console.warn("Location permission denied");
            return;
        }

        const location = await Location.getCurrentPositionAsync({});

        const { latitude, longitude } = location.coords;

        const url = `https://www.google.com/maps/search/movie+theater/@${latitude},${longitude},15z`;

        await Linking.openURL(url);

    } catch (error) {
        console.warn("Failed to open theatres:", error);
    }
};