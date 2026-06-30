import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WeatherType, ActiveHotspot } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Sunset, Moon, CloudRain, RotateCcw, Sprout, Droplets, Info, Eye, TreePine, Sparkles } from "lucide-react";

interface Farm3DCanvasProps {
  weather: WeatherType;
  setWeather: (w: WeatherType) => void;
  selectedHotspot: ActiveHotspot | null;
  setSelectedHotspot: (h: ActiveHotspot | null) => void;
}

// Hotspots on the farm
const FARM_HOTSPOTS: ActiveHotspot[] = [
  {
    id: "kudil",
    name: "Traditional Clay Kudil",
    description: "Our signature heritage eco-cottage built with organic clay, cow dung wash, and high-thatch insulation. Experience pure natural cooling, absolute serenity, and an authentic farm stay.",
    cameraPos: [6, 4, 6],
    targetPos: [0, 1, 0],
  },
  {
    id: "crop_grid",
    name: "Organic Crop Cultivation Grid",
    description: "Interactive farming sector. Try sowing seeds (Heritage Rice, Organic Millets, Sesame), watering them, and watching them grow in real-time under natural farming conditions.",
    cameraPos: [-1, 3, 5],
    targetPos: [-3, 0, 2],
  },
  {
    id: "windmill",
    name: "Sustainable Power Windmill",
    description: "Harnessing pristine wind energy to pump water and power our cold-pressing oil mills. Nam Kudil is fully committed to zero-carbon circular eco-farming.",
    cameraPos: [-6, 6, -3],
    targetPos: [-4, 3, -4],
  },
  {
    id: "well",
    name: "Heritage Water Well",
    description: "A traditional rainwater harvesting deep well, distributing vital nourishment to our fields via ancient gravity channels without disrupting the groundwater table.",
    cameraPos: [4, 3, -4],
    targetPos: [2, 0, -2],
  },
];

interface PlantState {
  id: string;
  gridIndex: number;
  type: "rice" | "millet" | "sesame";
  growth: number; // 0 to 100
  waterLevel: number; // 0 to 100
  mesh: THREE.Group | null;
}

