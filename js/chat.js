/* =====================================================================
   THE CONVERSATION. Pip is not an AI — it's a script with good timing.
   Scenes are async functions; everything runs through one queue so
   messages never overlap.
   ===================================================================== */
(function () {
  const K = window.KANWAR, D = window.Demos, store = D.store;
  const log = document.getElementById("log");
  const chipsEl = document.getElementById("chips");
  const form = document.getElementById("composer");
  const input = document.getElementById("ask");

  /* ---------------- state ---------------- */
  const S = {
    role: null,
    roleSwitches: 0,
    seen: new Set(),
    lastChips: [],
    prevRole: store.get("pip_role", null),
    visits: store.get("pip_visits", 0) + 1,
    temp: null,
    dizzyCommented: false,
    overviewComment: false,
  };
  store.set("pip_visits", S.visits);

  /* ---------------- helpers ---------------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const AV = `<svg class="av" viewBox="20 0 160 160" aria-hidden="true"><use href="#pip-avatar"/></svg>`;
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const timeStr = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const hour = () => new Date().getHours();

  let chain = Promise.resolve();
  const run = (fn) => (chain = chain.then(fn).catch((e) => console.error(e)));

  function scroll() { requestAnimationFrame(() => (log.scrollTop = log.scrollHeight)); }
  // Images load after they're added, so re-scroll when they do.
  log.addEventListener("load", (e) => { if (e.target.tagName === "IMG") scroll(); }, true);

  function row(html, who = "pip", withAv = true) {
    const r = document.createElement("div");
    r.className = "row" + (who === "me" ? " me" : "");
    r.innerHTML = (who === "pip" ? (withAv ? AV : AV.replace('class="av"', 'class="av blank"')) : "") + html;
    log.appendChild(r);
    scroll();
    return r;
  }

  async function say(html, opts = {}) {
    const plain = html.replace(/<[^>]+>/g, "");
    const typing = row(`<div class="b typing"><i></i><i></i><i></i></div>`);
    Pip.talking(true);
    await sleep(opts.delay ?? Math.min(1500, 380 + plain.length * 13));
    typing.remove();
    Pip.talking(false);
    row(`<div class="b">${html}</div>`);
    await sleep(opts.after ?? 260);
  }
  function card(node) {
    const r = row("", "pip", false);
    r.appendChild(node);
    scroll();
    return r;
  }
  function me(text) { row(`<div class="b">${esc(text)}</div>`, "me"); }
  function note(text) { const n = document.createElement("div"); n.className = "sysnote"; n.textContent = text; log.appendChild(n); scroll(); }

  function chips(list) {
    S.lastChips = list;
    chipsEl.innerHTML = "";
    list.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (c.ghost ? " ghost" : "");
      b.textContent = c.label;
      b.onclick = () => {
        chipsEl.innerHTML = "";
        run(async () => { if (!c.silent) me(c.label); await c.go(); });
      };
      chipsEl.appendChild(b);
    });
    scroll();
  }
  const clearChips = () => (chipsEl.innerHTML = "");

  const nodeFrom = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  /* ---------------- cards ---------------- */
  function statsCard() {
    return nodeFrom(`<div class="rc">
      <div class="stats">${K.stats.map((s) => `<div class="stat"><b>${esc(s.big)}</b><span>${esc(s.small)}</span></div>`).join("")}</div>
      <div class="btnrow">${K.links.resume ? `<a class="btn" href="${K.links.resume}" target="_blank" rel="noopener">Resume (PDF)</a>` : `<a class="btn" href="mailto:${K.links.email}">Email him</a>`}<a class="btn sec" href="${K.links.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a></div>
    </div>`);
  }
  function projectCard(id) {
    const p = K.projects.find((x) => x.id === id);
    const n = nodeFrom(`<div class="rc">
      ${p.photos.length ? `<div class="ph">${p.photos.map((s) => `<img src="${s}" alt="${esc(p.title)}">`).join("")}</div>` : ""}
      <div class="bd"><div class="k">${esc(p.org)}${p.when ? " · " + esc(p.when) : ""}</div><h4>${esc(p.title)}</h4><p>${esc(p.blurb)}</p>
      <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div></div>`);
    n.querySelectorAll("img").forEach((img) => (img.onclick = () => openLightbox(img.src, img.alt)));
    return n;
  }
  function skillsCard() {
    return nodeFrom(`<div class="rc"><div class="skillgrid">${Object.entries(K.skills)
      .map(([g, l]) => `<div><div class="k">${esc(g)}</div><div class="tags">${l.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`)
      .join("")}</div></div>`);
  }
  function linksCard() {
    return nodeFrom(`<div class="rc"><div class="btnrow" style="padding:14px 16px">
      <a class="btn" href="${K.links.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
      <a class="btn sec" href="mailto:${K.links.email}">Email him</a>
      <a class="btn sec" href="${K.links.github}" target="_blank" rel="noopener">GitHub</a>
      ${K.links.resume ? `<a class="btn sec" href="${K.links.resume}" target="_blank" rel="noopener">Resume</a>` : ""}</div></div>`);
  }
  function albumCard() {
    const n = nodeFrom(`<div class="rc"><div class="ph" style="height:170px">
      <img src="img/ir-gate.webp" alt="The cardboard IR gate and FPGA board"><img src="img/breadboard.jpg" alt="Breadboard circuit with a lit LED"><img src="img/agbot.jpg" alt="AgBot robot base on a lab bench"></div>
      <div class="bd"><div class="k">The unofficial album</div><p>Lab nights, cardboard engineering, and a breadboard that finally lit up.</p></div></div>`);
    n.querySelectorAll("img").forEach((img) => (img.onclick = () => openLightbox(img.src, img.alt)));
    return n;
  }
  function quotesCard() {
    if (!K.quotes.length) return null;
    return nodeFrom(`<div class="rc"><div class="bd">${K.quotes
      .map((q) => `<p style="font-style:italic;font-size:15px">“${esc(q.text)}”</p><div class="k" style="margin:6px 0 12px">${esc(q.by)} · ${esc(q.role)}</div>`)
      .join("")}</div></div>`);
  }

  /* ---------------- judging ---------------- */
  // Called when a visitor opens content that doesn't match who they said they were.
  async function judge(area) {
    const r = S.role;
    const lines = {
      "friend>recruiter": "Planning to hire your friend? Bold. I respect it.",
      "recruiter>spy": "A recruiter… in the classified folder. Interesting. I'm writing this down. ✍️",
      "spy>engineer": "Taking notes, are we? 🕶️ I see you.",
      "engineer>friend": "The engineer wants to see the personal stuff. Balance. Respect.",
      "recruiter>friend": "Checking if he's fun to work with? Smart. (He is.)",
      "friend>spy": "You're his friend AND a spy? Does he know?",
    };
    const k = `${r}>${area}`;
    if (r && lines[k] && !S.seen.has("judge:" + k)) {
      S.seen.add("judge:" + k);
      Pip.trick("nod");
      await say(lines[k]);
    }
  }

  /* ---------------- scenes ---------------- */
  const ROLE_CHIPS = () => [
    { label: "I'm hiring 👔", go: () => setRole("recruiter") },
    { label: "I'm an engineer 🤓", go: () => setRole("engineer") },
    { label: "I'm from a GPU company… totally not here to steal anything 🕶️", go: () => setRole("spy") },
    { label: "I'm his friend 👋", go: () => setRole("friend") },
    { label: "Just browsing", go: browsing, ghost: true },
  ];

  async function start() {
    Pip.trick("wave");
    if (S.prevRole && S.visits > 1) {
      const back = {
        recruiter: "Oh, the recruiter's back. 👀 Couldn't stop thinking about him, huh?",
        engineer: "The engineer returns. Did the halo regions keep you up at night too?",
        spy: "You again. 🕶️ I changed the locks, you know.",
        friend: "Back again? You still haven't texted him, have you.",
      }[S.prevRole];
      await say(`Hey! ${back}`);
      await say(`Want to pick up where you left off, or are you someone else today?`);
      chips([{ label: `Same as last time`, go: () => setRole(S.prevRole) }, ...ROLE_CHIPS().slice(0, 4)]);
      return;
    }
    await say(`Hi! I'm Pip 👋 I'm Kanwar's AI assistant. I know basically everything about him. <span class="aside">(He built me. Don't tell him I said that.)</span>`);
    if (hour() < 5) await say(`<span class="aside">Also, it's ${timeStr()}. Why are you looking at portfolios right now? …No judgement. He's probably awake too.</span>`);
    await say("So, who are you?");
    chips(ROLE_CHIPS());
  }

  async function setRole(role) {
    if (S.role && S.role !== role) S.roleSwitches++;
    const prev = S.role;
    S.role = role;
    store.set("pip_role", role);
    Pip.setMood(role);
    if (S.roleSwitches >= 2) await say("Can't decide who you are? Relatable. 🙃");
    else if (prev) await say(pick(["Oh, a costume change. Okay.", "Identity crisis noted. Switching modes."]));
    await ({ recruiter, engineer, spy, friend })[role]();
  }

  async function browsing() {
    Pip.expression("happy");
    await say("A mysterious visitor. I like it. 😏");
    await say("Here, something to play with while you decide. This is a simulated version of the egg detector Kanwar trained for the AgBot robot:");
    card(D.eggSorter(eggReact));
    await say("So… who are you, really?");
    chips(ROLE_CHIPS().slice(0, 4));
  }

  /* ----- recruiter ----- */
  async function recruiter() {
    Pip.think("*straightens tiny tie*");
    Pip.trick("nod");
    await say("Oh! A recruiter! Okay, act natural, act natural…");
    await say("I'll keep it short, because I know you have 40 tabs open. Here's Kanwar in three numbers:");
    card(statsCard());
    await say(`He's a Computer Engineering student at the University of Manitoba (graduating ${K.gradDate}), looking for <b>co-op and research roles</b> in AI, computer vision and embedded systems.`);
    recruiterChips();
  }
  function recruiterChips(exclude = []) {
    chips([
      { id: "best", label: "Show me his best work", go: bestWork },
      { id: "why", label: "Why should I hire him?", go: whyHire },
      { id: "skills", label: "What can he do?", go: skills },
      { id: "one", label: "Just give me the one-pager", go: async () => { await say("Say no more. 📄"); Overview.open(); recruiterChips(["one"]); } },
      { id: "spy", label: "Open the classified files 👀", go: async () => { await judge("spy"); await spyFiles(); }, ghost: true },
    ].filter((c) => !exclude.includes(c.id)));
  }
  async function bestWork() {
    await say("He did really well on this one 👇");
    card(projectCard("hydro"));
    await say("Crews in the field use it to log streetlights. He took it from idea to a working MVP and presented it to the engineers himself. And while he was there, he got a 45-minute SQL job down to 10. Watch:");
    card(D.stopwatch(() => run(() => say(pick(["See? Efficient. Like me.", "That's 35 minutes back, every run. You're welcome, Manitoba Hydro."])))));
    const q = quotesCard();
    if (q) { await say("Don't just take my word for it:"); card(q); }
    await say("And this is the one that gets people talking:");
    card(projectCard("agbot"));
    chips([
      { label: "Show me the AgBot demo", go: async () => { await agbotDemo(); recruiterChips(["best"]); } },
      { label: "Here's the part where you give me his LinkedIn", go: linkedinNudge },
      { label: "Wait, he draws?", go: draws },
      { label: "Just give me the one-pager", go: async () => { await say("Coming right up. 📄"); Overview.open(); recruiterChips(); } },
    ]);
  }
  async function linkedinNudge() {
    Pip.expression("happy");
    await say(`Here's his LinkedIn → ${link(K.links.linkedin, "linkedin.com/in/kanwar-n-s-lubana")}. Go check it out, he's genuinely a nice guy. <span class="aside">I'm not just saying that because he controls my source code.</span>`);
    card(linksCard());
    await say("Oh! And he draws on the side. Want to see?");
    chips([{ label: "Sure, show me", go: draws }, { label: "Back to the serious stuff", go: async () => recruiterChips() }]);
  }
  async function whyHire() {
    Pip.think("*clears throat in binary*");
    await say("Let me put on my serious voice. <i>*ahem*</i>");
    await say(`<b>1. He ships things real people use.</b> The Hydro field app and SQL scripts aren't class projects. About 30 people depend on his work.`);
    await say(`<b>2. He works across the whole stack.</b> Training vision models, getting them onto a Jetson, defining CAN messages for a race car, writing SQL. Software <i>and</i> hardware.`);
    await say(`<b>3. He makes other people better.</b> He was a Supplemental Instruction leader and tutor, and holds four student leadership roles.`);
    await say(`<b>4. He built me.</b> Look at me. I'm delightful.`);
    Pip.trick("backflip");
    recruiterChips(["why"]);
  }
  async function skills() {
    await say("Here's the toolbox:");
    card(skillsCard());
    await say(pick([
      "The short version: Python and C/C++ for the brains, STM32/FPGA/Jetson for the body, MPI for doing it all at once.",
      "AI on one side, hardware on the other. He's the bridge. I'm the bridge's mascot.",
    ]));
    S.role === "recruiter" ? recruiterChips(["skills"]) : engineerChips();
  }

  /* ----- engineer ----- */
  async function engineer() {
    Pip.think("*puts on tiny glasses*");
    await say("Finally. Someone who'll appreciate halo regions. 🤓");
    await say("Everything here is a mini-demo. Pick your poison:");
    engineerChips();
  }
  function engineerChips() {
    const all = [
      { id: "agbot", label: "🥚 AgBot egg detection", go: agbotDemo },
      { id: "counter", label: "📟 FPGA IR counter", go: counterDemo },
      { id: "mpi", label: "🧩 MPI halo regions", go: mpiDemo },
      { id: "hydro", label: "⏱️ The 45→10 min speed-up", go: hydroDemo },
      { id: "fe", label: "🏎️ Formula Electric CAN bus", go: feStory },
      { id: "stm32", label: "🔌 STM32 Ethernet server", go: stm32Story },
    ];
    const left = all.filter((c) => !S.seen.has(c.id));
    const extra = left.length ? [] : [{ label: "Seen it all? Get the one-pager", go: async () => { await say("Completionist. Respect. 📄"); Overview.open(); engineerChips(); } }];
    chips([...left, ...extra, { label: "What's his tech stack?", go: skills, ghost: true }]);
  }
  async function agbotDemo() {
    S.seen.add("agbot");
    await say("AgBot is a robot that sorts eggs. Kanwar is on the vision side. He took 1,000+ photos with a Basler camera, drew a box around every single egg, and trained a model to tell white from black.");
    card(projectCard("agbot"));
    await say("Here's a simulated version. Run the detector:");
    card(D.eggSorter(eggReact));
    if (S.role === "engineer") engineerChips();
  }
  function eggReact(r) {
    run(async () => {
      if (r.total >= 1000 && !S.seen.has("egg1000")) { S.seen.add("egg1000"); Pip.trick("juggle"); await say("You've sorted 1,000 eggs. You are now officially as patient as Kanwar. 🥚🏆"); }
      else if (!S.seen.has("egg1")) { S.seen.add("egg1"); Pip.expression("happy"); await say("Nice! Now imagine labelling 1,000 of those by hand. That's what he did. 🥚"); }
    });
  }
  async function counterDemo() {
    S.seen.add("counter");
    await say("This one's a team project: an object counter on a DE10-Standard FPGA. Two IR sensors on cardboard posts make a gate. Break the beam and the seven-segment display counts it.");
    card(projectCard("counter"));
    await say("Your turn. Push the box through the gate. Go on.");
    let reacted = 0;
    card(D.irGate((n) => {
      if (n === 1 && reacted < 1) { reacted = 1; run(() => say("Beep. Counted. 📟")); }
      if (n === 10 && reacted < 2) { reacted = 2; run(async () => { Pip.trick("seg"); await say("Ten boxes. You're having way too much fun with a cardboard box. Me too."); }); }
      if (n === 25 && reacted < 3) { reacted = 3; run(() => say("Okay, 25. The real one would've needed new batteries by now.")); }
    }));
    if (S.role === "engineer") engineerChips();
  }
  async function mpiDemo() {
    S.seen.add("mpi");
    await say("Parallel image processing, for ECE 4530. One image, split into strips, each strip handled by its own process. The tricky bit is the edges: a filter needs pixels from the <i>neighbouring</i> strip. So each strip carries a copy of its neighbours' edge rows. Those are the <b>halo regions</b>.");
    let said = new Set();
    card(D.mpi((p) => {
      if (p === 1 && !said.has(1)) { said.add(1); run(() => say("One process? That's not parallel, that's just… sad. 😐")); }
      if (p === 8 && !said.has(8)) { said.add(8); run(async () => { Pip.trick("spin"); await say("Eight processes! Now we're cooking. 🔥"); }); }
    }));
    await say("Drag the slider. Yellow stripes are the halo rows.");
    if (S.role === "engineer") engineerChips();
  }
  async function hydroDemo() {
    S.seen.add("hydro");
    await say("At Manitoba Hydro he rewrote a data-processing job that about 30 people relied on. 45 minutes became 10. Race them:");
    card(D.stopwatch(() => run(() => say("Same job. Same data. 35 minutes faster. ⏱️"))));
    card(projectCard("hydro"));
    await say("That's also the field app he built for streetlight inspections. It refuses to submit until GPS is within 10 m. Strict. I like it.");
    if (S.role === "engineer") engineerChips();
  }
  async function feStory() {
    S.seen.add("fe");
    card(projectCard("fe"));
    await say("Every part of an electric race car talks over a CAN bus. Kanwar helped define those messages: who sends what, how often, and in which bits. He also soldered custom PCBs.");
    await say(`<span class="aside">No photo of the car yet. I've asked him. Repeatedly.</span>`);
    if (S.role === "engineer") engineerChips();
  }
  async function stm32Story() {
    S.seen.add("stm32");
    card(projectCard("stm32"));
    await say("An STM32 running a FreeRTOS Ethernet server in C, talking to a multithreaded Java client. Two-way commands over the wire. Microcontrollers on the internet: what could go wrong.");
    if (S.role === "engineer") engineerChips();
  }

  /* ----- spy ----- */
  async function spy() {
    Pip.trick("shake");
    Pip.think("*squints*");
    await say("Hmm. 🔍 Your cursor is moving <i>suspiciously</i> efficiently.");
    await spyFiles();
  }
  async function spyFiles() {
    S.seen.add("spyfiles");
    await say("Fine. Here are the classified files.");
    card(D.dossier());
    await sleep(500);
    const hasCv = !!K.links.resume;
    await say(`…Actually. If you <i>are</i> from a GPU company, he's open to co-op. ${hasCv ? "Here's his resume" : `Here's his ${link(K.links.linkedin, "LinkedIn")}`}. You didn't hear it from me. 😉`);
    chips([
      { label: hasCv ? "Take the resume" : "Take the LinkedIn", go: async () => { window.open(hasCv ? K.links.resume : K.links.linkedin, "_blank", "noopener"); Pip.expression("happy"); await say("Pleasure doing business. 🤝 This conversation never happened."); spyAfter(); } },
      { label: "Deny everything", go: async () => { await say("That's <i>exactly</i> what a spy would say. 🕶️"); spyAfter(); } },
      { label: "Show me the parallel computing stuff", go: async () => { await judge("engineer"); await mpiDemo(); spyAfter(); } },
    ]);
  }
  function spyAfter() {
    chips([
      { label: "Okay fine, I'm actually hiring", go: () => setRole("recruiter") },
      { label: "Show me the parallel computing stuff", go: async () => { await judge("engineer"); await mpiDemo(); spyAfter(); } },
      { label: "Contact the subject", go: contact, ghost: true },
    ]);
  }

  /* ----- friend ----- */
  async function friend() {
    Pip.think("*crosses arms*");
    await say(`You know you could just… <b>text him?</b> Instead of snooping around his projects at ${timeStr()}?`);
    await say("Fine. Look around. But call him after. He'd like that. 💙");
    card(albumCard());
    friendChips();
  }
  function friendChips() {
    chips([
      { label: "See his drawings", go: draws },
      { label: "💬 Okay, I'll text him", go: async () => { Pip.expression("happy"); Pip.trick("dance"); await say("Good human. 🥹 Go on, I'll wait."); await say(`<span class="aside">(Still here? He's on ${link(K.links.linkedin, "LinkedIn")} too, if you lost his number.)</span>`); friendChips(); } },
      { label: "Play with his robot stuff", go: async () => { await agbotDemo(); friendChips(); } },
      { label: "Show me the recruiter stuff", go: async () => { await judge("recruiter"); card(statsCard()); await say("There. The official version. He looks good on paper, huh?"); friendChips(); }, ghost: true },
    ]);
  }
  async function draws() {
    await judge("friend");
    if (K.drawings.length) {
      await say("He draws! Here's some of it:");
      const n = nodeFrom(`<div class="rc"><div class="ph">${K.drawings.map((s) => `<img src="${s}" alt="Drawing by Kanwar">`).join("")}</div></div>`);
      n.querySelectorAll("img").forEach((img) => (img.onclick = () => openLightbox(img.src, img.alt)));
      card(n);
    } else {
      Pip.think("*rummages through folders*");
      await say("He draws on the side! It's one of my favourite things about him. 🎨");
      await say(`…He hasn't uploaded them yet. I've been nagging him. <span class="aside">Check back soon. I'll keep nagging.</span>`);
    }
    const back = { recruiter: () => recruiterChips(), engineer: engineerChips, friend: friendChips, spy: spyAfter }[S.role];
    back ? back() : chips(ROLE_CHIPS().slice(0, 4));
  }

  async function contact() {
    await say(`Best ways to reach him: ${link("mailto:" + K.links.email, K.links.email)} or ${link(K.links.linkedin, "LinkedIn")}.`);
    card(linksCard());
    if (S.lastChips.length) chips(S.lastChips);
  }

  /* ---------------- free-text "AI" ---------------- */
  const JOKES = [
    "Why did the FPGA break up with the CPU? It needed someone more <i>flexible</i>.",
    "There are 10 types of people: those who understand binary and those who don't.",
    "I'd tell you a UDP joke, but you might not get it.",
    "Why do embedded engineers hate the beach? Too many <i>interrupts</i>.",
  ];
  const RULES = [
    [/\b(are|r)\s+(you|u)\s+(an?\s+)?(ai|real|bot|robot|human|chat ?gpt|gpt|llm|sentient|alive)\b|\bis this (an? )?ai\b/, async () => { Pip.think("*sweats in silicon*"); await say("Am I an AI? I'm a highly advanced neural network with… <i>*checks notes*</i> …a lot of if-statements. Next question. 😅"); }],
    [/who (made|built|created|programmed|coded) you|your (creator|maker|dad)/, () => say("Kanwar built me. Mostly at night. I think it shows. ✨")],
    [/your name|who are you|what are you/, () => say("I'm Pip! Kanwar's assistant, tour guide, and biggest fan. Mostly the last one.")],
    [/\b(gpa|grades?|marks)\b/, () => say(`${K.gpa}. That's on a 4.5 scale, before you panic. 📈`)],
    [/\bcuda\b|\bgpu\b|nvidia/, async () => { await say("He's done parallel computing with MPI and OpenMP. CUDA isn't on his resume yet, and I don't make things up. I have <i>standards</i>."); if (!S.seen.has("mpi")) chips([{ label: "Show me the MPI demo", go: mpiDemo }, ...S.lastChips.slice(0, 3)]); }],
    [/egg|agbot|vision|detect|jetson|camera|opencv|annotat/, () => agbotDemo()],
    [/hydro|streetlight|esri|fme|\bgis\b|field ?maps/, () => hydroDemo()],
    [/formula|race|\bcar\b|can ?bus|pcb|solder/, () => feStory()],
    [/fpga|\bir\b|infrared|sensor|counter|de10|seven.?segment/, () => counterDemo()],
    [/\bmpi\b|parallel|halo|openmp|multithread/, () => mpiDemo()],
    [/stm32|ethernet|freertos|\brtos\b|microcontroller/, () => stm32Story()],
    [/python|c\+\+|\bjava\b|verilog|matlab|\bsql\b|language|program|\bcode\b|coding/, () => say(`He writes ${K.skills.Programming.join(", ")}. Python and C/C++ are the daily drivers. 🧑‍💻`)],
    [/skill|good at|stack|tech|tools?\b|know/, () => skills()],
    [/hire|hiring|available|availability|co-?op|intern(ship)?|job|position|role|graduat|when.*(start|finish)/, async () => { await say(`He's open to <b>co-op and research roles</b>, especially AI, computer vision and embedded systems. He graduates ${K.gradDate}.`); card(statsCard()); }],
    [/where|location|live|winnipeg|canada|manitoba|weather|cold/, () => say(`He's in Winnipeg, Manitoba${S.temp !== null ? `, where it's currently <b>${S.temp}°C</b>${S.temp < -15 ? ". Yes, people live here. On purpose. 🥶" : "."}` : ". Famous for winters that build character. 🥶"}`)],
    [/school|university|college|study|studies|degree|major|course/, () => say(`${K.education.degree} at the ${K.education.school}, ${K.education.when}. Favourite-sounding courses: ${K.education.coursework.slice(0, 3).join(", ")}.`)],
    [/draw|art|sketch|hobb|fun|free time|weekend/, () => draws()],
    [/contact|email|reach|linkedin|github|resume|cv\b/, () => contact()],
    [/\b(phone|number|address|age|old|salary|single|girlfriend|boyfriend|dating|married)\b/, () => say(pick(["That's classified. Even I don't have clearance for that. 🔒", "Nice try. I'm a professional. Email's the way to reach him: " + K.links.email]))],
    [/joke|funny|laugh/, async () => { Pip.trick("wiggle"); await say(pick(JOKES)); }],
    [/love you|like you|cute|adorable|good bot|best bot/, async () => { Pip.flash("p-blush", 2500); Pip.expression("happy", 2500); await say("Stop it, you'll make my fans spin up. 🥹"); }],
    [/bad bot|stupid|dumb|useless|hate/, async () => { Pip.trick("shake"); await say("Rude. I'm telling Kanwar. 😤"); }],
    [/thank|thx|cheers/, () => say("Anytime! Tell your friends about me. And about him, I guess. 😌")],
    [/^(hi|hey|hello|yo|sup|hiya|howdy)\b/, async () => { Pip.trick("wave"); await say(pick(["Hey hey! 👋", "Hello, human!", "Hi! You found the text box. Most people don't."])); }],
    [/trick|dance|flip|juggle/, async () => { const t = pick(["backflip", "dance", "juggle", "seg"]); Pip.trick(t); await say(pick(["Ta-da! ✨", "I've been practising.", "Thank you, thank you. I'm here all week."])); }],
  ];
  const FALLBACK = [
    "Hmm, Kanwar hasn't trained me on that one yet. 🤔 Try asking about his projects, skills, or whether he's available.",
    "I'm not authorized to discuss that. Kanwar has me on a strict budget. 💸",
    "Great question. Terrible timing. Ask me about eggs, FPGAs, or MPI instead?",
    "My neural network just returned <code>undefined</code>. Try another question? 🫠",
  ];
  async function answer(q) {
    const t = q.toLowerCase();
    for (const [re, fn] of RULES) if (re.test(t)) { await fn(); return true; }
    Pip.think("*searches memory banks*", 1600);
    await say(pick(FALLBACK));
    return false;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    const restore = S.lastChips;
    clearChips();
    run(async () => {
      me(q);
      const before = S.lastChips;
      await answer(q);
      if (S.lastChips === before && restore.length) chips(restore);
    });
  });

  /* ---------------- Pip events ---------------- */
  Pip.on("poke", (n) => {
    const lines = {
      3: "Hehe. That tickles. 😆",
      5: `Stop poking me. I'm a highly advanced AI. <span class="aside">(I am a few thousand lines of JavaScript.)</span>`,
      10: "Okay, now you've done it. 😵",
      15: "Fifteen pokes. I'm telling Kanwar.",
      25: "You've poked me 25 times. Are you okay? Do you need to talk? I'm a great listener.",
    };
    if (lines[n]) run(() => say(lines[n], { delay: 500 }));
  });
  Pip.on("dizzy", () => {
    if (S.dizzyCommented) return;
    S.dizzyCommented = true;
    run(() => say("Whoa. 😵‍💫 Please stop shaking the mouse. I'm a delicate machine.", { delay: 400 }));
  });
  Pip.on("wake", () => {
    if (S.seen.has("napped")) return;
    S.seen.add("napped");
    run(() => say(pick(["Sorry, I dozed off. 😴 Where were we?", "I WASN'T SLEEPING. I was… running diagnostics."]), { delay: 400 }));
  });

  Overview.onClose = () => {
    if (S.overviewComment) return;
    S.overviewComment = true;
    run(async () => { Pip.trick("jump"); await say(pick(["Welcome back! Find everything you needed? 👀", "You're back! I missed you. It's been… seconds."]), { delay: 400 }); });
  };

  /* ---------------- lightbox ---------------- */
  window.openLightbox = function (src, alt) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<img src="${src}" alt="${esc(alt || "")}">`;
    const close = () => { lb.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => e.key === "Escape" && close();
    lb.onclick = close;
    document.addEventListener("keydown", onKey);
    document.body.appendChild(lb);
  };

  /* ---------------- live Winnipeg weather (optional) ---------------- */
  fetch("https://api.open-meteo.com/v1/forecast?latitude=49.8951&longitude=-97.1384&current=temperature_2m")
    .then((r) => r.json())
    .then((d) => {
      const t = Math.round(d?.current?.temperature_2m);
      if (Number.isNaN(t)) return;
      S.temp = t;
      const wx = document.getElementById("wx");
      const mood = t <= -20 ? "❄️ he's probably in the lab" : t <= 0 ? "🧣 he's probably in the lab" : t >= 25 ? "☀️ he's probably still in the lab" : "🌤️ he's probably in the lab";
      wx.textContent = `Winnipeg right now: ${t}°C · ${mood}`;
      wx.hidden = false;
    })
    .catch(() => {});

  /* ---------------- boot ---------------- */
  document.getElementById("lnk-linkedin").href = K.links.linkedin;
  document.getElementById("lnk-github").href = K.links.github;
  if (K.links.resume) document.getElementById("lnk-resume").href = K.links.resume;
  else document.getElementById("lnk-resume").remove();
  document.getElementById("skip").onclick = () => Overview.open();

  Pip.mount(document.getElementById("pip"));
  run(start);
})();
