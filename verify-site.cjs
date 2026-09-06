const {chromium} = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
(async()=>{
const server = http.createServer((req,res)=>{
 const p = path.join(process.cwd(), decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
 if (!p.startsWith(process.cwd())) {res.writeHead(403).end(); return;}
 try {res.setHeader('Content-Type', p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'image/jpeg');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}
}).listen(5174,'127.0.0.1');
let browser;
try{
 browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page = await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174'); await page.waitForTimeout(3500);
 await page.evaluate(()=>navigateTo('designs'));
 await page.locator('.design-preview').first().click();
 await page.getByRole('heading',{name:'Descripción y significado'}).waitFor();
 await page.getByRole('button',{name:'Agendar este diseño',exact:true}).click();
 if(await page.evaluate(()=>location.hash)!=='#agendar') throw Error('Agenda route');
 if(!await page.locator('#client-notes').inputValue().then(v=>v.includes('HYD-001')))throw Error('Design selection missing');
 if(await page.locator('.page-edit-button').count())throw Error('Public edit controls');
 await page.evaluate(()=>{currentUser={email:ADMIN_EMAIL}; updateAuthUI(); navigateTo('designs'); supabaseClient.from=()=>({upsert:async()=>({error:null})});});
 if(await page.locator('#public-add-design').count() !== 1) throw Error('Public design add control missing');
 await page.evaluate(()=>navigateTo('gallery'));
 if(await page.locator('#public-add-gallery').count() !== 1) throw Error('Public gallery add control missing');
 await page.locator('#public-add-gallery').click();
 await page.getByRole('heading',{name:'Añadir imagen a la galería'}).waitFor();
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();
 await page.evaluate(()=>navigateTo('designs'));
 await page.getByRole('button',{name:'Editar',exact:true}).first().click();
 await page.locator('[name=price]').fill('$55.000');
 await page.locator('textarea[name=description]').fill('Descripción de prueba <segura>');
 await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
 await page.getByText('Descripción de prueba <segura>',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();
 await page.evaluate(()=>navigateTo('artist'));
 await page.locator('#estudio .page-edit-button').first().click();
 await page.locator('[name=text]').fill('Titular de prueba');
 await page.getByRole('button',{name:'Guardar cambios',exact:true}).click();
 await page.getByText('Titular de prueba',{exact:true}).waitFor();
 await page.evaluate(()=>{currentUser=null;updateAuthUI();navigateTo('agenda');window.scrollTo(0,900)});
 await page.waitForTimeout(500);
 const rect=await page.locator('#navbar').boundingBox(); if(Math.abs(rect.y)>1)throw Error('Navbar hidden: '+JSON.stringify(rect));
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>navigateTo('designs'));
 await page.locator('.design-preview').first().click();
 if(await page.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth))throw Error('Dialog overflow');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: public detail, selected booking, admin price/description/text, logout controls, sticky nav, mobile dialog; no JS errors.');
} finally {await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
