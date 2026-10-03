// Classic worker lets the MediaPipe WASM loader use importScripts.
const visionModule=import('/public/vendor/mediapipe/vision_bundle.mjs');
let detector;
self.onmessage=async({data})=>{
 try{
  const {FilesetResolver,PoseLandmarker}=await visionModule;
  detector??=await PoseLandmarker.createFromOptions(await FilesetResolver.forVisionTasks('/public/vendor/mediapipe/wasm'),{baseOptions:{modelAssetPath:'/public/models/pose_landmarker_lite.task',delegate:'CPU'},runningMode:'IMAGE',numPoses:2,outputSegmentationMasks:true,minPoseDetectionConfidence:0.6,minPosePresenceConfidence:0.6});
  const result=detector.detect(data.bitmap);
  let segmentation = null;
  try {
   const mask = result.segmentationMasks?.[0];
   if (mask) segmentation = { width: mask.width, height: mask.height, pixels: Uint8Array.from(mask.getAsFloat32Array(), value => Math.round(Math.max(0, Math.min(1, value)) * 255)) };
   self.postMessage({id:data.id,landmarks:result.landmarks,segmentation},segmentation?[segmentation.pixels.buffer]:[]);
  } finally { result.segmentationMasks?.forEach(mask=>mask.close()); }
 }catch(error){self.postMessage({id:data.id,error:error.message});}
 finally{data.bitmap.close();}
};
