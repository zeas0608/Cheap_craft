const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync('index.html','utf8');
 const hook=`
 window.__qa={setup(yaw=0){world.fill(0);edits.clear();chestFacing.clear();for(let x=49;x<64;x++)for(let z=49;z<64;z++)put(x,20,z,1);mobs=[];droppedItems=[];debris.length=0;Object.assign(p,{x:56.5,y:21,z:57.5,yaw:0,pitch:0,vx:0,vy:0,vz:0,ground:true,swimPose:false,eyeHeight:1.62});setGameMode('creative');p.yaw=yaw;change(56,21,54,20);p.yaw=0;change(55,21,54,14);change(54,21,54,14);for(let a=0;a<W/C;a++)for(let b=0;b<D/C;b++)dirty.add(a+','+b);const gray=new Uint8ClampedArray(1024);for(let i=0;i<1024;i+=4)gray.set([180,180,180,i%16===0?0:255],i);texturePatches.set(15,gray);uploadAtlas();rebuild();start();},select(id){setItemPage(itemPages.findIndex(q=>q.includes(id)));choose(palette.indexOf(id));equipStart=-Infinity;swingStart=-Infinity;handStamp='';},inspect(){const t=tx.getImageData(48,48,16,16).data;let green=0;for(let i=0;i<t.length;i+=4)if(t[i+3]>0&&t[i+1]>t[i]&&t[i]>t[i+2])green++;return {green,face:[0,1,2,3,4,5].map(i=>blockFaceTile(20,i,chestFacing.get(ix(56,21,54))??4)),held:heldId(),planes:handGeometry(heldId(),handPose(heldId(),0,0,0,0,0,0),innerWidth,innerHeight).length,playing,webgl:!fallback,saveFacing:snapshot().chestFacing};}};
 `;
 const html=source.replace(/\}\)\(\);\s*<\/script>/,hook+'})();</script>');
 assert.notEqual(html,source,'test hook injection');
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1465,height:822},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>!!window.__qa,{timeout:60000});
 await page.evaluate(()=>__qa.setup());await page.waitForTimeout(600);fs.mkdirSync('qa-screens',{recursive:true});
 for(const id of [128,106,105,130,20]){await page.evaluate(id=>__qa.select(id),id);await page.waitForTimeout(180);const state=await page.evaluate(()=>__qa.inspect());assert.equal(state.playing,true);assert.equal(state.webgl,true);assert.equal(state.held,id);assert(state.green>0);assert.equal(state.face.filter(x=>x===123).length,1);if(id!==20)assert.equal(state.planes,1);await page.screenshot({path:'qa-screens/held-'+id+'.png'});console.log('rendered',id,JSON.stringify(state));}
 for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){await page.evaluate(y=>__qa.setup(y),yaw);await page.waitForTimeout(120);const q=await page.evaluate(()=>__qa.inspect());assert.equal(q.face.filter(x=>x===123).length,1);assert.equal(q.saveFacing.length,1);}
 assert.deepEqual(errors,[]);console.log('PASS browser rendering, held items, grass tint, chest orientations and save data');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
