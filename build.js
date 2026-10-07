#!/usr/bin/env node
/* Res med Barn — static site generator.
   Usage: node build.js  →  writes the full site to ./dist
   Content lives in content.json. Templates live below. */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'content.json'), 'utf8'));
const DOMAIN = C.site.domain.replace(/\/$/, '');

// Dagens datum (ISO) — används som sista utväg om en sida saknar eget
// updated/published-fält i content.json, och för sitemapens fallback-lastmod.
const TODAY = new Date().toISOString().slice(0, 10);
// Svensk visningsversion av ett ISO-datum ("2026-09-28" -> "28 september 2026"),
// för synliga "Uppdaterad"-etiketter på sidan. Strukturerad data behåller ISO.
const svDate = iso => {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) { return iso; }
};
// Samlar in <lastmod> per URL i takt med att sidorna byggs, så sitemapen
// speglar verkliga per-sidesdatum i stället för ett enda globalt byggdatum.
const URL_DATES = {};
// Author-identitet (pseudonym) som återanvänds i strukturerad data på varje sida.
const personLd = () => ({ '@type': 'Person', name: C.site.author.name, description: C.site.author.bio });
// Bygger dateModified/datePublished/author-schema för en sida. type styr
// schema.org-typen (Article för redaktionellt innehåll, annars WebPage/etc).
function pageLd(meta, url, updated, published, type) {
  const t = type || 'WebPage';
  const ld = {
    '@context': 'https://schema.org', '@type': t,
    name: meta.h1 || meta.title,
    url: DOMAIN + url,
    datePublished: published,
    dateModified: updated,
    author: personLd()
  };
  if (t === 'Article') ld.headline = meta.h1 || meta.title;
  return ld;
}

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Som esc(), men tillåter enkla Markdown-länkar i brödtext, t.ex.
// "prova vår [bränslekalkylator](/branslekalkylator/)" — texten escapas
// först (så inga riktiga HTML-taggar kan smygas in), sedan omvandlas bara
// den specifika [text](url)-syntaxen till en riktig länk.
const escLinks = s => esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
const write = (rel, html) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('  ✓', rel);
};
const warnLen = (page, field, value, max) => {
  if (value.length > max) console.warn(`  ⚠ ${page}: ${field} är ${value.length} tecken (max ${max})`);
};

/* ---------- layout ---------- */
function head(meta, url) {
  warnLen(url, 'meta title', meta.title, 60);
  warnLen(url, 'meta description', meta.description, 155);
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="p:domain_verify" content="350bdcc610d2337a2f10d885396bd489"/>
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${DOMAIN}${url}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${DOMAIN}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(C.site.name)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-8F9VYNYZRM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-8F9VYNYZRM');
</script>
${meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld)}</script>` : ''}
</head>
<body>`;
}

// Toppmenyn grupperar Guider/Packlista/Artiklar under en "Resetips"-dropdown
// på desktop för att hålla nere antalet synliga toppval (5 istället för 7).
// Mobilmenyn förblir en platt lista — en dropdown ger ingen vinst i en redan
// vertikal overlay-meny, så där listas alla sidor rakt av.
const NAV_DROPDOWN = {
  label: 'Resetips', href: '/guider/',
  items: [['/guider/', 'Guider'], ['/packlista/', 'Packlista'], ['/artiklar/', 'Artiklar']]
};
function nav(active) {
  const before = [['/resmal/', 'Resmål']];
  const after = [['/topplistor/', 'Topplistor'], ['/stader/', 'Städer'], ['/om-oss/', 'Om oss']];
  const flatLinks = [...before, ...NAV_DROPDOWN.items, ...after];
  const dropdownActive = NAV_DROPDOWN.items.some(([href]) => href === active);
  const li = ([href, label]) => `<li><a href="${href}"${href === active ? ' class="active"' : ''}>${label}</a></li>`;
  const dropdownLi = `
    <li class="nav-dropdown">
      <a href="${NAV_DROPDOWN.href}"${dropdownActive ? ' class="active"' : ''}>${NAV_DROPDOWN.label} <span class="nav-caret">▾</span></a>
      <div class="nav-dropdown-menu">
        <div class="nav-dropdown-menu-inner">
          ${NAV_DROPDOWN.items.map(([href, label]) => `<a href="${href}"${href === active ? ' class="active"' : ''}>${label}</a>`).join('\n          ')}
        </div>
      </div>
    </li>`;
  return `
<nav class="nav" aria-label="Huvudmeny">
  <a href="/" class="nav-brand">Res med <span>Barn</span></a>
  <ul class="nav-links">
    ${before.map(li).join('\n    ')}
    ${dropdownLi}
    ${after.map(li).join('\n    ')}
  </ul>
  <button class="hamburger" aria-label="Meny" onclick="document.getElementById('mm').classList.toggle('open');this.classList.toggle('open')"><span></span><span></span><span></span></button>
</nav>
<div class="mobile-menu" id="mm">
  ${flatLinks.map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n  ')}
</div>`;
}

function footer() {
  return `
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-about">
      <h3>Res med <span>Barn</span></h3>
      <p>${esc(C.site.footerText)}</p>
    </div>
    <div class="footer-col">
      <h4>Guider</h4>
      ${C.ages.map(a => `<a href="/guider/${a.slug}/">${a.emoji} ${esc(a.name)}</a>`).join('\n      ')}
    </div>
    <div class="footer-col">
      <h4>Topplistor</h4>
      ${C.topplistor.lists.map(l => `<a href="/topplistor/${l.slug}/">${esc(l.name)}</a>`).join('\n      ')}
    </div>
    <div class="footer-col">
      <h4>Städer</h4>
      ${C.stader.cities.map(s => `<a href="/stader/${s.slug}/">${s.emoji} ${esc(s.name)}</a>`).join('\n      ')}
    </div>
    <div class="footer-col">
      <h4>Om sajten</h4>
      <a href="/packlista/">Smart packlista</a>
      <a href="/foraldramedgivande/">Föräldramedgivande</a>
      <a href="/verktyg/">🧰 Alla verktyg</a>
      <a href="/resmal/">Alla resmål</a>
      <a href="/artiklar/">📝 Alla artiklar</a>
      <a href="/om-oss/">Om oss</a>
      <a href="/kontakt/">Kontakt</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2024–${new Date().getFullYear()} ${esc(C.site.name)}</span>
    <span>Gjord med ❤️ för barnfamiljer i Sverige</span>
    <span>Innehåller annonslänkar från Adtraction och TradeDoubler</span>
  </div>
</footer>
</body>
</html>`;
}

function breadcrumbs(items) {
  // items: [[label, url], ...] last one has no url
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([label, url], i) => ({
      '@type': 'ListItem', position: i + 1, name: label,
      ...(url ? { item: DOMAIN + url } : {})
    }))
  };
  const html = `<nav class="breadcrumbs" aria-label="Brödsmulor">${
    items.map(([label, url]) => url ? `<a href="${url}">${esc(label)}</a>` : `<span>${esc(label)}</span>`).join('<span class="bc-sep">/</span>')
  }</nav>`;
  return { html, jsonld };
}

const paras = arr => arr.map(p => `<p>${escLinks(p)}</p>`).join('\n');

/* ---------- images ---------- */
const IMG = (id, w) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;
function media(img, emoji, cls, w) {
  if (!img) return '';
  return `<div class="card-media ${cls}" data-emoji="${emoji || '🌍'}">
    <img src="${IMG(img, w)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('img-fallback');this.remove();">
  </div>`;
}


/* ---------- FAQ ---------- */
function faqHtml(faq) {
  if (!faq || !faq.length) return '';
  return `
<h2 class="section-title">Vanliga fr\u00e5gor</h2>
<div class="faq">
  ${faq.map(f => `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${escLinks(f.a)}</p></details>`).join('\n  ')}
</div>`;
}
function faqLd(faq) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}

// Renderar ett kläd-listobjekt. Objekt som markerats "QTY:xxx" i content.json
// blir en <li class="qty-item"> med ett redigerbart antal-fält vars startvärde
// räknas ut för DEFAULT_PACKLIST_DAYS vid build, och som sedan uppdateras live i
// webbläsaren när man ändrar "Antal dagar" — såvida inte besökaren själv skrivit
// in ett eget värde (då respekteras det istället, se qty-num/touched i scriptet).
const DEFAULT_PACKLIST_DAYS = 7;
function qtyCalc(rule, days) {
  return Math.min(rule.max, Math.max(rule.min, Math.ceil(days * rule.perDay)));
}
function kladerLi(x, ageKey, qtyRules) {
  if (typeof x === 'string' && x.startsWith('QTY:')) {
    const key = x.slice(4);
    const rule = (qtyRules && qtyRules[ageKey] && qtyRules[ageKey][key]) || { perDay: 1, min: 1, max: 10, label: key };
    const n = qtyCalc(rule, DEFAULT_PACKLIST_DAYS);
    return `<li class="qty-item" data-qty="${key}" data-age="${ageKey}" data-perday="${rule.perDay}" data-min="${rule.min}" data-max="${rule.max}"><input type="number" class="qty-num" min="0" max="30" step="1" value="${n}" aria-label="Antal ${esc(rule.label)}"> <span class="qty-label">${esc(rule.label)}</span></li>`;
  }
  return `<li>${esc(x)}</li>`;
}
// Wrappar en kläd-checklista med ett dolt "lägg till eget plagg"-fält längst
// ned. Listan får ett data-store-attribut (t.ex. "barn|sol") som JS använder
// för att spara/läsa egna tillägg i localStorage — delat mellan alla sidor
// och transportvarianter som visar samma åldersgrupp/resetyp.
function kladerChecklist(items, ageKey, tripKey, qtyRules) {
  const store = `${ageKey}|${tripKey}`;
  const li = items.map(x => kladerLi(x, ageKey, qtyRules)).join('');
  const addRow = `<li class="add-item-row"><input type="text" class="add-item-input" placeholder="Lägg till eget plagg…" aria-label="Lägg till eget plagg"><button type="button" class="add-item-btn" aria-label="Lägg till plagg">+</button></li>`;
  return `<ul class="checklist" data-store="${store}">${li}${addRow}</ul>`;
}

// Delad klientlogik för packlist-sidorna: (1) uppdaterar antal-fälten när
// "Antal dagar" ändras, om inte besökaren själv redan skrivit in ett eget
// värde i just det fältet, och (2) sköter "lägg till eget plagg" inklusive
// sparning i localStorage per åldersgrupp/resetyp (data-store), så tillägg
// syns oavsett vilket transportsätt eller vilken sida man tittar på.
function packlistDaysAndCustomScript() {
  return `
  var daysInput = document.getElementById('packlistDays');

  function updateQty() {
    var days = parseInt(daysInput.value, 10) || ${DEFAULT_PACKLIST_DAYS};
    document.querySelectorAll('.qty-item').forEach(function(li) {
      var input = li.querySelector('.qty-num');
      if (!input || input.dataset.touched === '1') return;
      var perDay = parseFloat(li.dataset.perday);
      var min = parseInt(li.dataset.min, 10);
      var max = parseInt(li.dataset.max, 10);
      var n = Math.min(max, Math.max(min, Math.ceil(days * perDay)));
      input.value = n;
    });
  }
  document.querySelectorAll('.qty-num').forEach(function(input) {
    input.addEventListener('input', function() { input.dataset.touched = '1'; });
  });
  daysInput.addEventListener('input', updateQty);

  function customKey(store) { return 'packlist_custom::' + store; }
  function getCustom(store) {
    try { return JSON.parse(localStorage.getItem(customKey(store)) || '[]'); } catch (e) { return []; }
  }
  function setCustom(store, items) {
    try { localStorage.setItem(customKey(store), JSON.stringify(items)); } catch (e) {}
  }
  function makeCustomLi(text, store) {
    var li = document.createElement('li');
    li.className = 'custom-item';
    var span = document.createElement('span');
    span.textContent = text;
    var rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'remove-item-btn';
    rm.setAttribute('aria-label', 'Ta bort ' + text);
    rm.innerHTML = '&times;';
    rm.addEventListener('click', function() {
      var items = getCustom(store).filter(function(t) { return t !== text; });
      setCustom(store, items);
      renderCustomForStore(store);
    });
    li.appendChild(span);
    li.appendChild(rm);
    return li;
  }
  function renderCustomForStore(store) {
    var items = getCustom(store);
    document.querySelectorAll('.checklist[data-store="' + store + '"]').forEach(function(ul) {
      Array.prototype.slice.call(ul.querySelectorAll('.custom-item')).forEach(function(n) { n.remove(); });
      var addRow = ul.querySelector('.add-item-row');
      items.forEach(function(text) {
        var li = makeCustomLi(text, store);
        if (addRow) ul.insertBefore(li, addRow); else ul.appendChild(li);
      });
    });
  }
  var stores = {};
  document.querySelectorAll('.checklist[data-store]').forEach(function(ul) { stores[ul.dataset.store] = true; });
  Object.keys(stores).forEach(renderCustomForStore);

  document.querySelectorAll('.add-item-row').forEach(function(row) {
    var ul = row.parentNode;
    var store = ul.dataset.store;
    var input = row.querySelector('.add-item-input');
    var btn = row.querySelector('.add-item-btn');
    function addItem() {
      var val = input.value.trim();
      if (!val) return;
      var items = getCustom(store);
      if (items.indexOf(val) === -1) items.push(val);
      setCustom(store, items);
      renderCustomForStore(store);
      input.value = '';
    }
    btn.addEventListener('click', addItem);
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); addItem(); } });
  });
  `;
}

