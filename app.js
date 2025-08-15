// Data model: simplified, educational mappings.
// IMPORTANT: This is not official guidance. Some details vary by game/version/region.
const GENERATIONS = [
  { id: 1, name: "Gen 1 (Red/Blue/Yellow - VC)", era: "GB/3DS VC" },
  { id: 2, name: "Gen 2 (Gold/Silver/Crystal - VC)", era: "GBC/3DS VC" },
  { id: 3, name: "Gen 3 (Ruby/Sapphire/FireRed/LeafGreen/Emerald)", era: "GBA" },
  { id: 4, name: "Gen 4 (Diamond/Pearl/Platinum/HG/SS)", era: "DS" },
  { id: 5, name: "Gen 5 (Black/White/B2/W2)", era: "DS" },
  { id: 6, name: "Gen 6 (X/Y/OR/AS)", era: "3DS" },
  { id: 7, name: "Gen 7 (Sun/Moon/US/UM)", era: "3DS" },
  { id: 8, name: "Gen 8 (LGPE/Sword/Shield/BDSP/PLA)", era: "Switch" },
  { id: 9, name: "Gen 9 (Scarlet/Violet + DLC)", era: "Switch" }
];

// Canonical transfer "pipes" (simplified)
const PIPES = {
  gb_to_bank: {
    name: "Virtual Console Transfer",
    steps: [
      { kind: "step", title: "Use Poké Transporter", note: "3DS app reads VC Gen 1/2 boxes." },
      { kind: "req", title: "Pokémon Bank subscription", note: "Transporter deposits into Bank." },
      { kind: "step", title: "Move from Bank to Pokémon HOME", note: "Use the Bank → HOME migration." },
    ]
  },
  ds_to_bank: {
    name: "DS to Bank",
    steps: [
      { kind: "step", title: "Use Poké Transporter (with Gen 5)", note: "B/W/B2/W2 only." },
      { kind: "req", title: "Pokémon Bank", note: "Subscription required." },
      { kind: "step", title: "Bank → HOME migration", note: "One‑way into HOME." },
    ]
  },
  gba_to_ds: {
    name: "GBA to DS Pal Park",
    steps: [
      { kind: "req", title: "DS with GBA slot + Gen 4 game", note: "Pal Park feature." },
      { kind: "step", title: "Migrate via Pal Park", note: "GBA → Gen 4 cartridge." },
      { kind: "step", title: "Gen 4 → Gen 5 transfer lab", note: "Then continue to Bank via Transporter." }
    ]
  },
  threedsto_home: {
    name: "3DS to HOME",
    steps: [
      { kind: "req", title: "Pokémon Bank", note: "Deposit from Gen 6/7." },
      { kind: "step", title: "Bank → HOME", note: "Use official migration flow." }
    ]
  },
  switch_within_home: {
    name: "Switch ecosystem",
    steps: [
      { kind: "req", title: "Pokémon HOME", note: "Mobile + Switch app." },
      { kind: "step", title: "Move within HOME", note: "Between compatible Switch titles." }
    ]
  },
  go_to_home: {
    name: "Pokémon GO to HOME",
    steps: [
      { kind: "req", title: "GO Transporter energy", note: "Limits apply." },
      { kind: "step", title: "Link GO ↔ HOME and send", note: "Receive in HOME then move to games." }
    ]
  }
};

