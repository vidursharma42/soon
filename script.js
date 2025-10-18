windows.addEventListener('DOMContentLoaded', () => {

  const kissBtn = document.getElementById('kissBtn');
  const kissMsg = document.getElementById('kissMsg');

  kissBtn.addEventListener('click', () => {
    // show message
    kissMsg.textContent = 'Muah! 😘';
    kissMsg.style.display = 'inline-block';

    // optional: animate message fading out after 1.8s
    kissMsg.style.opacity = '1';
    kissMsg.style.transition = 'opacity 1.8s ease';
    setTimeout(() => {
      kissMsg.style.opacity = '0';
      setTimeout(() => {
        kissMsg.style.display = 'none';
      }, 1800);
    }, 1800);
  });
  
const openBtn = document.getElementById('openEnvelopeBtn');
const envelope = document.getElementById('envelope');

openBtn.addEventListener('click', () => {
  envelope.classList.toggle('open');

  // only try to play music if opening
  if(envelope.classList.contains('open')) {
    tryPlayMusic();
  }
});
  
/* -------------------- Starfield Background -------------------- */
const starCanvas = document.getElementById('starfield');
const sc = starCanvas.getContext('2d');

function resizeCanvas(){
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const stars = [];
const STAR_COUNT = Math.floor((window.innerWidth * window.innerHeight)/50000);
for(let i=0;i<STAR_COUNT;i++){
  stars.push({
    x: Math.random()*starCanvas.width,
    y: Math.random()*starCanvas.height,
    r: Math.random()*1.2 + 0.2,
    vx: (Math.random()-0.5)*0.05,
    vy: (Math.random()-0.5)*0.05,
    glow: Math.random()*0.9+0.1
  });
}
function drawStars(){
  sc.clearRect(0,0,starCanvas.width,starCanvas.height);
  for(const s of stars){
    s.x += s.vx;
    s.y += s.vy;
    if(s.x<0) s.x = starCanvas.width;
    if(s.x>starCanvas.width) s.x = 0;
    if(s.y<0) s.y = starCanvas.height;
    if(s.y>starCanvas.height) s.y = 0;

    const g = sc.createRadialGradient(s.x,s.y,s.r*0.2,s.x,s.y,s.r*8);
    g.addColorStop(0, 'rgba(255,255,255,'+ (0.85*s.glow) +')');
    g.addColorStop(0.6, 'rgba(176,166,255,'+ (0.06*s.glow) +')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    sc.fillStyle = g;
    sc.beginPath();
    sc.arc(s.x,s.y,s.r*3,0,Math.PI*2);
    sc.fill();
  }
  requestAnimationFrame(drawStars);
}
drawStars();

/* -------------------- Navigation smooth scroll -------------------- */
document.querySelectorAll('[data-goto]').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const id = btn.getAttribute('data-goto');
    document.getElementById(id).scrollIntoView({behavior:'smooth',block:'center'});
  });
});

/* -------------------- Envelope -------------------- */
const envelope = document.getElementById('envelope');
const openBtn = document.getElementById('openEnvelopeBtn');
openBtn.addEventListener('click', ()=> {
  envelope.classList.toggle('open');
  // try play music softly when envelope opens
  tryPlayMusic();
});

/* -------------------- Gallery modal -------------------- */
const gallery = document.getElementById('gallery');
const mediaModal = document.getElementById('mediaModal');
const modalInner = document.getElementById('modalInner');
const closeModal = document.getElementById('closeModal');

gallery.addEventListener('click', (e)=>{
  let el = e.target;
  // climb up to .thumb
  while(el && !el.classList.contains('thumb')) el = el.parentElement;
  if(!el) return;
  const src = el.dataset.src;
  const type = el.dataset.type;
  openMedia(src,type);
});

function openMedia(src,type){
  modalInner.innerHTML = '';
  if(type === 'video'){
    const v = document.createElement('video');
    v.src = src;
    v.controls = true;
    v.autoplay = true;
    v.style.maxWidth = '100%';
    modalInner.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.display = 'block';
    modalInner.appendChild(img);
  }
  mediaModal.classList.add('active');
  mediaModal.setAttribute('aria-hidden','false');
}
closeModal.addEventListener('click', ()=> {
  mediaModal.classList.remove('active');
  mediaModal.setAttribute('aria-hidden','true');
  modalInner.innerHTML = '';
});
mediaModal.addEventListener('click', (e)=> {
  if(e.target === mediaModal) {
    closeModal.click();
  }
});

