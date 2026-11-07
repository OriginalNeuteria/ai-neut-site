/* Scroll reveals only; deliberately no persistent photographic background.
   The porch and hands scenes can let their landscapes come into view where the
   pointer travels through the empty field around the words. The page scroll is never captured. */
(() => {
  'use strict';
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  const control=document.getElementById('atmosphere-toggle');
  const scenes=[...document.querySelectorAll('.atmosphere-scene')];
  const visible=new Set();
  let off=false; try {off=localStorage.getItem('sareal-atmosphere')==='off';} catch (_) {}
  let current=null,idleTimer=0,frame=0,scrolling=false,glimmerTimer=0;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='tartan-last-light';svg.setAttribute('aria-hidden','true');
  const line=document.createElementNS(svg.namespaceURI,'path');svg.append(line);document.body.append(svg);
  const disabled=()=>off||reduce.matches;
  function fieldHeld(scene){
    const mode=scene&&scene.dataset.lakeMode;
    return mode==='reveal'||mode==='static'||mode==='depart';
  }
  function clearScenes(immediate=false) {
    scenes.forEach(s=>{
      if(fieldHeld(s))return;
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
    if(!current||fieldHeld(current))return;
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
    placeFields();
  }
  /* Porch and "A little wonder" share this fade. Each scene keeps its own
     mask and card. Nothing here listens for wheel or touch in a way that
     would pin or trap scroll. */
  const fields=[];
  let lastScrollY=window.scrollY,wheelActive=false,wheelTimer=0;
  function bindField(scene){
    const layer=scene&&scene.querySelector('.atmosphere-layer');
    if(!scene||!layer)return;
    const st={target:0,now:0,x:70,y:58,shownX:70,shownY:58,raf:0,token:0,away:0};
    const mode=()=>scene.dataset.lakeMode||'';
    function ratio(){
      const r=scene.getBoundingClientRect();
      const vis=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);
      return Math.max(0,vis)/Math.min(Math.max(r.height,1),innerHeight);
    }
    function boxes(){
      return [...scene.querySelectorAll('.atmosphere-reading .eyebrow, .atmosphere-reading h2, .atmosphere-reading > p, .atmosphere-reading a')].map(el=>el.getBoundingClientRect());
    }
    function overCopy(x,y){
      const pad=16;
      return boxes().some(r=>x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad);
    }
    function copyDistance(x,y){
      let best=Infinity;
      for(const r of boxes()){
        const dx=Math.max(r.left-x,0,x-r.right);
        const dy=Math.max(r.top-y,0,y-r.bottom);
        best=Math.min(best,Math.hypot(dx,dy));
      }
      return best;
    }
    function paint(opacity){
      if(mode()!=='reveal')return;
      layer.classList.remove('withdrawing');
      layer.style.transition='none';
      layer.style.opacity=opacity.toFixed(4);
      layer.style.setProperty('--lake-x',st.shownX.toFixed(2)+'%');
      layer.style.setProperty('--lake-y',st.shownY.toFixed(2)+'%');
      layer.style.setProperty('--lake-p',(st.shownX/100).toFixed(4));
      layer.style.setProperty('--lake-q',(st.shownY/100).toFixed(4));
    }
    function release(){
      scene.classList.remove('lake-reveal','lake-static','lake-depart');
      delete scene.dataset.lakeMode;
      layer.style.transition='';
      layer.style.opacity='';
      layer.style.removeProperty('--lake-x');
      layer.style.removeProperty('--lake-y');
      layer.style.removeProperty('--lake-p');
      layer.style.removeProperty('--lake-q');
      st.now=0;st.target=0;st.away=0;
    }
    function showStatic(reduced){
      if(mode()==='depart')return;
      if(mode()==='static'&&scene.classList.contains('lake-static'))return;
      scene.dataset.lakeMode='static';
      scene.classList.add('lake-static');
      scene.classList.remove('lake-reveal','lake-depart');
      layer.classList.remove('withdrawing');
      if(reduced){layer.style.transition='none';layer.style.opacity='';return;}
      layer.style.transition='opacity 900ms ease';
      layer.style.opacity='0.92';
      st.now=0.92;st.target=0.92;
    }
    function beginDepart(){
      if(reduce.matches||mode()==='depart')return;
      const token=++st.token;
      if(st.raf){cancelAnimationFrame(st.raf);st.raf=0;}
      const from=parseFloat(layer.style.opacity);
      scene.dataset.lakeMode='depart';
      scene.classList.add('lake-depart');
      layer.style.transition='none';
      if(!Number.isNaN(from))layer.style.opacity=String(from);
      void layer.offsetWidth;
      layer.style.transition='opacity 2200ms ease-in-out';
      void layer.offsetWidth;
      layer.style.opacity='0';
      st.target=0;
      const started=performance.now();
      const finish=()=>{
        if(token!==st.token||mode()!=='depart')return;
        if(performance.now()-started<500)return;
        st.token++;
        release();
      };
      layer.addEventListener('transitionend',function onEnd(e){
        if(e.propertyName!=='opacity')return;
        layer.removeEventListener('transitionend',onEnd);
        finish();
      });
      setTimeout(finish,2600);
    }
    function kick(){
      if(st.raf)return;
      st.raf=requestAnimationFrame(function step(){
        st.raf=0;
        if(mode()!=='reveal')return;
        st.now+=(st.target-st.now)*0.045;
        st.shownX+=(st.x-st.shownX)*0.06;
        st.shownY+=(st.y-st.shownY)*0.06;
        if(Math.abs(st.target-st.now)<0.004)st.now=st.target;
        paint(Math.max(0,st.now));
        if(st.target===0&&st.now<=0.004){release();return;}
        if(st.now!==st.target||Math.abs(st.x-st.shownX)>0.2||Math.abs(st.y-st.shownY)>0.2)kick();
      });
    }
    function place(){
      st.token++;
      release();
      if(off)return;
      if(reduce.matches){showStatic(true);return;}
      if(!fine.matches&&ratio()>0.42)showStatic(false);
    }
    function onFieldScroll(dy){
      const now=mode();
      if(!fine.matches){
        if(now==='depart')return;
        const seen=ratio();
        if(seen<0.34&&(now==='static'||now==='reveal'))beginDepart();
        else if(seen>0.45&&now!=='static')showStatic(false);
        return;
      }
      if(now==='reveal'||now==='static'){
        st.away+=Math.abs(dy);
        if(st.away>40||ratio()<0.28)beginDepart();
      }else st.away=0;
    }
    function onPointer(e){
      if(off||reduce.matches||!fine.matches)return;
      if(e.pointerType&&e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
      if(wheelActive||mode()==='depart')return;
      const bounds=scene.getBoundingClientRect();
      if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)return;
      if(overCopy(e.clientX,e.clientY))return;
      const reach=Math.min(240,Math.max(180,bounds.width*0.2));
      const dist=copyDistance(e.clientX,e.clientY);
      const t=Math.max(0,Math.min(1,dist/Math.max(reach,1)));
      st.target=Math.pow(t,0.72)*0.94;
      st.x=((e.clientX-bounds.left)/bounds.width)*100;
      st.y=((e.clientY-bounds.top)/bounds.height)*100;
      st.away=0;
      scene.dataset.lakeMode='reveal';
      scene.classList.add('lake-reveal');
      scene.classList.remove('lake-static','lake-depart');
      kick();
    }
    scene.addEventListener('pointermove',onPointer,{passive:true});
    scene.addEventListener('pointerleave',()=>{
      if(mode()!=='reveal')return;
      st.target=0;
      kick();
    });
    fields.push({place,onFieldScroll});
  }
  function placeFields(){fields.forEach(f=>f.place());}
  bindField(document.getElementById('beyond-the-porch'));
  bindField(document.getElementById('room-for-each-other'));
  if(fields.length){
    window.addEventListener('scroll',()=>{
      const dy=window.scrollY-lastScrollY;
      lastScrollY=window.scrollY;
      if(off||reduce.matches)return;
      wheelActive=true;
      clearTimeout(wheelTimer);
      wheelTimer=setTimeout(()=>{wheelActive=false;},160);
      fields.forEach(f=>f.onFieldScroll(dy));
    },{passive:true});
    fine.addEventListener('change',placeFields);
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
