var SH1='https://docs.google.com/spreadsheets/d/1oBuUI3m6z_mRxKnzDuzZseqMZ9kOp4_vm_DMS7ghzpo/gviz/tq?tqx=out:csv&sheet=Marzo';
var SH2='https://docs.google.com/spreadsheets/d/1BfB80DmKnR2XKu8gPB2tc-z-xH9CvtgH60cU4SjfQgU/gviz/tq?tqx=out:csv&sheet=PAGOS';
var MES={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,octubre:10,noviembre:11,diciembre:12};
function showTab(id,el){document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active');});document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});document.getElementById(id).classList.add('active');el.classList.add('active');}
function csv(t){var R=[],rw=[],c='',q=false;for(var i=0;i<t.length;i++){var ch=t[i];if(ch==='"'){if(q&&t[i+1]==='"'){c+='"';i++;}else q=!q;}else if(ch===','&&!q){rw.push(c);c='';}else if((ch==='\n'||ch==='\r')&&!q){if(ch==='\r'&&t[i+1]==='\n')i++;rw.push(c);c='';R.push(rw);rw=[];}else c+=ch;}if(rw.length){rw.push(c);R.push(rw);}return R;}
function pm(v){if(!v||!v.trim()||v.trim()==='?')return null;var s=v.replace(/\$/g,'').trim().replace(/\./g,'').replace(',','.');var n=parseFloat(s);return isNaN(n)?null:n;}
function fm(n){if(n===null||n===undefined)return '&#8212;';if(n===0)return '$0';return '$'+Math.round(n).toLocaleString('es-AR');}
function pf(col1){if(!col1)return null;var m=col1.match(/,\s*(\d+)\s+de\s+(\w+)/i);if(!m)return null;var dd=+m[1],mes=MES[m[2].toLowerCase()];if(!mes)return null;return mes+'/'+dd+'/2026';}
function dl(fe){var p=fe.split('/');if(p.length!==3)return fe;var d=new Date(+p[2],+p[0]-1,+p[1]);var dn=['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];var mn=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Sep','Oct','Nov','Dic'];return dn[d.getDay()]+' '+d.getDate()+' '+mn[+p[0]-1]+' '+p[2];}
function it(fe){var p=fe.split('/');if(p.length!==3)return false;var n=new Date();return +p[0]-1===n.getMonth()&&+p[1]===n.getDate()&&+p[2]===n.getFullYear();}
function paf(s){if(!s||!s.trim())return '';var m=s.match(/(\d+)[\s\/](\w+)[\s\/](\d{4})/);if(!m)return '';var dd=+m[1],mesStr=m[2].toLowerCase(),yr=+m[3];var mNum=MES[mesStr]||(isNaN(+mesStr)?0:+mesStr);if(!mNum)return '';return mNum+'/'+dd+'/'+yr;}
function planB(pp){if(!pp)return '';if(pp.toUpperCase().indexOf('FULL')>=0)return '<span class="badge badge-fp">Full Pay</span>';return '<span class="badge badge-cu">Cuotas</span>';}
function stB(ps){if(!ps)return '';if(ps.toLowerCase().indexOf('complet')>=0)return '<span class="badge badge-comp">&#10003; Completado</span>';if(ps.toLowerCase().indexOf('activ')>=0)return '<span class="badge badge-pend">&#9203; Activo</span>';return '';}
async function run(){
  document.getElementById('lu').textContent='Actualizando...';
  try{
    var r1=await fetch(SH1+'&t='+Date.now()).then(function(r){return r.text();});
    var r2=await fetch(SH2+'&t='+Date.now()).then(function(r){return r.text();});
    var rows1=csv(r1),rows2=csv(r2);
    var ses=[];
    for(var i=1;i<rows1.length;i++){var rw=rows1[i];var fe=pf(rw[1]);if(!fe)continue;ses.push({nombre:rw[2]?rw[2].trim():'',fecha:fe,monto:rw[11]?rw[11].trim():'',montoN:pm(rw[11]),planStatus:rw[15]?rw[15].trim():'',totalCollected:pm(rw[16]),remaining:pm(rw[17]),planPago:rw[19]?rw[19].trim():'',payMethod:rw[13]?rw[13].trim():''});}
    var adm=[];
    for(var i=1;i<rows2.length;i++){var rw=rows2[i];if(!rw[1]||!rw[1].trim())continue;var fe=paf(rw[13]),p1=pm(rw[5]),p2=pm(rw[7]),p3=pm(rw[9]),p4=pm(rw[11]),tot=(p1||0)+(p2||0)+(p3||0)+(p4||0);adm.push({nombre:rw[1]?rw[1].trim():'',email:rw[2]?rw[2].trim():'',canal:rw[3]?rw[3].trim():'',reembolso:rw[4]?rw[4].trim():'',pago1:p1,fechaP1:rw[6]?rw[6].trim():'',pago2:p2,pago3:p3,pago4:p4,fechaAgenda:fe,hora:rw[14]?rw[14].trim():'',estado:rw[15]?rw[15].trim():'',totalPagado:tot,esCuotas:p2!==null||p3!==null||p4!==null,reembolsado:!!(rw[4]&&rw[4].trim())});}
    renderT1(ses);renderT2(adm);renderT3(ses,adm);
    var nd=new Date();document.getElementById('lu').textContent='Actualizado: '+nd.toLocaleTimeString('es-AR')+' - Auto 60s';
  }catch(e){document.getElementById('lu').textContent='Error: '+e.message;console.error(e);}
}
function renderT1(ses){
  var c=document.getElementById('t1');if(!ses.length){c.innerHTML='<div class="msg">Sin sesiones.</div>';return;}
  var tot=ses.length,comp=ses.filter(function(s){return s.montoN!==null&&s.montoN>0;}),cash=comp.reduce(function(a,s){return a+s.montoN;},0),rate=tot>0?Math.round(comp.length/tot*100):0;
  var fpay=ses.filter(function(s){return s.planPago&&s.planPago.toUpperCase().indexOf('FULL')>=0;}).length;
  var cuot=ses.filter(function(s){return s.planPago&&s.planPago.toUpperCase().indexOf('FULL')<0&&s.planPago.trim()!=='';}).length;
  var h='<div class="kgrid">';
  h+='<div class="kcard"><div class="lbl">Total Agendadas</div><div class="val b">'+tot+'</div></div>';
  h+='<div class="kcard"><div class="lbl">Compraron</div><div class="val g">'+comp.length+'</div><div class="sub">de '+tot+' sesiones</div></div>';
  h+='<div class="kcard"><div class="lbl">Cash 1ra Llamada</div><div class="val g">'+fm(cash)+'</div></div>';
  h+='<div class="kcard"><div class="lbl">Tasa de Cierre</div><div class="val y">'+rate+'%</div><div class="prog-bar"><div class="prog-fill" style="width:'+rate+'%"></div></div></div>';
  h+='<div class="kcard"><div class="lbl">Full Pay</div><div class="val p">'+fpay+'</div></div>';
  h+='<div class="kcard"><div class="lbl">En Cuotas</div><div class="val b">'+cuot+'</div></div></div>';
  var g={},o=[];for(var s of ses){if(!g[s.fecha]){g[s.fecha]=[];o.push(s.fecha);}g[s.fecha].push(s);}
  for(var fe of o){
    var ls=g[fe],lab=dl(fe),hoy=it(fe),dcomp=ls.filter(function(x){return x.montoN!==null&&x.montoN>0;}),dcash=dcomp.reduce(function(a,x){return a+x.montoN;},0);
    h+='<div class="dsec"><div class="dhdr"><h2>'+lab+'</h2>'+(hoy?'<span class="hoy">HOY</span>':'')+'<span class="dcnt">'+dcomp.length+'/'+ls.length+' compraron &middot; '+fm(dcash)+'</span></div>';
    h+='<table class="tbl"><thead><tr><th>#</th><th>Nombre</th><th>1ra Llamada</th><th>Plan</th><th>Status</th></tr></thead><tbody>';
    ls.forEach(function(s,i){var mCl='emp',mDp='&#8212;';if(s.montoN!==null&&s.montoN>0){mCl='paid';mDp=fm(s.montoN);}else if(s.monto&&s.monto!==''){mCl='zero';mDp=s.monto;}h+='<tr><td style="color:#475569">'+(i+1)+'</td><td style="font-weight:500">'+(s.nombre||'-')+'</td><td class="'+mCl+'">'+mDp+'</td><td>'+planB(s.planPago)+'</td><td>'+stB(s.planStatus)+'</td></tr>';});
    h+='</tbody></table></div>';
  }
  c.innerHTML=h;
}
function renderT2(adm){
  var c=document.getElementById('t2');if(!adm.length){c.innerHTML='<div class="msg">Sin datos.</div>';return;}
  var ag=adm.filter(function(a){return a.fechaAgenda;}),sa=adm.filter(function(a){return !a.fechaAgenda;}),re=adm.filter(function(a){return a.reembolsado;});
  var totalAdm=adm.length,dpTot=adm.reduce(function(a,x){return a+(x.pago1||0);},0),cuot=adm.filter(function(a){return a.esCuotas;}).length;
  var h='<div class="kgrid">';
  h+='<div class="kcard"><div class="lbl">Total Admitidos</div><div class="val b">'+totalAdm+'</div><div class="sub">pagaron $500 cita</div></div>';
  h+='<div class="kcard"><div class="lbl">Agendados</div><div class="val g">'+ag.length+'</div><div class="sub">'+sa.length+' sin agendar</div></div>';
  h+='<div class="kcard"><div class="lbl">Down Payments</div><div class="val g">'+fm(dpTot)+'</div></div>';
  h+='<div class="kcard"><div class="lbl">Saldo x Cobrar</div><div class="val y">'+fm(totalAdm*2500)+'</div><div class="sub">$2,500 por cliente</div></div>';
  h+='<div class="kcard"><div class="lbl">En Cuotas</div><div class="val p">'+cuot+'</div></div>';
  if(re.length>0)h+='<div class="kcard"><div class="lbl">Reembolsados</div><div class="val r">'+re.length+'</div></div>';
  h+='</div>';
  if(ag.length>0){
    h+='<div class="stitle">&#128198; Agendados por fecha</div>';
    var g={},o=[];for(var a of ag){if(!g[a.fechaAgenda]){g[a.fechaAgenda]=[];o.push(a.fechaAgenda);}g[a.fechaAgenda].push(a);}
    for(var fe of o){var ls=g[fe],lab=dl(fe),hoy=it(fe);
      h+='<div class="dsec"><div class="dhdr"><h2>'+lab+'</h2>'+(hoy?'<span class="hoy">HOY</span>':'')+'<span class="dcnt">'+ls.length+' agendados</span></div>';
      h+='<table class="tbl"><thead><tr><th>#</th><th>Nombre/Usuario</th><th>Hora</th><th>Canal</th><th>Down Pay</th><th>Pago 2</th><th>Pago 3</th><th>Estado</th></tr></thead><tbody>';
      ls.forEach(function(a,i){var est=a.estado||'',eb=est.indexOf('Pendiente')>=0?'<span class="badge badge-pend">&#9203; Pendiente</span>':est.indexOf('Sin agendar')>=0?'<span class="badge badge-sa">Sin agendar</span>':'<span class="badge badge-comp">'+est.substring(0,10)+'</span>';var reimb=a.reembolsado?'<span class="badge badge-reimb">REIMB</span>':'';h+='<tr><td style="color:#475569">'+(i+1)+'</td><td style="font-weight:500">'+a.nombre+(reimb?' '+reimb:'')+'</td><td style="color:#94a3b8">'+a.hora+'</td><td><span class="badge badge-canal">'+a.canal+'</span></td><td class="paid">'+fm(a.pago1)+'</td><td class="'+(a.pago2?'paid':'emp')+'">'+fm(a.pago2)+'</td><td class="'+(a.pago3?'paid':'emp')+'">'+fm(a.pago3)+'</td><td>'+eb+'</td></tr>';});
      h+='</tbody></table></div>';}
  }
  if(sa.length>0){h+='<div class="stitle" style="margin-top:20px">&#128203; Sin agendar ('+sa.length+')</div><div class="dsec"><table class="tbl"><thead><tr><th>#</th><th>Nombre</th><th>Email</th><th>Canal</th><th>Down Pay</th><th>Fecha Pago</th></tr></thead><tbody>';sa.forEach(function(a,i){h+='<tr><td style="color:#475569">'+(i+1)+'</td><td style="font-weight:500">'+a.nombre+'</td><td style="color:#64748b;font-size:.75rem">'+a.email+'</td><td><span class="badge badge-canal">'+a.canal+'</span></td><td class="paid">'+fm(a.pago1)+'</td><td style="color:#64748b">'+a.fechaP1+'</td></tr>';});h+='</tbody></table></div>';}
  c.innerHTML=h;
}
function renderT3(ses,adm){
  var c=document.getElementById('t3');
  var tot=ses.length,comp=ses.filter(function(s){return s.montoN!==null&&s.montoN>0;}),cash=comp.reduce(function(a,s){return a+s.montoN;},0),rate=tot>0?Math.round(comp.length/tot*100):0;
  var fp=ses.filter(function(s){return s.planPago&&s.planPago.toUpperCase().indexOf('FULL')>=0;});
  var cu=ses.filter(function(s){return s.planPago&&s.planPago.toUpperCase().indexOf('FULL')<0&&s.planPago.trim()!=='';});
  var tc=ses.reduce(function(a,s){return a+(s.totalCollected||0);},0),tr=ses.reduce(function(a,s){return a+(s.remaining||0);},0);
  var admTot=adm.length,admAg=adm.filter(function(a){return a.fechaAgenda;}).length,admSa=adm.filter(function(a){return !a.fechaAgenda;}).length;
  var dp=adm.reduce(function(a,x){return a+(x.pago1||0);},0);
  var h='<div class="kgrid">';
  h+='<div class="kcard" style="border-color:#4ade8066"><div class="lbl">&#9989; Compraron</div><div class="val g">'+comp.length+'/'+tot+'</div><div class="sub">'+rate+'% tasa cierre</div><div class="prog-bar"><div class="prog-fill" style="width:'+rate+'%"></div></div></div>';
  h+='<div class="kcard" style="border-color:#4ade8066"><div class="lbl">&#128176; Cash 1ra Llamada</div><div class="val g">'+fm(cash)+'</div></div>';
  h+='<div class="kcard"><div class="lbl">&#128196; Total Cobrado</div><div class="val g">'+fm(tc)+'</div><div class="sub">Incl. cuotas</div></div>';
  h+='<div class="kcard"><div class="lbl">&#128337; Saldo Pendiente</div><div class="val y">'+fm(tr)+'</div></div>';
  h+='<div class="kcard" style="border-color:#c084fc66"><div class="lbl">&#9989; Full Pay</div><div class="val p">'+fp.length+'</div></div>';
  h+='<div class="kcard" style="border-color:#60a5fa66"><div class="lbl">&#128200; En Cuotas</div><div class="val b">'+cu.length+'</div></div>';
  h+='<div class="kcard" style="border-color:#fbbf2466"><div class="lbl">&#128197; Admitidos</div><div class="val y">'+admTot+'</div><div class="sub">pagaron $500 cita</div></div>';
  h+='<div class="kcard" style="border-color:#4ade8066"><div class="lbl">&#128203; Agendados</div><div class="val g">'+admAg+'</div><div class="sub">'+admSa+' sin agendar</div></div>';
  h+='<div class="kcard"><div class="lbl">&#128178; Down Payments</div><div class="val g">'+fm(dp)+'</div></div>';
  h+='<div class="kcard"><div class="lbl">&#128181; Saldo Admision</div><div class="val r">'+fm(admTot*2500)+'</div><div class="sub">$2,500 x cliente</div></div></div>';
  if(comp.length>0){h+='<div class="stitle">&#127775; Compraron en 1ra llamada</div><div class="dsec"><table class="tbl"><thead><tr><th>#</th><th>Nombre</th><th>1ra Llamada</th><th>Plan</th><th>Total Cobrado</th><th>Saldo</th><th>Status</th></tr></thead><tbody>';comp.forEach(function(s,i){h+='<tr><td style="color:#475569">'+(i+1)+'</td><td style="font-weight:600;color:#f1f5f9">'+s.nombre+'</td><td class="paid">'+fm(s.montoN)+'</td><td>'+planB(s.planPago)+'</td><td class="paid">'+fm(s.totalCollected)+'</td><td class="'+(s.remaining&&s.remaining>0?'pend':'paid')+'">'+fm(s.remaining)+'</td><td>'+stB(s.planStatus)+'</td></tr>';});h+='</tbody></table></div>';}
  c.innerHTML=h;
}
run();setInterval(run,60000); 
