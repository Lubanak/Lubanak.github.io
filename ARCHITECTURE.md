# Architecture

**lubanak.github.io** is a chat-first portfolio. Visitors meet **Pip**, an animated robot that asks who they are and shows each of them a different version of the site. It's a static site with no backend: everything runs in the visitor's browser, including a small neural network that answers typed questions.

| | |
|---|---|
| Code | ~2,640 lines across 13 files |
| Frameworks / build step / server | none |
| Visitor paths | 4 (recruiter, engineer, "spy", friend), plus "just browsing" |
| Language model | MiniLM-L6-v2, 23 MB, 8-bit, runs on-device |
| Held-out eval | ~89% on 40 unseen questions |

---

## Tech stack

| Technology | Layer | Used for |
|---|---|---|
| **HTML5** | Structure | One page: top bar, Pip's stage, chat log, quick-reply buttons, text box. ARIA live region for the chat. |
| **CSS3** | Presentation | Design tokens (custom properties), Grid and Flexbox, `@keyframes` for all of Pip's tricks, responsive at 860px, `prefers-reduced-motion`. |
| **JavaScript (ES2020+)** | Behaviour | Vanilla, no framework. Each file is an IIFE module exposing one global (`Pip`, `Demos`, `Overview`, `PipBrain`). `async/await`, a promise queue for messages, Pointer Events, `requestAnimationFrame`. |
| **SVG** | Graphics | Pip is drawn in code, with swappable parts for moods (tie, glasses, sunglasses, sleepy and dizzy eyes). |
| **transformers.js 3.8.1** | Machine learning | Runs the model in the browser on ONNX Runtime Web (WebAssembly). Loaded from jsDelivr only when someone starts typing. |
| **MiniLM-L6-v2 (q8)** | Machine learning | Sentence-embedding model: question → 384-number vector. |
| **Web Storage** | State | `localStorage` remembers role, visit count and demo counters. |
| **Open-Meteo API** | Data | Live Winnipeg temperature (free, no key, fails silently). |
| **Python 3** | Tooling | `brain/build_server.py` saves the embedding index; `brain/finetune.py` handles phase-2 fine-tuning. |
| **Git + GitHub Pages** | Hosting | Static hosting from `main`. Features built on branches and merged. |

---

## Page layout

```
desktop (grid: 400px stage | 1fr chat, height 100dvh)
┌──────────────────────────────────────────────────────────────────────┐
│ ◉ Kanwar Lubana · open to co-op        [LinkedIn] [GitHub] [See all] │  .top
├──────────────────────┬───────────────────────────────────────────────┤
│                      │  Pip: Hi! Who are you?                        │  .log (scrolls)
│       ┌──────┐       │                          [ I'm hiring ]       │
│       │ ◉  ◉ │ Pip   │  ┌─ rich card: stats / project / demo ─┐      │
│       └──────┘       │  └──────────────────────────────────────┘      │
│  thought bubble      │  ( Best work ) ( Why hire? ) ( One-pager )    │  .chips
│  Winnipeg: -18°C     │  [ Ask Pip anything…                    ↑ ]   │  #composer
│      .stage          │                 .chatcol                      │
└──────────────────────┴───────────────────────────────────────────────┘
phone: the stage becomes a 170px band above the chat. "See everything" opens a full-screen overlay (#overview).
```

---

## File structure

```
site/
├── index.html            page shell + shared SVG gradients                   82
├── styles.css            tokens, layout, Pip animations, cards               320
├── js/
│   ├── content.js        ALL facts about Kanwar (single source of truth)     160
│   ├── pip.js            the character: SVG, moods, tricks, events          267
│   ├── demos.js          egg sorter, IR gate, stopwatch, MPI, dossier       224
│   ├── overview.js       "See everything" one-page summary                    91
│   └── chat.js           conversation engine, 4 paths, brain wiring         666
├── brain/
│   ├── dataset.js        53 intents · 506 example questions · answers       400
│   ├── brain.js          model loading, embedding, matching, decide()        178
│   ├── index.json        precomputed int8 embeddings (~250 KB)
│   ├── eval.js           40 held-out test questions                           48
│   ├── build.html        rebuild index + run eval                             58
│   ├── build_server.py   local server that saves the index                    59
│   └── finetune.py       phase 2: contrastive fine-tune → ONNX                89
└── img/                  project photos
```

