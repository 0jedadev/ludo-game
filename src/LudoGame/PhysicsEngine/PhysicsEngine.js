// PhysicsEngine.js
import * as CANNON from 'cannon';

class PhysicsEngine {
    constructor(configs) {
        this.configs = configs;
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.groundCannonMaterial = new CANNON.Material({ friction: 0.6, restitution: 0.6 });
        this.wallCannonMaterial = new CANNON.Material({ friction: 0.1, restitution: 0.4 });
        this.diceCannonMaterial = new CANNON.Material({ friction: 0.05, restitution: 0.7 });
    }

    InitPhysics() {
        this.createGroundCannon();
        this.createDiceCannon();
        this.contactDice();
}

    createGroundCannon() {
        const groundShape = new CANNON.Plane();
        const groundBodyCannon = new CANNON.Body({
            mass: 0,
            shape: groundShape,
            material: this.groundCannonMaterial
        });
        groundBodyCannon.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(groundBodyCannon);
    }

    createWallCannon(position, size) {
        const wallShapeCannon = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.depth / 2));
        const wallBodyCannon = new CANNON.Body({
            mass: 0, // faz com que a parede seja estática
            shape: wallShapeCannon,
            material: this.wallCannonMaterial
        });
        // Ajusta o centro de massa para coincidir com o mesh visual
        wallBodyCannon.position.set(position.x, position.y, position.z);
        this.world.addBody(wallBodyCannon); // Adiciona a parede física ao mundo físico
    }

    createDiceCannon() {
       const size = 0.3;
        const diceShape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
        this.configs.diceCannon = new CANNON.Body({
            mass: 1, // A massa pode ser ajustada conforme necessário
            material: this.diceCannonMaterial,
            shape: diceShape,
        });

        this.configs.diceCannon.world = this.world; // Set the world property on the this.configs.diceCannon object

        this.configs.initialRotationX = this.configs.diceMesh.rotation.x;
        this.configs.initialRotationZ = this.configs.diceMesh.rotation.z;
        // Posição de lançamento inicial do dado
        this.configs.diceCannon.position.set(this.configs.launchPosition.x, this.configs.launchPosition.y, this.configs.launchPosition.z);

        this.configs.diceCannon.velocity.set(0, 0, 0);
        this.configs.diceCannon.angularVelocity.set(0, 0, 0);

        // Configuramos o dado em repouso
        this.configs.diceCannon.sleep();
        // Adiciona o dado físico ao mundo físico
        this.world.addBody(this.configs.diceCannon);
    }

    contactDice = () => {

        // Definição do contato entre o dado e o chão
        const diceGroundContactMaterial = new CANNON.ContactMaterial(
            this.diceCannonMaterial,
            this.groundCannonMaterial,
            {
                friction: 0.6,    // Mantém a fricção um pouco mais alta para controle
                restitution: 0.7  // Alta restituição para um bom quique
            }
        );
        this.world.addContactMaterial(diceGroundContactMaterial);

        // Definição do contato entre o dado e as paredes
        const diceWallContactMaterial = new CANNON.ContactMaterial(
            this.diceCannonMaterial,
            this.wallCannonMaterial,
            {
                friction: 0.05,   // Baixa fricção para deslizar mais
                restitution: 0.6  // Restituição moderada para quique nas paredes
            }
        );
        this.world.addContactMaterial(diceWallContactMaterial);

    };
    
}

export default PhysicsEngine;
