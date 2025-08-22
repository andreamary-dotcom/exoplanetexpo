export class QuizManager {
  constructor(overlayRoot) {
    this.overlayRoot = overlayRoot;
    this.state = { i: 0, score: 0, list: [] };

    this.overlayRoot.innerHTML = `
      <div class="modal" id="quiz-modal">
        <div class="modal-card">
          <h3 id="q-title">Quiz</h3>
          <p id="q-text"></p>
          <div id="q-options"></div>
          <div class="result" id="q-result"></div>
          <div class="footer">
            <button class="btn" id="next-btn">Next</button>
            <button class="btn" id="close-btn">Close</button>
          </div>
        </div>
      </div>
    `;

    this.modal = this.overlayRoot.querySelector('#quiz-modal');
    this.qTitle = this.overlayRoot.querySelector('#q-title');
    this.qText = this.overlayRoot.querySelector('#q-text');
    this.qOptions = this.overlayRoot.querySelector('#q-options');
    this.qResult = this.overlayRoot.querySelector('#q-result');
    this.nextBtn = this.overlayRoot.querySelector('#next-btn');
    this.closeBtn = this.overlayRoot.querySelector('#close-btn');

    this.nextBtn.addEventListener('click', () => this._next());
    this.closeBtn.addEventListener('click', () => this._close());
  }

  _bank(planet) {
    // super-basic sample questions; customize later
    return [
      {
        q: `${planet}: What method commonly finds transiting exoplanets?`,
        options: ['Gravitational lensing', 'Transit (light dip)', 'Parallax drift', 'Solar wind tracking'],
        answer: 1
      },
      {
        q: `${planet}: A "hot Jupiter" is mostly…`,
        options: ['Rock and metal', 'Ice only', 'Gas giant very close to star', 'Dwarf planet'],
        answer: 2
      },
      {
        q: `${planet}: Habitability depends MOST on…`,
        options: ['Star color alone', 'Distance + atmosphere', 'Number of moons', 'Ring brightness'],
        answer: 1
      }
    ];
  }

  start(planetName = 'Exoplanet') {
    this.state = { i: 0, score: 0, list: this._bank(planetName), planetName };
    this._show();
    this._render();
  }

  _render() {
    const { i, list } = this.state;
    if (i >= list.length) {
      this.qTitle.textContent = `Quiz Complete`;
      this.qText.textContent = `Your score: ${this.state.score} / ${list.length}`;
      this.qOptions.innerHTML = '';
      this.qResult.textContent = '';
      this.nextBtn.textContent = 'Restart';
      return;
    }
    this.qTitle.textContent = `${this.state.planetName} • Question ${i + 1}/${list.length}`;
    this.qText.textContent = list[i].q;
    this.qOptions.innerHTML = '';
    this.qResult.textContent = '';

    list[i].options.forEach((opt, idx) => {
      const div = document.createElement('div');
      div.className = 'option';
      div.textContent = opt;
      div.onclick = () => this._choose(idx);
      this.qOptions.appendChild(div);
    });
    this.nextBtn.textContent = i === list.length - 1 ? 'Finish' : 'Next';
  }

  _choose(idx) {
    const { i, list } = this.state;
    if (i >= list.length) return;
    const correct = list[i].answer === idx;
    if (correct) this.state.score += 1;
    this.qResult.textContent = correct ? 'Correct ✅' : `Oops! Correct: ${list[i].options[list[i].answer]}`;
  }

  _next() {
    const { i, list } = this.state;
    if (i >= list.length) {
      // restart
      this.state.i = 0;
      this.state.score = 0;
    } else {
      this.state.i += 1;
    }
    this._render();
  }

  _show() {
    this.modal.classList.add('show');
  }

  _close() {
    this.modal.classList.remove('show');
  }
}
