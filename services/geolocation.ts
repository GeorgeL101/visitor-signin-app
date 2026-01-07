import { Location } from '../types';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest location to the given coordinates
 */
export function findNearestLocation(
  userLat: number,
  userLon: number,
  locations: Location[]
): Location | null {
  if (locations.length === 0) {
    return null;
  }
  
  // Filter out locations without lat/long
  const validLocations = locations.filter(
    loc => loc.latitude != null && loc.longitude != null
  );
  
  if (validLocations.length === 0) {
    return null;
  }
  
  let nearestLocation = validLocations[0];
  let shortestDistance = calculateDistance(
    userLat,
    userLon,
    nearestLocation.latitude!,
    nearestLocation.longitude!
  );
  
  for (let i = 1; i < validLocations.length; i++) {
    const location = validLocations[i];
    const distance = calculateDistance(
      userLat,
      userLon,
      location.latitude!,
      location.longitude!
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestLocation = location;
    }
  }
  
  console.log(`Nearest location: ${nearestLocation.name} (${shortestDistance.toFixed(2)} miles away)`);
  
  return nearestLocation;
}
