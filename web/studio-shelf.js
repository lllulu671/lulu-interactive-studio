import * as THREE from './vendor/three/three.module.min.js';

const WOOD_URL = new URL('./assets/shelf/wood_table_001_diff_1k.jpg', import.meta.url).href;
const TOP_BOARD = 2.13;
const LOWER_BOARD = 0.38;
const CJK_SERIF = '"Songti SC", "Noto Serif CJK SC", "SimSun", serif';

const material = (color, options = {}) => new THREE.MeshStandardMaterial({ color, ...options });

function block(parent, size, position, surface) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), surface);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, radius, depth, position, surface, axis = 'y') {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 48), surface);
  mesh.position.set(...position);
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function bookSpine({ title, imprint, color, ink, accent }) {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const { width, height } = canvas;
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);

  // Fine crosshatch and a little wear on the spine folds.
  context.fillStyle = 'rgba(30, 23, 18, 0.07)';
  for (let row = 1; row < height; row += 3) context.fillRect(0, row, width, 1);
  const shading = context.createLinearGradient(0, 0, width, 0);
  shading.addColorStop(0, 'rgba(18, 12, 8, 0.22)');
  shading.addColorStop(0.10, 'rgba(255, 250, 224, 0.14)');
  shading.addColorStop(0.32, 'rgba(255, 250, 224, 0)');
  shading.addColorStop(0.88, 'rgba(20, 10, 6, 0)');
  shading.addColorStop(1, 'rgba(20, 10, 6, 0.23)');
  context.fillStyle = shading;
  context.fillRect(0, 0, width, height);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = ink;
  context.font = `600 71px ${CJK_SERIF}`;
  Array.from(title).forEach((character, index) => {
    context.fillText(character, width / 2, 485 + (index - (title.length - 1) / 2) * 87);
  });
  context.font = `600 28px ${CJK_SERIF}`;
  Array.from(imprint).forEach((character, index) => context.fillText(character, width / 2, 787 + index * 36));
  context.fillStyle = accent;
  context.fillRect(32, 84, width - 64, 6);
  context.fillRect(32, 102, width - 64, 4);
  return new THREE.CanvasTexture(canvas);
}

function englishBookPrint({ title, color, ink, horizontal, onCover = false }) {
  const canvas = document.createElement('canvas');
  canvas.width = horizontal ? 1024 : 192;
  canvas.height = onCover ? 576 : (horizontal ? 144 : 1024);
  const context = canvas.getContext('2d');
  const { width, height } = canvas;

  context.fillStyle = color;
  context.fillRect(0, 0, width, height);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = ink;
  context.strokeStyle = ink;
  const capitals = title.toUpperCase();
  if (onCover) {
    context.globalAlpha = 0.46;
    context.strokeRect(57, 43, width - 114, height - 86);
    context.font = '43px Georgia, serif';
    context.letterSpacing = '5px';
    context.fillText(capitals, width / 2, height * 0.37);
    context.fillRect(width / 2 - 31, height * 0.47, 62, 2);
  } else if (horizontal) {
    context.font = '600 50px Georgia, serif';
    context.letterSpacing = '6px';
    context.fillText(capitals, width / 2, height / 2 + 1);
    context.globalAlpha = 0.6;
    context.fillRect(97, height / 2, 82, 2);
    context.fillRect(width - 179, height / 2, 82, 2);
  } else {
    context.fillStyle = '#d5b491';
    context.fillRect(39, 268, 114, 485);
    context.fillStyle = ink;
    context.translate(width / 2, height / 2);
    context.rotate(-Math.PI / 2);
    context.font = '600 49px Georgia, serif';
    context.letterSpacing = '6px';
    context.fillText(capitals, 0, 0);
    context.globalAlpha = 0.68;
    context.fillRect(-196, -1, 22, 2);
    context.fillRect(174, -1, 22, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return material('#ffffff', { map: texture, roughness: 0.81 });
}

function makePageTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = '#e5d6bc';
  context.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 2) {
    context.fillStyle = y % 10 === 0 ? '#b4a58d' : '#ccbaa2';
    context.fillRect(0, y, 128, 1);
  }
  return new THREE.CanvasTexture(canvas);
}

