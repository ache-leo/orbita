/* ==========================================================================
   Órbita — Lógica del recorrido
   Motor multi-formato: escenas, historias y micro-tareas de desempeño.
   ========================================================================== */

/* ---------- Aplanar ---------- */
const FLAT = [];        // todos los ítems con índice absoluto
const STEPS = [];       // secuencia real: paradas + ítems
const BLOCK_START = [];

BLOQUES.forEach((b, bi) => {
  BLOCK_START.push(FLAT.length);
  STEPS.push({ kind: "parada", bi });
  b.items.forEach(it => {
    const i = FLAT.length;
    FLAT.push(Object.assign({}, it, { i, bi }));
    STEPS.push({ kind: "item", bi, i });
  });
});
const TOTAL = FLAT.length;
const BLOCK_END = BLOQUES.map((b, i) => BLOCK_START[i] + b.items.length);

/* ---------- Estado ---------- */
const NO_APLICA = -1;      // "nunca estuve en una situación así": se excluye del promedio
const MIN_ITEMS = 4;       // menos ítems que esto y el área no es legible

let step = -1;
let pick = null;
const answers = new Array(TOTAL).fill(null);
const taskResults = {};   // id de tarea -> { valor, detalle, resumen, pocoFiable }

/* ---------- Utilidades ---------- */
const NS = "http://www.w3.org/2000/svg";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const esperar = ms => new Promise(r => setTimeout(r, ms));
const pct = v => Math.round(v * 100);
const TICK = '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="#DE9E2A" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.2 5.2L20 6.8"/></svg>';
const PANDA = '<svg viewBox="0 0 120 120"><use href="#panda"/></svg>';
const PANDA_AZUL = '<svg viewBox="0 0 120 120"><use href="#pandaAzul"/></svg>';

/* ---------- Ref DOM ---------- */
const $ = id => document.getElementById(id);
const vIntro = $("vIntro"), vParada = $("vParada"), vTest = $("vTest"), vResult = $("vResult");
const elTrail = $("trail");
const trailWrap = document.querySelector(".trail-wrap");
const elPlay = $("play");
const elTask = $("taskWrap");
const elAnswers = $("answers");
const elControls = $("controls");
const elQuestion = $("question");
const elScene = $("scene");
const elHint = $("hint");
const elTag = $("tag");
const elBubble = $("bubble");
const goBtn = $("goBtn");
const elFx = $("fx");
const progressFill = $("progressFill");
const counter = $("counter");
const radarCard = $("radarCard");
const domList = $("domList");
const srcBody = $("srcBody");
const elSources = $("sources");
const verdict = $("verdict");
const vNote = $("vNote");
const elEscapa = $("escapaBtn");
const elJuegos = $("juegos");

function showView(v){
  [vIntro, vParada, vTest, vResult].forEach(x => x.classList.remove("active"));
  v.classList.add("active");
  v.scrollTo({ top: 0 });
}

/* ==========================================================================
   CAMINO
   ========================================================================== */
let W = 0, H = 116, CY = 74, AMP = 16, PAD = 70;
let progPath = null, baseLen = 0;
let marks = [];
let walker = null;

