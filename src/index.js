

import ConfigsEngine from "./Configs/configs";
import GraphicEngine from "./GraphicEngine/GraphicEngine";
import PhysicsEngine from "./PhysicsEngine/PhysicsEngine";
import GameLogicEngine from './GameLogic/GameLogic';


const configsEngine = new ConfigsEngine();
const graphicEngine = new GraphicEngine(configsEngine);
const physicsEngine = new PhysicsEngine(configsEngine);
const gameLogicEngine = new GameLogicEngine(graphicEngine, physicsEngine, configsEngine);


//ThreeJS
graphicEngine.Floor();
graphicEngine.callAddBorders();
graphicEngine.planeBelowFloor();
graphicEngine.callCircleBase();
graphicEngine.callRoutes();
graphicEngine.callDirectionalGames();
graphicEngine.createGroundMesh();
graphicEngine.createDice();
graphicEngine.CallPinos();
graphicEngine.lightsFunc();

//Cannon
physicsEngine.createGroundCannon();
physicsEngine.createDiceCannon();
physicsEngine.contactDice();


//Logic Game
gameLogicEngine.InitGameButton();
gameLogicEngine.callCreateWalls();
gameLogicEngine.tick();
