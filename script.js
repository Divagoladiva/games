const playersKey = 'mini-Jeux-host-players';
const maxPlayers = 6;

const playerName = document.getElementById('player-name');
const playerColor = document.getElementById('player-color');
const addBtn = document.getElementById('add-player');
const playersList = document.getElementById('players-list');

let players = [];
const marioPourtyKey = 'marioPourty';

function getMarioPourty() {
  return localStorage.getItem(marioPourtyKey) === 'true';
}

function setMarioPourty(enabled) {
  localStorage.setItem(marioPourtyKey, enabled ? 'true' : 'false');
}

function loadMarioPourtyToggle() {
  const toggle = document.getElementById('mario-pourty-toggle');
  if (!toggle) return;
  const applyState = () => { toggle.checked = getMarioPourty(); };
  applyState();
  toggle.addEventListener('change', () => setMarioPourty(toggle.checked));
  // ensure state is correct when navigating back/forward (bfcache/pageshow)
  window.addEventListener('pageshow', () => applyState());
}

function loadPlayers () {
  const stored = localStorage.getItem(playersKey);
  if (stored) {
    try { players = JSON.parse(stored) || []; } catch (e) { players = []; }
  }
}

function savePlayers () {
  localStorage.setItem(playersKey, JSON.stringify(players));
}

function renderPlayers () {
  playersList.innerHTML = '';
  if (players.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Aucun joueur ajouté pour le moment.';
    empty.className = 'empty';
    playersList.appendChild(empty);
    return;
  }

  players.forEach((player, i) => {
    const card = document.createElement('div');
    card.className = 'player-card';

    const item = document.createElement('div');
    item.className = 'player-item';

    const colorLed = document.createElement('span');
    colorLed.className = 'player-color-led';
    colorLed.style.backgroundColor = player.color;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'player-name';
    nameSpan.textContent = player.name;

    item.appendChild(colorLed);
    item.appendChild(nameSpan);
    card.appendChild(item);

    const actions = document.createElement('div');
    actions.className = 'player-actions';

    const edit = document.createElement('button');
    edit.textContent = 'Modifier';
    edit.addEventListener('click', () => startEditPlayer(i));

    const remove = document.createElement('button');
    remove.textContent = 'Supprimer';
    remove.addEventListener('click', () => {
      if (confirm(`Supprimer ${player.name} ?`)) {
        players.splice(i, 1);
        savePlayers();
        renderPlayers();
      }
    });

    actions.appendChild(edit);
    actions.appendChild(remove);
    card.appendChild(actions);

    playersList.appendChild(card);
  });
}

function startEditPlayer(index) {
  const p = players[index];
  const newName = prompt('Modifier pseudo', p.name);
  if (newName === null) return;
  const cleanName = newName.trim();
  if (!cleanName) { alert('Le pseudo ne peut pas être vide.'); return; }

  p.name = cleanName;
  savePlayers();
  renderPlayers();
}

addBtn.addEventListener('click', () => {
  if (players.length >= maxPlayers) {
    alert(`Limite atteinte : ${maxPlayers} joueurs.`);
    return;
  }

  const name = playerName.value.trim();
  const color = playerColor.value;

  if (!name) {
    alert('Entrez un pseudo valide.');
    return;
  }

  players.push({ name, color });
  playerName.value = '';

  savePlayers();
  renderPlayers();
});

const mainContainer = document.querySelector('.container');
const listOverlay = document.getElementById('list-overlay');
const randomOverlay = document.getElementById('random-overlay');
const gamesCardGrid = document.getElementById('games-card-grid');
const randomResult = document.getElementById('random-result');
const spinWheelBtn = document.getElementById('spin-wheel');
const wheelCanvas = document.getElementById('wheel-canvas');
let isSpinning = false;
let currentAnimation = null;

function showOverlay(overlay) {
  mainContainer.classList.add('hidden');
  listOverlay.classList.add('hidden');
  randomOverlay.classList.add('hidden');
  overlay.classList.remove('hidden');
}

function closeOverlay() {
  mainContainer.classList.remove('hidden');
  listOverlay.classList.add('hidden');
  randomOverlay.classList.add('hidden');
  randomResult.textContent = '';
  isSpinning = false;

  const winner = document.getElementById('winner-overlay');
  const randomContent = document.getElementById('random-content');
  if (winner) winner.classList.add('hidden');
  if (randomContent) randomContent.style.visibility = 'visible';
  if (currentAnimation) cancelAnimationFrame(currentAnimation);
}

const gameColors = ['#ff5f72','#6a82fb','#48c6ef','#7bffb1','#ffbd55','#e96dff','#ff8c42','#6b6b6b','#2e1197', '#f8fa6f'];

function showGameListOverlay() {
  mainContainer.classList.add('hidden');
  randomOverlay.classList.add('hidden');
  listOverlay.classList.remove('hidden');
}

