import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Hostel, Building, Floor, Room, Bed, RoomSummary } from "@bhagirathi/types";

export const useHostels = () => {
  return useQuery<Hostel[]>({
    queryKey: ["hostels"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/hostels");
      return response.data;
    }
  });
};

export const useBuildings = (hostelId?: string | null) => {
  return useQuery<Building[]>({
    queryKey: ["buildings", hostelId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/buildings", {
        params: hostelId ? { hostel_id: hostelId } : {}
      });
      return response.data;
    },
    enabled: hostelId !== null && hostelId !== undefined
  });
};

export const useFloors = (buildingId?: string | null) => {
  return useQuery<Floor[]>({
    queryKey: ["floors", buildingId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/floors", {
        params: buildingId ? { building_id: buildingId } : {}
      });
      return response.data;
    },
    enabled: buildingId !== null && buildingId !== undefined
  });
};

export interface RoomFilters {
  hostel_id?: string | null;
  building_id?: string | null;
  floor_id?: string | null;
  status?: string | null;
  search?: string | null;
  room_type?: string | null;
  page?: number;
  limit?: number;
}

export const useRooms = (filtersOrFloorId?: string | null | RoomFilters) => {
  const params: Record<string, any> = {};
  let queryKeyParts: any[] = [];

  if (typeof filtersOrFloorId === "string") {
    if (filtersOrFloorId) params.floor_id = filtersOrFloorId;
    queryKeyParts = [filtersOrFloorId];
  } else if (filtersOrFloorId && typeof filtersOrFloorId === "object") {
    if (filtersOrFloorId.hostel_id) params.hostel_id = filtersOrFloorId.hostel_id;
    if (filtersOrFloorId.building_id) params.building_id = filtersOrFloorId.building_id;
    if (filtersOrFloorId.floor_id) params.floor_id = filtersOrFloorId.floor_id;
    if (filtersOrFloorId.status && filtersOrFloorId.status !== "ALL") params.status = filtersOrFloorId.status;
    if (filtersOrFloorId.search) params.search = filtersOrFloorId.search;
    if (filtersOrFloorId.room_type && filtersOrFloorId.room_type !== "ALL") params.room_type = filtersOrFloorId.room_type;
    if (filtersOrFloorId.page) params.page = filtersOrFloorId.page;
    if (filtersOrFloorId.limit) params.limit = filtersOrFloorId.limit;
    queryKeyParts = [
      filtersOrFloorId.hostel_id,
      filtersOrFloorId.building_id,
      filtersOrFloorId.floor_id,
      filtersOrFloorId.status,
      filtersOrFloorId.search,
      filtersOrFloorId.room_type,
      filtersOrFloorId.page,
      filtersOrFloorId.limit,
    ];
  }

  return useQuery<Room[]>({
    queryKey: ["rooms", ...queryKeyParts],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/rooms", { params });
      return response.data;
    },
  });
};

export interface RoomSummaryFilters {
  hostel_id?: string | null;
  building_id?: string | null;
  floor_id?: string | null;
  status?: string | null;
  search?: string | null;
}

export const useRoomsSummary = (filters?: RoomSummaryFilters) => {
  const params: Record<string, any> = {};
  if (filters?.hostel_id) params.hostel_id = filters.hostel_id;
  if (filters?.building_id) params.building_id = filters.building_id;
  if (filters?.floor_id) params.floor_id = filters.floor_id;
  if (filters?.status && filters.status !== "ALL") params.status = filters.status;
  if (filters?.search) params.search = filters.search;

  return useQuery<RoomSummary>({
    queryKey: [
      "roomsSummary",
      filters?.hostel_id,
      filters?.building_id,
      filters?.floor_id,
      filters?.status,
      filters?.search,
    ],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/rooms/summary", { params });
      return response.data;
    },
  });
};

export const useBeds = (roomId?: string | null) => {
  return useQuery<Bed[]>({
    queryKey: ["beds", roomId],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/beds", {
        params: roomId ? { room_id: roomId } : {}
      });
      return response.data;
    },
    enabled: roomId !== null && roomId !== undefined
  });
};

