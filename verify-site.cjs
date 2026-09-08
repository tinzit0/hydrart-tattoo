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
 if(await page.locator('video').count()) throw Error('Background video remains');
 if(!await page.locator('.hero-title-mask').isVisible()) throw Error('Home title hidden');
 if(await page.locator('header p').first().evaluate(el=>getComputedStyle(el).fontStyle) !== 'normal') throw Error('Italic subtitle');
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
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();
 await page.evaluate(()=>{
   currentUser={email:ADMIN_EMAIL}; showAdminPanel();
   window.testRows=[]; window.testInsertError=null;
   window.testUploadCount=0; window.testUploadFails=true;
   uploadClientImageToStorage=async()=>{testUploadCount++;return testUploadFails ? null : 'https://example.com/reference-'+testUploadCount+'.jpg';};
   supabaseClient.from=()=>({
     select:()=>({eq:()=>({eq:async()=>({data:window.testRows,error:null})})}),
     insert:async row=>{if(window.testInsertError)return {error:window.testInsertError}; window.testRows.push(row); return {error:null};}
   });
 });
 await page.locator('#admin-new-booking summary').click();
 const form=page.locator('#admin-booking-form');
 await form.locator('[name=clientName]').fill('María Instagram');
 await form.locator('[name=clientPhone]').fill('+56912345678');
 await form.locator('[name=clientEmail]').fill('@maria');
 await form.locator('[name=date]').fill('2026-12-15');
 await form.locator('[name=time]').fill('14:00');
 const photo={name:'reference.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aE2kAAAAASUVORK5CYII=','base64')};
 await page.locator('#admin-booking-photos').setInputFiles([photo,{...photo,name:'reference-2.png'}]);
 if(await page.locator('#admin-booking-photo-previews img').count()!==2)throw Error('Multiple photo previews missing');
 await form.locator('button[type=submit]').click();
 await page.getByText('No se pudo guardar. Revisa la conexión e inténtalo nuevamente.',{exact:true}).waitFor();
 if(await page.evaluate(()=>testRows.length)!==0 || await page.locator('#admin-booking-photo-previews img').count()!==2)throw Error('Upload failure lost photos or saved incomplete booking');
 await page.evaluate(()=>testUploadFails=false);
 await form.locator('button[type=submit]').click();
 await page.getByText('Hora confirmada y registrada correctamente.',{exact:true}).waitFor();
 if(!await page.evaluate(()=>testRows.length===1 && testRows[0].status==='Confirmada' && bookings.some(b=>b.id===testRows[0].id)))throw Error('Manual booking not persisted');
 if(!await page.evaluate(()=>getBookingImageUrls({imageUrl:testRows[0].image_url}).length===2 && getBookingImageUrls({imageUrl:'https://example.com/old.jpg'}).length===1))throw Error('Photo persistence or legacy compatibility');
 if(await page.locator('#admin-booking-photo-previews img').count())throw Error('Photo previews not reset');
 await page.locator('.booking-reference').nth(1).click();
 if(!await page.evaluate(()=>document.querySelector('#lightbox-img')?.src.includes('reference-')))throw Error('Reference lightbox missing');
 await page.evaluate(()=>closeLightbox());
 if(!await page.evaluate(()=>{config.daySchedules['2026-12-15']={active:true,slots:['14:00']};return isDayFullyBookedOrClosed('2026-12-15');}))throw Error('Manual booking still available publicly');
 await page.locator('#admin-search').fill('maria');
 if(await page.locator('#admin-bookings-table tr').count()!==1)throw Error('Search by unaccented name');
 await page.locator('#admin-search').fill('no-match');
 if(!await page.locator('#admin-bookings-table').innerText().then(t=>t.includes('No hay registros')))throw Error('Search empty result');
 await form.locator('[name=clientName]').fill('Otra persona');
 await form.locator('[name=clientPhone]').fill('123456789');
 await form.locator('[name=date]').fill('2026-12-15');
 await form.locator('[name=time]').fill('14:00');
 await form.locator('button').click();
 await page.getByText('Ese horario ya está tomado. Elige otra hora.',{exact:true}).waitFor();
 if(await page.evaluate(()=>testRows.length)!==1)throw Error('Duplicate booking inserted');
 await page.evaluate(()=>{testRows=[];testInsertError={code:'23505'};});
 await form.locator('button').click();
 await page.getByText('Ese horario acaba de ser tomado. Elige otra hora.',{exact:true}).waitFor();
 if(await form.locator('[name=clientName]').inputValue()!=='Otra persona')throw Error('Form lost after error');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile admin overflow');
 await page.evaluate(()=>{
   dataLoaded=true;
   delete config.daySchedules['2026-12-15'];
   currentUser=null; updateAuthUI(); navigateTo('agenda');
   clientCalendarViewDate=new Date(2026,11,1); renderClientCalendar();
 });
 await page.locator('#client-calendar-grid button').filter({hasText:/^15$/}).click();
 const occupied=page.locator('#client-slots-container button').filter({hasText:'14:00 (Ocupado)'});
 if(!await occupied.isVisible() || !await occupied.isDisabled())throw Error('Off-schedule manual booking must be visible and disabled');
 if(await page.locator('#client-slots-container').innerText().then(t=>t.includes('Instagram')))throw Error('Public agenda leaks client');
 await page.evaluate(()=>{config.daySchedules['2026-12-15']={active:true,slots:['16:00']};renderClientSlots();});
 if(!await occupied.isDisabled() || !await page.locator('#client-slots-container button').filter({hasText:/^16:00$/}).isEnabled())throw Error('Mixed booked and available slots');
 await page.evaluate(()=>{config.blockedDates.push('2026-12-15');renderClientSlots();});
 if(await page.locator('#client-slots-container button:enabled').count())throw Error('Blocked day reopened');
 if(!await occupied.isVisible())throw Error('Blocked day hides booking');
 await page.evaluate(()=>{
   currentUser={email:ADMIN_EMAIL};showAdminPanel();switchAdminTab('config');
   selectedAdminDate='2026-12-15';selectedAdminDayState={active:false,slots:[]};renderAdminSelectedDayPanel();
 });
 if(!await page.locator('#admin-day-slots-list').getByText('14:00 (Ocupado)',{exact:true}).isVisible())throw Error('Admin agenda missing occupied slot');
 await page.evaluate(()=>{
   bookings.find(b=>b.date==='2026-12-15' && b.time==='14:00').status='Cancelada';
   config.blockedDates=[];delete config.daySchedules['2026-12-15'];renderClientSlots();
 });
 if(await page.locator('#client-slots-container button').count())throw Error('Cancelled manual slot became public availability');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: simple home, public detail, booking selection, admin editing, manual booking persistence, occupied slot, search, duplicate protection, mobile layout; no JS errors.');
} finally {await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
