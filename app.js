// =====================================================================
// app.js  -  logika website (biasanya TIDAK perlu diedit)
// Data gunung, jalur, dan peralatan diambil dari Google Sheets.
// =====================================================================

// ===== LOGIKA KESULITAN =====
const TINGKAT = ["Easy", "Moderate", "Hard", "Very Hard"];
const lvGain = g => g > 3000 ? 3 : g > 1000 ? 2 : g >= 500 ? 1 : 0;
const lvLen  = k => k > 20   ? 3 : k > 10   ? 2 : k >= 3   ? 1 : 0;
const gradeJalur = j => Math.min(lvGain(j.gainM), lvLen(j.panjangKm));
function gradeGunung(g){
  const c = [0,0,0,0]; g.jalur.forEach(j => c[gradeJalur(j)]++);
  let best = 0; c.forEach((n,i) => { if(n >= c[best]) best = i; });
  return g.jalur.length ? best : 0;
}
function badge(lv){
  const s = document.createElement("span");
  s.className = "badge " + TINGKAT[lv].replace(" ", ""); s.textContent = TINGKAT[lv]; return s;
}

// ===== PERALATAN =====
// GEAR_SHEET diisi dari tab "Peralatan" di Google Sheets (null = belum/tidak terbaca).
let GEAR_SHEET = null;
const norm = s => String(s || "").toLowerCase().replace(/\s+/g, "");
const uniq = a => [...new Set(a)];

function ambilGear(method, lv, people){
  const f = s => s.replaceAll("{orang}", people).replaceAll("{tenda}", Math.ceil(people/3));

  // Cara utama: dari Google Sheets
  if(GEAR_SHEET){
    // kosong atau "semua" = berlaku untuk semua metode / semua tingkat
    const alias = s => { const v = norm(s); return v === "medium" ? "moderate" : v; };   // "Medium" dianggap "Moderate"
    const cocok = (nilai, target) => { const v = alias(nilai); return v === "" || v === "semua" || v === alias(target); };
    const pilih = jenis => GEAR_SHEET
      .filter(r => norm(r.jenis) === jenis && cocok(r.metode, method) && cocok(r.kategori, TINGKAT[lv]))
      .map(r => r.barang).filter(Boolean);
    return { wajib: uniq(pilih("wajib")).map(f), rekomendasi: uniq(pilih("rekomendasi")).map(f) };
  }

  // Cadangan: dari data.js (jika masih ada)
  if(typeof GEAR !== "undefined" && typeof GEAR_UMUM !== "undefined"){
    const sub = (GEAR[method] || {})[TINGKAT[lv]] || {wajib:[], rekomendasi:[]};
    return {
      wajib: [...GEAR_UMUM.wajib, ...sub.wajib].map(f),
      rekomendasi: [...GEAR_UMUM.rekomendasi, ...sub.rekomendasi].map(f)
    };
  }
  return {wajib: [], rekomendasi: []};
}

// ===== PLANNER =====
const $ = id => document.getElementById(id);
function isiPilihan(){
  ["mt", "rMt"].forEach(id => {
    const sel = $(id); sel.innerHTML = "";
    Object.keys(GUNUNG).forEach(n => { const o = document.createElement("option"); o.textContent = n; sel.appendChild(o); });
  });
}
isiPilihan();

