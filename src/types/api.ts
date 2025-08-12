export interface Product {
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface APIResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}