Scripts load in dependency order: `content → pip → demos → overview → dataset → brain → chat`.

---

## Components

```mermaid
flowchart LR
  subgraph Browser["Visitor's browser"]
    HTML["index.html"] --> CSS["styles.css"]
    HTML --> CHAT["chat.js<br/>conversation engine"]
    CHAT --> PIP["pip.js<br/>character"]
    PIP -. "events: poke, dizzy, wake" .-> CHAT
    CHAT --> DEMOS["demos.js<br/>mini-demos"]
    CHAT --> OV["overview.js<br/>one-pager"]
    CHAT --> BRAIN["brain.js<br/>PipBrain"]
    BRAIN --> DATA["dataset.js<br/>intents"]
    BRAIN --> IDX[("index.json<br/>embeddings")]
    CHAT --> CONTENT["content.js<br/>KANWAR facts"]
    OV --> CONTENT
    DATA -. "answers read facts" .-> CONTENT
    CHAT --> LS[("localStorage")]
  end
  BRAIN -- "lazy import" --> JSD["jsDelivr CDN<br/>transformers.js"]
  BRAIN -- "23 MB model" --> HF["Hugging Face<br/>MiniLM-L6-v2"]
  CHAT -- "temperature" --> OM["Open-Meteo API"]
  GH["GitHub Pages"] -- "serves static files" --> HTML
```

---

## UML: classes and modules

There are no ES classes. Each file is a module object with private state in a closure. Here each module is drawn as a class: `-` marks private state, `+` marks public methods.

```mermaid
classDiagram
  direction LR
  class KANWAR {
    +name
    +links
    +stats[]
    +skills
    +experience[]
    +projects[]
    +quotes[]
    +drawings[]
  }
  class Pip {
    -mood
    -asleep
    -pokes
    +mount(el)
    +setMood(role)
    +trick(name)
    +think(text)
    +talking(on)
    +thinking(on)
    +on(event, fn)
    +emit(event, data)
  }
  class Chat {
    -S : state
    -chain : Promise queue
    +say(html)
    +card(node)
    +chips(list, transient)
    +setRole(role)
    +answer(question)
    +runIntent(intent)
  }
  class Demos {
    +eggSorter(onDone)
    +irGate(onCount)
    +stopwatch(onDone)
    +mpi(onChange)
    +dossier()
  }
  class Overview {
    +open()
    +close()
    +onClose
  }
  class PipBrain {
    -extractor
    -index
    +load(onProgress)
    +match(question)
    +decide(top)
    +evaluate(cases)
    +buildIndex()
  }
  class Intent {
    +id
    +examples[]
    +say[]
    +action
  }
  Chat --> Pip : moods, tricks
  Pip ..> Chat : events
  Chat --> Demos : renders cards
  Chat --> Overview : opens
  Chat --> PipBrain : asks
  Chat --> KANWAR : reads facts
  Overview --> KANWAR : reads facts
  PipBrain "1" *-- "53" Intent : dataset
  Intent ..> KANWAR : answers read facts
```

---

## Conversation flow

```mermaid
flowchart TD
  A["Page loads<br/>Pip greets"] --> R{"Returning visitor?"}
  R -- yes --> M["'The recruiter's back!'<br/>offer same role"]
  R -- no --> W{"Who are you?"}
  M --> W
  W -- "I'm hiring" --> H["Recruiter mode<br/>3 numbers, best work,<br/>why hire, one-pager"]
  W -- "I'm an engineer" --> E["Nerd mode<br/>6 playable demos,<br/>how the brain works"]
  W -- "GPU-company spy" --> S["Suspicious mode<br/>classified dossier<br/>→ ends with LinkedIn"]
  W -- "His friend" --> F["Unimpressed mode<br/>photo album,<br/>'go text him'"]
  W -- "Just browsing" --> B["Egg sorter teaser<br/>→ asks again"]
  H & E & S & F --> J{"Opens another path's content?"}
  J -- yes --> X["Pip judges you<br/>'Planning to hire your friend? Bold.'"]
  H & E & S & F --> T["Typed question → brain"]
```

---

## UML: sequence for a typed question

