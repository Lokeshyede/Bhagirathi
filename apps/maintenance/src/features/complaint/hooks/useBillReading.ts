import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";

export interface Hostel {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface Building {
  id: string;
  hostel_id: string;
  name: string;
}

export interface Floor {
  id: string;
  building_id: string;
  name: string;
}

export interface Room {
  id: string;
  floor_id: string;
  room_number: string;
}

export interface BillReading {
  id: string;
  hostel_id: string;
  building_id: string;
  floor_id: string;
  room_id: string;
  meter_type: string;
  previous_reading: number;
  current_reading: number;
  reading_date: string;
  meter_photo: string | null;
  meter_image_url?: string | null;
  remarks: string | null;
  created_by: string;
  created_at: string;
  
  hostel_name?: string;
  building_name?: string;
  floor_name?: string;
  room_number?: string;
  creator_name?: string;
}

export const useHostels = () => {
  return useQuery<Hostel[]>({
    queryKey: ["hostels"],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/hostels");
      return res.data;
    }
  });
};

export const useBuildings = (hostelId?: string | null) => {
  return useQuery<Building[]>({
    queryKey: ["buildings", hostelId],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/buildings", {
        params: { hostel_id: hostelId }
      });
      return res.data;
    },
    enabled: !!hostelId
  });
};

export const useFloors = (buildingId?: string | null) => {
  return useQuery<Floor[]>({
    queryKey: ["floors", buildingId],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/floors", {
        params: { building_id: buildingId }
      });
      return res.data;
    },
    enabled: !!buildingId
  });
};

export const useRooms = (floorId?: string | null) => {
  return useQuery<Room[]>({
    queryKey: ["rooms", floorId],
    queryFn: async () => {
      const res = await apiClient.get("/api/v1/rooms", {
        params: { floor_id: floorId }
      });
      return res.data;
    },
    enabled: !!floorId
  });
};

export const useBillReadings = (filters: {
  hostelId?: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  meterType?: string;
}) => {
  return useQuery<BillReading[]>({
    queryKey: ["bill-readings", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.hostelId) params.hostel_id = filters.hostelId;
      if (filters.buildingId) params.building_id = filters.buildingId;
      if (filters.floorId) params.floor_id = filters.floorId;
      if (filters.roomId) params.room_id = filters.roomId;
      if (filters.meterType && filters.meterType !== "ALL") {
        params.meter_type = filters.meterType;
      }
      const res = await apiClient.get("/api/v1/bill-readings", { params });
      return res.data;
    }
  });
};

export const useCreateBillReading = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post("/api/v1/bill-readings", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-readings"] });
    }
  });
};

export interface TenantInfo {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
}

export const useRoomTenants = (roomId?: string | null) => {
  return useQuery<TenantInfo[]>({
    queryKey: ["room-tenants", roomId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/electricity-bills/rooms/${roomId}/tenants`);
      return res.data;
    },
    enabled: !!roomId
  });
};

export const useRoomLastReading = (roomId?: string | null, meterType?: string | null) => {
  return useQuery<{ last_reading?: number, previous_reading?: number | null, current_reading?: number | null }>({
    queryKey: ["room-last-reading", roomId, meterType],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/electricity-bills/rooms/${roomId}/last-reading`, {
        params: { meter_type: meterType }
      });
      return res.data;
    },
    enabled: !!roomId
  });
};

export const useGenerateElectricityBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post("/api/v1/electricity-bills/generate", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bill-readings"] });
      queryClient.invalidateQueries({ queryKey: ["electricity-bills"] });
    }
  });
};
