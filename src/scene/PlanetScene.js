import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class PlanetScene {
  constructor(renderer, mount, planet, hooks = {}) {
    this.renderer = renderer;
    this.mount = mount;
    this.hooks = hooks;
    this.planet = planet;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050514);

    this.camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    this.camera.position.set(0, 0.8, 5);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 12;

    // lights
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 3, 2);
    this.scene.add(key);
    this.scene.add(new THREE.AmbientLight(0x334455, 0.6));

    // planet mesh
    const g = new THREE.SphereGeometry(this.planet.size * 1.6, 64, 64);
    const m = new THREE.MeshStandardMaterial({
      color: this.planet.color,
      metalness: 0.05,
      roughness: 0.7
    });
    this.mesh = new THREE.Mesh(g, m);
    this.scene.add(this.mesh);

    // halo
    const haloGeo = new THREE.SphereGeometry(this.planet.size * 1.65, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    this.scene.add(halo);

    // UI text sprite (very simple)
    const label = this._makeLabel(`${planet.name}`);
    label.position.set(0, this.planet.size * 1.9, 0);
    this.scene.add(label);

    // back hint (click right mouse to orbit, escape to go back)
    window.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.hooks.onBack?.();
    });

    // simple auto-rotate
    this.spin = 0.005;

    // mini facts (for sidebar consumption via DOM)
    this.facts = [
      'Type: Likely rocky / mini-Neptune (artist concept).',
      'Estimated temp & habitability vary by model.',
      'Discovered by transit / radial velocity (depends on planet).'
    ];
  }

  _makeLabel(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const pad = 20;
    ctx.font = '28px Inter, Arial';
    const w = ctx.measureText(text).width + pad * 2;
    const h = 48 + pad;
    canvas.width = w; canvas.height = h;
    // draw
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#eaf0ff';
    ctx.font = '28px Inter, Arial';
    ctx.fillText(text, pad, 34);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(w / 100, h / 100, 1);
    return spr;
  }

  update(dt) {
    this.controls.update();
    this.mesh.rotation.y += this.spin;
  }

  dispose() {
    window.removeEventListener('keydown', this._escHandler);
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose?.();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
        else o.material.dispose?.();
      }
    });
  }
}
