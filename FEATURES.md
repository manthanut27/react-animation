# React Animation Portfolio — Feature Reference

> A single-page animation showcase built with **React 19**, **Three.js / React Three Fiber**, **GSAP (ScrollTrigger)**, **Lenis smooth scroll**, and **custom GLSL shaders**.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI Framework | React | 19.2 |
| 3D / WebGL | Three.js + @react-three/fiber | 0.184 / 9.6 |
| 3D Helpers | @react-three/drei | 10.7 |
| Animation | GSAP + ScrollTrigger | 3.15 |
| React↔GSAP | @gsap/react | 2.1 |
| Smooth Scroll | Lenis | 1.3 |
| Routing | React Router v7 | 7.18 |
| Build Tool | Vite 8 + vite-plugin-glsl | — |
| Shader Language | GLSL (vertex + fragment) | — |

---

## Section 1 — Split-Column Curtain Reveal Hero (`StreamMasking`)

### Visual Effect
Five vertical columns slide up from below to reveal a full-screen image, with each column staggered 0.08s apart. Three images cycle via GSAP timeline scrubbed to scroll position.

### Key Features
- **5-column split image curtain** — each column is an independent `overflow: hidden` strip; images are positioned absolutely inside so the full `100vw` image is visible through the strip window
- **Counter-translate technique** — as the column slides up (`yPercent: 0`), the inner image counter-translates (`yPercent: -100 → 0`) to keep the image stationary on screen while the curtain opens
- **3 image transition phases** — Image 1 reveal → Image 2 slide (`yPercent: -100`) → Image 3 slide (`yPercent: -200`), all tied to a 3600px scroll distance
- **Overlay typography** — per-image title (`PERSPECTIVE`, `SYNCHRONICITY`, `REGENERATION`) and subtitle animate in with `yPercent: 100 → 0` slide-up from an `overflow: hidden` clip mask
- **Interactive particle canvas** — 2D `<canvas>` underneath with up to 80 particles, pairwise connection lines (O(n²) distance check with 110px threshold), and mouse-repulsion zone (150px radius)
- **Animated background "REACT" text** — Syncopate font characters stagger in on mount, then fade out as columns reveal; persistent float animation + per-character glitch effect via `::before`/`::after` pseudo-elements
- **Hover column effect** — `scaleY(1.02)` + `scale(1.08)` on image on `:hover`
- **Scroll-pinned** via `ScrollTrigger` for the full 3600px scroll distance

---

## Section 2 — Circular Clip-Path Reveal (`ClipPathAnimation`)

### Visual Effect
Two circular masks — one anchored to the top edge, one to the bottom — expand outward on scroll to reveal inner text content.

### Key Features
- **Dual `clip-path: circle()`** — top circle expands from `0vmax at 50% 0%` → `140vmax at 50% 0%`; bottom from `0vmax at 50% 100%` → `140vmax at 50% 100%`
- **Simultaneous expand** — both run at timeline position `0` so they grow in sync
- **Scoped refs** — `topCircleRef` / `bottomCircleRef` pass DOM nodes directly to GSAP (no global class selectors)
- **Scroll-pinned** for 150% viewport scroll distance
- **Typographic content** — logotype row + large `h1` poetry reveal

---

## Section 3 — Scroll-Pinned Circular Card Carousel (`circulerElemets`)

### Visual Effect
A ring of image cards arranged in a circle rotates as the user scrolls, with hover override that tilts the ring toward the cursor.

### Key Features
- **Trig-based circular layout** — cards positioned via `RADIUS × sin(angle)` / `RADIUS × cos(angle)` with angle derived from index
- **Scroll-driven rotation** — `ScrollTrigger` drives `rotationTarget` from 0 → 360° over 100% scroll distance
- **Hover state reconciliation** — on `mouseleave`, reads `scrollTriggerInstance.progress` to tween back to the correct scroll-implied rotation rather than snapping to a stale value; prevents position drift between the two input sources
- **`isHovered` flag** — gates scroll rotation updates while mouse is active so they don't fight
- **Smooth lerp** — `gsap.ticker` updates rotation via `lerp(current, target, 0.08)` every frame
- **Card hover scale** — `scale: 1.05` on each card
- **Custom cursor interaction** — enlarges the cursor ring on card hover

---

## Section 4 — Interactive Image Trail (`imageTrail`)

### Visual Effect
Moving the mouse across the section spawns images that follow the cursor path, scale down, and fade out.

