import * as Location from 'expo-location';

export interface UserCoords {
  latitude: number;
  longitude: number;
  isFallback: boolean;
}

// Default center of Dhaka (near Dhanmondi / Farmgate) for fallback
export const DHAKA_DEFAULT_COORDS: UserCoords = {
  latitude: 23.7538,
  longitude: 90.3752,
  isFallback: true,
};

export async function getUserLocation(): Promise<UserCoords> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied, using Dhaka fallback coordinates.');
      return DHAKA_DEFAULT_COORDS;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      isFallback: false,
    };
  } catch (err) {
    console.warn('Error fetching location:', err);
    return DHAKA_DEFAULT_COORDS;
  }
}
