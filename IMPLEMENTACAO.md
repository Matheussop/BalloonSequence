# Documentação da implementação

## 1. Objetivo do projeto

O **Balloon Sequence** é um aplicativo criado com React Native 0.79.2 para reproduzir a interação apresentada no vídeo de referência.

Na tela há seis balões. Antes da rodada, o usuário informa os seis valores que deseja revelar. Quando toca em um balão, ele sobe, oscila levemente e desaparece. Uma ficha numerada é revelada na posição que estava ocupada pelo balão. Depois que todos os balões forem escolhidos, as seis fichas se deslocam para o topo e formam uma sequência na mesma ordem em que os valores foram digitados.

Os valores são definidos manualmente pelo campo de entrada. Números repetidos são aceitos e cada ocorrência preserva sua posição original.

## 2. Tecnologias utilizadas

- React Native 0.79.2;
- React 19;
- TypeScript;
- API `Animated` do React Native;
- `Pressable` para as interações de toque;
- `react-native-svg` para renderizar as artes vetoriais;
- `react-native-svg-transformer` para importar `.svg` como componente;
- Jest e React Test Renderer para os testes;
- CocoaPods para a integração das dependências nativas no iOS;
- Hermes como engine JavaScript.

Não foi adicionada nenhuma biblioteca externa de animação. As bibliotecas de SVG cuidam somente da renderização das artes; toda a movimentação continua sendo feita pela API `Animated` do React Native.

## 3. Arquivos principais

### `App.tsx`

Contém toda a interface e a lógica da experiência:

- configuração visual dos balões;
- leitura e validação dos números digitados;
- animações de subida e revelação;
- controle dos balões selecionados;
- preservação da ordem de entrada na fileira final;
- animação de reorganização das fichas;
- reinício da rodada.

### `__tests__/App.test.tsx`

Contém testes de renderização, interpretação do input e preservação da ordem digitada.

### `ios/Podfile`

Configura as dependências nativas do iOS e contém um ajuste de compatibilidade necessário para compilar o React Native 0.79.2 com o Xcode 26.

### `README.md`

Apresenta uma visão rápida do projeto e os comandos básicos para executá-lo.

## 4. Estrutura dos balões

Os balões são descritos pelo tipo `BalloonData`:

```ts
type BalloonData = {
  id: number;
  x: number;
  y: number;
  color: string;
};
```

Cada item possui:

- `id`: identificador estável do balão;
- `x`: posição horizontal inicial dentro do palco;
- `y`: posição vertical inicial;
- `color`: cor principal do balão.

A constante `BALLOONS` possui seis itens e determina a composição visual inicial. Alterar `x` ou `y` muda a posição de um balão sem afetar o restante da lógica. A condição de conclusão e o contador usam `BALLOONS.length`, evitando denominadores fixos.

### Área de toque

O `Pressable` acompanha somente o corpo visível, não o fio nem o `viewBox` completo. Ambos possuem 72 pontos de largura, mas usam alturas específicas:

```ts
blueHitArea: {height: 74},
yellowHitArea: {height: 80},
```

Essas medidas refletem as proporções renderizadas de cada arte. A camada dos fios, o contêiner animado e o próprio componente SVG possuem `pointerEvents="none"`. Assim, somente o `Pressable` compacto recebe o toque: nenhuma região transparente do SVG, nenhuma curva e nenhum filho que ultrapasse o contêiner pode ampliar ou bloquear a área interativa.

## 5. Componente `Balloon`

Cada balão é renderizado pelo componente `Balloon`. Ele recebe:

- os dados visuais do balão;
- o número digitado associado à ficha;
- a posição que a ficha deverá ocupar na sequência final;
- a informação de que o balão já foi coletado;
- o valor animado compartilhado da ordenação final;
- a função chamada quando a animação de subida termina.

O componente possui dois valores animados próprios:

### `flight`

Controla a saída do balão. Seu valor varia de `0` a `1` e é usado para animar simultaneamente:

- `translateY`: desloca o balão para cima até ele sair da tela;
- `translateX`: cria uma pequena oscilação lateral;
- `rotate`: inclina o balão durante o movimento;
- `scale`: produz uma leve expansão inicial e redução ao sair;
- `opacity`: remove gradualmente o balão no final do percurso.

A animação usa `Easing.out(Easing.cubic)` para começar com mais velocidade e desacelerar suavemente.

### `reveal`

