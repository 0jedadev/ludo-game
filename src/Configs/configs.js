// ConfigsEngine.js
import * as THREE from 'three';

class ConfigsEngine {
    constructor() {
        this.mixer = null;
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        this.diceCannon = null;
        this.diceMesh = null;
        this.pinos = {};
        this.launchPosition = { x: 5, y: 3, z: 1 };
        this.posicoesDosPinos = {
            'Azul': {
                pino1: { indice: 0, etapa: 'blue0' },
                pino2: { indice: 0, etapa: 'blue0' },
                pino3: { indice: 0, etapa: 'blue0' },
                pino4: { indice: 0, etapa: 'blue0' }
            },
            'Amarelo': {
                pino1: { indice: 0, etapa: 'yellow0' },
                pino2: { indice: 0, etapa: 'yellow0' },
                pino3: { indice: 0, etapa: 'yellow0' },
                pino4: { indice: 0, etapa: 'yellow0' }
            },
            'Verde': {
                pino1: { indice: 0, etapa: 'green0' },
                pino2: { indice: 0, etapa: 'green0' },
                pino3: { indice: 0, etapa: 'green0' },
                pino4: { indice: 0, etapa: 'green0' }
            },
            'Vermelho': {
                pino1: { indice: 0, etapa: 'red0' },
                pino2: { indice: 0, etapa: 'red0' },
                pino3: { indice: 0, etapa: 'red0' },
                pino4: { indice: 0, etapa: 'red0' }
            }
        };
        this.trajetorysPinos = {
            blueInit: [
                new THREE.Vector3(-2, 0.25, 1.5),
                new THREE.Vector3(-1.5, 0.25, 1.5),
                new THREE.Vector3(-1.5, 0.25, 2),
                new THREE.Vector3(-2, 0.25, 2),

            ],
            blue0: [
                new THREE.Vector3(-0.4, 0.25, 1.9),
            ],
            blue1: [
                new THREE.Vector3(-0.4, 0.25, 1.6),
                new THREE.Vector3(-0.4, 0.25, 1.3),
                new THREE.Vector3(-0.4, 0.25, 1),
                new THREE.Vector3(-0.4, 0.25, 0.7),
                new THREE.Vector3(-0.4, 0.25, 0.4),
            ],
            blue2: [
                new THREE.Vector3(0.4, 0.25, 1.9),
                new THREE.Vector3(0, 0.25, 1.9),
            ],
            blue3: [
                new THREE.Vector3(0.4, 0.25, 0.4),
                new THREE.Vector3(0.4, 0.25, 0.7),
                new THREE.Vector3(0.4, 0.25, 1),
                new THREE.Vector3(0.4, 0.25, 1.3),
                new THREE.Vector3(0.4, 0.25, 1.6),

            ],
            blue4: [
                new THREE.Vector3(0, 0.25, 1.6),
                new THREE.Vector3(0, 0.25, 1.3),
                new THREE.Vector3(0, 0.25, 1),
                new THREE.Vector3(0, 0.25, 0.7),
                new THREE.Vector3(0, 0.25, 0.4),

            ],
            greenInit: [
                new THREE.Vector3(-2, 0.25, -1.9),
                new THREE.Vector3(-2, 0.25, -1.4),
                new THREE.Vector3(-1.5, 0.25, -1.9),
                new THREE.Vector3(-1.5, 0.25, -1.4),
            ],
            green0: [
                new THREE.Vector3(0.4, 0.25, -1.9),
            ],
            green1: [
                new THREE.Vector3(-0.4, 0.25, -0.7),
                new THREE.Vector3(-0.4, 0.25, -1),
                new THREE.Vector3(-0.4, 0.25, -1.3),
                new THREE.Vector3(-0.4, 0.25, -1.6),
                new THREE.Vector3(-0.4, 0.25, -1.9),
            ],
            green2: [
                new THREE.Vector3(0, 0.25, -1.9),
                new THREE.Vector3(0.4, 0.25, -1.9),
            ],
            green3: [
                new THREE.Vector3(0.4, 0.25, -1.6),
                new THREE.Vector3(0.4, 0.25, -1.3),
                new THREE.Vector3(0.4, 0.25, -1),
                new THREE.Vector3(0.4, 0.25, -0.7),
                // new THREE.Vector3(0.4, 0.25, -0.4),
            ],
            green4: [
                new THREE.Vector3(0, 0.25, -1.9),
                new THREE.Vector3(0, 0.25, -1.6),
                new THREE.Vector3(0, 0.25, -1.3),
                new THREE.Vector3(0, 0.25, -1),
                new THREE.Vector3(0, 0.25, -0.7),
                new THREE.Vector3(0, 0.25, -0.4),
            ],
            redInit: [
                new THREE.Vector3(2, 0.25, -1.4),
                new THREE.Vector3(2, 0.25, -1.9),
                new THREE.Vector3(1.5, 0.25, -1.9),
                new THREE.Vector3(1.5, 0.25, -1.4),
            ],
            red0: [
                new THREE.Vector3(0.4, 0.25, -1.9),
            ],
            red1: [
                new THREE.Vector3(-0.4, 0.25, -0.4),
                new THREE.Vector3(-0.4, 0.25, -0.7),
                new THREE.Vector3(-0.4, 0.25, -1),
                new THREE.Vector3(-0.4, 0.25, -1.3),
                new THREE.Vector3(-0.4, 0.25, -1.6),
                new THREE.Vector3(-0.4, 0.25, -1.9),

            ],
            red2: [
                new THREE.Vector3(0, 0.25, -1.9),
                new THREE.Vector3(0.4, 0.25, -1.9),
            ],
            red3: [
                new THREE.Vector3(0.4, 0.25, -1.6),
                new THREE.Vector3(0.4, 0.25, -1.3),
                new THREE.Vector3(0.4, 0.25, -1),
                new THREE.Vector3(0.4, 0.25, -0.7),
                new THREE.Vector3(0.4, 0.25, -0.4),
            ],
            red4: [
                new THREE.Vector3(0, 0.25, -1.9),
                new THREE.Vector3(0, 0.25, -1.6),
                new THREE.Vector3(0, 0.25, -1.3),
                new THREE.Vector3(0, 0.25, -1),
                new THREE.Vector3(0, 0.25, -0.7),
                new THREE.Vector3(0, 0.25, -0.4),
            ],
            yellowInit: [
                new THREE.Vector3(2, 0.25, 1.5),
                new THREE.Vector3(2, 0.25, 2),
                new THREE.Vector3(1.5, 0.25, 1.5),
                new THREE.Vector3(1.5, 0.25, 2),

            ],
            yellow0: [
                new THREE.Vector3(-0.4, 0.25, 1.9)
            ],
            yellow1: [
                new THREE.Vector3(0.4, 0.25, 0.7),
                new THREE.Vector3(0.4, 0.25, 1),
                new THREE.Vector3(0.4, 0.25, 1.3),
                new THREE.Vector3(0.4, 0.25, 1.6),
                new THREE.Vector3(0.4, 0.25, 1.9),
            ],
            yellow2: [
                new THREE.Vector3(0, 0.25, 1.9),
                new THREE.Vector3(-0.4, 0.25, 1.9),
            ],
            yellow3: [
                // new THREE.Vector3(-0.4, 0.25, 1.9),
                new THREE.Vector3(-0.4, 0.25, 1.6),
                new THREE.Vector3(-0.4, 0.25, 1.3),
                new THREE.Vector3(-0.4, 0.25, 1),
                new THREE.Vector3(-0.4, 0.25, 0.7),
            ],
            yellow4: [
                new THREE.Vector3(0, 0.25, 1.9),
                new THREE.Vector3(0, 0.25, 1.6),
                new THREE.Vector3(0, 0.25, 1.3),
                new THREE.Vector3(0, 0.25, 1),
                new THREE.Vector3(0, 0.25, 0.7),
                new THREE.Vector3(0, 0.25, 0.4),
            ],
            winn: [
                new THREE.Vector3(0, 0.36, 0),
            ]
        };
        this.players = ['Amarelo', 'Azul', 'Verde', 'Vermelho'];
        this.currentPlayerIndex = 0;
        this.firstSuccessRoll = {
            'Azul': [false, false, false, false],
            'Amarelo': [false, false, false, false],
            'Verde': [false, false, false, false],
            'Vermelho': [false, false, false, false]
        };
        this.estadoJogadores = {};
        this.isDiceRolling = false;
        this.diceSettlingTime = null;
        this.previousTime = 0;
        this.animacaoId = null;
        this.esperandoEscolhaNovoPino = false;
        this.esperandoEscolhaMoverPinoAtual = false;
        this.esperandoDecisaoUsuario = false;
        this.topFaceIndex = -1;
        this.someSettlingDuration = 1;
        this.clock = new THREE.Clock();
        this.colorsToPlayers = {
            Vermelho: '#FF3535',
            Verde: '#388E3C',
            Azul: '#223FD8',
            Amarelo: '#FFD700'
        };
        this.textQueue = [];
        this.isTextBeingDisplayed = false;
        this.textObject = null;
        this.targetPosition = new THREE.Vector3(0, 2, 5);
        this.initialRotationX = null;
        this.initialRotationZ = null;
        this.posicoesIniciais = {
            PinoAzul1: new THREE.Vector3(-2, 0.25, 1.5),
            PinoAzul2: new THREE.Vector3(-1.5, 0.25, 1.5),
            PinoAzul3: new THREE.Vector3(-1.5, 0.25, 2),
            PinoAzul4: new THREE.Vector3(-2, 0.25, 2),

            PinoVerde1: new THREE.Vector3(-2, 0.25, -1.9),
            PinoVerde2: new THREE.Vector3(-2, 0.25, -1.4),
            PinoVerde3: new THREE.Vector3(-1.5, 0.25, -1.9),
            PinoVerde4: new THREE.Vector3(-1.5, 0.25, -1.4),

            PinoAmarelo1: new THREE.Vector3(2, 0.25, 1.5),
            PinoAmarelo2: new THREE.Vector3(2, 0.25, 2),
            PinoAmarelo3: new THREE.Vector3(1.5, 0.25, 1.5),
            PinoAmarelo4: new THREE.Vector3(1.5, 0.25, 2),

            PinoVermelho1: new THREE.Vector3(2, 0.25, -1.4),
            PinoVermelho2: new THREE.Vector3(2, 0.25, -1.9),
            PinoVermelho3: new THREE.Vector3(1.5, 0.25, -1.9),
            PinoVermelho4: new THREE.Vector3(1.5, 0.25, -1.4)
        };
    }
}

export default ConfigsEngine;
