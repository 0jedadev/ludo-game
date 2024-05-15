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
        this.playerX3 = null
        this.playerX2 = null
        this.playerO1 = null
        this.playerO2 = null
        this.playerO3 = null
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
    }

    // Métodos de ciclo de vida e jogo
    start() {
        this.abrirJogoDaVelha();
    }

    playerStart() {
        this.gameLogicEngine.initGameButton.classList.add('invisible');
        this.gameLogicEngine.initGameButton.classList.remove('active');

        this.playerX1 = sharedObjects.cross.cross1;
        this.playerX2 = sharedObjects.cross.cross2;
        this.playerX3 = sharedObjects.cross.cross3;
        this.playerO1 = sharedObjects.circles.circle1;
        this.playerO2 = sharedObjects.circles.circle2;
        this.playerO3 = sharedObjects.circles.circle3;

        // Define o jogador inicial aleatoriamente apenas na primeira vez
        if (!this.currentPlayer.Player) {
            this.currentPlayer.Player = Math.random() < 0.5 ? 'Player Cruz' : 'Player Bolinha';

        }
        this.fontsEngine.displayStartingPlayer(this.currentPlayer.Player);

        // Determina qual jogador deve ser animado
        if (this.currentPlayer.Player === 'Player Cruz') {

            this.animatePlayerMeshes(['cross1', 'cross2', 'cross3'].filter(name => !this.crossMeshes.includes(name)));
        } else {
            this.animatePlayerMeshes(['circle1', 'circle2', 'circle3'].filter(name => !this.circleMeshes.includes(name)));
        }

        this.enableMouseListener();
    }

    endTurn() {
        this.disableMouseListener();

        if (this.currentPlayer.Player === 'Player Cruz') {
            this.stopAnimation(this.playerX1);
            this.stopAnimation(this.playerX2);
            this.stopAnimation(this.playerX3);
        } else {
            this.stopAnimation(this.playerO1);
            this.stopAnimation(this.playerO2);
            this.stopAnimation(this.playerO3);
        }
        if (this.checkForWin(this.currentPlayer.Player)) {
            this.fontsEngine.displayWinner(this.currentPlayer.Player);
            this.showRestartButton();
            // Por exemplo, mostrar uma mensagem de vitória, parar o jogo, etc.
        } else if (this.crossMeshes.length === 3 && this.circleMeshes.length === 3) {
            this.fontsEngine.displayTie(this.currentPlayer.Player);
            this.fontsEngine.removeTextMeshesFromScene();
            this.showRestartButton();
        } else {
            this.nextPlayer();
            this.prepareNextPlayerTurn();
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
        this.playerX3 = null
        this.playerX2 = null
        this.playerO1 = null
        this.playerO2 = null
        this.playerO3 = null
        this.removeGameObjectsFromScene();
        sharedObjects.cross = {};
        sharedObjects.circles = {};
        this.fontObjects = null;
        this.graphicEngineTicTacToe.numberX = null;
        this.graphicEngineTicTacToe.numberO = null;

        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 1);
        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 2);
        this.graphicEngineTicTacToe.createCircleAtPosition('initialBase0', 3);
        //Cross
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 1);
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 2);
        this.graphicEngineTicTacToe.createCrossAtPosition('initialBaseX', 3);

        // Reinicia outros estados conforme necessário
        this.playerStart();  // Pode chamar o método start para reconfigurar ou recomeçar o jogo
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
            });
        }
    }

    prepareNextPlayerTurn() {
        this.fontsEngine.displayStartingPlayer(this.currentPlayer.Player);
        if (this.currentPlayer.Player === 'Player Cruz') {
            this.animatePlayerMeshes(['cross1', 'cross2', 'cross3']);
        } else {
            this.animatePlayerMeshes(['circle1', 'circle2', 'circle3']);
        }
        this.enableMouseListener(); // Reabilita o ouvinte de clique do mouse para o próximo jogador
    }

    removeGameObjectsFromScene() {
        const scene = this.graphicEngine.scene;

        // Remove cross meshes
        ['cross1', 'cross2', 'cross3'].forEach(name => {
            const mesh = sharedObjects.cross[name];
            if (mesh) {
                scene.remove(mesh);
            }
        });

        // Remove circle meshes
        ['circle1', 'circle2', 'circle3'].forEach(name => {
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
            this.gameLogicEngine.initGameButton.classList.remove('invisible');
            this.gameLogicEngine.initGameButton.classList.add('active');
            this.gameLogicEngine.initGameButton.addEventListener('click', () => this.playerStart(this.currentPlayer));
        });
    }

    setCurrentPlayer(selectedItem) {
        if (selectedItem instanceof THREE.Group) {
            // Se o selectedItem for um Group, lidamos com cruzes (Player Cruz)
            switch (selectedItem) {
                case this.playerX1:
                    this.currentPlayer = { Scene: this.playerX1, Player: 'Player Cruz' };
                    break;
                case this.playerX2:
                    this.currentPlayer = { Scene: this.playerX2, Player: 'Player Cruz' };
                    break;
                case this.playerX3:
                    this.currentPlayer = { Scene: this.playerX3, Player: 'Player Cruz' };
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
        event.preventDefault();

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.graphicEngine.camera);
        const allClickableMeshes = [...this.graphicEngine.scene.children];
        const playerMeshes = [...this.playerX1.children, ...this.playerX2.children, ...this.playerX3.children];

        const intersects = this.raycaster.intersectObjects([...playerMeshes, ...allClickableMeshes], true);

        if (intersects.length > 0) {
            // O primeiro objeto da lista de interseções será o mais próximo
            const selectedObject = intersects[0].object;
            let parentGroup;

            if (selectedObject instanceof THREE.Group) {
                parentGroup = selectedObject;
            } else {
                parentGroup = selectedObject.parent;
            }

            if (this.currentPlayer.Player === 'Player Cruz' && (parentGroup === this.playerX1 || parentGroup === this.playerX2 || parentGroup === this.playerX3) && !this.crossMeshes.includes(parentGroup.name)) {
                this.handleGroupClick(parentGroup);
                this.crossMeshes.push(parentGroup.name);
            } else if (this.currentPlayer.Player === 'Player Bolinha' && selectedObject.name.startsWith('circle') && !this.circleMeshes.includes(selectedObject.name)) {
                this.handleGroupClick(selectedObject);
                this.circleMeshes.push(selectedObject.name);
            } else if (selectedObject.name.includes('number') && !this.textMeshes.includes(selectedObject.name)) {
                this.handleTextClick(selectedObject);
                this.textMeshes.push(selectedObject.name);
            }

        }
    }

    //Metodos de manipulacao de textos/Fonts
    loadNumbersFonts() {
        this.fontsEngine.removeTextMeshesFromScene();
        this.fontsEngine.displayChosenPlayer(this.currentPlayer.Player);
        const numbersToLoad = this.numberPositionRequired.filter(number =>
            !this.textMeshes.includes(`number${number}`)
        );

        numbersToLoad.forEach(number => {
            this.fontsEngine.addNumberTextToScene(number);
        });
    }

    //Metodos de manipulacao de Cliques
    handleGroupClick(clickedItem) {
        if (!clickedItem.isMoved) {
            this.setCurrentPlayer(clickedItem);
            this.scaleMesh(clickedItem);
            this.changeColor(clickedItem, '#f1f1f1');
            this.stopAnimation(clickedItem);
            this.loadNumbersFonts();
        }
    }

    handleTextClick(selectedObject) {
        selectedObject.material.color.set(this.hoverColor);
        selectedObject.position.set(0, 0, 0);
        this.makeMovePlayer(selectedObject, this.currentPlayer);
    }


    //Metodos de manipulacao de peças do jogo
    makeMovePlayer = (selectedObject, currentPlayer) => {
        const numberClicked = selectedObject.name.replace('number', '');
        this.playerMoves[this.currentPlayer.Player].push(numberClicked);

        const numberPositionString = selectedObject.name.replace(/\D/g, '');  // Ainda uma string
        const numberPosition = parseInt(numberPositionString, 10); // Converter para número

        const positions = sharedObjects.bases[numberPosition]
        selectedObject.isAnimating = false
        currentPlayer.Scene.position.set(positions.x, positions.y, positions.z);
        selectedObject.isMoved = true;
        this.fontsEngine.displaySelectedPosition(currentPlayer.Player, numberClicked)
        this.endTurn();
    }

    checkForWin(player) {
        // Aqui você deve implementar a lógica para verificar se o jogador ganhou
        // Isso pode ser com base nas combinações de vitória em um jogo da velha padrão
        const winningCombinations = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['1', '4', '7'],
            ['2', '5', '8'],
            ['3', '6', '9'],
            ['1', '5', '9'],
            ['3', '5', '7']
        ];

        // Verifica se alguma das combinações de vitória está presente nos movimentos do jogador
        return winningCombinations.some(combination =>
            combination.every(number => this.playerMoves[player].includes(number))
        );
    }

    //Metodos de animacao e renderizacao 
    animatePlayerMeshes(meshNames) {
        meshNames.forEach((name) => {
            const meshType = name.includes('cross') ? 'cross' : 'circles';
            const mesh = sharedObjects[meshType][name];
            // Verifica se o nome ainda não foi adicionado aos arrays de mesh movidos
            const hasBeenMoved = meshType === 'cross' ? this.crossMeshes.includes(name) : this.circleMeshes.includes(name);

            if (!mesh.isMoved && !hasBeenMoved) {
                this.animatePlayerMesh(mesh);
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