export default function Farm3DCanvas({
  weather,
  setWeather,
  selectedHotspot,
  setSelectedHotspot,
}: Farm3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scene references for animations
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const windmillBladesRef = useRef<THREE.Group | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const starParticlesRef = useRef<THREE.Points | null>(null);
  const windowGlowsRef = useRef<THREE.PointLight[]>([]);
  const chimneySmokeRef = useRef<THREE.Group | null>(null);
  const cloudGroupRef = useRef<THREE.Group | null>(null);

  // Interactive grid state
  const [selectedSeed, setSelectedSeed] = useState<"rice" | "millet" | "sesame">("rice");
  const [plants, setPlants] = useState<PlantState[]>([
    { id: "p1", gridIndex: 1, type: "rice", growth: 40, waterLevel: 80, mesh: null },
    { id: "p2", gridIndex: 4, type: "millet", growth: 20, waterLevel: 60, mesh: null },
    { id: "p3", gridIndex: 8, type: "sesame", growth: 70, waterLevel: 45, mesh: null },
  ]);

  const plantsRef = useRef<PlantState[]>([]);
  useEffect(() => {
    plantsRef.current = plants;
  }, [plants]);

  // Lighting references for real-time sky transitions
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Grow and Tick state
  useEffect(() => {
    const interval = setInterval(() => {
      setPlants((prev) =>
        prev.map((p) => {
          // Plants dry out over time
          const newWater = Math.max(0, p.waterLevel - (weather === "rainy" ? -5 : 4));
          // Plants grow if they have water
          const isWatered = newWater > 15;
          const newGrowth = isWatered ? Math.min(100, p.growth + (weather === "sunny" ? 3 : 2)) : p.growth;
          return {
            ...p,
            waterLevel: Math.min(100, newWater),
            growth: newGrowth,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [weather]);

  // Handle sowed plant models in ThreeJS
  const gridPositions: [number, number, number][] = [
    [-4, 0.05, 1], [-3, 0.05, 1], [-2, 0.05, 1],
    [-4, 0.05, 2], [-3, 0.05, 2], [-2, 0.05, 2],
    [-4, 0.05, 3], [-3, 0.05, 3], [-2, 0.05, 3],
  ];

  // Plant a seed
  const handleSowSeed = (gridIdx: number) => {
    // Check if space already taken
    if (plants.some((p) => p.gridIndex === gridIdx)) return;

    const newPlant: PlantState = {
      id: "plant_" + Date.now(),
      gridIndex: gridIdx,
      type: selectedSeed,
      growth: 0,
      waterLevel: 100,
      mesh: null,
    };

    setPlants((prev) => [...prev, newPlant]);
  };

  // Water a plant
  const handleWaterPlant = (gridIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlants((prev) =>
      prev.map((p) => {
        if (p.gridIndex === gridIdx) {
          // Trigger blue splash particles at this location
          triggerSplashParticles(gridPositions[gridIdx]);
          return { ...p, waterLevel: 100 };
        }
        return p;
      })
    );
  };

  const splashGroupRef = useRef<THREE.Group | null>(null);
  const triggerSplashParticles = (pos: [number, number, number]) => {
    if (!sceneRef.current || !splashGroupRef.current) return;
    const geometry = new THREE.BufferGeometry();
    const count = 30;
    const positions = new Float32Array(count * 3);
    const velocities: number[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos[0] + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = pos[1] + 0.1;
      positions[i * 3 + 2] = pos[2] + (Math.random() - 0.5) * 0.4;

      velocities.push(
        (Math.random() - 0.5) * 0.05,
        Math.random() * 0.08 + 0.05,
        (Math.random() - 0.5) * 0.05
      );
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
    });

    const splash = new THREE.Points(geometry, material);
    splashGroupRef.current.add(splash);

    let frames = 0;
    const animateSplash = () => {
      const posArr = splash.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3] += velocities[i * 3];
        posArr[i * 3 + 1] += velocities[i * 3 + 1];
        posArr[i * 3 + 2] += velocities[i * 3 + 2];
        // add gravity
        velocities[i * 3 + 1] -= 0.005;
      }
      splash.geometry.attributes.position.needsUpdate = true;
      frames++;

      if (frames < 30) {
        requestAnimationFrame(animateSplash);
      } else {
        splashGroupRef.current?.remove(splash);
        splash.geometry.dispose();
        material.dispose();
      }
    };
    animateSplash();
  };

  // Weather effect updates (lighting & particle visibility)
  useEffect(() => {
    const dirLight = dirLightRef.current;
    const hemiLight = hemiLightRef.current;
    const rainParticles = rainParticlesRef.current;
    const starParticles = starParticlesRef.current;
    const windowGlows = windowGlowsRef.current;
    const scene = sceneRef.current;

    if (!scene || !dirLight || !hemiLight) return;

    let targetBgColor = new THREE.Color(0xdceefb); // default sky blue
    let targetLightColor = new THREE.Color(0xffffff);
    let targetHemiColor = new THREE.Color(0xdceefb);
    let targetIntensity = 1.2;
    let windowGlowIntensity = 0.0;

    if (weather === "sunny") {
      targetBgColor.setHex(0xd4f1f9);
      targetLightColor.setHex(0xfffaed);
      targetHemiColor.setHex(0xdceefb);
      targetIntensity = 1.3;
      windowGlowIntensity = 0.0;
      if (rainParticles) rainParticles.visible = false;
      if (starParticles) starParticles.visible = false;
    } else if (weather === "sunset") {
      targetBgColor.setHex(0xfdba74); // orange-sunset
      targetLightColor.setHex(0xf97316);
      targetHemiColor.setHex(0xfef08a);
      targetIntensity = 0.8;
      windowGlowIntensity = 1.5;
      if (rainParticles) rainParticles.visible = false;
      if (starParticles) starParticles.visible = true;
    } else if (weather === "night") {
      targetBgColor.setHex(0x0f172a); // midnight slate
      targetLightColor.setHex(0x94a3b8);
      targetHemiColor.setHex(0x1e293b);
      targetIntensity = 0.2;
      windowGlowIntensity = 3.5;
      if (rainParticles) rainParticles.visible = false;
      if (starParticles) starParticles.visible = true;
    } else if (weather === "rainy") {
      targetBgColor.setHex(0x64748b); // rainy cloud gray
      targetLightColor.setHex(0x94a3b8);
      targetHemiColor.setHex(0x475569);
      targetIntensity = 0.5;
      windowGlowIntensity = 1.0;
      if (rainParticles) rainParticles.visible = true;
      if (starParticles) starParticles.visible = false;
    }

    // Smooth transition
    scene.background = targetBgColor;
    scene.fog = new THREE.FogExp2(targetBgColor.getHex(), 0.015);
    dirLight.color.copy(targetLightColor);
    dirLight.intensity = targetIntensity;
    hemiLight.color.copy(targetHemiColor);

    windowGlows.forEach((g) => {
      g.intensity = windowGlowIntensity;
    });
  }, [weather]);

  // Hotspot Focus Camera Animation
  useEffect(() => {
    if (!selectedHotspot || !cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const startTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };

    const endPos = {
      x: selectedHotspot.cameraPos[0],
      y: selectedHotspot.cameraPos[1],
      z: selectedHotspot.cameraPos[2],
    };
    const endTarget = {
      x: selectedHotspot.targetPos[0],
      y: selectedHotspot.targetPos[1],
      z: selectedHotspot.targetPos[2],
    };

    let progress = 0;
    const duration = 45; // frames

    const anim = () => {
      progress++;
      const t = progress / duration;
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.set(
        startPos.x + (endPos.x - startPos.x) * ease,
        startPos.y + (endPos.y - startPos.y) * ease,
        startPos.z + (endPos.z - startPos.z) * ease
      );

      controls.target.set(
        startTarget.x + (endTarget.x - startTarget.x) * ease,
        startTarget.y + (endTarget.y - startTarget.y) * ease,
        startTarget.z + (endTarget.z - startTarget.z) * ease
      );

      controls.update();

      if (progress < duration) {
        requestAnimationFrame(anim);
      }
    };

    anim();
  }, [selectedHotspot]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const initialBg = new THREE.Color(0xdceefb);
    scene.background = initialBg;
    scene.fog = new THREE.FogExp2(initialBg.getHex(), 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 7, 10);
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go under ground
    controls.minDistance = 3;
    controls.maxDistance = 22;
    controlsRef.current = controls;

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xdceefb, 0x5e8a75, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(10, 15, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    const d = 10;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Splash particles group
    const splashGroup = new THREE.Group();
    scene.add(splashGroup);
    splashGroupRef.current = splashGroup;

    // 5. THE FARM GROUND (Circular landscape)
    const groundGeo = new THREE.CylinderGeometry(10, 10.3, 0.4, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f, // beautiful grass green
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sand circular path
    const pathGeo = new THREE.RingGeometry(0, 3, 24);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // warm sand yellow
      roughness: 1.0,
      side: THREE.DoubleSide,
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set(0, 0.01, 1.5);
    pathMesh.receiveShadow = true;
    scene.add(pathMesh);

    // Clay brick-like farm borders
    const borderGeo = new THREE.TorusGeometry(10, 0.15, 8, 32);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // terracotta
      roughness: 0.8,
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    scene.add(border);

    // 6. TRADITIONAL KUDIL (THE COTTAGE)
    const kudilGroup = new THREE.Group();
    scene.add(kudilGroup);

    // Main clay house walls
    const houseGeo = new THREE.BoxGeometry(2.4, 1.5, 1.8);
    const houseMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // earthy clay orange/brown
      roughness: 1.0,
    });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.y = 0.75;
    house.castShadow = true;
    house.receiveShadow = true;
    kudilGroup.add(house);

    // Beautiful Thatch/Tiled Roof (Pyramid)
    const roofGeo = new THREE.ConeGeometry(2.0, 1.2, 4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // thatched dark brown/red
      roughness: 1.0,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.5 + 0.6, 0);
    roof.rotation.y = Math.PI / 4; // match house bounds
    roof.castShadow = true;
    kudilGroup.add(roof);

    // Cottage door
    const doorGeo = new THREE.BoxGeometry(0.5, 1.0, 0.05);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.5, 0.9);
    door.castShadow = true;
    kudilGroup.add(door);

    // Left and right windows (with glow material)
    const winGeo = new THREE.BoxGeometry(0.35, 0.35, 0.05);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    });

    const windowL = new THREE.Mesh(winGeo, winMat);
    windowL.position.set(-0.7, 0.8, 0.9);
    kudilGroup.add(windowL);

    const windowR = windowL.clone();
    windowR.position.x = 0.7;
    kudilGroup.add(windowR);

    // Warm PointLight inside the Cottage porch
    const porchLight = new THREE.PointLight(0xf59e0b, 0, 5);
    porchLight.position.set(0, 1.2, 1.1);
    kudilGroup.add(porchLight);
    windowGlowsRef.current.push(porchLight);

    // Small traditional porch fence
    const porchGeo = new THREE.BoxGeometry(1.6, 0.1, 0.4);
    const porchMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const porch = new THREE.Mesh(porchGeo, porchMat);
    porch.position.set(0, 0.05, 1.1);
    porch.receiveShadow = true;
    kudilGroup.add(porch);

    // Small chimney smoke emitter group
    const chimneySmoke = new THREE.Group();
    chimneySmoke.position.set(-0.8, 2.2, -0.4);
    scene.add(chimneySmoke);
    chimneySmokeRef.current = chimneySmoke;

    const chimneyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8);
    const chimney = new THREE.Mesh(chimneyGeo, doorMat);
    chimney.position.set(-0.8, 1.7, -0.4);
    chimney.castShadow = true;
    kudilGroup.add(chimney);

    // 7. COCONUT TREES (Lush greenery)
    const createTree = (x: number, z: number, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.scale.set(scale, scale, scale);

      // Curved Trunk
      const segments = 5;
      const heightStep = 0.5;
      let curY = 0;
      let curX = 0;

      for (let i = 0; i < segments; i++) {
        const trunkGeo = new THREE.CylinderGeometry(
          0.12 - i * 0.01,
          0.14 - i * 0.01,
          heightStep,
          8
        );
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 1.0 });
        const trunkSeg = new THREE.Mesh(trunkGeo, trunkMat);
        trunkSeg.position.set(curX, curY + heightStep / 2, 0);
        // Tilt slightly outwards
        trunkSeg.rotation.z = -0.08 * i;
        trunkSeg.castShadow = true;
        tree.add(trunkSeg);

        curY += heightStep * Math.cos(0.08 * i);
        curX += heightStep * Math.sin(0.08 * i);
      }

      // Coconut leaves (arranged in star pattern)
      const leavesCount = 8;
      const leavesGroup = new THREE.Group();
      leavesGroup.position.set(curX, curY, 0);

      for (let j = 0; j < leavesCount; j++) {
        const leafGeo = new THREE.ConeGeometry(0.15, 1.2, 4);
        const leafMat = new THREE.MeshStandardMaterial({
          color: 0x15803d, // dark jungle green
          roughness: 0.9,
        });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.rotation.z = Math.PI / 2.8;
        leaf.rotation.y = (j * Math.PI * 2) / leavesCount;
        leaf.position.y = -0.1;
        leaf.castShadow = true;
        leavesGroup.add(leaf);
      }

      // Little yellow coconuts
      const cocoGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const cocoMat = new THREE.MeshStandardMaterial({ color: 0xca8a04 });
      for (let k = 0; k < 3; k++) {
        const coco = new THREE.Mesh(cocoGeo, cocoMat);
        coco.position.set(
          curX + (Math.random() - 0.5) * 0.2,
          curY - 0.15,
          (Math.random() - 0.5) * 0.2
        );
        coco.castShadow = true;
        tree.add(coco);
      }

      tree.add(leavesGroup);
      scene.add(tree);
    };

    // Plant trees around the farm perimeter
    createTree(3.5, 3.5, 1.2);
    createTree(4.5, 2.5, 1.0);
    createTree(4.0, 5.0, 0.9);
    createTree(-4.0, -4.0, 1.1);
    createTree(-5.0, -2.5, 1.2);
    createTree(-2.5, -5.0, 0.8);
    createTree(6.0, -2.5, 1.1);

    // 8. SUSTAINABLE POWER WINDMILL
    const windmillGroup = new THREE.Group();
    windmillGroup.position.set(-4.5, 0, -4.5);
    scene.add(windmillGroup);

    // Windmill Tower
    const towerGeo = new THREE.CylinderGeometry(0.15, 0.4, 4.0, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 2.0;
    tower.castShadow = true;
    windmillGroup.add(tower);

    // Windmill Engine Hub
    const hubGeo = new THREE.BoxGeometry(0.4, 0.4, 0.6);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(0, 4.0, 0);
    hub.castShadow = true;
    windmillGroup.add(hub);

    // Windmill Blades group
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 4.0, 0.35);
    windmillGroup.add(bladesGroup);
    windmillBladesRef.current = bladesGroup;

    // Center pin
    const pinGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8);
    const pin = new THREE.Mesh(pinGeo, hubMat);
    pin.rotation.x = Math.PI / 2;
    bladesGroup.add(pin);

    // 3 Blades
    const bladeGeo = new THREE.BoxGeometry(0.15, 1.8, 0.03);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    for (let b = 0; b < 3; b++) {
      const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
      bladeMesh.position.y = 0.9;
      const bladeWrapper = new THREE.Group();
      bladeWrapper.rotation.z = (b * Math.PI * 2) / 3;
      bladeWrapper.add(bladeMesh);
      bladesGroup.add(bladeWrapper);
    }

    // 9. HERITAGE WATER WELL
    const wellGroup = new THREE.Group();
    wellGroup.position.set(3, 0, -3);
    scene.add(wellGroup);

    // Circular wall
    const wallGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.7, 16);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 1.0 });
    const wellWall = new THREE.Mesh(wallGeo, wallMat);
    wellWall.position.y = 0.35;
    wellWall.castShadow = true;
    wellGroup.add(wellWall);

    // Water top disc
    const waterDiscGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.1, 16);
    const waterDiscMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // vibrant deep water blue
      roughness: 0.1,
      metalness: 0.8,
    });
    const waterDisc = new THREE.Mesh(waterDiscGeo, waterDiscMat);
    waterDisc.position.y = 0.55;
    wellGroup.add(waterDisc);

    // Wooden frame structure
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const postL = new THREE.Mesh(postGeo, postMat);
    postL.position.set(-0.6, 0.9, 0);
    postL.castShadow = true;
    wellGroup.add(postL);

    const postR = postL.clone();
    postR.position.x = 0.6;
    wellGroup.add(postR);

    const crossBarGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8);
    const crossBar = new THREE.Mesh(crossBarGeo, postMat);
    crossBar.rotation.z = Math.PI / 2;
    crossBar.position.set(0, 1.5, 0);
    crossBar.castShadow = true;
    wellGroup.add(crossBar);

    // 10. INTERACTIVE AGRICULTURAL CROPS GRID (SOIL SLABS)
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    // Create dark soil grid slabs
    const slabGeo = new THREE.BoxGeometry(0.8, 0.08, 0.8);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // dark organic peat soil
      roughness: 1.0,
    });

    gridPositions.forEach((pos, idx) => {
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(pos[0], pos[1], pos[2]);
      slab.receiveShadow = true;
      gridGroup.add(slab);
    });

    // 11. RAIN & STAR PARTICLE SYSTEM
    // Rain Particles
    const rainCount = 400;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount * 3; r += 3) {
      rainPos[r] = (Math.random() - 0.5) * 16;
      rainPos[r + 1] = Math.random() * 12;
      rainPos[r + 2] = (Math.random() - 0.5) * 16;
    }
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.1,
      transparent: true,
      opacity: 0.7,
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);
    rainParticlesRef.current = rainParticles;

    // Star Particles (Night Sky)
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let s = 0; s < starCount * 3; s += 3) {
      starPos[s] = (Math.random() - 0.5) * 35;
      starPos[s + 1] = Math.random() * 10 + 6;
      starPos[s + 2] = (Math.random() - 0.5) * 35;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    starParticles.visible = false;
    scene.add(starParticles);
    starParticlesRef.current = starParticles;

    // Floating Clouds Group
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);
    cloudGroupRef.current = cloudGroup;

    const createCloud = (x: number, y: number, z: number, scale = 1.0) => {
      const cloud = new THREE.Group();
      cloud.position.set(x, y, z);
      cloud.scale.set(scale, scale, scale);

      const sphereGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1.0,
        flatShading: true,
      });

      // Combine multiple overlapping spheres for fluffy low-poly look
      const leftPart = new THREE.Mesh(sphereGeo, sphereMat);
      leftPart.position.set(-0.4, 0, 0);
      cloud.add(leftPart);

      const centerPart = new THREE.Mesh(sphereGeo, sphereMat);
      centerPart.position.set(0, 0.2, 0);
      centerPart.scale.set(1.3, 1.3, 1.3);
      cloud.add(centerPart);

      const rightPart = new THREE.Mesh(sphereGeo, sphereMat);
      rightPart.position.set(0.4, -0.1, 0);
      cloud.add(rightPart);

      cloudGroup.add(cloud);
    };

    createCloud(-4, 4.5, -2, 0.8);
    createCloud(3, 5, 2, 1.1);
    createCloud(-1, 5.2, 4, 0.9);

    // Interactive plants cache reference
    const activePlantMeshes: { [id: string]: THREE.Group } = {};

    // 12. ANIMATION AND RENDER LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate Windmill blades depending on weather
      if (windmillBladesRef.current) {
        let rotationSpeed = 0.8;
        if (weather === "rainy") rotationSpeed = 1.6;
        if (weather === "night") rotationSpeed = 0.3;
        windmillBladesRef.current.rotation.z += rotationSpeed * 0.02;
      }

      // Drift Clouds slowly
      if (cloudGroupRef.current) {
        cloudGroupRef.current.children.forEach((cloud) => {
          cloud.position.x += 0.003;
          if (cloud.position.x > 10) {
            cloud.position.x = -10;
          }
        });
      }

      // Animate Rain
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let r = 1; r < rainCount * 3; r += 3) {
          positions[r] -= 0.15; // fall down speed
          if (positions[r] < 0) {
            positions[r] = 12; // reset height
          }
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Chimney Smoke
      if (chimneySmokeRef.current) {
        // Emit tiny puffs
        if (Math.random() < 0.05 && chimneySmokeRef.current.children.length < 15) {
          const puffGeo = new THREE.SphereGeometry(0.08, 5, 5);
          const puffMat = new THREE.MeshBasicMaterial({
            color: 0x94a3b8,
            transparent: true,
            opacity: 0.5,
          });
          const puff = new THREE.Mesh(puffGeo, puffMat);
          puff.position.set(0, 0, 0);
          chimneySmokeRef.current.add(puff);
        }

        // Animate existing puffs
        chimneySmokeRef.current.children.forEach((puff: any, index) => {
          puff.position.y += 0.015;
          puff.position.x += Math.sin(elapsedTime * 2 + index) * 0.003;
          puff.scale.addScalar(0.01);
          puff.material.opacity -= 0.01;

          if (puff.material.opacity <= 0) {
            chimneySmokeRef.current?.remove(puff);
          }
        });
      }

      // Sync Plant state growth and watering in 3D Canvas
      const curPlantsState = plantsRef.current;
      // Remove stale meshes
      Object.keys(activePlantMeshes).forEach((id) => {
        if (!curPlantsState.some((p) => p.id === id)) {
          scene.remove(activePlantMeshes[id]);
          delete activePlantMeshes[id];
        }
      });

      // Render/update current meshes
      curPlantsState.forEach((p) => {
        const gridPos = gridPositions[p.gridIndex];
        const growthFactor = p.growth / 100;

        if (!activePlantMeshes[p.id]) {
          // Create new visual representation
          const plantGroup = new THREE.Group();
          plantGroup.position.set(gridPos[0], gridPos[1], gridPos[2]);

          // Sprouts/leaves based on crop type
          const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.5, 8);
          const stemMat = new THREE.MeshStandardMaterial({
            color: p.type === "rice" ? 0x85e085 : p.type === "millet" ? 0x22c55e : 0xeab308,
            roughness: 0.9,
          });
          const stem = new THREE.Mesh(stemGeo, stemMat);
          stem.position.y = 0.25;
          stem.castShadow = true;
          plantGroup.add(stem);

          // Top foliage/seed pod
          const leafGeo = new THREE.ConeGeometry(0.12, 0.3, 4);
          const leafMat = new THREE.MeshStandardMaterial({
            color: p.type === "rice" ? 0x22c55e : p.type === "millet" ? 0x15803d : 0xca8a04,
          });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.y = 0.45;
          leaf.castShadow = true;
          plantGroup.add(leaf);

          scene.add(plantGroup);
          activePlantMeshes[p.id] = plantGroup;
        }

        // Animate growth scale
        const mesh = activePlantMeshes[p.id];
        const scaleVal = Math.max(0.1, growthFactor);
        mesh.scale.set(scaleVal, scaleVal, scaleVal);
        // Add dynamic organic swaying
        mesh.rotation.z = Math.sin(elapsedTime * 2.5 + p.gridIndex) * 0.05 * (weather === "rainy" ? 1.5 : 1.0);
      });

      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // 13. RESIZE OBSERVATION
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: w, height: h } = entries[0].contentRect;
      const targetHeight = h || 500;

      camera.aspect = w / targetHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(w, targetHeight);
    });

    resizeObserver.observe(containerRef.current);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();

      // Dispose geometries & materials
      groundGeo.dispose();
      groundMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      borderGeo.dispose();
      borderMat.dispose();
      houseGeo.dispose();
      houseMat.dispose();
      roofGeo.dispose();
      roofMat.dispose();
      doorGeo.dispose();
      doorMat.dispose();
      winGeo.dispose();
      winMat.dispose();
      porchGeo.dispose();
      porchMat.dispose();
      chimneyGeo.dispose();
      towerGeo.dispose();
      towerMat.dispose();
      hubGeo.dispose();
      hubMat.dispose();
      pinGeo.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      wellWall.geometry.dispose();
      wellWall.material.dispose();
      waterDisc.geometry.dispose();
      waterDisc.material.dispose();
      postGeo.dispose();
      postMat.dispose();
      crossBarGeo.dispose();
      slabGeo.dispose();
      slabMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      starGeo.dispose();
      starMat.dispose();

      // Dispose sowed meshes
      Object.values(activePlantMeshes).forEach((mesh) => {
        scene.remove(mesh);
      });
    };
  }, [weather]);

  return (
    <div id="farm_container" ref={containerRef} className="relative w-full h-[550px] md:h-[650px] rounded-lg overflow-hidden shadow-md border border-[#1B3022]/10 bg-sky-100">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" id="farm_3d_canvas" />

      {/* Weather Controls & Dashboard HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none" id="farm_weather_hud">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1B3022]/10 shadow-sm pointer-events-auto flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-[#C16643]" />
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1B3022]">Weather Atmosphere</span>
        </div>
        <div className="flex gap-1.5 pointer-events-auto">
          {[
            { id: "sunny", icon: Sun, label: "Sunny Day", color: "hover:bg-amber-50 text-amber-700 border-stone-200" },
            { id: "sunset", icon: Sunset, label: "Sunset Glow", color: "hover:bg-orange-50 text-orange-700 border-stone-200" },
            { id: "night", icon: Moon, label: "Starry Night", color: "hover:bg-slate-100 text-slate-800 border-stone-200" },
            { id: "rainy", icon: CloudRain, label: "Monsoon Rain", color: "hover:bg-blue-50 text-blue-700 border-stone-200" },
          ].map((w) => {
            const Icon = w.icon;
            const isSelected = weather === w.id;
            return (
              <button
                key={w.id}
                id={`btn_weather_${w.id}`}
                onClick={() => setWeather(w.id as WeatherType)}
                className={`p-2 rounded-lg border text-xs font-sans font-medium flex items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? "bg-[#1B3022] text-[#F9F6F0] border-[#1B3022] shadow-sm scale-105"
                    : `bg-white/95 backdrop-blur-sm border-[#1B3022]/10 ${w.color}`
                }`}
                title={w.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{w.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating interactive guides */}
      <div className="absolute bottom-4 left-4 z-10 max-w-sm" id="farm_guides_hud">
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-lg border border-[#1B3022]/10 shadow-lg flex flex-col gap-2.5">
          <div className="flex flex-col">
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#C16643] font-bold">Interactive Sandbox</span>
            <h4 className="font-serif text-base text-[#1B3022] font-semibold leading-tight flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C16643] animate-pulse" /> Agro-Permaculture Grid
            </h4>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed font-normal">
            Click on any empty soil slab to plant a crop. Help them grow by keeping them watered! Click the sprout icons in the grid table below to tend your crops.
          </p>

          {/* Plant sowing controls */}
          <div className="flex items-center gap-1.5 pt-2.5 border-t border-[#1B3022]/5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-500">Seed Choice:</span>
            <div className="flex gap-1.5">
              {[
                { id: "rice", label: "Rice", color: "border-[#1B3022]/10 text-[#1B3022] bg-stone-50" },
                { id: "millet", label: "Millet", color: "border-[#1B3022]/10 text-[#1B3022] bg-stone-50" },
                { id: "sesame", label: "Sesame", color: "border-[#1B3022]/10 text-[#1B3022] bg-stone-50" },
              ].map((seed) => (
                <button
                  key={seed.id}
                  id={`btn_seed_${seed.id}`}
                  onClick={() => setSelectedSeed(seed.id as "rice" | "millet" | "sesame")}
                  className={`px-2.5 py-1 rounded text-[10px] font-sans font-semibold border transition-all ${
                    selectedSeed === seed.id
                      ? "bg-[#C16643] text-white border-[#C16643] scale-105"
                      : `bg-white text-stone-600 border-[#1B3022]/10 hover:bg-stone-50`
                  }`}
                >
                  {seed.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hotspots Panel (Top Right overlay) */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end max-w-xs z-10" id="farm_hotspots_hud">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1B3022]/10 shadow-sm flex items-center gap-1.5">
          <TreePine className="w-3.5 h-3.5 text-[#1B3022]" />
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1B3022]">Landmarks</span>
        </div>
        <div className="flex flex-col gap-1 w-44">
          {FARM_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              id={`btn_hotspot_${spot.id}`}
              onClick={() => setSelectedHotspot(spot)}
              className={`w-full px-3 py-2 rounded-lg text-left text-xs font-sans font-medium border transition-all flex items-center justify-between gap-1 ${
                selectedHotspot?.id === spot.id
                  ? "bg-[#1B3022] text-white border-[#1B3022] shadow-sm translate-x-[-4px]"
                  : "bg-white/95 backdrop-blur-sm border-[#1B3022]/10 text-[#1B3022] hover:bg-[#1B3022]/5"
              }`}
            >
              <span className="truncate">{spot.name}</span>
              <Eye className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </button>
          ))}
          {selectedHotspot && (
            <button
              id="btn_reset_cam"
              onClick={() => {
                setSelectedHotspot(null);
                if (cameraRef.current && controlsRef.current) {
                  cameraRef.current.position.set(8, 7, 10);
                  controlsRef.current.target.set(0, 0, 0);
                  controlsRef.current.update();
                }
              }}
              className="mt-1 w-full px-3 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-center text-xs font-sans font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset View
            </button>
          )}
        </div>
      </div>

      {/* Grid Interactive Table Overlay (Absolute Right-Bottom) */}
      <div className="absolute bottom-4 right-4 z-10" id="farm_crop_grid_table">
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-lg border border-[#1B3022]/10 shadow-lg w-[260px] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-bold text-[#1B3022] uppercase tracking-wider flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-[#C16643]" /> Crop Grid
            </span>
            <span className="text-[9px] font-sans font-bold text-stone-500 bg-[#1B3022]/5 px-2 py-0.5 rounded">
              {plants.length}/9 Sowed
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 my-1">
            {Array.from({ length: 9 }).map((_, i) => {
              const plant = plants.find((p) => p.gridIndex === i);
              return (
                <button
                  key={i}
                  id={`soil_grid_cell_${i}`}
                  onClick={() => handleSowSeed(i)}
                  className={`h-11 rounded border flex flex-col items-center justify-center transition-all ${
                    plant
                      ? "bg-[#1B3022]/5 border-[#1B3022]/20 text-[#1B3022]"
                      : "bg-[#F9F6F0]/60 border-[#1B3022]/5 hover:border-[#C16643]/30 hover:bg-[#C16643]/5 text-stone-400"
                  }`}
                >
                  {plant ? (
                    <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                      <span className="text-[9px] font-sans font-bold capitalize leading-none text-[#1B3022]">{plant.type}</span>
                      <div className="w-4/5 bg-stone-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-[#C16643] h-full" style={{ width: `${plant.growth}%` }} />
                      </div>
                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[7px] text-stone-500 font-mono leading-none">{Math.round(plant.growth)}%</span>
                        <button
                          id={`btn_water_p_${i}`}
                          onClick={(e) => handleWaterPlant(i, e)}
                          className="p-0.5 bg-[#C16643] text-white rounded hover:bg-[#b05836] transition-colors"
                          title="Water plant"
                        >
                          <Droplets className="w-2 h-2" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[8px] font-mono font-bold">#{i + 1}</span>
                      <span className="text-[7px] uppercase tracking-widest font-sans font-bold opacity-75">Sow</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hotspot Info Popup Overlay */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            id="hotspot_info_popup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-11/12 max-w-lg"
          >
            <div className="bg-[#1B3022]/95 backdrop-blur-md text-[#F9F6F0] p-5 rounded-lg border border-white/10 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C16643] animate-bounce" />
                  <h3 className="font-serif text-base font-semibold tracking-tight text-white">{selectedHotspot.name}</h3>
                </div>
                <button
                  id="btn_close_hotspot_popup"
                  onClick={() => setSelectedHotspot(null)}
                  className="text-lg hover:text-[#C16643] transition-colors leading-none"
                >
                  &times;
                </button>
              </div>
              <p className="text-xs text-[#F9F6F0]/80 leading-relaxed font-normal">
                {selectedHotspot.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
