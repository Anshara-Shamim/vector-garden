# Vector Garden 🌿

A dark interactive garden built with pure HTML, CSS, and vanilla JavaScript. No frameworks, no libraries just a canvas, vector math, and a light system that reveals the world as you explore it.

Move your mouse (or drag your finger on mobile) to carry a firefly torch through the darkness. Everything is hidden until light touches it.

---

## Live Demo

Deploy to Vercel see deployment section below.

---

## What's Inside

```
vector-garden/
├── index.html          entry point
├── style.css           layout, loading screen, title overlay
├── src/
│   ├── main.js         game loop, light system, glitter, torch
│   ├── ground.js       green ground patches revealed by light
│   ├── flowers.js      flower data and top-down petal drawing
│   ├── fireflies.js    wandering firefly movement and blinking
│   └── butterflies.js  butterfly flight and wing animation
```

---

## How It Works

The entire darkness effect comes from one function in `main.js`:

```js
function litAt(x, y, lights) {
  let total = 0;
  for (const l of lights) {
    const d = Math.hypot(x - l.x, y - l.y);
    if (d < l.r) total += l.str * (1 - d / l.r);
  }
  return Math.min(1, total);
}
```

Every drawable element grass, flowers, butterflies calls `litAt()` and sets `ctx.globalAlpha` to the result. No light nearby means alpha 0, which means invisible. The screen is repainted black every frame, so only lit areas show.

**Draw order each frame:**
1. Black `fillRect` resets the whole screen
2. `drawGround()` paints green under each light source
3. Grass blades short lines in all directions (top-down view)
4. Flowers ring of ellipse petals around a center dot
5. Fireflies blinking dots with radial glow halos
6. Butterflies two ellipse wings scaled horizontally to simulate flapping
7. Glitter golden particles that drift and fade from the torch
8. Torch golden firefly dot at mouse position, always on top

---

## Features

- **Mouse torch** your cursor is a golden firefly that lights up the garden
- **Click to spawn** click anywhere to release a new firefly that wanders off
- **Mobile touch** drag finger to move torch, tap to spawn a firefly
- **Loading screen** single firefly blinks until user moves mouse or taps
- **Title overlay** fades in on entry, disappears after a few seconds
- **Glitter trail** subtle golden sparkles follow the torch and fade out

---

## Customisation

### Flowers `src/flowers.js`
```js
for (let i = 0; i < 80; i++)       // quantity increase for denser garden
hue:  260 + Math.random() * 120,   // colour 0=red, 120=green, 260=purple, 300=pink
size: 6   + Math.random() * 8,     // size increase both numbers for bigger flowers
```

### Butterflies `src/butterflies.js`
```js
for (let i = 0; i < 6; i++)                    // quantity
hue: [280, 320, 190, 50, 170][...],            // colours add/remove hue numbers
size: 20 + Math.random() * 8,                  // size
speed: 0.4 + Math.random() * 0.5,             // speed
```

### Fireflies `src/fireflies.js`
```js
for (let i = 0; i < 6; i++)        // quantity
litR: 80 + Math.random() * 50      // glow radius how much ground they reveal
```

### Ground colour `src/ground.js`
```js
grad.addColorStop(0, `rgba(14, 52, 14, ...)`)  // increase RGB for brighter green
```

### Torch light radius `src/main.js`
```js
lights.push({ x: mouse.x, y: mouse.y, r: 130, str: 1.0 });
// increase r: 130 for a wider torch
```

### Glitter `src/main.js`
```js
if (glitterTimer % 4 !== 0) return;        // lower = more particles
decay: 0.006 + Math.random() * 0.004,      // lower = lasts longer
```

---

## Running Locally

Because the project uses ES modules (`import`/`export`), you need a local server just opening `index.html` directly in a browser will give a CORS error.

**Terminal:**
```bash
npx serve .
```

---

## Lessons Learned Building This

**JavaScript reads top to bottom** always define data arrays and helper functions before the loop, and call `loop()` as the very last line.

**`ctx.save()` and `ctx.restore()`** wrap every draw block in these. Without them, one element's `globalAlpha` bleeds into the next.

**`const` inside a loop creates a new variable scoped to that block** defining arrays inside a `for` loop means they die when the loop ends. Always define arrays outside and above their loops.

**`const` cannot be declared twice in the same scope** declaring `lights` twice inside `loop()` crashes with "Cannot redeclare block-scoped variable". Only one declaration per variable per function.

---

## Built With

- HTML5 Canvas API
- Vanilla JavaScript (ES Modules)
- CSS3 transitions
- Vercel (hosting)