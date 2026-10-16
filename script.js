(function(){
  'use strict';

  var hero = document.getElementById('home');
  var card = document.getElementById('card');
  var p1 = document.getElementById('r1');
  var p2 = document.getElementById('r2');
  var N = 7;
  var pts = [];
  var ax = 0, ay = -700, vy = 0;
  var landed = false, drag = false;
  var off = {x:0, y:0};
  var SEG = 36;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function isHP(){ return hero.clientWidth <= 820; }

  function initCard(){
    var hp = isHP();
    SEG = hp ? 26 : 36;
    ax = hero.clientWidth * (hp ? 0.5 : 0.74);
    ay = reduce ? 0 : -(N * SEG + (hp ? 300 : 380));
    vy = 0;
    landed = reduce;
    pts = [];
    drag = false;
    for (var i = 0; i <= N; i++){
      var y = ay + i * SEG;
      pts.push({x:ax, y:y, px:ax, py:y, tx:ax, ty:y});
    }
    card.style.opacity = 1;
  }

  function clampX(x){
    var halfW = card.offsetWidth / 2;
    var min = halfW + 8;
    var max = hero.clientWidth - halfW - 8;
    if (max < min) return hero.clientWidth / 2;
    return Math.max(min, Math.min(max, x));
  }

  function stepCard(){
    var hp = isHP();
    ax = hero.clientWidth * (hp ? 0.5 : 0.74);

    if (!landed){
      vy += 1.2;
      ay += vy;
      if (ay >= 0){
        ay = 0; landed = true;
        for (var k = N - 2; k <= N; k++){
          pts[k].px += (Math.random() < .5 ? -1 : 1) * (9 + k);
        }
      }
    }

    for (var i = 1; i <= N; i++){
      var p = pts[i];
      if (drag && i === N) continue;
      var vx = Math.max(-40, Math.min(40, (p.x - p.px) * .992));
      var vyy = Math.max(-60, Math.min(60, (p.y - p.py) * .992));
      p.px = p.x; p.py = p.y;
      p.x += vx;
      p.y += vyy + (i === N ? 1.45 : .9);
    }

    for (var it = 0; it < 10; it++){
      pts[0].x = pts[0].px = ax;
      pts[0].y = pts[0].py = ay;
      for (var j = 0; j < N; j++){
        var a = pts[j], b = pts[j+1];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.hypot(dx, dy) || .001;
        var df = (d - SEG) / d;
        if (j === 0){
          b.x -= dx * df; b.y -= dy * df;
        } else {
          a.x += dx * df * .5; a.y += dy * df * .5;
          b.x -= dx * df * .5; b.y -= dy * df * .5;
        }
      }
      if (drag){
        pts[N].x = pts[N].tx;
        pts[N].y = pts[N].ty;
      }
    }

    drawCard();
    requestAnimationFrame(stepCard);
  }

  function drawCard(){
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i <= N; i++){
      d += ' L' + pts[i].x.toFixed(1) + ' ' + pts[i].y.toFixed(1);
    }
    p1.setAttribute('d', d);
    p2.setAttribute('d', d);

    var e = pts[N], f = pts[N-1];
    var ang = -Math.atan2(e.x - f.x, e.y - f.y);
    card.style.transform =
      'translate(' + e.x.toFixed(1) + 'px,' + (e.y - 6).toFixed(1) + 'px) ' +
      'translateX(-50%) rotate(' + ang.toFixed(3) + 'rad)';
  }

  function pos(ev){
    var r = hero.getBoundingClientRect();
    return {x: ev.clientX - r.left, y: ev.clientY - r.top};
  }

  card.addEventListener('pointerdown', function(ev){
    if (ev.target.closest('#again')) return;
    drag = true;
    card.setPointerCapture(ev.pointerId);
    var m = pos(ev), e = pts[N];
    off = {x: m.x - e.x, y: m.y - e.y};
    e.tx = e.x; e.ty = e.y;
    ev.preventDefault();
  });

  card.addEventListener('pointermove', function(ev){
    if (!drag) return;
    var m = pos(ev), e = pts[N];
    e.tx = clampX(m.x - off.x);
    e.ty = Math.max(-40, m.y - off.y);
  });

  function up(){ drag = false; }
  card.addEventListener('pointerup', up);
  card.addEventListener('pointercancel', up);

  document.getElementById('again').addEventListener('click', function(ev){
    ev.stopPropagation();
    initCard();
  });

  var out = false;
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      var v = es[0].isIntersecting;
      if (!v) out = true;
      else if (out){ out = false; initCard(); }
    }, {threshold: .4}).observe(hero);
  }

  initCard();
  requestAnimationFrame(stepCard);

  var resizeT = null;
  function onResize(){
    if (resizeT) clearTimeout(resizeT);
    resizeT = setTimeout(function(){ initCard(); }, 150);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  var g = ['</>', '{ }', 'Go', 'JS', 'API', 'SQL', '<div>', 'git', 'JWT', '=>'];
  var fh = '';
  g.forEach(function(t, i){
    fh += '<span class="fx" style="left:' + ((i * 37 + 8) % 92) + '%;top:' + ((i * 53 + 6) % 78) + '%;' +
      'animation-delay:-' + (i * 1.3) + 's;animation-duration:' + (7 + i % 4 * 2) + 's">' + t + '</span>';
  });
  document.getElementById('fxs').innerHTML = fh;

  var roles = ['Backend dengan Golang', 'UI/UX dengan Figma', 'Juara desain tingkat nasional'];
  var ri = 0;
  var rl = document.getElementById('role');
  setInterval(function(){
    rl.style.opacity = 0;
    setTimeout(function(){
      ri = (ri + 1) % roles.length;
      rl.textContent = roles[ri];
      rl.style.opacity = 1;
    }, 300);
  }, 2800);

  var figmaSvg = '<svg viewBox="0 0 38 57" width="16" aria-hidden="true"><path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>';

  var techList = [
    ['JavaScript','JS','#F7DF1E','#222'],
    ['TypeScript','TS','#3178C6'],
    ['HTML','5','#E34F26'],
    ['CSS','3','#1572B6'],
    ['Golang','Go','#00ADD8'],
    ['MySQL','My','#00758F'],
    ['SQL','SQL','#336791'],
    ['Dart','D','#0175C2'],
    ['Flutter','Fl','#02569B'],
    ['Java','J','#ED8B00'],
    ['C++','C++','#00599C'],
    ['Git','◆','#F05032'],
    ['GitLab','GL','#FC6D26'],
    ['Postman','P','#FF6C37'],
    ['Figma',figmaSvg,'#fff'],
    ['JWT','JWT','#000'],
    ['Python','Py','#3776AB'],
    ['REST API','API','#0B5CAB']
  ];

  var wrap = document.getElementById('skills-wrap');
  var html = '';
  techList.forEach(function(t){
    html += '<div class="tech">' +
      '<div class="ti" style="background:' + t[2] + ';color:' + (t[3] || '#fff') + ';' +
      (t[1].length > 2 && t[1][0] !== '<' ? 'font-size:10.5px' : '') + '">' + t[1] + '</div>' +
      t[0] + '</div>';
  });
  wrap.innerHTML = html;

  var awardsData = [
    { rank:3, title:'GAYATAMA Infografis Statistik Internasional', date:'Sep 2026', img:'' },
    { rank:3, title:'Poster Competition, Universitas Setia Budi Surakarta', date:'Feb 2026', img:'' },
    { rank:2, title:'Infografis Agromina Competition, UGM', date:'Okt 2025', img:'' },
    { rank:1, title:'Nasional Poster, Poltekkes Surakarta', date:'Nov 2024', img:'' },
    { rank:2, title:'Nasional Poster Dengue Fever, Universitas Indonesia', date:'Mei 2024', img:'' },
    { rank:1, title:'Nasional Poster, Universitas Airlangga', date:'Mar 2024', img:'' }
  ];

  var awardsEl = document.getElementById('awards');
  var aHtml = '';
  awardsData.forEach(function(a, i){
    aHtml += '<button class="award" type="button" data-i="' + i + '">' +
      '<div class="award-thumb">#' + a.rank + '</div>' +
      '<div class="award-body">' +
        '<h4>' + a.title + '</h4>' +
        '<p>Juara ' + a.rank + ' · ' + a.date + '</p>' +
      '</div></button>';
  });
  awardsEl.innerHTML = aHtml;

  var modal = document.getElementById('modal');
  var modalImg = document.getElementById('modal-img');
  var modalTitle = document.getElementById('modal-title');
  var modalSub = document.getElementById('modal-sub');

  awardsEl.addEventListener('click', function(ev){
    var btn = ev.target.closest('.award');
    if (!btn) return;
    var a = awardsData[+btn.dataset.i];
    modalTitle.textContent = a.title;
    modalSub.textContent = 'Juara ' + a.rank + ' · ' + a.date;
    if (a.img){
      modalImg.innerHTML = '<img src="' + a.img + '" alt="' + a.title + '">';
    } else {
      modalImg.textContent = 'Foto sertifikat belum ditambahkan';
    }
    modal.hidden = false;
  });

  document.getElementById('modal-close').addEventListener('click', function(){
    modal.hidden = true;
  });
  modal.addEventListener('click', function(ev){
    if (ev.target === modal) modal.hidden = true;
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') modal.hidden = true;
  });

  function count(el){
    if (el.dataset.done === '1') return;
    el.dataset.done = '1';
    var n = +el.dataset.n;
    var d = +(el.dataset.d || 0);
    var t0 = performance.now();
    (function f(t){
      var k = Math.min(1, (t - t0) / 1400);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = (n * e).toFixed(d);
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }

  var statEls = document.querySelectorAll('[data-n]');
  var els = document.querySelectorAll('.rv');

  function triggerCounts(){
    statEls.forEach(function(el){
      if (el.dataset.done === '1') return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0){
        count(el);
      }
    });
  }

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(x){
        if (x.isIntersecting){
          x.target.classList.add('in');
          x.target.querySelectorAll('[data-n]').forEach(count);
          io.unobserve(x.target);
        }
      });
    }, {threshold: .12});
    els.forEach(function(e){ io.observe(e); });

    window.addEventListener('load', function(){
      setTimeout(triggerCounts, 300);
    });
    window.addEventListener('scroll', triggerCounts, {passive:true});
    window.addEventListener('resize', triggerCounts);
  } else {
    els.forEach(function(e){ e.classList.add('in'); });
    statEls.forEach(count);
  }

  /* NAVBAR HP: dock + scroll-spy */
  var dock = document.querySelector('.dock');
  var dockBtns = document.querySelectorAll('.dock-btn');
  var spyIds = ['home','about','jalan','proyek','skills','sertif','kontak'];
  var spyMap = {home:0, about:0, jalan:0, proyek:1, skills:2, sertif:3, kontak:4};
  var curIdx = -1;

  function setDock(i){
    if (i === curIdx) return;
    curIdx = i;
    dock.style.setProperty('--i', i);
    dockBtns.forEach(function(b, k){ b.classList.toggle('active', k === i); });
  }
  function spyDock(){
    var cur = 'home';
    spyIds.forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * .4) cur = id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = 'kontak';
    setDock(spyMap[cur]);
  }
  dockBtns.forEach(function(b){
    b.addEventListener('click', function(){
      var t = document.getElementById(b.dataset.dock);
      if (t) window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - 16, behavior: reduce ? 'auto' : 'smooth'});
    });
  });
  var lastY = window.scrollY, tk = false;
  window.addEventListener('scroll', function(){
    if (tk) return; tk = true;
    requestAnimationFrame(function(){
      var y = window.scrollY;
      if (y > lastY + 8 && y > 120) dock.classList.add('shrink');
      else if (y < lastY - 8 || y <= 120) dock.classList.remove('shrink');
      lastY = y; spyDock(); tk = false;
    });
  }, {passive:true});
  spyDock();

  /* NAVBAR HP: navbar atas (desktop) — scroll-spy */
  var navLinks = document.querySelectorAll('nav [data-nav]');
  var navSections = Array.prototype.map.call(navLinks, function(a){
    return document.querySelector(a.getAttribute('href'));
  });

  function setNavActive(){
    var probe = window.innerHeight * 0.35;
    var idx = 0;
    navSections.forEach(function(sec, i){
      if (!sec) return;
      var rect = sec.getBoundingClientRect();
      if (rect.top - probe <= 0) idx = i;
    });
    navLinks.forEach(function(a, i){
      a.classList.toggle('active', i === idx);
    });
  }

  var tickingNav = false;
  window.addEventListener('scroll', function(){
    if (!tickingNav){
      tickingNav = true;
      requestAnimationFrame(function(){
        setNavActive();
        tickingNav = false;
      });
    }
  }, {passive:true});
  window.addEventListener('resize', setNavActive);
  window.addEventListener('load', setNavActive);
  setNavActive();

})();