document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Theme toggle (site defaults to its normal light theme; dark is opt-in, persists) ---------- */
  var root = document.documentElement;
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') root.classList.add('dark');

  var utilBar = document.createElement('div');
  utilBar.className = 'util-bar';

  var themeBtn = document.createElement('button');
  themeBtn.id = 'themeToggle';
  themeBtn.className = 'util-btn';
  themeBtn.type = 'button';
  themeBtn.setAttribute('aria-label', 'Toggle dark mode');
  themeBtn.textContent = root.classList.contains('dark') ? '☀️' : '🌙';
  themeBtn.addEventListener('click', function () {
    root.classList.toggle('dark');
    var isDark = root.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  });

  var topBtn = document.createElement('button');
  topBtn.id = 'backToTop';
  topBtn.className = 'util-btn';
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.textContent = '↑';
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  utilBar.appendChild(themeBtn);
  utilBar.appendChild(topBtn);
  document.body.appendChild(utilBar);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) topBtn.classList.add('visible');
    else topBtn.classList.remove('visible');
  }, { passive: true });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll('.posts > article, .post.featured, .cv-block');
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Project search + tag filter (index.html only) ---------- */
  var postsSection = document.querySelector('section.posts');
  if (postsSection) {
    var articles = Array.prototype.slice.call(postsSection.querySelectorAll(':scope > article'));

    var allTags = new Set();
    articles.forEach(function (a) {
      (a.dataset.tags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean)
        .forEach(function (t) { allTags.add(t); });
    });

    var toolbar = document.createElement('div');
    toolbar.className = 'project-toolbar';

    var search = document.createElement('input');
    search.type = 'search';
    search.id = 'projectSearch';
    search.placeholder = 'Search projects…';
    search.setAttribute('aria-label', 'Search projects');

    var tagWrap = document.createElement('div');
    tagWrap.className = 'tag-filters';

    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'tag-btn active';
    allBtn.textContent = 'All';
    allBtn.dataset.tag = 'all';
    tagWrap.appendChild(allBtn);

    allTags.forEach(function (tag) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-btn';
      btn.textContent = tag;
      btn.dataset.tag = tag;
      tagWrap.appendChild(btn);
    });

    toolbar.appendChild(search);
    toolbar.appendChild(tagWrap);

    // Insert at the very top of #main — before the featured project too,
    // not just above the grid — so search is the first thing visible.
    var mainEl = postsSection.closest('#main') || postsSection.parentNode;
    var firstMainChild = mainEl.firstElementChild;
    if (firstMainChild) {
      mainEl.insertBefore(toolbar, firstMainChild);
    } else {
      postsSection.parentNode.insertBefore(toolbar, postsSection);
    }

    var noResults = document.createElement('p');
    noResults.className = 'no-results';
    noResults.textContent = 'No projects match your search.';
    postsSection.parentNode.insertBefore(noResults, postsSection.nextSibling);

    var activeTag = 'all';

    function applyFilters() {
      var q = search.value.trim().toLowerCase();
      var visibleCount = 0;
      articles.forEach(function (a) {
        var text = a.textContent.toLowerCase();
        var tags = (a.dataset.tags || '').toLowerCase();
        var matchesTag = activeTag === 'all' || tags.indexOf(activeTag.toLowerCase()) !== -1;
        var matchesText = !q || text.indexOf(q) !== -1;
        var show = matchesTag && matchesText;
        a.classList.toggle('hidden-by-filter', !show);
        if (show) visibleCount++;
      });
      noResults.classList.toggle('visible', visibleCount === 0);
    }

    search.addEventListener('input', applyFilters);
    tagWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.tag-btn');
      if (!btn) return;
      tagWrap.querySelectorAll('.tag-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeTag = btn.dataset.tag;
      applyFilters();
    });
  }

  /* ---------- PDF viewer fallback for browsers/devices that can't render inline PDFs ---------- */
  var pdfWrap = document.querySelector('.pdf-frame-inner');
  if (pdfWrap) {
    var fallback = pdfWrap.querySelector('.pdf-fallback');
    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroidFirefox = /Android/.test(ua) && /Firefox/.test(ua);
    if (fallback && (isIOS || isAndroidFirefox)) {
      fallback.classList.add('visible');
    }
  }
});
