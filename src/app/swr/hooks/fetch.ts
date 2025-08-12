import type { Product, ProductListResponse } from "@/types/api";
import { createFetcher } from "@/lib/api";
import useSWR from "swr"
import productsData from '@/app/swr/mock/products.json';


export const useProducts = () => {
  const path = '/products'

  const fetcher = createFetcher<ProductListResponse>(path);

  	// SWRを使用してデータを取得（設定オプション付き）
	const { data, error, isLoading, mutate } = useSWR(path, fetcher, {
		revalidateOnFocus: false, // フォーカス時に再検証はしない
	});


  return {
    data: data?.products,
    error,
    isLoading,
    mutate
  }
}

// JSONファイルからデータを取得するためのhooks
export const useProductsFromJSON = () => {
  const path = 'products-json'

  const fetcher = async (): Promise<Product[]> => {
    // JSON読み込みをシミュレート
    await new Promise(resolve => setTimeout(resolve, 500));
    return productsData as Product[];
  };

  const { data, error, isLoading, mutate } = useSWR(path, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    error,
    isLoading,
    mutate
  }
}