// --- Mutations ---
export const useHostelMutations = () => {
  const queryClient = useQueryClient();

  const createHostel = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/hostels", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostels"] })
  });

  const updateHostel = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/hostels/${id}`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hostels"] })
  });

  const deleteHostel = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/hostels/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
    }
  });

  const restoreHostel = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/hostels/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostels"] });
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
    }
  });

  return { createHostel, updateHostel, deleteHostel, restoreHostel };
};

export const useBuildingMutations = () => {
  const queryClient = useQueryClient();

  const createBuilding = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/buildings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    }
  });

  const updateBuilding = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/buildings/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
    }
  });

  const deleteBuilding = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/buildings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["roomAvailability"] });
    }
  });

  const restoreBuilding = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/buildings/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["roomAvailability"] });
    }
  });

  return { createBuilding, updateBuilding, deleteBuilding, restoreBuilding };
};

export const useFloorMutations = () => {
  const queryClient = useQueryClient();

  const createFloor = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/floors", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
    }
  });

  const updateFloor = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/floors/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
    }
  });

  const deleteFloor = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/floors/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["roomAvailability"] });
    }
  });

  const restoreFloor = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/floors/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["roomAvailability"] });
    }
  });

  return { createFloor, updateFloor, deleteFloor, restoreFloor };
};

export const useRoomMutations = () => {
  const queryClient = useQueryClient();

  const createRoom = useMutation({
    mutationFn: async (data: any) => {
      const { room_category, ...rest } = data;
      const payload = {
        ...rest,
        room_type: room_category,
      };
      const response = await apiClient.post("/api/v1/rooms", payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", variables.floor_id] });
      queryClient.invalidateQueries({ queryKey: ["rooms", null] });
    }
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { room_category, ...rest } = data;
      const payload = {
        ...rest,
        room_type: room_category,
      };
      const response = await apiClient.put(`/api/v1/rooms/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", data.floor_id] });
      queryClient.invalidateQueries({ queryKey: ["rooms", null] });
    }
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/rooms/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", data.floor_id] });
      queryClient.invalidateQueries({ queryKey: ["rooms", null] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
    }
  });

  const restoreRoom = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/rooms/${id}/restore`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["rooms", data.floor_id] });
      queryClient.invalidateQueries({ queryKey: ["rooms", null] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
    }
  });

  return { createRoom, updateRoom, deleteRoom, restoreRoom };
};

export const useBedMutations = () => {
  const queryClient = useQueryClient();

  const createBed = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post("/api/v1/beds", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds", variables.room_id] });
      queryClient.invalidateQueries({ queryKey: ["beds", null] });
    }
  });

  const updateBed = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/v1/beds/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds", data.room_id] });
      queryClient.invalidateQueries({ queryKey: ["beds", null] });
    }
  });

  const deleteBed = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/beds/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds", data.room_id] });
      queryClient.invalidateQueries({ queryKey: ["beds", null] });
    }
  });

  const restoreBed = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/beds/${id}/restore`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomsSummary"] });
      queryClient.invalidateQueries({ queryKey: ["beds", data.room_id] });
      queryClient.invalidateQueries({ queryKey: ["beds", null] });
    }
  });

  return { createBed, updateBed, deleteBed, restoreBed };
};

// --- Summary & Dossier Hooks ---
export const useHostelSummary = (hostelId?: string | null) => {
  return useQuery({
    queryKey: ["hostelSummary", hostelId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/hostels/${hostelId}/summary`);
      return response.data;
    },
    enabled: !!hostelId
  });
};

export const useBuildingSummary = (buildingId?: string | null) => {
  return useQuery({
    queryKey: ["buildingSummary", buildingId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/buildings/${buildingId}/summary`);
      return response.data;
    },
    enabled: !!buildingId
  });
};

export const useFloorSummary = (floorId?: string | null) => {
  return useQuery({
    queryKey: ["floorSummary", floorId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/floors/${floorId}/summary`);
      return response.data;
    },
    enabled: !!floorId
  });
};

export const useRoomDossier = (roomId?: string | null) => {
  return useQuery({
    queryKey: ["roomDossier", roomId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/rooms/${roomId}/dossier`);
      return response.data;
    },
    enabled: !!roomId
  });
};

export const useRoomAvailability = () => {
  return useQuery({
    queryKey: ["roomAvailability"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/rooms/admin/room-availability");
      return response.data;
    }
  });
};

