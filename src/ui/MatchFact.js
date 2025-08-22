// /src/ui/MatchFact.js
// Flashcard-style "Match the Facts" (True/False) modal

let els = {};
let state = {
  planetName: 'Exoplanet',
  deck: [],
  i: 0,
  score: 0,
  answered: false
};

// Simple fact decks for the 5 planets in your UniverseScene
const DECKS = {
  'Kepler-22b': [
    { text: 'Kepler-22b orbits within the habitable zone of its star.', answer: true,  note: 'It was one of the first confirmed potentially habitable-zone planets.' },
    { text: 'Kepler-22b is a confirmed gas giant like Jupiter.',        answer: false, note: 'It’s likely a super-Earth or mini-Neptune; composition not fully known.' },
    { text: 'It was discovered via the transit method.',                answer: true,  note: 'Kepler space telescope measured periodic dips in starlight.' },
    { text: 'Kepler-22b orbits our Sun.',                               answer: false, note: 'It orbits a distant Sun-like star, not our Sun.' },
  ],
  'TRAPPIST-1e': [
    { text: 'TRAPPIST-1e is one of seven known planets around TRAPPIST-1.', answer: true,  note: 'The TRAPPIST-1 system has seven Earth-sized planets.' },
    { text: 'TRAPPIST-1e is considered a hot Jupiter.',                      answer: false, note: 'It’s an Earth-sized rocky world, not a gas giant.' },
    { text: 'It likely receives strong tidal effects from its star.',        answer: true,  note: 'Close-in orbits around a cool red dwarf → tidal locking likely.' },
    { text: 'It was first found by direct imaging.',                          answer: false, note: 'Primarily detected via transit photometry.' },
  ],
  'Proxima b': [
    { text: 'Proxima b is the closest known exoplanet to Earth.',            answer: true,  note: 'It orbits Proxima Centauri, the nearest star to the Sun.' },
    { text: 'Proxima b was discovered by the transit method.',               answer: false, note: 'It was discovered via radial velocity (stellar wobble).' },
    { text: 'Its star is a red dwarf that flares frequently.',               answer: true,  note: 'Proxima Centauri is an active M-dwarf.' },
    { text: 'Proxima b takes about 11 Earth days to orbit its star.',        answer: true,  note: 'Very short orbital period compared to Earth.' },
  ],
  'HD 209458b': [
    { text: 'HD 209458b is a classic “hot Jupiter”.',                        answer: true,  note: 'A gas giant in a very close-in orbit.' },
    { text: 'It has an escaping atmosphere detected during transit.',        answer: true,  note: 'One of the first with atmospheric evaporation observed.' },
    { text: 'It lies in its star’s habitable zone.',                         answer: false, note: 'Way too close/hot for the classic habitable zone.' },
    { text: 'It is a small rocky planet.',                                   answer: false, note: 'It’s a large gas giant.' },
  ],
  'Gliese 581g': [
    { text: 'Gliese 581g’s existence has been debated.',                     answer: true,  note: 'Its detection has been controversial over the years.' },
    { text: 'It orbits the red dwarf Gliese 581.',                           answer: true,  note: 'Part of the Gliese 581 system (if it exists).' },
    { text: 'It is definitively confirmed by multiple teams.',               answer: false, note: 'Not definitively confirmed; evidence is mixed.' },
    { text: 'It is a confirmed gas giant.',                                  answer: false, note: 'If real, it would be a super-Earth candidate, not a gas giant.' },
  ]
};

// Fallback deck if we don’t recognize the planet name
function defaultDeck(name = 'Exoplanet') {
  return [
    { text: `${name} has at least one property we can observe indirectly (transit or wobble).`, answer: true,  note: 'Exoplanet detection relies on indirect effects on starlight.' },
    { text: `${name} is guaranteed to be habitable.`,                                           answer: false, note: 'Habitability requires many conditions; few are guaranteed.' },
    { text: `We often estimate ${name}'s size or mass with models.`,                             answer: true,  note: 'Models + limited signals → inferred properties.' },
    { text: `${name} orbits the Sun.`,                                                          answer: false, note: 'By definition, exoplanets orbit other stars.' },
  ];
}

function getDeck(planetName) {
  return DECKS[planetName] ? [...DECKS[planetName]] : defaultDeck(planetName);
}

