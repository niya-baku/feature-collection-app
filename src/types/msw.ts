export interface MSWProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface MSWCartItem {
  product: MSWProduct;
  quantity: number;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}

export interface ProductListResponse {
  products: MSWProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface CartResponse {
  items: MSWCartItem[];
  total: number;
  itemCount: number;
}

export type MSWVersion = '1.x' | '2.x';