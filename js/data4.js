/* =====================================================================
   UniMatch — DATA LAYER (expansion pack 2)
   ~50 more schools: US regionals, more LACs, women's & faith-based
   colleges, and additional international universities.
   Pushes into window.UM.data.UNIS (deduped). Load after data.js,
   before engine.js / app.js.
   ===================================================================== */
(function (root) {
  const MORE = [
    /* ===== US PUBLIC — additional flagships & regionals ===== */
    {n:"University of Texas at Dallas",loc:"Richardson, TX",ctry:"USA",region:"South",type:"Public",size:21000,setting:"suburban",net:15000,gpa:3.6,
     strengths:["Computer Science","Engineering","Business","Data Science","Neuroscience","Finance"],v:{collab:.5,quirky:.6,idealist:.45,research:.75,spirit:.4,seminar:.3}},
    {n:"University of Illinois Chicago",loc:"Chicago, IL",ctry:"USA",region:"Midwest",type:"Public",size:22000,setting:"urban",net:15000,gpa:3.4,
     strengths:["Nursing","Engineering","Business","Pre-Med","Computer Science","Public Health"],v:{collab:.5,quirky:.55,idealist:.65,research:.75,spirit:.4,seminar:.3}},
    {n:"University of Nevada, Reno",loc:"Reno, NV",ctry:"USA",region:"West",type:"Public",size:17000,setting:"urban",net:14000,gpa:3.4,
     strengths:["Engineering","Business","Journalism","Nursing","Mining","Computer Science"],v:{collab:.55,quirky:.45,idealist:.5,research:.6,spirit:.7,seminar:.35}},
    {n:"Boise State University",loc:"Boise, ID",ctry:"USA",region:"West",type:"Public",size:18000,setting:"urban",net:14000,gpa:3.4,
     strengths:["Business","Engineering","Nursing","Computer Science","Kinesiology","Communication"],v:{collab:.55,quirky:.45,idealist:.5,research:.55,spirit:.8,seminar:.35}},
    {n:"University of Wyoming",loc:"Laramie, WY",ctry:"USA",region:"West",type:"Public",size:9000,setting:"rural",net:13000,gpa:3.4,
     strengths:["Engineering","Agriculture","Energy","Business","Geology","Nursing"],v:{collab:.6,quirky:.45,idealist:.5,research:.6,spirit:.8,seminar:.4}},
    {n:"Portland State University",loc:"Portland, OR",ctry:"USA",region:"West",type:"Public",size:21000,setting:"urban",net:15000,gpa:3.3,
     strengths:["Business","Engineering","Social Work","Urban Planning","Education","Computer Science"],v:{collab:.6,quirky:.65,idealist:.8,research:.6,spirit:.35,seminar:.3}},
    {n:"San Francisco State University",loc:"San Francisco, CA",ctry:"USA",region:"West",type:"Public",size:24000,setting:"urban",net:14000,gpa:3.3,
     strengths:["Business","Cinema","Computer Science","Nursing","Psychology","Communications"],v:{collab:.58,quirky:.7,idealist:.8,research:.55,spirit:.35,seminar:.3}},
    {n:"California State University, Long Beach",loc:"Long Beach, CA",ctry:"USA",region:"West",type:"Public",size:33000,setting:"urban",net:13000,gpa:3.5,
     strengths:["Engineering","Business","Nursing","Art & Design","Film","Psychology"],v:{collab:.55,quirky:.55,idealist:.6,research:.55,spirit:.55,seminar:.3}},
    {n:"California State University, Fullerton",loc:"Fullerton, CA",ctry:"USA",region:"West",type:"Public",size:36000,setting:"suburban",net:13000,gpa:3.4,
     strengths:["Business","Communications","Engineering","Nursing","Computer Science","Kinesiology"],v:{collab:.55,quirky:.5,idealist:.6,research:.5,spirit:.55,seminar:.3}},
    {n:"University of Massachusetts Lowell",loc:"Lowell, MA",ctry:"USA",region:"Northeast",type:"Public",size:14000,setting:"urban",net:18000,gpa:3.4,
     strengths:["Engineering","Computer Science","Business","Nursing","Criminal Justice","Sciences"],v:{collab:.55,quirky:.55,idealist:.55,research:.7,spirit:.45,seminar:.35}},
    {n:"University of North Carolina at Charlotte",loc:"Charlotte, NC",ctry:"USA",region:"South",type:"Public",size:25000,setting:"suburban",net:15000,gpa:3.5,
     strengths:["Engineering","Business","Computer Science","Nursing","Architecture","Data Science"],v:{collab:.55,quirky:.5,idealist:.55,research:.65,spirit:.65,seminar:.3}},
    {n:"Old Dominion University",loc:"Norfolk, VA",ctry:"USA",region:"South",type:"Public",size:18000,setting:"urban",net:15000,gpa:3.3,
     strengths:["Engineering","Business","Nursing","Cybersecurity","Maritime","Education"],v:{collab:.55,quirky:.45,idealist:.55,research:.6,spirit:.6,seminar:.35}},
    {n:"Kennesaw State University",loc:"Kennesaw, GA",ctry:"USA",region:"South",type:"Public",size:35000,setting:"suburban",net:13000,gpa:3.4,
     strengths:["Business","Engineering","Computer Science","Nursing","Education","Communications"],v:{collab:.55,quirky:.45,idealist:.55,research:.55,spirit:.6,seminar:.25}},
    {n:"Wayne State University",loc:"Detroit, MI",ctry:"USA",region:"Midwest",type:"Public",size:17000,setting:"urban",net:15000,gpa:3.3,
     strengths:["Pre-Med","Nursing","Engineering","Business","Pharmacy","Public Health"],v:{collab:.5,quirky:.55,idealist:.7,research:.7,spirit:.4,seminar:.3}},
    {n:"University of Memphis",loc:"Memphis, TN",ctry:"USA",region:"South",type:"Public",size:17000,setting:"urban",net:14000,gpa:3.3,
     strengths:["Business","Engineering","Nursing","Audiology","Music","Education"],v:{collab:.55,quirky:.5,idealist:.6,research:.6,spirit:.6,seminar:.35}},
    {n:"Towson University",loc:"Towson, MD",ctry:"USA",region:"South",type:"Public",size:19000,setting:"suburban",net:16000,gpa:3.4,
     strengths:["Business","Education","Nursing","Communications","Computer Science","Health Sciences"],v:{collab:.6,quirky:.45,idealist:.6,research:.5,spirit:.6,seminar:.35}},
    {n:"University at Albany (SUNY)",loc:"Albany, NY",ctry:"USA",region:"Northeast",type:"Public",size:13000,setting:"suburban",net:17000,gpa:3.4,
     strengths:["Criminal Justice","Public Policy","Business","Computer Science","Atmospheric Science","Social Welfare"],v:{collab:.55,quirky:.55,idealist:.65,research:.65,spirit:.5,seminar:.35}},
    {n:"SUNY Geneseo",loc:"Geneseo, NY",ctry:"USA",region:"Northeast",type:"Public",size:4500,setting:"rural",net:16000,gpa:3.5,
     strengths:["Biology","Psychology","Business","Education","English","Pre-Med"],v:{collab:.7,quirky:.6,idealist:.65,research:.55,spirit:.5,seminar:.75}},
    {n:"Rowan University",loc:"Glassboro, NJ",ctry:"USA",region:"Northeast",type:"Public",size:16000,setting:"suburban",net:17000,gpa:3.4,
     strengths:["Engineering","Business","Education","Biomedical Sciences","Communications","Computer Science"],v:{collab:.58,quirky:.5,idealist:.55,research:.6,spirit:.5,seminar:.4}},

    /* ===== US PRIVATE — additional national & regional ===== */
    {n:"University of Denver",loc:"Denver, CO",ctry:"USA",region:"West",type:"Private",size:6000,setting:"urban",net:35000,gpa:3.6,
     strengths:["Business","International Studies","Engineering","Psychology","Hospitality","Law"],v:{collab:.62,quirky:.55,idealist:.65,research:.6,spirit:.5,seminar:.6}},
    {n:"Trinity University",loc:"San Antonio, TX",ctry:"USA",region:"South",type:"Private",size:2500,setting:"urban",net:28000,gpa:3.6,
     strengths:["Business","Engineering Science","Biology","Computer Science","Communication","Pre-Med"],v:{collab:.72,quirky:.6,idealist:.6,research:.55,spirit:.55,seminar:.85}},
    {n:"Loyola Marymount University",loc:"Los Angeles, CA",ctry:"USA",region:"West",type:"Private",size:7000,setting:"urban",net:36000,gpa:3.6,
     strengths:["Film","Business","Engineering","Communications","Psychology","Computer Science"],v:{collab:.65,quirky:.6,idealist:.7,research:.5,spirit:.55,seminar:.6}},
    {n:"Fordham University",loc:"New York, NY",ctry:"USA",region:"Northeast",type:"Private",size:9000,setting:"urban",net:35000,gpa:3.6,
     strengths:["Business","Communications","Political Science","Economics","Psychology","Pre-Law"],v:{collab:.6,quirky:.55,idealist:.7,research:.6,spirit:.5,seminar:.55}},
    {n:"Seton Hall University",loc:"South Orange, NJ",ctry:"USA",region:"Northeast",type:"Private",size:6000,setting:"suburban",net:30000,gpa:3.5,
     strengths:["Nursing","Business","Diplomacy","Pre-Med","Communications","Education"],v:{collab:.6,quirky:.45,idealist:.65,research:.55,spirit:.65,seminar:.55}},
    {n:"Quinnipiac University",loc:"Hamden, CT",ctry:"USA",region:"Northeast",type:"Private",size:7000,setting:"suburban",net:35000,gpa:3.4,
     strengths:["Health Sciences","Business","Communications","Nursing","Physical Therapy","Law"],v:{collab:.62,quirky:.45,idealist:.6,research:.5,spirit:.65,seminar:.55}},
    {n:"Hofstra University",loc:"Hempstead, NY",ctry:"USA",region:"Northeast",type:"Private",size:6000,setting:"suburban",net:33000,gpa:3.4,
     strengths:["Business","Communications","Engineering","Nursing","Drama","Law"],v:{collab:.58,quirky:.55,idealist:.6,research:.55,spirit:.5,seminar:.5}},
    {n:"Belmont University",loc:"Nashville, TN",ctry:"USA",region:"South",type:"Private",size:7000,setting:"urban",net:30000,gpa:3.5,
     strengths:["Music Business","Songwriting","Business","Nursing","Audio Engineering","Entertainment"],v:{collab:.68,quirky:.7,idealist:.6,research:.4,spirit:.55,seminar:.6}},
    {n:"Ithaca College",loc:"Ithaca, NY",ctry:"USA",region:"Northeast",type:"Private",size:5000,setting:"suburban",net:32000,gpa:3.4,
     strengths:["Music","Film & TV","Communications","Theatre","Business","Physical Therapy"],v:{collab:.68,quirky:.78,idealist:.7,research:.4,spirit:.45,seminar:.7}},
    {n:"Drake University",loc:"Des Moines, IA",ctry:"USA",region:"Midwest",type:"Private",size:3000,setting:"urban",net:28000,gpa:3.6,
     strengths:["Pharmacy","Business","Actuarial Science","Journalism","Law","Education"],v:{collab:.68,quirky:.5,idealist:.6,research:.5,spirit:.55,seminar:.75}},
    {n:"Butler University",loc:"Indianapolis, IN",ctry:"USA",region:"Midwest",type:"Private",size:4500,setting:"suburban",net:32000,gpa:3.5,
     strengths:["Pharmacy","Business","Dance","Education","Health Sciences","Communications"],v:{collab:.68,quirky:.55,idealist:.6,research:.5,spirit:.65,seminar:.7}},
    {n:"Hope College",loc:"Holland, MI",ctry:"USA",region:"Midwest",type:"Private",size:3300,setting:"suburban",net:24000,gpa:3.5,
     strengths:["Chemistry","Biology","Nursing","Business","Education","Psychology"],v:{collab:.75,quirky:.5,idealist:.75,research:.6,spirit:.55,seminar:.85}},
    {n:"Centre College",loc:"Danville, KY",ctry:"USA",region:"South",type:"Private",size:1400,setting:"rural",net:24000,gpa:3.5,
     strengths:["Economics","Biology","International Studies","English","Chemistry","Politics"],v:{collab:.78,quirky:.6,idealist:.65,research:.5,spirit:.5,seminar:.95}},
    {n:"Hillsdale College",loc:"Hillsdale, MI",ctry:"USA",region:"Midwest",type:"Private",size:1500,setting:"rural",net:26000,gpa:3.6,
     strengths:["Politics","Economics","History","English","Philosophy","Classics"],v:{collab:.65,quirky:.7,idealist:.7,research:.5,spirit:.5,seminar:.95}},
    {n:"Wheaton College (Illinois)",loc:"Wheaton, IL",ctry:"USA",region:"Midwest",type:"Private",size:2400,setting:"suburban",net:28000,gpa:3.6,
     strengths:["Biology","Business","Music","Education","Psychology","Christian Ministry"],v:{collab:.72,quirky:.55,idealist:.8,research:.55,spirit:.55,seminar:.85}},
    {n:"Berea College",loc:"Berea, KY",ctry:"USA",region:"South",type:"Private",size:1600,setting:"rural",net:2000,gpa:3.4,
     strengths:["Education","Nursing","Business","Agriculture","Computer Science","Biology"],v:{collab:.85,quirky:.65,idealist:.95,research:.45,spirit:.4,seminar:.9}},

    /* ===== US — women's colleges ===== */
    {n:"Agnes Scott College",loc:"Decatur, GA",ctry:"USA",region:"South",type:"Private",size:1000,setting:"suburban",net:22000,gpa:3.5,
     strengths:["Biology","Psychology","Business","Public Health","International Relations","Creative Writing"],v:{collab:.82,quirky:.8,idealist:.9,research:.55,spirit:.3,seminar:.95},flags:["women"]},
    {n:"Mills College at Northeastern",loc:"Oakland, CA",ctry:"USA",region:"West",type:"Private",size:1000,setting:"urban",net:24000,gpa:3.4,
     strengths:["Computer Science","Business","Education","Public Policy","Art","Psychology"],v:{collab:.8,quirky:.85,idealist:.92,research:.5,spirit:.25,seminar:.9},flags:["women"]},

    /* ===== US — additional HBCU ===== */
    {n:"North Carolina Central University",loc:"Durham, NC",ctry:"USA",region:"South",type:"Public",size:7000,setting:"urban",net:13000,gpa:3.2,
     strengths:["Business","Nursing","Law","Pharmaceutical Sciences","Education","Computer Science"],v:{collab:.75,quirky:.45,idealist:.85,research:.55,spirit:.75,seminar:.45},flags:["hbcu"]},

    /* ===== INTERNATIONAL — UK & Ireland ===== */
    {n:"University of St Andrews",loc:"St Andrews",ctry:"UK",region:"International",type:"Public",size:9000,setting:"suburban",net:32000,gpa:3.8,
     strengths:["International Relations","Economics","Physics","English","Computer Science","Medicine"],v:{collab:.6,quirky:.7,idealist:.65,research:.85,spirit:.5,seminar:.6}},
    {n:"University of Nottingham",loc:"Nottingham",ctry:"UK",region:"International",type:"Public",size:30000,setting:"suburban",net:28000,gpa:3.5,
     strengths:["Engineering","Business","Medicine","Pharmacy","Computer Science","Law"],v:{collab:.52,quirky:.55,idealist:.6,research:.8,spirit:.5,seminar:.35}},
    {n:"University of Sheffield",loc:"Sheffield",ctry:"UK",region:"International",type:"Public",size:29000,setting:"urban",net:28000,gpa:3.5,
     strengths:["Engineering","Architecture","Medicine","Computer Science","Business","Materials Science"],v:{collab:.52,quirky:.6,idealist:.65,research:.82,spirit:.45,seminar:.35}},
    {n:"University of Exeter",loc:"Exeter",ctry:"UK",region:"International",type:"Public",size:24000,setting:"suburban",net:28000,gpa:3.5,
     strengths:["Business","Economics","Engineering","Sport Science","Law","Environmental Science"],v:{collab:.55,quirky:.55,idealist:.65,research:.78,spirit:.5,seminar:.4}},
    {n:"University of York",loc:"York",ctry:"UK",region:"International",type:"Public",size:18000,setting:"suburban",net:28000,gpa:3.5,
     strengths:["Computer Science","Economics","Biology","English","Psychology","History"],v:{collab:.55,quirky:.65,idealist:.7,research:.82,spirit:.4,seminar:.45}},
    {n:"Cardiff University",loc:"Cardiff",ctry:"UK",region:"International",type:"Public",size:24000,setting:"urban",net:27000,gpa:3.4,
     strengths:["Journalism","Medicine","Engineering","Business","Architecture","Psychology"],v:{collab:.52,quirky:.55,idealist:.65,research:.8,spirit:.45,seminar:.35}},

    /* ===== INTERNATIONAL — Continental Europe ===== */
    {n:"Ludwig Maximilian University of Munich",loc:"Munich",ctry:"Germany",region:"International",type:"Public",size:50000,setting:"urban",net:5000,gpa:3.6,
     strengths:["Medicine","Physics","Law","Economics","Biology","Philosophy"],v:{collab:.45,quirky:.7,idealist:.6,research:.9,spirit:.3,seminar:.35}},
    {n:"Sorbonne University",loc:"Paris",ctry:"France",region:"International",type:"Public",size:43000,setting:"urban",net:6000,gpa:3.6,
     strengths:["Humanities","Sciences","Medicine","Literature","Mathematics","History"],v:{collab:.45,quirky:.75,idealist:.7,research:.88,spirit:.3,seminar:.45}},
    {n:"Sapienza University of Rome",loc:"Rome",ctry:"Italy",region:"International",type:"Public",size:110000,setting:"urban",net:5000,gpa:3.4,
     strengths:["Engineering","Medicine","Architecture","Economics","Physics","Humanities"],v:{collab:.45,quirky:.6,idealist:.6,research:.82,spirit:.35,seminar:.3}},
    {n:"Uppsala University",loc:"Uppsala",ctry:"Sweden",region:"International",type:"Public",size:28000,setting:"urban",net:9000,gpa:3.6,
     strengths:["Medicine","Engineering","Pharmacy","Law","Biology","Computer Science"],v:{collab:.55,quirky:.65,idealist:.7,research:.85,spirit:.35,seminar:.4}},
    {n:"Aarhus University",loc:"Aarhus",ctry:"Denmark",region:"International",type:"Public",size:30000,setting:"urban",net:9000,gpa:3.6,
     strengths:["Business","Engineering","Medicine","Computer Science","Economics","Biology"],v:{collab:.55,quirky:.6,idealist:.7,research:.85,spirit:.3,seminar:.4}},

    /* ===== INTERNATIONAL — Asia, Oceania & beyond ===== */
    {n:"Indian Institute of Technology Delhi",loc:"New Delhi",ctry:"India",region:"International",type:"Public",size:9000,setting:"urban",net:4000,gpa:3.9,
     strengths:["Engineering","Computer Science","Electrical Engineering","Data Science","Physics","Design"],v:{collab:.45,quirky:.65,idealist:.5,research:.9,spirit:.5,seminar:.35}},
    {n:"University of Western Australia",loc:"Perth",ctry:"Australia",region:"International",type:"Public",size:24000,setting:"suburban",net:28000,gpa:3.5,
     strengths:["Engineering","Business","Medicine","Mining","Sciences","Law"],v:{collab:.5,quirky:.55,idealist:.65,research:.82,spirit:.45,seminar:.3}},
    {n:"University of Otago",loc:"Dunedin",ctry:"New Zealand",region:"International",type:"Public",size:18000,setting:"urban",net:22000,gpa:3.4,
     strengths:["Medicine","Dentistry","Sciences","Business","Pharmacy","Physiotherapy"],v:{collab:.58,quirky:.6,idealist:.7,research:.8,spirit:.5,seminar:.35}},
    {n:"Pontificia Universidad Católica de Chile",loc:"Santiago",ctry:"Chile",region:"International",type:"Private",size:30000,setting:"urban",net:9000,gpa:3.6,
     strengths:["Engineering","Medicine","Business","Architecture","Economics","Law"],v:{collab:.5,quirky:.55,idealist:.65,research:.82,spirit:.4,seminar:.4}},
    {n:"University of São Paulo",loc:"São Paulo",ctry:"Brazil",region:"International",type:"Public",size:60000,setting:"urban",net:3000,gpa:3.7,
     strengths:["Engineering","Medicine","Law","Economics","Computer Science","Architecture"],v:{collab:.45,quirky:.6,idealist:.7,research:.88,spirit:.4,seminar:.3}},
    {n:"American University of Beirut",loc:"Beirut",ctry:"Lebanon",region:"International",type:"Private",size:9000,setting:"urban",net:18000,gpa:3.5,
     strengths:["Medicine","Engineering","Business","Architecture","Public Health","Computer Science"],v:{collab:.55,quirky:.6,idealist:.75,research:.78,spirit:.4,seminar:.5}},
    {n:"University of Cape Town",loc:"Cape Town",ctry:"South Africa",region:"International",type:"Public",size:22000,setting:"urban",net:8000,gpa:3.5,
     strengths:["Engineering","Medicine","Business","Law","Computer Science","Economics"],v:{collab:.55,quirky:.6,idealist:.75,research:.82,spirit:.45,seminar:.35}}
  ];

  root.UM = root.UM || {};
  root.UM.data = root.UM.data || {};
  if (Array.isArray(root.UM.data.UNIS)) {
    const have = new Set(root.UM.data.UNIS.map(u => u.n));
    root.UM.data.UNIS.push(...MORE.filter(u => !have.has(u.n)));
  } else {
    root.UM.data.UNIS = MORE;
  }
})(typeof window !== "undefined" ? window : globalThis);