// Synlig byline som matchar JSON-LD:s author-fält (se personLd()) — annars har
// Googles structured-data-riktlinjer inget emot att du "markerar upp" ett
// author-objekt som aldrig syns för en faktisk läsare, men det är ett svagt
// E-E-A-T-signal om det bara finns i dold markup. Injiceras automatiskt i
// varje sida med ldType 'Article' som har en vanlig <header class="page-header">
// (dvs. alla utom resmål-detaljsidorna, som har sin egen bylinerad inline i
// buildResmal() eftersom de har ett helt annat header-layout).
function authorByline() {
  return `<p class="author-byline">✍️ Skrivet av <a href="/om-oss/">${esc(C.site.author.name)}</a></p>`;
}

function page(url, meta, active, inner, extraJsonld, ldType) {
  const updated = meta.updated || TODAY;
  const published = meta.published || updated;
  URL_DATES[url] = updated;
  const ld = extraJsonld ? (Array.isArray(extraJsonld) ? extraJsonld.slice() : [extraJsonld]) : [];
  ld.push(pageLd(meta, url, updated, published, ldType));
  meta = { ...meta, jsonld: ld };
  if (ldType === 'Article' && inner.includes('</header>')) {
    inner = inner.replace('</header>', `  ${authorByline()}\n</header>`);
  }
  return head(meta, url) + nav(active) + `<main class="page">` + inner + `</main>` + footer();
}

/* ---------- HOME ---------- */
const IMG_CARD = id => `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;
const HEART_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="heart-path" d="M12 21s-7.5-4.9-9.8-9.2C.7 8.9 2.2 5.4 5.5 4.6c2-.5 4 .3 5.2 2 .3.4.9.4 1.2 0 1.2-1.7 3.2-2.5 5.2-2 3.3.8 4.8 4.3 3.3 7.2C18.1 16.1 12 21 12 21z"/></svg>`;
function cardMediaSSR(d) {
  return `<div class="card-media" data-cat="${d.cat}" data-emoji="${d.emoji}">
    <img src="${IMG_CARD(d.img)}" alt="${esc(d.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-fallback'); this.remove();">
  </div>`;
}
function featCardSSR(d) {
  return `
    <a class="feat-card reveal visible" href="${resmalUrl(d)}" onclick="return handleCardClick(event, '${resmalSlug(d)}')">
      ${cardMediaSSR(d)}
      <span class="feat-badge">${d.emoji} ${esc(d.catLabel)}</span>
      <button class="fav-heart" data-fav="${esc(d.name)}" aria-label="Spara ${esc(d.name)} som favorit" onclick="toggleFav('${esc(d.name)}', event)">${HEART_SVG}</button>
      <div class="feat-card-inner">
        <h3>${esc(d.name)}</h3>
        <p class="feat-country">${esc(d.country)}</p>
        <p class="feat-desc">${esc(d.desc)}</p>
        <div class="feat-meta">
          <span class="feat-meta-item">👶 <strong>${esc(d.age)}</strong></span>
          <span class="feat-meta-item">📅 <strong>${esc(d.season)}</strong></span>
          <span class="feat-meta-item">💰 <strong>${esc(d.budget)}</strong></span>
          <span class="feat-meta-item">⭐ <strong>${d.rating}</strong></span>
        </div>
      </div>
    </a>`;
}
function destCardSSR(d) {
  return `
    <a class="dest-card reveal visible" data-cat="${d.cat}" href="${resmalUrl(d)}" onclick="return handleCardClick(event, '${resmalSlug(d)}')">
      <div class="card-media" data-cat="${d.cat}" data-emoji="${d.emoji}">
        <img src="${IMG_CARD(d.img)}" alt="${esc(d.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-fallback'); this.remove();">
        <span class="dest-cat-chip" data-cat="${d.cat}">${esc(d.catLabel)}</span>
        <span class="rating-badge">⭐ ${String(d.rating).replace('.', ',')}</span>
      </div>
      <button class="fav-heart" data-fav="${esc(d.name)}" aria-label="Spara ${esc(d.name)} som favorit" onclick="toggleFav('${esc(d.name)}', event)">${HEART_SVG}</button>
      <div class="dest-card-body">
        <div class="dest-card-top">
          <h3>${esc(d.name)}</h3>
          <span class="dest-card-budget">${esc(d.budget)}</span>
        </div>
        <p class="dest-country">${esc(d.country)}</p>
        <p class="dest-desc">${esc(d.desc)}</p>
        <div class="dest-card-meta">
          <span class="meta-chip">✓ Bäst ${esc(d.age)}</span>
          <span class="meta-chip">✈️ ${esc(d.flight)}</span>
          <span class="meta-chip">📅 ${esc(d.season)}</span>
        </div>
      </div>
    </a>`;
}

function buildHome() {
  let html = fs.readFileSync(path.join(ROOT, 'templates', 'home.html'), 'utf8');
  const m = C.pages.home;
  const updated = m.updated || TODAY;
  const published = m.published || updated;
  URL_DATES['/'] = updated;
  const DESTINATIONS = loadDestinations();
  const featured = DESTINATIONS.filter(d => d.featured);
  warnLen('/', 'meta title', m.title, 60);
  warnLen('/', 'meta description', m.description, 155);
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${esc(m.description)}">`)
    .replace('<!--FAQ_PLACEHOLDER-->', m.faq ? faqHtml(m.faq) : '')
    .replace('<!--FEATURED_GRID_PLACEHOLDER-->', featured.map(featCardSSR).join(''))
    .replace('<!--DEST_GRID_PLACEHOLDER-->', DESTINATIONS.map(destCardSSR).join(''))
    .replace('</head>', `<link rel="canonical" href="${DOMAIN}/">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${DOMAIN}/">
<meta property="og:type" content="website">
<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: C.site.name, url: DOMAIN + '/',
      datePublished: published, dateModified: updated,
      author: personLd()
    })}</script>
${m.faq ? `<script type="application/ld+json">${JSON.stringify(faqLd(m.faq))}</script>` : ''}
</head>`);
  write('index.html', html);
}

/* ---------- GUIDER HUB ---------- */
function buildGuiderHub() {
  const m = C.pages.guider;
  const bc = breadcrumbs([['Hem', '/'], ['Guider', null]]);
  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(m.h1)}</h1>
  <div class="page-intro">${paras(m.intro)}</div>
</header>
<div class="card-grid">
  ${C.ages.map(a => `
  <a class="hub-card has-media" href="/guider/${a.slug}/">
    ${media(a.img, a.emoji, 'hub-media', 640)}
    <span class="hub-emoji">${a.emoji}</span>
    <h2>${esc(a.name)}</h2>
    <p class="hub-age">${esc(a.ageRange)}</p>
    <p>${esc(a.cardText)}</p>
    <span class="hub-link">Till guiderna →</span>
  </a>`).join('')}
</div>
${faqHtml(m.faq)}`;
  write('guider/index.html', page('/guider/', m, '/guider/', inner, m.faq ? [bc.jsonld, faqLd(m.faq)] : bc.jsonld));
}

/* ---------- AGE HUBS ---------- */
function buildAgeHubs() {
  for (const a of C.ages) {
    const url = `/guider/${a.slug}/`;
    const bc = breadcrumbs([['Hem', '/'], ['Guider', '/guider/'], [a.name, null]]);
    const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">${a.emoji} ${esc(a.ageRange)}</p>
  <h1>${esc(a.h1)}</h1>
  <div class="page-intro">${paras(a.intro)}</div>
</header>
${media(a.img, a.emoji, 'page-hero', 1400)}
<h2 class="section-title">Välj färdsätt</h2>
<div class="card-grid transport-grid">
  ${C.transports.map(t => `
  <a class="hub-card has-media" href="/guider/${a.slug}/${t.slug}/">
    ${media(C.guides[a.slug + '/' + t.slug].img, t.emoji, 'hub-media', 640)}
    <span class="hub-emoji">${t.emoji}</span>
    <h3>${esc(t.name)}</h3>
    <p>${esc(C.guides[a.slug + '/' + t.slug].cardText)}</p>
    <span class="hub-link">Läs guiden →</span>
  </a>`).join('')}
</div>
<h2 class="section-title">${esc(a.tipsTitle)}</h2>
<div class="tips-list">
  ${a.tips.map((t, i) => `
  <div class="tip-item">
    <span class="tip-number">${i + 1}</span>
    <div class="tip-content"><h3>${esc(t.h)}</h3><p>${esc(t.t)}</p></div>
  </div>`).join('')}
</div>
<div class="checklist-box">
  <h2>${esc(a.checklistTitle)}</h2>
  <ul class="checklist">${a.checklist.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
</div>`;
    write(`guider/${a.slug}/index.html`, page(url, a, '/guider/', inner, bc.jsonld));
  }
}

