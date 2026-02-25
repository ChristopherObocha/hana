import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type Trip = {
  id: string;
  name: string;
  description?: string;
  visibility: "public" | "private";
  cover_image_url?: string;
  owner_id: string;
};

type TripsContextType = {
  trips: Trip[];
  isLoading: boolean;
  refreshTrips: () => Promise<void>;
  userTrips: Trip[];
  fetchUserTrips: () => Promise<void>;
  trip: Trip | null;
  fetchTrip: (tripId: string) => Promise<void>;
};

const TripsContext = createContext<TripsContextType>({
  trips: [],
  isLoading: false,
  refreshTrips: async () => {},
  userTrips: [],
  fetchUserTrips: async () => {},
  trip: null,
  fetchTrip: async () => {},
});

export const TripsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups") // or "trips"
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    setIsLoading(true);
    console.log("fetching user trips for user:", user?.id);
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("owner_id", user?.id)
        .eq("type", "trip")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUserTrips(data || []);
    } catch (err) {
      console.error("Failed to fetch user trips:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrip = async (tripId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", tripId)
        .eq("type", "trip")
        .single();
      if (error) throw error;
      setTrip(data || null);
    } catch (err) {
      console.error("Failed to fetch trip:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchUserTrips();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TripsContext.Provider value={{ trips, isLoading, refreshTrips: fetchTrips, userTrips, fetchUserTrips, trip, fetchTrip }}>
      {children}
    </TripsContext.Provider>
  );
};

export const useTripsContext = () => useContext(TripsContext);