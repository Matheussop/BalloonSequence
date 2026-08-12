import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import Capivara from './assets/capivara.svg';
import {Balloon} from './src/components/Balloon';
import {
  BALLOON_COUNT,
  BALLOONS,
  DEFAULT_NUMBERS,
  STAGE,
} from './src/config/balloons';
import {createShuffledOrder, parseNumberInput} from './src/utils/sequence';

function App(): React.JSX.Element {
  const [collected, setCollected] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [numbers, setNumbers] = useState<number[]>(DEFAULT_NUMBERS);
  const [balloonOrder, setBalloonOrder] = useState<number[]>(() =>
    createShuffledOrder(DEFAULT_NUMBERS),
  );
  const [inputValue, setInputValue] = useState(DEFAULT_NUMBERS.join(', '));
  const [hasStarted, setHasStarted] = useState(false);
  const ordered = useRef(new Animated.Value(0)).current;
  const isComplete = collected.length === BALLOON_COUNT;
  const inputIsValid = parseNumberInput(inputValue) !== null;
  const inputFeedback = !inputIsValid
    ? 'Informe exatamente seis números separados por vírgula ou espaço.'
    : hasStarted
    ? 'Entrada bloqueada durante a rodada.'
    : 'Sequência válida. Toque nos balões para começar.';

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const orderingAnimation = Animated.timing(ordered, {
      toValue: 1,
      delay: 350,
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    });

    orderingAnimation.start();

    return () => orderingAnimation.stop();
  }, [isComplete, ordered]);

  const handlePop = useCallback((id: number) => {
    setCollected(current =>
      current.includes(id) ? current : [...current, id],
    );
  }, []);

  const startRound = useCallback(() => setHasStarted(true), []);

  const resetRound = () => {
    ordered.stopAnimation();
    ordered.setValue(0);
    setCollected([]);
    setBalloonOrder(createShuffledOrder(numbers));
    setRound(current => current + 1);
    setHasStarted(false);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const parsed = parseNumberInput(text);

    if (parsed) {
      setNumbers(parsed);
      setBalloonOrder(createShuffledOrder(parsed));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5032F4" />
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Animações de balões</Text>
        <Text style={styles.headerCounter}>
          {collected.length}/{BALLOON_COUNT}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Clique nos balões e descubra a sequência!
        </Text>
        <Text style={styles.subtitle}>
          Digite seis números. Eles aparecerão embaralhados e, no final,
          voltarão à ordem informada.
        </Text>
        <TextInput
          accessibilityLabel="Números dos balões"
          editable={!hasStarted}
          keyboardType="numbers-and-punctuation"
          onChangeText={handleInputChange}
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
          {inputFeedback}
        </Text>

        <View style={styles.stage}>
          {BALLOONS.map(item => {
            const sourceIndex = balloonOrder[item.id - 1];

            return (
              <Balloon
                key={`${round}-${item.id}`}
                item={item}
                value={numbers[sourceIndex]}
                finalIndex={sourceIndex}
                collected={collected.includes(item.id)}
                ordered={ordered}
                disabled={!inputIsValid}
                onStart={startRound}
                onPop={handlePop}
              />
            );
          })}
          <View style={styles.mascotWrap}>
            <Capivara
              accessibilityLabel="Capivara segurando os fios"
              height={118}
              width={118}
            />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={resetRound}
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}>
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
  headerEyebrow: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
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
  title: {
    maxWidth: 330,
    color: '#171326',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 310,
    marginTop: 9,
    color: '#746F80',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
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
  stage: {
    width: STAGE.width,
    height: STAGE.height,
    marginTop: 10,
    overflow: 'visible',
  },
  mascotWrap: {position: 'absolute', left: 0, bottom: 0, zIndex: 6},
  button: {
    width: '100%',
    height: 52,
    marginTop: 'auto',
    marginBottom: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDFB2A',
  },
  buttonPressed: {transform: [{scale: 0.98}], opacity: 0.84},
  buttonText: {
    color: '#2C215C',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default App;
