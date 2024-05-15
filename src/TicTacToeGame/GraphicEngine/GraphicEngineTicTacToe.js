import * as THREE from 'three'
import sharedObjects from '../sharedObjects';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

class GraphicEngineTicTacToe {
    constructor(graphicEngine, configs) {
        this.configs = configs;
        this.graphicEngine = graphicEngine;
        this.borderRadius = 0.05;
        this.borderDepth = 0.05;
        this.crossWidth = 0.2;
        this.crossHeight = 1.5;
        this.crossDepth = 0.1;
        this.number = null;
        this.numberX = null;
        this.numberO = null;
        this.textMeshes = [];

    }
    // Métodos de inicialização e configuração
    init() {
        this.createBoard();
    }

    createBoard() {
        //Floor
        this.createFloor();
        //Borders
        this.addAllBorders();
        //Circle
        this.createCircleAtPosition('initialBase0', 1);
        this.createCircleAtPosition('initialBase0', 2);
        this.createCircleAtPosition('initialBase0', 3);
        //Cross
        this.createCrossAtPosition('initialBaseX', 1);
        this.createCrossAtPosition('initialBaseX', 2);
        this.createCrossAtPosition('initialBaseX', 3);
    }


    // Métodos de criação do jogo
    createFloor = () => {

        const width = 6;
        const height = 6;
        const radius = 0.25;

        const extrudeSettings = {
            depth: 0.2, // Profundidade fina
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        };

        const roundedRectShape = this.createRoundedRectShape(width, height, radius);

        const floorGeometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: '#A2E0FF' });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);

        floor.rotation.x = -Math.PI / 2; // Rotaciona para ficar como um piso
        floor.position.set(15, -0.3, 0); // Define a posição com compensação para a beirada estar em y=0
        floor.castShadow = true;
        floor.receiveShadow = true;

        const belowFloorGeometry = new THREE.BoxGeometry(10, 10, 0.2);
        const belowFloorMaterials = [
            new THREE.MeshStandardMaterial({ map: this.graphicEngine.colVar1Texture, color: '#f4a460' }), // Material para o lado esquerdo
            new THREE.MeshStandardMaterial({ map: this.graphicEngine.colVar2Texture, color: '#f4a460' }), // Material para o lado direito
            new THREE.MeshStandardMaterial({ map: this.graphicEngine.aoTexture, color: '#f4a460' }), // Material para o fundo
            new THREE.MeshStandardMaterial({ map: this.graphicEngine.colVar3Texture, color: '#f4a460' }), // Material para o frente
            new THREE.MeshStandardMaterial({
                map: this.graphicEngine.bumpTexture,
                normalMap: this.graphicEngine.nrmTexture,
                displacementMap: this.graphicEngine.disp16Texture,
                displacementScale: 1,
                roughnessMap: this.graphicEngine.glossTexture,
                envMap: this.graphicEngine.reflTexture,
                color: '#32CD32'
            }), // Material para a topo
            new THREE.MeshStandardMaterial({
                map: this.graphicEngine.bumpTexture,
                normalMap: this.graphicEngine.nrmTexture,
                displacementMap: this.graphicEngine.disp16Texture,
                displacementScale: 0.05,
                roughnessMap: this.graphicEngine.glossTexture,
                envMap: this.graphicEngine.reflTexture,
                color: '#f4a460'
            }), // Material para a parte de baixo
        ];

        const belowFloor = new THREE.Mesh(belowFloorGeometry, belowFloorMaterials)
        belowFloor.position.set(15, -0.45, 0)
        belowFloor.receiveShadow = true
        belowFloor.castShadow = true;
        belowFloor.rotation.x = - Math.PI * 0.5
        this.graphicEngine.scene.add(floor, belowFloor);
    }

    createBorder = (x, y, z, width, height, rz) => {
        const borderExtrudeSettings = {
            depth: this.borderDepth,
            bevelEnabled: true,
            bevelThickness: this.borderRadius,
            bevelSize: this.borderRadius,
            bevelSegments: 2
        };

        const borderShape = this.createRoundedBorderShape(width, height, this.borderRadius);
        const borderGeometry = new THREE.ExtrudeGeometry(borderShape, borderExtrudeSettings);
        const borderMaterial = new THREE.MeshMatcapMaterial({ color: "f1f1f1" });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);

        border.receiveShadow = true;
        border.castShadow = true;
        border.rotation.x = - Math.PI * 0.5;
        border.rotation.z = rz;
        border.position.set(x, y, z);

        this.graphicEngine.scene.add(border);
    }

    addAllBorders() {
        // Use a profundidade da borda como parte dos argumentos ao criar as bordas
        this.createBorder(16, -0.03, 0, this.borderDepth, 5.5, 0); // Lado comprido
        this.createBorder(14, -0.03, 0, this.borderDepth, 5.5, 0); // Lado comprido
        this.createBorder(15, -0.03, -1, this.borderDepth, 5.5, Math.PI / 2); // Lado curto
        this.createBorder(15, -0.03, 1, this.borderDepth, 5.5, Math.PI / 2); // Lado curto
    }

    createCrossShape(width, height, depth, positions, name) {
        // Cria a primeira barra do "X"
        const barGeometry1 = new THREE.BoxGeometry(width, height, depth);
        const bar1 = new THREE.Mesh(barGeometry1, new THREE.MeshStandardMaterial({ color: '#393C3C' }));
        bar1.rotation.x = - Math.PI * 0.5;
        bar1.receiveShadow = true;
        bar1.castShadow = true;
        // Cria a segunda barra do "X" e rotaciona
        const barGeometry2 = new THREE.BoxGeometry(width, height, depth);
        const bar2 = new THREE.Mesh(barGeometry2, new THREE.MeshStandardMaterial({ color: '#393C3C' }));
        bar2.rotation.z = Math.PI / 2; // 90 graus em radianos
        bar2.rotation.x = - Math.PI * 0.5;
        bar2.receiveShadow = true;
        bar2.castShadow = true;
        // Cria um grupo para manter as duas barras juntas
        const crossGroup = new THREE.Group();
        crossGroup.add(bar1);
        crossGroup.add(bar2);

        if (positions.x === 11) {
            this.numberX++
            this.numberX++

        }

        crossGroup.position.set(positions.x, positions.y, positions.z + this.numberX);
        crossGroup.rotation.y = Math.PI / 4;
        crossGroup.name = name;
        this.graphicEngine.scene.add(crossGroup);
        sharedObjects.cross[name] = crossGroup;
    }

    createCrossAtPosition(numberPosition, name) {
        this.createCrossShape(this.crossWidth, this.crossHeight, this.crossDepth, sharedObjects.bases[numberPosition], `cross${name}`);
    }

    createCircleShape(positions, name) {
        const geometry = new THREE.TorusGeometry(0.6, 0.1, 100, 100);
        const material = new THREE.MeshStandardMaterial({ color: '#393C3C' });
        const torusMesh = new THREE.Mesh(geometry, material);
        torusMesh.rotation.x = - Math.PI * 0.5;

        if (positions.x === 19) {
            this.numberO++
            this.numberO++
        }

        torusMesh.position.set(positions.x, positions.y, positions.z + this.numberO);
        torusMesh.name = name;
        torusMesh.receiveShadow = true;
        torusMesh.castShadow = true;
        this.graphicEngine.scene.add(torusMesh);
        sharedObjects.circles[name] = torusMesh;
    }

    createCircleAtPosition(numberPosition, name) {
        this.createCircleShape(sharedObjects.bases[numberPosition], `circle${name}`)
    }


    // Métodos de utilitários
    createRoundedRectShape(width, height, radius) {
        const shape = new THREE.Shape();
        shape.moveTo(-width / 2 + radius, -height / 2);
        shape.lineTo(width / 2 - radius, -height / 2);
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
        shape.lineTo(width / 2, height / 2 - radius);
        shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
        shape.lineTo(-width / 2 + radius, height / 2);
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
        shape.lineTo(-width / 2, -height / 2 + radius);
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
        return shape;
    }

    createRoundedBorderShape(width, height, radius) {
        const shape = new THREE.Shape();
        // Os cantos superiores esquerdo e direito são arredondados
        shape.moveTo(-width / 2, -height / 2 + radius); // Ponto de início
        shape.lineTo(-width / 2, height / 2 - radius);
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2 + radius, height / 2); // Canto superior esquerdo
        shape.lineTo(width / 2 - radius, height / 2);
        shape.quadraticCurveTo(width / 2, height / 2, width / 2, height / 2 - radius); // Canto superior direito
        shape.lineTo(width / 2, -height / 2 + radius);
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2 - radius, -height / 2); // Canto inferior direito
        shape.lineTo(-width / 2 + radius, -height / 2);
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2, -height / 2 + radius); // Canto inferior esquerdo
        return shape;
    }

}
export default GraphicEngineTicTacToe;
