import {mkdir,copyFile,rm,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const publicFiles=['index.html','styles.css','app.js','data.js','state.js','favicon.svg'];
for(const file of ['app.js','data.js','state.js','server/ai.js','api/firm.js'])execFileSync(process.execPath,['--check',file]);
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of publicFiles){const content=await readFile(file,'utf8');if(/sk-(?:proj-)?[A-Za-z0-9_-]{25,}/.test(content))throw Error('Secret detected in public assets');await copyFile(file,'dist/'+file)}
console.log('Built THE BRIEF. 2.0. Six public assets; server code excluded.');
