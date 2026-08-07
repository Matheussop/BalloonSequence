import React, {useCallback, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const BALLOON_SIZE = 72;
const TOKEN_SIZE = 48;
const FINAL_TOP = 28;
const FINAL_LEFT = 4;
const FINAL_GAP = 52;
const DEFAULT_NUMBERS = [1, 2, 3, 4, 5, 6];

type BalloonData = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const BALLOONS: BalloonData[] = [
  {id: 1, x: 30, y: 154, color: '#5734F5'},
  {id: 2, x: 104, y: 116, color: '#DDFB2A'},
  {id: 3, x: 186, y: 144, color: '#5734F5'},
  {id: 4, x: 71, y: 222, color: '#5734F5'},
  {id: 5, x: 151, y: 210, color: '#DDFB2A'},
  {id: 6, x: 216, y: 228, color: '#5734F5'},
];

export function parseNumberInput(text: string): number[] | null {
  const trimmed = text.trim();

  if (/^\d{6}$/.test(trimmed)) {
    return trimmed.split('').map(Number);
  }

  const parts = trimmed.split(/[\s,;]+/).filter(Boolean);
  if (parts.length !== BALLOONS.length || parts.some(part => !/^\d+$/.test(part))) {
    return null;
  }

  return parts.map(Number);
}

type BalloonProps = {
  item: BalloonData;
  value: number;
  finalIndex: number;
  collected: boolean;
  ordered: Animated.Value;
  disabled: boolean;
  onStart: () => void;
  onPop: (id: number) => void;
};

function Balloon({
  item,
  value,
  finalIndex,
  collected,
  ordered,
  disabled,
  onStart,
  onPop,
}: BalloonProps) {
  const flight = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;
  const tapped = useRef(false);

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
    ]).start(() => onPop(item.id));
  };

  const tokenX = FINAL_LEFT + finalIndex * FINAL_GAP;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.token,
          {
            left: item.x + (BALLOON_SIZE - TOKEN_SIZE) / 2,
            top: item.y + 8,
            opacity: reveal,
            transform: [
              {
                translateX: ordered.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, tokenX - item.x - 12],
                }),
              },
              {
                translateY: ordered.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, FINAL_TOP - item.y - 8],
                }),
              },
              {scale: reveal},
            ],
          },
        ]}>
        <Text style={styles.tokenText}>{value}</Text>
      </Animated.View>

      {!collected && (
        <Pressable
          accessibilityLabel={`Balão ${item.id}`}
          accessibilityRole="button"
          disabled={disabled}
          onPress={pop}
          style={[styles.balloonHitArea, {left: item.x, top: item.y}]}>
          <Animated.View
            style={{
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
            }}>
            <View style={[styles.balloon, {backgroundColor: item.color}]}>
              <Text
                style={[
                  styles.balloonMark,
                  item.color === '#5734F5'
                    ? styles.balloonMarkYellow
                    : styles.balloonMarkPurple,
                ]}>
                ★
              </Text>
              <View
                style={[
                  styles.shine,
                  item.color === '#5734F5'
                    ? styles.shineSubtle
                    : styles.shineStrong,
                ]}
              />
            </View>
            <View style={[styles.knot, {borderTopColor: item.color}]} />
            <View style={styles.string} />
          </Animated.View>
        </Pressable>
      )}
    </>
  );
}

