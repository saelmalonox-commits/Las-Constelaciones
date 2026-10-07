(() => {
'use strict';
let live=null,liveAudio=null,liveStream=null,processor=null,source=null,playCtx=null,nextPlay=0;
const status=()=>document.getElementById('gemini-live-status');
function toast(msg){if(window.MiCampo?.toast)window.MiCampo.toast(msg);else console.log('[Las Constelaciones · Gemini]',msg)}
function snapshot(){return window.MiCampo?.masterSnapshot?.()||null}
function commandFromText(text){const t=(text||'').toLowerCase();if(!t)return false;
 if(/\b(emergencia|ayuda urgente|estoy en peligro|peligro inmediato)\b/.test(t))return MiCampo.masterAction('emergency');
 if(/\b(pausa|pausar)\b/.test(t))return MiCampo.masterAction('pause');
 if(/\b(repite|repetir|otra vez)\b/.test(t))return MiCampo.masterAction('repeat');
 if(/\b(deshacer|atrás el movimiento|volver movimiento)\b/.test(t))return MiCampo.masterAction('undo');
 if(/\b(anclar|anclaje|ancla este movimiento|fijar este movimiento)\b/.test(t))return MiCampo.masterAction('anchor');
 if(/\b(ya (está|esta)|ya coloqu[eé]|colocada|guardar posición)\b/.test(t))return MiCampo.masterAction('placed');
 if(/\b(historial)\b/.test(t))return MiCampo.masterAction('go',{route:'history'});
 if(/\b(biblioteca)\b/.test(t))return MiCampo.masterAction('go',{route:'library'});
 if(/\b(ajustes|configuración|configuracion)\b/.test(t))return MiCampo.masterAction('go',{route:'settings'});
 if(/\b(oc[eé]ano)\b/.test(t))return MiCampo.masterAction('world',{world:'ocean'});
 if(/\b(bosque)\b/.test(t))return MiCampo.masterAction('world',{world:'forest'});
 if(/\b(tormenta|estelar)\b/.test(t))return MiCampo.masterAction('world',{world:'storm'});
 if(/\b(modo claro|tema claro|claro)\b/.test(t))return MiCampo.masterAction('mode',{mode:'light'});
 if(/\b(modo oscuro|tema oscuro|oscuro)\b/.test(t))return MiCampo.masterAction('mode',{mode:'dark'});
 if(/\b(continuar|contin[uú]a|seguir)\b/.test(t))return MiCampo.masterAction('continue');
 return false}
let rpcSeq=0;const rpcPending=new Map();addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='mi-universo:backend-response')return;const p=rpcPending.get(e.data.requestId);if(!p)return;rpcPending.delete(e.data.requestId);e.data.error?p.reject(new Error(e.data.error)):p.resolve(e.data.data)});
function backendCall(op,payload={}){if(window.parent===window)return Promise.reject(new Error('Gemini de Constelaciones requiere abrirse dentro de MI UNIVERSO.'));const requestId=`campo-${Date.now()}-${++rpcSeq}`;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{rpcPending.delete(requestId);reject(new Error('Tiempo agotado al contactar el backend de MI UNIVERSO.'))},30000);rpcPending.set(requestId,{resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}});parent.postMessage({type:'mi-universo:backend-call',requestId,op,payload},location.origin)})}
async function geminiStatus(){return backendCall('health')}
async function generateConstellation(request={}){return backendCall('campo-generate',request)}
async function ask(text,context=snapshot()){const data=await backendCall('campo-facilitate',{text,context});if(data.action?.name)MiCampo.masterAction(data.action.name,data.action.args||{});if(data.reply)toast(data.reply);return data}
function wavBlobFromPcmB64(base64,sampleRate=24000,channels=1){const pcm=b64ToBytes(base64),dataSize=pcm.byteLength,buf=new ArrayBuffer(44+dataSize),v=new DataView(buf),u=new Uint8Array(buf);const str=(o,x)=>{for(let i=0;i<x.length;i++)u[o+i]=x.charCodeAt(i)};str(0,'RIFF');v.setUint32(4,36+dataSize,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,dataSize,true);u.set(pcm,44);return new Blob([buf],{type:'audio/wav'})}
async function speak(text,experience={}){const data=await backendCall('campo-tts',{text,experience});const blob=wavBlobFromPcmB64(data.audioB64,data.sampleRate||24000,data.channels||1),url=URL.createObjectURL(blob),a=new Audio(url);a.onended=()=>URL.revokeObjectURL(url);await a.play();return a}
function f32ToPcm16(float32){const b=new ArrayBuffer(float32.length*2),v=new DataView(b);for(let i=0;i<float32.length;i++){const s=Math.max(-1,Math.min(1,float32[i]));v.setInt16(i*2,s<0?s*0x8000:s*0x7fff,true)}return new Uint8Array(b)}
function bytesToB64(bytes){let bin='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)bin+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(bin)}
function b64ToBytes(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
async function playPcm24(base64){const bytes=b64ToBytes(base64),samples=new Int16Array(bytes.buffer,bytes.byteOffset,Math.floor(bytes.byteLength/2));playCtx=playCtx||new (window.AudioContext||window.webkitAudioContext)({sampleRate:24000});const buf=playCtx.createBuffer(1,samples.length,24000),ch=buf.getChannelData(0);for(let i=0;i<samples.length;i++)ch[i]=samples[i]/32768;const src=playCtx.createBufferSource();src.buffer=buf;const gain=playCtx.createGain();const world=document.documentElement.dataset.world||'ocean';if(world==='ocean'){const f=playCtx.createBiquadFilter();f.type='lowpass';f.frequency.value=3300;src.connect(f).connect(gain)}else src.connect(gain);gain.connect(playCtx.destination);nextPlay=Math.max(nextPlay,playCtx.currentTime+.02);src.start(nextPlay);nextPlay+=buf.duration}
async function startLive(context=snapshot()){if(live)return;const tok=await backendCall('campo-live-token',{context});
 const ws=new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(tok.token)}`);live=ws;
 ws.onopen=async()=>{ws.send(JSON.stringify({setup:{model:`models/${tok.model}`,generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:tok.voice||'Kore'}}}},systemInstruction:{parts:[{text:tok.systemInstruction}]},inputAudioTranscription:{},outputAudioTranscription:{}}}));liveStream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});liveAudio=new (window.AudioContext||window.webkitAudioContext)({sampleRate:16000});source=liveAudio.createMediaStreamSource(liveStream);processor=liveAudio.createScriptProcessor(2048,1,1);processor.onaudioprocess=e=>{if(ws.readyState!==1)return;const pcm=f32ToPcm16(e.inputBuffer.getChannelData(0));ws.send(JSON.stringify({realtimeInput:{audio:{data:bytesToB64(pcm),mimeType:`audio/pcm;rate=${liveAudio.sampleRate}`}}}))};source.connect(processor);processor.connect(liveAudio.destination);document.dispatchEvent(new CustomEvent('campo:live',{detail:{active:true}}));toast('La conversación de voz está activa.');};
 ws.onmessage=e=>{const msg=JSON.parse(e.data);const sc=msg.serverContent;if(sc?.inputTranscription?.text){const text=sc.inputTranscription.text;document.dispatchEvent(new CustomEvent('campo:transcript',{detail:{text}}));commandFromText(text)}if(sc?.modelTurn?.parts)for(const part of sc.modelTurn.parts)if(part.inlineData?.data)playPcm24(part.inlineData.data);if(sc?.outputTranscription?.text)document.dispatchEvent(new CustomEvent('campo:voicetext',{detail:{text:sc.outputTranscription.text}}));};
 ws.onerror=()=>toast('La conversación Live tuvo un error.');ws.onclose=()=>stopLive(false);
}
function stopLive(closeSocket=true){if(closeSocket&&live?.readyState===1)try{live.send(JSON.stringify({realtimeInput:{audioStreamEnd:true}}));live.close()}catch{};processor?.disconnect?.();source?.disconnect?.();liveStream?.getTracks?.().forEach(t=>t.stop());liveAudio?.close?.();live=null;processor=null;source=null;liveStream=null;liveAudio=null;document.dispatchEvent(new CustomEvent('campo:live',{detail:{active:false}}))}
async function toggleLive(context){if(live){stopLive();toast('Conversación de voz detenida.');return false}await startLive(context);return true}
window.CampoGemini={status:geminiStatus,ask,generateConstellation,speak,startLive,stopLive,toggleLive,commandFromText};
})();
