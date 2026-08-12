# Balloon Sequence

Protótipo em React Native **0.79.2** :

- ao tocar em um balão, ele sobe com uma leve oscilação e sai da tela;
- uma ficha numerada aparece no lugar do balão;
- o usuário define seis números antes de iniciar a rodada;
- os valores são distribuídos aleatoriamente entre os balões a cada entrada válida ou nova rodada;
- depois que os seis balões são escolhidos, as fichas se movem para uma fileira recuperando exatamente a ordem digitada;
- valores repetidos são suportados e permanecem em suas respectivas posições;
- o campo é bloqueado durante a rodada para os valores não mudarem no meio da animação;
- o botão inferior reinicia a experiência e libera o campo para edição.

A animação usa `Animated`, `Easing` e `Pressable`. O corpo de cada balão vem de `assets/blue_balloon.webp` ou `assets/yellow_balloon.webp` e é renderizado pelo componente `Image` do React Native.

A capivara continua usando `assets/capivara.svg`. Os fios são caminhos Bézier vetoriais gerados dinamicamente e convergem na mão da personagem. Para substituir um balão, sobrescreva o WebP correspondente mantendo o nome e o fundo transparente; a imagem não deve conter o fio.

## Executar

Instale as dependências:

```sh
npm install
```

### Android

Com um emulador aberto ou aparelho conectado:

```sh
npm run android
```

### iOS

```sh
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

## Onde alterar a animação

- `App.tsx`: tela, estado da rodada e animação coletiva das fichas;
- `src/components/Balloon.tsx`: toque, subida, revelação e renderização de cada balão;
- `src/config/balloons.ts`: posições, dimensões, variantes e curvas dos fios;
- `src/utils/sequence.ts`: validação do input e embaralhamento dos índices.

A subida é controlada por `flight`, a entrada da ficha por `reveal` e a reorganização final por `ordered`.

Somente a capivara é importada como SVG por meio de `react-native-svg-transformer`. Os balões são assets WebP comuns do React Native. Depois de substituir um arquivo e se o Metro mantiver o asset anterior em cache, reinicie-o com `npm start -- --reset-cache`.

O campo aceita seis números separados por vírgula, espaço ou ponto e vírgula, por exemplo `8, 2, 10, 5, 1, 7`. Também aceita seis dígitos juntos, como `821517`.
