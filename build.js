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

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
<html lang="sv" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
${meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld)}</script>` : ''}
</head>
<body>`;
}

function nav(active) {
  const links = [
    ['/', 'Hem'], ['/guider/', 'Guider'], ['/topplistor/', 'Topplistor'], ['/stader/', 'Städer'],
    ['/om-oss/', 'Om oss'], ['/kontakt/', 'Kontakt']
  ];
  return `
<nav class="nav" aria-label="Huvudmeny">
  <a href="/" class="nav-brand">Res med <span>Barn</span></a>
  <ul class="nav-links">
    ${links.map(([href, label]) => `<li><a href="${href}"${href === active ? ' class="active"' : ''}>${label}</a></li>`).join('\n    ')}
  </ul>
  <button class="hamburger" aria-label="Meny" onclick="document.getElementById('mm').classList.toggle('open');this.classList.toggle('open')"><span></span><span></span><span></span></button>
</nav>
<div class="mobile-menu" id="mm">
  ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('\n  ')}
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
      <a href="/om-oss/">Om oss</a>
      <a href="/kontakt/">Kontakt</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2024–${new Date().getFullYear()} ${esc(C.site.name)}</span>
    <span>Gjord med ❤️ för barnfamiljer i Sverige</span>
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

const paras = arr => arr.map(p => `<p>${esc(p)}</p>`).join('\n');

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
  ${faq.map(f => `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
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

function page(url, meta, active, inner, extraJsonld) {
  if (extraJsonld) meta = { ...meta, jsonld: extraJsonld };
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
    <a class="feat-card reveal visible" href="/resmal/${destSlug(d.name)}/" onclick="return handleCardClick(event, '${destSlug(d.name)}')">
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
    <a class="dest-card reveal visible" data-cat="${d.cat}" href="/resmal/${destSlug(d.name)}/" onclick="return handleCardClick(event, '${destSlug(d.name)}')">
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
      name: C.site.name, url: DOMAIN + '/'
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
  <p class="kicker">${t.emoji} ${esc(a.name)} · ${esc(a.ageRange)}</p>
  <h1>${esc(g.h1)}</h1>
  <div class="page-intro">${paras(g.intro)}</div>
</header>
${media(g.img, t.emoji, 'page-hero', 1400)}
<article class="article">
  ${g.sections.map(s => `<h2>${esc(s.h2)}</h2>\n<p>${esc(s.text)}</p>`).join('\n')}
</article>
<div class="quicktips-box">
  <h2>Snabbtips</h2>
  <ul class="checklist">${g.quicktips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
</div>
${faqHtml(g.faq)}
<h2 class="section-title">Fler guider för ${esc(a.name.toLowerCase())}</h2>
<div class="related-links">
  ${others.map(x => `<a href="/guider/${a.slug}/${x.slug}/">${x.emoji} ${esc(C.guides[a.slug + '/' + x.slug].h1)}</a>`).join('\n  ')}
  <a href="/guider/${a.slug}/">← Alla guider för ${esc(a.name.toLowerCase())}</a>
</div>`;
      write(`guider/${key}/index.html`, page(url, g, '/guider/', inner, g.faq ? [bc.jsonld, faqLd(g.faq)] : bc.jsonld));
    }
  }
}

/* ---------- TOPPLISTOR ---------- */
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
  <p class="kicker">${l.emoji} Uppdaterad ${esc(C.topplistor.updated)}</p>
  <h1>${esc(l.h1)}</h1>
  <div class="page-intro">${paras(l.intro)}</div>
</header>
${media(l.img, l.emoji, 'page-hero', 1400)}
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
      <div class="pros-cons">
        <ul class="pros">${p.pros.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <ul class="cons">${p.cons.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      ${p.priceRunnerUrl ? `<a class="btn-compare" href="${esc(p.priceRunnerUrl)}" target="_blank" rel="sponsored noopener">Jämför pris hos PriceRunner →</a>` : ''}
    </div>
  </article>`).join('')}
</div>
<article class="article">
  ${l.sections.map(s => `<h2>${esc(s.h2)}</h2>\n<p>${esc(s.text)}</p>`).join('\n')}
</article>
${faqHtml(l.faq)}
<h2 class="section-title">Fler topplistor</h2>
<div class="related-links">
  ${C.topplistor.lists.filter(x => x.slug !== l.slug).map(x => `<a href="/topplistor/${x.slug}/">${x.emoji} ${esc(x.h1)}</a>`).join('\n  ')}
</div>`;
    write(`topplistor/${l.slug}/index.html`, page(url, l, '/topplistor/', inner, l.faq ? [bc.jsonld, itemList, faqLd(l.faq)] : [bc.jsonld, itemList]));
  }
}

/* ---------- STÄDER ---------- */
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
    </div>
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
  <p class="kicker">${s.emoji} Uppdaterad ${esc(C.topplistor.updated)}</p>
  <h1>${esc(s.h1)}</h1>
  <div class="page-intro">${paras(s.intro)}</div>
</header>
${media(s.img, s.emoji, 'page-hero', 1400)}

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
    write(`stader/${s.slug}/index.html`, page(url, s, '/stader/', inner, s.faq ? [bc.jsonld, itemList, faqLd(s.faq)] : [bc.jsonld, itemList]));
  }
}

/* ---------- RESMÅL (extraherade från templates/home.html) ---------- */
const CAT_LABELS = { beach: 'Strand & Sol', parks: 'Nöjesparker', cities: 'Storstäder', sweden: 'Sverige', museums: 'Museer' };
const destSlug = s => s.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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

function buildResmal() {
  const DESTINATIONS = loadDestinations();
  const bcHub = [['Hem', '/'], ['Resmål', null]];

  for (const d of DESTINATIONS) {
    const slug = destSlug(d.name);
    const url = `/resmal/${slug}/`;
    const isAttraction = d.cat === 'parks' || d.cat === 'museums';
    const bc = breadcrumbs([['Hem', '/'], ['Resmål', '/#destinations'], [d.name, null]]);
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
      description: d.desc.length > 150 ? d.desc.slice(0, 147) + '…' : d.desc
    };

    const inner = `
<div class="detail-hero">
  <div class="card-media" data-emoji="${d.emoji}">
    <img src="${IMG_RESMAL(d.img)}" alt="${esc(d.name)}" loading="eager" onerror="this.parentElement.classList.add('img-fallback');this.remove();">
  </div>
  <a href="/#destinations" class="detail-back">← Alla resmål</a>
  <div class="detail-title-wrap">
    <span class="d-chip" style="background: var(--cat-${d.cat}, var(--accent))">${d.emoji} ${esc(CAT_LABELS[d.cat] || d.catLabel)}</span>
    <h1>${esc(d.name)}</h1>
    <p class="d-country">${esc(d.country)} · ⭐ ${d.rating} i familjebetyg</p>
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
  <div class="detail-actions">
    ${d.bookingUrl ? `<a class="btn btn-primary" href="${esc(d.bookingUrl)}" target="_blank" rel="sponsored noopener">Boka / Läs mer →</a>` : ''}
    <a class="btn btn-ghost" href="/#destinations">Fler inom ${esc(CAT_LABELS[d.cat] || d.catLabel)} →</a>
  </div>
  ${similar.length ? `
  <h2 class="section-title">Liknande resmål</h2>
  <div class="similar-grid">
    ${similar.map(x => `
    <a class="similar-card" href="/resmal/${destSlug(x.name)}/">
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

    write(`resmal/${slug}/index.html`, page(url, meta, null, inner, [bc.jsonld, schema]));
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
    write(`${slug}/index.html`, page(url, m, url, inner, bc.jsonld));
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
  for (const s of C.stader.cities) urls.push(`/stader/${s.slug}/`);
  for (const d of destinations) urls.push(`/resmal/${destSlug(d.name)}/`);
  const today = new Date().toISOString().slice(0, 10);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${DOMAIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
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
const RESMAL_DESTS = buildResmal();
buildSimplePages();
buildMeta(RESMAL_DESTS);
console.log('Klart. Output i ./dist');
