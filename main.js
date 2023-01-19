import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
// import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
// import {loadGLTF, loadAudio} from "./libs/loader.js";

//////////////////////////////////////////////////////////////
const video = document.getElementById("video");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas2.getContext("2d");

// HAND
let handpose;

let hands = [];

let tipX4; //thumb tip x-position
let tipY4; //thumb tip y-position
let tipX8; //indexfinger tip x-position
let tipY8; //indexfinger tip y-position
let tipX12; //middlefinger tip x-position
let tipY12; //middlefinger tip y-position
let tipX16; //ringfinger tip x-position
let tipY16; //ringfinger tip y-position
let tipX20; //pinky tip x-position
let tipY20; //pinky tip y-position

let actionboxXmin = 300;
let actionboxXmax = 340;
let actionboxYmin = 60;
let actionboxYmax = 100;

let action;

let activeThumb = true;
let activeIndex = true;
let activeMiddle = true;
let activeRing = true;
let activePinky = true;

handpose = ml5.handpose(video, modelReady);

// This sets up an event that fills the global variable "predictions"
// with an array every time new hand poses are detected
handpose.on("hand", (results) => {
  hands = results;
  // console.log(hands)
});

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < hands.length; i++) {
    const hand = hands[i];

    for (let j = 0; j < hand.landmarks.length; j++) {
      const keypoint = hand.landmarks[j];
      //  console.log(hand);
      ctx.beginPath();
      ctx.fillStyle = "green";
      ctx.arc(keypoint[0], keypoint[1], 5, 0, 2 * Math.PI);
      ctx.fill();

      // thumbs tip
      if (j == 4) {
        tipX4 = keypoint[0];
        tipY4 = keypoint[1];
        // console.log(tipX4)
      }
      // indexfinger tip
      if (j == 8) {
        tipX8 = keypoint[0];
        tipY8 = keypoint[1];
      }
      // middlefinger tip
      if (j == 12) {
        tipX12 = keypoint[0];
        tipY12 = keypoint[1];
      }
      // ringfinger tip
      if (j == 16) {
        tipX16 = keypoint[0];
        tipY16 = keypoint[1];
      }
      // pinky tip
      if (j == 20) {
        tipX20 = keypoint[0];
        tipY20 = keypoint[1];
      }
    }
  }
  ctx.beginPath();
  ctx.fillStyle = "green";
  ctx.rect(300, 60, 40, 40);
  ctx.fill();

  checkHandpose();
}

function checkHandpose() {
  if (
    tipX4 > actionboxXmin &&
    tipX4 < actionboxXmax &&
    tipY4 > actionboxYmin &&
    tipY4 < actionboxYmax &&
    activeThumb
  ) {
    action = "ThumbsUp";
    activeThumb = false;
    activeIndex = true;
    activeMiddle = true;
    activeRing = true;
    activePinky = true;
    // console.log(action );
  } else if (
    tipX8 > actionboxXmin &&
    tipX8 < actionboxXmax &&
    tipY8 > actionboxYmin &&
    tipY8 < actionboxYmax &&
    activeIndex
  ) {
    action = "Walking";
    activeThumb = true;
    activeIndex = false;
    activeMiddle = true;
    activeRing = true;
    activePinky = true;
    // console.log(action);
  } else if (
    tipX12 > actionboxXmin &&
    tipX12 < actionboxXmax &&
    tipY12 > actionboxYmin &&
    tipY12 < actionboxYmax &&
    activeMiddle
  ) {
    action = "Running";
    activeThumb = true;
    activeIndex = true;
    activeMiddle = false;
    activeRing = true;
    activePinky = true;
    // console.log(action);
  } else if (
    tipX16 > actionboxXmin &&
    tipX16 < actionboxXmax &&
    tipY16 > actionboxYmin &&
    tipY16 < actionboxYmax &&
    activeRing
  ) {
    action = "Dance";
    activeThumb = true;
    activeIndex = true;
    activeMiddle = true;
    activeRing = false;
    activePinky = true;
    // console.log(action);
  } else if (
    tipX20 > actionboxXmin &&
    tipX20 < actionboxXmax &&
    tipY20 > actionboxYmin &&
    tipY20 < actionboxYmax &&
    activePinky
  ) {
    action = "Death";
    activeThumb = true;
    activeIndex = true;
    activeMiddle = true;
    activeRing = true;
    activePinky = false;
    // console.log(action);
  }
}
//End hand

// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    video.srcObject = stream;
    video.play();
  });
}

// A function to draw the video and handposes into the canvas.
// This function is independent of the result of handPose
// This way the video will not seem slow if handPose
// is not detecting a position
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  // ctx.drawImage(video, 0, 0, 640, 360);
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(0, 0, canvas2.width, canvas2.height);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  // drawSkeleton();
  window.requestAnimationFrame(drawCameraIntoCanvas);
}
// Loop over the drawCameraIntoCanvas function
drawCameraIntoCanvas();

function modelReady() {
  console.log("model ready");
}

const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Model
 */
const gltfLoader = new GLTFLoader();
let mixer = null;
let clips;

gltfLoader.load("RobotExpressive.glb", (gltf) => {
  gltf.scene.position.set(1, -1, 0);
  gltf.scene.scale.set(0.5, 0.5, 0.5);
  gltf.scene.rotation.set(0.2, 0, 0);

  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
    }
  });

  clips = gltf.animations;
  mixer = new THREE.AnimationMixer(gltf.scene);

  animateClips();

  scene.add(gltf.scene);
});
function animateClips() {
  const waveClip = THREE.AnimationClip.findByName(clips, "Wave");
  const waveAction = mixer.clipAction(waveClip);
  const thumbClip = THREE.AnimationClip.findByName(clips, "ThumbsUp");
  const thumbsAction = mixer.clipAction(thumbClip);
  const walkingClip = THREE.AnimationClip.findByName(clips, "Walking");
  const walkingAction = mixer.clipAction(walkingClip);
  const runningClip = THREE.AnimationClip.findByName(clips, "Running");
  const runningAction = mixer.clipAction(runningClip);
  const danceClip = THREE.AnimationClip.findByName(clips, "Dance");
  const danceAction = mixer.clipAction(danceClip);
  const deathClip = THREE.AnimationClip.findByName(clips, "Death");
  const deathAction = mixer.clipAction(deathClip);

  waveAction.play();

  switch (action) {
    case "ThumbsUp":
      waveAction.stop();
      walkingAction.stop();
      runningAction.stop();
      danceAction.stop();
      deathAction.stop();

      thumbsAction.play();

      break;

    case "Walking":
      waveAction.stop();
      thumbsAction.stop();
      runningAction.stop();
      danceAction.stop();
      deathAction.stop();

      walkingAction.play();

      break;

    case "Running":
      waveAction.stop();
      thumbsAction.stop();
      walkingAction.stop();
      danceAction.stop();
      deathAction.stop();

      runningAction.play();

      break;

    case "Dance":
      waveAction.stop();
      thumbsAction.stop();
      walkingAction.stop();
      runningAction.stop();
      deathAction.stop();

      danceAction.play();

      break;
    case "Death":
      waveAction.stop();
      thumbsAction.stop();
      walkingAction.stop();
      runningAction.stop();
      danceAction.stop();
      deathAction.play();
      deathAction.setLoop(THREE.LoopOnce);
      deathAction.clampWhenFinished = true;

      break;
  }
}

/**
 * Floor and shadow
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({
    color: "#006600",
    // metalness: 0,
    // roughness: 0.5
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -1.01;
scene.add(floor);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(3, 0, 5);
camera.lookAt(scene.position);
scene.add(camera);

/**
 * Lights
 */

// ambient
const ambientLight = new THREE.AmbientLight(0x999999);
scene.add(ambientLight);
//Spot
const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(0, 5, 4);
spotLight.intensity = 0.8;
spotLight.angle = 0.45;
spotLight.penumbra = 0.3;

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 5;
spotLight.shadow.camera.far = 10;

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 5, 15);
scene.add(directionalLight);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xa3a3a3);
renderer.shadowMap.enabled = true;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update mixer
  if (mixer) {
    animateClips();
    mixer.update(deltaTime);
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