```mermaid
sequenceDiagram
  actor V as Visitor
  participant C as chat.js
  participant P as pip.js
  participant B as brain.js
  participant N as CDN + Hugging Face
  V->>C: types a question
  C->>B: ensureBrain()
  alt first question of the visit
    C->>P: thinking(true), "booting brain"
    B->>N: import transformers.js, fetch MiniLM (23 MB)
    B->>B: load index.json (506 int8 vectors)
  end
  C->>P: thinking(true), "crunching 384 numbers"
  C->>B: match(question)
  B->>B: embed question, cosine vs every example
  B-->>C: top 3 intents with scores
  C->>B: decide(top)
  alt score >= 0.55 or clearly ahead
    C->>V: answer with facts from content.js, then run its action
  else two intents within 0.06
    C->>V: "Did you mean...?" buttons
  else score < 0.42
    C->>V: honest "I don't know" + Google button
  end
  C->>P: thinking(false)
  Note over B,N: if loading fails, chat.js falls back to keyword rules
```

---

## UML: Pip's states

Pip's body runs on CSS classes that JavaScript toggles. Moods (tie, glasses, sunglasses, half-closed eyes) sit on top of any state.

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Talking : say() typing
  Talking --> Idle : message shown
  Idle --> Thinking : question typed
  Thinking --> Idle : answer ready
  Idle --> Trick : every 22-38 s or click
  Trick --> Idle : animation ends
  Idle --> Dizzy : 7 fast mouse reversals in 0.9 s
  Dizzy --> Idle : after 2.6 s
  Idle --> Asleep : 45 s without input
  Asleep --> Idle : any input (startled)
```

---

## The brain pipeline (knowledge distillation)

```mermaid
flowchart LR
  subgraph Offline["Offline, run by Kanwar"]
    T["Teacher: large LLM"] --> D["dataset.js<br/>53 intents, 506 examples,<br/>Pip-voice answers"]
    D --> BLD["build.html<br/>embed every example"]
    BLD --> I[("index.json<br/>int8 vectors")]
    BLD --> EV["eval.js<br/>40 unseen questions → ~89%"]
    D -. "phase 2" .-> FT["finetune.py<br/>contrastive loss → ONNX"]
  end
  subgraph Live["Live, in the visitor's browser"]
    Q["question"] --> S["MiniLM student<br/>→ 384-number vector"]
    S --> M["cosine similarity vs index"]
    I --> M
    M --> DEC{"decide()"}
    DEC -- confident --> ANS["answer + facts from content.js"]
    DEC -- "close call" --> CL["did you mean…?"]
    DEC -- low --> UNK["I don't know"]
  end
```

- **Facts are looked up, never memorized.** Answers are templates that read `content.js`, so they're always correct, and updating the resume never needs retraining.
- **Int8 index.** 506 × 384 vectors are stored as 8-bit and base64 (~250 KB instead of ~2 MB). Visitors only embed their own question.
- **Confidence rules.** Answer at ≥ 0.55 or with a 0.06 lead, ask "did you mean" in between, admit not knowing below 0.42.
- **Measured.** The held-out eval re-runs on every rebuild. The first 30 test questions also guided which examples to add, so ~89% is slightly optimistic; the 10 newest are the clean check.

See [brain/README.md](brain/README.md) for how to retrain.

---

## Design decisions and trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| Static site, no backend | Free hosting, nothing to maintain or attack | No shared data: demo counters are per visitor, and logging questions needs an outside service |
| Small on-device model, not an LLM API | No key to leak, no cost per question, private, can't invent facts | Picks from known answers instead of writing new ones; 23 MB first download |
| Lazy load + keyword fallback | The page stays fast; still works if the model can't load | First typed question waits a few seconds (covered by a "booting brain" animation) |
| One promise queue for all messages | Pip never talks over itself when buttons, questions and events arrive together | Messages are strictly sequential |
| `content.js` as single source of truth | Chat, one-pager and brain answers always agree | All content in one file |
| No framework | Tiny, fast, every line readable | State and rendering managed by hand; a framework would pay off at a larger size |
| Accessibility | ARIA live chat, keyboard-usable demos, visible focus, reduced motion | — |
| Privacy | No phone number, no internal screenshots without permission, no analytics, questions stay on-device | — |
