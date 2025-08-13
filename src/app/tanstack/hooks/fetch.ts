import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/api';
import productsData from '../mock/products.json';

// JSONファイルからデータを取得するhook
export const useProductsFromJSON = () => {
  return useQuery({
    queryKey: ['products', 'json'],
    queryFn: async (): Promise<Product[]> => {
      // ローディング遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return productsData as Product[];
    },
    staleTime: 10 * 60 * 1000, // 5分間はstale扱いしない
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持（旧cacheTime）
  });
};

// API経由でデータを取得するhook（将来用）
export const useProducts = () => {
  return useQuery({
    queryKey: ['products', 'api'],
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch('/api/v2/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data.products;
      }
      throw new Error(data.message);
    },
    staleTime: 5 * 60 * 1000, // 5分間はstale扱いしない
    gcTime: 10 * 60 * 1000, // 10分間キャッシュを保持
    retry: 3, // エラー時に3回まで再試行
  });
};