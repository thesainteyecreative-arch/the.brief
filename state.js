import {seedThreads, matters, questions, lessons} from './data.js';
export const STORAGE_KEY='the-brief-v2';
export const uid=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const easternDay=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function weekDates(date=new Date(),offset=0){const base=new Date(`${easternDay(date)}T12:00:00Z`);base.setUTCDate(base.getUTCDate()-((base.getUTCDay()+6)%7)+offset*7);return Array.from({length:7},(_,i)=>{const d=new Date(base);d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10)});}
export function initialState(){return {version:2,threads:structuredClone(seedThreads),read:[],drafts:{},sessions:{},notes:{},statuses:{},answers:{},lessons:[],tasks:{},activity:[],legacy:null};}
const record=x=>x&&typeof x==='object'&&!Array.isArray(x);
const cleanString=(x,max=20000)=>typeof x==='string'?x.slice(0,max):'';
const safeId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
export function normalizeState(raw){
 if(!record(raw)||raw.version!==2)throw Error('Choose a THE BRIEF. 2.0 backup, or an original THE BRIEF. progress backup.');
 const state=initialState();
 const cleanMessages=items=>Array.isArray(items)?items.filter(m=>record(m)&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-2000).map(m=>({role:m.role,content:cleanString(m.content),...(typeof m.at==='string'?{at:m.at}:{}),...(record(m.scores)?{scores:Object.fromEntries(['professionalism','neutrality','clarity','analysis'].map(k=>[k,Math.min(5,Math.max(0,Number(m.scores[k])||0))]))}:{})})):[];
 if(Array.isArray(raw.threads)){state.threads=raw.threads.slice(0,200).filter(t=>record(t)&&safeId(t.id)&&matters.some(m=>m.id===t.matterId)).map(t=>{const m=matters.find(m=>m.id===t.matterId);return {id:t.id,matterId:m.id,department:m.department,subject:cleanString(t.subject,200),sender:cleanString(t.sender,100),initials:cleanString(t.initials,4),preview:cleanString(t.preview,200),messages:cleanMessages(t.messages)}});for(const seed of seedThreads)if(!state.threads.some(t=>t.id===seed.id))state.threads.push(structuredClone(seed));}
 state.read=Array.isArray(raw.read)?raw.read.filter(safeId).slice(0,200):[];
 for(const key of ['drafts','notes','tasks'])if(record(raw[key]))for(const [k,v] of Object.entries(raw[key]).slice(0,3000)){if(safeId(k)&&(key==='tasks'?typeof v==='boolean':typeof v==='string'))state[key][k]=key==='tasks'?v:cleanString(v);}
 if(record(raw.statuses))for(const m of matters)if(['In progress','On hold','Completed'].includes(raw.statuses[m.id]))state.statuses[m.id]=raw.statuses[m.id];
 if(record(raw.sessions))for(const [key,s] of Object.entries(raw.sessions)){if(safeId(key)&&record(s)&&matters.some(m=>m.id===s.matterId))state.sessions[key]={id:key,matterId:s.matterId,title:cleanString(s.title,200),messages:cleanMessages(s.messages),completed:s.completed===true};}
 if(record(raw.answers))for(const q of questions){const a=raw.answers[q.id];if(record(a)&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.options.length)state.answers[q.id]={choice:a.choice,at:cleanString(a.at,50)};}
 state.lessons=Array.isArray(raw.lessons)?[...new Set(raw.lessons.filter(id=>lessons.some(l=>l.id===id)))]:[];
 state.activity=Array.isArray(raw.activity)?raw.activity.filter(a=>record(a)&&typeof a.text==='string'&&typeof a.at==='string'&&!Number.isNaN(Date.parse(a.at))).slice(-3000).map(a=>({text:cleanString(a.text,300),at:a.at,type:cleanString(a.type,30)})):[];
 state.legacy=record(raw.legacy)?raw.legacy:null;
 return state;
}
export function migrateLegacy(raw){
 if(!record(raw)||!record(raw.answered)||!record(raw.caseNotes)||!Array.isArray(raw.lessons))throw Error('This file is not a valid THE BRIEF. backup.');
 const s=initialState(),map=['lr1','lr2','lr3','rc1','lr4'];
 for(const [k,v] of Object.entries(raw.answered)){const id=map[+k],q=questions.find(q=>q.id===id);if(q&&Number.isInteger(v)&&v>=0&&v<4){let choice=v;if(id==='lr2')choice=[1,0,2,3][v];if(id==='lr3'){const choices=[2,0,3,4];choice=choices[v];}s.answers[id]={choice,at:''};}}
 if(raw.lessons.includes(0))s.lessons.push('contracts');if(raw.lessons.includes(2))s.lessons.push('irac');
 s.notes.redline=Object.entries(raw.caseNotes).filter(([k,v])=>!k.startsWith('review')&&typeof v==='string').map(([k,v])=>`Original assignment ${Number(k)+1}\n${v}`).join('\n\n').slice(0,20000);
 s.legacy={importedAt:new Date().toISOString(),caseStep:Number(raw.caseStep)||0,lessons:raw.lessons.filter(Number.isInteger)};
 return s;
}
export function parseBackup(text){if(text.length>5_000_000)throw Error('This backup is too large (maximum 5 MB).');const raw=JSON.parse(text);return raw?.version===2?normalizeState(raw):migrateLegacy(raw);}
export function loadState(storage){try{const current=storage.getItem(STORAGE_KEY);if(current)return normalizeState(JSON.parse(current));const old=storage.getItem('the-brief-v1');if(old)return migrateLegacy(JSON.parse(old));}catch{}return initialState();}
export function stats(state){const answers=Object.entries(state.answers),correct=answers.filter(([id,a])=>questions.find(q=>q.id===id)?.answer===a.choice).length;const responses=Object.values(state.sessions).flatMap(s=>s.messages).concat(state.threads.flatMap(t=>t.messages)).filter(m=>m.role==='user').length;const reviews=Object.values(state.sessions).flatMap(s=>s.messages).concat(state.threads.flatMap(t=>t.messages)).filter(m=>m.scores).map(m=>m.scores);return {answered:answers.length,correct,accuracy:answers.length?Math.round(correct/answers.length*100):null,responses,reviews,completed:matters.filter(m=>state.statuses[m.id]==='Completed').length};}

// Prefer the latest conversation with trainee work over accidental empty restarts.
export function resumableSession(state,matterId){
 const sessions=Object.values(state.sessions).filter(s=>s.matterId===matterId);
 const active=sessions.filter(s=>s.messages.some(m=>m.role==='user')||state.drafts[s.id]?.trim());
 return (active.length?active:sessions).sort((a,b)=>{
  const last=s=>Date.parse(s.messages.at(-1)?.at||'')||0;
  return last(b)-last(a);
 })[0];
}
