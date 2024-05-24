import sharedObjects from '../sharedObjects';
import * as THREE from 'three'

class GameEngineTicTacToe {
    constructor(fontsEngine, graphicEngine, gameLogicEngine, graphicEngineTicTacToe, configs) {
        this.fontsEngine = fontsEngine;
        this.graphicEngine = graphicEngine;
        this.gameLogicEngine = gameLogicEngine;
        this.graphicEngineTicTacToe = graphicEngineTicTacToe;
        this.configs = configs;
        this.currentPlayer = {
            Player: null
        };

        this.playerX1 = null
        this.playerX2 = null
        this.playerX3 = null
        this.playerX4 = null
        this.playerX5 = null

        this.playerO1 = null
        this.playerO2 = null
        this.playerO3 = null
        this.playerO4 = null
        this.playerO5 = null

        this.fontObjects = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.numberPositionRequired = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        this.targetScale = new THREE.Vector3(3, 3, 3);
        this.hoverColor = new THREE.Color(0xff000000);
        this.onDocumentMouseDownBound = this.onDocumentMouseDown.bind(this);
        this.circleMeshes = [];
        this.textMeshes = [];
        this.crossMeshes = [];
        this.currentPlayerIndex = 0; // Começa com o índice 0
        this.players = ['Player Cruz', 'Player Bolinha']
        this.playerMoves = {
            'Player Cruz': [],
            'Player Bolinha': []
        };

        this.initGameButton = document.getElementById('init-game');
        this.playerVSplayer = document.getElementById('mode-player-vs-player');
        this.playerVSia = document.getElementById('mode-player-vs-ai');
        this.playerVSia.addEventListener('click', this.showDifficultyOptions.bind(this));


        this.IAfacil = document.getElementById('mode-facil');
        this.IAmedio = document.getElementById('mode-mediano');
        this.IAdificil = document.getElementById('mode-dificil');


        // Event listeners for AI difficulty levels
        this.IAfacil.addEventListener('click', () => this.startPlayerVsAI('facil'));
        this.IAmedio.addEventListener('click', () => this.startPlayerVsAI('medio'));
        this.IAdificil.addEventListener('click', () => this.startPlayerVsAI('dificil'));
    }

    startPlayerVsPlayer() {
        this.isAIGame = false;
        this.playerStart();
        this.playerVSplayer.classList.remove('active');
        this.playerVSplayer.classList.add('invisible');
        this.playerVSia.classList.remove('active');
        this.playerVSia.classList.add('invisible');
    }

    showDifficultyOptions() {
        this.playerVSplayer.classList.remove('active');
        this.playerVSplayer.classList.add('invisible');
        this.playerVSia.classList.remove('active');
        this.playerVSia.classList.add('invisible');

        this.IAfacil.classList.remove('invisible');
        this.IAfacil.classList.add('active');
        this.IAmedio.classList.remove('invisible');
        this.IAmedio.classList.add('active');
        this.IAdificil.classList.remove('invisible');
        this.IAdificil.classList.add('active');
    }


    startPlayerVsAI(difficulty) {
        this.isAIGame = true;
        this.aiPlayer = 'Player Bolinha';
        this.aiDifficulty = difficulty;
        this.fontsEngine.playerIA(this.aiPlayer, () => this.playerStart());
    }


    minimax(board, depth, isMaximizingPlayer) {
        const scores = {
            'Player Cruz': -1,
            'Player Bolinha': 1,
            'Tie': 0
        };

        const winner = this.getWinner(board);
        if (winner !== null) {
            return scores[winner];
        }

        const availableSpots = this.getAvailableSpots(board);

        if (isMaximizingPlayer) {
            let bestScore = -Infinity;
            for (let index of availableSpots) {
                board[index] = 'Player Bolinha';
                let score = this.minimax(board, depth + 1, false);
                board[index] = null;
                bestScore = Math.max(score, bestScore);
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let index of availableSpots) {
                board[index] = 'Player Cruz';
                let score = this.minimax(board, depth + 1, true);
                board[index] = null;
                bestScore = Math.min(score, bestScore);
            }
            return bestScore;
        }
    }


