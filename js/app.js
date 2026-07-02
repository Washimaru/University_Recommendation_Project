/* =====================================================================
   UniMatch — APP / UI CONTROLLER
   ===================================================================== */
(function (root) {
  const { UNIS, ARCHES, SLIDERS, BACKGROUNDS, REGIONS } = root.UM.data;
  const Engine = root.UM.engine;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------- persistence (works as a real local site) ------------- */
  const store = {
    get(k, d){ try { return JSON.parse(localStorage.getItem("um_" + k)) ?? d; } catch { return d; } },
    set(k, v){ try { localStorage.setItem("um_" + k, JSON.stringify(v)); } catch {} }
  };

  /* ---------------- state ------------------------------------------------ */
  const state = {
    step: 0,
    arch: null,
    vibe: { collab:.5, quirky:.5, idealist:.5, research:.5, spirit:.5, seminar:.5 },
    bg: new Set(),
    results: [],
    sort: "match",
    filterTier: "",
    shownResults: 14,
    compare: [],
    favs: new Set(store.get("favs", []))
  };

  /* ---------------- THEME ------------------------------------------------ */
  const savedTheme = store.get("theme", "dark");
  document.documentElement.setAttribute("data-theme", savedTheme);
  $("#themeBtn").textContent = savedTheme === "dark" ? "🌙" : "☀️";
  $("#themeBtn").onclick = () => {
    const t = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    $("#themeBtn").textContent = t === "dark" ? "🌙" : "☀️";
    store.set("theme", t);
  };

  /* ---------------- BUILD: archetypes ------------------------------------ */
  $("#archGrid").innerHTML = ARCHES.map(a => `
    <button class="arch" data-id="${a.id}" type="button">
      <div class="emo">${a.emo}</div><h3>${a.name}</h3><p>${a.desc}</p>
    </button>`).join("");
  $$("#archGrid .arch").forEach(el => el.onclick = () => {
    const a = ARCHES.find(x => x.id === el.dataset.id);
    $$("#archGrid .arch").forEach(x => x.classList.toggle("sel", x === el));
    state.arch = a.id;
    state.vibe = { ...a.v };
    renderSliders();
    toast(`${a.name} selected — sliders preset, tweak anytime.`);
  });

  /* ---------------- BUILD: selects & chips ------------------------------- */
  const majors = [...new Set(UNIS.flatMap(u => u.strengths))].sort();
  $("#major").innerHTML  = `<option value="">No preference</option>` + majors.map(m => `<option>${m}</option>`).join("");
  $("#region").innerHTML = `<option value="">No preference</option>` + REGIONS.map(r => `<option>${r}</option>`).join("");
  $("#bgChips").innerHTML = BACKGROUNDS.map(b => `<button class="chip" data-id="${b.id}" type="button">${b.label}</button>`).join("");
  $$("#bgChips .chip").forEach(el => el.onclick = () => {
    el.classList.toggle("on");
    el.classList.contains("on") ? state.bg.add(el.dataset.id) : state.bg.delete(el.dataset.id);
    updateLiveCount();
  });
  ["#major","#budget","#region","#setting","#instType","#classsize","#gpa"].forEach(s => {
    $(s).addEventListener("input", updateLiveCount);
  });

  /* ---------------- BUILD: sliders --------------------------------------- */
  function renderSliders(){
    $("#sliders").innerHTML = SLIDERS.map(s => {
      const val = Math.round(state.vibe[s.key] * 100);
      const leftA = val < 50 ? "active-side" : "", rightA = val >= 50 ? "active-side" : "";
      return `<div class="slider-row" data-key="${s.key}">
        <div class="lbls"><span class="${leftA}">${s.left}</span><span class="${rightA}">${s.right}</span></div>
        <div class="range-wrap">
          <input type="range" min="0" max="100" value="${val}" style="--p:${val}%" data-key="${s.key}">
        </div>
      </div>`;
    }).join("");
    $$('#sliders input[type=range]').forEach(el => el.oninput = () => {
      const k = el.dataset.key, v = +el.value;
      state.vibe[k] = v / 100;
      el.style.setProperty("--p", v + "%");
      const row = el.closest(".slider-row");
      $$(".lbls span", row).forEach((sp,i) => sp.classList.toggle("active-side", i === (v >= 50 ? 1 : 0)));
    });
  }
  renderSliders();

  /* ---------------- query builder + live counter ------------------------- */
  function query(){
    return {
      major: $("#major").value,
      gpa: parseFloat($("#gpa").value) || 0,
      budget: parseFloat($("#budget").value) || 0,
      region: $("#region").value,
      setting: $("#setting").value,
      instType: $("#instType").value,
      classsize: $("#classsize").value,
      mbti: $("#mbti").value,
      activities: $("#activities").value,
      vibe: state.vibe,
      bg: state.bg
    };
  }
  function updateLiveCount(){
    const n = Engine.countEligible(UNIS, query());
    $$(".live-count b").forEach(b => b.textContent = n);
  }

  /* ---------------- WIZARD navigation ------------------------------------ */
  const steps = $$(".step");
  function goStep(i){
    state.step = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach((s, idx) => s.classList.toggle("show", idx === state.step));
    $$(".progress .pstep").forEach((p, idx) => {
      p.classList.toggle("active", idx === state.step);
      p.classList.toggle("done", idx < state.step);
    });
    $(".wizard").scrollIntoView({ behavior: "smooth", block: "start" });
    updateLiveCount();
  }
  $$(".progress .pstep").forEach(p => p.onclick = () => goStep(+p.dataset.s));
  $$("[data-next]").forEach(b => b.onclick = () => goStep(state.step + 1));
  $$("[data-prev]").forEach(b => b.onclick = () => goStep(state.step - 1));

  /* ---------------- RUN matching ----------------------------------------- */
  $("#goBtn").onclick = () => {
    state.results = Engine.score(UNIS, query());
    state.filterTier = "";
    state.shownResults = 14;
    $$('#tierFilter .chip').forEach(c => c.classList.remove("on"));
    renderResults();
    $("#results").classList.add("show");
    $("#results").scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- sort + filter toolbar -------------------------------- */
  $$("#sortSeg button").forEach(b => b.onclick = () => {
    $$("#sortSeg button").forEach(x => x.classList.toggle("on", x === b));
    state.sort = b.dataset.sort; state.shownResults = 14; renderResults();
  });
  $$("#tierFilter .chip").forEach(b => b.onclick = () => {
    const t = b.dataset.tier;
    state.filterTier = state.filterTier === t ? "" : t;
    state.shownResults = 14;
    $$("#tierFilter .chip").forEach(x => x.classList.toggle("on", x.dataset.tier === state.filterTier));
    renderResults();
  });
  if ($("#resMore")) $("#resMore").onclick = () => { state.shownResults += 14; renderResults(); };

  function sortList(list){
    const s = state.sort;
    const arr = [...list];
    if (s === "match")  arr.sort((a,b) => b.score - a.score);
    if (s === "price")  arr.sort((a,b) => a.u.net - b.u.net);
    if (s === "size")   arr.sort((a,b) => a.u.size - b.u.size);
    if (s === "selectivity") arr.sort((a,b) => b.u.gpa - a.u.gpa);
    return arr;
  }

  function ringColor(p){ return p >= 80 ? "var(--good)" : p >= 65 ? "var(--accent)" : p >= 50 ? "var(--accent2)" : "var(--warn)"; }

  /* ---------------- RENDER results --------------------------------------- */
  function renderResults(){
    let full = state.results;
    if (state.filterTier) full = full.filter(m => m.tier && m.tier.c === state.filterTier);
    full = sortList(full);
    const list = full.slice(0, state.shownResults);
    const box = $("#cards");
    const more = $("#resMore");

    if (!state.results.length){
      box.innerHTML = `<div class="empty">
        <h2>No schools cleared your hard limits 😕</h2>
        <p>Your major + budget combination ruled everything out. Try raising the budget or clearing the major filter — the vibe sliders will still do the ranking.</p>
        <button class="btn ghost sm" onclick="document.querySelector('[data-goto-2]').click()">← Adjust filters</button>
      </div>`;
      $("#resCount").textContent = "0 schools";
      if (more) more.style.display = "none";
      return;
    }
    if (!list.length){
      box.innerHTML = `<div class="empty"><h2>No ${state.filterTier} schools in your matches</h2><p>Clear the filter to see all results.</p></div>`;
    } else {
      box.innerHTML = list.map((m, i) => card(m, i)).join("");
    }
    $("#resCount").textContent = `${state.results.length} schools matched · showing ${Math.min(list.length, full.length)} of ${full.length}`;
    if (more) more.style.display = full.length > state.shownResults ? "" : "none";

    // wire card buttons + staggered entrance
    $$("#cards .card").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 30 * i);
      $(".js-detail", el).onclick = () => openDetail(el.dataset.uni);
      const favB = $(".js-fav", el), cmpB = $(".js-cmp", el);
      favB.onclick = () => toggleFav(el.dataset.uni, favB);
      cmpB.onclick = () => toggleCompare(el.dataset.uni);
    });
  }

  function card(m, i){
    const u = m.u, c = ringColor(m.score);
    const why = m.reasons.map(x => `<span class="${x.k}">${x.k === "pos" ? "✓ " : "• "}${x.t}</span>`).join("");
    const tier = m.tier ? `<span class="tier-tag ${m.tier.c}">${m.tier.t}</span>` : "";
    const fav = state.favs.has(u.n) ? "on" : "";
    const cmp = state.compare.includes(u.n) ? "on" : "";
    return `<article class="card" data-uni="${esc(u.n)}">
      <div>
        <div class="ring" style="background:conic-gradient(${c} ${m.score*3.6}deg, var(--line) 0)">
          <div class="inner">${m.score}<small style="font-size:11px">%</small></div>
        </div>
        <div class="rank">#${i + 1}</div>
      </div>
      <div class="uni">
        <h3>${u.n} ${tier}</h3>
        <div class="meta">${u.loc} · ${u.ctry} · ${u.type} · ~${u.size.toLocaleString()} undergrads · ${cap(u.setting)}</div>
        <div class="why">${why || '<span>Balanced all-round fit</span>'}</div>
      </div>
      <div class="card-side">
        <div class="stat-mini">Est. net price<br><b>$${(u.net/1000)|0}k/yr</b></div>
        <div class="stat-mini">Typical admit GPA<br><b>${u.gpa.toFixed(2)}</b></div>
        <div class="card-actions">
          <button class="mini-btn js-fav ${fav}" title="Save">♥</button>
          <button class="mini-btn js-cmp ${cmp}" title="Compare">⇄</button>
          <button class="mini-btn js-detail" title="Details">↗</button>
        </div>
      </div>
    </article>`;
  }

  /* ---------------- FAVORITES -------------------------------------------- */
  function toggleFav(name, btn){
    if (state.favs.has(name)) { state.favs.delete(name); btn && btn.classList.remove("on"); }
    else { state.favs.add(name); btn && btn.classList.add("on"); toast("Saved to favorites ♥"); }
    store.set("favs", [...state.favs]);
    $("#favCount").textContent = state.favs.size;
    $("#favCount").style.display = state.favs.size ? "grid" : "none";
  }
  $("#favCount").textContent = state.favs.size;
  $("#favCount").style.display = state.favs.size ? "grid" : "none";
  $("#favBtn").onclick = () => openFavs();

  function openFavs(){
    const list = UNIS.filter(u => state.favs.has(u.n));
    if (!list.length) { toast("No favorites yet — tap ♥ on a match."); return; }
    const rows = list.map(u => `<tr>
      <td><b>${u.n}</b><br><span style="color:var(--muted);font-size:12px">${u.loc} · ${u.ctry}</span></td>
      <td>$${(u.net/1000)|0}k</td><td>${u.gpa.toFixed(2)}</td><td>${u.size.toLocaleString()}</td>
      <td><button class="mini-btn" onclick="UM.app.removeFav('${esc(u.n)}',this)">✕</button></td></tr>`).join("");
    showModal(`<div class="modal-head"><div><h2>♥ Your favorites</h2>
        <div class="meta">${list.length} saved school${list.length>1?"s":""} · stored on this device</div></div>
        <button class="icon-btn" onclick="UM.app.closeModal()">✕</button></div>
      <div class="modal-body"><table class="cmp-table"><thead><tr>
        <th style="width:auto">School</th><th>Net price</th><th>Admit GPA</th><th>Size</th><th></th>
      </tr></thead><tbody>${rows}</tbody></table></div>`);
  }
  function removeFav(name, btn){
    state.favs.delete(name); store.set("favs", [...state.favs]);
    $("#favCount").textContent = state.favs.size;
    $("#favCount").style.display = state.favs.size ? "grid" : "none";
    const tr = btn.closest("tr"); tr && tr.remove();
    $$("#cards .card").forEach(el => { if (el.dataset.uni === name) $(".js-fav", el).classList.remove("on"); });
  }

  /* ---------------- COMPARE TRAY ----------------------------------------- */
  function toggleCompare(name){
    const i = state.compare.indexOf(name);
    if (i >= 0) state.compare.splice(i, 1);
    else { if (state.compare.length >= 3) { toast("Compare up to 3 at a time."); return; } state.compare.push(name); }
    renderTray();
    $$("#cards .card, #browseList .b-card").forEach(el => $(".js-cmp", el).classList.toggle("on", state.compare.includes(el.dataset.uni)));
  }
  function renderTray(){
    const tray = $("#tray");
    const slots = [0,1,2].map(i => {
      const name = state.compare[i];
      if (!name) return `<div class="slot">Add a school…</div>`;
      const short = name.replace(/University|College/g,"").trim();
      return `<div class="slot filled" title="${esc(name)}">${short}<span class="x" onclick="UM.app.toggleCompare('${esc(name)}')">✕</span></div>`;
    }).join("");
    $("#traySlots").innerHTML = slots;
    tray.classList.toggle("show", state.compare.length > 0);
    $("#cmpGo").disabled = state.compare.length < 2;
    $("#cmpGo").style.opacity = state.compare.length < 2 ? .5 : 1;
  }
  $("#cmpGo").onclick = () => {
    const list = state.compare.map(n => UNIS.find(u => u.n === n)).filter(Boolean);
    if (list.length < 2) return;
    const dims = SLIDERS;
    const row = (label, fn) => `<tr><th>${label}</th>${list.map(u => `<td>${fn(u)}</td>`).join("")}</tr>`;
    const vibeRows = dims.map(d => `<tr><th>${d.right}</th>${list.map(u =>
      `<td>${bar(u.v[d.key])}</td>`).join("")}</tr>`).join("");
    showModal(`<div class="modal-head"><div><h2>Compare schools</h2>
        <div class="meta">Side-by-side · vibe bars show ${"←"} ${dims[0].left.split(" ")[0]}… higher = stronger trait</div></div>
        <button class="icon-btn" onclick="UM.app.closeModal()">✕</button></div>
      <div class="modal-body"><table class="cmp-table"><thead><tr><th></th>
        ${list.map(u => `<th>${u.n}</th>`).join("")}</tr></thead><tbody>
        ${row("Location", u => `${u.loc}<br><span style='color:var(--muted)'>${u.ctry}</span>`)}
        ${row("Type", u => u.type)}
        ${row("Undergrads", u => "~" + u.size.toLocaleString())}
        ${row("Setting", u => cap(u.setting))}
        ${row("Est. net price", u => `<b>$${(u.net/1000)|0}k/yr</b>`)}
        ${row("Typical admit GPA", u => u.gpa.toFixed(2))}
        ${row("Strengths", u => `<div class="tagrow">${u.strengths.slice(0,4).map(s=>`<span>${s}</span>`).join("")}</div>`)}
        <tr><th colspan="${list.length+1}" style="color:var(--ink);padding-top:18px">Campus vibe</th></tr>
        ${vibeRows}
      </tbody></table></div>`);
  };
  function bar(v){
    return `<div class="track" style="width:120px"><div class="fill" style="width:${Math.round(v*100)}%"></div></div>`;
  }

  /* ---------------- DETAIL MODAL (tabbed) -------------------------------- */
  function openDetail(name){
    const m = state.results.find(x => x.u.n === name) || { u: UNIS.find(u => u.n === name), reasons: [], score: null };
    const u = m.u;
    const d = root.UM.details.get(u);
    const tier = m.tier ? `<span class="tier-tag ${m.tier.c}">${m.tier.t}</span>` : "";
    const badge = d.verified
      ? `<span class="data-badge verified" title="Hand-curated from published data">✓ Verified facts</span>`
      : `<span class="data-badge est" title="Reasoned estimates derived from this school's profile">~ Smart estimates</span>`;

    // helpers ----------
    const li = arr => `<ul class="d-list">${arr.map(x => `<li>${x}</li>`).join("")}</ul>`;
    const kv = pairs => `<div class="kv">${pairs.map(([k,v]) =>
      `<div class="k"><span>${k}</span><b>${v}</b></div>`).join("")}</div>`;
    const tags = arr => `<div class="tagrow">${arr.map(s => `<span>${s}</span>`).join("")}</div>`;
    const vbars = SLIDERS.map(s => {
      const uniV = Math.round(u.v[s.key]*100), youV = Math.round(state.vibe[s.key]*100);
      return `<div class="vbar"><div class="vb-top"><span>${s.left}</span><span>${s.right}</span></div>
        <div class="track"><div class="fill" style="width:${uniV}%"></div>
        <div class="you" style="left:calc(${youV}% - 1px)" title="Your preference"></div></div></div>`;
    }).join("");

    // tab panes ----------
    const overview = `
      ${m.score != null ? kv([
        ["Your match", `<span style="color:${ringColor(m.score)}">${m.score}%</span>`],
        ["Est. net price", `$${(u.net/1000)|0}k/yr`],
        ["Typical admit GPA", d.admissions.gpa],
        ["Undergrads", u.size.toLocaleString()]
      ]) : kv([
        ["Est. net price", `$${(u.net/1000)|0}k/yr`],
        ["Typical admit GPA", d.admissions.gpa],
        ["Undergrads", u.size.toLocaleString()],
        ["Setting", cap(u.setting)]
      ])}
      <h4 class="d-h">Known for</h4>${tags(d.academics.knownFor)}
      <h4 class="d-h">Campus vibe vs. your preference <span class="d-note">(bar = school · marker = you)</span></h4>
      <div class="vbars">${vbars}</div>
      ${m.reasons && m.reasons.length ? `<h4 class="d-h">Why it matched you</h4>
        <div class="why">${m.reasons.map(x => `<span class="${x.k}">${x.k==="pos"?"✓ ":"• "}${x.t}</span>`).join("")}</div>` : ""}`;

    const academics = `
      <h4 class="d-h">Admissions snapshot</h4>
      ${kv([
        ["Typical admit GPA", d.admissions.gpa],
        ["SAT (mid 50%)", d.admissions.sat],
        ["ACT (mid 50%)", d.admissions.act],
        ["Acceptance rate", d.admissions.acceptRate]
      ])}
      <p class="d-p"><b>Testing:</b> ${d.admissions.testPolicy}</p>
      <h4 class="d-h">Class size & faculty</h4>
      ${kv([["Student : faculty", d.academics.ratio]])}
      <p class="d-p">${d.academics.classSize}</p>
      <h4 class="d-h">Majors this school is known for</h4>${tags(d.academics.notableMajors)}
      <h4 class="d-h">Special programs</h4>${li(d.programs)}
      <h4 class="d-h">University collaborations & consortia</h4>${li(d.collaborations || [])}`;

    const sch = d.scholarships || {};
    const aid = `
      <h4 class="d-h">Cost</h4>
      ${kv([["Est. net price", u.net===0 ? "$0 (service academy)" : `$${(u.net/1000)|0}k/yr`]])}
      <p class="d-p">${d.aid.meritNote}</p>
      <p class="d-p d-muted">${d.aid.note}</p>
      <h4 class="d-h">Scholarships available</h4>
      ${sch.policy ? `<p class="d-p">${sch.policy}</p>` : ""}
      ${sch.named && sch.named.length ? li(sch.named) : ""}`;

    const research = `
      <h4 class="d-h">Research strength</h4>
      ${kv([["Research level", d.research.level]])}
      <p class="d-p"><b>Active research areas:</b> ${d.research.areas || "—"}</p>
      <p class="d-p"><b>Undergraduate research:</b> ${d.research.undergrad}</p>
      <h4 class="d-h">Notable faculty</h4>
      <p class="d-p">${d.faculty || "—"}</p>
      <h4 class="d-h">Graduate &amp; professional schools</h4>
      <p class="d-p">${d.gradSchools || "—"}</p>`;

    const pro = `
      <h4 class="d-h">Professional & graduate-school placement</h4>
      ${li(d.proSchools)}
      <p class="d-p d-muted">Covers medical, dental, law, graduate and PhD pathways where applicable.</p>`;

    const sl = d.studentLife || {};
    const campus = `
      <h4 class="d-h">Clubs & student organizations</h4><p class="d-p">${sl.clubs || "—"}</p>
      <h4 class="d-h">Career center & support</h4><p class="d-p">${sl.career || "—"}</p>
      <h4 class="d-h">Greek life</h4><p class="d-p">${d.campus.greek}</p>
      <h4 class="d-h">Athletics</h4><p class="d-p">${d.campus.athletics}</p>
      <h4 class="d-h">Housing</h4><p class="d-p">${d.campus.housing}</p>`;

    const outcomes = `
      <h4 class="d-h">After graduation</h4>
      ${kv([
        ["Grad rate (6-yr)", d.outcomes.gradRate],
        ["Median early salary", d.outcomes.salary]
      ])}
      <p class="d-p">${d.outcomes.paths}</p>
      <h4 class="d-h">Where graduates often go</h4>${tags(d.outcomes.employers)}`;

    const TABS = [
      ["Overview", overview], ["Academics", academics], ["Cost & Aid", aid],
      ["Research", research], ["Pro-schools", pro], ["Campus life", campus], ["Outcomes", outcomes]
    ];

    showModal(`<div class="modal-head">
        <div><h2>${u.n} ${tier} ${badge}</h2>
          <div class="meta">${u.loc} · ${u.ctry} · ${u.type} · ~${u.size.toLocaleString()} undergrads · ${cap(u.setting)} campus</div></div>
        <button class="icon-btn" onclick="UM.app.closeModal()">✕</button></div>
      <div class="d-tabs">${TABS.map((t,i) =>
        `<button class="d-tab${i===0?" on":""}" data-tab="${i}">${t[0]}</button>`).join("")}</div>
      <div class="modal-body">
        ${TABS.map((t,i) => `<div class="d-pane${i===0?" on":""}" data-pane="${i}">${t[1]}</div>`).join("")}
        <div class="d-actions">
          <button class="btn sm" onclick="UM.app.toggleFavByName('${esc(u.n)}')">♥ Save</button>
          <button class="btn ghost sm" onclick="UM.app.addCompare('${esc(u.n)}')">⇄ Add to compare</button>
        </div>
        <p class="d-disclaimer">${d.src
          ? `Admissions figures from <a href="${d.src.u}" target="_blank" rel="noopener">${d.src.t}</a> (${d.src.y}). Remaining fields are curated or approximate — verify specifics on the school's official site.`
          : d.verified
            ? "Figures hand-curated from recent published data (approximate ranges) — always verify specifics on the school's official site."
            : "Figures are reasoned estimates derived from this school's profile, not official statistics — verify specifics on the school's official site."}</p>
      </div>`);
    // tab switching
    $$(".d-tab").forEach(btn => btn.onclick = () => {
      const i = btn.dataset.tab;
      $$(".d-tab").forEach(b => b.classList.toggle("on", b === btn));
      $$(".d-pane").forEach(p => p.classList.toggle("on", p.dataset.pane === i));
      $(".modal-body").scrollTop = 0;
    });
    requestAnimationFrame(() => $$(".modal .fill").forEach(f => f.style.width = f.style.width));
  }

  /* ---------------- MODAL plumbing --------------------------------------- */
  function showModal(html){ $("#modal").innerHTML = html; $("#modalBack").classList.add("show"); }
  function closeModal(){ $("#modalBack").classList.remove("show"); }
  $("#modalBack").onclick = e => { if (e.target === $("#modalBack")) closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  /* ---------------- RESET ------------------------------------------------ */
  $("#resetBtn").onclick = () => {
    state.arch = null; state.bg.clear(); state.compare = [];
    state.vibe = { collab:.5, quirky:.5, idealist:.5, research:.5, spirit:.5, seminar:.5 };
    $$(".arch,.chip").forEach(e => e.classList.remove("sel","on"));
    ["#major","#region","#setting","#instType","#classsize","#gpa","#budget","#mbti","#activities"].forEach(s => $(s).value = "");
    renderSliders(); renderTray(); updateLiveCount();
    $("#results").classList.remove("show");
    goStep(0);
    toast("Reset — start fresh.");
  };

  /* ---------------- toast ------------------------------------------------ */
  let toastT;
  function toast(msg){
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------- helpers ---------------------------------------------- */
  function cap(x){ return x ? x[0].toUpperCase() + x.slice(1) : x; }
  function esc(s){ return String(s).replace(/'/g,"\\'").replace(/"/g,"&quot;"); }

  /* ---------------- public API (used by inline onclicks) ----------------- */
  root.UM.app = {
    toggleCompare, closeModal, removeFav,
    toggleFavByName: n => { toggleFav(n); $$("#cards .card, #browseList .b-card").forEach(el => { if (el.dataset.uni === n) $(".js-fav", el).classList.toggle("on", state.favs.has(n)); }); },
    addCompare: n => { if (!state.compare.includes(n)) toggleCompare(n); toast("Added to compare ⇄"); }
  };

  /* ---------------- EXPLORE panel (OLAP) --------------------------------- */
  async function renderExplore(){
    if (!root.UM.db) return;
    const dim = $("#expDim").value, metric = $("#expMetric").value;
    const r = await root.UM.db.agg(dim, metric);
    $("#expEngine").innerHTML = `Engine: <b>${r.engine}</b>`;
    $("#expSql").textContent = r.sql;
    const max = Math.max(...r.rows.map(x => x.v), 1);
    const fmt = v => metric === "avg_net" ? "$" + Math.round(v/1000) + "k"
                  : metric === "avg_gpa" ? Number(v).toFixed(2)
                  : metric === "avg_size" ? Math.round(v).toLocaleString()
                  : v;
    $("#expChart").innerHTML = r.rows.map(row => `
      <div class="exp-row">
        <div class="exp-k">${row.k}</div>
        <div class="exp-bar-wrap"><div class="exp-bar" style="width:${(row.v/max*100).toFixed(1)}%"></div></div>
        <div class="exp-v">${fmt(row.v)} <span class="exp-n">· ${row.n} schools</span></div>
      </div>`).join("");
  }
  if ($("#expDim")) {
    $("#exploreN").textContent = root.UM.db ? root.UM.db.rows.length : UNIS.length;
    $("#expDim").onchange = renderExplore;
    $("#expMetric").onchange = renderExplore;
    renderExplore();                                   // immediate (JS fallback)
    root.UM.db && root.UM.db.ready.then(renderExplore); // re-run once DuckDB is ready
  }

  /* ---------------- BROWSE + SEARCH -------------------------------------- */
  const browse = { q: "", type: "", shown: 18 };

  function browseFilter(){
    const q = browse.q.trim().toLowerCase();
    return UNIS.filter(u => {
      if (browse.type && u.type !== browse.type) return false;
      if (!q) return true;
      return u.n.toLowerCase().includes(q)
          || u.loc.toLowerCase().includes(q)
          || u.ctry.toLowerCase().includes(q)
          || u.strengths.some(s => s.toLowerCase().includes(q));
    }).sort((a, b) => a.n.localeCompare(b.n));
  }

  function bCard(u){
    const d = root.UM.details.get(u);
    const fav = state.favs.has(u.n) ? "on" : "";
    const cmp = state.compare.includes(u.n) ? "on" : "";
    const badge = d.verified ? `<span class="b-badge" title="Verified data">✓</span>` : "";
    return `<article class="b-card" data-uni="${esc(u.n)}">
      <div class="b-main">
        <h4>${u.n} ${badge}</h4>
        <div class="b-meta">${u.loc} · ${u.ctry} · ${u.type} · ~${u.size.toLocaleString()}</div>
        <div class="b-tags">${u.strengths.slice(0,3).map(s => `<span>${s}</span>`).join("")}</div>
      </div>
      <div class="b-actions">
        <button class="mini-btn js-fav ${fav}" title="Save">♥</button>
        <button class="mini-btn js-cmp ${cmp}" title="Compare">⇄</button>
        <button class="mini-btn js-detail" title="Details">↗</button>
      </div>
    </article>`;
  }

  function renderBrowse(){
    const full = browseFilter();
    const list = full.slice(0, browse.shown);
    const box = $("#browseList");
    box.innerHTML = list.length
      ? list.map(bCard).join("")
      : `<div class="empty">No schools match “${esc(browse.q)}”. Try a different name, city, or major.</div>`;
    $("#browseCount").textContent = full.length
      ? `${full.length} school${full.length!==1?"s":""} found · showing ${list.length}`
      : "";
    $("#browseMore").style.display = full.length > browse.shown ? "" : "none";
    $$("#browseList .b-card").forEach(el => {
      $(".js-detail", el).onclick = () => openDetail(el.dataset.uni);
      const fb = $(".js-fav", el), cb = $(".js-cmp", el);
      fb.onclick = () => toggleFav(el.dataset.uni, fb);
      cb.onclick = () => toggleCompare(el.dataset.uni);
    });
  }

  if ($("#browseSearch")){
    $("#browseN").textContent = UNIS.length;
    $("#browseSearch").addEventListener("input", e => { browse.q = e.target.value; browse.shown = 18; renderBrowse(); });
    $("#browseType").addEventListener("change", e => { browse.type = e.target.value; browse.shown = 18; renderBrowse(); });
    $("#browseMore").onclick = () => { browse.shown += 18; renderBrowse(); };
    renderBrowse();
  }

  /* ---------------- MAJOR FINDER ----------------------------------------- */
  const MBTI_TYPES = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
  const MF_AXES = [
    {key:"people",  left:"Data & things",         right:"People"},
    {key:"applied", left:"Theoretical / abstract", right:"Hands-on / applied"},
    {key:"creative",left:"Analytical / systematic",right:"Creative / expressive"}
  ];
  const mf = { courses: new Set(), axes: { people:.5, applied:.5, creative:.5 } };

  if ($("#mfCourses")){
    const M = root.UM.majors;
    // course chips
    $("#mfCourses").innerHTML = M.COURSE_TAGS.map(c => `<button class="chip" type="button" data-c="${esc(c)}">${c}</button>`).join("");
    $$("#mfCourses .chip").forEach(el => el.onclick = () => {
      el.classList.toggle("on");
      el.classList.contains("on") ? mf.courses.add(el.dataset.c) : mf.courses.delete(el.dataset.c);
    });
    // mbti select
    $("#mfMbti").innerHTML = `<option value="">Not sure / skip</option>` + MBTI_TYPES.map(t => `<option>${t}</option>`).join("");
    // sliders
    $("#mfSliders").innerHTML = MF_AXES.map(a => {
      const v = Math.round(mf.axes[a.key]*100);
      return `<div class="slider-row" data-key="${a.key}">
        <div class="lbls"><span>${a.left}</span><span>${a.right}</span></div>
        <div class="range-wrap"><input type="range" min="0" max="100" value="${v}" style="--p:${v}%" data-key="${a.key}"></div>
      </div>`;
    }).join("");
    $$('#mfSliders input').forEach(el => el.oninput = () => {
      mf.axes[el.dataset.key] = el.value/100;
      el.style.setProperty("--p", el.value + "%");
    });
    $("#mfGo").onclick = runMajorFinder;
  }

  function runMajorFinder(){
    const input = {
      courses: mf.courses,
      activities: $("#mfActivities").value,
      mbti: $("#mfMbti").value,
      axes: mf.axes
    };
    const ranked = root.UM.majors.recommend(input).slice(0, 8);
    const box = $("#mfResults");
    box.innerHTML = `<div class="res-head"><h2 style="font-size:20px;margin:0">Your top major matches</h2></div>
      <div class="mf-list">${ranked.map((r,i) => {
        const c = ringColor(r.score);
        return `<article class="mf-card" data-major="${esc(r.mj.name)}">
          <div class="ring" style="background:conic-gradient(${c} ${r.score*3.6}deg, var(--line) 0)"><div class="inner">${r.score}<small style="font-size:11px">%</small></div></div>
          <div class="mf-body">
            <h3>${i+1}. ${r.mj.name} <span class="mf-cat">${r.mj.cat}</span></h3>
            <p class="mf-blurb">${r.mj.blurb}</p>
            ${r.reasons.length ? `<div class="why">${r.reasons.map(x=>`<span class="pos">✓ ${x}</span>`).join("")}</div>` : ""}
          </div>
          <button class="btn ghost sm mf-out">Career outcomes →</button>
        </article>`;
      }).join("")}</div>
      <p class="d-disclaimer" style="max-width:840px;margin:16px auto 0">Suggestions are a starting point, not a verdict. Outcome figures are approximate (salary anchors from NACE Class of 2024; grad-school shares are estimates) — explore majors you're curious about regardless of score.</p>`;
    $$("#mfResults .mf-card").forEach(el => {
      $(".mf-out", el).onclick = () => openMajorOutcomes(el.dataset.major);
    });
    box.scrollIntoView({ behavior:"smooth" });
  }

  function openMajorOutcomes(name){
    const mj = root.UM.majors.MAJORS.find(m => m.name === name);
    if(!mj) return;
    const o = mj.out;
    showModal(`<div class="modal-head">
        <div><h2>${mj.name}</h2><div class="meta">${mj.cat} · ${mj.blurb}</div></div>
        <button class="icon-btn" onclick="UM.app.closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="kv">
          <div class="k"><span>Median starting salary</span><b>${o.salary}</b></div>
          <div class="k"><span>Continue to grad/professional school</span><b>${o.grad}</b></div>
        </div>
        <h4 class="d-h">Where graduates commonly go</h4>
        <ul class="d-list">${o.jobs.map(j => `<li>${j}</li>`).join("")}</ul>
        <h4 class="d-h">Further education & notes</h4>
        <p class="d-p">${o.note}</p>
        <h4 class="d-h">Typical high-school prep</h4>
        <div class="tagrow">${mj.courses.map(c => `<span>${c}</span>`).join("")}</div>
        <p class="d-disclaimer">Figures are approximate — salary anchors from NACE Class of 2024 where noted; graduate-school shares are rough estimates. Actual outcomes vary widely by school, region and individual.</p>
      </div>`);
  }

  // init
  goStep(0);
  renderTray();
  updateLiveCount();
})(typeof window !== "undefined" ? window : globalThis);
