import { Geolocation } from '@capacitor/geolocation';
import { isCountryCode } from '../data/countries';

export type LocationFailure = 'denied' | 'unavailable' | 'network';

export class LocationError extends Error {
  constructor(
    message: string,
    public reason: LocationFailure,
  ) {
    super(message);
    this.name = 'LocationError';
  }
}

/**
 * Service de géocodage inverse sans clé d'API, prévu pour être appelé depuis le navigateur.
 * Il ne reçoit qu'une position arrondie (environ 11 km) et rien n'est enregistré par l'app.
 */
const GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export async function getCoordinates(): Promise<{ latitude: number; longitude: number }> {
  try {
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false, // position approximative : suffisant pour trouver un pays
      timeout: 10000,
      maximumAge: 600000,
    });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch (e) {
    const code = (e as { code?: number }).code;
    const message = String((e as { message?: unknown })?.message ?? '').toLowerCase();
    if (code === 1 || message.includes('denied') || message.includes('permission')) {
      throw new LocationError("L'accès à la position a été refusé.", 'denied');
    }
    throw new LocationError('Position indisponible pour le moment.', 'unavailable');
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export async function reverseGeocodeCountry(
  latitude: number,
  longitude: number,
  fetchFn: typeof fetch = (...args) => fetch(...args),
): Promise<string> {
  const url = `${GEOCODE_URL}?latitude=${round1(latitude)}&longitude=${round1(longitude)}&localityLanguage=fr`;
  let response: Response;
  try {
    response = await fetchFn(url);
  } catch {
    throw new LocationError('Impossible de joindre le service de localisation.', 'network');
  }
  if (!response.ok) {
    throw new LocationError('Le service de localisation a répondu avec une erreur.', 'network');
  }
  const body = (await response.json().catch(() => null)) as { countryCode?: unknown } | null;
  const code = typeof body?.countryCode === 'string' ? body.countryCode.toUpperCase() : null;
  if (!isCountryCode(code)) {
    throw new LocationError('Aucun pays trouvé pour cette position.', 'unavailable');
  }
  return code;
}

/** Détecte le pays de l'utilisateur à partir de sa position. */
export async function detectCountry(): Promise<string> {
  const { latitude, longitude } = await getCoordinates();
  return reverseGeocodeCountry(latitude, longitude);
}

/** Arrondit une coordonnée à 0,01° (environ 1 km) : assez précis pour les heures de prière. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Détecte le pays et renvoie aussi la position arrondie (conservée sur l'appareil). */
export async function detectPlace(): Promise<{ code: string; lat: number; lon: number }> {
  const { latitude, longitude } = await getCoordinates();
  const code = await reverseGeocodeCountry(latitude, longitude);
  return { code, lat: round2(latitude), lon: round2(longitude) };
}
