/* ============================================================
   THE STAINLESS (INDIA) — Abstract 3D metallic scenes (Three.js)
   Matcap-shaded geometry — no HDRI, GPU-cheap, cinematic look.
   Respects prefers-reduced-motion; degrades gracefully without WebGL.
   ============================================================ */
(function () {
  'use strict';

  const TSI3D = { mounted: [] };
  window.TSI3D = TSI3D;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function supportsWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  /* Build a steel/cyan matcap texture procedurally (no image request needed) */
  function buildMatcap(hex1, hex2, hexHi) {
    const size = 256;
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = size;
    const ctx = cnv.getContext('2d');
    const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 4, size * 0.5, size * 0.5, size * 0.5);
    grad.addColorStop(0, hex2);
    grad.addColorStop(0.55, hex1);
    grad.addColorStop(1, '#05070a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    // specular highlight (upper-left) for metallic sheen
    const hi = ctx.createRadialGradient(size * 0.32, size * 0.28, 2, size * 0.32, size * 0.28, size * 0.42);
    hi.addColorStop(0, hexHi);
    hi.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    hi.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hi;
    ctx.fillRect(0, 0, size, size);
    // secondary rim highlight
    const rim = ctx.createRadialGradient(size * 0.78, size * 0.82, 2, size * 0.78, size * 0.82, size * 0.3);
    rim.addColorStop(0, 'rgba(180,220,225,0.5)');
    rim.addColorStop(1, 'rgba(180,220,225,0)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(cnv);
    tex.needsUpdate = true;
    return tex;
  }

  function mountScene(canvas, opts) {
    opts = opts || {};
    const type = opts.type || 'hero';
    if (!canvas || !supportsWebGL()) {
      showFallback(canvas);
      return null;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, opts.cameraZ || 7);

    const matcapSteel = buildMatcap('#3a4046', '#8a939b', '#eaf7f8');
    const matcapAccent = buildMatcap('#12474b', '#2fb8bd', '#eafdff');

    const group = new THREE.Group();
    scene.add(group);
    const TSI3D_particles = [];

    if (type === 'hero') {
      const geo = new THREE.TorusKnotGeometry(1.6, 0.42, 220, 32, 2, 3);
      const mat = new THREE.MeshMatcapMaterial({ matcap: matcapSteel, flatShading: false });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      const geo2 = new THREE.TorusGeometry(2.7, 0.02, 8, 120);
      const mat2 = new THREE.MeshMatcapMaterial({ matcap: matcapAccent });
      const ring = new THREE.Mesh(geo2, mat2);
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);

      addParticles(scene, 140, 6);
      if (opts.scale) group.scale.setScalar(opts.scale);
    } else if (type === 'rings') {
      const radii = [1.9, 1.45, 1.0];
      radii.forEach((r, i) => {
        const geo = new THREE.TorusGeometry(r, 0.075, 24, 140);
        const mat = new THREE.MeshMatcapMaterial({ matcap: i === 1 ? matcapAccent : matcapSteel });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = (Math.PI / 5) * i;
        mesh.rotation.y = (Math.PI / 7) * i;
        mesh.userData.spin = 0.08 + i * 0.05;
        group.add(mesh);
      });
      addParticles(scene, 90, 7);
    } else if (type === 'shard') {
      const geo = new THREE.IcosahedronGeometry(1.5, 1);
      const mat = new THREE.MeshMatcapMaterial({ matcap: matcapSteel, flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      const geo2 = new THREE.TorusGeometry(2.1, 0.015, 8, 100);
      const mat2 = new THREE.MeshMatcapMaterial({ matcap: matcapAccent });
      const ring = new THREE.Mesh(geo2, mat2);
      ring.rotation.x = Math.PI / 3;
      group.add(ring);
    }

    function addParticles(scene, count, spread) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * spread * 2;
        positions[i + 1] = (Math.random() - 0.5) * spread;
        positions[i + 2] = (Math.random() - 0.5) * spread;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: 0x0e7490, size: 0.022, transparent: true, opacity: 0.55 });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      TSI3D_particles.push(pts);
    }

    let targetRotX = 0, targetRotY = 0;
    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      mouseX = (cx / window.innerWidth) * 2 - 1;
      mouseY = (cy / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });

    let scrollRotation = 0;
    function setScrollRotation(v) { scrollRotation = v; }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      /* Push the object into the empty right-hand half so it never sits
         behind the headline. Below the breakpoint there is no room to the
         right, so it recentres and the CSS scrim handles legibility. */
      if (opts.offsetRight) {
        const visH = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
        const visW = visH * camera.aspect;
        const s = opts.scale || 1;
        const clearance = (opts.offsetClearance || 3.1) * s;
        const off = Math.min(visW * 0.5 - clearance, visW * 0.27);
        group.position.x = w < (opts.offsetMinWidth || 900) ? 0 : Math.max(0, off);
        /* drop it clear of the fixed header band so the nav links stay readable */
        group.position.y = -visH * (opts.offsetDown || 0);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    let raf = null;
    let visible = true;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { visible = en.isIntersecting; });
    }, { threshold: 0.01 });
    io.observe(canvas);

    const clock = new THREE.Clock();
    function tick() {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      targetRotX += (mouseY * 0.4 - targetRotX) * 0.04;
      targetRotY += (mouseX * 0.5 - targetRotY) * 0.04;

      if (type === 'rings') {
        group.children.forEach((mesh) => {
          if (mesh.geometry && mesh.geometry.type === 'TorusGeometry') {
            mesh.rotation.z = t * (mesh.userData.spin || 0.08) + scrollRotation;
          }
        });
        group.rotation.y = targetRotY * 0.6 + scrollRotation * 0.3;
        group.rotation.x = targetRotX * 0.4;
      } else {
        group.rotation.y = t * 0.12 + targetRotY + scrollRotation;
        group.rotation.x = Math.sin(t * 0.15) * 0.15 + targetRotX;
      }
      TSI3D_particles.forEach((p) => { p.rotation.y = t * 0.02; });

      renderer.render(scene, camera);
    }
    if (!reduced) {
      tick();
    } else {
      renderer.render(scene, camera);
    }

    const api = { renderer, scene, camera, group, setScrollRotation, destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      io.disconnect();
      renderer.dispose();
    } };
    TSI3D.mounted.push(api);
    return api;
  }

  function showFallback(canvas) {
    if (!canvas) return;
    const wrap = canvas.closest('.hero-canvas-wrap, .page-hero-canvas-wrap, .editorial-visual, .experience-canvas-wrap');
    if (wrap) {
      canvas.style.display = 'none';
      const fb = document.createElement('div');
      fb.className = 'fallback-gradient';
      wrap.appendChild(fb);
    }
  }

  TSI3D.mount = mountScene;

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
      document.querySelectorAll('#hero-canvas, .page-hero-canvas, .editorial-canvas, #experience-canvas').forEach(showFallback);
      return;
    }
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) TSI3D.mount(heroCanvas, {
      type: 'hero',
      cameraZ: 7,
      offsetRight: true,
      scale: 0.62,        /* overall size of the metal form */
      offsetDown: 0.08,   /* nudge below the fixed header */
    });

    /* same metal form on inner-page heroes */
    document.querySelectorAll('.page-hero-canvas').forEach((c) => {
      TSI3D.mount(c, {
        type: 'hero',
        cameraZ: 7,
        offsetRight: true,
        scale: 0.6,
        offsetDown: 0.02,
      });
    });

    document.querySelectorAll('.editorial-canvas').forEach((c) => {
      TSI3D.mount(c, { type: 'shard', cameraZ: 5.5 });
    });

    const expCanvas = document.getElementById('experience-canvas');
    if (expCanvas) {
      const inst = TSI3D.mount(expCanvas, { type: 'rings', cameraZ: 6 });
      if (inst && window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: '.metal-experience',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => inst.setScrollRotation(self.progress * Math.PI * 2),
        });
      }
    }
  });
})();
