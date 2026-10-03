// Development-only asset generator. Committed PNGs need no runtime dependency.
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const fs = require('node:fs');
const assets = {
 tech: {color:'#a6b8a0',path:'M130 55L195 35Q240 72 285 35L350 55L445 150L378 225L342 194L342 548L138 548L138 194L102 225L35 150Z',details:'M195 35Q240 100 285 35 M138 520H342 M77 190L107 157 M373 157L407 190'},
 future: {color:'#c6b6dc',path:'M175 65Q170 3 240 3Q310 3 305 65L350 90L430 180L405 420L344 410L339 548H141L136 410L75 420L50 180L130 90Z',details:'M175 65Q240 135 305 65 M205 110L198 190 M275 110L282 190 M190 310L155 390H325L290 310 M141 515H339 M87 390L136 383 M344 383L395 390'},
 cargo: {color:'#bdbaa3',path:'M148 40H332L347 550H253L240 217L227 550H133Z',details:'M148 75H332 M240 75V217 M153 143L210 128 M327 143L270 128 M145 236H211V324H141 M269 236H335L338 324H270 M135 520H228 M253 520H346'},
 vision: {color:'#89a5b5',path:'M180 38L216 20L240 65L264 20L300 38L342 55L436 165L411 444L350 438L338 548H142L130 438L69 444L44 165L138 55Z',details:'M240 65V548 M216 20L192 83L228 115 M264 20L288 83L252 115 M156 295H210V380H156Z M270 295H324V380H270Z M142 518H338 M73 415L130 409 M350 409L407 415'},
 dress: {color:'#bb9fad',path:'M175 20L215 10Q240 42 265 10L305 20L329 172L290 220L375 550H105L190 220L151 172Z',details:'M190 220H290 M119 515H361 M215 10Q240 65 265 10'},
 skirt: {color:'#ae9fba',path:'M158 60H322L384 550H96Z',details:'M158 95H322 M182 95L152 510 M218 95L205 510 M262 95L275 510 M298 95L328 510 M101 520H379'}
};
fs.mkdirSync('public/garments',{recursive:true});
(async()=>{for(const [name,{color,path,details}] of Object.entries(assets)) {
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600" viewBox="0 0 480 600"><defs><linearGradient id="fabric"><stop stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".94"/></linearGradient></defs><path d="${path}" fill="url(#fabric)" stroke="#35473c" stroke-width="3" stroke-linejoin="round"/><path d="${details}" fill="none" stroke="#35473c" stroke-opacity=".45" stroke-width="2"/></svg>`;
 fs.writeFileSync(`public/garments/${name}.svg`,svg);
 await sharp(Buffer.from(svg)).png().toFile(`public/garments/${name}.png`);
}console.log('Six transparent garment illustrations generated.');})().catch(error=>{console.error(error);process.exit(1);});
