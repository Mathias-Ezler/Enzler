// Visualizador 3D de arquitectura (canvas 2D con proyección en perspectiva)
export function initHeroCanvas(canvas, { count = 64 } = {}) {
    const ctx = canvas.getContext("2d");
    const box = canvas.parentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, visible = true, dragging = false, lx = 0, ly = 0, ry = 0, rx = 0;
  
    const resize = () => {
      const r = box.getBoundingClientRect(), d = devicePixelRatio || 1;
      w = r.width; h = r.height;
      canvas.width = w * d; canvas.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    new ResizeObserver(resize).observe(box);
    resize();
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  
    const nodes = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300, z: (Math.random() - 0.5) * 300,
      pulse: Math.random() * Math.PI * 2,
    }));
  
    canvas.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointerup", () => (dragging = false));
    canvas.addEventListener("pointercancel", () => (dragging = false));
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      ry += (e.clientX - lx) * 0.005; rx += (e.clientY - ly) * 0.005;
      lx = e.clientX; ly = e.clientY;
    });
  
    (function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      if (!dragging && !reduce) { ry += 0.003; rx += 0.001; }
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      const P = nodes.map((n) => {
        n.pulse += 0.03;
        const x1 = n.x * cy - n.z * sy, z1 = n.z * cy + n.x * sy;
        const y1 = n.y * cx - z1 * sx, z2 = z1 * cx + n.y * sx;
        const s = 300 / (300 + z2 + 200);
        return { x: x1 * s + w / 2, y: y1 * s + h / 2, s, glow: (Math.sin(n.pulse) + 1) / 2 };
      });
  
      ctx.lineWidth = 0.8;
      for (let i = 0; i < P.length; i++)
        for (let j = i + 1; j < P.length; j++) {
          const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
          if (d < 95) {
            ctx.strokeStyle = `rgba(79,140,255,${(1 - d / 95) * 0.4})`;
            ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke();
          }
        }
      for (const p of P) {
        ctx.fillStyle = "#4F8CFF";
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.s, 0, Math.PI * 2); ctx.fill();
        const b = 24 * p.s;
        ctx.fillStyle = `rgba(24,29,36,${0.4 * p.s})`;
        ctx.strokeStyle = `rgba(79,140,255,${0.3 * p.glow})`;
        ctx.fillRect(p.x - b / 2, p.y - b / 2, b, b);
        ctx.strokeRect(p.x - b / 2, p.y - b / 2, b, b);
      }
    })();
  }