/* =====================================================================
   UniMatch — OLAP DATA LAYER (DuckDB-WASM)
   window.UM.db
     .ready        Promise<{available:boolean}>
     .available    boolean (after ready)
     .rows         flat denormalized row array (the "fact table")
     .sql(str)     async — run raw SQL (throws if DuckDB unavailable)
     .agg(dim,met) async — group-by aggregation; uses DuckDB when available,
                   otherwise an equivalent in-browser JS computation.

   DuckDB-WASM is a real columnar/analytical (OLAP) engine. Browser security
   means the WASM module + worker only load over http(s) — i.e. when the page
   is served by a local web server, not opened via file://. When it can't load
   (file:// or offline), we fall back to JS so the app keeps working; the
   Explore panel shows which engine answered each query.
   ===================================================================== */
(function (root) {
  const UNIS = root.UM.data.UNIS;
  const DET  = root.UM.details;

  /* ---- build the flat fact table (denormalized, read-optimized) ---- */
  function buildRows(){
    return UNIS.map(u => {
      const d = DET.get(u);
      return {
        name: u.n, region: u.region, country: u.ctry, type: u.type,
        setting: u.setting, size: u.size, net: u.net, gpa: u.gpa,
        accept_rate: d.admissions.acceptRate, ratio: d.academics.ratio,
        grad_rate: d.outcomes.gradRate, verified: d.verified ? 1 : 0
      };
    });
  }
  const rows = buildRows();

  /* ---- SQL builder for the Explore presets ---- */
  function sqlFor(dim, metric){
    const agg = metric === "count"   ? "COUNT(*)"
              : metric === "avg_net" ? "ROUND(AVG(net))"
              : metric === "avg_gpa" ? "ROUND(AVG(gpa),2)"
              : metric === "avg_size"? "ROUND(AVG(size))"
              : "COUNT(*)";
    return `SELECT ${dim} AS k, ${agg} AS v, COUNT(*) AS n\nFROM unis\nGROUP BY ${dim}\nORDER BY v DESC`;
  }

  /* ---- JS fallback that mirrors the SQL aggregation ---- */
  function jsAgg(dim, metric){
    const g = {};
    rows.forEach(r => { (g[r[dim]] = g[r[dim]] || []).push(r); });
    const out = Object.entries(g).map(([k, arr]) => {
      let v;
      if (metric === "count") v = arr.length;
      else {
        const col = metric === "avg_net" ? "net" : metric === "avg_gpa" ? "gpa" : "size";
        v = arr.reduce((s, x) => s + x[col], 0) / arr.length;
        v = metric === "avg_gpa" ? Math.round(v * 100) / 100 : Math.round(v);
      }
      return { k, v, n: arr.length };
    });
    out.sort((a, b) => b.v - a.v);
    return out;
  }

  const state = { available: false, conn: null };

  /* ---- DuckDB-WASM initialization (best-effort) ---- */
  async function init(){
    try {
      const duckdb = await import("https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm");
      const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
      // blob-wrapped worker avoids cross-origin worker restrictions
      const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
      );
      const worker = new Worker(workerUrl);
      const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(workerUrl);

      const conn = await db.connect();
      await db.registerFileText("unis.json", JSON.stringify(rows));
      await conn.query("CREATE TABLE unis AS SELECT * FROM read_json_auto('unis.json')");

      state.conn = conn;
      state.available = true;
      root.UM.db.available = true;
      return { available: true };
    } catch (e) {
      console.info("[UniMatch] DuckDB-WASM unavailable (likely opened via file:// or offline) — using JS fallback.", e && e.message);
      state.available = false;
      return { available: false };
    }
  }

  async function sql(str){
    if (!state.available) throw new Error("DuckDB not available");
    const res = await state.conn.query(str);
    return res.toArray().map(r => r.toJSON());
  }

  async function agg(dim, metric){
    const sqlText = sqlFor(dim, metric);
    if (state.available){
      try {
        const r = await sql(sqlText);
        return {
          rows: r.map(x => ({ k: x.k, v: Number(x.v), n: Number(x.n) })),
          sql: sqlText, engine: "DuckDB-WASM · columnar OLAP engine"
        };
      } catch (e) { /* fall through to JS */ }
    }
    return {
      rows: jsAgg(dim, metric), sql: sqlText,
      engine: "in-browser JS fallback · serve over http to run live DuckDB SQL"
    };
  }

  root.UM = root.UM || {};
  root.UM.db = { rows, sql, agg, available: false, ready: init() };
})(typeof window !== "undefined" ? window : globalThis);