function pathFrom(pts){
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++){
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function basePoints(){
  const N = 7, pts = [];
  for (let i = 0; i < N; i++){
    pts.push({ x: PAD + (W - 2 * PAD) * i / (N - 1), y: CY + Math.sin(i * 1.05) * AMP });
  }
  return pts;
}

function measure(){
  W = elTrail.clientWidth || 800;
  H = elTrail.clientHeight || H;
  CY = Math.round(H * 0.56);
  AMP = Math.max(9, Math.min(17, H * 0.15));
  PAD = Math.max(30, Math.min(72, W * 0.07));
}

function buildTrail(){
  measure();
  elTrail.innerHTML = "";
  marks = [];

  const inner = document.createElement("div");
  inner.className = "trail-inner";
  inner.style.width = W + "px";

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.position = "absolute";
  svg.style.left = "0";
  svg.style.top = "0";
  svg.style.overflow = "visible";

  const d = pathFrom(basePoints());
  const mk = (stroke, w, extra) => {
    const pth = document.createElementNS(NS, "path");
    pth.setAttribute("d", d);
    pth.setAttribute("fill", "none");
    pth.setAttribute("stroke", stroke);
    pth.setAttribute("stroke-width", w);
    pth.setAttribute("stroke-linecap", "round");
    pth.setAttribute("stroke-linejoin", "round");
    if (extra) for (const k in extra) pth.setAttribute(k, extra[k]);
    return pth;
  };

  svg.appendChild(mk("rgba(0,0,0,.30)", 32));
  svg.appendChild(mk("#2C2560", 28));
  svg.appendChild(mk("#5A4DA0", 22));
  svg.appendChild(mk("rgba(255,255,255,.28)", 3, { "stroke-dasharray": "1 15" }));

  progPath = mk("#FFC24B", 22);
  svg.appendChild(progPath);
  inner.appendChild(svg);

  baseLen = progPath.getTotalLength();
  progPath.setAttribute("stroke-dasharray", `${baseLen} ${baseLen}`);
  progPath.style.strokeDashoffset = baseLen;
  progPath.style.transition = "stroke-dashoffset .7s ease";

  const at = f => progPath.getPointAtLength(baseLen * clamp(f, 0, 1));

  const addMarker = (f, kind, bi) => {
    const p = at(f);
    const s = document.createElement("div");
    s.className = "stop" + (kind === "goal" ? " goal" : "");
    s.style.left = p.x + "px";
    s.style.top = p.y + "px";
    s.innerHTML = `<span class="stone"></span>`;
    inner.appendChild(s);
    marks.push({ el: s, kind, bi, f });
  };

  // Las postas van al medio de cada tramo: así no chocan con la nave al arrancar
  BLOQUES.forEach((b, bi) => addMarker((BLOCK_START[bi] + BLOCK_END[bi]) / 2 / TOTAL, "block", bi));
  addMarker(1, "goal", -1);

  walker = document.createElement("div");
  walker.className = "walker";
  walker.innerHTML = '<svg viewBox="0 0 150 120"><g class="bob"><use href="#ship"/></g></svg>';
  inner.appendChild(walker);

  elTrail.appendChild(inner);
  elTrail._at = at;
  paintTrail();
}

function asegurarTrail(){
  const cw = elTrail.clientWidth || 0, ch = elTrail.clientHeight || 0;
  if (!elTrail._at || Math.abs(cw - W) > 2 || Math.abs(ch - H) > 2) buildTrail();
}

const STAR = '<svg viewBox="0 0 24 24" fill="#5A3D00"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.3 2.7 1-6L3.3 9.4l6-.9z"/></svg>';
const FLAG = '<svg viewBox="0 0 24 24" fill="#1E5B2A"><path d="M6 3v18h2v-7l9-1.5v-6L8 8V3z"/></svg>';

function respondida(it){
  return it.tipo === "tarea" ? !!taskResults[it.id] : answers[it.i] != null;
}
const completadas = () => FLAT.filter(respondida).length;
const hechasEnBloque = bi => FLAT.filter(it => it.bi === bi && respondida(it)).length;

function currentBlock(){
  const s = STEPS[clamp(step, 0, STEPS.length - 1)];
  return s ? s.bi : 0;
}

function paintTrail(){
  const frac = clamp(completadas() / TOTAL, 0, 1);
  if (progressFill) progressFill.style.width = (frac * 100) + "%";
  if (counter){
    const s = STEPS[clamp(step, 0, STEPS.length - 1)];
    counter.textContent = Math.min(s ? s.i + 1 : TOTAL, TOTAL) + "/" + TOTAL;
  }
  if (!walker || !progPath || !elTrail._at) return;

  const at = elTrail._at;
  const wp = at(frac);
  walker.style.left = wp.x + "px";
  walker.style.top = wp.y + "px";
  progPath.style.strokeDashoffset = baseLen * (1 - frac);

  const cb = currentBlock();
  marks.forEach(m => {
    if (m.kind === "goal"){
      const done = completadas() >= TOTAL;
      m.el.classList.toggle("done", done);
      m.el.querySelector(".stone").innerHTML = done ? FLAG : "";
    } else {
      const size = BLOCK_END[m.bi] - BLOCK_START[m.bi];
      const done = hechasEnBloque(m.bi) >= size;
      m.el.classList.toggle("done", done);
      m.el.classList.toggle("now", !done && cb === m.bi);
      m.el.querySelector(".stone").innerHTML = done ? STAR : "";
    }
  });
}

/* ---------- Confeti (reservado para cierres) ---------- */
function confetti(cx, cy, n){
  const colors = ["#FFC24B","#FF8A3D","#8FE388","#66C7FF","#FF7AA2","#FFFFFF"];
  for (let i = 0; i < (n || 14); i++){
    const b = document.createElement("i");
    b.className = "bit";
    b.style.left = cx + "px";
    b.style.top = cy + "px";
    b.style.background = colors[i % colors.length];
    b.style.setProperty("--dx", rnd(-130, 130) + "px");
    b.style.setProperty("--dy", rnd(90, 220) + "px");
    b.style.setProperty("--rot", rnd(-270, 270) + "deg");
    b.style.animationDelay = rnd(0, 0.15) + "s";
    elFx.appendChild(b);
    setTimeout(() => b.remove(), 1400);
  }
}

/* ==========================================================================
   FLUJO
   ========================================================================== */
function gotoStep(n){
  step = n;
  if (step < 0){ showView(vIntro); return; }
  if (step >= STEPS.length){ finalizar(); return; }

  const s = STEPS[step];
  if (s.kind === "parada") return renderParada(s.bi);

  const it = FLAT[s.i];
  if (it.tipo === "tarea") return renderTareaIntro(it);
  return renderEscena(it);
}

function modo(que){
  const esTarea = que === "tarea";
  elPlay.hidden = esTarea;
  elTask.hidden = !esTarea;
  trailWrap.classList.toggle("compacto", esTarea);
  if (esTarea) elTask.classList.remove("anim");
  else elPlay.classList.remove("anim");
}

function renderParada(bi){
  const b = BLOQUES[bi];
  $("paradaIco").textContent = b.emoji;
  $("paradaKicker").textContent = "Tramo " + (bi + 1) + " de " + BLOQUES.length;
  $("paradaTitulo").textContent = b.parada.titulo;
  $("paradaTexto").textContent = b.parada.texto;
  $("paradaNota").textContent = b.parada.nota;
  const nEsc = b.items.filter(i => i.tipo !== "tarea").length;
  const nTar = b.items.filter(i => i.tipo === "tarea").length;
  $("paradaMeta").innerHTML =
    `<span class="chip"><b>◆</b> ${nEsc} escenas</span>` +
    (nTar ? `<span class="chip"><b>▶</b> ${nTar} juego${nTar > 1 ? "s" : ""}</span>` : "") +
    `<span class="chip"><b>◷</b> ${Math.max(1, Math.round((nEsc * 12 + nTar * 60) / 60))} min</span>`;
  showView(vParada);
  paintTrail();
}

function replay(el, cls){ el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

/* ---------- Preguntas ---------- */
function renderEscena(it){
  modo("play");
  const b = BLOQUES[it.bi];
  const delTipo = FLAT.filter(x => x.tipo === it.tipo);
  const nro = delTipo.findIndex(x => x.i === it.i) + 1;
  const label = it.tipo === "historia" ? "Situación " : "Escena ";

  elTag.textContent = b.emoji + "  " + label + nro;
  elTag.style.background = b.color;
  elTag.style.color = "#1B1730";

  elScene.textContent = it.esc;
  elQuestion.textContent = it.t;

  const pista = it.tipo === "historia"
    ? "Elegí la que más se parezca a lo que entendiste."
    : (it.escala === "grado" ? "Pensá en lo que te pasa de verdad, no en lo ideal." : "");
  elHint.textContent = pista;
  elHint.style.display = pista ? "" : "none";

  pick = answers[it.i];
  actualizarBoton(it);

  // La salida solo existe donde la escena presupone una situación concreta
  const puedeEscapar = it.tipo === "escena" && !!it.escapa;
  elEscapa.hidden = !puedeEscapar;
  elEscapa.classList.toggle("elegido", puedeEscapar && pick === NO_APLICA);

  if (it.tipo === "historia"){
    elControls.classList.add("historia");
    elAnswers.className = "answers";
    elAnswers.removeAttribute("role");
    elAnswers.removeAttribute("aria-label");
    elAnswers.innerHTML = "";
    it.ops.forEach((op, i) => {
      const btn = document.createElement("button");
      btn.className = "opt opt--ancha" + (pick === i ? " selected" : "");
      btn.style.animationDelay = (0.04 + i * 0.05) + "s";
      btn.innerHTML = `<span class="bead"></span><span class="txt">${op.t}</span>${TICK}`;
      btn.setAttribute("aria-pressed", pick === i ? "true" : "false");
      btn.addEventListener("click", () => elegir(i, btn));
      elAnswers.appendChild(btn);
    });
  } else {
    elControls.classList.remove("historia");
    elAnswers.className = "answers dial";
    elAnswers.setAttribute("role", "radiogroup");
    elAnswers.setAttribute("aria-label", it.t);
    elAnswers.innerHTML = "";
    (ESCALAS[it.escala] || ESCALAS.freq).forEach((txt, i) => {
      const btn = document.createElement("button");
      btn.className = "stop-opt" + (pick === i ? " selected" : "");
      btn.style.animationDelay = (0.04 + i * 0.05) + "s";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", pick === i ? "true" : "false");
      btn.innerHTML = `<span class="bead"></span><span class="txt">${txt}</span>`;
      btn.addEventListener("click", () => elegir(i, btn));
      elAnswers.appendChild(btn);
    });
    pintarDial(pick);
  }

  showView(vTest);
  asegurarTrail();
  replay(elBubble, "anim");
  elPlay.classList.add("anim");
  paintTrail();
  vTest.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarBoton(it){
  goBtn.disabled = pick === null;
  goBtn.textContent = it.i === TOTAL - 1 ? "Ver mi recorrido" : "Continuar";
}

function pintarDial(v){
  [...elAnswers.querySelectorAll(".stop-opt")].forEach((o, i) => {
    o.classList.toggle("lit", v != null && i <= v);
    o.classList.toggle("selected", v === i);
    o.setAttribute("aria-checked", v === i ? "true" : "false");
  });
}

function elegir(i, btn){
  const it = FLAT[STEPS[step].i];
  pick = i;
  answers[it.i] = i;
  elEscapa.classList.remove("elegido");

  if (it.tipo === "historia"){
    [...elAnswers.children].forEach(o => {
      o.classList.remove("selected");
      o.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("selected");
    btn.setAttribute("aria-pressed", "true");
  } else {
    pintarDial(i);
  }

  actualizarBoton(it);
  paintTrail();
}

/* ==========================================================================
   TAREAS
   ========================================================================== */
const TAREAS = {};

function renderTareaIntro(it){
  modo("tarea");
  const b = BLOQUES[it.bi];
  $("taskTag").textContent = b.emoji + "  Juego";
  $("taskTag").style.background = b.color;
  $("taskTag").style.color = "#1B1730";
  $("taskTitle").textContent = it.titulo;

  const body = $("taskBody");
  body.innerHTML =
    `<p class="task-para">${it.para}</p>` +
    (it.detalle ? `<p class="task-detalle">${it.detalle}</p>` : "") +
    `<div class="task-art" aria-hidden="true">${it.juego === "gonogo" ? PANDA : ""}</div>`;

  const foot = $("taskFoot");
  foot.innerHTML = "";
  const b2 = document.createElement("button");
  b2.className = "go";
  b2.textContent = it.cta;
  b2.addEventListener("click", () => lanzarTarea(it), { once: true });
  foot.appendChild(b2);

  showView(vTest);
  asegurarTrail();
  paintTrail();
}

function lanzarTarea(it){
  $("taskFoot").innerHTML = "";
  const body = $("taskBody");
  body.innerHTML = "";
  TAREAS[it.juego](body, res => {
    taskResults[it.id] = res;
    mostrarCierre(it, res);
    paintTrail();
  }, it);
}

function mostrarCierre(it, res){
  $("taskBody").innerHTML =
    `<div class="task-cierre">
       <div class="task-check">${TICK}</div>
       <p class="task-res">${res.detalle || "Listo."}</p>
     </div>`;
  const foot = $("taskFoot");
  foot.innerHTML = "";
  const b = document.createElement("button");
  b.className = "go";
  b.textContent = step >= STEPS.length - 1 ? "Ver mi recorrido" : "Continuar";
  b.addEventListener("click", () => gotoStep(step + 1), { once: true });
  foot.appendChild(b);
  asegurarTrail();
  paintTrail();
}

/* ---------- Juego 1: la señal (go/no-go sostenido) ---------- */
TAREAS.gonogo = function(root, done){
  const N = 44, PRACTICA = 4, AZULES = 7;
  const azul = new Array(N).fill(false);
  shuffle(Array.from({ length: N - 1 }, (_, i) => i + 1)).slice(0, AZULES).forEach(i => { azul[i] = true; });

  root.innerHTML =
    `<div class="go-stage" tabindex="0">
       <div class="go-bar"><i></i></div>
       <div class="go-target"></div>
       <p class="go-hint">Tocá cuando aparezca el panda · no toques si es azul</p>
       <p class="go-count"></p>
     </div>`;

  const stage = root.querySelector(".go-stage");
  const target = root.querySelector(".go-target");
  const count = root.querySelector(".go-count");
  const bar = root.querySelector(".go-bar i");

  let activo = false, onset = 0, respuesta = null;
  const tap = () => { if (activo && respuesta === null) respuesta = performance.now() - onset; };
  const onKey = e => {
    if (e.code === "Space" || e.key === " "){ e.preventDefault(); tap(); }
  };
  stage.addEventListener("pointerdown", tap);
  addEventListener("keydown", onKey);

  const trials = [];

  (async () => {
    stage.focus();
    for (let c = 3; c > 0; c--){
      count.textContent = "Empezamos en " + c;
      await esperar(650);
    }
    count.textContent = "";

    for (let t = 0; t < N; t++){
      const noGo = azul[t];
      target.innerHTML = noGo ? PANDA_AZUL : PANDA;
      target.className = "go-target on" + (noGo ? " azul" : "");
      respuesta = null;
      onset = performance.now();
      activo = true;
      await esperar(560);
      target.className = "go-target";
      target.innerHTML = "";
      await esperar(rnd(700, 1400));
      activo = false;

      trials.push({ noGo, practica: t < PRACTICA, rt: respuesta });
      bar.style.width = ((t + 1) / N * 100) + "%";
    }

    removeEventListener("keydown", onKey);
    stage.removeEventListener("pointerdown", tap);
    done(analizarGonogo(trials));
  })();
};

function analizarGonogo(trials){
  const reales = trials.filter(t => !t.practica);
  const go = reales.filter(t => !t.noGo);
  const noGo = reales.filter(t => t.noGo);

  const hits = go.filter(t => t.rt !== null);
  const omisiones = go.length - hits.length;
  const comisiones = noGo.filter(t => t.rt !== null).length;

  const rts = hits.map(t => t.rt).filter(v => v >= 150 && v <= 1400);
  const media = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
  const sd = rts.length > 1
    ? Math.sqrt(rts.reduce((a, b) => a + (b - media) ** 2, 0) / (rts.length - 1))
    : 0;
  const cv = media > 0 ? sd / media : 0;

  const comRate = noGo.length ? comisiones / noGo.length : 0;
  const omRate = go.length ? omisiones / go.length : 0;

  const detalle =
    `${go.length} señales y ${noGo.length} azules. ` +
    (comisiones === 0 ? "No tocaste en ninguna azul. " : `Tocaste en ${comisiones} azul${comisiones > 1 ? "es" : ""}. `) +
    (omisiones === 0 ? "No se te pasó ninguna." : `Se te pasaron ${omisiones}.`);
  const resumen = `${go.length} señales · ${comisiones} de más · ${omisiones} sin responder`;

  if (rts.length < 15 || media < 200){
    return { valor: null, detalle, resumen, pocoFiable: true };
  }

  const v = 0.45 * clamp((comRate - 0.15) / 0.45, 0, 1)
          + 0.20 * clamp((omRate - 0.05) / 0.30, 0, 1)
          + 0.35 * clamp((cv - 0.22) / 0.30, 0, 1);
  return { valor: clamp(v, 0, 1), detalle, resumen };
}

/* ---------- Juego 2: las luces de la nave (memoria de trabajo) ---------- */
TAREAS.luces = function(root, done){
  root.innerHTML =
    `<div class="luces">
       <div class="luces-grid"></div>
       <p class="luces-hint">Mirá la secuencia</p>
       <div class="luces-dots"></div>
     </div>`;
  const grid = root.querySelector(".luces-grid");
  const hintEl = root.querySelector(".luces-hint");
  const dots = root.querySelector(".luces-dots");

  const celdas = [];
  for (let k = 0; k < 9; k++){
    const c = document.createElement("div");
    c.className = "luce";
    c.dataset.k = k;
    grid.appendChild(c);
    celdas.push(c);
  }

  let mejor = 0, largo = 3, fallos = 0;

  const pintarDots = () => {
    dots.innerHTML = "";
    for (let l = 3; l <= 7; l++){
      const d = document.createElement("span");
      d.className = "ldot" + (mejor >= l ? " ok" : "");
      dots.appendChild(d);
    }
  };
  pintarDots();

  function secuencia(n){
    const seq = [];
    let prev = -1;
    for (let k = 0; k < n; k++){
      let v;
      do { v = Math.floor(Math.random() * 9); } while (v === prev);
      prev = v;
      seq.push(v);
    }
    return seq;
  }

  function mostrar(seq){
    return new Promise(resolve => {
      let i = 0;
      const paso = () => {
        if (i >= seq.length){ resolve(); return; }
        celdas[seq[i]].classList.add("on");
        setTimeout(() => {
          celdas[seq[i]].classList.remove("on");
          i++;
          setTimeout(paso, 160);
        }, 480 + seq.length * 30);
      };
      setTimeout(paso, 420);
    });
  }

  function responder(seq){
    return new Promise(resolve => {
      const recibido = [];
      let cerrado = false;
      let reloj = null;

      const cerrar = ok => {
        if (cerrado) return;
        cerrado = true;
        clearTimeout(reloj);
        celdas.forEach(x => x.removeEventListener("pointerdown", onTap));
        setTimeout(() => resolve(ok), 240);
      };

      const onTap = e => {
        const c = e.currentTarget;
        if (cerrado || recibido.length >= seq.length) return;
        c.classList.add("tap");
        setTimeout(() => c.classList.remove("tap"), 170);
        recibido.push(Number(c.dataset.k));
        if (recibido.length === seq.length){
          cerrar(recibido.every((v, i) => v === seq[i]));
        }
      };

      // Sin esto, una secuencia a medias dejaría la tarea esperando para siempre
      reloj = setTimeout(() => cerrar(false), 14000);
      celdas.forEach(c => c.addEventListener("pointerdown", onTap));
    });
  }

  (async () => {
    while (largo <= 7){
      hintEl.textContent = "Mirá la secuencia · " + largo + " luces";
      await esperar(430);
      const seq = secuencia(largo);
      await mostrar(seq);
      hintEl.textContent = "Repetí la secuencia";
      celdas.forEach(c => c.classList.add("activo"));
      const ok = await responder(seq);
      celdas.forEach(c => c.classList.remove("activo"));
      await esperar(260);
      if (ok){
        mejor = Math.max(mejor, largo);
        pintarDots();
        fallos = 0;
        largo++;
      } else {
        fallos++;
        if (fallos >= 2) break;
      }
    }
    const detalle = mejor === 0
      ? "No llegaste a completar la primera secuencia."
      : `Repetiste bien secuencias de ${mejor} luces.`;
    done({
      valor: mejor === 0 ? 1 : clamp((7 - mejor) / 5, 0, 1),
      detalle,
      resumen: mejor === 0 ? "no completó la primera secuencia" : `secuencias de hasta ${mejor} luces`
    });
  })();
};

/* ---------- Juegos 3-5: elección rápida ---------- */
function correrEleccion(root, pasos, puntuar, done){
  root.innerHTML =
    `<div class="juego">
       <div class="juego-bar"><i></i></div>
       <p class="juego-kicker"></p>
       <p class="juego-q"></p>
       <div class="juego-ops"></div>
     </div>`;
  const bar = root.querySelector(".juego-bar i");
  const kicker = root.querySelector(".juego-kicker");
  const q = root.querySelector(".juego-q");
  const ops = root.querySelector(".juego-ops");

  let i = 0, aciertos = 0;
  const responder = [];

  const pintar = () => {
    const p = pasos[i];
    kicker.textContent = (p.kicker || "Palabra") + " · " + (i + 1) + " de " + pasos.length;
    q.innerHTML = p.pregunta;
    ops.className = "juego-ops " + (p.layout || "duo");
    ops.innerHTML = "";
    p.opciones.forEach((o, k) => {
      const b = document.createElement("button");
      b.className = "juego-opt";
      b.style.animationDelay = (0.04 + k * 0.05) + "s";
      b.innerHTML = o.html || `<span class="pal">${o.t}</span>`;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        [...ops.children].forEach(x => { x.disabled = true; });
        b.classList.add("elegido");
        if (o.ok) aciertos++;
        responder.push({ ok: !!o.ok });
        bar.style.width = ((i + 1) / pasos.length * 100) + "%";
        setTimeout(() => {
          i++;
          if (i >= pasos.length) done(puntuar(aciertos, responder));
          else pintar();
        }, 280);
      });
      ops.appendChild(b);
    });
  };
  pintar();
}

TAREAS.ortografia = function(root, done, it){
  correrEleccion(
    root,
    shuffle(it.pares).map(p => ({
      kicker: "¿Cuál está bien escrita?",
      pregunta: "Elegí la correcta",
      layout: "duo",
      opciones: shuffle([{ t: p.ok, ok: true }, { t: p.mal, ok: false }])
    })),
    ac => ({
      valor: clamp((0.90 - ac / it.pares.length) / 0.45, 0, 1),
      detalle: `${ac} de ${it.pares.length} pares bien elegidos.`,
      resumen: `${ac} de ${it.pares.length} pares`
    }),
    done
  );
};

TAREAS.fonos = function(root, done, it){
  const respuestas = it.items.map(x => x.ok);
  correrEleccion(
    root,
    shuffle(it.items).map(x => {
      const distract = shuffle(respuestas.filter(r => r !== x.ok)).slice(0, 2);
      return {
        kicker: "Sacale un sonido",
        pregunta: `«<b>${x.p}</b>» sin el sonido «${x.q}» queda…`,
        layout: "trio",
        opciones: shuffle([
          { t: x.ok, ok: true },
          ...distract.map(d => ({ t: d, ok: false }))
        ])
      };
    }),
    ac => ({
      valor: clamp((0.90 - ac / it.items.length) / 0.50, 0, 1),
      detalle: `${ac} de ${it.items.length} palabras bien resueltas.`,
      resumen: `${ac} de ${it.items.length} palabras`
    }),
    done
  );
};

TAREAS.lexico = function(root, done, it){
  const estimulos = shuffle([
    ...it.reales.map(p => ({ p, real: true })),
    ...it.falsas.map(p => ({ p, real: false }))
  ]);
  correrEleccion(
    root,
    estimulos.map(e => ({
      kicker: "¿Existe esta palabra?",
      pregunta: `<span class="pal pal--sola">${e.p}</span>`,
      layout: "siNo",
      opciones: [
        { ok: e.real, html: "<span>Existe</span>" },
        { ok: !e.real, html: "<span>No existe</span>" }
      ]
    })),
    (ac, resp) => {
      const errores = resp.filter(r => !r.ok).length;
      return {
        valor: clamp((errores / estimulos.length - 0.06) / 0.30, 0, 1),
        detalle: errores === 0
          ? `Clasificaste bien las ${estimulos.length} palabras.`
          : `${errores} de ${estimulos.length} palabras mal clasificadas.`,
        resumen: `${errores} de ${estimulos.length} mal clasificadas`
      };
    },
    done
  );
};

/* ==========================================================================
   PUNTAJE
   ========================================================================== */
function nivelDe(p){
  return NIVELES.find(n => p <= n.hasta) || NIVELES[NIVELES.length - 1];
}

function senalDe(it){
  if (it.tipo === "escena"){
    const raw = answers[it.i];
    if (raw == null || raw === NO_APLICA) return null;
    return (it.inv ? 4 - raw : raw) / 4;
  }
  if (it.tipo === "historia"){
    const raw = answers[it.i];
    const op = raw == null ? null : it.ops[raw];
    return op ? op.sig : null;
  }
  if (it.tipo === "tarea"){
    const r = taskResults[it.id];
    return r && r.valor != null ? r.valor : null;
  }
  return null;
}

function calcular(){
  return BLOQUES.map((b, bi) => {
    let sum = 0, n = 0, salteados = 0;
    FLAT.filter(it => it.bi === bi).forEach(it => {
      if (it.tipo === "escena" && answers[it.i] === NO_APLICA) salteados++;
      const s = senalDe(it);
      if (s == null) return;
      sum += s; n++;
    });
    const p = n ? sum / n : 0;
    return { b, bi, pct: p, nivel: nivelDe(p), n, salteados, sinDatos: n < MIN_ITEMS };
  });
}

function validez(){
  const flags = [];
  PARES.forEach(p => {
    const vals = FLAT.filter(it => it.par === p.id)
      .map(it => answers[it.i])
      .filter(v => v != null && v !== NO_APLICA);
    if (vals.length === 2 && Math.abs(vals[0] - vals[1]) > p.max){
      flags.push({ tipo: "inconsistente", nombre: p.nombre });
    }
  });
  const esc = FLAT.filter(it => it.tipo === "escena")
    .map(it => answers[it.i])
    .filter(v => v != null && v !== NO_APLICA);
  if (esc.length >= 12){
    const c = {};
    esc.forEach(v => { c[v] = (c[v] || 0) + 1; });
    if (Math.max(...Object.values(c)) / esc.length >= UMBRAL_PLANO) flags.push({ tipo: "plano" });
  }
  return flags;
}

/* ==========================================================================
   RESULTADO
   ========================================================================== */
function radarSVG(res){
  const cx = 150, cy = 122, R = 84;
  const A = [-90, 30, 150].map(d => d * Math.PI / 180);
  const P = (f, i) => ({ x: cx + R * f * Math.cos(A[i]), y: cy + R * f * Math.sin(A[i]) });
  const ring = f => A.map((_, i) => { const p = P(f, i); return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");

  // El viewBox va con margen: la etiqueta más larga ("Aprendizaje") no debe recortarse
  let s = '<svg viewBox="-26 -8 352 266" role="img" aria-label="Perfil orientativo por área">';
  [.25, .5, .75, 1].forEach(f => {
    s += `<polygon points="${ring(f)}" fill="none" stroke="#E4E1F3" stroke-width="1.5"/>`;
  });
  res.forEach((r, i) => {
    const p = P(1, i);
    s += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#E4E1F3" stroke-width="1.5"/>`;
  });

  const dp = res.map((r, i) => { const p = P(Math.max(0.05, r.pct), i); return p.x.toFixed(1) + "," + p.y.toFixed(1); }).join(" ");
  s += `<polygon points="${dp}" fill="rgba(81,79,219,.26)" stroke="#514FDB" stroke-width="2.5" stroke-linejoin="round"/>`;

  res.forEach((r, i) => {
    const p = P(Math.max(0.05, r.pct), i);
    s += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#fff" stroke="${r.nivel.color}" stroke-width="3"/>`;
    const lp = P(1.24, i);
    const ca = Math.cos(A[i]);
    const anchor = Math.abs(ca) < 0.2 ? "middle" : (ca > 0 ? "start" : "end");
    s += `<text x="${lp.x.toFixed(1)}" y="${(lp.y + 4).toFixed(1)}" text-anchor="${anchor}" font-family="Nunito,sans-serif" font-size="12.5" font-weight="800" fill="#241F3A">${r.b.corto}</text>`;
  });
  s += "</svg>";
  return s;
}

function renderVerdict(res){
  const legibles = res.filter(r => !r.sinDatos);

  if (!legibles.length){
    verdict.style.borderLeftColor = "#B9B4D6";
    verdict.innerHTML =
      `<div class="v-label">Resultado general</div>
       <div class="v-line"><span class="v-area">Faltan datos</span></div>
       <p class="v-text">Se saltearon demasiadas escenas como para poder leer un perfil. Conviene repetir el recorrido respondiendo la mayor cantidad posible.</p>`;
    return;
  }

  const orden = [...legibles].sort((a, b) => b.pct - a.pct);
  const top = orden[0];
  const p = pct(top.pct);
  const cercanas = orden.filter(r => top.pct - r.pct < 0.10);
  const faltan = res.length - legibles.length;
  let html = "", color = top.nivel.color;

  if (top.pct < 0.34){
    color = "#8FE388";
    html =
      `<div class="v-label">Resultado general</div>
       <div class="v-line"><span class="v-area">${faltan ? "Sin señales en lo que se pudo leer" : "Sin señales destacadas"}</span></div>
       <p class="v-text">${faltan
         ? "En las áreas que sí se pudieron leer no aparecieron señales fuertes."
         : "No aparecieron señales fuertes en <strong>TDAH</strong>, <strong>espectro autista</strong> ni <strong>dificultades de lectura</strong>. Tus respuestas se ven equilibradas."}</p>`;
  } else if (cercanas.length > 1){
    const chip = cercanas.length >= 3 ? "TDAH · Autismo · Lectura" : cercanas.map(r => r.b.inst).join(" · ");
    const nombres = cercanas.map(r => r.b.clin).join(", ").replace(/, ([^,]*)$/, " y $1");
    html =
      `<div class="v-label">Resultado general</div>
       <div class="v-line"><span class="v-area">Señales repartidas</span>
         <span class="v-chip" style="background:${color}">${chip}</span></div>
       <p class="v-text">Tus respuestas muestran señales parecidas en <strong>${nombres}</strong>, sin que una se destaque claramente por encima de las otras.</p>`;
  } else {
    const alto = top.pct >= 0.60;
    html =
      `<div class="v-label">Tu perfil se inclina hacia</div>
       <div class="v-line"><span class="v-area">${top.b.clin}</span>
         <span class="v-chip" style="background:${color}">${top.b.inst} · ${p}%</span></div>
       <p class="v-text">${alto
         ? `Fue el área con <strong>más señales</strong>: ${top.b.nombre.toLowerCase()}, medido con <strong>${top.b.inst}</strong>. Sería bueno que lo charles con un adulto de confianza o con un profesional.`
         : `Fue el área con <strong>algunas señales</strong>, más que las otras: ${top.b.nombre.toLowerCase()}, medido con <strong>${top.b.inst}</strong>. Puede ser algo puntual o algo para mirar con calma.`}</p>`;
  }

  // Si hubo áreas salteadas, el veredicto tiene que decirlo
  if (faltan){
    html += `<p class="v-falta">${faltan === 1
      ? "Una de las tres áreas se salteó demasiado y no entra en esta lectura."
      : faltan + " de las tres áreas se saltearon demasiado y no entran en esta lectura."}</p>`;
  }

  verdict.style.borderLeftColor = color;
  verdict.innerHTML = html;
}

function renderValidez(flags){
  if (!flags.length){ vNote.hidden = true; vNote.innerHTML = ""; return; }
  vNote.hidden = false;
  const txt = flags.map(f => f.tipo === "plano"
    ? "casi todas tus respuestas fueron iguales"
    : `hubo respuestas que no coinciden entre sí (${f.nombre})`).join(" y ");
  vNote.innerHTML =
    `<span class="vn-ico">!</span>
     <span><b>Para tener en cuenta:</b> ${txt}. Puede ser que hayas ido muy rápido. Si algo no te cierra, conviene repetir el recorrido con más calma.</span>`;
}

function renderResult(){
  const res = calcular();

  renderVerdict(res);
  radarCard.innerHTML = radarSVG(res);

  domList.innerHTML = "";
  res.forEach(r => {
    const d = document.createElement("div");
    d.className = "dom";
    d.style.borderLeftColor = r.nivel.color;

    const badge = r.sinDatos
      ? `<span class="dom-badge dom-badge--gris">Faltan datos</span>`
      : `<span class="dom-badge" style="background:${r.nivel.color}">${r.nivel.corto} · ${pct(r.pct)}%</span>`;
    const texto = r.sinDatos
      ? `Se saltearon ${r.salteados} escenas de esta área: no alcanza para leerla.`
      : r.nivel.texto;

    d.classList.toggle("sin-datos", r.sinDatos);
    d.innerHTML =
      `<div class="dom-top">
         <span class="dom-ico" style="font-size:19px">${r.b.emoji}</span>
         <span class="dom-titles">
           <span class="dom-name">${r.b.clin}</span>
           <span class="dom-sub">${r.b.nombre} · ${r.b.inst}</span>
         </span>
         ${badge}
       </div>
       ${r.sinDatos ? "" : `<div class="bar"><i style="background:${r.nivel.color}"></i></div>`}
       <p class="dom-text">${texto}</p>`;
    domList.appendChild(d);
    const fill = d.querySelector(".bar i");
    if (fill){
      fill.style.width = "0%";
      requestAnimationFrame(() => { fill.style.width = pct(r.pct) + "%"; });
    }
  });

  // Lo que mostraron los juegos, en una nota aparte: así las tarjetas quedan parejas
  const conJuegos = res.filter(r => r.bi >= 0 &&
    FLAT.some(it => it.bi === r.bi && it.tipo === "tarea" && taskResults[it.id]));
  if (!conJuegos.length){
    elJuegos.hidden = true;
    elJuegos.innerHTML = "";
  } else {
    elJuegos.hidden = false;
    elJuegos.innerHTML = conJuegos.map(r => {
      const partes = FLAT
        .filter(it => it.bi === r.bi && it.tipo === "tarea" && taskResults[it.id])
        .map(it => {
          const t = taskResults[it.id];
          return `<span><b>${it.titulo}</b> ${t.resumen || t.detalle}${t.pocoFiable ? " · no se pudo leer bien" : ""}</span>`;
        }).join("");
      return `<p><span class="jk">${r.b.corto}</span>${partes}</p>`;
    }).join("");
  }

  renderValidez(validez());

  srcBody.innerHTML = "";
  FUENTES.forEach(f => {
    const p = document.createElement("p");
    p.className = "src";
    p.innerHTML = `<b>${f.nombre}</b>${f.cita}` +
      (f.url ? ` <a href="${f.url}" target="_blank" rel="noopener">Ver fuente</a>` : "");
    srcBody.appendChild(p);
  });
}

function finalizar(){
  renderResult();
  showView(vResult);
  confetti(innerWidth / 2, innerHeight * 0.32, 22);
  setTimeout(() => confetti(innerWidth * 0.22, innerHeight * 0.28, 14), 150);
  setTimeout(() => confetti(innerWidth * 0.78, innerHeight * 0.28, 14), 300);
}

/* ==========================================================================
   EVENTOS
   ========================================================================== */
$("introN").textContent = FLAT.filter(it => it.tipo !== "tarea").length;
$("introJ").textContent = FLAT.filter(it => it.tipo === "tarea").length;
$("introChips").innerHTML = BLOQUES.map(b =>
  `<span class="chip"><b>${b.emoji}</b> ${b.parada.titulo}</span>`).join("");

$("startBtn").addEventListener("click", () => gotoStep(0));
$("paradaBtn").addEventListener("click", () => {
  confetti(innerWidth / 2, innerHeight * 0.3, 10);
  gotoStep(step + 1);
});

goBtn.addEventListener("click", () => {
  if (pick === null) return;
  gotoStep(step + 1);
});

// "Nunca estuve en una situación así" se excluye del promedio en vez de contar como Nunca
elEscapa.addEventListener("click", () => {
  if (step < 0 || step >= STEPS.length) return;
  const it = FLAT[STEPS[step].i];
  if (it.tipo !== "escena" || !it.escapa) return;
  pick = NO_APLICA;
  answers[it.i] = NO_APLICA;
  pintarDial(NO_APLICA);
  elEscapa.classList.add("elegido");
  actualizarBoton(it);
  paintTrail();
});

addEventListener("keydown", e => {
  if (!vTest.classList.contains("active")) return;
  if (step < 0 || step >= STEPS.length) return;
  if (elPlay.hidden) return;             // durante un juego no hay opciones
  const it = FLAT[STEPS[step].i];
  if (it.tipo === "tarea") return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 5 && it.tipo === "escena"){
    const btn = elAnswers.children[n - 1];
    if (btn) elegir(n - 1, btn);
  } else if (e.key === "Enter" && !goBtn.disabled){
    goBtn.click();
  }
});

$("restartBtn").addEventListener("click", () => {
  answers.fill(null);
  Object.keys(taskResults).forEach(k => { delete taskResults[k]; });
  step = -1; pick = null;
  elSources.classList.remove("open");
  showView(vIntro);
});

$("closeBtn").addEventListener("click", () => {
  if (confirm("¿Salir del recorrido? Vas a perder tus respuestas.")) location.reload();
});

$("sourcesBtn").addEventListener("click", () => elSources.classList.toggle("open"));

let rz;
addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    if (vTest.classList.contains("active") && elTrail.clientWidth) buildTrail();
  }, 160);
});