function addBook(scene, spec, pages) {
  const { size: [w, h, d], at: [x, bottom, z], color, horizontal } = spec;
  const cover = material(color, { roughness: 0.81 });
  let spine = cover;
  if (spec.english) {
    spine = englishBookPrint(spec);
  } else if (spec.title) {
    const label = bookSpine(spec);
    label.colorSpace = THREE.SRGBColorSpace;
    label.anisotropy = 8;
    spine = material('#ffffff', { map: label, roughness: 0.77 });
  }
  const binding = horizontal ? 0.023 : 0.026;
  const book = new THREE.Group();
  book.position.set(x, bottom, z);
  scene.add(book);
  if (horizontal) {
    block(book, [w - 0.038, h - binding * 2, d - 0.036], [0, h / 2, -0.012], pages);
    block(book, [w, binding, d], [0, binding / 2, 0], cover);
    const top = spec.printCover ? englishBookPrint({ ...spec, onCover: true }) : cover;
    block(book, [w, binding, d], [0, h - binding / 2, 0], [cover, cover, top, cover, cover, cover]);
  } else {
    block(book, [w - binding * 2, h - 0.031, d - 0.034], [0, h / 2, -0.014], pages);
    for (const side of [-1, 1]) {
      block(book, [binding, h, d], [side * (w - binding) / 2, h / 2, 0], cover);
    }
  }
  block(book, [w, h, 0.042], [0, h / 2, (d - 0.04) / 2], [cover, cover, cover, cover, spine, cover]);
}

function makeContactShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const falloff = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  falloff.addColorStop(0, 'rgba(15, 8, 4, 0.74)');
  falloff.addColorStop(0.55, 'rgba(15, 8, 4, 0.40)');
  falloff.addColorStop(1, 'rgba(15, 8, 4, 0)');
  ctx.fillStyle = falloff;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
}

function contact(scene, shadow, x, y, z, width, depth) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), shadow);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y + 0.003, z);
  scene.add(mesh);
}

