<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Game Boards</title>
    <link rel="icon" type="image/png" href="/ludoIMG.png" />
    <link rel="stylesheet" href="./style.css">
</head>

<body>
    <canvas class="webgl"></canvas>

    <div class="container invisible">
        <div class="container-initial">
            <div class="container-initial__title">
                <h1 class="titleGaming">Bem vindo ao Jogo de Tabuleiros 3D</h1>
                <h3 class="titleGaming">Escolha o Jogo</h3>
            </div>
            <div class="container-initial__button">
                <button class="botao" id="botaoLudo">Ludo</button>
                <button class="botao" id="botaoJogoDaVelha">Jogo da Velha</button>
                <button class="botao" id="botaoJogoDaDama">Jogo da Dama</button>
            </div>
        </div>
    </div>


    <div class="container-buttons-initGame">
        <button class="roolDiceButton invisible" id="rollDiceButton">Jogar Dado</button>
    </div>

    <button class="resetDiceButton invisible" id="resetDiceButton">Resetar Dado</button>

    <div class="container-buttons-pino">
        <button class="invisible" id="pino-1">Pino 1</button>
        <button class="invisible " id="pino-2">Pino 2</button>
        <button class="invisible" id="pino-3">Pino 3</button>
        <button class="invisible" id="pino-4">Pino 4</button>
    </div>

    <div class="container-buttons-initGame">
        <button class="invisible" id="init-game">Iniciar Jogo</button>

    </div>

    <div class="container-buttons-initGame">
        <button id="restart-game" class="invisible">Jogar Novamente</button>
    </div>

    <div class="container-buttons-initGame">
        <button id="mode-player-vs-player" class="invisible">Player vs Player</button>
        <button id="mode-player-vs-ai" class="invisible">Player vs IA</button>
    </div>

    <div class="container-buttons-initGame">
        <button id="mode-facil" class="invisible">Modo Facil</button>
        <button id="mode-mediano" class="invisible">Modo Mediano</button>
        <button id="mode-dificil" class="invisible">Modo Dificil</button>
    </div>

    <div class="container-buttons-move">
        <button class="invisible" id="movePin">Mover Pino Atual</button>
        <button class="invisible" id="newPin">Novo Pino</button>
    </div>

    <script type="module" src="./index.js"></script>
</body>

</html>
