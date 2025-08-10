import * as THREE from 'three';
import { SoundManager } from './Sound';

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
}

export class ProjectilesManager {
  private scene: THREE.Scene;
  private sound: SoundManager;
  private projectiles: Projectile[] = [];

  constructor(scene: THREE.Scene, sound: SoundManager) {
    this.scene = scene;
    this.sound = sound;
  }

  fire(origin: THREE.Vector3, direction: THREE.Vector3) {
    const geo = new THREE.SphereGeometry(0.15, 10, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffff88, emissive: 0x333300, metalness: 0.2, roughness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const velocity = direction.normalize().multiplyScalar(60);
    const lifetime = 2.0;
    this.projectiles.push({ mesh, velocity, lifetime });
    this.sound.playShoot();

    // Muzzle flash
    const flash = new THREE.PointLight(0xffee88, 1.8, 12);
    flash.position.copy(origin);
    this.scene.add(flash);
    setTimeout(() => this.scene.remove(flash), 80);
  }

  update(dt: number, targets: THREE.Object3D[]) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.lifetime -= dt;

      // Check collisions with balloons
      for (const t of targets) {
        const dist = p.mesh.position.distanceTo(t.position);
        if (dist < 0.9) {
          // Signal the balloon manager via event on target object
          (t as any)._pop?.();
          this.disposeProjectile(i);
          break;
        }
      }

      if (p.lifetime <= 0) {
        this.disposeProjectile(i);
      }
    }
  }

  private disposeProjectile(index: number) {
    const p = this.projectiles[index];
    this.scene.remove(p.mesh);
    this.projectiles.splice(index, 1);
  }
}


