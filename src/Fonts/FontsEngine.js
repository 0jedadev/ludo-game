import * as THREE from 'three'
import sharedObjects from '../TicTacToeGame/sharedObjects';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

class FontsEngine {
    constructor(graphicEngine) {
        this.graphicEngine = graphicEngine
        this.textMeshes = [];
        this.color = {
            'cruz': '#FF6347',
            'circulo': '#FF6347'
        }
    }

    createNumberText = (positions, numberPosition) => {
        return new Promise((resolve, reject) => {
            this.graphicEngine.fontLoader.load(
                '../../fonts/helvetiker_regular.typeface.json',
                (font) => {
                    const textGeometry = new TextGeometry(`${numberPosition}`, {
                        font: font,
                        size: 0.9, // Tamanho do texto
                        height: 0.1, // Espessura do texto - 0 para texto plano sem extrusão
                        curveSegments: 12, // Quanto maior, mais suave a curva
                        bevelEnabled: false,
                    })
                    textGeometry.computeBoundingBox();
                    textGeometry.center();


                    this.graphicEngine.matcapTexture.colorSpace = THREE.SRGBColorSpace

                    const material = new THREE.MeshMatcapMaterial({ color: '#000000', matcap: this.graphicEngine.matcapTexture });


                    const newTextObject = new THREE.Mesh(textGeometry, material);


                    // Configuramos as propriedades do newTextObject

                    newTextObject.name = `number${numberPosition}`;


                    newTextObject.rotation.x = - Math.PI * 0.5;


                    newTextObject.position.set(positions.x, positions.y + -0.1, positions.z);

                    // Definimos 'isAnimating' aqui também
                    newTextObject.isAnimating = true;
                    // Atualizamos a função 'update'
                    newTextObject.update = function (deltaTime) {
                        if (newTextObject.isAnimating) { // Aqui usamos 'self' em vez de 'this.newTextObject'
                            newTextObject.position.set(positions.x, positions.y + -0.1 + deltaTime, positions.z);
                        }
                    };

                    this.graphicEngine.scene.add(newTextObject);
                    resolve(newTextObject);
                },
                undefined, // onProgress callback
                reject
            );
        });
    }

    addNumberTextToScene(numberPosition) {
        this.createNumberText(sharedObjects.bases[numberPosition], numberPosition)
            .then(newTextObject => {
                this.textMeshes.push(newTextObject); // Armazena a referência do objeto de texto
                // Outras ações após a criação bem-sucedida do objeto de texto
            })
            .catch(error => {
                console.error("Erro ao carregar a fonte ou criar o objeto de texto:", error);
            });
    }

    removeTextMeshesFromScene() {
        // Itera sobre todos os objetos de texto e os remove da cena
        this.textMeshes.forEach(textMesh => {
            if (textMesh.material) textMesh.material.dispose(); // Descarta o material
            if (textMesh.geometry) textMesh.geometry.dispose();  // Descarta a geometria

            this.graphicEngine.scene.remove(textMesh); // Remove o objeto de texto da cena
        });

        // Limpa a array para remover as referências
        this.textMeshes = [];
    }

    displayChosenPlayer(currentPlayer) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.graphicEngine.fonts(`${currentPlayer}, Agora escolha um dos numeros do tabuleiro.`, playerColor, () => { }, () => { }, 15, 2, 0);
    }

    displayStartingPlayer(currentPlayer) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.graphicEngine.fonts(`${currentPlayer} vai iniciar, escolha ${playerType === 'cruz' ? 'alguma' : 'algum'} ${playerType} para se mover!`, playerColor, () => { }, () => { }, 15, 2, 0);
    }

    displaySelectedPosition(currentPlayer, selectedObject) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.graphicEngine.fonts(`Se moveu para a posicao ${selectedObject}`, playerColor, () => { }, () => { }, 15, 2, 0);
    }

    displayWinner(currentPlayer) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.graphicEngine.fonts(`Parabens ${currentPlayer}, Ganhou o Jogo!!!`, playerColor, () => { }, () => { }, 15, 2, 0);
    }

    displayTie(currentPlayer) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.graphicEngine.fonts(`Puxa, Deu Velha! Empate.`, playerColor, () => { }, () => { }, 15, 2, 0);
    }

}

export default FontsEngine;
