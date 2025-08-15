export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  reference?: string | null;
  description?: string | null;
  stock: number;
  categoryId: string;
  category: Category;
}

export interface OrderItem {
  id: string;
  quantity: number;
  product: Product | null;
}

export interface Order {
  id: string;
  status: "PENDING" | "ACKNOWLEDGED" | "IN_PREPARATION" | "COMPLETED";
  notes?: string | null;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
  items: OrderItem[];
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}
