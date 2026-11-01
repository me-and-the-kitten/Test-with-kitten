// Original procedural pixel sprites. All drawing takes place on a 96 × 96 grid.
// No external image, random number, network request, or model is used.
const PixelCat=(()=>{
const S=96,INK='#392e40';
const palettes=[
 {base:'#e99a51',light:'#ffca80',shade:'#bd6b3e',deep:'#915137',cream:'#ffe9bc',patch:'#c6743c'},
 {base:'#9690a6',light:'#c0b7cc',shade:'#736b86',deep:'#554c6b',cream:'#eee1d6',patch:'#777087'},
 {base:'#e8c79d',light:'#fff0cc',shade:'#bc9271',deep:'#936c58',cream:'#fff5dd',patch:'#c5a17e'},
 {base:'#f3dcaf',light:'#fff1d0',shade:'#c6a47e',deep:'#9b795f',cream:'#fff3d8',patch:'#dc9252'},
 {base:'#d8545c',light:'#f17a79',shade:'#aa3e53',deep:'#79384d',cream:'#f18b86'},
 {base:'#8abc87',light:'#b8df9f',shade:'#5d986f',deep:'#44735b',cream:'#c7e7b2'},
 {base:'#efb97c',light:'#ffe09d',shade:'#c78ca2',deep:'#90728f',cream:'#f8e5bd'},
 {base:'#a39bad',light:'#c3b8c7',shade:'#80758d',deep:'#5e5570',cream:'#d0bed0'},
 {base:'#b7a6a0',light:'#d4c3b5',shade:'#938580',deep:'#74676c',cream:'#d8c6b4'},
 {base:'#f4f1ed',light:'#ffffff',shade:'#cfcfd6',deep:'#a6a5b3',cream:'#fffdf6'},
 {base:'#56515e',light:'#7f7588',shade:'#36313f',deep:'#24202d',cream:'#69606e'},
 {base:'#4b4756',light:'#746b7e',shade:'#302c3c',deep:'#23202d',cream:'#f5edda'},
 {base:'#5383cf',light:'#82b0f0',shade:'#3a5c9c',deep:'#304575',cream:'#afd0f0'},
 {base:'#9bd7e9',light:'#d4f1f3',shade:'#6dabc7',deep:'#4d809e',cream:'#e2f4ef'},
 {base:'#eca6c5',light:'#ffd2df',shade:'#c87fa8',deep:'#995f87',cream:'#ffe3e5'},
 {base:'#514657',light:'#7b667e',shade:'#342c40',deep:'#252030',cream:'#e49bbd'}];
function parts(a=[],stage=6){return {pose:stage>=1?(a[0]??0):null,ears:stage>=2?(a[1]??0):null,tail:stage>=3?(a[2]??0):null,coat:stage>=4?(a[3]??0):null,face:stage>=5?(a[4]??0):null,accessory:stage>=6?(a[5]??0):null}}
function gray(c){if(!c)return c;let v=Math.round((parseInt(c.slice(1,3),16)+parseInt(c.slice(3,5),16)+parseInt(c.slice(5,7),16))/3).toString(16).padStart(2,'0');return '#'+v+v+v}
function raster(a=[],stage=6,only=null){let t=parts(a,stage),{pose,face,tail,ears,accessory}=t,coat=t.coat??-1,p=coat>=0?palettes[coat]:{base:'#d9d7d4',light:'#f7f6f3',shade:'#b7b4b2',deep:'#908b8a',cream:'#edecea'},pixels=Array(S*S).fill(null);
 const put=(x,y,c)=>{x|=0;y|=0;if(x>=0&&y>=0&&x<S&&y<S)pixels[y*S+x]=c};
 function rect(x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,c)}
 function poly(points,c,dst=pixels){let minX=Math.floor(Math.min(...points.map(v=>v[0]))),maxX=Math.ceil(Math.max(...points.map(v=>v[0]))),minY=Math.floor(Math.min(...points.map(v=>v[1]))),maxY=Math.ceil(Math.max(...points.map(v=>v[1])));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){let u=points[i],v=points[j];if((u[1]>y+.5)!=(v[1]>y+.5)&&(x+.5)<(v[0]-u[0])*(y+.5-u[1])/(v[1]-u[1])+u[0])inside=!inside}if(inside&&x>=0&&y>=0&&x<S&&y<S)dst[y*S+x]=c}}
 function ellipse(cx,cy,rx,ry,c,dst=pixels){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2<=1&&x>=0&&y>=0&&x<S&&y<S)dst[y*S+x]=c}
 function line(points,c,width=1,dst=pixels){for(let n=1;n<points.length;n++){let [x0,y0]=points[n-1],[x1,y1]=points[n],d=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let t=0;t<=d;t++)ellipse(Math.round(x0+(x1-x0)*t/(d||1)),Math.round(y0+(y1-y0)*t/(d||1)),width/2+.5,width/2+.5,c,dst)}}
 function layer(build,shade=true){let m=Array(S*S).fill(null);build(m);let ids=[];for(let y=1;y<S-1;y++)for(let x=1;x<S-1;x++)if(m[y*S+x])ids.push([x,y]);for(let [x,y] of ids)for(let [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(!m[(y+dy)*S+x+dx])put(x+dx,y+dy,INK);for(let [x,y] of ids){let c=m[y*S+x];if(shade&&c===p.base){if(!m[(y-2)*S+x]||!m[y*S+x-2])c=p.light;else if(!m[(y+3)*S+x]||!m[y*S+x+3])c=p.shade}put(x,y,c)}return m}
 function shape(polyPts){return layer(m=>poly(polyPts,p.base,m))}
 function insidePaint(mask,build){let old=pixels;pixels=Array(S*S).fill(null);build();let paint=pixels;pixels=old;for(let i=0;i<paint.length;i++)if(mask[i]&&paint[i])pixels[i]=paint[i]}
 function decorate(mask,part){insidePaint(mask,()=>{
  if(coat===4){ // Spider suit: red webbed head and blue legs/body.
   if(part==='body'){rect(0,63,96,33,'#3565ad');poly([[38,49],[53,49],[57,64],[34,64]],'#d75258');line([[46,54],[46,62]],'#462f49',2);for(let y of [56,60])line([[41,y],[51,y]],'#462f49');}
   else{for(let x=27;x<70;x+=8)line([[46,32],[x,part==='tail'?84:53]],'#8e3345');for(let y=26;y<53;y+=7)line([[22,y],[42,y+3],[69,y]],'#8e3345');}
  }
  if(coat===6){const rainbow=['#ee8993','#f2b76b','#eee084','#9acb99','#8abde1','#ae99d3'];for(let y=0;y<96;y+=7)rect(0,y,96,7,rainbow[Math.floor(y/7)%6]);}
  if(coat===7){if(part==='body'){rect(25,52,41,27,'#d8a874');rect(29,55,33,21,'#f4b8cd');rect(32,58,27,15,'#efc4d2');for(let x=32;x<60;x+=5)rect(x,58+(x%3)*4,1,2,'#e891b4');}else{for(let x=24;x<70;x+=10)rect(x,27,4,2,'#8a879e');}}
  if(coat===8){if(part==='head'){line([[38,24],[39,29]],'#8b7b78',2);line([[46,23],[46,29]],'#8b7b78',2);line([[53,24],[52,29]],'#8b7b78',2);}if(part==='body'){line([[27,61],[33,63]],'#8b7b78',2);line([[57,65],[62,63]],'#8b7b78',2);}if(part==='tail')for(let y=20;y<82;y+=8)rect(0,y,96,2,'#8b7b78');}
  if(coat===11){if(part==='head')ellipse(46,46,17,8,'#faf0dc');if(part==='body')rect(0,73,96,23,'#faf0dc');if(part==='tail')ellipse(16,58,4,5,'#faf0dc');}

  if(coat===15){if(part==='head'){poly([[23,23],[53,22],[39,42],[25,45]],'#e784b8');line([[28,25],[38,29],[33,34]],'#f6b0d4',2);}if(part==='body'){line([[33,65],[37,68],[40,65],[44,69],[48,65],[51,68],[55,65]],'#e784b8',2);rect(0,77,96,3,'#df70ab');}if(part==='tail')for(let y=20;y<83;y+=10)rect(0,y,96,3,'#e784b8');}
 })}

 // Ground shadow, then the independent tail behind the body.
 if(!only&&stage>0)ellipse(46,84,30,3,'#dfd3bd');
 if(!only&&stage>=3){let paths=[[[34,75],[25,77],[16,73],[13,63],[16,55],[23,53],[27,57]],[[62,75],[74,72],[79,62],[78,51],[74,46],[69,47]],[[62,72],[76,64],[80,51],[80,32],[76,23],[71,22]],[[63,74],[78,74],[84,68],[83,58],[77,52],[71,55],[73,61]],[[62,74],[69,73],[71,68]],[[62,74],[77,69],[82,60],[80,51]],[[62,74],[76,69],[84,57],[83,41],[77,37]]];let width=tail===5?3:tail===6?2:8;let tm=layer(m=>{line(paths[tail],p.base,width,m);if(tail===5)ellipse(80,50,5,6,p.base,m)});insidePaint(tm,()=>{if(coat===0){for(let y=25;y<79;y+=10)rect(9,y,77,2,p.shade)}if(coat===3){ellipse(80,36,10,12,'#67596b');ellipse(15,63,11,9,'#d88c4d')}const tip=paths[tail].at(-1);ellipse(tip[0],tip[1],tail===6?1:4,tail===6?1:4,p.cream);if(tail===5)ellipse(80,50,5,6,p.deep)});decorate(tm,'tail');}
 if(stage===0){rect(42,41,8,2,'#a79b8e');rect(49,43,2,5,'#a79b8e');rect(45,48,4,2,'#a79b8e');rect(44,53,2,2,'#a79b8e');return pixels.map(gray)}
 if(!only){
 // Four silhouettes: loaf, sitting, standing, playful hop.
 let bm=layer(m=>{if(pose===0){ellipse(45,66,24,15,p.base,m);ellipse(32,75,9,5,p.base,m);ellipse(58,75,8,5,p.base,m)}else if(pose===1){ellipse(46,63,15,19,p.base,m);ellipse(36,77,9,5,p.base,m);ellipse(57,77,9,5,p.base,m);poly([[39,53],[47,53],[47,81],[39,81]],p.base,m);poly([[49,53],[55,53],[56,80],[49,80]],p.base,m)}else if(pose===2){ellipse(45,62,18,14,p.base,m);poly([[30,63],[38,64],[37,81],[30,81]],p.base,m);poly([[45,63],[52,62],[54,81],[47,81]],p.base,m);poly([[56,61],[62,59],[67,76],[60,79]],p.base,m)}else{poly([[36,48],[51,46],[64,60],[59,73],[48,72],[34,60]],p.base,m);poly([[34,54],[29,60],[21,53],[18,46],[23,43],[30,51]],p.base,m);poly([[57,53],[63,46],[66,36],[72,37],[71,48],[64,61]],p.base,m);poly([[41,64],[47,68],[38,79],[31,75]],p.base,m);poly([[53,67],[59,66],[66,76],[61,81]],p.base,m)}});
 insidePaint(bm,()=>{ellipse(46,59,9,13,p.cream);if(coat===0){line([[29,63],[34,64]],p.shade,2);line([[56,63],[61,61]],p.shade,2)}if(coat===3){ellipse(31,61,9,8,'#d88c4d');ellipse(60,65,7,10,'#65576b')}if(pose===1){line([[45,66],[45,79]],p.shade,1);line([[52,68],[53,79]],p.shade,1)}});
 decorate(bm,'body');
 // All heads share a common anchor so ears, eyes and props always fit.
 let hm=layer(m=>{poly([[24,33],[27,28],[31,24],[39,22],[53,22],[61,26],[66,33],[66,38],[70,41],[66,43],[68,46],[62,47],[59,51],[34,52],[28,49],[22,47],[25,43],[21,41],[24,38]],p.base,m)});
 insidePaint(hm,()=>{ellipse(46,45,16,8,p.cream);if(coat===0){poly([[39,23],[42,23],[44,31],[41,30]],p.shade);poly([[48,23],[51,23],[50,29],[47,31]],p.shade);line([[25,36],[31,38]],p.shade,1);line([[61,36],[65,34]],p.shade,1)}if(coat===3){ellipse(30,32,12,13,'#d88c4d');ellipse(60,31,10,13,'#65576b')}});
 decorate(hm,'head');
 let earSets=[[[[27,31],[26,16],[30,16],[39,26]],[[53,26],[63,15],[65,18],[65,33]]],[[[27,31],[28,12],[32,12],[40,25]],[[52,25],[61,11],[65,13],[65,32]]],[[[26,32],[23,20],[31,19],[39,26]],[[54,26],[63,18],[69,22],[66,32]]],[[[27,32],[27,17],[31,17],[39,26]],[[54,25],[63,22],[68,27],[64,33]]]];
 if(stage>=2)for(let pts of earSets[ears]){let em=shape(pts);insidePaint(em,()=>{let cx=pts.reduce((s,v)=>s+v[0],0)/4,cy=pts.reduce((s,v)=>s+v[1],0)/4;poly([[cx-2,cy-3],[cx+3,cy+3],[cx-2,cy+4]],'#d99191');rect(cx|0,cy|0,2,3,'#efb5a7')})}
 // Cover the ear join with a soft stepped fringe.
 poly([[34,25],[38,23],[39,25],[44,23],[46,25],[51,24],[55,27]],p.light);
 }
 if(!only&&stage>=1&&pose===3){rect(14,36,2,5,'#c6b48d');rect(11,39,7,1,'#c6b48d');rect(78,56,2,4,'#c6b48d');rect(76,58,6,1,'#c6b48d')}
 if(stage>=5&&only!=='accessory'){
 const eye=(x,y)=>{rect(x,y+1,6,7,INK);rect(x+1,y,4,9,INK);rect(x+1,y+4,4,4,'#886749');rect(x+2,y+5,3,2,'#b69b58');rect(x+1,y+1,2,3,'#fff8e9');rect(x+4,y+4,1,1,'#fff8e9')};
 if(face===0){line([[32,37],[35,38],[39,38],[41,36]],INK);line([[51,36],[54,38],[58,38],[60,36]],INK);rect(31,41,6,2,'#e6aaa0');rect(56,41,5,2,'#e6aaa0')}
 if(face===1){eye(31,30);eye(54,33);rect(32,42,6,2,'#e6aaa0');rect(56,42,5,2,'#e6aaa0')}
 if(face===2){rect(33,34,7,2,INK);rect(34,36,5,4,INK);rect(35,37,3,2,'#b39d65');rect(53,33,7,2,INK);rect(54,35,5,4,INK);rect(55,36,3,2,'#b39d65');line([[32,31],[39,32]],p.deep);line([[53,29],[60,27]],p.deep)}
 if(face===3){line([[32,37],[35,34],[38,34],[41,37]],INK);line([[51,37],[54,34],[57,34],[60,37]],INK);rect(31,41,6,2,'#e5a09b');rect(56,41,5,2,'#e5a09b')}
 if(face!==6){ rect(44,41,4,2,'#be777e');rect(45,43,2,1,'#be777e');if(face===3){poly([[42,45],[50,45],[49,50],[46,52],[43,50]],INK);rect(44,48,5,2,'#e48c91');rect(45,50,3,1,'#f5b5a6')}else{line([[46,44],[46,46],[43,47],[41,46]],INK);line([[46,46],[49,47],[51,45]],INK)}}
 line([[29,42],[23,41]],p.deep);line([[29,45],[22,46]],p.deep);line([[63,42],[70,40]],p.deep);line([[63,45],[71,46]],p.deep);
 // Additional original pixel interpretations, fitted to the common head.
 if(face===4){ // Human grin: wide teeth and smiling eyes.
  line([[31,34],[35,32],[39,33]],INK);line([[53,33],[57,31],[61,33]],INK);
  poly([[30,40],[61,39],[58,48],[53,51],[39,51],[33,47]],'#482f41');
  poly([[32,41],[59,40],[57,47],[52,49],[39,49],[34,46]],'#fff6e7');
  line([[34,45],[57,44]],'#c5aaa3');for(let x=37;x<=54;x+=5)line([[x,41],[x+1,48]],'#bba3a0');
 }
 if(face===5){ // Lollipop in one cheek, visible spiral and stick.
  eye(32,31);line([[53,36],[57,34],[61,36]],INK);rect(43,42,3,2,'#c77f8d');
  line([[44,45],[50,46],[54,44]],INK);line([[56,46],[68,57]],'#f5f0df',2);
  ellipse(62,43,7,7,INK);ellipse(62,43,6,6,'#ef88b8');
  line([[59,40],[63,39],[65,42],[64,45],[60,46],[58,43],[60,41],[62,42],[61,44]],'#ffe4b3');
 }
 if(face===6){ // Block-game face: square eyes and the classic broad U smile.
  rect(31,31,7,7,'#22202b');rect(54,31,7,7,'#22202b');rect(32,31,2,2,'#fff1dc');rect(55,31,2,2,'#fff1dc');
  line([[34,42],[36,47],[41,50],[51,50],[57,47],[59,42]],'#22202b',2);
 }
 if(face===7){ // Sculpted gigachad jaw, cheekbones, raised brow and stubble.
  poly([[28,36],[34,42],[35,49],[43,54],[50,54],[59,47],[62,35],[57,40],[50,43],[41,43],[35,40]],'#ab9a98');
  line([[31,31],[39,29],[41,31]],INK,2);line([[51,30],[59,28],[62,30]],INK,2);
  rect(33,33,7,2,'#292531');rect(53,32,7,2,'#292531');line([[45,34],[43,41],[47,42]],'#786b74');
  line([[38,45],[43,46],[53,44]],'#584650');line([[40,50],[48,52],[54,48]],'#66535d');
  for(let x=37;x<57;x+=3)rect(x,48+(x%2),1,2,'#756571');
 }
 if(face===8){ // 90s anime: huge jewel eyes, lashes, tiny open mouth, blush.
  for(let x of [29,52]){poly([[x,31],[x+4,28],[x+10,30],[x+11,40],[x+7,44],[x+2,42]],INK);rect(x+2,32,7,9,'#7563ac');rect(x+3,38,6,4,'#ac9ce1');rect(x+2,31,4,5,'#fff7f1');rect(x+7,37,2,2,'#fff7f1');line([[x-2,29],[x+1,32],[x+4,28]],INK);}
  line([[30,46],[36,47]],'#e7a2a3',2);line([[55,46],[61,45]],'#e7a2a3',2);poly([[44,46],[48,46],[47,50],[45,50]],'#a95f7b');
 }
 if(face===9){ // Troll-inspired grin, mismatched brows, a long hooked nose.
  line([[28,31],[34,29],[40,33]],INK,2);line([[51,32],[59,28],[63,31]],INK,2);
  rect(33,34,4,3,INK);rect(55,33,4,3,INK);line([[46,33],[43,39],[48,40]],INK);
  poly([[27,39],[35,42],[53,41],[64,37],[62,47],[54,52],[38,52],[30,47]],'#322634');
  poly([[30,41],[37,44],[53,43],[62,39],[59,47],[53,50],[38,50],[32,46]],'#fff4df');
  line([[32,46],[56,46],[60,43]],'#8c737c');for(let x=36;x<58;x+=5)line([[x,43],[x+1,50]],'#9b7e86');
 }
 if(face===10){ // Mischievous monster-toy face, starry eyes and nine teeth.
  poly([[27,31],[32,27],[59,28],[64,33],[62,46],[55,52],[35,51],[27,43]],'#e8c5aa');
  ellipse(35,35,6,7,INK);ellipse(56,35,6,7,INK);rect(32,31,3,4,'#fff6e9');rect(54,31,3,4,'#fff6e9');
  rect(44,40,4,2,'#9c6573');poly([[29,42],[35,45],[55,44],[63,41],[60,48],[54,52],[36,52],[31,48]],'#43303a');
  for(let x=33;x<60;x+=3)poly([[x,45],[x+2,45],[x+1,49]],'#fff8de');
 }

 }
 // Each later answer adds exactly one fixed part; props appear only last.
 if(stage>=6&&only!=='face'){if(accessory===0){layer(m=>{poly([[70,68],[82,68],[82,80],[70,80]],'#f6e7cc',m);line([[82,71],[86,71],[87,73],[87,76],[82,77]],'#f6e7cc',2,m)},false);rect(72,69,8,2,'#71503e');rect(75,74,3,3,'#de9d57');line([[75,64],[73,61],[75,58]],'#c7b5a0')}
 if(accessory===1){line([[35,52],[57,65]],'#825342',2);layer(m=>poly([[50,58],[61,59],[62,71],[50,72],[48,69],[48,61]],'#a46a43',m),false);rect(50,60,11,3,'#bd8750');rect(54,62,3,5,'#e8bd6b');rect(55,63,1,2,'#75513e')}
 if(accessory===2){layer(m=>poly([[39,23],[35,15],[41,17],[45,12],[49,17],[56,14],[53,24]],'#dfad4e',m),false);rect(40,21,13,2,'#f5d588');rect(44,18,2,2,'#eb8c7d')}
 if(accessory===3){layer(m=>poly([[37,51],[55,51],[57,56],[50,58],[56,67],[50,70],[44,58],[36,57]],'#bd717a',m),false);rect(38,52,16,2,'#e79b98');line([[46,57],[52,66]],'#9c576d',1)}
 if(accessory===4){ // Diamond pixel sword, beside the cat so the face stays clear.
  layer(m=>poly([[73,67],[73,57],[77,57],[77,51],[81,51],[81,45],[85,45],[85,41],[90,41],[90,47],[87,47],[87,53],[83,53],[83,59],[79,59],[79,67]],'#36c9cb',m),false);
  line([[77,62],[86,46]],'#a4f5e7',1);line([[71,65],[81,70]],'#247b89',3);line([[75,69],[71,78]],'#805a4a',3);rect(69,77,4,4,'#45a9aa');
 }
 if(accessory===5){ // Burgundy and gold school scarf.
  layer(m=>poly([[34,51],[58,51],[60,57],[52,60],[59,75],[51,79],[44,60],[34,58]],'#9d3345',m),false);
  rect(36,53,20,2,'#e5bd55');line([[48,63],[55,61]],'#e5bd55',2);line([[51,69],[58,67]],'#e5bd55',2);line([[53,75],[59,72]],'#e5bd55',2);
 }
 if(accessory===6){ // Purple explorer backpack with a friendly face.
  line([[33,52],[51,63]],'#ad8dcc',2);layer(m=>{poly([[65,57],[69,53],[81,53],[85,58],[85,78],[82,81],[66,80]],'#9a6fc3',m);line([[70,54],[71,49],[78,49],[80,54]],'#9a6fc3',2,m)},false);
  rect(67,58,15,3,'#bc97df');rect(69,63,3,4,'#fff4da');rect(78,63,3,4,'#fff4da');rect(70,64,1,2,INK);rect(79,64,1,2,INK);line([[70,72],[74,74],[79,71]],'#f4d064');rect(68,77,15,2,'#77529f');
 }
 if(accessory===7){ // A household iron with handle and shiny sole.
  layer(m=>{poly([[68,74],[72,67],[82,66],[88,72],[91,78],[66,78]],'#b7c4ce',m);line([[73,68],[74,62],[83,62],[85,68]],'#6b8d9f',3,m)},false);
  line([[68,78],[89,78]],'#edf4ed',2);rect(76,69,8,3,'#dce8e7');line([[86,66],[91,61],[92,54]],'#6f6676');
 }
 if(accessory===8){ // Wizard hat, crooked tip, star and moon.
  layer(m=>poly([[28,23],[34,18],[42,1],[49,3],[52,15],[62,20],[64,24]],'#5e5294',m),false);line([[34,20],[57,20]],'#b0a3db',2);poly([[44,7],[46,10],[49,11],[46,12],[45,15],[44,12],[41,11],[44,10]],'#f3d580');rect(49,14,3,3,'#e8cd78');
 }
 if(accessory===9){ // Tall top hat with a red ribbon.
  layer(m=>{poly([[35,4],[58,4],[56,21],[37,21]],'#39364e',m);poly([[28,21],[65,21],[64,25],[29,25]],'#39364e',m)},false);rect(37,16,20,4,'#bd6679');rect(38,6,3,9,'#656078');
 }
 if(accessory===10){ // Farmer straw hat with woven pattern and green band.
  layer(m=>{poly([[35,12],[54,11],[59,23],[31,23]],'#d6b167',m);ellipse(45,24,23,4,'#e7c789',m)},false);rect(33,20,25,3,'#74915a');for(let x=35;x<58;x+=4)line([[x,15],[x+3,18]],'#b89350');line([[28,25],[62,25]],'#f8dfa0');
 }
 if(accessory===11){ // Collar with a golden bell.
  layer(m=>poly([[34,51],[57,51],[57,55],[34,55]],'#75988e',m),false);ellipse(46,59,5,5,INK);ellipse(46,59,4,4,'#e5b84e');rect(44,56,3,2,'#ffe197');line([[46,59],[46,62]],'#a67c39');rect(44,61,4,1,'#8e653c');
 }

}
 return stage<4?pixels.map(gray):pixels;
}
function draw(a=[],stage=6){return raster(a,stage)}
function overlay(a,kind){return raster(a,6,kind)}
function svg(a,stage=6){let px=draw(a,stage),paths=new Map();for(let y=0;y<S;y++)for(let x=0;x<S;){let c=px[y*S+x];if(!c){x++;continue}let end=x+1;while(end<S&&px[y*S+end]===c)end++;paths.set(c,(paths.get(c)||'')+`M${x} ${y}h${end-x}v1H${x}z`);x=end}return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" shape-rendering="crispEdges" role="img" aria-label="Ваш пиксельный котик">${[...paths].map(([c,d])=>`<path fill="${c}" d="${d}"/>`).join('')}</svg>`}
function canvas(ctx,a,scale=6,ox=0,oy=0){let px=draw(a);for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(px[y*S+x]){ctx.fillStyle=px[y*S+x];ctx.fillRect(ox+x*scale,oy+y*scale,scale,scale)}}
return {draw,parts,overlay,svg,canvas,size:S};})();
if(typeof module!=='undefined')module.exports=PixelCat;
