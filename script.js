// --- CONFIGURAZIONE ---
const BIRTHDAY = "09/12";
let pageHistory = [100];

// --- OROLOGIO ---
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString('it-CH');
}, 1000);

// --- COUNTDOWN COMPLEANNO ---
function updateCountdown() {
    const now = new Date();
    let year = now.getFullYear();
    let bday = new Date(`${year}/${BIRTHDAY} 00:00:00`);
    if (now > bday) bday = new Date(`${year + 1}/${BIRTHDAY} 00:00:00`);
    const diff = bday - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('countdown').innerText = `- ${days} GG ${hours} H AL COMPLEANNO`;
}
setInterval(updateCountdown, 60000); updateCountdown();

// --- BTC LIVE (Binance API - Veloce e Stabile) ---
async function fetchBTC() {
    try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const d = await r.json();
        // Arrotonda per estetica retro
        let price = parseFloat(d.price).toFixed(0); 
        document.getElementById('btc-price').innerText = `$ ${Number(price).toLocaleString()}`;
    } catch { 
        // Silenzioso o vecchio prezzo se fallisce
    }
}
fetchBTC(); setInterval(fetchBTC, 5000); // Aggiorna ogni 5 secondi

// --- NAVIGAZIONE ---
function navigate(pageId) {
    if (pageHistory[pageHistory.length - 1] !== pageId) pageHistory.push(pageId);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('p' + pageId).classList.add('active');
    // Scroll to top
    document.getElementById('screen-content').scrollTop = 0;
    if (pageId !== 400) stopGame();
}

function goBack() {
    if (activeGame) { stopGame(); return; }
    if (pageHistory.length > 1) {
        pageHistory.pop();
        const prevPage = pageHistory[pageHistory.length - 1];
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('p' + prevPage).classList.add('active');
        if (prevPage !== 400) stopGame();
    }
}

// --- GESTIONE MODAL & REAZIONI ---
function openImage(src, title) {
    const modal = document.getElementById('img-modal');
    document.getElementById('modal-img').src = src;
    document.getElementById('modal-title').innerText = title;
    
    // Reset pulsanti
    resetReactionButtons();
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('img-modal').classList.add('hidden');
}

function resetReactionButtons() {
    document.getElementById('btn-like').innerHTML = '[ <span class="heart">♥</span> LIKE ]';
    document.getElementById('btn-like').style.background = "transparent";
    document.getElementById('btn-like').style.color = "white";
    
    document.getElementById('btn-dislike').innerHTML = '[ DISLIKE ]';
    document.getElementById('btn-dislike').style.background = "transparent";
    document.getElementById('btn-dislike').style.color = "white";
}

function handleReaction(type) {
    const likeBtn = document.getElementById('btn-like');
    const dislikeBtn = document.getElementById('btn-dislike');

    // Reset entrambi prima
    resetReactionButtons();

    if (type === 'like') {
        likeBtn.innerHTML = '[ <span style="color:red">♥</span> LIKED ]';
        likeBtn.style.background = "white";
        likeBtn.style.color = "black";
    } else if (type === 'dislike') {
        dislikeBtn.innerHTML = '[ ☹ SAD ]';
        dislikeBtn.style.background = "red";
        dislikeBtn.style.color = "white";
    }
}

// --- SELF DESTRUCT ---
function triggerSelfDestruct() {
    const overlay = document.getElementById('destruct-overlay');
    const wrapper = document.getElementById('main-wrapper');
    const noise = document.getElementById('signal-noise');
    const tvOff = document.getElementById('tv-off-effect');
    
    overlay.classList.remove('hidden');
    let count = 5;
    overlay.innerText = count;
    
    const countInt = setInterval(() => {
        count--;
        overlay.innerText = count;
        if(count <= 0) {
            clearInterval(countInt);
            overlay.classList.add('hidden');
            const children = wrapper.children;
            for(let c of children) {
                c.classList.add('crashing');
                c.style.transform = `rotate(${(Math.random()-0.5)*20}deg)`;
            }
            setTimeout(() => { wrapper.style.opacity = 0; noise.classList.remove('hidden'); }, 600);
            setTimeout(() => { noise.classList.add('hidden'); tvOff.classList.remove('hidden'); }, 1500);
            setTimeout(() => { location.reload(); }, 3000);
        }
    }, 1000);
}

