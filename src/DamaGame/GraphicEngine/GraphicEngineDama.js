import * as THREE from 'three'

class GraphicEngineDama {
    constructor(graphicEngine, configs) {
        this.configs = configs;
        this.graphicEngine = graphicEngine;
        this.borderRadius = 0.05;
        this.borderDepth = 0.190;
        this.crossWidth = 0.2;
        this.crossHeight = 1.5;
        this.crossDepth = 0.1;

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

        this.createSquares();
    }


    // Métodos de criação do jogo
    createFloor = () => {

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(6, 6, 0.2),
            new THREE.MeshStandardMaterial({
                color: '#D3B98F'
            })

        )
        floor.receiveShadow = true
        floor.castShadow = true;
        floor.rotation.x = - Math.PI * 0.5
        floor.position.set(-15, 0, 0)

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
        belowFloor.position.set(-15, -0.3, 0)


        const planeBelowFloorGeometry = new THREE.BoxGeometry(6.2, 6.2, 0.05);
        const planeBelowFloorMaterial = new THREE.MeshMatcapMaterial({ color: 0x444444 });
        const planeBelowFloor = new THREE.Mesh(planeBelowFloorGeometry, planeBelowFloorMaterial);
        planeBelowFloor.receiveShadow = true
        planeBelowFloor.castShadow = true;
        planeBelowFloor.position.set(-15, -0.13, 0);
        planeBelowFloor.rotation.x = - Math.PI * 0.5;

        this.graphicEngine.scene.add(floor, belowFloor, planeBelowFloor);
    }

    createBorder = (x, y, z, width, height, rz, rx) => {
        const borderGeometry = new THREE.PlaneGeometry(width, height);
        const borderMaterial = new THREE.MeshMatcapMaterial({ color: '#403E3F',side: THREE.DoubleSide });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.receiveShadow = true
        border.castShadow = true;
        border.position.set(x, y, z);
        // border.rotation.x = - Math.PI * 0.5;
        border.rotation.z = rz;
        border.rotation.y = rx;
        
        this.graphicEngine.scene.add(border);
    }

    addAllBorders() {
        // Use a profundidade da borda como parte dos argumentos ao criar as bordas
        this.createBorder(-17.501, 0.15, 0, this.borderDepth, 5.02, Math.PI / 2, - Math.PI / 2); // Lado Direito
        this.createBorder(-12.499, 0.15, 0, this.borderDepth, 5.02, Math.PI / 2, - Math.PI / 2 ); // Lado Esquerdo
        this.createBorder(-15, 0.15, -2.501, this.borderDepth, 5.02, Math.PI / 2, 0 ); // Lado Tras
        this.createBorder(-15, 0.15, 2.501, this.borderDepth, 5.02, Math.PI / 2, 0); // Lado Frente
    }

    createSquares() {
        const squareSize = 5 / 8; // Tamanho de cada quadrado
        const offset = -15; // Deslocamento para centralizar o tabuleiro na origem
        const squareColor1 = '#997263'; // Cor do quadrado claro
        const squareColor2 = '#403E3F'; // Cor do quadrado escuro
        const squaresGroup = new THREE.Group();
        this.graphicEngine.scene.add(squaresGroup);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                // Alternar entre as duas cores para criar o padrão de xadrez
                const color = (i + j) % 2 === 0 ? squareColor1 : squareColor2;
                const squareMaterial = new THREE.MeshStandardMaterial({ color: color });
                const squareGeometry = new THREE.BoxGeometry(squareSize, squareSize, 0.1);
                const squareMesh = new THREE.Mesh(squareGeometry, squareMaterial);
                squareMesh.position.set(
                    i * squareSize - (5 - squareSize) / 2, // Posição no eixo X
                    0.05, // Posição no eixo Y (um pouco acima do nível do tabuleiro)
                    j * squareSize - (5 - squareSize) / 2 // Posição no eixo Z
                );
                squareMesh.rotation.x = - Math.PI * 0.5;
                squareMesh.receiveShadow = true;
                squareMesh.castShadow = true;
                squaresGroup.add(squareMesh);
            }
        }
        squaresGroup.position.set(-15, 0.10, 0); 
        this.graphicEngine.scene.add(squaresGroup);
    }

}
export default GraphicEngineDama;
