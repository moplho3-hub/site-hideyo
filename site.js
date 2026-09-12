(function(){
  var root = document.documentElement;
  root.classList.add('js');

  /* light / dark skin, chosen by the visitor */
  function readSkin(){ try{ return localStorage.getItem('skin'); }catch(e){ return null; } }
  function applySkin(v){
    if (v === 'dark') root.setAttribute('data-skin','dark');
    else root.removeAttribute('data-skin');
    Array.prototype.forEach.call(document.querySelectorAll('.skin button'), function(b){
      b.setAttribute('aria-pressed', String(b.dataset.skin === (v === 'dark' ? 'dark' : 'light')));
    });
    try{ localStorage.setItem('skin', v === 'dark' ? 'dark' : 'light'); }catch(e){}
  }
  applySkin(readSkin() || 'light');
  Array.prototype.forEach.call(document.querySelectorAll('.skin button'), function(b){
    b.addEventListener('click', function(){ applySkin(b.dataset.skin); });
  });

  /* reveal targets, assigned before first paint */
  var sel = '.strip>div,.statement .grid>*,.plate,.sec-head,.plan,.step,.gal .tile,'
          + '.band .wrap>*,.pagehead>*,.filters,.deet,.panel,.split .stack,.portrait,.faq details';
  var rv = Array.prototype.slice.call(document.querySelectorAll(sel));
  rv.forEach(function(el, i){ el.classList.add('rv'); el.style.transitionDelay = ((i % 6) * 70) + 'ms'; });

  /* Filet de securite : le contenu est masque au depart et revele au defilement.
     Si l'observateur echoue, la page resterait blanche. On revele tout dans ce cas. */
  function toutReveler(){ rv.forEach(function(el){ el.classList.add('in'); }); }
  var io = null;
  try {
    if ('IntersectionObserver' in window){
      io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      rv.forEach(function(el){ io.observe(el); });
      /* si au bout de 3s rien n'est revele alors que des blocs sont a l'ecran,
         c'est que l'observateur ne repond pas : on affiche tout. */
      setTimeout(function(){
        if (document.querySelectorAll('.rv.in').length === 0) toutReveler();
      }, 3000);
    } else {
      toutReveler();
    }
  } catch(e){ toutReveler(); }
  window.__revealNow = function(scope){
    (scope || document).querySelectorAll('.rv').forEach(function(el){
      if (el.getBoundingClientRect().top < window.innerHeight * 1.05) el.classList.add('in');
    });
  };

  /* custom cursor over photographs */
  if (window.matchMedia('(hover:hover)').matches){
    var cur = document.createElement('div');
    cur.className = 'cursor';
    cur.textContent = 'View';
    document.body.appendChild(cur);
    document.addEventListener('mousemove', function(e){
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
    }, {passive:true});
    document.addEventListener('mouseover', function(e){
      var t = e.target.closest ? e.target.closest('.tile') : null;
      cur.classList.toggle('on', !!t);
    });
  }
})();

