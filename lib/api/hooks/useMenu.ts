// menu/lib/api/hooks/useMenu.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../client';

// Types
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  item_count: number;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  category_name: string;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_vegan: boolean;
  preparation_time: number;
  image: string | null;
  icon_name: string;
  dietary_tags: string[];
  sort_order: number;
}

export interface Table {
  id: string;
  table_number: string;
  name: string;
  slug: string;
  capacity: number;
  status: string;
  is_active: boolean;
  section: string | null;
  floor: string | null;
  qr_code: string | null;
  qr_code_url: string | null;
  menu_url: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  table: string;
  table_number: string;
  customer_name: string;
  items: OrderItem[];
  total_amount: number;
  status: string;
  payment_status: string;
  placed_at: string;
}

export interface OrderItem {
  id: string;
  menu_item: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions?: string;
}

// ============= PUBLIC MENU HOOKS (No Auth Required) =============

export const usePublicCategories = () => {
  return useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const response = await api.get('/menu/public/categories/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePublicMenuItems = (filters?: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['public-menu-items', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      const response = await api.get(`/menu/public/items/?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// FIX: Use the correct endpoint - /api/tables/public/
export const usePublicTables = () => {
  return useQuery({
    queryKey: ['public-tables'],
    queryFn: async () => {
      // The tables are in their own app, so use /tables/public/
      const response = await api.get('/tables/public/');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// ============= ORDER HOOKS (Requires Auth) =============

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      table: string;
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      items: Array<{ menu_item_id: string; quantity: number; special_instructions?: string }>;
      notes?: string;
      special_instructions?: string;
    }) => {
      console.log('Sending to API:', data);
      const response = await api.post('/menu/orders/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};


export const useOrders = (filters?: { status?: string; table?: string }, options?: any) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.table) params.append('table', filters.table);
      const response = await api.get(`/menu/orders/?${params.toString()}`);
      return response.data;
    },
    ...options, // This allows passing refetchInterval, etc.
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const response = await api.post(`/menu/orders/${id}/update_status/`, { status, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};