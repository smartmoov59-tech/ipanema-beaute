/* =========================================================
   IPANEMA BEAUTÉ by Paola — mouvement, carte et interactions
   GSAP + ScrollTrigger + Lenis (tous servis en local, aucun service tiers)
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const TEL = '+33629333319';
  const EUR = ' €';
  if (reduce) root.classList.add('reduced');
  // on repart toujours du haut : le loader et l'intro sont pensés pour ça
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------------------------------------------------------
     1. DONNÉES — carte relevée sur Planity (3 nov. 2026)
     [nom, minutes, prix]
  --------------------------------------------------------- */
  const MENU = [
    { id: 'gel', label: 'Ongles en gel', groups: [{ items: [
      ['Gel sur ongles naturels', 60, 35],
      ['Gel sur ongles naturels + French', 75, 40],
      ['Gel sur ongles naturels, effet chromé', 60, 40],
      ['Pose complète rallongement (capsules)', 75, 40],
      ['Pose complète rallongement (capsules) + French', 90, 45],
      ['Comblage + couleur', 60, 35],
      ['Comblage + French', 70, 40],
      ['Dépose gel', 30, 20],
      ['Réparation d\'un ongle cassé avec capsule', 15, 5]
    ] }] },
    { id: 'semi', label: 'Semi-permanent', groups: [{ items: [
      ['Dépose + pose de vernis semi-permanent, mains', 60, 30],
      ['Vernis semi-permanent, mains (sans la dépose)', 30, 20],
      ['Dépose + pose de vernis semi-permanent, pieds', 35, 27],
      ['Vernis semi-permanent, pieds (sans la dépose)', 30, 17],
      ['Vernis semi-permanent, mains + French (sans dépose)', 45, 25],
      ['Vernis semi-permanent, pieds + French (sans dépose)', 30, 20],
      ['Vernis semi-permanent renforcé, mains', 45, 30],
      ['Vernis semi-permanent renforcé, mains + French', 60, 35],
      ['Vernis semi-permanent, mains effet chromé', 40, 25],
      ['Vernis semi-permanent, pieds effet chromé', 30, 20],
      ['Dépose seule, mains', 30, 15],
      ['Dépose seule, pieds', 20, 10],
      ['Dépose, mains + pieds', 45, 20]
    ] }] },
    { id: 'mains', label: 'Mains & pieds', groups: [{ items: [
      ['Manucure + vernis', 30, 25],
      ['Manucure', 30, 20],
      ['Pose de vernis simple, mains', 20, 10],
      ['Beauté des pieds + vernis', 30, 35],
      ['Beauté des pieds', 30, 30],
      ['Pose de vernis simple, pieds', 20, 10],
      ['Dépose de vernis simple', 10, 5]
    ] }] },
    { id: 'visage', label: 'Soins du visage', groups: [{ items: [
      ['Soin du visage Glass Skin (beauté coréenne)', 60, 65],
      ['Soin visage Signature, sur mesure', 60, 55]
    ] }] },
    { id: 'sourcils', label: 'Sourcils & cils', groups: [{ items: [
      ['Brow Lift sourcils', 30, 30],
      ['Brow Lift + teinture sourcils', 45, 40],
      ['Brow Lift + épilation sourcils', 45, 45],
      ['Brow Lift + épilation + teinture des sourcils', 60, 55],
      ['Épilation sourcils avec coloration', 30, 20],
      ['Coloration sourcils', 30, 15],
      ['Teinture des cils', 30, 20],
      ['Épilation sourcils + lèvre', 30, 17],
      ['Épilation sourcils, entretien', 15, 10],
      ['Épilation de la lèvre au fil', 15, 13],
      ['Lèvre à la cire', 15, 8],
      ['Épilation visage complet', 30, 30]
    ] }] },
    { id: 'epilation', label: 'Épilation', groups: [
      { title: 'Les forfaits', items: [
        ['Demi-jambes + maillot + aisselles', 40, 30],
        ['Demi-jambes + maillot échancré + aisselles', 45, 35],
        ['Demi-jambes + maillot intégral + aisselles', 60, 40],
        ['Jambes entières + maillot + aisselles', 40, 35],
        ['Jambes entières + maillot échancré + aisselles', 45, 40],
        ['Jambes entières + maillot intégral + aisselles', 60, 45]
      ] },
      { title: 'À la carte', items: [
        ['Aisselles', 15, 10],
        ['Bras entiers', 20, 20],
        ['Demi-bras', 15, 15],
        ['Jambes entières', 30, 20],
        ['Demi-jambes', 20, 15],
        ['Cuisses', 20, 15],
        ['Maillot simple', 10, 10],
        ['Maillot échancré', 15, 15],
        ['Maillot brésilien', 20, 18],
        ['Maillot intégral', 30, 20],
        ['Fesses', 5, 5]
      ] }
    ] },
    { id: 'modelage', label: 'Modelage', groups: [{ items: [
      ['Modelage relaxant', 30, 39],
      ['Modelage relaxant', 60, 70]
    ] }] }
  ];

  const fmtDur = (m) => m < 60 ? `${m} min` : (m % 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m / 60}h`);
  const fmtEur = (n) => `${n}${EUR}`;

  /* ---------------------------------------------------------
     2. UTILITAIRES : découpe de texte, palmes SVG
  --------------------------------------------------------- */
  function splitChars(el) {
    const txt = el.textContent;
    el.textContent = '';
    return Array.from(txt).map((c) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
      return s;
    });
  }
  function splitWords(el) {
    const out = [];
    const nodes = Array.from(el.childNodes);
    el.textContent = '';
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'split-w';
          const i = document.createElement('span'); i.textContent = tok;
          w.appendChild(i); el.appendChild(w); out.push(i);
        });
      } else { el.appendChild(n); }
    });
    return out;
  }
  // Palme dessinée à la volée : un axe courbe + des folioles en lentille
  function frondSVG({ w = 640, h = 640, n = 15, bend = 0.12, size = 160 } = {}) {
    const P0 = [26, h - 26], P1 = [w * bend, h * 0.22], P2 = [w - 34, 56];
    const pt = (t) => { const u = 1 - t; return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]]; };
    const tan = (t) => { const u = 1 - t; return Math.atan2(2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]), 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0])); };
    let d = '';
    for (let i = 1; i <= n; i++) {
      const t = 0.07 + (i / (n + 1)) * 0.9;
      const [x, y] = pt(t), a = tan(t);
      const len = size * (1.05 - Math.abs(t - 0.5) * 0.95);
      [-1, 1].forEach((side) => {
        const ang = a + side * (0.95 - t * 0.28);
        const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
        const nx = -Math.sin(ang), ny = Math.cos(ang), wd = len * 0.15;
        const mx = (x + ex) / 2, my = (y + ey) / 2;
        d += `M${x.toFixed(1)} ${y.toFixed(1)}Q${(mx + nx * wd).toFixed(1)} ${(my + ny * wd).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}Q${(mx - nx * wd).toFixed(1)} ${(my - ny * wd).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`;
      });
    }
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><path d="M${P0}Q${P1} ${P2}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="${d}" fill="currentColor"/></svg>`;
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------------------------------------------------
     3. SCROLL : Lenis + ScrollTrigger
  --------------------------------------------------------- */
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (hasGsap && !reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollLock = (on) => {
    if (lenis) { on ? lenis.stop() : lenis.start(); }
    document.body.classList.toggle('is-locked', on);
  };
  function goTo(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------------------------------------------------------
     4. LA CARTE (tarifs + sélection)
  --------------------------------------------------------- */
  const tabsEl = $('#tabs'), listEl = $('#menuList');
  const basket = new Map(); // key -> {key,name,min,price}
  let currentTab = MENU[0].id;

  function itemKey(cat, gi, ii) { return `${cat.id}:${gi}:${ii}`; }
  function renderTabs() {
    tabsEl.innerHTML = MENU.map((c) => {
      const n = c.groups.reduce((a, g) => a + g.items.length, 0);
      return `<button class="tab" role="tab" type="button" id="tab-${c.id}" data-id="${c.id}" aria-selected="${c.id === currentTab}" aria-controls="menuList" tabindex="${c.id === currentTab ? 0 : -1}">${c.label}<small>${n}</small></button>`;
    }).join('');
  }
  function renderList(animate) {
    const cat = MENU.find((c) => c.id === currentTab);
    listEl.setAttribute('aria-labelledby', `tab-${cat.id}`);
    listEl.innerHTML = cat.groups.map((g, gi) => (g.title ? `<h3 class="mgroup">${g.title}</h3>` : '') + g.items.map((it, ii) => {
      const key = itemKey(cat, gi, ii), on = basket.has(key);
      return `<div class="mrow${on ? ' is-on' : ''}" data-key="${key}"><span class="mrow__name">${it[0]}</span><span class="mrow__lead" aria-hidden="true"></span><span class="mrow__time">${fmtDur(it[1])}</span><span class="mrow__price">${fmtEur(it[2])}</span><button class="mrow__add" type="button" aria-pressed="${on}" aria-label="${on ? 'Retirer' : 'Ajouter'} ${it[0]} (${fmtDur(it[1])}, ${it[2]} euros) ${on ? 'de' : 'à'} ma sélection"></button></div>`;
    }).join('')).join('');
    if (animate && hasGsap && !reduce) {
      gsap.fromTo(listEl.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.03, ease: 'power3.out', clearProps: 'transform,opacity' });
    }
  }
  function selectTab(id, animate = true) {
    if (!MENU.some((c) => c.id === id)) return;
    currentTab = id;
    $$('.tab', tabsEl).forEach((b) => { const on = b.dataset.id === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    renderList(animate);
    if (hasGsap) requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  function findItem(key) {
    const [cid, gi, ii] = key.split(':');
    const cat = MENU.find((c) => c.id === cid);
    const it = cat.groups[+gi].items[+ii];
    return { key, name: it[0], min: it[1], price: it[2] };
  }
  const sum = { price: 0 };
  function renderBasket() {
    const items = Array.from(basket.values());
    const n = items.length;
    const totalP = items.reduce((a, i) => a + i.price, 0);
    const totalM = items.reduce((a, i) => a + i.min, 0);
    $('#basketCount').textContent = n;
    $('#basketEmpty').hidden = n > 0;
    $('#basketSum').hidden = n === 0;
    $('#basketClear').hidden = n === 0;
    $('#basketItems').innerHTML = items.map((i) => `<li><span>${i.name} <small>· ${fmtDur(i.min)}</small></span><b>${fmtEur(i.price)}</b><button type="button" data-remove="${i.key}" aria-label="Retirer ${i.name}">×</button></li>`).join('');
    $('#sumTime').textContent = fmtDur(totalM);
    const priceEl = $('#sumPrice');
    if (hasGsap && !reduce) gsap.to(sum, { price: totalP, duration: 0.6, ease: 'power3.out', onUpdate: () => { priceEl.textContent = fmtEur(Math.round(sum.price)); } });
    else priceEl.textContent = fmtEur(totalP);
    // lien SMS pré-rempli
    const sms = $('#basketSms');
    if (n) {
      const body = `Bonjour Paola, je souhaiterais prendre rendez-vous pour :\n${items.map((i) => `- ${i.name} (${fmtDur(i.min)}, ${i.price} €)`).join('\n')}\nTotal estimé : ${totalP} € · ${fmtDur(totalM)}.\nMes disponibilités : \nMerci !`;
      sms.href = `sms:${TEL}?&body=${encodeURIComponent(body)}`;
    } else sms.href = `sms:${TEL}`;
    // pastille mobile
    const pill = $('#basketPill');
    pill.hidden = n === 0;
    $('#pillCount').textContent = n;
    $('#pillPrice').textContent = fmtEur(totalP);
  }
  function toggleItem(key) {
    if (basket.has(key)) basket.delete(key); else basket.set(key, findItem(key));
    const row = $(`.mrow[data-key="${key}"]`, listEl);
    if (row) {
      const on = basket.has(key);
      row.classList.toggle('is-on', on);
      const b = $('.mrow__add', row);
      b.setAttribute('aria-pressed', on);
      const name = findItem(key).name;
      b.setAttribute('aria-label', `${on ? 'Retirer' : 'Ajouter'} ${name} ${on ? 'de' : 'à'} ma sélection`);
    }
    renderBasket();
  }
  renderTabs();
  renderList(false);
  renderBasket();
  tabsEl.addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b) selectTab(b.dataset.id); });
  tabsEl.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const ids = MENU.map((c) => c.id);
    const i = ids.indexOf(currentTab);
    const next = ids[(i + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
    selectTab(next); $(`#tab-${next}`).focus();
  });
  listEl.addEventListener('click', (e) => { const row = e.target.closest('.mrow'); if (row) toggleItem(row.dataset.key); });
  $('#basketItems').addEventListener('click', (e) => { const b = e.target.closest('[data-remove]'); if (b) toggleItem(b.dataset.remove); });
  $('#basketClear').addEventListener('click', () => { Array.from(basket.keys()).forEach((k) => toggleItem(k)); });

  // liens « Toute la carte » des cartes et du rituel : ouvrent le bon onglet
  $$('[data-tab]').forEach((a) => a.addEventListener('click', () => selectTab(a.dataset.tab, false)));
  // pastille mobile masquée quand le panier est à l'écran
  // la pastille « Ma sélection » (mobile) n'apparaît que dans la zone des tarifs, tant que le panier n'est pas à l'écran
  const pillSeen = { tarifs: false, basket: false };
  const updatePill = () => { $('#basketPill').style.display = (pillSeen.tarifs && !pillSeen.basket) ? '' : 'none'; };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { pillSeen.basket = es[0].isIntersecting; updatePill(); }, { threshold: 0.15 }).observe($('#basket'));
    new IntersectionObserver((es) => { pillSeen.tarifs = es[0].isIntersecting; updatePill(); }, { threshold: 0.05 }).observe($('.tarifs__grid'));
  }
  updatePill();

  /* ---------------------------------------------------------
     5. ÉLÉMENTS STATIQUES : palmes, découpes, liens d'ancre
  --------------------------------------------------------- */
  $('.frond--a').innerHTML = `<div class="sway">${frondSVG({ n: 16, bend: 0.1, size: 170 })}</div>`;
  $('.frond--b').innerHTML = `<div class="sway">${frondSVG({ n: 14, bend: 0.2, size: 165 })}</div>`;
  $('.frond--c').innerHTML = `<div class="sway">${frondSVG({ n: 17, bend: 0.06, size: 190 })}</div>`;

  $$('[data-chars]').forEach((el) => splitChars(el));
  $$('a[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id.charAt(0) !== '#') return;
    e.preventDefault();
    closeMenu(true);
    goTo(id === '#top' ? document.body : id);
  }));
  $('#toTop').addEventListener('click', () => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })));

  /* ---------------------------------------------------------
     6. MENU MOBILE
  --------------------------------------------------------- */
  const burger = $('#burger'), menu = $('#menu');
  let menuOpen = false;
  function openMenu() {
    if (menuOpen) return; menuOpen = true;
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fermer le menu');
    menu.setAttribute('aria-hidden', 'false'); menu.style.visibility = 'visible';
    scrollLock(true);
    if (!hasGsap) return;
    gsap.killTweensOf('.menu__bg, .menu__links a, .menu__foot > *');
    gsap.to('.menu__bg', { scaleY: 1, duration: 0.9, ease: 'expo.inOut' });
    gsap.fromTo('.menu__links a > *', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05, delay: 0.35 });
    gsap.fromTo('.menu__foot > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.6 });
  }
  function closeMenu(quick) {
    if (!menuOpen) return; menuOpen = false;
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', 'true');
    scrollLock(false);
    if (!hasGsap) { menu.style.visibility = 'hidden'; return; }
    gsap.killTweensOf('.menu__bg');
    gsap.to('.menu__bg', { scaleY: 0, duration: quick ? 0.5 : 0.8, ease: 'expo.inOut', transformOrigin: 'bottom', onComplete: () => { menu.style.visibility = 'hidden'; gsap.set('.menu__bg', { transformOrigin: 'top' }); } });
  }
  burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeLightbox(); } });

  /* ---------------------------------------------------------
     7. LIGHTBOX GALERIE
  --------------------------------------------------------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const shots = $$('.g').sort((a, b) => +a.dataset.i - +b.dataset.i).map((b) => ({ src: $('img', b).getAttribute('src'), alt: $('img', b).alt, cap: $('.g__cap', b).textContent }));
  let lbIndex = 0, lbLast = null;
  function showShot(i) {
    lbIndex = (i + shots.length) % shots.length;
    const s = shots[lbIndex];
    lbImg.src = s.src; lbImg.alt = s.alt; lbCap.textContent = s.cap;
    if (hasGsap && !reduce) gsap.fromTo(lbImg, { scale: 0.93, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out' });
  }
  function openLightbox(i, opener) {
    lbLast = opener; lb.hidden = false; scrollLock(true); showShot(i); $('#lbClose').focus();
  }
  function closeLightbox() {
    if (lb.hidden) return; lb.hidden = true; scrollLock(false); if (lbLast) lbLast.focus();
  }
  $$('.g').forEach((b) => b.addEventListener('click', () => openLightbox(shots.findIndex((s) => s.src === $('img', b).getAttribute('src')), b)));
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => showShot(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showShot(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  window.addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'ArrowRight') showShot(lbIndex + 1); if (e.key === 'ArrowLeft') showShot(lbIndex - 1); });

  /* ---------------------------------------------------------
     8. AVIS : carrousel (flèches, glisser, lecture auto)
  --------------------------------------------------------- */
  const rail = $('#rail'), railBar = $('#railBar');
  const railStep = () => { const c = $('.rev', rail); return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 16) : 320; };
  const updateRailBar = () => { const p = (rail.scrollLeft + rail.clientWidth) / rail.scrollWidth; railBar.style.transform = `scaleX(${clamp(p, 0.05, 1)})`; };
  const railMove = (dir) => {
    const max = rail.scrollWidth - rail.clientWidth;
    if (dir > 0 && rail.scrollLeft >= max - 4) rail.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });
    else rail.scrollBy({ left: dir * railStep(), behavior: reduce ? 'auto' : 'smooth' });
  };
  $('#railNext').addEventListener('click', () => railMove(1));
  $('#railPrev').addEventListener('click', () => railMove(-1));
  rail.addEventListener('scroll', updateRailBar, { passive: true });
  rail.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); railMove(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); railMove(-1); } });
  let drag = null, railPaused = false, railVisible = false;
  rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, left: rail.scrollLeft, moved: false }; });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { drag.moved = true; rail.classList.add('is-drag'); }
    if (drag.moved) rail.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    if (drag.moved) { const s = railStep(); const target = Math.round(rail.scrollLeft / s) * s; rail.classList.remove('is-drag'); rail.scrollTo({ left: target, behavior: 'smooth' }); }
    drag = null;
  });
  ['mouseenter', 'focusin', 'touchstart'].forEach((ev) => rail.addEventListener(ev, () => { railPaused = true; }, { passive: true }));
  ['mouseleave', 'focusout'].forEach((ev) => rail.addEventListener(ev, () => { railPaused = false; }));
  if (!reduce) setInterval(() => { if (railVisible && !railPaused && !drag && !document.hidden) railMove(1); }, 5200);
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { railVisible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(rail);
  updateRailBar();

  /* ---------------------------------------------------------
     9. HORAIRES : statut en direct (heure de Paris)
  --------------------------------------------------------- */
  (function hours() {
    const H = { 0: null, 1: [9, 19], 2: [9, 19], 3: [14, 19], 4: [9, 19], 5: [9, 19], 6: [9, 19] };
    const names = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const d = now.getDay(), t = now.getHours() + now.getMinutes() / 60;
    $$(`.hours tr[data-day="${d}"]`).forEach((r) => r.classList.add('is-today'));
    const el = $('#hoursStatus'), today = H[d];
    let txt;
    if (today && t >= today[0] && t < today[1]) { txt = `Ouvert maintenant · jusqu'à ${today[1]}h`; el.classList.add('is-open'); }
    else if (today && t < today[0]) txt = `Fermé · ouvre aujourd'hui à ${today[0]}h`;
    else {
      let k = 1; while (k < 8 && !H[(d + k) % 7]) k++;
      const nd = (d + k) % 7;
      txt = `Fermé · ouvre ${k === 1 ? 'demain' : names[nd]} à ${H[nd][0]}h`;
    }
    el.textContent = txt;
  })();

  /* ---------------------------------------------------------
     10. VIDÉOS : chargement différé + pause hors écran
  --------------------------------------------------------- */
  const saveData = navigator.connection && navigator.connection.saveData;
  const hero = $('#heroVideo'), pauseBtn = $('#heroPause');
  if (reduce || saveData) { hero.removeAttribute('autoplay'); hero.pause(); pauseBtn.classList.add('is-paused'); pauseBtn.setAttribute('aria-label', 'Lire la vidéo'); }
  pauseBtn.addEventListener('click', () => {
    if (hero.paused) { hero.play().catch(() => {}); pauseBtn.classList.remove('is-paused'); pauseBtn.setAttribute('aria-label', 'Mettre la vidéo en pause'); }
    else { hero.pause(); pauseBtn.classList.add('is-paused'); pauseBtn.setAttribute('aria-label', 'Lire la vidéo'); }
  });
  if (!reduce && !saveData && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { if (!v.getAttribute('src') && v.dataset.src) { v.src = v.dataset.src; v.load(); } v.play().catch(() => {}); }
      else v.pause();
    }), { rootMargin: '350px 0px' });
    $$('video.lazy-video').forEach((v) => io.observe(v));
    // la vidéo d'accueil se met aussi en pause quand on ne la voit plus
    new IntersectionObserver((es) => { if (pauseBtn.classList.contains('is-paused')) return; es[0].isIntersecting ? hero.play().catch(() => {}) : hero.pause(); }).observe(hero);
  }

  if (!hasGsap) { $('#loader') && $('#loader').remove(); return; }

  /* ---------------------------------------------------------
     11. ÉTATS INITIAUX (derrière le loader) + INTRO
  --------------------------------------------------------- */
  const heroChars = $$('.hero__title .ch');
  if (!reduce) {
    gsap.set(heroChars, { yPercent: 118 });
    gsap.set('.hero__script', { opacity: 0, y: 30, rotate: -12 });
    gsap.set('.hero__eyebrow, .hero__lead, .hero__cta > *', { opacity: 0, y: 40 });
    gsap.set('.badge', { scale: 0, rotate: -90 });
    gsap.set('.frond', { opacity: 0, y: 120 });
    gsap.set('.hero__media', { scale: 1.22 });
    gsap.set('.nav', { yPercent: -100 });
    gsap.set('.loader__logo', { y: 30, opacity: 0 });
  }

  function intro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__media', { scale: 1, duration: 2.8 }, 0)
      .to(heroChars, { yPercent: 0, duration: 1.5, stagger: 0.05 }, 0.1)
      .to('.hero__script', { opacity: 1, y: 0, rotate: -6, duration: 1.5 }, 0.75)
      .to('.hero__eyebrow, .hero__lead, .hero__cta > *', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.45)
      .to('.badge', { scale: 1, rotate: 0, duration: 1.5, ease: 'back.out(1.5)' }, 1)
      .to('.frond', { opacity: (i, el) => (i === 0 ? 0.96 : i === 1 ? 0.9 : 0.95), y: 0, duration: 2.2, stagger: 0.12 }, 0.2)
      .to('.nav', { yPercent: 0, duration: 1.2 }, 0.7);
    return tl;
  }

  function runLoader() {
    const loader = $('#loader');
    if (reduce) { loader.remove(); return; }
    scrollLock(true);
    const num = $('#loaderNum'), st = { v: 0 };
    const tl = gsap.timeline();
    tl.to('.loader__logo', { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, 0)
      .fromTo('.loader__wave path', { strokeDasharray: 520, strokeDashoffset: 520 }, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' }, 0.1)
      .to(st, { v: 100, duration: 1.9, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(st.v); } }, 0.1);
    const ready = new Promise((res) => {
      const done = () => setTimeout(res, 50);
      if (document.readyState === 'complete') done(); else window.addEventListener('load', done, { once: true });
      setTimeout(res, 3500);
    });
    Promise.all([new Promise((r) => tl.eventCallback('onComplete', r)), ready]).then(() => {
      gsap.timeline({ onComplete: () => { loader.remove(); scrollLock(false); ScrollTrigger.refresh(); } })
        .to('.loader__inner', { y: -34, opacity: 0, duration: 0.6, ease: 'power3.in' })
        .to('.loader__layer--sand', { yPercent: -100, y: -170, duration: 1.35, ease: 'expo.inOut' }, '>-0.05')
        .to('.loader__layer--gold', { yPercent: -100, y: -170, duration: 1.35, ease: 'expo.inOut' }, '<0.15')
        .add(intro, '<0.5');
    });
  }
  runLoader();

  /* ---------------------------------------------------------
     12. SCROLL GLOBAL : barre, nav, parallax hero, marquee, révélations
  --------------------------------------------------------- */
  const nav = $('#nav'), dock = $('#dock');
  let lastY = 0, navHidden = false;
  const onScrollY = (y) => {
    nav.classList.toggle('is-solid', y > 80);
    const down = y > lastY + 2, up = y < lastY - 2;
    if (!menuOpen) {
      if (down && y > 420 && !navHidden) { navHidden = true; gsap.to(nav, { yPercent: -100, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }); }
      else if ((up || y < 200) && navHidden) { navHidden = false; gsap.to(nav, { yPercent: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }); }
    }
    dock.classList.toggle('is-in', y > window.innerHeight * 0.75);
    lastY = y;
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => onScrollY(self.scroll()) });
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  // titres : mots qui montent derrière un masque
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    if (reduce) return;
    gsap.from(words, { yPercent: 118, duration: 1.2, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  // révélations simples
  if (!reduce) {
    $$('.eyebrow:not(.hero__eyebrow), .tarifs__intro, .gallery__intro, .ritual__lead, .ritual__prices, .ritual__disc, .mini, .cta__lead, .cta__btns, .cta__facts, .find__addr, .find__park, .hours, .find__btns, .footer__col, .script').forEach((el) => {
      gsap.from(el, { y: 44, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    gsap.from('.reviews__big', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.reviews__top', start: 'top 80%', once: true } });
    gsap.from('.stars svg', { scale: 0, rotate: -120, duration: 0.9, stagger: 0.11, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.stars', start: 'top 88%', once: true } });
    gsap.to('.bars em', { scaleX: 1, duration: 1.7, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.bars', start: 'top 85%', once: true } });
    gsap.from('.rev', { y: 90, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.reviews__rail', start: 'top 88%', once: true } });
    gsap.from('.tab', { y: 20, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#tabs', start: 'top 90%', once: true } });
    gsap.from('.basket__in', { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#basket', start: 'top 92%', once: true } });
    gsap.from('.footer__giant .ch', { yPercent: 112, duration: 1.3, stagger: 0.035, ease: 'expo.out', scrollTrigger: { trigger: '.footer__giant', start: 'top 94%', once: true } });
  }

  // chiffres animés
  $$('.count').forEach((el) => {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0;
    const fmt = (v) => (dec ? v.toFixed(dec).replace('.', ',') : Math.round(v));
    if (reduce) { el.textContent = fmt(to); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 2.4, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); }, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  if (!reduce) gsap.to('.num__ring-fg', { strokeDashoffset: 0, duration: 2.6, ease: 'expo.out', scrollTrigger: { trigger: '.num--big', start: 'top 80%', once: true } });

  /* marquee : défilement continu dont la vitesse et le sens suivent le scroll */
  (function marquee() {
    const rows = $$('.marquee__row').map((row) => {
      const track = $('.marquee__track', row);
      track.innerHTML += track.innerHTML;
      return { track, dir: parseFloat(row.dataset.dir) || -1, x: 0, half: 0 };
    });
    if (reduce) return;
    const measure = () => rows.forEach((r) => { r.half = r.track.scrollWidth / 2; });
    measure(); window.addEventListener('resize', measure); window.addEventListener('load', measure);
    let boost = 0, targetBoost = 0, flip = 1;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { targetBoost = clamp(Math.abs(self.getVelocity()) / 500, 0, 6); flip = self.direction || 1; } });
    gsap.ticker.add((time, dt) => {
      const d = Math.min(dt, 64) / 1000;
      targetBoost *= 0.93; boost += (targetBoost - boost) * 0.1;
      rows.forEach((r, i) => {
        if (!r.half) return;
        r.x += r.dir * flip * (70 + i * 26) * (1 + boost) * d;
        if (r.x <= -r.half) r.x += r.half; else if (r.x > 0) r.x -= r.half;
        r.track.style.transform = `translate3d(${r.x}px,0,0)`;
      });
    });
  })();

  /* ---------------------------------------------------------
     13. mise en scène par média (matchMedia)
  --------------------------------------------------------- */
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // --- Hero : parallax multicouche
    gsap.to('.hero__media', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__sun', { y: -160, scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.frond').forEach((f) => {
      const s = parseFloat(f.dataset.speed);
      gsap.to(f, { y: () => -window.innerHeight * 0.55 * s, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo($('.sway', f), { rotation: -2.2 }, { rotation: 2.2, duration: 4.5 + s * 2, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '10% 90%' });
    });
    gsap.to('.hero__content', { yPercent: -10, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: '.hero', start: '55% top', end: 'bottom top', scrub: true } });
    gsap.to('.badge', { y: -90, rotate: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // --- L'univers : section pinnée, 4 actes
    const steps = $$('.step'), frames = $$('.frame'), dots = $$('.story__dots li');
    steps.forEach((s) => s.classList.remove('is-active'));
    gsap.set(steps, { autoAlpha: 0 }); gsap.set(steps[0], { autoAlpha: 1 });
    gsap.set(frames[1], { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(frames[2], { clipPath: 'circle(0% at 50% 62%)' });
    gsap.set(frames[3], { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' });
    const sunColors = ['#F5C542', '#C97B4A', '#2BB24C', '#F5C542'];
    const slot = 1.6;
    const st = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '.story__pin', start: 'top top', end: '+=330%', pin: true, scrub: 0.8, anticipatePin: 1,
        onUpdate: (self) => {
          const i = Math.min(3, Math.floor(self.progress * 4 * 0.999));
          dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
        }
      }
    });
    st.fromTo('.frame--0 img', { scale: 1.3 }, { scale: 1, duration: slot, ease: 'none' }, 0)
      .to('.story__giant', { xPercent: -34, duration: slot * 3 + 1, ease: 'none' }, 0);
    for (let i = 1; i < 4; i++) {
      const at = i * slot;
      st.to(steps[i - 1], { autoAlpha: 0, y: -50, duration: 0.45 }, at - 0.2)
        .fromTo(steps[i], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.7 }, at + 0.05)
        .to(frames[i], { clipPath: ['inset(0% 0% 0% 0%)', 'circle(80% at 50% 62%)', 'polygon(0 0,100% 0,100% 100%,0 100%)'][i - 1], duration: 1, ease: 'power3.inOut' }, at - 0.2)
        .fromTo($('img,video', frames[i]), { scale: 1.35 }, { scale: 1, duration: 1.4, ease: 'none' }, at - 0.2)
        .to('.story__sun', { backgroundColor: sunColors[i], duration: 0.9 }, at - 0.2);
    }
    st.to('.story__tag', { opacity: 1, duration: 0.5 }, slot * 3 + 0.2).to({}, { duration: 0.6 });
  });

  mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
    // --- Prestations : défilement horizontal piloté par le scroll vertical
    const track = $('.services__track');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 8);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.services__pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    $$('.card__img img').forEach((img) => {
      gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: img.closest('.card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
    $$('.card').forEach((c, i) => {
      gsap.from(c, { y: 80, opacity: 0, duration: 1.1, ease: 'power3.out', delay: i * 0.05, scrollTrigger: { trigger: '.services__pin', start: 'top 70%', once: true } });
    });
    gsap.from('.services__hint svg', { x: -14, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // --- Galerie : colonnes qui défilent à des vitesses différentes
    $$('.gcol').forEach((col) => {
      const s = parseFloat(col.dataset.speed) || 1;
      const d = (s - 1) * -320;
      gsap.fromTo(col, { y: -d }, { y: d, ease: 'none', scrollTrigger: { trigger: '.gallery__cols', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // --- Rituel : le fil s'écrit au fil du scroll
    const draw = $('#ritualDraw'), svg = $('.ritual__svg'), wrap = $('#ritualPath');
    const lis = $$('.ritual__steps li');
    draw.setAttribute('pathLength', '1');
    const nodes = lis.map(() => { const n = document.createElement('span'); n.className = 'ritual__node'; wrap.appendChild(n); return n; });
    let marks = [];
    const place = () => {
      const total = draw.getTotalLength(), sw = svg.clientWidth, sh = svg.clientHeight;
      if (!sh) return;
      marks = lis.map((li, i) => {
        const y = li.offsetTop + li.offsetHeight / 2, uy = (y / sh) * 1000;
        let lo = 0, hi = total;
        for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (draw.getPointAtLength(mid).y < uy) lo = mid; else hi = mid; }
        const p = draw.getPointAtLength(lo);
        nodes[i].style.left = `${(p.x / 120) * sw}px`; nodes[i].style.top = `${y}px`;
        return y / sh;
      });
    };
    place();
    ScrollTrigger.addEventListener('refresh', place);
    ScrollTrigger.create({
      trigger: wrap, start: 'top 62%', end: 'bottom 62%', scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        draw.style.strokeDashoffset = 1 - p;
        marks.forEach((m, i) => { const on = p >= m - 0.015; lis[i].classList.toggle('is-on', on); nodes[i].classList.toggle('is-on', on); });
      }
    });

    // --- Appel à l'action : la vidéo s'ouvre en grand
    gsap.fromTo('#ctaMedia', { scale: 0.8, borderRadius: '70px' }, { scale: 1, borderRadius: '38px', ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top 88%', end: 'top 18%', scrub: true } });

    // --- Numéros : léger flottement du disque
    gsap.to('.numbers__sun', { rotation: 40, ease: 'none', scrollTrigger: { trigger: '.numbers', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------------------------------------------------------
     14. MICRO-INTERACTIONS (pointeur fin uniquement)
  --------------------------------------------------------- */
  if (fine && !reduce) {
    // boutons magnétiques
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.32, y: (e.clientY - r.top - r.height / 2) * 0.42, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' }));
    });
    // cartes : inclinaison 3D + reflet qui suit la souris
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--gx', `${px * 100}%`); card.style.setProperty('--gy', `${py * 100}%`);
        gsap.to(card, { rotationY: (px - 0.5) * 12, rotationX: (0.5 - py) * 10, transformPerspective: 1000, duration: 0.6, ease: 'power3.out' });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotationY: 0, rotationX: 0, duration: 1, ease: 'power3.out' }));
    });
    // galerie : inclinaison légère
    $$('.g').forEach((g) => {
      const box = $('.g__in', g);
      g.addEventListener('pointermove', (e) => {
        const r = g.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        gsap.to(box, { rotationY: (px - 0.5) * 12, rotationX: (0.5 - py) * 10, transformPerspective: 900, duration: 0.6, ease: 'power3.out' });
      });
      g.addEventListener('pointerleave', () => gsap.to(box, { rotationY: 0, rotationX: 0, duration: 1, ease: 'power3.out' }));
    });
    // curseur
    const cur = $('.cursor'), lab = $('.cursor__label');
    const cx = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const view = t.closest('.g') ? 'Voir' : t.closest('.reviews__rail') ? 'Glisser' : t.closest('.find__map') ? '' : null;
      const hover = t.closest('a, button, .mrow, .tab');
      cur.classList.toggle('is-view', !!view);
      if (view) lab.textContent = view;
      cur.classList.toggle('is-hover', !!hover && !view);
    });
  }

  /* ---------------------------------------------------------
     15. RAFRAÎCHISSEMENTS (polices, images)
  --------------------------------------------------------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 300));
  window.addEventListener('resize', () => { if (menuOpen && window.innerWidth > 1000) closeMenu(true); });
})();
