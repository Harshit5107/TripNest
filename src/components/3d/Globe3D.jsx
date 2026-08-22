import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const SAMPLE_LOCATIONS = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522, color: '#38bdf8', country: 'France' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, color: '#34d399', country: 'Japan' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, color: '#fbbf24', country: 'Italy' },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734, color: '#f472b6', country: 'Spain' },
  { name: 'New York', lat: 40.7128, lng: -74.0060, color: '#a78bfa', country: 'USA' },
  { name: 'Bali', lat: -8.4095, lng: 115.1889, color: '#38bdf8', country: 'Indonesia' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, color: '#34d399', country: 'Australia' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, color: '#fbbf24', country: 'UAE' },
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426, color: '#38bdf8', country: 'Iceland' },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, color: '#f472b6', country: 'Brazil' },
];

export default function Globe3D({ onSelectCity }) {
  const mountRef = useRef(null);
  const [selectedCityName, setSelectedCityName] = useState('Paris');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 550;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 230;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Realistic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(200, 150, 200);
    scene.add(sunLight);

    const blueBackLight = new THREE.DirectionalLight(0x0ea5e9, 1.8);
    blueBackLight.position.set(-200, -100, -150);
    scene.add(blueBackLight);

    // Globe Main Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeRadius = 80;

    // Create High-Resolution Procedural Equirectangular World Texture Canvas (2048 x 1024)
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Draw Deep Ocean Water Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a192f');
    oceanGrad.addColorStop(0.3, '#0e2443');
    oceanGrad.addColorStop(0.5, '#07152b');
    oceanGrad.addColorStop(0.7, '#0e2443');
    oceanGrad.addColorStop(1, '#0a192f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Realistic Geographic Lat/Long Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = (90 - lat) * (canvas.height / 180);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = (lng + 180) * (canvas.width / 360);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    // Equator Line (Brighter)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // 3. Helper to draw landmass polygons (lat/lng points)
    const drawLandPolygon = (points, fillColor = '#10b981', strokeColor = '#34d399') => {
      ctx.beginPath();
      points.forEach(([lat, lng], idx) => {
        const x = (lng + 180) * (canvas.width / 360);
        const y = (90 - lat) * (canvas.height / 180);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    // Realistic Continent Landmass Outlines (Equirectangular polygons)
    const landColor = '#134e4a'; // Emerald teal land
    const coastColor = '#34d399'; // Bright emerald coast

    // North America
    drawLandPolygon([
      [70, -165], [72, -125], [60, -95], [55, -60], [45, -65], [30, -80],
      [25, -80], [15, -90], [15, -105], [30, -115], [45, -125], [60, -140], [65, -168]
    ], landColor, coastColor);

    // South America
    drawLandPolygon([
      [12, -75], [5, -50], [-10, -35], [-22, -40], [-35, -55], [-55, -68],
      [-45, -75], [-18, -70], [0, -80]
    ], landColor, coastColor);

    // Europe
    drawLandPolygon([
      [71, 25], [65, 40], [55, 38], [45, 35], [40, 28], [36, -5],
      [43, -9], [48, -4], [55, 8], [60, 5], [68, 15]
    ], landColor, coastColor);

    // Africa
    drawLandPolygon([
      [37, 10], [32, 32], [12, 43], [10, 50], [-12, 40], [-35, 20],
      [-34, 18], [-5, 12], [5, -10], [15, -17], [32, -10]
    ], landColor, coastColor);

    // Asia
    drawLandPolygon([
      [75, 40], [70, 80], [65, 170], [60, 160], [40, 140], [35, 120],
      [20, 110], [10, 105], [10, 78], [25, 60], [30, 48], [40, 40], [55, 40]
    ], landColor, coastColor);

    // India Subcontinent
    drawLandPolygon([
      [32, 70], [24, 88], [8, 77], [15, 73], [22, 69]
    ], landColor, coastColor);

    // Australia
    drawLandPolygon([
      [-12, 130], [-15, 145], [-28, 153], [-38, 145], [-32, 115], [-20, 113]
    ], landColor, coastColor);

    // Japan Islands
    drawLandPolygon([[45, 142], [40, 140], [34, 135], [31, 130], [36, 137]], landColor, coastColor);

    // Indonesia / Bali Islands
    drawLandPolygon([[5, 95], [3, 105], [-6, 107], [-8, 115], [-8, 125], [-2, 100]], landColor, coastColor);

    // Antarctica
    drawLandPolygon([
      [-65, -180], [-70, -100], [-75, 0], [-70, 100], [-65, 180], [-89, 180], [-89, -180]
    ], '#1e293b', '#475569');

    // 4. Fill Detailed Topographic Map Dots for Lush Vegetation & Cities
    ctx.fillStyle = 'rgba(52, 211, 153, 0.45)';
    for (let y = 10; y < canvas.height; y += 8) {
      for (let x = 10; x < canvas.width; x += 8) {
        const nx = (x / canvas.width) * 360 - 180;
        const ny = 90 - (y / canvas.height) * 180;

        const isEurope = nx > -10 && nx < 40 && ny > 35 && ny < 70;
        const isAsia = nx > 40 && nx < 145 && ny > 5 && ny < 75;
        const isAmericas = (nx > -130 && nx < -35 && ny > 10 && ny < 70) || (nx > -85 && nx < -35 && ny > -55 && ny < 12);
        const isAfrica = nx > -20 && nx < 50 && ny > -35 && ny < 35;
        const isAus = nx > 110 && nx < 155 && ny > -45 && ny < -10;

        if (isEurope || isAsia || isAmericas || isAfrica || isAus) {
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Create Mesh Texture for Earth
    const globeTexture = new THREE.CanvasTexture(canvas);
    globeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      map: globeTexture,
      bumpScale: 1.2,
      shininess: 35,
      specular: new THREE.Color(0x0284c7),
    });

    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 5. Atmospheric Cloud Layer
    const cloudsCanvas = document.createElement('canvas');
    cloudsCanvas.width = 1024;
    cloudsCanvas.height = 512;
    const cCtx = cloudsCanvas.getContext('2d');
    cCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 400; i++) {
      const cx = Math.random() * cloudsCanvas.width;
      const cy = Math.random() * cloudsCanvas.height;
      const cr = Math.random() * 30 + 10;
      cCtx.beginPath();
      cCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      cCtx.fill();
    }
    const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(globeRadius + 1.2, 64, 64), cloudsMat);
    globeGroup.add(cloudsMesh);

    // 6. Glowing Outer Atmosphere Ring
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Helper: Convert Lat/Lng to 3D Coordinates
    const latLngToVector3 = (lat, lng, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 7. Add Glowing City Markers & Pulsing Rings
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    SAMPLE_LOCATIONS.forEach((loc) => {
      const pos = latLngToVector3(loc.lat, loc.lng, globeRadius + 2);

      // Glowing Marker Sphere
      const markerGeo = new THREE.SphereGeometry(2.5, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: loc.color });
      const markerMesh = new THREE.Mesh(markerGeo, markerMat);
      markerMesh.position.copy(pos);
      pinGroup.add(markerMesh);

      // Outer Glowing Ring
      const ringGeo = new THREE.RingGeometry(3.0, 5.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: loc.color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      pinGroup.add(ringMesh);
    });

    // 8. Flight Trajectories Arcs
    const createArc = (startLoc, endLoc, colorHex = 0x38bdf8) => {
      const v1 = latLngToVector3(startLoc.lat, startLoc.lng, globeRadius);
      const v2 = latLngToVector3(endLoc.lat, endLoc.lng, globeRadius);
      const distance = v1.distanceTo(v2);

      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      mid.normalize();
      mid.multiplyScalar(globeRadius + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(60);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 2, transparent: true, opacity: 0.8 });
      return new THREE.Line(curveGeo, curveMat);
    };

    // Add connected flight paths between cities
    globeGroup.add(createArc(SAMPLE_LOCATIONS[0], SAMPLE_LOCATIONS[1], 0x38bdf8)); // Paris -> Tokyo
    globeGroup.add(createArc(SAMPLE_LOCATIONS[0], SAMPLE_LOCATIONS[2], 0xfbbf24)); // Paris -> Rome
    globeGroup.add(createArc(SAMPLE_LOCATIONS[2], SAMPLE_LOCATIONS[3], 0xf472b6)); // Rome -> Barcelona
    globeGroup.add(createArc(SAMPLE_LOCATIONS[1], SAMPLE_LOCATIONS[5], 0x34d399)); // Tokyo -> Bali
    globeGroup.add(createArc(SAMPLE_LOCATIONS[4], SAMPLE_LOCATIONS[0], 0xa78bfa)); // NY -> Paris
    globeGroup.add(createArc(SAMPLE_LOCATIONS[7], SAMPLE_LOCATIONS[6], 0xfbbf24)); // Dubai -> Sydney

    // Drag & Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        globeGroup.rotation.y += 0.003; // Smooth rotation
      }
      cloudsMesh.rotation.y += 0.004; // Clouds move slightly faster

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] md:h-[580px] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-4 py-2 rounded-full text-xs text-sky-400 font-bold shadow-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Photorealistic 3D Earth Globe & Flight Arcs</span>
      </div>

      {/* City Chips */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center flex-wrap gap-2 pointer-events-auto">
        {SAMPLE_LOCATIONS.slice(0, 6).map((city) => (
          <button
            key={city.name}
            onClick={() => {
              setSelectedCityName(city.name);
              if (onSelectCity) onSelectCity(city.name);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all border ${
              selectedCityName === city.name
                ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/40 scale-105'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📍 {city.name} ({city.country})
          </button>
        ))}
      </div>
    </div>
  );
}
