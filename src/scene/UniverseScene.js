import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

export class UniverseScene {
  constructor(renderer, mount, hooks = {}) {
    this.renderer = renderer;
    this.mount = mount;
    this.hooks = hooks;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02020c);

    this.camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    this.camera.position.set(0, 18, 38);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.2, 0, 2);
    light.position.set(30, 25, 10);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0x445566, 0.6));

    // Stars
    this.starField = this._createStars(6000);
    this.scene.add(this.starField);

    // 5 Exoplanets (simple spheres with distinct colors)
    this.planets = [];
    const data = [
      { name: 'Kepler-22b', color: 0x7aa2ff, pos: [12, 0, 0], size: 1.8 },
      { name: 'TRAPPIST-1e', color: 0xff9a6b, pos: [-16, 5, -6], size: 1.2 },
      { name: 'Proxima b', color: 0x7bffb0, pos: [22, -3, -10], size: 1.5 },
      { name: 'HD 209458b', color: 0xff6b6b, pos: [-26, 0, 12], size: 2.2 },
      { name: 'Gliese 581g', color: 0xf4ff7a, pos: [6, -10, 16], size: 1.4 }
    ];
    data.forEach(d => {
      const g = new THREE.SphereGeometry(d.size, 32, 32);
      const m = new THREE.MeshStandardMaterial({
        color: d.color,
        roughness: 0.6,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(...d.pos);
      mesh.userData = { name: d.name, color: d.color, size: d.size };
      this.scene.add(mesh);
      this.planets.push(mesh);

      // faint orbit ring
      const ring = new THREE.RingGeometry(THREE.MathUtils.randFloat(10, 30), THREE.MathUtils.randFloat(10.2, 30.2), 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x334, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
      const ringMesh = new THREE.Mesh(ring, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = mesh.position.y;
      this.scene.add(ringMesh);
    });

    // Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this._onClick = (e) => this._handleClick(e);
    renderer.domElement.addEventListener('click', this._onClick);

    // GUI
    this.gui = new GUI({ title: 'Universe Controls' });
    this.params = { starDensity: 6000, spin: 0.01, labels: true };
    this.gui.add(this.params, 'spin', 0, 0.05, 0.001).name('Planet Spin');
    this.gui.add(this.params, 'starDensity', 1000, 12000, 500).name('Stars').onChange(v => this._resetStars(v));
  }

  _createStars(count) {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = THREE.MathUtils.randFloatSpread(500);
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const m = new THREE.PointsMaterial({ size: 0.6, color: 0xffffff });
    const stars = new THREE.Points(g, m);
    stars.name = 'stars';
    return stars;
  }

  _resetStars(count) {
    if (this.starField) this.scene.remove(this.starField);
    this.starField = this._createStars(count);
    this.scene.add(this.starField);
  }

  _handleClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets);
    if (hits.length) {
      const obj = hits[0].object;
      const planet = { name: obj.userData.name, color: obj.material.color.getHex(), size: obj.userData.size };
      this.hooks.onSelect?.(planet);
    }
  }

  update(dt) {
    this.controls.update();
    this.planets.forEach(p => p.rotation.y += this.params.spin);
  }

  dispose() {
    this.gui?.destroy();
    this.renderer.domElement.removeEventListener('click', this._onClick);
    // dispose simple objects
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose?.();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
        else o.material.dispose?.();
      }
    });
  }
}