function addCamera(scene) {
  const camera = new THREE.Group();
  camera.position.set(0.65, LOWER_BOARD, 0.13);
  camera.rotation.y = -0.09;
  scene.add(camera);

  const enamel = material('#20150e', { roughness: 0.31, metalness: 0.36 });
  const brass = material('#c18a3b', { roughness: 0.24, metalness: 0.74, envMapIntensity: 1.1 });
  const darkMetal = material('#382a1e', { roughness: 0.27, metalness: 0.82 });
  const optic = new THREE.MeshPhysicalMaterial({
    color: '#17110d', roughness: 0.14, metalness: 0.34, envMapIntensity: 1.4,
    clearcoat: 1, clearcoatRoughness: 0.10
  });
  const leatherCanvas = document.createElement('canvas');
  leatherCanvas.width = leatherCanvas.height = 128;
  const ctx = leatherCanvas.getContext('2d');
  ctx.fillStyle = '#1e1813';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 6400; i++) {
    ctx.fillStyle = i % 3 ? '#272017' : '#17120e';
    ctx.fillRect((i * 23) % 127, (i * 43 + Math.floor(i / 129) * 11) % 127, 2, 1);
  }
  const leatherMap = new THREE.CanvasTexture(leatherCanvas);
  leatherMap.colorSpace = THREE.SRGBColorSpace;
  const leather = material('#ffffff', { map: leatherMap, bumpMap: leatherMap, bumpScale: 0.009, roughness: 0.85 });
  block(camera, [1.28, 0.65, 0.56], [0, 0.334, -0.02], enamel);
  block(camera, [1.24, 0.41, 0.575], [0, 0.27, -0.013], leather);
  block(camera, [1.26, 0.026, 0.562], [0, 0.028, -0.02], brass);
  block(camera, [1.28, 0.034, 0.565], [0, 0.650, -0.02], brass);
  block(camera, [0.32, 0.128, 0.022], [-0.356, 0.552, 0.27], brass);
  block(camera, [0.278, 0.087, 0.023], [-0.356, 0.552, 0.284], optic);
  block(camera, [0.20, 0.116, 0.022], [0.365, 0.553, 0.27], brass);
  block(camera, [0.152, 0.071, 0.023], [0.365, 0.553, 0.284], optic);
  cylinder(camera, 0.136, 0.06, [0.43, 0.686, -0.04], darkMetal);
  cylinder(camera, 0.118, 0.019, [0.43, 0.723, -0.04], brass);
  cylinder(camera, 0.095, 0.055, [-0.45, 0.68, -0.035], brass);
  cylinder(camera, 0.045, 0.025, [0.236, 0.669, 0.11], brass);

  const lensX = 0.06;
  const lensY = 0.305;
  cylinder(camera, 0.286, 0.09, [lensX, lensY, 0.299], darkMetal, 'z');
  cylinder(camera, 0.246, 0.25, [lensX, lensY, 0.446], enamel, 'z');
  cylinder(camera, 0.248, 0.016, [lensX, lensY, 0.547], brass, 'z');
  cylinder(camera, 0.262, 0.059, [lensX, lensY, 0.589], darkMetal, 'z');
  const lensRim = new THREE.Mesh(new THREE.TorusGeometry(0.224, 0.011, 12, 64), brass);
  lensRim.position.set(lensX, lensY, 0.62);
  camera.add(lensRim);
  const engraving = document.createElement('canvas');
  engraving.width = engraving.height = 256;
  const marks = engraving.getContext('2d');
  marks.fillStyle = '#21160e';
  marks.fillRect(0, 0, 256, 256);
  marks.font = '500 11px sans-serif';
  marks.textAlign = 'center';
  marks.fillStyle = '#d2bb91';
  const scale = '  1 : 2.8   ·   50 MM   ·   1.5   2   3   5   ∞  ';
  Array.from(scale).forEach((character, index) => {
    marks.save();
    marks.translate(128, 128);
    marks.rotate(index * Math.PI * 2 / scale.length);
    marks.fillText(character, 0, -108);
    marks.restore();
  });
  const engraveMap = new THREE.CanvasTexture(engraving);
  engraveMap.colorSpace = THREE.SRGBColorSpace;
  const lettering = new THREE.Mesh(new THREE.RingGeometry(0.186, 0.224, 64),
    material('#ffffff', { map: engraveMap, roughness: 0.62 }));
  lettering.position.set(lensX, lensY, 0.621);
  camera.add(lettering);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), optic);
  glass.scale.set(0.186, 0.186, 0.047);
  glass.position.set(lensX, lensY, 0.602);
  camera.add(glass);
}

function addPolaroid(scene, photo) {
  photo.colorSpace = THREE.SRGBColorSpace;
  photo.anisotropy = 8;
  const stock = material('#d5ccbc', { roughness: 0.81 });
  const picture = new THREE.MeshPhysicalMaterial({ color: '#fff4e7', map: photo, roughness: 0.68, clearcoat: 0.19, clearcoatRoughness: 0.37 });
  const prop = new THREE.Group();
  prop.position.set(1.54, TOP_BOARD + 0.053, 0.52);
  prop.rotation.set(-0.18, -0.085, -0.086);
  scene.add(prop);
  block(prop, [1.20, 1.445, 0.019], [0, 0.723, 0], [stock, stock, stock, stock, picture, stock]);
}

function makeWood(map, rotation, repeatX, repeatY, roughness) {
  const grain = map.clone();
  grain.center.set(0.5, 0.5);
  grain.rotation = rotation;
  grain.repeat.set(repeatX, repeatY);
  grain.needsUpdate = true;
  return material('#ffffff', { map: grain, bumpMap: grain, bumpScale: 0.014, roughness });
}