// --- GIOCHI ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameInterval;
let activeGame = null;

// Gestione Controlli Mobile
const mobileControls = document.getElementById('mobile-controls');
function toggleMobileControls(show) {
    // Mostra solo se lo schermo è piccolo (mobile)
    if(window.innerWidth <= 768) {
        mobileControls.style.display = show ? 'block' : 'none';
    }
}

// NUOVO SISTEMA POPUP GIOCO
function showGameAlert(msg, color='red') {
    clearInterval(gameInterval); // Ferma il gioco
    const overlay = document.getElementById('game-msg-overlay');
    const text = document.getElementById('game-msg-text');
    text.innerText = msg;
    text.style.color = color;
    overlay.classList.remove('hidden');
}

function closeGameMsg() {
    document.getElementById('game-msg-overlay').classList.add('hidden');
    stopGame(); // Torna al menu
}

function stopGame() {
    clearInterval(gameInterval);
    activeGame = null;
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-menu-screen').classList.remove('hidden');
    document.querySelectorAll('.game-stats').forEach(el => el.style.display = 'none');
    toggleMobileControls(false);
    document.getElementById('game-msg-overlay').classList.add('hidden'); // Sicurezza
}

function startGame(gameName) {
    document.getElementById('game-menu-screen').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    document.getElementById('active-game-title').innerText = gameName.toUpperCase();
    setTimeout(() => { document.getElementById('game-area').scrollIntoView({behavior: 'smooth', block: 'center'}); }, 100);
    activeGame = gameName;
    clearInterval(gameInterval);
    toggleMobileControls(true);
    
    if(gameName === 'snake') initSnake();
    if(gameName === 'pong') initPong();
    if(gameName === 'space') initSpaceInvaders();
    if(gameName === 'tetris') initTetris();
}

window.addEventListener("keydown", function(e) {
    if(activeGame && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
});

// SIMULAZIONE PRESSIONE TASTI PER MOBILE
function simulateKey(key) {
    const event = new KeyboardEvent('keydown', {'key': key});
    document.dispatchEvent(event);
}

// Event Listeners per i bottoni touch
document.getElementById('btn-up').addEventListener('touchstart', (e) => { e.preventDefault(); simulateKey('ArrowUp'); });
document.getElementById('btn-down').addEventListener('touchstart', (e) => { e.preventDefault(); simulateKey('ArrowDown'); });
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); simulateKey('ArrowLeft'); });
document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); simulateKey('ArrowRight'); });
document.getElementById('btn-action').addEventListener('touchstart', (e) => { e.preventDefault(); simulateKey(' '); });


// SNAKE
function initSnake() {
    let gridSize=20, tileCount=canvas.width/gridSize, px=10, py=10, vx=0, vy=0, trail=[], tail=5, ax=15, ay=15, lvx=0, lvy=0;
    
    function loop() {
        px+=vx; py+=vy; lvx=vx; lvy=vy;
        if(px<0||px>=tileCount||py<0||py>=canvas.height/gridSize) { 
            showGameAlert("GAME OVER"); return; 
        }
        ctx.fillStyle="black"; ctx.fillRect(0,0,600,400); ctx.fillStyle="lime";
        for(let t of trail) { 
            ctx.fillRect(t.x*gridSize,t.y*gridSize,18,18); 
            if(t.x==px&&t.y==py&&(vx!=0||vy!=0)){ showGameAlert("GAME OVER"); return;}
        }
        trail.push({x:px,y:py}); while(trail.length>tail) trail.shift();
        if(ax==px&&ay==py) { tail++; ax=Math.floor(Math.random()*tileCount); ay=Math.floor(Math.random()*(canvas.height/gridSize)); }
        ctx.fillStyle="red"; ctx.fillRect(ax*gridSize,ay*gridSize,18,18);
    }
    
    document.addEventListener("keydown", k => {
        if(activeGame!='snake') return;
        if(k.key=="ArrowLeft"&&lvx!=1){vx=-1;vy=0;} if(k.key=="ArrowUp"&&lvy!=1){vx=0;vy=-1;}
        if(k.key=="ArrowRight"&&lvx!=-1){vx=1;vy=0;} if(k.key=="ArrowDown"&&lvy!=-1){vx=0;vy=1;}
    });
    gameInterval=setInterval(loop,100);
}

