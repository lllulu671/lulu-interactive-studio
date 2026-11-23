/**
 * Lulu Interactive Studio — 3-Edition Anti-AI-Slop Overlay & Inspection Engine
 * File: studio-overlays.js
 *
 * Live-Switchable Interaction Editions (?edition=a | ?edition=b | ?edition=c):
 *   - Edition A ("a"): 物化直觉器物版 · Diegetic Object-First (Felix Rieseberg × Taliahhh × Kelli Anderson)
 *                      Zero outer modal frames; physical objects float directly over the rainy studio.
 *   - Edition B ("b"): 90s 复古桌面系统多窗口版 · Poolsuite Retro OS (Poolsuite FM × Classic Mac OS System 7)
 *                      Sharp 1.5px borders, pinstripe titlebars, [■] close boxes, hard 5px pixel shadows, real drag-to-move.
 *   - Edition C ("c"): 纽约画廊印相墙与瑞士目录版 · Swiss Editorial & Contact Sheet (Cosmos × Standards Manual)
 *                      Full-sheet warm newsprint (#F2EFE9), 1px Swiss hairlines, inline native-aspect video grid, 10-row press table.
 *
 * Strict Anti-AI-Slop Guarantees:
 *   1. 100% Verbatim Lulu Copy ONLY — zero AI-invented blurbs, zero invented bilingual buzzwords.
 *   2. Zero default browser <video controls> soup — clean custom minimal transport/OSD per edition.
 *   3. Single-click video play + subtle ↗ external post link; all 3 press outlets on one single page.
 */

import {
  STUDIO_META,
  EDITIONS,
  STATIONS,
  STATION_ALIASES,
  NOTEBOOK_DATA,
  TV_CHANNELS,
  TV_ALL_CHANNEL,
  CREATOR_REELS,
  NEWSPAPER_DATA,
  SHELF_DATA,
  TYPEWRITER_DATA,
  POSTER_DATA
} from './studio-data.js?v=6';

const DEFAULT_ASSET_BASE = new URL('../assets/custom/', import.meta.url).href;
const VALID_EDITIONS = new Set(['a', 'b', 'c']);

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function normalizeStationId(rawId) {
  if (!rawId) return null;
  const key = String(rawId).trim().toLowerCase();
  return STATION_ALIASES[key] || null;
}

function normalizeEdition(rawEd) {
  if (!rawEd) return 'a';
  const k = String(rawEd).trim().toLowerCase();
  return VALID_EDITIONS.has(k) ? k : 'a';
}

/* Helper to render a Classic Mac OS System 7 / Poolsuite Window wrapper */
function renderMacWindow({ id = '', title = '', className = '', closeAttr = 'data-lu-close', bodyHtml = '', statusHtml = '' }) {
  return `
    <div class="ps-window ${className}" ${id ? `id="${escapeHtml(id)}"` : ''}>
      <div class="ps-titlebar" data-ps-drag-handle>
        <button type="button" class="ps-close-box" ${closeAttr} aria-label="关闭窗口" title="关闭 (ESC)"></button>
        <div class="ps-pinstripes" aria-hidden="true"></div>
        <span class="ps-title-plaque">${escapeHtml(title)}</span>
        <div class="ps-pinstripes" aria-hidden="true"></div>
      </div>
      ${statusHtml ? `<div class="ps-statusbar">${statusHtml}</div>` : ''}
      <div class="ps-window-body">${bodyHtml}</div>
    </div>
  `;
}

/* ============================================================================
   CONTROLLER IMPLEMENTATION
   ============================================================================ */
class StudioOverlayEngine {
  constructor() {
    this.initialized = false;
    this.options = {
      container: null,
      assetBase: DEFAULT_ASSET_BASE,
      mountHUD: true,
      onStationOpen: null,
      onStationClose: null,
      onStationChange: null
    };

    const initialEd = this._detectInitialEdition();

    this.state = {
      edition: initialEd, // 'a' | 'b' | 'c'
      activeStation: null,
      notebookOpened: true,
      notebookPage: 'bio', // 'bio' | 'experience'
      tvChannel: 'seedance', // 'seedance' | 'kimi' | 'minimax'
      tvFrameByChannel: {
        seedance: '→03A',
        kimi: '→06A',
        minimax: '→11A',
        all: '→03A'
      },
      tvMuted: true,
      tvPaused: false,
      tvMountedKey: null,
      tvRenderedKey: null,
      cPlayingFrame: null,
      letterSent: false,
      letterDraft: {
        name: '',
        contact: '',
        message: ''
      }
    };

    this._psTopZ = 20;
    this._dragState = null;

    this.hudEl = null;
    this.rootEl = null;
    this.liveRegionEl = null;
    this.lastFocusedEl = null;
    this.typingTimer = null;
    this.coverFlipTimer = null;
    this.shelfView = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onDelegatedTrigger = this._onDelegatedTrigger.bind(this);
    this._onExternalRequest = this._onExternalRequest.bind(this);
    this._onRootClick = this._onRootClick.bind(this);
    this._onRootSubmit = this._onRootSubmit.bind(this);
    this._onRootKeyDown = this._onRootKeyDown.bind(this);
    this._onRootPointerDown = this._onRootPointerDown.bind(this);
    this._onWindowPointerMove = this._onWindowPointerMove.bind(this);
    this._onWindowPointerUp = this._onWindowPointerUp.bind(this);
  }

  _detectInitialEdition() {
    if (typeof window === 'undefined' || !window.location) return 'a';
    const params = new URLSearchParams(window.location.search);
    return normalizeEdition(params.get('edition'));
  }

  assetUrl(relPath) {
    const base = this.options.assetBase.endsWith('/')
      ? this.options.assetBase
      : `${this.options.assetBase}/`;
    return `${base}${String(relPath || '').replace(/^\.\//, '')}`;
  }

