/* =====================================================================
   Mini-demos that appear as cards inside the chat.
   Each returns a DOM element. Callbacks let Pip react.
   ===================================================================== */
(function () {
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- AgBot egg sorter ---------- */
  function eggSorter(onDone) {
    const card = el(`
      <div class="rc"><div class="demo">
        <div class="k">AgBot · two-class egg detector (simulated)</div>
        <div class="belt"><div class="eggs"></div><div class="scanline"></div></div>
        <div class="btnrow" style="padding:12px 0 0">
          <button class="btn" data-run>Run detector</button>
          <button class="btn sec" data-new>New batch</button>
        </div>
        <div class="hint" data-out>Eggs incoming. Press “Run detector”.</div>
      </div></div>`);
    const eggsEl = card.querySelector(".eggs"), scan = card.querySelector(".scanline"), belt = card.querySelector(".belt");
    const out = card.querySelector("[data-out]");
    let running = false;

    function batch() {
      eggsEl.innerHTML = "";
      const n = 6;
      for (let i = 0; i < n; i++) {
        const black = Math.random() < 0.4;
        const conf = rand(0.86, 0.99).toFixed(2);
        const e = el(`<div class="egg-i ${black ? "k" : "w"}"><div class="bbox"><i>${black ? "black" : "white"} ${conf}</i></div></div>`);
        e.style.transform = `rotate(${rand(-10, 10).toFixed(0)}deg)`;
        eggsEl.appendChild(e);
      }
      belt.classList.remove("stopped");
      out.textContent = "Eggs incoming. Press “Run detector”.";
    }
    function run() {
      if (running) return;
      running = true;
      belt.classList.add("stopped");
      scan.classList.remove("go"); void scan.offsetWidth; scan.classList.add("go");
      const eggs = [...eggsEl.children];
      eggs.forEach((e, i) => setTimeout(() => e.querySelector(".bbox").classList.add("on"), 200 + (i + 0.5) * (1400 / eggs.length)));
      setTimeout(() => {
        const black = eggs.filter((e) => e.classList.contains("k")).length;
        const total = store.get("pip_eggs", 0) + eggs.length;
        store.set("pip_eggs", total);
        out.textContent = `${eggs.length} eggs → ${eggs.length - black} white, ${black} black. You've sorted ${total} eggs. Only ${Math.max(0, 1000 - total)} to go to match Kanwar's dataset.`;
        running = false;
        onDone && onDone({ total, black, n: eggs.length });
      }, 1750);
    }
    card.querySelector("[data-run]").onclick = run;
    card.querySelector("[data-new]").onclick = () => { if (!running) batch(); };
    batch();
    return card;
  }

  /* ---------- FPGA IR gate ---------- */
  function irGate(onCount) {
    const card = el(`
      <div class="rc"><div class="demo">
        <div class="k">FPGA · DE10-Standard · IR beam counter</div>
        <div class="gate" aria-label="Drag the box through the IR gate">
          <div class="ground"></div>
          <div class="post" data-p1></div><div class="post" data-p2></div><div class="beam"></div>
          <div class="box3d" tabindex="0" role="button" aria-label="Box. Drag it through the gate, or press Enter to push it.">box</div>
        </div>
        <div class="segrow">
          <div class="seg" data-seg>0000</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.5">Drag the box through the beam.<br><button class="btn sec" data-push style="margin-top:6px">Push it for me</button></div>
        </div>
      </div></div>`);
    const gate = card.querySelector(".gate"), box = card.querySelector(".box3d"), beam = card.querySelector(".beam");
    const p1 = card.querySelector("[data-p1]"), p2 = card.querySelector("[data-p2]"), seg = card.querySelector("[data-seg]");
    let count = store.get("pip_gate", 0), x = 18, inBeam = false, dragging = false, offX = 0;

    const render = () => {
      const s = String(Math.min(9999, count)).padStart(4, "0");
      const lead = s.match(/^0*/)[0].length;
      seg.innerHTML = `<span class="ghost">${s.slice(0, Math.min(lead, 3))}</span>${s.slice(Math.min(lead, 3))}`;
    };
    function layout() {
      const W = gate.clientWidth, c = W / 2;
      p1.style.left = c - 58 + "px"; p2.style.left = c + 42 + "px";
      beam.style.left = c - 42 + "px"; beam.style.width = "84px";
      place();
    }
    function place() {
      const W = gate.clientWidth;
      x = Math.max(4, Math.min(W - 48, x));
      box.style.left = x + "px";
      const c = W / 2, bx1 = x, bx2 = x + 44;
      const overlap = bx2 > c - 20 && bx1 < c + 20;
      if (overlap && !inBeam) {
        inBeam = true; count++; store.set("pip_gate", count); render();
        beam.classList.add("hit"); setTimeout(() => beam.classList.remove("hit"), 250);
        onCount && onCount(count);
      } else if (!overlap) inBeam = false;
    }
    box.addEventListener("pointerdown", (e) => {
      dragging = true; box.setPointerCapture(e.pointerId);
      offX = e.clientX - box.getBoundingClientRect().left;
    });
    box.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      x = e.clientX - gate.getBoundingClientRect().left - offX; place();
    });
    box.addEventListener("pointerup", () => (dragging = false));
    box.addEventListener("pointercancel", () => (dragging = false));
    function push() {
      const W = gate.clientWidth, from = x < W / 2 ? 18 : W - 62, to = from < W / 2 ? W - 62 : 18;
      const t0 = performance.now();
      (function step(t) {
        const k = Math.min(1, (t - t0) / 700);
        x = from + (to - from) * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); place();
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    card.querySelector("[data-push]").onclick = push;
    box.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); push(); } });
    render();
    requestAnimationFrame(layout);
    addEventListener("resize", layout);
    return card;
  }

  /* ---------- Hydro stopwatch ---------- */
  function stopwatch(onDone) {
    const card = el(`
      <div class="rc"><div class="demo">
        <div class="k">Manitoba Hydro · SQL automation · 1 min = 0.1 s</div>
        <div class="lane"><span>before</span><div class="track"><i data-a style="background:#b8bcd8"></i></div><b data-ta>0 min</b></div>
        <div class="lane"><span>after</span><div class="track"><i data-b style="background:var(--me)"></i></div><b data-tb>0 min</b></div>
        <div class="btnrow" style="padding:6px 0 0"><button class="btn" data-run>▶ Run both</button></div>
        <div class="hint" data-out>Same job, old way vs. Kanwar's scripts.</div>
      </div></div>`);
    const a = card.querySelector("[data-a]"), b = card.querySelector("[data-b]");
    const ta = card.querySelector("[data-ta]"), tb = card.querySelector("[data-tb]"), out = card.querySelector("[data-out]");
    let running = false;
    card.querySelector("[data-run]").onclick = () => {
      if (running) return;
      running = true;
      const t0 = performance.now(), A = 4500, B = 1000;
      (function step(t) {
        const e = t - t0;
        const ka = Math.min(1, e / A), kb = Math.min(1, e / B);
        a.style.width = ka * 100 + "%"; b.style.width = kb * 22 + "%";
        ta.textContent = Math.round(ka * 45) + " min"; tb.textContent = Math.round(kb * 10) + " min" + (kb >= 1 ? " ✓" : "");
        if (kb >= 1 && e < B + 40) out.textContent = "“After” is done. “Before” is still going…";
        if (ka < 1) requestAnimationFrame(step);
        else { out.textContent = "35 minutes saved per run, for ~30 people. That adds up fast."; running = false; onDone && onDone(); }
      })(t0);
    };
    return card;
  }

  /* ---------- MPI halo regions ---------- */
  function mpi(onChange) {
    const card = el(`
      <div class="rc"><div class="demo">
        <div class="k">MPI · row partitioning with halo regions</div>
        <div class="mpi-ctl"><span>processes</span><input type="range" min="1" max="8" step="1" value="4" aria-label="Number of processes"><b data-n>4</b></div>
        <div class="strips" data-strips></div>
        <div class="hint" data-out></div>
      </div></div>`);
    const input = card.querySelector("input"), strips = card.querySelector("[data-strips]");
    const nEl = card.querySelector("[data-n]"), out = card.querySelector("[data-out]");
    const colors = ["#c9d7ff", "#c8f0e1", "#ffd6cc", "#e5e1fb", "#fde2f3", "#d7f0ff", "#e8f5c8", "#ffe9c2"];
    const ROWS = 1080;
    function draw() {
      const p = +input.value;
      nEl.textContent = p;
      strips.innerHTML = "";
      for (let i = 0; i < p; i++) {
        if (i > 0) strips.appendChild(el(`<div class="halo" title="halo rows shared between P${i - 1} and P${i}"></div>`));
        strips.appendChild(el(`<div class="strip" style="background:${colors[i]}">P${i} · ${Math.ceil(ROWS / p)} rows</div>`));
      }
      out.textContent = p === 1
        ? "One process, no halos. That's just… regular code."
        : `${p} processes, ${p - 1} halo boundaries. Each strip gets a copy of its neighbours' edge rows so the filter doesn't break at the seams. Sent out with MPI_Scatterv, collected with MPI_Gatherv.`;
      onChange && onChange(p);
    }
    input.addEventListener("input", draw);
    draw();
    return card;
  }

  /* ---------- Spy dossier ---------- */
  function dossier() {
    const reveals = [
      "[MPI. it's literally on his resume]",
      "[1,000 photos and a lot of patience]",
      "[none found. we checked twice]",
      "[genuinely nice guy. annoyingly so]",
    ];
    const card = el(`
      <div class="dossier">
        <div class="stamp">CLASSIFIED</div>
        FILE 004 · SUBJECT: K. LUBANA<br>
        CLEARANCE: <b>visitor (suspicious)</b><br><br>
        Splits images across processors using <span class="red" style="width:64px" title="click to declassify"></span> and halo regions.<br>
        Taught a robot to tell eggs apart. Method: <span class="red" style="width:110px" title="click to declassify"></span><br>
        Known weaknesses: <span class="red" style="width:120px" title="click to declassify"></span><br>
        Personality: <span class="red" style="width:90px" title="click to declassify"></span><br><br>
        Secret sauce: <b>coffee.</b>
        <div style="margin-top:10px;font-size:11px;opacity:.7">(click a black bar to declassify it)</div>
      </div>`);
    card.querySelectorAll(".red").forEach((r, i) => {
      r.addEventListener("click", () => {
        const s = document.createElement("b"); s.textContent = reveals[i];
        r.replaceWith(s);
      });
    });
    return card;
  }

  window.Demos = { eggSorter, irGate, stopwatch, mpi, dossier, store };
})();
