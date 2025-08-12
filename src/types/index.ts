// ECサイト 
export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string;
}

export interface CartItem {
  product: Product
  quantity: number
}

// Todo
export interface Todo {
  id: number
  text: string
  completed: boolean
  createAt: Date
}

export interface Post {
  id: number
  title: string
  content: string
  likes: number
  isLiked: boolean
}