(function(){
  /* ---------- language ---------- */
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-ja]'));
  nodes.forEach(function(n){ n.dataset.en = n.innerHTML; });
  var btns = Array.prototype.slice.call(document.querySelectorAll('.lang button'));
  function store(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function setLang(l){
    nodes.forEach(function(n){ n.innerHTML = (l === 'ja') ? n.dataset.ja : n.dataset.en; });
    document.documentElement.lang = (l === 'ja') ? 'ja' : 'en';
    btns.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.set === l)); });
    store('lang', l);
  }
  btns.forEach(function(b){ b.addEventListener('click', function(){ setLang(b.dataset.set); }); });
  if (load('lang') === 'ja') setLang('ja');

  /* ---------- gallery filters ---------- */
  var fbtns = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  fbtns.forEach(function(b){
    b.addEventListener('click', function(){
      var f = b.dataset.filter;
      fbtns.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); });
      Array.prototype.forEach.call(document.querySelectorAll('.gal .tile'), function(t){
        t.hidden = !(f === 'all' || t.dataset.series === f);
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  if (lb){
    var stage = lb.querySelector('.stage');
    var cap = lb.querySelector('.cap');
    var tiles = [];
    var cur = 0;
    function visibleTiles(){
      return Array.prototype.filter.call(document.querySelectorAll('.gal .tile'), function(t){ return !t.hidden; });
    }
    function show(i){
      tiles = tiles.length ? tiles : visibleTiles();
      if (!tiles.length) return;
      cur = (i + tiles.length) % tiles.length;
      var t = tiles[cur];
      var ph = t.querySelector('.ph');
      var im = ph ? ph.querySelector('img') : null;
      stage.style.backgroundImage = im
        ? 'url("' + (im.currentSrc || im.src) + '")'
        : window.getComputedStyle(ph).backgroundImage;
      cap.textContent = (t.dataset.caption || '');
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function close(){ lb.hidden = true; document.body.style.overflow = ''; tiles = []; }
    Array.prototype.forEach.call(document.querySelectorAll('.gal .tile'), function(t){
      t.addEventListener('click', function(){ tiles = visibleTiles(); show(tiles.indexOf(t)); });
    });
    lb.querySelector('[data-lb="prev"]').addEventListener('click', function(){ show(cur - 1); });
    lb.querySelector('[data-lb="next"]').addEventListener('click', function(){ show(cur + 1); });
    lb.querySelector('[data-lb="close"]').addEventListener('click', close);
    stage.addEventListener('click', close);
    document.addEventListener('keydown', function(e){
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- enquiry form ----------
     A REMPLIR :
       ENDPOINT : URL d'un service de formulaire (Formspree, Web3Forms...).
                  Vide = le visiteur envoie depuis sa propre application mail.
       MAILTO   : l'adresse email de Hideyo, utilisee dans les deux cas.
  --------------------------------------------------------------------- */
  var ENDPOINT = 'https://formspree.io/f/mnpqrezl';
  var MAILTO   = 'moplho3@gmail.com';   /* <- adresse de test, a remplacer par celle de Hideyo */

  /* Garde-fous : le quota Formspree est de 50 envois par mois. Trois filtres,
     tous cote navigateur, donc gratuits et invisibles pour un vrai visiteur :
       1. le piege a robots (champ "company" cache, deja dans le HTML)
       2. un formulaire rempli en moins de 4 secondes n'est pas humain
       3. deux fois le meme message, ou deux envois en moins de 2 minutes,
          ne repartent pas sur le reseau */
  var OUVERTURE = Date.now();
  var DELAI_MINI = 4000;
  var ATTENTE    = 120000;
  function memoire(k, v){
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch(e){ return null; }
  }
  function empreinte(t){
    var h = 0, i;
    for (i = 0; i < t.length; i++){ h = ((h << 5) - h + t.charCodeAt(i)) | 0; }
    return String(h);
  }

  var form = document.getElementById('enquiry');
  if (form){
    var out     = document.getElementById('sent');
    var btn     = form.querySelector('button.send');
    var mailBtn = document.getElementById('mailLink');
    var copyBtn = document.getElementById('copyBtn');
    var lastBody = '';

    function ja(){ return document.documentElement.lang === 'ja'; }
    function say(msg, isError){
      if (!out) return;
      out.textContent = msg;
      out.classList.toggle('err', !!isError);
    }
    function compose(d){
      function line(label, v){ return v ? label + ': ' + v + '\n' : ''; }
      return line('Name', d.get('name'))
           + line('Email', d.get('email'))
           + line('Preferred date', d.get('date1'))
           + line('Second choice', d.get('date2'))
           + line('Time of day', d.get('slot'))
           + line('People', d.get('people'))
           + line('Session', d.get('session'))
           + '\n' + (d.get('message') || '');
    }

    if (copyBtn){
      copyBtn.addEventListener('click', function(){
        function done(){ say(ja() ? 'コピーしました。' : 'Copied. Paste it into an email to ' + MAILTO); }
        if (navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(lastBody).then(done, fallback);
        } else { fallback(); }
        function fallback(){
          var t = document.createElement('textarea');
          t.value = lastBody; t.style.position = 'fixed'; t.style.opacity = '0';
          document.body.appendChild(t); t.select();
          try { document.execCommand('copy'); done(); }
          catch(e){ say(ja() ? 'コピーできませんでした。' : 'Could not copy automatically.', true); }
          document.body.removeChild(t);
        }
      });
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var d = new FormData(form);
      if (d.get('company')) return;            /* piege a robots */
      lastBody = compose(d);

      if (!ENDPOINT){
        /* pas de serveur : on prepare le message et on laisse le visiteur cliquer,
           une navigation mailto: automatique est bloquee dans certains contextes */
        if (mailBtn){
          mailBtn.href = 'mailto:' + MAILTO
            + '?subject=' + encodeURIComponent('Kyoto session enquiry')
            + '&body=' + encodeURIComponent(lastBody);
          mailBtn.hidden = false;
        }
        if (copyBtn) copyBtn.hidden = false;
        btn.hidden = true;
        say(ja() ? 'メッセージができました。下のボタンでメールアプリを開いて送信してください。'
                 : 'Your message is ready. Open your mail app to send it, or copy it and write to ' + MAILTO + '.');
        return;
      }

      /* --- filtres avant de consommer un envoi --- */
      if (Date.now() - OUVERTURE < DELAI_MINI){
        say(ja() ? '入力内容をご確認のうえ、もう一度送信してください。'
                 : 'Please take a moment to check your message, then send again.', true);
        return;
      }
      var sceau = empreinte(lastBody);
      var dernier = memoire('envoi_dernier');
      var quand   = parseInt(memoire('envoi_quand') || '0', 10);
      if (dernier === sceau){
        say(ja() ? '同じ内容がすでに送信されています。お返事をお待ちください。'
                 : 'That message has already been sent. I will come back to you shortly.');
        return;
      }
      if (Date.now() - quand < ATTENTE){
        say(ja() ? 'しばらく時間をおいてから、もう一度お試しください。'
                 : 'Just sent one. Please wait a couple of minutes before sending another.', true);
        return;
      }

      btn.disabled = true;
      say(ja() ? '送信中...' : 'Sending...');
      fetch(ENDPOINT, { method:'POST', headers:{ 'Accept':'application/json' }, body:d })
        .then(function(r){
          if (!r.ok) throw new Error('http ' + r.status);
          form.reset();
          memoire('envoi_dernier', sceau);
          memoire('envoi_quand', String(Date.now()));
          say(ja() ? '送信しました。24時間以内にご返信します。'
                   : 'Sent. You will have an answer within 24 hours.');
        })
        .catch(function(){
          say(ja() ? '送信できませんでした。' + MAILTO + ' まで直接ご連絡ください。'
                   : 'That did not go through. Please write to ' + MAILTO + ' directly.', true);
        })
        .then(function(){ btn.disabled = false; });
    });
  }
})();

(function(){
  var svg = document.querySelector('.kmap');
  if (!svg) return;
  var jpEl = document.getElementById('mapJp');
  var romEl = document.getElementById('mapRom');
  var noteEl = document.getElementById('mapNote');
  var notes = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-spot-note]'), function(s){
    try { notes[s.dataset.spotNote] = JSON.parse(s.textContent); } catch(e){}
  });
  function pick(g){
    var d = notes[g.dataset.spot];
    if (!d) return;
    Array.prototype.forEach.call(svg.querySelectorAll('.mk'), function(m){ m.classList.remove('on'); });
    g.classList.add('on');
    jpEl.textContent = d.jp;
    romEl.textContent = d.rom;
    noteEl.dataset.ja = d.ja;
    noteEl.dataset.en = d.en;
    noteEl.innerHTML = (document.documentElement.lang === 'ja') ? d.ja : d.en;
  }
  Array.prototype.forEach.call(svg.querySelectorAll('.mk'), function(g){
    g.addEventListener('click', function(){ pick(g); });
    g.addEventListener('mouseenter', function(){ pick(g); });
    g.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g); }
    });
  });
})();