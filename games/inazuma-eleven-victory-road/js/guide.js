(function () {
  'use strict';

  var LANG_KEY = 'ievr_lang';
  var CHECK_KEY = 'ievr_checks_v1';
  var tooltipEl = null;
  var activeTipTarget = null;

  function loadChecks() {
    try {
      var raw = window.localStorage.getItem(CHECK_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveChecks(map) {
    try {
      window.localStorage.setItem(CHECK_KEY, JSON.stringify(map));
    } catch (e) {
      /* ignore */
    }
  }

  function getLang() {
    try {
      var saved = window.localStorage.getItem(LANG_KEY);
      return (saved === 'en' || saved === 'jp') ? saved : 'jp';
    } catch (e) {
      return 'jp';
    }
  }

  function setLang(lang) {
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }
    applyLang(lang);
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('data-game-lang', lang);
    var terms = document.querySelectorAll('.term[data-jp][data-en]');
    for (var i = 0; i < terms.length; i++) {
      var el = terms[i];
      var jp = el.getAttribute('data-jp');
      var en = el.getAttribute('data-en');
      if (lang === 'en') {
        el.textContent = en;
        if (jp !== en) el.setAttribute('data-tip', jp);
      } else {
        el.textContent = jp;
        if (jp !== en) el.setAttribute('data-tip', en);
      }
    }

    var btn = document.getElementById('ievr-lang-btn');
    if (btn) {
      var jpOpt = btn.querySelector('[data-lang-opt="jp"]');
      var enOpt = btn.querySelector('[data-lang-opt="en"]');
      if (jpOpt) jpOpt.className = 'lang-opt' + (lang === 'jp' ? ' active' : '');
      if (enOpt) enOpt.className = 'lang-opt' + (lang === 'en' ? ' active' : '');
    }

    if (activeTipTarget && tooltipEl && tooltipEl.classList.contains('visible')) {
      showTooltipFor(activeTipTarget);
    }
  }

  function initLangButton() {
    if (document.getElementById('ievr-lang-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ievr-lang-btn';
    btn.className = 'lang-toggle-float';
    btn.setAttribute('aria-label', 'Switch Japanese and English terminology');
    btn.innerHTML =
      '<span class="lang-opt" data-lang-opt="jp">JP</span>' +
      '<span>/</span>' +
      '<span class="lang-opt" data-lang-opt="en">EN</span>';
    btn.addEventListener('click', function () {
      var next = getLang() === 'jp' ? 'en' : 'jp';
      setLang(next);
    });
    document.body.appendChild(btn);
    applyLang(getLang());
  }

  function showTooltipFor(target) {
    if (!tooltipEl || !target) return;
    var unrevealedSpoiler = target.closest('.spoiler:not(.revealed)');
    if (unrevealedSpoiler) {
      hideTooltip();
      return;
    }
    var tipText = target.getAttribute('data-tip');
    if (!tipText || tipText === target.textContent) {
      hideTooltip();
      return;
    }
    activeTipTarget = target;
    tooltipEl.textContent = tipText;
    tooltipEl.classList.add('visible');

    var rect = target.getBoundingClientRect();
    var tipRect = tooltipEl.getBoundingClientRect();
    var top = rect.top - tipRect.height - 7;
    if (top < 8) {
      top = rect.bottom + 7;
    }
    var left = rect.left + (rect.width / 2) - (tipRect.width / 2);
    var maxLeft = window.innerWidth - tipRect.width - 8;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;

    tooltipEl.style.left = Math.round(left) + 'px';
    tooltipEl.style.top = Math.round(top) + 'px';
  }

  function hideTooltip() {
    activeTipTarget = null;
    if (tooltipEl) {
      tooltipEl.classList.remove('visible');
    }
  }

  function initTooltips() {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'ievr-tooltip';
    tooltipEl.className = 'guide-tooltip';
    document.body.appendChild(tooltipEl);

    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('[data-tip]');
      if (target) {
        showTooltipFor(target);
      }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest('[data-tip]');
      if (target && target === activeTipTarget) {
        hideTooltip();
      }
    });

    window.addEventListener('scroll', hideTooltip, { passive: true });
  }

  function updatePageCounter() {
    var boxes = document.querySelectorAll('input[type="checkbox"][data-check-id]');
    var total = boxes.length;
    var done = 0;
    for (var i = 0; i < total; i++) {
      if (boxes[i].checked) done++;
    }
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;

    var countEl = document.getElementById('page-progress-count');
    if (countEl) {
      countEl.textContent = done + ' / ' + total + ' (' + pct + '%)';
    }
    var fillEl = document.getElementById('page-progress-fill');
    if (fillEl) {
      fillEl.style.width = pct + '%';
    }
  }

  function updateHubCounters() {
    var hubs = document.querySelectorAll('[data-hub-prefix][data-hub-total]');
    if (!hubs.length) return;
    var map = loadChecks();
    var keys = Object.keys(map);
    for (var i = 0; i < hubs.length; i++) {
      var el = hubs[i];
      var prefix = el.getAttribute('data-hub-prefix');
      var total = parseInt(el.getAttribute('data-hub-total'), 10) || 0;
      var done = 0;
      for (var k = 0; k < keys.length; k++) {
        if (keys[k].indexOf(prefix) === 0 && map[keys[k]]) {
          done++;
        }
      }
      if (done > total) done = total;
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;
      el.textContent = done + '/' + total + ' (' + pct + '%)';
    }
  }

  function initCheckboxes() {
    var map = loadChecks();
    var boxes = document.querySelectorAll('input[type="checkbox"][data-check-id]');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var id = box.getAttribute('data-check-id');
      box.checked = !!map[id];
      var row = box.closest('.check-item');
      if (row) {
        if (box.checked) row.classList.add('checked');
        else row.classList.remove('checked');
      }
      box.addEventListener('change', function (e) {
        var b = e.target;
        var cid = b.getAttribute('data-check-id');
        var cur = loadChecks();
        if (b.checked) cur[cid] = true;
        else delete cur[cid];
        saveChecks(cur);
        var r = b.closest('.check-item');
        if (r) {
          if (b.checked) r.classList.add('checked');
          else r.classList.remove('checked');
        }
        updatePageCounter();
        updateHubCounters();
      });
    }
    updatePageCounter();
    updateHubCounters();
  }

  function initSpoilers() {
    var spoilers = document.querySelectorAll('.spoiler');
    for (var i = 0; i < spoilers.length; i++) {
      spoilers[i].setAttribute('tabindex', '0');
      spoilers[i].setAttribute('role', 'button');
      spoilers[i].addEventListener('click', function (e) {
        e.currentTarget.classList.toggle('revealed');
      });
      spoilers[i].addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.classList.toggle('revealed');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTooltips();
    initLangButton();
    initCheckboxes();
    initSpoilers();
  });
})();
