

import * as THREE from 'three'
import * as CANNON from 'cannon';
import CameraController from '../../Controllers/ControllersEngine';
class GameLogicEngine {
    constructor(graphicEngine, physicsEngine, configsEngine) {
        this.graphicEngine = graphicEngine;
        this.physicsEngine = physicsEngine;
        this.configsEngine = configsEngine;
        this.initGameButton = document.getElementById('init-game');
        this.start = null;
        this.lerpDuration = 2000;
        this.movePin = document.getElementById('movePin');
        this.newPin = document.getElementById('newPin');
        this.diceButton = document.getElementById('rollDiceButton');
        this.ludoButton = document.getElementById('botaoLudo');
        this.jogoDaVelhaButton = document.getElementById('botaoJogoDaVelha');
        this.setupEventListeners();
        this.faceNormals = [
            new THREE.Vector3(0, 1, 0),  // Face superior
            new THREE.Vector3(0, -1, 0), // Face inferior
            new THREE.Vector3(1, 0, 0),  // Face da direita
            new THREE.Vector3(-1, 0, 0), // Face da esquerda
            new THREE.Vector3(0, 0, 1),  // Face da frente
            new THREE.Vector3(0, 0, -1)  // Face de trás
        ];

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.originalScale = new THREE.Vector3(1, 1, 1);
        this.targetScale = new THREE.Vector3(1.5, 1.5, 1.5);
        this.hoverColor = new THREE.Color(0xffffff); // Cor que você deseja que o objeto fique no hover
        this.originalColor = new THREE.Color(0x000000); // Cor original do objeto
        this.intersectedObject = null;
        this.boundOnDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    }

    InitGameLogic() {
        this.InitGameButton();
        this.callCreateWalls();
        this.tick();
    }

    enableMouseListener() {
        window.addEventListener('mousemove', this.boundOnDocumentMouseMove.bind(this), false);
    }

    callCreateWalls() {
        const wallSize = { width: 0.1, height: 1, depth: 2 };

        // Parede direita
        this.graphicEngine.createWall(new THREE.Vector3(4, 0.4, -1.050), { ...wallSize, width: wallSize.depth, depth: wallSize.width });
        this.physicsEngine.createWallCannon(new CANNON.Vec3(4, 0.4, -1.050), { ...wallSize, width: wallSize.depth, depth: wallSize.width });
        // Parede esquerda
        this.graphicEngine.createWall(new THREE.Vector3(4, 0.4, 1.050), { ...wallSize, width: wallSize.depth, depth: wallSize.width });
        this.physicsEngine.createWallCannon(new CANNON.Vec3(4, 0.4, 1.050), { ...wallSize, width: wallSize.depth, depth: wallSize.width });
        // Parede de fundo
        this.graphicEngine.createWall(new THREE.Vector3(5, 0.4, 0), { ...wallSize });
        this.physicsEngine.createWallCannon(new CANNON.Vec3(5, 0.4, 0), { ...wallSize });
        // Parede da frente
        this.graphicEngine.createWall(new THREE.Vector3(3, 0.4, 0), { ...wallSize });
        this.physicsEngine.createWallCannon(new CANNON.Vec3(3, 0.4, 0), { ...wallSize });
    }

    //Camera Move
    smoothCameraMove = (timestamp, callback) => {
        if (this.start === null) {
            this.start = timestamp;
        }
        const progress = timestamp - this.start;
        const alpha = Math.min(progress / this.lerpDuration, 1.5);

        this.graphicEngine.camera.position.lerpVectors(this.graphicEngine.camera.position, this.configsEngine.targetPosition, alpha);

        if (alpha < 1) {
            requestAnimationFrame((nextTimestamp) => this.smoothCameraMove(nextTimestamp, callback));
        } else {
            this.start = null;
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    cameraMove = (player, callback) => {
        switch (player) {
            case 'Vermelho':
                this.configsEngine.targetPosition.set(3, 2, -3);
                break;
            case 'Verde':
                this.configsEngine.targetPosition.set(-3, 2, -3);
                break;
            case 'Amarelo':
                this.configsEngine.targetPosition.set(3, 2, 3);
                break;
            case 'Azul':
                this.configsEngine.targetPosition.set(-3, 2, 3);
                break;
            case 'Dice':
                this.configsEngine.targetPosition.set(7, 2, 0);
                break;
            default:
                this.configsEngine.targetPosition.set(0, 2, 4.5)
                break;
        }
        // Solicita o inicio da animação
        requestAnimationFrame((timestamp) => this.smoothCameraMove(timestamp, callback));
    }

    //Fonts
    rollDicePlayer = () => {
        this.initGameButton.classList.add('invisble');
        this.initGameButton.classList.remove('active');
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`Agora e a vez do ${player} jogar o dado`,
            this.configsEngine.colorsToPlayers[player], () => this.rollDiceButton(this.configsEngine.colorsToPlayers[player]), () => this.cameraMove(player), 0, 2, 0);
    }

    playersStart = () => {
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`Ordem de Jogada: 
        1: ${this.configsEngine.players[0]} 
        2: ${this.configsEngine.players[1]}  
        3: ${this.configsEngine.players[2]}  
        4: ${this.configsEngine.players[3]}`,
            this.configsEngine.colorsToPlayers[player], () => { }, () => {}, 0, 2, 0);
        this.rollDicePlayer();
    };


