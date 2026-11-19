# Pip's brain

Pip answers typed questions with a small neural network that runs **in the visitor's browser**. No server, no API key, no cost, and nothing the visitor types leaves their device.

## How it works (distillation)

```
 teacher (large model)                 student (in the browser)
 ─────────────────────                 ─────────────────────────
 wrote dataset.js:                     MiniLM, 23 MB, 8-bit, via transformers.js
   53 intents                          question ──► 384-number embedding
   ~500 example questions   ──index──► cosine similarity vs. every example
   Pip-voice answers                   ──► best intent + confidence
```

- **dataset.js:** intents, each with example questions and answers. Answers pull facts from `js/content.js`, so **facts are looked up, never memorized**, and updating your resume never needs retraining.
- **index.json:** the precomputed embeddings of every example (int8, ~250 KB). Visitors only embed their own question.
- **brain.js:** loads the model the first time someone starts typing, then matches questions and applies the confidence rules:

  | Best score | Pip does |
  |---|---|
  | ≥ 0.55, or clearly ahead of the runner-up | answers |
  | 0.42 – 0.55 and two intents are close | asks "did you mean…?" |
  | < 0.42 | says honestly it doesn't know, and offers a Google search |

- **eval.js:** held-out test questions that are **not** in the dataset. Current score: **35.5 / 40 ≈ 89%**. The first 30 of those questions were used to choose which examples to add, so that number is a bit optimistic; the 10 newest are cleaner.
- **Debug:** add `?debug` to the URL to see the top intents and scores under every answer.
- **Fallback:** if the model can't load (old browser, blocked CDN), Pip falls back to the keyword rules in `js/chat.js`.

## Changing what Pip knows

1. Edit `dataset.js`. Add examples where Pip gets things wrong, or add a new intent (`id`, `examples`, `say` and/or `action`).
2. Rebuild the index (it has to match the dataset):
   ```bash
   python brain/build_server.py
   ```
   Open http://localhost:8765/brain/build.html and click **Build index**. This saves `index.json` and `train.json`, and prints the eval score.
3. Commit and push.

If you forget step 2, the site still works: it notices the index is stale and embeds the examples live, which is slower for visitors, and logs a warning in the console.

Don't copy questions from `eval.js` into `dataset.js`. The eval only means something if the brain has never seen those questions.

## Phase 2: fine-tune your own student

`finetune.py` fine-tunes MiniLM on `train.json` with a contrastive loss: same intent → close together, different intents → far apart. It then exports an 8-bit ONNX model for the browser. Run it on free Google Colab; the steps are at the top of the file. Then compare its eval score with the stock model's 89%.

The script hasn't been run yet; it's ready for you to try on Colab.
