export interface Food {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface Sale {
  id: string;
  food_id: string;
  payment_method: 'pix' | 'cartao' | 'dinheiro';
  created_at: string;
}

export interface PixConfig {
  id: string;
  pix_key: string;
  merchant_name: string;
  updated_at: string;
}

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export interface FoodSalesStats {
  food: Food;
  total: number;
  pix: number;
  cartao: number;
  dinheiro: number;
  amount: number;
}
