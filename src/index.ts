import * as THREE from "three";
import { WEBGL } from "three/examples/jsm/WebGL";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const clock: THREE.Clock = new THREE.Clock(true);
const acceleration: number = 9.8;
const speed: number = 50;
const mass: number = 100;

let controls: PointerLockControls, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene, raycaster: THREE.Raycaster;
let movementDirection: Map<String, boolean> = new Map<String, boolean>();
let direction = new THREE.Vector3();
let velocity = new THREE.Vector3();

const initialize = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.enabled = true;

  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  initializeBackground();
  initializeStructures();
  initializeLighting();
  initializeViewer();
  initializePhysics();

  render();
}

const initializeBackground = () => {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    '../assets/skyright.png',
    '../assets/skyleft.png',
    '../assets/skytop.png',
    '../assets/skybottom.png',
    '../assets/skycenter.png',
    '../assets/skyveryright.png',
  ]);

  scene.background = texture;
}

const initializeStructures = () => {
  const ground: THREE.Mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 10, 10), new THREE.MeshPhongMaterial({ color: 0xDDDDDD, depthWrite: false }));
  ground.rotation.x = - Math.PI / 2;
  ground.position.set(0, 0, 0);
  ground.receiveShadow = true;

  scene.add(ground);

  const loader = new GLTFLoader();
  loader.load("../assets/scene.glb", (data) => { scene.add(data.scene); });
}

const initializeLighting = () => {
  const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xFFFFFF);

  scene.add(ambientLight);
}

const initializeViewer = () => {
  const fov = 60;
  const aspect = 1920 / 1080;
  camera = new THREE.PerspectiveCamera(fov, aspect);
  camera.position.set(0, 0, 0);

  controls = new PointerLockControls(camera, renderer.domElement);
  controls.getObject().position.set(0, 10, 0);

  scene.add(controls.getObject());
}

const initializePhysics = () => {
  // TODO: Implement
}

const applyMovement = (delta: number) => {
  const left = (movementDirection["a"] || movementDirection["ArrowLeft"]) ? true : false;
  const right = (movementDirection["d"] || movementDirection["ArrowRight"]) ? true : false;
  const forward = (movementDirection["w"] || movementDirection["ArrowUp"]) ? true : false;
  const backward = (movementDirection["s"] || movementDirection["ArrowDown"]) ? true : false;

  velocity.x -= velocity.x * acceleration * delta;
  velocity.z -= velocity.z * acceleration * delta;

  velocity.y -= acceleration * mass * delta;

  direction.z = Number(forward) - Number(backward);
  direction.x = Number(right) - Number(left);
  direction.normalize();

  if (forward || backward) velocity.z -= direction.z * speed * delta;
  if (left || right) velocity.x -= direction.x * speed * delta;

  controls.moveForward(- velocity.z * delta);
  controls.moveRight(- velocity.x * delta);
}

const render = () => {
  requestAnimationFrame(render);

  const delta = clock.getDelta();

  if (controls.isLocked) {
    applyMovement(delta);
  }

  renderer.render(scene, camera);
}

const changeMovement = (event: KeyboardEvent, down: boolean) => {
  const exclude = ["F5", "F11", "F12", "Escape", "Control", "LeftShift", "Tab"];

  if (exclude.includes(event.key)) return;

  event.stopPropagation();
  event.preventDefault();

  movementDirection[event.key] = down;
}

const togglePointerLock = () => {
  if (controls.isLocked) {
    controls.unlock();
    (document.querySelector("#pause") as HTMLElement).style.display = "block";
  } else {
    controls.lock();
    (document.querySelector("#pause") as HTMLElement).style.display = "none";
  }
}

const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener("keydown", (event) => { changeMovement(event, true); }, false);
window.addEventListener("keyup", (event) => { changeMovement(event, false); }, false);
window.addEventListener("click", togglePointerLock, false);
window.addEventListener("resize", onWindowResize, false);

if (WEBGL.isWebGLAvailable()) {
  initialize();
} else {
  const warning = WEBGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}