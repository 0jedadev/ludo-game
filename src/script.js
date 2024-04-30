import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Cannon.js
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Configurar a gravidade com 9.82 m/s² no eixo y

function createState(initialValue) {
    let _val = initialValue // _val é uma variável privada no contexto createState

    function state() {
        return _val // Retorna o valor atual de _val
    }

    function setState(newVal) {
        _val = newVal // Define _val para um novo valor
    }

    return [state, setState]
}

let mixer = null;
let diceMesh, diceBody, groundMesh, groundBody;
let pinos = {};
//Obj Atual Posicoes do Trajetory Pinos
let posicoesDosPinos = {
    'Azul': {
        pino1: { indice: 0, etapa: 'blue0' },
        pino2: { indice: 0, etapa: 'blue0' },
        pino3: { indice: 0, etapa: 'blue0' },
        pino4: { indice: 0, etapa: 'blue0' },
    },
    'Amarelo': {
        pino1: { indice: 0, etapa: 'yellow0' },
        pino2: { indice: 0, etapa: 'yellow0' },
        pino3: { indice: 0, etapa: 'yellow0' },
        pino4: { indice: 0, etapa: 'yellow0' },
    },
    'Verde': {
        pino1: { indice: 0, etapa: 'green0' },
        pino2: { indice: 0, etapa: 'green0' },
        pino3: { indice: 0, etapa: 'green0' },
        pino4: { indice: 0, etapa: 'green0' },
    },
    'Vermelho': {
        pino1: { indice: 0, etapa: 'red0' },
        pino2: { indice: 0, etapa: 'red0' },
        pino3: { indice: 0, etapa: 'red0' },
        pino4: { indice: 0, etapa: 'red0' },
    },
};
//OBJ TrajetorysPinos
const trajetorysPinos = {
    blueInit: [
        new THREE.Vector3(-2, 0.25, 1.5),
        new THREE.Vector3(-1.5, 0.25, 1.5),
        new THREE.Vector3(-1.5, 0.25, 2),
        new THREE.Vector3(-2, 0.25, 2),

    ],
    blue0: [
        new THREE.Vector3(-0.4, 0.25, 1.9),
    ],
    blue: [
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
    green: [
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
    red: [
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
    yellow: [
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

//Func Iniciar Jogo
let players = ['Amarelo', 'Azul', 'Verde', 'Vermelho'];
let currentPlayerIndex = 0;
let firstSuccessRoll = {
    'Azul': [false, false, false, false],
    'Amarelo': [false, false, false, false],
    'Verde': [false, false, false, false],
    'Vermelho': [false, false, false, false],
};

let estadoJogadores = {};
let isDiceRolling = false, diceSettlingTime = null, previousTime = 0;
// Variável para armazenar o ID da animação atual
let animacaoId = null;
let esperandoEscolhaNovoPino = false;
let esperandoEscolhaMoverPinoAtual = false;
let movePinBool = false;
let newPinBool = false;
// Armazenar se o jogador já teve a primeira rolagem bem-sucedida
let esperandoDecisaoUsuario = false;
let topFaceIndex = -1;
const clock = new THREE.Clock()
const someSettlingDuration = 1; // Duração em segundos para esperar o dado assentar
let indicesVerdadeiros = [];
let contagemVerdadeiros = 0;
let pinosRestantes;
let nomeDoPino = [];


//TEXTURES
const textureLoader = new THREE.TextureLoader();

const textures = [
    textureLoader.load('textures/img/1.jpg'),
    textureLoader.load('textures/img/2.jpg'),
    textureLoader.load('textures/img/3.jpg'),
    textureLoader.load('textures/img/4.jpg'),
    textureLoader.load('textures/img/5.jpg'),
    textureLoader.load('textures/img/6.jpg')
];

const aoTexture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_AO_2K.jpg');
const bumpTexture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_BUMP_2K.jpg');
const colVar1Texture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_COL_VAR1_2K.jpg');
const colVar2Texture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_COL_VAR2_2K.jpg');
const colVar3Texture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_COL_VAR3_2K.jpg');
const disp16Texture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_DISP16_2K.tif');
const glossTexture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_GLOSS_2K.jpg');
const nrmTexture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_NRM_2K.jpg');
const reflTexture = textureLoader.load('/textures/floor/FloorBlack/FabricLeatherCowhide001_REFL_2K.jpg');


//THREE.JS SCENE LUDO
//FUNC FLOOR
const Floor = () => {
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(5, 5, 0.2),
        new THREE.MeshStandardMaterial({
            color: '#D3B98F'
        })

    )
    floor.receiveShadow = true
    floor.castShadow = true;
    floor.rotation.x = - Math.PI * 0.5

    const belowFloorGeometry = new THREE.BoxGeometry(10, 10, 0.2);
    const belowFloorMaterials = [
        new THREE.MeshStandardMaterial({ map: colVar1Texture }), // Material para o lado esquerdo
        new THREE.MeshStandardMaterial({ map: colVar2Texture }), // Material para o lado direito
        new THREE.MeshStandardMaterial({ map: aoTexture }), // Material para o fundo
        new THREE.MeshStandardMaterial({ map: colVar3Texture }), // Material para o frente
        new THREE.MeshStandardMaterial({
            map: bumpTexture,
            normalMap: nrmTexture,
            displacementMap: disp16Texture,
            displacementScale: 1,
            roughnessMap: glossTexture,
            envMap: reflTexture,
            color: '#f1f1f1'
        }), // Material para a topo
        new THREE.MeshStandardMaterial({
            map: bumpTexture,
            normalMap: nrmTexture,
            displacementMap: disp16Texture,
            displacementScale: 0.05,
            roughnessMap: glossTexture,
            envMap: reflTexture,
        }), // Material para a parte de baixo
    ];

    const belowFloor = new THREE.Mesh(belowFloorGeometry, belowFloorMaterials)
    belowFloor.position.y = -0.3
    belowFloor.receiveShadow = true
    belowFloor.castShadow = true;
    belowFloor.rotation.x = - Math.PI * 0.5
    scene.add(floor, belowFloor);
}

//FUNC addBorder
const addBorder = (x, y, z, width, height, rz) => {
    const borderGeometry = new THREE.PlaneGeometry(width, height);
    const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.receiveShadow = true
    border.castShadow = true;
    border.position.set(x, y, z);
    border.rotation.x = - Math.PI * 0.5;
    border.rotation.z = rz;
    scene.add(border);
}

//Func Call Add Borders 
const callAddBorders = () => {
    addBorder(-2.3, 0.15, 0, 0.03, 4.5, 0)
    addBorder(2.3, 0.15, 0, 0.03, 4.5, 0)
    addBorder(0, 0.15, 2.25, 0.03, 4.63, Math.PI / 2)
    addBorder(0, 0.15, -2.25, 0.03, 4.63, Math.PI / 2)
}

//FUNC PlaneBelowFloor
const planeBelowFloor = () => {
    const planeBelowFloorGeometry = new THREE.BoxGeometry(5.2, 5.2, 0.05);
    const planeBelowFloorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const planeBelowFloor = new THREE.Mesh(planeBelowFloorGeometry, planeBelowFloorMaterial);
    planeBelowFloor.receiveShadow = true
    planeBelowFloor.castShadow = true;
    planeBelowFloor.position.set(0, -0.13, 0);
    planeBelowFloor.rotation.x = - Math.PI * 0.5;
    scene.add(planeBelowFloor)
}

//FUNC ADD Circle Base
const addCircleBase = (x, y, z, radius, segment, rz, color) => {
    const circleGroup = new THREE.Group();
    scene.add(circleGroup);
    const CircleGeometry = new THREE.CircleGeometry(radius, segment);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: color });
    const circle = new THREE.Mesh(CircleGeometry, circleMaterial);
    circle.receiveShadow = true
    circle.castShadow = true;
    circle.rotation.x = - Math.PI * 0.5;
    circle.rotation.z = rz;
    circle.position.set(0, 0.15, 0);

    const circle1 = circle.clone();
    circle1.position.set(0.5, 0.15, 0)

    const circle2 = circle.clone();
    circle2.position.set(0, 0.15, 0.5)


    const circle3 = circle.clone();
    circle3.position.set(0.5, 0.15, 0.5)


    circleGroup.position.set(x, y, z);
    circleGroup.add(circle, circle1, circle2, circle3);
}

//FUNC Call Circle Base
const callCircleBase = () => {
    addCircleBase(-2, 0, 1.5, 0.15, 30, 0, '#223FD8')
    addCircleBase(1.5, 0, 1.5, 0.15, 30, 0, '#FDEB2E')
    addCircleBase(1.5, 0, -1.9, 0.15, 30, 0, '#FF3535')
    addCircleBase(-2, 0, -1.9, 0.15, 30, 0, '#32FF38')
}

//FUNC addTrajetory
const addRoute = (x, y, z, rz, color) => {
    const planeGroup = new THREE.Group();
    scene.add(planeGroup);
    const planeGeometry = new THREE.PlaneGeometry(0.2, 0.2);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: color });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true
    plane.castShadow = true;
    plane.position.set(x, y, z);
    plane.rotation.x = - Math.PI * 0.5;
    plane.rotation.z = rz;


    const BorderGeometry = new THREE.PlaneGeometry(0.22, 0.22);
    const BorderMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
    const border = new THREE.Mesh(BorderGeometry, BorderMaterial);

    border.receiveShadow = true
    border.castShadow = true;
    border.position.set(x, y - 0.01, z);
    border.rotation.x = - Math.PI * 0.5;
    border.rotation.z = rz;

    planeGroup.rotation.y = rz;

    planeGroup.add(plane, border);
}

