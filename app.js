import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fa7a0);
scene.fog = new THREE.Fog(0x8fa7a0, 80, 420);

const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

/* =========================
   LIGHT
========================= */

scene.add(new THREE.HemisphereLight(0xcfe4ff, 0x39452e, 2.2));

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(80, 140, 60);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);

/* =========================
   MATERIALS
========================= */

const matGround = new THREE.MeshStandardMaterial({
  color: 0x4b5146,
  roughness: 1
});

const matRoad = new THREE.MeshStandardMaterial({
  color: 0x555653,
  roughness: 1
});

const matGravel = new THREE.MeshStandardMaterial({
  color: 0x77766d,
  roughness: 1
});

const matGrass = new THREE.MeshStandardMaterial({
  color: 0x263d24,
  roughness: 1
});

const matTree = new THREE.MeshStandardMaterial({
  color: 0x18351d,
  roughness: 1
});

const matTruckWhite = new THREE.MeshStandardMaterial({
  color: 0xe8e8e4,
  roughness: 0.65
});

const matTruckBlack = new THREE.MeshStandardMaterial({
  color: 0x111315,
  roughness: 0.7
});

const matBlue = new THREE.MeshStandardMaterial({
  color: 0x164f87,
  roughness: 0.6
});

const matYellow = new THREE.MeshStandardMaterial({
  color: 0xf2c300,
  roughness: 0.6
});

const matGlass = new THREE.MeshStandardMaterial({
  color: 0x18252d,
  roughness: 0.25,
  metalness: 0.1
});

/* =========================
   GROUND
========================= */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(900, 900),
  matGround
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* =========================
   HAUL ROAD
========================= */

const roadPoints = [];

for (let i = 0; i <= 240; i++) {
  const z = 180 - i * 1.5;
  const x =
    Math.sin(i * 0.075) * 24 +
    Math.sin(i * 0.021) * 32;

  const y =
    1.5 +
    Math.sin(i * 0.045) * 5 +
    Math.sin(i * 0.013) * 8;

  roadPoints.push(new THREE.Vector3(x, y, z));
}

const roadWidth = 11;

for (let i = 0; i < roadPoints.length - 1; i++) {
  const a = roadPoints[i];
  const b = roadPoints[i + 1];

  const direction = new THREE.Vector3()
    .subVectors(b, a)
    .normalize();

  const side = new THREE.Vector3(
    -direction.z,
    0,
    direction.x
  ).normalize();

  const vertices = [
    a.clone().add(side.clone().multiplyScalar(roadWidth / 2)),
    a.clone().add(side.clone().multiplyScalar(-roadWidth / 2)),
    b.clone().add(side.clone().multiplyScalar(-roadWidth / 2)),
    b.clone().add(side.clone().multiplyScalar(roadWidth / 2))
  ];

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      vertices.flatMap(v => [v.x, v.y, v.z]),
      3
    )
  );

  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();

  const road = new THREE.Mesh(geometry, matRoad);
  road.receiveShadow = true;

  scene.add(road);
}

/* =========================
   ROAD GRAVEL
========================= */

for (let i = 0; i < 650; i++) {
  const p = roadPoints[
    Math.floor(Math.random() * (roadPoints.length - 1))
  ];

  const gravel = new THREE.Mesh(
    new THREE.DodecahedronGeometry(
      0.06 + Math.random() * 0.12,
      0
    ),
    matGravel
  );

  gravel.position.set(
    p.x + (Math.random() - 0.5) * 9,
    p.y + 0.04 + Math.random() * 0.08,
    p.z + (Math.random() - 0.5) * 9
  );

  gravel.rotation.set(
    Math.random(),
    Math.random(),
    Math.random()
  );

  scene.add(gravel);
}

/* =========================
   HILLS
========================= */

for (let i = 0; i < 80; i++) {
  const hill = new THREE.Mesh(
    new THREE.ConeGeometry(
      12 + Math.random() * 20,
      18 + Math.random() * 35,
      7
    ),
    matGrass
  );

  const side = Math.random() < 0.5 ? -1 : 1;
  const p = roadPoints[
    Math.floor(Math.random() * roadPoints.length)
  ];

  hill.position.set(
    p.x + side * (18 + Math.random() * 35),
    5,
    p.z + (Math.random() - 0.5) * 25
  );

  hill.rotation.y = Math.random() * Math.PI;
  hill.scale.y = 1.2;

  hill.castShadow = true;
  hill.receiveShadow = true;

  scene.add(hill);
}

