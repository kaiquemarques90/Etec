export const BODY_CONNECTIONS=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,31],[28,32]];
export function assessPose(poses){
 if(poses.length!==1)return {valid:false,message:poses.length?'Há mais de uma pessoa. Fotografe somente uma.':'Nenhuma pessoa detectada. Use uma foto bem iluminada de corpo inteiro.'};
 const points=poses[0];
 const required=[11,12,23,24,25,26,27,28];
 if(required.some(i=>!points[i]||!Number.isFinite(points[i].visibility)||!Number.isFinite(points[i].x)||!Number.isFinite(points[i].y)||points[i].visibility<0.65||points[i].x<0.02||points[i].x>0.98||points[i].y<0.02||points[i].y>0.98))return {valid:false,message:'Ombros, quadril, joelhos e tornozelos precisam estar visíveis. Afaste a câmera e mantenha o corpo inteiro no quadro.'};
 if(Math.abs(points[11].y-points[12].y)>0.07)return {valid:false,message:'Endireite a postura e mantenha a câmera nivelada.'};
 return {valid:true,message:'Pose detectada e pontos principais visíveis. Isso não garante precisão das medidas.'};
}
export function estimateShoulders(points,width,height,knownHeight,top,bottom){
 if(!Number.isFinite(knownHeight)||knownHeight<100||knownHeight>230)throw new Error('Informe altura entre 100 e 230 cm.');
 if(top<0||bottom>1||bottom-top<0.4)throw new Error('Marque o topo da cabeça e a base dos pés com distância suficiente.');
 const a=points[11],b=points[12];
 if(a.y<=top||a.y>=bottom||b.y<=top||b.y>=bottom)throw new Error('Os ombros devem ficar entre as linhas de calibração.');
 const projectedPixels=Math.hypot((a.x-b.x)*width,(a.y-b.y)*height);
 return Math.round(projectedPixels*knownHeight/((bottom-top)*height)*10)/10;
}

/** Projected segment lengths, not validated anatomical dimensions or circumferences. */
export function estimateSegments(points, width, height, knownHeight, top, bottom) {
 const shoulders = estimateShoulders(points, width, height, knownHeight, top, bottom);
 const scale = knownHeight / ((bottom - top) * height);
 const distance = (a, b) => Math.hypot((points[a].x - points[b].x) * width, (points[a].y - points[b].y) * height);
 const visible = ids => ids.every(id => points[id] && points[id].visibility >= .65 && points[id].y > top && points[id].y < bottom);
 const result = { shoulders };
 if (visible([11, 13, 15, 12, 14, 16])) result.arm = Math.round(((distance(11, 13) + distance(13, 15) + distance(12, 14) + distance(14, 16)) / 2) * scale * 10) / 10;
 if (visible([23, 25, 27, 24, 26, 28])) result.leg = Math.round(((distance(23, 25) + distance(25, 27) + distance(24, 26) + distance(26, 28)) / 2) * scale * 10) / 10;
 return result;
}
