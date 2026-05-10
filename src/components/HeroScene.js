"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ---- Rotating ring of spheres (the "chama circle") ---- */
    const ringGroup = new THREE.Group();
    const memberCount = 8;
    const ringRadius = 10;
    const spheres = [];
    const colors = [0x34d399, 0xfbbf24, 0xa78bfa, 0xfb7185, 0x22d3ee, 0xf59e0b, 0x818cf8, 0x4ade80];

    for (let i = 0; i < memberCount; i++) {
      const angle = (i / memberCount) * Math.PI * 2;
      const geo = new THREE.SphereGeometry(0.8, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.3,
        metalness: 0.4,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0);
      ringGroup.add(mesh);
      spheres.push(mesh);

      /* Glow ring around each sphere */
      const glowGeo = new THREE.RingGeometry(1.0, 1.3, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(mesh.position);
      ringGroup.add(glow);
    }

    /* Central glowing orb */
    const coreGeo = new THREE.SphereGeometry(2.2, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x34d399,
      emissiveIntensity: 0.6,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    ringGroup.add(core);

    /* Outer wireframe ring */
    const torusGeo = new THREE.TorusGeometry(ringRadius, 0.05, 8, 128);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.2 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    ringGroup.add(torus);

    scene.add(ringGroup);
    ringGroup.rotation.x = 0.5;
    ringGroup.position.x = 5;

    /* ---- Particle field ---- */
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      const c = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ---- Flow lines between spheres ---- */
    for (let i = 0; i < memberCount; i++) {
      const next = (i + 1) % memberCount;
      const curve = new THREE.QuadraticBezierCurve3(
        spheres[i].position.clone(),
        new THREE.Vector3(0, 0, 0),
        spheres[next].position.clone()
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.03, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.08,
      });
      ringGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    }

    /* ---- Lights ---- */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x34d399, 2, 100);
    pointLight.position.set(10, 10, 20);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xfbbf24, 1, 100);
    pointLight2.position.set(-10, -10, 20);
    scene.add(pointLight2);

    /* ---- Mouse interaction ---- */
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ---- Animation loop ---- */
    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      ringGroup.rotation.z = t * 0.15;
      ringGroup.rotation.x = 0.5 + mouseY * 0.1;
      ringGroup.rotation.y = mouseX * 0.1;

      spheres.forEach((s, i) => {
        s.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.15);
      });

      core.scale.setScalar(1 + Math.sin(t * 1.5) * 0.1);
      core.material.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.2;

      particles.rotation.y = t * 0.02;
      particles.rotation.x = t * 0.01;

      renderer.render(scene, camera);
    };
    animate();

    /* ---- Resize ---- */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}
