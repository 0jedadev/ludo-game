
import * as THREE from 'three'

class GameLogicEngineDama {
    constructor(fontsEngine, graphicEngine, gameLogicEngine, graphicEngineTicTacToe, configs) {
        this.fontsEngine = fontsEngine;
        this.graphicEngine = graphicEngine;
        this.gameLogicEngine = gameLogicEngine;
        this.graphicEngineTicTacToe = graphicEngineTicTacToe;
        this.configs = configs;
    }



    // Métodos de ciclo de vida e jogo
    start() {
        this.abrirJogoDaDama();
    }

    // Métodos de controle de jogador
    abrirJogoDaDama() {
        const container = document.querySelector('.container');
        this.gameLogicEngine.jogoDaDamaButton.addEventListener('click', () => {
            container.classList.remove('container');
            container.classList.add('invisible');
            this.graphicEngine.controls.target.set(-15, 0, 0);
            this.configs.targetPosition.set(-15, 4, 7);
            requestAnimationFrame((timestamp) => this.gameLogicEngine.smoothCameraMove(timestamp, () => { }));
        });
    }
}
export default GameLogicEngineDama;