Controla a entrada da ficha numerada. Ele utiliza `Animated.spring`, criando um pequeno efeito elástico de escala.

A revelação começa com um atraso de 180 milissegundos. Dessa forma, a ficha surge enquanto o balão já está subindo, aproximando o resultado do vídeo de referência.

### Proteção contra toques repetidos

A referência `tapped` impede que o mesmo balão execute a animação mais de uma vez, mesmo que o usuário toque rapidamente várias vezes antes do término do movimento.

## 6. Desenho dos elementos

As fichas usam componentes `View`, bordas, cores e sombras. Os corpos dos balões usam `blue_ballon.svg` e `yellow_ballon.svg`; a personagem usa `capivara.svg`.

Cada SVG já contém:

- corpo oval colorido;
- logotipo central;
- brilho semitransparente;
- nó triangular.

Os fios originalmente exportados dentro dos SVGs foram removidos. Isso permite que todos terminem no mesmo ponto da capivara, independentemente da posição de cada balão.

Os `viewBox` originais incluíam uma grande região vazia e elementos ocultos da exportação. Embora transparentes, essas regiões ainda pertenciam à árvore nativa do SVG e podiam participar do hit testing. Os arquivos foram recortados para conter somente a arte visível:

```xml
<!-- blue_ballon.svg -->
viewBox="117 16 112 115"

<!-- yellow_ballon.svg -->
viewBox="98 22 102 112"
```

Também foram removidos dos dois arquivos os caminhos ocultos da ficha numerada e os fios estáticos. Com isso, o tamanho geométrico do componente passa a corresponder ao balão que o usuário enxerga, sem offsets negativos ou desenhos invisíveis ao redor.

O componente escolhe a arte com base na cor configurada em `BALLOONS`:

```tsx
{isBlue ? (
  <BlueBalloon height={74} width={72} pointerEvents="none" />
) : (
  <YellowBalloon height={80} width={72} pointerEvents="none" />
)}
```

Os SVGs ficam dentro do mesmo `Animated.View` que antes continha o balão desenhado em código. Dessa forma, `translateX`, `translateY`, rotação, escala e opacidade continuam animando o corpo inteiro sem mudanças na lógica. O contêiner mede `72 × 74` para o azul e `72 × 80` para o amarelo, exatamente como a respectiva área de toque.

A ficha é um círculo amarelo com borda, sombra e texto roxo. A capivara é renderizada em `118 × 118`, sobre os fios, no canto inferior esquerdo do palco.

### Fios dinâmicos

Cada instância de `Balloon` chama `getStringPath(item)`. A função calcula:

- o ponto do nó, com offset diferente para azul e amarelo;
- o ponto final comum próximo à mão da capivara;
- dois pontos de controle para uma curva Bézier cúbica;
- uma pequena variação por ID para os fios formarem um feixe, em vez de se sobreporem completamente.

O caminho tem o formato:

```text
M mãoX mãoY C controle1X controle1Y controle2X controle2Y nóX nóY
```

Ele é desenhado por `Path` dentro de uma camada `Svg` do tamanho do palco. A camada possui `zIndex: 1`, as fichas usam `zIndex: 2`, os balões `zIndex: 5` e a capivara `zIndex: 6`. Assim os fios passam por trás de todos os elementos e parecem estar sendo segurados pela personagem.

O mesmo `flight` do balão controla a opacidade do fio:

```ts
opacity: flight.interpolate({
  inputRange: [0, 0.22, 1],
  outputRange: [1, 0, 0],
})
```

O fio desaparece nos primeiros 22% da subida, antes que a distância entre o nó animado e o caminho estático fique perceptível.

## 7. Entrada e validação dos números

O valor textual do campo é armazenado em `inputValue`. A função `parseNumberInput` transforma o texto em um array somente quando encontra exatamente seis números válidos.

São aceitos dois formatos:

```text
8, 2, 10, 5, 1, 7
8 2 10 5 1 7
```

Também é aceito o formato compacto com seis dígitos:

```text
821517 -> [8, 2, 1, 5, 1, 7]
```

Vírgulas, espaços e ponto e vírgula podem separar valores. Entradas com quantidade diferente de seis ou caracteres não numéricos são consideradas inválidas.

Enquanto o texto é inválido:

- o campo recebe uma borda vermelha;
- uma mensagem explica o formato necessário;
- os balões ficam desabilitados;
- o último array válido permanece preservado internamente.

