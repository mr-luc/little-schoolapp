// Mini-Spiel: Bio-Blitz – richtige Antwort bringt Münzen
// Version 2: großer Fragenpool und Wiederholschutz
(function(){
  const SEEN_KEY='little-bio8-mini-seen-v2';
  const QUESTIONS=[
    {id:'zelle-1',q:'Was ist die kleinste lebende Einheit?',a:'Zelle',w:['Organ','Gewebe','Zelle']},
    {id:'zelle-2',q:'Was begrenzt die Zelle nach außen?',a:'Zellmembran',w:['Zellmembran','Zellkern','Vakuole']},
    {id:'zelle-3',q:'Was steuert viele Vorgänge in der Zelle?',a:'Zellkern',w:['Zellkern','Zellwand','Blutgefäß']},
    {id:'zelle-4',q:'Was ist die flüssige Grundmasse der Zelle?',a:'Zellplasma',w:['Zellplasma','Skelett','Nerv']},
    {id:'zelle-5',q:'Welche Struktur gehört typisch zur Pflanzenzelle?',a:'Zellwand',w:['Zellwand','Lunge','Blutgefäß']},
    {id:'zelle-6',q:'Welcher Zellbestandteil ist der Ort der Fotosynthese?',a:'Chloroplast',w:['Mitochondrium','Chloroplast','Herz']},
    {id:'zelle-7',q:'Welcher Zellbestandteil ist wichtig für die Zellatmung?',a:'Mitochondrium',w:['Mitochondrium','Zellwand','Auge']},
    {id:'zelle-8',q:'Was bilden viele ähnliche Zellen zusammen?',a:'Gewebe',w:['Gewebe','Organismus','Nahrungskette']},
    {id:'zelle-9',q:'Was entsteht aus mehreren Geweben?',a:'Organ',w:['Organ','Reiz','Sauerstoff']},
    {id:'zelle-10',q:'Was entsteht aus mehreren Organen, die zusammenarbeiten?',a:'Organsystem',w:['Organsystem','Zucker','Bakterium']},

    {id:'stoff-1',q:'Welcher Vorgang findet in Chloroplasten statt?',a:'Fotosynthese',w:['Fotosynthese','Reflex','Blutdruck']},
    {id:'stoff-2',q:'Was brauchen Pflanzen für die Fotosynthese als Energiequelle?',a:'Licht',w:['Licht','Antikörper','Knochen']},
    {id:'stoff-3',q:'Welches Gas entsteht bei der Fotosynthese?',a:'Sauerstoff',w:['Sauerstoff','Stickstoff','Insulin']},
    {id:'stoff-4',q:'Welcher Stoff ist ein energiereicher Speicher aus der Fotosynthese?',a:'Zucker',w:['Zucker','Nerv','Lunge']},
    {id:'stoff-5',q:'Was liefert Nahrung dem Körper?',a:'Nährstoffe',w:['Nährstoffe','Lichtreize','Zellwände']},
    {id:'stoff-6',q:'Was zerlegt Nahrung in verwertbare Bestandteile?',a:'Verdauung',w:['Verdauung','Sehen','Impfung']},
    {id:'stoff-7',q:'Welcher Vorgang liefert Zellen nutzbare Energie?',a:'Zellatmung',w:['Zellatmung','Nahrungskette','Wahrnehmung']},
    {id:'stoff-8',q:'Was benötigen Zellen für die Zellatmung außer Nährstoffen?',a:'Sauerstoff',w:['Sauerstoff','Kohlenstoffdioxid','Licht']},
    {id:'stoff-9',q:'Welches Gas entsteht bei der Zellatmung als Abfallstoff?',a:'Kohlenstoffdioxid',w:['Kohlenstoffdioxid','Sauerstoff','Insulin']},
    {id:'stoff-10',q:'Wie kommen Nährstoffe zu den Zellen?',a:'Mit dem Blut',w:['Mit dem Blut','Mit Licht','Mit der Zellwand']},

    {id:'koerper-1',q:'Was bilden viele Knochen zusammen?',a:'Skelett',w:['Skelett','Nerv','Vakuole']},
    {id:'koerper-2',q:'Was kann sich zusammenziehen und Kraft erzeugen?',a:'Muskel',w:['Muskel','Blutgefäß','Chloroplast']},
    {id:'koerper-3',q:'Was bilden Skelett und Muskeln zusammen?',a:'Bewegungsapparat',w:['Bewegungsapparat','Immunsystem','Ökosystem']},
    {id:'koerper-4',q:'Wie arbeiten viele Muskeln bei Bewegungen?',a:'Als Gegenspieler',w:['Als Gegenspieler','Als Erreger','Als Produzenten']},
    {id:'koerper-5',q:'Was kann durch ungünstige Belastung entstehen?',a:'Haltungsschaden',w:['Haltungsschaden','Fotosynthese','Immunität']},

    {id:'kreislauf-1',q:'Was pumpt Blut durch den Körper?',a:'Herz',w:['Lunge','Herz','Auge']},
    {id:'kreislauf-2',q:'Was transportiert Sauerstoff im Körper?',a:'Blut',w:['Blut','Nahrung','Licht']},
    {id:'kreislauf-3',q:'Wo findet der Gasaustausch in der Lunge statt?',a:'Lungenbläschen',w:['Lungenbläschen','Zellkern','Knochen']},
    {id:'kreislauf-4',q:'Was gelangt beim Gasaustausch ins Blut?',a:'Sauerstoff',w:['Sauerstoff','Zucker','Antikörper']},
    {id:'kreislauf-5',q:'Was bilden Herz und Blutgefäße zusammen?',a:'Blutkreislauf',w:['Blutkreislauf','Hormonsystem','Nahrungsnetz']},
    {id:'kreislauf-6',q:'Was steigt bei körperlicher Belastung meist an?',a:'Herzfrequenz',w:['Herzfrequenz','Zellwand','Angepasstheit']},
    {id:'kreislauf-7',q:'Was kann man als Messwert des Kreislaufs bestimmen?',a:'Blutdruck',w:['Blutdruck','Fotosynthese','Zellplasma']},
    {id:'kreislauf-8',q:'Was verbindet der Lungenkreislauf?',a:'Herz und Lunge',w:['Herz und Lunge','Auge und Haut','Pflanze und Pilz']},

    {id:'nerven-1',q:'Was nimmt Reize auf?',a:'Sinnesorgan',w:['Sinnesorgan','Blutdruck','Knochen']},
    {id:'nerven-2',q:'Welches Sinnesorgan nimmt Lichtreize auf?',a:'Auge',w:['Auge','Herz','Magen']},
    {id:'nerven-3',q:'Was leitet Informationen im Körper weiter?',a:'Nervenzelle',w:['Nervenzelle','Zellwand','Produzent']},
    {id:'nerven-4',q:'Was bilden Gehirn und Rückenmark zusammen?',a:'Zentrales Nervensystem',w:['Zentrales Nervensystem','Blutkreislauf','Nahrungskette']},
    {id:'nerven-5',q:'Wie nennt man die Antwort des Körpers auf einen Reiz?',a:'Reaktion',w:['Reaktion','Verdauung','Zellwand']},
    {id:'nerven-6',q:'Was ist eine schnelle automatische Reaktion?',a:'Reflex',w:['Reflex','Produzent','Vakuole']},

    {id:'hormon-1',q:'Was bilden Hormondrüsen?',a:'Hormone',w:['Hormone','Blutgefäße','Chloroplasten']},
    {id:'hormon-2',q:'Womit werden Hormone im Körper transportiert?',a:'Blut',w:['Blut','Licht','Zellwand']},
    {id:'hormon-3',q:'Welches Hormon senkt den Blutzucker?',a:'Insulin',w:['Insulin','Sauerstoff','Antikörper']},
    {id:'hormon-4',q:'Welche Drüse bildet unter anderem Insulin?',a:'Bauchspeicheldrüse',w:['Bauchspeicheldrüse','Lunge','Haut']},
    {id:'hormon-5',q:'Was kann den Körper auf schnelle Leistung vorbereiten?',a:'Alarmreaktion',w:['Alarmreaktion','Nahrungsnetz','Zellplasma']},

    {id:'immun-1',q:'Was schützt vor Krankheitserregern?',a:'Immunsystem',w:['Immunsystem','Fotosynthese','Skelett']},
    {id:'immun-2',q:'Was ist eine äußere Schutzschicht des Körpers?',a:'Haut',w:['Haut','Blutzucker','Chloroplast']},
    {id:'immun-3',q:'Was trainiert das Immunsystem gegen bestimmte Erreger?',a:'Impfung',w:['Impfung','Fotosynthese','Verdauung']},
    {id:'immun-4',q:'Was kann passende Krankheitserreger erkennen?',a:'Antikörper',w:['Antikörper','Muskeln','Blätter']},
    {id:'immun-5',q:'Welche Zellen merken sich Merkmale eines Erregers?',a:'Gedächtniszellen',w:['Gedächtniszellen','Pflanzenzellen','Lungenbläschen']},
    {id:'immun-6',q:'Was entsteht, wenn Krankheitserreger eindringen und sich vermehren?',a:'Infektion',w:['Infektion','Fotosynthese','Gasaustausch']},
    {id:'immun-7',q:'Welcher Krankheitserreger nutzt Zellen zur Vermehrung?',a:'Virus',w:['Virus','Knochen','Zucker']},

    {id:'oekologie-1',q:'Was ist ein unbelebter Umweltfaktor?',a:'Licht',w:['Licht','Tier','Pilz']},
    {id:'oekologie-2',q:'Was bilden Lebewesen und Lebensraum zusammen?',a:'Ökosystem',w:['Ökosystem','Zellkern','Blutdruck']},
    {id:'oekologie-3',q:'Wer stellt Biomasse selbst her?',a:'Produzent',w:['Konsument','Produzent','Destruent']},
    {id:'oekologie-4',q:'Wer frisst andere Lebewesen?',a:'Konsument',w:['Konsument','Produzent','Zellkern']},
    {id:'oekologie-5',q:'Wer baut totes Material ab?',a:'Destruent',w:['Destruent','Reflex','Blutzucker']},
    {id:'oekologie-6',q:'Was zeigt, wer wen frisst?',a:'Nahrungskette',w:['Nahrungskette','Zellmembran','Herzfrequenz']},
    {id:'oekologie-7',q:'Was entsteht aus mehreren Nahrungsketten?',a:'Nahrungsnetz',w:['Nahrungsnetz','Zellplasma','Hormondrüse']},
    {id:'oekologie-8',q:'Wie nennt man Merkmale, die zu Lebensraum und Lebensweise passen?',a:'Angepasstheit',w:['Angepasstheit','Blutzucker','Reflex']}
  ];
  const ROUND_COUNT=3;
  const REWARD_PER_RIGHT=1;
  const PERFECT_BONUS=2;

  let modal,questionBox,answersBox,statusBox,closeButton,introBox;
  let round=0;
  let correct=0;
  let activeQuestions=[];

  function shuffle(arr){
    return arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  }

  function loadSeen(){
    try{
      const ids=JSON.parse(localStorage.getItem(SEEN_KEY)||'[]');
      return Array.isArray(ids)?ids.filter(id=>QUESTIONS.some(q=>q.id===id)):[];
    }catch(e){return [];}
  }

  function saveSeen(ids){
    localStorage.setItem(SEEN_KEY,JSON.stringify(ids));
  }

  function pickQuestions(){
    let seen=loadSeen();
    let unseen=QUESTIONS.filter(q=>!seen.includes(q.id));
    if(unseen.length<ROUND_COUNT){
      seen=[];
      unseen=[...QUESTIONS];
    }
    const picked=shuffle(unseen).slice(0,ROUND_COUNT);
    saveSeen([...seen,...picked.map(q=>q.id)]);
    return picked;
  }

  function remainingText(){
    const seen=loadSeen().length;
    const rest=Math.max(0,QUESTIONS.length-seen);
    return 'Fragenpool: '+QUESTIONS.length+' Fragen · noch '+rest+' ohne Wiederholung';
  }

  function ensureModal(){
    if(modal)return;
    modal=document.createElement('div');
    modal.className='mini-modal';
    modal.innerHTML='<div class="mini-card"><button class="mini-close" type="button">×</button><h2>🧬 Bio-Blitz</h2><p class="mini-intro">Beantworte 3 kurze Fragen. Jede richtige Antwort bringt Münzen. Fragen wiederholen sich erst, wenn der Pool aufgebraucht ist.</p><div class="mini-status"></div><div class="mini-question"></div><div class="mini-answers"></div></div>';
    document.body.appendChild(modal);
    closeButton=modal.querySelector('.mini-close');
    introBox=modal.querySelector('.mini-intro');
    questionBox=modal.querySelector('.mini-question');
    answersBox=modal.querySelector('.mini-answers');
    statusBox=modal.querySelector('.mini-status');
    closeButton.onclick=function(){modal.classList.remove('show');};
    modal.addEventListener('click',function(e){if(e.target===modal)modal.classList.remove('show');});
  }

  function startMiniGame(){
    ensureModal();
    round=0;
    correct=0;
    activeQuestions=pickQuestions();
    introBox.textContent=remainingText();
    modal.classList.add('show');
    showQuestion();
  }

  function showQuestion(){
    const item=activeQuestions[round];
    statusBox.textContent='Frage '+(round+1)+' / '+ROUND_COUNT+' · richtig: '+correct;
    questionBox.textContent=item.q;
    answersBox.innerHTML='';
    shuffle(item.w).forEach(function(answer){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='mini-answer';
      btn.textContent=answer;
      btn.onclick=function(){checkAnswer(answer,item.a,btn);};
      answersBox.appendChild(btn);
    });
  }

  function checkAnswer(answer,right,button){
    Array.from(answersBox.children).forEach(function(btn){btn.disabled=true;});
    if(answer===right){
      correct++;
      button.classList.add('right');
      statusBox.textContent='✅ Richtig! +'+REWARD_PER_RIGHT+' Münze';
      if(window.BioCoins)window.BioCoins.add(REWARD_PER_RIGHT);
    }else{
      button.classList.add('wrong');
      Array.from(answersBox.children).forEach(function(btn){if(btn.textContent===right)btn.classList.add('right');});
      statusBox.textContent='❌ Nicht ganz. Richtige Antwort: '+right;
    }
    setTimeout(nextQuestion,900);
  }

  function nextQuestion(){
    round++;
    if(round<ROUND_COUNT){
      showQuestion();
      return;
    }
    finishMiniGame();
  }

  function finishMiniGame(){
    questionBox.textContent='Fertig! Du hattest '+correct+' von '+ROUND_COUNT+' richtig.';
    answersBox.innerHTML='';
    if(correct===ROUND_COUNT){
      if(window.BioCoins)window.BioCoins.add(PERFECT_BONUS);
      statusBox.innerHTML='🏆 Perfekt! Bonus: <b>+'+PERFECT_BONUS+' Münzen</b>';
    }else{
      statusBox.textContent='Du kannst gleich nochmal spielen.';
    }
    introBox.textContent=remainingText();
    const again=document.createElement('button');
    again.type='button';
    again.className='mini-again';
    again.textContent='Nochmal spielen';
    again.onclick=startMiniGame;
    answersBox.appendChild(again);
  }

  function addButton(){
    const controls=document.querySelector('.controls');
    if(!controls)return;
    if(document.getElementById('miniGameButton'))return;
    const btn=document.createElement('button');
    btn.id='miniGameButton';
    btn.type='button';
    btn.textContent='🎮 Münzen verdienen';
    btn.onclick=startMiniGame;
    controls.appendChild(btn);
  }

  addButton();
})();
