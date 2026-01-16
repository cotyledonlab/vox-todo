import type { Category } from '../types/Todo';

export const CATEGORY_ORDER: Category[] = [
  'produce',
  'dairy',
  'meat',
  'frozen',
  'pantry',
  'bakery',
  'beverages',
  'household',
  'other',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  meat: 'Meat & Seafood',
  frozen: 'Frozen',
  pantry: 'Pantry',
  bakery: 'Bakery',
  beverages: 'Beverages',
  household: 'Household',
  other: 'Other',
};

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  produce: [
    'apple',
    'apples',
    'banana',
    'bananas',
    'berries',
    'blueberries',
    'strawberries',
    'grapes',
    'orange',
    'oranges',
    'lemon',
    'lime',
    'avocado',
    'lettuce',
    'spinach',
    'kale',
    'tomato',
    'tomatoes',
    'onion',
    'onions',
    'garlic',
    'potato',
    'potatoes',
    'carrot',
    'carrots',
    'cucumber',
    'pepper',
    'peppers',
    'broccoli',
    'cauliflower',
    'celery',
    'mushroom',
    'mushrooms',
    'cilantro',
    'parsley',
    'basil',
    'ginger',
  ],
  dairy: [
    'milk',
    'almond milk',
    'oat milk',
    'cheese',
    'yogurt',
    'butter',
    'cream',
    'sour cream',
    'cottage cheese',
    'eggs',
  ],
  meat: [
    'beef',
    'chicken',
    'pork',
    'turkey',
    'ham',
    'bacon',
    'sausage',
    'steak',
    'fish',
    'salmon',
    'tuna',
    'shrimp',
  ],
  frozen: [
    'frozen',
    'ice cream',
    'frozen pizza',
    'frozen veggies',
  ],
  pantry: [
    'pasta',
    'rice',
    'beans',
    'canned',
    'soup',
    'cereal',
    'flour',
    'sugar',
    'oil',
    'vinegar',
    'sauce',
    'ketchup',
    'mustard',
    'spice',
    'spices',
    'salt',
    'peppercorn',
  ],
  bakery: [
    'bread',
    'bagel',
    'bagels',
    'baguette',
    'bun',
    'buns',
    'roll',
    'rolls',
    'pastry',
    'cake',
    'muffin',
    'cookies',
  ],
  beverages: [
    'water',
    'sparkling water',
    'soda',
    'juice',
    'coffee',
    'tea',
    'beer',
    'wine',
    'kombucha',
  ],
  household: [
    'paper towels',
    'toilet paper',
    'detergent',
    'dish soap',
    'soap',
    'shampoo',
    'conditioner',
    'trash bags',
    'garbage bags',
    'cleaner',
    'bleach',
    'napkins',
    'tissues',
    'foil',
    'wrap',
    'batteries',
  ],
  other: [],
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesKeyword = (text: string, keyword: string) => {
  const normalized = text.toLowerCase();
  const needle = keyword.toLowerCase();
  if (needle.includes(' ')) {
    return normalized.includes(needle);
  }
  const regex = new RegExp(`\\b${escapeRegExp(needle)}\\b`, 'i');
  return regex.test(normalized);
};

export const inferCategoryFromName = (name: string): Category => {
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return 'other';
  }

  for (const category of CATEGORY_ORDER) {
    if (category === 'other') {
      continue;
    }
    const keywords = CATEGORY_KEYWORDS[category] ?? [];
    if (keywords.some(keyword => matchesKeyword(normalized, keyword))) {
      return category;
    }
  }

  return 'other';
};
