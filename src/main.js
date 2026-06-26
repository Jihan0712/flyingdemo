// src/main.js
// Entry point for WebAR using MindAR (face tracking) and Three.js.
// Initializes MindAR, creates the Three.js scene via arSceneSetup, and starts the render loop.

import { MindARThree } from 'mindar-face-three';
import * as THREE from 'three';
import { arSceneSetup } from './ar-scene.js';

let mindarThree;
let renderer, scene, camera;
let avatar; // will be set by arSceneSetup

export async function startAR() {
  // Create MindAR instance that will attach to document.body.
  mindarThree = new MindARThree({
    container: document.body,
    maxTrack: 1,
    // Additional MindAR config can be added here.
  });

  const { renderer: r, scene: s, camera: c } = mindarThree.three;
  renderer = r;
  scene = s;
  camera = c;

  // Setup Three.js objects: background video plane and avatar model.
  avatar = await arSceneSetup({ mindarThree, scene, camera });

  // Start MindAR and the render loop.
  await mindarThree.start();
  render();
}

function render() {
  const pose = mindarThree.controller.getFacePose(); // {position, rotation}
  if (pose && avatar) {
    // Apply pose to avatar.
    avatar.position.copy(pose.position);
    avatar.quaternion.copy(pose.rotation);
    // Simple lift‑off and shrink animation.
    avatar.position.y += 0.001;
    avatar.scale.multiplyScalar(0.999);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