function buildOnce() {
  if (document.getElementById('matchfact-modal')) return;

  // Styles specific to this modal
  const style = document.createElement('style');
  style.innerHTML = `
    /* Match a Fact flashcard tweaks */
    #matchfact-modal .flashcard {
      margin: 10px 0 12px;
      padding: 16px;
      border-radius: 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      min-height: 72px;
      display: flex;
      align-items: center;
      line-height: 1.4;
    }
    #matchfact-modal .muted { color: #94a3b8; font-size: 12px; }
    #matchfact-modal .row { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
    #matchfact-modal .tf-grid { display: flex; gap: 8px; }
    #matchfact-modal .btn.primary { border-color: rgba(122,162,255,0.6); }
    #matchfact-modal .btn.warn { border-color: rgba(255,122,182,0.6); }
    #matchfact-modal .end-box {
      margin-top: 8px; padding: 12px; border-radius: 12px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    }
  `;
  document.head.appendChild(style);

  const overlay = document.getElementById('overlay');
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'matchfact-modal';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="row">
        <h3 id="mf-title" style="margin:0;font-size:16px;">Match the Facts</h3>
        <button class="btn" id="mf-close">Close</button>
      </div>
      <div id="mf-progress" class="muted"></div>
      <div class="flashcard" id="mf-card"><p id="mf-text" style="margin:0"></p></div>
      <div class="tf-grid" style="margin-top:8px;">
        <button class="btn primary" id="mf-true">True</button>
        <button class="btn warn" id="mf-false">False</button>
        <button class="btn" id="mf-next">Next</button>
      </div>
      <div id="mf-feedback" class="result" style="min-height:22px;"></div>
    </div>
  `;
  overlay.appendChild(modal);

  // element refs
  els = {
    modal,
    title: modal.querySelector('#mf-title'),
    progress: modal.querySelector('#mf-progress'),
    text: modal.querySelector('#mf-text'),
    feedback: modal.querySelector('#mf-feedback'),
    btnTrue: modal.querySelector('#mf-true'),
    btnFalse: modal.querySelector('#mf-false'),
    btnNext: modal.querySelector('#mf-next'),
    btnClose: modal.querySelector('#mf-close'),
  };

  // events
  els.btnClose.addEventListener('click', hide);
  els.btnTrue.addEventListener('click', () => choose(true));
  els.btnFalse.addEventListener('click', () => choose(false));
  els.btnNext.addEventListener('click', next);

  // keyboard helpers
  window.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key.toLowerCase() === 't') choose(true);
    if (e.key.toLowerCase() === 'f') choose(false);
    if (e.key === 'Enter' || e.key === ' ') next();
    if (e.key === 'Escape') hide();
  });
}

function isOpen() {
  return els.modal?.classList.contains('show');
}

function show() {
  els.modal.classList.add('show');
}
function hide() {
  els.modal.classList.remove('show');
}

// Rendering & flow
function render() {
  const { planetName, deck, i, score, answered } = state;

  // End screen
  if (i >= deck.length) {
    els.title.textContent = `${planetName} • Flashcards`;
    els.progress.innerHTML = `Done • Score: <b>${score}/${deck.length}</b>`;
    els.text.textContent = `Great job!`;
    els.feedback.innerHTML = `
      <div class="end-box">
        You answered <b>${score}</b> of <b>${deck.length}</b> correctly.
      </div>
    `;
    // turn "Next" into "Restart"
    els.btnTrue.disabled = true;
    els.btnFalse.disabled = true;
    els.btnNext.textContent = 'Restart';
    return;
  }

  // Normal card
  const card = deck[i];
  els.title.textContent = `${planetName} • Flashcards`;
  els.progress.textContent = `Card ${i + 1} / ${deck.length} • Score ${score}`;
  els.text.textContent = card.text;
  els.feedback.textContent = '';

  els.btnTrue.disabled = false;
  els.btnFalse.disabled = false;
  els.btnNext.textContent = (i === deck.length - 1) ? 'Finish' : 'Next';

  if (!answered) els.btnTrue.focus();
}

function choose(userAnswer) {
  if (state.i >= state.deck.length) return;
  if (state.answered) return;

  const card = state.deck[state.i];
  const correct = card.answer === userAnswer;
  if (correct) state.score += 1;

  state.answered = true;
  els.feedback.textContent = correct ? 'Correct ✅' : 'Incorrect ❌';
  if (card.note) {
    const note = document.createElement('div');
    note.className = 'muted';
    note.style.marginTop = '4px';
    note.textContent = card.note;
    els.feedback.appendChild(note);
  }

  els.btnTrue.disabled = true;
  els.btnFalse.disabled = true;
  els.btnNext.focus();
}

function next() {
  // Restart if finished
  if (state.i >= state.deck.length) {
    state.i = 0;
    state.score = 0;
    state.answered = false;
    render();
    return;
  }
  // If not answered, just move on (optional behavior)
  state.i += 1;
  state.answered = false;
  render();
}

// Public API
export function initMatchFactPanel() {
  buildOnce();
}

export function openMatchFactForPlanet(planet) {
  buildOnce();
  const name = typeof planet === 'string' ? planet : (planet?.name || 'Exoplanet');
  state.planetName = name;
  state.deck = getDeck(name);
  state.i = 0;
  state.score = 0;
  state.answered = false;
  render();
  show();
}
