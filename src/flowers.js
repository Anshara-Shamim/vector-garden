// HOW TO TWEAK QUANTITY:
//   Change the 80 in the loop below more = denser garden
//   e.g. 40 = sparse,  80 = default,  150 = very dense
//
// HOW TO TWEAK SIZE:
//   Change: size: 3 + Math.random() * 4
//   First number = minimum size
//   Second number = how much extra random size added on top
//   e.g. size: 6 + Math.random() * 8   → bigger flowers
//   e.g. size: 1 + Math.random() * 2   → tiny flowers
//
// HOW TO TWEAK COLOUR:
//   Change: hue: 260 + Math.random() * 120
//   Hue is a number from 0–360 on the colour wheel:
//     0   = red
//     60  = yellow
//     120 = green
//     180 = cyan
//     240 = blue
//     260 = purple  ← default start
//     300 = pink
//     360 = red again
//   First number = base hue (where colour range starts)
//   Second number = how wide the range is
//   e.g. hue: 0   + Math.random() * 60  → red to yellow only
//   e.g. hue: 180 + Math.random() * 80  → cyan to purple only

export function initFlowers(canvas) {
  const flowers = [];

  // CHANGE 80 to adjust quantity
  for (let i = 0; i < 80; i++) {
    flowers.push({
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,

      // CHANGE COLOUR RANGE HERE
      hue:    260 + Math.random() * 120,

      // CHANGE SIZE HERE
      size:   6 + Math.random() * 8,

      petals: 5 + Math.floor(Math.random() * 4), // 5 to 8 petals randomly
      phase:  Math.random() * Math.PI * 2         // random rotation
    });
  }

  return flowers;
}

export function drawFlowers(ctx, flowers, lights, litAt) {
  for (const f of flowers) {
    const lit = litAt(f.x, f.y, lights);
    if (lit < 0.04) continue; // skip if completely dark

    ctx.save();
    ctx.globalAlpha = lit * 0.9;

    // Draw each petal as a rotated ellipse around the center
    for (let i = 0; i < f.petals; i++) {
      const a  = (i / f.petals) * Math.PI * 2 + f.phase;
      const px = f.x + Math.cos(a) * f.size * 1.3;
      const py = f.y + Math.sin(a) * f.size * 1.3;
      ctx.beginPath();
      ctx.ellipse(
        (f.x + px) / 2, (f.y + py) / 2,
        f.size * 0.55, f.size * 0.28,
        a, 0, Math.PI * 2
      );
      // Petals get brighter as more light hits them
      ctx.fillStyle = `hsl(${f.hue}, 62%, ${28 + lit * 32}%)`;
      ctx.fill();
    }

    // Center dot slightly different hue from petals
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${f.hue + 50}, 68%, ${38 + lit * 28}%)`;
    ctx.fill();

    ctx.restore();
  }
}