//FUNC CallRoutes
const CallRoutes = () => {
    //1 Blue
    addRoute(-0.4, 0.15, 1.9, 0, '#223FD8')
    addRoute(0, 0.15, 1.9, 0, '#f1f1f1')
    addRoute(0.4, 0.15, 1.9, 0, '#f1f1f1')
    //2 Blue
    addRoute(-0.4, 0.15, 1.6, 0, '#f1f1f1')
    addRoute(0, 0.15, 1.6, 0, '#223FD8')
    addRoute(0.4, 0.15, 1.6, 0, '#f1f1f1')

    //3 Blue
    addRoute(-0.4, 0.15, 1.3, 0, '#f1f1f1')
    addRoute(0, 0.15, 1.3, 0, '#223FD8')
    addRoute(0.4, 0.15, 1.3, 0, '#f1f1f1')

    //4 Blue
    addRoute(-0.4, 0.15, 1, 0, '#f1f1f1')
    addRoute(0, 0.15, 1, 0, '#223FD8')
    addRoute(0.4, 0.15, 1, 0, '#f1f1f1')
    //5 Blue
    addRoute(-0.4, 0.15, 0.7, 0, '#f1f1f1')
    addRoute(0, 0.15, 0.7, 0, '#223FD8')
    addRoute(0.4, 0.15, 0.7, 0, '#f1f1f1')
    //6 Blue
    addRoute(-0.4, 0.15, 0.4, 0, '#f1f1f1')
    addRoute(0, 0.15, 0.4, 0, '#223FD8')
    addRoute(0.4, 0.15, 0.4, 0, '#f1f1f1')

    //1 Green
    addRoute(-0.4, 0.15, -0.4, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, -0.4, Math.PI / 2, '#32FF38')
    addRoute(0.4, 0.15, -0.4, Math.PI / 2, '#f1f1f1')

    //2 Green
    addRoute(-0.4, 0.15, -0.7, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, -0.7, Math.PI / 2, '#32FF38')
    addRoute(0.4, 0.15, -0.7, Math.PI / 2, '#f1f1f1')
    //3 Green
    addRoute(-0.4, 0.15, -1, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, -1, Math.PI / 2, '#32FF38')
    addRoute(0.4, 0.15, -1, Math.PI / 2, '#f1f1f1')
    //4 Green
    addRoute(-0.4, 0.15, -1.3, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, -1.3, Math.PI / 2, '#32FF38')
    addRoute(0.4, 0.15, -1.3, Math.PI / 2, '#f1f1f1')
    //5 Green
    addRoute(-0.4, 0.15, -1.6, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, -1.6, Math.PI / 2, '#32FF38')
    addRoute(0.4, 0.15, -1.6, Math.PI / 2, '#f1f1f1')
    //6 Green
    addRoute(-0.4, 0.15, -1.9, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, -1.9, Math.PI / 2, '#f1f1f1')
    addRoute(0.4, 0.15, -1.9, Math.PI / 2, '#32FF38')

    //1 Red
    addRoute(-0.4, 0.15, -0.4, 0, '#f1f1f1')
    addRoute(0, 0.15, -0.4, 0, '#FF3535')
    addRoute(0.4, 0.15, -0.4, 0, '#f1f1f1')

    //2 Red
    addRoute(-0.4, 0.15, -0.7, 0, '#f1f1f1')
    addRoute(0, 0.15, -0.7, 0, '#FF3535')
    addRoute(0.4, 0.15, -0.7, 0, '#f1f1f1')
    //3 Red
    addRoute(-0.4, 0.15, -1, 0, '#f1f1f1')
    addRoute(0, 0.15, -1, 0, '#FF3535')
    addRoute(0.4, 0.15, -1, 0, '#f1f1f1')
    //4 Red
    addRoute(-0.4, 0.15, -1.3, 0, '#f1f1f1')
    addRoute(0, 0.15, -1.3, 0, '#FF3535')
    addRoute(0.4, 0.15, -1.3, 0, '#f1f1f1')
    //5 Red
    addRoute(-0.4, 0.15, -1.6, 0, '#f1f1f1')
    addRoute(0, 0.15, -1.6, 0, '#FF3535')
    addRoute(0.4, 0.15, -1.6, 0, '#f1f1f1')
    //6 Red
    addRoute(-0.4, 0.15, -1.9, 0, '#f1f1f1')
    addRoute(0, 0.15, -1.9, 0, '#f1f1f1')
    addRoute(0.4, 0.15, -1.9, 0, '#FF3535')

    //1 Yellow
    addRoute(-0.4, 0.15, 0.4, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, 0.4, Math.PI / 2, '#FDEB2E')
    addRoute(0.4, 0.15, 0.4, Math.PI / 2, '#f1f1f1')

    //2 Yellow
    addRoute(-0.4, 0.15, 0.7, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, 0.7, Math.PI / 2, '#FDEB2E')
    addRoute(0.4, 0.15, 0.7, Math.PI / 2, '#f1f1f1')
    //3 Yellow
    addRoute(-0.4, 0.15, 1, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, 1, Math.PI / 2, '#FDEB2E')
    addRoute(0.4, 0.15, 1, Math.PI / 2, '#f1f1f1')
    //4 Yellow
    addRoute(-0.4, 0.15, 1.3, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, 1.3, Math.PI / 2, '#FDEB2E')
    addRoute(0.4, 0.15, 1.3, Math.PI / 2, '#f1f1f1')
    //5 Yellow
    addRoute(-0.4, 0.15, 1.6, Math.PI / 2, '#f1f1f1')
    addRoute(0, 0.15, 1.6, Math.PI / 2, '#FDEB2E')
    addRoute(0.4, 0.15, 1.6, Math.PI / 2, '#f1f1f1')
    //6 Yellow
    addRoute(-0.4, 0.15, 1.9, Math.PI / 2, '#FDEB2E')
    addRoute(0, 0.15, 1.9, Math.PI / 2, '#f1f1f1')
    addRoute(0.4, 0.15, 1.9, Math.PI / 2, '#f1f1f1')


    //Winn
    addRoute(0, 0.15, 0, Math.PI / 2, '#32FF38')
    addRoute(0, 0.18, 0, Math.PI / 2, '#FDEB2E')
    addRoute(0, 0.21, 0, Math.PI / 2, '#FF3535')
    addRoute(0, 0.24, 0, Math.PI / 2, '#223FD8')
}

