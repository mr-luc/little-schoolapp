// Kategorien als Tabs: Es wird nur eine Kategorie angezeigt, mit Fortschritt pro Kategorie.
(function(){
  const CATEGORY_ORDER=['grundlagen','zellen','bewegung','kreislauf','nerven','immun','oekologie'];
  const CATEGORY_LABEL={
    grundlagen:'🌱 Grundlagen',
    zellen:'🔬 Zellen & Stoffwechsel',
    bewegung:'🦴 Bewegung',
    kreislauf:'🫁 Atmung & Kreislauf',
    nerven:'🧠 Nerven & Hormone',
    immun:'🛡️ Immunbiologie',
    oekologie:'🌳 Ökologie'
  };
  const CATEGORY_SHORT={
    grundlagen:'🌱 Start',
    zellen:'🔬 Zellen',
    bewegung:'🦴 Bewegung',
    kreislauf:'🫁 Kreislauf',
    nerven:'🧠 Nerven',
    immun:'🛡️ Immun',
    oekologie:'🌳 Öko'
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

  const START_SET=new Set(['mikroskop','pflanze','tier','wasser','luft','licht','nahrung','nachweis','knochen','reiz','lebensraum']);
  let seenCategories=null;
  let activeCategory='grundlagen';

  function visibleCategories(){
    const set=new Set(['grundlagen','zellen']);
    d.forEach(function(id){
      const cat=CATEGORY_MAP[id];
      if(cat)set.add(cat);
    });
    return set;
  }

  function idsInCategory(cat,searchText){
    return d.filter(function(id){
      return CATEGORY_MAP[id]===cat&&(!searchText||I[id][0].toLowerCase().includes(searchText));
    });
  }

  function countInCategory(cat){
    return d.filter(function(id){return CATEGORY_MAP[id]===cat;}).length;
  }

  function totalInCategory(cat){
    return Object.keys(CATEGORY_MAP).filter(function(id){return CATEGORY_MAP[id]===cat&&I[id];}).length;
  }

  function progressText(cat){
    return countInCategory(cat)+' / '+totalInCategory(cat);
  }

  function tabBar(categories){
    const nav=document.createElement('div');
    nav.className='category-nav category-tabs';
    categories.forEach(function(cat){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='category-pill '+(cat===activeCategory?'active-tab':'');
      btn.textContent=(CATEGORY_SHORT[cat]||CATEGORY_LABEL[cat])+' · '+progressText(cat);
      btn.onclick=function(){
        activeCategory=cat;
        render();
        msg.innerHTML='Kategorie gewechselt: <b>'+CATEGORY_LABEL[cat]+'</b> · Fortschritt: <b>'+progressText(cat)+'</b>';
      };
      nav.appendChild(btn);
    });
    return nav;
  }

  function categoryHeader(cat){
    const div=document.createElement('div');
    div.className='category-head';
    div.innerHTML=CATEGORY_LABEL[cat]+' <span class="category-progress">'+progressText(cat)+'</span>';
    return div;
  }

  function categoryUnlockMessage(newCategories){
    if(!newCategories.length)return '';
    const labels=newCategories.map(function(cat){return CATEGORY_LABEL[cat]+' '+progressText(cat);}).join(', ');
    return '🔓 Neue Kategorie freigeschaltet: <b>'+labels+'</b><br>Ich habe direkt dorthin gewechselt.';
  }

  render=function(nid){
    grid.innerHTML='';
    const s=(search.value||'').toLowerCase();
    const visible=visibleCategories();
    const visibleOrdered=CATEGORY_ORDER.filter(function(cat){return visible.has(cat);});
    let newCategories=[];

    if(nid&&CATEGORY_MAP[nid])activeCategory=CATEGORY_MAP[nid];
    if(!visible.has(activeCategory))activeCategory=visibleOrdered[0]||'grundlagen';

    if(seenCategories){
      CATEGORY_ORDER.forEach(function(cat){
        if(visible.has(cat)&&!seenCategories.has(cat))newCategories.push(cat);
      });
    }

    if(newCategories.length)activeCategory=newCategories[0];

    grid.appendChild(tabBar(visibleOrdered));
    grid.appendChild(categoryHeader(activeCategory));

    const ids=idsInCategory(activeCategory,s);
    if(!ids.length){
      const empty=document.createElement('div');
      empty.className='category-empty';
      empty.textContent=s?'Keine Karte in dieser Kategorie gefunden.':'In dieser Kategorie gibt es noch keine sichtbaren Karten.';
      grid.appendChild(empty);
    }else{
      ids.forEach(function(id){
        const el=document.createElement('article');
        el.className='card '+(sel===id?'sel ':'')+(nid===id?'new':'');
        el.innerHTML=card(id);
        el.onclick=function(){choose(id);};
        grid.appendChild(el);
      });
    }

    counter.textContent=progressText(activeCategory);
    const bt=btxt();
    badge.textContent=bt;
    last=bt;

    const unlockText=categoryUnlockMessage(newCategories);
    if(unlockText)msg.innerHTML=unlockText;
    seenCategories=new Set(visible);
  };

  resetSlots();
})();
