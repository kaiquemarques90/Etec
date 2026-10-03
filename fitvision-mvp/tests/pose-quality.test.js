import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessPose,estimateShoulders} from '../src/features/body-analysis/pose-quality.js';
const pose=()=>Array.from({length:33},(_,i)=>({x:i===11?.35:i===12?.65:.5,y:i<23?.3:i<25?.55:i<27?.7:.9,visibility:.95}));
test('ausência ou múltiplas pessoas bloqueiam calibração',()=>{assert.equal(assessPose([]).valid,false);assert.equal(assessPose([pose(),pose()]).valid,false);});
test('pontos visíveis e nivelados aceitam revisão',()=>assert.equal(assessPose([pose()]).valid,true));
test('tornozelo oculto e ombros desnivelados bloqueiam calibração',()=>{const points=pose();points[27].visibility=.1;assert.equal(assessPose([points]).valid,false);points[27].visibility=.95;points[11].y=.15;assert.equal(assessPose([points]).valid,false);});
test('calibração usa proporção de pixels e altura sem inferir circunferências',()=>{assert.equal(estimateShoulders(pose(),1000,2000,180,.05,.95),30);assert.throws(()=>estimateShoulders(pose(),1000,2000,180,.3,.4));assert.throws(()=>estimateShoulders(pose(),1000,2000,0,.05,.95));});
