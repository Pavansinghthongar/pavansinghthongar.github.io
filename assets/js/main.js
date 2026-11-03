/* Pavan Singh Thongar — portfolio interactions */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  var themeListeners = [];
  $('#themeToggle').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0b0f1a' : '#f6f7fb');
    themeListeners.forEach(function (fn) { fn(); });
  });

  /* ---------- Mobile menu ---------- */
  var menu = $('#mobileMenu'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = menu.hasAttribute('hidden');
    if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.setAttribute('hidden', ''); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- Scroll progress + active nav + timeline fill ---------- */
  var progress = $('.scroll-progress');
  var navLinks = $$('.nav-links a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  var timeline = $('#timeline'), tlFill = $('.tl-fill');
  function onScroll() {
    var h = document.documentElement;
    var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    progress.style.transform = 'scaleX(' + p + ')';
    var y = window.scrollY + 120, current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var vis = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      tlFill.style.height = (vis * 100) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal + counters ---------- */
  function animateCount(el) {
    var to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || '0', 10);
    if (reduceMotion) { el.textContent = fmt(to, dec); return; }
    var start = performance.now(), dur = 1400;
    (function step(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(to * e, dec);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('.count', en.target).forEach(function (c) { if (!c.dataset.done) { c.dataset.done = 1; animateCount(c); } });
      if (en.target.classList.contains('count') && !en.target.dataset.done) { en.target.dataset.done = 1; animateCount(en.target); }
      io.unobserve(en.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal, .strip .count').forEach(function (el) { io.observe(el); });

  /* ---------- Typed text ---------- */
  var words = ['SQL that answers real questions.', 'Power BI dashboards leaders trust.', 'automating reporting busywork.', 'KPI design & scorecards.', 'data quality you can defend.'];
  var typedEl = $('#typed');
  if (reduceMotion) typedEl.textContent = words[0];
  else (function () {
    var wi = 0, ci = 0, del = false;
    (function tick() {
      var w = words[wi];
      typedEl.textContent = w.slice(0, ci);
      if (!del && ci === w.length) { del = true; return setTimeout(tick, 1800); }
      if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      ci += del ? -1 : 1;
      setTimeout(tick, del ? 28 : 55);
    })();
  })();

  /* ---------- Hero sparkline ---------- */
  (function () {
    var svg = $('#heroSpark'); if (!svg) return;
    var vals = [12, 15, 14, 19, 22, 21, 27, 30, 29, 36, 41, 44, 48, 52];
    var W = 320, H = 90, max = 56;
    var pts = vals.map(function (v, i) { return [i * (W / (vals.length - 1)), H - (v / max) * (H - 10) - 4]; });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var last = pts[pts.length - 1];
    svg.innerHTML =
      '<defs><linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="currentColor" stop-opacity=".35"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="area" d="' + line + ' L' + W + ',' + H + ' L0,' + H + ' Z"/>' +
      '<path class="line" d="' + line + '"/>' +
      '<circle class="dot" cx="' + (last[0] - 3) + '" cy="' + last[1] + '" r="4"/>';
    svg.style.color = 'var(--accent-2)';
    var path = $('.line', svg), len = path.getTotalLength();
    if (!reduceMotion) {
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.8s ease .3s';
      path.style.strokeDashoffset = 0;
    }
  })();

  /* ---------- Project card tilt ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Contact form (mailto) ---------- */
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, name = f.name.value.trim(), co = f.company.value.trim(), msg = f.message.value.trim();
    var subject = 'Opportunity for Pavan from ' + name + (co ? ' (' + co + ')' : '');
    var body = msg + '\n\n— ' + name + (co ? ', ' + co : '');
    window.location.href = 'mailto:thongarpavansingh@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  /* =========================================================
     Charts (Chart.js)
     ========================================================= */
  if (!window.Chart) return;
  var charts = [];
  function themeChartDefaults() {
    Chart.defaults.color = css('--muted');
    Chart.defaults.borderColor = css('--border');
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = css('--surface-solid');
    Chart.defaults.plugins.tooltip.titleColor = css('--text');
    Chart.defaults.plugins.tooltip.bodyColor = css('--text-2');
    Chart.defaults.plugins.tooltip.borderColor = css('--border-strong');
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
  }
  themeChartDefaults();
  themeListeners.push(function () {
    themeChartDefaults();
    charts.forEach(function (c) { if (c._recolor) c._recolor(); c.update('none'); });
  });
  function alpha(hex, a) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(hex, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function lazyChart(canvas, build) {
    var obs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { obs.disconnect(); build(); }
    }, { rootMargin: '100px' });
    obs.observe(canvas);
  }

  /* ---------- Career chart ---------- */
  var careerCanvas = $('#careerChart');
  lazyChart(careerCanvas, function () {
    var c = new Chart(careerCanvas, {
      type: 'bar',
      data: {
        labels: [['Sreekaram Enterprises', '2021'], ['Radiant Infosystems', '2022–23'], ['Allied American Agency', '2025–26']],
        datasets: [
          { label: 'Manual effort / prep time saved (%)', data: [20, 25, 30], borderRadius: 8, maxBarThickness: 46 },
          { label: 'Accuracy / reliability gained (%)', data: [15, 15, 20], borderRadius: 8, maxBarThickness: 46 }
        ]
      },
      options: {
        maintainAspectRatio: false,
        animation: { duration: reduceMotion ? 0 : 1200, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return ' ' + x.dataset.label + ': ' + x.raw + '%'; } } } },
        scales: {
          y: { beginAtZero: true, max: 35, ticks: { callback: function (v) { return v + '%'; }, stepSize: 10 }, grid: { color: function () { return css('--border'); } } },
          x: { grid: { display: false }, ticks: { color: function () { return css('--text-2'); } } }
        }
      }
    });
    c._recolor = function () {
      c.data.datasets[0].backgroundColor = css('--accent');
      c.data.datasets[1].backgroundColor = css('--accent-2');
    };
    c._recolor(); c.update(); charts.push(c);
  });

  /* =========================================================
     Live dashboard
     ========================================================= */
  var D = window.DEMO_DATA;
  var state = { region: 'All', channel: 'All', range: 12 };
  var teamById = {}; D.TEAMS.forEach(function (t) { teamById[t.team_id] = t; });
  var agentsByTeam = {}; D.AGENTS.forEach(function (a) { agentsByTeam[a.team_id] = (agentsByTeam[a.team_id] || 0) + 1; });

  function filterRows(opt) {
    opt = opt || {};
    return D.TICKETS.filter(function (r) {
      if (state.region !== 'All' && r.region !== state.region) return false;
      if (!opt.ignoreChannel && state.channel !== 'All' && r.channel !== state.channel) return false;
      if (opt.from != null && (r.month < opt.from || r.month >= opt.to)) return false;
      return true;
    });
  }
  function summarize(rows) {
    var n = rows.length, hrs = 0, cs = 0, cn = 0, sla = 0;
    rows.forEach(function (r) { hrs += r.resolution_hrs; sla += r.sla_met; if (r.csat != null) { cs += r.csat; cn++; } });
    return { n: n, aht: n ? hrs / n : 0, csat: cn ? cs / cn : 0, sla: n ? sla / n * 100 : 0, missing: n - cn };
  }
  function setDelta(el, cur, prev, goodWhenUp, unit, dec, label) {
    if (prev == null || !isFinite(prev) || prev === 0) { el.textContent = ''; return; }
    var diff = unit === '%' && dec != null ? cur - prev : (cur - prev) / prev * 100;
    var up = diff >= 0, good = goodWhenUp ? up : !up;
    el.className = good ? 'up' : 'down';
    var txt = unit === 'pp' ? (up ? '+' : '') + diff.toFixed(1) + ' pp' : (up ? '▲ ' : '▼ ') + Math.abs(diff).toFixed(1) + '%';
    el.textContent = txt + ' ' + label;
  }

  var cTrend, cChannel, cTeam;
  function buildDashboard() {
    cTrend = new Chart($('#cTrend'), {
      data: {
        labels: [],
        datasets: [
          { type: 'bar', label: 'Tickets', data: [], yAxisID: 'y', borderRadius: 6, order: 2 },
          { type: 'line', label: 'CSAT', data: [], yAxisID: 'y1', tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointHoverRadius: 6, order: 1, fill: false }
        ]
      },
      options: {
        maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } } },
        scales: {
          y: { beginAtZero: true, grid: { color: function () { return css('--border'); } }, title: { display: true, text: 'Tickets' } },
          y1: { position: 'right', min: 3, max: 5, grid: { display: false }, title: { display: true, text: 'CSAT (1–5)' } },
          x: { grid: { display: false } }
        }
      }
    });
    cTrend._recolor = function () {
      cTrend.data.datasets[0].backgroundColor = alpha(css('--accent'), 0.55);
      cTrend.data.datasets[0].hoverBackgroundColor = css('--accent');
      cTrend.data.datasets[1].borderColor = css('--accent-2');
      cTrend.data.datasets[1].pointBackgroundColor = css('--accent-2');
    };

    cChannel = new Chart($('#cChannel'), {
      type: 'doughnut',
      data: { labels: D.CHANNELS, datasets: [{ data: [], borderWidth: 2, hoverOffset: 8 }] },
      options: {
        maintainAspectRatio: false, cutout: '64%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 12 } },
          tooltip: { callbacks: { label: function (x) { var t = x.dataset.data.reduce(function (a, b) { return a + b; }, 0); return ' ' + x.label + ': ' + fmt(x.raw) + ' (' + (x.raw / t * 100).toFixed(1) + '%)'; } } }
        },
        onClick: function (e, els) {
          if (!els.length) return;
          var ch = D.CHANNELS[els[0].index];
          state.channel = state.channel === ch ? 'All' : ch;
          $('#fChannel').value = state.channel; renderDashboard();
        },
        onHover: function (e, els) { e.native.target.style.cursor = els.length ? 'pointer' : 'default'; }
      }
    });
    cChannel._recolor = function () {
      var base = [css('--accent'), css('--accent-2'), css('--good'), css('--warn')];
      cChannel.data.datasets[0].backgroundColor = base.map(function (c, i) {
        return state.channel === 'All' || D.CHANNELS[i] === state.channel ? c : alpha(c, 0.18);
      });
      cChannel.data.datasets[0].borderColor = css('--surface-solid');
    };

    cTeam = new Chart($('#cTeam'), {
      type: 'bar',
      data: { labels: D.TEAMS.map(function (t) { return t.team_name; }), datasets: [{ label: 'Tickets / agent / month', data: [], borderRadius: 6, maxBarThickness: 22 }] },
      options: {
        indexAxis: 'y', maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, grid: { color: function () { return css('--border'); } } }, y: { grid: { display: false }, ticks: { color: function () { return css('--text-2'); } } } }
      }
    });
    cTeam._recolor = function () {
      var vals = cTeam.data.datasets[0].data, max = Math.max.apply(null, vals.length ? vals : [0]);
      cTeam.data.datasets[0].backgroundColor = vals.map(function (v) { return v === max ? css('--bad') : alpha(css('--accent-2'), 0.7); });
    };
    charts.push(cTrend, cChannel, cTeam);
    renderDashboard();
  }

  function renderDashboard() {
    var r = state.range, from = 12 - r;
    var cur = filterRows({ from: from, to: 12 });
    var prev = null, label = '';
    if (r < 12) { prev = filterRows({ from: from - r, to: from }); label = 'vs prior ' + r + 'M'; }
    else { cur = filterRows({ from: 6, to: 12 }); prev = filterRows({ from: 0, to: 6 }); label = 'H2 vs H1'; }
    var all = filterRows({ from: from, to: 12 });
    var S = summarize(all), Sc = summarize(cur), Sp = prev ? summarize(prev) : null;

    $('#kTickets').textContent = fmt(S.n);
    $('#kAht').textContent = S.aht.toFixed(1);
    $('#kCsat').textContent = S.csat.toFixed(2);
    $('#kSla').textContent = S.sla.toFixed(1) + '%';
    if (Sp) {
      setDelta($('#dTickets'), Sc.n, Sp.n, true, '', null, label);
      setDelta($('#dAht'), Sc.aht, Sp.aht, false, '', null, label);
      setDelta($('#dCsat'), Sc.csat, Sp.csat, true, '', null, label);
      var dSla = $('#dSla'), diff = Sc.sla - Sp.sla;
      dSla.className = diff >= 0 ? 'up' : 'down';
      dSla.textContent = (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' pp ' + label;
    }

    // trend
    var months = D.MONTHS.slice(from), vol = [], csat = [];
    months.forEach(function (m, i) {
      var s = summarize(all.filter(function (x) { return x.month === from + i; }));
      vol.push(s.n); csat.push(+s.csat.toFixed(2));
    });
    cTrend.data.labels = months.map(function (m) { return m.label; });
    cTrend.data.datasets[0].data = vol; cTrend.data.datasets[1].data = csat;

    // channel (ignores channel filter so the mix stays visible; selection highlighted)
    var chRows = filterRows({ from: from, to: 12, ignoreChannel: true });
    var chCount = D.CHANNELS.map(function (c) { return chRows.filter(function (x) { return x.channel === c; }).length; });
    cChannel.data.datasets[0].data = chCount;

    // team workload
    var tpa = D.TEAMS.map(function (t) {
      var n = all.filter(function (x) { return x.team_id === t.team_id; }).length;
      return +(n / agentsByTeam[t.team_id] / r).toFixed(1);
    });
    cTeam.data.datasets[0].data = tpa;

    [cTrend, cChannel, cTeam].forEach(function (c) { c._recolor(); c.update(); });
    renderInsights(all, chRows, tpa, months, from, S);
    $$('.seg button').forEach(function (b) { b.classList.toggle('on', +b.dataset.range === r); });
  }

  function renderInsights(rows, chRows, tpa, months, from, S) {
    var out = [];
    // workload
    var maxI = tpa.indexOf(Math.max.apply(null, tpa));
    var avg = tpa.reduce(function (a, b) { return a + b; }, 0) / tpa.length;
    out.push(['bad', '!', '<b>' + D.TEAMS[maxI].team_name + '</b> carries ' + tpa[maxI] + ' tickets per agent per month, <b>' + Math.round((tpa[maxI] / avg - 1) * 100) + '% above</b> the team average. It is the first place to rebalance or add headcount.']);
    // region CSAT
    if (state.region === 'All') {
      var reg = D.REGIONS.map(function (g) { return [g, summarize(rows.filter(function (x) { return x.region === g; }))]; })
        .sort(function (a, b) { return a[1].csat - b[1].csat; });
      var lo = reg[0], hi = reg[reg.length - 1];
      out.push(['bad', '↓', '<b>' + lo[0] + '</b> has the lowest CSAT (' + lo[1].csat.toFixed(2) + ' vs ' + hi[1].csat.toFixed(2) + ' in ' + hi[0] + '). Its resolution time runs <b>' + Math.round((lo[1].aht / hi[1].aht - 1) * 100) + '% longer</b>, so slow resolution is the likely root cause.']);
    } else {
      out.push(['info', 'i', 'Filtered to <b>' + state.region + '</b>: ' + fmt(S.n) + ' tickets, CSAT ' + S.csat.toFixed(2) + ', SLA ' + S.sla.toFixed(1) + '%.']);
    }
    // channel speed + shift
    var ch = D.CHANNELS.map(function (c) { return [c, summarize(chRows.filter(function (x) { return x.channel === c; }))]; })
      .sort(function (a, b) { return a[1].aht - b[1].aht; });
    var first = chRows.filter(function (x) { return x.month === from; }), last = chRows.filter(function (x) { return x.month === 11; });
    var share = function (arr) { return arr.length ? arr.filter(function (x) { return x.channel === 'Chat'; }).length / arr.length * 100 : 0; };
    out.push(['good', '✓', '<b>' + ch[0][0] + '</b> resolves ' + (ch[ch.length - 1][1].aht / ch[0][1].aht).toFixed(1) + '× faster than ' + ch[ch.length - 1][0] + '. Chat share moved from ' + share(first).toFixed(0) + '% to <b>' + share(last).toFixed(0) + '%</b> over ' + months[0].label + ' to ' + months[months.length - 1].label + '.']);
    // SLA trend
    var sf = summarize(rows.filter(function (x) { return x.month === from; })), sl = summarize(rows.filter(function (x) { return x.month === 11; }));
    var dd = sl.sla - sf.sla;
    out.push([dd >= 0 ? 'good' : 'bad', dd >= 0 ? '▲' : '▼', 'SLA attainment went from ' + sf.sla.toFixed(1) + '% to <b>' + sl.sla.toFixed(1) + '%</b> (' + (dd >= 0 ? '+' : '') + dd.toFixed(1) + ' pp) in this window.']);
    // data quality
    out.push(['info', 'DQ', '<b>' + fmt(S.missing) + '</b> tickets (' + (S.missing / Math.max(1, S.n) * 100).toFixed(1) + '%) have no CSAT response. They are excluded from the average, not counted as zero.']);
    $('#insights').innerHTML = out.map(function (o) { return '<li><span class="ic ' + o[0] + '">' + o[1] + '</span><span>' + o[2] + '</span></li>'; }).join('');
  }

  $('#fRegion').addEventListener('change', function (e) { state.region = e.target.value; renderDashboard(); });
  $('#fChannel').addEventListener('change', function (e) { state.channel = e.target.value; renderDashboard(); });
  $$('.seg button').forEach(function (b) { b.addEventListener('click', function () { state.range = +b.dataset.range; renderDashboard(); }); });
  $('#fReset').addEventListener('click', function () {
    state = { region: 'All', channel: 'All', range: 12 };
    $('#fRegion').value = 'All'; $('#fChannel').value = 'All'; renderDashboard();
  });
  lazyChart($('#cTrend'), buildDashboard);

  /* =========================================================
     SQL Lab (sql.js / SQLite WASM)
     ========================================================= */
  var PRESETS = [
    { tag: 'WORKLOAD', title: 'Which team is overloaded?',
      why: 'Tickets per agent normalizes for headcount. Raw volume hides the team that is actually stretched.',
      sql: "-- Which team is overloaded? Tickets per agent per month\nSELECT t.team_name,\n       COUNT(DISTINCT k.agent_id)                       AS agents,\n       COUNT(*)                                         AS tickets,\n       ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT k.agent_id) / 12, 1)\n                                                        AS tickets_per_agent_month,\n       ROUND(AVG(k.resolution_hrs), 1)                  AS avg_res_hrs\nFROM tickets k\nJOIN teams t ON t.team_id = k.team_id\nGROUP BY t.team_name\nORDER BY tickets_per_agent_month DESC;" },
    { tag: 'TREND · WINDOW FN', title: 'Month-over-month CSAT trend',
      why: 'LAG() puts each month next to the one before it, so leadership sees momentum and not only levels.',
      sql: "-- Monthly KPIs with month-over-month CSAT change\nWITH monthly AS (\n  SELECT substr(created_date, 1, 7)        AS month,\n         COUNT(*)                          AS tickets,\n         ROUND(AVG(csat), 2)               AS avg_csat,\n         ROUND(100.0 * AVG(sla_met), 1)    AS sla_pct\n  FROM tickets\n  GROUP BY 1\n)\nSELECT month, tickets, avg_csat,\n       ROUND(avg_csat - LAG(avg_csat) OVER (ORDER BY month), 2) AS csat_mom,\n       sla_pct\nFROM monthly\nORDER BY month;" },
    { tag: 'ROOT CAUSE', title: 'Where do SLA breaches concentrate?',
      why: 'Splitting by channel and region together finds the hotspot that a single-dimension view averages away.',
      sql: "-- SLA breach hotspots: channel x region\nSELECT channel, region,\n       COUNT(*)                                       AS tickets,\n       SUM(1 - sla_met)                               AS breaches,\n       ROUND(100.0 * SUM(1 - sla_met) / COUNT(*), 1)  AS breach_rate_pct\nFROM tickets\nGROUP BY channel, region\nHAVING COUNT(*) > 200\nORDER BY breach_rate_pct DESC\nLIMIT 8;" },
    { tag: 'RANKING', title: 'Top CSAT agent in each team',
      why: 'RANK() within each team picks out internal coaches. A minimum ticket count keeps small samples from skewing the list.',
      sql: "-- Best-rated agent per team (min 100 tickets)\nSELECT * FROM (\n  SELECT a.agent_name, t.team_name,\n         COUNT(*)              AS tickets,\n         ROUND(AVG(k.csat), 2) AS avg_csat,\n         RANK() OVER (PARTITION BY t.team_name\n                      ORDER BY AVG(k.csat) DESC) AS rank_in_team\n  FROM tickets k\n  JOIN agents a ON a.agent_id = k.agent_id\n  JOIN teams  t ON t.team_id  = a.team_id\n  GROUP BY a.agent_id\n  HAVING COUNT(*) >= 100\n)\nWHERE rank_in_team = 1\nORDER BY avg_csat DESC;" },
    { tag: 'SEGMENTATION', title: 'Does agent tenure matter?',
      why: 'Tenure bands test whether onboarding and training investments pay off in speed and satisfaction.',
      sql: "-- Resolution time & CSAT by agent tenure band\nSELECT CASE\n         WHEN a.tenure_months < 12 THEN '0-11 mo'\n         WHEN a.tenure_months < 24 THEN '12-23 mo'\n         WHEN a.tenure_months < 36 THEN '24-35 mo'\n         ELSE '36+ mo'\n       END                               AS tenure_band,\n       COUNT(DISTINCT a.agent_id)        AS agents,\n       COUNT(*)                          AS tickets,\n       ROUND(AVG(k.resolution_hrs), 2)   AS avg_res_hrs,\n       ROUND(AVG(k.csat), 2)             AS avg_csat\nFROM tickets k\nJOIN agents a ON a.agent_id = k.agent_id\nGROUP BY tenure_band\nORDER BY MIN(a.tenure_months);" },
    { tag: 'DATA QUALITY', title: 'Validate the data before trusting it',
      why: 'I run checks like these before any dashboard ships. They are how I improved reporting accuracy by 20%.',
      sql: "-- Data quality checks: run these before building any report\nSELECT 'total rows'               AS check_name, COUNT(*) AS result FROM tickets\nUNION ALL\nSELECT 'duplicate ticket_ids',     COUNT(*) - COUNT(DISTINCT ticket_id) FROM tickets\nUNION ALL\nSELECT 'missing csat (no survey)', SUM(csat IS NULL) FROM tickets\nUNION ALL\nSELECT 'csat out of range 1-5',    COALESCE(SUM(csat NOT BETWEEN 1 AND 5), 0) FROM tickets\nUNION ALL\nSELECT 'orphan agent_ids',         COUNT(*) FROM tickets\n                                   WHERE agent_id NOT IN (SELECT agent_id FROM agents)\nUNION ALL\nSELECT 'negative resolution_hrs',  SUM(resolution_hrs < 0) FROM tickets;" }
  ];

  var sqlInput = $('#sqlInput'), sqlHl = $('#sqlHl'), sqlOut = $('#sqlOut'), sqlStatus = $('#sqlStatus');
  var db = null, currentPreset = 0;
  var KW = 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|LIMIT|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|IS|NULL|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|DISTINCT|OVER|PARTITION|DESC|ASC|BETWEEN|LIKE|USING|INSERT|INTO|VALUES|CREATE|TABLE|UPDATE|SET|DELETE|DROP';
  var FN = 'COUNT|SUM|AVG|MIN|MAX|ROUND|LAG|LEAD|RANK|DENSE_RANK|ROW_NUMBER|COALESCE|SUBSTR|STRFTIME|DATE|CAST|IFNULL|NTILE|UPPER|LOWER|LENGTH|ABS';
  var tokRe = new RegExp("(--[^\\n]*)|('(?:[^']|'')*')|\\b(\\d+(?:\\.\\d+)?)\\b|\\b(" + KW + ")\\b|\\b(" + FN + ")(?=\\s*\\()", 'gi');
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function highlight() {
    var src = sqlInput.value, out = '', last = 0, m;
    tokRe.lastIndex = 0;
    while ((m = tokRe.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'num' : m[4] ? 'kw' : 'fn';
      out += '<span class="tk-' + cls + '">' + esc(m[0]) + '</span>';
      last = tokRe.lastIndex;
    }
    sqlHl.innerHTML = out + esc(src.slice(last)) + '\n';
  }
  function syncScroll() { sqlHl.parentNode.scrollTop = sqlInput.scrollTop; sqlHl.parentNode.scrollLeft = sqlInput.scrollLeft; }
  sqlInput.addEventListener('input', function () { highlight(); $$('#presets button').forEach(function (b) { b.classList.remove('on'); }); currentPreset = -1; });
  sqlInput.addEventListener('scroll', syncScroll);
  sqlInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runSql(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      var s = sqlInput.selectionStart;
      sqlInput.value = sqlInput.value.slice(0, s) + '  ' + sqlInput.value.slice(sqlInput.selectionEnd);
      sqlInput.selectionStart = sqlInput.selectionEnd = s + 2; highlight();
    }
  });

  var presetsEl = $('#presets');
  PRESETS.forEach(function (p, i) {
    var b = document.createElement('button');
    b.innerHTML = '<small>' + p.tag + '</small>' + p.title;
    b.addEventListener('click', function () { loadPreset(i, true); });
    presetsEl.appendChild(b);
  });
  function loadPreset(i, run) {
    currentPreset = i;
    sqlInput.value = PRESETS[i].sql; highlight(); sqlInput.scrollTop = 0; syncScroll();
    $$('#presets button').forEach(function (b, j) { b.classList.toggle('on', j === i); });
    if (run) runSql();
  }
  loadPreset(0, false);

  function runSql() {
    if (!db) { sqlStatus.textContent = 'engine still loading…'; return; }
    var t0 = performance.now();
    try {
      var res = db.exec(sqlInput.value);
      var ms = (performance.now() - t0).toFixed(1);
      if (!res.length) { sqlOut.innerHTML = '<p class="muted small">Query ran. No rows returned.</p>'; sqlStatus.className = 'mono small ok'; sqlStatus.textContent = '✓ ok · ' + ms + ' ms'; return; }
      var r = res[res.length - 1], rows = r.values.slice(0, 300);
      var numCol = r.columns.map(function (_, ci) { return rows.every(function (row) { return row[ci] === null || typeof row[ci] === 'number'; }); });
      var html = '<table><thead><tr>' + r.columns.map(function (c) { return '<th>' + esc(String(c)) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (row, ri) {
          return '<tr style="animation-delay:' + Math.min(ri * 25, 600) + 'ms">' + row.map(function (v, ci) {
            var txt = v === null ? '<span class="muted">NULL</span>' : esc(typeof v === 'number' && !Number.isInteger(v) ? String(+v.toFixed(4)) : String(v));
            return '<td' + (numCol[ci] ? ' class="num"' : '') + '>' + txt + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
      if (currentPreset >= 0) html += '<p class="sql-insight"><b>Why I ask this:</b> ' + PRESETS[currentPreset].why + '</p>';
      sqlOut.innerHTML = html;
      sqlStatus.className = 'mono small ok';
      sqlStatus.textContent = '✓ ' + r.values.length + ' row' + (r.values.length === 1 ? '' : 's') + ' · ' + ms + ' ms' + (r.values.length > 300 ? ' · showing first 300' : '');
    } catch (err) {
      sqlOut.innerHTML = '<p class="sql-err">✗ ' + esc(err.message) + '</p>';
      sqlStatus.className = 'mono small err'; sqlStatus.textContent = 'error';
    }
  }
  $('#runSql').addEventListener('click', runSql);

  function initDb() {
    if (!window.initSqlJs) { sqlStatus.textContent = 'SQL engine unavailable in this browser.'; return; }
    initSqlJs({ locateFile: function (f) { return 'assets/vendor/' + f; } }).then(function (SQL) {
      db = new SQL.Database();
      db.run("CREATE TABLE teams(team_id INTEGER PRIMARY KEY, team_name TEXT, manager TEXT);" +
             "CREATE TABLE agents(agent_id INTEGER PRIMARY KEY, agent_name TEXT, team_id INTEGER, tenure_months INTEGER);" +
             "CREATE TABLE tickets(ticket_id INTEGER PRIMARY KEY, created_date TEXT, region TEXT, channel TEXT, team_id INTEGER, agent_id INTEGER, resolution_hrs REAL, csat INTEGER, sla_met INTEGER);");
      db.run('BEGIN');
      var st = db.prepare('INSERT INTO teams VALUES (?,?,?)');
      D.TEAMS.forEach(function (t) { st.run([t.team_id, t.team_name, t.manager]); }); st.free();
      st = db.prepare('INSERT INTO agents VALUES (?,?,?,?)');
      D.AGENTS.forEach(function (a) { st.run([a.agent_id, a.agent_name, a.team_id, a.tenure_months]); }); st.free();
      st = db.prepare('INSERT INTO tickets VALUES (?,?,?,?,?,?,?,?,?)');
      D.TICKETS.forEach(function (k) { st.run([k.ticket_id, k.created_date, k.region, k.channel, k.team_id, k.agent_id, k.resolution_hrs, k.csat, k.sla_met]); }); st.free();
      db.run('COMMIT');
      sqlStatus.className = 'mono small ok';
      sqlStatus.textContent = '✓ SQLite ready · ' + fmt(D.TICKETS.length) + ' tickets loaded';
      runSql();
    }).catch(function (e) {
      sqlStatus.className = 'mono small err';
      sqlStatus.textContent = 'Could not load SQL engine: ' + e.message;
    });
  }
  var sqlObs = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { sqlObs.disconnect(); initDb(); } }, { rootMargin: '600px' });
  sqlObs.observe($('#sql'));
})();
