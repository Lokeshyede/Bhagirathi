import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@bhagirathi/api-client";
import { Notification, NotificationUnreadCount } from "@bhagirathi/types";

export const useNotifications = (filters: {
  statusFilter?: string;
  searchQuery?: string;
  skip?: number;
  limit?: number;
}) => {
  return useQuery<Notification[]>({
    queryKey: ["notifications", filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters.statusFilter && filters.statusFilter !== "ALL") {
        params.status_filter = filters.statusFilter;
      }
      if (filters.searchQuery) {
        params.search = filters.searchQuery;
      }
      if (filters.skip !== undefined) {
        params.skip = filters.skip;
      }
      if (filters.limit !== undefined) {
        params.limit = filters.limit;
      }
      const response = await apiClient.get("/api/v1/notifications", { params });
      return response.data;
    }
  });
};

export const useUnreadCount = () => {
  return useQuery<NotificationUnreadCount>({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/notifications/unread-count");
      return response.data;
    },
    refetchInterval: 30000, // Poll count every 30 seconds for background fresh updates
  });
};

export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/api/v1/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await apiClient.put("/api/v1/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  const archiveNotification = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/api/v1/notifications/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/v1/notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    }
  });

  return {
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification
  };
};
