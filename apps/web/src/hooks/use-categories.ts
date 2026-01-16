import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Category, CategoryType } from '@/types/financial';

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>('/financial/categories', {
        params: { type },
      });
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const { data } = await apiClient.post('/financial/categories', category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
