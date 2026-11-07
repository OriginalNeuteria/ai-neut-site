/* Scroll reveals only; deliberately no persistent photographic background. */
(() => {
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const control=document.getElementById('atmosphere-toggle');
  const scenes=[...document.querySelectorAll('.atmosphere-scene')];
  const visible=new Set();
  let off=false; try {off=localStorage.getItem('sareal-atmosphere')==='off';} catch (_) {}
  let current=null,idleTimer=0,frame=0,scrolling=false,glimmerTimer=0;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='tartan-last-light';svg.setAttribute('aria-hidden','true');
  const line=document.createElementNS(svg.namespaceURI,'path');svg.append(line);document.body.append(svg);
  const disabled=()=>off||reduce.matches;
  function clearScenes(immediate=false) {
    scenes.forEach(s=>{const layer=s.querySelector('.atmosphere-layer');layer.style.transition=immediate?'none':'';layer.classList.toggle('withdrawing',!immediate);layer.style.opacity='0';});
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
    if(!current)return;
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