### Key Features
- **Distance-threshold spawn gate** — images only spawn when the cursor has moved ≥ 80px since the last spawn; prevents over-spawning on fast swipes (more correct than time-throttling)
- **GSAP staggered reveal/hide** — each image fades in (`opacity: 1`, `scale: 1`) then fades out (`opacity: 0`, `scale: 0.6`) via a shared timeline
- **Round-robin image pool** — cycles through an array of Unsplash images
- **Absolute positioning at cursor** — images placed at `e.clientX / e.clientY` offset by half their dimensions
- **`pointer-events: none`** — images don't interfere with subsequent mouse events
- **Centered title overlay** — `"MOTION CANVAS"` + subtitle visible through the image layer

---

## Section 5 — WebGL 3D Carousel + Particle Field (`Experience` / Three.js)

### Visual Effect
A ring of six 3D image cards rotates on mouse scroll. A field of 800 dust particles fills the surrounding space, reacting to scroll speed. Hovering tilts the entire group.

### Sub-feature: 3D Carousel

- **Six `<mesh>` cards** arranged in a ring via `angle = (index / 6) × 2π`, radius = 3 units
- **Custom GLSL shader** — vertex shader applies a `uScrollSpeed`-driven wave warp to the card geometry; fragment shader samples the texture
- **Scroll-to-rotate** — `wheel` event on the canvas updates `targetRotation`; lerped toward `currentRotation` at ratio 0.05 each frame via `useFrame`
- **Mouse tilt parallax** — `groupRef.rotation.x` / `.z` lerp toward `targetMouse.x * 0.3` / `targetMouse.y * 0.3`
- **Between-card HTML labels** — `<Html>` from drei renders DOM text (project name + category) positioned at mid-radius between each card pair, `distanceFactor={4}` for perspective scaling
- **Central "PROJECTS" headline** — `<Html position={[0,0,0]}>` with outline text (`-webkit-text-stroke`) so carousel images bleed through the letterforms
- **Click navigation** — each card routes to `/project/:id` via React Router

### Sub-feature: Particle Field

- **800 particles** in a hollow sphere shell (inner radius 6, outer radius 18 units)
- **`THREE.BufferGeometry`** built imperatively in `useMemo`; `Float32Array` mutated in-place every frame, `needsUpdate = true` — no geometry re-allocation
- **Per-particle physics** — velocity + spring-return toward home position + sine/cosine noise drift per axis
- **Scroll burst** — `scrollSpeedRef.current` drives a radial outward velocity impulse; 0.96 damping returns particles to orbit
- **Slow ambient rotation** — entire field rotates on Y (0.04 rad/s) and X (0.015 rad/s) axes
- **`depthWrite: false`** — no depth sort; particles never occlude cards
- **`sizeAttenuation: true`** — far particles appear smaller for natural perspective

---

## Project Detail Page (`ProjectDetail`)

### Visual Effect
Clicking a carousel card routes to a detail page with a typographic header reveal and a GSAP-pinned horizontal scroll gallery.

### Key Features
- **Slide-up title reveal** — `yPercent: 100 → 0` with `rotate: 3 → 0` skew on mount
- **Horizontal scroll gallery** — three images translate `x: -(scrollWidth - viewWidth)` tied to vertical scroll via `ScrollTrigger` pin
- **Deferred layout measurement** — `Promise.all` over each `<img>`'s `load` event before measuring `scrollWidth`; `ScrollTrigger.refresh()` called after. Prevents wrong scroll distance from layout-before-load race condition
- **Magnetic back button** — `window.mousemove` pulls the `← Close` button toward the cursor within 120px; elastic spring return on exit

---

## Global / Cross-Cutting

| Feature | Detail |
|---|---|
| **Custom cursor** | Dual-layer (outer ring + inner dot), GSAP-animated, `mix-blend-mode: difference`, event-delegated hover enlargement on interactive elements via `document.addEventListener` capture phase |
| **Smooth scroll** | Lenis with easeOutExpo easing, single `gsap.ticker` driver (no duplicate rAF loop), `lenis.on("scroll", ScrollTrigger.update)` sync |
| **Typography** | Syncopate (headings), Outfit (body/labels), loaded from Google Fonts |
| **Section z-index stack** | StreamMasking (40) → ClipPath (30) → Circular (20) → Trail (10) → Three.js (5), enabling correct overlap when GSAP pins sections |
| **No TypeScript / no Tailwind** | Pure JSX + vanilla CSS for maximum control |
