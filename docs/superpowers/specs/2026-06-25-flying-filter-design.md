---
name: flying-filter-design
description: Design specification for a webAR face‑tracking flying filter using MindAR and Three.js.
metadata:
  type: reference
---

# WebAR Flying Filter – Design Specification

**Date:** 2026‑06‑25
**Author:** Claude (assistant)
**Project:** Flying Filter WebAR
**Libraries:** MindAR‑JS (face tracking), Three.js (3‑D rendering)

## Overview
The goal is a web page that, after the user presses a **Start AR** button, accesses the webcam, tracks the user’s face, and replaces the real background with a looping video while displaying a Superman‑style avatar that appears to fly away from the camera.

## File Layout
```
/public
  /assets
    background.mp4            # looping video (embedded asset)
    avatar.glb                # low‑poly Superman‑style model (GLTF/GLB)
index.html
/src
  main.js                     # entry point – UI, camera permission, MindAR init
  ar-scene.js                 # builds Three.js scene (background plane + avatar)
  ui.js                       # start‑button handling, error UI
package.json
```

## 1. UI & Activation Flow
1. **Initial view** – page shows a centered **Start AR** button.
2. **Button click** triggers `navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })`.
   * If permission granted: hide button, initialise MindAR and Three.js.
   * If denied: show a friendly message with a **Retry** button.
3. The AR experience runs in a single fullscreen WebGL canvas.

## 2. MindAR Configuration
```js
import { MindARThree } from 'mindar-face-three';
const mindar = new MindARThree({
  container: document.body,
  maxTrack: 1,               // track only the primary face
});
await mindar.start();
```
* No target image is needed – MindAR’s face‑mesh model provides real‑time landmarks.

## 3. Three.js Scene Construction (`ar-scene.js`)
* **Renderer & Camera** – standard WebGLRenderer with `alpha:true` and a perspective camera.
* **Background Plane** – a large `PlaneGeometry` placed far behind the avatar (`z = -5`). Its material uses a `VideoTexture` created from the embedded `background.mp4`.
* **Avatar** – load `avatar.glb` via `GLTFLoader`. The loaded scene is added to a parent `Object3D` that will be updated each frame with the face pose.
* **Flying Animation** – after the first pose is received, a simple time‑based lift‑off animation increments the avatar’s `y` position and gradually reduces its `scale` to simulate moving away from the camera.

### Example Scene Setup
```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const {renderer, scene, camera} = mindar.three;

// Background video texture
const video = document.createElement('video');
video.src = '/assets/background.mp4';
video.loop = true;
video.muted = true;
video.play();
const videoTex = new THREE.VideoTexture(video);
const bgPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 10),
  new THREE.MeshBasicMaterial({ map: videoTex })
);
bgPlane.position.set(0, 0, -5);
bgPlane.renderOrder = -1;
scene.add(bgPlane);

// Avatar
const loader = new GLTFLoader();
let avatar;
loader.load('/assets/avatar.glb', gltf => {
  avatar = gltf.scene;
  avatar.scale.set(1,1,1);
  scene.add(avatar);
});
```

## 4. Render Loop (`main.js`)
```js
function render(){
  const pose = mindar.controller.getFacePose(); // {position, rotation}
  if(pose && avatar){
    avatar.position.copy(pose.position);
    avatar.quaternion.copy(pose.rotation);
    // lift‑off animation
    avatar.position.y += 0.001;          // rise slowly
    avatar.scale.multiplyScalar(0.999);  // shrink to simulate distance
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
```

## 5. Responsiveness & Fallbacks
* Mobile browsers require `playsinline` and `muted` on the video element to allow autoplay.
* If `getUserMedia` is rejected, display a modal with a **Retry** button and a brief explanation.
* Use CSS media queries to ensure the **Start AR** button and canvas fill the viewport on all devices.

## 6. Build / Deployment
* Use Vite (or plain npm scripts) to bundle ES modules.
* Deploy as static assets – GitHub Pages, Netlify, Vercel, or any static host.
* No server‑side code is required; all processing occurs in the browser.

## 7. Future Extensions (out of scope for now)
* Add particle effects (e.g., clouds) that follow the avatar.
* Support alternative background sources (e.g., live webcam feed, user‑uploaded video).
* Provide a UI to switch between different avatar skins.

---
**End of Specification**
```
