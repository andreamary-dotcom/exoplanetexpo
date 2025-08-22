export class Sidebar {
  constructor(root, hooks = {}) {
    this.root = root;
    this.hooks = hooks;

    this.root.innerHTML = `
      <div class="brand">
        <div class="dot"></div>
        <div>
          <h1>Chronicles of Exoplanet Exploration</h1>
          <small>V1 • Vite + Three.js</small>
        </div>
      </div>

      <div class="panel" id="home-panel">
        <h2>Explore</h2>
        <p class="fact">Click any exoplanet to enter its scene. Press <span class="badge">Esc</span> to go back.</p>
      </div>

      <div class="panel">
        <h2>Game Options</h2>
        <ul class="clean">
          <li class="item" id="btn-quiz">🧠 Quick Quiz (MCQ)</li>
          <li class="item" title="Coming soon">🧩 Match the Facts <span class="badge">Soon</span></li>
          <li class="item" title="Coming soon">⚡ Speed Run <span class="badge">Soon</span></li>
        </ul>
      </div>

      <div class="panel" id="planet-panel" style="display:none">
        <h2 id="planet-name">Exoplanet</h2>
        <div id="planet-facts"></div>
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button class="btn" id="start-quiz">Start Quiz</button>
          <button class="btn" id="back-btn">Back to Universe</button>
        </div>
      </div>
    `;

    this.root.querySelector('#btn-quiz').addEventListener('click', () => this.hooks.onStartQuiz?.());
    this.root.querySelector('#start-quiz').addEventListener('click', () => this.hooks.onStartQuiz?.());
    this.root.querySelector('#back-btn').addEventListener('click', () => this.hooks.onBack?.());
  }

  setActivePlanet(planet) {
    const nameEl = this.root.querySelector('#planet-name');
    if (nameEl) nameEl.textContent = planet.name;
  }

  showPlanetPanel(planet) {
    const pp = this.root.querySelector('#planet-panel');
    const hp = this.root.querySelector('#home-panel');
    pp.style.display = 'block';
    hp.style.display = 'none';

    const factsEl = this.root.querySelector('#planet-facts');
    factsEl.innerHTML = `
      <p class="fact">Approx. size scale: <b>${planet.size}</b></p>
      <p class="fact">Color hint: <b>#${planet.color.toString(16).padStart(6, '0')}</b></p>
      <p class="fact">Tip: Rotate & zoom to inspect surface lighting.</p>
    `;
  }

  showHome() {
    const pp = this.root.querySelector('#planet-panel');
    const hp = this.root.querySelector('#home-panel');
    pp.style.display = 'none';
    hp.style.display = 'block';
  }
}
