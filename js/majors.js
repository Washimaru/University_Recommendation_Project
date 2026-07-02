/* =====================================================================
   UniMatch — MAJOR FINDER
   window.UM.majors
     .COURSE_TAGS   list of high-school subject chips
     .MAJORS        dataset (with career outcomes)
     .recommend(input)  -> ranked majors with match % + reasons

   Axes (each 0..1, matched against the user's sliders):
     people   0 = data / things · 1 = people
     applied  0 = theoretical / abstract · 1 = hands-on / applied
     creative 0 = analytical / systematic · 1 = creative / expressive

   Outcome figures are approximate. Salary anchors from NACE Class of 2024
   where noted; grad-school shares are rough estimates (labelled est.).
   ===================================================================== */
(function (root) {
  const COURSE_TAGS = ["Math","Statistics","Biology","Chemistry","Physics","Computer Science",
    "English / Literature","History","Economics","Psychology","Art","Music","Foreign Language",
    "Business","Government / Politics","Environmental Science","Engineering / Tech","Health / Anatomy"];

  // m = favored MBTI letters (any subset); axes = ideal profile; out = outcomes
  const MAJORS = [
    {name:"Computer Science",cat:"STEM",m:"INT",
     courses:["Computer Science","Math","Physics"],act:/code|program|robot|hack|app|software|cyber|game/,
     axes:{people:.2,applied:.6,creative:.45},
     blurb:"Designing software, algorithms and computing systems.",
     out:{grad:"~20% pursue a master's/PhD (est.)",salary:"$89k median (NACE 2024)",
       jobs:["Software engineer","Data scientist","ML / AI engineer","Product manager","Security engineer"],
       note:"Very strong direct-to-industry hiring; graduate study mainly for research/ML specialties."}},
    {name:"Data Science / Statistics",cat:"STEM",m:"INT",
     courses:["Statistics","Math","Computer Science"],act:/data|statist|analytic|machine learning|code/,
     axes:{people:.25,applied:.55,creative:.4},
     blurb:"Turning data into models, predictions and insight.",
     out:{grad:"~30% pursue graduate study (est.)",salary:"$80k+ median (est.)",
       jobs:["Data scientist","Data / BI analyst","Quantitative analyst","ML engineer"],
       note:"Strong demand across tech, finance and healthcare; MS common for senior roles."}},
    {name:"Mechanical / General Engineering",cat:"Engineering",m:"IST",
     courses:["Math","Physics","Engineering / Tech"],act:/engineer|build|robot|maker|cad|car|rocket/,
     axes:{people:.3,applied:.85,creative:.5},
     blurb:"Designing and building physical machines and systems.",
     out:{grad:"~22% pursue graduate study (est.)",salary:"$80k avg for engineering (NACE 2024)",
       jobs:["Design engineer","Mechanical engineer","R&D engineer","Manufacturing engineer"],
       note:"Mostly direct-to-industry; a PE license or MS helps for advanced roles."}},
    {name:"Electrical & Computer Engineering",cat:"Engineering",m:"INT",
     courses:["Math","Physics","Computer Science","Engineering / Tech"],act:/circuit|electron|robot|code|hardware|engineer/,
     axes:{people:.25,applied:.75,creative:.45},
     blurb:"Electronics, circuits, chips, signals and embedded systems.",
     out:{grad:"~25% pursue graduate study (est.)",salary:"$85k+ (est.)",
       jobs:["Hardware engineer","Embedded systems engineer","Chip designer","Robotics engineer"],
       note:"High demand in semiconductors, robotics and defense."}},
    {name:"Biomedical Engineering",cat:"Engineering",m:"INT",
     courses:["Biology","Math","Physics","Engineering / Tech"],act:/bio|medic|device|engineer|lab|research/,
     axes:{people:.4,applied:.75,creative:.5},
     blurb:"Applying engineering to medicine and biology.",
     out:{grad:"~40% pursue graduate/professional school (est.)",salary:"$70k (est.)",
       jobs:["Biomedical / device engineer","R&D engineer","Clinical engineer","(often pre-med)"],
       note:"Common springboard to medical school or a bioengineering PhD."}},
    {name:"Biology",cat:"Life Sciences",m:"INF",
     courses:["Biology","Chemistry","Math","Health / Anatomy"],act:/bio|lab|research|medic|hospital|health|environment/,
     axes:{people:.4,applied:.5,creative:.35},
     blurb:"The study of living systems, from molecules to ecosystems.",
     out:{grad:"~50%+ continue to medical or graduate school (est.)",salary:"$45–55k with a bachelor's (est.)",
       jobs:["Lab / research technician","Then physician, dentist, pharmacist or PhD scientist"],
       note:"A bachelor's alone is entry-level; most careers open up after med/grad school."}},
    {name:"Chemistry",cat:"Life Sciences",m:"INT",
     courses:["Chemistry","Math","Physics","Biology"],act:/chem|lab|research|material/,
     axes:{people:.25,applied:.55,creative:.4},
     blurb:"Matter, reactions and molecular design.",
     out:{grad:"~45% pursue graduate study (est.)",salary:"$50–60k (est.)",
       jobs:["Lab chemist","Quality / process chemist","R&D scientist (with PhD)"],
       note:"Research and higher pay generally require a PhD."}},
    {name:"Physics",cat:"Life Sciences",m:"INT",
     courses:["Physics","Math","Computer Science"],act:/physic|astro|research|olympiad|quantum/,
     axes:{people:.2,applied:.4,creative:.45},
     blurb:"The fundamental laws of the universe.",
     out:{grad:"~55% pursue graduate/PhD study (est.)",salary:"$65k (est.; higher in tech/finance)",
       jobs:["Research scientist","Data scientist / quant","Engineer","Academia (with PhD)"],
       note:"Strong quantitative skills transfer into tech, finance and data roles."}},
    {name:"Mathematics",cat:"STEM",m:"INT",
     courses:["Math","Statistics","Computer Science"],act:/math|olympiad|proof|puzzle|code/,
     axes:{people:.2,applied:.4,creative:.4},
     blurb:"Abstract structures, logic and quantitative reasoning.",
     out:{grad:"~40% pursue graduate study (est.)",salary:"$70k (est.; strong in tech & finance)",
       jobs:["Actuary","Quantitative analyst","Data scientist","Software engineer"],
       note:"Very flexible; pairs well with CS, economics or finance."}},
    {name:"Neuroscience",cat:"Life Sciences",m:"INF",
     courses:["Biology","Chemistry","Psychology","Health / Anatomy"],act:/neuro|brain|bio|research|psych|medic/,
     axes:{people:.45,applied:.5,creative:.4},
     blurb:"The biology of the brain, behavior and cognition.",
     out:{grad:"~55% continue to medical or graduate school (est.)",salary:"$50k with a bachelor's (est.)",
       jobs:["Research assistant","Then physician, PhD researcher or clinician"],
       note:"A popular pre-med and pre-PhD track."}},
    {name:"Nursing",cat:"Health",m:"ISF",
     courses:["Biology","Chemistry","Health / Anatomy","Psychology"],act:/nurs|health|hospital|medic|care|volunteer/,
     axes:{people:.85,applied:.85,creative:.3},
     blurb:"Direct, hands-on patient care and health.",
     out:{grad:"~15% pursue advanced practice (NP/CRNA) (est.)",salary:"$75–85k (est.)",
       jobs:["Registered nurse","Then nurse practitioner or specialist (with grad study)"],
       note:"Strong, stable job market straight out of a BSN."}},
    {name:"Public Health",cat:"Health",m:"ENF",
     courses:["Biology","Statistics","Health / Anatomy","Psychology"],act:/health|public|epidem|community|policy|volunteer/,
     axes:{people:.75,applied:.55,creative:.35},
     blurb:"Population health, prevention and health policy.",
     out:{grad:"~45% pursue an MPH or related graduate degree (est.)",salary:"$50k with a bachelor's (est.)",
       jobs:["Health educator","Program coordinator","Epidemiologist (with MPH)","Policy analyst"],
       note:"An MPH substantially expands roles and pay."}},
    {name:"Psychology",cat:"Social Sciences",m:"ENF",
     courses:["Psychology","Biology","Statistics"],act:/psych|counsel|mental|research|volunteer|people/,
     axes:{people:.85,applied:.5,creative:.4},
     blurb:"The science of mind and behavior.",
     out:{grad:"~44% pursue graduate study (APA)",salary:"$45k with a bachelor's (est.)",
       jobs:["HR / people ops","Research assistant","UX researcher","Counselor / therapist (with grad degree)"],
       note:"Clinical and counseling careers require graduate school."}},
    {name:"Economics",cat:"Social Sciences",m:"ENT",
     courses:["Economics","Math","Statistics","Government / Politics"],act:/econ|invest|business|policy|debate|stock|research/,
     axes:{people:.5,applied:.5,creative:.35},
     blurb:"How people, markets and policy allocate resources.",
     out:{grad:"~25% pursue graduate study (est.)",salary:"$65–70k (est.)",
       jobs:["Financial analyst","Consultant","Economist","Data analyst"],
       note:"A strong feeder into finance, consulting and public policy."}},
    {name:"Business / Management",cat:"Business",m:"EST",
     courses:["Business","Economics","Math"],act:/business|startup|entrepreneur|market|deca|invest|manage/,
     axes:{people:.75,applied:.7,creative:.4},
     blurb:"Running, growing and leading organizations.",
     out:{grad:"~20% later pursue an MBA (est.)",salary:"$69k avg for business (NACE 2024)",
       jobs:["Business analyst","Operations associate","Marketing / sales","Management trainee"],
       note:"Broad, people-facing; an MBA often comes a few years into a career."}},
    {name:"Finance / Accounting",cat:"Business",m:"EST",
     courses:["Business","Economics","Math","Statistics"],act:/finance|account|invest|stock|business|audit/,
     axes:{people:.55,applied:.65,creative:.25},
     blurb:"Money, markets, investment and financial reporting.",
     out:{grad:"~15% (plus CPA/CFA credentials) (est.)",salary:"$70k (est.)",
       jobs:["Financial analyst","Accountant / auditor","Investment banking analyst","Advisor"],
       note:"Professional credentials (CPA, CFA) matter more than a graduate degree."}},
    {name:"Marketing / Communications",cat:"Business",m:"ENF",
     courses:["Business","English / Literature","Psychology"],act:/market|communic|social media|advertis|brand|pr|writ/,
     axes:{people:.8,applied:.7,creative:.7},
     blurb:"Brand, storytelling, audience and media.",
     out:{grad:"~12% pursue graduate study (est.)",salary:"$55k (est.)",
       jobs:["Marketing coordinator","Social media / content","PR specialist","Brand manager"],
       note:"Portfolio and internships weigh heavily in hiring."}},
    {name:"Political Science",cat:"Social Sciences",m:"ENT",
     courses:["Government / Politics","History","English / Literature"],act:/politic|debate|model un|mun|government|policy|campaign|law/,
     axes:{people:.7,applied:.4,creative:.4},
     blurb:"Government, power, policy and political behavior.",
     out:{grad:"~35–40% continue to graduate or law school (est.)",salary:"$50k with a bachelor's (est.)",
       jobs:["Policy analyst","Legislative / campaign staff","Government / NGO","Then law school"],
       note:"A very common pre-law path."}},
    {name:"International Relations",cat:"Social Sciences",m:"ENF",
     courses:["Government / Politics","History","Foreign Language","Economics"],act:/international|diplomacy|model un|mun|global|policy|language/,
     axes:{people:.7,applied:.4,creative:.4},
     blurb:"Diplomacy, global affairs and cross-border policy.",
     out:{grad:"~40% pursue graduate study (est.)",salary:"$52k (est.)",
       jobs:["Foreign / civil service","NGO / international org","Analyst","Consultant"],
       note:"Language skills and a graduate degree strengthen prospects."}},
    {name:"English / Literature",cat:"Humanities",m:"INF",
     courses:["English / Literature","History","Foreign Language"],act:/writ|read|literary|poetry|journal|book|debate/,
     axes:{people:.55,applied:.35,creative:.85},
     blurb:"Literature, language, rhetoric and critical thinking.",
     out:{grad:"~30% pursue graduate or law school (est.)",salary:"$45k (est.)",
       jobs:["Writer / editor","Content strategist","Teacher","Then law or an MA"],
       note:"Strong writing transfers widely; many pivot to law, comms or education."}},
    {name:"History",cat:"Humanities",m:"INT",
     courses:["History","English / Literature","Government / Politics"],act:/histor|research|debate|writ|museum|archive/,
     axes:{people:.45,applied:.3,creative:.55},
     blurb:"The human past, evidence and interpretation.",
     out:{grad:"~35% pursue graduate or law school (est.)",salary:"$48k (est.)",
       jobs:["Analyst / researcher","Educator","Archivist / museum","Then law or academia"],
       note:"Builds research and argument skills valued in law and policy."}},
    {name:"Philosophy",cat:"Humanities",m:"INT",
     courses:["English / Literature","Math","History"],act:/philosoph|debate|ethics|logic|argument|writ/,
     axes:{people:.4,applied:.2,creative:.6},
     blurb:"Logic, ethics, knowledge and the big questions.",
     out:{grad:"~40% pursue law or graduate school (est.)",salary:"$48k (est.)",
       jobs:["Analyst","Then law school (top LSAT scores)","Tech / policy","Academia"],
       note:"Philosophy majors post some of the highest law-school entrance scores."}},
    {name:"Sociology / Social Work",cat:"Social Sciences",m:"ENF",
     courses:["Psychology","Government / Politics","Statistics"],act:/social|community|volunteer|nonprofit|advoca|justice|care/,
     axes:{people:.9,applied:.55,creative:.4},
     blurb:"Society, communities and helping people.",
     out:{grad:"~40% pursue an MSW or graduate study (est.)",salary:"$45k (est.)",
       jobs:["Case manager","Community / nonprofit","Social worker (with MSW)","Policy / research"],
       note:"Licensed social work requires an MSW."}},
    {name:"Education",cat:"Social Sciences",m:"ESF",
     courses:["English / Literature","Psychology","History"],act:/teach|tutor|education|coach|mentor|kids/,
     axes:{people:.9,applied:.75,creative:.55},
     blurb:"Teaching, learning and child development.",
     out:{grad:"~35% pursue a master's (often for licensure/raises) (est.)",salary:"$45k (est.)",
       jobs:["K-12 teacher","Instructional coordinator","Ed-tech","School counselor (with grad)"],
       note:"Steady demand; a master's often boosts pay and roles."}},
    {name:"Art & Design",cat:"Arts",m:"ISF",
     courses:["Art"],act:/art|paint|draw|design|photograph|graphic|illustrat/,
     axes:{people:.4,applied:.7,creative:.95},
     blurb:"Visual art, design and creative craft.",
     out:{grad:"~15% pursue an MFA (est.)",salary:"$45–50k (est.)",
       jobs:["Graphic / UX designer","Illustrator","Art director","Product designer"],
       note:"A strong portfolio matters far more than a graduate degree."}},
    {name:"Music",cat:"Arts",m:"ISF",
     courses:["Music"],act:/music|band|orchestra|choir|jazz|instrument|compos|produc/,
     axes:{people:.5,applied:.75,creative:.95},
     blurb:"Performance, composition and the music industry.",
     out:{grad:"~25% pursue a graduate conservatory degree (est.)",salary:"Varies widely (est.)",
       jobs:["Performer","Music teacher","Producer / engineer","Music business"],
       note:"Careers vary from performance to production to education."}},
    {name:"Film / Theatre",cat:"Arts",m:"ENF",
     courses:["Art","English / Literature","Music"],act:/film|theat|drama|acting|cinema|dance|video/,
     axes:{people:.7,applied:.75,creative:.95},
     blurb:"Storytelling through screen and stage.",
     out:{grad:"~15% pursue graduate arts study (est.)",salary:"$45k (est.; highly variable)",
       jobs:["Production crew","Editor / videographer","Actor / performer","Screenwriter"],
       note:"Freelance and project-based work is common early on."}},
    {name:"Architecture",cat:"Arts",m:"INT",
     courses:["Art","Math","Physics"],act:/architect|design|build|draw|cad|urban/,
     axes:{people:.5,applied:.85,creative:.85},
     blurb:"Designing buildings and spaces.",
     out:{grad:"~60% pursue an M.Arch (needed for licensure) (est.)",salary:"$55k early-career (est.)",
       jobs:["Architectural designer","Then licensed architect","Urban / interior design"],
       note:"Licensure requires a professional degree + exams."}},
    {name:"Environmental Science",cat:"Life Sciences",m:"INF",
     courses:["Environmental Science","Biology","Chemistry"],act:/environment|sustain|climate|ecology|outdoors|conservation/,
     axes:{people:.45,applied:.6,creative:.35},
     blurb:"Ecosystems, climate and sustainability.",
     out:{grad:"~35% pursue graduate study (est.)",salary:"$50k (est.)",
       jobs:["Environmental analyst","Sustainability specialist","Field / lab scientist","Policy / NGO"],
       note:"Government agencies and consulting are major employers."}}
  ];

  function recommend(input){
    const courses = input.courses || new Set();
    const act = (input.activities || "").toLowerCase();
    const mbti = (input.mbti || "").toUpperCase();
    const ax = input.axes || {people:.5,applied:.5,creative:.5};

    const scored = MAJORS.map(mj => {
      const reasons = [];
      // course overlap (0..1)
      const overlap = mj.courses.filter(c => courses.has(c));
      const courseScore = mj.courses.length ? overlap.length / mj.courses.length : 0;
      if(overlap.length) reasons.push(`courses: ${overlap.slice(0,3).join(", ")}`);
      // activities (0/1)
      const actHit = act && mj.act.test(act);
      if(actHit) reasons.push("matches your activities");
      // mbti (0..1) — share of the major's favored letters present in the user's type
      let mbtiScore = 0;
      if(mbti.length===4 && mj.m){
        const favored = mj.m.split("");
        const present = favored.filter(l => mbti.includes(l)).length;
        mbtiScore = present / favored.length;
        if(mbtiScore >= 0.66) reasons.push(`fits ${mbti} temperament`);
      }
      // axes closeness (0..1)
      const diff = (Math.abs(ax.people-mj.axes.people)+Math.abs(ax.applied-mj.axes.applied)+Math.abs(ax.creative-mj.axes.creative))/3;
      const axisScore = 1 - diff;

      const score = Math.round(100 * (courseScore*0.40 + (actHit?1:0)*0.20 + axisScore*0.30 + mbtiScore*0.10));
      return { mj, score, reasons: reasons.slice(0,3) };
    });
    scored.sort((a,b) => b.score - a.score);
    return scored;
  }

  root.UM = root.UM || {};
  root.UM.majors = { COURSE_TAGS, MAJORS, recommend };
})(typeof window !== "undefined" ? window : globalThis);
