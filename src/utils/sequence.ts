import {BALLOON_COUNT} from '../config/balloons';

export function parseNumberInput(text: string): number[] | null {
  const trimmed = text.trim();

  if (trimmed.length === BALLOON_COUNT && /^\d+$/.test(trimmed)) {
    return trimmed.split('').map(Number);
  }

  const parts = trimmed.split(/[\s,;]+/).filter(Boolean);
  const hasInvalidPart = parts.some(part => !/^\d+$/.test(part));

  if (parts.length !== BALLOON_COUNT || hasInvalidPart) {
    return null;
  }

  return parts.map(Number);
}

export function createShuffledOrder(
  values: number[],
  random: () => number = Math.random,
): number[] {
  const order = values.map((_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  const visibleOrderChanged = order.some(
    (sourceIndex, balloonIndex) => values[sourceIndex] !== values[balloonIndex],
  );

  if (visibleOrderChanged) {
    return order;
  }

  const differentValueIndex = values.findIndex(value => value !== values[0]);
  if (differentValueIndex < 1) {
    return order;
  }

  [order[0], order[differentValueIndex]] = [
    order[differentValueIndex],
    order[0],
  ];

  return order;
}
