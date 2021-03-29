import * as THREE from 'https://unpkg.com/three@0.123.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.123.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, car; 
let carAxis, carDirection;
const loader = new GLTFLoader();

function init(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
  
    // 1. Voeg een camera toe aan de scene
    // Zie ook de globale variabele camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 25;
    camera.position.y = 10;


    // 2. Maak de renderer aan en laat deze schaduwen ondersteunen
    // Zie ook de globale variabele renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.sortObjects = false;
    document.body.appendChild( renderer.domElement );


    // 3. Voeg een ambient licht toe aan de scene
    const ambient = new THREE.AmbientLight(0x404040); 
    // const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
    scene.add(ambient);
    

    // 4. Voeg een directional licht toe aan de scene, stel de positie in vanuit de hoek van de scene en 
    // laat het licht schaduwen reflecteren
    const light = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    light.position.set( 10, 10, 10);
    light.shadow.near = 10;
    light.shadow.far = 500;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.5, 1000);
    light.castShadow = true;
    scene.add(light);
  

    // 5. Voeg orbit controls toe zodat je in de scene kan rondkijken
    const controls = new OrbitControls( camera, renderer.domElement );


    // 6. Maak een box met als kleur 0xd2b48c, breedte 22, hoogte 1 en lengte 22. Dit is de grond van je scene
    // zorg dat het grondvlak ook schaduwen accepteert

    const geometry = new THREE.BoxGeometry(22, 1, 22);
    const material = new THREE.MeshLambertMaterial({ color: 0xd2b48c});
    // const material = new THREE.MeshStandardMaterial( { color: 0xd2b48c } )
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.position.y = -0.6;
    scene.add(mesh);


    // 7. Importeer het model building.glb en plaats deze op de scène. 
    // Positioneer deze in het midden van de wegen. Zorg ook dat het model een schaduw geeft. 

    loader.load('models/building.glb', function(object){
        object.scene.traverse(function(child){
            if (child.isMesh){  
                child.castShadow = true;
            }
        });
        scene.add(object.scene);

    });

    // addModelToScene('models/building.glb').then(res => {
    //     building = res;
    //     building.receiveShadow = false;
    //     building.castShadow = true;
    // });


    // 8. Importeer het model vehicle.glb of vehicle2.glb en plaats het op de weg voor het gebouw met position. 
    // Laat dit model schaduwen reflecteren.
    

    // addModelToScene('models/vehicle.glb').then(res => {
    //     car = res;
    //     car.position.z = 9;
    //     car.position.y = 0;
    //     car.receiveShadow = true;
    // });

    loader.load('models/vehicle.glb', function(object){
        object.scene.traverse(function(child){
            if (child.isMesh){  
                child.castShadow = true;
            }
        });

        car = object.scene.clone();
        car.position.z = 9;
        car.position.y = 0;
        scene.add(car);
    });




    // Onderstaande code importeert de wegen.
    // Deze code hoef je niet aan te passen! 
    loader.load('models/road.glb', function(object){
        object.scene.traverse(function(child){
            if (child.isMesh){  
                child.receiveShadow = true;
            }
        });

        let road1 = object.scene.clone();
        road1.position.x = 7.2;
        scene.add(road1);

        let road2 = object.scene.clone();
        road2.position.x = -7.2;
        scene.add(road2);

        let road3 = object.scene.clone();
        road3.position.z = 7.2;
        road3.rotation.y = Math.PI/2;
        scene.add(road3);

        let road4 = object.scene.clone();
        road4.position.z = -7.2;
        road4.rotation.y = Math.PI/2;
        scene.add(road4);
    });

    loader.load('models/road_corner.glb', function(object){
        object.scene.traverse(function(child){
            if (child.isMesh){  
                child.receiveShadow = true;
            }
        });

        let corner1 = object.scene.clone();
        corner1.position.x = 7.2;
        corner1.position.z = 7.2;
        scene.add(corner1);

        let corner2 = object.scene.clone();
        corner2.position.x = -7.2;
        corner2.position.z = 7.2;
        corner2.rotation.y = -Math.PI/2;
        scene.add(corner2);

        let corner3 = object.scene.clone();
        corner3.position.x = 7.2;
        corner3.position.z = -7.2;
        corner3.rotation.y = Math.PI/2;
        scene.add(corner3);

        let corner4 = object.scene.clone();
        corner4.position.x = -7.2;
        corner4.position.z = -7.2;
        corner4.rotation.y = Math.PI;
        scene.add(corner4);
    });


    window.addEventListener( 'resize', onResize, false);
    update();
}

function update(){
    requestAnimationFrame(update);
    renderer.render(scene, camera);
    

    // Onderstaande code zorgt ervoor dat het autootje zal rond rijden.
    // Je hoeft de code niet te wijzigen

    const carBreakpoint = 8.4;
    const carSpeed = 0.1;

    if (car) {
        if (!carAxis) {
            carAxis = 'x';
        }

        if (!carDirection) {
            carDirection = '-';
        }

        if (carAxis === 'x' && carDirection === '-') {
            car.position.x -= carSpeed;
            if (car.position.x <= carBreakpoint * -1) {
                car.rotation.y = Math.PI/2*3;
                carAxis = 'z';
            }
        }

        if (carAxis === 'z' && carDirection === '-') {
            car.position.z -= carSpeed;
            if (car.position.z <= carBreakpoint * -1) {
                car.rotation.y = Math.PI;
                carAxis = 'x';
                carDirection = '+';
            }
        }

        if (carAxis === 'x' && carDirection === '+') {
            car.position.x += carSpeed;
            if (car.position.x >= carBreakpoint) {
                car.rotation.y = Math.PI/2;
                carAxis = 'z';
            }
        }

        if (carAxis === 'z' && carDirection === '+') {
            car.position.z += carSpeed;
            if (car.position.z >= carBreakpoint) {
                car.rotation.y = 0;
                carAxis = 'x';
                carDirection = '-';
            }
        }
    }

}

function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight);
}

async function addModelToScene(path, castShadow, recieveShadow) {
    return await new Promise((res, rej) => {
        loader.load(path, function(object){
            object.scene.traverse(function(child){
                if (child.isMesh){  
                    child.castShadow = castShadow;
                    child.receiveShadow = recieveShadow;
                }
            });
            scene.add(object.scene);
            res(object.scene);
        }, null, rej);
    });
}

init();