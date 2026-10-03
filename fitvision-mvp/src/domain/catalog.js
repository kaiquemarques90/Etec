const tops = (base, length) => ['P','M','G','GG'].map((size,i) => ({size,chest:base+i*6,length:length+i*3}));
export const products = [
 {id:'tech',name:'Camiseta Tech Oversized',subtitle:'Oversized essencial',category:'top',image:'/public/garments/tech.png',price:149.90,color:'#a6b8a0',defaultFit:'loose',description:'Malha encorpada e silhueta ampla. Produto fictício.',variants:tops(100,68)},
 {id:'future',name:'Moletom Future',subtitle:'Conforto em movimento',category:'top',image:'/public/garments/future.png',price:249.90,color:'#c6b6dc',defaultFit:'loose',description:'Moletom de linhas limpas. Produto fictício.',variants:tops(106,66)},
 {id:'cargo',name:'Calça Urban Cargo',subtitle:'Feita para a cidade',category:'bottom',image:'/public/garments/cargo.png',price:219.90,color:'#bdbaa3',defaultFit:'regular',description:'Modelagem reta, sem elasticidade considerada no motor. Produto fictício.',variants:['P','M','G','GG'].map((size,i)=>({size,waist:76+i*6,hips:98+i*6,length:100+i*2}))},
 {id:'vision',name:'Jaqueta Vision',subtitle:'Uma nova perspectiva',category:'outerwear',image:'/public/garments/vision.png',price:329.90,color:'#89a5b5',defaultFit:'regular',description:'Camada externa com estrutura leve. Produto fictício.',variants:tops(108,66)}
];
export const demoProfile = {height:174,chest:88,waist:72,hips:87};