/* ---------- TRANSPORT GUIDES ---------- */
function buildGuides() {
  for (const a of C.ages) {
    for (const t of C.transports) {
      const key = `${a.slug}/${t.slug}`;
      const g = C.guides[key];
      const url = `/guider/${key}/`;
      const bc = breadcrumbs([['Hem', '/'], ['Guider', '/guider/'], [a.name, `/guider/${a.slug}/`], [t.name, null]]);
      const others = C.transports.filter(x => x.slug !== t.slug);
      const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">${t.emoji} ${esc(a.name)} · ${esc(a.ageRange)} · Uppdaterad ${svDate(g.updated)}</p>
  <h1>${esc(g.h1)}</h1>
  <div class="page-intro">${paras(g.intro)}</div>
</header>
${media(g.img, t.emoji, 'page-hero', 1400)}
<article class="article">
  ${g.sections.map(s => `<h2>${esc(s.h2)}</h2>\n<p>${escLinks(s.text)}</p>`).join('\n')}
</article>
<div class="quicktips-box">
  <h2>Snabbtips</h2>
  <ul class="checklist">${g.quicktips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
</div>
${g.packlista ? `
<div class="packlist-box">
  <h2>${esc(g.packlista.title)}</h2>
  <div class="packlist-grid">
    ${g.packlista.categories.map(cat => `
    <div class="packlist-col">
      <h3>${esc(cat.name)}</h3>
      <ul class="checklist">${cat.items.map(x => typeof x === 'string'
        ? `<li>${esc(x)}</li>`
        : `<li>${esc(x.text)} — <a href="${esc(x.url)}" target="_blank" rel="noopener nofollow">se exempel →</a></li>`
      ).join('')}</ul>
    </div>`).join('')}
  </div>
  <p class="packlist-cta"><a href="/packlista/">🧳 Prova vår interaktiva packlista — anpassad efter ålder, resmål och transportsätt →</a></p>
</div>` : ''}
${t.slug === 'bil' ? `<p class="packlist-cta"><a href="/branslekalkylator/">⛽ Räkna ut vad bilresan kostar i bränsle — prova vår bränslekalkylator →</a></p>` : ''}
${!g.packlista ? `<p class="packlist-cta"><a href="/packlista/">🧳 Packa rätt för resan — prova vår anpassade packlista →</a></p>` : ''}
${faqHtml(g.faq)}
<h2 class="section-title">Fler guider för ${esc(a.name.toLowerCase())}</h2>
<div class="related-links">
  ${others.map(x => `<a href="/guider/${a.slug}/${x.slug}/">${x.emoji} ${esc(C.guides[a.slug + '/' + x.slug].h1)}</a>`).join('\n  ')}
  <a href="/guider/${a.slug}/">← Alla guider för ${esc(a.name.toLowerCase())}</a>
</div>`;
      write(`guider/${key}/index.html`, page(url, g, '/guider/', inner, g.faq ? [bc.jsonld, faqLd(g.faq)] : bc.jsonld, 'Article'));
    }
  }
}

/* ---------- TOPPLISTOR ---------- */
const TOPPLISTOR_RELATED = {
  vagnar: ['resevagnar', 'syskonvagn', 'tillbehor'],
  resevagnar: ['vagnar', 'syskonvagn', 'barsele'],
  bilbarnstol: ['vagnar', 'tillbehor', 'babymonitor'],
  'bilbarnstol/bakatvand': ['babyskydd', 'bilbarnstol/framatvand', 'vagnar'],
  'bilbarnstol/framatvand': ['bilbarnstol/bakatvand', 'vagnar', 'tillbehor'],
  babyskydd: ['bilbarnstol/bakatvand', 'vagnar', 'resevagnar'],
  tillbehor: ['vagnar', 'akpase', 'bilbarnstol'],
  akpase: ['tillbehor', 'vagnar', 'resevagnar'],
  syskonvagn: ['vagnar', 'resevagnar', 'tillbehor'],
  barsele: ['barsjal', 'sleep-carrier', 'resevagnar'],
  amningskudde: ['brostpump', 'nappflaska', 'sleep-carrier'],
  'sleep-carrier': ['klassiska-babynest', 'amningskudde', 'barsele'],
  'klassiska-babynest': ['sleep-carrier', 'amningskudde', 'barsele'],
  nappar: ['nappflaska', 'amningskudde', 'brostpump'],
  brostpump: ['nappflaska', 'amningskudde', 'nappar'],
  nappflaska: ['nappar', 'brostpump', 'amningskudde'],
  babymonitor: ['sleep-carrier', 'bilbarnstol', 'vagnar'],
  barsjal: ['barsele', 'sleep-carrier', 'amningskudde'],
  'uv-badklader': ['regnstall', 'vinterskor', 'tillbehor'],
  regnstall: ['vinterskor', 'uv-badklader', 'tillbehor'],
  vinterskor: ['regnstall', 'uv-badklader', 'tillbehor'],
  reseunderhallning: ['tillbehor', 'akpase', 'vagnar']
};

function buildTopplistor() {
  const hub = C.pages.topplistor;
  const bcHub = breadcrumbs([['Hem', '/'], ['Topplistor', null]]);
  const hubInner = `
<header class="page-header">
  ${bcHub.html}
  <h1>${esc(hub.h1)}</h1>
  <div class="page-intro">${paras(hub.intro)}</div>
</header>
<div class="card-grid">
  ${C.topplistor.lists.map(l => `
  <a class="hub-card has-media" href="/topplistor/${l.slug}/">
    ${media(l.img, l.emoji, 'hub-media', 640)}
    <span class="hub-emoji">${l.emoji}</span>
    <h2>${esc(l.name)}</h2>
    <p>${esc(l.cardText)}</p>
    <span class="hub-link">Se listan →</span>
  </a>`).join('')}
</div>
${faqHtml(hub.faq)}`;
  write('topplistor/index.html', page('/topplistor/', hub, '/topplistor/', hubInner, hub.faq ? [bcHub.jsonld, faqLd(hub.faq)] : bcHub.jsonld));

  for (const l of C.topplistor.lists) {
    if (l.subPages) {
      // Hubb-sida (t.ex. bilbarnstol) — länkar bara vidare till sina undersidor
      const url = `/topplistor/${l.slug}/`;
      const bc = breadcrumbs([['Hem', '/'], ['Topplistor', '/topplistor/'], [l.name, null]]);
      const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(l.h1)}</h1>
  <div class="page-intro">${paras(l.intro)}</div>
</header>
<div class="card-grid">
  ${l.subPages.map(sp => {
    const target = C.topplistor.lists.find(t => t.slug === sp.slug);
    return `
  <a class="hub-card has-media" href="/topplistor/${sp.slug}/">
    ${media(target ? target.img : l.img, sp.emoji, 'hub-media', 640)}
    <span class="hub-emoji">${sp.emoji}</span>
    <h2>${esc(sp.label)}</h2>
    <p>${esc(sp.desc)}</p>
    <span class="hub-link">Se listan →</span>
  </a>`;
  }).join('')}
</div>
<h2 class="section-title">Fler topplistor</h2>
<div class="related-links">
  ${(TOPPLISTOR_RELATED[l.slug] || []).map(slug => {
    const x = C.topplistor.lists.find(t => t.slug === slug);
    return x ? `<a href="/topplistor/${x.slug}/">${x.emoji} ${esc(x.h1)}</a>` : '';
  }).join('\n  ')}
  <a href="/topplistor/" class="related-links-all">Alla topplistor →</a>
</div>`;
      write(`topplistor/${l.slug}/index.html`, page(url, l, '/topplistor/', inner, [bc.jsonld]));
      continue;
    }
    const url = `/topplistor/${l.slug}/`;
    const bc = breadcrumbs([['Hem', '/'], ['Topplistor', '/topplistor/'], [l.name, null]]);
    const itemList = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: l.h1, itemListElement: l.products.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.name
      }))
    };
    const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">${l.emoji} Uppdaterad ${svDate(l.updated)}</p>
  <h1>${esc(l.h1)}</h1>
  <div class="page-intro">${paras(l.intro)}</div>
</header>
${media(l.img, l.emoji, 'page-hero', 1400)}
${l.handbagageNote ? `<div class="handbagage-note">✈️ <strong>Handbagage på flyget:</strong> ${esc(l.handbagageNote)}</div>` : ''}
<div class="products">
  ${l.products.map((p, i) => `
  <article class="product-card">
    <div class="product-rank">${i + 1}</div>
    <div class="product-body">
      <div class="product-top">
        <h2>${esc(p.name)}</h2>
        <span class="product-badge">${esc(p.badge)}</span>
      </div>
      <p class="product-price">${esc(p.price)}</p>
      <p>${esc(p.text)}</p>
      ${p.handbagage ? `<p class="handbagage-badge">✈️ <strong>Godkänd som handbagage:</strong> ${esc(p.handbagage)}</p>` : ''}
      <div class="pros-cons">
        <ul class="pros">${p.pros.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <ul class="cons">${p.cons.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      ${p.buyUrl
        ? `<a class="btn-compare" href="${esc(p.buyUrl)}" target="_blank" rel="sponsored noopener">🛒 Köp hos ${esc(p.buyStore || 'butik')} →</a>`
        : (p.priceRunnerUrl ? `<a class="btn-compare" href="${esc(p.priceRunnerUrl)}" target="_blank" rel="sponsored noopener">Jämför pris hos PriceRunner →</a>` : '')}
    </div>
  </article>`).join('')}
</div>
<article class="article">
  ${l.sections.map(s => {
    if (s.statusGrid) {
      const g = s.statusGrid;
      const cardsHtml = g.rows.map(row => `
        <div class="status-card">
          <div class="status-card-name">${esc(row.name)}</div>
          <div class="status-card-grid">
            ${row.statuses.map((st, i) => `
              <div class="status-chip status-${st.state}">
                <div class="status-chip-label">${esc(g.columns[i])}</div>
                <div class="status-chip-value">${esc(st.text)}</div>
              </div>`).join('')}
          </div>
        </div>`).join('');
      return `<h2>${esc(s.h2)}</h2>\n${s.intro ? `<p class="table-intro">${esc(s.intro)}</p>\n` : ''}<div class="status-grid">${cardsHtml}</div>${s.note ? `\n<p class="table-note">${esc(s.note)}</p>` : ''}`;
    }
    if (s.table) {
      const tableHtml = `<table class="data-table"><thead><tr>${s.table.headers.map((h, i) => `<th${i > 0 ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row => `<tr>${row.map((cell, i) => `<td${i > 0 ? ' class="num"' : ''}>${cell === true ? '<span class="check-yes">✓</span>' : cell === false ? '<span class="check-no">–</span>' : esc(String(cell))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      return `<h2>${esc(s.h2)}</h2>\n${s.intro ? `<p class="table-intro">${esc(s.intro)}</p>\n` : ''}${tableHtml}${s.note ? `\n<p class="table-note">${esc(s.note)}</p>` : ''}`;
    }
    return `<h2>${esc(s.h2)}</h2>\n<p>${esc(s.text)}</p>`;
  }).join('\n')}
</article>
${faqHtml(l.faq)}
<h2 class="section-title">Fler topplistor</h2>
<div class="related-links">
  ${(TOPPLISTOR_RELATED[l.slug] || []).map(slug => {
    const x = C.topplistor.lists.find(t => t.slug === slug);
    return x ? `<a href="/topplistor/${x.slug}/">${x.emoji} ${esc(x.h1)}</a>` : '';
  }).join('\n  ')}
  <a href="/topplistor/" class="related-links-all">Alla topplistor →</a>
</div>`;
    write(`topplistor/${l.slug}/index.html`, page(url, l, '/topplistor/', inner, l.faq ? [bc.jsonld, itemList, faqLd(l.faq)] : [bc.jsonld, itemList], 'Article'));
  }
}

/* ---------- STÄDER ---------- */
// act.dateInfo (valfri) och act.link (valfri) används av lov-sidorna
// (buildLovSidor) för att visa säsongstajming och länka ut till en
// arrangörs egen sida — vanliga activityCard-anrop från buildStader()
// sätter aldrig dessa fält, så kortet ser likadant ut som förut då.
function activityCard(act) {
  const ageLabel = act.ageMin === act.ageMax ? `${act.ageMin} år` : `${act.ageMin}–${act.ageMax} år`;
  return `
  <article class="activity-card" data-type="${act.type}" data-indoor="${act.indoor}" data-age-min="${act.ageMin}" data-age-max="${act.ageMax}">
    <div class="activity-top">
      <h3>${esc(act.name)}</h3>
      <span class="activity-badge activity-badge-${act.type}">${act.type === 'free' ? 'Gratis' : 'Kostar'}</span>
    </div>
    <p class="activity-price">${esc(act.price)}</p>
    <p class="activity-desc">${esc(act.desc)}</p>
    <div class="activity-meta">
      <span class="meta-chip">👶 ${ageLabel}</span>
      <span class="meta-chip">${act.indoor ? '🏠 Inomhus' : '🌳 Utomhus'}</span>
      <span class="meta-chip">📍 ${esc(act.area)}</span>
      ${act.dateInfo ? `<span class="meta-chip">📅 ${esc(act.dateInfo)}</span>` : ''}
    </div>
    ${act.link ? `<a class="activity-link" href="${esc(act.link)}" rel="nofollow noopener">Fullständigt program →</a>` : ''}
  </article>`;
}

function buildStaderHub() {
  const m = C.pages.stader;
  const bc = breadcrumbs([['Hem', '/'], ['Städer', null]]);
  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(m.h1)}</h1>
  <div class="page-intro">${paras(m.intro)}</div>
</header>
<div class="card-grid">
  ${C.stader.cities.map(s => `
  <a class="hub-card has-media" href="/stader/${s.slug}/">
    ${media(s.img, s.emoji, 'hub-media', 640)}
    <span class="hub-emoji">${s.emoji}</span>
    <h2>${esc(s.name)}</h2>
    <p>${esc(s.cardText)}</p>
    <span class="hub-link">Till stadsguiden →</span>
  </a>`).join('')}
</div>
${faqHtml(m.faq)}`;
  write('stader/index.html', page('/stader/', m, '/stader/', inner, m.faq ? [bc.jsonld, faqLd(m.faq)] : bc.jsonld));
}

function buildStader() {
  for (const s of C.stader.cities) {
    const url = `/stader/${s.slug}/`;
    const bc = breadcrumbs([['Hem', '/'], ['Städer', '/stader/'], [s.name, null]]);
    const itemList = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: `${s.name} med barn`, itemListElement: s.activities.map((a, i) => ({
        '@type': 'ListItem', position: i + 1, name: a.name
      }))
    };
    const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">${s.emoji} Uppdaterad ${svDate(s.updated)}</p>
  <h1>${esc(s.h1)}</h1>
  <div class="page-intro">${paras(s.intro)}</div>
</header>
${media(s.img, s.emoji, 'page-hero', 1400)}

${(s.lov || []).map(l => `
<a class="lov-cta" href="/stader/${s.slug}/${l.lovSlug}/">
  <span class="lov-cta-emoji">${l.emoji}</span>
  <span class="lov-cta-text">
    <strong>${esc(l.lovName)}stips för ${esc(s.name)}</strong>
    <span>${esc(l.dateLabel)}</span>
  </span>
  <span class="lov-cta-arrow">→</span>
</a>`).join('\n')}

<div class="stader-filters" role="group" aria-label="Filtrera aktiviteter">
  <div class="filter-group">
    <span class="filter-label">Pris</span>
    <button class="filter-btn active" data-filter="type" data-value="all">Alla</button>
    <button class="filter-btn" data-filter="type" data-value="free">Gratis</button>
    <button class="filter-btn" data-filter="type" data-value="paid">Kostar pengar</button>
  </div>
  <div class="filter-group">
    <span class="filter-label">Väder</span>
    <button class="filter-btn active" data-filter="indoor" data-value="all">Alla</button>
    <button class="filter-btn" data-filter="indoor" data-value="true">Inomhus</button>
    <button class="filter-btn" data-filter="indoor" data-value="false">Utomhus</button>
  </div>
  <div class="filter-group">
    <span class="filter-label">Ålder</span>
    <button class="filter-btn active" data-filter="age" data-value="all">Alla</button>
    <button class="filter-btn" data-filter="age" data-value="0-3">0–3 år</button>
    <button class="filter-btn" data-filter="age" data-value="4-7">4–7 år</button>
    <button class="filter-btn" data-filter="age" data-value="8-16">8–16 år</button>
  </div>
</div>
<p class="stader-count" id="staderCount">${s.activities.length} aktiviteter</p>
<div class="activity-grid" id="activityGrid">
  ${s.activities.map(activityCard).join('')}
</div>
<p class="stader-empty" id="staderEmpty" hidden>Inga aktiviteter matchar just de filtren — testa att ta bort ett filter.</p>

${faqHtml(s.faq)}
<h2 class="section-title">Fler städer</h2>
<div class="related-links">
  ${C.stader.cities.filter(x => x.slug !== s.slug).map(x => `<a href="/stader/${x.slug}/">${x.emoji} ${esc(x.name)} med barn</a>`).join('\n  ')}
</div>

<script>
(function() {
  var active = { type: 'all', indoor: 'all', age: 'all' };
  var cards = Array.prototype.slice.call(document.querySelectorAll('.activity-card'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var countEl = document.getElementById('staderCount');
  var emptyEl = document.getElementById('staderEmpty');

  function ageMatches(card, range) {
    if (range === 'all') return true;
    var parts = range.split('-').map(Number);
    var cardMin = Number(card.dataset.ageMin), cardMax = Number(card.dataset.ageMax);
    return cardMax >= parts[0] && cardMin <= parts[1];
  }

  function apply() {
    var visible = 0;
    cards.forEach(function(card) {
      var ok = (active.type === 'all' || card.dataset.type === active.type)
        && (active.indoor === 'all' || card.dataset.indoor === active.indoor)
        && ageMatches(card, active.age);
      card.hidden = !ok;
      if (ok) visible++;
    });
    countEl.textContent = visible + ' aktivitet' + (visible === 1 ? '' : 'er');
    emptyEl.hidden = visible !== 0;
  }

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var group = btn.dataset.filter;
      active[group] = btn.dataset.value;
      buttons.forEach(function(b) { if (b.dataset.filter === group) b.classList.toggle('active', b === btn); });
      apply();
    });
  });
})();
</script>`;
    write(`stader/${s.slug}/index.html`, page(url, s, '/stader/', inner, s.faq ? [bc.jsonld, itemList, faqLd(s.faq)] : [bc.jsonld, itemList], 'Article'));
  }
}

// Lovsidor per stad (höstlov/jullov/sportlov) — data-driven via s.lov (array
// per stad i content.json, ett objekt per lovtyp). Byggs bara för städer som
// faktiskt har en lov-array; en stad utan lov-data (t.ex. Uppsala just nu)
// genererar helt enkelt inga lovsidor. Datum/vecka ligger i content.json så
// att nästa läsårs uppdatering är en datarevision, inte en kodändring.
function buildLovSidor() {
  for (const s of C.stader.cities) {
    for (const l of (s.lov || [])) {
      const url = `/stader/${s.slug}/${l.lovSlug}/`;
      const bc = breadcrumbs([['Hem', '/'], ['Städer', '/stader/'], [s.name, `/stader/${s.slug}/`], [l.lovName, null]]);
      const meta = { title: l.title, description: l.description, h1: l.h1, updated: l.updated, published: l.published };
      const itemList = {
        '@context': 'https://schema.org', '@type': 'ItemList',
        name: `${l.lovName} i ${s.name}`, itemListElement: l.tips.map((a, i) => ({
          '@type': 'ListItem', position: i + 1, name: a.name
        }))
      };
      const others = (s.lov || []).filter(x => x.lovSlug !== l.lovSlug);
      const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">${l.emoji} ${esc(l.dateLabel)} · vecka ${l.week}</p>
  <h1>${esc(l.h1)}</h1>
  <div class="page-intro">${paras(l.intro)}</div>
</header>
<div class="activity-grid">
  ${l.tips.map(activityCard).join('')}
</div>
${faqHtml(l.faq)}
<h2 class="section-title">${esc(l.lovName)} i andra städer</h2>
<div class="related-links">
  ${C.stader.cities.filter(x => x.slug !== s.slug && (x.lov || []).some(y => y.lovSlug === l.lovSlug)).map(x => `<a href="/stader/${x.slug}/${l.lovSlug}/">${x.emoji} ${esc(x.name)}</a>`).join('\n  ')}
  <a href="/stader/${s.slug}/">${s.emoji} Alla aktiviteter i ${esc(s.name)} →</a>
  ${others.map(x => `<a href="/stader/${s.slug}/${x.lovSlug}/">${x.emoji} ${esc(x.lovName)} i ${esc(s.name)}</a>`).join('\n  ')}
</div>`;
      write(`stader/${s.slug}/${l.lovSlug}/index.html`, page(url, meta, '/stader/', inner, l.faq ? [bc.jsonld, itemList, faqLd(l.faq)] : [bc.jsonld, itemList], 'Article'));
    }
  }
}