//FUNC DirectionalGame
const DirectionalGame = (x, y, z, pz, px, rx, rz) => {
    const direction = new THREE.Group();
    scene.add(direction);
    const pontaGeometry = new THREE.ConeGeometry(0.05, 0.2, 3);
    const pontaMaterial = new THREE.MeshBasicMaterial({ color: '#606060' });
    const ponta = new THREE.Mesh(pontaGeometry, pontaMaterial);
    ponta.position.set(0 + px, 0.2, 0 + pz)
    ponta.rotation.x = rx
    ponta.rotation.z = rz

    const corpoGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 32);
    const corpoMaterial = new THREE.MeshBasicMaterial({ color: '#606060' });
    const corpo = new THREE.Mesh(corpoGeometry, corpoMaterial);
    corpo.castShadow = true;
    corpo.receiveShadow = true;
    corpo.position.set(0, 0.2, 0)
    corpo.rotation.x = rx
    corpo.rotation.z = rz

    direction.position.set(x, y, z);
    direction.add(ponta, corpo)
}

//FUNC CallDirectionalGame
const CallDirectionalGames = () => {
    DirectionalGame(-0.6, 0, 1.9, -0.18, 0, - Math.PI / 2, 0);
    DirectionalGame(0.6, 0, -1.9, 0.18, 0, Math.PI / 2, 0);

    DirectionalGame(1.9, 0, 0.6, 0, -0.18, Math.PI / 2, Math.PI / 2);
    DirectionalGame(-1.9, 0, -0.6, 0, 0.18, - Math.PI / 2, - Math.PI / 2);
}

//Create Ground Cannon
const groundMaterial = new CANNON.Material({ friction: 0.6, restitution: 0.6 });

//FUNC Create Ground Scene
const createGround = () => {
    groundMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.1),
        new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.1;
    groundMesh.position.x = 4;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Chão físico para Cannon.js
    const groundShape = new CANNON.Plane();
    groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape,
        material: groundMaterial

    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, -0.01, 0), -Math.PI / 2);
    world.addBody(groundBody);
};

//Create Walls Cannon
const wallMaterial = new CANNON.Material({ friction: 0.1, restitution: 0.4 });

//Func Create Wall Scene
const createWall = (position, size) => {

    const wallMeshMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888, // Cor cinza
        transparent: true, // Habilita transparência
        opacity: 0.5 // Define o nível de transparência (0 completamente transparente, 1 completamente opaco)
    });

    // Mesh visual para a parede (Three.js)
    const wallMesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.width, size.height, size.depth),
        wallMeshMaterial
    );

    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    wallMesh.position.set(position.x, position.y, position.z);
    scene.add(wallMesh); // Adiciona a parede visual à cena

    // Corpo físico para a parede (Cannon.js)
    const wallShape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
    const wallBody = new CANNON.Body({
        mass: 0, // faz com que a parede seja estática
        shape: wallShape,
        material: wallMaterial
    });
    // Ajusta o centro de massa para coincidir com o mesh visual
    wallBody.position.set(position.x, position.y, position.z);
    world.addBody(wallBody); // Adiciona a parede física ao mundo físico

};