function App(): React.JSX.Element {
  const [collected, setCollected] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [numbers, setNumbers] = useState<number[]>(DEFAULT_NUMBERS);
  const [inputValue, setInputValue] = useState(DEFAULT_NUMBERS.join(', '));
  const [hasStarted, setHasStarted] = useState(false);
  const ordered = useRef(new Animated.Value(0)).current;
  const isComplete = collected.length === BALLOONS.length;
  const parsedInput = parseNumberInput(inputValue);
  const inputIsValid = parsedInput !== null;

  const handlePop = useCallback(
    (id: number) => {
      setCollected(current => {
        if (current.includes(id)) {
          return current;
        }
        const next = [...current, id];
        if (next.length === BALLOONS.length) {
          Animated.timing(ordered, {
            toValue: 1,
            delay: 350,
            duration: 900,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }).start();
        }
        return next;
      });
    },
    [ordered],
  );

  const reset = () => {
    ordered.stopAnimation();
    ordered.setValue(0);
    setCollected([]);
    setRound(current => current + 1);
    setHasStarted(false);
  };

  const defineNumbers = (text: string) => {
    setInputValue(text);
    const parsed = parseNumberInput(text);
    if (parsed) {
      setNumbers(parsed);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5032F4" />
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Animações de balões</Text>
        <Text style={styles.headerCounter}>
          {collected.length}/{BALLOONS.length}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Clique nos balões e descubra a sequência!</Text>
        <Text style={styles.subtitle}>
          Digite seis números. No final, eles manterão a ordem informada.
        </Text>
        <TextInput
          accessibilityLabel="Números dos balões"
          editable={!hasStarted}
          keyboardType="numbers-and-punctuation"
          onChangeText={defineNumbers}
          placeholder="Ex.: 8, 2, 10, 5, 1, 7"
          style={[
            styles.numberInput,
            !inputIsValid && styles.numberInputInvalid,
            hasStarted && styles.numberInputDisabled,
          ]}
          value={inputValue}
        />
        <Text
          style={[
            styles.inputFeedback,
            !inputIsValid && styles.inputFeedbackInvalid,
          ]}>
          {inputIsValid
            ? hasStarted
              ? 'Entrada bloqueada durante a rodada.'
              : 'Sequência válida. Toque nos balões para começar.'
            : 'Informe exatamente seis números separados por vírgula ou espaço.'}
        </Text>

        <View style={styles.stage}>
          {BALLOONS.map(item => (
            <Balloon
              key={`${round}-${item.id}`}
              item={item}
              value={numbers[item.id - 1]}
              finalIndex={item.id - 1}
              collected={collected.includes(item.id)}
              ordered={ordered}
              disabled={!inputIsValid}
              onStart={() => setHasStarted(true)}
              onPop={handlePop}
            />
          ))}
          <View style={styles.mascotWrap}>
            <Text style={styles.mascot}>🧙‍♂️</Text>
            <View style={styles.mascotShadow} />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={reset}
          style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>
            {isComplete ? 'JOGAR NOVAMENTE' : 'RECOMEÇAR'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#5032F4'},
  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5032F4',
  },
  headerEyebrow: {color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  headerCounter: {color: '#DDFB2A', fontSize: 17, fontWeight: '900'},
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 26,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  title: {maxWidth: 330, color: '#171326', fontSize: 25, lineHeight: 30, fontWeight: '900', textAlign: 'center'},
  subtitle: {maxWidth: 310, marginTop: 9, color: '#746F80', fontSize: 14, lineHeight: 20, textAlign: 'center'},
  numberInput: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8D3E3',
    color: '#2C215C',
    fontSize: 14,
    fontWeight: '700',
  },
  numberInputInvalid: {borderColor: '#D93757'},
  numberInputDisabled: {backgroundColor: '#F1EEF5', color: '#746F80'},
  inputFeedback: {
    width: '100%',
    marginTop: 6,
    color: '#5C5570',
    fontSize: 12,
  },
  inputFeedbackInvalid: {color: '#D93757'},
  stage: {width: 340, height: 440, marginTop: 10, overflow: 'visible' },
  balloonHitArea: {position: 'absolute', width: BALLOON_SIZE, height: 108, alignItems: 'center', zIndex: 5},
  balloon: {
    width: BALLOON_SIZE,
    height: BALLOON_SIZE + 10,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#271B57',
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  balloonMark: {fontSize: 27, fontWeight: '900'},
  balloonMarkYellow: {color: '#DDFB2A'},
  balloonMarkPurple: {color: '#5734F5'},
  shine: {position: 'absolute', width: 12, height: 20, borderRadius: 8, top: 13, left: 14, backgroundColor: '#FFFFFF', transform: [{rotate: '28deg'}]},
  shineSubtle: {opacity: 0.3},
  shineStrong: {opacity: 0.55},
  knot: {width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 11, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2},
  string: {width: 1, height: 23, backgroundColor: '#A7A2AE'},
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
  tokenText: {color: '#4930DB', fontSize: 21, fontWeight: '900'},
  mascotWrap: {position: 'absolute', left: 12, bottom: 4, alignItems: 'center'},
  mascot: {fontSize: 73, transform: [{scaleX: -1}]},
  mascotShadow: {width: 62, height: 9, marginTop: -10, borderRadius: 10, backgroundColor: '#E6E2EA'},
  button: {width: '100%', height: 52, marginTop: 'auto', marginBottom: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDFB2A'},
  buttonPressed: {transform: [{scale: 0.98}], opacity: 0.84},
  buttonText: {color: '#2C215C', fontSize: 14, fontWeight: '900', letterSpacing: 0.5},
});

export default App;
