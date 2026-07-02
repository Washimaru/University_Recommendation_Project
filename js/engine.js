/* =====================================================================
   UniMatch — MATCHING ENGINE (dual-layer)
   Global: window.UM.engine
     Layer 1 — hard boundary constraints (eliminate the impossible)
     Layer 2 — soft cosine-similarity scoring over vibe vectors (rank survivors)
   ===================================================================== */
(function (root) {
  const { SLIDERS } = root.UM.data;

  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (const k in a) { dot += a[k] * b[k]; na += a[k] * a[k]; nb += b[k] * b[k]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  }

  function admitTier(gpa, uniGpa) {
    if (!gpa) return null;
    const d = uniGpa - gpa;
    if (d >= 0.12)  return { t: "Reach",  c: "reach"  };
    if (d <= -0.12) return { t: "Safety", c: "safety" };
    return { t: "Target", c: "target" };
  }

  // How many schools survive Layer 1 only (for the live counter)
  function countEligible(unis, q) {
    let n = 0;
    for (const u of unis) {
      if (q.major && !u.strengths.includes(q.major)) continue;
      if (q.budget && u.net > q.budget * 1.05) continue;
      if (q.instType && u.type !== q.instType) continue;
      n++;
    }
    return n;
  }

  // ---- MBTI → gentle vibe adjustment (one input to the matrix) ----
  function mbtiAdjust(uv, mbti){
    if(!mbti || mbti.length !== 4) return uv;
    const v = { ...uv };
    const nudge = (k, target, w=0.18) => { v[k] = v[k] + (target - v[k]) * w; };
    const m = mbti.toUpperCase();
    if(m[0]==="E"){ nudge("spirit",0.8); nudge("collab",0.7); } else { nudge("spirit",0.35); nudge("seminar",0.65); }
    if(m[1]==="N"){ nudge("quirky",0.85); nudge("research",0.7); } else { nudge("quirky",0.3); }
    if(m[2]==="F"){ nudge("idealist",0.85); } else { nudge("idealist",0.3); }
    if(m[3]==="J"){ nudge("seminar",0.62); } else { nudge("collab",0.62); }
    return v;
  }

  // ---- free-text activities → keyword-based major/vibe signals ----
  const ACT_KEYWORDS = [
    {re:/research|\blab\b|olympiad|science fair/, majors:["Biology","Physics","Chemistry","Neuroscience"], note:"research"},
    {re:/startup|entrepreneur|business club|deca|invest|stock/, majors:["Business","Economics","Entrepreneurship","Finance","Management"], note:"entrepreneurship"},
    {re:/volunteer|community|nonprofit|service|charity|activis|advoca|mentor/, majors:["Social Work","Public Health","Political Science","Sociology"], note:"community service"},
    {re:/sport|athlet|varsity|soccer|basketball|football|track|swim|tennis/, majors:["Kinesiology","Sport Management","Health Sciences"], note:"athletics"},
    {re:/music|band|orchestra|choir|jazz|violin|piano|guitar/, majors:["Music","Music Business","Performance","Composition"], note:"music"},
    {re:/\bart\b|paint|draw|photograph|sculpt|ceramics|graphic/, majors:["Art","Design","Illustration","Fine Arts","Graphic Design"], note:"visual art"},
    {re:/theat|drama|acting|\bfilm\b|dance|cinema/, majors:["Drama","Film","Theatre","Musical Theatre","Animation"], note:"performing arts"},
    {re:/debate|model un|\bmun\b|speech|mock trial|government|politic/, majors:["Political Science","International Relations","Public Policy","Law"], note:"debate & policy"},
    {re:/code|coding|program|robot|hackathon|computer|software|\bapp\b|cyber/, majors:["Computer Science","Engineering","Data Science","Cybersecurity","Game Design"], note:"coding & robotics"},
    {re:/engineer|\bbuild\b|maker|3d print|cad/, majors:["Engineering","Mechanical Engineering","Architecture","Industrial Design"], note:"engineering & making"},
    {re:/writ|journal|newspaper|literary|poetry|blog|yearbook/, majors:["English","Journalism","Creative Writing","Communications"], note:"writing"},
    {re:/environment|sustain|climate|ecology|outdoors|\bhik|conservation/, majors:["Environmental Science","Environmental Studies","Agriculture","Geology"], note:"environment"},
    {re:/health|medic|hospital|nurs|pre-med|\bbio|dental|pharma/, majors:["Biology","Nursing","Pre-Med","Public Health","Biomedical Engineering"], note:"health & medicine"},
    {re:/teach|tutor|education|coaching/, majors:["Education","Human Development","Psychology"], note:"teaching"},
    {re:/psycholog|counsel|mental health/, majors:["Psychology","Neuroscience","Human Development"], note:"psychology"}
  ];
  function activityBoost(u, actText){
    if(!actText) return { pts:0, reasons:[] };
    const t = actText.toLowerCase();
    let pts = 0; const hits = [];
    ACT_KEYWORDS.forEach(k => {
      if(k.re.test(t) && k.majors.some(m => u.strengths.includes(m))){ pts += 5; hits.push(k.note); }
    });
    return { pts: Math.min(pts, 15), reasons: [...new Set(hits)].slice(0,3) };
  }

  function score(unis, q) {
    const uv = mbtiAdjust(q.vibe, q.mbti);
    const out = [];

    for (const u of unis) {
      // ---- LAYER 1: hard constraints ----
      if (q.major && !u.strengths.includes(q.major)) continue;
      if (q.budget && u.net > q.budget * 1.05) continue;
      if (q.instType && u.type !== q.instType) continue;

      // ---- LAYER 2: soft scoring ----
      const sim = cosine(uv, u.v);          // 0..1 culture / learning-style fit
      let s = sim * 70;                      // vibe is the core (0-70)
      const reasons = [];

      // headline vibe alignment (only dims the user cared about)
      const aligned = SLIDERS
        .map(sl => ({ sl, d: Math.abs(uv[sl.key] - u.v[sl.key]) }))
        .filter(x => Math.abs(uv[x.sl.key] - 0.5) > 0.18)
        .sort((a, b) => a.d - b.d);
      if (aligned[0] && aligned[0].d < 0.22) {
        const sl = aligned[0].sl;
        const side = uv[sl.key] >= 0.5 ? sl.right : sl.left;
        reasons.push({ t: `Vibe match: ${side.toLowerCase()}`, k: "pos" });
      }

      // region (soft)
      if (q.region) {
        if (u.region === q.region) { s += 8; reasons.push({ t: `In your preferred region (${q.region})`, k: "pos" }); }
        else s -= 3;
      }
      // setting (soft)
      if (q.setting) {
        if (u.setting === q.setting) { s += 6; reasons.push({ t: `${cap(q.setting)} campus`, k: "pos" }); }
        else s -= 2;
      }
      // class size (soft)
      if (q.classsize) {
        const sem = u.v.seminar;
        if (q.classsize === "small" && sem >= 0.7) { s += 7; reasons.push({ t: "Small classes & close mentorship", k: "pos" }); }
        else if (q.classsize === "large" && sem <= 0.4) { s += 5; reasons.push({ t: "Big-lecture, independent style", k: "pos" }); }
        else if (q.classsize === "small" && sem <= 0.35) { s -= 5; reasons.push({ t: "Larger classes than you'd like", k: "neg" }); }
        else if (q.classsize === "mixed") s += 2;
      }
      // major strength
      if (q.major && u.strengths.includes(q.major)) { s += 6; reasons.push({ t: `Known for ${q.major}`, k: "pos" }); }
      // budget headroom
      if (q.budget && u.net <= q.budget * 0.8) { s += 4; reasons.push({ t: `Est. net price under budget ($${(u.net/1000)|0}k)`, k: "pos" }); }

      // background flags
      const bg = q.bg || new Set();
      if (u.flags) {
        if (bg.has("hbcu")  && u.flags.includes("hbcu"))  { s += 10; reasons.push({ t: "HBCU — strong community fit", k: "pos" }); }
        if (bg.has("women") && u.flags.includes("women")) { s += 8;  reasons.push({ t: "Women's college", k: "pos" }); }
      }
      if (bg.has("intl") && u.region === "International") s += 3;

      // activities free-text signal
      const ab = activityBoost(u, q.activities);
      if (ab.pts){ s += ab.pts; if (ab.reasons.length) reasons.push({ t: `Fits your activities: ${ab.reasons.join(", ")}`, k: "pos" }); }

      s = Math.max(0, Math.min(100, Math.round(s)));
      out.push({ u, score: s, sim, reasons: reasons.slice(0, 4), tier: admitTier(q.gpa, u.gpa) });
    }

    out.sort((a, b) => b.score - a.score);
    return out;
  }

  function cap(x) { return x ? x[0].toUpperCase() + x.slice(1) : x; }

  root.UM = root.UM || {};
  root.UM.engine = { score, countEligible, cosine, admitTier };
})(typeof window !== "undefined" ? window : globalThis);