// PONG
function initPong() {
    document.getElementById('pong-stats').style.display='block';
    let bx=300, by=200, bvx=4, bvy=4, py1=150, py2=150, hits=0;
    
    function loop() {
        bx+=bvx; by+=bvy; if(by<0||by>400) bvy=-bvy;
        if(bx<15) { 
            if(by>py1&&by<py1+80) { 
                bvx=-bvx; hits++; 
                if(hits>3&&hits<=20) {bvx*=1.05;bvy*=1.05;} 
                if(Math.abs(bvx)>15) bvx=Math.sign(bvx)*15; 
                document.getElementById('speed-display').innerText=Math.round(Math.abs(bvx)); 
            } else { 
                showGameAlert("HAI PERSO!", "red"); return; 
            } 
        }
        if(bx>585) { 
            if(by>py2&&by<py2+80) bvx=-bvx; else { bx=300; bvx=-4; } 
        }
        let c=py2+40; if(c<by-35) py2+=(hits>15?9:6); else if(c>by+35) py2-=(hits>15?9:6);
        ctx.fillStyle="black"; ctx.fillRect(0,0,600,400); ctx.fillStyle="white"; 
        ctx.fillRect(5,py1,10,80); ctx.fillRect(585,py2,10,80); ctx.fillRect(bx-5,by-5,10,10);
    }
    
    document.addEventListener("keydown", k => { 
        if(activeGame=='pong'){ 
            if(k.key=="ArrowUp") py1-=25; 
            if(k.key=="ArrowDown") py1+=25; 
            py1=Math.max(0,Math.min(320,py1)); 
        }
    });
    gameInterval=setInterval(loop,30);
}

// SPACE INVADERS
function initSpaceInvaders() {
    document.getElementById('space-stats').style.display='block';
    let px=285, bulls=[], als=[], sc=0, ad=1, ls=0;
    for(let r=0;r<4;r++) for(let c=0;c<8;c++) als.push({x:50+c*50, y:30+r*30, alive:true});
    
    function loop() {
        ctx.fillStyle="black"; ctx.fillRect(0,0,600,400); ctx.fillStyle="cyan"; 
        ctx.fillRect(px,370,30,10); ctx.fillRect(px+10,365,10,5);
        ctx.fillStyle="white"; 
        for(let i=bulls.length-1;i>=0;i--) { 
            bulls[i].y-=7; ctx.fillRect(bulls[i].x,bulls[i].y,4,10); 
            if(bulls[i].y<0) bulls.splice(i,1); 
        }
        let he=false, ac=0; ctx.fillStyle="lime";
        for(let a of als) {
            if(!a.alive) continue; ac++; a.x+=2*ad; ctx.fillRect(a.x,a.y,30,20);
            if(a.x>570||a.x<0) he=true; 
            if(a.y>360) { showGameAlert("INVADERS WON!", "red"); return; }
            for(let j=bulls.length-1;j>=0;j--) { 
                let b=bulls[j]; 
                if(b.x>a.x&&b.x<a.x+30&&b.y>a.y&&b.y<a.y+20) { 
                    a.alive=false; bulls.splice(j,1); sc+=100; 
                    document.getElementById('space-score').innerText=sc; 
                } 
            }
        }
        if(he) { ad*=-1; for(let a of als) a.y+=20; } 
        if(ac==0) { showGameAlert("YOU WIN!", "lime"); return; }
    }
    
    document.addEventListener("keydown", k => { 
        if(activeGame=='space') { 
            if(k.key=="ArrowLeft") px=Math.max(0,px-15); 
            if(k.key=="ArrowRight") px=Math.min(570,px+15); 
            if(k.key==" "&&Date.now()-ls>400) { bulls.push({x:px+13,y:370}); ls=Date.now(); } 
        }
    });
    gameInterval=setInterval(loop,30);
}

