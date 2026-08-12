import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import {
  BALLOON_SIZE,
  BalloonData,
  FINAL_ROW,
  TOKEN_CENTER_OFFSET,
  TOKEN_SIZE,
} from '../config/balloons';

type Props = {
  item: BalloonData;
  value: number;
  finalIndex: number;
  collected: boolean;
  ordered: Animated.Value;
  disabled: boolean;
  onStart: () => void;
  onPop: (id: number) => void;
};

type ArtworkConfig = {
  source: ImageSourcePropType;
  bodyHeight: number;
  width: number;
  height: number;
  left: number;
  top: number;
};

const ARTWORK: Record<BalloonData['variant'], ArtworkConfig> = {
  blue: {
    source: require('../../assets/blue_balloon.webp'),
    bodyHeight: 74,
    width: 162,
    height: 182,
    left: -76,
    top: -11,
  },
  yellow: {
    source: require('../../assets/yellow_balloon.webp'),
    bodyHeight: 80,
    width: 162,
    height: 236,
    left: -74,
    top: -17,
  },
};

const TOKEN_TOP_OFFSET = 8;

export function Balloon({
  item,
  value,
  finalIndex,
  collected,
  ordered,
  disabled,
  onStart,
  onPop,
}: Props) {
  const flight = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;
  const tapped = useRef(false);
  const artwork = ARTWORK[item.variant];

  useEffect(
    () => () => {
      flight.stopAnimation();
      reveal.stopAnimation();
    },
    [flight, reveal],
  );

  const pop = () => {
    if (tapped.current) {
      return;
    }

    tapped.current = true;
    onStart();

    Animated.parallel([
      Animated.timing(flight, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(reveal, {
        toValue: 1,
        delay: 180,
        damping: 11,
        stiffness: 160,
        mass: 0.65,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        onPop(item.id);
      }
    });
  };

  const tokenX = FINAL_ROW.left + finalIndex * FINAL_ROW.gap;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.token,
          {
            left: item.x + TOKEN_CENTER_OFFSET,
            top: item.y + TOKEN_TOP_OFFSET,
            opacity: reveal,
            transform: [
              {
                translateX: ordered.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, tokenX - item.x - TOKEN_CENTER_OFFSET],
                }),
              },
              {
                translateY: ordered.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, FINAL_ROW.top - item.y - TOKEN_TOP_OFFSET],
                }),
              },
              {scale: reveal},
            ],
          },
        ]}>
        <Text style={styles.tokenText}>{value}</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.artwork,
          {
            width: artwork.width,
            height: artwork.height,
            left: item.x + artwork.left,
            top: item.y + artwork.top,
            opacity: flight.interpolate({
              inputRange: [0, 0.75, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateY: flight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -480],
                }),
              },
              {
                translateX: flight.interpolate({
                  inputRange: [0, 0.35, 0.7, 1],
                  outputRange: [0, 9, -7, 4],
                }),
              },
              {
                rotate: flight.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['0deg', '7deg', '-5deg'],
                }),
              },
              {
                scale: flight.interpolate({
                  inputRange: [0, 0.25, 1],
                  outputRange: [1, 1.08, 0.92],
                }),
              },
            ],
          },
        ]}>
        <Image
          accessibilityLabel={`Balão ${
            item.variant === 'blue' ? 'azul' : 'amarelo'
          } com fio`}
          resizeMode="contain"
          source={artwork.source}
          style={styles.image}
        />
      </Animated.View>

      {!collected && (
        <Pressable
          accessibilityLabel={`Balão ${item.id}`}
          accessibilityRole="button"
          disabled={disabled}
          onPress={pop}
          style={[
            styles.hitArea,
            {height: artwork.bodyHeight, left: item.x, top: item.y},
          ]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    position: 'absolute',
    width: BALLOON_SIZE,
    alignItems: 'center',
    zIndex: 5,
  },
  artwork: {
    position: 'absolute',
    overflow: 'visible',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  token: {
    position: 'absolute',
    width: TOKEN_SIZE,
    height: TOKEN_SIZE,
    zIndex: 2,
    borderRadius: TOKEN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDFB2A',
    borderWidth: 2,
    borderColor: '#CBE920',
    shadowColor: '#7B8718',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  tokenText: {
    color: '#4930DB',
    fontSize: 21,
    fontWeight: '900',
  },
});