function addShelf(scene, wood, { books, propTitles }, photo) {
  wood.colorSpace = THREE.SRGBColorSpace;
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.anisotropy = 8;
  const side = makeWood(wood, 0, 0.8, 1.15, 0.43);
  const board = makeWood(wood, Math.PI / 2, 0.58, 1.45, 0.42);
  const lip = makeWood(wood, 0, 1.3, 0.21, 0.43);
  const desk = makeWood(wood, 0, 3.5, 3.6, 0.49);
  const brass = material('#ad8650', { roughness: 0.28, metalness: 0.76 });
  const shadow = makeContactShadow();
  const pageTexture = makePageTexture();
  pageTexture.colorSpace = THREE.SRGBColorSpace;
  const pages = material('#fff4db', { map: pageTexture, roughness: 0.93 });

  block(scene, [29, 0.28, 17], [0, -0.14, 1.8], desk).castShadow = false;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), material('#856049', { roughness: 1 }));
  wall.position.set(0, 7, -1.38);
  wall.receiveShadow = true;
  scene.add(wall);
  for (const sideX of [-2.48, 2.48]) {
    block(scene, [0.17, 3.51, 1.38], [sideX, 1.755, -0.06], side);
    contact(scene, shadow, sideX, 0, -0.06, 0.68, 2.03);
  }
  for (const height of [LOWER_BOARD, TOP_BOARD]) {
    block(scene, [4.85, 0.169, 1.44], [0, height - 0.0845, -0.04], [board, board, board, board, lip, lip]);
    cylinder(scene, 0.028, 4.86, [0, height + 0.74, -0.61], brass, 'x');
  }
  block(scene, [4.88, 0.161, 0.115], [0, 3.393, -0.675], [board, board, board, board, lip, lip]);

  addBook(scene, {
    title: books[0].cleanTitle, imprint: '范冰', color: '#292523', ink: '#f3e4cc', accent: '#9a4935',
    size: [0.35, 2.26, 1.09], at: [-2.18, TOP_BOARD, 0.02]
  }, pages);
  addBook(scene, {
    title: books[1].cleanTitle, imprint: '陈嘉映', color: '#d6b991', ink: '#3a2b21', accent: '#965645',
    size: [0.33, 2.13, 1.05], at: [-1.827, TOP_BOARD, -0.015]
  }, pages);
  addBook(scene, {
    title: books[2].cleanTitle, imprint: '麦克法伦', color: '#adbdc3', ink: '#2d3739', accent: '#667470',
    size: [0.37, 2.33, 1.03], at: [-1.456, TOP_BOARD, 0.027]
  }, pages);
  addBook(scene, {
    title: propTitles.folio, color: '#b96c47', ink: '#694933', english: true,
    size: [0.35, 2.19, 0.98], at: [-1.06, TOP_BOARD, -0.032]
  }, pages);
  addBook(scene, {
    title: propTitles.olive, color: '#48513b', ink: '#c3b077', english: true, horizontal: true,
    size: [1.68, 0.22, 0.95], at: [-1.38, LOWER_BOARD, 0.085]
  }, pages);
  addBook(scene, {
    title: propTitles.cream, color: '#bdab91', ink: '#786148', english: true, horizontal: true, printCover: true,
    size: [1.59, 0.20, 0.90], at: [-1.39, LOWER_BOARD + 0.22, 0.036]
  }, pages);

  contact(scene, shadow, -1.55, TOP_BOARD, -0.015, 2.16, 1.57);
  contact(scene, shadow, -1.37, LOWER_BOARD, 0.08, 2.1, 1.49);
  contact(scene, shadow, 0.65, LOWER_BOARD, 0.16, 1.62, 1.07);
  contact(scene, shadow, 1.52, TOP_BOARD, 0.47, 1.36, 0.51);
  addCamera(scene);
  addPolaroid(scene, photo);
}

