import type { APIResponse, Product, ProductListResponse } from "@/types/api";
import useSWR from "swr"


export const useProducts = () => {
  const path = '/api/v2/products'

  // SWR用のfetcher関数
  const fetcher = async (): Promise<Product[]> => {
    const response = await fetch(path)
    const data: APIResponse<ProductListResponse> = await response.json();
    
    if (data.status === 'success') {
      return data.data.products;
    }
    throw new Error(data.message);
  };

  	// SWRを使用してデータを取得（設定オプション付き）
	const { data, error, isLoading, mutate } = useSWR(path, fetcher, {
		refreshInterval: 60000, // 1分ごとに自動更新
		revalidateOnFocus: true, // フォーカス時に再検証
		revalidateOnReconnect: true, // 再接続時に再検証
		dedupingInterval: 10000, // 10秒間は重複リクエストを防ぐ
	});


  return {
    data,
    error,
    isLoading,
    mutate
  }
}