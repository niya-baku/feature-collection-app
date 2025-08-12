
import { http, HttpResponse, delay } from "msw"

import type { MSWProduct, APIResponse, ProductListResponse } from '@/types/msw';
import productsData from '@/app/msw/mock/products.json';

export const getProductsV2 = http.get("/api/v2/products", async ({ request }) => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get("page")) || 1
  const limit = Number(url.searchParams.get("limit")) || 6
  const category = url.searchParams.get("category")

  let filteredProducts = productsData as MSWProduct[];

  if(category) {
    filteredProducts = filteredProducts.filter(product => product.category === category)
  }

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const response: APIResponse<ProductListResponse> = {
    data: {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit
    },
    message: `MSW v2: Products fetched successfully (${paginatedProducts.length} items)`,
    status: 'success' 
  }

  await delay(500); // レスポンス遅延シミュレート

  return HttpResponse.json(response, { status: 200 });
})

// 個別商品取得 (MSW 2系の書き方)
export const getProductByIdV2 = http.get('/api/v2/products/:id', async ({ params }) => {
  const { id } = params;
  const product = productsData.find(p => p.id === Number(id));

  if (!product) {
    return HttpResponse.json({
      data: null,
      message: 'Product not found',
      status: 'error'
    }, { status: 404 });
  }

  const response: APIResponse<MSWProduct> = {
    data: product as MSWProduct,
    message: 'MSW v2: Product fetched successfully',
    status: 'success'
  };

  await delay(300);

  return HttpResponse.json(response, { status: 200 });
});

// カート操作 (MSW 2系の書き方)
export const addToCartV2 = http.post('/api/v2/cart', async ({ request }) => {
  const { productId, quantity } = await request.json() as { productId: number; quantity: number };
  
  // 商品が存在するかチェック
  const product = productsData.find(p => p.id === productId);
  if (!product) {
    return HttpResponse.json({
      data: null,
      message: 'Product not found',
      status: 'error'
    }, { status: 404 });
  }

  const response = {
    data: {
      productId,
      quantity,
      product,
      addedAt: new Date().toISOString()
    },
    message: 'MSW v2: Product added to cart successfully',
    status: 'success'
  };

  await delay(400);

  return HttpResponse.json(response, { status: 201 });
});

// エラーハンドリングのデモ
export const getProductsErrorV2 = http.get('/api/v2/products-error', async () => {  
  await delay(1000);
  
  return HttpResponse.json({
    data: null,
    message: 'MSW v2: Simulated server error',
    status: 'error'
  }, { status: 500 });
});

// MSW 2系ハンドラーの配列
export const handlersV2 = [
  getProductsV2,
  getProductByIdV2,
  addToCartV2,
  getProductsErrorV2
];

// MSW 2系の特徴
export const MSW_V2_FEATURES = {
  syntax: 'http.get(), http.post()を使用',
  requestAccess: '{ request, params }の分割代入でアクセス',
  responseFormat: 'HttpResponse.json()を使用',
  bodyParsing: 'await request.json()でリクエストボディを取得',
  typeScript: '強化された型安全性',
  delay: 'delay()関数が独立',
  setupLocation: 'public/mockServiceWorker.jsが必要（v1と同じ）',
  improvements: [
    'より直感的なAPI',
    '型安全性の向上',
    'エラーハンドリングの改善',
    'レスポンス作成の簡素化'
  ]
};