import * as THREE from 'three';
import { UniverseScene } from './UniverseScene.js';
import { PlanetScene } from './PlanetScene.js';

export class SceneManager {
  constructor(mount, hooks = {}) {
    this.mount = mount;
    this.hooks = hooks;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.mount.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.active = null;
    this._activePlanet = null;

    window.addEventListener('resize', () => this._resize());
  }

  getActivePlanet() { return this._activePlanet; }

  toUniverse() {
    this._disposeActive();
    this.active = new UniverseScene(this.renderer, this.mount, {
      onSelect: (planet) => {
        this._activePlanet = planet;
        this.toPlanet(planet);
        this.hooks.onPlanetSelected?.(planet);
      }
    });
    this._loop();
    this.hooks.onBackToUniverse?.();
  }

  toPlanet(planet) {
    this._disposeActive();
    this.active = new PlanetScene(this.renderer, this.mount, planet, {
      onBack: () => {
        this.toUniverse();
      }
    });
    this._loop();
  }

  _loop() {
    if (!this.active) return;
    const tick = () => {
      if (!this.active) return;
      const dt = this.clock.getDelta();
      this.active.update(dt);
      this.renderer.render(this.active.scene, this.active.camera);
      this._raf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(tick);
  }

  _resize() {
    if (!this.active) return;
    const w = this.mount.clientWidth, h = this.mount.clientHeight;
    this.active.camera.aspect = w / h;
    this.active.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _disposeActive() {
    if (!this.active) return;
    cancelAnimationFrame(this._raf);
    this.active.dispose?.();
    // clear the renderer / WebGL state
    this.renderer.clear();
    this.active = null;
  }
}