    // minimax(board, depth, isMaximizingPlayer) {
    //     const scores = {
    //         'Player Cruz': -1,
    //         'Player Bolinha': 1,
    //         'Tie': 0
    //     };

    //     const winner = this.getWinner(board);
    //     if (winner !== null) {
    //         return scores[winner];
    //     }

    //     const availableSpots = this.getAvailableSpots(board);

    //     if (isMaximizingPlayer) {
    //         let bestScore = -Infinity;
    //         for (let index of availableSpots) {
    //             board[index] = 'Player Bolinha';
    //             let score = this.minimax(board, depth + 1, false);
    //             board[index] = null;
    //             bestScore = Math.max(score, bestScore);
    //         }
    //         return bestScore;
    //     } else {
    //         let bestScore = Infinity;
    //         for (let index of availableSpots) {
    //             board[index] = 'Player Cruz';
    //             let score = this.minimax(board, depth + 1, true);
    //             board[index] = null;
    //             bestScore = Math.min(score, bestScore);
    //         }
    //         return bestScore;
    //     }
    // }

    getWinner(board) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return board.includes(null) ? null : 'Tie';
    }

    getAvailableSpots(board) {
        const availableSpots = [];
        board.forEach((spot, index) => {
            if (spot === null) {
                availableSpots.push(index);
            }
        });
        return availableSpots;
    }



    createBoardFromState() {
        const board = Array(9).fill(null);
        this.playerMoves['Player Cruz'].forEach(move => {
            board[parseInt(move, 10) - 1] = 'Player Cruz';
        });
        this.playerMoves['Player Bolinha'].forEach(move => {
            board[parseInt(move, 10) - 1] = 'Player Bolinha';
        });
        return board;
    }

    getNumberMeshByPosition(position) {
        const numberMesh = this.graphicEngine.scene.children.find(mesh => mesh.name === `number${position}`);
        if (!numberMesh) {
            console.error(`Mesh not found for position: ${position}`);
        }
        return numberMesh;
    }


    getBestMove(board) {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'Player Bolinha';
                let score = this.minimax(board, 0, false);
                board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    getMoveMedium(board) {
        // Similar to getBestMove but includes a chance to make a random move
        const availableSpots = this.getAvailableSpots(board);
        if (Math.random() > 0.5) {
            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
        } else {
            return this.getBestMove(board);
        }
    }

    getMoveEasy(board) {
        // Completely random move
        const availableSpots = this.getAvailableSpots(board);
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }

    getAIMove() {
        const board = this.createBoardFromState();
        switch (this.aiDifficulty) {
            case 'facil':
                return this.getMoveEasy(board);
            case 'medio':
                return this.getMoveMedium(board);
            case 'dificil':
                return this.getBestMove(board);
            default:
                return this.getBestMove(board);
        }
    }


    getAvailableCircle() {
        if (!this.circleMeshes.includes(this.playerO1.name)) {
            return this.playerO1;
        } else if (!this.circleMeshes.includes(this.playerO2.name)) {
            return this.playerO2;
        } else if (!this.circleMeshes.includes(this.playerO3.name)) {
            return this.playerO3;
        } else if (!this.circleMeshes.includes(this.playerO4.name)) {
            return this.playerO4;
        } else if (!this.circleMeshes.includes(this.playerO5.name)) {
            return this.playerO5;
        } else {
            console.error("No available circles for AI to move.");
            return null;
        }
    }

    getAvailableCross() {
        if (!this.crossMeshes.includes("cross1")) {
            return this.playerX1;
        } else if (!this.crossMeshes.includes("cross2")) {
            return this.playerX2;
        } else if (!this.crossMeshes.includes("cross3")) {
            return this.playerX3;
        } else if (!this.crossMeshes.includes("cross4")) {
            return this.playerX4;
        } else if (!this.crossMeshes.includes("cross5")) {
            return this.playerX5;
        } else {
            console.error("No available crosses for player to move.");
            return null;
        }
    }

    makeAIMove() {
        const board = this.createBoardFromState();
        const bestMove = this.getAIMove();

        const selectedCircle = this.getAvailableCircle();

        if (selectedCircle) {
            this.onDocumentMouseDown({ selectedObject: selectedCircle });
            setTimeout(() => {
                this.loadNumbersFonts(() => {
                    setTimeout(() => {
                        const selectedNumber = this.getNumberMeshByPosition(bestMove + 1);
                        this.onDocumentMouseDown({ selectedObject: selectedNumber });
                    }, 1000);
                });
            }, 1000);
        }
    }



    // Métodos de ciclo de vida e jogo
    start() {
        this.abrirJogoDaVelha();
    }

    playerStart() {
        this.gameLogicEngine.initGameButton.classList.add('invisible');
        this.gameLogicEngine.initGameButton.classList.remove('active');


        this.IAfacil.classList.remove('active');
        this.IAfacil.classList.add('invisible'); 
        this.IAmedio.classList.remove('active');
        this.IAmedio.classList.add('invisible'); 
        this.IAdificil.classList.remove('active');
        this.IAdificil.classList.add('invisible'); 

        this.playerX1 = sharedObjects.cross.cross1;
        this.playerX2 = sharedObjects.cross.cross2;
        this.playerX3 = sharedObjects.cross.cross3;
        this.playerX4 = sharedObjects.cross.cross4;
        this.playerX5 = sharedObjects.cross.cross5;

        this.playerO1 = sharedObjects.circles.circle1;
        this.playerO2 = sharedObjects.circles.circle2;
        this.playerO3 = sharedObjects.circles.circle3;
        this.playerO4 = sharedObjects.circles.circle4;
        this.playerO5 = sharedObjects.circles.circle5;


        if (!this.currentPlayer.Player) {
            this.currentPlayer.Player = Math.random() < 0.5 ? 'Player Cruz' : 'Player Bolinha';
        }

        const playerMeshes = this.currentPlayer.Player === 'Player Cruz' ?
            ['cross1', 'cross2', 'cross3', 'cross4', 'cross5'] :
            ['circle1', 'circle2', 'circle3', 'circle4', 'circle5'];

        this.animatePlayerMeshes(playerMeshes);
        this.enableMouseListener();

        this.fontsEngine.displayStartingPlayer(this.currentPlayer.Player, () => {
            if (this.isAIGame && this.aiPlayer === this.currentPlayer.Player) {
                setTimeout(() => {
                    this.makeAIMove();
                }, 1000); // Atraso adicional para permitir que as animações sejam exibidas
            }
        });
    }

    endTurn() {
        this.disableMouseListener();

        if (this.currentPlayer.Player === 'Player Cruz') {
            this.stopAnimation(this.playerX1);
            this.stopAnimation(this.playerX2);
            this.stopAnimation(this.playerX3);
            this.stopAnimation(this.playerX4);
            this.stopAnimation(this.playerX5);
        } else {
            this.stopAnimation(this.playerO1);
            this.stopAnimation(this.playerO2);
            this.stopAnimation(this.playerO3);
            this.stopAnimation(this.playerO4);
            this.stopAnimation(this.playerO5);
        }
        if (this.checkForWin(this.currentPlayer.Player)) {
            this.fontsEngine.displayWinner(this.currentPlayer.Player, () => this.showRestartButton());

        } else if (this.crossMeshes.length + this.circleMeshes.length === 9) {
            this.fontsEngine.displayTie(this.currentPlayer.Player, () => {
                this.fontsEngine.removeTextMeshesFromScene()
                this.showRestartButton()
            });
        } else {
            this.nextPlayer();
            setTimeout(() => {
                this.prepareNextPlayerTurn();

                // Adiciona um atraso antes de executar o movimento da IA
                if (this.isAIGame && this.currentPlayer.Player === this.aiPlayer) {
                    setTimeout(() => {
                        this.makeAIMove();
                    }, 1000); // Atraso adicional para permitir que as animações sejam exibidas
                }
            }, 500);
        }
    }

    resetGame() {
        // Reseta as variáveis de estado
        this.currentPlayer = {
            Player: null
        };

        // Limpa os movimentos dos jogadores
        this.playerMoves = {
            'Player Cruz': [],
            'Player Bolinha': []
        };

        // Limpa os arrays de peças
        this.circleMeshes = [];
        this.crossMeshes = [];
        this.textMeshes = [];

        // Remove any game-related objects from the scene
        this.fontsEngine.removeTextMeshesFromScene();

        // Set initial player index
        this.currentPlayerIndex = 0;

        // Reinicia a posição e o estado das peças
        this.playerX1 = null
        this.playerX2 = null
        this.playerX3 = null
        this.playerX4 = null
        this.playerX5 = null

        this.playerO1 = null
        this.playerO2 = null
        this.playerO3 = null
        this.playerO4 = null
        this.playerO5 = null
        this.removeGameObjectsFromScene();
        sharedObjects.cross = {};
        sharedObjects.circles = {};
        this.fontObjects = null;
        this.graphicEngineTicTacToe.numberX = null;
        this.graphicEngineTicTacToe.numberO = null;

        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 1);
        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 2);
        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 3);
        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 4);
        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 5);
        //Cross
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 1);
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 2);
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 3);
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 4);
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 5);



        this.playerVSplayer.classList.remove('invisible');
        this.playerVSplayer.classList.add('active');
        this.playerVSia.classList.remove('invisible');
        this.playerVSia.classList.add('active');
        this.playerVSplayer.addEventListener('click', () => this.startPlayerVsPlayer());

    }


    showRestartButton() {
        const restartButton = document.getElementById('restart-game');
        if (restartButton) {
            restartButton.classList.remove('invisible');
            restartButton.classList.add('active');
            restartButton.addEventListener('click', () => {
                restartButton.classList.remove('active');
                restartButton.classList.add('invisible');
                this.resetGame();
                // this.gameLogicEngine.initGameButton.classList.remove('invisible');
                // this.gameLogicEngine.initGameButton.classList.add('active');
                // this.gameLogicEngine.initGameButton.addEventListener('click', () => this.playerStart(this.currentPlayer));
            });
        }
    }

    prepareNextPlayerTurn() {
        this.fontsEngine.displayStartingPlayer(this.currentPlayer.Player, () => {
            const playerMeshes = this.currentPlayer.Player === 'Player Cruz' ?
                ['cross1', 'cross2', 'cross3', 'cross4', 'cross5'] :
                ['circle1', 'circle2', 'circle3', 'circle4', 'circle5'];

            this.animatePlayerMeshes(playerMeshes);
            this.enableMouseListener();
        });
    }

    removeGameObjectsFromScene() {
        const scene = this.graphicEngine.scene;

        // Remove cross meshes
        ['cross1', 'cross2', 'cross3', 'cross4', 'cross5'].forEach(name => {
            const mesh = sharedObjects.cross[name];
            if (mesh) {
                scene.remove(mesh);
            }
        });

        // Remove circle meshes
        ['circle1', 'circle2', 'circle3', 'circle4', 'circle5'].forEach(name => {
            const mesh = sharedObjects.circles[name];
            if (mesh) {
                scene.remove(mesh);
            }
        });

        // Remove text meshes
        this.fontsEngine.removeTextMeshesFromScene();
    }

    // Métodos de controle de jogador
    abrirJogoDaVelha() {
        const container = document.querySelector('.container');
        this.gameLogicEngine.jogoDaVelhaButton.addEventListener('click', () => {
            container.classList.remove('container');
            container.classList.add('invisible');
            this.graphicEngine.controls.target.set(15, 0, 0);
            this.configs.targetPosition.set(15, 4, 7);
            requestAnimationFrame((timestamp) => this.gameLogicEngine.smoothCameraMove(timestamp, () => { }));
            console.log('Entrei abrirjogo')
            this.playerVSplayer.classList.remove('invisible');
            this.playerVSplayer.classList.add('active');
            this.playerVSia.classList.remove('invisible');
            this.playerVSia.classList.add('active');
            this.playerVSplayer.addEventListener('click', () => this.startPlayerVsPlayer());
            // this.gameLogicEngine.initGameButton.classList.remove('invisible');
            // this.gameLogicEngine.initGameButton.classList.add('active');
            // this.gameLogicEngine.initGameButton.addEventListener('click', () => this.playerStart(this.currentPlayer));
        });
    }

    setCurrentPlayer(selectedItem) {
        if (selectedItem instanceof THREE.Group) {
            // Se o selectedItem for um Group, lidamos com cruzes (Player Cruz)
            switch (selectedItem) {
                case this.playerX1:
                    this.currentPlayer = { Scene: this.playerX1, Player: 'Player Cruz', Mesh: selectedItem };
                    break;
                case this.playerX2:
                    this.currentPlayer = { Scene: this.playerX2, Player: 'Player Cruz', Mesh: selectedItem };
                    break;
                case this.playerX3:
                    this.currentPlayer = { Scene: this.playerX3, Player: 'Player Cruz', Mesh: selectedItem };
                    break;
                case this.playerX4:
                    this.currentPlayer = { Scene: this.playerX4, Player: 'Player Cruz', Mesh: selectedItem };
                    break;
                case this.playerX5:
                    this.currentPlayer = { Scene: this.playerX5, Player: 'Player Cruz', Mesh: selectedItem };
                    break;
                default:
                    console.warn('Selected item not recognized as a valid cross group.');
            }
        } else {
            // Se o selectedItem for um Mesh, lidamos com círculos (Player Bolinha)
            switch (selectedItem.name) {
                case "circle1":
                    this.currentPlayer = { Scene: this.playerO1, Player: 'Player Bolinha', Mesh: selectedItem };
                    break;
                case "circle2":
                    this.currentPlayer = { Scene: this.playerO2, Player: 'Player Bolinha', Mesh: selectedItem };
                    break;
                case "circle3":
                    this.currentPlayer = { Scene: this.playerO3, Player: 'Player Bolinha', Mesh: selectedItem };
                    break;
                case "circle4":
                    this.currentPlayer = { Scene: this.playerO4, Player: 'Player Bolinha', Mesh: selectedItem };
                    break;
                case "circle5":
                    this.currentPlayer = { Scene: this.playerO5, Player: 'Player Bolinha', Mesh: selectedItem };
                    break;
                default:
                    console.warn('Selected item not recognized as a valid circle mesh.');
            }
        }

    }

    nextPlayer() {
        this.currentPlayer.Player = this.currentPlayer.Player === 'Player Cruz' ? 'Player Bolinha' : 'Player Cruz';
    }

    // Métodos de manipulação de evento
    enableMouseListener() {
        window.addEventListener('mousedown', this.onDocumentMouseDownBound, false);
        this.gameLogicEngine.enableMouseListener();
    }

    disableMouseListener() {
        window.removeEventListener('mousedown', this.onDocumentMouseDownBound, false);
    }

    onDocumentMouseDown(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }

        if (event.selectedObject) {
            const selectedObject = event.selectedObject;

            if (this.currentPlayer.Player === 'Player Cruz' && selectedObject instanceof THREE.Group && !this.crossMeshes.includes(selectedObject.name)) {
                this.handleGroupClick(selectedObject);
                this.crossMeshes.push(selectedObject.name);
                return;
            } else if (this.currentPlayer.Player === 'Player Bolinha' && selectedObject.name.startsWith('circle') && !this.circleMeshes.includes(selectedObject.name)) {
                this.handleGroupClick(selectedObject);
                this.circleMeshes.push(selectedObject.name);
                console.log('Entrou aqui: IA 1')
                return; 
            }

            // Segundo clique: selecionar a posição
            if (selectedObject.name.includes('number') && !this.textMeshes.includes(selectedObject.name)) {
                this.handleTextClick(selectedObject);
                this.textMeshes.push(selectedObject.name);
            }
            return;
        }


        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.graphicEngine.camera);
        // const allClickableMeshes = [...this.graphicEngine.scene.children];
        const allClickableMeshes = this.graphicEngine.scene.children.filter(child => child instanceof THREE.Mesh || child instanceof THREE.Group);

        const playerMeshes = [...this.playerX1.children, ...this.playerX2.children, ...this.playerX3.children, ...this.playerX4.children, ...this.playerX5.children];

        const intersects = this.raycaster.intersectObjects([...playerMeshes, ...allClickableMeshes], true);

        if (intersects.length > 0) {
            // O primeiro objeto da lista de interseções será o mais próximo
            const selectedObject = intersects[0].object;
            let parentGroup = selectedObject.parent;

            if (this.currentPlayer.Player === 'Player Cruz' && selectedObject.parent && (selectedObject.parent === this.playerX1 || selectedObject.parent === this.playerX2 || selectedObject.parent === this.playerX3 || selectedObject.parent === this.playerX4 || selectedObject.parent === this.playerX5) && !this.crossMeshes.includes(selectedObject.parent.name)) {
                this.handleGroupClick(parentGroup);
                this.crossMeshes.push(parentGroup.name);
            } else if (this.currentPlayer.Player === 'Player Bolinha' && selectedObject.name.startsWith('circle') && !this.circleMeshes.includes(selectedObject.name)) {
                console.log('Entrou aqui: IA 2')
                this.handleGroupClick(selectedObject);
                this.circleMeshes.push(selectedObject.name);
            } else if (selectedObject.name.includes('number') && !this.textMeshes.includes(selectedObject.name)) {
                this.handleTextClick(selectedObject);
                this.textMeshes.push(selectedObject.name);
            }

        }
    }

    //Metodos de manipulacao de textos/Fonts
    loadNumbersFonts(callback) {
        try {
            console.log('displayChosenPlayer called from <function or situation>');
            this.fontsEngine.displayChosenPlayer(this.currentPlayer.Player, () => {
                const numbersToLoad = this.numberPositionRequired.filter(number =>
                    !this.textMeshes.includes(`number${number}`)
                );

                numbersToLoad.forEach(number => {
                    this.fontsEngine.addNumberTextToScene(number);
                });

                // Chame o callback depois que os números forem adicionados.
                if (callback) {
                    callback()
                    this.fontsEngine.removeTextMeshesFromScene()
                };
            });
        } catch (error) {
            console.error("Failed to load numbers fonts", error);
        }
    }

    //Metodos de manipulacao de Cliques
    handleGroupClick(clickedItem) {
        if (!clickedItem.isMoved) {
            this.setCurrentPlayer(clickedItem);
            this.scaleMesh(clickedItem);
            this.changeColor(clickedItem, '#f1f1f1');
            this.stopAnimation(clickedItem);
            this.loadNumbersFonts(() => { });
        }
    }

    handleTextClick(selectedObject) {
        if (!selectedObject || !selectedObject.material) {
            console.error('Selected object is not valid or is missing material.', selectedObject);
            return;
        }

        selectedObject.material.color.set(this.hoverColor);
        selectedObject.position.set(0, 0, 0);
        this.makeMovePlayer(selectedObject, this.currentPlayer);

        this.graphicEngine.scene.remove(selectedObject);
    }


    //Metodos de manipulacao de peças do jogo
    makeMovePlayer = (selectedObject, currentPlayer) => {
        const numberClicked = selectedObject.name.replace('number', '');
        this.playerMoves[this.currentPlayer.Player].push(numberClicked);

        const numberPositionString = selectedObject.name.replace(/\D/g, '');  // Ainda uma string
        const numberPosition = parseInt(numberPositionString, 10); // Converter para número

        const positions = sharedObjects.bases[numberPosition];
        if (positions) {
            selectedObject.isAnimating = false;
            currentPlayer.Scene.position.set(positions.x, positions.y, positions.z);
            selectedObject.isMoved = true;
            this.fontsEngine.displaySelectedPosition(this.currentPlayer.Player, numberClicked, () => this.endTurn());
        } else {
            console.error(`Positions for number ${numberPosition} are not found in sharedObjects.bases.`);
        }
    }


    checkForWin(player) {
        // Aqui você deve implementar a lógica para verificar se o jogador ganhou
        // Isso pode ser com base nas combinações de vitória em um jogo da velha padrão
        const winningCombinations = [
            ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'],
            ['1', '4', '7'], ['2', '5', '8'], ['3', '6', '9'],
            ['1', '5', '9'], ['3', '5', '7']
        ];

        // Verifica se alguma das combinações de vitória está presente nos movimentos do jogador
        const playerMoves = this.playerMoves[player];
        return winningCombinations.some(combination => combination.every(number => playerMoves.includes(number)));
    }

    //Metodos de animacao e renderizacao 
    animatePlayerMeshes(meshNames) {
        meshNames.forEach((name) => {
            const meshType = name.includes('cross') ? 'cross' : 'circles';
            const mesh = sharedObjects[meshType][name];
            if (mesh) {
                const hasBeenMoved = meshType === 'cross' ? this.crossMeshes.includes(name) : this.circleMeshes.includes(name);

                if (!mesh.isMoved && !hasBeenMoved) {
                    this.animatePlayerMesh(mesh);
                }
            } else {
                console.error(`Mesh ${name} is not found in sharedObjects.`);
            }
        });
    }

    animatePlayerMesh(mesh) {
        const amplitude = 0.1;  // Altura do movimento
        const frequency = 1;    // Quantas vezes o movimento é repetido por segundo
        const speed = 0.01;     // Quão rápido o movimento acontece

        // Função que será chamada a cada frame da animação
        const animate = () => {
            // Calcula o novo valor baseado no seno do tempo atual multiplicado pela frequência
            mesh.position.y = amplitude * Math.sin(frequency * Date.now() * speed);
            // Chama o próximo frame
            mesh.animationFrame = requestAnimationFrame(animate);
        };

        // Inicia a animação
        animate();
    }

    changeColor(object, colorHex) {
        const newColor = new THREE.Color(colorHex);

        // Função auxiliar para mudar a cor de um Mesh individual
        const changeMeshColor = (mesh) => {
            if (mesh.material) { // Verifica se o mesh tem um material
                mesh.material.color.set(newColor);
            }
        }

        if (object instanceof THREE.Mesh) {
            // Se o objeto for um Mesh, altera a cor diretamente
            changeMeshColor(object);
        } else if (object instanceof THREE.Group) {
            // Se o objeto for um Group, altera a cor em todos os Mesh filhos
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    changeMeshColor(child);
                }
            });
        }
    }

    scaleMesh(mesh) {
        const lerpFactor = 0.1;
        mesh.scale.lerp(this.targetScale, lerpFactor);
    }

    stopAnimation(mesh) {
        cancelAnimationFrame(mesh.animationFrame);
    }

}
export default GameEngineTicTacToe;
