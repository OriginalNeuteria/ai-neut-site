/* Ai-Neut tester page. Vanilla JS, no trackers, nothing leaves the device. */
(function(){
"use strict";
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var KEY="aineut-tester-journey-v1";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
var st=load();st.done=st.done||[];
var toastEl=$("#toast"),tt;
function toast(m){toastEl.textContent=m;toastEl.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){toastEl.classList.remove("show")},2600)}

/* reveals */
if(!reduce&&"IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
  $$(".reveal").forEach(function(el){io.observe(el)});
}else{$$(".reveal").forEach(function(el){el.classList.add("in")})}

/* hero parallax */
if(!reduce){var fr=$(".hero-t .frame"),fl=$(".floaties");
  addEventListener("scroll",function(){var y=scrollY;if(y>900)return;if(fl)fl.style.transform="translateY("+(y*.25)+"px)";if(fr)fr.style.translate="0 "+(y*-.06)+"px"},{passive:true});}

/* ---------- 14-day journey ---------- */
var days=$$(".day"),TOTAL=14;
var info={};days.forEach(function(b){var n=+b.dataset.day;info[n]={t:$("b",b).textContent.replace(/^Day \d+: /,""),s:$(".t",b).textContent,el:b}});
var QHINT={1:"Think about: was sign-up easy to understand?",3:"Think about: did the mic understand you?",5:"Think about: could you check items off easily?",8:"Think about: did anything get lost?",10:"Think about: were permissions clear?",13:"Think about: what commands should the mic learn?",14:"Flip through the question cards and email us your answers."};
function dayToday(){
  if(st.start){var d0=new Date(st.start+"T00:00:00"),now=new Date();now.setHours(0,0,0,0);var n=Math.floor((now-d0)/864e5)+1;if(n>=1&&n<=TOTAL)return n;}
  for(var i=1;i<=TOTAL;i++)if(st.done.indexOf(i)<0)return i;return TOTAL;
}
function confetti(){
  if(reduce)return;var c=document.createElement("div");c.className="confetti";c.setAttribute("aria-hidden","true");
  var cols=["#F28C28","#6B3FA0","#FFC83D","#2E9E57","#2F7FE0","#D6336C"];
  for(var i=0;i<110;i++){var p=document.createElement("i");p.style.left=Math.random()*100+"%";p.style.background=cols[i%cols.length];
    p.style.setProperty("--x",(Math.random()*200-100)+"px");p.style.setProperty("--r",(Math.random()*900)+"deg");p.style.setProperty("--t",(2+Math.random()*1.8)+"s");p.style.animationDelay=(Math.random()*.6)+"s";c.appendChild(p)}
  document.body.appendChild(c);setTimeout(function(){c.remove()},4600);
}
function render(celebrate){
  var n=st.done.length,pct=n/TOTAL;
  days.forEach(function(b){var d=+b.dataset.day;b.setAttribute("aria-pressed",st.done.indexOf(d)>=0?"true":"false")});
  $("#ringfg").style.strokeDashoffset=(314.16*(1-pct)).toFixed(2);
  $("#ringtx").textContent=n+"/14";
  $("#fill").style.width=(pct*100)+"%";$("#walker").style.left=(pct*100)+"%";
  var msg=n===0?"Tap a day when you’ve done it. Small steps, brighter days.":n<TOTAL?n+" of 14 days done. "+(n<4?"Great start!":n<8?"You’re in the groove!":n<12?"Over halfway there!":"Almost there!"):"All 14 days done. You’re amazing!";
  $("#progtx").textContent=msg;
  var t=dayToday();days.forEach(function(b){b.classList.toggle("is-today",+b.dataset.day===t)});
  $("#todayn").textContent=t;$("#todayt").textContent=info[t].t;$("#todays").textContent=info[t].s;$("#todayq").textContent=QHINT[t]||"";
  var td=$("#todaydone");td.textContent=st.done.indexOf(t)>=0?"Done ✓":"Mark today done";td.dataset.day=t;
  $("#startbtn").textContent=st.start?"Started "+new Date(st.start+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})+" (change)":"I started today";
  $("#donebanner").classList.toggle("show",n===TOTAL);
  if(celebrate&&n===TOTAL){confetti();toast("🎉 14 of 14! Thank you, tester!")}
  drawBadge();
}
function toggle(d){var i=st.done.indexOf(d),was=st.done.length;if(i>=0)st.done.splice(i,1);else{st.done.push(d);if(!st.start){var x=new Date();x.setDate(x.getDate()-(d-1));st.start=iso(x)}}
  st.done.sort(function(a,b){return a-b});save(st);render(st.done.length===TOTAL&&was<TOTAL);
  if(i<0&&st.done.length<TOTAL)toast("Day "+d+" done! "+["Nice!","Woohoo!","Keep going!","Small steps!","💜"][d%5]);}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
