// src/ar-scene.js
// Sets up Three.js scene for MindAR face tracking AR.
// Adds a looping background video plane and loads an avatar model.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export async function arSceneSetup({ mindarThree, scene, camera }) {
  // Background video texture
  const video = document.createElement('video');
  video.src = '/assets/video/placeholder.mp4';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  await video.play();
  const videoTex = new THREE.VideoTexture(video);

  const bgPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.DoubleSide })
  );
  bgPlane.position.set(0, 0, -5);
  bgPlane.renderOrder = -1;
  scene.add(bgPlane);

  // Load avatar model
  const loader = new GLTFLoader();
  const gltf = await new Promise((resolve, reject) => {
    loader.load('/assets/model/placeholder.bin', resolve, undefined, reject);
  });
  const avatar = gltf.scene;
  avatar.scale.set(1, 1, 1);
  scene.add(avatar);

  // Expose avatar to main.js for pose updates
  // Using a global variable via attach to window for simplicity
  window.__arAvatar = avatar;
}
