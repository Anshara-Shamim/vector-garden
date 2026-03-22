import { drawGround }                          from './ground.js';
import { initFlowers, drawFlowers }            from './flowers.js';
import { initFireflies, updateFireflies,
         getFireflyLights, drawFireflies }     from './fireflies.js';
import { initButterflies,
         updateAndDrawButterflies }            from './butterflies.js';

// ---- CANVAS SETUP ----
const canvas  = document.getElementById('garden');
const ctx     = canvas.getContext('2d');
let mouse     = { x: -999, y: -999 };
let t         = 0;

// 1. RESIZE
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ============================================================
// 2. MOUSE desktop
// ============================================================
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = -999;
  mouse.y = -999;
});

// ============================================================
// MOBILE TOUCH SUPPORT
// touchmove  → moves the torch (same as mousemove)
// touchend   → hides the torch when finger lifts
// touch-action: none in CSS prevents page scrolling while touching
// ============================================================
canvas.addEventListener('touchmove', e => {
  e.preventDefault(); // stop page scrolling
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchend', () => {
  mouse.x = -999;
  mouse.y = -999;
});

// ============================================================
// CLICK TO SPAWN FIREFLY
// Each click/tap adds a new firefly at that position
// It wanders off just like the others
// ============================================================
canvas.addEventListener('click', e => {
  fireflies.push({
    x:      e.clientX,
    y:      e.clientY,
    vx:     (Math.random() - 0.5) * 0.8, // slightly faster initial burst
    vy:     (Math.random() - 0.5) * 0.8,
    phase:  Math.random() * Math.PI * 2,
    bright: 0.7 + Math.random() * 0.3,
    litR:   70 + Math.random() * 50
  });
});

// Same for touch tap (touchend without movement)
let touchMoved = false;
canvas.addEventListener('touchstart', () => { touchMoved = false; });
canvas.addEventListener('touchmove',  () => { touchMoved = true;  }, { passive: false });
canvas.addEventListener('touchend',   e  => {
  if (!touchMoved) {
    // It was a tap not a drag spawn firefly
    fireflies.push({
      x:      e.changedTouches[0].clientX,
      y:      e.changedTouches[0].clientY,
      vx:     (Math.random() - 0.5) * 0.8,
      vy:     (Math.random() - 0.5) * 0.8,
      phase:  Math.random() * Math.PI * 2,
      bright: 0.7 + Math.random() * 0.3,
      litR:   70 + Math.random() * 50
    });
  }
});

// 3. LIGHT HELPER
function litAt(x, y, lights) {
  let total = 0;
  for (const l of lights) {
    const d = Math.hypot(x - l.x, y - l.y);
    if (d < l.r) total += l.str * (1 - d / l.r);
  }
  return Math.min(1, total);
}

// 4. GRASS DATA
const blades = [];
for (let i = 0; i < 1500; i++) {
  blades.push({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    angle: Math.random() * Math.PI * 2,
    len:   4 + Math.random() * 8,
    phase: Math.random() * Math.PI * 2,
    hue:   105 + Math.random() * 25
  });
}

// 5. INIT ALL ELEMENTS
const flowers     = initFlowers(canvas);
const fireflies   = initFireflies(canvas);
const butterflies = initButterflies(canvas);

// ---- GLITTER ----
const glitter    = [];
let glitterTimer = 0;

function spawnGlitter() {
  if (mouse.x < 0) return;
  glitterTimer++;
  if (glitterTimer % 4 !== 0) return;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.2 + Math.random() * 0.5;
  glitter.push({
    x:     mouse.x + (Math.random() - 0.5) * 6,
    y:     mouse.y + (Math.random() - 0.5) * 6,
    vx:    Math.cos(angle) * speed,
    vy:    Math.sin(angle) * speed,
    life:  1.0,
    decay: 0.006 + Math.random() * 0.004,
    size:  1.0 + Math.random() * 1.5
  });
}

function updateGlitter() {
  for (let i = glitter.length - 1; i >= 0; i--) {
    const g = glitter[i];
    g.x    += g.vx;
    g.y    += g.vy;
    g.vx   *= 0.97;
    g.vy   *= 0.97;
    g.life -= g.decay;
    if (g.life <= 0) glitter.splice(i, 1);
  }
}

function drawGlitter() {
  for (const g of glitter) {
    ctx.save();
    ctx.globalAlpha = g.life * g.life;
    ctx.fillStyle   = 'hsl(50, 100%, 75%)';
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ---- TORCH ----
function drawTorch() {
  if (mouse.x < 0) return;
  const blink  = (Math.sin(t * 3.5) + 1) * 0.5;
  const bright = 0.78 + blink * 0.22;
  ctx.save();
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 3 + blink * 1, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 220, 80, ${bright})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 200, 1)';
  ctx.fill();
  ctx.restore();
}

// ---- LOOP ----
function loop() {
  t += 0.016;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const lights = [];
  if (mouse.x > 0) {
    lights.push({ x: mouse.x, y: mouse.y, r: 130, str: 1.0 });
  }
  lights.push(...getFireflyLights(fireflies, t));

  drawGround(ctx, lights);
  updateFireflies(fireflies, canvas);

  for (const b of blades) {
    const lit = litAt(b.x, b.y, lights);
    if (lit < 0.03) continue;
    ctx.save();
    ctx.globalAlpha = lit * 0.85;
    ctx.strokeStyle = `hsl(${b.hue}, 50%, ${15 + lit * 20}%)`;
    ctx.lineWidth   = 0.9;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + Math.cos(b.angle) * b.len,
               b.y + Math.sin(b.angle) * b.len);
    ctx.stroke();
    ctx.restore();
  }

  drawFlowers(ctx, flowers, lights, litAt);
  drawFireflies(ctx, fireflies, t);
  updateAndDrawButterflies(ctx, butterflies, canvas, lights, litAt, t);

  spawnGlitter();
  updateGlitter();
  drawGlitter();
  drawTorch();

  requestAnimationFrame(loop);
}

