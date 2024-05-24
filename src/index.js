

import ConfigsEngine from "./LudoGame/Configs/configs";
import GraphicEngine from "./LudoGame/GraphicEngine/GraphicEngine";
import PhysicsEngine from "./LudoGame/PhysicsEngine/PhysicsEngine";
import GameLogicEngine from './LudoGame/GameLogic/GameLogic';
import GraphicEngineTicTacToe from "./TicTacToeGame/GraphicEngine/GraphicEngineTicTacToe";
import GameEngineTicTacToe from "./TicTacToeGame/GameLogic/GameEngineTicTacToe";
import FontsEngine from "./Fonts/FontsEngine";
import GraphicEngineDama from "./DamaGame/GraphicEngine/GraphicEngineDama";
import GameLogicEngineDama from "./DamaGame/GameLogicEngine/GameLogicEngineDama";


const configsEngine = new ConfigsEngine();
configsEngine.x = 0;
configsEngine.y = 4;
configsEngine.z = 12;
const graphicEngine = new GraphicEngine(configsEngine);
const physicsEngine = new PhysicsEngine(configsEngine);
const fontsEngine = new FontsEngine(graphicEngine, configsEngine);
const gameLogicEngine = new GameLogicEngine(graphicEngine, physicsEngine, configsEngine);
const graphicEngineTicTacToe = new GraphicEngineTicTacToe(graphicEngine, configsEngine);
const gameEngineTicTacToe = new GameEngineTicTacToe(fontsEngine, graphicEngine, gameLogicEngine, graphicEngineTicTacToe, configsEngine);
const graphicEngineDama = new GraphicEngineDama(graphicEngine, configsEngine)
const gameLogicEngineDama = new GameLogicEngineDama(fontsEngine, graphicEngine, gameLogicEngine, graphicEngineTicTacToe, configsEngine)

//ThreeJS LudoGame
graphicEngine.InitLudo();


//Cannon LudoGame
physicsEngine.InitPhysics();


//Logic LudoGame
gameLogicEngine.InitGameLogic();


//THREEJS Jogo da Velha
graphicEngineTicTacToe.init();

//Logi Jodo da Velha
gameEngineTicTacToe.start();


//THREEJS Jogo da Dama
graphicEngineDama.createBoard();

gameLogicEngineDama.start();