    initialSucessPlayerText = () => {
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`${player} ainda nao pode se mover, 
    pois ainda nao teve um sucesso inicial.`,
            this.configsEngine.colorsToPlayers[player], () => { }, () => { }, 0, 2, 0)
    }

    chosePinText = () => {
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`${player} vai se mover, escolha o pino.`,
            this.configsEngine.colorsToPlayers[player], () => this.pinsButtons(this.configsEngine.colorsToPlayers[player], 'active', 'invisible'), () => this.cameraMove(player, () => this.cameraMove('Default')), 0, 2, 0);
    }

    selectedPinText = (pino) => {
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`Pino Selecionado: ${pino}.`, this.configsEngine.colorsToPlayers[player], () => this.pinsButtons(this.configsEngine.colorsToPlayers[player], 'invisible', 'active'), () => { }, 0, 2, 0);
        this.graphicEngine.fonts(`Cor ${player} pode jogar o dado novamente.`, this.configsEngine.colorsToPlayers[player], () => this.rollDiceButton(this.configsEngine.colorsToPlayers[player]), () => { }, 0, 2, 0);
    }


    //Actions
    moverPinoLentamente = (pino, novaPosicao, duracao, corAtual) => {
        const posicaoInicial = pino.body.position.clone(); // Usar a posição atual do corpo do pino como posição inicial
        const deslocamento = novaPosicao.clone().sub(posicaoInicial);
        const incrementoPorFrame = deslocamento.clone().divideScalar(duracao / (1000 / 60));

        const rotacaoInicial = pino.pino.rotation.y;
        const rotacaoFinal = corAtual.includes('green') || corAtual.includes('yellow') ? Math.PI / 2 : 0;
        const incrementoRotacaoPorFrame = (rotacaoFinal - rotacaoInicial) / (duracao / (1000 / 60));

        let tempoDecorrido = 0;
        const atualizarPosicao = () => {

            if (tempoDecorrido >= duracao) {
                pino.body.position.set(novaPosicao.x, novaPosicao.y, novaPosicao.z);
                pino.head.position.copy(novaPosicao).add(new THREE.Vector3(0, 0.13, 0)); // Ajusta a altura da cabecaPino se necessário
                pino.base.position.copy(novaPosicao).add(new THREE.Vector3(0, -0.09, 0)); // Ajusta a altura do circle se necessário

                cancelAnimationFrame(this.configsEngine.animacaoId);
                return;
            }

            pino.body.position.add(incrementoPorFrame);
            pino.head.position.add(incrementoPorFrame);
            pino.base.position.add(incrementoPorFrame);
            pino.pino.rotation.y += incrementoRotacaoPorFrame;

            tempoDecorrido += 1000 / 60;


            this.configsEngine.animacaoId = requestAnimationFrame(atualizarPosicao);

        };
        this.configsEngine.animacaoId = requestAnimationFrame(atualizarPosicao);
    };

    proximaEtapa = (etapaAtual, cor) => {
        const ordemEtapas = {
            Azul: ['blue0', 'blue1', 'green1', 'green2', 'green3', 'red1', 'red2', 'red3', 'yellow1', 'yellow2', 'yellow3', 'blue3', 'blue2', 'blue4', 'winn'],
            Verde: ['green0', 'green3', 'red1', 'red2', 'red3', 'yellow1', 'yellow2', 'yellow3', 'blue3', 'blue2', 'blue0', 'blue1', 'green1', 'green4', 'winn'],
            Vermelho: ['red0', 'red3', 'yellow1', 'yellow2', 'yellow3', 'blue3', 'blue2', 'blue0', 'blue1', 'green1', 'green2', 'green3', 'red1', 'red4', 'winn'],
            Amarelo: ['yellow0', 'yellow3', 'blue3', 'blue2', 'blue0', 'blue1', 'green1', 'green2', 'green3', 'red1', 'red2', 'red3', 'yellow1', 'yellow4', 'winn']
        };

        const index = ordemEtapas[cor].indexOf(etapaAtual);
        return ordemEtapas[cor][(index + 1) % ordemEtapas[cor].length];
    };

    currentTrajetory = (cor, selectedPin, callback) => {
        const indicePosicaoAtual = this.configsEngine.posicoesDosPinos[cor][`pino${selectedPin}`];
        const proximaPosicao = this.configsEngine.trajetorysPinos[indicePosicaoAtual.etapa][indicePosicaoAtual.indice];
        const pino = this.configsEngine.pinos[`Pino${cor}${selectedPin}`];

        this.moverPinoLentamente(pino, proximaPosicao, 500, indicePosicaoAtual.etapa);
        indicePosicaoAtual.indice++;

        if (indicePosicaoAtual.indice % this.configsEngine.trajetorysPinos[indicePosicaoAtual.etapa].length === 0) {
            indicePosicaoAtual.indice = 0;
            indicePosicaoAtual.etapa = this.proximaEtapa(indicePosicaoAtual.etapa, cor);
        }

        setTimeout(() => {
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, 700);
    };

    movePinSteps = (passos, currentIndex = 0, onComplete, player, selectedPin) => {
        if (passos > 0) {
            // Chame a função de movimento passando a cor do jogador e o pino selecionado
            this.currentTrajetory(player, selectedPin, () => {
                this.movePinSteps(passos - 1, currentIndex + 1, onComplete, player, selectedPin);
            });
        } else {
            // Todos os passos foram dados, chamar onComplete se existir
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    };

    definirPino = (cor, pino) => {
        if (this.configsEngine.estadoJogadores[cor] && this.configsEngine.estadoJogadores[cor].pinos.includes(pino)) {
            this.configsEngine.estadoJogadores[cor].pinoSelecionado = pino;
            this.selectedPinText(pino);
        } else {
            console.log(`O pino ${pino} não é uma escolha válida para a cor ${cor}.`);
        }
    }

    aguardarEscolhaPino = () => {
        this.configsEngine.esperandoEscolhaNovoPino = true;
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`${player} escolha um pino para se mover.`,
            this.configsEngine.colorsToPlayers[player], player, () => this.pinsButtons(this.configsEngine.colorsToPlayers[player], 'active', 'invisible'), () => { }, 0, 2, 0);
        this.movePin.classList.add('invisble');
        this.newPin.classList.add('invisble');
        this.movePin.classList.remove('active');
        this.newPin.classList.remove('active');
    };

    verificarSobreposicaoDeCores = (corAtual, posicoesDosPinos) => {
        let cores = Object.keys(posicoesDosPinos);
        let sobreposicoes = {
            encontrou: false,
            detalhes: []
        };

        // Transforma o nome da cor de português para inglês e minúscula
        let coresEmIngles = {
            'Azul': 'blue',
            'Amarelo': 'yellow',
            'Verde': 'green',
            'Vermelho': 'red'
        };

        let corAtualEmIngles = coresEmIngles[corAtual];
        let pinosCorAtual = posicoesDosPinos[corAtual];
        for (let j = 0; j < cores.length; j++) {
            let corComparada = cores[j];
            if (corAtual !== corComparada) {
                let corComparadaEmIngles = coresEmIngles[corComparada];
                let pinosCorComparada = posicoesDosPinos[corComparada];

                for (let pino in pinosCorAtual) {
                    let posicaoPinoAtual = pinosCorAtual[pino];

                    for (let pinoComparado in pinosCorComparada) {
                        let posicaoPinoComparado = pinosCorComparada[pinoComparado];
                        // Ignorar se o índice e etapa forem iniciais
                        if (posicaoPinoAtual.indice === 0 && posicaoPinoAtual.etapa === corAtualEmIngles + '0') {
                            continue;
                        }

                        if (posicaoPinoAtual.indice === posicaoPinoComparado.indice &&
                            posicaoPinoAtual.etapa === posicaoPinoComparado.etapa) {

                            sobreposicoes.encontrou = true;
                            sobreposicoes.detalhes.push({
                                corOriginal: corAtual,
                                corSobreposta: corComparada,
                                pinoSobreposto: pinoComparado,
                                indice: posicaoPinoComparado.indice,
                                etapa: posicaoPinoComparado.etapa
                            });
                        }
                    }
                }
            }
        }

        return sobreposicoes;
    }

    esperandoEscolhaPino = (numeroPino, topFaceIndex) => {
        if (this.configsEngine.esperandoEscolhaNovoPino) {
            this.configsEngine.esperandoEscolhaNovoPino = false;
            this.definirPino(this.configsEngine.players[this.configsEngine.currentPlayerIndex], numeroPino);
            topFaceIndex = 1;
            if (!this.configsEngine.posicoesDosPinos[this.configsEngine.players[this.configsEngine.currentPlayerIndex]][`pino${numeroPino}`].indice) {
                this.movePinSteps(topFaceIndex, 0, () => { }, this.configsEngine.players[this.configsEngine.currentPlayerIndex], numeroPino);
            }
        }
        if (this.configsEngine.esperandoEscolhaMoverPinoAtual) {
            this.movePinSteps(topFaceIndex, 0, () => {
                const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
                const sobreposicao = this.verificarSobreposicaoDeCores(player, this.configsEngine.posicoesDosPinos);
                if (sobreposicao.encontrou) {

                    console.log(`Sobreposição encontrada: ${JSON.stringify(sobreposicao.detalhes[0])}`);
                    const pinoSelecionado = sobreposicao.detalhes[0].pinoSobreposto;
                    const numeroDoPino = sobreposicao.detalhes[0].pinoSobreposto.replace(/[^\d]/g, '');
                    const corCapitalizada = sobreposicao.detalhes[0].corSobreposta.charAt(0).toUpperCase() + sobreposicao.detalhes[0].corSobreposta.slice(1).toLowerCase();
                    const pinoSobreposto = `Pino${corCapitalizada}${numeroDoPino}`;
                    const posicaoInicial = this.configsEngine.posicoesIniciais[pinoSobreposto];
                    const pino = this.configsEngine.pinos[pinoSobreposto];
                    this.graphicEngine.fonts(`Cor ${sobreposicao.detalhes[0].corOriginal} sobrepos a Cor ${sobreposicao.detalhes[0].corSobreposta}, 
                e o ${pinoSelecionado} voltara para o Inicio`, this.configsEngine.colorsToPlayers[player], () => { }, 0, 2, 0);
                    this.graphicEngine.fonts(`Cor ${player} pode jogar o dado novamente.`, this.configsEngine.colorsToPlayers[player], player, () => this.rollDiceButton(this.configsEngine.colorsToPlayers[player]), () => cameraMove(player), 0, 2, 0);
                    let novaEtapa; // variável para a nova etapa

                    // Definindo a nova etapa baseada na cor
                    if (corCapitalizada === 'Azul') {
                        novaEtapa = 'blueInit';
                    } else if (corCapitalizada === 'Amarelo') {
                        novaEtapa = 'yellowInit';
                    } else if (corCapitalizada === 'Verde') {
                        novaEtapa = 'greenInit';
                    } else if (corCapitalizada === 'Vermelho') {
                        novaEtapa = 'redInit';
                    }

                    // Chamando a função para atualizar a posição do pino
                    this.atualizarPosicaoDoPino(corCapitalizada, pinoSelecionado, numeroDoPino, novaEtapa);
                    this.moverPinoLentamente(pino, posicaoInicial, 500, corCapitalizada);
                } else {
                    console.log('Nenhuma sobreposição encontrada');
                }
            }, this.configsEngine.players[this.configsEngine.currentPlayerIndex], numeroPino);
        }
    };

    determinarNovoIndice = (numeroDoPino) => {
        switch (numeroDoPino) {
            case 'pino1': return 0;
            case 'pino2': return 1;
            case 'pino3': return 2;
            case 'pino4': return 3;
            default: return 0; // Padrão, caso seja um valor não esperado
        }
    }
    atualizarPosicaoDoPino = (cor, pino, numeroDoPino, novaEtapa) => {
        const novoIndice = this.determinarNovoIndice(numeroDoPino);
        this.configsEngine.posicoesDosPinos[cor][pino].indice = novoIndice;
        this.configsEngine.posicoesDosPinos[cor][pino].etapa = novaEtapa;
    }

    newPinFunc = () => {
        const player = this.configsEngine.players[this.configsEngine.currentPlayerIndex];
        this.graphicEngine.fonts(`O ${player} escolheu adicionar um novo pino`,
            this.configsEngine.colorsToPlayers[player], () => { }, () => this.cameraMove(player), 0, 2, 0);
        this.aguardarEscolhaPino();
        this.configsEngine.esperandoDecisaoUsuario = false;
    }

    randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    }


    //Handles
    handleMovePinClick() {
        if (this.configsEngine.esperandoDecisaoUsuario) {
            const corAtualJogador = this.configsEngine.players[this.configsEngine.currentPlayerIndex]; // "Azul", "Amarelo", etc.
            const pinoParaMover = this.configsEngine.estadoJogadores[corAtualJogador].pinoSelecionado;
            this.configsEngine.topFaceIndex = localStorage.getItem('topFaceIndex');
            this.movePinSteps(this.configsEngine.topFaceIndex, 0, () => {
                const sobreposicao = this.verificarSobreposicaoDeCores(corAtualJogador, this.configsEngine.posicoesDosPinos);
                if (sobreposicao.encontrou) {
                    console.log(`Sobreposição encontrada: ${JSON.stringify(sobreposicao.detalhes[0])}`);
                    const pinoSelecionado = sobreposicao.detalhes[0].pinoSobreposto;
                    const numeroDoPino = sobreposicao.detalhes[0].pinoSobreposto.replace(/[^\d]/g, '');
                    const corCapitalizada = sobreposicao.detalhes[0].corSobreposta.charAt(0).toUpperCase() + sobreposicao.detalhes[0].corSobreposta.slice(1).toLowerCase();
                    const pinoSobreposto = `Pino${corCapitalizada}${numeroDoPino}`;
                    const posicaoInicial = this.configsEngine.posicoesIniciais[pinoSobreposto];
                    const pino = this.configsEngine.pinos[pinoSobreposto];
                    this.graphicEngine.fonts(`Cor ${sobreposicao.detalhes[0].corOriginal} sobrepos a Cor ${sobreposicao.detalhes[0].corSobreposta}, 
                e o ${pinoSelecionado} voltara para o Inicio`, this.configsEngine.colorsToPlayers[corAtualJogador], () => { }, 0, 2, 0);
                    this.graphicEngine.fonts(`Cor ${corAtualJogador} pode jogar o dado novamente.`, this.configsEngine.colorsToPlayers[corAtualJogador], () => this.rollDiceButton(this.configsEngine.colorsToPlayers[corAtualJogador]), () => this.cameraMove(corAtualJogador), 0, 2, 0);
                    let novaEtapa; // variável para a nova etapa

                    // Definindo a nova etapa baseada na cor
                    if (corCapitalizada === 'Azul') {
                        novaEtapa = 'blueInit';
                    } else if (corCapitalizada === 'Amarelo') {
                        novaEtapa = 'yellowInit';
                    } else if (corCapitalizada === 'Verde') {
                        novaEtapa = 'greenInit';
                    } else if (corCapitalizada === 'Vermelho') {
                        novaEtapa = 'redInit';
                    }

                    // Chamando a função para atualizar a posição do pino
                    this.atualizarPosicaoDoPino(corCapitalizada, pinoSelecionado, numeroDoPino, novaEtapa);
                    this.moverPinoLentamente(pino, posicaoInicial, 500, corCapitalizada);
                    this.movePinSteps(0, 0, () => { })

                } else {
                    console.log('Nenhuma sobreposição encontrada');
                }
            }, corAtualJogador, pinoParaMover); // Move o pino selecionado

            this.movePin.classList.add('invisble');
            this.newPin.classList.add('invisble');
            this.movePin.classList.remove('active');
            this.newPin.classList.remove('active');
            this.configsEngine.esperandoDecisaoUsuario = false;
            this.graphicEngine.fonts(`${corAtualJogador} escolheu mover o pino atual, ${this.configsEngine.topFaceIndex} casas`, this.configsEngine.colorsToPlayers[corAtualJogador], () => { }, () => this.cameraMove(corAtualJogador), 0, 2, 0);
            this.graphicEngine.fonts(`Cor ${corAtualJogador} pode jogar o dado novamente.`, this.configsEngine.colorsToPlayers[corAtualJogador], corAtualJogador, () => this.rollDiceButton(this.configsEngine.colorsToPlayers[corAtualJogador]), 0, 2, 0);
        } else {
            console.log('Não é hora de mover um pino');
        }
    }
    handleNewPinClick() {
        if (this.configsEngine.esperandoDecisaoUsuario) {
            this.newPinFunc();

        } else {
            console.log('Não é hora de adicionar um novo pino');
        }
    }
    rollDice = () => {
        if (!this.configsEngine.isDiceRolling) {
            this.cameraMove('Dice', () => this.cameraMove('Default'));
            // Ative o dado e aplique uma força inicial e uma rotação
            this.configsEngine.diceCannon.wakeUp();
            this.configsEngine.diceCannon.velocity.set(-1, -3, -1); // Aumentar a velocidade em todos os eixos
            // Gerar rotação angular aleatória
            const angularVelocityX = this.randomInRange(-30, 30); // Gira em torno do eixo X
            const angularVelocityY = this.randomInRange(-30, 30); // Gira em torno do eixo Y
            const angularVelocityZ = this.randomInRange(-30, 30); // Gira em torno do eixo Z
            this.configsEngine.diceCannon.angularVelocity.set(angularVelocityX, angularVelocityY, angularVelocityZ);
            this.configsEngine.isDiceRolling = true;
        }
    };

    resetDice = () => {
        // Coloca o dado de volta na posição inicial e zera a rotação
        this.configsEngine.diceCannon.position.set(this.configsEngine.launchPosition.x, this.configsEngine.launchPosition.y, this.configsEngine.launchPosition.z);
        this.configsEngine.diceCannon.quaternion.set(0, 0, 0, 1); // Reseta a rotação do dado

        // Interrompe o movimento do dado ao zerar velocidades
        this.configsEngine.diceCannon.velocity.set(0, 0, 0);
        this.configsEngine.diceCannon.angularVelocity.set(0, 0, 0);

        // Coloca o dado para "dormir" para que a simulação de física não o afete
        this.configsEngine.diceCannon.sleep();

        // Atualizar o mesh do dado para corresponder à posição inicial do corpo físico
        this.configsEngine.diceMesh.position.copy(this.configsEngine.diceCannon.position);
        this.configsEngine.diceMesh.quaternion.copy(this.configsEngine.diceCannon.quaternion);

        // Marcar o dado como não rolando para que não seja atualizado no loop de animação
        this.configsEngine.isDiceRolling = false;
    };

    handleDiceRollEnd = (topFaceIndex) => {
        if (localStorage.getItem('topFaceIndex') !== null) {
            // Se existe, removemos
            localStorage.removeItem('topFaceIndex');
            // E adicionamos o novo valor
            localStorage.setItem('topFaceIndex', topFaceIndex);
        } else {
            // Se não existe, simplesmente adicionamos o novo valor
            localStorage.setItem('topFaceIndex', topFaceIndex);
        }
        console.log(`${this.configsEngine.players[this.configsEngine.currentPlayerIndex]} rolou um ${topFaceIndex}`);
        // endRollDiceText();

        this.diceButton.classList.remove('active');
        this.diceButton.classList.add('invisible');

        if (topFaceIndex === 1 || topFaceIndex === 6) {
            if (!this.configsEngine.firstSuccessRoll[this.configsEngine.players[this.configsEngine.currentPlayerIndex]][this.configsEngine.currentPlayerIndex]) {
                this.configsEngine.esperandoEscolhaNovoPino = true;
                this.chosePinText();
                this.configsEngine.firstSuccessRoll[this.configsEngine.players[this.configsEngine.currentPlayerIndex]][this.configsEngine.currentPlayerIndex] = true;
            }
            else {
                this.configsEngine.esperandoDecisaoUsuario = true;
                this.mostrarOpcoesParaUsuarioMoveNew();
            }
        }
        else {
            if (this.configsEngine.firstSuccessRoll[this.configsEngine.players[this.configsEngine.currentPlayerIndex]][this.configsEngine.currentPlayerIndex]) {
                // Move a peça do jogador
                const corAtualJogador = this.configsEngine.players[this.configsEngine.currentPlayerIndex]; // "Azul", "Amarelo", etc.
                const pinoParaMover = this.configsEngine.estadoJogadores[corAtualJogador].pinoSelecionado;

                if (pinoParaMover !== null) {
                    this.movePinSteps(topFaceIndex, 0, () => {
                        const sobreposicao = this.verificarSobreposicaoDeCores(corAtualJogador, this.configsEngine.posicoesDosPinos);
                        if (sobreposicao.encontrou) {
                            console.log(`Sobreposição encontrada: ${JSON.stringify(sobreposicao.detalhes[0])}`);
                            const pinoSelecionado = sobreposicao.detalhes[0].pinoSobreposto;
                            const numeroDoPino = sobreposicao.detalhes[0].pinoSobreposto.replace(/[^\d]/g, '');
                            const corCapitalizada = sobreposicao.detalhes[0].corSobreposta.charAt(0).toUpperCase() + sobreposicao.detalhes[0].corSobreposta.slice(1).toLowerCase();
                            const pinoSobreposto = `Pino${corCapitalizada}${numeroDoPino}`;
                            const posicaoInicial = posicoesIniciais[pinoSobreposto];
                            const pino = this.configsEngine.pinos[pinoSobreposto];
                            this.graphicEngine.fonts(`Cor ${sobreposicao.detalhes[0].corOriginal} sobrepos a Cor ${sobreposicao.detalhes[0].corSobreposta}, 
                e o ${pinoSelecionado} voltara para o Inicio`, this.configsEngine.colorsToPlayers[corAtualJogador], () => { }, 0, 2, 0);
                            this.graphicEngine.fonts(`Cor ${corAtualJogador} pode jogar o dado novamente.`, this.configsEngine.colorsToPlayers[corAtualJogador], () => this.rollDiceButton(this.configsEngine.colorsToPlayers[corAtualJogador]), () => this.cameraMove(corAtualJogador), 0, 2, 0);
                            let novaEtapa; // variável para a nova etapa

                            // Definindo a nova etapa baseada na cor
                            if (corCapitalizada === 'Azul') {
                                novaEtapa = 'blueInit';
                            } else if (corCapitalizada === 'Amarelo') {
                                novaEtapa = 'yellowInit';
                            } else if (corCapitalizada === 'Verde') {
                                novaEtapa = 'greenInit';
                            } else if (corCapitalizada === 'Vermelho') {
                                novaEtapa = 'redInit';
                            }

                            // Chamando a função para atualizar a posição do pino
                            this.atualizarPosicaoDoPino(corCapitalizada, pinoSelecionado, numeroDoPino, novaEtapa);
                            this.moverPinoLentamente(pino, posicaoInicial, 500, corCapitalizada);
                        } else {
                            console.log('Nenhuma sobreposição encontrada');

                        }
                    }, corAtualJogador, pinoParaMover);
                }
            }
            else {
                console.log(`${this.configsEngine.players[this.configsEngine.currentPlayerIndex]} não pode se mover, pois ainda não teve um sucesso inicial.`);
                this.initialSucessPlayerText();
            }
            this.configsEngine.currentPlayerIndex = (this.configsEngine.currentPlayerIndex + 1) % this.configsEngine.players.length;
            this.rollDicePlayer();
        }
    };

    determineTopFace = (diceMesh) => {
        const upVector = new THREE.Vector3(0, 1, 0); // Vector apontando para cima
        let maxDot = -Infinity;


        this.faceNormals.forEach((normal, index) => {
            const transformedNormal = normal.clone().applyQuaternion(diceMesh.quaternion);
            const dot = transformedNormal.dot(upVector);

            if (dot > maxDot) {
                maxDot = dot;
                this.configsEngine.topFaceIndex = index + 1;
                switch (index + 1) {
                    case 3: this.configsEngine.topFaceIndex = 1; break;
                    case 4: this.configsEngine.topFaceIndex = 2; break;
                    case 1: this.configsEngine.topFaceIndex = 3; break;
                    case 2: this.configsEngine.topFaceIndex = 4; break;
                    case 5: this.configsEngine.topFaceIndex = 5; break;
                    case 6: this.configsEngine.topFaceIndex = 6; break;
                }
            }
        });

        return this.configsEngine.topFaceIndex;
    }

    //Buttons
    setupEventListeners() {
        this.movePin.addEventListener('click', () => this.handleMovePinClick());
        this.newPin.addEventListener('click', () => this.handleNewPinClick());
        // É possível adicionar mais "event listeners" aqui se necessário
    }

    mostrarOpcoesParaUsuarioMoveNew = () => {
        this.movePin.style.display = 'inline-block';
        this.newPin.style.display = 'inline-block';

        // Pode adicionar texto informativo ou alterar o texto do botão, se necessário
        this.movePin.innerText = 'Mover Pino Atual';
        this.newPin.innerText = 'Novo Pino';

        this.movePin.classList.remove('invisble');
        this.newPin.classList.remove('invisble');

        this.movePin.classList.add('active');
        this.newPin.classList.add('active');
    };

    pinsButtons = (backgroundColor, add, remove) => {
        const pinosButton = {
            'pino1': document.getElementById('pino-1'),
            'pino2': document.getElementById('pino-2'),
            'pino3': document.getElementById('pino-3'),
            'pino4': document.getElementById('pino-4')
        };

        const hoverColor = `${backgroundColor}B3`;
        const rootStyle = document.documentElement.style;
        pinosButton.pino1.classList.remove(remove);
        pinosButton.pino2.classList.remove(remove);
        pinosButton.pino3.classList.remove(remove);
        pinosButton.pino4.classList.remove(remove);

        pinosButton.pino1.classList.add(add);
        pinosButton.pino2.classList.add(add);
        pinosButton.pino3.classList.add(add);
        pinosButton.pino4.classList.add(add);

        pinosButton.pino1.addEventListener('click', () => this.esperandoEscolhaPino(1));
        pinosButton.pino2.addEventListener('click', () => this.esperandoEscolhaPino(2));
        pinosButton.pino3.addEventListener('click', () => this.esperandoEscolhaPino(3));
        pinosButton.pino4.addEventListener('click', () => this.esperandoEscolhaPino(4));

        rootStyle.setProperty('--hover-color', hoverColor);
        rootStyle.setProperty('--background-color', backgroundColor);
    }

    rollDiceButton = (backgroundColor) => {
        const hoverColor = `${backgroundColor}B3`;
        const rootStyle = document.documentElement.style;
        this.diceButton.classList.remove('invisible');
        this.diceButton.classList.add('active');
        rootStyle.setProperty('--hover-color', hoverColor);
        rootStyle.setProperty('--background-color', backgroundColor);
        this.diceButton.addEventListener('click', this.rollDice);
    }

    abrirLudo() {
        const container = document.querySelector('.container');
        this.ludoButton.addEventListener('click', () => {
            container.classList.remove('container');
            container.classList.add('invisible');
            this.graphicEngine.controls.target.set(0, 0, 0);
            this.configsEngine.targetPosition.set(0, 2, 7);
            requestAnimationFrame((timestamp) => this.smoothCameraMove(timestamp, () => { }));
            this.initGameButton.classList.add('active');
            this.initGameButton.classList.remove('invisible');
            this.initGameButton.addEventListener('click', this.initGame);
        });
    }

    //Init 
    initGame = () => {

        for (let i = this.configsEngine.players.length - 1; i > 0; i--) {
            // Gera um índice aleatório
            const j = Math.floor(Math.random() * (i + 1));
            // Troca os elementos
            [this.configsEngine.players[i], this.configsEngine.players[j]] = [this.configsEngine.players[j], this.configsEngine.players[i]];
        }

        // Cria estado para cada cor
        this.configsEngine.players.forEach((cor) => {
            this.configsEngine.estadoJogadores[cor] = {
                pinos: [1, 2, 3, 4],
                pinoSelecionado: null
            };
        });
        this.playersStart();
        return this.configsEngine.players;
    }

    InitGameButton = () => {
        this.abrirLudo();
    }
    onDocumentMouseMove(event) {
        event.preventDefault();

        // Converta a posição do mouse em coordenadas normalizadas (-1 a +1) para ambos os eixos
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Atualize o raycaster com a nova posição do mouse
        this.raycaster.setFromCamera(this.mouse, this.graphicEngine.camera);

        const intersects = this.raycaster.intersectObjects(this.graphicEngine.scene.children);

        if (this.intersectedObject) {
            this.intersectedObject.isMouseOver = false; // Setar como false por padrão
        }

        if (intersects.length > 0 && intersects[0].object.name.includes('number')) {
            const intersectedObject = intersects[0].object;
            if (this.intersectedObject !== intersectedObject) {
                this.intersectedObject = intersectedObject;
            }
            this.intersectedObject.isMouseOver = true;
        }
    }

    tick = () => {
        const elapsedTime = this.configsEngine.clock.getElapsedTime()
        const deltaTime = elapsedTime - this.configsEngine.previousTime
        this.configsEngine.previousTime = elapsedTime

        this.configsEngine.pulseScale = Math.sin(elapsedTime * 3) * 0.1 + 0.1;

        // Update Mixer
        if (this.configsEngine.mixer !== null) {
            this.configsEngine.mixer.update(deltaTime);
        }

        if (this.configsEngine.isDiceRolling) {
            this.physicsEngine.world.step(1 / 60);
            this.configsEngine.diceMesh.position.copy(this.configsEngine.diceCannon.position);
            this.configsEngine.diceMesh.quaternion.copy(this.configsEngine.diceCannon.quaternion);

            const angularVelocityThreshold = 0.05; // Ajuste conforme necessário
            const linearVelocityThreshold = 0.05;   // Ajuste conforme necessário

            // Verifica se a velocidade angular e linear estão abaixo dos limiares
            if (this.configsEngine.diceCannon.angularVelocity.length() < angularVelocityThreshold && this.configsEngine.diceCannon.velocity.length() < linearVelocityThreshold) {
                // Espera um certo intervalo de tempo antes de definir como parado, para garantir que o dado tenha assentado
                if (!this.configsEngine.diceSettlingTime) {
                    this.configsEngine.diceSettlingTime = elapsedTime;  // Captura o tempo atual
                } else if (elapsedTime - this.configsEngine.diceSettlingTime > this.configsEngine.someSettlingDuration) {

                    this.configsEngine.topFaceIndex = this.determineTopFace(this.configsEngine.diceMesh);
                    this.handleDiceRollEnd(this.configsEngine.topFaceIndex);
                    this.configsEngine.topFaceIndex = null; // Reset topFaceIndex após o manuseio
                    this.configsEngine.isDiceRolling = false; // Marque o dado como não rolando
                    this.configsEngine.diceSettlingTime = null; // Reseta o tempo de assentamento
                    this.resetDice();
                }
            }
        }

        this.graphicEngine.scene.children.forEach(child => {
            if (child.update) child.update(this.configsEngine.pulseScale);
        });

        if (this.intersectedObject) {
            const lerpFactor = 0.1;

            if (this.intersectedObject.isMouseOver) {
                // Efeito de hover
                this.intersectedObject.scale.lerp(this.targetScale, lerpFactor);
                this.intersectedObject.material.color.lerp(this.hoverColor, lerpFactor);
            } else {
                // Reverter para o estado normal
                this.intersectedObject.scale.lerp(this.originalScale, lerpFactor);
                this.intersectedObject.material.color.lerp(this.originalColor, lerpFactor);

                // Checar se o objeto retornou à sua cor e escala originais
                if (this.intersectedObject.scale.equals(this.originalScale) &&
                    this.intersectedObject.material.color.equals(this.originalColor)) {
                    // Resetamos o intersectedObject para null
                    // quando os valores voltaram ao original
                    this.intersectedObject = null;
                }
            }
        }

        // Update controls
        this.graphicEngine.controls.update();

        // Renderiza a cena
        this.graphicEngine.renderer.render(this.graphicEngine.scene, this.graphicEngine.camera)

        // Chama o próximo frame
        window.requestAnimationFrame(this.tick)
    };
}

export default GameLogicEngine;