//FUNC CallCreateWalls Scenes
const callCreateWalls = () => {
    // Define o tamanho das paredes baseado na sua área de jogo
    const wallSize = {
        width: 0.1, // Largura das paredes (profundidade do cubo)
        height: 1, // Altura das paredes
        depth: 2, // Comprimento das paredes (iremos rodar para formar um quadrado)
    };

    // Adiciona paredes nos limites necessários
    createWall(new CANNON.Vec3(4, 0.4, -1.050), { ...wallSize, width: wallSize.depth, depth: wallSize.width }); // Parede direita
    createWall(new CANNON.Vec3(4, 0.4, 1.050), { ...wallSize, width: wallSize.depth, depth: wallSize.width }); // Parede esquerda
    createWall(new CANNON.Vec3(5, 0.4, 0), { ...wallSize }); // Parede de fundo
    createWall(new CANNON.Vec3(3, 0.4, 0), { ...wallSize }); // Parede da frente
};

//Create Dice Cannon
const diceMaterial = new CANNON.Material({ friction: 0.05, restitution: 0.7 });

//FUNC Create Dice Scene
const launchPosition = { x: 5, y: 3, z: 1 };
let initialRotationX;
let initialRotationZ;
const createDice = () => {
    const size = 0.3;
    const diceMeshGeometry = new THREE.BoxGeometry(size, size, size);

    const diceMeshMaterial = textures.map((texture, index) => {
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            specular: 0x222222,
            shininess: 25,
        });
        material.name = `diceMaterial_${index}`; // Nomeia o material
        return material;
    });

    diceMesh = new THREE.Mesh(diceMeshGeometry, diceMeshMaterial);
    diceMesh.castShadow = true;
    diceMesh.receiveShadow = true;
    diceMesh.position.set(4, 0, 4)

    scene.add(diceMesh); // Adiciona o dado visual à cena do Three.js

    // Material e corpo físico do dado em Cannon.js
    const diceShape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    diceBody = new CANNON.Body({
        mass: 1, // A massa pode ser ajustada conforme necessário
        material: diceMaterial,
        shape: diceShape,
    });

    diceBody.world = world; // Set the world property on the diceBody object

    initialRotationX = diceMesh.rotation.x;
    initialRotationZ = diceMesh.rotation.z;
    // Posição de lançamento inicial do dado
    diceBody.position.set(launchPosition.x, launchPosition.y, launchPosition.z);

    diceBody.velocity.set(0, 0, 0);
    diceBody.angularVelocity.set(0, 0, 0);

    // Configuramos o dado em repouso
    diceBody.sleep();
    // Adiciona o dado físico ao mundo físico
    world.addBody(diceBody);
};

//FUNC Definition Contact Dice
const contactDice = () => {

    // Definição do contato entre o dado e o chão
    const diceGroundContactMaterial = new CANNON.ContactMaterial(
        diceMaterial,
        groundMaterial,
        {
            friction: 0.6,    // Mantém a fricção um pouco mais alta para controle
            restitution: 0.7  // Alta restituição para um bom quique
        }
    );
    world.addContactMaterial(diceGroundContactMaterial);

    // Definição do contato entre o dado e as paredes
    const diceWallContactMaterial = new CANNON.ContactMaterial(
        diceMaterial,
        wallMaterial,
        {
            friction: 0.05,   // Baixa fricção para deslizar mais
            restitution: 0.6  // Restituição moderada para quique nas paredes
        }
    );
    world.addContactMaterial(diceWallContactMaterial);

};


//FUNC Create Pinos
const createPino = (x, y, z, color) => {
    // Create the body of the pino
    const bodyGeometry = new THREE.CylinderGeometry(0.03, 0.1, 0.2, 32);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.set(x, y, z);

    // Create the base of the pino
    const baseGeometry = new THREE.CircleGeometry(0.1 + 0.01, 30);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: color });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    const halfPi = - Math.PI / 2;
    base.rotation.x = halfPi;
    base.position.set(x, y - 0.09, z);

    // Create the head of the pino
    const headGeometry = new THREE.SphereGeometry(0.07, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({ color: color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    head.position.set(x, y + 0.13, z);

    // Group the parts to form the complete pino
    const pino = new THREE.Group();
    pino.add(body, head, base);

    return { pino, body, head, base }
}

//Obj Posicoes Iniciais dos Pinos (Na Base)
const posicoesIniciais = {
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

//Func CallPinos and CreatePinos nas Posicoes Iniciais
const CallPinos = () => {
    // Defina as cores associadas a cada grupo
    const cores = {
        'Azul': '#223FD8',
        'Verde': '#32FF38',
        'Amarelo': '#FDEB2E',
        'Vermelho': '#FF3535'
    };

    // Itera por cada pino no objeto de posições iniciais
    Object.keys(posicoesIniciais).forEach(nomePino => {
        let cor = nomePino.replace(/[0-9]/g, '').replace('Pino', ''); // Extrai o nome da cor
        let posicao = posicoesIniciais[nomePino]; // Acessa o Vector3 para a posição
        let corPino = cores[cor]; // Acessa a cor do pino

        // Cria e armazena o pino utilizando os valores de posição do Vector3 e a cor
        pinos[nomePino] = createPino(posicao.x, posicao.y, posicao.z, corPino);
    });

    // Adiciona os pinos criados à cena
    Object.values(pinos).forEach(pino => {
        scene.add(pino.pino);
    });
}

//LIGHTS
const lightsFunc = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2)
    scene.add(ambientLight)
    gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    light.castShadow = true;
    light.receiveShadow = true;
    scene.add(light);


    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.camera.left = - 7
    directionalLight.shadow.camera.top = 7
    directionalLight.shadow.camera.right = 7
    directionalLight.shadow.camera.bottom = - 7
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const directionalLightFolder = gui.addFolder('Directional Light');
    directionalLightFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.01).name('Intensity');
    directionalLightFolder.add(directionalLight.position, 'x').min(-10).max(10).step(0.01).name('Position X');
    directionalLightFolder.add(directionalLight.position, 'y').min(-10).max(10).step(0.01).name('Position Y');
    directionalLightFolder.add(directionalLight.position, 'z').min(-10).max(10).step(0.01).name('Position Z');
    directionalLightFolder.addColor(directionalLight, 'color').name('Color');
    directionalLightFolder.close();

    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 50);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);

    const pointLight1Folder = gui.addFolder('Point Light 1');
    pointLight1Folder.add(pointLight1, 'intensity').min(0).max(10).step(0.01).name('Intensity');
    pointLight1Folder.add(pointLight1.position, 'x').min(-10).max(10).step(0.01).name('Position X');
    pointLight1Folder.add(pointLight1.position, 'y').min(-10).max(10).step(0.01).name('Position Y');
    pointLight1Folder.add(pointLight1.position, 'z').min(-10).max(10).step(0.01).name('Position Z');
    pointLight1Folder.addColor(pointLight1, 'color').name('Color');
    pointLight1Folder.close();

    // Ambient Light Soft GUI Controls
    const ambientLightSoft = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLightSoft);

    const ambientLightFolder = gui.addFolder('Ambient Light');
    ambientLightFolder.add(ambientLightSoft, 'intensity').min(0).max(10).step(0.1).name('Intensity');
    ambientLightFolder.addColor(ambientLightSoft, 'color').name('Color');
    ambientLightFolder.close();

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 5, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.castShadow = true;
    scene.add(spotLight);

    const spotLightFolder = gui.addFolder('Spot Light');
    spotLightFolder.add(spotLight, 'intensity').min(0).max(10).step(0.1).name('Intensity');
    spotLightFolder.add(spotLight.position, 'x').min(-10).max(10).step(0.1).name('Position X');
    spotLightFolder.add(spotLight.position, 'y').min(-10).max(10).step(0.1).name('Position Y');
    spotLightFolder.add(spotLight.position, 'z').min(-10).max(10).step(0.1).name('Position Z');
    spotLightFolder.addColor(spotLight, 'color').name('Color');
    spotLightFolder.close();
}

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})


// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 3, 8)
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true


//Renderer

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor('#9b9b9b');
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//FLOOR
Floor();
//Call Add Borders
callAddBorders();

//Plane Below Floor
planeBelowFloor();

//Call Circle Base
callCircleBase();

//Call Routes
CallRoutes();

//Call DirectionalGames
CallDirectionalGames();

//Call createGround
createGround();

//Call callCreateWall
callCreateWalls();

//Call contactDice
contactDice();

//Call createDice
createDice();

//Call Pinos
CallPinos();

//Call Lights
lightsFunc();


//LOGIC GAMES Ludo

//FUNC MoverPinoLentamente
const moverPinoLentamente = (pino, novaPosicao, duracao, corAtual) => {
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

            cancelAnimationFrame(animacaoId);
            return;
        }

        pino.body.position.add(incrementoPorFrame);
        pino.head.position.add(incrementoPorFrame);
        pino.base.position.add(incrementoPorFrame);
        pino.pino.rotation.y += incrementoRotacaoPorFrame;

        tempoDecorrido += 1000 / 60;


        animacaoId = requestAnimationFrame(atualizarPosicao);

    };
    animacaoId = requestAnimationFrame(atualizarPosicao);
};

//FUNC Ordem das Etapas dos Times
const proximaEtapa = (etapaAtual, cor) => {
    const ordemEtapas = {
        Azul: ['blue0', 'blue', 'green', 'green2', 'green3', 'red', 'red2', 'red3', 'yellow', 'yellow2', 'yellow3', 'blue3', 'blue2', 'blue4', 'winn'],
        Verde: ['green0', 'green3', 'red', 'red2', 'red3', 'yellow', 'yellow2', 'yellow3', 'blue3', 'blue2', 'blue0', 'blue', 'green', 'green4', 'winn'],
        Vermelho: ['red0', 'red3', 'yellow', 'yellow2', 'yellow3', 'blue3', 'blue2', 'blue0', 'blue', 'green', 'green2', 'green3', 'red', 'red4', 'winn'],
        Amarelo: ['yellow0', 'yellow3', 'blue3', 'blue2', 'blue0', 'blue', 'green', 'green2', 'green3', 'red', 'red2', 'red3', 'yellow', 'yellow4', 'winn']
    };

    const index = ordemEtapas[cor].indexOf(etapaAtual);
    return ordemEtapas[cor][(index + 1) % ordemEtapas[cor].length];
};

//FUNC CurrentTrajetory
const currentTrajetory = (cor, selectedPin, callback) => {
    const indicePosicaoAtual = posicoesDosPinos[cor][`pino${selectedPin}`];
    const proximaPosicao = trajetorysPinos[indicePosicaoAtual.etapa][indicePosicaoAtual.indice];
    const pino = pinos[`Pino${cor}${selectedPin}`];

    moverPinoLentamente(pino, proximaPosicao, 500, indicePosicaoAtual.etapa);
    indicePosicaoAtual.indice++;

    if (indicePosicaoAtual.indice % trajetorysPinos[indicePosicaoAtual.etapa].length === 0) {
        indicePosicaoAtual.indice = 0;
        indicePosicaoAtual.etapa = proximaEtapa(indicePosicaoAtual.etapa, cor);
    }

    setTimeout(() => {
        if (callback && typeof callback === 'function') {
            callback();
        }
    }, 700);
};

//FUNC movePinSteps
const movePinSteps = (passos, currentIndex = 0, onComplete, player, selectedPin) => {
    if (passos > 0) {
        // Chame a função de movimento passando a cor do jogador e o pino selecionado
        currentTrajetory(player, selectedPin, () => {
            movePinSteps(passos - 1, currentIndex + 1, onComplete, player, selectedPin);
        });
    } else {
        // Todos os passos foram dados, chamar onComplete se existir
        if (typeof onComplete === 'function') {
            onComplete();
        }
    }
};

//Func RollDice
const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
}

const rollDice = () => {
    if (!isDiceRolling) {
        // Ative o dado e aplique uma força inicial e uma rotação
        diceBody.wakeUp();
        diceBody.velocity.set(-1, -3, -1); // Aumentar a velocidade em todos os eixos
        // Gerar rotação angular aleatória
        const angularVelocityX = randomInRange(-30, 30); // Gira em torno do eixo X
        const angularVelocityY = randomInRange(-30, 30); // Gira em torno do eixo Y
        const angularVelocityZ = randomInRange(-30, 30); // Gira em torno do eixo Z
        diceBody.angularVelocity.set(angularVelocityX, angularVelocityY, angularVelocityZ);
        isDiceRolling = true;

    }
};


//Roll Dice Button
const rollDiceButton = () => {
    document.getElementById('rollDiceButton').addEventListener('click', rollDice);
}
rollDiceButton();

const initGame = () => {

    for (let i = players.length - 1; i > 0; i--) {
        // Gera um índice aleatório
        const j = Math.floor(Math.random() * (i + 1));
        // Troca os elementos
        [players[i], players[j]] = [players[j], players[i]];
    }

    // Cria estado para cada cor
    players.forEach((cor) => {
        estadoJogadores[cor] = {
            pinos: [1, 2, 3, 4],
            pinoSelecionado: null
        };
    });

    console.log(`Jogador ${players[0]} ira começar`)
    console.log(`E os proximos Jogadores sao: ${players[1]}, ${players[2]}, ${players[3]}`);
    return players;
}

