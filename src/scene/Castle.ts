import * as THREE from 'three';

export function createCastle(onPatrolFire?: (origin: THREE.Vector3, dir: THREE.Vector3) => void) {
  const root = new THREE.Group();

  // Mountain base
  const mountainGeo = new THREE.ConeGeometry(80, 60, 8);
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x5b6e73, roughness: 1 });
  const mountain = new THREE.Mesh(mountainGeo, mountainMat);
  mountain.position.y = -10;
  mountain.receiveShadow = true;
  root.add(mountain);

  // Plateau
  const plateauGeo = new THREE.CylinderGeometry(48, 55, 6, 16);
  const plateauMat = new THREE.MeshStandardMaterial({ color: 0x6f7f86 });
  const plateau = new THREE.Mesh(plateauGeo, plateauMat);
  plateau.position.y = 6;
  plateau.receiveShadow = true;
  root.add(plateau);

  // Inner ground
  const innerGroundGeo = new THREE.CircleGeometry(36, 32);
  const innerGroundMat = new THREE.MeshStandardMaterial({ color: 0x7aa36f });
  const innerGround = new THREE.Mesh(innerGroundGeo, innerGroundMat);
  innerGround.rotation.x = -Math.PI / 2;
  innerGround.position.y = 9;
  innerGround.receiveShadow = true;

  // Castle walls
  const wallHeight = 12;
  const wallGeo = new THREE.CylinderGeometry(40, 40, wallHeight, 24, 1, true);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbfb5a8, roughness: 0.9, side: THREE.DoubleSide });
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 9 + wallHeight / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  root.add(walls);

  // Crenellations
  const crenelGeo = new THREE.BoxGeometry(3, 2, 2);
  const crenelMat = new THREE.MeshStandardMaterial({ color: 0xd8d1c6 });
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const c = new THREE.Mesh(crenelGeo, crenelMat);
    c.position.set(Math.cos(angle) * 39.5, walls.position.y + wallHeight / 2 + 1, Math.sin(angle) * 39.5);
    c.rotation.y = -angle;
    c.castShadow = true;
    root.add(c);
  }

  // Towers
  const towerPositions = [
    new THREE.Vector3(28, 9, 28),
    new THREE.Vector3(-28, 9, 28),
    new THREE.Vector3(28, 9, -28),
    new THREE.Vector3(-28, 9, -28)
  ];
  towerPositions.forEach((p) => {
    const tower = createTower();
    tower.position.copy(p);
    root.add(tower);
  });

  // Gate
  const gate = createGate();
  gate.position.set(0, 9, 40);
  root.add(gate);

  // Courtyard buildings
  for (let i = 0; i < 6; i++) {
    const house = createHouse();
    const r = 20 + Math.random() * 12;
    const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
    house.position.set(Math.cos(angle) * r, 10.5, Math.sin(angle) * r);
    house.rotation.y = Math.random() * Math.PI * 2;
    root.add(house);
  }

  // Patrols with cannons
  const patrols = createPatrolsOnWall(39.5, walls.position.y + wallHeight / 2 + 1, onPatrolFire);
  root.add(patrols);

  (root as any).update = (dt: number) => {
    (patrols as any).update?.(dt);
  };

  return { root, innerGround };
}

function createTower() {
  const g = new THREE.Group();
  const baseGeo = new THREE.CylinderGeometry(6, 8, 20, 12);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xbfb5a8, roughness: 0.9 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const topGeo = new THREE.ConeGeometry(7, 8, 12);
  const topMat = new THREE.MeshStandardMaterial({ color: 0x8055aa });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 14;
  top.castShadow = true;
  g.add(top);

  return g;
}

function createGate() {
  const g = new THREE.Group();
  const archGeo = new THREE.BoxGeometry(12, 10, 4);
  const archMat = new THREE.MeshStandardMaterial({ color: 0xbfb5a8 });
  const arch = new THREE.Mesh(archGeo, archMat);
  arch.position.y = 13;
  arch.castShadow = true;
  g.add(arch);

  const doorGeo = new THREE.BoxGeometry(6, 8, 1);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x553311 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 11, 2.5);
  door.castShadow = true;
  g.add(door);

  return g;
}

function createHouse() {
  const g = new THREE.Group();
  const baseGeo = new THREE.BoxGeometry(6, 4, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xd1c4b8 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const roofGeo = new THREE.ConeGeometry(5, 3, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xaa5544 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 3.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  return g;
}

function createPatrolsOnWall(radius: number, y: number, onFire?: (origin: THREE.Vector3, dir: THREE.Vector3) => void) {
  const group = new THREE.Group();
  const patrolCount = 6;
  for (let i = 0; i < patrolCount; i++) {
    const angle = (i / patrolCount) * Math.PI * 2;
    const p = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2, 3, 2),
      new THREE.MeshStandardMaterial({ color: 0x445566 })
    );
    body.position.y = y + 1.5;
    body.castShadow = true;
    p.add(body);

    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.6 })
    );
    cannon.rotation.z = Math.PI / 2;
    cannon.position.set(1.8, y + 1.5, 0);
    cannon.castShadow = true;
    p.add(cannon);
    (p as any).cannon = cannon;

    p.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    p.userData = { angle };
    group.add(p);
  }

  // Animate patrols
  const tmpClock = { t: 0 } as any;
  (group as any).update = (dt: number) => {
    tmpClock.t += dt;
    group.children.forEach((p, idx) => {
      const speed = 0.1 + 0.05 * (idx % 3);
      const a = (p.userData.angle += speed * dt);
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      p.position.x = x;
      p.position.z = z;
      p.lookAt(0, y, 0);

      // Periodic cannon fire
      if (onFire && Math.random() < 0.002) {
        const cannon = (p as any).cannon as THREE.Object3D;
        const origin = new THREE.Vector3().setFromMatrixPosition(cannon.matrixWorld);
        const dir = new THREE.Vector3().subVectors(new THREE.Vector3(0, y, 0), origin).normalize();
        onFire(origin, dir.add(new THREE.Vector3((Math.random()-0.5)*0.3, 0.05, (Math.random()-0.5)*0.3)));
      }
    });
  };

  return group;
}


