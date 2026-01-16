export type Category =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'frozen'
  | 'pantry'
  | 'bakery'
  | 'beverages'
  | 'household'
  | 'other';

export interface Todo {
  id: string;
  text: string;
  quantity?: number;
  unit?: string;
  category?: Category;
  categorySource?: 'auto' | 'manual';
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';
