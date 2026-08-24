/* ==========================================================================
   5.º IN EUROPA — Lisboa 2026
   Interações: smooth scroll (Lenis), reveal (GSAP + ScrollTrigger),
   navegação fixa com scroll spy, menu móvel, separadores da programação.
   Tudo degrada com elegância: sem JS, sem CDN ou com "reduced motion",
   a página continua legível e navegável.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';
  var lenis = null;

  /* ----------------------------------------------------------------------
     1. Smooth scroll
     ---------------------------------------------------------------------- */
  function initLenis() {
    if (!hasLenis || reduced) return;

    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6
    });

    // Lenis assume o controlo — o smooth nativo do CSS entraria em conflito.
    root.style.scrollBehavior = 'auto';

    if (hasGsap) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* ----------------------------------------------------------------------
     2. Reveal ao entrar no ecrã
     ---------------------------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    function showAll() {
      items.forEach(function (el) { el.classList.add('is-visible'); });
    }

    if (reduced || !('IntersectionObserver' in window)) { showAll(); return; }

    if (!hasGsap) {
      // Sem GSAP: a transição CSS trata da entrada.
      var ioCss = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          ioCss.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
      items.forEach(function (el) { ioCss.observe(el); });
      return;
    }

    root.classList.add('gsap-mode');
    window.gsap.registerPlugin(window.ScrollTrigger);

    // O gatilho é o IntersectionObserver (imune a saltos de scroll que não
    // passam pelo Lenis: âncoras diretas, restauro de posição, localizar na
    // página). O GSAP trata da animação e do escalonamento.
    var io = new IntersectionObserver(function (entries) {
      var batch = [];
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        batch.push(entry.target);
        io.unobserve(entry.target);
      });
      if (!batch.length) return;
      window.gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: 'auto'
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    items.forEach(function (el) { io.observe(el); });

    // Ligações diretas (ex.: /#investimento): o que ficou acima da dobra no
    // arranque entra já visível, sem esperar por scroll de volta.
    window.addEventListener('load', function () {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().bottom < 0) {
          window.gsap.set(el, { opacity: 1, y: 0 });
          io.unobserve(el);
        }
      });
      window.ScrollTrigger.refresh();
    });

    // Rede de segurança: o scroll nativo também atualiza os efeitos com scrub.
    window.addEventListener('scroll', window.ScrollTrigger.update, { passive: true });

    // Parallax discreto na imagem do hero
    var heroImg = document.querySelector('.hero__bg img');
    if (heroImg && window.matchMedia('(min-width: 900px)').matches) {
      window.gsap.to(heroImg, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // Numerais dos dias sobem ligeiramente enquanto a secção passa
    document.querySelectorAll('.day__numeral').forEach(function (el) {
      window.gsap.fromTo(el, { y: 28 }, {
        y: -28, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ----------------------------------------------------------------------
     3. Navegação: estado fixo, scroll spy e botão flutuante
     ---------------------------------------------------------------------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var waFloat = document.getElementById('waFloat');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        if (nav) nav.classList.toggle('is-stuck', y > 40);
        if (waFloat) waFloat.classList.toggle('is-visible', y > window.innerHeight * 0.85);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var activeId = null;
      var best = 0;
      visible.forEach(function (ratio, id) {
        if (ratio > best) { best = ratio; activeId = id; }
      });

      links.forEach(function (link) {
        var isActive = activeId !== null && link.getAttribute('href') === '#' + activeId;
        link.classList.toggle('is-active', isActive);
        if (isActive) { link.setAttribute('aria-current', 'true'); }
        else { link.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01, 0.5, 1] });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ----------------------------------------------------------------------
     4. Menu móvel
     ---------------------------------------------------------------------- */
  function initMenu() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open) {
        var first = menu.querySelector('.menu__link');
        if (first) first.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ----------------------------------------------------------------------
     5. Âncoras internas
     ---------------------------------------------------------------------- */
  function initAnchors() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* ----------------------------------------------------------------------
     6. Separadores da programação
     ---------------------------------------------------------------------- */
  function initTabs() {
    var list = document.querySelector('.tabs__list');
    if (!list) return;

    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

    function activate(tab, focus) {
      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(item.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !selected;
        if (selected && hasGsap && !reduced) {
          window.gsap.fromTo(panel.children,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: .6, ease: 'power2.out', stagger: .06 });
          window.ScrollTrigger.refresh();
        }
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { activate(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var index = tabs.indexOf(tab);
        var next = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        activate(next, true);
      });
    });
  }

  /* ----------------------------------------------------------------------
     7. Ano corrente no rodapé
     ---------------------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById('ano');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------------- */
  function init() {
    initLenis();
    initReveal();
    initNav();
    initMenu();
    initAnchors();
    initTabs();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
