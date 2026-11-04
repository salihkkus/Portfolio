// ASCII hero: renders animated ASCII art on a canvas.
// Source: data-src (image), data-text (text) or, by default, a rotating 3D network sphere.
// Brightness is mapped to a character ramp; the cursor scrambles and highlights nearby cells.
(() => {
    const canvas = document.getElementById('ascii-hero');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const RAMP = ' .:-=+*#%@';
    const GLYPHS = '01<>/{}[]#*+=$&%';
    const ACCENT = [16, 185, 129];
    const BASE = [196, 199, 200];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cols = 0, rows = 0, cellW = 0, cellH = 0, width = 0, height = 0;
    let mask = new Float32Array(0);
    let glow = new Float32Array(0);
    let startTime = performance.now();
    let running = false;
    let image = null;
    const mouse = { x: -9999, y: -9999 };
    const mode = canvas.dataset.src ? 'image' : canvas.dataset.text ? 'text' : 'sphere';

    // ---- Network sphere: points on a Fibonacci sphere, each linked to its nearest neighbours.
    const NODES = 80;
    const nodes = [];
    const edges = [];
    if (mode === 'sphere') {
        for (let i = 0; i < NODES; i++) {
            const y = 1 - (i + 0.5) / NODES * 2;
            const r = Math.sqrt(1 - y * y);
            const a = i * Math.PI * (3 - Math.sqrt(5));
            nodes.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r, phase: Math.random() });
        }
        const seen = new Set();
        nodes.forEach((p, i) => {
            nodes
                .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
                .filter(n => n.j !== i)
                .sort((a, b) => a.d - b.d)
                .slice(0, 3)
                .forEach(({ j }) => {
                    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                    if (!seen.has(key)) { seen.add(key); edges.push([i, j]); }
                });
        });
    }
    const tilt = { x: 0, y: 0 };

    function plot(x, y, b, g) {
        const cx = Math.floor(x / cellW), cy = Math.floor(y / cellH);
        if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return;
        const i = cy * cols + cx;
        if (b > mask[i]) mask[i] = b;
        if (g > glow[i]) glow[i] = g;
    }

    function renderSphere(t) {
        mask.fill(0);
        glow.fill(0);

        // Ease the tilt towards the cursor so the sphere leans where you point.
        const hasMouse = mouse.x > -9999;
        const targetX = hasMouse ? (mouse.y / height - 0.5) * 0.8 : 0;
        const targetY = hasMouse ? (mouse.x / width - 0.5) * 0.8 : 0;
        tilt.x += (targetX - tilt.x) * 0.05;
        tilt.y += (targetY - tilt.y) * 0.05;

        const ay = t * 0.25 + tilt.y, ax = 0.35 + Math.sin(t * 0.3) * 0.1 + tilt.x;
        const sy = Math.sin(ay), cy = Math.cos(ay), sx = Math.sin(ax), cx = Math.cos(ax);
        const R = Math.min(width, height) * 0.42;
        const proj = nodes.map(n => {
            const x1 = n.x * cy + n.z * sy;
            const z1 = -n.x * sy + n.z * cy;
            const y2 = n.y * cx - z1 * sx;
            const z2 = n.y * sx + z1 * cx;
            const s = 2.4 / (3 - z2);
            return { x: width / 2 + x1 * R * s, y: height / 2 + y2 * R * s, depth: (z2 + 1) / 2 };
        });

        const step = cellW * 0.7;
        edges.forEach(([i, j]) => {
            const a = proj[i], b = proj[j];
            const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step));
            for (let k = 0; k <= n; k++) {
                const f = k / n;
                const depth = a.depth + (b.depth - a.depth) * f;
                plot(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 0.08 + 0.45 * depth ** 1.5, 0);
            }
        });

        proj.forEach((p, i) => {
            // Occasional "signal" pulses light individual nodes up in the accent colour.
            const pulse = Math.max(0, Math.sin((t * 0.6 + nodes[i].phase) * Math.PI * 2)) ** 16;
            // Back nodes fade out and shrink so the sphere reads as 3D.
            const b = 0.2 + 0.8 * p.depth ** 1.5 + pulse * 0.3;
            const g = pulse * p.depth;
            plot(p.x, p.y, b, g);
            plot(p.x - cellW, p.y, b * 0.6, g * 0.6);
            plot(p.x + cellW, p.y, b * 0.6, g * 0.6);
            if (p.depth > 0.6) {
                plot(p.x, p.y - cellH, b * 0.5, g * 0.5);
                plot(p.x, p.y + cellH, b * 0.5, g * 0.5);
            }
        });
    }

    // ---- Text and image sources are static, so they are rasterised once into the mask.
    function layoutText(w) {
        const text = canvas.dataset.text.toUpperCase();
        const words = text.split(' ');
        const lines = w < 640 && words.length > 1 ? words : [text];
        const prevFont = ctx.font;
        ctx.font = '600 100px Inter, sans-serif';
        const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
        ctx.font = prevFont;
        const size = (w * 0.96 / widest) * 100;
        return { lines, size, height: size * 1.1 * lines.length + size * 0.3 };
    }

    // Draw the source in screen pixels, scaled down to one pixel per grid cell, and read its brightness.
    function buildMask() {
        const off = document.createElement('canvas');
        off.width = cols;
        off.height = rows;
        const o = off.getContext('2d');
        o.fillStyle = '#000';
        o.fillRect(0, 0, cols, rows);
        o.scale(1 / cellW, 1 / cellH);

        if (mode === 'image') {
            const scale = Math.min(width / image.width, height / image.height);
            const w = image.width * scale, h = image.height * scale;
            o.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
        } else {
            const { lines, size } = layoutText(width);
            o.font = `600 ${size}px Inter, sans-serif`;
            o.fillStyle = '#fff';
            o.textAlign = 'center';
            o.textBaseline = 'middle';
            const lineH = size * 1.1;
            lines.forEach((l, i) => {
                o.fillText(l, width / 2, height / 2 + (i - (lines.length - 1) / 2) * lineH);
            });
        }

        const data = o.getImageData(0, 0, cols, rows).data;
        for (let i = 0; i < mask.length; i++) {
            const p = i * 4;
            mask[i] = (data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114) / 255;
        }
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.getBoundingClientRect().width;
        // In text mode the canvas height follows the text so letters are never squashed.
        if (mode === 'text') canvas.style.height = `${Math.round(layoutText(width).height)}px`;
        height = canvas.getBoundingClientRect().height;
        // Text needs many columns for detail; the sphere reads better with larger glyphs.
        const targetCols = mode === 'text' ? 170 : 90;
        const fontSize = Math.max(6, Math.min(10, width / targetCols / 0.6));
        cellW = fontSize * 0.6;
        cellH = fontSize * 1.1;
        cols = Math.floor(width / cellW);
        rows = Math.floor(height / cellH);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        ctx.textBaseline = 'top';
        mask = new Float32Array(cols * rows);
        glow = new Float32Array(cols * rows);
        if (mode !== 'sphere') buildMask();
    }

    // Cheap deterministic hash so each cell gets a stable pseudo-random value.
    const hash = (x, y) => {
        const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return s - Math.floor(s);
    };

    function draw(now) {
        const t = (now - startTime) / 1000;
        if (mode === 'sphere') renderSphere(t);
        ctx.clearRect(0, 0, width, height);
        const radius = Math.min(width, 900) * 0.12;
        const wavy = mode !== 'image';

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const h = hash(x, y);
                // Intro: cells settle from left to right with a little random delay.
                const reveal = reduceMotion ? 1 : Math.min(1, Math.max(0, (t * 1.6 - x / cols - h * 0.4) * 2));
                if (reveal <= 0) continue;

                const i = y * cols + x;
                const wave = wavy ? 0.06 * Math.sin(x * 0.18 + t * 1.4) * Math.cos(y * 0.35 - t * 0.9) : 0;
                let b = mask[i] + wave + (h > 0.992 ? 0.2 : 0);

                const px = x * cellW, py = y * cellH;
                const d = Math.hypot(px - mouse.x, py - mouse.y);
                const near = d < radius ? 1 - d / radius : 0;
                b += near * 0.35;
                if (b < 0.08) continue;

                let ch;
                if (reveal < 1 || near > 0.15 && h < near) {
                    ch = GLYPHS[Math.floor((h * 97 + t * 12) % GLYPHS.length)];
                } else {
                    ch = RAMP[Math.min(RAMP.length - 1, Math.floor(Math.min(1, b) * RAMP.length))];
                    if (ch === ' ') continue;
                }

                const mix = Math.min(1, near * 1.5 + glow[i] * 1.5 + (reveal < 1 ? 0.6 : 0));
                const alpha = Math.min(1, 0.25 + b * 0.75) * reveal;
                const r = BASE[0] + (ACCENT[0] - BASE[0]) * mix;
                const g = BASE[1] + (ACCENT[1] - BASE[1]) * mix;
                const bl = BASE[2] + (ACCENT[2] - BASE[2]) * mix;
                ctx.fillStyle = `rgba(${r | 0},${g | 0},${bl | 0},${alpha})`;
                ctx.fillText(ch, px, py);
            }
        }
    }

    function loop(now) {
        if (!running) return;
        draw(now);
        requestAnimationFrame(loop);
    }

    function start() {
        if (!cols) return;
        if (reduceMotion) { draw(performance.now()); return; }
        if (running) return;
        running = true;
        requestAnimationFrame(loop);
    }

    function stop() { running = false; }

    canvas.addEventListener('pointermove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        if (reduceMotion) draw(performance.now());
    });
    canvas.addEventListener('pointerleave', () => {
        mouse.x = mouse.y = -9999;
        if (reduceMotion) draw(performance.now());
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(performance.now()); }, 150);
    });

    let visible = false;
    function init() {
        resize();
        startTime = performance.now();
        // Only animate while the hero is on screen.
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            visible ? start() : stop();
        }).observe(canvas);
    }

    if (mode === 'image') {
        image = new Image();
        image.onload = init;
        image.src = canvas.dataset.src;
    } else {
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(init);
    }
})();

// Nav logo: letters scramble into code glyphs on hover, then resolve back to the name.
(() => {
    const logo = document.querySelector('nav > a[href="#"]');
    if (!logo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const GLYPHS = '01<>/{}[]#*+=$&%';
    const label = logo.querySelector('.logo-text');
    const original = label.textContent;
    let frame = null;

    logo.addEventListener('mouseenter', () => {
        cancelAnimationFrame(frame);
        // Lock the width so glyphs of different widths don't shift the layout.
        logo.style.display = 'inline-block';
        logo.style.minWidth = `${logo.offsetWidth}px`;
        const start = performance.now();
        const tick = now => {
            // Each letter locks in place one after another, left to right.
            const settled = (now - start) / 35;
            label.textContent = [...original].map((c, i) =>
                c === ' ' || i < settled - 4 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            ).join('');
            if (settled - 4 < original.length) frame = requestAnimationFrame(tick);
            else label.textContent = original;
        };
        frame = requestAnimationFrame(tick);
    });
})();
