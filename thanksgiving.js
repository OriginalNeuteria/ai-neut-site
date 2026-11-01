/* Thanksgiving leaves: warm corner leaf clusters, a small pie, and a short gentle leaf fall.
   Shows from Nov 1 through the Friday after Thanksgiving (4th Thursday of November), visitor's local date.
   Test override: ?thanksgiving=1 (force on) or ?thanksgiving=0 (force off). Purely decorative. */
(function(){
  try{
    var q=/[?&]thanksgiving=([01])/.exec(location.search), d=new Date(), y=d.getFullYear(), m=d.getMonth(), day=d.getDate();
    var first=new Date(y,10,1).getDay(), tg=1+((4-first+7)%7)+21; /* 4th Thursday of November */
    var on=q?q[1]==='1':(m===10&&day<=tg+1);
    if(!on)return;
    var C=['#C8553D','#E08E2B','#D9A441','#B5472F','#9A6A33','#F28C28'];
    function maple(c){return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path fill="'+c+'" d="M50 4L58 26L70 18L67 38L88 32L80 48L96 54L74 64L78 76L56 70L53 90L47 90L44 70L22 76L26 64L4 54L20 48L12 32L33 38L30 18L42 26Z"/><path d="M50 30V97M50 58L33 45M50 58L67 45" stroke="rgba(70,35,15,.35)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';}
    function oval(c){return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path fill="'+c+'" d="M50 6C78 24 84 60 50 90C16 60 22 24 50 6Z"/><path d="M50 16V97M50 44L36 34M50 44L64 34M50 62L34 52M50 62L66 52" stroke="rgba(70,35,15,.35)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';}
    var pie='<svg class="tg-pie" viewBox="0 0 80 46" aria-hidden="true" focusable="false">'+
      '<ellipse cx="40" cy="34" rx="38" ry="10" fill="#fff" stroke="#E6D6C3" stroke-width="1.5"/>'+
      '<path d="M8 26Q8 38 40 38Q72 38 72 26Z" fill="#C98545"/>'+
      '<ellipse cx="40" cy="25" rx="32" ry="9" fill="#E9B872"/>'+
      '<g stroke="#B86B2E" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".9">'+
      '<path d="M22 19L34 33M34 17L48 34M48 16L60 31M58 17L46 33M44 16L30 33M30 17L19 29"/></g>'+
      '<path d="M8 25Q8 31 14 33M72 25Q72 31 66 33" stroke="#B86B2E" stroke-width="2" fill="none"/></svg>';
    function corner(side,extra){
      var s=side==='l'
        ?'<i style="--x:6px;--y:-6px;--r:-28deg;--s:1">'+maple(C[0])+'</i><i style="--x:44px;--y:-14px;--r:22deg;--s:.78">'+oval(C[2])+'</i><i style="--x:-6px;--y:34px;--r:-70deg;--s:.7">'+oval(C[1])+'</i><i style="--x:34px;--y:24px;--r:8deg;--s:.6">'+maple(C[3])+'</i>'
        :'<i style="--x:10px;--y:-8px;--r:24deg;--s:.9">'+maple(C[1])+'</i><i style="--x:52px;--y:-12px;--r:-18deg;--s:.66">'+oval(C[0])+'</i><i style="--x:-2px;--y:30px;--r:64deg;--s:.62">'+oval(C[4])+'</i>';
      return '<div class="tg-corner tg-'+side+'">'+s+(extra||'')+'</div>';
    }
    function fall(n){
      var h='',i;
      for(i=0;i<n;i++){
        var c=C[i%C.length], left=(6+i*(88/(n-1||1)))+(i%2?3:-3), dur=11+(i*37%7), delay=(i*53%9)*0.9, sz=18+(i*29%14), sway=(i%2?1:-1)*(24+(i*17%26));
        h+='<b class="tg-leaf" style="left:'+left.toFixed(1)+'%;--dur:'+dur+'s;--delay:'+delay.toFixed(1)+'s;--sz:'+sz+'px;--sway:'+sway+'px"><span>'+(i%3?oval(c):maple(c))+'</span></b>';
      }
      return '<div class="tg-fall">'+h+'</div>';
    }
    function build(){
      if(document.getElementById('tg-deco'))return;
      var small=window.matchMedia&&window.matchMedia('(max-width:560px)').matches;
      var box=document.createElement('div');
      box.id='tg-deco';box.setAttribute('aria-hidden','true');
      box.innerHTML=corner('l')+corner('r','<span class="tg-pie-wrap">'+pie+'</span>')+fall(small?5:9);
      document.body.appendChild(box);
      var nav=document.querySelector('nav');
      function place(){
        var top=0;
        if(nav){var b=nav.getBoundingClientRect();top=b.bottom+(window.pageYOffset||document.documentElement.scrollTop||0);}
        box.style.top=Math.round(top)+'px';
      }
      place();
      window.addEventListener('resize',place,{passive:true});
      window.addEventListener('load',place);
      if(window.ResizeObserver){try{new ResizeObserver(place).observe(document.body);}catch(e){}}
      document.documentElement.classList.add('thanksgiving');
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
  }catch(e){}
})();