/* -------------------- Game: Catch the hearts -------------------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeGame(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeGame();
window.addEventListener('resize', resizeGame);

let hearts = [];
let score = 0;
let gameRunning = false;
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startGameBtn');
const resetBtn = document.getElementById('resetGameBtn');
const gameWinMsg = document.getElementById('gameWinMsg');

function spawnHeart(){
  hearts.push({
    x: Math.random()*(canvas.width-40)+20,
    y: -20,
    vy: 1 + Math.random()*1.6,
    r: 14 + Math.random()*8,
    wob: Math.random()*0.02+0.01,
    t: Math.random()*Math.PI*2
  });
}
function drawHeart(x,y,r,angle,fill){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -r/3);
  ctx.bezierCurveTo(-r, -r*1.1, -r*1.2, r/2, 0, r);
  ctx.bezierCurveTo(r*1.2, r/2, r, -r*1.1, 0, -r/3);
  ctx.fillStyle = fill || '#ff99cc';
  ctx.fill();
  ctx.restore();
}

let catcher = {x:200, y:canvas.height-28, w:120};
canvas.addEventListener('mousemove', (e)=> {
  const rect = canvas.getBoundingClientRect();
  catcher.x = e.clientX - rect.left - catcher.w/2;
});
canvas.addEventListener('touchmove', (e)=> {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  catcher.x = t.clientX - rect.left - catcher.w/2;
}, {passive:true});

let spawnInterval;
function startGame(){
  if(gameRunning) return;
  score = 0; hearts = []; gameWinMsg.style.display='none';
  gameRunning = true;
  spawnInterval = setInterval(spawnHeart, 700);
  animateGame();
}
function resetGame(){
  gameRunning = false;
  clearInterval(spawnInterval);
  hearts = []; score=0;
  scoreEl.textContent = score;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  gameWinMsg.style.display='none';
}
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

function animateGame(){
  if(!gameRunning) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // draw catcher
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(catcher.x, canvas.height-36, catcher.w, 28);
  // draw hearts
  for(let i=hearts.length-1;i>=0;i--){
    const h = hearts[i];
    h.y += h.vy;
    h.t += h.wob;
    drawHeart(h.x + Math.sin(h.t)*6, h.y, h.r, Math.sin(h.t)*0.4);
    // collision
    if(h.y + h.r > canvas.height-36){
      if(h.x > catcher.x-10 && h.x < catcher.x + catcher.w + 10){
        // caught
        hearts.splice(i,1); score += 1; scoreEl.textContent = score;
        // small spark
        for(let s=0;s<5;s++){
          // ignored transient particles for simplicity
        }
        if(score >= 15){
          // win
          endGameWin();
          return;
        }
      } else if(h.y > canvas.height + 60) {
        hearts.splice(i,1);
      }
    }
  }

  requestAnimationFrame(animateGame);
}

function endGameWin(){
  gameRunning = false;
  clearInterval(spawnInterval);
  gameWinMsg.style.display = 'block';
  gameWinMsg.textContent = "You caught my heart! ❤ Rest now, my love.";
  // gentle confetti hearts
  // small animation: create floating message
  const el = document.createElement('div');
  el.style.position='fixed';
  el.style.left='50%'; el.style.top='40%'; el.style.transform='translate(-50%,-50%)';
  el.style.padding='12px 18px'; el.style.borderRadius='12px'; el.style.background='linear-gradient(90deg,#ffd1e8,#b0a6ff)';
  el.style.color='#111'; el.style.zIndex=60; el.style.fontWeight='700';
  el.textContent = 'You won my heart 💘';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2800);
}

/* -------------------- Music controls & autoplay handling -------------------- */
const bgMusic = document.getElementById('bgMusic');
const playPauseAudio = document.getElementById('playPauseAudio');
const volume = document.getElementById('volume');
const audioToggle = document.getElementById('audioToggle');
const audioOnBtn = document.getElementById('audioOnBtn');
const audioOffBtn = document.getElementById('audioOffBtn');
const currentTrack = document.getElementById('currentTrack');

currentTrack.textContent = 'Be my baby!';

bgMusic.volume = 0.6;
volume.addEventListener('input', ()=> bgMusic.volume = volume.value);

playPauseAudio.addEventListener('click', ()=>{
  if(bgMusic.paused) { bgMusic.play().catch(()=> showAudioToggle()); }
  else { bgMusic.pause(); }
});

function showAudioToggle(){
  audioToggle.style.display = 'flex';
}

audioOnBtn.addEventListener('click', ()=> {
  bgMusic.play().then(()=> {
    audioToggle.style.display = 'none';
  }).catch(()=> {
    alert('Browser prevented autoplay. Please tap Play.');
  });
});
audioOffBtn.addEventListener('click', ()=> {
  bgMusic.pause();
  audioToggle.style.display = 'none';
});

