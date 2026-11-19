# Talk to Pip: Kanwar Lubana's website

A chat-first portfolio. Visitors meet **Pip**, a small robot that asks who they are (recruiter, engineer, "GPU-company spy", or friend) and shows each of them a different version of the site. Pip isn't really an AI. It's a script with good timing.

Everything is plain HTML, CSS and JavaScript, with no build step, so it runs on GitHub Pages as-is.

**How it's built:** see [ARCHITECTURE.md](ARCHITECTURE.md) for the tech stack, layout, file structure, UML class, sequence and state diagrams, and the brain pipeline.

## Files

| File | What it is |
|---|---|
| `index.html` | Page layout |
| `styles.css` | All styling, including Pip's animations |
| `js/content.js` | **Everything about you.** Edit this file to update text, projects, links, quotes and drawings |
| `js/pip.js` | Pip: drawing, moods, tricks, cursor following, sleeping, dizziness |
| `js/chat.js` | The conversation: the four paths, free-text answers, and Pip's sarcasm |
| `js/demos.js` | Mini-demos: egg sorter, IR gate, stopwatch, MPI slider, spy dossier |
| `js/overview.js` | The "See everything" one-page summary |
| `img/` | Photos |
| `brain/` | **Pip's brain:** a distilled dataset and a 23 MB language model that runs in the visitor's browser and answers typed questions. See [brain/README.md](brain/README.md) |

## Adding things later

1. **Resume:** Resume buttons are hidden for now. To turn them on, put a PDF named `resume.pdf` in this folder and set `resume: "resume.pdf"` in `content.js`. Use a version without your phone number.
2. **Hydro screenshot:** it's left out for now. Once Hydro says it's fine, add `img/hydro-app.jpg` and list it in the `hydro` project's `photos` in `content.js`.
3. **Also optional:**
   - **Quotes:** add them to `quotes: []` in `content.js`, for example `{ text: "...", by: "Name", role: "Title, Company" }`. They appear automatically.
   - **Drawings:** put the image files in `img/` and list them in `drawings: []`, for example `"img/drawing-1.jpg"`.
   - **Formula Electric photo:** add it to that project's `photos` list.

## Publish on GitHub Pages (at https://lubanak.github.io)

1. On GitHub, create a new **public** repository named exactly **`Lubanak.github.io`**.
2. Upload **the contents of this folder** (not the folder itself), so `index.html` sits at the top level of the repo. You can drag everything into the GitHub web page with "Add file → Upload files", or use the command line:
   ```bash
   cd site
   git init
   git add .
   git commit -m "Launch Pip"
   git branch -M main
   git remote add origin https://github.com/Lubanak/Lubanak.github.io.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages**, choose **Deploy from a branch**, then `main` / `/ (root)`, and click **Save**.
4. After about a minute, the site is live at **https://lubanak.github.io**.

## Preview locally

```bash
cd site
python -m http.server 8080
```
Then open http://localhost:8080.

## Things Pip does (so you can show off)

- Its eyes follow the cursor, and it drifts toward it.
- If you shake the mouse fast, it gets dizzy.
- It does a random trick every 20–40 seconds: juggling eggs, a backflip, dancing, or flashing `0004` on its chest.
- After 45 seconds idle it falls asleep (zzz). Any movement wakes it.
- Poke it 5, 10, 15 or 25 times for a different reaction each time.
- It remembers returning visitors: "Oh, the recruiter's back."
- It shows Winnipeg's live temperature (from Open-Meteo, free, no key).
- It judges you when you open content that doesn't match who you said you were.
