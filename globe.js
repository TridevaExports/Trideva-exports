/**
 * TRIDEVA EXPORTS — Ultra-HD Geographic Maritime 3D Engine
 * Embedded Vector-Grade Landmass Mask, Real Coastlines & Ballistic Arcs
 * Zero external asset dependencies, zero CORS lag, 60 FPS
 */
(function () {
  'use strict';

  function initUltraGlobe() {
    const container = document.getElementById('globe3d-container') || document.getElementById('globe');
    if (!container) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js library pending or unavailable.');
      return;
    }

    container.innerHTML = '';

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const getW = () => container.clientWidth || 480;
    const getH = () => container.clientHeight || 480;

    // 1. Scene, Camera & Precision Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, getW() / getH(), 0.1, 1000);
    camera.position.set(0, 0, 3.25);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(getW(), getH());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0));
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.outline = 'none';
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const GLOBE_RADIUS = 1.0;

    // 2. Obsidian Emerald Core Sphere
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.992, 64, 64);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x020704,
      emissive: 0x021109,
      specular: 0x1f4e35,
      shininess: 35,
      transparent: true,
      opacity: 0.98
    });
    worldGroup.add(new THREE.Mesh(coreGeo, coreMat));

    // 3. Volumetric Atmospheric Halo (Fresnel Shader)
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
          gl_FragColor = vec4(0.96, 0.88, 0.62, 1.0) * (intensity * 0.75) + vec4(0.12, 0.83, 0.53, 1.0) * (intensity * 0.5);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    worldGroup.add(new THREE.Mesh(haloGeo, haloMat));

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

    // 5. High-Precision Vector Landmass Generator
    // Explicit geographic contour tracing for sharp, undeniable world continents
    function generateGeographicGrid() {
      const cvs = document.createElement('canvas');
      cvs.width = 1440;
      cvs.height = 720;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      ctx.fillStyle = '#ffffff';

      const mapLon = (lon) => ((lon + 180) / 360) * cvs.width;
      const mapLat = (lat) => ((90 - lat) / 180) * cvs.height;

      function trace(coords) {
        if (!coords.length) return;
        ctx.beginPath();
        ctx.moveTo(mapLon(coords[0][0]), mapLat(coords[0][1]));
        for (let i = 1; i < coords.length; i++) {
          ctx.lineTo(mapLon(coords[i][0]), mapLat(coords[i][1]));
        }
        ctx.closePath();
        ctx.fill();
      }

      // --- INDIA & SOUTH ASIA (Ultra-Detailed: Kutch, Saurashtra, Deccan Peninsula, Bengal) ---
      trace([
        [68.1, 23.7], [68.8, 22.8], [70.2, 22.9], [69.0, 22.2], [70.5, 20.8], 
        [72.8, 21.0], [72.8, 19.0], [73.5, 15.5], [75.0, 13.0], [76.5, 9.8], 
        [77.5, 8.1], [78.2, 9.2], [79.8, 10.3], [79.8, 11.9], [80.3, 13.1], 
        [82.2, 16.5], [85.0, 19.5], [87.0, 21.5], [89.0, 22.0], [90.5, 23.5], 
        [91.5, 22.0], [92.5, 21.0], [92.5, 24.5], [88.5, 26.5], [85.0, 27.5], 
        [80.0, 30.5], [76.0, 32.5], [74.5, 36.5], [72.5, 34.0], [70.0, 30.0], 
        [68.0, 27.0], [68.1, 23.7]
      ]);
      // Sri Lanka
      trace([[79.8, 9.8], [81.8, 8.5], [81.3, 6.0], [80.0, 6.0], [79.8, 9.8]]);

      // --- ARABIAN PENINSULA & RED SEA / PERSIAN GULF ---
      trace([
        [34.5, 28.0], [36.0, 22.5], [38.5, 19.0], [42.5, 15.0], [44.0, 12.5], 
        [49.0, 13.5], [53.5, 16.5], [58.5, 21.5], [59.5, 23.0], [56.5, 26.0], 
        [54.0, 24.5], [51.5, 25.5], [50.0, 26.5], [48.0, 30.0], [45.0, 31.0], 
        [36.0, 32.0], [34.5, 28.0]
      ]);

      // --- AFRICA ---
      trace([
        [-5.5, 35.8], [-17.0, 21.0], [-17.5, 14.5], [-12.0, 8.0], [-1.0, 5.0], 
        [9.5, 4.0], [9.0, -1.0], [12.0, -6.0], [13.5, -12.5], [18.0, -28.0], 
        [18.5, -34.5], [26.0, -34.0], [32.5, -27.0], [35.5, -20.0], [40.5, -10.0], 
        [49.5, 10.0], [51.2, 11.8], [43.0, 12.0], [40.0, 18.0], [33.0, 28.0], 
        [32.0, 31.5], [25.0, 31.5], [11.0, 37.0], [-5.5, 35.8]
      ]);
      // Madagascar
      trace([[44.0, -12.0], [50.0, -15.0], [47.5, -25.0], [43.5, -25.0], [44.0, -12.0]]);

      // --- EUROPE ---
      trace([
        [-9.0, 36.5], [-9.5, 43.0], [-1.5, 43.5], [-4.5, 48.5], [2.0, 51.0], 
        [8.0, 54.0], [9.5, 57.5], [13.0, 55.5], [19.0, 54.5], [28.0, 60.0], 
        [24.0, 65.0], [14.0, 65.0], [5.0, 62.0], [5.0, 50.0], [3.0, 43.0], 
        [10.0, 44.0], [16.0, 41.0], [18.5, 40.0], [14.0, 37.0], [22.0, 38.0], 
        [26.0, 40.0], [30.0, 46.0], [35.0, 46.5], [40.0, 42.0], [30.0, 41.0], 
        [20.0, 37.0], [15.0, 38.0], [-5.0, 36.0], [-9.0, 36.5]
      ]);
      // British Isles
      trace([[-5.0, 50.0], [-1.0, 50.5], [1.5, 52.5], [-0.5, 58.0], [-5.0, 58.5], [-5.0, 50.0]]);
      trace([[-10.0, 51.5], [-6.0, 52.0], [-6.0, 55.0], [-10.0, 54.0], [-10.0, 51.5]]);
      // Scandinavia
      trace([[5.0, 58.0], [11.0, 58.0], [18.0, 60.0], [28.0, 70.0], [15.0, 70.0], [5.0, 62.0], [5.0, 58.0]]);

      // --- ASIA / SIBERIA / CHINA / EAST ASIA ---
      trace([
        [50.0, 40.0], [60.0, 45.0], [70.0, 55.0], [80.0, 68.0], [120.0, 72.0], 
        [170.0, 65.0], [140.0, 50.0], [132.0, 43.0], [125.0, 39.0], [120.0, 34.0], 
        [122.0, 30.0], [118.0, 24.5], [110.0, 20.0], [108.0, 15.0], [105.0, 10.0], 
        [100.0, 5.0], [104.0, 1.5], [100.0, 10.0], [98.0, 16.0], [92.0, 20.0], 
        [75.0, 35.0], [60.0, 35.0], [50.0, 40.0]
      ]);
      // Japan
      trace([[131.0, 32.0], [136.0, 35.0], [141.0, 41.5], [145.0, 44.0], [141.0, 37.0], [132.0, 33.0], [131.0, 32.0]]);
      // Indonesia & Sunda
      trace([[95.0, 5.5], [105.0, -6.0], [115.0, -8.5], [125.0, -9.0], [115.0, 0.0], [100.0, 1.0], [95.0, 5.5]]);

      // --- NORTH AMERICA ---
      trace([
        [-168.0, 66.0], [-150.0, 60.0], [-130.0, 54.0], [-124.0, 38.0], [-117.0, 32.0], 
        [-105.0, 22.0], [-97.0, 26.0], [-82.0, 25.0], [-80.0, 32.0], [-74.0, 40.0], 
        [-65.0, 45.0], [-55.0, 50.0], [-60.0, 60.0], [-80.0, 68.0], [-120.0, 70.0], 
        [-168.0, 66.0]
      ]);

      // --- SOUTH AMERICA ---
      trace([
        [-76.0, 8.5], [-80.0, -2.0], [-79.0, -12.0], [-71.0, -30.0], [-74.0, -45.0], 
        [-68.0, -54.0], [-53.0, -33.0], [-35.0, -6.0], [-50.0, 0.0], [-60.0, 10.0], 
        [-76.0, 8.5]
      ]);

      // --- AUSTRALIA ---
      trace([
        [114.0, -22.0], [115.0, -34.0], [130.0, -32.0], [138.0, -35.0], [150.0, -37.0], 
        [153.0, -28.0], [144.0, -14.0], [136.0, -12.0], [128.0, -15.0], [114.0, -22.0]
      ]);

      return ctx.getImageData(0, 0, cvs.width, cvs.height).data;
    }

    const landData = generateGeographicGrid();
    const mapW = 1440;
    const mapH = 720;

    function isLandPixel(lat, lon) {
      const x = Math.floor(((lon + 180) / 360) * mapW);
      const y = Math.floor(((90 - lat) / 180) * mapH);
      if (x < 0 || x >= mapW || y < 0 || y >= mapH) return false;
      return landData[(y * mapW + x) * 4] > 128;
    }

    // 6. Generate High-Density Photonic Gold Dots
    const landPositions = [];
    const step = isMobile ? 1.4 : 1.1;

    for (let lat = -82; lat <= 82; lat += step) {
      const radiusAtLat = Math.cos(lat * (Math.PI / 180));
      const adjustedStepLon = step / Math.max(0.2, radiusAtLat);

      for (let lon = -180; lon < 180; lon += adjustedStepLon) {
        if (isLandPixel(lat, lon)) {
          const vec = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.008);
          landPositions.push(vec.x, vec.y, vec.z);
        }
      }
    }

    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landPositions, 3));
    const landMat = new THREE.PointsMaterial({
      color: 0xf6e29e,
      size: isMobile ? 0.019 : 0.022,
      transparent: true,
      opacity: 0.95
    });
    worldGroup.add(new THREE.Points(landGeo, landMat));

    // 7. Commercial Harbors & Mundra Port Hub
    const PORTS = {
      mundra:    { name: 'Mundra Port (INMUN1)', lat: 22.84, lon: 69.70, hub: true },
      dubai:     { name: 'Jebel Ali (UAE)',       lat: 24.98, lon: 55.06 },
      jeddah:    { name: 'Jeddah (KSA)',          lat: 21.48, lon: 39.17 },
      rotterdam: { name: 'Rotterdam (EU)',        lat: 51.92, lon: 4.48 },
      singapore: { name: 'Singapore Hub',         lat: 1.35,  lon: 103.82 },
      newyork:   { name: 'New York (USA)',        lat: 40.71, lon: -74.00 }
    };

    const mundraVec = latLonToVec3(PORTS.mundra.lat, PORTS.mundra.lon, GLOBE_RADIUS * 1.016);

    // Glowing Mundra Beacon (Emerald Core + Pulsing Atmospheric Disk)
    const mundraBeaconGeo = new THREE.SphereGeometry(0.044, 16, 16);
    const mundraBeaconMat = new THREE.MeshBasicMaterial({ color: 0x1ed487 });
    const mundraBeacon = new THREE.Mesh(mundraBeaconGeo, mundraBeaconMat);
    mundraBeacon.position.copy(mundraVec);
    worldGroup.add(mundraBeacon);

    // 8. Ballistic Maritime Arcs & Traveling Photons
    const destinations = ['dubai', 'jeddah', 'rotterdam', 'singapore', 'newyork'];
    const routes = [];

    destinations.forEach((key, index) => {
      const port = PORTS[key];
      const destVec = latLonToVec3(port.lat, port.lon, GLOBE_RADIUS * 1.016);

      const destMarkerGeo = new THREE.SphereGeometry(0.026, 12, 12);
      const destMarkerMat = new THREE.MeshBasicMaterial({ color: 0xf6e29e });
      const destMarker = new THREE.Mesh(destMarkerGeo, destMarkerMat);
      destMarker.position.copy(destVec);
      worldGroup.add(destMarker);

      // Elevated Great-Circle Trajectory
      const midPoint = mundraVec.clone().add(destVec).multiplyScalar(0.5);
      const dist = mundraVec.distanceTo(destVec);
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(dist * 0.45, 0.6));

      const curve = new THREE.QuadraticBezierCurve3(mundraVec, midPoint, destVec);
      const points = curve.getPoints(isMobile ? 32 : 54);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.65
      });
      worldGroup.add(new THREE.Line(arcGeo, arcMat));

      const photonGeo = new THREE.SphereGeometry(0.024, 10, 10);
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

    // 9. Dual Horological Chronometer Rings
    const ringGeo1 = new THREE.RingGeometry(GLOBE_RADIUS * 1.34, GLOBE_RADIUS * 1.348, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.38;
    worldGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(GLOBE_RADIUS * 1.44, GLOBE_RADIUS * 1.444, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x1ed487,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.y = Math.PI * 0.2;
    worldGroup.add(ring2);

    // 10. Ambient Golden Dust (Deep Space Perspective)
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
      color: 0xf6e29e,
      size: 0.018,
      transparent: true,
      opacity: 0.4
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // 11. Studio Lighting Rig
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sunLight = new THREE.DirectionalLight(0xfff5d8, 1.85);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const emeraldRim = new THREE.DirectionalLight(0x1ed487, 1.3);
    emeraldRim.position.set(-5, -2, -3);
    scene.add(emeraldRim);

    // Initial View: Locks directly on India, Gujarat & Arabian Sea
    worldGroup.rotation.y = -1.35;
    worldGroup.rotation.x = 0.34;

    // 12. Fluid Physics (Mouse Drag + Mobile Touch Inertia)
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

    // Cursor Parallax
    window.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);
    }, { passive: true });

    // 13. Dynamic Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      const w = getW();
      const h = getH();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 14. Visibility Observer (GPU Sleep when off-screen)
    let isGlobeVisible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isGlobeVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    visibilityObserver.observe(container);

    // 15. Master 60FPS Render Loop
    const clock = new THREE.Clock();

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      if (!isGlobeVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth eastward planetary rotation
      if (!isDragging && !prefersReducedMotion) {
        targetRotY += 0.0022;
      }

      // Smooth inertial interpolation
      worldGroup.rotation.y += (targetRotY - worldGroup.rotation.y) * 0.075;
      worldGroup.rotation.x += (targetRotX - worldGroup.rotation.x) * 0.075;
      worldGroup.rotation.x = Math.max(-0.85, Math.min(0.85, worldGroup.rotation.x));

      // Horological counter-rotations
      ring1.rotation.z = elapsed * 0.04;
      ring2.rotation.z = -elapsed * 0.025;

      // Pulse Mundra Port Beacon
      const pulse = 1.0 + Math.sin(elapsed * 4.2) * 0.28;
      mundraBeacon.scale.set(pulse, pulse, pulse);

      // Trajectory Comets
      routes.forEach(r => {
        const t = (elapsed * 0.45 + r.offset) % 1.0;
        r.photon.position.copy(r.curve.getPointAt(t));
      });

      renderer.render(scene, camera);
    }

    renderLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUltraGlobe);
  } else {
    initUltraGlobe();
  }
})();
