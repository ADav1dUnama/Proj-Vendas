export interface User {
  id: string;
  email: string;
  username: string;
  role?: 'user' | 'organizer' | 'admin';
  created_at: string;
}

export interface Organizer {
  id: string;
  user_id: string;
  organization_name?: string;
  bio?: string;
  website?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  location_id: string;
  category_id: string;
  tag_ids: string[];
  start_date: string;
  end_date: string;
  price: number;
  capacity: number;
  created_at: string;
}

export interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Participation {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registered_at: string;
}

export interface Rating {
  id: string;
  event_id: string;
  user_id: string;
  score: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

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
