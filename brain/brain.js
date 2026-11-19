/* =====================================================================
   PIP'S BRAIN — the "student".

   A 23 MB sentence-embedding model (MiniLM, 8-bit) runs in the visitor's
   browser via transformers.js. It turns a question into a 384-number
   vector and finds the closest example in the distilled dataset
   (brain/dataset.js). Example vectors are precomputed in brain/index.json
   so visitors only ever embed their own question.

   Nothing the visitor types leaves their device.
   ===================================================================== */
(function () {
  const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
  // Phase 2: after fine-tuning (brain/finetune.py), put the exported folder in
  // brain/models/<name>/ and set LOCAL_MODEL = "<name>". Then rebuild the index.
  const LOCAL_MODEL = null;
  const MODEL = LOCAL_MODEL || "Xenova/all-MiniLM-L6-v2";
  const DATA = window.PIP_DATA;
  // index.json sits next to this file, wherever the page that loads us lives.
  const INDEX_URL = new URL("index.json", document.currentScript ? document.currentScript.src : location.href).href;

  // Flatten the dataset: one row per example sentence.
  const exText = [], exIntent = [];
  DATA.intents.forEach((it, i) => it.examples.forEach((e) => { exText.push(norm(e)); exIntent.push(i); }));

  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, " ").trim(); }
  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16);
  }
  const DATA_HASH = fnv1a(MODEL + "\n" + exText.join("\n"));

  let extractor = null, index = null, loading = null, failed = false;

  async function embed(texts) {
    const out = [];
    for (let i = 0; i < texts.length; i += 64) {
      const t = await extractor(texts.slice(i, i + 64), { pooling: "mean", normalize: true });
      out.push(...t.tolist());
    }
    return out;
  }

  // int8 <-> base64 so the index is small (~200 KB instead of ~2 MB of JSON floats)
  function toB64(int8) {
    const u8 = new Uint8Array(int8.buffer);
    let s = "";
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(b64) {
    const bin = atob(b64), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Int8Array(u8.buffer);
  }

  function quantize(vectors) {
    const dim = vectors[0].length;
    let maxAbs = 0;
    vectors.forEach((v) => v.forEach((x) => (maxAbs = Math.max(maxAbs, Math.abs(x)))));
    const scale = 127 / maxAbs;
    const q = new Int8Array(vectors.length * dim);
    vectors.forEach((v, r) => v.forEach((x, c) => (q[r * dim + c] = Math.round(x * scale))));
    return { dim, scale, q };
  }

  async function load(onProgress) {
    if (loading) return loading;
    loading = (async () => {
      try {
        const T = await import(/* webpackIgnore: true */ LIB);
        if (LOCAL_MODEL) {
          T.env.allowLocalModels = true;
          T.env.allowRemoteModels = false;
          T.env.localModelPath = new URL("models/", INDEX_URL).href;
        } else {
          T.env.allowLocalModels = false;
        }
        const seen = {};
        extractor = await T.pipeline("feature-extraction", MODEL, {
          dtype: "q8",
          progress_callback: (p) => {
            if (p.status === "progress" && p.file && p.total) {
              seen[p.file] = [p.loaded, p.total];
              const [l, t] = Object.values(seen).reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
              onProgress && onProgress(Math.round((l / t) * 100));
            }
          },
        });

        try {
          const r = await fetch(INDEX_URL, { cache: "no-cache" });
          if (r.ok) {
            const j = await r.json();
            if (j.hash === DATA_HASH && j.count === exText.length) index = { dim: j.dim, scale: j.scale, q: fromB64(j.vectors) };
            else console.warn("[Pip brain] index.json is out of date with dataset.js. Rebuild it (see brain/README.md). Embedding live for now.");
          }
        } catch (e) { /* fall through to live embedding */ }
        if (!index) index = quantize(await embed(exText));
        return true;
      } catch (e) {
        console.warn("[Pip brain] could not load:", e);
        failed = true;
        return false;
      }
    })();
    return loading;
  }

  // Returns the best intents, best first: [{ intent, score, example }]
  async function match(question) {
    const [v] = await embed([norm(question)]);
    const { dim, scale, q } = index;
    const best = new Map(); // intent index -> { score, example }
    for (let r = 0; r < exIntent.length; r++) {
      let dot = 0;
      const off = r * dim;
      for (let c = 0; c < dim; c++) dot += q[off + c] * v[c];
      const s = dot / scale;
      const i = exIntent[r];
      if (!best.has(i) || s > best.get(i).score) best.set(i, { score: s, example: exText[r] });
    }
    return [...best.entries()]
      .map(([i, b]) => ({ intent: DATA.intents[i], score: b.score, example: b.example }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  // Confidence rules, shared by the chat and the eval.
  //  answer  : confident enough to reply
  //  clarify : two intents are close, so ask "did you mean…?"
  //  unknown : nothing close, so be honest
  const HIGH = 0.55, LOW = 0.42, GAP = 0.06;
  function decide(top) {
    const [a, b] = top;
    if (!a || a.score < LOW) return { type: "unknown", top };
    if (a.score >= HIGH || !b || a.score - b.score >= GAP) return { type: "answer", intent: a.intent, score: a.score, top };
    return { type: "clarify", options: [a, b].filter((x) => x.score >= LOW - 0.04), top };
  }

  // Runs the held-out eval (brain/eval.js). "a|b" accepts either; "?" means "should not answer".
  async function evaluate(cases) {
    let pass = 0;
    const rows = [];
    for (const [q, want] of cases) {
      const d = decide(await match(q));
      const ok = want.split("|");
      const got = d.type === "unknown" ? "?" : d.type === "answer" ? d.intent.id : "clarify:" + d.options.map((o) => o.intent.id).join("/");
      const good = d.type === "answer" ? ok.includes(d.intent.id)
        : d.type === "unknown" ? ok.includes("?")
        : d.options.some((o) => ok.includes(o.intent.id)) ? 0.5 : 0;
      pass += good === true ? 1 : good || 0;
      rows.push({ q, want, got, score: d.top[0] ? d.top[0].score : 0, good });
    }
    return { pass, total: cases.length, rows };
  }

  // Used by brain/build.html to precompute the index.
  async function buildIndex(onProgress) {
    await load(onProgress);
    const { dim, scale, q } = quantize(await embed(exText));
    return { model: MODEL, hash: DATA_HASH, count: exText.length, intents: DATA.intents.length, dim, scale, vectors: toB64(q), built: new Date().toISOString() };
  }

  // Training data for brain/finetune.py: every example with its intent id.
  function trainingData() {
    return { model: MODEL, intents: DATA.intents.map((it) => ({ id: it.id, examples: it.examples })) };
  }

  window.PipBrain = {
    trainingData,
    load, match, decide, evaluate, buildIndex,
    get ready() { return !!(extractor && index); },
    get failed() { return failed; },
    stats: { examples: exText.length, intents: DATA.intents.length, model: MODEL },
  };
})();