// ============================================================
// LOADING SCREEN + TITLE SEQUENCE
// Timeline:
//   0s    → loading screen visible, single firefly blinks
//   2.5s  → loading screen fades out, garden fades in
//   3s    → title "The Enchanted Garden" fades in
//   6s    → title fades out
// ============================================================
function runLoadingScreen() {
  const loadingEl  = document.getElementById('loading');
  const loaderCv   = document.getElementById('loader-canvas');
  const loaderCtx  = loaderCv.getContext('2d');
  const titleEl    = document.getElementById('title-overlay');
  const gardenEl   = document.getElementById('garden');

  loaderCv.width  = window.innerWidth;
  loaderCv.height = window.innerHeight;

  // Firefly blinks in center until user interacts
  let lt        = 0;
  let userReady = false; // flips to true on first interaction

  // --- What happens when user interacts ---
  function startGarden() {
    if (userReady) return; // only run once
    userReady = true;
    clearTimeout(fallbackTimer);

    // Fade out loading screen
    loadingEl.classList.add('hidden');

    // Fade in garden
    gardenEl.classList.add('visible');

    // Start game loop
    loop();

    // // Show title after loading fades
    // setTimeout(() => {
    //   titleEl.classList.add('visible');

    //   // Fade title out after 3 seconds
    //   setTimeout(() => {
    //     titleEl.classList.add('hidden');
    //     titleEl.classList.remove('visible');

    //     // Remove loading div from DOM completely
    //     setTimeout(() => loadingEl.remove(), 2000);
    //   }, 3000);
    // }, 800);

    // Show title after loading fades
    setTimeout(() => {
    titleEl.classList.add('visible');

    // Fade title out after 3 seconds
    setTimeout(() => {
    titleEl.classList.add('hidden');
    titleEl.classList.remove('visible');

    // Show instructions after title disappears
    setTimeout(() => {
      const isMobile = window.innerWidth < 600;
      titleEl.querySelector('h1').textContent = isMobile
        ? 'drag your finger through the dark'
        : 'move your cursor through the dark';
        titleEl.querySelector('h1').style.fontFamily = '"Pinyon Script", serif';
        titleEl.querySelector('h1').style.fontSize   = 'clamp(1.5rem, 4vw, 3rem)';
        titleEl.classList.remove('hidden');
        titleEl.classList.add('visible');

      // Fade instructions out after 4 seconds
      setTimeout(() => {
        titleEl.classList.add('hidden');
        titleEl.classList.remove('visible');
        setTimeout(() => loadingEl.remove(), 2000);
      }, 4000);
    }, 1200);

  }, 3000);
}, 800);

  }

  // --- Listen for any interaction ---
  // { once: true } means each listener removes itself after firing once
  window.addEventListener('mousemove',  startGarden, { once: true });
  window.addEventListener('click',      startGarden, { once: true });
  window.addEventListener('touchstart', startGarden, { once: true });

  // Fallback auto-start after 8s if user does nothing
  const fallbackTimer = setTimeout(startGarden, 8000);

  // --- Loader animation runs until userReady ---
  function loaderLoop() {
    lt += 0.016;
    loaderCtx.fillStyle = '#000';
    loaderCtx.fillRect(0, 0, loaderCv.width, loaderCv.height);

    const cx     = loaderCv.width  * 0.5;
    const cy     = loaderCv.height * 0.5;
    const blink  = (Math.sin(lt * 3) + 1) * 0.5;
    const bright = 0.5 + blink * 0.5;

    // Soft halo
    const grad = loaderCtx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    grad.addColorStop(0, `rgba(200, 255, 130, ${bright * 0.6})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    loaderCtx.fillStyle = grad;
    loaderCtx.fillRect(cx - 30, cy - 30, 60, 60);

    // Core dot
    loaderCtx.beginPath();
    loaderCtx.arc(cx, cy, 3 + blink, 0, Math.PI * 2);
    loaderCtx.fillStyle = `rgba(240, 255, 180, ${bright})`;
    loaderCtx.fill();

    // Hint text appears after 1.5s so user knows what to do
    if (lt > 1.5) {
      const hint  = window.innerWidth < 600 ? 'tap to enter' : 'move mouse to enter';
      const alpha = Math.min(1, (lt - 1.5) * 0.8) * (0.5 + blink * 0.2);
      loaderCtx.save();
      loaderCtx.globalAlpha = alpha;
      loaderCtx.fillStyle   = 'rgba(180, 255, 160, 1)';
      // loaderCtx.font        = '14px Georgia, serif';
      // Cinzel Decorative
      // loaderCtx.font = '13px "Cinzel Decorative", serif';
      // Eagle Lake
      // loaderCtx.font = '14px "Eagle Lake", serif';
      // Pinyon Script
      loaderCtx.font = '22px "Pinyon Script", serif';
      loaderCtx.textAlign   = 'center';
      loaderCtx.fillText(hint, cx, cy + 55);
      loaderCtx.restore();
    }

    // Keep animating until user interacts
    if (!userReady) requestAnimationFrame(loaderLoop);
  }

  loaderLoop();
}

// Kick everything off with the loading screen
runLoadingScreen();