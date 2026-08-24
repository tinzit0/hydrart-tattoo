const SUPABASE_URL = 'https://kxldsjodgfonrrlwjbws.supabase.co';
const SUPABASE_KEY = 'sb_publishable_J5s_2YqtASIYSqu2k00SGA_copdr39x';
const db = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);

const defaultSchedule = {1:['10:00','14:00','17:00'],2:['10:00','14:00','17:00'],3:['10:00','14:00','17:00'],4:['10:00','14:00','17:00'],5:['10:00','14:00'],6:['11:00','15:00']};
let schedule = defaultSchedule;
let bookings = [];
let viewDate = new Date(); viewDate.setDate(1);
let selectedDate = ''; let selectedTime = '';
const $ = (s) => document.querySelector(s);

function isoLocal(date){ const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}` }
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500)}
function availableTimes(date){ const weekday=new Date(`${date}T12:00:00`).getDay(); return (schedule[weekday]||[]).filter(time=>!bookings.some(b=>b.booking_date===date&&b.booking_time.slice(0,5)===time&&b.status!=='cancelled')); }

function renderCalendar(){
  const grid=$('#calendar-grid'); grid.innerHTML='';
  $('#month-label').textContent=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(viewDate);
  const first=(viewDate.getDay()+6)%7; const days=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0).getDate();
  for(let i=0;i<first;i++) grid.append(document.createElement('span'));
  const today=isoLocal(new Date());
  for(let n=1;n<=days;n++){
    const date=new Date(viewDate.getFullYear(),viewDate.getMonth(),n,12); const iso=isoLocal(date); const has=(schedule[date.getDay()]||[]).length>0&&availableTimes(iso).length>0; const btn=document.createElement('button');
    btn.type='button';btn.className=`day ${has&&iso>=today?'available':''} ${iso===selectedDate?'selected':''}`;btn.textContent=n;btn.disabled=iso<today||!has;btn.addEventListener('click',()=>selectDate(iso));grid.append(btn);
  }
}
function selectDate(iso){selectedDate=iso;selectedTime='';renderCalendar();const d=new Date(`${iso}T12:00:00`);$('#selected-date-label').textContent=new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(d);$('#time-fieldset').disabled=false;renderTimes()}
function renderTimes(){const wrap=$('#time-slots');wrap.innerHTML='';availableTimes(selectedDate).forEach(t=>{const b=document.createElement('button');b.type='button';b.className='time-slot';b.textContent=t;b.onclick=()=>{selectedTime=t;wrap.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active')};wrap.append(b)})}

async function loadData(){
  if(!db){toast('No se pudo iniciar la agenda.');renderCalendar();return}
  try{
    const [{data:setting},{data:rows,error}] = await Promise.all([db.from('hydrart_settings').select('value').eq('key','schedule').maybeSingle(),db.rpc('hydrart_public_availability',{from_date:isoLocal(new Date())})]);
    if(setting?.value) schedule=setting.value; if(error) throw error; bookings=rows||[];
  }catch(e){console.warn('Agenda usando horario base:',e.message)}
  renderCalendar();
}

$('#booking-form').addEventListener('submit',async e=>{
  e.preventDefault();const status=$('#form-status');if(!selectedDate||!selectedTime){status.textContent='Elige una fecha y un horario.';return}
  const fd=new FormData(e.currentTarget);const code=`HYD-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
  const payload={booking_date:selectedDate,booking_time:selectedTime,client_name:fd.get('client_name').trim(),instagram:fd.get('instagram').trim().replace(/^@/,''),phone:fd.get('phone').trim(),email:fd.get('email').trim()||null,idea:fd.get('idea').trim(),booking_code:code,status:'pending'};
  status.textContent='Enviando tu solicitud…';
  try{const {error}=await db.from('hydrart_bookings').insert(payload);if(error)throw error;bookings.push(payload);renderCalendar();e.currentTarget.reset();selectedTime='';status.innerHTML=`Solicitud recibida. Guarda tu código: <strong>${code}</strong>`;toast('Tu solicitud fue enviada correctamente.')}catch(err){console.error(err);status.textContent=err.code==='23505'?'Ese horario acaba de ser reservado. Elige otro.':'No pudimos guardar la solicitud. Revisa la configuración de Supabase.'}
});

$('#lookup-form').addEventListener('submit',async e=>{
  e.preventDefault();const code=new FormData(e.currentTarget).get('code').trim().toUpperCase();const out=$('#lookup-result');out.textContent='Buscando…';
  try{const {data,error}=await db.rpc('hydrart_lookup_booking',{lookup_code:code});if(error)throw error;const row=data?.[0];if(!row){out.textContent='No encontramos una reserva con ese código.';return}const labels={pending:'Solicitud recibida',reviewing:'En revisión',confirmed:'Confirmada',cancelled:'Cancelada'};out.innerHTML=`<div class="result-card"><div><small>Fecha</small><strong>${escapeHtml(new Intl.DateTimeFormat('es-CL',{dateStyle:'long'}).format(new Date(row.booking_date+'T12:00:00')))}</strong></div><div><small>Hora</small><strong>${escapeHtml(row.booking_time.slice(0,5))}</strong></div><div><small>Estado</small><strong>${escapeHtml(labels[row.status]||row.status)}</strong></div></div>`}catch(err){out.textContent='No fue posible consultar en este momento.'}
});

$('#prev-month').onclick=()=>{const now=new Date();now.setDate(1);if(viewDate>now){viewDate.setMonth(viewDate.getMonth()-1);renderCalendar()}};
$('#next-month').onclick=()=>{viewDate.setMonth(viewDate.getMonth()+1);renderCalendar()};
$('.menu').onclick=()=>{const nav=$('.nav');nav.classList.toggle('open');$('.menu').setAttribute('aria-expanded',nav.classList.contains('open'))};
document.querySelectorAll('.nav a').forEach(a=>a.onclick=()=>$('.nav').classList.remove('open'));
const observer=new IntersectionObserver(entries=>entries.forEach(x=>x.isIntersecting&&x.target.classList.add('visible')),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
loadData();