// Routing table (very high-level; educational)
const ROUTES = [
  { from: 1, to: 7, pipes: ["gb_to_bank", "threedsto_home"] },
  { from: 1, to: 8, pipes: ["gb_to_bank"] },
  { from: 1, to: 9, pipes: ["gb_to_bank"] },

  { from: 2, to: 7, pipes: ["gb_to_bank", "threedsto_home"] },
  { from: 2, to: 8, pipes: ["gb_to_bank"] },
  { from: 2, to: 9, pipes: ["gb_to_bank"] },

  { from: 3, to: 5, pipes: ["gba_to_ds"] },
  { from: 3, to: 6, pipes: ["gba_to_ds", "ds_to_bank"] },
  { from: 3, to: 7, pipes: ["gba_to_ds", "ds_to_bank", "threedsto_home"] },
  { from: 3, to: 8, pipes: ["gba_to_ds", "ds_to_bank"] },
  { from: 3, to: 9, pipes: ["gba_to_ds", "ds_to_bank"] },

  { from: 4, to: 5, pipes: [{custom: [
      { kind: "req", title: "Two DS systems", note: "For Gen 4 ↔ Gen 5 transfer lab." },
      { kind: "step", title: "Gen 4 → Gen 5", note: "Use in‑game transfer lab." }
  ]}] },
  { from: 4, to: 6, pipes: ["ds_to_bank"] },
  { from: 4, to: 7, pipes: ["ds_to_bank","threedsto_home"] },
  { from: 4, to: 8, pipes: ["ds_to_bank"] },
  { from: 4, to: 9, pipes: ["ds_to_bank"] },

  { from: 5, to: 6, pipes: ["ds_to_bank"] },
  { from: 5, to: 7, pipes: ["ds_to_bank","threedsto_home"] },
  { from: 5, to: 8, pipes: ["ds_to_bank"] },
  { from: 5, to: 9, pipes: ["ds_to_bank"] },

  { from: 6, to: 7, pipes: ["threedsto_home"] },
  { from: 6, to: 8, pipes: ["threedsto_home"] },
  { from: 6, to: 9, pipes: ["threedsto_home"] },

  { from: 7, to: 8, pipes: ["threedsto_home"] },
  { from: 7, to: 9, pipes: ["threedsto_home"] },

  { from: 8, to: 8, pipes: ["switch_within_home"] },
  { from: 8, to: 9, pipes: ["switch_within_home"] },

  { from: 9, to: 9, pipes: ["switch_within_home"] },

  // GO to modern titles
  { from: 0, to: 8, pipes: ["go_to_home"] },
  { from: 0, to: 9, pipes: ["go_to_home"] },
];

const byId = id => GENERATIONS.find(g => g.id === id);

const el = sel => document.querySelector(sel);
const qs = sel => [...document.querySelectorAll(sel)];

function populateSelects(){
  const from = el('#fromGen');
  const to = el('#toGen');
  const gens = GENERATIONS.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  from.innerHTML = gens;
  to.innerHTML = gens;
  from.value = 3; // fun defaults
  to.value = 9;
}

function confetti(){
  const host = el('#confetti');
  const n = 80;
  for(let i=0;i<n;i++){
    const d = document.createElement('div');
    d.className = 'confetti-piece';
    d.style.left = Math.random()*100 + 'vw';
    d.style.background = ['#ff3b6b','#ffd166','#3a86ff','#8338ec'][i%4];
    d.style.animationDelay = (Math.random()*0.8)+'s';
    d.style.transform = `translateY(-10vh) rotate(${Math.random()*180}deg)`;
    host.appendChild(d);
    setTimeout(()=>host.removeChild(d), 2200);
  }
}

// Plan a route
function planRoute(){
  const from = parseInt(el('#fromGen').value, 10);
  const to = parseInt(el('#toGen').value, 10);
  const summary = el('#planSummary');
  const track = el('#timelineTrack');
  track.innerHTML = '';

  if(from === to){
    buildTimeline([{kind:'step', title:'Already there!', note:'You can reorganize within Pokémon HOME and move between compatible games.'}]);
    summary.innerHTML = `Selected <strong>${byId(from).name}</strong> → <strong>${byId(to).name}</strong>. No cross‑gen transfer needed.`;
    confetti();
    return;
  }

  const route = ROUTES.find(r => r.from === from && r.to === to);
  if(!route){
    summary.innerHTML = `Selected <strong>${byId(from).name}</strong> → <strong>${byId(to).name}</strong>.`;
    buildTimeline([{kind:'caution', title:'No direct route known here', note:'Try stepping through intermediate generations.'}]);
    return;
  }

  // Expand pipes into steps
  let steps = [];
  for(const p of route.pipes){
    if(typeof p === 'string'){
      steps.push({kind:'step', title:PIPES[p].name, note:''});
      steps = steps.concat(PIPES[p].steps);
    }else if(p.custom){
      steps = steps.concat(p.custom);
    }
  }

  summary.innerHTML = `Route planned: <strong>${byId(from).name}</strong> → <strong>${byId(to).name}</strong>.`;
  buildTimeline(steps);
  confetti();
}