/* ---------- ARTIKLAR ---------- */
function buildArtiklarHub() {
  const m = C.pages.artiklar;
  const bc = breadcrumbs([['Hem', '/'], ['Artiklar', null]]);
  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(m.h1)}</h1>
  <div class="page-intro">${paras(m.intro)}</div>
</header>
<div class="card-grid">
  ${C.artiklar.list.map(a => `
  <a class="hub-card has-media" href="/artiklar/${a.slug}/">
    ${media(a.img, a.emoji, 'hub-media', 640)}
    <span class="hub-emoji">${a.emoji}</span>
    <h2>${esc(a.name)}</h2>
    <p>${esc(a.cardText)}</p>
    <span class="hub-link">Läs artikeln →</span>
  </a>`).join('')}
</div>
${faqHtml(m.faq)}`;
  write('artiklar/index.html', page('/artiklar/', m, '/artiklar/', inner, m.faq ? [bc.jsonld, faqLd(m.faq)] : bc.jsonld));
}

function buildArtiklar() {
  for (const a of C.artiklar.list) {
    const url = `/artiklar/${a.slug}/`;
    const bc = breadcrumbs([['Hem', '/'], ['Artiklar', '/artiklar/'], [a.name, null]]);
    const others = C.artiklar.list.filter(x => x.slug !== a.slug);
    const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">${a.emoji} ${esc(a.kicker || '')} · Uppdaterad ${svDate(a.updated)}</p>
  <h1>${esc(a.h1)}</h1>
  <div class="page-intro">${paras(a.intro)}</div>
</header>
${media(a.img, a.emoji, 'page-hero', 1400)}
<article class="article">
  ${a.sections.map(s => `<h2>${esc(s.h2)}</h2>\n<p>${escLinks(s.text)}</p>`).join('\n')}
</article>
${a.quicktips ? `
<div class="quicktips-box">
  <h2>${esc(a.quicktipsTitle || 'Snabbtips')}</h2>
  <ul class="checklist">${a.quicktips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
</div>` : ''}
${faqHtml(a.faq)}
<h2 class="section-title">Fler artiklar</h2>
<div class="related-links">
  ${others.map(x => `<a href="/artiklar/${x.slug}/">${x.emoji} ${esc(x.name)}</a>`).join('\n  ')}
  <a href="/artiklar/">← Alla artiklar</a>
</div>`;
    write(`artiklar/${a.slug}/index.html`, page(url, a, '/artiklar/', inner, a.faq ? [bc.jsonld, faqLd(a.faq)] : bc.jsonld, 'Article'));
  }
}

/* ---------- RESMÅL (extraherade från templates/home.html) ---------- */
const CAT_LABELS = { beach: 'Strand & Sol', parks: 'Nöjesparker', cities: 'Storstäder', sweden: 'Sverige', museums: 'Museer' };
const destSlug = s => s.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Länder med 3+ resmål får en egen landshubb och nästlad URL (/resmal/{land}/{resmål}/)
// i stället för den gamla platta /resmal/{resmål}/ — beslutat 2026-09-30 medan sajten
// ännu inte rankar på något, så omflyttningen är billig att göra nu. Länder med bara
// ett resmål (t.ex. Turkiet, Cypern) förblir platta.
const NESTED_COUNTRIES = { 'Grekland': 'grekland', 'Spanien': 'spanien', 'Frankrike': 'frankrike', 'Thailand': 'thailand' };
// Flaggemoji för landshubbarna (pillren på /resmal/ och H1 på varje landssida) —
// samma grepp som redan fanns för Sverige-kategorin i filtret ("🇸🇪 Sverige").
const COUNTRY_FLAGS = { 'Grekland': '🇬🇷', 'Spanien': '🇪🇸', 'Frankrike': '🇫🇷', 'Thailand': '🇹🇭' };
const resmalSlug = d => (NESTED_COUNTRIES[d.country] ? `${NESTED_COUNTRIES[d.country]}/${destSlug(d.name)}` : destSlug(d.name));
const resmalUrl = d => `/resmal/${resmalSlug(d)}/`;
const IMG_RESMAL = id => `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

function loadDestinations() {
  const homeSrc = fs.readFileSync(path.join(ROOT, 'templates', 'home.html'), 'utf8');
  const start = homeSrc.indexOf('const DESTINATIONS = [');
  const end = homeSrc.indexOf('\n];', start) + 3;
  if (start === -1 || end === 2) throw new Error('Kunde inte hitta DESTINATIONS-arrayen i home.html');
  const arrText = homeSrc.slice(start, end).replace('const DESTINATIONS = ', 'module.exports = ');
  const tmpFile = path.join(ROOT, '.dest-extract-tmp.js');
  fs.writeFileSync(tmpFile, arrText);
  delete require.cache[require.resolve(tmpFile)];
  const dests = require(tmpFile);
  fs.unlinkSync(tmpFile);
  return dests;
}

const RESMAL_CATS = [
  ['all', '🌍', 'Alla'], ['beach', '🏖️', 'Strand & Sol'], ['parks', '🎢', 'Nöjesparker'],
  ['cities', '🏙️', 'Storstäder'], ['sweden', '🇸🇪', 'Sverige'], ['museums', '🏛️', 'Museer']
];

function buildResmalHub() {
  const DESTINATIONS = loadDestinations();
  const bc = breadcrumbs([['Hem', '/'], ['Resmål', null]]);
  const meta = {
    title: 'Resmål för barnfamiljer — 50 st, filtrerbara | Res med Barn',
    description: 'Alla våra 54 resmål för barnfamiljer på ett ställe — filtrera på kategori, ålder och budget. Handplockade och testade med barn, från Kreta till Rovaniemi.',
    updated: '2026-09-30', published: '2026-09-23'
  };
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Resmål för barnfamiljer', itemListElement: DESTINATIONS.map((d, i) => ({
      '@type': 'ListItem', position: i + 1, name: d.name
    }))
  };
  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>Resmål för barnfamiljer</h1>
  <div class="page-intro"><p>Alla våra ${DESTINATIONS.length} resmål på ett ställe. Filtrera på kategori nedan, eller sök på namn eller land.</p></div>
</header>

<div class="stader-filters" role="group" aria-label="Filtrera resmål">
  <div class="filter-group">
    <span class="filter-label">Kategori</span>
    ${RESMAL_CATS.map(([val, emoji, label], i) => `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="cat" data-value="${val}">${emoji} ${label}</button>`).join('')}
    <button class="filter-btn" data-filter="cat" data-value="favs">♥ Mina favoriter</button>
  </div>
  <div class="filter-group">
    <input type="text" id="resmalSearch" placeholder="Sök namn eller land…" class="resmal-search-input" aria-label="Sök resmål">
  </div>
</div>
<div class="filter-group" style="margin-top:-0.5rem">
  <span class="filter-label">Bläddra per land</span>
  ${Object.entries(NESTED_COUNTRIES).map(([country, slug]) => `<a class="filter-btn" href="/resmal/${slug}/">${COUNTRY_FLAGS[country] || ''} ${esc(country)} →</a>`).join('')}
</div>
<p class="stader-count" id="staderCount">${DESTINATIONS.length} resmål</p>
<div class="activity-grid resmal-grid" id="activityGrid">
  ${DESTINATIONS.map(d => `
  <a class="resmal-card" data-cat="${d.cat}" data-name="${esc(d.name)}" data-search="${esc((d.name + ' ' + d.country).toLowerCase())}" href="${resmalUrl(d)}">
    <div class="card-media" data-cat="${d.cat}" data-emoji="${d.emoji}">
      <img src="${IMG_CARD(d.img)}" alt="${esc(d.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-fallback'); this.remove();">
      <span class="dest-cat-chip" data-cat="${d.cat}">${esc(d.catLabel)}</span>
      <span class="rating-badge">⭐ ${String(d.rating).replace('.', ',')}</span>
    </div>
    <button class="fav-heart" data-fav="${esc(d.name)}" aria-label="Spara ${esc(d.name)} som favorit" onclick="event.preventDefault(); event.stopPropagation(); toggleResmalFav('${esc(d.name)}', this);">${HEART_SVG}</button>
    <div class="resmal-card-body">
      <h3>${esc(d.name)}</h3>
      <p class="dest-country">${esc(d.country)}</p>
      <p class="activity-desc">${esc(d.desc)}</p>
    </div>
  </a>`).join('')}
</div>
<p class="stader-empty" id="staderEmpty" hidden>Inga resmål matchar just de filtren — testa att ta bort ett filter eller ändra sökningen.</p>

<script>
(function() {
  var favs = [];
  try { favs = JSON.parse(localStorage.getItem('rmb-favs') || '[]'); } catch (e) {}
  function isFav(name) { return favs.indexOf(name) !== -1; }
  function paintFavs() {
    document.querySelectorAll('.fav-heart').forEach(function(btn) {
      btn.classList.toggle('faved', isFav(btn.dataset.fav));
    });
  }
  window.toggleResmalFav = function(name, btn) {
    var i = favs.indexOf(name);
    if (i === -1) favs.push(name); else favs.splice(i, 1);
    try { localStorage.setItem('rmb-favs', JSON.stringify(favs)); } catch (e) {}
    btn.classList.toggle('faved', isFav(name));
    if (activeCatGlobal === 'favs') apply();
  };
  paintFavs();

  var activeCatGlobal = new URLSearchParams(location.search).get('cat') || (new URLSearchParams(location.search).get('filter') === 'favs' ? 'favs' : 'all');
  var query = new URLSearchParams(location.search).get('q') || '';
  var cards = Array.prototype.slice.call(document.querySelectorAll('.resmal-card'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var countEl = document.getElementById('staderCount');
  var emptyEl = document.getElementById('staderEmpty');
  var searchInput = document.getElementById('resmalSearch');
  if (query) searchInput.value = query;
  buttons.forEach(function(b) { b.classList.toggle('active', b.dataset.value === activeCatGlobal); });

  function apply() {
    var q = searchInput.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function(card) {
      var matchesCat = activeCatGlobal === 'all' || (activeCatGlobal === 'favs' ? isFav(card.dataset.name) : card.dataset.cat === activeCatGlobal);
      var ok = matchesCat && (!q || card.dataset.search.indexOf(q) !== -1);
      card.hidden = !ok;
      if (ok) visible++;
    });
    countEl.textContent = visible + ' resmål';
    emptyEl.hidden = visible !== 0;
  }

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      activeCatGlobal = btn.dataset.value;
      buttons.forEach(function(b) { b.classList.toggle('active', b === btn); });
      apply();
    });
  });
  searchInput.addEventListener('input', apply);
  apply();
})();
</script>`;
  write('resmal/index.html', page('/resmal/', meta, '/resmal/', inner, [bc.jsonld, itemList]));
}