/* =========================
   TREES
========================= */

function createTree(x, y, z, scale = 1) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.3, 3, 7),
    new THREE.MeshStandardMaterial({
      color: 0x4b3321
    })
  );

  trunk.position.y = 1.5;
  trunk.castShadow = true;
  group.add(trunk);

  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(
        2.2 - i * 0.35,
        3.2,
        8
      ),
      matTree
    );

    crown.position.y = 3.1 + i * 1.2;
    crown.castShadow = true;
    group.add(crown);
  }

  group.position.set(x, y, z);
  group.scale.setScalar(scale);

  scene.add(group);
}

for (let i = 0; i < 360; i++) {
  const p = roadPoints[
    Math.floor(Math.random() * roadPoints.length)
  ];

  const side = Math.random() < 0.5 ? -1 : 1;

  createTree(
    p.x + side * (10 + Math.random() * 25),
    p.y,
    p.z + (Math.random() - 0.5) * 18,
    0.7 + Math.random() * 0.9
  );
}

/* =========================
   TRUCK
========================= */

const truck = new THREE.Group();
scene.add(truck);

function box(
  w,
  h,
  d,
  material,
  x = 0,
  y = 0,
  z = 0
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  truck.add(mesh);
  return mesh;
}

/* chassis */

box(3.25, 0.42, 8.5, matTruckBlack, 0, 2.0, 0);

/* cab */

box(3.15, 2.8, 3.0, matTruckWhite, 0, 3.65, 2.4);

/* cab lower */

box(3.3, 0.7, 3.2, matTruckBlack, 0, 2.35, 2.35);

/* windshield */

box(2.65, 1.25, 0.08, matGlass, 0, 4.15, 0.88);

/* front grille */

box(2.15, 1.0, 0.12, matTruckBlack, 0, 3.05, 0.84);

/* bumper */

box(3.4, 0.45, 0.7, matTruckBlack, 0, 2.05, 0.55);

/* blue/yellow livery */

box(3.2, 0.28, 1.9, matBlue, 0, 3.0, 2.65);

box(3.22, 0.16, 1.9, matYellow, 0, 3.25, 2.65);

/* mirrors */

box(0.35, 0.65, 0.65, matTruckBlack, -1.8, 4.1, 1.7);
box(0.35, 0.65, 0.65, matTruckBlack, 1.8, 4.1, 1.7);

/* steps */

box(0.5, 0.25, 0.9, matTruckBlack, -1.7, 2.4, 1.4);
box(0.5, 0.25, 0.9, matTruckBlack, 1.7, 2.4, 1.4);

/* tank */

const tank = new THREE.Mesh(
  new THREE.CylinderGeometry(0.55, 0.55, 2.5, 16),
  new THREE.MeshStandardMaterial({
    color: 0x777b78,
    metalness: 0.5,
    roughness: 0.35
  })
);

tank.rotation.z = Math.PI / 2;
tank.position.set(-1.85, 1.85, -1.0);
tank.castShadow = true;
truck.add(tank);

/* dump body */

const dump = new THREE.Group();
dump.position.set(0, 3.8, -2.0);
truck.add(dump);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(3.05, 2.2, 5.0),
  matTruckWhite
);

body.position.y = 0.6;
body.castShadow = true;
dump.add(body);

/* dump top rim */

box(3.25, 0.18, 5.15, matTruckBlack, 0, 5.05, -2.0);

/* hazard stripes */

for (let i = -1; i <= 1; i++) {
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 1.2, 0.08),
    matYellow
  );

  stripe.position.set(
    i * 0.7,
    3.9,
    -4.55
  );

  stripe.rotation.z = -0.45;
  truck.add(stripe);
}

/* hydraulic cylinder */

const hydraulic = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.12, 2.4, 10),
  new THREE.MeshStandardMaterial({
    color: 0xb8b8b8,
    metalness: 0.7,
    roughness: 0.25
  })
);

hydraulic.position.set(0, 3.0, -1.2);
hydraulic.rotation.z = 0.3;
truck.add(hydraulic);

/* =========================
   WHEELS 8x4
========================= */

const wheels = [];

function createWheel(x, z) {
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.65,
      0.65,
      0.45,
      20
    ),
    matTruckBlack
  );

  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, 1.25, z);
  wheel.castShadow = true;

  truck.add(wheel);
  wheels.push(wheel);
}

/* 4 axles */

