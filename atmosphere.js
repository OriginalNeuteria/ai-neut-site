/* Scroll reveals only; deliberately no persistent photographic background.
   The lake scene can also let its landscape come into view where the pointer
   travels through the empty field around the words. The page scroll is never captured. */
(() => {
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  const control=document.getElementById('atmosphere-toggle');
  const scenes=[...document.querySelectorAll('.atmosphere-scene')];
  const lake=document.getElementById('beyond-the-porch');
  const lakeLayer=lake&&lake.querySelector('.atmosphere-layer');
  const visible=new Set();
  let off=false; try {off=localStorage.getItem('sareal-atmosphere')==='off';} catch (_) {}
  let current=null,idleTimer=0,frame=0,scrolling=false,glimmerTimer=0;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='tartan-last-light';svg.setAttribute('aria-hidden','true');
  const line=document.createElementNS(svg.namespaceURI,'path');svg.append(line);document.body.append(svg);
  const disabled=()=>off||reduce.matches;
  function lakeMode(){return (lake&&lake.dataset.lakeMode)||'';}
  function lakeHeld(scene){
    if(!scene||scene!==lake)return false;
    const mode=lakeMode();
    return mode==='reveal'||mode==='static'||mode==='depart';
  }
  function clearScenes(immediate=false) {
    scenes.forEach(s=>{
      if(lakeHeld(s))return;
      const layer=s.querySelector('.atmosphere-layer');
      if(!layer)return;
      layer.style.transition=immediate?'none':'';
      layer.classList.toggle('withdrawing',!immediate);
      layer.style.opacity='0';
    });
  }
  function chooseScene(){
    const center=innerHeight/2;
    return [...visible].filter(s=>{const r=s.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;})
      .sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.offsetHeight/2-center)-Math.abs(b.getBoundingClientRect().top+b.offsetHeight/2-center))[0]||null;
  }
  function glimmer(){
    if(disabled()||document.hidden||!chooseScene())return;
    // Exact gold-thread coordinates of the live 144px tartan sett, not a new sparkle grid.
    const columns=Math.max(1,Math.floor(innerWidth/144));
    const x=65+144*Math.floor(Math.random()*columns);
    const y=65+144*Math.floor((scrollY+innerHeight*.55)/144)-scrollY;
    line.setAttribute('d',Math.random()>.5?`M${x} ${y-30}v62`:`M${Math.max(0,x-30)} ${y}h76`);
    line.classList.remove('glimmer');void line.getBoundingClientRect();line.classList.add('glimmer');
  }
  function periodic(){clearTimeout(glimmerTimer);glimmerTimer=setTimeout(()=>{glimmer();periodic();},8000+Math.random()*6000);}
  function render(){
    frame=0;if(disabled()||!scrolling)return;
    const next=chooseScene();
    if(current!==next){clearScenes(true);current=next;}
    if(!current||lakeHeld(current))return;
    const r=current.getBoundingClientRect();
    const progress=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)));
    const envelope=Math.sin(Math.PI*progress);
    const layer=current.querySelector('.atmosphere-layer');
    layer.style.transition='';layer.classList.remove('withdrawing');layer.style.opacity=(envelope*Number(current.dataset.cap)).toFixed(4);
  }
  function onScroll(){
    if(disabled())return;
    scrolling=true;
    if(!frame)frame=requestAnimationFrame(render);
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{scrolling=false;clearScenes();glimmer();current=null;},850);
  }
  function sync(){
    root.classList.toggle('atmosphere-off',disabled());
    if(control){control.textContent=reduce.matches?'Atmosphere: Off (reduced motion)':`Atmosphere: ${off?'Off':'On'}`;control.setAttribute('aria-pressed',String(!disabled()));control.disabled=reduce.matches;}
    clearTimeout(idleTimer);scrolling=false;clearScenes(true);current=null;line.classList.remove('glimmer');
    placeLake();
  }
  /* Room to wonder: the landscape eases in as the pointer moves through the
     empty field around the copy, then fades slowly once scrolling leaves.
     Nothing here listens for wheel/touch in a way that would pin or trap scroll. */
  let lakeTarget=0,lakeNow=0,lakeX=70,lakeY=58,lakeShownX=70,lakeShownY=58,lakeRaf=0,departToken=0,awayPx=0,lastScrollY=window.scrollY,wheelActive=false,wheelTimer=0;
  function lakeRatio(){
    if(!lake)return 0;
    const r=lake.getBoundingClientRect();
    const vis=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);
    return Math.max(0,vis)/Math.min(Math.max(r.height,1),innerHeight);
  }
  function copyBoxes(){
    if(!lake)return [];
    return [...lake.querySelectorAll('.atmosphere-reading .eyebrow, .atmosphere-reading h2, .atmosphere-reading > p, .atmosphere-reading a')].map(el=>el.getBoundingClientRect());
  }
  function overCopy(x,y){
    const pad=16;
    return copyBoxes().some(r=>x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad);
  }
  function copyDistance(x,y){
    let best=Infinity;
    for(const r of copyBoxes()){
      const dx=Math.max(r.left-x,0,x-r.right);
      const dy=Math.max(r.top-y,0,y-r.bottom);
      best=Math.min(best,Math.hypot(dx,dy));
    }
    return best;
  }
  function paintLake(opacity){
    if(!lakeLayer||lakeMode()!=='reveal')return;
    lakeLayer.classList.remove('withdrawing');
    lakeLayer.style.transition='none';
    lakeLayer.style.opacity=opacity.toFixed(4);
    lakeLayer.style.setProperty('--lake-x',lakeShownX.toFixed(2)+'%');
    lakeLayer.style.setProperty('--lake-y',lakeShownY.toFixed(2)+'%');
    lakeLayer.style.setProperty('--lake-p',(lakeShownX/100).toFixed(4));
    lakeLayer.style.setProperty('--lake-q',(lakeShownY/100).toFixed(4));
  }
  function releaseLake(){
    if(!lake||!lakeLayer)return;
    lake.classList.remove('lake-reveal','lake-static','lake-depart');
    delete lake.dataset.lakeMode;
    lakeLayer.style.transition='';
    lakeLayer.style.opacity='';
    lakeLayer.style.removeProperty('--lake-x');
    lakeLayer.style.removeProperty('--lake-y');
    lakeLayer.style.removeProperty('--lake-p');
    lakeLayer.style.removeProperty('--lake-q');
    lakeNow=0;lakeTarget=0;awayPx=0;
  }
  function showStatic(reduced){
    if(!lake||!lakeLayer||lakeMode()==='depart')return;
    if(lakeMode()==='static'&&lake.classList.contains('lake-static'))return;
    lake.dataset.lakeMode='static';
    lake.classList.add('lake-static');
    lake.classList.remove('lake-reveal','lake-depart');
    lakeLayer.classList.remove('withdrawing');
    if(reduced){lakeLayer.style.transition='none';lakeLayer.style.opacity='';return;}
    lakeLayer.style.transition='opacity 900ms ease';
    lakeLayer.style.opacity='0.92';
    lakeNow=0.92;lakeTarget=0.92;
  }
  function beginDepart(){
    if(!lake||!lakeLayer||reduce.matches)return;
    if(lakeMode()==='depart')return;
    const token=++departToken;
    if(lakeRaf){cancelAnimationFrame(lakeRaf);lakeRaf=0;}
    const from=parseFloat(lakeLayer.style.opacity);
    lake.dataset.lakeMode='depart';
    lake.classList.add('lake-depart');
    lakeLayer.style.transition='none';
    if(!Number.isNaN(from))lakeLayer.style.opacity=String(from);
    void lakeLayer.offsetWidth;
    lakeLayer.style.transition='opacity 2200ms ease-in-out';
    void lakeLayer.offsetWidth;
    lakeLayer.style.opacity='0';
    lakeTarget=0;
    const started=performance.now();
    const finish=()=>{
      if(token!==departToken||lakeMode()!=='depart')return;
      if(performance.now()-started<500)return;
      departToken++;
      releaseLake();
    };
    lakeLayer.addEventListener('transitionend',function onEnd(e){
      if(e.propertyName!=='opacity')return;
      lakeLayer.removeEventListener('transitionend',onEnd);
      finish();
    });
    setTimeout(finish,2600);
  }
  function kickLake(){
    if(lakeRaf)return;
    lakeRaf=requestAnimationFrame(function step(){
      lakeRaf=0;
      if(lakeMode()!=='reveal')return;
      lakeNow+=(lakeTarget-lakeNow)*0.045;
      lakeShownX+=(lakeX-lakeShownX)*0.06;
      lakeShownY+=(lakeY-lakeShownY)*0.06;
      if(Math.abs(lakeTarget-lakeNow)<0.004)lakeNow=lakeTarget;
      paintLake(Math.max(0,lakeNow));
      if(lakeTarget===0&&lakeNow<=0.004){releaseLake();return;}
      if(lakeNow!==lakeTarget||Math.abs(lakeX-lakeShownX)>0.2||Math.abs(lakeY-lakeShownY)>0.2)kickLake();
    });
  }
  function placeLake(){
    if(!lake||!lakeLayer)return;
    departToken++;
    releaseLake();
    if(off)return;
    if(reduce.matches){showStatic(true);return;}
    if(!fine.matches&&lakeRatio()>0.42)showStatic(false);
  }
  function onLakeScroll(){
    const dy=window.scrollY-lastScrollY;
    lastScrollY=window.scrollY;
    if(!lake||!lakeLayer||off||reduce.matches)return;
    wheelActive=true;
    clearTimeout(wheelTimer);
    wheelTimer=setTimeout(()=>{wheelActive=false;},160);
    const mode=lakeMode();
    const ratio=lakeRatio();
    if(!fine.matches){
      if(mode==='depart')return;
      if(ratio<0.34&&(mode==='static'||mode==='reveal'))beginDepart();
      else if(ratio>0.45&&mode!=='static')showStatic(false);
      return;
    }
    if(mode==='reveal'||mode==='static'){
      awayPx+=Math.abs(dy);
      if(awayPx>40||ratio<0.28)beginDepart();
    }else awayPx=0;
  }
  function onLakePointer(e){
    if(!lake||!lakeLayer||off||reduce.matches||!fine.matches)return;
    if(e.pointerType&&e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
    if(wheelActive||lakeMode()==='depart')return;
    const bounds=lake.getBoundingClientRect();
    if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)return;
    if(overCopy(e.clientX,e.clientY))return;
    const reach=Math.min(240,Math.max(180,bounds.width*0.2));
    const dist=copyDistance(e.clientX,e.clientY);
    const t=Math.max(0,Math.min(1,dist/Math.max(reach,1)));
    const shaped=Math.pow(t,0.72);
    lakeTarget=shaped*0.94;
    lakeX=((e.clientX-bounds.left)/bounds.width)*100;
    lakeY=((e.clientY-bounds.top)/bounds.height)*100;
    awayPx=0;
    lake.dataset.lakeMode='reveal';
    lake.classList.add('lake-reveal');
    lake.classList.remove('lake-static','lake-depart');
    kickLake();
  }
  if(lake){
    lake.addEventListener('pointermove',onLakePointer,{passive:true});
    lake.addEventListener('pointerleave',()=>{
      if(lakeMode()!=='reveal')return;
      lakeTarget=0;
      kickLake();
    });
    window.addEventListener('scroll',onLakeScroll,{passive:true});
    fine.addEventListener('change',placeLake);
  }
  if(control)control.addEventListener('click',()=>{off=!off;try{localStorage.setItem('sareal-atmosphere',off?'off':'on');}catch(_){}sync();});
  reduce.addEventListener('change',sync);
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));},{threshold:0});
  scenes.forEach(s=>observer.observe(s));
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',()=>{if(scrolling&&!frame)frame=requestAnimationFrame(render);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(idleTimer);scrolling=false;clearScenes(true);line.classList.remove('glimmer');}});
  sync();periodic();
})();