// Landshubbar för länder med 3+ resmål (Grekland, Spanien, Frankrike, Thailand) —
// nya sidor 2026-09-30, se NESTED_COUNTRIES-kommentaren ovan.
function buildResmalCountryHubs() {
  const DESTINATIONS = loadDestinations();
  const COUNTRY_DATE = '2026-09-30';
  for (const [country, slug] of Object.entries(NESTED_COUNTRIES)) {
    const inCountry = DESTINATIONS.filter(d => d.country === country);
    if (!inCountry.length) continue;
    const url = `/resmal/${slug}/`;
    const bc = breadcrumbs([['Hem', '/'], ['Resmål', '/resmal/'], [country, null]]);
    const meta = {
      title: `${country} med barn — ${inCountry.length} resmål | Res med Barn`,
      description: `Våra ${inCountry.length} resmål i ${country} för barnfamiljer, samlade på ett ställe — ${inCountry.map(d => d.name).join(', ')}.`,
      updated: COUNTRY_DATE, published: COUNTRY_DATE
    };
    const itemList = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: `Resmål i ${country} för barnfamiljer`, itemListElement: inCountry.map((d, i) => ({
        '@type': 'ListItem', position: i + 1, name: d.name
      }))
    };
    const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${COUNTRY_FLAGS[country] || ''} ${esc(country)} med barn</h1>
  <div class="page-intro"><p>Våra ${inCountry.length} resmål i ${esc(country)} — handplockade och testade med barn.</p></div>
</header>
<div class="activity-grid resmal-grid">
  ${inCountry.map(d => `
  <a class="resmal-card" data-cat="${d.cat}" href="${resmalUrl(d)}">
    <div class="card-media" data-cat="${d.cat}" data-emoji="${d.emoji}">
      <img src="${IMG_CARD(d.img)}" alt="${esc(d.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-fallback'); this.remove();">
      <span class="dest-cat-chip" data-cat="${d.cat}">${esc(d.catLabel)}</span>
      <span class="rating-badge">⭐ ${String(d.rating).replace('.', ',')}</span>
    </div>
    <div class="resmal-card-body">
      <h3>${esc(d.name)}</h3>
      <p class="dest-country">${esc(d.country)}</p>
      <p class="activity-desc">${esc(d.desc)}</p>
    </div>
  </a>`).join('')}
</div>
<p><a href="/resmal/">← Alla resmål i alla länder</a></p>`;
    write(`resmal/${slug}/index.html`, page(url, meta, '/resmal/', inner, [bc.jsonld, itemList]));
  }
  console.log(`  ✓ ${Object.keys(NESTED_COUNTRIES).length} landshubbar genererade`);
}

function medgivandeNoteForDestination(d) {
  const entry = C.medgivande.countries.find(c => c.resmalCountry === d.country && (c.level === 'yes' || c.level === 'warn'));
  if (!entry) return '';
  return `
  <div class="detail-medgivande-note">
    <div class="t-label">📄 ${entry.flag} Reser ni utan båda vårdnadshavarna?</div>
    <p>${esc(entry.levelLabel)} — ${esc(d.country)} är ett av länderna där vi rekommenderar att ha ett skriftligt medgivandebrev med er, t.ex. om en förälder reser med barnen själv eller vid delad vårdnad. <a href="/foraldramedgivande/">Läs mer & skapa ett brev gratis →</a></p>
  </div>`;
}

function buildResmal() {
  const DESTINATIONS = loadDestinations();

  for (const d of DESTINATIONS) {
    const slug = resmalSlug(d);
    const url = `/resmal/${slug}/`;
    const isAttraction = d.cat === 'parks' || d.cat === 'museums';
    const countrySlug = NESTED_COUNTRIES[d.country];
    const bc = breadcrumbs(countrySlug
      ? [['Hem', '/'], ['Resmål', '/resmal/'], [d.country, `/resmal/${countrySlug}/`], [d.name, null]]
      : [['Hem', '/'], ['Resmål', '/resmal/'], [d.name, null]]);
    const similar = DESTINATIONS.filter(x => x.cat === d.cat && x.name !== d.name).slice(0, 4);

    const schema = {
      '@context': 'https://schema.org',
      '@type': isAttraction ? 'TouristAttraction' : 'TouristDestination',
      name: d.name,
      description: d.desc,
      image: IMG_RESMAL(d.img),
      address: { '@type': 'PostalAddress', addressCountry: d.country }
    };
    if (d.bookingUrl) schema.url = d.bookingUrl;

    const meta = {
      title: `${d.name} med barn | Res med Barn`,
      description: d.desc.length > 150 ? d.desc.slice(0, 147) + '…' : d.desc,
      updated: d.updated, published: d.published
    };

    const inner = `
<div class="detail-hero">
  <div class="card-media" data-emoji="${d.emoji}">
    <img src="${IMG_RESMAL(d.img)}" alt="${esc(d.name)}" loading="eager" onerror="this.parentElement.classList.add('img-fallback');this.remove();">
  </div>
  <a href="/resmal/" class="detail-back">← Alla resmål</a>
  <div class="detail-title-wrap">
    <span class="d-chip" style="background: var(--cat-${d.cat}, var(--accent))">${d.emoji} ${esc(CAT_LABELS[d.cat] || d.catLabel)}</span>
    <h1>${esc(d.name)}</h1>
    <p class="d-country">${esc(d.country)} · ⭐ ${d.rating} i familjebetyg · Uppdaterad ${svDate(d.updated)} · ✍️ <a href="/om-oss/">${esc(C.site.author.name)}</a></p>
  </div>
</div>
<div class="detail-body">
  ${bc.html}
  <div class="detail-facts">
    <div class="fact"><div class="f-label">Passar åldrar</div><div class="f-value">${esc(d.age)}</div></div>
    <div class="fact"><div class="f-label">Bästa säsong</div><div class="f-value">${esc(d.season)}</div></div>
    <div class="fact"><div class="f-label">Restid</div><div class="f-value">${esc(d.flight)}</div></div>
    <div class="fact"><div class="f-label">Budget</div><div class="f-value">${esc(d.budget)}</div></div>
  </div>
  <p class="detail-desc">${esc(d.desc)}</p>
  <h2 class="section-title">Missa inte</h2>
  <ul class="highlights">${d.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
  <div class="detail-tip">
    <div class="t-label">Förälder till förälder</div>
    <p>${esc(d.tip)}</p>
  </div>
  ${medgivandeNoteForDestination(d)}
  ${d.prisinfo ? `
  <div class="detail-prisinfo">
    <div class="t-label">💰 Pris & rabatter</div>
    <p>${esc(d.prisinfo)}</p>
    <p class="prisinfo-note">Tips: ICA, Coop och Hyresgästföreningen ger ofta roterande medlemsrabatter på svenska parker och museer — kolla era medlemsförmåner innan besöket, det kan sänka priset rejält.</p>
  </div>` : ''}
  <div class="detail-actions">
    ${d.semboUrl ? `<a class="btn btn-primary" href="${esc(d.semboUrl)}" target="_blank" rel="sponsored noopener">✈️ Boka resa via Sembo →</a>` : ''}
    ${d.bookingUrl ? `<a class="btn ${d.semboUrl ? 'btn-ghost' : 'btn-primary'}" href="${esc(d.bookingUrl)}" target="_blank" rel="sponsored noopener">${d.semboUrl ? 'Fler alternativ' : 'Boka / Läs mer'} →</a>` : ''}
    ${d.altUrl && !d.semboUrl ? `<a class="btn btn-ghost" href="${esc(d.altUrl)}" target="_blank" rel="sponsored noopener">Fler alternativ →</a>` : ''}
    <a class="btn btn-ghost" href="/resmal/?cat=${d.cat}">Fler inom ${esc(CAT_LABELS[d.cat] || d.catLabel)} →</a>
  </div>
  ${similar.length ? `
  <h2 class="section-title">Liknande resmål</h2>
  <div class="similar-grid">
    ${similar.map(x => `
    <a class="similar-card" href="${resmalUrl(x)}">
      <div class="card-media" data-emoji="${x.emoji}">
        <img src="${IMG_RESMAL(x.img)}" alt="${esc(x.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-fallback');this.remove();">
      </div>
      <div class="sim-body">
        <h4>${esc(x.name)}</h4>
        <p class="sim-country">${esc(x.country)} · ${esc(x.budget)}</p>
      </div>
    </a>`).join('')}
  </div>` : ''}
</div>`;

    write(`resmal/${slug}/index.html`, page(url, meta, null, inner, [bc.jsonld, schema], 'Article'));
  }
  console.log(`  ✓ ${DESTINATIONS.length} resmål-sidor genererade`);
  return DESTINATIONS;
}

/* ---------- OM OSS / KONTAKT ---------- */
function buildSimplePages() {
  for (const slug of ['om-oss', 'kontakt']) {
    const m = C.pages[slug];
    const url = `/${slug}/`;
    const bc = breadcrumbs([['Hem', '/'], [m.h1, null]]);
    const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(m.h1)}</h1>
</header>
<article class="article page-intro">
  ${paras(m.body)}
  ${slug === 'kontakt' ? `<p class="contact-mail">📧 <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></p>` : ''}
</article>`;
    write(`${slug}/index.html`, page(url, m, url, inner, bc.jsonld, slug === 'om-oss' ? 'AboutPage' : 'ContactPage'));
  }
}

