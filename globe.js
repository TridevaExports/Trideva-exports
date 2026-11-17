/**
 * TRIDEVA EXPORTS — Geographic Matrix 3D Maritime Engine
 * Real-World Landmass Rasterizer, Ballistic Shipping Arcs & Horological Rings
 * Built on Three.js (No external texture dependencies, zero CORS lag)
 */
(function () {
  'use strict';

  function initGeographicGlobe() {
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

    // 1. Scene, Camera, High-Precision WebGL Renderer
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
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 0.99, 48, 48);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x020704,
      emissive: 0x03120a,
      specular: 0x1f4e35,
      shininess: 32,
      transparent: true,
      opacity: 0.97
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    worldGroup.add(coreMesh);

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
          gl_FragColor = vec4(0.96, 0.88, 0.62, 1.0) * (intensity * 0.72) + vec4(0.12, 0.83, 0.53, 1.0) * (intensity * 0.45);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    worldGroup.add(new THREE.Mesh(haloGeo, haloMat));

    // 4. Coordinates Converter: Latitude/Longitude to 3D Sphere Vector
    function latLonToVec3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // 5. In-Memory Geographic Landmass Raster Mask Generator
    // Generates an offscreen equirectangular map to test land coordinates with high accuracy
    function createLandmassContext() {
      const cvs = document.createElement('canvas');
      cvs.width = 1000;
      cvs.height = 500;
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      ctx.fillStyle = '#ffffff';

      // Helper to project lat/lon to equirectangular coordinates
      const p = (lon, lat) => [
        Math.round(((lon + 180) / 360) * cvs.width),
        Math.round(((90 - lat) / 180) * cvs.height)
      ];

      function drawPolygon(pts) {
        if (!pts.length) return;
        ctx.beginPath();
        const start = p(pts[0][0], pts[0][1]);
        ctx.moveTo(start[0], start[1]);
        for (let i = 1; i < pts.length; i++) {
          const pt = p(pts[i][0], pts[i][1]);
          ctx.lineTo(pt[0], pt[1]);
        }
        ctx.closePath();
        ctx.fill();
      }

      // India & South Asia (High-Fidelity Coastal Geometry)
      drawPolygon([
        [68, 24], [70, 22], [72, 20], [73, 16], [75, 12], [77, 8], [78, 8.5], 
        [80, 10], [80, 13], [82, 16], [85, 19], [87, 21.5], [89, 22], [90, 24], 
        [92, 26], [88, 27], [85, 27], [80, 30], [77, 34], [74, 34], [71, 30], 
        [69, 26], [68, 24]
      ]);

      // Arabian Peninsula & Middle East
      drawPolygon([
        [35, 28], [40, 23], [44, 14], [50, 12], [54, 16], [58, 22], [59, 24], 
        [56, 26], [51, 25], [48, 30], [44, 32], [36, 31], [35, 28]
      ]);

      // Africa
      drawPolygon([
        [-17, 15], [-12, 5], [9, 4], [12, -5], [14, -18], [20, -34], [28, -33], 
        [32, -26], [40, -10], [51, 11], [43, 12], [38, 28], [32, 31], [11, 37], 
        [-5, 36], [-17, 21], [-17, 15]
      ]);

      // Eurasia (Europe, Central Asia, China, East Asia)
      drawPolygon([
        [-9, 36], [-9, 43], [2, 51], [5, 60], [25, 71], [60, 70], [105, 75], 
        [170, 68], [140, 50], [130, 42], [122, 30], [110, 20], [103, 10], 
        [99, 18], [80, 32], [65, 37], [50, 42], [36, 41], [27, 38], [15, 38], 
        [-5, 36]
      ]);

      // Southeast Asia & Sunda
      drawPolygon([
        [98, 8], [104, 1], [104, 14], [98, 16], [98, 8]
      ]);
      drawPolygon([[95, 5], [105, -5], [115, -8], [112, 3], [100, 2]]);
      drawPolygon([[114, 4], [119, 4], [118, -4], [110, -3]]);

      // North America
      drawPolygon([
        [-168, 65], [-160, 55], [-130, 50], [-124, 38], [-117, 30], [-105, 20], 
        [-97, 26], [-80, 25], [-81, 30], [-74, 40], [-64, 45], [-55, 50], 
        [-60, 60], [-85, 65], [-130, 70], [-168, 65]
      ]);

      // South America
      drawPolygon([
        [-77, 8], [-80, -2], [-76, -14], [-71, -30], [-74, -45], [-68, -55], 
        [-53, -33], [-35, -6], [-50, 0], [-60, 10], [-77, 8]
      ]);

      // Australia
      drawPolygon([
        [114, -22], [115, -34], [130, -32], [138, -35], [150, -37], [153, -28], 
        [144, -14], [136, -12], [128, -15], [122, -18], [114, -22]
      ]);

      // Japan
      drawPolygon([[130, 32], [136, 35], [141, 41], [143, 44], [141, 37], [132, 33]]);
      // United Kingdom & Scandinavia
      drawPolygon([[-5, 50], [0, 58], [-4, 58], [-5, 50]]);
      drawPolygon([[5, 60], [18, 60], [24, 70], [12, 65]]);

      return ctx;
    }

    const landCtx = createLandmassContext();
    const mapWidth = 1000;
    const mapHeight = 500;
    const landImageData = landCtx.getImageData(0, 0, mapWidth, mapHeight).data;

    function isLand(lat, lon) {
      const x = Math.floor(((lon + 180) / 360) * mapWidth);
      const y = Math.floor(((90 - lat) / 180) * mapHeight);
      if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return false;
      const index = (y * mapWidth + x) * 4;
      return landImageData[index] > 128; // White pixel = Land
    }

    // 6. Generate Real-World High-Density Golden Photonic Dot Grid
    const landPositions = [];
    const stepLat = isMobile ? 1.6 : 1.25;
    const stepLon = isMobile ? 1.6 : 1.25;

    for (let lat = -82; lat <= 82; lat += stepLat) {
      // Circumference scaling to ensure uniform density at poles
      const radiusAtLat = Math.cos(lat * (Math.PI / 180));
      const adjustedStepLon = stepLon / Math.max(0.2, radiusAtLat);

      for (let lon = -180; lon < 180; lon += adjustedStepLon) {
        if (isLand(lat, lon)) {
          const vec = latLonToVec3(lat, lon, GLOBE_RADIUS * 1.008);
          landPositions.push(vec.x, vec.y, vec.z);
        }
      }
    }

    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landPositions, 3));
    const landMat = new THREE.PointsMaterial({
      color: 0xf5df9b,
      size: isMobile ? 0.018 : 0.021,
      transparent: true,
      opacity: 0.92
    });
    const landPoints = new THREE.Points(landGeo, landMat);
    worldGroup.add(landPoints);

    // 7. Commercial Harbors & Mundra Primary Hub
    const PORTS = {
      mundra:    { name: 'Mundra Port (INMUN1)', lat: 22.84, lon: 69.70, hub: true },
      dubai:     { name: 'Jebel Ali (UAE)',       lat: 24.98, lon: 55.06 },
      jeddah:    { name: 'Jeddah (KSA)',          lat: 21.48, lon: 39.17 },
      rotterdam: { name: 'Rotterdam (EU)',        lat: 51.92, lon: 4.48 },
      singapore: { name: 'Singapore Hub',         lat: 1.35,  lon: 103.82 },
      newyork:   { name: 'New York (USA)',        lat: 40.71, lon: -74.00 }
    };

    const mundraVec = latLonToVec3(PORTS.mundra.lat, PORTS.mundra.lon, GLOBE_RADIUS * 1.016);

    // Emerald Origin Beacon (Mundra Port, Gujarat)
    const mundraBeaconGeo = new THREE.SphereGeometry(0.042, 16, 16);
    const mundraBeaconMat = new THREE.MeshBasicMaterial({ color: 0x1ed487 });
    const mundraBeacon = new THREE.Mesh(mundraBeaconGeo, mundraBeaconMat);
    mundraBeacon.position.copy(mundraVec);
    worldGroup.add(mundraBeacon);

    // 8. Ballistic Maritime Great-Circle Arcs with Traveling Photon Comets
    const destinations = ['dubai', 'jeddah', 'rotterdam', 'singapore', 'newyork'];
    const routes = [];

    destinations.forEach((key, index) => {
      const port = PORTS[key];
      const destVec = latLonToVec3(port.lat, port.lon, GLOBE_RADIUS * 1.016);

      // Destination Gold Marker
      const destMarkerGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const destMarkerMat = new THREE.MeshBasicMaterial({ color: 0xf5df9b });
      const destMarker = new THREE.Mesh(destMarkerGeo, destMarkerMat);
      destMarker.position.copy(destVec);
      worldGroup.add(destMarker);

      // Parabolic Arc Elevated in Nautical Space
      const midPoint = mundraVec.clone().add(destVec).multiplyScalar(0.5);
      const dist = mundraVec.distanceTo(destVec);
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(dist * 0.42, 0.58));

      const curve = new THREE.QuadraticBezierCurve3(mundraVec, midPoint, destVec);
      const points = curve.getPoints(isMobile ? 32 : 52);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.6
      });
      worldGroup.add(new THREE.Line(arcGeo, arcMat));

      // Flowing Comet Head (Photon)
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

    // 9. Dual Luxury Horological Chronometer Rings
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
      color: 0xf5df9b,
      size: 0.018,
      transparent: true,
      opacity: 0.4
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // 11. Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sunLight = new THREE.DirectionalLight(0xfff5d8, 1.85);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const emeraldRim = new THREE.DirectionalLight(0x1ed487, 1.3);
    emeraldRim.position.set(-5, -2, -3);
    scene.add(emeraldRim);

    // Initial orientation: Center on Indian Subcontinent & Arabian Sea
    worldGroup.rotation.y = -1.35;
    worldGroup.rotation.x = 0.34;

    // 12. Fluid Physics (Pointer Drag & Touch Inertia)
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

    // Cursor Parallax Reaction
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

    // 14. Visibility Culling Observer
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

      // Smooth eastward planetary spin
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

      // Pulse Mundra Port Emerald Beacon
      const pulse = 1.0 + Math.sin(elapsed * 4.2) * 0.28;
      mundraBeacon.scale.set(pulse, pulse, pulse);

      // Trajectory Comet Animations
      routes.forEach(r => {
        const t = (elapsed * 0.45 + r.offset) % 1.0;
        r.photon.position.copy(r.curve.getPointAt(t));
      });

      renderer.render(scene, camera);
    }

    renderLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGeographicGlobe);
  } else {
    initGeographicGlobe();
  }
})();