days.forEach(function(b){b.addEventListener("click",function(){toggle(+b.dataset.day)})});
$("#todaydone").addEventListener("click",function(){var d=+this.dataset.day;if(st.done.indexOf(d)<0)toggle(d)});
$("#startbtn").addEventListener("click",function(){st.start=iso(new Date());save(st);render();toast("Day 1 is today. Have fun!")});
$("#resetbtn").addEventListener("click",function(){if(confirm("Clear your 14-day checklist on this device?")){st={done:[]};save(st);render();toast("Checklist cleared")}});

/* ---------- Mic spotlight ---------- */
var SAYS=["“How do I add an event?”","“Where is my journal?”","“Take me to the calendar.”","“How do chores work?”","“How do I add a family member?”","“What can you help me with?”"],si=0;
var mic=$("#micbtn"),waves=$("#waves"),say=$("#say");
function nextSay(){si=(si+1)%SAYS.length;say.textContent=SAYS[si];mic.classList.add("on");waves.classList.add("on");mic.setAttribute("aria-pressed","true");clearTimeout(mic._t);mic._t=setTimeout(function(){mic.classList.remove("on");waves.classList.remove("on");mic.setAttribute("aria-pressed","false")},3200)}
mic.addEventListener("click",nextSay);$("#nextsay").addEventListener("click",nextSay);
$$("#waves i").forEach(function(w,i){w.style.animationDelay=(i*.07)+"s"});

/* ---------- Glass Newt toy ---------- */
var notes=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51],names=["C","D","E","G","A","high C","high D","high E"],gcol=["#FF8A80","#FFB74D","#FFD54F","#AED581","#4DD0E1","#64B5F6","#9575CD","#F06292"];
var row=$(".glass-row"),ac=null;
notes.forEach(function(f,i){var b=document.createElement("button");b.type="button";b.className="gbar";b.style.setProperty("--g",gcol[i]);b.style.height=(150-i*11)+"px";b.style.position="relative";
  b.innerHTML="<span>Play "+names[i]+"</span>";b.setAttribute("aria-label","Play note "+names[i]);
  b.addEventListener("click",function(){play(f);b.classList.add("hit");setTimeout(function(){b.classList.remove("hit")},160)});row.appendChild(b)});
function play(f){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();var t=ac.currentTime;
  [1,2.76].forEach(function(m,k){var o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.value=f*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(k?0.05:0.22,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+(k?0.6:1.6));o.connect(g).connect(ac.destination);o.start(t);o.stop(t+1.7)})}catch(e){}}

/* ---------- Question deck ---------- */
$$(".qcard").forEach(function(c){var f=$(".qf",c),b=$(".qb",c);b.setAttribute("aria-hidden","true");b.inert=true;
  function set(on){c.classList.toggle("flip",on);f.setAttribute("aria-hidden",on?"true":"false");f.inert=on;b.setAttribute("aria-hidden",on?"false":"true");b.inert=!on;(on?$("a",b):f).focus({preventScroll:true})}
  f.addEventListener("click",function(){set(true)});$(".back",c).addEventListener("click",function(){set(false)})});