//InitGame Button
const InitGameButton = () => {
    document.getElementById('init-game').addEventListener('click', initGame);
}
InitGameButton();

const pinosButton = {
    'pino1': document.getElementById('pino-1'),
    'pino2': document.getElementById('pino-2'),
    'pino3': document.getElementById('pino-3'),
    'pino4': document.getElementById('pino-4')
};

const aguardarEscolhaPino = () => {
    esperandoEscolhaNovoPino = true;
    console.log(`${players[currentPlayerIndex]} escolha um pino para se mover.`);
};

//Escolher Pino para Iniciar
const definirPino = (cor, pino) => {
    if (estadoJogadores[cor] && estadoJogadores[cor].pinos.includes(pino)) {
        estadoJogadores[cor].pinoSelecionado = pino;
        console.log(`Jogador da cor ${cor} selecionou o pino ${pino}.`);
        console.log(`Jogador da cor ${cor} pode rodar o dado novamente.`);
    } else {
        console.log(`O pino ${pino} não é uma escolha válida para o jogador da cor ${cor}.`);
    }
}

//determinarNovoIndice
const determinarNovoIndice = (numeroDoPino) => {
    switch (numeroDoPino) {
        case 'pino1': return 0;
        case 'pino2': return 1;
        case 'pino3': return 2;
        case 'pino4': return 3;
        default: return 0; // Padrão, caso seja um valor não esperado
    }
}

//atualizarPosicaoDoPino
const atualizarPosicaoDoPino = (cor, pino, numeroDoPino, novaEtapa) => {
    const novoIndice = determinarNovoIndice(numeroDoPino);
    posicoesDosPinos[cor][pino].indice = novoIndice;
    posicoesDosPinos[cor][pino].etapa = novaEtapa;
}
//verificarSobreposicaoDeCores
const verificarSobreposicaoDeCores = (data) => {
    // Primeiro, criaremos um mapa para rastrear todas as combinações de índice e etapa.
    const mapa = new Map();
    const etapasIgnoradas = new Set(['blue0', 'red0', 'green0', 'yellow0']);

    for (const cor in data) {
        for (const pino in data[cor]) {
            const { indice, etapa } = data[cor][pino];
            // Continuar somente se o índice for diferente de zero.
            if (!etapasIgnoradas.has(etapa)) {
                const chave = `${indice}-${etapa}`;

                // Se a chave já existe e a cor anterior é diferente da cor atual, houve sobreposição.
                if (mapa.has(chave) && mapa.get(chave).cor !== cor) {
                    return {
                        encontrou: true,
                        detalhes: {
                            corOriginal: mapa.get(chave).cor,
                            corSobreposta: cor,
                            pinoSobreposto: pino,
                            indice,
                            etapa
                        },
                    };
                }

                // Guardar a combinação de índice e etapa com a respectiva cor.
                mapa.set(chave, { cor, indice });
            }
        }
    }

    // Se chegarmos até aqui, significa que não houve sobreposição.
    return { encontrou: false };
}
//esperandoEscolhaPino
const esperandoEscolhaPino = (numeroPino, topFaceIndex) => {
    if (esperandoEscolhaNovoPino) {
        esperandoEscolhaNovoPino = false;
        definirPino(players[currentPlayerIndex], numeroPino);
        topFaceIndex = 1;
        if (!posicoesDosPinos[players[currentPlayerIndex]][`pino${numeroPino}`].indice) {
            movePinSteps(topFaceIndex, 0, () => { }, players[currentPlayerIndex], numeroPino);
            console.log(`${players[currentPlayerIndex]} pode lançar o dado novamente.`);
        }
    }
    if (esperandoEscolhaMoverPinoAtual) {
        firstSuccessRoll[players[currentPlayerIndex]].forEach((sucesso, indice) => {
            if (sucesso) {
                contagemVerdadeiros++;
                nomeDoPino.push(`pino${indice + 1}`);
                indicesVerdadeiros.push(indice + 1);
            }
        });
        if (indicesVerdadeiros > 1) {
            console.log(`Voce pode escolher entre mover os pinos ${nomeDoPino}`)
            //Mudar o pinoParaMover, para o valor do pino escolhido para mover
        }
        movePinSteps(topFaceIndex, 0, () => {
            const sobreposicao = verificarSobreposicaoDeCores(posicoesDosPinos);
            if (sobreposicao.encontrou) {
                console.log(`Sobreposição encontrada: ${JSON.stringify(sobreposicao.detalhes)}`);
                const pinoSelecionado = sobreposicao.detalhes.pinoSobreposto;
                const numeroDoPino = sobreposicao.detalhes.pinoSobreposto.replace(/[^\d]/g, '');
                const corCapitalizada = sobreposicao.detalhes.corSobreposta.charAt(0).toUpperCase() + sobreposicao.detalhes.corSobreposta.slice(1).toLowerCase();
                const pinoSobreposto = `Pino${corCapitalizada}${numeroDoPino}`;
                const posicaoInicial = posicoesIniciais[pinoSobreposto];
                const pino = pinos[pinoSobreposto];

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
                atualizarPosicaoDoPino(corCapitalizada, pinoSelecionado, numeroDoPino, novaEtapa);
                moverPinoLentamente(pino, posicaoInicial, 500, corCapitalizada);
                console.log(pinoSelecionado);
                firstSuccessRoll[cor].forEach((sucesso, indice) => {
                    if (sucesso) {
                        contagemVerdadeiros++;
                        indicesVerdadeiros.push(indice + 1);
                    }
                });
                if (contagemVerdadeiros > 1) {
                    console.log(`Índices com 'true' para a cor ${cor}:`, indicesVerdadeiros);
                    pinosRestantes = indicesVerdadeiros.filter(pino => pino !== pinoSelecionado);
                    estadoJogadores[corAtualJogador].pinoSelecionado = pinosRestantes;
                }
                else {
                    estadoJogadores[corAtualJogador].pinoSelecionado = null;
                }
            } else {
                console.log('Nenhuma sobreposição encontrada');
            }
        }, players[currentPlayerIndex], numeroPino);
    }
};


pinosButton.pino1.addEventListener('click', () => esperandoEscolhaPino(1));
pinosButton.pino2.addEventListener('click', () => esperandoEscolhaPino(2));
pinosButton.pino3.addEventListener('click', () => esperandoEscolhaPino(3));
pinosButton.pino4.addEventListener('click', () => esperandoEscolhaPino(4));

