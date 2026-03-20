// HOW TO TWEAK QUANTITY:
//   Change the 6 in initButterflies loop
//   e.g. 3 = few,  6 = default,  10 = many
//
// HOW TO TWEAK SIZE:
//   Change: size: 7 + Math.random() * 6
//   e.g. size: 4 + Math.random() * 3   → small butterflies
//   e.g. size: 12 + Math.random() * 8  → large butterflies
//
// HOW TO TWEAK COLOUR:
//   Change the hue array each number is a colour:
//   [280, 320, 190, 50, 170]
//    280 = purple
//    320 = pink/magenta
//    190 = cyan
//    50  = yellow/gold
//    170 = mint green
//   Add, remove or change these numbers to change what colours appear
//   e.g. [0, 30, 60] → red, orange, yellow butterflies only
//
// HOW TO TWEAK SPEED:
//   Change: speed: 0.4 + Math.random() * 0.5
//   e.g. speed: 0.2 + Math.random() * 0.2  → slow and lazy
//   e.g. speed: 1.0 + Math.random() * 1.0  → fast and erratic

export function mkB(canvas) {
  return {
    x:      Math.random() * canvas.width,
    y:      Math.random() * canvas.height,
    dir:    Math.random() * Math.PI * 2,  // direction of travel

    // CHANGE SPEED HERE
    speed:  0.4 + Math.random() * 0.5,

    wp:     Math.random() * Math.PI * 2,  // wing phase
    ws:     0.1 + Math.random() * 0.07,   // wing flap speed

    // CHANGE COLOURS HERE add/remove hue numbers
    hue:    [280, 320, 190, 50, 170][Math.floor(Math.random() * 5)],

    // CHANGE SIZE HERE
    size: 20 + Math.random() * 8,

    turn:   (Math.random() - 0.5) * 0.035, // how much it curves while flying
    age:    0,
    maxAge: 500 + Math.random() * 400       // how long before it respawns
  };
}

export function initButterflies(canvas) {
  const butterflies = [];

  // CHANGE 6 to adjust quantity
  for (let i = 0; i < 6; i++) {
    butterflies.push(mkB(canvas));
  }

  return butterflies;
}

export function updateAndDrawButterflies(ctx, butterflies, canvas, lights, litAt, t) {
  for (let i = 0; i < butterflies.length; i++) {
    const b = butterflies[i];

    // Move
    b.wp  += b.ws;
    b.dir += b.turn;
    b.x   += Math.cos(b.dir) * b.speed;
    b.y   += Math.sin(b.dir) * b.speed;
    b.age++;

    // Bounce off edges
    if (b.x < 20 || b.x > canvas.width  - 20) b.dir = Math.PI - b.dir;
    if (b.y < 20 || b.y > canvas.height - 20) b.dir = -b.dir;

    // Respawn when old
    if (b.age > b.maxAge) butterflies[i] = mkB(canvas);

    // Only draw if a light source is nearby
    const lit = litAt(b.x, b.y, lights);
    if (lit < 0.04) continue;

    // Wing flap abs(sin) gives 0→1→0 open/close motion
    const wf = Math.abs(Math.sin(b.wp));
    const s  = b.size;

    ctx.save();
    ctx.globalAlpha = lit * 0.9;
    ctx.translate(b.x, b.y);
    ctx.rotate(b.dir + Math.PI * 0.5); // face direction of travel

    // Scale wings horizontally to simulate flapping
    ctx.save();
    ctx.scale(wf, 1);

    // Left forewing
    ctx.beginPath();
    ctx.ellipse(-s * 0.55, 0, s * 0.9, s * 0.45, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${b.hue}, 70%, 45%, 0.82)`;
    ctx.fill();

    // Left hindwing slightly different hue
    ctx.beginPath();
    ctx.ellipse(-s * 0.38, s * 0.52, s * 0.58, s * 0.28, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${b.hue + 15}, 65%, 40%, 0.65)`;
    ctx.fill();

    // Right forewing
    ctx.beginPath();
    ctx.ellipse(s * 0.55, 0, s * 0.9, s * 0.45, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${b.hue}, 70%, 45%, 0.82)`;
    ctx.fill();

    // Right hindwing
    ctx.beginPath();
    ctx.ellipse(s * 0.38, s * 0.52, s * 0.58, s * 0.28, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${b.hue + 15}, 65%, 40%, 0.65)`;
    ctx.fill();

    ctx.restore(); // undo scale

    // Body thin dark ellipse down the center
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.11, s * 0.52, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${b.hue}, 18%, 14%)`;
    ctx.fill();

    ctx.restore(); // undo translate + rotate
  }
}