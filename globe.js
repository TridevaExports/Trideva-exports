/**
 * TRIDEVA EXPORTS — Holographic Maritime 3D Engine
 * Built with Three.js (Procedural Landmasses, Pulsing Trade Beacons, Volumetric Atmosphere)
 */
(function () {
  'use strict';

  function initLuxuryGlobe() {
    const container = document.getElementById('globe3d-container') || document.getElementById('globe');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js library pending or unavailable.');
      return;
    }

    // Clean container if re-initialized
    container.innerHTML = '';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const getWidth = () => container.clientWidth || 480;
    const getHeight = () => container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 1000);
    camera.position.set(0, 0, 3.25);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(getWidth(), getHeight());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0));
    
    // Prevent mobile touch gesture conflicts
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.outline = 'none';
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const GLOBE_RADIUS = 1.0;

    // 2. Obsidian Emerald Core
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 48, 48);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x020a06,
      emissive: 0x03180e,
      specular: 0x24553a,
      shininess: 28,
      transparent: true,
      opacity: 0.96
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    worldGroup.add(coreMesh);

    // 3. Volumetric Atmospheric Halo
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.85, 0.70, 0.28, 1.0) * intensity * 0.75 + vec4(0.12, 0.83, 0.53, 1.0) * intensity * 0.45;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    worldGroup.add(haloMesh);

    // 4. Coordinates Converter
    function latLonToVec3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // 5. Continental Clusters (Procedural Landmass Nodes)
    const landClusters = [
      { lat: 21, lon: 78, spreadLat: 16, spreadLon: 16, count: 420 }, // India & South Asia
      { lat: 25, lon: 45, spreadLat: 14, spreadLon: 18, count: 240 }, // Middle East
      { lat: 50, lon: 15, spreadLat: 16, spreadLon: 25, count: 320 }, // Europe
      { lat: 5, lon: 22, spreadLat: 28, spreadLon: 22, count: 380 },  // Africa
      { lat: 35, lon: 105, spreadLat: 20, spreadLon: 30, count: 450 },// East Asia
      { lat: 40, lon: -98, spreadLat: 22, spreadLon: 35, count: 380 },// North America
      { lat: -15, lon: -55, spreadLat: 28, spreadLon: 20, count: 280 },// South America
      { lat: -25, lon: 135, spreadLat: 18, spreadLon: 22, count: 180 } // Australia
    ];

    const landPositions = [];
    landClusters.forEach(cluster => {
      for (let i = 0; i < cluster.count; i++) {
        const u = Math.random();
        const v = Math.random();
        const deltaLat = (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * (cluster.spreadLat * 0.42);
        const deltaLon = (Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v)) * (cluster.spreadLon * 0.42);
        const lat = cluster.lat + deltaLat;
        const lon = cluster.lon + deltaLon;
        const vec = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.006);
        landPositions.push(vec.x, vec.y, vec.z);
      }
    });

    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landPositions, 3));
    const landMat = new THREE.PointsMaterial({
      color: 0xf5df9b,
      size: isMobile ? 0.016 : 0.02,
      transparent: true,
      opacity: 0.85
    });
    const landPoints = new THREE.Points(landGeo, landMat);
    worldGroup.add(landPoints);

    // 6. Ports & Maritime Gateway Nodes
    const PORTS = {
      mundra:    { name: 'Mundra Port (INMUN1)', lat: 22.8, lon: 69.7, hub: true },
      dubai:     { name: 'Jebel Ali (UAE)',       lat: 25.0, lon: 55.1 },
      jeddah:    { name: 'Jeddah (KSA)',          lat: 21.5, lon: 39.2 },
      rotterdam: { name: 'Rotterdam (EU)',        lat: 51.9, lon: 4.5 },
      singapore: { name: 'Singapore Hub',         lat: 1.3,  lon: 103.8 },
      newyork:   { name: 'New York (USA)',        lat: 40.7, lon: -74.0 }
    };

    const mundraVec = latLonToVec3(PORTS.mundra.lat, PORTS.mundra.lon, GLOBE_RADIUS * 1.015);

    // Mundra Origin Pulse Beacon
    const mundraBeaconGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const mundraBeaconMat = new THREE.MeshBasicMaterial({ color: 0x1ed487 });
    const mundraBeacon = new THREE.Mesh(mundraBeaconGeo, mundraBeaconMat);
    mundraBeacon.position.copy(mundraVec);
    worldGroup.add(mundraBeacon);

    // 7. Glowing Trajectory Arcs with Photon Comets
    const destinations = ['dubai', 'jeddah', 'rotterdam', 'singapore', 'newyork'];
    const routes = [];

    destinations.forEach((key, index) => {
      const port = PORTS[key];
      const destVec = latLonToVec3(port.lat, port.lon, GLOBE_RADIUS * 1.015);

      const destMarkerGeo = new THREE.SphereGeometry(0.024, 12, 12);
      const destMarkerMat = new THREE.MeshBasicMaterial({ color: 0xf5df9b });
      const destMarker = new THREE.Mesh(destMarkerGeo, destMarkerMat);
      destMarker.position.copy(destVec);
      worldGroup.add(destMarker);

      const midPoint = mundraVec.clone().add(destVec).multiplyScalar(0.5);
      const dist = mundraVec.distanceTo(destVec);
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(dist * 0.38, 0.55));

      const curve = new THREE.QuadraticBezierCurve3(mundraVec, midPoint, destVec);
      const points = curve.getPoints(isMobile ? 28 : 48);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.55
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      worldGroup.add(arcLine);

      const photonGeo = new THREE.SphereGeometry(0.022, 10, 10);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const photon = new THREE.Mesh(photonGeo, photonMat);
      worldGroup.add(photon);

      routes.push({
        curve,
        photon,
        offset: index * 0.2,
        speed: 0.0035 + Math.random() * 0.0015
      });
    });

    // 8. Dual Horological Rings
    const ringGeo1 = new THREE.RingGeometry(GLOBE_RADIUS * 1.32, GLOBE_RADIUS * 1.328, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.38;
    worldGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(GLOBE_RADIUS * 1.42, GLOBE_RADIUS * 1.424, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x1ed487,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.y = Math.PI * 0.2;
    worldGroup.add(ring2);

    // 9. Golden Ambient Dust
    const starCount = isMobile ? 80 : 160;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < starCount; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xf5df9b,
      size: 0.018,
      transparent: true,
      opacity: 0.4
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 10. Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sunLight = new THREE.DirectionalLight(0xfff5d8, 1.8);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const emeraldRim = new THREE.DirectionalLight(0x1ed487, 1.2);
    emeraldRim.position.set(-5, -2, -3);
    scene.add(emeraldRim);

    // Initial orientation: Center view on India / Arabian Sea
    worldGroup.rotation.y = -1.25;
    worldGroup.rotation.x = 0.32;

    // 11. Pointer & Touch Physics
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let targetRotY = worldGroup.rotation.y;
    let targetRotX = worldGroup.rotation.x;

    const domElement = renderer.domElement;

    domElement.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      domElement.setPointerCapture(e.pointerId);
    });

    domElement.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      targetRotY += deltaX * 0.005;
      targetRotX += deltaY * 0.005;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    });

    const stopDrag = () => { isDragging = false; };
    domElement.addEventListener('pointerup', stopDrag);
    domElement.addEventListener('pointercancel', stopDrag);

    // Parallax Cursor Following
    window.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);
    }, { passive: true });

    // 12. Smart Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      const w = getWidth();
      const h = getHeight();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 13. Visibility Observer (Pause render loop off-screen)
    let isGlobeVisible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isGlobeVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    visibilityObserver.observe(container);

    // 14. 60FPS Render Loop
    const clock = new THREE.Clock();

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      if (!isGlobeVisible) return;

      const elapsed = clock.getElapsedTime();

      if (!isDragging && !prefersReducedMotion) {
        targetRotY += 0.0022; // Smooth eastward planetary spin
      }

      // Inertial damping
      worldGroup.rotation.y += (targetRotY - worldGroup.rotation.y) * 0.075;
      worldGroup.rotation.x += (targetRotX - worldGroup.rotation.x) * 0.075;
      worldGroup.rotation.x = Math.max(-0.85, Math.min(0.85, worldGroup.rotation.x));

      // Animate rings
      ring1.rotation.z = elapsed * 0.04;
      ring2.rotation.z = -elapsed * 0.025;

      // Pulse beacon
      const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.25;
      mundraBeacon.scale.set(pulse, pulse, pulse);

      // Animate comets along routes
      routes.forEach(r => {
        const t = (elapsed * 0.45 + r.offset) % 1.0;
        r.photon.position.copy(r.curve.getPointAt(t));
      });

      stars.rotation.y = elapsed * 0.01;
      renderer.render(scene, camera);
    }

    renderLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryGlobe);
  } else {
    initLuxuryGlobe();
  }
})();
