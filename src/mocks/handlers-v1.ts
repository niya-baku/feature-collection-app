
// MSW 1系のハンドラー（参考用）
// 注意: このファイルは実際には使用されません（MSW 1系がインストールされていないため）

/*
import { rest } from 'msw';
import { MSWProduct, APIResponse, ProductListResponse } from '@/types/msw';
import productsData from '@/data/msw-products.json';

// 商品一覧取得 (MSW 1系の書き方)
export const getProductsV1 = rest.get('/api/v1/products', (req, res, ctx) => {
  const page = Number(req.url.searchParams.get('page')) || 1;
  const limit = Number(req.url.searchParams.get('limit')) || 6;
  const category = req.url.searchParams.get('category');

  let filteredProducts = productsData as MSWProduct[];
  
  if (category) {
    filteredProducts = filteredProducts.filter(product => product.category === category);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const response: APIResponse<ProductListResponse> = {
    data: {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit
    },
    message: 'Products fetched successfully',
    status: 'success'
  };

  return res(
    ctx.delay(500), // レスポンス遅延シミュレート
    ctx.status(200),
    ctx.json(response)
  );
});

// 個別商品取得 (MSW 1系の書き方)
export const getProductByIdV1 = rest.get('/api/v1/products/:id', (req, res, ctx) => {
  const { id } = req.params;
  const product = productsData.find(p => p.id === Number(id));

  if (!product) {
    return res(
      ctx.delay(300),
      ctx.status(404),
      ctx.json({
        data: null,
        message: 'Product not found',
        status: 'error'
      })
    );
  }

  const response: APIResponse<MSWProduct> = {
    data: product as MSWProduct,
    message: 'Product fetched successfully',
    status: 'success'
  };

  return res(
    ctx.delay(300),
    ctx.status(200),
    ctx.json(response)
  );
});

// カート操作 (MSW 1系の書き方)
export const addToCartV1 = rest.post('/api/v1/cart', async (req, res, ctx) => {
  const { productId, quantity } = await req.json();
  
  // 実際のカート処理はローカルストレージやコンテキストで管理
  const response = {
    data: {
      productId,
      quantity,
      addedAt: new Date().toISOString()
    },
    message: 'Product added to cart successfully',
    status: 'success'
  };

  return res(
    ctx.delay(400),
    ctx.status(201),
    ctx.json(response)
  );
});

// MSW 1系ハンドラーの配列
export const handlersV1 = [
  getProductsV1,
  getProductByIdV1,
  addToCartV1
];
*/

// MSW 1系の特徴をコメントで説明
export const MSW_V1_FEATURES = {
  syntax: 'rest.get(), rest.post()を使用',
  requestAccess: 'req.url.searchParams, req.paramsでアクセス',
  responseFormat: 'res(ctx.delay(), ctx.status(), ctx.json())の形式',
  bodyParsing: 'await req.json()でリクエストボディを取得',
  typeScript: '型安全性は限定的',
  setupLocation: 'public/mockServiceWorker.jsが必要'
};