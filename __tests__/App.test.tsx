/**
 * @format
 */

import React from 'react';
import {Animated} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {createShuffledOrder, parseNumberInput} from '../src/utils/sequence';

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

test('shuffles balloon values but restores the typed order at their destinations', () => {
  const numbers = [3, 2, 5, 1, 2, 5];
  const order = createShuffledOrder(numbers, () => 0.42);
  const valuesOnBalloons = order.map(sourceIndex => numbers[sourceIndex]);
  const alignedValues: number[] = [];

  order.forEach((sourceIndex, balloonIndex) => {
    alignedValues[sourceIndex] = valuesOnBalloons[balloonIndex];
  });

  expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(valuesOnBalloons).not.toEqual(numbers);
  expect(alignedValues).toEqual(numbers);
});

test('keeps a valid permutation when every typed value is equal', () => {
  const order = createShuffledOrder([5, 5, 5, 5, 5, 5], () => 0.5);

  expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
});

test('can finish, reset and start another round without stale animation updates', async () => {
  const parallelSpy = jest.spyOn(Animated, 'parallel').mockImplementation(
    () =>
      ({
        start: (callback?: (result: {finished: boolean}) => void) =>
          callback?.({finished: true}),
        stop: jest.fn(),
        reset: jest.fn(),
      } as Animated.CompositeAnimation),
  );
  const timingSpy = jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        start: (callback?: (result: {finished: boolean}) => void) =>
          callback?.({finished: true}),
        stop: jest.fn(),
        reset: jest.fn(),
      } as Animated.CompositeAnimation),
  );
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  for (let round = 0; round < 2; round += 1) {
    for (let id = 1; id <= 6; id += 1) {
      await ReactTestRenderer.act(() => {
        renderer.root
          .findByProps({accessibilityLabel: `Balão ${id}`})
          .props.onPress();
      });
    }

    expect(
      renderer.root.findByProps({children: 'JOGAR NOVAMENTE'}),
    ).toBeTruthy();

    await ReactTestRenderer.act(() => {
      const resetButton = renderer.root
        .findAllByProps({accessibilityRole: 'button'})
        .find(
          node =>
            typeof node.props.onPress === 'function' &&
            node.props.accessibilityLabel === undefined,
        );
      resetButton?.props.onPress();
    });

    expect(
      renderer.root.findByProps({accessibilityLabel: 'Balão 1'}),
    ).toBeTruthy();
  }

  expect(
    consoleErrorSpy.mock.calls.some(call =>
      call.some(argument =>
        String(argument).includes(
          'useInsertionEffect must not schedule updates',
        ),
      ),
    ),
  ).toBe(false);

  await ReactTestRenderer.act(() => renderer.unmount());
  parallelSpy.mockRestore();
  timingSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});
