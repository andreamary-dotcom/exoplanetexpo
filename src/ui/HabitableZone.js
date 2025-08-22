// src/ui/HZChallenge.js
let panelEl;

export function initHZChallengePanel() {
  // Create container panel (not fullscreen)
  panelEl = document.createElement("div");
  panelEl.id = "hz-challenge-panel";
  panelEl.style.display = "none";
  panelEl.style.position = "absolute";
  panelEl.style.right = "10px";
  panelEl.style.top = "60px";
  panelEl.style.width = "350px";
  panelEl.style.height = "400px";
  panelEl.style.background = "#111";
  panelEl.style.border = "2px solid #444";
  panelEl.style.borderRadius = "10px";
  panelEl.style.color = "white";
  panelEl.style.padding = "15px";
  panelEl.style.zIndex = "500"; // stays above universe, below overlay
  panelEl.innerHTML = `
    <h3 style="margin-top:0;">🌍 Habitable Zone Challenge</h3>
    <p>Drag the planets into the star’s habitable zone.</p>
    <div id="hz-game-area" style="margin:10px; padding:10px; background:#222; border-radius:8px; height:250px;">
      (game area placeholder)
    </div>
    <button id="hz-close-btn" style="margin-top:10px; padding:6px 12px; border:none; border-radius:6px; background:#444; color:white; cursor:pointer;">
      Close
    </button>
  `;
  document.body.appendChild(panelEl);

  panelEl.querySelector("#hz-close-btn").addEventListener("click", () => {
    panelEl.style.display = "none";
  });
}

export function openHZChallenge(planetName) {
  if (!panelEl) return;
  panelEl.style.display = "block";
  panelEl.querySelector("h3").textContent = `🌍 Habitable Zone Challenge – ${planetName || "Exoplanet"}`;
}
