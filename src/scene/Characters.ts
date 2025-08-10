import * as THREE from 'three';
import { UIOverlay } from '../ui/Overlay';

export interface Character {
  name: string;
  mesh: THREE.Object3D;
}

export class CharactersManager {
  private scene: THREE.Scene;
  private ui: UIOverlay;
  private characters: Character[] = [];
  private highlight?: THREE.Mesh;

  private tmpVec = new THREE.Vector3();

  constructor(scene: THREE.Scene, ui: UIOverlay) {
    this.scene = scene;
    this.ui = ui;
  }

  spawnDefaultNPCs() {
    const specs = [
      { name: 'Captain Aria', color: 0x7aa3ff, pos: new THREE.Vector3(10, 10.5, 6) },
      { name: 'Stable Master Rook', color: 0xffa359, pos: new THREE.Vector3(-12, 10.5, -8) },
      { name: 'Merchant Lysa', color: 0xa9ff7a, pos: new THREE.Vector3(6, 10.5, -10) },
    ];
    for (const s of specs) {
      const mesh = this.createCharacterMesh(s.color);
      mesh.position.copy(s.pos);
      this.scene.add(mesh);
      this.characters.push({ name: s.name, mesh });
    }
  }

  private createCharacterMesh(color: number) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.7, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({ color })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffe0bd })
    );
    head.position.y = 1.3;
    head.castShadow = true;
    g.add(head);

    // Simple name tag billboard
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Talk', canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const label = new THREE.Sprite(mat);
    label.position.set(0, 2.2, 0);
    label.scale.set(2.2, 0.55, 1);
    g.add(label);

    return g;
  }

  trySelect(raycaster: THREE.Raycaster): boolean {
    const objects = this.characters.map((c) => c.mesh);
    const hits = raycaster.intersectObjects(objects, true);
    if (!hits.length) return false;
    const hitObj = hits[0].object;
    const char = this.characters.find((c) => hitObj === c.mesh || c.mesh.children.includes(hitObj));
    if (!char) return false;

    this.showDialogue(char);
    this.highlightCharacter(char);
    return true;
  }

  private showDialogue(char: Character) {
    const responses = [
      `${char.name}: The winds carry tales of distant battles.`,
      `${char.name}: Keep your eyes on the sky—balloons mean practice!`,
      `${char.name}: You handle that bow as if it were part of you.`
    ];
    this.ui.openDialogue(char.name, responses[Math.floor(Math.random() * responses.length)], (text) => {
      const reply = this.generateReply(char, text);
      this.ui.updateDialogueBody(reply);
    });
  }

  private generateReply(char: Character, playerText: string) {
    const lower = playerText.toLowerCase();
    if (lower.includes('balloon')) return `${char.name}: Aim ahead of the drift. And trust your instincts.`;
    if (lower.includes('castle')) return `${char.name}: These stones stood against storms and tyrants alike.`;
    if (lower.includes('hello') || lower.includes('hi')) return `${char.name}: Greetings. The day favors the bold.`;
    return `${char.name}: Interesting. Perhaps the bards will sing of it.`;
  }

  private highlightCharacter(char: Character) {
    if (this.highlight) {
      this.scene.remove(this.highlight);
      this.highlight = undefined;
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.07, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x6c8cff })
    );
    ring.position.copy(char.mesh.position);
    ring.position.y = char.mesh.position.y - 0.9;
    this.scene.add(ring);
    this.highlight = ring;
  }

  update(dt: number) {
    // Idle bob for characters
    for (const c of this.characters) {
      c.mesh.position.y += Math.sin((performance.now() / 1000) + c.mesh.id) * 0.002;
    }
  }
}


