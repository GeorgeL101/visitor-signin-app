import { Location } from '../types';

/**
 * Generate Google Maps review URL from location data
 * Opens Google search to find and review the business
 */
export function generateGoogleReviewUrl(location: Location): string {
  // Build search query from location data
  const searchParts = [
    location.name,
    location.address,
    location.city,
    location.zip,
  ].filter(Boolean);
  
  const searchQuery = searchParts.join(', ');
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // Use a Google search that will show the business with review option
  // This is more likely to surface the review interface than just maps
  return `https://www.google.com/search?q=${encodedQuery}`;
}

/**
 * Get Google review URL - prefers stored URL, then Place ID, falls back to generated
 */
export function getGoogleReviewUrl(location: Location): string | null {
  // If we have a stored URL, use it
  if (location.googleSurveyUrl) {
    return location.googleSurveyUrl;
  }
  
  // If we have a Place ID, use the direct review link
  if (location.googlePlaceId) {
    return `https://search.google.com/local/writereview?placeid=${location.googlePlaceId}`;
  }
  
  // Otherwise generate one from the location data
  return generateGoogleReviewUrl(location);
}