function tryPlayMusic(){
  // attempt autoplay (may fail because of browser policy)
  bgMusic.play().catch(()=> {
    // show a subtle UI to enable
    showAudioToggle();
  });
}
// initial attempt
tryPlayMusic();

/* -------------------- Notes interactions -------------------- */
document.querySelectorAll('[data-note]').forEach(n=>{
  n.addEventListener('click', ()=>{
    // make it drop and rotate and fade out
    n.style.transition = 'transform 1s ease, opacity 1s ease';
    n.style.transform = 'translateY(140vh) rotate(40deg)';
    n.style.opacity = '0';
    setTimeout(()=>n.remove(),1100);
  });
});

document.getElementById('addNoteBtn').addEventListener('click', ()=> {
  const wrap = document.getElementById('notesWrap');
  const div = document.createElement('div');
  div.className = 'sticky';
  div.dataset.note = '';
  div.innerHTML = '<p>I Loveee Youuuu!</p>';
  wrap.appendChild(div);
  // auto scroll to it
  div.scrollIntoView({behavior:'smooth',block:'center'});
  // attach click
  div.addEventListener('click', ()=> {
    div.style.transition = 'transform 1s ease, opacity 1s ease';
    div.style.transform = 'translateY(140vh) rotate(40deg)';
    div.style.opacity = '0';
    setTimeout(()=>div.remove(),1100);
  });
});

/* -------------------- Wishes floating -------------------- */
const wishes = ["Get well soon ❤","You are my sunshine","Rest, my love","I miss you!!","I'm here for you","Oliver loves you✨"];
const wishesArea = document.getElementById('wishesArea');
function spawnWish(i){
  const w = document.createElement('div');
  w.className = 'wish';
  w.textContent = wishes[i % wishes.length];
  const left = Math.random()*80;
  const top = 10 + Math.random()*80;
  w.style.left = left + '%';
  w.style.top = top + 'px';
  if(Math.random()>0.6) w.classList.add('small');
  wishesArea.appendChild(w);
  // animate drifting
  const dur = 8000 + Math.random()*9000;
  w.animate([{transform:'translateY(0px)'},{transform:'translateY(-40px)'}],{duration:dur,iterations:Infinity,direction:'alternate'});
}
for(let i=0;i<6;i++) spawnWish(i);

/* -------------------- Constellation drawing (ending) -------------------- */
const constEl = document.getElementById('constellation');
constEl.innerHTML = '<canvas id="constCanvas" width="260" height="160" style="width:100%;height:100%"></canvas>';
const constCanvas = document.getElementById('constCanvas');
const cc = constCanvas.getContext('2d');
function drawConst(){
  constCanvas.width = constEl.clientWidth;
  constCanvas.height = constEl.clientHeight;
  cc.clearRect(0,0,constCanvas.width,constCanvas.height);
  // random star points
  const pts = [];
  for(let i=0;i<8;i++){
    pts.push([20+Math.random()(constCanvas.width-40),20+Math.random()(constCanvas.height-40)]);
  }
  cc.strokeStyle = 'rgba(255,255,255,0.12)';
  cc.fillStyle = 'rgba(255,255,255,0.9)';
  for(let i=0;i<pts.length;i++){
    const [x,y] = pts[i];
    cc.beginPath();cc.arc(x,y,2.5,0,Math.PI*2);cc.fill();
    if(i>0){
      cc.beginPath();cc.moveTo(pts[i-1][0],pts[i-1][1]);cc.lineTo(x,y);cc.stroke();
    }
  }
}
drawConst();
window.addEventListener('resize', drawConst);

/* -------------------- Ending kiss button -------------------- */
document.getElementById('kissBtn').addEventListener('click', ()=> {
  const k = document.createElement('div');
  k.style.position='fixed';
  k.style.left='50%'; k.style.top='50%';
  k.style.transform='translate(-50%,-50%)';
  k.style.padding='18px'; k.style.borderRadius='18px';
  k.style.background='linear-gradient(90deg,#ff9ecd,#ffd1e8)';
  k.style.color='#111'; k.style.fontWeight='800'; k.style.zIndex=80;
  k.textContent='Muah! 😘';
  document.body.appendChild(k);
  setTimeout(()=>k.remove(),1800);
});

/* -------------------- Small helpers -------------------- */
/* When anchor to play game is clicked, scroll */
document.getElementById('playGameAnchor').addEventListener('click', ()=> {
  document.getElementById('game').scrollIntoView({behavior:'smooth', block:'center'});
});

/* Invite user to replace placeholders */
console.log("Replace placeholders: music-placeholder.mp3, images/, videos/, and edit the letter in #letterText.");
});





