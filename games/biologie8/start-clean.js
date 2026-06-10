// Evolutionsmodus: wenige Startkarten, Kategorien wachsen nach und nach
(function(){
  const CLEAN_KEY='little-bio8-progress-v7';
  const OLD_KEYS=['little-bio8-progress-v6','little-bio8-progress-v5','little-bio8-progress-v4','little-bio8-progress-v3','little-bio8-progress-v2','little-bio8-progress'];
  const INITIAL_START=['mikroskop','pflanze','tier','wasser','luft','licht','nahrung','nachweis','knochen','reiz','lebensraum'];
  const CATEGORY_ORDER=['grundlagen','zellen','bewegung','kreislauf','nerven','immun','oekologie'];
  const CATEGORY_LABEL={grundlagen:'🌱 Grundlagen',zellen:'🔬 Zellen & Stoffwechsel',bewegung:'🦴 Bewegung',kreislauf:'🫁 Atmung & Kreislauf',nerven:'🧠 Nerven & Hormone',immun:'🛡️ Immunbiologie',oekologie:'🌳 Ökologie'};
  const CATEGORY_SEEDS={
    grundlagen:[...INITIAL_START],
    zellen:[],
    bewegung:['muskel'],
    kreislauf:['blut','blutgefaess','lunge','herz','belastung','messung'],
    nerven:['sinnesorgan','gehirn','rueckenmark','hormondruese','hormon','insulin','blutzucker'],
    immun:['krankheitserreger','haut','immunsystem','impfung'],
    oekologie:['pilz','totesmaterial']
  };
  const CATEGORY_MAP={
    mikroskop:'grundlagen',pflanze:'grundlagen',tier:'grundlagen',wasser:'grundlagen',luft:'grundlagen',licht:'grundlagen',nahrung:'grundlagen',nachweis:'grundlagen',knochen:'grundlagen',reiz:'grundlagen',lebensraum:'grundlagen',
    pflanzenzelle:'zellen',tierzelle:'zellen',zelle:'zellen',zellbestandteil:'zellen',zellmembran:'zellen',zellplasma:'zellen',zellkern:'zellen',zellwand:'zellen',vakuole:'zellen',chloroplast:'zellen',mitochondrium:'zellen',gewebe:'zellen',organ:'zellen',organsystem:'zellen',koerper:'zellen',leben:'zellen',naehrstoff:'zellen',verdauungsorgan:'zellen',verdauung:'zellen',naehrstofftransport:'zellen',zellstoffwechsel:'zellen',zellatmung:'zellen',energie:'zellen',
    muskel:'bewegung',skelett:'bewegung',bewegungsapparat:'bewegung',gegenspielerprinzip:'bewegung',bewegung:'bewegung',haltungsschaden:'bewegung',
    blut:'kreislauf',blutgefaess:'kreislauf',lunge:'kreislauf',herz:'kreislauf',nase:'kreislauf',atemweg:'kreislauf',atmungssystem:'kreislauf',lungenblaeschen:'kreislauf',gasaustausch:'kreislauf',sauerstoff:'kreislauf',sauerstofftransport:'kreislauf',kohlenstoffdioxid:'kreislauf',blutkreislauf:'kreislauf',lungenkreislauf:'kreislauf',koerperkreislauf:'kreislauf',herzfrequenz:'kreislauf',atemfrequenz:'kreislauf',blutdruck:'kreislauf',versorgung:'kreislauf',belastung:'kreislauf',messung:'kreislauf',
    sinnesorgan:'nerven',auge:'nerven',sehen:'nerven',wahrnehmung:'nerven',nervenzelle:'nerven',nerv:'nerven',signalweiterleitung:'nerven',gehirn:'nerven',rueckenmark:'nerven',zns:'nerven',nervensystem:'nerven',reaktion:'nerven',reflex:'nerven',hormondruese:'nerven',hormon:'nerven',hormonsystem:'nerven',hormontransport:'nerven',bauchspeicheldruese:'nerven',insulin:'nerven',blutzucker:'nerven',blutzuckerregulation:'nerven',alarmreaktion:'nerven',
    krankheitserreger:'immun',haut:'immun',immunsystem:'immun',impfung:'immun',bakterium:'immun',virus:'immun',infektionsbarriere:'immun',infektion:'immun',immunabwehr:'immun',antikoerper:'immun',gedaechtniszelle:'immun',immunitaet:'immun',
    blatt:'oekologie',fotosynthese:'oekologie',zucker:'oekologie',produzent:'oekologie',lebewesen:'oekologie',oekosystem:'oekologie',abiotischerfaktor:'oekologie',konsument:'oekologie',destruent:'oekologie',nahrungskette:'oekologie',nahrungsnetz:'oekologie',angepasstheit:'oekologie',pilz:'oekologie',totesmaterial:'oekologie'
  };
  const SEED_SET=new Set(Object.values(CATEGORY_SEEDS).flat());
  let unlockedCategories=new Set(['grundlagen','zellen']);
  try{OLD_KEYS.forEach(function(key){localStorage.removeItem(key);});}catch(e){}

  // Brücken, damit die neuen Phasen aus wenigen Startkarten erreichbar bleiben
  r('wasser','tier','blut','Der Körper enthält viel Wasser; Blut ist eine wichtige Körperflüssigkeit.');
  r('gewebe','blut','blutgefaess','Blut fließt durch Blutgefäße zu den Geweben.');
  r('organ','blut','herz','Das Herz ist ein Organ, das Blut pumpt.');
  r('organ','luft','lunge','Die Lunge ist ein Organ für den Gasaustausch.');
  r('gewebe','reiz','nervenzelle','Nervenzellen sind spezialisierte Zellen zur Weiterleitung von Reizen.');
  r('nervenzelle','organ','gehirn','Das Gehirn besteht aus Nervengewebe und verarbeitet Informationen.');
  r('nervenzelle','koerper','rueckenmark','Das Rückenmark leitet Signale zwischen Körper und Gehirn.');
  r('koerper','belastung','hormon','Bei Belastung können Hormone Körpervorgänge steuern.');
  r('organ','hormon','hormondruese','Hormondrüsen sind Organe, die Hormone bilden.');
  r('nahrung','blut','blutzucker','Nach der Verdauung gelangt Zucker ins Blut.');
  r('hormondruese','blutzucker','insulin','Insulin wird von einer Hormondrüse gebildet und wirkt auf den Blutzucker.');
  r('infektion','koerper','immunsystem','Bei einer Infektion wird das Immunsystem aktiv.');

  function discoveredCount(){return d.filter(function(id){return !SEED_SET.has(id);}).length;}
  const totalDiscoverable=Math.max(0,Object.keys(I).length-SEED_SET.size);
  save=function(){const discovered=d.filter(function(id){return !SEED_SET.has(id);});localStorage.setItem(CLEAN_KEY,JSON.stringify(discovered));};
  function unlockCategory(cat){
    if(unlockedCategories.has(cat))return false;
    unlockedCategories.add(cat);
    (CATEGORY_SEEDS[cat]||[]).forEach(function(id){if(I[id]&&!d.includes(id))d.push(id);});
    msg.innerHTML='🔓 Neue Kategorie freigeschaltet: <b>'+CATEGORY_LABEL[cat]+'</b>';
    return true;
  }
  function applyCategoryEvolution(){
    let changed=false,loop=true;
    while(loop){
      loop=false;
      if((d.includes('skelett')||d.includes('gewebe'))&&unlockCategory('bewegung')){changed=true;loop=true;}
      if((d.includes('organ')||d.includes('koerper'))&&unlockCategory('kreislauf')){changed=true;loop=true;}
      if((d.includes('bewegung')||d.includes('koerper')||d.includes('wahrnehmung'))&&unlockCategory('nerven')){changed=true;loop=true;}
      if((d.includes('koerper')||d.includes('infektion')||d.includes('blutkreislauf'))&&unlockCategory('immun')){changed=true;loop=true;}
      if((d.includes('lebewesen')||d.includes('oekosystem')||d.includes('fotosynthese'))&&unlockCategory('oekologie')){changed=true;loop=true;}
    }
    if(changed)save();
    return changed;
  }
  function makeHeader(cat){const div=document.createElement('div');div.className='category-head';div.textContent=CATEGORY_LABEL[cat];return div;}
  render=function(nid){
    grid.innerHTML='';
    const s=(search.value||'').toLowerCase();
    CATEGORY_ORDER.forEach(function(cat){
      if(!unlockedCategories.has(cat))return;
      const ids=d.filter(function(id){return CATEGORY_MAP[id]===cat&&(!s||I[id][0].toLowerCase().includes(s));});
      if(!ids.length)return;
      grid.appendChild(makeHeader(cat));
      ids.forEach(function(id){const el=document.createElement('article');el.className='card '+(sel===id?'sel ':'')+(nid===id?'new':'');el.innerHTML=card(id);el.onclick=function(){choose(id);};grid.appendChild(el);});
    });
    counter.textContent=discoveredCount()+' / '+totalDiscoverable;
    const bt=btxt();badge.textContent=bt;if(last&&last!==bt)msg.innerHTML='🏅 Neues Abzeichen: <b>'+bt+'</b>';last=bt;
  };
  const oldCombine=combine;
  combine=function(a,b){oldCombine(a,b);setTimeout(function(){if(applyCategoryEvolution())render();},1500);};
  reset=function(){try{localStorage.removeItem(CLEAN_KEY);OLD_KEYS.forEach(function(key){localStorage.removeItem(key);});}catch(e){}unlockedCategories=new Set(['grundlagen','zellen']);d=[...INITIAL_START];sel=null;if(search)search.value='';resetSlots();msg.innerHTML='Evolutionärer Start: Zuerst siehst du nur wenige Grundkarten. Neue Kategorien entstehen nach und nach.';};
  const saved=(function(){try{return JSON.parse(localStorage.getItem(CLEAN_KEY)||'[]').filter(function(id){return I[id];});}catch(e){return [];}})();
  d=[...new Set([...INITIAL_START,...saved])];
  applyCategoryEvolution();
  const btn=document.getElementById('reset');if(btn)btn.onclick=reset;
  resetSlots();
  msg.innerHTML='Evolutionärer Start: Nur wenige Grundkarten sind offen. Entdeckst du wichtige Begriffe, entstehen neue Kategorien.';
})();