Quando o primeiro balão é tocado, `hasStarted` passa para `true` e o campo fica bloqueado. Isso impede que os números ou seus destinos mudem durante uma animação em andamento.

Os números válidos são armazenados no estado `numbers`. Outro estado, `balloonOrder`, contém uma permutação dos índices de `numbers`. Para cada balão, o mesmo `sourceIndex` define tanto o conteúdo exibido quanto o destino final:

```tsx
const sourceIndex = balloonOrder[item.id - 1];

value={numbers[sourceIndex]}
finalIndex={sourceIndex}
```

Assim, o balão 1 não precisa mostrar o primeiro número digitado. Ele pode receber qualquer posição da entrada, mas sua ficha conserva a informação de qual era essa posição.

`createShuffledOrder` usa Fisher–Yates para embaralhar os índices. Se números repetidos fizerem o resultado visual coincidir por acaso com a entrada, a função troca duas posições que contêm valores diferentes. A única exceção inevitável acontece quando os seis valores são iguais: nesse caso, qualquer permutação tem a mesma aparência.

## 8. Controle do progresso

O estado `collected` guarda os identificadores dos balões cuja animação terminou.

Ao concluir a saída de um balão, `handlePop` adiciona seu identificador ao array. Antes de adicionar, a função verifica se o identificador já está presente, evitando duplicações.

O contador do cabeçalho usa o tamanho desse array:

```ts
{collected.length}/{BALLOONS.length}
```

Quando o tamanho chega a `BALLOONS.length`, `isComplete` passa a ser verdadeiro. Um `useEffect` observa essa transição e inicia a animação final depois de um pequeno intervalo de 350 milissegundos. A animação não é iniciada dentro da função atualizadora de `setCollected`, pois atualizadores de estado precisam permanecer livres de efeitos colaterais.

## 9. Preservação da ordem digitada

Durante a rodada, as fichas aparecem embaralhadas nas posições dos balões. Na fase final, cada ficha recebe como destino seu índice de origem no input:

```tsx
const sourceIndex = balloonOrder[item.id - 1];
value={numbers[sourceIndex]}
finalIndex={sourceIndex}
```

O identificador determina apenas qual balão está sendo renderizado. `sourceIndex` determina qual ocorrência da entrada ele carrega e para qual posição ela deverá voltar. Não existe classificação por valor, ranking ou chamada a `sort`.

Exemplo:

```text
input:        [3, 2, 5, 1, 2, 5]
nos balões:  [2, 5, 5, 2, 3, 1]
alinhadas:   [3, 2, 5, 1, 2, 5]
```

Como cada ocorrência conserva seu próprio índice de origem, valores repetidos também ocupam destinos definidos:

```text
input:     [2, 1, 2, 1, 3, 3]
resultado: [2, 1, 2, 1, 3, 3]
```

O índice é convertido em uma coordenada horizontal:

```ts
const tokenX = FINAL_LEFT + finalIndex * FINAL_GAP;
```

Portanto, a posição final depende exclusivamente da ordem de entrada, e não do valor numérico.

## 10. Animação de reorganização

O valor animado `ordered` é criado no componente principal e compartilhado por todas as fichas.

Enquanto `ordered` vale `0`, cada ficha permanece onde foi revelada. Quando todos os balões são coletados, ele é animado até `1` durante 900 milissegundos.

Cada ficha interpola esse mesmo progresso para calcular:

- o deslocamento horizontal entre sua posição inicial e sua posição correspondente no input;
- o deslocamento vertical entre sua posição inicial e o topo do palco.

O uso de um valor compartilhado faz todas as fichas começarem e terminarem o movimento juntas, enquanto cada uma percorre o caminho necessário até sua própria posição final.

Todas as animações usam `useNativeDriver: true`. Assim, transformações e opacidade são processadas no lado nativo, reduzindo o trabalho da thread JavaScript e deixando o movimento mais fluido.

## 11. Reinício da rodada

O botão inferior executa a função `reset`, que:

1. interrompe uma possível animação global em andamento;
2. devolve `ordered` para `0`;
3. esvazia a lista de balões coletados;
4. incrementa o identificador da rodada;
5. libera novamente o campo de entrada.

Os números digitados são mantidos no reset. O usuário pode repetir a mesma sequência ou editar o campo antes de iniciar a próxima rodada.

O identificador `round` faz parte da propriedade `key` de cada componente `Balloon`. Quando ele muda, o React recria os componentes, reiniciando corretamente os valores `flight`, `reveal` e `tapped` de todos os balões.

