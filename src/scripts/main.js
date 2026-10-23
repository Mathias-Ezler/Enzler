import { initHeroCanvas } from "./canvas.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Header + barra de progreso de lectura */
const header = $("#header"), bar = $("#progress");
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header.classList.toggle("h-16", scrollY > 40);
  header.classList.toggle("h-20", scrollY <= 40);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Reveal con escalonado (--d) */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("visible");
  $$("[data-count]", e.target).forEach(countUp);
  io.unobserve(e.target);
}), { threshold: 0.15 });
$$("[data-reveal]").forEach((el) => io.observe(el));

/* Contadores */
function countUp(el) {
  const to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || "";
  const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
  if (reduce) return (el.textContent = fmt(to));
  const t0 = performance.now(), dur = 1400;
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(to * ease);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

/* Modal */
const modal = $("#projectModal"), ok = $("#modalSuccess"), form = $("form", modal);
const open = () => { modal.classList.remove("opacity-0", "pointer-events-none"); modal.classList.add("open"); document.body.style.overflow = "hidden"; $("input", modal).focus(); };
const close = () => { modal.classList.add("opacity-0", "pointer-events-none"); modal.classList.remove("open"); document.body.style.overflow = ""; };
$$("[data-open-modal]").forEach((b) => b.addEventListener("click", open));
$$("[data-close-modal]").forEach((b) => b.addEventListener("click", close));
modal.addEventListener("click", (e) => e.target === modal && close());
addEventListener("keydown", (e) => e.key === "Escape" && close());
form.addEventListener("submit", (e) => {
  e.preventDefault();
  // TODO: conectar con tu backend / servicio de formularios
  ok.classList.remove("hidden");
  setTimeout(() => { close(); ok.classList.add("hidden"); form.reset(); }, 2500);
});

/* Hero canvas */
const cv = $("#heroCanvas");
if (cv) initHeroCanvas(cv);