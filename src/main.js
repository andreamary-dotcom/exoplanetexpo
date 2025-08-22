
import { SceneManager } from './scene/SceneManager.js';
import { Sidebar } from './ui/Sidebar.js';
import { QuizManager } from './ui/QuizManager.js';

const mount = document.getElementById('canvas-wrap');
const sidebarEl = document.getElementById('sidebar');
const overlayEl = document.getElementById('overlay');

// core managers
const quiz = new QuizManager(overlayEl);
const scenes = new SceneManager(mount, {
  onPlanetSelected: (planet) => {
    sidebar.setActivePlanet(planet);
    sidebar.showPlanetPanel(planet);
  },
  onBackToUniverse: () => {
    sidebar.showHome();
  }
});

// sidebar
const sidebar = new Sidebar(sidebarEl, {
  onStartQuiz: () => {
    const p = scenes.getActivePlanet();
    quiz.start(p?.name || 'Exoplanet');
  },
  onBack: () => scenes.toUniverse()
});

// initial
scenes.toUniverse();
sidebar.showHome();

// Expose for debugging if you want in console
window.__app = { scenes, quiz, sidebar };