/* ---------- Badge ---------- */
var cv=$("#bcv"),cx=cv.getContext("2d"),newt=new Image(),theme=st.theme||"sunset",sticker=st.sticker||"🌻";
newt.src="img/mascot-600.webp";newt.onload=function(){drawBadge()};
var TH={sunset:["#FFD66B","#F28C28","#6B3FA0","#2E2340"],grape:["#A97CF0","#4A2380","#FFC83D","#ffffff"],garden:["#A8E6B4","#2E7D4F","#F28C28","#13311f"],sky:["#BDE8FF","#2F5FD0","#FFC83D","#0f2148"]};
var nameIn=$("#bname");nameIn.value=st.name||"";
function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function fit(txt,max,size,weight){var s=size;do{cx.font=weight+" "+s+"px ui-rounded, 'Trebuchet MS', system-ui, sans-serif";s-=4}while(cx.measureText(txt).width>max&&s>30);}
function drawBadge(){
  var W=1080,c=TH[theme],dark=theme!=="sunset"&&theme!=="garden"&&theme!=="sky"?true:false;
  var g=cx.createLinearGradient(0,0,W,W);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);cx.fillStyle=g;cx.fillRect(0,0,W,W);
  cx.save();cx.translate(W/2,520);cx.globalAlpha=.16;cx.fillStyle="#fff";for(var i=0;i<24;i++){cx.rotate(Math.PI/12);cx.beginPath();cx.moveTo(0,0);cx.lineTo(-40,-900);cx.lineTo(40,-900);cx.fill()}cx.restore();
  cx.globalAlpha=1;cx.fillStyle="rgba(255,255,255,.9)";rr(60,60,W-120,W-120,60);cx.fill();
  cx.lineWidth=10;cx.strokeStyle=c[2];rr(60,60,W-120,W-120,60);cx.stroke();
  cx.textAlign="center";cx.fillStyle="#6B3FA0";cx.font="800 46px ui-rounded, 'Trebuchet MS', system-ui, sans-serif";cx.fillText("I’M AN OFFICIAL",W/2,168);
  fit("Ai-Neut Tester",880,124,"900");var tg=cx.createLinearGradient(160,0,920,0);tg.addColorStop(0,"#6B3FA0");tg.addColorStop(1,"#E0681A");cx.fillStyle=tg;cx.fillText("Ai-Neut Tester",W/2,290);
  if(newt.complete&&newt.naturalWidth){var nw=640,nh=nw*newt.naturalHeight/newt.naturalWidth;cx.drawImage(newt,(W-nw)/2,320,nw,nh)}
  cx.font="120px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";cx.fillText(sticker,880,450);
  var nm=(nameIn.value||"").trim();cx.fillStyle="#2E2340";
  if(nm){fit(nm,820,96,"900");cx.fillText(nm,W/2,820)}else{cx.font="800 60px ui-rounded, 'Trebuchet MS', system-ui, sans-serif";cx.fillText("Helping families",W/2,815)}
  cx.font="700 40px ui-rounded, 'Trebuchet MS', system-ui, sans-serif";cx.fillStyle="#5b4d70";cx.fillText(nm?"is helping build a journal & family organizer":"build a journal & family organizer",W/2,880);
  var n=st.done.length;cx.fillStyle=c[1];rr(W/2-230,912,460,70,35);cx.fill();cx.fillStyle="#fff";cx.font="800 38px ui-rounded, 'Trebuchet MS', system-ui, sans-serif";
  cx.fillText(n>=14?"★ 14-day test complete ★":n>0?"Day "+n+" of 14 ✓":"14-day test",W/2,960);
  cx.fillStyle="#6B3FA0";cx.font="700 32px ui-rounded, 'Trebuchet MS', system-ui, sans-serif";cx.fillText("Small Steps, Brighter Days  •  ai-neut.com",W/2,1046-20);
}
nameIn.addEventListener("input",function(){st.name=nameIn.value.slice(0,18);save(st);drawBadge()});
function radio(sel,attr,cb){$$(sel).forEach(function(b){b.addEventListener("click",function(){$$(sel).forEach(function(x){x.setAttribute("aria-checked","false")});b.setAttribute("aria-checked","true");cb(b.dataset[attr])})})}
radio(".sw","th",function(v){theme=v;st.theme=v;save(st);drawBadge()});radio(".stk","st",function(v){sticker=v;st.sticker=v;save(st);drawBadge()});
$$(".sw").forEach(function(b){b.setAttribute("aria-checked",b.dataset.th===theme?"true":"false")});$$(".stk").forEach(function(b){b.setAttribute("aria-checked",b.dataset.st===sticker?"true":"false")});
function fname(){var n=(nameIn.value||"").trim().replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");return "Ai-Neut-Tester"+(n?"-"+n:"")+".png"}
function blob(cb){if(cv.toBlob)cv.toBlob(cb,"image/png");else{var d=atob(cv.toDataURL("image/png").split(",")[1]),a=new Uint8Array(d.length);for(var i=0;i<d.length;i++)a[i]=d.charCodeAt(i);cb(new Blob([a],{type:"image/png"}))}}
function download(b){var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=fname();document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);toast("Badge saved 🎉")}
$("#bdl").addEventListener("click",function(){drawBadge();blob(download)});
$("#bsh").addEventListener("click",function(){drawBadge();blob(function(b){var f;try{f=new File([b],fname(),{type:"image/png"})}catch(e){}
  var data={title:"I’m an Ai-Neut Tester",text:"I’m helping test Ai-Neut, a journal and family organizer. Want to join? https://www.ai-neut.com/test.html"};
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})){data.files=[f];navigator.share(data).catch(function(){})}
  else if(navigator.share){navigator.share({title:data.title,text:data.text,url:"https://www.ai-neut.com/test.html"}).catch(function(){})}
  else{download(b);toast("Saved. Attach it anywhere you like!")}})});

/* ---------- Share page / copy link ---------- */
function copy(t){if(navigator.clipboard&&isSecureContext)return navigator.clipboard.writeText(t);return new Promise(function(res,rej){var ta=document.createElement("textarea");ta.value=t;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy")?res():rej()}catch(e){rej(e)}ta.remove()})}
$("#copylink").addEventListener("click",function(){copy(this.dataset.url).then(function(){toast("Link copied ✓")},function(){toast("Copy this: ai-neut.com/test.html")})});
$("#sharepage").addEventListener("click",function(){var u=this.dataset.url,t=this.dataset.text;if(navigator.share)navigator.share({title:"Be an Ai-Neut tester",text:t,url:u}).catch(function(){});else copy(t+" "+u).then(function(){toast("Message and link copied ✓")},function(){toast("Copy this: ai-neut.com/test.html")})});

/* ---------- Flyer lightbox ---------- */
var lb=$("#lb"),lbi=$("#lbimg"),opener=null;
$$("[data-full]").forEach(function(b){b.addEventListener("click",function(){opener=b;lbi.src=b.dataset.full;lbi.alt=b.dataset.alt;if(lb.showModal)lb.showModal();else window.open(b.dataset.full)})});
$("#lbx").addEventListener("click",function(){lb.close()});lb.addEventListener("click",function(e){if(e.target===lb)lb.close()});lb.addEventListener("close",function(){if(opener)opener.focus()});

render(false);
})();
