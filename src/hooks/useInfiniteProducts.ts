import useSWRInfinite from 'swr/infinite';
import { apiClient } from '@/lib/api';
import type { APIResponse, ProductListResponse, Product } from '@/types/api';
import productsData from '@/app/swr/mock/products.json';

interface UseInfiniteProductsOptions {
  limit?: number;
  category?: string;
}

export const useInfiniteProducts = ({ 
  limit = 6, 
  category 
}: UseInfiniteProductsOptions = {}) => {
  const getKey = (pageIndex: number, previousPageData: ProductListResponse | null) => {
    if (previousPageData && previousPageData.products.length === 0) {
      return null;
    }
    
    const params = new URLSearchParams({
      page: (pageIndex + 1).toString(),
      limit: limit.toString(),
    });
    
    if (category) {
      params.append('category', category);
    }
    
    return `/products?${params.toString()}`;
  };

  const fetcher = async (url: string): Promise<ProductListResponse> => {
    const response = await apiClient.get<APIResponse<ProductListResponse>>(url);
    
    if (response.data.status === 'success') {
      return response.data.data;
    }
    throw new Error(response.data.message);
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    }
  );

  const products: Product[] = data ? data.flatMap(page => page.products) : [];
  const total = data?.[0]?.total ?? 0;
  const hasMore = products.length < total;
  const isEmpty = data?.[0]?.products.length === 0;

  const loadMore = () => {
    if (!isLoading && !isValidating && hasMore) {
      setSize(size + 1);
    }
  };

  return {
    products,
    total,
    hasMore,
    isEmpty,
    isLoading: isLoading || isValidating,
    error,
    loadMore,
    mutate,
    size,
  };
};

// JSONファイルから無限スクロール用のデータを取得
export const useInfiniteProductsFromJSON = ({
  limit = 6,
  category
}: UseInfiniteProductsOptions = {}) => {
  const getKey = (pageIndex: number, previousPageData: Product[] | null) => {
    if (previousPageData && previousPageData.length === 0) {
      return null;
    }
    
    return `products-infinite-${pageIndex}-${limit}-${category || 'all'}`;
  };

  const fetcher = async (key: string): Promise<Product[]> => {
    // keyからページ情報を取得
    const [, , pageStr, limitStr, categoryFilter] = key.split('-');
    const pageIndex = parseInt(pageStr);
    const pageLimit = parseInt(limitStr);
    
    // ローディング遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredProducts = productsData as Product[];
    
    // カテゴリフィルタリング
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    // ページネーション
    const startIndex = pageIndex * pageLimit;
    const endIndex = startIndex + pageLimit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return paginatedProducts;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    }
  );

  const products: Product[] = data ? data.flat() : [];
  
  // 全データ数を計算
  let allProducts = productsData as Product[];
  if (category) {
    allProducts = allProducts.filter(product => product.category === category);
  }
  const total = allProducts.length;
  const hasMore = products.length < total;
  const isEmpty = data?.[0]?.length === 0;

  const loadMore = () => {
    if (!isLoading && !isValidating && hasMore) {
      setSize(size + 1);
    }
  };

  return {
    products,
    total,
    hasMore,
    isEmpty,
    isLoading: isLoading || isValidating,
    error,
    loadMore,
    mutate,
    size,
  };
};