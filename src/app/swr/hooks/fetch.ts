import type { ProductListResponse } from "@/types/api";
import { createFetcher } from "@/lib/api";
import useSWR from "swr"


export const useProducts = () => {
  const path = '/products'

  const fetcher = createFetcher<ProductListResponse>(path);

  	// SWRを使用してデータを取得（設定オプション付き）
	const { data, error, isLoading, mutate } = useSWR(path, fetcher, {
		refreshInterval: 60000, // 1分ごとに自動更新
		revalidateOnFocus: true, // フォーカス時に再検証
		revalidateOnReconnect: true, // 再接続時に再検証
		dedupingInterval: 10000, // 10秒間は重複リクエストを防ぐ
	});


  return {
    data: data?.products,
    error,
    isLoading,
    mutate
  }
}