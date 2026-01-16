export type QuantityParseResult = {
  name: string;
  quantity?: number;
  unit?: string;
  hasQuantity: boolean;
};

const UNIT_ALIASES: Record<string, string> = {
  lb: 'lbs',
  lbs: 'lbs',
  pound: 'lbs',
  pounds: 'lbs',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  gal: 'gallons',
  gallon: 'gallons',
  gallons: 'gallons',
  count: 'count',
  ct: 'count',
  cts: 'count',
  dozen: 'dozen',
  doz: 'dozen',
  bunch: 'bunch',
  bunches: 'bunch',
  bag: 'bag',
  bags: 'bag',
  box: 'box',
  boxes: 'box',
};

const normalizeUnit = (unit?: string) => {
  if (!unit) {
    return undefined;
  }
  return UNIT_ALIASES[unit.toLowerCase()];
};

const cleanName = (value: string) => value.replace(/^(of|a|an)\s+/i, '').trim();

export const parseQuantityFromText = (input: string): QuantityParseResult => {
  const raw = input.trim();
  if (!raw) {
    return { name: '', hasQuantity: false };
  }

  const withUnit = raw.match(/^([0-9]*\.?[0-9]+)\s*([a-zA-Z]+)\s*(?:of\s+)?(.+)?$/i);
  if (withUnit) {
    const quantity = Number(withUnit[1]);
    const unit = normalizeUnit(withUnit[2]);
    const remainder = cleanName(withUnit[3] ?? '');
    if (!Number.isNaN(quantity) && unit) {
      return {
        name: remainder,
        quantity,
        unit,
        hasQuantity: true,
      };
    }
  }

  const withCount = raw.match(/^([0-9]*\.?[0-9]+)\s+(?:of\s+)?(.+)$/i);
  if (withCount) {
    const quantity = Number(withCount[1]);
    const remainder = cleanName(withCount[2]);
    if (!Number.isNaN(quantity)) {
      return {
        name: remainder,
        quantity,
        unit: 'count',
        hasQuantity: true,
      };
    }
  }

  return {
    name: raw,
    hasQuantity: false,
  };
};

export const formatQuantity = (quantity?: number, unit?: string) => {
  if (quantity === undefined) {
    return '';
  }
  const normalizedUnit = normalizeUnit(unit);
  if (!normalizedUnit || normalizedUnit === 'count') {
    return String(quantity);
  }
  return `${quantity} ${normalizedUnit}`;
};
