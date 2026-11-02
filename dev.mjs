import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import handler from './server/ai.js';
const root=path.dirname(new URL(import.meta.url).pathname);
const publicFiles=new Set(['index.html','styles.css','app.js','data.js','state.js','favicon.svg']);
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/firm'){
  let size=0,body='';for await(const chunk of req){size+=chunk.length;if(size>500000){res.writeHead(413);res.end('{"error":"Request too large."}');return;}body+=chunk;}
  req.body=body;res.status=n=>{res.statusCode=n;return res};res.json=x=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(x));return res};await handler(req,res);return;
 }
 if(pathname==='/__mobile_qa.html'){res.setHeader('Content-Type','text/html');res.end(await readFile(path.join(root,'scripts/mobile-qa.html')));return;}
 const name=pathname==='/'?'index.html':pathname.slice(1);if(!publicFiles.has(name)){res.writeHead(404);res.end('Not found');return;}
 try{res.setHeader('Content-Type',mime[path.extname(name)]);res.end(await readFile(path.join(root,name)));}catch{res.writeHead(404);res.end('Not found');}
});
const portArg=process.argv.indexOf('--port');
server.listen(Number(portArg>=0?process.argv[portArg+1]:process.env.PORT)||3000,'0.0.0.0',()=>console.log(`THE BRIEF. preview: http://localhost:${server.address().port}`));
