import * as THREE from 'three'
import sharedObjects from '../TicTacToeGame/sharedObjects';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

class FontsEngine {
    constructor(graphicEngine, configs) {
        this.graphicEngine = graphicEngine
        this.configs = configs
        this.textMeshes = [];
        this.color = {
            'cruz': '#FF6347',
            'circulo': '#FF6347'
        }
    }

    fonts = (textFont, color, callback, secondCallback, x, y, z) => {
        console.log(textFont, color);
        // Adiciona o novo texto à fila
        this.configs.textQueue.push({ textFont, color, callback, secondCallback, x, y, z });
        // Se não houver um texto sendo exibido, chama a função para exibir o próximo texto da fila
        if (!this.configs.isTextBeingDisplayed) {
            this.displayNextText();
        }
    };

    displayNextText = () => {
        if (this.configs.textQueue.length > 0 && !this.configs.isTextBeingDisplayed) {
            this.configs.isTextBeingDisplayed = true;
            const { textFont, color, callback, secondCallback, x, y, z } = this.configs.textQueue[0];
            this.graphicEngine.fontLoader.load(
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
                        this.graphicEngine.scene.remove(this.configs.textObject);
                    }

                    this.configs.textObject = newTextObject;
                    this.graphicEngine.scene.add(newTextObject);

                    // Remoção agendada do texto e continuação do processo
                    setTimeout(() => {
                        if (this.configs.textObject) {
                            this.graphicEngine.scene.remove(this.configs.textObject);
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

    displayChosenPlayer(currentPlayer, callback) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.fonts(`${currentPlayer}, Agora escolha um dos numeros do tabuleiro.`, playerColor, callback, () => { }, 15, 2, 0);
    }

    displayStartingPlayer(currentPlayer, callback) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.fonts(`${currentPlayer} vai jogar, escolha ${playerType === 'cruz' ? 'alguma' : 'algum'} ${playerType} para se mover!`, playerColor, callback, () => { }, 15, 2, 0);
    }

    displaySelectedPosition(currentPlayer, selectedObject, callback) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.fonts(`Se moveu para a posicao ${selectedObject}`, playerColor, callback, () => { }, 15, 2, 0);
    }

    displayWinner(currentPlayer, callback) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.fonts(`Parabens ${currentPlayer}, Ganhou o Jogo!!!`, playerColor, callback, () => { }, 15, 2, 0);
    }

    displayTie(currentPlayer, callback) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.fonts(`Puxa, Deu Velha! Empate.`, playerColor, callback, () => { }, 15, 2, 0);
    }

    playerIA(currentPlayer, callback) {
        const playerType = currentPlayer.includes('Cruz') ? 'cruz' : 'circulo';
        const playerColor = this.color[playerType];
        this.fonts(`Player Bolinha sera a IA.`, playerColor, callback, () => { }, 15, 2, 0);
    }

}5

export default FontsEngine;
