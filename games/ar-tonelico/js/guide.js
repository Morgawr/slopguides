(function () {
  'use strict';

  var LANG_KEY = 'at1_lang';
  var CHECK_KEY = 'at1_checks_v1';
  var tooltipEl = null;
  var activeTipTarget = null;
  var activeStatusFilter = 'all';
  var activeSearchQuery = '';

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

    var btn = document.getElementById('at1-lang-btn');
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
    if (document.getElementById('at1-lang-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'at1-lang-btn';
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
    tooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltipEl);

    document.addEventListener('mouseover', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
      if (target) showTooltipFor(target);
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
      if (target && (!e.relatedTarget || !target.contains(e.relatedTarget))) {
        hideTooltip();
      }
    });

    window.addEventListener('scroll', hideTooltip, { passive: true });
  }

  function initSpoilers() {
    var spoilers = document.querySelectorAll('.spoiler');
    for (var i = 0; i < spoilers.length; i++) {
      var sp = spoilers[i];
      if (!sp.hasAttribute('tabindex')) sp.setAttribute('tabindex', '0');
      if (!sp.hasAttribute('role')) sp.setAttribute('role', 'button');
      sp.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.toggle('revealed');
      });
      sp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.classList.toggle('revealed');
        }
      });
    }
  }

  function updateRowVisibility() {
    var rows = document.querySelectorAll('[data-filter-item]');
    var q = activeSearchQuery.trim().toLowerCase();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var box = row.querySelector('input.check-box');
      var isChecked = box ? box.checked : false;

      var statusOk = true;
      if (box) {
        if (activeStatusFilter === 'todo' && isChecked) statusOk = false;
        if (activeStatusFilter === 'done' && !isChecked) statusOk = false;
      }

      var searchOk = true;
      if (q) {
        var hay = row.getAttribute('data-search-cache');
        if (!hay) {
          var parts = [row.textContent || ''];
          var innerTerms = row.querySelectorAll('.term[data-jp][data-en]');
          for (var j = 0; j < innerTerms.length; j++) {
            parts.push(innerTerms[j].getAttribute('data-jp') || '');
            parts.push(innerTerms[j].getAttribute('data-en') || '');
          }
          hay = parts.join(' ').toLowerCase();
          row.setAttribute('data-search-cache', hay);
        }
        searchOk = hay.indexOf(q) !== -1;
      }

      row.style.display = (statusOk && searchOk) ? '' : 'none';
    }
  }

  function updateCounters(checksMap) {
    var boxes = document.querySelectorAll('input.check-box[data-check-id]');
    var seen = {};
    var total = 0;
    var done = 0;

    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      var cid = b.getAttribute('data-check-id');
      var checked = !!checksMap[cid];
      b.checked = checked;
      var parentRow = b.closest('.check-item, tr');
      if (parentRow) {
        parentRow.classList.toggle('is-checked', checked);
      }
      if (!seen[cid]) {
        seen[cid] = true;
        total += 1;
        if (checked) done += 1;
      }
    }

    var banner = document.querySelector('.completion-bar-wrap');
    if (banner && total > 0) {
      var label = banner.getAttribute('data-counter-label') || 'Completed';
      var pct = Math.round((done / total) * 100);
      var textEl = banner.querySelector('.completion-text');
      var fillEl = banner.querySelector('.completion-fill');
      if (textEl) textEl.textContent = label + ': ' + done + '/' + total + ' (' + pct + '%)';
      if (fillEl) fillEl.style.width = pct + '%';
    }

    var hubEls = document.querySelectorAll('[data-hub-prefix][data-hub-total]');
    for (var h = 0; h < hubEls.length; h++) {
      var hEl = hubEls[h];
      var prefix = hEl.getAttribute('data-hub-prefix');
      var hTotal = parseInt(hEl.getAttribute('data-hub-total') || '0', 10);
      var hDone = 0;
      for (var k in checksMap) {
        if (Object.prototype.hasOwnProperty.call(checksMap, k) && checksMap[k] && k.indexOf(prefix) === 0) {
          hDone += 1;
        }
      }
      if (hTotal > 0) {
        var clamped = Math.min(hDone, hTotal);
        var hpct = Math.round((clamped / hTotal) * 100);
        hEl.textContent = clamped + '/' + hTotal + ' (' + hpct + '%)';
      }
    }
  }

  function initCheckboxes() {
    var map = loadChecks();
    updateCounters(map);

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('check-box')) return;
      var cid = t.getAttribute('data-check-id');
      if (!cid) return;
      var currentMap = loadChecks();
      if (t.checked) currentMap[cid] = true;
      else delete currentMap[cid];
      saveChecks(currentMap);
      updateCounters(currentMap);
      updateRowVisibility();
    });

    var resetBtn = document.getElementById('page-progress-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var currentMap = loadChecks();
        var boxes = document.querySelectorAll('input.check-box[data-check-id]');
        for (var i = 0; i < boxes.length; i++) {
          delete currentMap[boxes[i].getAttribute('data-check-id')];
        }
        saveChecks(currentMap);
        updateCounters(currentMap);
        updateRowVisibility();
      });
    }

    var filterBtns = document.querySelectorAll('[data-status-filter]');
    for (var f = 0; f < filterBtns.length; f++) {
      filterBtns[f].addEventListener('click', function () {
        activeStatusFilter = this.getAttribute('data-status-filter') || 'all';
        for (var j = 0; j < filterBtns.length; j++) {
          filterBtns[j].classList.toggle('active', filterBtns[j] === this);
        }
        updateRowVisibility();
      });
    }

    var searchInputs = document.querySelectorAll('[data-page-search]');
    for (var s = 0; s < searchInputs.length; s++) {
      searchInputs[s].addEventListener('input', function () {
        activeSearchQuery = this.value || '';
        updateRowVisibility();
      });
    }
  }

  function initImageLightbox() {
    var cards = document.querySelectorAll('.screen-card');
    if (!cards.length || document.getElementById('at-lightbox')) return;

    var lb = document.createElement('div');
    lb.id = 'at-lightbox';
    lb.className = 'at-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<div class="at-lightbox-bar">' +
        '<div class="at-lightbox-caption" id="at-lb-caption"></div>' +
        '<div class="at-lightbox-actions">' +
          '<button type="button" class="at-lightbox-btn" id="at-lb-scale">2x</button>' +
          '<button type="button" class="at-lightbox-btn" id="at-lb-close">Close</button>' +
        '</div>' +
      '</div>' +
      '<div class="at-lightbox-stage" id="at-lb-stage">' +
        '<img id="at-lb-img" src="" alt="">' +
      '</div>';
    document.body.appendChild(lb);

    var lbCaption = document.getElementById('at-lb-caption');
    var lbScaleBtn = document.getElementById('at-lb-scale');
    var lbCloseBtn = document.getElementById('at-lb-close');
    var lbStage = document.getElementById('at-lb-stage');
    var lbImg = document.getElementById('at-lb-img');

    function fitImage(actual) {
      var nw = lbImg.naturalWidth || 640;
      var nh = lbImg.naturalHeight || 480;
      var availW = Math.max(260, window.innerWidth - 56);
      var availH = Math.max(220, window.innerHeight - 106);
      var scale = Math.min(availW / nw, availH / nh);
      if (actual) {
        lbStage.classList.add('is-actual-size');
        lbScaleBtn.textContent = 'Fit';
        lbImg.style.width = Math.max(nw, Math.round(nw * scale * 1.8)) + 'px';
        lbImg.style.height = 'auto';
      } else {
        lbStage.classList.remove('is-actual-size');
        lbScaleBtn.textContent = '2x';
        lbImg.style.width = Math.round(nw * scale) + 'px';
        lbImg.style.height = Math.round(nh * scale) + 'px';
      }
    }

    lbImg.addEventListener('load', function () {
      if (lb.classList.contains('open')) fitImage(false);
    });

    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var img = this.querySelector('img');
        var cap = this.querySelector('figcaption');
        if (!img) return;
        lbImg.src = img.getAttribute('src');
        lbCaption.textContent = cap ? cap.textContent : '';
        lb.classList.add('open');
        fitImage(false);
      });
    }

    lbScaleBtn.addEventListener('click', function () {
      fitImage(!lbStage.classList.contains('is-actual-size'));
    });

    lbImg.addEventListener('click', function () {
      fitImage(!lbStage.classList.contains('is-actual-size'));
    });

    lbCloseBtn.addEventListener('click', function () {
      lb.classList.remove('open');
    });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === lbStage) {
        lb.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) {
        lb.classList.remove('open');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTooltips();
    initLangButton();
    initSpoilers();
    initCheckboxes();
    initImageLightbox();
  });
})();