//continueGame
const continueGame = (topFaceIndex) => {
    if (movePinBool) {
        movePinBool = false;
        esperandoEscolhaMoverPinoAtual = true;
        const corAtualJogador = players[currentPlayerIndex]; // "Azul", "Amarelo", etc.
        const pinoParaMover = estadoJogadores[corAtualJogador].pinoSelecionado;
        if (pinoParaMover !== null) {
            esperandoEscolhaPino(pinoParaMover, topFaceIndex)
        } else {
            console.log(`Jogador da cor ${corAtualJogador} precisa selecionar um pino.`);
            // Instrua o jogador a selecionar um pino antes de prosseguir
        }
    }
}
//newPinFunc
const newPinFunc = () => {
    if (!newPinBool && !movePinBool) { // Evita múltiplas entradas
        newPinBool = true;
        console.log("O jogador escolheu adicionar um novo pino.");
        aguardarEscolhaPino();
        continueGame(); // Continua o jogo baseado na escolha
    }
}

const movePin = document.getElementById('movePin');
movePin.addEventListener('click', () => {
    if (esperandoDecisaoUsuario) {
        esperandoDecisaoUsuario = false;

        const corAtualJogador = players[currentPlayerIndex]; // "Azul", "Amarelo", etc.
        const pinoParaMover = estadoJogadores[corAtualJogador].pinoSelecionado;
        firstSuccessRoll[corAtualJogador].forEach((sucesso, indice) => {
            if (sucesso) {
                contagemVerdadeiros++;
                nomeDoPino.push(`pino${indice + 1}`);
                indicesVerdadeiros.push(indice + 1);
            }
        });
        if (indicesVerdadeiros > 1) {
            console.log(`Voce pode escolher entre mover os pinos ${nomeDoPino}`)
            //Mudar o pinoParaMover, para o valor do pino escolhido para mover
        }
        topFaceIndex = localStorage.getItem('topFaceIndex');
        movePinSteps(topFaceIndex, 0, () => {
            const sobreposicao = verificarSobreposicaoDeCores(posicoesDosPinos);
            if (sobreposicao.encontrou) {
                console.log(`Sobreposição encontrada: ${JSON.stringify(sobreposicao.detalhes)}`);
                const pinoSelecionado = sobreposicao.detalhes.pinoSobreposto;
                const numeroDoPino = sobreposicao.detalhes.pinoSobreposto.replace(/[^\d]/g, '');
                const corCapitalizada = sobreposicao.detalhes.corSobreposta.charAt(0).toUpperCase() + sobreposicao.detalhes.corSobreposta.slice(1).toLowerCase();
                const pinoSobreposto = `Pino${corCapitalizada}${numeroDoPino}`;
                const posicaoInicial = posicoesIniciais[pinoSobreposto];
                const pino = pinos[pinoSobreposto];

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
                atualizarPosicaoDoPino(corCapitalizada, pinoSelecionado, numeroDoPino, novaEtapa);
                moverPinoLentamente(pino, posicaoInicial, 500, corCapitalizada);
                console.log(pinoSelecionado);
                firstSuccessRoll[corCapitalizada].forEach((sucesso, indice) => {
                    if (sucesso) {
                        contagemVerdadeiros++;
                        indicesVerdadeiros.push(indice + 1);
                    }
                });
                if (contagemVerdadeiros > 1) {
                    console.log(`Índices com 'true' para a cor ${cor}:`, indicesVerdadeiros);
                    pinosRestantes = indicesVerdadeiros.filter(pino => pino !== pinoSelecionado);
                }
                else {
                    estadoJogadores[corAtualJogador].pinoSelecionado = null;
                }
                movePinSteps(0, 0, () => { },)

            } else {
                console.log('Nenhuma sobreposição encontrada');
            }
        }, players[currentPlayerIndex], pinoParaMover); // Move o pino selecionado
    } else {
        console.log('Não é hora de mover um pino');
    }
});

const newPin = document.getElementById('newPin');
newPin.addEventListener('click', () => {
    if (esperandoDecisaoUsuario) {
        esperandoDecisaoUsuario = false;
        newPinFunc();
    } else {
        console.log('Não é hora de adicionar um novo pino');
    }
});

//mostrarOpcoesParaUsuario
const mostrarOpcoesParaUsuario = () => {

    // Exibe os botões, tornando-os clicáveis
    movePin.style.display = 'inline-block';
    newPin.style.display = 'inline-block';

    // Pode adicionar texto informativo ou alterar o texto do botão, se necessário
    movePin.innerText = 'Mover Pino Existente';
    newPin.innerText = 'Adicionar Novo Pino';

    // Pode adicionar classes CSS para estilizar os botões como ativos ou disponíveis para clique
    movePin.classList.add('active');
    newPin.classList.add('active');
};

