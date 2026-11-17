(function () {
  'use strict';

  var LANG_KEY = 'ymrn_lang';
  var CHECK_KEY = 'ymrn_checks_v1';
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
      /* ignore storage errors */
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
      /* ignore storage errors */
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

    var btn = document.getElementById('ymrn-lang-btn');
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
    if (document.getElementById('ymrn-lang-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ymrn-lang-btn';
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
    if (target.closest('.spoiler:not(.revealed)')) {
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
    if (!tooltipEl) return;
    tooltipEl.classList.remove('visible');
    activeTipTarget = null;
  }

  function initTooltips() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-float';
    document.body.appendChild(tooltipEl);

    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('.term[data-tip]');
      if (target) {
        showTooltipFor(target);
      }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest('.term[data-tip]');
      if (target && (!e.relatedTarget || !target.contains(e.relatedTarget))) {
        hideTooltip();
      }
    });

    window.addEventListener('scroll', hideTooltip, { passive: true });
  }

  function initSpoilers() {
    var spoilers = document.querySelectorAll('.spoiler');
    for (var i = 0; i < spoilers.length; i++) {
      spoilers[i].setAttribute('title', 'Click to reveal spoiler');
      spoilers[i].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.toggle('revealed');
      });
    }
  }

  function updatePageProgress() {
    var boxes = document.querySelectorAll('input[type="checkbox"][data-check-id]');
    var total = boxes.length;
    var done = 0;
    for (var i = 0; i < total; i++) {
      if (boxes[i].checked) done++;
    }
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;

    var textEl = document.getElementById('page-progress-text');
    var fillEl = document.getElementById('page-progress-fill');
    if (textEl) {
      var label = textEl.getAttribute('data-label') || 'Completed';
      textEl.textContent = label + ': ' + done + '/' + total + ' (' + pct + '%)';
    }
    if (fillEl) {
      fillEl.style.width = pct + '%';
    }
  }

  function updateHubProgress() {
    var map = loadChecks();
    var hubs = document.querySelectorAll('[data-hub-prefix][data-hub-total]');
    for (var i = 0; i < hubs.length; i++) {
      var el = hubs[i];
      var prefix = el.getAttribute('data-hub-prefix');
      var total = parseInt(el.getAttribute('data-hub-total'), 10) || 0;
      var done = 0;
      for (var k in map) {
        if (Object.prototype.hasOwnProperty.call(map, k) && map[k] && k.indexOf(prefix) === 0) {
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

      box.addEventListener('change', function () {
        var currentMap = loadChecks();
        var cid = this.getAttribute('data-check-id');
        if (this.checked) {
          currentMap[cid] = true;
        } else {
          delete currentMap[cid];
        }
        saveChecks(currentMap);
        var item = this.closest('.check-item');
        if (item) {
          if (this.checked) item.classList.add('checked');
          else item.classList.remove('checked');
        }
        updatePageProgress();
        updateHubProgress();
      });
    }

    var resetBtn = document.getElementById('page-progress-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var currentMap = loadChecks();
        for (var j = 0; j < boxes.length; j++) {
          var cid = boxes[j].getAttribute('data-check-id');
          boxes[j].checked = false;
          delete currentMap[cid];
          var item = boxes[j].closest('.check-item');
          if (item) item.classList.remove('checked');
        }
        saveChecks(currentMap);
        updatePageProgress();
        updateHubProgress();
      });
    }

    updatePageProgress();
    updateHubProgress();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTooltips();
    initLangButton();
    initSpoilers();
    initCheckboxes();
  });
})();
