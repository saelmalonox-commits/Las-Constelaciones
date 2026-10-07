(() => {
'use strict';
const SCHEMA_VERSION='2026.09.06-v1.6';
const TYPES=new Set(['family','individual','decision','relationship','project','energetic','free']);
const DEPTHS=new Set(['suave','normal','profunda']);
const uniq=a=>[...new Set((a||[]).map(x=>String(x||'').trim()).filter(Boolean))];
const text=(v,max=600)=>String(v??'').trim().slice(0,max);
const idify=s=>text(s,90).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'practica';
const isHealthTopic=s=>/(c[aá]ncer|tumor|enfermedad|diagn[oó]stico|condici[oó]n de salud|diabetes|card[ií]ac|hipertensi[oó]n|autoinmune|epileps|asma|dolor cr[oó]nico|tratamiento|quimioterapia|cirug[ií]a|medicaci[oó]n|salud f[ií]sica|s[ií]ntoma psicosom|psicosom[aá]tic|cansancio cr[oó]nico)/i.test(String(s||''));
function question(q){if(typeof q==='string')return {q:text(q,280),type:'text',ph:'Describe lo que notas sin intentar acertar.'};if(!q||typeof q!=='object')return null;const out={q:text(q.q,280)};if(!out.q)return null;if(Array.isArray(q.opts)&&q.opts.length)out.opts=uniq(q.opts).slice(0,8);else {out.type=['piece','intuitive-piece','text'].includes(q.type)?q.type:'text';if(out.type==='text')out.ph=text(q.ph||'Describe lo que notas.',180)}return out}
function normalizePlan(raw={}){
 const type=TYPES.has(raw.type)?raw.type:'free';
 const depth=DEPTHS.has(raw.intensity)?raw.intensity:'normal';
 const reps=uniq(raw.representatives||raw.pieces||[]).slice(0,40);
 if(!reps.some(x=>/^yo\b/i.test(x)))reps.unshift('Yo');
 while(reps.length<2)reps.push(reps.length?'Recurso':'Tema');
 const p=raw.protocol||{};
 const qs=(p.observationQuestions||raw.observationQuestions||[]).map(question).filter(Boolean).slice(0,40);
 const movements=(p.movementExperiments||raw.movementExperiments||[]).map(x=>typeof x==='string'?{label:text(x,180)}:{label:text(x?.label||x?.instruction,180),when:text(x?.when,140)}).filter(x=>x.label).slice(0,16);
 const phrases=uniq(p.phrases||raw.phrases||[]).slice(0,16);
 const closing=(p.closingSteps||raw.closingSteps||[]).map(x=>typeof x==='string'?{title:text(x,180),text:''}:{title:text(x?.title,180),text:text(x?.text,320)}).filter(x=>x.title).slice(0,8);
 const integration=uniq(p.integrationActivities||raw.integrationActivities||[]).slice(0,12);
 const anchoringRaw=p.anchoring&&typeof p.anchoring==='object'?p.anchoring:{};
 const anchoring=normalizeAnchoring(anchoringRaw,type,reps);
 return {
   schemaVersion:SCHEMA_VERSION,
   id:text(raw.id,100)||`generated-${idify(raw.title||raw.topic||'constelacion')}-${Date.now().toString(36)}`,
   title:text(raw.title||raw.topic||'Constelación personalizada',120),
   category:text(raw.category||type,60), type, solo:raw.solo!==false,
   intensity:depth, minutes:Math.max(5,Math.min(60,Number(raw.minutes)||15)),
   description:text(raw.description||'Constelación generada dinámicamente a partir del tema del practicante.',500),
   intention:text(raw.intention||`Quiero observar ${text(raw.topic||raw.title||'este tema',220).toLowerCase()}, leer qué señalan las posiciones y considerar varias posibilidades antes de elegir un movimiento o recurso.`,520),
   lifeAreas:uniq(raw.lifeAreas||raw.areas||[]).slice(0,8),
   healthSensitive:!!(raw.healthSensitive||isHealthTopic([raw.title,raw.topic,raw.description,...(raw.lifeAreas||[])].join(' '))),
   representatives:reps,
   protocol:{
     openingHint:text(p.openingHint||raw.openingHint||'Llega al cuerpo, mira el espacio y permite que las piezas se elijan sin intentar resolver el tema de antemano.',420),
     observationQuestions:qs.length?qs:defaultQuestions(type),
     movementExperiments:movements.length?movements:defaultMovements(type,reps),
     anchoring,
     phrases,
     phraseCategory:text(p.phraseCategory||raw.phraseCategory||defaultPhraseCategory(type),40),
     closingPrompt:text(p.closingPrompt||raw.closingPrompt||'Compara el inicio y el final, identifica la lectura que más reorganiza el campo y reconoce qué recurso o movimiento quieres llevar contigo.',420),
     closingSteps:closing,
     integrationActivities:integration.length?integration:['Escribir una frase','Caminar unos minutos','Dibujar la configuración','Elegir una acción pequeña','Descansar y volver al entorno'],
     branchingRules:Array.isArray(p.branchingRules)?p.branchingRules.slice(0,40):[],
     allowIntuitiveFigures:p.allowIntuitiveFigures!==false,
     allowHypothesisExpansion:p.allowHypothesisExpansion!==false,
     readingStyle:text(p.readingStyle||raw.readingStyle||'multiple-possibilities',40),
     generated:true
   },
   generator:{source:text(raw.generator?.source||raw.source||'local',40),createdAt:raw.generator?.createdAt||new Date().toISOString(),topic:text(raw.generator?.topic||raw.topic||raw.title,500),catalogId:text(raw.generator?.catalogId||raw.catalogId,120),topicGroup:text(raw.generator?.topicGroup||raw.topicGroup,80)}
 };
}
function defaultPhraseCategory(type){return ({family:'belonging',relationship:'boundaries',decision:'decisions',project:'resources',individual:'autonomy',energetic:'resources',free:'resources'})[type]||'resources'}
function defaultQuestions(type){
 const map={
  family:['¿Qué figura llama primero tu atención?','¿Qué distancia o orientación dentro de la escena te sorprende?','¿Hay alguna ausencia, rama o figura que tu intuición quiera representar?','¿Qué cambia si observas la escena desde tu propio lugar?'],
  relationship:['¿Qué notas entre tú, la otra persona y el vínculo?','¿Dónde aparece el límite en esta escena?','¿Qué parece acercar y qué parece separar?','¿Qué pequeño cambio te gustaría probar?'],
  decision:['¿Qué opción atrae primero tu atención?','¿Qué cambia en tu cuerpo al mirar cada posibilidad?','¿Qué miedo, deseo o recurso necesita una pieza propia?','¿Desde dónde puedes mirar ambas opciones con más perspectiva?'],
  project:['¿Qué queda entre tú y el objetivo?','¿Qué obstáculo podría estar bloqueando, protegiendo o señalando algo?','¿Dónde está el recurso respecto de ti?','¿Cuál sería un primer paso suficientemente pequeño?'],
  energetic:['¿Qué sensación o presencia simbólica llama primero tu atención?','¿Dónde se siente más intensa o más ligera la escena?','¿Qué interpretación intuitiva te aparece antes de cualquier explicación?','¿Qué recurso, límite o protección quieres representar?'],
  individual:['¿Qué parte interna llama primero tu atención?','¿Qué postura, distancia o energía tendría esa parte?','¿Qué podría intentar proteger, pedir o evitar?','¿Qué aparece desde una posición testigo?'],
  free:['¿Qué pieza llama primero tu atención?','¿Qué relación espacial te resulta más significativa?','¿Tu intuición pide añadir alguna figura, ausencia o recurso?','¿Qué pequeño experimento quieres probar?']
 };
 return (map[type]||map.free).map((q,i)=>i===0?{q,type:'piece'}:{q,type:'text',ph:'Describe lo que notas o escribe “no lo sé”.'});
}
function defaultMovements(type,reps){const a=reps[0]||'Yo',b=reps[1]||'Tema';return [
 {label:`Prueba cambiar ligeramente la distancia entre ${a} y ${b}; después compara cómo se siente.`},
 {label:'Gira una sola pieza unos grados y observa qué cambia antes de hacer otro movimiento.'},
 {label:type==='family'?'Si tu intuición señala una ausencia o rama no representada, añade una figura simbólica y déjala encontrar su lugar.':'Si aparece algo importante que aún no tiene pieza, puedes añadir una figura intuitiva y observar qué cambia.'},
 {label:'Si el cambio empeora la escena, vuelve a la configuración anterior y conserva la información del contraste.'}
]}
function defaultAnchoring(type,reps){
 const first=reps[0]||'Yo';
 const body={
  family:[`Mira a ${first} dentro de la nueva configuración y haz tres respiraciones lentas sin mover las fichas.`,'Siente ambos pies y nota cómo cambia tu postura al mantener esta nueva distancia.','Si te resulta natural, reproduce con tu cuerpo la dirección del movimiento de la ficha principal.'],
  relationship:[`Respira mirando el espacio entre ${first} y la otra figura, sin reducir ni aumentar la distancia.`,'Siente los pies y nota dónde aparece tu límite corporal.','Haz un gesto pequeño con las manos que represente acercamiento, distancia o reciprocidad.'],
  decision:[`Colócate de pie y siente hacia qué dirección se orienta ${first} después del movimiento.`,'Da un paso físico muy pequeño en la dirección que represente el cambio y vuelve al centro.','Respira tres veces mirando las opciones sin elegir otra cosa todavía.'],
  project:[`Mira a ${first}, el proyecto y el recurso; respira mientras sostienes la nueva relación entre ellos.`,'Da un paso físico que represente el próximo movimiento posible y vuelve a tu lugar.','Siente los pies y endereza suavemente la postura antes de continuar.'],
  energetic:[`Respira mirando la configuración y siente el contacto de los pies con el suelo mientras mantienes la nueva posición.`,'Pasa una mano lentamente por delante del cuerpo como gesto de límite o espacio, si eso corresponde al movimiento.','Permanece unos instantes con la postura que te haga sentir más presente y estable.'],
  individual:[`Mira a ${first} y la parte que cambió; respira tres veces sin modificar nada.`,'Coloca una mano donde notes más claramente el cambio corporal y deja la otra relajada.','Reproduce con el cuerpo, de forma pequeña, la dirección o postura que tomó la ficha principal.'],
  free:[`Mira a ${first} y la figura que más cambió; respira tres veces sin hacer otro movimiento.`,'Siente ambos pies y deja que el cuerpo encuentre una postura que acompañe la nueva imagen.','Haz un gesto mínimo que represente el movimiento que acabas de probar.']
 }[type]||[];
 const symbolic={
  family:['Elige una palabra para el lugar que ahora ocupa cada figura.','Toca suavemente la ficha que más cambió y luego retira la mano.','Dibuja una línea o flecha sencilla que represente la nueva relación.'],
  relationship:['Elige una palabra para la nueva distancia o forma de vínculo.','Toca primero tu ficha y después el espacio entre ambas figuras.','Elige un objeto pequeño que represente el límite, la cercanía o la reciprocidad observada.'],
  decision:['Elige una palabra para la dirección que ahora se siente más visible.','Señala con un dedo el camino que representa el movimiento sin mover ninguna ficha.','Dibuja una flecha breve entre tu posición actual y la dirección que quieres recordar.'],
  project:['Elige una palabra para el próximo paso que la nueva configuración hace visible.','Toca la ficha del recurso y después la del proyecto.','Anota una flecha o símbolo pequeño que represente el avance observado.'],
  energetic:['Elige una palabra para la cualidad energética que quieres conservar: límite, calma, claridad, protección, expansión u otra.','Toca la ficha de recurso o protección y después vuelve las manos a una posición neutral.','Dibuja un símbolo simple que represente la organización energética actual.'],
  individual:['Elige una palabra para la nueva relación entre tus partes internas.','Toca tu ficha y luego la pieza que representa el recurso.','Dibuja un símbolo pequeño que recuerde la postura o dirección que cambió.'],
  free:['Elige una palabra breve para el movimiento que quieres recordar.','Toca la ficha principal y observa qué sensación aparece.','Dibuja una flecha, distancia o símbolo simple de la nueva configuración.']
 }[type]||[];
 const transfer={
  family:['¿Qué gesto pequeño en tu vida familiar representa esta nueva distancia, lugar o límite?','¿Qué podrías hacer una sola vez esta semana para recordar el lugar que apareció en el campo?'],
  relationship:['¿Qué gesto concreto de comunicación, límite, cercanía o espacio representa este movimiento fuera del campo?','¿Qué acción pequeña puede expresar la nueva posición sin exigir un resultado de la otra persona?'],
  decision:['¿Cuál es el paso más pequeño que encarna esta nueva orientación sin obligarte a resolver toda la decisión hoy?','¿Qué información o acción concreta puedes realizar para acercarte a la dirección que apareció?'],
  project:['¿Qué tarea de menos de 20 minutos representa el movimiento que acabas de probar?','¿Qué recurso puedes acercar a tu proyecto en la vida cotidiana?'],
  energetic:['¿Qué gesto cotidiano de descanso, límite, orden, protección o limpieza representa esta nueva organización para ti?','¿Qué práctica breve quieres repetir para recordar esta sensación de espacio o presencia?'],
  individual:['¿Qué gesto de autocuidado, límite, expresión o elección representa esta nueva posición interna?','¿Qué acción pequeña puede recordarte el recurso que apareció?'],
  free:['¿Qué acción pequeña y concreta representa este movimiento fuera de la constelación?','¿Qué gesto simple podría ayudarte a recordar esta nueva imagen durante los próximos días?']
 }[type]||[];
 return {enabled:true,reflectionQuestions:['¿Qué cambió en tu percepción, respiración, emoción, tensión, mirada o impulso después del movimiento?','¿Qué aspecto de esta nueva imagen quieres recordar antes de seguir?'],bodyOptions:body,symbolicOptions:symbolic,transferPrompts:transfer,allowSkip:true};
}
function normalizeAnchoring(raw,type,reps){const d=defaultAnchoring(type,reps);const list=(v,max=8)=>uniq(v).slice(0,max);return {enabled:raw.enabled!==false,reflectionQuestions:list(raw.reflectionQuestions).length?list(raw.reflectionQuestions):d.reflectionQuestions,bodyOptions:list(raw.bodyOptions).length?list(raw.bodyOptions):d.bodyOptions,symbolicOptions:list(raw.symbolicOptions).length?list(raw.symbolicOptions):d.symbolicOptions,transferPrompts:list(raw.transferPrompts).length?list(raw.transferPrompts):d.transferPrompts,allowSkip:raw.allowSkip!==false};}
function inferType(topic=''){const t=topic.toLowerCase();if(/mam|pap|famil|herman|abu|ancestro|adop|origen/.test(t))return 'family';if(/pareja|relaci|v[ií]nculo|ex\b/.test(t))return 'relationship';if(/decid|opci[oó]n|elegir|camino/.test(t))return 'decision';if(/proyecto|trabajo|dinero|negocio|meta|objetivo/.test(t))return 'project';if(/energ|presencia|bruj|protecci|limpieza|carga/.test(t))return 'energetic';if(/miedo|emoci|parte de m[ií]|yo interno|ansiedad|deseo|cuerpo|salud|enfermedad/.test(t))return 'individual';return 'free'}
function repsFor(topic,type){const base={family:['Yo','Figura o vínculo principal','Mi lugar','Lo que conozco','Lo que desconozco','Límite','Recurso'],relationship:['Yo','Otra persona','El vínculo','Lo que acerca','Lo que distancia','Límite','Necesidad','Recurso'],decision:['Yo','Opción A','Opción B','Miedo','Deseo','Consecuencia posible','Recurso','Testigo'],project:['Yo','Objetivo / proyecto','Obstáculo percibido','Recurso','Primer paso','Tarea futura'],energetic:['Yo','Sensación o energía percibida','Lo que pesa','Lo que expande','Límite','Protección','Recurso'],individual:['Yo actual','Parte que siente','Parte que protege','Parte que quiere avanzar','Necesidad','Testigo','Recurso'],free:['Yo','Tema','Lo que quiero','Lo que me detiene','Lo desconocido','Recurso']}[type]||[];const t=topic.trim();return uniq(t?[...base.slice(0,1),t,...base.slice(1)]:base).slice(0,12)}
function groupProtocol(group,type,reps,topic){
 const first=reps[0]||'Yo', second=reps[1]||'Tema central', third=reps[2]||'Recurso';
 const groupLens={
  family_origin:['pertenencia','orden entre generaciones','exclusión o ausencia','lealtad o patrón','duelo o legado','recurso actual'],
  couple_current:['reciprocidad','intimidad','comunicación','límites','familias de origen','proyecto compartido'],
  personal_emotional:['necesidad','protección','emoción','identidad','límite','dirección personal'],
  addictions:['impulso','función que cumple la conducta','duelo o vacío','pertenencia','lealtad familiar','alternativa o recurso'],
  professional_economic:['autoridad','valor','intercambio','éxito o fracaso','lealtad familiar','próximo paso'],
  social_collective:['pertenencia','poder','exclusión','identidad cultural','institución o grupo','recurso comunitario'],
  existential_spiritual:['sentido','cambio','trascendencia','ciclos','vida y muerte','sabiduría interior'],
  modality_individual:['experiencia íntima','parte interna','necesidad','protección','testigo','recurso'],
  modality_couple:['vínculo','sistemas de origen','intimidad','comunicación','decisión compartida','reparación'],
  modality_energetic:['intensidad','vínculo sutil','bloqueo','carga','protección','expansión']
 };
 const lenses=groupLens[group]||['vínculo','distancia','orientación','límite','recurso','dirección'];
 const questions=[
  {q:`¿Qué figura llama primero tu atención al mirar “${topic}”?`,type:'piece'},
  {q:`¿Qué te sugiere la distancia entre ${first} y ${second}?`,type:'text',ph:`Puedes considerar varias posibilidades relacionadas con ${lenses[0]}, ${lenses[1]} u otra lectura que aparezca.`},
  {q:`¿Qué puede estar señalando la orientación o postura de ${third}?`,type:'text',ph:`Mira si se asocia con ${lenses[2]}, ${lenses[3]}, protección, acercamiento, retirada o algo distinto.`},
  {q:'Si esta configuración tuviera tres lecturas posibles, ¿cuáles serían?',type:'text',ph:'Puedes formular una lectura sistémica, una relacional o vital y una intuitiva.'},
  {q:'¿Hay una persona, ausencia, contexto, recurso o aspecto del tema que ahora necesite una pieza propia?',type:'intuitive-piece'},
  {q:'¿Qué pequeño movimiento reversible permitiría comprobar qué lectura toma más fuerza al cambiar la configuración?',opts:['Acercar una pieza','Alejar una pieza','Girar una pieza','Cambiar postura','Añadir una figura','Observar sin mover']}
 ];
 const movements=[
  {label:`Cambia ligeramente la distancia entre ${first} y ${second}; compara qué posibilidad aparece antes y después.`,when:'Cuando la cercanía o distancia sea significativa.'},
  {label:`Gira ${third} entre 15° y 45° y observa qué cambia en la lectura del conjunto.`,when:'Cuando la orientación o la mirada parezcan relevantes.'},
  {label:'Añade una figura que represente una persona, ausencia, carga, contexto o recurso que sientas importante y deja que encuentre su lugar.',when:'Cuando percibas que falta algo para comprender mejor el campo.'},
  {label:'Haz un solo cambio cada vez; si la configuración resulta menos útil, usa Deshacer y conserva lo aprendido del contraste.',when:'Siempre que quieras comparar sin perder la posición previa.'}
 ];
 const phrases=[
  `Puedo mirar este tema desde más de una posibilidad y observar cuál toma fuerza en el campo.`,
  `Puedo reconocer ${lenses[4]} y también abrir espacio para ${lenses[5]}.`
 ];
 const closingSteps=[
  {title:'Observa la configuración final.',text:'Nombra qué cambió en distancias, orientaciones, posturas, grupos o vacíos.'},
  {title:'Elige la lectura que más te sirve hoy.',text:'Conserva una posibilidad principal y deja abiertas las alternativas que todavía necesiten tiempo.'},
  {title:'Vuelve a tu propio lugar.',text:'Mira tu pieza y reconoce qué límite, recurso, decisión o dirección quieres llevar a la vida cotidiana.'}
 ];
 return {openingHint:'Coloca las piezas sin construir una explicación previa. Primero observa distancias, orientaciones, posturas, grupos, vacíos y el lugar de cada figura.',observationQuestions:questions,movementExperiments:movements,anchoring:defaultAnchoring(type,reps),phrases,phraseCategory:defaultPhraseCategory(type),closingPrompt:'Mira el conjunto final, reconoce la lectura principal y dos alternativas, retira las piezas lentamente y vuelve al entorno.',closingSteps,integrationActivities:['Escribir la lectura principal y dos alternativas','Dibujar la configuración final','Caminar unos minutos','Elegir una acción pequeña y concreta','Descansar y volver al entorno'],branchingRules:[{if:'user_requests_interpretation',then:'offer_multiple_probable_readings'},{if:'interpretation_does_not_resonate',then:'offer_alternative_readings_without_discrediting'},{if:'user_notices_missing_figure',then:'offer_intuitive_figure'},{if:'movement_feels_worse',then:'offer_undo'},{if:'user_wants_more_depth',then:'deepen_with_position_orientation_posture_and_systemic_associations'}],allowIntuitiveFigures:true,allowHypothesisExpansion:true,readingStyle:'multiple-possibilities'};
}
function generateLocal(request={}){
 const topic=text(request.topic||request.text||request.title||'Exploración libre',500);
 const type=TYPES.has(request.type)?request.type:inferType(topic);
 const provided=uniq(request.representatives||[]).slice(0,40);
 const reps=provided.length>=2?provided:uniq([...(request.representatives||[]),...repsFor(topic,type)]).slice(0,16);
 const intensity=DEPTHS.has(request.intensity)?request.intensity:'normal';
 const topicGroup=text(request.topicGroup||request.group||request.generator?.topicGroup,80);
 const protocol=groupProtocol(topicGroup,type,reps,topic);
 return normalizePlan({title:request.title||topic,type,category:request.category||type,intensity,minutes:request.minutes||(intensity==='profunda'?25:intensity==='suave'?10:15),topic,topicGroup,description:request.description||`Constelación completa para explorar “${topic}” con lectura de posiciones, varias posibilidades, movimientos reversibles, anclaje del movimiento, cierre e integración.`,intention:request.intention||`Quiero observar ${topic.toLowerCase()}, leer qué señalan las posiciones y relaciones del campo, considerar varias posibilidades, anclar el movimiento que resulte significativo y reconocer qué recurso me orienta mejor.`,representatives:reps,healthSensitive:!!(request.healthSensitive||isHealthTopic(topic)),lifeAreas:uniq(request.lifeAreas||request.areas||[]).slice(0,8),protocol,generator:{source:request.generator?.source||request.source||'local',topic,catalogId:request.catalogId||request.generator?.catalogId||'',topicGroup,createdAt:new Date().toISOString()}})
}
function toExercise(plan){return normalizePlan(plan)}
function clonePlan(plan){const p=normalizePlan(plan);p.id=`custom-${idify(p.title)}-${Date.now().toString(36)}`;p.title=`${p.title} · copia`;p.generator={...p.generator,source:'duplicate',createdAt:new Date().toISOString()};return p}
window.CampoConstellationFactory=Object.freeze({schemaVersion:SCHEMA_VERSION,normalizePlan,generateLocal,toExercise,clonePlan,inferType});
})();
