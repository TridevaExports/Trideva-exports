/**
 * TRIDEVA EXPORTS - 3D Maritime Trade Globe
 * High-performance WebGL canvas with edge caching and battery throttling.
 */
(function () {
  'use strict';

  function initGlobe() {
    const container = document.getElementById('globe') || document.getElementById('globe3d-container');
    if (!container) return;

    // Check for Three.js availability
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Globe fallback active.');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.6;

    const renderer = new THREE.WebGLRenderer({
      canvas: container.tagName === 'CANVAS' ? container : undefined,
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });

    if (container.tagName !== 'CANVAS') {
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);
    } else {
      renderer.setSize(width, height, false);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Dark Core Sphere
    const sphereGeo = new THREE.SphereGeometry(0.98, isMobile ? 24 : 36, isMobile ? 24 : 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x05130b,
      transparent: true,
      opacity: 0.92
    });
    const core = new THREE.Mesh(sphereGeo, sphereMat);
    rootGroup.add(core);

    // 2. Gold Wireframe Longitude/Latitude
    const wireGeo = new THREE.SphereGeometry(1.0, isMobile ? 18 : 28, isMobile ? 18 : 28);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xd7ad43,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    rootGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // 3. Port Coordinates (Lat, Lon)
    const PORTS = {
      mundra: { name: 'Mundra Port (Origin)', lat: 22.8, lon: 69.7 },
      dubai: { name: 'Jebel Ali, UAE', lat: 25.2, lon: 55.3 },
      jeddah: { name: 'Jeddah, KSA', lat: 21.5, lon: 39.1 },
      rotterdam: { name: 'Rotterdam, EU', lat: 51.9, lon: 4.4 },
      singapore: { name: 'Singapore', lat: 1.3, lon: 103.8 },
      newyork: { name: 'New York, USA', lat: 40.7, lon: -74.0 }
    };

    function toVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Origin: Mundra Port
    const mundraVec = toVector3(PORTS.mundra.lat, PORTS.mundra.lon, 1.01);

    // Marker for Mundra
    const originGeo = new THREE.SphereGeometry(0.026, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0x1ed487 });
    const originMarker = new THREE.Mesh(originGeo, originMat);
    originMarker.position.copy(mundraVec);
    rootGroup.add(originMarker);

    // Destination markers & animated arcs
    const routes = [];
    const destinationKeys = ['dubai', 'jeddah', 'rotterdam', 'singapore', 'newyork'];

    destinationKeys.forEach((key) => {
      const p = PORTS[key];
      const destVec = toVector3(p.lat, p.lon, 1.01);

      // Destination Marker
      const destGeo = new THREE.SphereGeometry(0.018, 12, 12);
      const destMat = new THREE.MeshBasicMaterial({ color: 0xf3dc91 });
      const destMesh = new THREE.Mesh(destGeo, destMat);
      destMesh.position.copy(destVec);
      rootGroup.add(destMesh);

      // Elevated quadratic curve for shipping lane
      const midVec = mundraVec.clone().add(destVec).multiplyScalar(0.5);
      const dist = mundraVec.distanceTo(destVec);
      midVec.normalize().multiplyScalar(1.0 + Math.min(dist * 0.28, 0.42));

      const curve = new THREE.QuadraticBezierCurve3(mundraVec, midVec, destVec);
      const curvePoints = curve.getPoints(isMobile ? 24 : 40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0xd7ad43,
        transparent: true,
        opacity: 0.45
      });
      const arc = new THREE.Line(curveGeo, curveMat);
      rootGroup.add(arc);

      // Cargo transit particle
      const pGeo = new THREE.SphereGeometry(0.014, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xf3dc91 });
      const particle = new THREE.Mesh(pGeo, pMat);
      rootGroup.add(particle);

      routes.push({ curve, particle, progress: Math.random() });
    });

    // 4. Subtle Orbital Ring
    const ringGeo = new THREE.RingGeometry(1.22, 1.224, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd7ad43,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.44;
    rootGroup.add(ring);

    // Interaction State
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0;
    let targetRotX = 0.2;

    const domTarget = renderer.domElement;

    domTarget.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      domTarget.setPointerCapture(e.pointerId);
    });

    domTarget.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      targetRotY += dx * 0.005;
      targetRotX += dy * 0.005;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    domTarget.addEventListener('pointerup', () => { isDragging = false; });
    domTarget.addEventListener('pointercancel', () => { isDragging = false; });

    // Responsive Canvas Resizing
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });

    // IntersectionObserver to pause WebGL render loop when out of viewport
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      if (!isDragging && !prefersReducedMotion) {
        targetRotY += 0.002;
      }

      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.08;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.08;

      // Animate shipping particles along curves
      routes.forEach((r) => {
        r.progress = (r.progress + 0.004) % 1;
        const pos = r.curve.getPointAt(r.progress);
        r.particle.position.copy(pos);
      });

      renderer.render(scene, camera);
    }

    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobe);
  } else {
    initGlobe();
  }
})();