/* ---------- SITEMAP / ROBOTS / STATIC ---------- */
function buildMeta(destinations) {
  const urls = ['/', '/guider/', '/topplistor/', '/om-oss/', '/kontakt/'];
  for (const a of C.ages) {
    urls.push(`/guider/${a.slug}/`);
    for (const t of C.transports) urls.push(`/guider/${a.slug}/${t.slug}/`);
  }
  for (const l of C.topplistor.lists) urls.push(`/topplistor/${l.slug}/`);
  urls.push('/stader/');
  for (const s of C.stader.cities) {
    urls.push(`/stader/${s.slug}/`);
    for (const l of (s.lov || [])) urls.push(`/stader/${s.slug}/${l.lovSlug}/`);
  }
  urls.push('/artiklar/');
  for (const a of C.artiklar.list) urls.push(`/artiklar/${a.slug}/`);
  urls.push('/resmal/');
  for (const slug of Object.values(NESTED_COUNTRIES)) urls.push(`/resmal/${slug}/`);
  urls.push('/packlista/');
  for (const s of (C.smartPacklista.subPages || [])) urls.push(`/packlista/${s.slug}/`);
  urls.push('/branslekalkylator/');
  urls.push('/solkramskalkylator/');
  urls.push('/foraldramedgivande/');
  urls.push('/medgivandebrev/');
  urls.push('/verktyg/');
  for (const d of destinations) urls.push(resmalUrl(d));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${DOMAIN}${u}</loc><lastmod>${URL_DATES[u] || TODAY}</lastmod></url>`).join('\n')}
</urlset>`);
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${DOMAIN}/sitemap.xml`);
  fs.copyFileSync(path.join(ROOT, 'static', 'styles.css'), path.join(DIST, 'styles.css'));
  console.log('  ✓ styles.css');
  fs.copyFileSync(path.join(ROOT, 'static', 'logo.png'), path.join(DIST, 'logo.png'));
  console.log('  ✓ logo.png');
  for (const f of ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png']) {
    fs.copyFileSync(path.join(ROOT, 'static', f), path.join(DIST, f));
  }
  console.log('  ✓ favicon-filer (6 st)');
  fs.mkdirSync(path.join(DIST, 'admin'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'static', 'admin.html'), path.join(DIST, 'admin', 'index.html'));
  console.log('  ✓ admin/index.html');
  fs.copyFileSync(path.join(ROOT, 'content.json'), path.join(DIST, 'content.json'));
  console.log('  \u2713 content.json');
}

/* ---------- run ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
console.log('Bygger Res med Barn \u2026');
buildHome();
buildGuiderHub();
buildAgeHubs();
buildGuides();
buildTopplistor();
buildStaderHub();
buildStader();
buildLovSidor();
buildArtiklarHub();
buildArtiklar();
function buildSmartPacklista() {
  const P = C.smartPacklista;
  const bc = breadcrumbs([['Hem', '/'], ['Packlista', null]]);
  const faq = [
    { q: 'Kan jag skriva ut eller spara listan som PDF?', a: 'Ja — klicka på "Skriv ut / Spara som PDF"-knappen. Din webbläsares utskriftsfunktion låter dig välja "Spara som PDF" istället för att skriva ut på papper.' },
    { q: 'Varför skiljer sig listan åt beroende på transportsätt?', a: 'Flyg, bil och tåg har olika praktiska utmaningar — på flyget vill ni undvika vätska över 100 ml och ha aktiviteter som inte stör medresenärer, i bilen är paus-lekar och åksjuka viktigare, och på tåget är utrymmet ofta mer begränsat.' }
  ];
  const itemListLd = { '@context': 'https://schema.org', '@type': 'HowTo', name: P.meta.h1, description: P.meta.description };

  const ageBtns = P.ages.map((a, i) => `<button class="filter-btn${i === 1 ? ' active' : ''}" data-group="age" data-value="${a.key}">${a.emoji} ${esc(a.label)}</button>`).join('');
  const tripBtns = P.tripTypes.map((t, i) => `<button class="filter-btn${i === 0 ? ' active' : ''}" data-group="trip" data-value="${t.key}">${esc(t.label)}</button>`).join('');
  const transBtns = P.transport.map((t, i) => `<button class="filter-btn${i === 0 ? ' active' : ''}" data-group="transport" data-value="${t.key}">${esc(t.label)}</button>`).join('');

  // SSR: bygg ALLA kombinationer, dolda via data-attribut, JS växlar synlighet
  let allBlocks = '';
  for (const age of P.ages) {
    for (const trip of P.tripTypes) {
      const kladerItems = P.klader[`${age.key}|${trip.key}`] || [];
      for (const trans of P.transport) {
        const tillagg = P.tillagg[`${age.key}|${trans.key}`] || {};
        const tripLabel = trip.key === 'sol' ? 'solsemester' : 'en vanlig resa (utomlands eller i Sverige)';
        const comboH2 = `Packlista: ${age.label.toLowerCase()} på ${tripLabel}, ${trans.label.replace(/^[^\s]+\s/, '').toLowerCase()}`;
        allBlocks += `
        <div class="packlist-combo" data-age="${age.key}" data-trip="${trip.key}" data-transport="${trans.key}" hidden>
          <h2 class="packlist-combo-h2">${esc(comboH2)}</h2>
          <div class="packlist-grid packlist-grid-4">
            <div class="packlist-col">
              <h3>👕 Kläder & hygien</h3>
              ${kladerChecklist(kladerItems, age.key, trip.key, P.qtyRules)}
            </div>
            ${Object.entries(tillagg).map(([cat, items]) => `
            <div class="packlist-col">
              <h3>${cat === 'Mat & dryck' ? '🍎' : cat === 'Förnödenheter' ? '🧴' : '🧩'} ${esc(cat)}</h3>
              <ul class="checklist">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            </div>`).join('')}
          </div>
        </div>`;
      }
    }
  }

  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(P.meta.h1)}</h1>
  <div class="page-intro"><p>${esc(P.meta.intro)}</p></div>
  <p class="packlist-coverage">Fungerar för: bebis, småbarn, barn eller tonåring · solsemester eller vanlig resa/weekend · flyg, bil eller tåg — <strong>24 färdiga kombinationer</strong>.</p>
</header>

<div class="packlist-subpages-links">
  <p class="packlist-subpages-label">Läs mer om specifika resetyper:</p>
  ${(P.subPages || []).map(s => `<a href="/packlista/${s.slug}/">${esc(s.h1)} →</a>`).join('\n  ')}
</div>

<div class="stader-filters packlist-filters" role="group" aria-label="Anpassa packlistan">
  <div class="filter-group">
    <span class="filter-label">Barnets ålder</span>
    ${ageBtns}
  </div>
  <div class="filter-group">
    <span class="filter-label">Resetyp</span>
    ${tripBtns}
  </div>
  <div class="filter-group">
    <span class="filter-label">Transportsätt</span>
    ${transBtns}
  </div>
  <div class="filter-group">
    <span class="filter-label">Antal dagar</span>
    <input type="number" id="packlistDays" class="packlist-days-input" min="1" max="30" value="${DEFAULT_PACKLIST_DAYS}" aria-label="Antal dagar">
  </div>
</div>

<p class="packlist-solkram-cta">☀️ Ska ni sola mycket? Räkna ut hur mycket solkräm ni behöver packa med <a href="/solkramskalkylator/">solkrämskalkylatorn →</a></p>

<div class="packlist-actions">
  <button class="btn btn-primary" onclick="window.print()">🖨️ Skriv ut / Spara som PDF</button>
</div>

<div id="packlistCombos">
  ${allBlocks}
</div>

${faqHtml(faq)}

<script>
(function() {
  var state = { age: 'smabarn', trip: 'sol', transport: 'flyg' };
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.packlist-filters .filter-btn'));
  var combos = Array.prototype.slice.call(document.querySelectorAll('.packlist-combo'));

  function apply() {
    combos.forEach(function(c) {
      c.hidden = !(c.dataset.age === state.age && c.dataset.trip === state.trip && c.dataset.transport === state.transport);
    });
  }

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var group = btn.dataset.group;
      state[group] = btn.dataset.value;
      buttons.forEach(function(b) {
        if (b.dataset.group === group) b.classList.toggle('active', b === btn);
      });
      apply();
    });
  });
  apply();
${packlistDaysAndCustomScript()}
})();
</script>`;

  write('packlista/index.html', page('/packlista/', P.meta, '/packlista/', inner, [bc.jsonld, itemListLd, faqLd(faq)]));
}

function buildPacklistaSubPages() {
  const P = C.smartPacklista;
  const results = [];

  for (const sub of P.subPages || []) {
    const bc = breadcrumbs([['Hem', '/'], ['Packlista', '/packlista/'], [sub.h1, null]]);
    const meta = { title: sub.title, description: sub.description, h1: sub.h1, updated: sub.updated, published: sub.published };

    // Bygg alla 24 kombinationer (samma data som hubben), men förvalt läge synligt direkt via SSR
    const ageBtns = P.ages.map(a => `<button class="filter-btn${a.key === sub.defaultAge ? ' active' : ''}" data-group="age" data-value="${a.key}">${a.emoji} ${esc(a.label)}</button>`).join('');
    const tripBtns = P.tripTypes.map(t => `<button class="filter-btn${t.key === sub.defaultTrip ? ' active' : ''}" data-group="trip" data-value="${t.key}">${esc(t.label)}</button>`).join('');
    const transBtns = P.transport.map(t => `<button class="filter-btn${t.key === sub.defaultTransport ? ' active' : ''}" data-group="transport" data-value="${t.key}">${esc(t.label)}</button>`).join('');

    let allBlocks = '';
    for (const age of P.ages) {
      for (const trip of P.tripTypes) {
        const kladerItems = P.klader[`${age.key}|${trip.key}`] || [];
        for (const trans of P.transport) {
          const tillagg = P.tillagg[`${age.key}|${trans.key}`] || {};
          const isDefault = age.key === sub.defaultAge && trip.key === sub.defaultTrip && trans.key === sub.defaultTransport;
          allBlocks += `
          <div class="packlist-combo" data-age="${age.key}" data-trip="${trip.key}" data-transport="${trans.key}"${isDefault ? '' : ' hidden'}>
            <div class="packlist-grid packlist-grid-4">
              <div class="packlist-col">
                <h3>👕 Kläder & hygien</h3>
                ${kladerChecklist(kladerItems, age.key, trip.key, P.qtyRules)}
              </div>
              ${Object.entries(tillagg).map(([cat, items]) => `
              <div class="packlist-col">
                <h3>${cat === 'Mat & dryck' ? '🍎' : cat === 'Förnödenheter' ? '🧴' : '🧩'} ${esc(cat)}</h3>
                <ul class="checklist">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
              </div>`).join('')}
            </div>
          </div>`;
        }
      }
    }

    const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">Uppdaterad ${svDate(sub.updated)}</p>
  <h1>${esc(sub.h1)}</h1>
  <div class="page-intro"><p>${esc(sub.intro)}</p></div>
</header>

${sub.sections.map(s => `<section class="article-section"><h2>${esc(s.h2)}</h2><p>${esc(s.text)}</p></section>`).join('\n')}

<h2 class="section-title">Er anpassade packlista</h2>
<div class="stader-filters packlist-filters" role="group" aria-label="Anpassa packlistan">
  <div class="filter-group"><span class="filter-label">Barnets ålder</span>${ageBtns}</div>
  <div class="filter-group"><span class="filter-label">Resetyp</span>${tripBtns}</div>
  <div class="filter-group"><span class="filter-label">Transportsätt</span>${transBtns}</div>
  <div class="filter-group">
    <span class="filter-label">Antal dagar</span>
    <input type="number" id="packlistDays" class="packlist-days-input" min="1" max="30" value="${DEFAULT_PACKLIST_DAYS}" aria-label="Antal dagar">
  </div>
</div>
<div class="packlist-actions">
  <button class="btn btn-primary" onclick="window.print()">🖨️ Skriv ut / Spara som PDF</button>
</div>
<div id="packlistCombos">
  ${allBlocks}
</div>

<p class="packlist-solkram-cta">☀️ Ska ni sola mycket? Räkna ut hur mycket solkräm ni behöver packa med <a href="/solkramskalkylator/">solkrämskalkylatorn →</a></p>

<p class="packlist-cta"><a href="/packlista/">🧳 Vill du anpassa fler detaljer? Prova hela det interaktiva verktyget →</a></p>

${faqHtml(sub.faq)}

<script>
(function() {
  var state = { age: '${sub.defaultAge}', trip: '${sub.defaultTrip}', transport: '${sub.defaultTransport}' };
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.packlist-filters .filter-btn'));
  var combos = Array.prototype.slice.call(document.querySelectorAll('.packlist-combo'));
  function apply() {
    combos.forEach(function(c) {
      c.hidden = !(c.dataset.age === state.age && c.dataset.trip === state.trip && c.dataset.transport === state.transport);
    });
  }
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var group = btn.dataset.group;
      state[group] = btn.dataset.value;
      buttons.forEach(function(b) { if (b.dataset.group === group) b.classList.toggle('active', b === btn); });
      apply();
    });
  });
