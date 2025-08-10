import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCastle } from './scene/Castle';
import { BalloonsManager } from './scene/Balloons';
import { CharactersManager, Character } from './scene/Characters';
import { ProjectilesManager } from './scene/Projectiles';
import { SoundManager } from './scene/Sound';
import { UIOverlay } from './ui/Overlay';

const appContainer = document.getElementById('app') as HTMLDivElement;
const uiRoot = document.getElementById('ui-root') as HTMLDivElement;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
appContainer.appendChild(renderer.domElement);

// Scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fb6ff);
scene.fog = new THREE.Fog(0x88aadd, 60, 300);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(30, 20, 60);

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x335577, 0.9);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.0);
dir.position.set(60, 80, 40);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
scene.add(dir);

// Controls (disabled during cinematic intro)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 10;
controls.maxDistance = 180;

// UI
const ui = new UIOverlay(uiRoot);
ui.updateScore(0);
ui.setHint('Click balloons to pop them. Click characters to talk. Scroll to zoom.');

// Managers
const sound = new SoundManager();
const projectiles = new ProjectilesManager(scene, sound);
const balloons = new BalloonsManager(scene, sound, ui);
const characters = new CharactersManager(scene, ui);

// Castle
const { root: castleRoot, innerGround } = createCastle((origin, dir) => {
  projectiles.fire(origin, dir);
});
scene.add(castleRoot);
scene.add(innerGround);

// Clouds
createClouds(scene);

// Populate characters inside the castle courtyard
characters.spawnDefaultNPCs();

// Spawn some balloons initially and over time
balloons.spawnInitial(24);

// Raycaster for clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(e: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(mouse, camera);

  // Prioritize character interaction
  const characterHit = characters.trySelect(raycaster);
  if (characterHit) {
    return;
  }

  // Try balloon direct click
  const balloonHit = balloons.tryClick(raycaster);
  if (balloonHit) return;

  // Otherwise shoot a projectile along the click ray
  projectiles.fire(camera.position.clone(), raycaster.ray.direction.clone());

  // Check immediate balloon hit along ray path (also handled via projectile overlap as it travels)
}

renderer.domElement.addEventListener('click', onClick);

// Resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Cinematic intro pan
let introTime = 0;
const introDuration = 8500; // ms
let introActive = true;
ui.showCenterToast('Cinematic view... press any key or click to skip');
const skipIntro = () => { introActive = false; ui.hideCenterToast(); };
window.addEventListener('keydown', skipIntro, { once: true });
renderer.domElement.addEventListener('pointerdown', skipIntro, { once: true });

// Animate
const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  const et = clock.elapsedTime;

  if (introActive && introTime < introDuration) {
    introTime += dt * 1000;
    const t = Math.min(introTime / introDuration, 1);
    cinematicCameraPath(camera, t);
    controls.enabled = false;
  } else {
    controls.enabled = true;
    controls.update();
  }

  balloons.update(dt);
  characters.update(dt);
  projectiles.update(dt, balloons.getBalloonMeshes());
  (castleRoot as any).update?.(dt);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Helpers
function cinematicCameraPath(cam: THREE.PerspectiveCamera, t: number) {
  const eased = easeInOutCubic(t);
  const radius = 120 - 40 * eased; // spiral inward
  const angle = eased * Math.PI * 1.5 + 0.3;
  const height = 30 + 25 * Math.sin(eased * Math.PI);
  cam.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
  cam.lookAt(0, 12, 0);
}

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function createClouds(targetScene: THREE.Scene) {
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 18; i++) {
    const w = 10 + Math.random() * 18;
    const h = 4 + Math.random() * 6;
    const d = 6 + Math.random() * 9;
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, cloudMat);
    mesh.position.set((Math.random() - 0.5) * 300, 50 + Math.random() * 40, (Math.random() - 0.5) * 300);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    targetScene.add(mesh);
  }
}

// Score updates from balloons manager
balloons.onScore((score) => ui.updateScore(score));


