(function () {
  'use strict';

  var LANG_KEY = 'xcxde_lang';
  var CHECK_KEY = 'xcxde_checks_v1';
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
        el.setAttribute('data-tip', jp);
      } else {
        el.textContent = jp;
        el.setAttribute('data-tip', en);
      }
    }

    var btn = document.getElementById('xcxde-lang-btn');
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
    if (document.getElementById('xcxde-lang-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'xcxde-lang-btn';
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
    if (!tipText) {
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
    if (document.getElementById('xcxde-tooltip')) return;
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'xcxde-tooltip';
    tooltipEl.className = 'xcxde-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltipEl);

    document.addEventListener('mouseover', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
      if (el) showTooltipFor(el);
      else hideTooltip();
    });

    document.addEventListener('mouseout', function (e) {
      if (!activeTipTarget) return;
      var rel = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('[data-tip]') : null;
      if (rel !== activeTipTarget) hideTooltip();
    });

    document.addEventListener('focusin', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
      if (el) showTooltipFor(el);
    });

    document.addEventListener('focusout', function () {
      hideTooltip();
    });

    window.addEventListener('scroll', hideTooltip, { passive: true });
    window.addEventListener('resize', hideTooltip, { passive: true });
  }

  var activeStatusFilter = 'all';
  var activeSearchQuery = '';

  function updateRowVisibility() {
    var rows = document.querySelectorAll('[data-check-row], [data-filter-item]');
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
    var groupTotals = {};
    var groupDone = {};

    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      var cid = b.getAttribute('data-check-id');
      var grp = b.getAttribute('data-check-group');
      var checked = !!checksMap[cid];
      b.checked = checked;

      var parentRow = b.closest('tr, li, .check-card, .quest-entry');
      if (parentRow) {
        if (checked) parentRow.classList.add('is-checked');
        else parentRow.classList.remove('is-checked');
      }

      if (!seen[cid]) {
        seen[cid] = true;
        total += 1;
        if (checked) done += 1;
        if (grp) {
          groupTotals[grp] = (groupTotals[grp] || 0) + 1;
          if (checked) groupDone[grp] = (groupDone[grp] || 0) + 1;
        }
      }
    }

    var banner = document.querySelector('.completion-bar-wrap');
    if (banner && total > 0) {
      var label = banner.getAttribute('data-counter-label') || 'done';
      var pct = Math.round((done / total) * 100);
      var textEl = banner.querySelector('.completion-text');
      var fillEl = banner.querySelector('.completion-fill');
      if (textEl) {
        textEl.textContent = pct + '% (' + done + '/' + total + ' ' + label + ')';
      }
      if (fillEl) {
        fillEl.style.width = pct + '%';
      }
    }

    var grpEls = document.querySelectorAll('[data-group-counter]');
    for (var g = 0; g < grpEls.length; g++) {
      var gEl = grpEls[g];
      var gKey = gEl.getAttribute('data-group-counter');
      var gt = groupTotals[gKey] || 0;
      var gd = groupDone[gKey] || 0;
      var gpct = gt > 0 ? Math.round((gd / gt) * 100) : 0;
      gEl.textContent = gd + '/' + gt + ' (' + gpct + '%)';
    }

    var hubEls = document.querySelectorAll('[data-hub-prefix]');
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
        var hpct = Math.min(100, Math.round((hDone / hTotal) * 100));
        hEl.textContent = hDone + '/' + hTotal + ' (' + hpct + '%)';
      }
    }
  }

  function initCheckboxes() {
    var checksMap = loadChecks();
    updateCounters(checksMap);

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('check-box')) return;
      var cid = t.getAttribute('data-check-id');
      if (!cid) return;
      var map = loadChecks();
      if (t.checked) map[cid] = true;
      else delete map[cid];
      saveChecks(map);
      updateCounters(map);
      updateRowVisibility();
    });

    var filterBtns = document.querySelectorAll('[data-status-filter]');
    for (var i = 0; i < filterBtns.length; i++) {
      filterBtns[i].addEventListener('click', function () {
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

  function initSpoilers() {
    var spoilers = document.querySelectorAll('.spoiler');
    for (var i = 0; i < spoilers.length; i++) {
      var sp = spoilers[i];
      if (!sp.hasAttribute('tabindex')) sp.setAttribute('tabindex', '0');
      if (!sp.hasAttribute('role')) sp.setAttribute('role', 'button');
      sp.addEventListener('click', function () {
        this.classList.toggle('revealed');
        this.setAttribute('aria-expanded', this.classList.contains('revealed') ? 'true' : 'false');
      });
      sp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.classList.toggle('revealed');
          this.setAttribute('aria-expanded', this.classList.contains('revealed') ? 'true' : 'false');
        }
      });
    }
  }

  function initHashReveal() {
    if (!window.location.hash) return;
    var target = document.getElementById(window.location.hash.slice(1));
    if (target && target.style.display === 'none') {
      activeStatusFilter = 'all';
      activeSearchQuery = '';
      updateRowVisibility();
    }
  }

  function initImageLightbox() {
    var cards = document.querySelectorAll('.map-card, .map-figure');
    if (!cards.length || document.getElementById('xcxde-lightbox')) return;

    var lb = document.createElement('div');
    lb.id = 'xcxde-lightbox';
    lb.className = 'xcxde-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image preview');
    lb.innerHTML =
      '<div class="xcxde-lightbox-bar">' +
        '<div class="xcxde-lightbox-caption" id="xcxde-lb-caption"></div>' +
        '<div class="xcxde-lightbox-actions">' +
          '<button type="button" class="xcxde-lightbox-btn" id="xcxde-lb-scale">2x</button>' +
          '<button type="button" class="xcxde-lightbox-btn" id="xcxde-lb-close" aria-label="Close">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="xcxde-lightbox-stage" id="xcxde-lb-stage">' +
        '<img id="xcxde-lb-img" src="" alt="">' +
      '</div>';
    document.body.appendChild(lb);

    var lbCaption = document.getElementById('xcxde-lb-caption');
    var lbScaleBtn = document.getElementById('xcxde-lb-scale');
    var lbCloseBtn = document.getElementById('xcxde-lb-close');
    var lbStage = document.getElementById('xcxde-lb-stage');
    var lbImg = document.getElementById('xcxde-lb-img');
    var lastOpener = null;
    var isDragging = false;
    var didDrag = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var startScrollLeft = 0;
    var startScrollTop = 0;

    function computeFitSize() {
      var nw = lbImg.naturalWidth || 0;
      var nh = lbImg.naturalHeight || 0;
      if (!nw || !nh) return null;
      var availW = Math.max(260, window.innerWidth - 56);
      var availH = Math.max(220, window.innerHeight - 106);
      var scale = Math.min(availW / nw, availH / nh);
      return {
        fitW: Math.round(nw * scale),
        fitH: Math.round(nh * scale),
        nw: nw,
        nh: nh
      };
    }

    function setActualSize(enable, clickX, clickY) {
      var rx = 0.5;
      var ry = 0.5;
      if (enable && typeof clickX === 'number' && typeof clickY === 'number') {
        var prevRect = lbImg.getBoundingClientRect();
        if (prevRect.width > 0 && prevRect.height > 0) {
          rx = Math.max(0, Math.min(1, (clickX - prevRect.left) / prevRect.width));
          ry = Math.max(0, Math.min(1, (clickY - prevRect.top) / prevRect.height));
        }
      }

      var dims = computeFitSize();
      if (enable) {
        lbStage.classList.add('is-actual-size');
        lbScaleBtn.textContent = 'Fit';
        if (dims) {
          var zoomW = Math.max(dims.nw, Math.round(dims.fitW * 2));
          var zoomH = Math.round(dims.nh * (zoomW / dims.nw));
          lbImg.style.width = zoomW + 'px';
          lbImg.style.height = zoomH + 'px';
        } else {
          lbImg.style.width = '';
          lbImg.style.height = '';
        }
        var newRect = lbImg.getBoundingClientRect();
        var stageRect = lbStage.getBoundingClientRect();
        var targetX = lbStage.scrollLeft + (newRect.left - stageRect.left) + (rx * newRect.width) - (lbStage.clientWidth / 2);
        var targetY = lbStage.scrollTop + (newRect.top - stageRect.top) + (ry * newRect.height) - (lbStage.clientHeight / 2);
        lbStage.scrollLeft = Math.max(0, Math.round(targetX));
        lbStage.scrollTop = Math.max(0, Math.round(targetY));
      } else {
        lbStage.classList.remove('is-actual-size');
        lbScaleBtn.textContent = '2x';
        if (dims) {
          lbImg.style.width = dims.fitW + 'px';
          lbImg.style.height = dims.fitH + 'px';
        } else {
          lbImg.style.width = '';
          lbImg.style.height = '';
        }
        lbStage.scrollLeft = 0;
        lbStage.scrollTop = 0;
      }
    }

    lbImg.addEventListener('load', function () {
      if (lb.classList.contains('open')) {
        setActualSize(lbStage.classList.contains('is-actual-size'));
      }
    });

    window.addEventListener('resize', function () {
      if (lb.classList.contains('open') && !lbStage.classList.contains('is-actual-size')) {
        setActualSize(false);
      }
    }, { passive: true });

    function openLightbox(card) {
      var img = card.querySelector('img');
      if (!img) return;
      lastOpener = card;
      hideTooltip();

      lbImg.src = img.getAttribute('src') || '';
      lbImg.alt = img.getAttribute('alt') || '';
      var cap = card.querySelector('figcaption, .map-caption');
      if (cap) {
        lbCaption.innerHTML = cap.innerHTML;
        applyLang(getLang());
      } else {
        lbCaption.textContent = lbImg.alt;
      }

      lb.classList.add('open');
      document.body.classList.add('xcxde-modal-open');
      setActualSize(false);
      lbCloseBtn.focus();
    }

    function closeLightbox() {
      if (!lb.classList.contains('open')) return;
      lb.classList.remove('open');
      document.body.classList.remove('xcxde-modal-open');
      setActualSize(false);
      hideTooltip();
      if (lastOpener && lastOpener.focus) {
        lastOpener.focus();
      }
    }

    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var img = card.querySelector('img');
        if (!img) return;
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
        var label = img.getAttribute('alt') || 'Enlarge image';
        if (!card.hasAttribute('aria-label')) card.setAttribute('aria-label', label);

        card.addEventListener('click', function () {
          openLightbox(card);
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(card);
          }
        });
      })(cards[i]);
    }

    lbCloseBtn.addEventListener('click', closeLightbox);

    lbScaleBtn.addEventListener('click', function () {
      var isActual = lbStage.classList.contains('is-actual-size');
      setActualSize(!isActual);
    });

    lbStage.addEventListener('click', function (e) {
      if (didDrag) {
        didDrag = false;
        return;
      }
      if (e.target === lbStage) {
        closeLightbox();
      }
    });

    lbImg.addEventListener('click', function (e) {
      e.stopPropagation();
      if (didDrag) {
        didDrag = false;
        return;
      }
      var isActual = lbStage.classList.contains('is-actual-size');
      setActualSize(!isActual, e.clientX, e.clientY);
    });

    lbStage.addEventListener('mousedown', function (e) {
      if (!lbStage.classList.contains('is-actual-size') || e.button !== 0) return;
      isDragging = true;
      didDrag = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startScrollLeft = lbStage.scrollLeft;
      startScrollTop = lbStage.scrollTop;
      lbStage.classList.add('is-dragging');
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        didDrag = true;
      }
      lbStage.scrollLeft = startScrollLeft - dx;
      lbStage.scrollTop = startScrollTop - dy;
    });

    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      lbStage.classList.remove('is-dragging');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) {
        e.preventDefault();
        closeLightbox();
      }
    });
  }

  function boot() {
    initTooltips();
    initLangButton();
    initCheckboxes();
    initSpoilers();
    initImageLightbox();
    initHashReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