${packlistDaysAndCustomScript()}
})();
</script>`;

    write(`packlista/${sub.slug}/index.html`, page(`/packlista/${sub.slug}/`, meta, '/packlista/', inner, [bc.jsonld, faqLd(sub.faq)], 'Article'));
    results.push(sub.slug);
  }
  console.log(`  ✓ ${results.length} packlista-undersidor genererade`);
  return results;
}



function buildBranslekalkylator() {
  const B = C.branslekalkylator;
  const bc = breadcrumbs([['Hem', '/'], ['Bränslekalkylator', null]]);

  const fuelBtns = B.fuelTypes.map((f, i) => `<button class="filter-btn${i === 0 ? ' active' : ''}" data-fuel="${f.key}" onclick="selectFuel('${f.key}')">${f.label}</button>`).join('');

  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(B.meta.h1)}</h1>
  <p class="page-intro">${esc(B.meta.intro)}</p>
</header>

<div class="fuel-calc">
  <div class="fuel-calc-field">
    <label>Drivmedel</label>
    <div class="filter-group">${fuelBtns}</div>
  </div>

  <div class="fuel-calc-row">
    <div class="fuel-calc-field">
      <label for="fcDistance">Sträcka (km, enkel väg)</label>
      <input type="number" id="fcDistance" value="50" min="0" step="1">
    </div>
    <div class="fuel-calc-field fuel-calc-checkbox">
      <label><input type="checkbox" id="fcRoundtrip" checked> Tur och retur</label>
    </div>
  </div>

  <div class="fuel-calc-row">
    <div class="fuel-calc-field">
      <label id="fcConsumptionLabel" for="fcConsumption">Förbrukning</label>
      <input type="number" id="fcConsumption" step="0.1" min="0">
    </div>
    <div class="fuel-calc-field">
      <label id="fcPriceLabel" for="fcPrice">Pris per enhet (kr)</label>
      <input type="number" id="fcPrice" step="0.01" min="0">
    </div>
  </div>

  <div class="fuel-calc-result" id="fcResult">
    <span class="fuel-calc-result-label">Uppskattad kostnad</span>
    <span class="fuel-calc-result-value" id="fcCost">0 kr</span>
    <span class="fuel-calc-result-sub" id="fcAmount"></span>
  </div>
</div>

<script>
(function() {
  var FUELS = ${JSON.stringify(B.fuelTypes)};
  var currentFuel = FUELS[0];
  var distanceEl = document.getElementById('fcDistance');
  var roundtripEl = document.getElementById('fcRoundtrip');
  var consumptionEl = document.getElementById('fcConsumption');
  var priceEl = document.getElementById('fcPrice');
  var consumptionLabelEl = document.getElementById('fcConsumptionLabel');
  var priceLabelEl = document.getElementById('fcPriceLabel');
  var costEl = document.getElementById('fcCost');
  var amountEl = document.getElementById('fcAmount');

  window.selectFuel = function(key) {
    var fuel = FUELS.filter(function(f) { return f.key === key; })[0];
    if (!fuel) return;
    currentFuel = fuel;
    document.querySelectorAll('.filter-btn[data-fuel]').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.fuel === key);
    });
    consumptionEl.value = fuel.defaultConsumption;
    priceEl.value = fuel.defaultPrice;
    consumptionLabelEl.textContent = fuel.consumptionLabel;
    priceLabelEl.textContent = 'Pris per ' + fuel.unitShort + ' (kr)';
    calculate();
  };

  function calculate() {
    var km = parseFloat(distanceEl.value) || 0;
    var totalKm = roundtripEl.checked ? km * 2 : km;
    var consumption = parseFloat(consumptionEl.value) || 0;
    var price = parseFloat(priceEl.value) || 0;
    var amount = (totalKm / 100) * consumption;
    var cost = amount * price;
    costEl.textContent = Math.round(cost).toLocaleString('sv-SE') + ' kr';
    amountEl.textContent = amount.toFixed(1) + ' ' + currentFuel.unitShort + ' · ' + totalKm + ' km totalt';
  }

  [distanceEl, roundtripEl, consumptionEl, priceEl].forEach(function(el) {
    el.addEventListener('input', calculate);
  });

  selectFuel(FUELS[0].key);
})();
</script>

${faqHtml(B.faq)}
<h2 class="section-title">Fler resurser för bilresan</h2>
<div class="related-links">
  <a href="/guider/barn/bil/">🚗 Bilresa med barn</a>
  <a href="/guider/smabarn/bil/">🚗 Bilresa med småbarn</a>
  <a href="/packlista/">🧳 Smart packlista</a>
  <a href="/topplistor/tillbehor/">🎒 Tillbehör för bilresan</a>
</div>`;

  write('branslekalkylator/index.html', page('/branslekalkylator/', B.meta, '/branslekalkylator/', inner, [bc.jsonld, faqLd(B.faq)]));
  console.log('  ✓ branslekalkylator/index.html');
}

function buildSolkramskalkylator() {
  const S = C.solkramskalkylator;
  const bc = breadcrumbs([['Hem', '/'], ['Solkrämskalkylator', null]]);

  const ageRows = S.ageGroups.map(a => `
    <div class="sun-calc-row">
      <label for="sun-${a.key}">${a.emoji} ${esc(a.label)}</label>
      <input type="number" id="sun-${a.key}" class="sun-calc-count" min="0" step="1" value="0" data-ml="${a.mlPerApplication}">
    </div>`).join('');

  const intensityBtns = S.intensities.map((i, idx) => `<button class="filter-btn${idx === 1 ? ' active' : ''}" data-intensity="${i.key}" data-times="${i.timesPerDay}" onclick="selectIntensity('${i.key}')">${esc(i.label)}<br><span class="sun-calc-sub">${esc(i.sub)}</span></button>`).join('');

  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(S.meta.h1)}</h1>
  <p class="page-intro">${esc(S.meta.intro)}</p>
</header>

<div class="fuel-calc sun-calc">
  <div class="fuel-calc-field">
    <label>Antal personer per åldersgrupp</label>
    <div class="sun-calc-rows">${ageRows}</div>
  </div>

  <div class="fuel-calc-row">
    <div class="fuel-calc-field">
      <label for="sunDays">Antal soldagar</label>
      <input type="number" id="sunDays" value="7" min="1" max="30" step="1">
    </div>
  </div>

  <div class="fuel-calc-field">
    <label>Hur starkt är solen på resmålet?</label>
    <div class="filter-group sun-calc-intensity">${intensityBtns}</div>
  </div>

  <div class="fuel-calc-result" id="sunResult">
    <span class="fuel-calc-result-label">Ni behöver packa ungefär</span>
    <span class="fuel-calc-result-value" id="sunTubes">0 tuber</span>
    <span class="fuel-calc-result-sub" id="sunMl"></span>
  </div>
</div>

<script>
(function() {
  var AGE_KEYS = ${JSON.stringify(S.ageGroups.map(a => a.key))};
  var TUBE_ML = ${S.tubeSizeMl};
  var timesPerDay = ${S.intensities[1].timesPerDay};
  var countEls = AGE_KEYS.map(function(k) { return document.getElementById('sun-' + k); });
  var daysEl = document.getElementById('sunDays');
  var tubesEl = document.getElementById('sunTubes');
  var mlEl = document.getElementById('sunMl');

  window.selectIntensity = function(key) {
    document.querySelectorAll('[data-intensity]').forEach(function(btn) {
      var active = btn.dataset.intensity === key;
      btn.classList.toggle('active', active);
      if (active) timesPerDay = parseInt(btn.dataset.times, 10);
    });
    calculate();
  };

  function calculate() {
    var days = parseInt(daysEl.value, 10) || 0;
    var totalMl = 0;
    countEls.forEach(function(el) {
      var count = parseInt(el.value, 10) || 0;
      var mlPer = parseFloat(el.dataset.ml) || 0;
      totalMl += count * mlPer * timesPerDay * days;
    });
    var tubes = totalMl > 0 ? Math.ceil(totalMl / TUBE_ML) : 0;
    tubesEl.textContent = tubes + (tubes === 1 ? ' tub' : ' tuber');
    mlEl.textContent = Math.round(totalMl).toLocaleString('sv-SE') + ' ml totalt · ' + TUBE_ML + ' ml per tub';
  }

  countEls.concat([daysEl]).forEach(function(el) {
    el.addEventListener('input', calculate);
  });
  calculate();
})();
</script>

${faqHtml(S.faq)}
<h2 class="section-title">Fler resurser för resan</h2>
<div class="related-links">
  <a href="/packlista/">🧳 Smart packlista</a>
  <a href="/packlista/solsemester-barn/">☀️ Packlista för solsemester med barn</a>
  <a href="/topplistor/">🛒 Alla topplistor</a>
