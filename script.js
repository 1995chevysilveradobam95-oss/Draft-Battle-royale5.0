/* ======== CONFIG ======== */
const PLAYERS = [
  { name: "Kidd", img: "" },       // female warrior
  { name: "Neal", img: "" },
  { name: "Smith", img: "" },
  { name: "Wright", img: "" },
  { name: "Meeks", img: "" },
  { name: "Shrew", img: "" },
  { name: "Shinn", img: "" },
  { name: "Daughtry", img: "" },
  { name: "BB", img: "" },
  { name: "LB", img: "" },
];

// Weapons & kill lines
const WEAPONS = [
  "rusted machete","jagged scrap spear","spiked bat","sawed-off shotgun",
  "broken axe head","Molotov","heavy chain with hooks","crossbow",
  "cracked warhammer","dual chipped knives"
];

const KILLS = [
  (k,v,w)=>`${k} hacks ${v} apart with a ${w}, the dirt turning black with blood.`,
  (k,v,w)=>`${k} drives a ${w} through ${v}'s chest — a wet crunch and silence.`,
  (k,v,w)=>`${v} staggers, screaming, as ${k} sets them ablaze with a ${w}.`,
  (k,v,w)=>`${k} pulps ${v}'s skull with a ${w}; the ground doesn’t stop shaking.`,
  (k,v,w)=>`${k} pins ${v} to the wall with a ${w}, leaving them twitching.`,
  (k,v,w)=>`${v} runs — ${k} doesn’t. One swing of the ${w}. It’s over.`,
  (k,v,w)=>`${k}'s ${w} meets bone; ${v} drops like a sack of meat.`,
  (k,v,w)=>`${k} tears into ${v} with the ${w}, paint-spraying the ruins red.`
];

// Random background each load
(function pickBg(){
  const n = 1 + Math.floor(Math.random()*5);
  document.body.classList.add(`bg${n}`);
})();

/* ======== STATE ======== */
let alive = [];
let eliminated = [];
let running = false;

let speedMode = "normal"; // "normal" or "fast"
const SPEEDS = {
  normal:[3000,8000],
  fast:[1200,3000],
};

/* ======== DOM ======== */
const arenaEl = document.getElementById("arena");
const logEl   = document.getElementById("log");
const rankBoard = document.getElementById("finalBoard");
const rankList  = document.getElementById("rankList");
const speedBtn  = document.getElementById("speedBtn");
const resetBtn  = document.getElementById("resetBtn");

/* ======== INIT ======== */
function init() {
  running = false;
  alive = structuredClone(PLAYERS).map(p => ({
    ...p,
    weapon: WEAPONS[Math.floor(Math.random()*WEAPONS.length)],
    status: "alive"
  }));
  eliminated = [];
  logEl.innerHTML = "";
  rankBoard.hidden = true;
  rankList.innerHTML = "";
  renderArena();
  running = true;
  scheduleNext();
}

function renderArena(){
  arenaEl.innerHTML = "";
  alive.concat(eliminated).forEach(p=>{
    const card = document.createElement("div");
    card.className = `card ${p.status}`;
    card.innerHTML = `
      <img class="portrait" alt="${p.name}"
        src="${p.img || 'https://via.placeholder.com/320x180?text=Image+Coming'}" />
      <div class="label">
        <div><b>${p.name}${p.name==='Kidd'?' (F)':''}</b></div>
        <small>Weapon: ${p.weapon}</small>
      </div>
    `;
    arenaEl.appendChild(card);
  });
}

function logKill(html){
  const div = document.createElement("div");
  div.className = "entry kill";
  div.innerHTML = `☠ ${html}`;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

/* ======== ELIMINATION LOOP ======== */
function scheduleNext(){
  if(!running) return;
  if(alive.length <= 1){ return endGame(); }
  const [min,max] = SPEEDS[speedMode];
  const delay = Math.floor(Math.random()*(max-min+1))+min;
  setTimeout(nextElimination, delay);
}

function nextElimination(){
  if(alive.length <= 1){ return endGame(); }

  // Pick distinct killer & victim
  const kIdx = Math.floor(Math.random()*alive.length);
  let vIdx = Math.floor(Math.random()*alive.length);
  while(vIdx === kIdx){ vIdx = Math.floor(Math.random()*alive.length); }

  const killer = alive[kIdx];
  const victim = alive[vIdx];

  // Compose kill line
  const line = KILLS[Math.floor(Math.random()*KILLS.length)](killer.name, victim.name, killer.weapon);
  logKill(line);

  // Mark victim dead, animate card
  victim.status = "dead";
  // Move victim to eliminated (front -> last place earliest)
  alive.splice(vIdx,1);
  eliminated.unshift(victim);

  // Add splatter overlay on victim card
  // (re-render keeps order consistent; eliminated get grayscale/opacity)
  renderArena();
  const victimCard = arenaEl.querySelectorAll(".card.dead")[0];
  if(victimCard){
    const splat = document.createElement("div");
    splat.className = "splatter";
    victimCard.appendChild(splat);
  }

  scheduleNext();
}

/* ======== END GAME ======== */
function endGame(){
  running = false;
  if(alive.length === 1){
    const winner = alive[0];
    // Rankings: winner is 1st; eliminated array currently [10th ... 2nd]
    const finalOrder = [winner, ...eliminated];

    // Render final board reveal
    rankBoard.hidden = false;
    rankList.innerHTML = "";
    finalOrder.forEach((p, i)=>{
      const li = document.createElement("li");
      li.className = `rankItem ${i===0?'winnerRow':''}`;
      li.innerHTML = `
        <span class="rankNum">${i+1}${i===0?'st':i===1?'nd':i===2?'rd':'th'}</span>
        <img class="mini" src="${p.img || 'https://via.placeholder.com/44x44?text=?'}" alt="${p.name}">
        <span><b>${p.name}</b></span>
        ${i===0?'<span class="crown slam" title="Winner"></span>':''}
      `;
      rankList.appendChild(li);
      // staggered reveal
      setTimeout(()=>li.classList.add("reveal"), 80*i);
    });

    // Winner line
    const winLine = document.createElement("div");
    winLine.className = "entry";
    winLine.innerHTML = `🏆 <b>${winner.name}</b> stands alone — bloodied, unbroken, crowned in ruin.`;
    logEl.appendChild(winLine);
    logEl.scrollTop = logEl.scrollHeight;
  }
}

/* ======== CONTROLS ======== */
speedBtn.addEventListener("click", ()=>{
  speedMode = (speedMode === "normal") ? "fast" : "normal";
  speedBtn.textContent = `Speed: ${speedMode[0].toUpperCase()}${speedMode.slice(1)}`;
});

resetBtn.addEventListener("click", ()=>{
  init();
});

/* ======== START ======== */
init();