[-2.65, -0.9, 0.9, 2.65].forEach(z => {
  createWheel(-1.72, z);
  createWheel(1.72, z);
});

/* =========================
   START POSITION
========================= */

let roadIndex = 225;

truck.position.copy(roadPoints[roadIndex]);

function updateTruckRotation() {
  const next =
    roadPoints[Math.max(0, roadIndex - 1)];

  const current = roadPoints[roadIndex];

  const direction = new THREE.Vector3()
    .subVectors(next, current);

  truck.rotation.y =
    Math.atan2(direction.x, direction.z);
}

updateTruckRotation();

/* =========================
   CONTROLS
========================= */

let throttle = false;
let brake = false;
let steering = 0;
let dumping = false;

function bindButton(id, down, up) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    down();
  });

  el.addEventListener("pointerup", e => {
    e.preventDefault();
    up();
  });

  el.addEventListener("pointercancel", up);
  el.addEventListener("pointerleave", up);
}

bindButton(
  "gas",
  () => throttle = true,
  () => throttle = false
);

bindButton(
  "brake",
  () => brake = true,
  () => brake = false
);

bindButton(
  "left",
  () => steering = -1,
  () => steering = 0
);

bindButton(
  "right",
  () => steering = 1,
  () => steering = 0
);

const dumpButton = document.getElementById("dump");

if (dumpButton) {
  dumpButton.addEventListener("pointerdown", () => {
    dumping = !dumping;
  });
}

/* =========================
   GAME MOVEMENT
========================= */

let speed = 0;

function updateTruck(dt) {
  if (throttle) {
    speed += dt * 8;
  } else {
    speed -= dt * 2.5;
  }

  if (brake) {
    speed -= dt * 15;
  }

  speed = THREE.MathUtils.clamp(speed, 0, 15);

  if (speed > 0.2) {
    roadIndex -= speed * dt * 0.7;
  }

  roadIndex = THREE.MathUtils.clamp(
    roadIndex,
    2,
    roadPoints.length - 2
  );

  const target = roadPoints[Math.floor(roadIndex)];

  truck.position.lerp(target, 0.18);

  updateTruckRotation();

  /* steering effect */

  truck.rotation.y += steering * dt * 0.25;

  /* dump animation */

  const targetDump =
    dumping ? -0.55 : 0;

  dump.rotation.x = THREE.MathUtils.lerp(
    dump.rotation.x,
    targetDump,
    dt * 3
  );

  wheels.forEach(w => {
    w.rotation.x -= speed * dt * 2;
  });
}

/* =========================
   CAMERA
========================= */

let cameraDistance = 14;
let cameraHeight = 7;

let touchX = 0;
let touchY = 0;
let cameraYaw = Math.PI;

renderer.domElement.addEventListener(
  "pointerdown",
  e => {
    touchX = e.clientX;
    touchY = e.clientY;
  }
);

renderer.domElement.addEventListener(
  "pointermove",
  e => {
    if (e.buttons === 0) return;

    const dx = e.clientX - touchX;
    const dy = e.clientY - touchY;

    cameraYaw -= dx * 0.006;
    cameraHeight -= dy * 0.025;

    cameraHeight =
      THREE.MathUtils.clamp(cameraHeight, 3, 12);

    touchX = e.clientX;
    touchY = e.clientY;
  }
);

function updateCamera(dt) {
  const offset = new THREE.Vector3(
    Math.sin(cameraYaw) * cameraDistance,
    cameraHeight,
    Math.cos(cameraYaw) * cameraDistance
  );

  const desired = truck.position
    .clone()
    .add(offset);

  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));

  const look = truck.position
    .clone()
    .add(new THREE.Vector3(0, 2.2, 0));

  camera.lookAt(look);
}

/* =========================
   UI
========================= */

const status =
  document.getElementById("status");

function updateUI() {
  if (!status) return;

  const kmh = Math.round(speed * 3.6);

  status.textContent =
    dumping
      ? `DUMP BODY • ${kmh} km/h`
      : `DT030-0204 • ${kmh} km/h`;
}

/* =========================
   RESIZE
========================= */

addEventListener("resize", () => {
  camera.aspect =
    innerWidth / innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
});

/* =========================
   MAIN LOOP
========================= */

function animate() {
  requestAnimationFrame(animate);

  const dt =
    Math.min(clock.getDelta(), 0.05);

  updateTruck(dt);
  updateCamera(dt);
  updateUI();

  renderer.render(scene, camera);
}

animate();
