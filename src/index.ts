import * as THREE from "three";
import { WEBGL } from "three/examples/jsm/WebGL";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { CollisionCaster } from "./collisionCaster";

const clock: THREE.Clock = new THREE.Clock(true);
const acceleration: number = 9.8;
const speed: number = 50;
const mass: number = 100;

let controls: PointerLockControls, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene, raycaster: THREE.Raycaster;
let movementDirection: Map<String, boolean> = new Map<String, boolean>();
let direction = new THREE.Vector3();
let velocity = new THREE.Vector3();
let clips = [];

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
  const ground: THREE.Mesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), new THREE.MeshPhongMaterial({ depthWrite: false, visible: false }));
  ground.rotation.x = - Math.PI / 2;
  ground.position.set(0, 0, 0);
  ground.receiveShadow = true;
  clips.push(ground);
  scene.add(ground);

  const loader = new GLTFLoader();
  loader.load("../assets/scene.glb", (data) => { scene.add(data.scene); });
}

const initializeLighting = () => {
  const intensity: number = 1.5;
  const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xFFFFFF, intensity);
  const hemilight: THREE.HemisphereLight = new THREE.HemisphereLight(0x5D6DFF, 0xD99D80, intensity);
  const dirlight: THREE.DirectionalLight = new THREE.DirectionalLight(0xFFFFFF, intensity);
  dirlight.position.set(5, 10, 2);

  scene.add(ambientLight);
  scene.add(hemilight);
  scene.add(dirlight);
  scene.add(dirlight.target);
}

const initializeViewer = () => {
  const fov = 45;
  const aspect = 1920 / 1080;
  camera = new THREE.PerspectiveCamera(fov, aspect);
  camera.position.set(0, 0, 0);

  controls = new PointerLockControls(camera, renderer.domElement);
  controls.getObject().position.set(10, 1, 0);

  scene.add(controls.getObject());
}

const applyMovement = (delta: number) => {
  const left = (movementDirection["a"] || movementDirection["ArrowLeft"]) ? true : false;
  const right = (movementDirection["d"] || movementDirection["ArrowRight"]) ? true : false;
  const forward = (movementDirection["w"] || movementDirection["ArrowUp"]) ? true : false;
  const backward = (movementDirection["s"] || movementDirection["ArrowDown"]) ? true : false;

  velocity.x -= velocity.x * acceleration * delta;
  velocity.z -= velocity.z * acceleration * delta;

  direction.z = Number(forward) - Number(backward);
  direction.x = Number(right) - Number(left);
  direction.normalize();
 
  if (forward || backward) velocity.z -= direction.z * speed * delta;
  if (left || right) velocity.x -= direction.x * speed * delta;

  controls.moveForward(- velocity.z * delta);
  controls.moveRight(- velocity.x * delta);
}

const applyPhysics = (delta) => {
  const collision = new CollisionCaster(camera.position, 0.4, clips);

  if (collision.down != 0) {
    if (collision.down < 0.2) camera.position.setY(camera.position.y + 0.1);
  } else {
    camera.position.setY(camera.position.y - acceleration * delta);
  }
}

const render = () => {
  requestAnimationFrame(render);

  const delta = clock.getDelta();

  if (controls.isLocked) {
    applyMovement(delta);
    applyPhysics(delta);
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