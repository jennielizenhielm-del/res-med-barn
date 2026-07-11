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
${meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld)}</script>` : ''}
</head>
<body>`;
}

function nav(active) {
  const links = [
    ['/', 'Hem'], ['/guider/', 'Guider'], ['/topplistor/', 'Topplistor'],
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
function buildHome() {
  let html = fs.readFileSync(path.join(ROOT, 'templates', 'home.html'), 'utf8');
  const m = C.pages.home;
  warnLen('/', 'meta title', m.title, 60);
  warnLen('/', 'meta description', m.description, 155);
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${esc(m.description)}">`)
    .replace('</head>', `<link rel="canonical" href="${DOMAIN}/">
<meta property="og:title" content="${esc(m.title)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${DOMAIN}/">
<meta property="og:type" content="website">
<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: C.site.name, url: DOMAIN + '/'
    })}</script>
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
</div>`;
  write('guider/index.html', page('/guider/', m, '/guider/', inner, bc.jsonld));
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
</div>`;
  write('topplistor/index.html', page('/topplistor/', hub, '/topplistor/', hubInner, bcHub.jsonld));

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
function buildMeta() {
  const urls = ['/', '/guider/', '/topplistor/', '/om-oss/', '/kontakt/'];
  for (const a of C.ages) {
    urls.push(`/guider/${a.slug}/`);
    for (const t of C.transports) urls.push(`/guider/${a.slug}/${t.slug}/`);
  }
  for (const l of C.topplistor.lists) urls.push(`/topplistor/${l.slug}/`);
  const today = new Date().toISOString().slice(0, 10);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${DOMAIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`);
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${DOMAIN}/sitemap.xml`);
  fs.copyFileSync(path.join(ROOT, 'static', 'styles.css'), path.join(DIST, 'styles.css'));
  console.log('  ✓ styles.css');
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
buildSimplePages();
buildMeta();
console.log('Klart. Output i ./dist');