// TETRIS
function initTetris() {
    document.getElementById('tetris-stats').style.display='block';
    const ROWS=20, COLS=10, SIZE=20, OFFX=200;
    let board=Array(ROWS).fill().map(()=>Array(COLS).fill(0)), score=0, dc=0, lt=0;
    const SH=[[[1,1,1,1]],[[1,1],[1,1]],[[1,1,1],[0,1,0]],[[1,1,1],[1,0,0]],[[1,1,1],[0,0,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
    const CL=[null,'cyan','yellow','purple','orange','blue','green','red'];
    let p=np();
    
    function np() { const i=Math.floor(Math.random()*SH.length); return {m:SH[i], p:{x:3,y:0}, c:CL[i+1]}; }
    function coll(b,pl) { for(let y=0;y<pl.m.length;++y) for(let x=0;x<pl.m[y].length;++x) if(pl.m[y][x]!=0&&(b[y+pl.p.y]&&b[y+pl.p.y][x+pl.p.x])!=0) return true; return false; }
    
    function draw() {
        ctx.fillStyle='#000'; ctx.fillRect(0,0,600,400);
        for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(board[y][x]) { ctx.fillStyle=board[y][x]; ctx.fillRect(OFFX+x*SIZE,y*SIZE,19,19); }
        p.m.forEach((r,y)=>r.forEach((v,x)=>{if(v){ctx.fillStyle=p.c;ctx.fillRect(OFFX+(x+p.p.x)*SIZE,(y+p.p.y)*SIZE,19,19);}}));
        ctx.strokeStyle='white'; ctx.strokeRect(OFFX,0,COLS*SIZE,ROWS*SIZE);
    }
    
    function pd() { 
        p.p.y++; 
        if(coll(board,p)) { 
            p.p.y--; p.m.forEach((r,y)=>r.forEach((v,x)=>{if(v)board[y+p.p.y][x+p.p.x]=p.c;})); 
            for(let y=ROWS-1;y>0;--y){ 
                let full=true; for(let x=0;x<COLS;++x) if(board[y][x]==0) full=false; 
                if(full) { 
                    board.splice(y,1)[0].fill(0); board.unshift(Array(COLS).fill(0)); score++; 
                    document.getElementById('tetris-score').innerText=score; ++y; 
                }
            }
            p=np(); 
            if(coll(board,p)) { 
                showGameAlert("GAME OVER"); return; 
            } 
        } dc=0; 
    }
    
    function upd(t=0) { 
        if(activeGame!='tetris') return; 
        const dt=t-lt; lt=t; dc+=dt; 
        if(dc>1000) pd(); 
        draw(); 
        requestAnimationFrame(upd); 
    }
    
    document.addEventListener('keydown', e => { 
        if(activeGame!='tetris') return; 
        if(e.key=='ArrowLeft') { p.p.x--; if(coll(board,p)) p.p.x++; }
        if(e.key=='ArrowRight') { p.p.x++; if(coll(board,p)) p.p.x--; }
        if(e.key=='ArrowDown') pd();
        if(e.key=='ArrowUp') { const rot=m=>m[0].map((v,i)=>m.map(r=>r[i]).reverse()); const old=p.m; p.m=rot(p.m); if(coll(board,p)) p.m=old; }
    }); 
    upd();
}

// CASINO
let cr=1000;
function spinSlot() { if(cr<10) return alert("NO CREDITS"); cr-=10; updC(); const s=["7","BAR","🍒","💎"]; let [s1,s2,s3]=[0,0,0].map(()=>s[Math.floor(Math.random()*4)]); document.getElementById('slot1').innerText=s1; document.getElementById('slot2').innerText=s2; document.getElementById('slot3').innerText=s3; if(s1==s2&&s2==s3) { cr+=200; alert("JACKPOT!"); updC(); } }
function spinRoulette() { const d=document.querySelector('.roulette-number'), b=document.getElementById('btn-spin'); b.disabled=true; b.innerText="..."; let c=0; const i=setInterval(()=>{ let n=Math.floor(Math.random()*37); d.innerText=n; d.style.color=n==0?'green':(n%2==0?'white':'red'); if(++c>20) { clearInterval(i); b.disabled=false; b.innerText="GIRA"; } },50); }
function updC() { document.getElementById('credits-display').innerText=`CREDITI: ${cr} CHF`; }