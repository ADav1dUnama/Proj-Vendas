import { Food, Sale, PixConfig } from '../types';

const FOODS_KEY = 'vendas_foods';
const SALES_KEY = 'vendas_sales';
const USER_KEY = 'vendas_user';
const PIX_KEY = 'vendas_pix';

const initialFoods: Food[] = [
  {
    id: '1',
    name: 'Exemplo de Produto',
    price: 10,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
    display_order: 1,
    created_at: new Date().toISOString()
  }
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

export const mockDb = {
  // Foods
  getFoods: (): Food[] => {
    const data = localStorage.getItem(FOODS_KEY);
    if (!data) {
      localStorage.setItem(FOODS_KEY, JSON.stringify(initialFoods));
      return initialFoods;
    }
    return JSON.parse(data);
  },
  
  saveFood: (food: Omit<Food, 'id' | 'created_at'>): Food => {
    const foods = mockDb.getFoods();
    const newFood: Food = {
      ...food,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    localStorage.setItem(FOODS_KEY, JSON.stringify([...foods, newFood]));
    return newFood;
  },

  updateFood: (id: string, updates: Partial<Food>): Food | null => {
    const foods = mockDb.getFoods();
    const index = foods.findIndex(f => f.id === id);
    if (index === -1) return null;
    
    const updated = { ...foods[index], ...updates };
    foods[index] = updated;
    localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
    return updated;
  },

  deleteFood: (id: string) => {
    const foods = mockDb.getFoods().filter(f => f.id !== id);
    localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
    
    const sales = mockDb.getSales().filter(s => s.food_id !== id);
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  // Sales
  getSales: (): Sale[] => {
    const data = localStorage.getItem(SALES_KEY);
    return data ? JSON.parse(data) : [];
  },

  addSale: (foodId: string, paymentMethod: string): Sale => {
    const sales = mockDb.getSales();
    const newSale: Sale = {
      id: generateId(),
      food_id: foodId,
      payment_method: paymentMethod as Sale['payment_method'],
      created_at: new Date().toISOString()
    };
    localStorage.setItem(SALES_KEY, JSON.stringify([newSale, ...sales]));
    return newSale;
  },

  // Pix Config
  getPixConfig: (): PixConfig | null => {
    const data = localStorage.getItem(PIX_KEY);
    return data ? JSON.parse(data) : null;
  },

  savePixConfig: (config: Omit<PixConfig, 'id' | 'updated_at'>): PixConfig => {
    const existing = mockDb.getPixConfig();
    const newConfig: PixConfig = {
      ...config,
      id: existing?.id || generateId(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(PIX_KEY, JSON.stringify(newConfig));
    return newConfig;
  },

  // Auth Mock
  getUser: (): unknown => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  },

  setUser: (user: unknown) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user to localStorage', e);
    }
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  }
};
