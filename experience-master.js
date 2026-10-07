(() => {
'use strict';
const ROOT_ID='master-experience-layer';
let lastKey='';let sfxCtx=null;
const counts={ocean:28,forest:34,storm:30};
function density(base){const mobile=matchMedia('(max-width:520px)').matches;const session=document.body?.dataset?.route==='session';const factor=session?.36:mobile?.55:1;return Math.max(8,Math.round(base*factor))}
function getMode(){return document.documentElement.dataset.theme==='normal'?'light':'dark'}
function getWorld(){return document.documentElement.dataset.world||'ocean'}
function node(cls,i){const e=document.createElement('i');e.className=cls;e.style.setProperty('--i',i);e.style.setProperty('--x',`${(i*37)%101}%`);e.style.setProperty('--d',`${7+(i%9)*1.7}s`);e.style.setProperty('--delay',`${-(i%12)*.71}s`);e.style.setProperty('--scale',(.55+(i%7)*.13).toFixed(2));return e}
function ensure(){let r=document.getElementById(ROOT_ID);if(!r){r=document.createElement('div');r.id=ROOT_ID;r.setAttribute('aria-hidden','true');document.body.prepend(r)}return r}
function build(){const r=ensure(),w=getWorld(),m=getMode(),route=document.body?.dataset?.route||'home',key=w+'-'+m+'-'+(route==='session'?'session':'normal');if(key===lastKey)return;lastKey=key;r.className=`master-world master-${w} master-${m} is-transforming`;r.replaceChildren();
 const bg=document.createElement('div');bg.className='master-world-bg';r.append(bg);
 if(w==='ocean'){for(let i=0;i<density(counts.ocean);i++)r.append(node('mw-bubble',i));r.append(node('mw-whale',1),node('mw-mermaid',2),node('mw-crystals mw-left',3),node('mw-crystals mw-right',4));if(m==='light'){for(let i=0;i<12;i++)r.append(node('mw-fish',i));r.append(node('mw-coral',1),node('mw-seahorse',2))}}
 if(w==='forest'){for(let i=0;i<density(counts.forest);i++)r.append(node(i%3?'mw-firefly':'mw-spore',i));for(let i=0;i<11;i++)r.append(node(m==='dark'?'mw-leaf':'mw-petal',i));r.append(node('mw-trunk mw-left',1),node('mw-trunk mw-right',2),node('mw-animal',3));if(m==='light'){for(let i=0;i<9;i++)r.append(node('mw-butterfly',i));r.append(node('mw-birds',1))}}
 if(w==='storm'){for(let i=0;i<density(18);i++)r.append(node('mw-star',i));for(let i=0;i<density(8);i++)r.append(node('mw-comet',i));r.append(node('mw-aurora mw-a1',1),node('mw-aurora mw-a2',2),node('mw-lightning mw-l1',3),node('mw-lightning mw-l2',4));if(m==='light'){r.append(node('mw-cloud mw-c1',1),node('mw-cloud mw-c2',2))}}
 setTimeout(()=>r.classList.remove('is-transforming'),2050);document.dispatchEvent(new CustomEvent('campo:experiencechange',{detail:{world:w,mode:m}}));
}
function settings(){try{return JSON.parse(localStorage.getItem('la-constelacion-soy-yo.settings.v1')||localStorage.getItem('campo.settings.v2')||localStorage.getItem('mi-campo.settings.v1')||'{}')}catch{return {}}}
function sfx(kind='tap'){const st=settings();if(st.ambient===false)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;sfxCtx=sfxCtx||new C();const c=sfxCtx,o=c.createOscillator(),g=c.createGain(),w=getWorld();o.connect(g).connect(c.destination);o.type=w==='storm'?'square':w==='forest'?'triangle':'sine';o.frequency.setValueAtTime(w==='storm'?410:w==='forest'?520:680,c.currentTime);o.frequency.exponentialRampToValueAtTime(w==='storm'?180:w==='forest'?340:420,c.currentTime+.14);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.028,c.currentTime+.012);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.16);o.start();o.stop(c.currentTime+.18)}catch{}}
new MutationObserver(build).observe(document.documentElement,{attributes:true,attributeFilter:['data-world','data-theme']});
new MutationObserver(build).observe(document.body,{attributes:true,attributeFilter:['data-route']});
document.addEventListener('DOMContentLoaded',()=>{build();document.addEventListener('pointerdown',e=>{if(e.target.closest('button,.btn,.choice,.pill,.world-card,.nav-item'))sfx()},{passive:true})});
window.MiCampoExperienceMaster={refresh:build,get world(){return getWorld()},get mode(){return getMode()}};
})();
