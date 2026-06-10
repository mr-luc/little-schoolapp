// Münzensystem: Tipps kosten Münzen, neue Entdeckungen und Mini-Spiele bringen Münzen.
(function(){
  const COIN_KEY='little-bio8-coins-v1';
  const START_COINS=5;
  const HINT_COST=3;
  const DISCOVERY_REWARD=2;

  function loadCoins(){
    const raw=localStorage.getItem(COIN_KEY);
    const n=Number(raw);
    if(Number.isFinite(n))return n;
    localStorage.setItem(COIN_KEY,String(START_COINS));
    return START_COINS;
  }

  let coins=loadCoins();

  function saveCoins(){
    localStorage.setItem(COIN_KEY,String(coins));
  }

  function coinText(){
    return '🪙 '+coins;
  }

  function ensureCoinDisplay(){
    let box=document.getElementById('coinsBox');
    if(!box){
      box=document.createElement('div');
      box.id='coinsBox';
      box.className='coins-box';
      const stats=document.querySelector('.stats');
      if(stats)stats.appendChild(box);
    }
    box.textContent=coinText();
  }

  function addCoins(amount,reason){
    coins+=amount;
    saveCoins();
    ensureCoinDisplay();
    if(reason){
      msg.innerHTML=reason+'<br><b>+'+amount+' Münzen</b> · Jetzt hast du <b>'+coins+'</b> Münzen.';
    }
    return coins;
  }

  function spendCoins(amount){
    if(coins<amount){
      msg.innerHTML='🪙 Du hast <b>'+coins+'</b> Münzen. Ein Tipp kostet <b>'+amount+'</b> Münzen.<br>Entdecke neue Begriffe oder spiele das Mini-Spiel, um Münzen zu verdienen.';
      return false;
    }
    coins-=amount;
    saveCoins();
    ensureCoinDisplay();
    return true;
  }

  function buyHint(){
    if(!spendCoins(HINT_COST))return;

    const possible=[];
    for(let i=0;i<d.length;i++){
      for(let j=i;j<d.length;j++){
        const result=R[k(d[i],d[j])];
        if(result&&!d.includes(result))possible.push([d[i],d[j]]);
      }
    }

    if(!possible.length){
      coins+=HINT_COST;
      saveCoins();
      ensureCoinDisplay();
      msg.innerHTML='💡 Im Moment gibt es keinen neuen Tipp. Deine Münzen wurden zurückgegeben.';
      return;
    }

    const pair=possible[Math.floor(Math.random()*possible.length)];
    const a=pair[0],b=pair[1];
    msg.innerHTML='🪙 Tipp gekauft für <b>'+HINT_COST+'</b> Münzen.<br>💡 Probiere <b>'+I[a][1]+' '+I[a][0]+'</b> + <b>'+I[b][1]+' '+I[b][0]+'</b>.';
  }

  window.BioCoins={
    add:addCoins,
    spend:spendCoins,
    get:function(){return coins;},
    reset:function(){coins=START_COINS;saveCoins();ensureCoinDisplay();return coins;},
    update:ensureCoinDisplay,
    hintCost:HINT_COST
  };

  const oldCombine=combine;
  combine=function(a,b){
    const before=d.length;
    oldCombine(a,b);
    const after=d.length;
    if(after>before){
      setTimeout(function(){
        addCoins(DISCOVERY_REWARD,'🧬 Neue Entdeckung belohnt');
      },900);
    }
  };

  const oldReset=reset;
  reset=function(){
    oldReset();
    coins=START_COINS;
    saveCoins();
    ensureCoinDisplay();
    msg.innerHTML='Neustart: Du beginnst wieder mit wenigen Grundkarten und <b>'+START_COINS+'</b> Münzen.';
  };

  const hintButton=document.getElementById('hint');
  if(hintButton){
    hintButton.textContent='💡 Tipp kaufen ('+HINT_COST+'🪙)';
    hintButton.onclick=buyHint;
  }

  const resetButton=document.getElementById('reset');
  if(resetButton)resetButton.onclick=reset;

  ensureCoinDisplay();
})();
