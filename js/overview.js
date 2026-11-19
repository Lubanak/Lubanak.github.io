/* =====================================================================
   "Skip the chat → see everything": the one-page, recruiter-scannable view.
   Built entirely from content.js.
   ===================================================================== */
(function () {
  const K = window.KANWAR;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function projectCard(p) {
    const ph = p.photos.length
      ? `<div class="ph">${p.photos.map((src) => `<img src="${src}" alt="${esc(p.title)} photo" loading="lazy">`).join("")}</div>`
      : "";
    return `<div class="rc">${ph}<div class="bd">
      <div class="k">${esc(p.org)}${p.when ? " · " + esc(p.when) : ""}</div>
      <h4>${esc(p.title)}</h4><p>${esc(p.blurb)}</p>
      <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div></div>`;
  }

  function build() {
    const q = K.quotes.length
      ? `<section class="ov-sec"><h2>What people say</h2><div class="ov-grid">${K.quotes
          .map((x) => `<div class="ov-card"><p style="font-style:italic;font-size:15px;line-height:1.6">“${esc(x.text)}”</p><div class="when" style="margin-top:8px">${esc(x.by)}, ${esc(x.role)}</div></div>`)
          .join("")}</div></section>`
      : "";
    return `<div class="ov-wrap">
      <div class="ov-bar">
        <button class="pill" data-close>← Back to Pip</button>
        <span class="sp"></span>
        <a class="pill" href="${K.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        ${K.links.resume ? `<a class="pill pri" href="${K.links.resume}" target="_blank" rel="noopener">Resume (PDF)</a>` : `<a class="pill pri" href="mailto:${K.links.email}">Email him</a>`}
      </div>

      <div class="ov-hero">
        <div>
          <div class="k">${esc(K.status)}</div>
          <h1>${esc(K.name)}</h1>
          <p>${esc(K.summary)}</p>
          <div class="meta"><span>🎓 ${esc(K.education.degree)}, ${esc(K.education.school)}</span><span>📍 ${esc(K.location)}</span><span>🗓️ Graduating ${esc(K.gradDate)}</span><span>✉️ <a href="mailto:${K.links.email}">${esc(K.links.email)}</a></span></div>
        </div>
        <svg viewBox="20 0 160 160" aria-hidden="true"><use href="#pip-avatar"/></svg>
      </div>

      <section class="ov-sec"><h2>In three numbers</h2><div class="ov-stats">
        ${K.stats.map((s) => `<div class="stat"><b>${esc(s.big)}</b><span>${esc(s.small)}</span></div>`).join("")}
      </div></section>

      <section class="ov-sec"><h2>Experience</h2><div class="ov-two">
        ${K.experience.map((e) => `<div class="ov-card"><h3>${esc(e.org)}</h3><div class="when">${esc(e.role)} · ${esc(e.when)}</div><ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`).join("")}
      </div></section>

      <section class="ov-sec"><h2>Projects</h2><div class="ov-grid">${K.projects.map(projectCard).join("")}</div></section>

      ${q}

      <section class="ov-sec"><h2>Skills</h2><div class="ov-two">
        ${Object.entries(K.skills).map(([g, list]) => `<div class="ov-card"><div class="k">${esc(g)}</div><div class="tags">${list.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`).join("")}
      </div></section>

      <section class="ov-sec"><h2>Education & leadership</h2><div class="ov-two">
        <div class="ov-card"><h3>${esc(K.education.school)}</h3><div class="when">${esc(K.education.degree)} · ${esc(K.education.when)} · GPA ${esc(K.gpa)}</div>
          <ul>${K.education.coursework.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
        <div class="ov-card"><h3>Leadership & awards</h3><div class="when">Beyond the classroom</div>
          <ul>${K.leadership.concat(K.awards).map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
      </div></section>

      <div class="ov-pipnote"><svg viewBox="20 0 160 160" width="34" height="34" aria-hidden="true"><use href="#pip-avatar"/></svg>
        <span>Pip says: “You skipped me. That's fine. I'm fine.” <button class="btn sec" data-close>Go back and say sorry</button></span></div>
    </div>`;
  }

  const Overview = {
    open() {
      const ov = document.getElementById("overview");
      ov.innerHTML = build();
      ov.hidden = false;
      ov.scrollTop = 0;
      ov.querySelectorAll("[data-close]").forEach((b) => (b.onclick = Overview.close));
      ov.querySelectorAll(".ph img").forEach((img) => (img.onclick = () => window.openLightbox && openLightbox(img.src, img.alt)));
      document.addEventListener("keydown", escClose);
      Overview.onOpen && Overview.onOpen();
    },
    close() {
      const ov = document.getElementById("overview");
      ov.hidden = true;
      document.removeEventListener("keydown", escClose);
      Overview.onClose && Overview.onClose();
    },
  };
  function escClose(e) { if (e.key === "Escape" && !document.querySelector(".lightbox")) Overview.close(); }
  window.Overview = Overview;
})();