  init(customOptions = {}) {
    this.options = { ...this.options, ...customOptions };

    if (this.initialized) {
      this._syncPaperTextureVar();
      this._applyEditionAttributes();
      this._syncHud();
      return this;
    }

    const host = this.options.container || document.body;
    if (!host) return this;

    this.state.edition = this._detectInitialEdition();

    if (this.options.mountHUD) {
      this._mountHud(host);
    }
    this._mountOverlayRoot(host);
    this._syncPaperTextureVar();
    this._applyEditionAttributes();

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('click', this._onDelegatedTrigger);
    window.addEventListener('lulu:request-station', this._onExternalRequest);
    window.addEventListener('pointermove', this._onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', this._onWindowPointerUp);

    this.initialized = true;

    /* Broadcast initial edition so Studio Room HUD syncs immediately */
    window.dispatchEvent(
      new CustomEvent('lulu:edition-change', { detail: { edition: this.state.edition } })
    );

    /* Deep-link support (?station=tv|newspaper|poster|shelf|notebook|typewriter) */
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const qStation = normalizeStationId(params.get('station'));
      const hashStation = normalizeStationId(window.location.hash.replace(/^#station-?/, ''));
      const initial = qStation || hashStation;
      if (initial) {
        this.openStation(initial);
      }
    }

    return this;
  }

  _syncPaperTextureVar() {
    if (!this.rootEl) return;
    this.rootEl.style.setProperty(
      '--lu-paper-tex',
      `url("${this.assetUrl('texture-paper-soft.jpeg')}")`
    );
  }

  _applyEditionAttributes() {
    const ed = this.state.edition;
    if (document.body) {
      document.body.dataset.edition = ed;
    }
    if (this.rootEl) {
      this.rootEl.dataset.edition = ed;
    }
    document.querySelectorAll('[data-edition-btn]').forEach((btn) => {
      const active = btn.getAttribute('data-edition-btn') === ed;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  setEdition(rawEdition, { updateUrl = true } = {}) {
    const nextEd = normalizeEdition(rawEdition);
    const prevEd = this.state.edition;

    if (updateUrl && typeof window !== 'undefined' && window.history && window.location) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('edition', nextEd);
        window.history.replaceState({}, '', url.toString());
      } catch (_) {}
    }

    if (nextEd === prevEd && this.rootEl) {
      this._applyEditionAttributes();
      return nextEd;
    }

    const activeSt = this.state.activeStation;
    if (activeSt === 'tv') {
      this._teardownTvMedia();
    }
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }

    this.state.edition = nextEd;
    this._applyEditionAttributes();

    this._stopShelfView();

    /* Re-render all panels cleanly for the newly selected edition */
    this._renderAllPanels();

    /* If a station was currently open, keep it seamlessly open in the new edition! */
    if (activeSt && this.rootEl) {
      this.rootEl.querySelectorAll('[data-lu-panel]').forEach((panel) => {
        panel.classList.toggle('is-active', panel.getAttribute('data-lu-panel') === activeSt);
      });
      this._runStationActivateHooks(activeSt, { flash: false });
    }

    const edMeta = EDITIONS.find((e) => e.id === nextEd);
    if (edMeta) {
      this._announce(`已切换交互版本：${edMeta.short} ${edMeta.name}`);
    }

    window.dispatchEvent(
      new CustomEvent('lulu:edition-change', {
        detail: { edition: nextEd, prevEdition: prevEd, activeStation: activeSt }
      })
    );

    return nextEd;
  }

  getEdition() {
    return this.state.edition;
  }

  _announce(msg) {
    if (this.liveRegionEl) {
      this.liveRegionEl.textContent = msg;
    }
  }

  /* ==========================================================================
     STANDALONE STUDIO HUD (Only mounted if options.mountHUD === true)
     ========================================================================== */
  _mountHud(host) {
    const existing = document.getElementById('luStudioHud');
    if (existing) existing.remove();

    const header = document.createElement('header');
    header.className = 'lu-hud-top';
    header.id = 'luStudioHud';
    header.setAttribute('aria-label', 'Lulu 个人档案导航');

    header.innerHTML = `
      <div class="lu-hud-left">
        <button type="button" class="lu-hud-brand" data-lu-action="home">
          <i class="lu-hud-dot" aria-hidden="true"></i>
          <span class="lu-hud-brand-text">${escapeHtml(STUDIO_META.brandMark)}</span>
          <span class="lu-hud-brand-sub">${escapeHtml(STUDIO_META.ownerCn)}</span>
        </button>
        <button type="button" class="lu-hud-back" data-lu-action="close">
          ← ESC
        </button>
      </div>
      <nav class="lu-hud-nav" aria-label="六个区域直达">
        ${STATIONS.map(
          (st) => `
          <button type="button" class="lu-hud-pill" data-lu-nav="${st.id}">
            <span>${st.num} ${st.navLabel}</span>
          </button>`
        ).join('')}
      </nav>
    `;

    header.addEventListener('click', (e) => {
      if (e.target.closest('[data-lu-action="home"], [data-lu-action="close"]')) {
        this.closeStation();
        return;
      }
      const navBtn = e.target.closest('[data-lu-nav]');
      if (navBtn) {
        this.toggleStation(navBtn.getAttribute('data-lu-nav'));
      }
    });

    host.appendChild(header);
    this.hudEl = header;
  }

  _syncHud() {
    if (!this.hudEl) return;
    const active = this.state.activeStation;
    const backBtn = this.hudEl.querySelector('.lu-hud-back');
    if (backBtn) backBtn.classList.toggle('is-visible', Boolean(active));
    this.hudEl.querySelectorAll('[data-lu-nav]').forEach((btn) => {
      const isMatch = btn.getAttribute('data-lu-nav') === active;
      btn.classList.toggle('is-active', isMatch);
    });
  }

  /* ==========================================================================
     OVERLAY ROOT & SINGLE DELEGATED INTERACTION BUS
     ========================================================================== */
  _mountOverlayRoot(host) {
    const existing = document.getElementById('luStudioOverlayRoot');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.className = 'lu-overlay-root';
    root.id = 'luStudioOverlayRoot';
    root.dataset.edition = this.state.edition;
    root.setAttribute('aria-hidden', 'true');

    root.innerHTML = `
      <div class="lu-sr-only" aria-live="polite" id="luStudioLiveRegion"></div>
      <section class="lu-station-panel" data-lu-panel="notebook" role="dialog" aria-modal="true" aria-label="自我介绍与履历"></section>
      <section class="lu-station-panel" data-lu-panel="tv" role="dialog" aria-modal="true" aria-label="海外红人营销"></section>
      <section class="lu-station-panel" data-lu-panel="newspaper" role="dialog" aria-modal="true" aria-label="记者作品集"></section>
      <section class="lu-station-panel" data-lu-panel="shelf" role="dialog" aria-modal="true" aria-label="工作书架藏品"></section>
      <section class="lu-station-panel" data-lu-panel="typewriter" role="dialog" aria-modal="true" aria-label="留言与联系"></section>
      <section class="lu-station-panel" data-lu-panel="poster" role="dialog" aria-modal="true" aria-label="工作书架与小实验"></section>
    `;

    root.addEventListener('click', this._onRootClick);
    root.addEventListener('submit', this._onRootSubmit);
    root.addEventListener('keydown', this._onRootKeyDown);
    root.addEventListener('pointerdown', this._onRootPointerDown);

    host.appendChild(root);
    this.rootEl = root;
    this.liveRegionEl = root.querySelector('#luStudioLiveRegion');

    this._renderAllPanels();
  }

  _renderAllPanels() {
    if (!this.rootEl) return;
    this.state.tvMountedKey = null;
    this.state.tvRenderedKey = null;
    this._renderNotebookPanel();
    this._renderTvPanel();
    this._renderNewspaperPanel();
    this._renderShelfPanel();
    this._renderTypewriterPanel();
    this._renderPosterPanel();
  }

  /* ==========================================================================
     OPEN / CLOSE / TOGGLE PUBLIC API
     ========================================================================== */
  openStation(rawStationId, subOptions = {}) {
    if (!this.initialized) this.init();

    const stationId = normalizeStationId(rawStationId);
    if (!stationId || !this.rootEl) return false;

    if (subOptions.edition && VALID_EDITIONS.has(String(subOptions.edition).toLowerCase())) {
      this.setEdition(subOptions.edition);
    }

    const prevStation = this.state.activeStation;
    if (prevStation === 'shelf' && stationId !== 'shelf') this._stopShelfView();
    if (prevStation === 'tv' && stationId !== 'tv') {
      this._teardownTvMedia();
    }

    if (!prevStation && document.activeElement instanceof HTMLElement) {
      this.lastFocusedEl = document.activeElement;
    }

    this.state.activeStation = stationId;

    if (stationId === 'notebook' && subOptions.page) {
      this.state.notebookPage = subOptions.page === 'experience' ? 'experience' : 'bio';
    }
    if (stationId === 'tv') {
      if (subOptions.channel) {
        const ch = TV_CHANNELS.find((c) => c.key === subOptions.channel);
        if (ch) this.state.tvChannel = ch.key;
      }
      if (subOptions.frame) {
        const reel = CREATOR_REELS.find((r) => r.frame === subOptions.frame);
        if (reel) {
          this.state.tvChannel = reel.campaign;
          this.state.tvFrameByChannel[reel.campaign] = reel.frame;
        }
      }
    }

    this.rootEl.classList.add('is-open');
    this.rootEl.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lu-station-open');

    this.rootEl.querySelectorAll('[data-lu-panel]').forEach((panel) => {
      panel.classList.toggle('is-active', panel.getAttribute('data-lu-panel') === stationId);
    });

    this._runStationActivateHooks(stationId, { flash: true });
    this._syncHud();

    const meta = STATIONS.find((s) => s.id === stationId);
    if (meta) this._announce(`已打开 ${meta.cnLabel}`);

    const detail = { stationId, prevStation, edition: this.state.edition, state: this.getState() };
    if (typeof this.options.onStationOpen === 'function') {
      this.options.onStationOpen(stationId, detail);
    }
    if (typeof this.options.onStationChange === 'function') {
      this.options.onStationChange(stationId, prevStation);
    }
    window.dispatchEvent(new CustomEvent('lulu:station-open', { detail }));
    window.dispatchEvent(new CustomEvent('lulu:station-change', { detail }));

    return true;
  }

  _runStationActivateHooks(stationId, { flash = true } = {}) {
    if (stationId === 'notebook') {
      this._triggerNotebookEntrance();
    } else if (stationId === 'tv') {
      this.state.tvMountedKey = null;
      this.state.tvRenderedKey = null;
      this._updateTvDom({ flash });
    } else if (stationId === 'shelf') {
      this._startShelfView();
    } else if (stationId === 'typewriter') {
      this._triggerTypewriterGreeting();
    }
  }

  closeStation() {
    if (!this.initialized || !this.state.activeStation) return false;

    const prevStation = this.state.activeStation;
    this.state.activeStation = null;
    if (prevStation === 'shelf') this._stopShelfView();

    if (prevStation === 'tv') {
      this._teardownTvMedia();
    }

    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
    if (this.coverFlipTimer) {
      clearTimeout(this.coverFlipTimer);
      this.coverFlipTimer = null;
    }

    this.rootEl.classList.remove('is-open');
    this.rootEl.setAttribute('aria-hidden', 'true');
    this.rootEl.querySelectorAll('[data-lu-panel]').forEach((panel) => {
      panel.classList.remove('is-active');
    });
    document.documentElement.classList.remove('lu-station-open');

    this._syncHud();
    this._announce('已返回工作台全景');

    if (this.lastFocusedEl && typeof this.lastFocusedEl.focus === 'function') {
      this.lastFocusedEl.focus({ preventScroll: true });
      this.lastFocusedEl = null;
    }

    const detail = { stationId: null, prevStation, edition: this.state.edition, state: this.getState() };
    if (typeof this.options.onStationClose === 'function') {
      this.options.onStationClose(prevStation, detail);
    }
    if (typeof this.options.onStationChange === 'function') {
      this.options.onStationChange(null, prevStation);
    }
    window.dispatchEvent(new CustomEvent('lulu:station-close', { detail }));
    window.dispatchEvent(new CustomEvent('lulu:station-change', { detail }));

    return true;
  }

  toggleStation(stationId, subOptions = {}) {
    const norm = normalizeStationId(stationId);
    if (this.state.activeStation === norm) return this.closeStation();
    return this.openStation(norm, subOptions);
  }

  getActiveStation() {
    return this.state.activeStation;
  }

  getState() {
    return {
      ...this.state,
      tvFrameByChannel: { ...this.state.tvFrameByChannel },
      letterDraft: { ...this.state.letterDraft }
    };
  }

  /* ==========================================================================
     STATION 01 — CENTRAL NOTEBOOK (About & Experience 2024—2026)
     ========================================================================== */
  _renderNotebookPanel() {
    const panel = this.rootEl.querySelector('[data-lu-panel="notebook"]');
    if (!panel) return;
    const ed = this.state.edition;
    const polaroidBoardUrl = this.assetUrl(NOTEBOOK_DATA.polaroid.boardImage);
    const portraitUrl = this.assetUrl(NOTEBOOK_DATA.polaroid.portraitImage);
    const secondPortraitUrl = this.assetUrl(NOTEBOOK_DATA.polaroid.secondaryImage);

    if (ed === 'a') {
      const ringsHtml = Array.from({ length: 7 })
        .map(() => '<span class="lu-nb-ring"></span>')
        .join('');

      panel.innerHTML = `
        <div class="ed-a-nb-scene" data-stop-backdrop>
          <button type="button" class="ed-a-whisper-close" data-lu-close aria-label="返回桌面">× ESC</button>
          <div class="lu-nb-book is-opened" id="luNotebookBook">
            <div class="lu-nb-hardcover" id="luNotebookHardcover" title="点击翻开笔记本">
              <div class="lu-nb-cover-front">
                <div class="lu-nb-cover-plate">
                  <small>${escapeHtml(NOTEBOOK_DATA.cover.archiveCode)}</small>
                  <h3>卢倩莹<em>Lulu</em></h3>
                  <div class="lu-nb-cover-divider"></div>
                  <p>${escapeHtml(NOTEBOOK_DATA.cover.subtitle)}</p>
                  <small>${escapeHtml(NOTEBOOK_DATA.cover.footerHint)}</small>
                </div>
              </div>
              <div class="lu-nb-cover-inside"></div>
            </div>

            <div class="lu-nb-tabs" role="tablist">
              <button type="button" role="tab" class="lu-nb-tab is-active" data-nb-page="bio">01 介绍</button>
              <button type="button" role="tab" class="lu-nb-tab" data-nb-page="experience">02 履历</button>
            </div>

            <div class="lu-nb-spread">
              <div class="lu-nb-gutter" aria-hidden="true">${ringsHtml}</div>

              <div class="lu-nb-spread-pane" data-nb-pane="bio">
                <div class="lu-nb-page lu-nb-page--left lu-nb-page--photos">
                  <div class="lu-nb-photo-board" aria-label="两张拍立得照片">
                    <img class="lu-nb-photo-board-base" src="${escapeHtml(polaroidBoardUrl)}" alt="拍立得相纸" />
                    <div class="lu-nb-photo-window lu-nb-photo-window--top">
                      <img src="${escapeHtml(portraitUrl)}" alt="卢倩莹在树下的照片" />
                    </div>
                    <div class="lu-nb-photo-window lu-nb-photo-window--bottom">
                      <img src="${escapeHtml(secondPortraitUrl)}" alt="卢倩莹在街边的照片" />
                    </div>
                  </div>
                </div>

                <div class="lu-nb-page lu-nb-page--right lu-nb-page--journal">
                  <div class="lu-nb-meta-bar">
                    <span>个人介绍</span>
                    <span>2026</span>
                  </div>
                  <div class="lu-nb-journal-copy">
                    <p class="lu-nb-bio-lead">Hi! 我是lulu，这是我的个人网站。</p>
                    <p class="lu-nb-bio-sub">我做海外 KOL 运营、内容策划与项目，也做过记者，采访过AI、游戏、社会民生等领域。</p>
                    <p class="lu-nb-bio-sub">擅长把复杂的产品卖点和行业信息，翻译成创作者听得懂、观众愿意看的故事</p>
                  </div>
                  <div class="lu-nb-footer-actions">
                    <span class="lu-nb-quiet-note">手写档案 · 2026</span>
                    <button type="button" class="ed-a-ink-link" data-nb-page="experience">查看履历 →</button>
                  </div>
                </div>
              </div>

              <div class="lu-nb-spread-pane" data-nb-pane="experience" hidden>
                <div class="lu-nb-page lu-nb-page--left">
                  <div class="lu-nb-meta-bar">
                    <span>履历</span>
                    <span>2024—2026</span>
                  </div>
                  <blockquote class="ed-a-nb-quote">
                    我对工作的想象是，<mark>既要把事情推进</mark>，也要把它做得有趣。
                  </blockquote>
                  <div class="lu-nb-footer-actions">
                    <button type="button" class="ed-a-ink-link" data-nb-page="bio">← 返回介绍</button>
                  </div>
                </div>

                <div class="lu-nb-page lu-nb-page--right">
                  <div class="lu-nb-meta-bar">
                    <span>工作经历 / 2024—2026</span>
                    <span>卢倩莹</span>
                  </div>
                  <div class="lu-nb-timeline">
                    ${NOTEBOOK_DATA.timeline
                      .map(
                        (item) => `
                        <article class="lu-nb-tl-item">
                          <div class="lu-nb-tl-head">
                            <time>${escapeHtml(item.period)}</time>
                            <span>${escapeHtml(item.tag)}</span>
                          </div>
                          <h4>${escapeHtml(item.role)}</h4>
                          <p>${escapeHtml(item.desc)}</p>
                        </article>`
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (ed === 'b') {
      const leftWin = renderMacWindow({
        title: 'Portrait.pict',
        className: 'ps-win-nb-portrait',
        bodyHtml: `
          <div class="ps-portrait-frame">
            <img src="${escapeHtml(portraitUrl)}" alt="卢倩莹 Lulu" />
          </div>
          <div class="ps-portrait-meta">
            <strong>卢倩莹 Lulu</strong>
            <span>${escapeHtml(STUDIO_META.tagline)}</span>
          </div>
        `
      });

      const rightWin = renderMacWindow({
        title: 'About_Lulu — SimpleText',
        className: 'ps-win-nb-bio',
        statusHtml: `<span>creator partnerships · content · operations</span><span>2024—2026</span>`,
        bodyHtml: `
          <div class="ps-doc-section">
            <p class="ps-doc-lead">${escapeHtml(NOTEBOOK_DATA.bio.paragraphs[0])} ${escapeHtml(NOTEBOOK_DATA.bio.paragraphs[1])}</p>
          </div>
          <div class="ps-doc-divider"></div>
          <div class="ps-doc-kicker">Experience / 2024—2026</div>
          <div class="ps-tl-table">
            ${NOTEBOOK_DATA.timeline
              .map(
                (t) => `
                <div class="ps-tl-row">
                  <time>${escapeHtml(t.period)}</time>
                  <div>
                    <strong>${escapeHtml(t.role)}</strong>
                    <p>${escapeHtml(t.desc)}</p>
                  </div>
                  <span class="ps-tag">${escapeHtml(t.tag)}</span>
                </div>`
              )
              .join('')}
          </div>
        `
      });

      panel.innerHTML = `<div class="ps-desktop-cluster" data-stop-backdrop>${leftWin}${rightWin}</div>`;
      return;
    }

    /* Edition C: Swiss Asymmetric 4fr : 8fr Editorial Sheet */
    panel.innerHTML = `
      <div class="sw-sheet" data-stop-backdrop>
        <div class="sw-sheet-inner">
          <header class="sw-topbar">
            <div class="sw-topbar-left">
              <span class="sw-idx">01 / ABOUT</span>
              <h2 class="sw-page-title">卢倩莹 Lulu — ${escapeHtml(STUDIO_META.tagline)}</h2>
            </div>
            <button type="button" class="sw-close-btn" data-lu-close>CLOSE [ESC]</button>
          </header>

          <div class="sw-grid-asym">
            <aside class="sw-col-left">
              <div class="sw-portrait-box">
                <img src="${escapeHtml(portraitUrl)}" alt="卢倩莹 Lulu" />
              </div>
              <p class="sw-bio-p">${escapeHtml(NOTEBOOK_DATA.bio.paragraphs[0])}</p>
              <p class="sw-bio-p">${escapeHtml(NOTEBOOK_DATA.bio.paragraphs[1])}</p>
            </aside>

            <section class="sw-col-right">
              <div class="sw-section-label">Experience / 2024—2026</div>
              <div class="sw-hairline-list">
                ${NOTEBOOK_DATA.timeline
                  .map(
                    (t) => `
                    <article class="sw-exp-row">
                      <time>${escapeHtml(t.period)}</time>
                      <div class="sw-exp-main">
                        <h3>${escapeHtml(t.role)}</h3>
                        <p>${escapeHtml(t.desc)}</p>
                      </div>
                      <span class="sw-exp-tag">${escapeHtml(t.tag)}</span>
                    </article>`
                  )
                  .join('')}
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  _triggerNotebookEntrance() {
    if (this.state.edition !== 'a') return;
    const panel = this.rootEl.querySelector('[data-lu-panel="notebook"]');
    if (!panel) return;
    const book = panel.querySelector('#luNotebookBook');
    this._syncNotebookPageDom();
    if (!book) return;

    if (this.coverFlipTimer) clearTimeout(this.coverFlipTimer);
    if (prefersReducedMotion()) {
      book.classList.add('is-opened');
      return;
    }
    book.classList.remove('is-opened');
    this.coverFlipTimer = setTimeout(() => {
      book.classList.add('is-opened');
    }, 90);
  }

  _syncNotebookPageDom() {
    const panel = this.rootEl.querySelector('[data-lu-panel="notebook"]');
    if (!panel) return;
    const page = this.state.notebookPage;
    panel.querySelectorAll('[data-nb-pane]').forEach((pane) => {
      pane.hidden = pane.getAttribute('data-nb-pane') !== page;
    });
    panel.querySelectorAll('.lu-nb-tabs [data-nb-page]').forEach((tab) => {
      tab.classList.toggle('is-active', tab.getAttribute('data-nb-page') === page);
    });
  }

  /* ==========================================================================
     STATION 02 — OVERSEAS CREATOR MARKETING (TV / Video Archive)
     - Edition A: Freestanding 90s Beige SVGA CRT + Darkroom 35mm Contact Sheet & Tape Spines
     - Edition B: Poolside_TV.mov + Campaign_Archive Finder Dual Draggable Mac Windows
     - Edition C: Pure Swiss Native-Aspect (9:16 / 16:9) Inline Video Wall (Zero Bezel)
     ========================================================================== */
  _renderTvPanel() {
    const panel = this.rootEl.querySelector('[data-lu-panel="tv"]');
    if (!panel) return;
    const ed = this.state.edition;
    const crtFrameUrl = this.assetUrl('retro-crt.png');

    if (ed === 'a') {
      panel.innerHTML = `
        <div class="ed-a-tv-stage" data-stop-backdrop>
          <!-- LEFT: Freestanding 90s Beige SVGA CRT Floating Directly in Space -->
          <div class="ed-a-crt-unit">
            <div class="lu-svga-crt has-crt-frame" id="luSvgaCrt">
              <div class="lu-svga-screen" id="luSvgaScreen" data-tv-play-toggle title="点击画面播放 / 暂停">
                <div class="lu-svga-player-mount" id="luCrtPlayerMount"></div>
                <div class="ed-a-crt-osd" id="luCrtOsd">CH 01 · PLAY ▶</div>
                <div class="lu-svga-scanlines" aria-hidden="true"></div>
                <div class="lu-crt-static" id="luCrtStatic" aria-hidden="true"></div>
              </div>
              <img
                class="lu-svga-frame"
                src="${escapeHtml(crtFrameUrl)}"
                alt="1990s SVGA CRT Monitor"
                draggable="false"
              />
            </div>

            <!-- Tactile Hardware Buttons Directly Under Monitor Stand -->
            <div class="ed-a-crt-controls">
              <div class="ed-a-hw-btns">
                <button type="button" class="ed-a-hw-btn" data-tv-step="-1" title="上一条">◀</button>
                <button type="button" class="ed-a-hw-btn" id="luHwPlayBtn" data-tv-play-toggle title="播放 / 暂停">❚❚</button>
                <button type="button" class="ed-a-hw-btn" data-tv-step="1" title="下一条">▶</button>
                <button type="button" class="ed-a-hw-btn ed-a-hw-btn--sound" id="luHwMuteBtn" data-tv-mute-toggle>
                  🔇 声音
                </button>
              </div>
              <div class="ed-a-active-line">
                <span id="luEdAActiveMeta"></span>
                <a id="luEdAActiveLink" class="ed-a-ext-arrow" href="#" target="_blank" rel="noopener noreferrer" title="打开原帖">↗</a>
              </div>
            </div>
          </div>

          <!-- RIGHT: Physical Tape Tabs + Darkroom 35mm Contact Sheet -->
          <div class="ed-a-contact-wrap">
            <div class="ed-a-tape-tabs" role="tablist" aria-label="切换海外红人 Campaign">
              ${TV_CHANNELS.map(
                (ch) => `
                <button type="button" role="tab" class="ed-a-tape-tab" data-tv-channel="${escapeHtml(ch.key)}">
                  <strong>${escapeHtml(ch.name)}</strong>
                  <span>${escapeHtml(ch.tapeStat)}</span>
                </button>`
              ).join('')}
              <button type="button" class="ed-a-whisper-close ed-a-whisper-close--inline" data-lu-close aria-label="返回桌面">× ESC</button>
            </div>

            <div class="ed-a-contact-sheet">
              <div class="ed-a-sheet-ledger" id="luEdALedger"></div>
              <div class="ed-a-film-grid" id="luEdAFilmGrid" role="list"></div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (ed === 'b') {
      const tvWin = renderMacWindow({
        id: 'psWinTvPlayer',
        title: 'Poolside_TV.mov',
        className: 'ps-win-tv-player',
        bodyHtml: `
          <div class="ps-qt-viewport" id="luCrtPlayerMount" data-tv-play-toggle></div>
          <div class="ps-qt-transport">
            <button type="button" class="ps-qt-btn" data-tv-step="-1" title="Previous">|◀</button>
            <button type="button" class="ps-qt-btn" id="luHwPlayBtn" data-tv-play-toggle title="Play / Pause">❚❚</button>
            <button type="button" class="ps-qt-btn" data-tv-step="1" title="Next">▶|</button>
            <div class="ps-qt-scrub" data-tv-scrub title="点击跳转进度">
              <div class="ps-qt-scrub-fill" id="luPsScrubFill"></div>
            </div>
            <button type="button" class="ps-qt-btn ps-qt-btn--sound" id="luHwMuteBtn" data-tv-mute-toggle>SOUND: OFF</button>
          </div>
          <div class="ps-qt-caption">
            <span id="luPsNowPlaying"></span>
            <a id="luPsExtLink" class="ps-ext-link" href="#" target="_blank" rel="noopener noreferrer">↗</a>
          </div>
        `
      });

      const finderWin = renderMacWindow({
        id: 'psWinTvFinder',
        title: 'Campaign_Archive — Finder',
        className: 'ps-win-tv-finder',
        bodyHtml: `
          <div class="ps-folder-tabs" role="tablist">
            ${TV_CHANNELS.map(
              (ch) => `
              <button type="button" role="tab" class="ps-folder-tab" data-tv-channel="${escapeHtml(ch.key)}">
                ${escapeHtml(ch.name)}
              </button>`
            ).join('')}
          </div>
          <div class="ps-finder-summary" id="luPsFinderSummary"></div>
          <div class="ps-finder-list-head">
            <span>Preview</span>
            <span>Creator</span>
            <span>Metrics</span>
            <span>Link</span>
          </div>
          <div class="ps-finder-list" id="luPsFinderList" role="list"></div>
        `
      });

      panel.innerHTML = `<div class="ps-desktop-cluster ps-desktop-cluster--tv" data-stop-backdrop>${tvWin}${finderWin}</div>`;
      return;
    }

    /* Edition C: Pure Inline Swiss Contact Sheet (Zero TV Bezel!) */
    panel.innerHTML = `
      <div class="sw-sheet sw-sheet--tv" data-stop-backdrop>
        <div class="sw-sheet-inner">
          <header class="sw-topbar">
            <div class="sw-topbar-left">
              <span class="sw-idx">01 / OVERSEAS CREATOR MARKETING</span>
              <h2 class="sw-page-title">海外红人营销</h2>
            </div>
            <button type="button" class="sw-close-btn" data-lu-close>CLOSE [ESC]</button>
          </header>

          <div class="sw-tv-indexbar">
            <div class="sw-tv-tabs" role="tablist">
              ${TV_CHANNELS.map(
                (ch) => `
                <button type="button" role="tab" class="sw-tv-tab" data-tv-channel="${escapeHtml(ch.key)}">
                  <span class="sw-tv-tab-num">${escapeHtml(ch.channelNum)}</span>
                  <strong>${escapeHtml(ch.name)}</strong>
                  <span class="sw-tv-tab-stat">(${escapeHtml(ch.tapeStat)})</span>
                </button>`
              ).join('')}
            </div>
            <div class="sw-tv-ledger" id="luSwTvLedger"></div>
          </div>

          <div class="sw-video-wall" id="luSwVideoWall" role="list"></div>
        </div>
      </div>
    `;
  }

  _getChannelDef(key) {
    if (key === 'all') return TV_ALL_CHANNEL;
    return TV_CHANNELS.find((c) => c.key === key) || TV_CHANNELS[0];
  }

  _getReelsForChannel(key) {
    if (key === 'all') return CREATOR_REELS;
    const validKey = TV_CHANNELS.some((c) => c.key === key) ? key : 'seedance';
    return CREATOR_REELS.filter((r) => r.campaign === validKey);
  }

  switchChannel(channelKey) {
    const valid = TV_CHANNELS.some((c) => c.key === channelKey);
    if (!valid) return false;

    this.state.tvChannel = channelKey;
    this.state.tvPaused = false;
    if (!this.state.tvFrameByChannel[channelKey]) {
      this.state.tvFrameByChannel[channelKey] = this._getChannelDef(channelKey).defaultFrame;
    }
    this._updateTvDom({ flash: true });
    return true;
  }

  _stepTvReel(delta) {
    const reels = this._getReelsForChannel(this.state.tvChannel);
    if (!reels.length) return;
    const curFrame = this.state.tvFrameByChannel[this.state.tvChannel];
    const idx = Math.max(0, reels.findIndex((r) => r.frame === curFrame));
    const nextReel = reels[(idx + delta + reels.length) % reels.length];
    this.state.tvFrameByChannel[this.state.tvChannel] = nextReel.frame;
    this.state.tvPaused = false;
    this._updateTvDom({ flash: true });
  }

  _toggleTvPlayPause() {
    const panel = this.rootEl && this.rootEl.querySelector('[data-lu-panel="tv"]');
    if (!panel) return;
    const vid = panel.querySelector('#luCrtPlayerMount video');
    if (!vid) return;
    if (vid.paused) {
      this.state.tvPaused = false;
      vid.play().catch(() => {});
    } else {
      this.state.tvPaused = true;
      vid.pause();
    }
    this._syncTvTransportLabels();
  }

  _toggleTvMute() {
    this.state.tvMuted = !this.state.tvMuted;
    const panel = this.rootEl && this.rootEl.querySelector('[data-lu-panel="tv"]');
    if (!panel) return;

    if (this.state.edition === 'c') {
      const activeVid = panel.querySelector('.sw-vcell.is-playing video');
      if (activeVid) {
        activeVid.muted = this.state.tvMuted;
        const badge = panel.querySelector('.sw-vcell.is-playing [data-sw-mute-btn]');
        if (badge) badge.textContent = this.state.tvMuted ? 'SOUND OFF' : 'SOUND ON';
      }
      return;
    }

    const vid = panel.querySelector('#luCrtPlayerMount video');
    if (vid) {
      vid.muted = this.state.tvMuted;
      if (!this.state.tvMuted && vid.paused) {
        vid.play().catch(() => {});
      }
    } else {
      /* Remount YouTube iframe with updated mute parameter */
      this.state.tvMountedKey = null;
      this._updateTvDom({ flash: false });
    }
    this._syncTvTransportLabels();
  }

  _syncTvTransportLabels() {
    const panel = this.rootEl && this.rootEl.querySelector('[data-lu-panel="tv"]');
    if (!panel) return;
    const ed = this.state.edition;
    const playBtn = panel.querySelector('#luHwPlayBtn');
    const muteBtn = panel.querySelector('#luHwMuteBtn');

    if (playBtn) {
      playBtn.textContent = this.state.tvPaused ? '▶' : '❚❚';
    }
    if (muteBtn) {
      if (ed === 'a') {
        muteBtn.textContent = this.state.tvMuted ? '🔇 声音' : '🔊 声音';
        muteBtn.classList.toggle('is-unmuted', !this.state.tvMuted);
      } else if (ed === 'b') {
        muteBtn.textContent = this.state.tvMuted ? 'SOUND: OFF' : 'SOUND: ON';
        muteBtn.classList.toggle('is-unmuted', !this.state.tvMuted);
      }
    }

    const osd = panel.querySelector('#luCrtOsd');
    if (osd) {
      const ch = this._getChannelDef(this.state.tvChannel);
      const reels = this._getReelsForChannel(this.state.tvChannel);
      const activeFrame = this.state.tvFrameByChannel[this.state.tvChannel] || ch.defaultFrame;
      const reel = reels.find((r) => r.frame === activeFrame) || reels[0];
      osd.textContent = `CH ${ch.channelNum} · ${this.state.tvPaused ? 'PAUSE ❚❚' : 'PLAY ▶'} ${reel.handle}`;
    }
  }

  /**
   * Mounts clean video (ZERO browser <video controls>!) or clean YouTube iframe
   */
  _mountCleanMedia(mountEl, reel, { muted = true, coverFit = false, onTimeUpdate = null } = {}) {
    if (!mountEl || !reel) return;
    mountEl.innerHTML = '';

    const posterSrc = this.assetUrl(reel.posterFile);

    if (!coverFit) {
      const backdrop = document.createElement('div');
      backdrop.className = 'lu-inline-backdrop';
      backdrop.style.backgroundImage = `url("${posterSrc}")`;
      mountEl.appendChild(backdrop);
    }

    const mountYoutube = () => {
      if (!reel.embedUrl) return;
      const posterUnderlay = document.createElement('img');
      posterUnderlay.className = 'lu-yt-poster-underlay';
      posterUnderlay.src = posterSrc;
      posterUnderlay.alt = '';
      mountEl.appendChild(posterUnderlay);

      let src = reel.embedUrl;
      if (!src.includes('mute=')) {
        src += (src.includes('?') ? '&' : '?') + `mute=${muted ? '1' : '0'}`;
      }
      const iframe = document.createElement('iframe');
      iframe.className = 'lu-clean-iframe';
      iframe.src = src;
      iframe.title = reel.handle;
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      iframe.setAttribute('allowfullscreen', '');
      iframe.addEventListener('load', () => iframe.classList.add('is-loaded'));
      mountEl.appendChild(iframe);
    };

    const primaryVideoSrc = reel.localMp4 ? this.assetUrl(reel.localMp4) : reel.mp4Url || '';
    if (!primaryVideoSrc) {
      mountYoutube();
      return;
    }

    const video = document.createElement('video');
    video.className = `lu-clean-video ${coverFit ? 'is-cover' : 'is-contain'}`;
    video.poster = posterSrc;
    video.controls = false;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.muted = muted;
    video.preload = 'metadata';
    video.setAttribute('playsinline', '');
    if (muted) video.setAttribute('muted', '');

    video.addEventListener('loadedmetadata', () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          video.muted = true;
          this.state.tvMuted = true;
          this._syncTvTransportLabels();
          video.play().catch(() => {});
        });
      }
    });

    if (typeof onTimeUpdate === 'function') {
      video.addEventListener('timeupdate', () => {
        if (video.duration > 0) {
          onTimeUpdate(video.currentTime / video.duration);
        }
      });
    }

    video.addEventListener('error', () => {
      if (reel.mp4Url && video.dataset.triedRemote !== '1' && primaryVideoSrc !== reel.mp4Url) {
        video.dataset.triedRemote = '1';
        video.src = reel.mp4Url;
        video.load();
        return;
      }
      if (reel.embedUrl) mountYoutube();
    });

    video.src = primaryVideoSrc;
    mountEl.appendChild(video);
  }

  _teardownTvMedia() {
    if (!this.rootEl) return;
    const panel = this.rootEl.querySelector('[data-lu-panel="tv"]');
    if (!panel) return;
    panel.querySelectorAll('video').forEach((v) => {
      try {
        v.pause();
        v.removeAttribute('src');
        v.load();
      } catch (_) {}
    });
    panel.querySelectorAll('iframe').forEach((f) => f.remove());
    this.state.tvMountedKey = null;
    this.state.tvRenderedKey = null;
  }

  _updateTvDom({ flash = false } = {}) {
    const panel = this.rootEl && this.rootEl.querySelector('[data-lu-panel="tv"]');
    if (!panel) return;

    const ed = this.state.edition;
    if (!TV_CHANNELS.some((c) => c.key === this.state.tvChannel)) {
      this.state.tvChannel = 'seedance';
    }
    const chKey = this.state.tvChannel;
    const channel = this._getChannelDef(chKey);
    const reels = this._getReelsForChannel(chKey);
    const activeFrame = this.state.tvFrameByChannel[chKey] || channel.defaultFrame;
    const reel = reels.find((r) => r.frame === activeFrame) || reels[0];

    /* Highlight active channel tab across any edition */
    panel.querySelectorAll('[data-tv-channel]').forEach((btn) => {
      const active = btn.getAttribute('data-tv-channel') === chKey;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    /* --- EDITION C: Pure Inline Swiss Native-Aspect Video Wall --- */
    if (ed === 'c') {
      const ledgerEl = panel.querySelector('#luSwTvLedger');
      if (ledgerEl) {
        ledgerEl.textContent = channel.ledgerPills.join(' · ');
      }

      const wallEl = panel.querySelector('#luSwVideoWall');
      if (!wallEl) return;

      const renderKey = `c::${chKey}`;
      if (this.state.tvRenderedKey !== renderKey) {
        this.state.tvRenderedKey = renderKey;
        const isVerticalWall = chKey === 'seedance';
        wallEl.className = `sw-video-wall ${isVerticalWall ? 'sw-video-wall--9x16' : 'sw-video-wall--16x9'}`;

        wallEl.innerHTML = reels
          .map((item) => {
            const posterSrc = this.assetUrl(item.posterFile);
            return `
              <article
                class="sw-vcell ${isVerticalWall ? 'is-9x16' : 'is-16x9'}"
                role="listitem"
                data-sw-cell="${escapeHtml(item.frame)}"
              >
                <div class="sw-vcell-stage" data-sw-play="${escapeHtml(item.frame)}">
                  <img class="sw-vcell-poster" src="${escapeHtml(posterSrc)}" alt="${escapeHtml(item.handle)}" loading="lazy" />
                  <div class="sw-vcell-live" data-sw-mount></div>
                  <span class="sw-vcell-play-glyph" aria-hidden="true">▶</span>
                  <div class="sw-vcell-hud">
                    <button type="button" class="sw-micro-btn" data-sw-toggle-pause="${escapeHtml(item.frame)}">PAUSE</button>
                    <button type="button" class="sw-micro-btn" data-sw-mute-btn="${escapeHtml(item.frame)}">${this.state.tvMuted ? 'SOUND OFF' : 'SOUND ON'}</button>
                  </div>
                  <div class="sw-vcell-progress"><i data-sw-bar></i></div>
                </div>
                <div class="sw-vcell-meta">
                  <div class="sw-vcell-line1">
                    <span><em>${escapeHtml(item.campIdx)}</em> <strong>${escapeHtml(item.handle)}</strong></span>
                    <a class="sw-vcell-ext" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="打开原帖">↗</a>
                  </div>
                  <div class="sw-vcell-line2">${escapeHtml(item.verbatimMetrics)}</div>
                </div>
              </article>
            `;
          })
          .join('');
      }

      /* Auto-play the active cell inline in place! */
      this._playSwissCellInline(panel, reel, { userInitiated: false });
      return;
    }

    /* --- EDITION A & EDITION B: Shared CRT / QuickTime Mount + Sheet / Finder List --- */
    if (flash && ed === 'a' && !prefersReducedMotion()) {
      const staticEl = panel.querySelector('#luCrtStatic');
      if (staticEl) {
        staticEl.classList.remove('is-flashing');
        void staticEl.offsetWidth;
        staticEl.classList.add('is-flashing');
      }
    }

    const mountKey = `${ed}::${reel.frame}`;
    const mountEl = panel.querySelector('#luCrtPlayerMount');
    if (mountEl && this.state.tvMountedKey !== mountKey) {
      this.state.tvMountedKey = mountKey;
      this.state.tvPaused = false;
      const scrubFill = panel.querySelector('#luPsScrubFill');
      if (scrubFill) scrubFill.style.width = '0%';

      this._mountCleanMedia(mountEl, reel, {
        muted: this.state.tvMuted,
        coverFit: false,
        onTimeUpdate: (ratio) => {
          const bar = panel.querySelector('#luPsScrubFill');
          if (bar) bar.style.width = `${(ratio * 100).toFixed(1)}%`;
        }
      });
    }

    this._syncTvTransportLabels();

    if (ed === 'a') {
      const metaEl = panel.querySelector('#luEdAActiveMeta');
      const linkEl = panel.querySelector('#luEdAActiveLink');
      const ledgerEl = panel.querySelector('#luEdALedger');
      const gridEl = panel.querySelector('#luEdAFilmGrid');

      if (metaEl) metaEl.textContent = `${reel.origSlot} · ${reel.verbatimMetrics}`;
      if (linkEl) linkEl.href = reel.url;
      if (ledgerEl) {
        ledgerEl.innerHTML = `<strong>${escapeHtml(channel.name)}</strong><span>${escapeHtml(channel.ledgerPills.join(' · '))}</span>`;
      }

      const renderKey = `a::${chKey}`;
      if (gridEl && this.state.tvRenderedKey !== renderKey) {
        this.state.tvRenderedKey = renderKey;
        gridEl.innerHTML = reels
          .map((item) => {
            const posterSrc = this.assetUrl(item.posterFile);
            const active = item.frame === reel.frame;
            return `
              <article
                class="ed-a-film-frame ${active ? 'is-selected' : ''}"
                role="listitem"
                data-tv-select-frame="${escapeHtml(item.frame)}"
              >
                <div class="ed-a-film-edge">
                  <span>${escapeHtml(item.frame)}</span>
                  <a class="ed-a-frame-ext" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="打开原帖">↗</a>
                </div>
                <div class="ed-a-film-thumb ${item.ratio === '9:16' ? 'is-portrait' : ''}">
                  <img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(item.handle)}" loading="lazy" />
                </div>
                <div class="ed-a-film-caption">
                  <strong>${escapeHtml(item.handle)}</strong>
                  <span>${escapeHtml(item.verbatimMetrics)}</span>
                </div>
              </article>
            `;
          })
          .join('');
      } else if (gridEl) {
        gridEl.querySelectorAll('[data-tv-select-frame]').forEach((el) => {
          el.classList.toggle('is-selected', el.getAttribute('data-tv-select-frame') === reel.frame);
        });
      }
      return;
    }

    if (ed === 'b') {
      const nowEl = panel.querySelector('#luPsNowPlaying');
      const extEl = panel.querySelector('#luPsExtLink');
      const sumEl = panel.querySelector('#luPsFinderSummary');
      const listEl = panel.querySelector('#luPsFinderList');

      if (nowEl) nowEl.textContent = `${reel.handle} · ${reel.verbatimMetrics}`;
      if (extEl) extEl.href = reel.url;
      if (sumEl) sumEl.textContent = channel.ledgerPills.join(' · ');

      const renderKey = `b::${chKey}`;
      if (listEl && this.state.tvRenderedKey !== renderKey) {
        this.state.tvRenderedKey = renderKey;
        listEl.innerHTML = reels
          .map((item) => {
            const posterSrc = this.assetUrl(item.posterFile);
            const active = item.frame === reel.frame;
            return `
              <div
                class="ps-finder-row ${active ? 'is-selected' : ''}"
                role="listitem"
                data-tv-select-frame="${escapeHtml(item.frame)}"
              >
                <div class="ps-finder-thumb">
                  <img src="${escapeHtml(posterSrc)}" alt="${escapeHtml(item.handle)}" loading="lazy" />
                </div>
                <div class="ps-finder-creator">
                  <strong>${escapeHtml(item.handle)}</strong>
                  <small>${escapeHtml(item.origSlot)}</small>
                </div>
                <div class="ps-finder-metrics">${escapeHtml(item.verbatimMetrics)}</div>
                <a class="ps-finder-ext" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="打开原帖">↗</a>
              </div>
            `;
          })
          .join('');
      } else if (listEl) {
        listEl.querySelectorAll('[data-tv-select-frame]').forEach((el) => {
          el.classList.toggle('is-selected', el.getAttribute('data-tv-select-frame') === reel.frame);
        });
      }
    }
  }

  _playSwissCellInline(panel, reel, { userInitiated = true } = {}) {
    if (!panel || !reel) return;

    /* Tear down any other playing cell in the Swiss wall */
    panel.querySelectorAll('.sw-vcell').forEach((cell) => {
      const isTarget = cell.getAttribute('data-sw-cell') === reel.frame;
      if (!isTarget && cell.classList.contains('is-playing')) {
        cell.querySelectorAll('video').forEach((v) => {
          try {
            v.pause();
            v.removeAttribute('src');
            v.load();
          } catch (_) {}
        });
        const m = cell.querySelector('[data-sw-mount]');
        if (m) m.innerHTML = '';
        cell.classList.remove('is-playing', 'is-paused');
      }
    });

    const targetCell = panel.querySelector(`[data-sw-cell="${CSS.escape(reel.frame)}"]`);
    if (!targetCell) return;

    if (userInitiated && this.state.tvMuted) {
      this.state.tvMuted = false;
    }

    const mountEl = targetCell.querySelector('[data-sw-mount]');
    if (!mountEl) return;

    /* If already mounted and user clicked stage, toggle play/pause cleanly */
    const existingVid = mountEl.querySelector('video');
    if (existingVid && targetCell.classList.contains('is-playing')) {
      if (existingVid.paused) {
        existingVid.play().catch(() => {});
        targetCell.classList.remove('is-paused');
      } else if (userInitiated) {
        existingVid.pause();
        targetCell.classList.add('is-paused');
      }
      const pauseBtn = targetCell.querySelector('[data-sw-toggle-pause]');
      if (pauseBtn) pauseBtn.textContent = existingVid.paused ? 'PLAY' : 'PAUSE';
      return;
    }

    targetCell.classList.add('is-playing');
    targetCell.classList.remove('is-paused');
    this.state.cPlayingFrame = reel.frame;
    this.state.tvFrameByChannel[reel.campaign] = reel.frame;

    const muteBtn = targetCell.querySelector('[data-sw-mute-btn]');
    if (muteBtn) muteBtn.textContent = this.state.tvMuted ? 'SOUND OFF' : 'SOUND ON';

    /* For YouTube embeds in Edition C, keep all 5 crisp posters visible until user clicks any cell to play inline */
    if (!reel.localMp4 && !reel.mp4Url && !userInitiated) {
      targetCell.classList.remove('is-playing');
      return;
    }

    const isPortrait = reel.ratio === '9:16';
    this._mountCleanMedia(mountEl, reel, {
      muted: this.state.tvMuted,
      coverFit: isPortrait,
      onTimeUpdate: (ratio) => {
        const bar = targetCell.querySelector('[data-sw-bar]');
        if (bar) bar.style.width = `${(ratio * 100).toFixed(1)}%`;
      }
    });

    const hud = targetCell.querySelector('.sw-vcell-hud');
    if (hud) hud.hidden = Boolean(!reel.localMp4 && !reel.mp4Url);
  }

  /* ==========================================================================
     STATION 03 — JOURNALISM ARCHIVE (All 10 Articles on One Single Page)
     Zero AI blurbs, zero invented English kickers, zero repeated footers!
     ========================================================================== */
  _renderNewspaperPanel() {
    const panel = this.rootEl.querySelector('[data-lu-panel="newspaper"]');
    if (!panel) return;
    const ed = this.state.edition;
    const [insightSec, timesSec, bydSec] = NEWSPAPER_DATA.sections;

    if (ed === 'a') {
      panel.innerHTML = `
        <div class="ed-a-press-wrap" data-stop-backdrop>
          <button type="button" class="ed-a-whisper-close" data-lu-close aria-label="返回桌面">× ESC</button>

          <article class="ed-a-broadsheet">
            <header class="ed-a-bs-head">
              <div class="ed-a-bs-meta">
                <span>02 / JOURNALISM ARCHIVE</span>
                <span>连线 Insight · 时代周报 · 北京青年报</span>
                <span>卢倩莹 Lulu</span>
              </div>
              <h2>记者作品集</h2>
            </header>

            <!-- Top 2 Columns with Traditional Vertical Ink Rule -->
            <div class="ed-a-bs-upper">
              <section class="ed-a-bs-col">
                <div class="ed-a-bs-outlet">
                  <strong>${escapeHtml(insightSec.outlet)}</strong>
                  <span>${escapeHtml(insightSec.intro)}</span>
                </div>
                <div class="ed-a-bs-list">
                  ${insightSec.articles
                    .map(
                      (a) => `
                      <a class="ed-a-bs-item" href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer">
                        <small>${escapeHtml(a.idx)} · ${escapeHtml(a.category)}</small>
                        <h3><span>${escapeHtml(a.title)}</span><i aria-hidden="true">↗</i></h3>
                      </a>`
                    )
                    .join('')}
                </div>
              </section>

              <section class="ed-a-bs-col">
                <div class="ed-a-bs-outlet">
                  <strong>${escapeHtml(timesSec.outlet)}</strong>
                  <span>${escapeHtml(timesSec.intro)}</span>
                </div>
                <div class="ed-a-bs-list">
                  ${timesSec.articles
                    .map(
                      (a) => `
                      <a class="ed-a-bs-item" href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer">
                        <small>${escapeHtml(a.idx)} · ${escapeHtml(a.category)}</small>
                        <h3><span>${escapeHtml(a.title)}</span><i aria-hidden="true">↗</i></h3>
                      </a>`
                    )
                    .join('')}
                </div>
              </section>
            </div>

            <!-- Lower Full-Width Section: 北京青年报 (Vertical Column Rule, Zero Dashed Boxes) -->
            <section class="ed-a-bs-lower">
              <div class="ed-a-bs-outlet ed-a-bs-outlet--byd">
                <strong>${escapeHtml(bydSec.outlet)}</strong>
                <span>${escapeHtml(bydSec.intro)}</span>
              </div>
              <div class="ed-a-bs-byd-cols">
                ${bydSec.articles
                  .map(
                    (a) => `
                    <a class="ed-a-bs-item" href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer">
                      <small>${escapeHtml(a.idx)} · ${escapeHtml(a.category)}</small>
                      <h3><span>${escapeHtml(a.title)}</span><i aria-hidden="true">↗</i></h3>
                    </a>`
                  )
                  .join('')}
              </div>
            </section>
          </article>
        </div>
      `;
      return;
    }

    if (ed === 'b') {
      const pressWin = renderMacWindow({
        title: 'The_Studio_Dispatch.press',
        className: 'ps-win-press',
        statusHtml: `<span>10 articles · 连线 Insight · 时代周报 · 北京青年报</span><span>Click headline to read ↗</span>`,
        bodyHtml: `
          <div class="ps-press-grid">
            ${NEWSPAPER_DATA.sections
              .map(
                (sec) => `
                <section class="ps-press-sec ps-press-sec--${escapeHtml(sec.key)}">
                  <div class="ps-press-sec-head">
                    <strong>${escapeHtml(sec.outlet)}</strong>
                    <span>${escapeHtml(sec.intro)}</span>
                  </div>
                  <div class="ps-press-rows">
                    ${sec.articles
                      .map(
                        (a) => `
                        <a class="ps-press-row" href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer">
                          <span class="ps-press-idx">${escapeHtml(a.idx)}</span>
                          <span class="ps-press-cat">${escapeHtml(a.category)}</span>
                          <strong class="ps-press-title">${escapeHtml(a.title)}</strong>
                          <span class="ps-press-arrow">↗</span>
                        </a>`
                      )
                      .join('')}
                  </div>
                </section>`
              )
              .join('')}
          </div>
        `
      });

      panel.innerHTML = `<div class="ps-desktop-cluster" data-stop-backdrop>${pressWin}</div>`;
      return;
    }

    /* Edition C: Standards Manual / Read.cv 10-Row Swiss Index Table */
    const flatArticles = NEWSPAPER_DATA.sections.flatMap((sec) =>
      sec.articles.map((a) => ({ ...a, outlet: sec.outlet }))
    );

    panel.innerHTML = `
      <div class="sw-sheet" data-stop-backdrop>
        <div class="sw-sheet-inner">
          <header class="sw-topbar">
            <div class="sw-topbar-left">
              <span class="sw-idx">02 / JOURNALISM ARCHIVE</span>
              <h2 class="sw-page-title">记者作品集</h2>
            </div>
            <button type="button" class="sw-close-btn" data-lu-close>CLOSE [ESC]</button>
          </header>

          <div class="sw-press-table" role="table" aria-label="记者作品目录">
            <div class="sw-press-thead" role="row">
              <span>NO.</span>
              <span>PUBLICATION</span>
              <span>HEADLINE</span>
              <span>BEAT</span>
              <span>LINK</span>
            </div>
            ${flatArticles
              .map(
                (a) => `
                <a class="sw-press-trow" role="row" href="${escapeHtml(a.url)}" target="_blank" rel="noopener noreferrer">
                  <span class="sw-pt-num">${escapeHtml(a.idx)}</span>
                  <span class="sw-pt-outlet">${escapeHtml(a.outlet)}</span>
                  <strong class="sw-pt-title">${escapeHtml(a.title)}</strong>
                  <span class="sw-pt-cat">${escapeHtml(a.category)}</span>
                  <span class="sw-pt-ext">↗</span>
                </a>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  flipNewspaper() {
    return 'single';
  }

  /* ==========================================================================
     STATION 04 — TWO-TIER WALNUT SHELF
     ========================================================================== */
  _renderShelfPanel() {
    const panel = this.rootEl.querySelector('[data-lu-panel="shelf"]');
    const titleList = SHELF_DATA.books.map((book) => book.title).join('、');
    panel.innerHTML = `
      <div class="lu-shelf-stage" data-stop-backdrop>
        <button type="button" class="ed-a-whisper-close" data-lu-close aria-label="返回桌面">× ESC</button>
        <div class="lu-shelf-viewport" data-shelf-viewport data-shelf-label="双层木书架特写，书架上有${escapeHtml(titleList)}、拍立得合照和相机"></div>
      </div>
    `;
  }

  async _startShelfView() {
    if (this.shelfView) return;
    const viewport = this.rootEl.querySelector('[data-shelf-viewport]');
    const controller = new AbortController();
    this.shelfView = controller;
    viewport.setAttribute('role', 'img');
    viewport.setAttribute('aria-label', viewport.dataset.shelfLabel);
    viewport.setAttribute('aria-busy', 'true');
    viewport.replaceChildren();

    try {
      const { createShelfView } = await import('./studio-shelf.js?v=5');
      if (controller.signal.aborted) return;
      await createShelfView(viewport, (file) => this.assetUrl(file), SHELF_DATA, controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.warn('Unable to open the 3D shelf.', error);
        viewport.removeAttribute('role');
        viewport.removeAttribute('aria-label');
        viewport.innerHTML = '<p class="lu-shelf-unavailable" role="status">暂时无法加载 3D 书架。返回桌面后可以重试。</p>';
      }
    } finally {
      if (!controller.signal.aborted) viewport.removeAttribute('aria-busy');
    }
  }

  _stopShelfView() {
    this.shelfView?.abort();
    this.shelfView = null;
  }

  /* ==========================================================================
     STATION 05 — CONTACT / TYPEWRITER
     ========================================================================== */
  _renderTypewriterPanel() {
    const panel = this.rootEl.querySelector('[data-lu-panel="typewriter"]');
    if (!panel) return;
    const ed = this.state.edition;
    const d = this.state.letterDraft;

    const formInnerHtml = `
      <form class="lu-contact-form" id="luTwForm" novalidate>
        <div class="lu-cf-field">
          <label for="luInputMessage">${escapeHtml(TYPEWRITER_DATA.fields.messageLabel)}</label>
          <textarea id="luInputMessage" placeholder="${escapeHtml(TYPEWRITER_DATA.fields.messagePlaceholder)}">${escapeHtml(d.message)}</textarea>
        </div>
        <div class="lu-cf-row">
          <div class="lu-cf-field">
            <label for="luInputName">${escapeHtml(TYPEWRITER_DATA.fields.nameLabel)}</label>
            <input id="luInputName" type="text" value="${escapeHtml(d.name)}" placeholder="${escapeHtml(TYPEWRITER_DATA.fields.namePlaceholder)}" />
          </div>
          <div class="lu-cf-field">
            <label for="luInputContact">${escapeHtml(TYPEWRITER_DATA.fields.contactLabel)}</label>
            <input id="luInputContact" type="text" value="${escapeHtml(d.contact)}" placeholder="${escapeHtml(TYPEWRITER_DATA.fields.contactPlaceholder)}" />
          </div>
        </div>
        <div class="lu-cf-actions">
          <button type="submit" class="lu-cf-submit">${escapeHtml(TYPEWRITER_DATA.submitLabel)}</button>
          <a class="lu-cf-mailto" href="${escapeHtml(TYPEWRITER_DATA.mailto)}">${escapeHtml(TYPEWRITER_DATA.email)} ↗</a>
        </div>
      </form>
    `;

    const sealedHtml = `
      <div class="lu-sealed-card" id="luEnvelopeWrap" hidden>
        <div class="lu-sealed-badge">${escapeHtml(TYPEWRITER_DATA.stampWord)}</div>
        <small id="luEnvSenderLine">FROM: 访客</small>
        <p id="luEnvExcerpt"></p>
        <div class="lu-cf-actions">
          <a class="lu-cf-submit" id="luEnvMailLink" href="${escapeHtml(TYPEWRITER_DATA.mailto)}">发送邮件：${escapeHtml(TYPEWRITER_DATA.email)} ↗</a>
          <button type="button" class="lu-cf-reset" data-tw-reset>重写</button>
        </div>
      </div>
    `;

    if (ed === 'a') {
      panel.innerHTML = `
        <div class="ed-a-tw-stage" data-stop-backdrop>
          <button type="button" class="ed-a-whisper-close" data-lu-close aria-label="返回桌面">× ESC</button>
          <aside class="ed-a-sticky-float">
            <div class="lu-sticky-note">
              <p>${escapeHtml(TYPEWRITER_DATA.stickyNoteText)}</p>
            </div>
          </aside>
          <div class="ed-a-letter-sheet" id="luTwPaperSheet">
            <div class="ed-a-letter-top">
              <strong>${escapeHtml(TYPEWRITER_DATA.headlineEn)}</strong>
              <p>${escapeHtml(TYPEWRITER_DATA.intro)}</p>
            </div>
            <div class="lu-tw-typed-line"><span id="luTwTypedText"></span><span class="lu-tw-cursor"></span></div>
            ${formInnerHtml}
          </div>
          ${sealedHtml}
        </div>
      `;
      return;
    }

    if (ed === 'b') {
      const stickyWin = renderMacWindow({
        title: 'Stickies',
        className: 'ps-win-sticky',
        bodyHtml: `
          <p class="ps-sticky-big">${escapeHtml(TYPEWRITER_DATA.stickyNoteText)}</p>
          <p class="ps-sticky-sub">${escapeHtml(TYPEWRITER_DATA.intro)}</p>
          <a class="ps-mailto-link" href="${escapeHtml(TYPEWRITER_DATA.mailto)}">${escapeHtml(TYPEWRITER_DATA.email)} ↗</a>
        `
      });

      const mailWin = renderMacWindow({
        title: 'Mailer — To: louiselu671@gmail.com',
        className: 'ps-win-mailer',
        bodyHtml: `<div id="luTwPaperSheet"><span id="luTwTypedText" hidden></span>${formInnerHtml}</div>${sealedHtml}`
      });

      panel.innerHTML = `<div class="ps-desktop-cluster" data-stop-backdrop>${stickyWin}${mailWin}</div>`;
      return;
    }

    /* Edition C: Swiss 4fr : 8fr Contact Sheet */
    panel.innerHTML = `
      <div class="sw-sheet" data-stop-backdrop>
        <div class="sw-sheet-inner">
          <header class="sw-topbar">
            <div class="sw-topbar-left">
              <span class="sw-idx">04 / CONTACT</span>
              <h2 class="sw-page-title">联系与留言</h2>
            </div>
            <button type="button" class="sw-close-btn" data-lu-close>CLOSE [ESC]</button>
          </header>

          <div class="sw-grid-asym">
            <aside class="sw-col-left">
              <h3 class="sw-big-serif">${escapeHtml(TYPEWRITER_DATA.headlineEn)}</h3>
              <p class="sw-bio-p">${escapeHtml(TYPEWRITER_DATA.intro)}</p>
              <a class="sw-direct-mail" href="${escapeHtml(TYPEWRITER_DATA.mailto)}">${escapeHtml(TYPEWRITER_DATA.email)} ↗</a>
            </aside>
            <section class="sw-col-right">
              <div id="luTwPaperSheet"><span id="luTwTypedText" hidden></span>${formInnerHtml}</div>
              ${sealedHtml}
            </section>
          </div>
        </div>
      </div>
    `;
  }

  _triggerTypewriterGreeting() {
    const panel = this.rootEl && this.rootEl.querySelector('[data-lu-panel="typewriter"]');
    if (!panel) return;
    const typedEl = panel.querySelector('#luTwTypedText');
    const paper = panel.querySelector('#luTwPaperSheet');
    const env = panel.querySelector('#luEnvelopeWrap');

    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }

    if (this.state.letterSent) {
      if (paper) paper.hidden = true;
      if (env) env.hidden = false;
      return;
    }

    if (paper) paper.hidden = false;
    if (env) env.hidden = true;
    if (!typedEl || this.state.edition !== 'a') return;

    const fullText = TYPEWRITER_DATA.typedGreeting;
    if (prefersReducedMotion()) {
      typedEl.textContent = fullText;
      return;
    }
    typedEl.textContent = '';
    let idx = 0;
    this.typingTimer = setInterval(() => {
      idx += 1;
      typedEl.textContent = fullText.slice(0, idx);
      if (idx >= fullText.length) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
      }
    }, 75);
  }

  _sealAndStampLetter() {
    const panel = this.rootEl && this.rootEl.querySelector('[data-lu-panel="typewriter"]');
    if (!panel) return;
    const paper = panel.querySelector('#luTwPaperSheet');
    const env = panel.querySelector('#luEnvelopeWrap');
    const { name, contact, message } = this.state.letterDraft;

    const sender = [name || '访客', contact].filter(Boolean).join(' · ');
    const senderEl = panel.querySelector('#luEnvSenderLine');
    const excerptEl = panel.querySelector('#luEnvExcerpt');
    const mailLink = panel.querySelector('#luEnvMailLink');

    if (senderEl) senderEl.textContent = `FROM: ${sender}`;
    if (excerptEl) excerptEl.textContent = message || TYPEWRITER_DATA.stickyNoteText;

    if (mailLink) {
      if (name || contact || message) {
        const subject = encodeURIComponent(`来自个人网站的留言 — ${name || '访客'}`);
        const body = encodeURIComponent(
          `${message || ''}\n\n— ${name || ''}\n— ${contact || ''}`
        );
        mailLink.href = `${TYPEWRITER_DATA.mailto}?subject=${subject}&body=${body}`;
      } else {
        mailLink.href = TYPEWRITER_DATA.mailto;
      }
    }

    this.state.letterSent = true;
    if (paper) paper.hidden = true;
    if (env) env.hidden = false;
  }

  /* ==========================================================================
     STATION 06 — WORKING VALUES POSTER & SIDE PROJECTS
     100% Verbatim Lulu Copy ONLY:
       - Quote: 我对工作的想象是，既要把事情推进，也要把它做得有趣。
       - 4 lines: AI 产品 / Creator strategy / Journalism / Visual systems
       - 3 side projects: 达人管理看板 / 内容对标库 / 交互式教具
     Zero invented English badges, zero 40-word corporate paragraphs!
     ========================================================================== */
  _renderPosterPanel() {
    const panel = this.rootEl.querySelector('[data-lu-panel="poster"]');
    if (!panel) return;
    const ed = this.state.edition;

    if (ed === 'a') {
      /* Edition A: Pure Vertical Risograph Paper Poster Sheet Pinned Directly in Space! */
      panel.innerHTML = `
        <div class="ed-a-poster-wrap" data-stop-backdrop>
          <button type="button" class="ed-a-whisper-close" data-lu-close aria-label="返回桌面">× ESC</button>

          <article class="ed-a-riso-sheet">
            <span class="ed-a-pin-tape ed-a-pin-tape--tl" aria-hidden="true"></span>
            <span class="ed-a-pin-tape ed-a-pin-tape--tr" aria-hidden="true"></span>

            <div class="ed-a-riso-reg">
              <span>⊕</span>
              <span>${escapeHtml(STUDIO_META.ownerCn)} ${escapeHtml(STUDIO_META.ownerEn)}</span>
              <span>⊕</span>
            </div>

            <blockquote class="ed-a-riso-quote">
              我对工作的想象是，<mark>既要把事情推进</mark>，也要把它做得有趣。
            </blockquote>

            <div class="ed-a-riso-sub">${escapeHtml(POSTER_DATA.shelfIntro)}</div>

            <div class="ed-a-riso-lines">
              ${POSTER_DATA.values
                .map(
                  (v) => `
                  <div class="ed-a-riso-line">
                    <span class="ed-a-rl-num">${escapeHtml(v.num)}</span>
                    <strong class="ed-a-rl-domain">${escapeHtml(v.domain)}</strong>
                    <span class="ed-a-rl-title">${escapeHtml(v.title)}</span>
                  </div>`
                )
                .join('')}
            </div>

            <!-- Perforated Tear-Off Slip at Bottom for the 3 Verbatim Side Projects -->
            <div class="ed-a-riso-tearoff">
              <div class="ed-a-tear-head">
                <span>${escapeHtml(POSTER_DATA.sideKicker)}</span>
                <strong>${escapeHtml(POSTER_DATA.sideHeading)}</strong>
              </div>
              <div class="ed-a-tear-list">
                ${POSTER_DATA.sideProjects
                  .map(
                    (sp) => `
                    <div class="ed-a-tear-item">
                      <strong>${escapeHtml(sp.title)}</strong>
                      <p>${escapeHtml(sp.desc)}</p>
                    </div>`
                  )
                  .join('')}
              </div>
            </div>
          </article>
        </div>
      `;
      return;
    }

    if (ed === 'b') {
      /* Edition B: Classic Mac SimpleText Window + Yellow Stickies Side_Projects Window */
      const mainWin = renderMacWindow({
        title: 'SimpleText — Working_Values.txt',
        className: 'ps-win-values',
        statusHtml: `<span>${escapeHtml(POSTER_DATA.shelfHeading)}</span><span>4 items</span>`,
        bodyHtml: `
          <blockquote class="ps-values-quote">
            我对工作的想象是，<mark>既要把事情推进</mark>，也要把它做得有趣。
          </blockquote>
          <p class="ps-values-intro">${escapeHtml(POSTER_DATA.shelfIntro)}</p>
          <div class="ps-values-table">
            ${POSTER_DATA.values
              .map(
                (v) => `
                <div class="ps-values-row">
                  <span class="ps-vr-num">${escapeHtml(v.num)}</span>
                  <strong class="ps-vr-domain">${escapeHtml(v.domain)}</strong>
                  <span class="ps-vr-title">${escapeHtml(v.title)}</span>
                </div>`
              )
              .join('')}
          </div>
        `
      });

      const sideWin = renderMacWindow({
        title: 'Stickies — Side_Projects',
        className: 'ps-win-side-notes',
        bodyHtml: `
          <div class="ps-side-intro">${escapeHtml(POSTER_DATA.sideIntro)}</div>
          <div class="ps-side-stack">
            ${POSTER_DATA.sideProjects
              .map(
                (sp) => `
                <div class="ps-side-row">
                  <small>${escapeHtml(sp.num)}</small>
                  <strong>${escapeHtml(sp.title)}</strong>
                  <p>${escapeHtml(sp.desc)}</p>
                </div>`
              )
              .join('')}
          </div>
        `
      });

      panel.innerHTML = `<div class="ps-desktop-cluster" data-stop-backdrop>${mainWin}${sideWin}</div>`;
      return;
    }

    /* Edition C: Pure Asymmetric Swiss 4fr : 8fr Manifesto Sheet */
    panel.innerHTML = `
      <div class="sw-sheet" data-stop-backdrop>
        <div class="sw-sheet-inner">
          <header class="sw-topbar">
            <div class="sw-topbar-left">
              <span class="sw-idx">05 / WORKING VALUES &amp; SIDE PROJECTS</span>
              <h2 class="sw-page-title">${escapeHtml(POSTER_DATA.shelfHeading)}</h2>
            </div>
            <button type="button" class="sw-close-btn" data-lu-close>CLOSE [ESC]</button>
          </header>

          <div class="sw-grid-asym">
            <aside class="sw-col-left">
              <blockquote class="sw-manifesto-quote">
                我对工作的想象是，<mark>既要把事情推进</mark>，也要把它做得有趣。
              </blockquote>
              <p class="sw-bio-p">${escapeHtml(POSTER_DATA.shelfIntro)}</p>
            </aside>

            <section class="sw-col-right">
              <div class="sw-values-list">
                ${POSTER_DATA.values
                  .map(
                    (v) => `
                    <div class="sw-val-row">
                      <span class="sw-val-idx">${escapeHtml(v.num)}</span>
                      <strong class="sw-val-domain">${escapeHtml(v.domain)}</strong>
                      <span class="sw-val-desc">${escapeHtml(v.title)}</span>
                    </div>`
                  )
                  .join('')}
              </div>

              <div class="sw-side-block">
                <div class="sw-side-header">
                  <span>${escapeHtml(POSTER_DATA.sideKicker)}</span>
                  <strong>${escapeHtml(POSTER_DATA.sideHeading)}</strong>
                  <span class="sw-side-sub">${escapeHtml(POSTER_DATA.sideIntro)}</span>
                </div>
                <div class="sw-side-cols">
                  ${POSTER_DATA.sideProjects
                    .map(
                      (sp) => `
                      <div class="sw-side-col">
                        <small>${escapeHtml(sp.num)}</small>
                        <h3>${escapeHtml(sp.title)}</h3>
                        <p>${escapeHtml(sp.desc)}</p>
                      </div>`
                    )
                    .join('')}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     OPTIONAL MOBILE VERTICAL DECK HELPER
     ========================================================================== */
  renderMobileVerticalFallback(targetContainer) {
    if (!targetContainer) return;
    targetContainer.innerHTML = STATIONS.map(
      (st) => `
      <button type="button" class="lu-mobile-station-card" data-station="${st.id}">
        <span>${st.num} // ${escapeHtml(st.navLabel)}</span>
        <strong>${escapeHtml(st.cnLabel)}</strong>
      </button>`
    ).join('');
  }

  /* ==========================================================================
     UNIFIED ROOT EVENT DELEGATION (Zero Duplicate Listeners Across Re-Renders!)
     ========================================================================== */
  _onRootClick(e) {
    /* 1. Explicit Close Buttons */
    if (e.target.closest('[data-lu-close]')) {
      e.preventDefault();
      this.closeStation();
      return;
    }

    /* 2. Click outside object/window stage closes station (except full-sheet Edition C) */
    if (
      e.target === this.rootEl ||
      e.target.classList.contains('lu-station-panel') ||
      (this.state.edition !== 'c' && !e.target.closest('[data-stop-backdrop]'))
    ) {
      /* Wait: if clicking blank space around floating objects inside .ed-a-*-stage or .ps-desktop-cluster, check carefully */
      if (e.target === this.rootEl || e.target.classList.contains('lu-station-panel')) {
        this.closeStation();
        return;
      }
    }
    if (
      e.target.classList.contains('ed-a-tv-stage') ||
      e.target.classList.contains('ed-a-poster-wrap') ||
      e.target.classList.contains('ed-a-press-wrap') ||
      e.target.classList.contains('ed-a-nb-scene') ||
      e.target.classList.contains('ed-a-tw-stage') ||
      e.target.classList.contains('ps-desktop-cluster')
    ) {
      this.closeStation();
      return;
    }

    /* 3. Allow external links (↗ / mailto) to work natively without triggering card actions */
    if (e.target.closest('a[href]')) {
      return;
    }

    /* 4. Notebook Page Switch */
    const nbPageBtn = e.target.closest('[data-nb-page]');
    if (nbPageBtn) {
      this.state.notebookPage = nbPageBtn.getAttribute('data-nb-page');
      const book = this.rootEl.querySelector('#luNotebookBook');
      if (book) book.classList.add('is-opened');
      this._syncNotebookPageDom();
      return;
    }
    if (e.target.closest('#luNotebookHardcover')) {
      const book = this.rootEl.querySelector('#luNotebookBook');
      if (book) book.classList.add('is-opened');
      return;
    }

    /* 5. TV Controls & Frame Selection */
    const chBtn = e.target.closest('[data-tv-channel]');
    if (chBtn) {
      this.switchChannel(chBtn.getAttribute('data-tv-channel'));
      return;
    }

    const stepBtn = e.target.closest('[data-tv-step]');
    if (stepBtn) {
      this._stepTvReel(Number(stepBtn.getAttribute('data-tv-step')));
      return;
    }

    const swMuteBtn = e.target.closest('[data-sw-mute-btn]');
    if (swMuteBtn) {
      e.stopPropagation();
      this._toggleTvMute();
      return;
    }

    const swPauseBtn = e.target.closest('[data-sw-toggle-pause]');
    if (swPauseBtn) {
      e.stopPropagation();
      const frame = swPauseBtn.getAttribute('data-sw-toggle-pause');
      const reel = CREATOR_REELS.find((r) => r.frame === frame);
      const panel = this.rootEl.querySelector('[data-lu-panel="tv"]');
      if (reel && panel) this._playSwissCellInline(panel, reel, { userInitiated: true });
      return;
    }

    const swPlayStage = e.target.closest('[data-sw-play]');
    if (swPlayStage) {
      const frame = swPlayStage.getAttribute('data-sw-play');
      const reel = CREATOR_REELS.find((r) => r.frame === frame);
      const panel = this.rootEl.querySelector('[data-lu-panel="tv"]');
      if (reel && panel) this._playSwissCellInline(panel, reel, { userInitiated: true });
      return;
    }

    if (e.target.closest('[data-tv-mute-toggle]')) {
      this._toggleTvMute();
      return;
    }

    if (e.target.closest('[data-tv-play-toggle]')) {
      /* Ignore if clicking an iframe directly */
      if (e.target.tagName === 'IFRAME') return;
      this._toggleTvPlayPause();
      return;
    }

    const scrubTrack = e.target.closest('[data-tv-scrub]');
    if (scrubTrack) {
      const vid = this.rootEl.querySelector('#luCrtPlayerMount video');
      if (vid && vid.duration > 0) {
        const rect = scrubTrack.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
        vid.currentTime = pct * vid.duration;
      }
      return;
    }

    const frameSel = e.target.closest('[data-tv-select-frame]');
    if (frameSel) {
      const frameCode = frameSel.getAttribute('data-tv-select-frame');
      const reel = CREATOR_REELS.find((r) => r.frame === frameCode);
      if (reel) {
        this.state.tvChannel = reel.campaign;
        this.state.tvFrameByChannel[reel.campaign] = reel.frame;
        this.state.tvPaused = false;
        this._updateTvDom({ flash: true });
      }
      return;
    }

    /* 7. Typewriter Reset */
    if (e.target.closest('[data-tw-reset]')) {
      this.state.letterSent = false;
      this._triggerTypewriterGreeting();
    }
  }

  _onRootSubmit(e) {
    const form = e.target.closest('#luTwForm');
    if (!form) return;
    e.preventDefault();
    const msgEl = form.querySelector('#luInputMessage');
    const nameEl = form.querySelector('#luInputName');
    const contactEl = form.querySelector('#luInputContact');
    this.state.letterDraft = {
      message: msgEl ? msgEl.value.trim() : '',
      name: nameEl ? nameEl.value.trim() : '',
      contact: contactEl ? contactEl.value.trim() : ''
    };
    this._sealAndStampLetter();
  }

  _onRootKeyDown(e) {
    const form = e.target.closest('#luTwForm');
    if (!form) return;
    const msgEl = form.querySelector('#luInputMessage');
    const nameEl = form.querySelector('#luInputName');
    const contactEl = form.querySelector('#luInputContact');
    setTimeout(() => {
      this.state.letterDraft = {
        message: msgEl ? msgEl.value : '',
        name: nameEl ? nameEl.value : '',
        contact: contactEl ? contactEl.value : ''
      };
    }, 0);
  }

  /* ==========================================================================
     EDITION B: REAL CLASSIC MAC OS WINDOW Z-INDEX FOCUS & DRAG-TO-MOVE
     ========================================================================== */
  _onRootPointerDown(e) {
    if (this.state.edition !== 'b') return;
    const winEl = e.target.closest('.ps-window');
    if (!winEl) return;

    this._psTopZ += 1;
    winEl.style.zIndex = String(this._psTopZ);

    const handle = e.target.closest('[data-ps-drag-handle]');
    if (!handle || e.target.closest('.ps-close-box')) return;

    const curDx = Number(winEl.dataset.dx || 0);
    const curDy = Number(winEl.dataset.dy || 0);

    this._dragState = {
      winEl,
      startX: e.clientX,
      startY: e.clientY,
      origDx: curDx,
      origDy: curDy
    };
    winEl.classList.add('is-dragging');
  }

  _onWindowPointerMove(e) {
    if (!this._dragState) return;
    const { winEl, startX, startY, origDx, origDy } = this._dragState;
    const dx = origDx + (e.clientX - startX);
    const dy = origDy + (e.clientY - startY);
    winEl.dataset.dx = String(dx);
    winEl.dataset.dy = String(dy);
    winEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }

  _onWindowPointerUp() {
    if (!this._dragState) return;
    this._dragState.winEl.classList.remove('is-dragging');
    this._dragState = null;
  }

  /* ==========================================================================
     GLOBAL KEYBOARD & EXTERNAL LISTENERS
     ========================================================================== */
  _onKeyDown(e) {
    if (!this.state.activeStation) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeStation();
      return;
    }

    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (this.state.activeStation === 'tv') {
      if (e.key === '1') this.switchChannel('seedance');
      else if (e.key === '2') this.switchChannel('kimi');
      else if (e.key === '3') this.switchChannel('minimax');
      else if (e.key === 'ArrowLeft') this._stepTvReel(-1);
      else if (e.key === 'ArrowRight') this._stepTvReel(1);
    }
  }

  _onDelegatedTrigger(e) {
    const trigger = e.target.closest('[data-station], [data-lulu-station]');
    if (!trigger) return;
    if (this.rootEl && this.rootEl.contains(trigger)) return;
    const raw =
      trigger.getAttribute('data-station') || trigger.getAttribute('data-lulu-station');
    const norm = normalizeStationId(raw);
    if (norm) {
      e.preventDefault();
      this.openStation(norm);
    }
  }

  _onExternalRequest(e) {
    if (e && e.detail && e.detail.station) {
      this.openStation(e.detail.station, e.detail);
    }
  }
}

/* Singleton Instance & Exports */
const engine = new StudioOverlayEngine();

export const LuluStudioUI = {
  init: (opts) => engine.init(opts),
  openStation: (id, opts) => engine.openStation(id, opts),
  closeStation: () => engine.closeStation(),
  toggleStation: (id, opts) => engine.toggleStation(id, opts),
  switchChannel: (chKey) => engine.switchChannel(chKey),
  setEdition: (ed, opts) => engine.setEdition(ed, opts),
  getEdition: () => engine.getEdition(),
  flipNewspaper: (side) => engine.flipNewspaper(side),
  renderMobileVerticalFallback: (el) => engine.renderMobileVerticalFallback(el),
  getActiveStation: () => engine.getActiveStation(),
  getState: () => engine.getState(),
  data: {
    STUDIO_META,
    EDITIONS,
    STATIONS,
    NOTEBOOK_DATA,
    TV_CHANNELS,
    TV_ALL_CHANNEL,
    CREATOR_REELS,
    NEWSPAPER_DATA,
    SHELF_DATA,
    TYPEWRITER_DATA,
    POSTER_DATA
  }
};

export const initStudioUI = LuluStudioUI.init;
export const openStation = LuluStudioUI.openStation;
export const closeStation = LuluStudioUI.closeStation;
export const setEdition = LuluStudioUI.setEdition;
export const getActiveStation = LuluStudioUI.getActiveStation;

if (typeof window !== 'undefined') {
  window.LuluStudioUI = LuluStudioUI;

  const autoBoot = () => {
    if (window.LULU_STUDIO_MANUAL_INIT === true) return;
    engine.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot, { once: true });
  } else {
    autoBoot();
  }
}

export default LuluStudioUI;
