import type { Todo } from './Todo';

export interface GroceryList {
  id: string;
  name: string;
  items: Todo[];
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
}