function addLighting(scene, renderer) {
  scene.add(new THREE.HemisphereLight('#e9dbcd', '#6a493c', 1.60));
  const key = new THREE.DirectionalLight('#ffe2bf', 2.25);
  key.position.set(-3.8, 7.1, 5.5);
  key.target.position.set(-0.10, 2.08, -0.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -4.3, right: 4.3, top: 4, bottom: -4, near: 1, far: 17 });
  key.shadow.normalBias = 0.012;
  key.shadow.bias = -0.00018;
  key.shadow.radius = 17;
  key.shadow.blurSamples = 16;
  key.shadow.camera.updateProjectionMatrix();
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight('#e3d9cb', 0.68);
  fill.position.set(3.4, 3.3, 7.5);
  scene.add(fill);

  // A window and warm bounce card give the brass and lens soft reflections.
  const lightroom = new THREE.Scene();
  lightroom.background = new THREE.Color('#483b34');
  for (const [color, multiplier, size, position] of [
    ['#fbe9d6', 2.8, [3, 4], [-3, 4, 4]],
    ['#d6e5ff', 1.25, [1.6, 3.7], [2, 2.5, 4]],
    ['#eda968', 1.7, [4, 1.9], [0, 5, -2]]
  ]) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(multiplier) }));
    panel.position.set(...position);
    panel.lookAt(0, 1.6, 0);
    lightroom.add(panel);
  }
  const generator = new THREE.PMREMGenerator(renderer);
  const reflections = generator.fromScene(lightroom, 0.034);
  generator.dispose();
  lightroom.traverse((item) => {
    item.geometry?.dispose();
    item.material?.dispose();
  });
  scene.environment = reflections.texture;
  scene.environmentIntensity = 0.55;
  return reflections;
}