Cada `Balloon` registra ainda um cleanup de desmontagem que interrompe `flight` e `reveal`. O callback do `Animated.parallel` só chama `onPop` quando recebe `finished: true`. Portanto, ao pressionar **Jogar novamente** ou **Recomeçar**, animações antigas canceladas não conseguem atualizar o estado da rodada nova. O efeito da animação final também retorna um cleanup que interrompe seu próprio `timing`.

## 12. Compatibilidade com iOS e Xcode 26

O projeto foi preparado e testado no iPhone 17 Pro Simulator com iOS 26.5.

Durante a primeira compilação, o Pod `fmt` incluído no React Native 0.79.2 apresentou um erro de `consteval` com o Apple Clang 17 do Xcode 26. Para manter a versão do React Native solicitada, foi adicionado um ajuste no bloco `post_install` do `Podfile`.

Somente o target `fmt` é compilado como C++17. Os demais targets continuam usando as configurações definidas pelo React Native. O `fmt` não depende de recursos de C++20 utilizados nessa área problemática, portanto o ajuste elimina a incompatibilidade sem modificar o código do pacote instalado.

Após o ajuste:

- o `pod install` foi concluído;
- os 78 targets nativos foram processados;
- o build terminou com `BUILD SUCCEEDED`;
- o aplicativo foi instalado e aberto no iPhone Simulator;
- o Metro estabeleceu conexão com o app.

## 13. Testes e validações

Foram executadas as seguintes verificações:

### ESLint

```sh
npm run lint -- --quiet
```

Verifica problemas de estilo e padrões incorretos no JavaScript/TypeScript.

### TypeScript

```sh
npx tsc --noEmit
```

Valida os tipos sem gerar arquivos de saída.

### Jest

```sh
npm test -- --runInBand
```

Os testes confirmam que:

- o componente principal renderiza corretamente;
- o input separado é convertido corretamente;
- o formato compacto de seis dígitos é aceito;
- entradas incompletas ou com caracteres inválidos são rejeitadas;
- o array interpretado preserva exatamente a ordem digitada;
- os valores aparecem embaralhados nos balões;
- cada índice é usado uma única vez;
- as fichas recuperam a ordem digitada ao se alinharem, inclusive com valores repetidos;
- duas rodadas consecutivas não recebem callbacks atrasados de animações antigas.

## 14. Como executar o projeto

### Instalar as dependências JavaScript

```sh
npm install
```

### Executar no iOS

Na primeira execução ou depois de alterar dependências nativas:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
```

Em seguida:

```sh
npm run ios
```

### Executar no Android

Com um emulador aberto ou aparelho conectado:

```sh
npm run android
```

### Iniciar apenas o Metro

```sh
npm start
```

## 15. Possíveis personalizações

### Alterar a quantidade de balões

É necessário adicionar ou remover itens de `BALLOONS` e revisar o tamanho e o espaçamento da fileira final.

### Alterar o formato do input

Os formatos aceitos são definidos em `parseNumberInput`. Para suportar números negativos, decimais ou uma quantidade variável, é necessário alterar essa função e suas mensagens de validação.

### Alterar a velocidade da subida

O valor `duration: 650` controla o tempo de saída do balão.

### Alterar a velocidade da ordenação

O valor `duration: 900` controla o tempo de deslocamento das fichas para a fileira final.

### Alterar as posições iniciais

As propriedades `x` e `y` dos objetos em `BALLOONS` controlam a composição inicial.

### Alterar a personagem

Substitua `capivara.svg` por outra arte e revise `CAPYBARA_HAND_X` e `CAPYBARA_HAND_Y`, que representam o ponto de convergência dos fios dentro do palco.

## 16. Resumo do fluxo completo

1. O usuário digita seis números.
2. `parseNumberInput` valida e converte a entrada.
3. `createShuffledOrder` distribui os índices digitados entre os seis balões.
4. O primeiro toque bloqueia o campo de entrada.
5. O balão sobe e desaparece.
6. A ficha correspondente surge com efeito elástico.
7. O progresso é atualizado no cabeçalho.
8. O processo se repete até os seis balões serem coletados.
9. Cada ficha usa seu `sourceIndex` como posição final.
10. Todas as fichas se deslocam simultaneamente e recuperam a ordem digitada.
11. Ao reiniciar, uma nova distribuição é criada, os estados das animações são recriados e o input é liberado.
