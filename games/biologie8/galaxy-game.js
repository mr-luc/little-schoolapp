// Bio-Galaxy: Mini-Weltraum-Schießspiel für Little Biologie
// Version 2: einfachere Steuerung mit Auto-Schuss und Finger-/Maussteuerung
(function(){
  const ROUNDS=[
    {name:'Zellen',task:'Triff nur Begriffe, die zur Zelle passen.',good:['Zelle','Zellkern','Zellmembran','Zellplasma','Zellwand','Vakuole','Chloroplast','Mitochondrium'],bad:['Herz','Blutdruck','Nahrungskette','Immunsystem','Lunge','Reflex']},
    {name:'Stoffwechsel',task:'Triff nur Begriffe, die zu Fotosynthese, Verdauung oder Zellatmung passen.',good:['Fotosynthese','Sauerstoff','Zucker','Nährstoff','Verdauung','Zellatmung','Energie'],bad:['Skelett','Auge','Antikörper','Blutdruck','Nerv','Haut']},
    {name:'Atmung & Kreislauf',task:'Triff nur Begriffe aus Atmung und Blutkreislauf.',good:['Herz','Blut','Lunge','Atemweg','Gasaustausch','Blutkreislauf','Sauerstofftransport'],bad:['Chloroplast','Zellwand','Nahrungskette','Insulin','Vakuole','Produzent']},
    {name:'Nerven & Hormone',task:'Triff nur Begriffe, die mit Reizverarbeitung oder Hormonen zu tun haben.',good:['Reiz','Sinnesorgan','Auge','Nervenzelle','Nervensystem','Reflex','Hormon','Insulin'],bad:['Pilz','Totes Material','Zucker','Skelett','Lungenbläschen','Zellwand']},
    {name:'Immun & Ökologie',task:'Triff nur Begriffe aus Immunsystem oder Ökologie.',good:['Immunsystem','Impfung','Antikörper','Virus','Bakterium','Ökosystem','Produzent','Destruent'],bad:['Zellplasma','Herzfrequenz','Mitochondrium','Blutdruck','Auge','Muskel']}
  ];
  const ROUND_SECONDS=40;
  const TARGET_SCORE=7;
  const REWARD_WIN=8;
  const REWARD_OK=4;
  const HIT_POINTS=1;
  const MISS_PENALTY=1;
  const AUTO_SHOOT_MS=430;

  let modal,field,ship,scoreBox,livesBox,timeBox,taskBox,resultBox,startLayer;
  let leftBtn,rightBtn,shootBtn,closeBtn;
  let running=false,roundIndex=0,score=0,lives=3,timeLeft=ROUND_SECONDS,shipX=50,moveDir=0;
  let words=[],shots=[],lastSpawn=0,lastShot=0,lastAutoShot=0,lastTick=0,raf=null,timer=null;

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function rand(min,max){return Math.random()*(max-min)+min;}
  function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

  function ensureModal(){
    if(modal)return;
    modal=document.createElement('div');
    modal.className='galaxy-modal';
    modal.innerHTML='<div class="galaxy-card"><button class="galaxy-close" type="button">×</button><h2>🚀 Bio-Galaxy</h2><div class="galaxy-info"><span class="galaxy-pill" id="galaxyScore">Treffer: 0</span><span class="galaxy-pill" id="galaxyLives">❤️❤️❤️</span><span class="galaxy-pill" id="galaxyTime">40 s</span><div class="galaxy-task" id="galaxyTask"></div></div><div class="galaxy-field" id="galaxyField"><div class="galaxy-start" id="galaxyStart"><div class="galaxy-start-box"><h3>🚀 Bio-Galaxy: Rettet die Zelle!</h3><p>Das Schiff schießt automatisch. Bewege es mit Finger, Maus oder Pfeiltasten. Du musst nur noch richtig zielen.</p><button id="galaxyStartBtn" type="button">Mission starten</button></div></div><div class="galaxy-ship" id="galaxyShip">🚀</div></div><div class="galaxy-controls"><button id="galaxyLeft" type="button">⬅️</button><button id="galaxyShoot" class="shoot" type="button">🔥 Extra-Schuss</button><button id="galaxyRight" type="button">➡️</button></div><div class="galaxy-result" id="galaxyResult">Triff pro Runde mindestens 7 passende Begriffe.</div><div class="galaxy-legend">Tipp: Auf iPad/iPhone einfach im Spielfeld den Finger bewegen. Das Schiff folgt dir und schießt automatisch.</div></div>';
    document.body.appendChild(modal);
    field=document.getElementById('galaxyField');
    ship=document.getElementById('galaxyShip');
    scoreBox=document.getElementById('galaxyScore');
    livesBox=document.getElementById('galaxyLives');
    timeBox=document.getElementById('galaxyTime');
    taskBox=document.getElementById('galaxyTask');
    resultBox=document.getElementById('galaxyResult');
    startLayer=document.getElementById('galaxyStart');
    leftBtn=document.getElementById('galaxyLeft');
    rightBtn=document.getElementById('galaxyRight');
    shootBtn=document.getElementById('galaxyShoot');
    closeBtn=modal.querySelector('.galaxy-close');
    document.getElementById('galaxyStartBtn').onclick=startRound;
    closeBtn.onclick=closeGame;
    modal.addEventListener('click',function(e){if(e.target===modal)closeGame();});
    bindControls();
  }

  function moveShipToPointer(e){
    if(!running)return;
    const rect=field.getBoundingClientRect();
    shipX=clamp(((e.clientX-rect.left)/rect.width)*100,6,94);
    updateShip();
  }

  function bindControls(){
    function hold(btn,dir){
      btn.addEventListener('pointerdown',function(e){e.preventDefault();moveDir=dir;btn.setPointerCapture&&btn.setPointerCapture(e.pointerId);});
      btn.addEventListener('pointerup',function(){if(moveDir===dir)moveDir=0;});
      btn.addEventListener('pointercancel',function(){if(moveDir===dir)moveDir=0;});
      btn.addEventListener('pointerleave',function(){if(moveDir===dir)moveDir=0;});
    }
    hold(leftBtn,-1);hold(rightBtn,1);
    shootBtn.addEventListener('pointerdown',function(e){e.preventDefault();shoot(false);});
    field.addEventListener('pointerdown',function(e){moveShipToPointer(e);});
    field.addEventListener('pointermove',function(e){moveShipToPointer(e);});
    document.addEventListener('keydown',function(e){
      if(!modal||!modal.classList.contains('show'))return;
      if(e.key==='ArrowLeft')moveDir=-1;
      if(e.key==='ArrowRight')moveDir=1;
      if(e.key===' '||e.key==='Spacebar'){e.preventDefault();shoot(false);}
    });
    document.addEventListener('keyup',function(e){
      if(e.key==='ArrowLeft'&&moveDir<0)moveDir=0;
      if(e.key==='ArrowRight'&&moveDir>0)moveDir=0;
    });
  }

  function openGame(){
    ensureModal();
    modal.classList.add('show');
    roundIndex=0;
    resetRoundState();
    showStart();
  }

  function closeGame(){
    stopLoops();
    if(modal)modal.classList.remove('show');
  }

  function resetRoundState(){
    score=0;lives=3;timeLeft=ROUND_SECONDS;shipX=50;moveDir=0;lastSpawn=0;lastShot=0;lastAutoShot=0;lastTick=0;
    words.forEach(w=>w.el.remove());shots.forEach(s=>s.el.remove());words=[];shots=[];
    updateHud();updateShip();
    const round=ROUNDS[roundIndex%ROUNDS.length];
    taskBox.textContent='Runde '+(roundIndex+1)+'/'+ROUNDS.length+' · '+round.name+': '+round.task;
    resultBox.textContent='Triff mindestens '+TARGET_SCORE+' passende Begriffe. Runde geschafft: '+REWARD_OK+' Münzen, perfekt: '+REWARD_WIN+' Münzen.';
  }

  function showStart(){
    startLayer.style.display='grid';
    const box=startLayer.querySelector('.galaxy-start-box');
    const round=ROUNDS[roundIndex%ROUNDS.length];
    box.innerHTML='<h3>🚀 Runde '+(roundIndex+1)+': '+round.name+'</h3><p>'+round.task+'</p><p><b>Neue Steuerung:</b> Das Schiff schießt automatisch. Ziehe es mit dem Finger oder der Maus unter die passenden Begriffe.</p><button id="galaxyStartBtn" type="button">Mission starten</button>';
    document.getElementById('galaxyStartBtn').onclick=startRound;
  }

  function startRound(){
    resetRoundState();
    startLayer.style.display='none';
    running=true;
    timer=setInterval(function(){
      timeLeft--;
      updateHud();
      if(timeLeft<=0)finishRound();
    },1000);
    raf=requestAnimationFrame(loop);
  }

  function stopLoops(){
    running=false;
    if(raf)cancelAnimationFrame(raf);
    if(timer)clearInterval(timer);
    raf=null;timer=null;
  }

  function updateHud(){
    scoreBox.textContent='Treffer: '+score+' / '+TARGET_SCORE;
    livesBox.textContent='❤️'.repeat(Math.max(0,lives))+'🖤'.repeat(Math.max(0,3-lives));
    timeBox.textContent=Math.max(0,timeLeft)+' s';
  }

  function updateShip(){ship.style.left=shipX+'%';}

  function spawnWord(){
    const round=ROUNDS[roundIndex%ROUNDS.length];
    const good=Math.random()<0.64;
    const text=good?pick(round.good):pick(round.bad);
    const el=document.createElement('div');
    el.className='galaxy-word '+(good?'good':'bad');
    el.textContent=text;
    const x=rand(4,82),speed=rand(0.038,0.062)+(roundIndex*0.003);
    el.style.left=x+'%';
    field.appendChild(el);
    words.push({el,text,good,x,y:-12,speed});
  }

  function shoot(auto){
    if(!running)return;
    const now=performance.now();
    if(auto){
      if(now-lastAutoShot<AUTO_SHOOT_MS)return;
      lastAutoShot=now;
    }else{
      if(now-lastShot<220)return;
    }
    lastShot=now;
    const el=document.createElement('div');
    el.className='galaxy-shot';
    el.style.left='calc('+shipX+'% - 3px)';
    el.style.bottom='58px';
    field.appendChild(el);
    shots.push({el,x:shipX,y:82,speed:0.28});
  }

  function loop(ts){
    if(!running)return;
    if(!lastTick)lastTick=ts;
    const dt=Math.min(34,ts-lastTick);
    lastTick=ts;
    if(moveDir){shipX=clamp(shipX+moveDir*dt*0.052,6,94);updateShip();}
    shoot(true);
    if(ts-lastSpawn>900){spawnWord();lastSpawn=ts;}
    updateObjects(dt);
    raf=requestAnimationFrame(loop);
  }

  function rectsHit(a,b){
    const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
    return ar.left<br.right&&ar.right>br.left&&ar.top<br.bottom&&ar.bottom>br.top;
  }

  function updateObjects(dt){
    words.forEach(w=>{w.y+=w.speed*dt;w.el.style.top=w.y+'%';});
    shots.forEach(s=>{s.y-=s.speed*dt;s.el.style.bottom=s.y+'%';});
    for(let i=words.length-1;i>=0;i--){
      const w=words[i];
      if(w.y>103){
        if(w.good){lives--;resultBox.textContent='Ein passender Begriff ist durchgekommen: '+w.text+' · -1 Leben';}
        w.el.remove();words.splice(i,1);updateHud();continue;
      }
      for(let j=shots.length-1;j>=0;j--){
        const s=shots[j];
        if(rectsHit(w.el,s.el)){
          hitWord(w);s.el.remove();shots.splice(j,1);w.el.remove();words.splice(i,1);break;
        }
      }
    }
    for(let j=shots.length-1;j>=0;j--){if(shots[j].y<0){shots[j].el.remove();shots.splice(j,1);}}
    if(lives<=0)finishRound();
  }

  function hitWord(w){
    if(w.good){
      score+=HIT_POINTS;
      resultBox.textContent='✅ Treffer: '+w.text;
    }else{
      lives-=MISS_PENALTY;
      resultBox.textContent='❌ Falscher Treffer: '+w.text+' · -1 Leben';
    }
    w.el.classList.add('galaxy-hit');
    updateHud();
    if(score>=TARGET_SCORE)finishRound();
  }

  function finishRound(){
    if(!running)return;
    stopLoops();
    words.forEach(w=>w.el.remove());shots.forEach(s=>s.el.remove());words=[];shots=[];
    const won=score>=TARGET_SCORE&&lives>0;
    const reward=won?(lives===3?REWARD_WIN:REWARD_OK):0;
    if(reward&&window.BioCoins)window.BioCoins.add(reward);
    startLayer.style.display='grid';
    const box=startLayer.querySelector('.galaxy-start-box');
    if(won){
      const final=roundIndex>=ROUNDS.length-1;
      box.innerHTML='<h3>🏆 Runde geschafft!</h3><p>Treffer: <b>'+score+'</b> · Leben: <b>'+lives+'</b></p><p>Belohnung: <b>+'+reward+' Münzen</b></p><button id="galaxyStartBtn" type="button">'+(final?'Neu starten':'Nächste Runde')+'</button>';
      roundIndex=final?0:roundIndex+1;
    }else{
      box.innerHTML='<h3>💥 Mission fehlgeschlagen</h3><p>Treffer: <b>'+score+'</b> von '+TARGET_SCORE+' · Versuche es nochmal.</p><button id="galaxyStartBtn" type="button">Runde wiederholen</button>';
    }
    document.getElementById('galaxyStartBtn').onclick=startRound;
    updateHud();
  }

  function addButton(){
    const controls=document.querySelector('.controls');
    if(!controls||document.getElementById('galaxyGameButton'))return;
    const btn=document.createElement('button');
    btn.id='galaxyGameButton';
    btn.type='button';
    btn.textContent='🚀 Bio-Galaxy';
    btn.onclick=openGame;
    controls.appendChild(btn);
  }

  addButton();
})();
