"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Logo3D — A stunning animated 3D logo for ChamaVault
 * Features: rotating vault door, orbiting member nodes, particle trails,
 * glowing core, and mouse-reactive parallax.
 *
 * @param {Object} props
 * @param {number} [props.size=300] - Container size in px
 * @param {boolean} [props.showText=false] - Show "ChamaVault" text below
 * @param {boolean} [props.interactive=true] - Enable mouse interaction
 */
export default function Logo3D({ size = 300, showText = false, interactive = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const w = size;
    const h = size;

    /* ---- Scene Setup ---- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    /* ---- Color Palette ---- */
    const emerald = 0x34d399;
    const gold = 0xfbbf24;
    const purple = 0xa78bfa;
    const cyan = 0x22d3ee;
    const pink = 0xfb7185;
    const memberColors = [emerald, gold, purple, cyan, pink, 0xf59e0b, 0x818cf8, 0x4ade80];

    /* ======================================== */
    /*  1. VAULT DOOR (Central Element)         */
    /* ======================================== */
    const vaultGroup = new THREE.Group();

    // Vault door base - thick cylinder
    const doorGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 64);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      metalness: 0.9,
      roughness: 0.15,
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.rotation.x = Math.PI / 2;
    vaultGroup.add(door);

    // Vault rim - glowing torus
    const rimGeo = new THREE.TorusGeometry(2.3, 0.1, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: emerald,
      emissive: emerald,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    vaultGroup.add(rim);

    // Inner rim accent
    const innerRimGeo = new THREE.TorusGeometry(1.6, 0.06, 16, 64);
    const innerRimMat = new THREE.MeshStandardMaterial({
      color: gold,
      emissive: gold,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.1,
    });
    const innerRim = new THREE.Mesh(innerRimGeo, innerRimMat);
    vaultGroup.add(innerRim);

    // Vault handle - cross shape
    const handleGroup = new THREE.Group();
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x8b9caf,
      metalness: 0.95,
      roughness: 0.1,
    });

    // Center hub
    const hubGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32);
    const hub = new THREE.Mesh(hubGeo, handleMat);
    hub.rotation.x = Math.PI / 2;
    handleGroup.add(hub);

    // Handle spokes (4)
    for (let i = 0; i < 4; i++) {
      const spokeGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8);
      const spoke = new THREE.Mesh(spokeGeo, handleMat);
      spoke.rotation.z = (i / 4) * Math.PI * 2;
      spoke.position.set(
        Math.cos((i / 4) * Math.PI * 2) * 0.7,
        Math.sin((i / 4) * Math.PI * 2) * 0.7,
        0.3
      );
      handleGroup.add(spoke);

      // Spoke tip (small sphere)
      const tipGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const tipMat = new THREE.MeshStandardMaterial({
        color: emerald,
        emissive: emerald,
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.3,
      });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(
        Math.cos((i / 4) * Math.PI * 2) * 1.3,
        Math.sin((i / 4) * Math.PI * 2) * 1.3,
        0.3
      );
      handleGroup.add(tip);
    }

    vaultGroup.add(handleGroup);

    // Glowing core in center
    const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: emerald,
      emissive: emerald,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.z = 0.3;
    vaultGroup.add(core);

    // Core glow halo
    const haloGeo = new THREE.RingGeometry(0.6, 1.0, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: emerald,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.z = 0.35;
    vaultGroup.add(halo);

    // Protective Shield Sphere
    const shieldGeo = new THREE.SphereGeometry(2.8, 32, 32);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: emerald,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      metalness: 1.0,
      roughness: 0,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    vaultGroup.add(shield);

    // Shield Hexagon Wireframe
    const hexGeo = new THREE.IcosahedronGeometry(2.82, 2);
    const hexMat = new THREE.MeshBasicMaterial({
      color: emerald,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });
    const hexShield = new THREE.Mesh(hexGeo, hexMat);
    vaultGroup.add(hexShield);

    mainGroup.add(vaultGroup);

    /* ======================================== */
    /*  2. ORBITING MEMBER NODES                */
    /* ======================================== */
    const orbitGroup = new THREE.Group();
    const nodeCount = 8;
    const orbitRadius = 3.8;
    const nodes = [];
    const nodeTrails = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const nodeGroup = new THREE.Group();

      // Node sphere
      const nodeGeo = new THREE.SphereGeometry(0.2, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: memberColors[i],
        emissive: memberColors[i],
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.3,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeGroup.add(nodeMesh);

      // Node glow
      const nodeGlowGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const nodeGlowMat = new THREE.MeshBasicMaterial({
        color: memberColors[i],
        transparent: true,
        opacity: 0.15,
      });
      const nodeGlow = new THREE.Mesh(nodeGlowGeo, nodeGlowMat);
      nodeGroup.add(nodeGlow);

      nodeGroup.position.set(
        Math.cos(angle) * orbitRadius,
        Math.sin(angle) * orbitRadius,
        0
      );
      orbitGroup.add(nodeGroup);
      nodes.push({ group: nodeGroup, mesh: nodeMesh, glow: nodeGlow, angle, mat: nodeMat });

      // Trail - thin line from node to center
      const trailPoints = [];
      for (let t = 0; t <= 1; t += 0.05) {
        trailPoints.push(new THREE.Vector3(
          Math.cos(angle) * orbitRadius * (1 - t),
          Math.sin(angle) * orbitRadius * (1 - t),
          0
        ));
      }
      const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPoints);
      const trailMat = new THREE.LineBasicMaterial({
        color: memberColors[i],
        transparent: true,
        opacity: 0.08,
      });
      const trail = new THREE.Line(trailGeo, trailMat);
      orbitGroup.add(trail);
      nodeTrails.push(trail);
    }

    // Orbit ring (thin torus)
    const orbitRingGeo = new THREE.TorusGeometry(orbitRadius, 0.02, 8, 128);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: emerald,
      transparent: true,
      opacity: 0.15,
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitGroup.add(orbitRing);

    // Second orbit ring slightly offset
    const orbitRing2Geo = new THREE.TorusGeometry(orbitRadius + 0.3, 0.015, 8, 128);
    const orbitRing2Mat = new THREE.MeshBasicMaterial({
      color: gold,
      transparent: true,
      opacity: 0.08,
    });
    const orbitRing2 = new THREE.Mesh(orbitRing2Geo, orbitRing2Mat);
    orbitRing2.rotation.x = 0.2;
    orbitGroup.add(orbitRing2);

    mainGroup.add(orbitGroup);

    /* ======================================== */
    /*  3. PARTICLE DUST FIELD                  */
    /* ======================================== */
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustCol = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 4 + Math.random() * 6;
      dustPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      dustPos[i * 3 + 2] = r * Math.cos(phi);
      const c = new THREE.Color(memberColors[Math.floor(Math.random() * memberColors.length)]);
      dustCol[i * 3] = c.r;
      dustCol[i * 3 + 1] = c.g;
      dustCol[i * 3 + 2] = c.b;
      dustSizes[i] = 0.03 + Math.random() * 0.06;
    }

    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    mainGroup.add(dust);

    /* ======================================== */
    /*  4. ENERGY ARCS (between nodes)          */
    /* ======================================== */
    const arcGroup = new THREE.Group();
    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      const from = nodes[i].group.position;
      const to = nodes[next].group.position;
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      mid.z = 0.8; // arc outward

      const curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
      const arcGeo = new THREE.TubeGeometry(curve, 20, 0.015, 8, false);
      const arcMat = new THREE.MeshBasicMaterial({
        color: memberColors[i],
        transparent: true,
        opacity: 0.12,
      });
      arcGroup.add(new THREE.Mesh(arcGeo, arcMat));
    }
    mainGroup.add(arcGroup);

    /* ======================================== */
    /*  5. LIGHTS                               */
    /* ======================================== */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const keyLight = new THREE.PointLight(emerald, 3, 30);
    keyLight.position.set(5, 5, 10);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(gold, 1.5, 30);
    fillLight.position.set(-5, -3, 8);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(purple, 1, 20);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    /* ======================================== */
    /*  6. MOUSE INTERACTION                    */
    /* ======================================== */
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener("mousemove", onMouseMove);

    /* ======================================== */
    /*  7. ANIMATION LOOP                       */
    /* ======================================== */
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Vault handle rotates slowly
      handleGroup.rotation.z = t * 0.3;

      // Core pulsing
      const pulse = 1 + Math.sin(t * 2) * 0.15;
      core.scale.setScalar(pulse);
      coreMat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;

      // Halo breathing
      haloMat.opacity = 0.05 + Math.sin(t * 2) * 0.05;
      halo.scale.setScalar(1 + Math.sin(t * 1.5) * 0.2);

      // Rim glow animation
      rimMat.emissiveIntensity = 0.3 + Math.sin(t * 1.8) * 0.2;

      // Shield animation
      shield.rotation.y = t * 0.2;
      shield.rotation.z = t * 0.1;
      hexShield.rotation.y = -t * 0.15;
      hexShield.rotation.x = t * 0.05;
      hexMat.opacity = 0.05 + Math.sin(t * 1.5) * 0.05;

      // Orbiting nodes
      orbitGroup.rotation.z = t * 0.12;

      // Each node bobs up/down individually
      nodes.forEach((n, i) => {
        const offset = (i / nodeCount) * Math.PI * 2;
        n.group.position.z = Math.sin(t * 1.5 + offset) * 0.3;
        n.mesh.scale.setScalar(1 + Math.sin(t * 2 + offset) * 0.2);
        n.glow.scale.setScalar(1 + Math.sin(t * 2 + offset) * 0.3);
        n.mat.emissiveIntensity = 0.4 + Math.sin(t * 2.5 + offset) * 0.3;
      });

      // Node trails pulse
      nodeTrails.forEach((trail, i) => {
        trail.material.opacity = 0.04 + Math.sin(t * 2 + i) * 0.04;
      });

      // Dust rotation
      dust.rotation.y = t * 0.03;
      dust.rotation.x = t * 0.015;

      // Arc pulsing
      arcGroup.children.forEach((arc, i) => {
        arc.material.opacity = 0.06 + Math.sin(t * 3 + i * 0.8) * 0.06;
      });

      // Mouse parallax
      mainGroup.rotation.y += (mouseX * 0.3 - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (-mouseY * 0.2 - mainGroup.rotation.x) * 0.05;

      // Subtle idle float
      mainGroup.position.y = Math.sin(t * 0.5) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    /* ---- Cleanup ---- */
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, interactive]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div
        ref={mountRef}
        style={{
          width: size,
          height: size,
          cursor: interactive ? "grab" : "default",
        }}
      />
      {showText && (
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: Math.max(size * 0.12, 20),
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #fbbf24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          ChamaVault
        </div>
      )}
    </div>
  );
}