</div>`;

  write('solkramskalkylator/index.html', page('/solkramskalkylator/', S.meta, '/solkramskalkylator/', inner, [bc.jsonld, faqLd(S.faq)]));
  console.log('  ✓ solkramskalkylator/index.html');
}

/* ---------- FÖRÄLDRAMEDGIVANDE: guide + generator ----------
   Beslutad 2026-10-01 efter research i primärkällor för 22 länder (se
   projektdokument "claude/foraldramedgivande-research.md"). Mönster som går
   igen: det finns ingen gemensam EU-regel (Your Europe), och flera "krav" i
   sökresultat gäller faktiskt landets EGNA medborgare som reser UT, inte
   svenska turistbarn som reser IN — vi har flaggat det tydligt per land i
   stället för att gissa, eftersom fel info här kan göra att en familj
   nekas ombordstigning. */
function resmalLinksForCountry(country, DESTINATIONS) {
  if (!country) return [];
  if (NESTED_COUNTRIES[country]) {
    return [{ label: `Se resmål i ${country} →`, url: `/resmal/${NESTED_COUNTRIES[country]}/` }];
  }
  return DESTINATIONS.filter(d => d.country === country).map(d => ({ label: `${d.name} →`, url: resmalUrl(d) }));
}
function countryCard(c, DESTINATIONS) {
  const links = resmalLinksForCountry(c.resmalCountry, DESTINATIONS);
  return `
  <div class="country-card">
    <div class="country-card-head">
      <span class="country-card-name">${c.flag} ${esc(c.name)}</span>
      <span class="country-badge status-${c.level}">${esc(c.levelLabel)}</span>
    </div>
    <p class="country-card-note">${esc(c.note)}</p>
    <div class="country-card-links">
      <a class="source-link" href="${esc(c.sourceUrl)}" target="_blank" rel="noopener nofollow">Källa: ${esc(c.sourceName)} →</a>
      ${links.map(l => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join('')}
    </div>
  </div>`;
}
function buildMedgivande() {
  const M = C.medgivande;
  const DESTINATIONS = loadDestinations();
  const bc = breadcrumbs([['Hem', '/'], ['Föräldramedgivande', null]]);
  const inner = `
<header class="page-header">
  ${bc.html}
  <p class="kicker">✍️ Uppdaterad ${svDate(M.meta.updated)}</p>
  <h1>${esc(M.meta.h1)}</h1>
  <div class="page-intro">${paras(M.meta.intro)}</div>
</header>
<p class="packlist-cta"><a href="/medgivandebrev/">✍️ Skapa ditt medgivandebrev direkt — gratis, klart på två minuter →</a></p>
<h2 class="section-title">Krav land för land — 22 resmål vi grävt i</h2>
<p class="table-intro">Vi har prioriterat primärkällor (ambassader, ländernas egna myndigheter, EU:s Your Europe) framför bloggar och mallsajter. Där vi inte kunnat bekräfta ett krav skriver vi det tydligt i stället för att gissa.</p>
<div class="country-cards">
  ${M.countries.map(c => countryCard(c, DESTINATIONS)).join('')}
</div>
<p class="table-note">Listan uppdateras löpande men regler kan ändras med kort varsel — dubbelkolla alltid med destinationslandets ambassad inför en specifik resa.</p>
<article class="article">
  ${M.sections.map(s => `<h2>${esc(s.h2)}</h2>\n<p>${escLinks(s.text)}</p>`).join('\n')}
</article>
${faqHtml(M.faq)}
<h2 class="section-title">Mer för resan</h2>
<div class="related-links">
  <a href="/medgivandebrev/">✍️ Medgivandebrevgenerator</a>
  <a href="/verktyg/">🧰 Alla verktyg</a>
  <a href="/resmal/">🌍 Alla resmål</a>
</div>`;
  write('foraldramedgivande/index.html', page('/foraldramedgivande/', M.meta, '/foraldramedgivande/', inner, M.faq ? [bc.jsonld, faqLd(M.faq)] : bc.jsonld, 'Article'));
  console.log('  ✓ foraldramedgivande/index.html');
}

function buildMedgivandeGenerator() {
  const G = C.medgivandebrev;
  const countryNames = C.medgivande.countries.map(c => `${c.flag} ${c.name}`);
  const bc = breadcrumbs([['Hem', '/'], ['Medgivandebrevgenerator', null]]);
  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(G.meta.h1)}</h1>
  <p class="page-intro">${esc(G.meta.intro)}</p>
</header>
<p class="letter-privacy-note">🔒 Allt du skriver stannar i din webbläsare — inget skickas till oss eller sparas.</p>

<div class="letter-form">
  <fieldset class="letter-form-fieldset">
    <legend>Barnet</legend>
    <div class="letter-form-row">
      <div class="letter-form-field"><label for="mg-childName">Barnets fullständiga namn</label><input type="text" id="mg-childName" placeholder="T.ex. Alice Andersson"></div>
      <div class="letter-form-field"><label for="mg-childPnr">Personnummer</label><input type="text" id="mg-childPnr" placeholder="ÅÅÅÅMMDD-XXXX"></div>
    </div>
    <div class="letter-form-field"><label for="mg-childPassport">Passnummer (om ni vill ange det)</label><input type="text" id="mg-childPassport"></div>
  </fieldset>

  <fieldset class="letter-form-fieldset">
    <legend>Resan</legend>
    <div class="letter-form-row">
      <div class="letter-form-field"><label for="mg-country">Resmål</label>
        <select id="mg-country">
          <option value="">— Välj land —</option>
          ${countryNames.map(n => `<option>${esc(n)}</option>`).join('')}
          <option>Annat land</option>
        </select>
      </div>
      <div class="letter-form-field"><label for="mg-dates">Resans datum</label><input type="text" id="mg-dates" placeholder="T.ex. 12–26 juli 2026"></div>
    </div>
    <div class="letter-form-field"><label for="mg-flight">Flightnummer / resrutt (frivilligt)</label><input type="text" id="mg-flight" placeholder="T.ex. SK1234 Stockholm–Antalya"></div>
  </fieldset>

  <fieldset class="letter-form-fieldset">
    <legend>Reser med</legend>
    <div class="letter-form-row">
      <div class="letter-form-field"><label for="mg-withName">Namn på medresande vuxen</label><input type="text" id="mg-withName"></div>
      <div class="letter-form-field"><label for="mg-withRelation">Relation till barnet</label><input type="text" id="mg-withRelation" placeholder="T.ex. mamma, mormor, familjevän"></div>
    </div>
  </fieldset>

  <fieldset class="letter-form-fieldset">
    <legend>Vårdnadshavare som INTE reser med</legend>
    <div class="letter-form-row">
      <div class="letter-form-field"><label for="mg-g1Name">Namn</label><input type="text" id="mg-g1Name"></div>
      <div class="letter-form-field"><label for="mg-g1Phone">Telefon</label><input type="text" id="mg-g1Phone"></div>
    </div>
    <div class="letter-form-field"><label for="mg-g1Email">E-post</label><input type="text" id="mg-g1Email"></div>
    <label class="letter-form-check"><input type="checkbox" id="mg-addG2"> Lägg till ytterligare en vårdnadshavare (t.ex. om barnet reser helt ensamt)</label>
    <div id="mg-g2block" hidden>
      <div class="letter-form-row">
        <div class="letter-form-field"><label for="mg-g2Name">Namn</label><input type="text" id="mg-g2Name"></div>
        <div class="letter-form-field"><label for="mg-g2Phone">Telefon</label><input type="text" id="mg-g2Phone"></div>
      </div>
      <div class="letter-form-field"><label for="mg-g2Email">E-post</label><input type="text" id="mg-g2Email"></div>
    </div>
  </fieldset>

  <label class="letter-form-check"><input type="checkbox" id="mg-english" checked> Visa brevet på engelska också (rekommenderas — många länder vill ha det på engelska)</label>
</div>

<div class="letter-preview-wrap">
  <div class="letter-preview" id="mg-preview"></div>
</div>
<div class="letter-actions">
  <button type="button" class="btn-compare" id="mg-download">⬇️ Ladda ner som PDF</button>
  <button type="button" class="btn-compare" onclick="window.print()">🖨️ Skriv ut</button>
  <button type="button" class="btn-compare" id="mg-share" hidden>📤 Dela (mejl, AirDrop, m.m.)</button>
  <button type="button" class="btn-compare" id="mg-copy">📋 Kopiera texten</button>
</div>
<p class="letter-send-status" id="mg-shareStatus"></p>

<p class="letter-privacy-note">Det här är en mall för eget bruk, inte juridisk rådgivning. Vissa länder har egna specifika krav — se vår <a href="/foraldramedgivande/">guide om föräldramedgivande land för land</a>.</p>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
(function() {
  var ids = ['childName','childPnr','childPassport','country','dates','flight','withName','withRelation','g1Name','g1Phone','g1Email','g2Name','g2Phone','g2Email'];
  var els = {};
  ids.forEach(function(id) { els[id] = document.getElementById('mg-' + id); });
  var englishEl = document.getElementById('mg-english');
  var addG2 = document.getElementById('mg-addG2');
  var g2block = document.getElementById('mg-g2block');
  var preview = document.getElementById('mg-preview');

  function val(id) { return (els[id] && els[id].value || '').trim(); }
  function ph(v, placeholder) { return v || placeholder; }

  function guardianLines(name, phone, email, lang) {
    if (!name && !phone && !email) return '';
    var label = lang === 'en' ? 'Non-travelling guardian' : 'Vårdnadshavare som inte reser med';
    var phoneLabel = lang === 'en' ? 'Phone' : 'Telefon';
    var emailLabel = lang === 'en' ? 'Email' : 'E-post';
    return label + ': ' + ph(name, '[NAMN]') + '\\n' + phoneLabel + ': ' + ph(phone, '[TELEFON]') + '\\n' + emailLabel + ': ' + ph(email, '[E-POST]') + '\\n\\n';
  }

  function buildLetterSv() {
    var today = new Date().toLocaleDateString('sv-SE');
    var flightLine = val('flight') ? ', ' + val('flight') : '';
    var out = 'MEDGIVANDE TILL RESA\\n\\n';
    out += 'Jag/vi, undertecknad(e) vårdnadshavare, ger härmed mitt/vårt medgivande till att ' + ph(val('childName'), '[BARNETS NAMN]') + ', personnummer ' + ph(val('childPnr'), '[PERSONNUMMER]') + (val('childPassport') ? ', pass nr ' + val('childPassport') : '') + ', reser till ' + ph(val('country'), '[RESMÅL]') + ' under perioden ' + ph(val('dates'), '[RESANS DATUM]') + flightLine + ' tillsammans med ' + ph(val('withName'), '[NAMN PÅ MEDRESANDE]') + ' (' + ph(val('withRelation'), '[RELATION TILL BARNET]') + ').\\n\\n';
    out += guardianLines(val('g1Name'), val('g1Phone'), val('g1Email'), 'sv');
    out += guardianLines(val('g2Name'), val('g2Phone'), val('g2Email'), 'sv');
    out += 'Underskrift vårdnadshavare: _______________________________\\n\\n';
    out += 'Ort och datum: _______________________________, ' + today;
    return out;
  }

  function buildLetterEn() {
    var today = new Date().toLocaleDateString('en-GB');
    var flightLine = val('flight') ? ', ' + val('flight') : '';
    var out = 'TRAVEL CONSENT LETTER\\n\\n';
    out += 'I/we, the undersigned legal guardian(s), hereby give my/our consent for ' + ph(val('childName'), '[CHILD\\'S NAME]') + ', personal identity number ' + ph(val('childPnr'), '[PERSONAL ID NUMBER]') + (val('childPassport') ? ', passport no. ' + val('childPassport') : '') + ', to travel to ' + ph(val('country'), '[DESTINATION]') + ' during the period ' + ph(val('dates'), '[TRAVEL DATES]') + flightLine + ' together with ' + ph(val('withName'), '[NAME OF ACCOMPANYING ADULT]') + ' (' + ph(val('withRelation'), '[RELATION TO CHILD]') + ').\\n\\n';
    out += guardianLines(val('g1Name'), val('g1Phone'), val('g1Email'), 'en');
    out += guardianLines(val('g2Name'), val('g2Phone'), val('g2Email'), 'en');
    out += 'Signature of guardian: _______________________________\\n\\n';
    out += 'Place and date: _______________________________, ' + today;
    return out;
  }

  function render() {
    var text = buildLetterSv();
    if (englishEl.checked) text += '\\n\\n— — — — — — — — — — — — — — — — — —\\n\\n' + buildLetterEn();
    preview.textContent = text;
  }

  addG2.addEventListener('change', function() { g2block.hidden = !addG2.checked; render(); });
  Object.keys(els).forEach(function(id) { if (els[id]) els[id].addEventListener('input', render); });
  englishEl.addEventListener('change', render);
  document.getElementById('mg-country').addEventListener('change', render);

  document.getElementById('mg-copy').addEventListener('click', function() {
    var btn = this;
    var text = preview.textContent;
    function done(ok) { btn.textContent = ok ? '✓ Kopierat!' : '📋 Kopiera texten'; if (ok) setTimeout(function() { btn.textContent = '📋 Kopiera texten'; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() { done(true); }).catch(function() { done(false); });
    } else {
      done(false);
    }
  });

  // ---- PDF (jsPDF, byggs helt i webbläsaren) ----
  function buildPdf() {
    var jsPDFlib = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFlib) return null;
    var doc = new jsPDFlib({ unit: 'pt', format: 'a4' });
    var margin = 54, maxWidth = 595 - margin * 2, y = margin;
    var pageH = 842 - margin;

    function ensureSpace(lineHeight) {
      if (y + lineHeight > pageH) { doc.addPage(); y = margin; }
    }
    function writeBlock(text, opts) {
      opts = opts || {};
      doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
      doc.setFontSize(opts.size || 11);
      var lines = doc.splitTextToSize(text, maxWidth);
      var lh = (opts.size || 11) * 1.4;
      lines.forEach(function(line) {
        ensureSpace(lh);
        doc.text(line, margin, y);
        y += lh;
      });
      y += opts.gapAfter || 6;
    }

    writeBlock('MEDGIVANDE TILL RESA / TRAVEL CONSENT LETTER', { bold: true, size: 14, gapAfter: 14 });
    buildLetterSv().split('\\n\\n').forEach(function(p) { writeBlock(p, { gapAfter: 10 }); });
    if (englishEl.checked) {
      y += 10;
      doc.setDrawColor(180); doc.line(margin, y, 595 - margin, y); y += 20;
      buildLetterEn().split('\\n\\n').forEach(function(p) { writeBlock(p, { gapAfter: 10 }); });
    }
    return doc;
  }

  document.getElementById('mg-download').addEventListener('click', function() {
    var doc = buildPdf();
    if (!doc) { alert('PDF-funktionen kunde inte laddas. Prova att ladda om sidan.'); return; }
    doc.save('medgivandebrev.pdf');
  });

  // ---- Dela (Web Share API — helt klientsidan, inget konto/server behövs) ----
  var shareBtn = document.getElementById('mg-share');
  var shareStatus = document.getElementById('mg-shareStatus');
  function setShareStatus(msg, cls) { shareStatus.textContent = msg; shareStatus.className = 'letter-send-status' + (cls ? ' ' + cls : ''); }

  function canShareFiles() {
    if (!navigator.canShare || !navigator.share) return false;
    try {
      var probe = new File(['x'], 'probe.pdf', { type: 'application/pdf' });
      return navigator.canShare({ files: [probe] });
    } catch (e) { return false; }
  }
  if (canShareFiles()) shareBtn.hidden = false;

  shareBtn.addEventListener('click', function() {
    var doc = buildPdf();
    if (!doc) { setShareStatus('PDF-funktionen kunde inte laddas. Prova att ladda om sidan.', 'err'); return; }
    var blob = doc.output('blob');
    var file = new File([blob], 'medgivandebrev.pdf', { type: 'application/pdf' });
    navigator.share({ files: [file], title: 'Medgivandebrev', text: 'Medgivandebrev från resmedbarn.se' })
      .then(function() { setShareStatus(''); })
      .catch(function(e) {
        if (e && e.name === 'AbortError') { setShareStatus(''); return; } // användaren avbröt, inget fel
        setShareStatus('Kunde inte dela just nu — ladda ner PDF:en i stället och maila den själv.', 'err');
      });
  });

  render();
})();
</script>

${faqHtml(G.faq)}
<h2 class="section-title">Mer för resan</h2>
<div class="related-links">
  <a href="/foraldramedgivande/">📋 Guide: föräldramedgivande land för land</a>
  <a href="/verktyg/">🧰 Alla verktyg</a>
  <a href="/packlista/">🧳 Smart packlista</a>
</div>`;
  write('medgivandebrev/index.html', page('/medgivandebrev/', G.meta, '/medgivandebrev/', inner, G.faq ? [bc.jsonld, faqLd(G.faq)] : bc.jsonld));
  console.log('  ✓ medgivandebrev/index.html');
}

/* ---------- VERKTYG (hubb som samlar alla kalkylatorer/verktyg) ---------- */
function buildVerktygHub() {
  const m = C.pages.verktyg;
  const bc = breadcrumbs([['Hem', '/'], ['Verktyg', null]]);
  const inner = `
<header class="page-header">
  ${bc.html}
  <h1>${esc(m.h1)}</h1>
  <div class="page-intro">${paras(m.intro)}</div>
</header>
<div class="card-grid">
  ${C.verktyg.tools.map(t => `
  <a class="hub-card" href="${t.url}">
    <span class="hub-emoji">${t.emoji}</span>
    <h2>${esc(t.name)}</h2>
    <p>${esc(t.cardText)}</p>
    <span class="hub-link">Öppna verktyget →</span>
  </a>`).join('')}
</div>
${faqHtml(m.faq)}`;
  write('verktyg/index.html', page('/verktyg/', m, '/verktyg/', inner, m.faq ? [bc.jsonld, faqLd(m.faq)] : bc.jsonld));
}

buildResmalHub();
buildResmalCountryHubs();
buildSmartPacklista();
buildPacklistaSubPages();
buildBranslekalkylator();
buildSolkramskalkylator();
buildMedgivande();
buildMedgivandeGenerator();
buildVerktygHub();
const RESMAL_DESTS = buildResmal();
buildSimplePages();
buildMeta(RESMAL_DESTS);
console.log('Klart. Output i ./dist');
