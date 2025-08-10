import * as THREE from 'three';
import { SoundManager } from './Sound';
import { UIOverlay } from '../ui/Overlay';

type ScoreListener = (score: number) => void;

export class BalloonsManager {
  private scene: THREE.Scene;
  private sound: SoundManager;
  private ui: UIOverlay;
  private balloons: THREE.Mesh[] = [];
  private spawnTimer = 0;
  private score = 0;
  private listeners: ScoreListener[] = [];

  private balloonMat = new THREE.MeshStandardMaterial({ color: 0xff5577, roughness: 0.6, metalness: 0.1 });
  private stringMat = new THREE.LineBasicMaterial({ color: 0x333333 });

  constructor(scene: THREE.Scene, sound: SoundManager, ui: UIOverlay) {
    this.scene = scene;
    this.sound = sound;
    this.ui = ui;
  }

  onScore(cb: ScoreListener) { this.listeners.push(cb); }

  getBalloonMeshes() { return this.balloons; }

  spawnInitial(count: number) {
    for (let i = 0; i < count; i++) this.spawnBalloon();
  }

  private spawnBalloon() {
    const r = 26 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = 11 + Math.random() * 6;

    const geo = new THREE.SphereGeometry(0.9 + Math.random() * 0.7, 16, 16);
    const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.55);
    const mat = this.balloonMat.clone();
    mat.color = color;
    const balloon = new THREE.Mesh(geo, mat);
    balloon.position.set(x, y, z);
    balloon.castShadow = true;
    balloon.userData = { vy: 0.6 + Math.random() * 0.4, swayT: Math.random() * 100 };
    (balloon as any)._pop = () => this.popBalloon(balloon);

    // String
    const pts = [ new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -2.5, 0) ];
    const strGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const str = new THREE.Line(strGeo, this.stringMat);
    str.position.copy(balloon.position);
    (balloon as any).string = str;

    this.scene.add(balloon);
    this.scene.add(str);
    this.balloons.push(balloon);
  }

  tryClick(raycaster: THREE.Raycaster): boolean {
    const hits = raycaster.intersectObjects(this.balloons, false);
    if (!hits.length) return false;
    const b = hits[0].object as THREE.Mesh;
    this.popBalloon(b);
    return true;
  }

  private popBalloon(balloon: THREE.Mesh, awardScore: boolean = true) {
    const idx = this.balloons.indexOf(balloon);
    if (idx !== -1) {
      this.balloons.splice(idx, 1);
      this.scene.remove(balloon);
      const str = (balloon as any).string as THREE.Line | undefined;
      if (str) this.scene.remove(str);
      this.sound.playHit();
      if (awardScore) {
        this.score += 1;
        this.listeners.forEach((l) => l(this.score));
        this.ui.flashToast('+1 🎈');
      }
    }
  }

  update(dt: number) {
    // Spawn new balloons over time
    this.spawnTimer += dt;
    if (this.spawnTimer > 1.75) {
      this.spawnTimer = 0;
      if (this.balloons.length < 40) this.spawnBalloon();
    }

    // Float balloons
    for (const b of this.balloons) {
      const ud = b.userData as any;
      ud.swayT += dt;
      b.position.y += ud.vy * dt;
      b.position.x += Math.sin(ud.swayT * 0.8) * 0.15 * dt * 60;
      b.position.z += Math.cos(ud.swayT * 0.6) * 0.12 * dt * 60;
      const str = (b as any).string as THREE.Line | undefined;
      if (str) str.position.copy(b.position);
      if (b.position.y > 28) {
        this.popBalloon(b, false);
      }
    }
  }
}


