/* Halloween corner webs + friendly spider. Shows Oct 25 - Nov 1 (visitor's local date) only.
   Test override: ?halloween=1 (force on) or ?halloween=0 (force off). Purely decorative. */
(function(){
  try{
    var q=/[?&]halloween=([01])/.exec(location.search), d=new Date(), m=d.getMonth(), day=d.getDate();
    var on=q?q[1]==='1':((m===9&&day>=25)||(m===10&&day<=1));
    if(!on)return;
    var NS='http://www.w3.org/2000/svg';
    function web(){
      // radial strands from the corner (0,0), joined by sagging rings
      var a=[2,17,32,47,62,77,88], r=[26,52,80,110,142], p='', i, j;
      function pt(rad,deg){var t=deg*Math.PI/180;return [rad*Math.cos(t),rad*Math.sin(t)];}
      for(i=0;i<a.length;i++){var e=pt(160,a[i]);p+='M0 0L'+e[0].toFixed(1)+' '+e[1].toFixed(1);}
      for(j=0;j<r.length;j++){
        for(i=0;i<a.length-1;i++){
          var s=pt(r[j],a[i]),t=pt(r[j],a[i+1]),c=pt(r[j]*0.86,(a[i]+a[i+1])/2);
          p+=(i?'':'M'+s[0].toFixed(1)+' '+s[1].toFixed(1))+'Q'+c[0].toFixed(1)+' '+c[1].toFixed(1)+' '+t[0].toFixed(1)+' '+t[1].toFixed(1);
        }
      }
      return '<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false"><path d="'+p+'"/></svg>';
    }
    var spider='<svg class="hw-sp" viewBox="0 0 60 56" aria-hidden="true" focusable="false">'+
      '<g class="hw-legs" fill="none" stroke="#2B2350" stroke-width="2.4" stroke-linecap="round">'+
      '<path d="M22 26C14 20 9 19 4 22"/><path d="M21 30C13 28 7 30 3 35"/><path d="M22 34C15 36 10 40 8 46"/><path d="M24 37C20 42 18 46 18 52"/>'+
      '<path d="M38 26C46 20 51 19 56 22"/><path d="M39 30C47 28 53 30 57 35"/><path d="M38 34C45 36 50 40 52 46"/><path d="M36 37C40 42 42 46 42 52"/></g>'+
      '<ellipse cx="30" cy="31" rx="11" ry="10.5" fill="#2B2350"/>'+
      '<circle cx="30" cy="17" r="8.5" fill="#3A2F66"/>'+
      '<circle cx="26.6" cy="16" r="3.3" fill="#fff"/><circle cx="33.4" cy="16" r="3.3" fill="#fff"/>'+
      '<circle cx="27.2" cy="16.8" r="1.6" fill="#2B2350"/><circle cx="34" cy="16.8" r="1.6" fill="#2B2350"/>'+
      '<path d="M27.5 20.6Q30 22.6 32.5 20.6" fill="none" stroke="#FFB870" stroke-width="1.3" stroke-linecap="round"/>'+
      '<circle cx="24.6" cy="20" r="1.4" fill="#F28C28" opacity=".55"/><circle cx="35.4" cy="20" r="1.4" fill="#F28C28" opacity=".55"/>'+
      '</svg>';
    function build(){
      if(document.getElementById('hw-deco'))return;
      var box=document.createElement('div');
      box.id='hw-deco';box.setAttribute('aria-hidden','true');
      box.innerHTML='<div class="hw-web hw-l">'+web()+'</div><div class="hw-web hw-r">'+web()+'</div>'+
        '<div class="hw-drop"><div class="hw-bob"><i class="hw-thread"></i>'+spider+'</div></div>';
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
      document.documentElement.classList.add('halloween');
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
  }catch(e){}
})();
