// HOW TO TWEAK QUANTITY:
//   Change the 6 in the loop below
//   e.g. 3 = very few,  6 = default,  12 = many
//
// HOW TO TWEAK SIZE:
//   Change the radius in ctx.arc(ff.x, ff.y, 2, ...)
//   e.g. 1 = tiny dot,  2 = default,  4 = bigger
//
// HOW TO TWEAK GLOW RADIUS (how much ground they light up):
//   Change: litR: 80 + Math.random() * 50
//   e.g. litR: 40 + Math.random() * 20  → small glow
//   e.g. litR: 120 + Math.random() * 80 → large glow

export function initFireflies(canvas) {
  const fireflies = [];

  // CHANGE 6 to adjust quantity
  for (let i = 0; i < 6; i++) {
    fireflies.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      vx:     (Math.random() - 0.5) * 0.6, // horizontal speed
      vy:     (Math.random() - 0.5) * 0.6, // vertical speed

      phase:  Math.random() * Math.PI * 2,  // blink offset each firefly blinks differently
      bright: 0.6 + Math.random() * 0.4,   // base brightness

      // CHANGE to adjust how much ground each firefly lights up
      litR:   80 + Math.random() * 50
    });
  }

  return fireflies;
}

export function updateFireflies(fireflies, canvas) {
  for (const ff of fireflies) {
    // Random wander tiny nudge each frame
    ff.vx += (Math.random() - 0.5) * 0.07;
    ff.vy += (Math.random() - 0.5) * 0.07;

    // Dampen so they don't speed up forever
    ff.vx *= 0.96;
    ff.vy *= 0.96;

    ff.x  += ff.vx;
    ff.y  += ff.vy;

    // Bounce off window edges
    if (ff.x < 0 || ff.x > canvas.width)  ff.vx *= -1;
    if (ff.y < 0 || ff.y > canvas.height) ff.vy *= -1;
  }
}

export function getFireflyLights(fireflies, t) {
  // Returns light objects for each firefly used in main.js lights array
  const lights = [];
  for (const ff of fireflies) {
    const blink = (Math.sin(t * 3.5 + ff.phase) + 1) * 0.5;
    const str   = ff.bright * 0.4 + blink * 0.6;
    lights.push({ x: ff.x, y: ff.y, r: ff.litR * str, str: str * 0.85 });
  }
  return lights;
}

export function drawFireflies(ctx, fireflies, t) {
  for (const ff of fireflies) {
    const blink  = (Math.sin(t * 3.5 + ff.phase) + 1) * 0.5;
    const bright = ff.bright * 0.4 + blink * 0.6;

    // Soft halo glow
    const g = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, 10);
    g.addColorStop(0, `rgba(220, 255, 150, ${bright * 0.8})`);
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(ff.x - 10, ff.y - 10, 20, 20);

    // Core dot CHANGE 2 to adjust dot size
    ctx.beginPath();
    ctx.arc(ff.x, ff.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240, 255, 180, ${bright})`;
    ctx.fill();
  }
}