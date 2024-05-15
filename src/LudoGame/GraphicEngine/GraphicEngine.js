import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'


class GraphicEngine {
    constructor(configs) {
        this.configs = configs;
        this.scene = new THREE.Scene();
        this.fontLoader = new FontLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.gui = new GUI();
        this.canvas = document.querySelector('canvas.webgl')
        this.textures = [
            this.textureLoader.load('textures/img/1.jpg'),
            this.textureLoader.load('textures/img/2.jpg'),
            this.textureLoader.load('textures/img/3.jpg'),
            this.textureLoader.load('textures/img/4.jpg'),
            this.textureLoader.load('textures/img/5.jpg'),
            this.textureLoader.load('textures/img/6.jpg')
        ];
        this.matcapTexture = this.textureLoader.load('../textures/matcaps/6.png');
        this.aoTexture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_AO_2K.jpg');
        this.bumpTexture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_BUMP_2K.jpg');
        this.colVar1Texture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_COL_VAR1_2K.jpg');
        this.colVar2Texture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_COL_VAR2_2K.jpg');
        this.colVar3Texture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_COL_VAR3_2K.jpg');
        this.disp16Texture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_DISP16_2K.tif');
        this.glossTexture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_GLOSS_2K.jpg');
        this.nrmTexture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_NRM_2K.jpg');
        this.reflTexture = this.textureLoader.load('../textures/floor/FloorBlack/FabricLeatherCowhide001_REFL_2K.jpg');
        this.camera = new THREE.PerspectiveCamera(75, this.configs.sizes.width / this.configs.sizes.height, 0.1, 100)
        this.camera.position.set(this.configs.x, this.configs.y, this.configs.z)
        this.scene.add(this.camera)
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enablePan = true;
        this.controls.target.set(this.configs.x, 0, 0);

        this.controls.panSpeed = 1.0;
        this.controls.screenSpacePanning = false;
        this.controls.enableDamping = true
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas, antialias: true

        })
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setSize(this.configs.sizes.width, this.configs.sizes.height)
        this.renderer.setClearColor('#87CEEB');
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        window.addEventListener('resize', () => {
            this.configs.sizes.width = window.innerWidth;
            this.configs.sizes.height = window.innerHeight;

            this.camera.aspect = this.configs.sizes.width / this.configs.sizes.height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.configs.sizes.width, this.configs.sizes.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    InitLudo() {
        this.Floor();
        this.callAddBorders();
        this.planeBelowFloor();
        this.callCircleBase();
        this.callRoutes();
        this.callDirectionalGames();
        this.createGroundMesh();
        this.createDice();
        this.CallPinos();
        this.lightsFunc();

    }
    //Preferida: 1: FFA07A, 2: E0FFFF, 3: FF6347, 4: F4A460, 
    Floor = () => {
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
            new THREE.MeshStandardMaterial({ map: this.colVar1Texture, color: '#f4a460' }), // Material para o lado esquerdo
            new THREE.MeshStandardMaterial({ map: this.colVar2Texture, color: '#f4a460' }), // Material para o lado direito
            new THREE.MeshStandardMaterial({ map: this.aoTexture, color: '#f4a460' }), // Material para o fundo
            new THREE.MeshStandardMaterial({ map: this.colVar3Texture, color: '#f4a460' }), // Material para o frente
            new THREE.MeshStandardMaterial({
                map: this.bumpTexture,
                normalMap: this.nrmTexture,
                displacementMap: this.disp16Texture,
                displacementScale: 1,
                roughnessMap: this.glossTexture,
                envMap: this.reflTexture,
                color: '#32CD32'
            }), // Material para a topo
            new THREE.MeshStandardMaterial({
                map: this.bumpTexture,
                normalMap: this.nrmTexture,
                displacementMap: this.disp16Texture,
                displacementScale: 0.05,
                roughnessMap: this.glossTexture,
                envMap: this.reflTexture,
                color: '#f4a460'
            }), // Material para a parte de baixo
        ];

        const belowFloor = new THREE.Mesh(belowFloorGeometry, belowFloorMaterials)
        belowFloor.position.y = -0.3
        belowFloor.receiveShadow = true
        belowFloor.castShadow = true;
        belowFloor.rotation.x = - Math.PI * 0.5
        this.scene.add(floor, belowFloor);
    }

    addBorder = (x, y, z, width, height, rz) => {
        const borderGeometry = new THREE.PlaneGeometry(width, height);
        const borderMaterial = new THREE.MeshMatcapMaterial({ color: 0x000000 });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.receiveShadow = true
        border.castShadow = true;
        border.position.set(x, y, z);
        border.rotation.x = - Math.PI * 0.5;
        border.rotation.z = rz;
        this.scene.add(border);
    }

    callAddBorders = () => {
        this.addBorder(-2.3, 0.15, 0, 0.03, 4.5, 0)
        this.addBorder(2.3, 0.15, 0, 0.03, 4.5, 0)
        this.addBorder(0, 0.15, 2.25, 0.03, 4.63, Math.PI / 2)
        this.addBorder(0, 0.15, -2.25, 0.03, 4.63, Math.PI / 2)
    }

    planeBelowFloor = () => {
        const planeBelowFloorGeometry = new THREE.BoxGeometry(5.2, 5.2, 0.05);
        const planeBelowFloorMaterial = new THREE.MeshMatcapMaterial({ color: 0x444444 });
        const planeBelowFloor = new THREE.Mesh(planeBelowFloorGeometry, planeBelowFloorMaterial);
        planeBelowFloor.receiveShadow = true
        planeBelowFloor.castShadow = true;
        planeBelowFloor.position.set(0, -0.13, 0);
        planeBelowFloor.rotation.x = - Math.PI * 0.5;
        this.scene.add(planeBelowFloor)
    }

    addCircleBase = (x, y, z, radius, segment, rz, color) => {
        const circleGroup = new THREE.Group();
        this.scene.add(circleGroup);
        const CircleGeometry = new THREE.CircleGeometry(radius, segment);
        const circleMaterial = new THREE.MeshMatcapMaterial({ color: color });
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

    callCircleBase = () => {
        this.addCircleBase(-2, 0, 1.5, 0.15, 30, 0, '#223FD8')
        this.addCircleBase(1.5, 0, 1.5, 0.15, 30, 0, '#FDEB2E')
        this.addCircleBase(1.5, 0, -1.9, 0.15, 30, 0, '#FF3535')
        this.addCircleBase(-2, 0, -1.9, 0.15, 30, 0, '#32FF38')
    }

    addRoute = (x, y, z, rz, color) => {
        const planeGroup = new THREE.Group();
        this.scene.add(planeGroup);
        const planeGeometry = new THREE.PlaneGeometry(0.2, 0.2);
        const planeMaterial = new THREE.MeshMatcapMaterial({ color: color });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true
        plane.castShadow = true;
        plane.position.set(x, y, z);
        plane.rotation.x = - Math.PI * 0.5;
        plane.rotation.z = rz;


        const BorderGeometry = new THREE.PlaneGeometry(0.22, 0.22);
        const BorderMaterial = new THREE.MeshMatcapMaterial({ color: '#000000' });
        const border = new THREE.Mesh(BorderGeometry, BorderMaterial);

        border.receiveShadow = true
        border.castShadow = true;
        border.position.set(x, y - 0.01, z);
        border.rotation.x = - Math.PI * 0.5;
        border.rotation.z = rz;

        planeGroup.rotation.y = rz;

        planeGroup.add(plane, border);
    }

    callRoutes = () => {
        //1 Blue
        this.addRoute(-0.4, 0.15, 1.9, 0, '#223FD8')
        this.addRoute(0, 0.15, 1.9, 0, '#f1f1f1')
        this.addRoute(0.4, 0.15, 1.9, 0, '#f1f1f1')
        //2 Blue
        this.addRoute(-0.4, 0.15, 1.6, 0, '#f1f1f1')
        this.addRoute(0, 0.15, 1.6, 0, '#223FD8')
        this.addRoute(0.4, 0.15, 1.6, 0, '#f1f1f1')

        //3 Blue
        this.addRoute(-0.4, 0.15, 1.3, 0, '#f1f1f1')
        this.addRoute(0, 0.15, 1.3, 0, '#223FD8')
        this.addRoute(0.4, 0.15, 1.3, 0, '#f1f1f1')

        //4 Blue
        this.addRoute(-0.4, 0.15, 1, 0, '#f1f1f1')
        this.addRoute(0, 0.15, 1, 0, '#223FD8')
        this.addRoute(0.4, 0.15, 1, 0, '#f1f1f1')
        //5 Blue
        this.addRoute(-0.4, 0.15, 0.7, 0, '#f1f1f1')
        this.addRoute(0, 0.15, 0.7, 0, '#223FD8')
        this.addRoute(0.4, 0.15, 0.7, 0, '#f1f1f1')
        //6 Blue
        this.addRoute(-0.4, 0.15, 0.4, 0, '#f1f1f1')
        this.addRoute(0, 0.15, 0.4, 0, '#223FD8')
        this.addRoute(0.4, 0.15, 0.4, 0, '#f1f1f1')

        //1 Green
        this.addRoute(-0.4, 0.15, -0.4, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, -0.4, Math.PI / 2, '#32FF38')
        this.addRoute(0.4, 0.15, -0.4, Math.PI / 2, '#f1f1f1')

        //2 Green
        this.addRoute(-0.4, 0.15, -0.7, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, -0.7, Math.PI / 2, '#32FF38')
        this.addRoute(0.4, 0.15, -0.7, Math.PI / 2, '#f1f1f1')
        //3 Green
        this.addRoute(-0.4, 0.15, -1, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, -1, Math.PI / 2, '#32FF38')
        this.addRoute(0.4, 0.15, -1, Math.PI / 2, '#f1f1f1')
        //4 Green
        this.addRoute(-0.4, 0.15, -1.3, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, -1.3, Math.PI / 2, '#32FF38')
        this.addRoute(0.4, 0.15, -1.3, Math.PI / 2, '#f1f1f1')
        //5 Green
        this.addRoute(-0.4, 0.15, -1.6, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, -1.6, Math.PI / 2, '#32FF38')
        this.addRoute(0.4, 0.15, -1.6, Math.PI / 2, '#f1f1f1')
        //6 Green
        this.addRoute(-0.4, 0.15, -1.9, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, -1.9, Math.PI / 2, '#f1f1f1')
        this.addRoute(0.4, 0.15, -1.9, Math.PI / 2, '#32FF38')

        //1 Red
        this.addRoute(-0.4, 0.15, -0.4, 0, '#f1f1f1')
        this.addRoute(0, 0.15, -0.4, 0, '#FF3535')
        this.addRoute(0.4, 0.15, -0.4, 0, '#f1f1f1')

        //2 Red
        this.addRoute(-0.4, 0.15, -0.7, 0, '#f1f1f1')
        this.addRoute(0, 0.15, -0.7, 0, '#FF3535')
        this.addRoute(0.4, 0.15, -0.7, 0, '#f1f1f1')
        //3 Red
        this.addRoute(-0.4, 0.15, -1, 0, '#f1f1f1')
        this.addRoute(0, 0.15, -1, 0, '#FF3535')
        this.addRoute(0.4, 0.15, -1, 0, '#f1f1f1')
        //4 Red
        this.addRoute(-0.4, 0.15, -1.3, 0, '#f1f1f1')
        this.addRoute(0, 0.15, -1.3, 0, '#FF3535')
        this.addRoute(0.4, 0.15, -1.3, 0, '#f1f1f1')
        //5 Red
        this.addRoute(-0.4, 0.15, -1.6, 0, '#f1f1f1')
        this.addRoute(0, 0.15, -1.6, 0, '#FF3535')
        this.addRoute(0.4, 0.15, -1.6, 0, '#f1f1f1')
        //6 Red
        this.addRoute(-0.4, 0.15, -1.9, 0, '#f1f1f1')
        this.addRoute(0, 0.15, -1.9, 0, '#f1f1f1')
        this.addRoute(0.4, 0.15, -1.9, 0, '#FF3535')

        //1 Yellow
        this.addRoute(-0.4, 0.15, 0.4, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, 0.4, Math.PI / 2, '#FDEB2E')
        this.addRoute(0.4, 0.15, 0.4, Math.PI / 2, '#f1f1f1')

        //2 Yellow
        this.addRoute(-0.4, 0.15, 0.7, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, 0.7, Math.PI / 2, '#FDEB2E')
        this.addRoute(0.4, 0.15, 0.7, Math.PI / 2, '#f1f1f1')
        //3 Yellow
        this.addRoute(-0.4, 0.15, 1, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, 1, Math.PI / 2, '#FDEB2E')
        this.addRoute(0.4, 0.15, 1, Math.PI / 2, '#f1f1f1')
        //4 Yellow
        this.addRoute(-0.4, 0.15, 1.3, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, 1.3, Math.PI / 2, '#FDEB2E')
        this.addRoute(0.4, 0.15, 1.3, Math.PI / 2, '#f1f1f1')
        //5 Yellow
        this.addRoute(-0.4, 0.15, 1.6, Math.PI / 2, '#f1f1f1')
        this.addRoute(0, 0.15, 1.6, Math.PI / 2, '#FDEB2E')
        this.addRoute(0.4, 0.15, 1.6, Math.PI / 2, '#f1f1f1')
        //6 Yellow
        this.addRoute(-0.4, 0.15, 1.9, Math.PI / 2, '#FDEB2E')
        this.addRoute(0, 0.15, 1.9, Math.PI / 2, '#f1f1f1')
        this.addRoute(0.4, 0.15, 1.9, Math.PI / 2, '#f1f1f1')


        //Winn
        this.addRoute(0, 0.15, 0, Math.PI / 2, '#32FF38')
        this.addRoute(0, 0.18, 0, Math.PI / 2, '#FDEB2E')
        this.addRoute(0, 0.21, 0, Math.PI / 2, '#FF3535')
        this.addRoute(0, 0.24, 0, Math.PI / 2, '#223FD8')
    }

    directionalGame = (x, y, z, pz, px, rx, rz) => {
        const direction = new THREE.Group();
        this.scene.add(direction);
        const pontaGeometry = new THREE.ConeGeometry(0.05, 0.2, 3);
        const pontaMaterial = new THREE.MeshMatcapMaterial({ color: '#606060' });
        const ponta = new THREE.Mesh(pontaGeometry, pontaMaterial);
        ponta.position.set(0 + px, 0.2, 0 + pz)
        ponta.rotation.x = rx
        ponta.rotation.z = rz

        const corpoGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 32);
        const corpoMaterial = new THREE.MeshMatcapMaterial({ color: '#606060' });
        const corpo = new THREE.Mesh(corpoGeometry, corpoMaterial);
        corpo.castShadow = true;
        corpo.receiveShadow = true;
        corpo.position.set(0, 0.2, 0)
        corpo.rotation.x = rx
        corpo.rotation.z = rz

        direction.position.set(x, y, z);
        direction.add(ponta, corpo)
    }

    callDirectionalGames = () => {
        this.directionalGame(-0.6, 0, 1.9, -0.18, 0, - Math.PI / 2, 0);
        this.directionalGame(0.6, 0, -1.9, 0.18, 0, Math.PI / 2, 0);
        this.directionalGame(1.9, 0, 0.6, 0, -0.18, Math.PI / 2, Math.PI / 2);
        this.directionalGame(-1.9, 0, -0.6, 0, 0.18, - Math.PI / 2, - Math.PI / 2);
    }

    createGroundMesh() {
        const groundMesh = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 0.1),
            new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide })
        );
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -0.1;
        groundMesh.castShadow = true;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);
    }

    createWall = (position, size) => {
        const wallMeshMaterial = new THREE.MeshPhongMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.5
        });

        const wallMesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.width, size.height, size.depth),
            wallMeshMaterial
        );

        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;

        wallMesh.position.set(position.x, position.y, position.z);
        this.scene.add(wallMesh);
    };

    createDice = () => {
        const size = 0.3;
        const diceMeshGeometry = new THREE.BoxGeometry(size, size, size);

        const diceMeshMaterial = this.textures.map((texture, index) => {
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                specular: 0x222222,
                shininess: 25,
            });
            material.name = `diceMaterial_${index}`; // Nomeia o material
            return material;
        });

        this.configs.diceMesh = new THREE.Mesh(diceMeshGeometry, diceMeshMaterial);
        this.configs.diceMesh.castShadow = true;
        this.configs.diceMesh.receiveShadow = true;
        this.configs.diceMesh.position.set(4, 0, 4)

        this.scene.add(this.configs.diceMesh); // Adiciona o dado visual à cena do Three.js
    };

    createPino = (x, y, z, color) => {
        // Create the body of the pino
        const bodyGeometry = new THREE.CylinderGeometry(0.03, 0.1, 0.2, 32);
        const bodyMaterial = new THREE.MeshMatcapMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        body.position.set(x, y, z);

        // Create the base of the pino
        const baseGeometry = new THREE.CircleGeometry(0.1 + 0.01, 30);
        const baseMaterial = new THREE.MeshMatcapMaterial({ color: color });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        const halfPi = - Math.PI / 2;
        base.rotation.x = halfPi;
        base.position.set(x, y - 0.09, z);

        // Create the head of the pino
        const headGeometry = new THREE.SphereGeometry(0.07, 32, 32);
        const headMaterial = new THREE.MeshMatcapMaterial({ color: color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.castShadow = true;
        head.receiveShadow = true;
        head.position.set(x, y + 0.13, z);

        // Group the parts to form the complete pino
        const pino = new THREE.Group();
        pino.add(body, head, base);

        return { pino, body, head, base }
    }

    CallPinos = () => {
        // Itera por cada pino no objeto de posições iniciais
        Object.keys(this.configs.posicoesIniciais).forEach(nomePino => {
            let cor = nomePino.replace(/[0-9]/g, '').replace('Pino', ''); // Extrai o nome da cor
            let posicao = this.configs.posicoesIniciais[nomePino]; // Acessa o Vector3 para a posição
            let corPino = this.configs.colorsToPlayers[cor]; // Acessa a cor do pino

            // Cria e armazena o pino utilizando os valores de posição do Vector3 e a cor
            this.configs.pinos[nomePino] = this.createPino(posicao.x, posicao.y, posicao.z, corPino);
        });

        // Adiciona os pinos criados à cena
        Object.values(this.configs.pinos).forEach(pino => {
            this.scene.add(pino.pino);
        });
    }

    lightsFunc = () => {
        const ambientLight = new THREE.AmbientLight(0xffffff, 2)
        this.scene.add(ambientLight)
        const ambientLightFolder = this.gui.addFolder('Ambient Light');
        ambientLightFolder.add(ambientLight, 'intensity').min(0).max(3).step(0.001);
        ambientLightFolder.close();

        const light = new THREE.PointLight(0xffffff, 1);
        light.position.set(10, 10, 10);
        light.castShadow = true;
        light.receiveShadow = true;
        this.scene.add(light);


        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.set(1024, 1024)
        directionalLight.shadow.camera.near = 1; // Padrão é 0.5
        directionalLight.shadow.camera.far = 500
        directionalLight.shadow.camera.left = - 7
        directionalLight.shadow.camera.top = 7
        directionalLight.shadow.camera.right = 7
        directionalLight.shadow.camera.bottom = - 7
        directionalLight.position.set(5, 5, 5)
        this.scene.add(directionalLight)

        const directionalLightFolder = this.gui.addFolder('Directional Light');
        directionalLightFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.01).name('Intensity');
        directionalLightFolder.add(directionalLight.position, 'x').min(-10).max(10).step(0.01).name('Position X');
        directionalLightFolder.add(directionalLight.position, 'y').min(-10).max(10).step(0.01).name('Position Y');
        directionalLightFolder.add(directionalLight.position, 'z').min(-10).max(10).step(0.01).name('Position Z');
        directionalLightFolder.addColor(directionalLight, 'color').name('Color');
        directionalLightFolder.close();

    }
    displayNextText = () => {
        if (this.configs.textQueue.length > 0 && !this.configs.isTextBeingDisplayed) {
            this.configs.isTextBeingDisplayed = true;
            const { textFont, color, callback, secondCallback, x, y, z } = this.configs.textQueue[0];
            this.fontLoader.load(
                '../fonts/helvetiker_regular.typeface.json',
                (font) => {
                    const textGeometry = new TextGeometry(textFont, {
                        font: font,
                        size: 0.2, // Tamanho do texto
                        height: 0.05, // Espessura do texto
                        curveSegments: 15, // Quanto maior, mais suave serão as curvas
                        bevelEnabled: false, // Desabilita o bevel

                    });
                    textGeometry.computeBoundingBox();
                    textGeometry.center();

                    const material = new THREE.MeshMatcapMaterial({
                        color: color,
                        matcap: this.matcapTexture
                    });

                    const newTextObject = new THREE.Mesh(textGeometry, material);
                    newTextObject.position.set(x, y, z);



                    // Remove o texto antigo se presente
                    if (this.configs.textObject) {
                        this.scene.remove(this.configs.textObject);
                    }

                    this.configs.textObject = newTextObject;
                    this.scene.add(newTextObject);

                    // Remoção agendada do texto e continuação do processo
                    setTimeout(() => {
                        if (this.configs.textObject) {
                            this.scene.remove(this.configs.textObject);
                        }

                        this.configs.textQueue.shift();
                        this.configs.isTextBeingDisplayed = false;

                        if (callback && typeof callback === 'function') {
                            callback();
                        }

                        if (secondCallback && typeof secondCallback === 'function') {
                            secondCallback();
                        }

                        this.displayNextText();
                    }, 2000); // Tempo em milissegundos até que o próximo texto seja mostrado
                },
                undefined, // Opcional: callback de progresso
                (error) => {
                    console.error('Error while loading the font:', error);
                }
            );
        }
    };

    fonts = (textFont, color, callback, secondCallback, x, y, z) => {
        console.log(textFont, color);
        // Adiciona o novo texto à fila
        this.configs.textQueue.push({ textFont, color, callback, secondCallback, x, y, z });
        // Se não houver um texto sendo exibido, chama a função para exibir o próximo texto da fila
        if (!this.configs.isTextBeingDisplayed) {
            this.displayNextText();
        }
    };

}

export default GraphicEngine;