function fill(ul, arr){
  ul.innerHTML = "";
  if(!arr.length){ const li = document.createElement("li"); li.textContent = "Belum diisi."; ul.appendChild(li); return; }
  arr.forEach(t => { const li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
}
function p(text){ const e = document.createElement("p"); e.textContent = text; return e; }

$("go").onclick = () => {
  const name = $("mt").value, g = GUNUNG[name];
  if(!g) return;
  const days = Math.max(1, +$("dur").value || 1), method = $("mth").value, people = Math.max(1, +$("ppl").value || 1);
  const lv = gradeGunung(g);
  $("oTitle").textContent = `${name} (${g.mdpl} mdpl) - ${days} hari, ${method}, ${people} orang`;
  $("oBadge").className = "badge " + TINGKAT[lv].replace(" ", ""); $("oBadge").textContent = "Grade umum: " + TINGKAT[lv];
  const cnt = [0,0,0,0]; g.jalur.forEach(j => cnt[gradeJalur(j)]++);
  $("oNote").textContent = "Berdasarkan " + g.jalur.length + " jalur: " + TINGKAT.map((t,i) => cnt[i] ? `${cnt[i]} ${t}` : "").filter(Boolean).join(", ") + ".";

  const routes = [...g.jalur];
  if(method === "tektok") routes.sort((a,b) => a.panjangKm - b.panjangKm);
  const box = $("oRoutes"); box.innerHTML = "";
  routes.forEach((j, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "rbtn";
    b.append(j.nama + " ", badge(gradeJalur(j)));
    if(method === "tektok" && i === 0) b.append(" (terpendek)");
    const det = document.createElement("div"); det.className = "rdet hidden";
    det.append(p("Panjang rute sampai puncak: " + j.panjangKm + " km"), p("Elevation gain: " + j.gainM + " m"), p(j.info || "Belum ada keterangan jalur."));
    b.onclick = () => det.classList.toggle("hidden");
    box.append(b, det);
  });

  const a = ambilGear(method, lv, people);
  fill($("oMust"), a.wajib); fill($("oRec"), a.rekomendasi);
  $("out").classList.remove("hidden"); $("out").scrollIntoView({behavior:"smooth"});
};

// ===== SLIDER GUNUNG =====
const sl = $("slider");
function renderSlider(){
  sl.innerHTML = "";
  Object.entries(GUNUNG).forEach(([name, g]) => {
    const c = document.createElement("div"); c.className = "card slide";
    let pic;
    if(g.foto){ pic = document.createElement("img"); pic.src = g.foto; pic.alt = name; pic.className = "ph"; }
    else { pic = document.createElement("div"); pic.className = "ph"; pic.textContent = "⛰"; }
    const h = document.createElement("h3"); h.textContent = name;
    c.append(pic, h, p("Ketinggian: " + g.mdpl + " mdpl"));
    const gp = document.createElement("p"); gp.append("Grade umum: ", badge(gradeGunung(g)));
    c.append(gp, p(g.info));
    sl.appendChild(c);
  });
}
renderSlider();
$("prev").onclick = () => sl.scrollBy({left:-320, behavior:"smooth"});
$("next").onclick = () => sl.scrollBy({left: 320, behavior:"smooth"});

// Baris status kecil di bawah slider: memperlihatkan data berasal dari Sheet atau dari data.js
const st = document.createElement("p");
st.className = "mut"; st.textContent = "Memuat data gunung...";
$("gunung").appendChild(st);
const st2 = document.createElement("p");
st2.className = "mut"; st2.textContent = "Memuat peralatan...";
$("gunung").appendChild(st2);
const jam = () => new Date().toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit", second:"2-digit"});

// ===== DATA DARI GOOGLE SHEETS =====
function parseCSV(t){
  const rows = []; let r = [], c = "", q = false;
  for(let i = 0; i < t.length; i++){
    const ch = t[i];
    if(q){
      if(ch === '"' && t[i+1] === '"'){ c += '"'; i++; }
      else if(ch === '"') q = false;
      else c += ch;
    } else if(ch === '"') q = true;
    else if(ch === ","){ r.push(c); c = ""; }
    else if(ch === "\n"){ r.push(c); rows.push(r); r = []; c = ""; }
    else if(ch !== "\r") c += ch;
  }
  if(c || r.length){ r.push(c); rows.push(r); }
  return rows;
}

// Daftar alamat untuk satu tab. Mode "langsung" (SHEET_ID) dicoba dulu, lalu link "Publish to web".
function sumberTab(namaTab, linkTerbit){
  const urls = [];
  if(typeof SHEET_ID !== "undefined" && SHEET_ID){
    // Kalau link terbit punya gid=..., pakai gid (tidak tergantung nama tab); kalau tidak, pakai nama tab
    const m = String(linkTerbit || "").match(/gid=(\d+)/);
    const tab = m ? `gid=${m[1]}` : `sheet=${encodeURIComponent(namaTab)}`;
    urls.push(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&${tab}`);
  }
  if(linkTerbit && String(linkTerbit).startsWith("http")) urls.push(linkTerbit);
  return urls;
}

// Mengambil tabel (selalu minta data baru, tidak memakai cache browser)
async function ambilTabel(urls){
  let galat = null;
  for(const u of urls){
    try{
      const res = await fetch(u + (u.includes("?") ? "&" : "?") + "_=" + Date.now(), {cache:"no-store"});
      if(!res.ok) throw new Error("HTTP " + res.status);
      const teks = await res.text();
      if(teks.trim().startsWith("<")) throw new Error("Bukan CSV (sheet belum dibagikan/dipublikasikan?)");
      const rows = parseCSV(teks);
      const h = rows.shift().map(x => x.trim().toLowerCase());
      return {
        data: rows.filter(r => r.some(x => x.trim())).map(r => Object.fromEntries(h.map((k, i) => [k, (r[i] || "").trim()]))),
        mode: u.includes("/gviz/") ? "langsung" : "terbit"
      };
    }catch(e){ galat = e; console.warn("Gagal mengambil", u, e); }
  }
  throw galat || new Error("Alamat sheet belum diisi");
}
const angka = x => parseFloat(String(x).replace(",", "."));

async function muatSheet(){
  const uG = sumberTab("Gunung", typeof SHEET_GUNUNG !== "undefined" ? SHEET_GUNUNG : "");
  const uJ = sumberTab("Jalur",  typeof SHEET_JALUR  !== "undefined" ? SHEET_JALUR  : "");
  if(!uG.length || !uJ.length){
    st.textContent = "Data gunung: dari data.js (cadangan). Isi SHEET_ID atau link Sheet di data.js.";
    return;
  }
  try{
    const [g, j] = await Promise.all([ambilTabel(uG), ambilTabel(uJ)]);
    const baru = {}, kunci = {};
    g.data.forEach(r => { if(r.nama){ baru[r.nama] = {mdpl: angka(r.mdpl), foto: r.foto, info: r.info, jalur: []}; kunci[r.nama.toLowerCase()] = r.nama; } });
    let lewat = 0, totalJalur = 0;
    // Kolom dicari lewat awalan namanya, jadi salah ketik kecil pada judul kolom tidak jadi masalah
    const kol = (r, awalan) => { const k = Object.keys(r).find(x => x.startsWith(awalan)); return k ? r[k] : ""; };
    j.data.forEach(r => {
      const nm = kunci[(r.gunung || "").toLowerCase()];
      const pk = angka(kol(r, "panjan")), gm = angka(kol(r, "gain"));
      if(nm && !isNaN(pk) && !isNaN(gm)){
        baru[nm].jalur.push({nama: r.nama, panjangKm: pk, gainM: gm, info: r.info || ""});
        totalJalur++;
      } else { lewat++; console.warn("Baris jalur dilewati (nama gunung tidak cocok / angka tidak valid):", r); }
    });
    if(Object.keys(baru).length){
      Object.keys(GUNUNG).forEach(k => delete GUNUNG[k]);
      Object.assign(GUNUNG, baru);
      isiPilihan(); renderSlider();
      st.textContent = `Data gunung: Google Sheets (${g.mode}), ${Object.keys(baru).length} gunung, ${totalJalur} jalur, dimuat pukul ${jam()}`
        + (lewat ? ` - ${lewat} baris jalur dilewati (cek Console)` : "")
        + (totalJalur === 0 ? " - PERINGATAN: tidak ada jalur terbaca, cek judul kolom tab Jalur (gunung, nama, panjangKm, gainM)" : "");
    } else {
      st.textContent = "Data gunung: dari data.js (cadangan). Sheet terbaca tapi kosong - cek judul kolom (nama, mdpl, foto, info).";
    }
  }catch(e){
    st.textContent = "Data gunung: dari data.js (cadangan). Sheet gagal dimuat: " + e.message;
    console.warn("Sheet gagal dimuat, memakai data.js", e);
  }
}

async function muatGear(){
  const u = sumberTab("Peralatan", typeof SHEET_GEAR !== "undefined" ? SHEET_GEAR : "");
  if(!u.length){ st2.textContent = "Peralatan: dari data.js (cadangan). Link tab Peralatan belum diisi."; return; }
  try{
    const r = await ambilTabel(u);
    if(r.data.length){
      GEAR_SHEET = r.data;
      st2.textContent = `Peralatan: Google Sheets (${r.mode}), ${r.data.length} barang.`;
    } else {
      st2.textContent = "Peralatan: tab terbaca tapi kosong, memakai data.js (cadangan).";
    }
  }catch(e){
    st2.textContent = "Peralatan: dari data.js (cadangan). Gagal memuat: " + e.message;
    console.warn("Tab Peralatan tidak terbaca, memakai peralatan dari data.js", e);
  }
}

muatSheet();
muatGear();

// ===== ULASAN (SUPABASE) =====
const ok = !SUPABASE_URL.startsWith("GANTI");
const sb = ok ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
if(!ok) $("cfgWarn").classList.remove("hidden");

async function muat(){
  if(!ok) return;
  const {data, error} = await sb.from("reviews").select("*").order("created_at", {ascending:false}).limit(30);
  const box = $("reviews"); box.innerHTML = "";
  if(error){ box.textContent = "Gagal memuat ulasan: " + error.message; return; }
  if(!data.length){ box.textContent = "Belum ada ulasan. Jadilah yang pertama!"; return; }
  data.forEach(r => {
    const d = document.createElement("div"); d.className = "card";
    const h = document.createElement("strong"); h.textContent = `${r.mountain} - ${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}`;
    const m = document.createElement("span"); m.className = "mut"; m.textContent = `${r.name} · ${new Date(r.created_at).toLocaleDateString("id-ID")}`;
    d.append(h, p(r.comment), m); box.appendChild(d);
  });
}
$("rSend").onclick = async () => {
  if(!ok){ $("rMsg").textContent = "Supabase belum dikonfigurasi."; return; }
  const row = {mountain:$("rMt").value, name:$("rName").value.trim(), rating:+$("rStar").value, comment:$("rTxt").value.trim()};
  if(!row.name || row.comment.length < 5){ $("rMsg").textContent = "Isi nama dan ulasan (min. 5 karakter)."; return; }
  const {error} = await sb.from("reviews").insert(row);
  if(error){ $("rMsg").textContent = "Gagal: " + error.message; return; }
  $("rMsg").textContent = "Terkirim!"; $("rTxt").value = ""; muat();
};
muat();
