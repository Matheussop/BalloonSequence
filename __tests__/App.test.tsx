/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App, {parseNumberInput} from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('accepts separated numbers and a compact six-digit input', () => {
  expect(parseNumberInput('8, 2, 10, 5, 1, 7')).toEqual([8, 2, 10, 5, 1, 7]);
  expect(parseNumberInput('821517')).toEqual([8, 2, 1, 5, 1, 7]);
  expect(parseNumberInput('1 2 3')).toBeNull();
  expect(parseNumberInput('1, 2, x, 4, 5, 6')).toBeNull();
});

test('keeps the parsed numbers in the exact input order', () => {
  expect(parseNumberInput('8, 2, 10, 5, 1, 7')).toEqual([8, 2, 10, 5, 1, 7]);
});
