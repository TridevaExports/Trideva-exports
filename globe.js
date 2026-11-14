/* =========================================================
   DIGITAL MARITIME MANIFEST
   globe.js
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("globe");
  const container = document.getElementById("globe-container");

  if (!canvas || !container || typeof THREE === "undefined") {
    return;
  }

  /* -------------------------
     Configuration
  -------------------------- */

  const CONFIG = {
    globeRadius: 2.35,
    rotationSpeed: 0.0018,
    markerSize: 0.035,
    atmosphereColor: 0x4de7ff,
    globeColor: 0x0b4661,
    gridColor: 0x39c8e8,
    routeColor: 0x52f0b0
  };

  /* -------------------------
     Scene Setup
  -------------------------- */

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    1,
    0.1,
    100
  );

  camera.position.set(0, 0.15, 7.1);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 2)
  );

  renderer.setClearColor(0x000000, 0);

  /* -------------------------
     Lighting
  -------------------------- */

  const ambientLight = new THREE.AmbientLight(
    0x5bdfff,
    0.75
  );

  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(
    0x75ecff,
    2.2,
    14
  );

  pointLight.position.set(3, 3, 5);
  scene.add(pointLight);

  const secondaryLight = new THREE.PointLight(
    0x1764ff,
    1.1,
    12
  );

  secondaryLight.position.set(-4, -2, 3);
  scene.add(secondaryLight);

  /* -------------------------
     Globe Group
  -------------------------- */

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  /* -------------------------
     Main Globe
  -------------------------- */

  const globeGeometry = new THREE.SphereGeometry(
    CONFIG.globeRadius,
    64,
    64
  );

  const globeMaterial = new THREE.MeshPhongMaterial({
    color: CONFIG.globeColor,
    emissive: 0x062738,
    emissiveIntensity: 0.9,
    shininess: 65,
    transparent: true,
    opacity: 0.92
  });

  const globe = new THREE.Mesh(
    globeGeometry,
    globeMaterial
  );

  globeGroup.add(globe);

  /* -------------------------
     Latitude and Longitude
  -------------------------- */

  const gridGroup = new THREE.Group();
  globeGroup.add(gridGroup);

  const gridMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.gridColor,
    transparent: true,
    opacity: 0.2
  });

  const gridRadius = CONFIG.globeRadius + 0.012;

  function createLatitude(latitude) {
    const points = [];
    const latitudeRadians = THREE.MathUtils.degToRad(latitude);
    const y = Math.sin(latitudeRadians) * gridRadius;
    const radius = Math.cos(latitudeRadians) * gridRadius;

    for (let index = 0; index <= 96; index += 1) {
      const longitude = (index / 96) * Math.PI * 2;

      points.push(
        new THREE.Vector3(
          Math.cos(longitude) * radius,
          y,
          Math.sin(longitude) * radius
        )
      );
    }

    const geometry = new THREE.BufferGeometry()
      .setFromPoints(points);

    return new THREE.Line(
      geometry,
      gridMaterial
    );
  }

  function createLongitude(longitude) {
    const points = [];
    const longitudeRadians = THREE.MathUtils.degToRad(longitude);

    for (let index = 0; index <= 96; index += 1) {
      const latitude = (index / 96) * Math.PI - Math.PI / 2;

      points.push(
        new THREE.Vector3(
          Math.cos(latitude) * Math.cos(longitudeRadians) * gridRadius,
          Math.sin(latitude) * gridRadius,
          Math.cos(latitude) * Math.sin(longitudeRadians) * gridRadius
        )
      );
    }

    const geometry = new THREE.BufferGeometry()
      .setFromPoints(points);

    return new THREE.Line(
      geometry,
      gridMaterial
    );
  }

  for (let latitude = -75; latitude <= 75; latitude += 15) {
    gridGroup.add(createLatitude(latitude));
  }

  for (let longitude = 0; longitude < 180; longitude += 15) {
    gridGroup.add(createLongitude(longitude));
  }

  /* -------------------------
     Atmosphere
  -------------------------- */

  const atmosphereGeometry = new THREE.SphereGeometry(
    CONFIG.globeRadius + 0.12,
    64,
    64
  );

  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.atmosphereColor,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
  });

  const atmosphere = new THREE.Mesh(
    atmosphereGeometry,
    atmosphereMaterial
  );

  globeGroup.add(atmosphere);

  /* -------------------------
     Coordinate Conversion
  -------------------------- */

  function coordinatesToVector3(
    latitude,
    longitude,
    radius = CONFIG.globeRadius + 0.035
  ) {
    const lat = THREE.MathUtils.degToRad(latitude);
    const lon = THREE.MathUtils.degToRad(longitude);

    return new THREE.Vector3(
      radius * Math.cos(lat) * Math.cos(lon),
      radius * Math.sin(lat),
      radius * Math.cos(lat) * Math.sin(lon)
    );
  }

  /* -------------------------
     Ports / Network Markers
  -------------------------- */

  const ports = [
    {
      name: "Rotterdam",
      latitude: 51.9244,
      longitude: 4.4777
    },
    {
      name: "Singapore",
      latitude: 1.3521,
      longitude: 103.8198
    },
    {
      name: "Dubai",
      latitude: 25.2048,
      longitude: 55.2708
    },
    {
      name: "Shanghai",
      latitude: 31.2304,
      longitude: 121.4737
    },
    {
      name: "Lagos",
      latitude: 6.5244,
      longitude: 3.3792
    },
    {
      name: "New York",
      latitude: 40.7128,
      longitude: -74.006
    },
    {
      name: "Santos",
      latitude: -23.9608,
      longitude: -46.3336
    }
  ];

  const markerGroup = new THREE.Group();
  globeGroup.add(markerGroup);

  const markerGeometry = new THREE.SphereGeometry(
    CONFIG.markerSize,
    12,
    12
  );

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.routeColor
  });

  ports.forEach((port) => {
    const marker = new THREE.Mesh(
      markerGeometry,
      markerMaterial
    );

    marker.position.copy(
      coordinatesToVector3(
        port.latitude,
        port.longitude,
        CONFIG.globeRadius + 0.045
      )
    );

    marker.userData = port;
    markerGroup.add(marker);

    const ringGeometry = new THREE.RingGeometry(
      CONFIG.markerSize * 1.8,
      CONFIG.markerSize * 2.4,
      24
    );

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.routeColor,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(
      ringGeometry,
      ringMaterial
    );

    ring.position.copy(marker.position);
    ring.lookAt(0, 0, 0);
    ring.userData = {
      pulseOffset: Math.random() * Math.PI * 2
    };

    markerGroup.add(ring);
  });

  /* -------------------------
     Curved Maritime Routes
  -------------------------- */

  const routeGroup = new THREE.Group();
  globeGroup.add(routeGroup);

  const routeMaterial = new THREE.LineBasicMaterial({
    color: CONFIG.routeColor,
    transparent: true,
    opacity: 0.48
  });

  function createRoute(startPort, endPort) {
    const start = coordinatesToVector3(
      startPort.latitude,
      startPort.longitude,
      CONFIG.globeRadius + 0.04
    );

    const end = coordinatesToVector3(
      endPort.latitude,
      endPort.longitude,
      CONFIG.globeRadius + 0.04
    );

    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);

    midpoint.normalize().multiplyScalar(
      CONFIG.globeRadius + 0.3 + distance * 0.12
    );

    const curve = new THREE.QuadraticBezierCurve3(
      start,
      midpoint,
      end
    );

    const points = curve.getPoints(48);
    const geometry = new THREE.BufferGeometry()
      .setFromPoints(points);

    return new THREE.Line(
      geometry,
      routeMaterial
    );
  }

  const routes = [
    [ports[0], ports[1]],
    [ports[1], ports[3]],
    [ports[1], ports[2]],
    [ports[2], ports[3]],
    [ports[4], ports[2]],
    [ports[5], ports[0]],
    [ports[6], ports[4]]
  ];

  routes.forEach(([start, end]) => {
    routeGroup.add(createRoute(start, end));
  });

  /* -------------------------
     Orbital Rings
  -------------------------- */

  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  function createOrbit(
    radius,
    rotationX,
    rotationY,
    opacity
  ) {
    const geometry = new THREE.RingGeometry(
      radius,
      radius + 0.006,
      128
    );

    const material = new THREE.MeshBasicMaterial({
      color: CONFIG.atmosphereColor,
      transparent: true,
      opacity,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(
      geometry,
      material
    );

    ring.rotation.x = rotationX;
    ring.rotation.y = rotationY;

    orbitGroup.add(ring);
  }

  createOrbit(CONFIG.globeRadius + 0.42, 1.08, 0.25, 0.22);
  createOrbit(CONFIG.globeRadius + 0.58, 0.72, -0.4, 0.12);

  /* -------------------------
     Pointer Interaction
  -------------------------- */

  let pointerX = 0;
  let pointerY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  function handlePointerMove(event) {
    const rect = container.getBoundingClientRect();

    pointerX =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointerY =
      ((event.clientY - rect.top) / rect.height) * 2 - 1;

    targetRotationX = pointerY * 0.16;
    targetRotationY = pointerX * 0.24;
  }

  container.addEventListener(
    "pointermove",
    handlePointerMove,
    { passive: true }
  );

  /* -------------------------
     Resize Handling
  -------------------------- */

  function resizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight || width;

    if (!width || !height) {
      return;
    }

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener(
    "resize",
    resizeRenderer,
    { passive: true }
  );

  resizeRenderer();

  /* -------------------------
     Animation
  -------------------------- */

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    globeGroup.rotation.y += CONFIG.rotationSpeed;

    globeGroup.rotation.x +=
      (targetRotationX - globeGroup.rotation.x) * 0.025;

    globeGroup.rotation.z +=
      (targetRotationY * 0.18 - globeGroup.rotation.z) * 0.025;

    orbitGroup.rotation.z -= 0.0007;
    orbitGroup.rotation.y += 0.0004;

    markerGroup.children.forEach((object) => {
      if (
        object.geometry &&
        object.geometry.type === "RingGeometry"
      ) {
        const pulse =
          1 + Math.sin(elapsed * 2.2 + object.userData.pulseOffset) * 0.18;

        object.scale.setScalar(pulse);
        object.material.opacity =
          0.35 + (pulse - 0.82) * 0.55;
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  /* -------------------------
     Cleanup
  -------------------------- */

  window.addEventListener("beforeunload", () => {
    globeGeometry.dispose();
    globeMaterial.dispose();
    atmosphereGeometry.dispose();
    atmosphereMaterial.dispose();
    markerGeometry.dispose();
    markerMaterial.dispose();
    gridMaterial.dispose();
    routeMaterial.dispose();
    renderer.dispose();
  });

})();
