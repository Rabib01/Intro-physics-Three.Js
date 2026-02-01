import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
// import * as CANNON from "cannon-es";
import CANNON from "cannon";

// console.log(CANNON);

/**
 * Debug
 */
const gui = new dat.GUI();
const debugObject = {};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//create physics world
const world = new CANNON.World();
world.gravity.set(0, -9.81, 0);
// console.log(world);

/**
 * Materials for Cannon Js
 */
const concreteMaterial = new CANNON.Material("concrete");
const plasticMaterial = new CANNON.Material("plastic");
const plasticConcreteContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  },
);
world.addContactMaterial(plasticConcreteContactMaterial);

//create sphereBody and sphereShape
const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
  position: new CANNON.Vec3(0, 4, 0),
  mass: 1,
  shape: sphereShape,
  material: plasticMaterial,
});
world.addBody(sphereBody);

// create floorbody adn floorSHape
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.addShape(floorShape);
floorBody.mass = 0; // static and not moting
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
floorBody.material = concreteMaterial;
world.addBody(floorBody);

// There is something wrong with this code
// sphereBody.mass = 1;/
// sphereBody.position = new CANNON.Vec3(0, 1, 0);
// sphereBody.addShape = sphereShape;

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  //   envMap: environmentMapTexture,
  //   envMapIntensity: 0.5,
});

// Three.js mesh
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.castShadow = true;
sphereMesh.scale.set(1, 1, 1);
sphereMesh.position.set(0, 4, 0);
scene.add(sphereMesh);

// Create box

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    // envMap: environmentMapTexture,
    // envMapIntensity: 0.5,
  }),
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update cameram
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(-3, 8, 8);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update physics
  world.step(1 / 60, deltaTime, 3);
  //   console.log(sphereBody.position.y);

  // Update controls
  sphereMesh.position.copy(sphereBody.position);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
