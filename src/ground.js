// HOW TO TWEAK:
//   Brighter green  → increase the RGB values e.g. rgba(20, 70, 20, ...)
//   Darker green    → decrease the RGB values e.g. rgba(8,  30,  8, ...)
//   Wider lit patch → increase l.r when pushing lights in main.js

export function drawGround(ctx, lights) {
  for (const l of lights) {
    const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);

    // Center of light darkest green
    grad.addColorStop(0,    `rgba(14, 52, 14, ${l.str * 0.95})`);
    // Mid area
    grad.addColorStop(0.5,  `rgba(10, 38, 10, ${l.str * 0.7})`);
    // Near edge almost black
    grad.addColorStop(0.85, `rgba(5,  20,  5, ${l.str * 0.3})`);
    // Edge fully transparent, blends into black void
    grad.addColorStop(1,    'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
  }
}