/* =====================================================================
   PIP — the character. Drawing, moods, tricks, cursor following,
   sleeping, dizziness. Talks to the chat through Pip.on(event, fn).
   ===================================================================== */
(function () {
  const SVG = `
<svg class="pip-svg" viewBox="-30 -50 260 290" role="img" aria-label="Pip, a small white robot with a black visor and glowing cyan eyes">
  <g class="p-eggs">
    <ellipse class="egg e1" cx="100" cy="-14" rx="9" ry="12" fill="#fffaf0" stroke="#c9c2b0"/>
    <ellipse class="egg e2" cx="100" cy="-14" rx="9" ry="12" fill="#2b2622"/>
    <ellipse class="egg e3" cx="100" cy="-14" rx="9" ry="12" fill="#fffaf0" stroke="#c9c2b0"/>
  </g>
  <g class="p-zzz" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" fill="#7c86b8">
    <text class="z z1" x="150" y="20" font-size="18">z</text>
    <text class="z z2" x="166" y="0" font-size="24">z</text>
    <text class="z z3" x="186" y="-24" font-size="30">Z</text>
  </g>

  <g class="p-larm"><ellipse cx="54" cy="160" rx="11" ry="20" transform="rotate(25 54 160)" fill="url(#g-shell)"/></g>
  <g class="p-rarm"><ellipse cx="150" cy="128" rx="11" ry="22" transform="rotate(-35 150 128)" fill="url(#g-shell)"/></g>

  <ellipse cx="100" cy="166" rx="40" ry="36" fill="url(#g-shell)"/>
  <g class="p-chest">
    <circle cx="100" cy="166" r="13" fill="url(#g-pod)"/>
    <circle class="p-core" cx="100" cy="166" r="7" fill="url(#g-core)" filter="url(#g-glow)"/>
  </g>
  <g class="p-seg">
    <rect x="72" y="154" width="56" height="24" rx="5" fill="#141414"/>
    <text x="100" y="173" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="18" font-weight="500" fill="#ff3b30">0004</text>
  </g>
  <g class="acc acc-tie">
    <path d="M94 138 L106 138 L103 146 L108 174 L100 182 L92 174 L97 146 Z" fill="#3b4fe0"/>
    <path d="M94 138 L106 138 L103 146 L97 146 Z" fill="#2a37a8"/>
  </g>

  <ellipse cx="34" cy="86" rx="12" ry="20" fill="url(#g-pod)"/>
  <ellipse cx="166" cy="86" rx="12" ry="20" fill="url(#g-pod)"/>
  <rect x="34" y="28" width="132" height="116" rx="56" fill="url(#g-shell)"/>
  <rect x="50" y="46" width="100" height="78" rx="36" fill="url(#g-visor)"/>
  <path d="M62 58 Q80 50 104 52" stroke="rgba(255,255,255,.22)" stroke-width="5" fill="none" stroke-linecap="round"/>

  <g class="p-eyes">
    <g class="p-eyes-normal" filter="url(#g-glow)">
      <rect class="p-eye" x="72" y="70" width="16" height="22" rx="8" fill="#5ff3ff"/>
      <rect class="p-eye" x="112" y="70" width="16" height="22" rx="8" fill="#5ff3ff"/>
    </g>
    <g class="p-lids"><rect x="66" y="62" width="28" height="15" fill="#10131f"/><rect x="106" y="62" width="28" height="15" fill="#10131f"/></g>
    <g class="p-eyes-sleep" stroke="#5ff3ff" stroke-width="4" stroke-linecap="round" filter="url(#g-glow)">
      <path d="M71 84 Q80 90 89 84" fill="none"/><path d="M111 84 Q120 90 129 84" fill="none"/>
    </g>
    <g class="p-eyes-dizzy" stroke="#5ff3ff" stroke-width="3" fill="none" filter="url(#g-glow)">
      <path class="sp sp1" d="M80 81 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0"/>
      <path class="sp sp2" d="M120 81 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0"/>
    </g>
    <g class="p-eyes-happy" stroke="#5ff3ff" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#g-glow)">
      <path d="M71 86 Q80 74 89 86"/><path d="M111 86 Q120 74 129 86"/>
    </g>
  </g>
  <g class="p-blush"><ellipse cx="66" cy="100" rx="7" ry="4" fill="#ff8fb1" opacity=".55"/><ellipse cx="134" cy="100" rx="7" ry="4" fill="#ff8fb1" opacity=".55"/></g>

  <path class="p-mouth" d="M88 104 Q100 112 112 104" stroke="#5ff3ff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#g-glow)"/>
  <path class="p-mouth-flat" d="M90 107 L110 107" stroke="#5ff3ff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#g-glow)"/>
  <ellipse class="p-mouth-o" cx="100" cy="107" rx="6" ry="5" fill="none" stroke="#5ff3ff" stroke-width="3.5" filter="url(#g-glow)"/>

  <g class="acc acc-shades">
    <rect x="60" y="66" width="36" height="24" rx="8" fill="#000"/><rect x="104" y="66" width="36" height="24" rx="8" fill="#000"/>
    <rect x="94" y="72" width="12" height="4" fill="#000"/>
    <path d="M66 72 L76 72" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="acc acc-glasses" fill="none" stroke="#e8eaf6" stroke-width="3">
    <circle cx="80" cy="81" r="15"/><circle cx="120" cy="81" r="15"/><path d="M95 79 Q100 75 105 79"/>
  </g>

  <line x1="100" y1="28" x2="100" y2="12" stroke="#7fa8ff" stroke-width="4" stroke-linecap="round"/>
  <circle class="p-bulb" cx="100" cy="10" r="6" fill="url(#g-core)" filter="url(#g-glow)"/>
</svg>`;

  const listeners = {};
  const Pip = {
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); },
    emit(evt, data) { (listeners[evt] || []).forEach((f) => f(data)); },
  };

  let holder, mover, trickEl, thoughtEl, moodEl, area;
  let busy = false, asleep = false, pokes = 0;
  let thinkTimer = null, idleTimer = null, trickTimer = null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasMouse = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const MOODS = {
    neutral: { label: "✨ Just woke up", cls: "" },
    recruiter: { label: "👔 Recruiter mode", cls: "mood-recruiter" },
    engineer: { label: "🤓 Nerd mode", cls: "mood-engineer" },
    spy: { label: "🕶️ Suspicious", cls: "mood-spy" },
    friend: { label: "🙄 Unimpressed", cls: "mood-friend" },
  };
  let mood = "neutral";

  Pip.mount = function (el) {
    holder = el;
    holder.innerHTML = `<div class="pip-mover"><div class="pip-trick">${SVG}</div></div>`;
    mover = holder.querySelector(".pip-mover");
    trickEl = holder.querySelector(".pip-trick");
    thoughtEl = document.getElementById("thought");
    moodEl = document.getElementById("mood");
    area = document.getElementById("pip-area");

    holder.addEventListener("click", () => {
      pokes++;
      if (asleep) { wake(true); return; }
      Pip.emit("poke", pokes);
      if (pokes === 10) { Pip.trick("fall"); return; }
      Pip.flash("p-blush", 900);
      Pip.trick(["jump", "spin", "wiggle"][pokes % 3]);
    });

    setupFollow();
    resetIdle();
    scheduleTrick();
    ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"].forEach((e) =>
      addEventListener(e, resetIdle, { passive: true, capture: true })
    );
  };

  /* ---------- moods & expressions ---------- */
  Pip.setMood = function (m) {
    mood = MOODS[m] ? m : "neutral";
    Object.values(MOODS).forEach((v) => v.cls && holder.classList.remove(v.cls));
    if (MOODS[mood].cls) holder.classList.add(MOODS[mood].cls);
    if (moodEl) moodEl.textContent = MOODS[mood].label;
  };
  Pip.getMood = () => mood;

  Pip.flash = function (cls, ms) {
    holder.classList.add("show-" + cls);
    setTimeout(() => holder.classList.remove("show-" + cls), ms);
  };
  Pip.expression = function (name, ms = 1600) {
    // name: happy | surprised | flat
    holder.classList.add("ex-" + name);
    setTimeout(() => holder.classList.remove("ex-" + name), ms);
  };

  Pip.talking = function (on) { holder.classList.toggle("is-talking", !!on); };
  Pip.thinking = function (on) { holder.classList.toggle("is-thinking", !!on); };

  Pip.think = function (text, ms = 2800) {
    if (!thoughtEl) return;
    clearTimeout(thinkTimer);
    thoughtEl.textContent = text;
    thoughtEl.classList.add("on");
    thinkTimer = setTimeout(() => thoughtEl.classList.remove("on"), ms);
  };

  /* ---------- tricks ---------- */
  const TRICKS = {
    jump: { ms: 700 },
    spin: { ms: 900 },
    wiggle: { ms: 800 },
    backflip: { ms: 1100, say: "*attempts backflip*" },
    dance: { ms: 2400, say: "*dances to music only it can hear*" },
    wave: { ms: 1600 },
    juggle: { ms: 3200, say: "*juggles eggs from the AgBot dataset*" },
    seg: { ms: 2400, say: "*chest display: 0004*" },
    fall: { ms: 2600, say: "*falls over*" },
    nod: { ms: 900 },
    shake: { ms: 900 },
    peek: { ms: 1800 },
  };
  Pip.trick = function (name) {
    const t = TRICKS[name];
    if (!t || reduced) return;
    busy = true;
    Object.keys(TRICKS).forEach((k) => trickEl.classList.remove("t-" + k));
    void trickEl.offsetWidth; // restart animation
    trickEl.classList.add("t-" + name);
    if (t.say) Pip.think(t.say, t.ms + 400);
    if (name === "fall") setTimeout(() => Pip.think("*gets back up, pretends that didn't happen*", 2400), t.ms - 300);
    setTimeout(() => { trickEl.classList.remove("t-" + name); busy = false; }, t.ms);
  };

  function scheduleTrick() {
    clearTimeout(trickTimer);
    trickTimer = setTimeout(() => {
      if (!busy && !asleep && !document.hidden) {
        const pool = ["juggle", "backflip", "dance", "seg", "wave", "juggle", "seg"];
        Pip.trick(pool[Math.floor(Math.random() * pool.length)]);
      }
      scheduleTrick();
    }, 22000 + Math.random() * 16000);
  }

  /* ---------- sleeping ---------- */
  function resetIdle() {
    clearTimeout(idleTimer);
    if (asleep) wake(false);
    idleTimer = setTimeout(sleep, 45000);
  }
  function sleep() {
    if (asleep || reduced) return;
    asleep = true;
    holder.classList.add("is-asleep");
    Pip.think("*powers down to save battery*", 3000);
    Pip.emit("sleep");
  }
  function wake(byClick) {
    if (!asleep) return;
    asleep = false;
    holder.classList.remove("is-asleep");
    Pip.expression("surprised", 900);
    Pip.trick("jump");
    Pip.think(byClick ? "*wakes up* I WASN'T SLEEPING" : "*startled awake*", 2200);
    Pip.emit("wake", byClick);
  }

  /* ---------- following the cursor + dizzy detection ---------- */
  function setupFollow() {
    let tx = 0, ty = 0, x = 0, y = 0, ex = 0, ey = 0, tex = 0, tey = 0;
    let lastX = null, lastT = 0, lastDir = 0, flips = [], dizzy = false;

    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = area.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.42;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.max(1, Math.hypot(dx, dy));
      tex = (dx / d) * Math.min(7, d / 30);
      tey = (dy / d) * Math.min(5, d / 30);
      // drift toward cursor, limited to the stage
      const maxX = Math.max(0, r.width / 2 - 110), maxY = Math.max(0, r.height / 2 - 140);
      tx = Math.max(-maxX, Math.min(maxX, dx * 0.25));
      ty = Math.max(-maxY, Math.min(maxY, dy * 0.18));

      // dizzy: many fast left/right reversals in a short time
      const now = performance.now();
      if (lastX !== null) {
        const v = (e.clientX - lastX) / Math.max(1, now - lastT);
        const dir = Math.sign(v);
        if (Math.abs(v) > 1.8 && dir && dir !== lastDir) { flips.push(now); lastDir = dir; }
      }
      lastX = e.clientX; lastT = now;
      flips = flips.filter((t) => now - t < 900);
      if (flips.length >= 7 && !dizzy && !asleep) {
        dizzy = true; flips = [];
        holder.classList.add("is-dizzy");
        Pip.think("*sees stars* please stop shaking the mouse", 2600);
        Pip.emit("dizzy");
        setTimeout(() => { holder.classList.remove("is-dizzy"); dizzy = false; }, 2600);
      }
    }, { passive: true });

    function frame() {
      if (hasMouse && !reduced) {
        x += (tx - x) * 0.04; y += (ty - y) * 0.04;
        ex += (tex - ex) * 0.2; ey += (tey - ey) * 0.2;
        mover.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        holder.style.setProperty("--ex", ex.toFixed(2) + "px");
        holder.style.setProperty("--ey", ey.toFixed(2) + "px");
        if (thoughtEl) thoughtEl.style.transform = `translate(${(x * 0.6).toFixed(1)}px, ${(y * 0.6).toFixed(1)}px)`;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.Pip = Pip;
})();