// Função para lidar com o fim da rolagem do dado, ela deve ser chamada depois que o valor do topFaceIndex é conhecido
const handleDiceRollEnd = (topFaceIndex) => {
    if (localStorage.getItem('topFaceIndex') !== null) {
        // Se existe, removemos
        localStorage.removeItem('topFaceIndex');
        // E adicionamos o novo valor
        localStorage.setItem('topFaceIndex', topFaceIndex);
    } else {
        // Se não existe, simplesmente adicionamos o novo valor
        localStorage.setItem('topFaceIndex', topFaceIndex);
    }
    console.log(`${players[currentPlayerIndex]} rolou um ${topFaceIndex}`);

    if (topFaceIndex === 1 || topFaceIndex === 6) {
        if (!firstSuccessRoll[players[currentPlayerIndex]][currentPlayerIndex]) {
            esperandoEscolhaNovoPino = true;
            console.log(`${players[currentPlayerIndex]} vai começar, escolha o pino.`);
            firstSuccessRoll[players[currentPlayerIndex]][currentPlayerIndex] = true;
        }
        else {
            console.log(`${players[currentPlayerIndex]} pode mover algum dos pinos disponiveis ${topFaceIndex} casas ou introduzir um novo pino.`);
            esperandoDecisaoUsuario = true;
            mostrarOpcoesParaUsuario(topFaceIndex);
        }
    } else {
        if (firstSuccessRoll[players[currentPlayerIndex]][currentPlayerIndex]) {
            // Move a peça do jogador
            const corAtualJogador = players[currentPlayerIndex]; // "Azul", "Amarelo", etc.
            const pinoParaMover = estadoJogadores[corAtualJogador].pinoSelecionado;

            if (pinoParaMover !== null) {
                firstSuccessRoll[corAtualJogador].forEach((sucesso, indice) => {
                    if (sucesso) {
                        contagemVerdadeiros++;
                        nomeDoPino.push(`pino${indice + 1}`);
                        indicesVerdadeiros.push(indice + 1);
                    }
                });

                if (indicesVerdadeiros > 1) {
                    console.log(`Voce pode escolher entre mover os pinos ${nomeDoPino}`)
                    //Mudar o pinoParaMover, para o valor do pino escolhido para mover
                }
                movePinSteps(topFaceIndex, 0, () => {
                    const sobreposicao = verificarSobreposicaoDeCores(posicoesDosPinos);
                    if (sobreposicao.encontrou) {
                        console.log(`Sobreposição encontrada: ${JSON.stringify(sobreposicao.detalhes)}`);
                        const pinoSelecionado = sobreposicao.detalhes.pinoSobreposto;
                        const numeroDoPino = sobreposicao.detalhes.pinoSobreposto.replace(/[^\d]/g, '');
                        const corCapitalizada = sobreposicao.detalhes.corSobreposta.charAt(0).toUpperCase() + sobreposicao.detalhes.corSobreposta.slice(1).toLowerCase();
                        const pinoSobreposto = `Pino${corCapitalizada}${numeroDoPino}`;
                        const posicaoInicial = posicoesIniciais[pinoSobreposto];
                        const pino = pinos[pinoSobreposto];

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
                        atualizarPosicaoDoPino(corCapitalizada, pinoSelecionado, numeroDoPino, novaEtapa);
                        moverPinoLentamente(pino, posicaoInicial, 500, corCapitalizada);
                        console.log(pinoSelecionado);
                        firstSuccessRoll[corCapitalizada].forEach((sucesso, indice) => {
                            if (sucesso) {
                                contagemVerdadeiros++;
                                indicesVerdadeiros.push(indice + 1);
                            }
                        });
                        if (contagemVerdadeiros > 1) {
                            console.log(`Índices com 'true' para a cor ${cor}:`, indicesVerdadeiros);
                            pinosRestantes = indicesVerdadeiros.filter(pino => pino !== pinoSelecionado);
                            estadoJogadores[corAtualJogador].pinoSelecionado = pinosRestantes;
                        }
                        else {
                            estadoJogadores[corAtualJogador].pinoSelecionado = null;
                        }
                    } else {
                        console.log('Nenhuma sobreposição encontrada');

                    }
                }, corAtualJogador, pinoParaMover);
            }
        }
        else {
            console.log(`${players[currentPlayerIndex]} não pode se mover, pois ainda não teve um sucesso inicial.`);
        }
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        console.log(`Agora é a vez do jogador ${players[currentPlayerIndex]}.`);
    }
};
//resetDice
const resetDice = () => {
    // Coloca o dado de volta na posição inicial e zera a rotação
    diceBody.position.set(launchPosition.x, launchPosition.y, launchPosition.z);
    diceBody.quaternion.set(0, 0, 0, 1); // Reseta a rotação do dado

    // Interrompe o movimento do dado ao zerar velocidades
    diceBody.velocity.set(0, 0, 0);
    diceBody.angularVelocity.set(0, 0, 0);

    // Coloca o dado para "dormir" para que a simulação de física não o afete
    diceBody.sleep();

    // Atualizar o mesh do dado para corresponder à posição inicial do corpo físico
    diceMesh.position.copy(diceBody.position);
    diceMesh.quaternion.copy(diceBody.quaternion);

    // Marcar o dado como não rolando para que não seja atualizado no loop de animação
    isDiceRolling = false;
};

//faceNormals
const faceNormals = [
    new THREE.Vector3(0, 1, 0),  // Face superior
    new THREE.Vector3(0, -1, 0), // Face inferior
    new THREE.Vector3(1, 0, 0),  // Face da direita
    new THREE.Vector3(-1, 0, 0), // Face da esquerda
    new THREE.Vector3(0, 0, 1),  // Face da frente
    new THREE.Vector3(0, 0, -1)  // Face de trás
];
//determineTopFace
const determineTopFace = (diceMesh) => {
    const upVector = new THREE.Vector3(0, 1, 0); // Vector apontando para cima
    let maxDot = -Infinity;


    faceNormals.forEach((normal, index) => {
        const transformedNormal = normal.clone().applyQuaternion(diceMesh.quaternion);
        const dot = transformedNormal.dot(upVector);

        if (dot > maxDot) {
            maxDot = dot;
            topFaceIndex = index + 1;
            switch (index + 1) {
                case 3: topFaceIndex = 1; break;
                case 4: topFaceIndex = 2; break;
                case 1: topFaceIndex = 3; break;
                case 2: topFaceIndex = 4; break;
                case 5: topFaceIndex = 5; break;
                case 6: topFaceIndex = 6; break;
            }
        }
    });

    return topFaceIndex;
}
//tick
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update Mixer
    if (mixer !== null) {
        mixer.update(deltaTime);
    }


    if (isDiceRolling) {
        world.step(1 / 60);
        diceMesh.position.copy(diceBody.position);
        diceMesh.quaternion.copy(diceBody.quaternion);

        const angularVelocityThreshold = 0.05; // Ajuste conforme necessário
        const linearVelocityThreshold = 0.05;   // Ajuste conforme necessário

        // Verifica se a velocidade angular e linear estão abaixo dos limiares
        if (diceBody.angularVelocity.length() < angularVelocityThreshold && diceBody.velocity.length() < linearVelocityThreshold) {
            // Espera um certo intervalo de tempo antes de definir como parado, para garantir que o dado tenha assentado
            if (!diceSettlingTime) {
                diceSettlingTime = elapsedTime;  // Captura o tempo atual
            } else if (elapsedTime - diceSettlingTime > someSettlingDuration) {

                topFaceIndex = determineTopFace(diceMesh);
                handleDiceRollEnd(topFaceIndex);
                topFaceIndex = null; // Reset topFaceIndex após o manuseio
                isDiceRolling = false; // Marque o dado como não rolando
                diceSettlingTime = null; // Reseta o tempo de assentamento
                resetDice();
            }
        }
    }

    // Update controls
    controls.update();


    // Renderiza a cena
    renderer.render(scene, camera)

    // Chama o próximo frame
    window.requestAnimationFrame(tick)
};
tick();

