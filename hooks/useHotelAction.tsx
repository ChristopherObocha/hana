import { useState } from 'react';

export type AccessibilityAttributes = {
  rohId: number;
};

export type Hotel = {
  id: string;
  name: string;
  hotelDescription: string;
  currency: string;

  country: string;
  city: string;

  latitude: number;
  longitude: number;

  address: string;
  zip: string;

  main_photo: string;
  thumbnail: string;

  stars: number;

  hotelTypeId: number;
  chainId: number;
  chain: string | null;

  accessibilityAttributes: AccessibilityAttributes;

  deletedAt: string | null;

  score?: number;

  rating: number;
  reviewCount: number;

  facilityIds: number[];
};

const useHotelAction = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = 'https://api.liteapi.travel/v3.0/data/';
  const liteApiKey = process.env.EXPO_PUBLIC_LITEAPI_KEY!;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-API-Key': liteApiKey,
    },
  };

  const fetchHotels = async (placeId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}hotels?placeId=${placeId}`,
        options
      );
      const data = await response.json();
      setHotels(data.data as Hotel[]);
    } catch (error) {
      setError(error as string);
    } finally {
      setIsLoading(false);
    }
  };
  return { hotels, isLoading, error, fetchHotels };
};

export default useHotelAction;