function makeFocusPass(camera) {
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: 4,
    depthTexture: new THREE.DepthTexture(1, 1)
  });
  const surface = new THREE.ShaderMaterial({
    uniforms: {
      sceneColor: { value: target.texture },
      sceneDepth: { value: target.depthTexture },
      pixel: { value: new THREE.Vector2() },
      nearPlane: { value: camera.near },
      farPlane: { value: camera.far },
      focusFar: { value: 0 }
    },
    vertexShader: `
      varying vec2 screenUV;
      void main() {
        screenUV = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D sceneColor;
      uniform sampler2D sceneDepth;
      uniform vec2 pixel;
      uniform float nearPlane;
      uniform float farPlane;
      uniform float focusFar;
      varying vec2 screenUV;

      float distanceAt(vec2 uv) {
        float z = texture2D(sceneDepth, uv).x;
        return nearPlane * farPlane / (farPlane - z * (farPlane - nearPlane));
      }

      void main() {
        vec3 color = texture2D(sceneColor, screenUV).rgb;
        float distance = distanceAt(screenUV);
        float blur = smoothstep(focusFar, focusFar + 0.65, distance);
        if (blur > 0.01) {
          vec3 sum = color;
          float weight = 1.0;
          for (int i = 0; i < 8; i++) {
            float angle = float(i) * 0.785398;
            vec2 uv = screenUV + vec2(cos(angle), sin(angle)) * pixel * blur * 8.0;
            float sampleWeight = smoothstep(focusFar - 0.15, focusFar + 0.45, distanceAt(uv));
            sum += texture2D(sceneColor, uv).rgb * sampleWeight;
            weight += sampleWeight;
          }
          color = sum / weight;
        }
        vec2 edge = (screenUV - vec2(0.46, 0.56)) * vec2(1.13, 1.02);
        color *= 1.0 - 0.34 * smoothstep(0.19, 0.79, length(edge));
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    depthTest: false,
    depthWrite: false
  });
  const screen = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), surface);
  quad.frustumCulled = false;
  screen.add(quad);
  const screenCamera = new THREE.Camera();

  return {
    resize(width, height) {
      target.setSize(width, height);
      surface.uniforms.pixel.value.set(1 / width, 1 / height);
    },
    render(renderer, scene, focusFar) {
      surface.uniforms.focusFar.value = focusFar;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(screen, screenCamera);
    },
    dispose() {
      target.dispose();
      surface.dispose();
      quad.geometry.dispose();
    }
  };
}

function disposeScene(scene) {
  const resources = new Set();
  scene.traverse((item) => {
    if (!item.isMesh) return;
    resources.add(item.geometry);
    for (const surface of [item.material].flat()) {
      resources.add(surface);
      for (const value of Object.values(surface)) {
        if (value?.isTexture) resources.add(value);
      }
    }
  });
  resources.forEach((resource) => resource.dispose());
}

export async function createShelfView(viewport, assetUrl, shelfData, signal) {
  const textureLoader = new THREE.TextureLoader();
  const [wood, photo] = await Promise.all([
    textureLoader.loadAsync(WOOD_URL),
    textureLoader.loadAsync(assetUrl('notebook/shelf-polaroid-texture.png'))
  ]);
  if (signal.aborted) {
    wood.dispose();
    photo.dispose();
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#76503a');
  const camera = new THREE.PerspectiveCamera(33, 1, 0.10, 26);
  const focus = makeFocusPass(camera);
  const reflections = addLighting(scene, renderer);
  addShelf(scene, wood, shelfData, photo);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const target = new THREE.Vector2();
  const orbit = new THREE.Vector2();
  const subject = new THREE.Vector3(0, 2.21, 0.05);
  let start;
  let raf = 0;
  let distance = 9.6;
  let disposed = false;

  function draw(time) {
    raf = 0;
    if (disposed) return;
    start ??= time;
    const elapsed = reducedMotion.matches ? 1 : Math.min((time - start) / 750, 1);
    const approach = (1 - elapsed) ** 3;
    orbit.lerp(target, reducedMotion.matches ? 1 : 0.15);
    camera.position.set(
      0.55 + orbit.x * 0.78 + approach * 0.47,
      3.04 + orbit.y * 0.38 + approach * 0.18,
      distance + approach * 1.65
    );
    camera.lookAt(subject);
    focus.render(renderer, scene, camera.position.z + 0.67);
    if (elapsed < 1 || orbit.distanceToSquared(target) > 0.00002) schedule();
  }

  function schedule() {
    if (!raf && !disposed) raf = requestAnimationFrame(draw);
  }

  const pixels = new THREE.Vector2();
  function resize() {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, 2150 / Math.max(width, height)));
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(pixels);
    focus.resize(pixels.x, pixels.y);
    camera.aspect = width / height;
    distance = Math.max(8.75, 5.65 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    camera.updateProjectionMatrix();
    schedule();
  }

  function onMove(event) {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = viewport.getBoundingClientRect();
    target.set(
      THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
      THREE.MathUtils.clamp(1 - ((event.clientY - rect.top) / rect.height) * 2, -1, 1)
    );
    schedule();
  }

  function centerView() {
    target.set(0, 0);
    schedule();
  }

  const observer = new ResizeObserver(resize);
  viewport.replaceChildren(renderer.domElement);
  viewport.dataset.shelfRenderer = 'webgl';
  viewport.addEventListener('pointermove', onMove);
  viewport.addEventListener('pointerleave', centerView);
  reducedMotion.addEventListener('change', centerView);
  observer.observe(viewport);
  resize();

  signal.addEventListener('abort', () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    viewport.removeEventListener('pointermove', onMove);
    viewport.removeEventListener('pointerleave', centerView);
    reducedMotion.removeEventListener('change', centerView);
    renderer.domElement.remove();
    focus.dispose();
    reflections.dispose();
    wood.dispose();
    scene.traverse((item) => item.shadow?.dispose());
    disposeScene(scene);
    renderer.dispose();
    renderer.forceContextLoss();
  }, { once: true });
}
