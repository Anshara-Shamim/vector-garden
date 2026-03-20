# Vector Garden Algorithm Documentation

## 1. Light System

```
d = sqrt( (x2-x1)^2 + (y2-y1)^2 )
brightness = strength * (1 - d / radius)
opacity = min(1, sum of all brightness values)
```

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

Every element sets `ctx.globalAlpha = litAt(x, y, lights)` before drawing.
Value 0.0 = invisible. Value 1.0 = fully visible.

---

## 2. Vector Math

Converts angle and length into x/y coordinates. Used by grass, fireflies, butterflies.

```
tipX = originX + cos(angle) * length
tipY = originY + sin(angle) * length
```

```js
tipX = x + Math.cos(angle) * length
tipY = y + Math.sin(angle) * length
```

All angles use radians:
```
Full circle  = 2 * PI = 360 degrees
Half circle  = PI     = 180 degrees
Quarter      = PI / 2 =  90 degrees
```

---

## 3. Grass

```js
ctx.moveTo(blade.x, blade.y)
ctx.lineTo(
  blade.x + Math.cos(blade.angle) * blade.length,
  blade.y + Math.sin(blade.angle) * blade.length
)
ctx.stroke()
```

Colour brightness scales with light:
```js
ctx.strokeStyle = `hsl(${hue}, 50%, ${15 + lit * 20}%)`
```

---

## 4. Flower Petal Placement

Places N petals evenly around a center point using polar coordinates:

```
angle = (i / totalPetals) * 2 * PI + phaseOffset
petalX = centerX + cos(angle) * radius
petalY = centerY + sin(angle) * radius
```

```js
const angle = (i / f.petals) * Math.PI * 2 + f.phase
const px = f.x + Math.cos(angle) * f.size * 1.3
const py = f.y + Math.sin(angle) * f.size * 1.3
ctx.ellipse((f.x + px) / 2, (f.y + py) / 2, f.size * 0.55, f.size * 0.28, angle, 0, Math.PI * 2)
```

---

## 5. Firefly Random Walk

```
velocity += random(-0.5, 0.5) * nudge
velocity *= damping
position += velocity
```

```js
ff.vx += (Math.random() - 0.5) * 0.07
ff.vy += (Math.random() - 0.5) * 0.07
ff.vx *= 0.96
ff.vy *= 0.96
ff.x  += ff.vx
ff.y  += ff.vy
```

Boundary bounce:
```js
if (ff.x < 0 || ff.x > canvas.width)  ff.vx *= -1
if (ff.y < 0 || ff.y > canvas.height) ff.vy *= -1
```

Blink formula:
```
blink = (sin(time * speed + phaseOffset) + 1) / 2
```

```js
const blink = (Math.sin(t * 3.5 + ff.phase) + 1) * 0.5
```

---

## 6. Butterfly Curved Flight

```
direction += turnRate
x += cos(direction) * speed
y += sin(direction) * speed
```

```js
b.dir += b.turn
b.x   += Math.cos(b.dir) * b.speed
b.y   += Math.sin(b.dir) * b.speed
```

Wing flap formula:
```
wingFlap = |sin(wingPhase)|
```

```js
const wf = Math.abs(Math.sin(b.wp))
ctx.scale(wf, 1)
```

Transforms applied before drawing:
```js
ctx.translate(b.x, b.y)
ctx.rotate(b.dir + Math.PI * 0.5)
ctx.scale(wf, 1)
```

---

## 7. Glitter Particle System

Spawn every 4 frames:
```js
{
  vx: cos(randomAngle) * speed,
  vy: sin(randomAngle) * speed,
  life: 1.0,
  decay: 0.006
}
```

Update per frame:
```js
g.x    += g.vx
g.y    += g.vy
g.vx   *= 0.97
g.vy   *= 0.97
g.life -= g.decay
```

Fade curve (squared for natural dropoff):
```
opacity = life^2
```

```js
ctx.globalAlpha = g.life * g.life
```

Remove when dead:
```js
if (g.life <= 0) glitter.splice(i, 1)
```

---

## 8. Ground Lighting

Radial gradient from green center to transparent edge:
```js
const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
grad.addColorStop(0,    `rgba(14, 52, 14, ${l.str * 0.95})`)
grad.addColorStop(0.5,  `rgba(10, 38, 10, ${l.str * 0.70})`)
grad.addColorStop(0.85, `rgba(5,  20,  5, ${l.str * 0.30})`)
grad.addColorStop(1,    'rgba(0, 0, 0, 0)')
```

---

## 9. Interaction Gate

```js
let userReady = false

function startGarden() {
  if (userReady) return
  userReady = true
  // start garden
}

window.addEventListener('mousemove',  startGarden, { once: true })
window.addEventListener('click',      startGarden, { once: true })
window.addEventListener('touchstart', startGarden, { once: true })
setTimeout(startGarden, 8000)
```

---

## Summary

| Element | Formula |
|---|---|
| Brightness | `strength * (1 - distance / radius)` |
| Distance | `sqrt((x2-x1)^2 + (y2-y1)^2)` |
| Direction to coordinates | `x + cos(angle) * length` |
| Petal position | `(i / petals) * 2PI + phase` |
| Blink | `(sin(t * speed + phase) + 1) / 2` |
| Wing flap | `abs(sin(wingPhase))` |
| Particle fade | `life^2` |
| Velocity damping | `velocity *= 0.96` |
