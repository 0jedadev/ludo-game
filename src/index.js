

import ConfigsEngine from "./LudoGame/Configs/configs";
import GraphicEngine from "./LudoGame/GraphicEngine/GraphicEngine";
import PhysicsEngine from "./LudoGame/PhysicsEngine/PhysicsEngine";
import GameLogicEngine from './LudoGame/GameLogic/GameLogic';
import GraphicEngineTicTacToe from "./TicTacToeGame/GraphicEngine/GraphicEngineTicTacToe";
import GameEngineTicTacToe from "./TicTacToeGame/GameLogic/GameEngineTicTacToe";
import FontsEngine from "./Fonts/FontsEngine";


const configsEngine = new ConfigsEngine();
configsEngine.x = 7;
configsEngine.y = 4;
configsEngine.z = 10;
const graphicEngine = new GraphicEngine(configsEngine);
const fontsEngine = new FontsEngine(graphicEngine);
const physicsEngine = new PhysicsEngine(configsEngine);
const gameLogicEngine = new GameLogicEngine(graphicEngine, physicsEngine, configsEngine);
const graphicEngineTicTacToe = new GraphicEngineTicTacToe(graphicEngine, configsEngine);
const gameEngineTicTacToe = new GameEngineTicTacToe(fontsEngine, graphicEngine, gameLogicEngine, graphicEngineTicTacToe, configsEngine);


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

