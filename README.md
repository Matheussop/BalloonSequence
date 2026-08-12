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

A animação usa `Animated`, `Easing` e `Pressable`. A aparência dos balões vem de `assets/blue_ballon.svg` e `assets/yellow_ballon.svg`, renderizados com `react-native-svg`.

A capivara usa `assets/capivara.svg`. Os fios são caminhos Bézier gerados dinamicamente: todos convergem na mão da capivara e cada fio desaparece quando seu respectivo balão inicia a subida.

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

Toda a demonstração está em `App.tsx`. Os pontos iniciais dos balões ficam em `BALLOONS`; a subida é controlada por `flight`, a entrada da ficha por `reveal` e a reorganização final por `ordered`.

Os SVGs são importados como componentes por meio de `react-native-svg-transformer`, configurado em `metro.config.js`. Depois de alterar essa configuração, reinicie o Metro com `npm start -- --reset-cache`.

O campo aceita seis números separados por vírgula, espaço ou ponto e vírgula, por exemplo `8, 2, 10, 5, 1, 7`. Também aceita seis dígitos juntos, como `821517`.