// Build timeline cards
function buildTimeline(steps){
  const track = el('#timelineTrack');
  steps.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    const badge = document.createElement('div');
    badge.className = 'badge ' + (s.kind === 'step' ? 'step' : s.kind === 'req' ? 'req' : 'caution');
    badge.textContent = s.kind === 'req' ? 'REQ' : s.kind === 'caution' ? '!' : idx+1;
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = s.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = s.note || '';
    const chip = document.createElement('span');
    chip.className = 'chip ' + (s.kind === 'step' ? 'step' : s.kind === 'req' ? 'requirement' : 'caution');
    chip.textContent = s.kind.toUpperCase();

    const right = document.createElement('div');
    right.appendChild(chip);

    card.appendChild(badge);
    const main = document.createElement('div');
    main.appendChild(title);
    main.appendChild(meta);
    card.appendChild(main);
    card.appendChild(right);

    // Tiny flourish
    card.style.setProperty('--i', idx);
    card.animate([{transform:'translateY(8px)', opacity:0}, {transform:'translateY(0)', opacity:1}], {duration: 220, delay: 30*idx, easing:'ease-out'});

    track.appendChild(card);
  });
}

// Mini-game: Transfer Tetris
let game = { answer: [], score: 0 };

function shuffle(arr){
  return arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
}

function setupGame(){
  const from = parseInt(el('#fromGen').value, 10);
  const to = parseInt(el('#toGen').value, 10);
  const route = ROUTES.find(r => r.from === from && r.to === to);
  const pool = el('#cardPool');
  const conv = el('#conveyor');
  pool.innerHTML = ''; conv.innerHTML = '';
  game.score = 0; updateScore();

  if(!route){
    pool.innerHTML = '<div class="card">Pick a route with steps to play.</div>';
    return;
  }

  // Build a flattened, step-only sequence as the answer
  let steps = [];
  for(const p of route.pipes){
    if(typeof p === 'string'){
      steps.push(PIPES[p].name);
      PIPES[p].steps.filter(s => s.kind === 'step').forEach(s => steps.push(s.title));
    }else if(p.custom){
      p.custom.filter(s => s.kind === 'step').forEach(s => steps.push(s.title));
    }
  }
  game.answer = steps;

  const cards = shuffle(steps).map(title => {
    const c = document.createElement('div');
    c.className = 'card';
    c.textContent = title;
    c.setAttribute('draggable', 'true');
    c.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', title);
      e.dataTransfer.effectAllowed = 'move';
    });
    return c;
  });
  cards.forEach(c => pool.appendChild(c));

  conv.addEventListener('dragover', e => e.preventDefault());
  conv.addEventListener('drop', e => {
    e.preventDefault();
    const title = e.dataTransfer.getData('text/plain');
    const card = [...pool.children].find(c => c.textContent === title);
    if(card){
      conv.appendChild(card);
      checkConveyor();
    }
  });
}

function checkConveyor(){
  const placed = [...el('#conveyor').children].map(c => c.textContent);
  const nextNeeded = game.answer[placed.length - 1];
  const lastPlaced = placed[placed.length - 1];

  if(lastPlaced !== nextNeeded){
    // Penalty: send it back
    const pool = el('#cardPool');
    const elCard = [...el('#conveyor').children].at(-1);
    pool.appendChild(elCard);
    bumpScore(-1);
  }else{
    bumpScore(2);
    if(placed.length === game.answer.length){
      bumpScore(8);
      confetti();
    }
  }
  updateScore();
}

function bumpScore(n){ game.score = Math.max(0, game.score + n); }
function updateScore(){ el('#scoreArea').textContent = `Score: ${game.score}`; }

// UI wiring
function onSwap(){ const a = el('#fromGen'); const b = el('#toGen'); const t = a.value; a.value = b.value; b.value = t; }

function randomize(){
  const ids = GENERATIONS.map(g=>g.id);
  const a = ids[Math.floor(Math.random()*ids.length)];
  let b = ids[Math.floor(Math.random()*ids.length)];
  if(b === a){ b = ((b)%ids.length)+1; }
  el('#fromGen').value = a; el('#toGen').value = b;
  planRoute(); setupGame();
}

document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  el('#planBtn').addEventListener('click', () => { planRoute(); setupGame(); });
  el('#swapBtn').addEventListener('click', () => { onSwap(); });
  el('#randomize').addEventListener('click', randomize);
  el('#resetGame').addEventListener('click', setupGame);

  planRoute();
  setupGame();

  // Respect reduced motion for confetti triggers
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(media.matches){ window.confetti = ()=>{}; }
});
