/**
 * Lulu Interactive Vintage Studio — Living 3D/2.5D Room Stage & Atmospheric Engine
 * File: studio-room.js
 *
 * Responsibilities:
 *   1. Fast (<650ms) CRT/Studio preloader curtain ("LU STUDIO // ROOM 01")
 *   2. Dynamic ./assets/scene/scene_hotspots.json loader with inline fallback
 *   3. Raytraced Dual-Lighting controller (hero_lamp_on_v4.png <-> hero_lamp_off_v3.png + CSS fallback)
 *   4. Damped ±10px rAF mouse parallax (auto-sleeping & prefers-reduced-motion aware)
 *   5. Lightweight 60fps <canvas> atmosphere (Window Rain + 18 Lamp Dust Motes + CRT Shimmer)
 *   6. Smooth CSS 3D camera fly-to + close-up render crossfade -> LuluStudioUI.openStation()
 *   7. Top/Bottom Felix-inspired HUD, keyboard shortcuts [1-5, L, ESC], and <=820px vertical mode
 */

import { LuluStudioUI } from './studio-overlays.js?v=8';

const SCENE_BASE = './assets/scene/';
const HOTSPOTS_URL = `${SCENE_BASE}scene_hotspots.json?v=8`;
const LAMP_OFF_URL = `${SCENE_BASE}hero_lamp_off_v3.png`;
const USE_NATIVE_LAMP_OFF = false;

/* Verbatim inline fallback from scene_hotspots.json so file:// or offline loads never fail */
const FALLBACK_SCENE_HOTSPOTS = {
  hero_resolution: [2560, 1440],
  coordinate_space: 'normalized_top_left_0_to_1',
  camera: {
    name: 'Cam_Hero_Master',
    location: [-0.01, -2.08, 1.25],
    rotation_euler_deg: [84.05, -0.0, 0.0],
    focal_length_mm: 35.0
  },
  hotspots: {
    notebook: {
      label: 'About / 自我介绍',
      collection: 'Hotspot_01_Notebook',
      closeup_render: 'cam_notebook.jpg',
      bbox_top_left: [0.3947, 0.7088, 0.5903, 0.818],
      center_top_left: [0.4925, 0.7634],
      bbox_css_pct: { left: '39.47%', top: '70.88%', width: '19.57%', height: '10.92%' }
    },
    tv: {
      label: '01 / Marketing Work',
      collection: 'Hotspot_02_TV',
      closeup_render: 'cam_tv.jpg',
      bbox_top_left: [0.1874, 0.438, 0.355, 0.7402],
      center_top_left: [0.2712, 0.5891],
      bbox_css_pct: { left: '18.74%', top: '43.80%', width: '16.75%', height: '30.21%' }
    },
    newspaper: {
      label: '02 / Journalism',
      collection: 'Hotspot_03_Newspaper',
      closeup_render: 'cam_newspaper.jpg',
      bbox_top_left: [0.67, 0.04, 0.995, 0.51],
      center_top_left: [0.8325, 0.275],
      bbox_css_pct: { left: '67%', top: '4%', width: '32.5%', height: '47%' }
    },
    shelf: {
      label: '03 / Shelf',
      collection: 'Hotspot_04_Shelf',
      closeup_render: null,
      bbox_top_left: [0.36, 0.34, 0.58, 0.70],
      center_top_left: [0.47, 0.52],
      bbox_css_pct: { left: '36%', top: '34%', width: '22%', height: '36%' }
    },
    typewriter: {
      label: '04 / Contact',
      collection: 'Hotspot_05_Typewriter',
      closeup_render: 'cam_typewriter.jpg',
      bbox_top_left: [0.7817, 0.5841, 0.9785, 0.8231],
      center_top_left: [0.8801, 0.7036],
      bbox_css_pct: { left: '78.17%', top: '58.41%', width: '19.68%', height: '23.90%' }
    },
    poster: {
      label: 'Working Principles / 价值观信条',
      collection: 'Hotspot_07_Poster',
      closeup_render: 'cam_poster.jpg',
      bbox_top_left: [0.6847, 0.0858, 0.8304, 0.4172],
      center_top_left: [0.7575, 0.2515],
      bbox_css_pct: { left: '68.47%', top: '8.58%', width: '14.56%', height: '33.14%' }
    },
    lamp: {
      label: 'Toggle Studio Desk Lamp',
      collection: 'Hotspot_06_Lamp',
      closeup_render: null,
      bbox_top_left: [0.1214, 0.2724, 0.1985, 0.754],
      center_top_left: [0.1599, 0.5132],
      bbox_css_pct: { left: '12.14%', top: '27.24%', width: '7.71%', height: '48.15%' }
    }
  }
};

/* Archival Floating Tag Metadata (Section 10 — crisp tactile hover labels) */
const HOTSPOT_TAG_META = {
  notebook: {
    index: '01',
    title: '笔记本 / About',
    aria: '01 · 打开中央工作笔记本（About / 自我介绍）',
    shortcut: '1'
  },
  tv: {
    index: '02',
    title: '电视机 / Marketing',
    aria: '02 · 打开复古电视机（01 / Marketing Work）',
    shortcut: '2'
  },
  newspaper: {
    index: '03',
    title: '报纸 / Journalism',
    aria: '03 · 放大阅读墙面报纸（02 / Journalism）',
    shortcut: '3',
    tagPos: 'inside-top'
  },
  shelf: {
    index: '04',
    title: '双层书架 / Shelf',
    aria: '04 · 浏览两层胡桃木书架（03 / Shelf）',
    shortcut: '4'
  },
  typewriter: {
    index: '05',
    title: '打字机 / Contact',
    aria: '05 · 使用打字机留言（04 / Contact）',
    shortcut: '5',
    tagAlign: 'right'
  },
  poster: {
    index: '06',
    title: '工作信条海报 / Values',
    aria: '06 · 打开墙面工作信条海报（Working Values & Side Projects）',
    shortcut: '6',
    tagPos: 'inside-top'
  },
  lamp: {
    index: 'LIGHT',
    title: '台灯开关 / Lamp',
    aria: '切换桌面橙色台灯灯光开关（快捷键 L）',
    shortcut: 'L'
  }
};

const HOTSPOT_ORDER = ['notebook', 'tv', 'newspaper', 'shelf', 'typewriter', 'lamp'];
const KEY_TO_STATION = {
  '1': 'notebook',
  '2': 'tv',
  '3': 'newspaper',
  '4': 'shelf',
  '5': 'typewriter',
  '6': 'poster'
};

function isReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function isMobileViewport() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 820px)').matches
  );
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/* ==========================================================================
   LIGHTWEIGHT 60FPS ATMOSPHERIC CANVAS ENGINE (<1% CPU)
   - Left Window Night Glass: Diagonal rain streaks + slow sliding droplets
   - Luxo Lamp Warm Cone: 18 golden dust motes drifting lazily when Lamp ON
   - Desk CRT TV Screen: Subtle phosphor scanline roll & micro-flicker
   ========================================================================== */
class StudioAtmosphereEngine {
  constructor(canvas, getRoomState) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
    this.getRoomState = getRoomState;

    this.width = 1280;
    this.height = 720;
    this.running = false;
    this.rafId = 0;
    this.lastTs = 0;
    this.lampGlow = 1;

    this.windowClipPath = null;
    this.rainStreaks = [];
    this.glassDrops = [];
    this.dustMotes = [];

    if (this.ctx) {
      this._buildWindowMask();
      this._seedParticles();
    }
  }

  _buildWindowMask() {
    if (typeof Path2D === 'undefined') return;
    const W = this.width;
    const H = this.height;
    const p = new Path2D();

    /* Add the 4 night window glass panes cleanly between wooden mullions */
    const panes = [
      [0.064, 0.012, 0.205, 0.152], // top-left pane
      [0.218, 0.012, 0.319, 0.152], // top-right pane
      [0.064, 0.171, 0.205, 0.592], // bottom-left pane
      [0.218, 0.171, 0.319, 0.444]  // bottom-right pane above CRT TV top
    ];

    for (const [x0, y0, x1, y1] of panes) {
      p.rect(x0 * W, y0 * H, (x1 - x0) * W, (y1 - y0) * H);
    }

    /* Subtract foreground potted plant foliage & orange Luxo lamp head via evenodd rule */
    p.rect(0.055 * W, 0.435 * H, 0.068 * W, 0.17 * H);
    p.moveTo((0.193 + 0.052) * W, 0.406 * H);
    p.arc(0.193 * W, 0.406 * H, 0.052 * W, 0, Math.PI * 2, true);

    this.windowClipPath = p;
  }

  _seedParticles() {
    const W = this.width;
    const H = this.height;

    /* 38 diagonal rain streaks across night window glass */
    this.rainStreaks = Array.from({ length: 38 }, (_, i) => ({
      x: (0.065 + ((i * 0.618034) % 1) * 0.255) * W,
      y: (((i * 0.381966) % 1) * 0.6) * H,
      len: 14 + (i % 5) * 5,
      speed: 310 + (i % 7) * 34,
      alpha: 0.07 + (i % 4) * 0.028
    }));

    /* 8 slow-sliding condensation raindrops on glass */
    this.glassDrops = Array.from({ length: 8 }, (_, i) => ({
      x: (0.078 + ((i * 0.29 + 0.07) % 0.23)) * W,
      y: (0.04 + ((i * 0.43) % 0.5)) * H,
      speed: 14 + (i % 4) * 5.5,
      wobblePhase: i * 1.7,
      trail: 12 + (i % 3) * 7,
      radius: 1.2 + (i % 2) * 0.45,
      alpha: 0.16 + (i % 3) * 0.05
    }));

    /* 18 warm golden dust motes floating inside Luxo lamp cone */
    this.dustMotes = Array.from({ length: 18 }, (_, i) => ({
      u: (i + 0.5) / 18,
      v: (i * 0.618034) % 1,
      phase: i * 0.92,
      driftSpeed: 0.28 + (i % 5) * 0.07,
      size: 1.05 + (i % 3) * 0.48,
      peakAlpha: 0.22 + (i % 4) * 0.08
    }));
  }

  syncRunState() {
    if (!this.ctx) return;
    const st = this.getRoomState();
    const shouldRun =
      !document.hidden &&
      !isReducedMotion() &&
      !isMobileViewport() &&
      !st.stationFullyCovered;

    if (shouldRun && !this.running) {
      this.running = true;
      this.lastTs = performance.now();
      this.rafId = requestAnimationFrame((ts) => this._tick(ts));
    } else if (!shouldRun && this.running) {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  _tick(ts) {
    if (!this.running || !this.ctx) return;
    const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
    this.lastTs = ts;

    const st = this.getRoomState();
    const targetLamp = st.lampOn ? 1 : 0;
    this.lampGlow += (targetLamp - this.lampGlow) * Math.min(1, dt * 6.5);

    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;
    ctx.clearRect(0, 0, W, H);

    this._drawWindowRain(ctx, W, H, dt, ts * 0.001);
    if (this.lampGlow > 0.01) {
      this._drawLampDustMotes(ctx, W, H, dt, ts * 0.001);
    }
    this._drawCrtShimmer(ctx, W, H, ts * 0.001, st.tvBbox);

    this.rafId = requestAnimationFrame((nextTs) => this._tick(nextTs));
  }

  _drawWindowRain(ctx, W, H, dt, tSec) {
    ctx.save();
    if (this.windowClipPath) {
      ctx.clip(this.windowClipPath, 'evenodd');
    } else {
      ctx.beginPath();
      ctx.rect(0.064 * W, 0.012 * H, 0.255 * W, 0.58 * H);
      ctx.clip();
    }

    /* 1. Fine diagonal night rain streaks (~12.5 deg wind slant) */
    const slantX = -0.22;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    const minX = 0.062 * W;
    const maxX = 0.324 * W;
    const maxY = 0.605 * H;

    for (let i = 0; i < this.rainStreaks.length; i += 1) {
      const r = this.rainStreaks[i];
      r.y += r.speed * dt;
      r.x += r.speed * slantX * dt;

      if (r.y > maxY || r.x < minX - 18) {
        r.y = 0.008 * H - (i % 14);
        r.x = minX + (((r.x - minX + 0.31 * W) % (maxX - minX)) + (maxX - minX)) % (maxX - minX);
      }

      ctx.strokeStyle = `rgba(196, 218, 244, ${r.alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + r.len * slantX, r.y + r.len);
      ctx.stroke();
    }

    /* 2. Occasional slow-sliding raindrop trails on window glass */
    for (let i = 0; i < this.glassDrops.length; i += 1) {
      const d = this.glassDrops[i];
      const pauseFactor = 0.45 + 0.55 * Math.max(0, Math.sin(tSec * 0.9 + d.wobblePhase));
      d.y += d.speed * pauseFactor * dt;
      d.x += Math.sin(tSec * 1.4 + d.wobblePhase) * 3.2 * dt;

      if (d.y > maxY) {
        d.y = 0.025 * H;
        d.x = (0.072 + ((i * 0.031 + (tSec * 0.013)) % 0.235)) * W;
      }

      const grad = ctx.createLinearGradient(d.x, d.y - d.trail, d.x, d.y);
      grad.addColorStop(0, 'rgba(205, 222, 245, 0)');
      grad.addColorStop(1, `rgba(215, 230, 248, ${(d.alpha * 0.65).toFixed(3)})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y - d.trail);
      ctx.lineTo(d.x, d.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(235, 242, 255, ${d.alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawLampDustMotes(ctx, W, H, dt, tSec) {
    /* Warm Luxo light cone fanning from shade apex (0.193, 0.405) down across desk */
    const apexX = 0.193 * W;
    const apexY = 0.405 * H;

    ctx.save();
    /* Soft atmospheric beam breath */
    const beamBreath = (0.036 + 0.008 * Math.sin(tSec * 1.2)) * this.lampGlow;
    const beamGrad = ctx.createRadialGradient(
      apexX + 18,
      apexY + 46,
      8,
      apexX + 42,
      apexY + 135,
      215
    );
    beamGrad.addColorStop(0, `rgba(255, 198, 112, ${(beamBreath * 1.4).toFixed(4)})`);
    beamGrad.addColorStop(0.55, `rgba(255, 184, 96, ${beamBreath.toFixed(4)})`);
    beamGrad.addColorStop(1, 'rgba(255, 180, 90, 0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(apexX - 18, apexY + 6);
    ctx.lineTo(apexX + 26, apexY - 2);
    ctx.lineTo(0.365 * W, 0.77 * H);
    ctx.lineTo(0.095 * W, 0.75 * H);
    ctx.closePath();
    ctx.fill();

    /* 18 tiny warm golden dust motes drifting lazily in the beam */
    for (let i = 0; i < this.dustMotes.length; i += 1) {
      const m = this.dustMotes[i];
      m.v -= m.driftSpeed * 0.035 * dt;
      if (m.v < 0) m.v += 1;

      const spread = 0.18 + m.v * 0.82;
      const coneLeft = apexX - 12 - spread * 95;
      const coneRight = apexX + 20 + spread * 175;
      const sway = Math.sin(tSec * (0.55 + m.driftSpeed) + m.phase) * 0.08;
      const uClamped = clamp(m.u + sway, 0.06, 0.94);

      const x = coneLeft + (coneRight - coneLeft) * uClamped;
      const y = apexY + 14 + m.v * (0.34 * H) + Math.cos(tSec * 0.7 + m.phase) * 5;

      const edgeFade = Math.sin(m.v * Math.PI) * Math.sin(uClamped * Math.PI);
      const twinkle = 0.72 + 0.28 * Math.sin(tSec * 1.9 + m.phase * 2.1);
      const alpha = m.peakAlpha * edgeFade * twinkle * this.lampGlow;

      if (alpha > 0.015) {
        ctx.fillStyle = `rgba(255, 224, 158, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, m.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _drawCrtShimmer(ctx, W, H, tSec, tvBbox) {
    /* Map inner phosphor glass screen inside the CRT TV monitor */
    const bx = tvBbox || [0.186, 0.4472, 0.354, 0.7507];
    const bw = bx[2] - bx[0];
    const bh = bx[3] - bx[1];

    const sx = (bx[0] + bw * 0.102) * W;
    const sy = (bx[1] + bh * 0.102) * H;
    const sw = bw * 0.785 * W;
    const sh = bh * 0.574 * H;

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(sx, sy, sw, sh, 6);
    } else {
      ctx.rect(sx, sy, sw, sh);
    }
    ctx.clip();

    /* Subtle CRT phosphor micro-flicker */
    const flicker = 0.018 + 0.012 * Math.sin(tSec * 19.0) * Math.cos(tSec * 7.3);
    if (flicker > 0.005) {
      ctx.fillStyle = `rgba(178, 236, 255, ${flicker.toFixed(4)})`;
      ctx.fillRect(sx, sy, sw, sh);
    }

    /* Slow rolling CRT vertical sync refresh band */
    const bandHeight = sh * 0.26;
    const rollY = sy - bandHeight + (((tSec * 0.28) % 1) * (sh + bandHeight * 2));
    const rollGrad = ctx.createLinearGradient(0, rollY, 0, rollY + bandHeight);
    rollGrad.addColorStop(0, 'rgba(190, 245, 225, 0)');
    rollGrad.addColorStop(0.5, 'rgba(190, 245, 225, 0.048)');
    rollGrad.addColorStop(1, 'rgba(190, 245, 225, 0)');
    ctx.fillStyle = rollGrad;
    ctx.fillRect(sx, rollY, sw, bandHeight);

    /* Subtle horizontal scanline shimmer every 3px */
    ctx.fillStyle = 'rgba(10, 14, 16, 0.08)';
    for (let y = sy + ((Math.floor(tSec * 24) % 3)); y < sy + sh; y += 3) {
      ctx.fillRect(sx, y, sw, 1);
    }

    ctx.restore();
  }
}

/* ==========================================================================
   MAIN LIVING STUDIO ROOM CONTROLLER
   ========================================================================== */
class LuluStudioRoomController {
  constructor() {
    this.hotspotsData = FALLBACK_SCENE_HOTSPOTS;
    this.lampOn = true;
    this.hasNativeLampOff = false;
    this.lampOffProbed = false;

    this.activeStation = null;
    this.isZoomed = false;
    this.stationFullyCovered = false;

    this.pendingOpenTimer = null;
    this.pendingBackdropTimer = null;
    this.pendingCoverTimer = null;
    this.pendingWhipTimer = null;

    /* 35mm Handheld Camera Rig (Pronounced Mouse Sway + Organic Breathing + Spring Whip Shake) */
    this.camRig = {
      targetX: 0,
      targetY: 0,
      targetRotX: 0,
      targetRotY: 0,
      targetRotZ: 0,
      curX: 0,
      curY: 0,
      curRotX: 0,
      curRotY: 0,
      curRotZ: 0,
      /* Damped harmonic spring oscillator for whip-pan & camera shake jolts */
      joltX: 0,
      joltY: 0,
      joltRot: 0,
      velX: 0,
      velY: 0,
      velRot: 0,
      running: false,
      rafId: 0,
      lastTs: 0
    };

    /* DOM refs */
    this.preloaderEl = document.getElementById('luRoomPreloader');
    this.preloaderFillEl = document.getElementById('luPreloaderFill');
    this.preloaderPctEl = document.getElementById('luPreloaderPct');

    this.viewportEl = document.getElementById('luRoomViewport');
    this.parallaxRigEl = document.getElementById('luParallaxRig');
    this.roomFrameEl = document.getElementById('luRoomFrame');
    this.heroOnEl = document.getElementById('luHeroLampOn');
    this.heroOffEl = document.getElementById('luHeroLampOff');
    this.mobileHeroOffEl = document.getElementById('luMobileHeroLampOff');
    this.hotspotLayerEl = document.getElementById('luHotspotLayer');

    this.closeupBackdropEl = document.getElementById('luCloseupBackdrop');
    this.closeupImgEl = document.getElementById('luCloseupImg');

    this.brandHomeBtn = document.getElementById('luBrandHomeBtn');
    this.backToDeskBtn = document.getElementById('luBackToDeskBtn');
    this.lampToggleBtn = document.getElementById('luLampToggleBtn');
    this.lampStateTextEl = document.getElementById('luLampStateText');
    this.mobileLampBtn = document.getElementById('luMobileLampBtn');
    this.mobileLampLabelEl = document.getElementById('luMobileLampLabel');

    this.atmosphere = new StudioAtmosphereEngine(
      document.getElementById('luAtmosphereCanvas'),
      () => ({
        lampOn: this.lampOn,
        stationFullyCovered: this.stationFullyCovered,
        tvBbox:
          this.hotspotsData &&
          this.hotspotsData.hotspots &&
          this.hotspotsData.hotspots.tv &&
          this.hotspotsData.hotspots.tv.bbox_top_left
      })
    );
  }

  init() {
    this._runBootPreloader();
    this._renderHotspots();
    this._renderShelfTitles();
    this._loadDynamicHotspots();
    this._probeNativeLampOffImage();
    this._bindEvents();

    /* Initialize 6-Station Inspection Engine seamlessly */
    LuluStudioUI.init({
      mountHUD: false,
      onStationOpen: (stationId, detail) => this._handleStationOpenFromEngine(stationId, detail),
      onStationClose: (prevStation) => this._handleStationCloseFromEngine(prevStation)
    });

    this.atmosphere.syncRunState();
    this._syncHandheldLoopState();
    this._preloadStationCloseupsIdle();
  }

  _renderShelfTitles() {
    const { folio, cream, olive } = LuluStudioUI.data.SHELF_DATA.propTitles;
    const labels = { folio, cream, olive, cover: cream };
    document.querySelectorAll('.lu-room-book-titles').forEach((layer) => {
      layer.replaceChildren(...Object.entries(labels).map(([position, title]) => {
        const label = document.createElement('span');
        label.className = `lu-room-book-title lu-room-book-title--${position}`;
        label.textContent = title;
        return label;
      }));
    });
  }

  /* ------------------------------------------------------------------------
     1. FAST (<650ms) STUDIO BOOT PRELOADER
     ------------------------------------------------------------------------ */
  _runBootPreloader() {
    if (!this.preloaderEl) return;

    if (isReducedMotion()) {
      this._finishBootPreloader();
      return;
    }

    requestAnimationFrame(() => {
      if (this.preloaderFillEl) this.preloaderFillEl.style.width = '78%';
      if (this.preloaderPctEl) this.preloaderPctEl.textContent = 'READY';
    });

    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      if (this.preloaderFillEl) this.preloaderFillEl.style.width = '100%';
      setTimeout(() => this._finishBootPreloader(), 110);
    };

    /* Guarantee boot fade starts well under 420ms so total curtain clears <650ms */
    const maxBootTimer = setTimeout(complete, 390);

    if (this.heroOnEl && this.heroOnEl.complete && this.heroOnEl.naturalWidth > 0) {
      clearTimeout(maxBootTimer);
      setTimeout(complete, 220);
    } else if (this.heroOnEl) {
      this.heroOnEl.addEventListener(
        'load',
        () => {
          clearTimeout(maxBootTimer);
          setTimeout(complete, 150);
        },
        { once: true }
      );
    }
  }

  _finishBootPreloader() {
    document.body.classList.remove('is-booting');
    if (this.preloaderEl) {
      this.preloaderEl.classList.add('is-done');
      this.preloaderEl.setAttribute('aria-hidden', 'true');
    }
  }

  /* ------------------------------------------------------------------------
     2. DYNAMIC HOTSPOTS LOADER (Pass 2 auto-compatible)
     ------------------------------------------------------------------------ */
  async _loadDynamicHotspots() {
    try {
      const res = await fetch(HOTSPOTS_URL, { cache: 'no-cache' });
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.hotspots && typeof json.hotspots === 'object') {
        this.hotspotsData = {
          ...FALLBACK_SCENE_HOTSPOTS,
          ...json,
          hotspots: {
            ...FALLBACK_SCENE_HOTSPOTS.hotspots,
            ...json.hotspots
          }
        };
        this._renderHotspots();
        if (this.activeStation && !isMobileViewport()) {
          this._applyCameraZoomToHotspot(this.activeStation);
        }
      }
    } catch (_) {
      /* Gracefully retain FALLBACK_SCENE_HOTSPOTS (e.g. file:// protocol) */
    }
  }

  _renderHotspots() {
    if (!this.hotspotLayerEl || !this.hotspotsData || !this.hotspotsData.hotspots) return;

    const hsMap = this.hotspotsData.hotspots;
    const frag = document.createDocumentFragment();

    for (const id of HOTSPOT_ORDER) {
      const item = hsMap[id];
      const meta = HOTSPOT_TAG_META[id];
      if (!item || !meta) continue;

      const cssPct = item.bbox_css_pct || this._bboxToCssPct(item.bbox_top_left);
      if (!cssPct) continue;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lu-hotspot-btn';
      btn.dataset.hotspotId = id;
      if (meta.tagPos) btn.dataset.tagPos = meta.tagPos;
      if (meta.tagAlign) btn.dataset.tagAlign = meta.tagAlign;

      btn.style.left = cssPct.left;
      btn.style.top = cssPct.top;
      btn.style.width = cssPct.width;
      btn.style.height = cssPct.height;
      btn.setAttribute('aria-label', meta.aria);

      const titleText =
        id === 'lamp'
          ? `台灯开关 / Lamp (${this.lampOn ? 'ON' : 'OFF'})`
          : meta.title;

      btn.innerHTML = `
        <span class="lu-hotspot-aura" aria-hidden="true"></span>
        <span class="lu-hotspot-beacon" aria-hidden="true"></span>
        <span class="lu-hotspot-tag" aria-hidden="true">
          <span class="lu-tag-num">${meta.index}</span>
          <span class="lu-tag-sep">·</span>
          <span class="lu-tag-title" data-hotspot-title="${id}">${titleText}</span>
        </span>
      `;

      frag.appendChild(btn);
    }

    this.hotspotLayerEl.innerHTML = '';
    this.hotspotLayerEl.appendChild(frag);
  }

  _bboxToCssPct(bbox) {
    if (!Array.isArray(bbox) || bbox.length < 4) return null;
    const [x0, y0, x1, y1] = bbox;
    return {
      left: `${(x0 * 100).toFixed(2)}%`,
      top: `${(y0 * 100).toFixed(2)}%`,
      width: `${((x1 - x0) * 100).toFixed(2)}%`,
      height: `${((y1 - y0) * 100).toFixed(2)}%`
    };
  }

  /* ------------------------------------------------------------------------
     3. RAYTRACED DUAL-LIGHTING CONTROLLER (Lamp ON/OFF)
     ------------------------------------------------------------------------ */
  _probeNativeLampOffImage() {
    if (this.hasNativeLampOff || !USE_NATIVE_LAMP_OFF) {
      this.lampOffProbed = true;
      return;
    }
    const probe = new Image();
    probe.onload = () => {
      this.hasNativeLampOff = true;
      this.lampOffProbed = true;
      if (this.heroOffEl) {
        this.heroOffEl.src = LAMP_OFF_URL;
        this.heroOffEl.hidden = false;
      }
      if (this.mobileHeroOffEl) {
        this.mobileHeroOffEl.src = LAMP_OFF_URL;
        this.mobileHeroOffEl.hidden = false;
      }
      document.body.classList.add('has-native-lamp-off');
    };
    probe.onerror = () => {
      this.lampOffProbed = true;
    };
    probe.src = LAMP_OFF_URL;
  }

  toggleLamp(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !this.lampOn;
    this.lampOn = next;

    /* Re-probe once on toggle in case Pass 2 wrote hero_lamp_off_v2.png after page boot */
    if (!next && !this.hasNativeLampOff) {
      this._probeNativeLampOffImage();
    }

    document.body.dataset.lamp = next ? 'on' : 'off';

    const stateLabel = next ? 'LAMP: ON' : 'LAMP: OFF';
    const shortLabel = next ? 'LAMP ON' : 'LAMP OFF';

    if (this.lampStateTextEl) this.lampStateTextEl.textContent = stateLabel;
    if (this.lampToggleBtn) this.lampToggleBtn.setAttribute('aria-pressed', String(next));

    if (this.mobileLampLabelEl) this.mobileLampLabelEl.textContent = shortLabel;
    if (this.mobileLampBtn) this.mobileLampBtn.setAttribute('aria-pressed', String(next));

    const lampHotspotTitle = this.hotspotLayerEl
      ? this.hotspotLayerEl.querySelector('[data-hotspot-title="lamp"]')
      : null;
    if (lampHotspotTitle) {
      lampHotspotTitle.textContent = `台灯开关 / Lamp (${next ? 'ON' : 'OFF'})`;
    }

    /* Subtle tactile physical pull-chain switch jolt on the handheld camera */
    this._triggerCameraWhipImpulse({ vx: next ? -95 : 95, vy: 115, vRot: next ? -7.5 : 7.5 });
  }

  /* ------------------------------------------------------------------------
     4. HANDHELD WHIP-PAN CAMERA FLY-TO & STATION-TO-STATION SWITCHING
     ------------------------------------------------------------------------ */
  _getHotspotCenter(stationId) {
    const item =
      this.hotspotsData &&
      this.hotspotsData.hotspots &&
      this.hotspotsData.hotspots[stationId];
    return (item && item.center_top_left) || [0.5, 0.5];
  }

  _triggerCameraWhipImpulse({ vx = 0, vy = 0, vRot = 0, enterX = 0, enterY = 18, enterRot = -1.4 } = {}) {
    if (isReducedMotion() || isMobileViewport()) return;
    const r = this.camRig;
    r.velX = clamp(r.velX + vx, -920, 920);
    r.velY = clamp(r.velY + vy, -760, 760);
    r.velRot = clamp(r.velRot + vRot, -46, 46);

    if (document.body) {
      document.body.style.setProperty('--whip-enter-x', `${enterX.toFixed(1)}px`);
      document.body.style.setProperty('--whip-enter-y', `${enterY.toFixed(1)}px`);
      document.body.style.setProperty('--whip-enter-rot', `${enterRot.toFixed(2)}deg`);
    }
    this._syncHandheldLoopState();
  }

  flyToAndOpenStation(stationId) {
    if (!stationId) return;

    /* Toggle closed if clicking the already-open top nav item */
    const prevOpen = LuluStudioUI.getActiveStation();
    if (prevOpen === stationId) {
      LuluStudioUI.closeStation();
      return;
    }

    this._clearPendingTimers();

    const switchingWhileOpen = Boolean(prevOpen);
    const prevCenter = prevOpen ? this._getHotspotCenter(prevOpen) : [0.5, 0.52];
    const nextCenter = this._getHotspotCenter(stationId);
    const dx = nextCenter[0] - prevCenter[0];
    const dy = nextCenter[1] - prevCenter[1];
    const dirSign = dx === 0 ? (stationId.length % 2 ? 1 : -1) : Math.sign(dx);

    this.activeStation = stationId;
    this._syncTopHud(stationId);
    document.body.classList.add('is-station-open');

    /* Center cursor parallax target while injecting pronounced directional whip-pan shake! */
    this.camRig.targetX = 0;
    this.camRig.targetY = 0;
    this.camRig.targetRotX = 0;
    this.camRig.targetRotY = 0;
    this.camRig.targetRotZ = 0;

    if (!isMobileViewport() && !isReducedMotion()) {
      this._triggerCameraWhipImpulse({
        vx: clamp(-dx * 820 + dirSign * 180, -780, 780),
        vy: clamp(-dy * 640 + 140, -580, 580),
        vRot: clamp(dirSign * 26 + dx * 24, -38, 38),
        enterX: clamp(dx * 95 + dirSign * 24, -64, 64),
        enterY: clamp(dy * 65 + 16, -42, 46),
        enterRot: clamp(dirSign * 2.1, -2.8, 2.8)
      });
    }

    if (!isMobileViewport()) {
      this._applyCameraZoomToHotspot(stationId, dirSign);

      if (switchingWhileOpen && this.closeupBackdropEl && !isReducedMotion()) {
        /* Whip across the 3D desk briefly when switching directly between stations! */
        this.closeupBackdropEl.classList.add('is-whipping');
        this._prepareCloseupBackdrop(stationId, 95);
        this.pendingWhipTimer = setTimeout(() => {
          this.pendingWhipTimer = null;
          if (this.closeupBackdropEl) this.closeupBackdropEl.classList.remove('is-whipping');
        }, 160);
      } else {
        this._prepareCloseupBackdrop(stationId, switchingWhileOpen ? 0 : 140);
      }
    }

    if (isReducedMotion() || isMobileViewport() || switchingWhileOpen) {
      LuluStudioUI.openStation(stationId);
      this.stationFullyCovered = true;
      this.atmosphere.syncRunState();
      return;
    }

    /* Let pronounced whip-pan dolly-in lead into close-up crossfade & tactile overlay */
    this.pendingOpenTimer = setTimeout(() => {
      this.pendingOpenTimer = null;
      LuluStudioUI.openStation(stationId);
    }, 250);

    this.pendingCoverTimer = setTimeout(() => {
      this.pendingCoverTimer = null;
      this.stationFullyCovered = true;
      this.atmosphere.syncRunState();
    }, 720);
  }

  _handleStationOpenFromEngine(stationId, detail) {
    const prevSt = (detail && detail.prevStation) || this.activeStation;
    const switchedInsideEngine = prevSt && prevSt !== stationId;

    this.activeStation = stationId;
    document.body.classList.add('is-station-open');
    this._syncTopHud(stationId);

    if (!isMobileViewport()) {
      const prevCenter = prevSt ? this._getHotspotCenter(prevSt) : [0.5, 0.5];
      const nextCenter = this._getHotspotCenter(stationId);
      const dx = nextCenter[0] - prevCenter[0];
      const dy = nextCenter[1] - prevCenter[1];
      const dirSign = dx === 0 ? 1 : Math.sign(dx);

      if (switchedInsideEngine) {
        this._triggerCameraWhipImpulse({
          vx: clamp(-dx * 760 + dirSign * 160, -740, 740),
          vy: clamp(-dy * 580 + 120, -520, 520),
          vRot: clamp(dirSign * 24, -34, 34),
          enterX: clamp(dx * 85 + dirSign * 20, -58, 58),
          enterY: clamp(dy * 55 + 14, -38, 42),
          enterRot: clamp(dirSign * 1.9, -2.5, 2.5)
        });
      }
      this._applyCameraZoomToHotspot(stationId, dirSign);
      this._prepareCloseupBackdrop(stationId, 0);
    }
  }

  _handleStationCloseFromEngine(prevStation) {
    this._clearPendingTimers();
    const lastCenter = prevStation ? this._getHotspotCenter(prevStation) : [0.5, 0.5];
    const dx = 0.5 - lastCenter[0];
    const dy = 0.5 - lastCenter[1];
    const dirSign = dx === 0 ? -1 : Math.sign(dx);

    this.activeStation = null;
    this.isZoomed = false;
    this.stationFullyCovered = false;

    document.body.classList.remove('is-station-open');
    this._syncTopHud(null);

    if (this.closeupBackdropEl) {
      this.closeupBackdropEl.classList.remove('is-visible', 'is-whipping');
    }

    this._resetCameraZoom();

    /* Pronounced handheld pull-back settle wobble when returning to the wide studio desk! */
    this._triggerCameraWhipImpulse({
      vx: clamp(-dx * 540 + dirSign * 140, -620, 620),
      vy: clamp(-dy * 460 - 175, -540, 540),
      vRot: clamp(dirSign * -22, -32, 32)
    });

    this.atmosphere.syncRunState();
    this._syncHandheldLoopState();
  }

  _applyCameraZoomToHotspot(stationId, dirSign = 1) {
    if (!this.roomFrameEl || !this.hotspotsData || !this.hotspotsData.hotspots) return;
    const item = this.hotspotsData.hotspots[stationId];
    if (!item) return;

    const [cx, cy] = item.center_top_left || [0.5, 0.5];
    const bbox = item.bbox_top_left || [0.35, 0.35, 0.65, 0.65];
    const bw = Math.max(0.08, bbox[2] - bbox[0]);
    const bh = Math.max(0.08, bbox[3] - bbox[1]);

    /* Deeper cinematic zoom + subtle handheld Dutch roll toward target object */
    const idealScale = Math.min(0.68 / bw, 0.68 / bh);
    const scale = clamp(idealScale, 1.85, 2.48);

    const vw = window.innerWidth || 1440;
    const vh = window.innerHeight || 900;
    const fw = Math.max(vw * 1.11, vh * 1.11 * (16 / 9));
    const fh = Math.max(vh * 1.11, vw * 1.11 * (9 / 16));

    const maxTxPct = Math.max(0, (0.5 - vw / (2 * scale * fw)) * 100);
    const maxTyPct = Math.max(0, (0.5 - vh / (2 * scale * fh)) * 100);

    const txPct = clamp((0.5 - cx) * 100, -maxTxPct, maxTxPct);
    const tyPct = clamp((0.5 - cy) * 100, -maxTyPct, maxTyPct);
    const dutchRot = clamp((cx - 0.5) * 3.8 + dirSign * 0.55, -2.2, 2.2);

    this.isZoomed = true;
    this.roomFrameEl.style.setProperty('--cam-scale', scale.toFixed(3));
    this.roomFrameEl.style.setProperty('--cam-rot', `${dutchRot.toFixed(2)}deg`);
    this.roomFrameEl.style.setProperty('--cam-tx', `${txPct.toFixed(2)}%`);
    this.roomFrameEl.style.setProperty('--cam-ty', `${tyPct.toFixed(2)}%`);
  }

  _resetCameraZoom() {
    if (!this.roomFrameEl) return;
    this.roomFrameEl.style.setProperty('--cam-scale', '1');
    this.roomFrameEl.style.setProperty('--cam-rot', '0deg');
    this.roomFrameEl.style.setProperty('--cam-tx', '0%');
    this.roomFrameEl.style.setProperty('--cam-ty', '0%');
  }

  _prepareCloseupBackdrop(stationId, delayMs = 0) {
    if (!this.closeupBackdropEl || !this.closeupImgEl) return;
    if (stationId === 'shelf') {
      this.closeupBackdropEl.classList.remove('is-visible', 'is-whipping');
      return;
    }
    const item =
      this.hotspotsData &&
      this.hotspotsData.hotspots &&
      this.hotspotsData.hotspots[stationId];
    const file = (item && item.closeup_render) || `cam_${stationId}.jpg`;
    const targetSrc = `${SCENE_BASE}${file}`;

    const applySrcWithFallback = () => {
      const probe = new Image();
      probe.onload = () => {
        if (!this.closeupImgEl) return;
        this.closeupImgEl.classList.remove('is-zoomed-poster-fallback');
        this.closeupImgEl.setAttribute('src', targetSrc);
      };
      probe.onerror = () => {
        if (!this.closeupImgEl) return;
        this.closeupImgEl.classList.toggle('is-zoomed-poster-fallback', stationId === 'poster');
        this.closeupImgEl.setAttribute('src', `${SCENE_BASE}hero_lamp_on_v4.png`);
      };
      probe.src = targetSrc;
    };

    applySrcWithFallback();

    if (delayMs <= 0) {
      this.closeupBackdropEl.classList.add('is-visible');
    } else {
      this.pendingBackdropTimer = setTimeout(() => {
        this.pendingBackdropTimer = null;
        if (this.activeStation === stationId) {
          this.closeupBackdropEl.classList.add('is-visible');
        }
      }, delayMs);
    }
  }

  _preloadStationCloseupsIdle() {
    const enqueue = window.requestIdleCallback || ((cb) => setTimeout(cb, 700));
    enqueue(() => {
      for (const id of ['notebook', 'tv', 'newspaper', 'typewriter', 'poster']) {
        const img = new Image();
        img.decoding = 'async';
        img.src = `${SCENE_BASE}cam_${id}.jpg`;
      }
    });
  }

  _clearPendingTimers() {
    if (this.pendingOpenTimer) {
      clearTimeout(this.pendingOpenTimer);
      this.pendingOpenTimer = null;
    }
    if (this.pendingBackdropTimer) {
      clearTimeout(this.pendingBackdropTimer);
      this.pendingBackdropTimer = null;
    }
    if (this.pendingCoverTimer) {
      clearTimeout(this.pendingCoverTimer);
      this.pendingCoverTimer = null;
    }
    if (this.pendingWhipTimer) {
      clearTimeout(this.pendingWhipTimer);
      this.pendingWhipTimer = null;
    }
  }

  _syncTopHud(activeStation) {
    if (this.backToDeskBtn) {
      this.backToDeskBtn.hidden = !activeStation;
    }
    document.querySelectorAll('[data-room-nav]').forEach((el) => {
      if (!el.classList.contains('lu-room-nav-link')) return;
      const isMatch = el.getAttribute('data-room-nav') === activeStation;
      el.classList.toggle('is-active', isMatch);
      el.setAttribute('aria-current', isMatch ? 'page' : 'false');
    });
  }

  /* ------------------------------------------------------------------------
     5. PRONOUNCED 35MM HANDHELD CAMERA RIG (±34px Pan + 3D Tilt + Spring Shake)
     ------------------------------------------------------------------------ */
  _onPointerMove(e) {
    if (isReducedMotion() || isMobileViewport()) return;
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const nx = (e.clientX / vw - 0.5) * 2; // [-1, 1]
    const ny = (e.clientY / vh - 0.5) * 2; // [-1, 1]

    if (this.activeStation) {
      /* Even while inspecting a station, keep subtle handheld cursor sway on the close-up room! */
      this.camRig.targetX = clamp(-nx * 11, -11, 11);
      this.camRig.targetY = clamp(-ny * 8, -8, 8);
      this.camRig.targetRotY = clamp(nx * 0.65, -0.65, 0.65);
      this.camRig.targetRotX = clamp(-ny * 0.5, -0.5, 0.5);
      this.camRig.targetRotZ = clamp(-nx * 0.25, -0.25, 0.25);
      return;
    }

    /* Wide Desk Exploration: Pronounced ±34px X/Y pan + ±2.4deg 3D perspective tilt + ±0.7deg roll! */
    this.camRig.targetX = clamp(-nx * 34, -34, 34);
    this.camRig.targetY = clamp(-ny * 24, -24, 24);
    this.camRig.targetRotY = clamp(nx * 2.35, -2.35, 2.35);
    this.camRig.targetRotX = clamp(-ny * 1.85, -1.85, 1.85);
    this.camRig.targetRotZ = clamp(-nx * 0.72, -0.72, 0.72);
  }

  _syncHandheldLoopState() {
    if (!this.parallaxRigEl) return;
    const shouldRun = !document.hidden && !isReducedMotion() && !isMobileViewport();

    if (shouldRun && !this.camRig.running) {
      this.camRig.running = true;
      this.camRig.lastTs = performance.now();
      this.camRig.rafId = requestAnimationFrame((ts) => this._tickHandheldRig(ts));
    } else if (!shouldRun && this.camRig.running) {
      this.camRig.running = false;
      if (this.camRig.rafId) cancelAnimationFrame(this.camRig.rafId);
      this.camRig.rafId = 0;
    }
  }

  _tickHandheldRig(ts) {
    if (!this.camRig.running || !this.parallaxRigEl) return;
    const dt = Math.min(0.04, Math.max(0.001, (ts - this.camRig.lastTs) / 1000));
    this.camRig.lastTs = ts;
    const t = ts * 0.001;
    const r = this.camRig;

    /* 1. Smoothly damp cursor-driven pan & 3D perspective angles */
    const follow = 1 - Math.exp(-dt * 6.8);
    r.curX += (r.targetX - r.curX) * follow;
    r.curY += (r.targetY - r.curY) * follow;
    r.curRotX += (r.targetRotX - r.curRotX) * follow;
    r.curRotY += (r.targetRotY - r.curRotY) * follow;
    r.curRotZ += (r.targetRotZ - r.curRotZ) * follow;

    /* 2. Integrate damped harmonic spring oscillator for whip-pan & camera shake jolts */
    const k = 128; // spring stiffness
    const c = 10.2; // damping (allows 2-3 tactile handheld overshoot oscillations!)
    const ax = -k * r.joltX - c * r.velX;
    const ay = -k * r.joltY - c * r.velY;
    const aRot = -k * r.joltRot - c * r.velRot;

    r.velX += ax * dt;
    r.velY += ay * dt;
    r.velRot += aRot * dt;

    r.joltX += r.velX * dt;
    r.joltY += r.velY * dt;
    r.joltRot += r.velRot * dt;

    /* 3. Organic 35mm handheld camera operator breathing sway (Lissajous figure-8) */
    const breathAmp = this.activeStation ? 0.48 : 1.0;
    const breathX = (Math.sin(t * 0.94) * 6.8 + Math.sin(t * 1.83) * 2.5) * breathAmp;
    const breathY = (Math.cos(t * 0.72) * 5.0 + Math.cos(t * 1.49) * 1.9) * breathAmp;
    const breathRoll = (Math.sin(t * 0.61) * 0.42 + Math.cos(t * 1.31) * 0.18) * breathAmp;

    const finalX = r.curX + breathX + r.joltX;
    const finalY = r.curY + breathY + r.joltY;
    const finalRotX = r.curRotX + Math.cos(t * 0.72) * 0.22 * breathAmp;
    const finalRotY = r.curRotY + Math.sin(t * 0.94) * 0.28 * breathAmp;
    const finalRotZ = r.curRotZ + breathRoll + r.joltRot;

    this.parallaxRigEl.style.transform =
      `translate3d(${finalX.toFixed(2)}px, ${finalY.toFixed(2)}px, 0) ` +
      `rotateX(${finalRotX.toFixed(3)}deg) rotateY(${finalRotY.toFixed(3)}deg) rotateZ(${finalRotZ.toFixed(3)}deg)`;

    /* Drive close-up backdrop with matching handheld sway + whip-pan shake so zoomed stations feel alive! */
    if (this.closeupBackdropEl && this.activeStation) {
      const cuX = (r.curX * 0.75 + breathX + r.joltX * 0.92).toFixed(2);
      const cuY = (r.curY * 0.75 + breathY + r.joltY * 0.92).toFixed(2);
      const cuRot = (breathRoll + r.joltRot * 0.85).toFixed(3);
      this.closeupBackdropEl.style.transform =
        `scale(1.02) translate3d(${cuX}px, ${cuY}px, 0) rotateZ(${cuRot}deg)`;
    }

    r.rafId = requestAnimationFrame((nextTs) => this._tickHandheldRig(nextTs));
  }

  /* ------------------------------------------------------------------------
     6. DOM & KEYBOARD EVENT LISTENERS
     ------------------------------------------------------------------------ */
  _bindEvents() {
    /* Hotspot clicks inside 16:9 studio stage */
    if (this.hotspotLayerEl) {
      this.hotspotLayerEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-hotspot-id]');
        if (!btn) return;
        const id = btn.dataset.hotspotId;
        if (id === 'lamp') {
          this.toggleLamp();
        } else {
          this.flyToAndOpenStation(id);
        }
      });
    }

    /* Delegated [data-room-nav] & [data-edition-btn] clicks */
    document.addEventListener('click', (e) => {
      const edTrigger = e.target.closest('[data-edition-btn]');
      if (edTrigger) {
        e.preventDefault();
        const ed = edTrigger.getAttribute('data-edition-btn');
        if (typeof LuluStudioUI.setEdition === 'function') {
          LuluStudioUI.setEdition(ed);
        }
        return;
      }

      const navTrigger = e.target.closest('[data-room-nav]');
      if (navTrigger) {
        e.preventDefault();
        const stationId = navTrigger.getAttribute('data-room-nav');
        this.flyToAndOpenStation(stationId);
      }
    });

    window.addEventListener('lulu:edition-change', (e) => {
      const ed = (e && e.detail && e.detail.edition) || 'a';
      document.querySelectorAll('[data-edition-btn]').forEach((btn) => {
        const active = btn.getAttribute('data-edition-btn') === ed;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });

    /* Brand & Back-to-Desk return to wide studio room */
    const returnToDesk = () => {
      if (LuluStudioUI.getActiveStation()) {
        LuluStudioUI.closeStation();
      } else if (this.activeStation) {
        this._handleStationCloseFromEngine();
      }
    };

    if (this.brandHomeBtn) this.brandHomeBtn.addEventListener('click', returnToDesk);
    if (this.backToDeskBtn) this.backToDeskBtn.addEventListener('click', returnToDesk);

    /* Lamp toggle buttons (Desktop bottom-right + Mobile top bar) */
    if (this.lampToggleBtn) {
      this.lampToggleBtn.addEventListener('click', () => this.toggleLamp());
    }
    if (this.mobileLampBtn) {
      this.mobileLampBtn.addEventListener('click', () => this.toggleLamp());
    }

    /* Pronounced 35mm handheld mouse sway */
    window.addEventListener('pointermove', (e) => this._onPointerMove(e), { passive: true });
    window.addEventListener('blur', () => {
      this.camRig.targetX = 0;
      this.camRig.targetY = 0;
      this.camRig.targetRotX = 0;
      this.camRig.targetRotY = 0;
      this.camRig.targetRotZ = 0;
    });

    /* Keyboard shortcuts: [1-6] open station (when on desk), [L] Lamp, [ESC] cancel pending zoom */
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if (e.key === 'Escape' && this.activeStation && !LuluStudioUI.getActiveStation()) {
        e.preventDefault();
        this._handleStationCloseFromEngine();
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        this.toggleLamp();
        return;
      }

      /* Defer 1-3 to TV channel switcher when TV station is already open */
      if (!LuluStudioUI.getActiveStation() && KEY_TO_STATION[e.key]) {
        e.preventDefault();
        this.flyToAndOpenStation(KEY_TO_STATION[e.key]);
      }
    });

    /* Pause/resume atmosphere & handheld camera rig on tab visibility or breakpoint changes */
    document.addEventListener('visibilitychange', () => {
      this.atmosphere.syncRunState();
      this._syncHandheldLoopState();
    });
    window.addEventListener('resize', () => {
      this.atmosphere.syncRunState();
      this._syncHandheldLoopState();
      if (this.activeStation && !isMobileViewport()) {
        this._applyCameraZoomToHotspot(this.activeStation);
      }
    });
  }
}

/* Boot Studio Room Controller */
const studioRoom = new LuluStudioRoomController();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => studioRoom.init(), { once: true });
} else {
  studioRoom.init();
}

window.LuluStudioRoom = studioRoom;
export default studioRoom;
