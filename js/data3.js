/* =====================================================================
   UniMatch — DATA LAYER (niche / specialized-major schools)
   Conservatories and art / film / theatre / design schools.
   Pushes into window.UM.data.UNIS. Load AFTER data.js, BEFORE engine/app.
   Vibe vectors lean: quirky high, research low (studio/performance based),
   spirit low, seminar high (small studio/conservatory classes).
   ===================================================================== */
(function (root) {
  const MORE = [
    /* ---- music conservatories ---- */
    {n:"The Juilliard School",loc:"New York, NY",ctry:"USA",region:"Northeast",type:"Private",size:600,setting:"urban",net:35000,gpa:3.5,
     strengths:["Music","Drama","Dance","Performance","Composition","Jazz Studies"],v:{collab:.6,quirky:.85,idealist:.6,research:.2,spirit:.1,seminar:.95}},
    {n:"Curtis Institute of Music",loc:"Philadelphia, PA",ctry:"USA",region:"Northeast",type:"Private",size:170,setting:"urban",net:5000,gpa:3.6,
     strengths:["Music","Performance","Composition","Conducting","Opera","Piano"],v:{collab:.65,quirky:.85,idealist:.6,research:.2,spirit:.05,seminar:.98}},
    {n:"Manhattan School of Music",loc:"New York, NY",ctry:"USA",region:"Northeast",type:"Private",size:500,setting:"urban",net:35000,gpa:3.3,
     strengths:["Music","Performance","Jazz Studies","Composition","Classical Voice","Musical Theatre"],v:{collab:.6,quirky:.8,idealist:.55,research:.2,spirit:.1,seminar:.9}},
    {n:"Cleveland Institute of Music",loc:"Cleveland, OH",ctry:"USA",region:"Midwest",type:"Private",size:400,setting:"urban",net:30000,gpa:3.4,
     strengths:["Music","Performance","Composition","Conducting","Strings","Piano"],v:{collab:.65,quirky:.8,idealist:.55,research:.2,spirit:.1,seminar:.95}},
    {n:"San Francisco Conservatory of Music",loc:"San Francisco, CA",ctry:"USA",region:"West",type:"Private",size:450,setting:"urban",net:32000,gpa:3.3,
     strengths:["Music","Performance","Composition","Technology & Applied Composition","Jazz Studies","Strings"],v:{collab:.62,quirky:.8,idealist:.6,research:.25,spirit:.1,seminar:.9}},
    {n:"Boston Conservatory at Berklee",loc:"Boston, MA",ctry:"USA",region:"Northeast",type:"Private",size:800,setting:"urban",net:38000,gpa:3.2,
     strengths:["Musical Theatre","Dance","Music","Theatre","Performance","Composition"],v:{collab:.65,quirky:.85,idealist:.6,research:.2,spirit:.15,seminar:.9}},
    {n:"New England Conservatory",loc:"Boston, MA",ctry:"USA",region:"Northeast",type:"Private",size:800,setting:"urban",net:35000,gpa:3.4,
     strengths:["Music","Performance","Jazz Studies","Composition","Contemporary Improvisation","Conducting"],v:{collab:.6,quirky:.85,idealist:.6,research:.25,spirit:.1,seminar:.9}},

    /* ---- art & design schools ---- */
    {n:"ArtCenter College of Design",loc:"Pasadena, CA",ctry:"USA",region:"West",type:"Private",size:2200,setting:"suburban",net:38000,gpa:3.3,
     strengths:["Transportation Design","Industrial Design","Illustration","Graphic Design","Film","Advertising"],v:{collab:.55,quirky:.9,idealist:.55,research:.3,spirit:.1,seminar:.8}},
    {n:"School of Visual Arts",loc:"New York, NY",ctry:"USA",region:"Northeast",type:"Private",size:3500,setting:"urban",net:38000,gpa:3.2,
     strengths:["Illustration","Animation","Graphic Design","Film","Photography","Cartooning"],v:{collab:.55,quirky:.92,idealist:.6,research:.25,spirit:.1,seminar:.8}},
    {n:"Ringling College of Art and Design",loc:"Sarasota, FL",ctry:"USA",region:"South",type:"Private",size:1600,setting:"suburban",net:36000,gpa:3.2,
     strengths:["Computer Animation","Game Art","Illustration","Motion Design","Graphic Design","Film"],v:{collab:.6,quirky:.9,idealist:.55,research:.25,spirit:.15,seminar:.85}},
    {n:"Otis College of Art and Design",loc:"Los Angeles, CA",ctry:"USA",region:"West",type:"Private",size:1100,setting:"urban",net:36000,gpa:3.2,
     strengths:["Fashion Design","Illustration","Graphic Design","Toy Design","Animation","Fine Arts"],v:{collab:.6,quirky:.9,idealist:.6,research:.25,spirit:.1,seminar:.85}},
    {n:"Pacific Northwest College of Art",loc:"Portland, OR",ctry:"USA",region:"West",type:"Private",size:600,setting:"urban",net:34000,gpa:3.2,
     strengths:["Illustration","Graphic Design","Animation","Fine Arts","Photography","Communication Design"],v:{collab:.6,quirky:.92,idealist:.7,research:.25,spirit:.1,seminar:.9}},
    {n:"Cooper Union",loc:"New York, NY",ctry:"USA",region:"Northeast",type:"Private",size:900,setting:"urban",net:22000,gpa:3.8,
     strengths:["Art","Architecture","Engineering","Design","Fine Arts","Mechanical Engineering"],v:{collab:.6,quirky:.88,idealist:.65,research:.55,spirit:.15,seminar:.9}},

    /* ---- film / theatre / performing arts ---- */
    {n:"Emerson College",loc:"Boston, MA",ctry:"USA",region:"Northeast",type:"Private",size:4000,setting:"urban",net:36000,gpa:3.4,
     strengths:["Film","Theatre","Communications","Writing","Journalism","Marketing Communication"],v:{collab:.65,quirky:.85,idealist:.7,research:.35,spirit:.2,seminar:.75}},
    {n:"Columbia College Chicago",loc:"Chicago, IL",ctry:"USA",region:"Midwest",type:"Private",size:6000,setting:"urban",net:30000,gpa:3.1,
     strengths:["Film","Audio Arts","Theatre","Music","Design","Creative Writing"],v:{collab:.62,quirky:.88,idealist:.7,research:.3,spirit:.2,seminar:.65}},
    {n:"Cornish College of the Arts",loc:"Seattle, WA",ctry:"USA",region:"West",type:"Private",size:600,setting:"urban",net:34000,gpa:3.1,
     strengths:["Theatre","Dance","Music","Film","Fine Arts","Design"],v:{collab:.65,quirky:.92,idealist:.72,research:.25,spirit:.1,seminar:.9}},
    {n:"American Academy of Dramatic Arts",loc:"New York, NY",ctry:"USA",region:"Northeast",type:"Private",size:400,setting:"urban",net:30000,gpa:3.0,
     strengths:["Acting","Theatre","Performance","Film & Television","Drama"],v:{collab:.65,quirky:.85,idealist:.6,research:.15,spirit:.1,seminar:.95}},
    {n:"Berklee College of Music",loc:"Boston, MA",ctry:"USA",region:"Northeast",type:"Private",size:5000,setting:"urban",net:38000,gpa:3.3,
     strengths:["Music","Music Production","Songwriting","Film Scoring","Performance","Music Business"],v:{collab:.7,quirky:.85,idealist:.6,research:.2,spirit:.25,seminar:.7}},

    /* ---- specialized tech / game ---- */
    {n:"DigiPen Institute of Technology",loc:"Redmond, WA",ctry:"USA",region:"West",type:"Private",size:1100,setting:"suburban",net:34000,gpa:3.4,
     strengths:["Game Design","Computer Science","Game Engineering","Digital Art","Animation","Music & Sound Design"],v:{collab:.65,quirky:.8,idealist:.4,research:.4,spirit:.2,seminar:.7}}
  ];

  root.UM = root.UM || {};
  root.UM.data = root.UM.data || {};
  if (Array.isArray(root.UM.data.UNIS)) {
    // avoid duplicating names already present (e.g. Juilliard, Berklee, Cooper Union, NEC)
    const have = new Set(root.UM.data.UNIS.map(u => u.n));
    root.UM.data.UNIS.push(...MORE.filter(u => !have.has(u.n)));
  } else {
    root.UM.data.UNIS = MORE;
  }
})(typeof window !== "undefined" ? window : globalThis);
