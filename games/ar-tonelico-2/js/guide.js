(function () {
  var LANG_KEY = 'at2_lang';
  var CHECK_KEY = 'at2_checks_v1';

  function getSavedChecks() {
    try {
      return JSON.parse(localStorage.getItem(CHECK_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveChecks(map) {
    try {
      localStorage.setItem(CHECK_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function applyLanguage(lang) {
    var mode = lang === 'en' ? 'en' : 'jp';
    document.documentElement.setAttribute('data-game-lang', mode);
    try {
      localStorage.setItem(LANG_KEY, mode);
    } catch (e) {}

    document.querySelectorAll('.term').forEach(function (el) {
      var text = mode === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-jp');
      if (text) el.textContent = text;
    });

    document.querySelectorAll('.lang-opt').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === mode);
    });
  }

  function initLanguageToggle() {
    var stored = 'jp';
    try {
      stored = localStorage.getItem(LANG_KEY) || 'jp';
    } catch (e) {}

    var wrap = document.createElement('div');
    wrap.className = 'lang-toggle-float';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Term Language');

    var btnJp = document.createElement('button');
    btnJp.type = 'button';
    btnJp.className = 'lang-opt';
    btnJp.setAttribute('data-lang', 'jp');
    btnJp.textContent = 'JP';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'lang-opt';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.textContent = 'EN';

    wrap.appendChild(btnJp);
    wrap.appendChild(btnEn);
    document.body.appendChild(wrap);

    btnJp.addEventListener('click', function () { applyLanguage('jp'); });
    btnEn.addEventListener('click', function () { applyLanguage('en'); });
    applyLanguage(stored);
  }

  function initTooltips() {
    var tipBox = document.createElement('div');
    tipBox.className = 'tooltip-float';
    document.body.appendChild(tipBox);

    function showTip(target) {
      var mode = document.documentElement.getAttribute('data-game-lang') === 'en' ? 'en' : 'jp';
      var jp = target.getAttribute('data-jp');
      var en = target.getAttribute('data-en');
      var alt = mode === 'en' ? jp : en;
      var tip = (alt && alt !== target.textContent) ? alt : target.getAttribute('data-tip');
      if (!tip || tip === target.textContent) return;
      tipBox.textContent = tip;
      var rect = target.getBoundingClientRect();
      var left = Math.min(window.innerWidth - 295, Math.max(12, rect.left));
      var top = rect.top > 56 ? rect.top - tipBox.offsetHeight - 8 : rect.bottom + 8;
      tipBox.style.left = left + 'px';
      tipBox.style.top = Math.max(8, top) + 'px';
      tipBox.classList.add('visible');
    }

    function hideTip() {
      tipBox.classList.remove('visible');
    }

    document.addEventListener('mouseover', function (e) {
      var term = e.target.closest('.term');
      if (term) showTip(term);
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('.term')) hideTip();
    });
  }

  function initSpoilers() {
    document.querySelectorAll('.spoiler').forEach(function (el) {
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', function () {
        el.classList.toggle('revealed');
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.classList.toggle('revealed');
        }
      });
    });
  }

  function updateCounters() {
    var checks = getSavedChecks();
    var boxes = Array.prototype.slice.call(document.querySelectorAll('input.check-box[data-check-id]'));

    if (boxes.length) {
      var done = boxes.filter(function (cb) { return cb.checked; }).length;
      var total = boxes.length;
      var pct = total ? Math.round((done / total) * 100) : 0;
      var wrap = document.querySelector('.completion-bar-wrap');
      if (wrap) {
        var label = wrap.getAttribute('data-counter-label') || 'Completed';
        var txt = wrap.querySelector('.completion-text');
        var fill = wrap.querySelector('.completion-fill');
        if (txt) txt.textContent = label + ': ' + done + '/' + total + ' (' + pct + '%)';
        if (fill) fill.style.width = pct + '%';
      }
    }

    document.querySelectorAll('[data-hub-prefix]').forEach(function (el) {
      var prefix = el.getAttribute('data-hub-prefix');
      var total = parseInt(el.getAttribute('data-hub-total') || '0', 10);
      var count = 0;
      Object.keys(checks).forEach(function (key) {
        if (checks[key] && key.indexOf(prefix) === 0) count++;
      });
      if (count > total) count = total;
      var pct = total ? Math.round((count / total) * 100) : 0;
      el.textContent = count + '/' + total + ' (' + pct + '%)';
    });
  }

  function initChecklists() {
    var checks = getSavedChecks();
    var boxes = document.querySelectorAll('input.check-box[data-check-id]');

    boxes.forEach(function (cb) {
      var id = cb.getAttribute('data-check-id');
      cb.checked = !!checks[id];
      var row = cb.closest('.check-item, tr');
      if (row) row.classList.toggle('is-checked', cb.checked);

      cb.addEventListener('change', function () {
        var current = getSavedChecks();
        current[id] = cb.checked;
        saveChecks(current);
        var host = cb.closest('.check-item, tr');
        if (host) host.classList.toggle('is-checked', cb.checked);
        updateCounters();
        applyFilters();
      });
    });

    var resetBtn = document.getElementById('page-progress-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var current = getSavedChecks();
        boxes.forEach(function (cb) {
          cb.checked = false;
          delete current[cb.getAttribute('data-check-id')];
          var host = cb.closest('.check-item, tr');
          if (host) host.classList.remove('is-checked');
        });
        saveChecks(current);
        updateCounters();
        applyFilters();
      });
    }

    updateCounters();
  }

  function applyFilters() {
    var items = document.querySelectorAll('[data-filter-item]');
    if (!items.length) return;
    var activeBtn = document.querySelector('.filter-btn.active');
    var status = activeBtn ? activeBtn.getAttribute('data-status-filter') : 'all';
    var searchEl = document.querySelector('[data-page-search]');
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';

    items.forEach(function (item) {
      var cb = item.querySelector('input.check-box[data-check-id]');
      var isDone = cb ? cb.checked : false;
      var textMatch = !query || item.textContent.toLowerCase().indexOf(query) !== -1;
      var statusMatch = status === 'all' || (status === 'done' && isDone) || (status === 'pending' && !isDone);
      item.style.display = textMatch && statusMatch ? '' : 'none';
    });
  }

  function initFilters() {
    document.querySelectorAll('.filter-btn[data-status-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyFilters();
      });
    });

    var searchEl = document.querySelector('[data-page-search]');
    if (searchEl) {
      searchEl.addEventListener('input', applyFilters);
    }
  }

  function initLightbox() {
    var cards = document.querySelectorAll('figure.screen-card');
    if (!cards.length) return;

    var modal = document.createElement('div');
    modal.className = 'at-lightbox';
    modal.innerHTML =
      '<div class="at-lightbox-bar">' +
      '<span class="at-lightbox-caption"></span>' +
      '<div class="at-lightbox-actions">' +
      '<button type="button" class="at-lightbox-btn" data-lb-zoom>100%</button>' +
      '<button type="button" class="at-lightbox-btn" data-lb-close>Close</button>' +
      '</div></div>' +
      '<div class="at-lightbox-stage"><img src="" alt=""></div>';
    document.body.appendChild(modal);

    var stage = modal.querySelector('.at-lightbox-stage');
    var modalImg = modal.querySelector('img');
    var captionEl = modal.querySelector('.at-lightbox-caption');
    var zoomBtn = modal.querySelector('[data-lb-zoom]');
    var closeBtn = modal.querySelector('[data-lb-close]');

    function closeModal() {
      modal.classList.remove('open');
      stage.classList.remove('is-actual-size');
      zoomBtn.textContent = '100%';
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var img = card.querySelector('img');
        var fig = card.querySelector('figcaption');
        if (!img) return;
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        captionEl.textContent = fig ? fig.textContent.trim() : '';
        modal.classList.add('open');
      });
    });

    zoomBtn.addEventListener('click', function () {
      var actual = stage.classList.toggle('is-actual-size');
      zoomBtn.textContent = actual ? 'Fit' : '100%';
    });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target === stage) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLanguageToggle();
    initTooltips();
    initSpoilers();
    initChecklists();
    initFilters();
    initLightbox();
  });
})();