function showRandomOverlay() {
  mainContainer.classList.add('hidden');
  listOverlay.classList.add('hidden');
  randomOverlay.classList.remove('hidden');
}

function renderGameCards() {
  gamesCardGrid.innerHTML = '';
  const itemCount = games.length;
  gamesCardGrid.className = 'games-card-grid card-size-' + Math.min(itemCount, 4);

  games.forEach((game, index) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    const gameColor = gameColors[index % gameColors.length];
    card.style.borderColor = gameColor;
    card.innerHTML = `<h3>${game.title}</h3><p>${game.description}</p>`;

    card.addEventListener('mouseenter', () => {
      card.querySelector('p').style.opacity = '1';
      card.querySelector('p').style.maxHeight = '3.2rem';
    });
    card.addEventListener('mouseleave', () => {
      card.querySelector('p').style.opacity = '0';
      card.querySelector('p').style.maxHeight = '0';
    });

    card.addEventListener('click', () => {
      window.location.href = game.file;
    });

    gamesCardGrid.appendChild(card);
  });
}

function drawWheel(angle) {
  const ctx = wheelCanvas.getContext('2d');
  const radius = wheelCanvas.width / 2 - 10;
  const center = wheelCanvas.width / 2;
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  const sliceAngle = (Math.PI * 2) / games.length;

  games.forEach((game, index) => {
    const startA = angle + index * sliceAngle;
    const endA = startA + sliceAngle;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startA, endA);
    ctx.closePath();

    const fillPalette = ['#ff5f72', '#6a82fb', '#48c6ef', '#7bffb1', '#ffbd55', '#e96dff', 'rgb(255, 106, 163)', 'rgb(255, 155, 116)', 'rgb(132, 255, 116)', 'rgb(165, 116, 255)'];
    ctx.fillStyle = fillPalette[index % fillPalette.length];
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startA + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillText(game.title, radius - 12, 6);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,.3)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function renderRandomWheel() {
  drawWheel(0);
}

function startParticleBurst() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.clientWidth / 2,
      y: canvas.clientHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16,
      size: 1 + Math.random() * 2,
      life: 1
    });
  }

  const duration = 700;
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    particles.forEach(p => {
      if (p.life > 0) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= 0.02;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0,p.life)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
      }
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
  }

  requestAnimationFrame(animate);
}

function showWinnerOverlay(game) {
  const winner = document.getElementById('winner-overlay');
  const title = document.getElementById('winner-title');
  const desc = document.getElementById('winner-desc');
  const randomContent = document.getElementById('random-content');

  title.textContent = game.title;
  desc.textContent = game.description;
  if (randomContent) randomContent.style.visibility = 'hidden';
  winner.classList.remove('hidden');

  setTimeout(() => {
    window.location.href = game.file;
  }, 5000);
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  randomResult.textContent = 'Tourne...';
  startParticleBurst();

  const targetIndex = Math.floor(Math.random() * games.length);
  const sliceAngle = (Math.PI * 2) / games.length;
  const fullSpins = 6;
  const targetAngle = fullSpins * 2 * Math.PI + (Math.PI * 1.5) - (targetIndex + 0.5) * sliceAngle;

  const duration = 6000;
  const start = performance.now();
  const initAngle = 0;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);
    const currentAngle = initAngle + (targetAngle - initAngle) * eased;
    drawWheel(currentAngle);

    if (progress < 1) {
      currentAnimation = requestAnimationFrame(frame);
    } else {
      isSpinning = false;
      const selected = games[targetIndex];
      randomResult.textContent = `Jeu choisi : ${selected.title}`;
      showWinnerOverlay(selected);
    }
  }

  currentAnimation = requestAnimationFrame(frame);
}


function initGameControls() {
  document.getElementById('list-game').addEventListener('click', () => {
    renderGameCards();
    showOverlay(listOverlay);
  });

  document.getElementById('random-game').addEventListener('click', () => {
    renderRandomWheel();
    showOverlay(randomOverlay);
  });

  document.querySelectorAll('.close-overlay').forEach(btn => {
    btn.addEventListener('click', closeOverlay);
  });

  spinWheelBtn.addEventListener('click', spinWheel);
}

function initCollapsibles() {
  document.querySelectorAll('.panel.collapsible').forEach(panel => {
    const btn = panel.querySelector('.toggle-btn');
    btn.addEventListener('click', () => {
      const isOpen = panel.getAttribute('data-open') === 'true';
      panel.setAttribute('data-open', isOpen ? 'false' : 'true');
      btn.textContent = isOpen ? '⬇️' : '⬆️';
    });
  });
}

window.addEventListener('load', () => {
  loadPlayers();
  renderPlayers();
  initCollapsibles();
  initGameControls();
  loadMarioPourtyToggle();
});
