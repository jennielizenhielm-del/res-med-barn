<!DOCTYPE html>
<html lang="sv" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Res med Barn — Familjens resguide</title>
  <meta name="description" content="30 handplockade resmål för barnfamiljer. Bilder, ärliga omdömen, praktiska tips och en quiz som hittar er nästa resa.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #F8F4EE;
      --bg-alt: #F0EBE3;
      --surface: #FFFCF7;
      --text: #2A2520;
      --text-secondary: #7A7168;
      --text-muted: #A09890;
      --primary: #6B8F71;
      --primary-hover: #5A7D60;
      --primary-light: #E8F0E9;
      --accent: #D4654A;
      --accent-hover: #C0563D;
      --accent-light: #FAEAE5;
      --sand: #D4A574;
      --sand-light: #F5E8D8;
      --border: #E8E2DA;
      --border-light: #F0EBE3;
      --shadow-sm: 0 1px 3px rgba(42,37,32,0.04);
      --shadow-md: 0 4px 16px rgba(42,37,32,0.06);
      --shadow-lg: 0 8px 32px rgba(42,37,32,0.10);
      --radius: 10px;
      --radius-lg: 16px;
      --radius-pill: 100px;
      --cat-beach: #D4654A;
      --cat-parks: #8B6BB5;
      --cat-nature: #4A7A5B;
      --cat-cities: #5B7B9D;
      --cat-winter: #6B9DC5;
      --cat-sweden: #C5A34A;
      --font-display: 'Fraunces', Georgia, serif;
      --font-body: 'Outfit', system-ui, sans-serif;
      --transition: 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }

    [data-theme="dark"] {
      --bg: #1A1816;
      --bg-alt: #21201D;
      --surface: #292724;
      --text: #EDE8E0;
      --text-secondary: #A8A098;
      --text-muted: #787068;
      --primary: #8FB896;
      --primary-hover: #A3C8A9;
      --primary-light: #252E27;
      --accent: #E8886F;
      --accent-hover: #F09A84;
      --accent-light: #352420;
      --sand: #C4956A;
      --sand-light: #2E261E;
      --border: #383430;
      --border-light: #302C28;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.16);
      --shadow-lg: 0 8px 32px rgba(0,0,0,0.25);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-body);
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    body.no-scroll { overflow: hidden; }

    mark {
      background: color-mix(in srgb, var(--accent) 22%, transparent);
      color: inherit;
      border-radius: 3px;
      padding: 0 1px;
    }

    /* ---- NAV ---- */
    .nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      padding: 0 clamp(1.25rem, 4vw, 3rem);
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: color-mix(in srgb, var(--bg) 85%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-light);
      transition: box-shadow var(--transition);
    }
    .nav.scrolled { box-shadow: var(--shadow-sm); }

    .nav-brand {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    .nav-brand span { color: var(--accent); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      list-style: none;
    }
    .nav-links a {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color var(--transition);
    }
    .nav-links a:hover { color: var(--text); }

    .nav-actions { display: flex; gap: 0.5rem; align-items: center; }

    .icon-btn {
      height: 38px;
      min-width: 38px;
      display: flex; align-items: center; justify-content: center;
      gap: 0.35rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      cursor: pointer;
      font-size: 1.05rem;
      font-family: var(--font-body);
      transition: all var(--transition);
      color: var(--text-secondary);
      padding: 0 0.5rem;
    }
    .icon-btn:hover { border-color: var(--text-muted); color: var(--text); }
    [data-theme="dark"] .theme-icon-light { display: none; }
    [data-theme="light"] .theme-icon-dark { display: none; }

    .fav-count {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
      min-width: 1ch;
    }

    .hamburger {
      display: none;
      width: 38px; height: 38px;
      align-items: center; justify-content: center;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      cursor: pointer;
      flex-direction: column;
      gap: 4px;
    }
    .hamburger span {
      display: block; width: 18px; height: 2px;
      background: var(--text); border-radius: 1px;
      transition: all var(--transition);
    }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(3px, 5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(3px, -5px); }

    .mobile-menu {
      display: none;
      position: fixed;
      top: 64px; left: 0; right: 0;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      padding: 1.5rem;
      z-index: 99;
      flex-direction: column;
      gap: 0.5rem;
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu a {
      display: block;
      padding: 0.75rem 0;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text);
      text-decoration: none;
      border-bottom: 1px solid var(--border-light);
    }

    @media (max-width: 860px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
    }

    /* ---- HERO ---- */
    .hero {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      gap: clamp(2rem, 5vw, 4rem);
      align-items: center;
      min-height: 88vh;
      padding: clamp(7rem, 12vw, 9rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem);
      max-width: 1280px;
      margin: 0 auto;
      overflow: visible;
    }
    .hero::before {
      content: '';
      position: absolute;
      width: clamp(300px, 45vw, 600px);
      height: clamp(300px, 45vw, 600px);
      border-radius: 50%;
      background: radial-gradient(circle, var(--accent-light) 0%, transparent 70%);
      top: 5%;
      right: -5%;
      pointer-events: none;
      z-index: -1;
    }

    .hero-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1rem;
      background: var(--primary-light);
      border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent);
      border-radius: var(--radius-pill);
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--primary);
      margin-bottom: 1.5rem;
    }

    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2.8rem, 6vw, 4.8rem);
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.025em;
      color: var(--text);
      margin-bottom: 1.25rem;
    }
    .hero h1 em { font-style: italic; color: var(--accent); }

    .hero-sub {
      font-size: clamp(1.05rem, 1.8vw, 1.2rem);
      color: var(--text-secondary);
      line-height: 1.65;
      max-width: 520px;
      margin-bottom: 2.25rem;
    }

    .hero-search-wrap { position: relative; max-width: 500px; }
    .hero-search { display: flex; gap: 0.75rem; }
    .hero-search input {
      flex: 1;
      padding: 0.85rem 1.25rem;
      font-family: var(--font-body);
      font-size: 0.95rem;
      color: var(--text);
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-pill);
      outline: none;
      transition: border-color var(--transition);
    }
    .hero-search input::placeholder { color: var(--text-muted); }
    .hero-search input:focus { border-color: var(--primary); }
    .hero-search button {
      padding: 0.85rem 1.75rem;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      color: #FFFCF7;
      background: var(--accent);
      border: none;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition: background var(--transition);
      white-space: nowrap;
    }
    .hero-search button:hover { background: var(--accent-hover); }

    /* search suggestions */
    .suggestions {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0; right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: 50;
      display: none;
    }
    .suggestions.open { display: block; }
    .suggestion {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.7rem 1rem;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: var(--font-body);
      text-align: left;
      transition: background var(--transition);
      border-bottom: 1px solid var(--border-light);
    }
    .suggestion:last-child { border-bottom: none; }
    .suggestion:hover, .suggestion.focused { background: var(--bg-alt); }
    .suggestion .s-emoji { font-size: 1.2rem; }
    .suggestion .s-name { font-weight: 600; font-size: 0.92rem; color: var(--text); }
    .suggestion .s-meta { font-size: 0.8rem; color: var(--text-muted); }

    .hero-stats {
      display: flex;
      gap: 1.75rem;
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-light);
    }
    .hero-stat { font-size: 0.85rem; color: var(--text-muted); }
    .hero-stat strong {
      display: block;
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.15rem;
    }

    /* hero photo collage */
    .hero-collage {
      position: relative;
      height: clamp(380px, 48vw, 560px);
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: repeat(6, 1fr);
      gap: 0.9rem;
    }
    .hero-collage .col-img {
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: relative;
      box-shadow: var(--shadow-md);
    }
    .hero-collage .col-img img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .col-img:nth-child(1) { grid-area: 1 / 1 / 5 / 5; }
    .col-img:nth-child(2) { grid-area: 1 / 5 / 4 / 7; transform: translateY(1.5rem); }
    .col-img:nth-child(3) { grid-area: 5 / 2 / 7 / 5; }
    .col-img:nth-child(4) { grid-area: 4 / 5 / 7 / 7; }
    .hero-collage .col-tag {
      position: absolute;
      bottom: 0.6rem; left: 0.6rem;
      padding: 0.25rem 0.7rem;
      background: color-mix(in srgb, #1A1816 55%, transparent);
      backdrop-filter: blur(8px);
      border-radius: var(--radius-pill);
      color: #FDF9F3;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .hero-collage { height: 300px; margin-top: 0.5rem; }
      .col-img:nth-child(2) { transform: none; }
    }

    /* ---- SECTION SHARED ---- */
    .section { padding: clamp(3rem, 6vw, 5rem) clamp(1.25rem, 4vw, 3rem); }
    .section-header { max-width: 620px; margin-bottom: clamp(2rem, 4vw, 3rem); }
    .section-header h2 {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 3.5vw, 2.6rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin-bottom: 0.6rem;
    }
    .section-header p { font-size: 1.02rem; color: var(--text-secondary); line-height: 1.6; }

    /* ---- CATEGORIES ---- */
    .categories {
      padding: 0 clamp(1.25rem, 4vw, 3rem);
      margin-bottom: clamp(2rem, 4vw, 3rem);
      position: sticky;
      top: 64px;
      z-index: 90;
      background: color-mix(in srgb, var(--bg) 92%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding-top: 0.75rem;
    }
    .cat-scroll {
      display: flex;
      gap: 0.6rem;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 0.75rem;
    }
    .cat-scroll::-webkit-scrollbar { display: none; }

    .cat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.6rem 1.15rem;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-pill);
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--surface);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition);
    }
    .cat-pill:hover { border-color: var(--text-muted); color: var(--text); }
    .cat-pill.active { background: var(--text); color: var(--bg); border-color: var(--text); }
    .cat-pill .cat-emoji { font-size: 1rem; }

    /* ---- IMAGE + FALLBACK ---- */
    .card-media {
      position: relative;
      overflow: hidden;
      background: var(--bg-alt);
    }
    .card-media img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .card-media.img-fallback::after {
      content: attr(data-emoji);
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }
    .card-media.img-fallback[data-cat="beach"]  { background: linear-gradient(135deg, color-mix(in srgb, var(--cat-beach) 30%, var(--bg)), color-mix(in srgb, var(--sand) 40%, var(--bg))); }
    .card-media.img-fallback[data-cat="parks"]  { background: linear-gradient(135deg, color-mix(in srgb, var(--cat-parks) 30%, var(--bg)), color-mix(in srgb, var(--cat-cities) 25%, var(--bg))); }
    .card-media.img-fallback[data-cat="nature"] { background: linear-gradient(135deg, color-mix(in srgb, var(--cat-nature) 30%, var(--bg)), color-mix(in srgb, var(--sand) 30%, var(--bg))); }
    .card-media.img-fallback[data-cat="cities"] { background: linear-gradient(135deg, color-mix(in srgb, var(--cat-cities) 30%, var(--bg)), color-mix(in srgb, var(--cat-parks) 20%, var(--bg))); }
    .card-media.img-fallback[data-cat="winter"] { background: linear-gradient(135deg, color-mix(in srgb, var(--cat-winter) 32%, var(--bg)), color-mix(in srgb, var(--cat-cities) 20%, var(--bg))); }
    .card-media.img-fallback[data-cat="sweden"] { background: linear-gradient(135deg, color-mix(in srgb, var(--cat-sweden) 32%, var(--bg)), color-mix(in srgb, var(--cat-nature) 25%, var(--bg))); }

    /* ---- FEATURED ---- */
    .featured-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.25rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .feat-card {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--surface);
      border: 1px solid var(--border);
      transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }
    .feat-card:hover {
      border-color: var(--text-muted);
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .feat-card:hover .card-media img { transform: scale(1.04); }
    .feat-card:nth-child(1) { grid-column: span 7; }
    .feat-card:nth-child(2) { grid-column: span 5; }
    .feat-card:nth-child(3) { grid-column: span 5; }
    .feat-card:nth-child(4) { grid-column: span 7; }

    .feat-card .card-media { height: 240px; flex-shrink: 0; }

    .feat-badge {
      position: absolute;
      top: 0.85rem; left: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.28rem 0.7rem;
      border-radius: var(--radius-pill);
      font-size: 0.76rem;
      font-weight: 600;
      background: color-mix(in srgb, #FFFCF7 88%, transparent);
      backdrop-filter: blur(6px);
      color: #2A2520;
      z-index: 2;
    }

    .feat-card-inner {
      padding: clamp(1.25rem, 2.5vw, 1.75rem);
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .feat-card h3 {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 2.2vw, 1.8rem);
      font-weight: 600;
      letter-spacing: -0.015em;
      margin-bottom: 0.2rem;
    }
    .feat-card .feat-country { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.7rem; }
    .feat-card .feat-desc {
      font-size: 0.94rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 1.1rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .feat-meta { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: auto; }
    .feat-meta-item { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }
    .feat-meta-item strong { color: var(--text-secondary); font-weight: 600; }

    @media (max-width: 768px) {
      .feat-card:nth-child(n) { grid-column: span 12; }
      .feat-card .card-media { height: 200px; }
    }

    /* ---- FAVORITE HEART ---- */
    .fav-heart {
      position: absolute;
      top: 0.7rem; right: 0.7rem;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border: none;
      border-radius: 50%;
      background: color-mix(in srgb, #FFFCF7 85%, transparent);
      backdrop-filter: blur(6px);
      cursor: pointer;
      font-size: 1.05rem;
      z-index: 3;
      transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      color: #B0A79E;
      line-height: 1;
    }
    .fav-heart:hover { transform: scale(1.12); }
    .fav-heart.faved { color: #D4654A; }
    .fav-heart.faved .heart-path { fill: #D4654A; }
    .fav-heart svg { width: 18px; height: 18px; display: block; }
    .fav-heart .heart-path { fill: transparent; stroke: currentColor; stroke-width: 2; transition: fill var(--transition); }

    /* ---- DESTINATION GRID ---- */
    .dest-section { background: var(--bg-alt); }

    .dest-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }
    .dest-count { font-size: 0.9rem; color: var(--text-muted); }
    .dest-count strong { color: var(--text-secondary); font-weight: 600; }

    .toolbar-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }

    .dest-search { position: relative; width: 260px; }
    .dest-search input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      font-family: var(--font-body);
      font-size: 0.88rem;
      color: var(--text);
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-pill);
      outline: none;
      transition: border-color var(--transition);
    }
    .dest-search input:focus { border-color: var(--primary); }
    .dest-search input::placeholder { color: var(--text-muted); }
    .dest-search-icon {
      position: absolute;
      left: 0.9rem; top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .select-wrap select {
      appearance: none;
      padding: 0.65rem 2.2rem 0.65rem 1rem;
      font-family: var(--font-body);
      font-size: 0.86rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-pill);
      cursor: pointer;
      outline: none;
      transition: border-color var(--transition);
    }
    .select-wrap { position: relative; }
    .select-wrap::after {
      content: '▾';
      position: absolute;
      right: 0.9rem; top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    .select-wrap select:focus { border-color: var(--primary); }

    .dest-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dest-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }
    .dest-card:hover {
      border-color: var(--text-muted);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .dest-card:hover .card-media img { transform: scale(1.04); }

    .dest-card .card-media { height: 185px; }

    .dest-cat-chip {
      position: absolute;
      bottom: 0.7rem; left: 0.7rem;
      padding: 0.22rem 0.65rem;
      border-radius: var(--radius-pill);
      font-size: 0.72rem;
      font-weight: 600;
      color: #FDF9F3;
      z-index: 2;
    }
    .dest-cat-chip[data-cat="beach"]  { background: var(--cat-beach); }
    .dest-cat-chip[data-cat="parks"]  { background: var(--cat-parks); }
    .dest-cat-chip[data-cat="nature"] { background: var(--cat-nature); }
    .dest-cat-chip[data-cat="cities"] { background: var(--cat-cities); }
    .dest-cat-chip[data-cat="winter"] { background: var(--cat-winter); }
    .dest-cat-chip[data-cat="sweden"] { background: var(--cat-sweden); }

    .dest-card-body { padding: 1.15rem 1.25rem 1.25rem; display: flex; flex-direction: column; flex: 1; }
    .dest-card-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .dest-card h3 {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .dest-card-budget { font-size: 0.82rem; font-weight: 600; color: var(--sand); letter-spacing: 0.02em; white-space: nowrap; }
    .dest-card .dest-country { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.55rem; }
    .dest-card .dest-desc {
      font-size: 0.89rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .dest-card-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      padding-top: 0.85rem;
      border-top: 1px solid var(--border-light);
      margin-top: auto;
    }
    .meta-tag { font-size: 0.78rem; color: var(--text-muted); }
    .meta-tag strong { font-weight: 600; color: var(--text-secondary); }

    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }
    .no-results p { font-size: 1.1rem; margin-bottom: 0.5rem; }

    /* scroll reveal */
    .reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    @media (max-width: 600px) {
      .dest-grid { grid-template-columns: 1fr; }
      .dest-search { width: 100%; }
      .toolbar-controls { width: 100%; }
    }

    /* ---- DETAIL VIEW ---- */
    .detail {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: var(--bg);
      overflow-y: auto;
      overscroll-behavior: contain;
      opacity: 0;
      transform: translateY(24px);
      pointer-events: none;
      transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .detail.open { opacity: 1; transform: translateY(0); pointer-events: auto; }

    .detail-hero {
      position: relative;
      height: clamp(280px, 45vh, 460px);
    }
    .detail-hero .card-media { height: 100%; }
    .detail-hero .card-media.img-fallback::after { font-size: 6rem; }
    .detail-hero::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, color-mix(in srgb, #1A1816 55%, transparent), transparent 55%);
      pointer-events: none;
    }

    .detail-close {
      position: fixed;
      top: 1.25rem; right: 1.25rem;
      z-index: 210;
      width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      border: none;
      border-radius: 50%;
      background: color-mix(in srgb, #FFFCF7 88%, transparent);
      backdrop-filter: blur(8px);
      color: #2A2520;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: var(--shadow-md);
      transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .detail-close:hover { transform: scale(1.08); }

    .detail-back {
      position: fixed;
      top: 1.25rem; left: 1.25rem;
      z-index: 210;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      border: none;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, #FFFCF7 88%, transparent);
      backdrop-filter: blur(8px);
      color: #2A2520;
      font-family: var(--font-body);
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--shadow-md);
    }

    .detail-title-wrap {
      position: absolute;
      bottom: clamp(1.25rem, 4vw, 2.5rem);
      left: 0; right: 0;
      padding: 0 clamp(1.25rem, 4vw, 3rem);
      max-width: 880px;
      margin: 0 auto;
      color: #FDF9F3;
      z-index: 2;
    }
    .detail-title-wrap .d-chip {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-pill);
      font-size: 0.78rem;
      font-weight: 600;
      margin-bottom: 0.7rem;
      color: #FDF9F3;
    }
    .detail-title-wrap h2 {
      font-family: var(--font-display);
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.05;
    }
    .detail-title-wrap .d-country { font-size: 1rem; opacity: 0.85; margin-top: 0.3rem; }

    .detail-body {
      max-width: 880px;
      margin: 0 auto;
      padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 3rem) clamp(4rem, 8vw, 6rem);
    }

    .detail-facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: clamp(2rem, 4vw, 3rem);
    }
    .fact {
      background: var(--surface);
      padding: 1.1rem 1.25rem;
    }
    .fact .f-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }
    .fact .f-value {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text);
    }

    .detail-desc {
      font-size: 1.08rem;
      line-height: 1.75;
      color: var(--text);
      margin-bottom: clamp(2rem, 4vw, 3rem);
      max-width: 680px;
    }

    .detail-section-title {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 1.1rem;
    }

    .highlights { list-style: none; margin-bottom: clamp(2rem, 4vw, 3rem); max-width: 680px; }
    .highlights li {
      display: flex;
      gap: 0.85rem;
      align-items: baseline;
      padding: 0.85rem 0;
      border-bottom: 1px solid var(--border-light);
      font-size: 0.98rem;
      color: var(--text-secondary);
      line-height: 1.55;
    }
    .highlights li::before {
      content: '✦';
      color: var(--accent);
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .detail-tip {
      background: var(--primary-light);
      border-left: none;
      border-radius: var(--radius-lg);
      padding: 1.4rem 1.6rem;
      margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
      max-width: 680px;
    }
    .detail-tip .t-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary);
      margin-bottom: 0.4rem;
    }
    .detail-tip p { font-size: 0.98rem; color: var(--text); line-height: 1.65; }

    .detail-actions { display: flex; gap: 0.75rem; margin-bottom: clamp(2.5rem, 5vw, 3.5rem); flex-wrap: wrap; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.6rem;
      border-radius: var(--radius-pill);
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: 1.5px solid transparent;
      transition: all var(--transition);
      text-decoration: none;
    }
    .btn-primary { background: var(--accent); color: #FFFCF7; }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-ghost { background: transparent; color: var(--text-secondary); border-color: var(--border); }
    .btn-ghost:hover { border-color: var(--text-muted); color: var(--text); }
    .btn-ghost.faved { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

    .similar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    .similar-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
      transition: all var(--transition);
    }
    .similar-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--text-muted); }
    .similar-card .card-media { height: 110px; }
    .similar-card .sim-body { padding: 0.8rem 0.95rem; }
    .similar-card h4 { font-family: var(--font-display); font-size: 1rem; font-weight: 600; }
    .similar-card .sim-country { font-size: 0.76rem; color: var(--text-muted); }

    /* ---- QUIZ ---- */
    .quiz-section {
      background: var(--sand-light);
      position: relative;
      overflow: hidden;
    }
    .quiz-section::before {
      content: '';
      position: absolute;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--sand) 18%, transparent) 0%, transparent 70%);
      top: -100px; right: -100px;
      pointer-events: none;
    }
    .quiz-inner { max-width: 720px; margin: 0 auto; position: relative; }

    .quiz-progress {
      display: flex;
      gap: 0.4rem;
      margin-bottom: 1.75rem;
    }
    .quiz-progress span {
      height: 4px;
      flex: 1;
      border-radius: 2px;
      background: color-mix(in srgb, var(--sand) 35%, transparent);
      transition: background var(--transition);
    }
    .quiz-progress span.done { background: var(--accent); }

    .quiz-q {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 3vw, 1.9rem);
      font-weight: 600;
      margin-bottom: 1.5rem;
      letter-spacing: -0.01em;
    }
    .quiz-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
    }
    .quiz-opt {
      padding: 1.1rem 1.2rem;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text);
      text-align: left;
      transition: all var(--transition);
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .quiz-opt:hover { border-color: var(--accent); transform: translateY(-1px); }
    .quiz-opt .qo-emoji { font-size: 1.4rem; }
    .quiz-opt .qo-sub { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }

    .quiz-restart {
      margin-top: 1.5rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-family: var(--font-body);
      font-size: 0.86rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .quiz-restart:hover { color: var(--text); }

    .quiz-results { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .quiz-result-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    /* ---- TIPS ---- */
    .tips-section { background: var(--primary-light); position: relative; }
    .tips-section::before {
      content: '';
      position: absolute;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 70%);
      top: -50px; right: -50px;
      pointer-events: none;
    }
    .tips-inner { max-width: 800px; margin: 0 auto; position: relative; }
    .tips-list { display: flex; flex-direction: column; gap: 0; }
    .tip-item {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      padding: 1.5rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--primary) 12%, transparent);
    }
    .tip-item:last-child { border-bottom: none; }
    .tip-number {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 300;
      color: var(--primary);
      line-height: 1;
      flex-shrink: 0;
      width: 2.5rem;
      text-align: center;
      padding-top: 0.15rem;
    }
    .tip-content h3 { font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; margin-bottom: 0.35rem; }
    .tip-content p { font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6; }

    /* ---- NEWSLETTER ---- */
    .newsletter { text-align: left; }
    .newsletter-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: clamp(2rem, 5vw, 4rem);
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: clamp(2rem, 5vw, 3.5rem);
    }
    .newsletter h2 {
      font-family: var(--font-display);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 600;
      letter-spacing: -0.015em;
      margin-bottom: 0.6rem;
    }
    .newsletter p { color: var(--text-secondary); font-size: 0.98rem; line-height: 1.65; }
    .newsletter-form { display: flex; gap: 0.6rem; }
    .newsletter-form input {
      flex: 1;
      padding: 0.85rem 1.25rem;
      font-family: var(--font-body);
      font-size: 0.92rem;
      color: var(--text);
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-pill);
      outline: none;
      transition: border-color var(--transition);
    }
    .newsletter-form input:focus { border-color: var(--primary); }
    .newsletter-success {
      display: none;
      font-size: 1rem;
      color: var(--primary);
      font-weight: 600;
    }
    @media (max-width: 768px) {
      .newsletter-inner { grid-template-columns: 1fr; }
      .newsletter-form { flex-direction: column; }
    }

    /* ---- FOOTER ---- */
    .footer { padding: clamp(3rem, 6vw, 4rem) clamp(1.25rem, 4vw, 3rem); border-top: 1px solid var(--border); }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 3rem;
    }
    .footer-about h3 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; margin-bottom: 0.75rem; }
    .footer-about h3 span { color: var(--accent); }
    .footer-about p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.65; }
    .footer-col h4 {
      font-size: 0.82rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .footer-col a {
      display: block;
      font-size: 0.9rem;
      color: var(--text-secondary);
      text-decoration: none;
      padding: 0.3rem 0;
      transition: color var(--transition);
      cursor: pointer;
    }
    .footer-col a:hover { color: var(--text); }
    .footer-bottom {
      max-width: 1200px;
      margin: 2.5rem auto 0;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
      .footer-bottom { flex-direction: column; gap: 0.5rem; text-align: center; }
      .hero-search { flex-direction: column; }
      .hero-search button { text-align: center; justify-content: center; }
      .dest-toolbar { flex-direction: column; align-items: stretch; }
    }

    /* ---- SKIP LINK ---- */
    .skip-link {
      position: absolute;
      top: -100%;
      left: 1rem;
      padding: 0.5rem 1rem;
      background: var(--accent);
      color: #fff;
      border-radius: var(--radius);
      z-index: 300;
      font-size: 0.85rem;
      text-decoration: none;
    }
    .skip-link:focus { top: 0.5rem; }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .reveal { opacity: 1; transform: none; transition: none; }
      .detail { transition: none; }
    }
  </style>
</head>
<body>
<a href="#destinations" class="skip-link">Hoppa till resmål</a>

<!-- NAV -->
<nav class="nav" role="navigation" aria-label="Huvudmeny">
  <a href="#" class="nav-brand">Res med <span>Barn</span></a>
  <ul class="nav-links">
    <li><a href="/guider/">Guider</a></li>
    <li><a href="/topplistor/">Topplistor</a></li>
    <li><a href="#destinations">Resmål</a></li>
    <li><a href="#quiz">Hitta er resa</a></li>
    <li><a href="/om-oss/">Om oss</a></li>
  </ul>
  <div class="nav-actions">
    <button class="icon-btn" aria-label="Mina favoriter" onclick="showFavorites()" title="Mina favoriter">
      <span>♥</span><span class="fav-count" id="favCount"></span>
    </button>
    <button class="icon-btn" aria-label="Byt tema" onclick="toggleTheme()">
      <span class="theme-icon-light">☀️</span>
      <span class="theme-icon-dark">🌙</span>
    </button>
    <button class="hamburger" aria-label="Meny" onclick="toggleMenu()">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div class="mobile-menu" id="mobileMenu">
  <a href="/guider/">Guider</a>
  <a href="/topplistor/">Topplistor</a>
  <a href="#destinations" onclick="closeMenu()">Alla resmål</a>
  <a href="#quiz" onclick="closeMenu()">Hitta er resa</a>
  <a href="/om-oss/">Om oss</a>
  <a href="/kontakt/">Kontakt</a>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-label">✈️ Familjens resguide sedan 2024</div>
    <h1>Världens bästa resor<br>med <em>barn</em></h1>
    <p class="hero-sub">Handplockade resmål, ärliga omdömen och praktiska tips från föräldrar som faktiskt har varit där. Med barn. På riktigt.</p>
    <div class="hero-search-wrap">
      <div class="hero-search">
        <input type="text" id="heroSearch" placeholder="Sök resmål, land eller kategori..." aria-label="Sök resmål" autocomplete="off">
        <button onclick="heroSearchGo()">Sök</button>
      </div>
      <div class="suggestions" id="suggestions" role="listbox"></div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><strong>30</strong> resmål</div>
      <div class="hero-stat"><strong>6</strong> kategorier</div>
      <div class="hero-stat"><strong>0–16</strong> år</div>
    </div>
  </div>
  <div class="hero-collage" aria-hidden="true" id="heroCollage"></div>
</section>

<!-- CATEGORIES -->
<div class="categories" id="categoriesNav">
  <div class="cat-scroll" role="tablist" aria-label="Filtrera efter kategori">
    <button class="cat-pill active" data-filter="all" role="tab" aria-selected="true"><span class="cat-emoji">🌍</span> Alla</button>
    <button class="cat-pill" data-filter="beach" role="tab" aria-selected="false"><span class="cat-emoji">🏖️</span> Strand &amp; Sol</button>
    <button class="cat-pill" data-filter="parks" role="tab" aria-selected="false"><span class="cat-emoji">🎢</span> Nöjesparker</button>
    <button class="cat-pill" data-filter="nature" role="tab" aria-selected="false"><span class="cat-emoji">🏔️</span> Natur &amp; Äventyr</button>
    <button class="cat-pill" data-filter="cities" role="tab" aria-selected="false"><span class="cat-emoji">🏙️</span> Storstäder</button>
    <button class="cat-pill" data-filter="winter" role="tab" aria-selected="false"><span class="cat-emoji">❄️</span> Vinterresor</button>
    <button class="cat-pill" data-filter="sweden" role="tab" aria-selected="false"><span class="cat-emoji">🇸🇪</span> Sverige</button>
    <button class="cat-pill" data-filter="favs" role="tab" aria-selected="false"><span class="cat-emoji">♥</span> Mina favoriter</button>
  </div>
</div>

<!-- POPULAR / FEATURED -->
<section class="section" id="popular">
  <div class="section-header reveal">
    <h2>Populära resmål</h2>
    <p>De resmål som svenska familjer bokar om och om igen. Testat, godkänt och barngaranterat.</p>
  </div>
  <div class="featured-grid" id="featuredGrid"></div>
</section>

<!-- ALL DESTINATIONS -->
<section class="section dest-section" id="destinations">
  <div class="section-header reveal">
    <h2>Alla resmål</h2>
    <p>Filtrera, sök och sortera tills ni hittar rätt. Klicka på ett resmål för hela guiden.</p>
  </div>
  <div class="dest-toolbar">
    <div class="dest-count"><strong id="destCountNum">30</strong> resmål</div>
    <div class="toolbar-controls">
      <div class="select-wrap">
        <select id="budgetFilter" aria-label="Filtrera på budget">
          <option value="all">Alla budgetar</option>
          <option value="1">€ Budget</option>
          <option value="2">€€ Mellan</option>
          <option value="3">€€€ Premium</option>
        </select>
      </div>
      <div class="select-wrap">
        <select id="sortSelect" aria-label="Sortera">
          <option value="rec">Rekommenderat</option>
          <option value="rating">Högst betyg</option>
          <option value="name">Namn A–Ö</option>
          <option value="budget-asc">Budget: låg → hög</option>
          <option value="budget-desc">Budget: hög → låg</option>
        </select>
      </div>
      <div class="dest-search">
        <span class="dest-search-icon">🔍</span>
        <input type="text" id="destSearch" placeholder="Sök bland resmål..." aria-label="Sök bland resmål">
      </div>
    </div>
  </div>
  <div class="dest-grid" id="destGrid"></div>
</section>

<!-- QUIZ -->
<section class="section quiz-section" id="quiz">
  <div class="quiz-inner">
    <div class="section-header reveal">
      <h2>Vet ni inte vart ni ska?</h2>
      <p>Tre frågor. Trettio sekunder. Så får ni tre resmål som passar just er familj.</p>
    </div>
    <div id="quizBox"></div>
  </div>
</section>

<!-- TIPS -->
<section class="section tips-section" id="tips">
  <div class="tips-inner">
    <div class="section-header reveal">
      <h2>Tips för att resa med barn</h2>
      <p>Sex saker vi lärt oss efter oräkneliga resor med barn i alla åldrar.</p>
    </div>
    <div class="tips-list">
      <div class="tip-item reveal">
        <span class="tip-number">1</span>
        <div class="tip-content">
          <h3>Boka flexibla biljetter</h3>
          <p>Barn ändrar sig. Barn blir sjuka. Barn vägrar plötsligt flyga. Betala alltid lite extra för avbokningsskydd och ombokningsbara biljetter. Du kommer tacka dig själv.</p>
        </div>
      </div>
      <div class="tip-item reveal">
        <span class="tip-number">2</span>
        <div class="tip-content">
          <h3>Packa snacks som om det vore jordens undergång</h3>
          <p>Hungriga barn är arga barn. Ha alltid frukt, kex och favoritgodis i handbagaget. Flygmaten kommer aldrig i tid och restaurangen har alltid stängt.</p>
        </div>
      </div>
      <div class="tip-item reveal">
        <span class="tip-number">3</span>
        <div class="tip-content">
          <h3>Aktivitet på morgonen, vila på eftermiddagen</h3>
          <p>Alla utflykter, museibesök och långa promenader — lägg dem före lunch. Efter lunch blir det pool, strand eller vilostund. Alla mår bättre av det, inklusive er.</p>
        </div>
      </div>
      <div class="tip-item reveal">
        <span class="tip-number">4</span>
        <div class="tip-content">
          <h3>Offline-underhållning på flyget</h3>
          <p>Ladda ner filmer, spel och serier INNAN ni åker. Flygets wifi fungerar aldrig och strömningstjänsterna kräver uppkoppling. Ha hörlurar till alla och en powerbank laddad.</p>
        </div>
      </div>
      <div class="tip-item reveal">
        <span class="tip-number">5</span>
        <div class="tip-content">
          <h3>Sänk ambitionerna</h3>
          <p>En bra dag behöver inte vara en fullspäckad dag. Ett besöksmål per dag räcker. Skippa schemat ibland och låt barnen styra. De bästa minnena uppstår ofta spontant.</p>
        </div>
      </div>
      <div class="tip-item reveal">
        <span class="tip-number">6</span>
        <div class="tip-content">
          <h3>Res i lågsäsong</h3>
          <p>Halva priset, dubbla utrymmet. Maj och september slår juli på alla punkter utom vädret — och det brukar vara bra nog. Mindre köer, billigare hotell, lugnare barn.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- GUIDE TEASER -->
<section class="section" id="guide-teaser">
  <div class="section-header reveal">
    <h2>Guider &amp; topplistor</h2>
    <p>Djupdykningar för varje ålder och färdsätt — och listorna över prylarna som faktiskt håller.</p>
  </div>
  <div class="featured-grid">
    <a class="feat-card reveal" href="/guider/bebisar/" style="text-decoration:none;color:inherit;">
      <div class="feat-card-inner"><h3>🍼 Resa med bebis</h3><p class="feat-desc">Flyg, tåg, bil och buss med barn under ett år — vad som funkar och vad ni kan skippa.</p><div class="feat-meta"><span class="feat-meta-item"><strong>Till guiden →</strong></span></div></div>
    </a>
    <a class="feat-card reveal" href="/topplistor/resevagnar/" style="text-decoration:none;color:inherit;">
      <div class="feat-card-inner"><h3>👶 Bästa resevagnen 2026</h3><p class="feat-desc">Vagnarna som får plats i handbagaget och överlever en hel semester.</p><div class="feat-meta"><span class="feat-meta-item"><strong>Se listan →</strong></span></div></div>
    </a>
    <a class="feat-card reveal" href="/topplistor/bilbarnstol/" style="text-decoration:none;color:inherit;">
      <div class="feat-card-inner"><h3>🚗 Bilbarnstol bäst i test</h3><p class="feat-desc">Fem stolar vi litar på — bakåtvänt, roterbart och utan krångel.</p><div class="feat-meta"><span class="feat-meta-item"><strong>Se listan →</strong></span></div></div>
    </a>
    <a class="feat-card reveal" href="/guider/tonaringar/" style="text-decoration:none;color:inherit;">
      <div class="feat-card-inner"><h3>🎧 Semester med tonåringar</h3><p class="feat-desc">Så planerar ni en resa som även en fjortonåring erkänner var bra.</p><div class="feat-meta"><span class="feat-meta-item"><strong>Till guiden →</strong></span></div></div>
    </a>
  </div>
</section>

<!-- NEWSLETTER -->
<section class="section newsletter">
  <div class="newsletter-inner reveal">
    <div>
      <h2>Ett resmål i månaden, rakt i inkorgen</h2>
      <p>Inga kampanjer, inget spam. Bara ett noggrant utvalt familjeresmål varje månad, med tips ni faktiskt har nytta av. Avsluta när ni vill.</p>
    </div>
    <div>
      <form class="newsletter-form" id="newsletterForm">
        <input type="email" placeholder="din@mejladress.se" aria-label="E-postadress" required>
        <button type="submit" class="btn btn-primary">Jag vill ha den</button>
      </form>
      <p class="newsletter-success" id="newsletterSuccess">Tack! Första resmålet landar inom kort. 🎉</p>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-about">
      <h3>Res med <span>Barn</span></h3>
      <p>Guiden för svenska familjer som vill upptäcka världen tillsammans. Vi har rest med barn sedan de var bebisar och delar med oss av våra bästa tips och erfarenheter. Från Gotland till Tokyo — vi har testat så ni slipper.</p>
    </div>
    <div class="footer-col">
      <h4>Kategorier</h4>
      <a onclick="filterByCategory('beach')">🏖️ Strand &amp; Sol</a>
      <a onclick="filterByCategory('parks')">🎢 Nöjesparker</a>
      <a onclick="filterByCategory('nature')">🏔️ Natur &amp; Äventyr</a>
      <a onclick="filterByCategory('cities')">🏙️ Storstäder</a>
      <a onclick="filterByCategory('winter')">❄️ Vinterresor</a>
      <a onclick="filterByCategory('sweden')">🇸🇪 Sverige</a>
    </div>
    <div class="footer-col">
      <h4>Snabblänkar</h4>
      <a href="/guider/">Guider</a>
      <a href="/topplistor/">Topplistor</a>
      <a href="/om-oss/">Om oss</a>
      <a href="/kontakt/">Kontakt</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2024–2026 Res med Barn</span>
    <span>Gjord med ❤️ för barnfamiljer i Sverige</span>
  </div>
</footer>

<!-- DETAIL VIEW -->
<div class="detail" id="detailView" role="dialog" aria-modal="true" aria-label="Resmålsguide">
  <div id="detailContent"></div>
</div>
<script>
const IMG = id => `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;

const DESTINATIONS = [
  {
    name: "Kreta", country: "Grekland", cat: "beach", catLabel: "Strand & Sol", emoji: "🏖️",
    img: "photo-1507525428034-b723cf961d3e",
    desc: "Kreta har allt en barnfamilj kan önska sig: grunda, kristallklara vikar som Elafonissi, fantastisk mat och antika ruiner som får till och med treåringar att häpna. Vi åkte hit med barnen första gången och har inte hittat något bättre sedan dess.",
    age: "0–12 år", ageMin: 0, ageMax: 12, season: "Maj–Okt", budget: "€€", b: 2, flight: "ca 4 h", rating: 4.8,
    highlights: ["Elafonissi — rosa sand och knädjupt vatten i hundra meter", "Knossos palats — grekisk mytologi som fastnar även på småbarn", "Barnvänliga tavernor precis överallt, med grillad halloumi som räddar varje middag"],
    tip: "Hyr bil. Bussarna går sällan och de bästa stränderna ligger utspridda över hela ön.",
    featured: true
  },
  {
    name: "Mallorca", country: "Spanien", cat: "beach", catLabel: "Strand & Sol", emoji: "🏖️",
    img: "photo-1512753360435-329c4535a9a7",
    desc: "Glöm partystämpeln. Mallorcas norra del är rent familjemagiskt — stenbyar, turkost vatten och barnmenyer på varje restaurang. Serra de Tramuntana bjuder dessutom på vandringar som funkar med bärstol.",
    age: "0–15 år", ageMin: 0, ageMax: 15, season: "Apr–Okt", budget: "€€", b: 2, flight: "ca 3,5 h", rating: 4.7,
    highlights: ["Port de Pollença — lugn, långgrund familjebukt", "Trätåget till Sóller — en attraktion i sig", "Grottorna i Drach — räddaren när regnet kommer"],
    tip: "Norra delen är familjedelen. Undvik Magaluf, punkt."
  },
  {
    name: "Algarve", country: "Portugal", cat: "beach", catLabel: "Strand & Sol", emoji: "🏖️",
    img: "photo-1596394516093-501ba68a0ba6",
    desc: "Enorma sandstränder, grottor att utforska med båt och fish & chips för halva priset mot Sverige. Albufeira har vattenpark, Lagos har charm. Perfekt mix av avkoppling och äventyr.",
    age: "2–14 år", ageMin: 2, ageMax: 14, season: "Maj–Sep", budget: "€€", b: 2, flight: "ca 4,5 h", rating: 4.6,
    highlights: ["Båttur till Benagil-grottan — barnen pratar om den i veckor", "Zoomarine i Albufeira — delfiner och vattenland i ett", "Praia da Marinha — stranden från alla vykort"],
    tip: "Atlanten är kallare än ni tror. Välj lagunstränder som Praia de Alvor för de minsta."
  },
  {
    name: "Sardinien", country: "Italien", cat: "beach", catLabel: "Strand & Sol", emoji: "🏖️",
    img: "photo-1544551763-46a013bb70d5",
    desc: "Karibiskt vatten fast fyra timmar från Arlanda. Costa Smeralda är dyrt men resten av ön är överkomligt. Stranden La Pelosa vid Stintino? Barnen vägrade åka därifrån.",
    age: "0–12 år", ageMin: 0, ageMax: 12, season: "Jun–Sep", budget: "€€–€€€", b: 2.5, flight: "ca 4 h", rating: 4.7,
    highlights: ["La Pelosa — Karibien på europeisk mark", "Neptungrottan vid Alghero — trappan ner är ett äventyr", "Italiensk gelato. Varje dag. Utan dåligt samvete."],
    tip: "Boka boende tidigt — ön säljer slut i juli. Juni och september är dessutom billigare och svalare."
  },
  {
    name: "Koh Lanta", country: "Thailand", cat: "beach", catLabel: "Strand & Sol", emoji: "🏖️",
    img: "photo-1528181304800-259b08848526",
    desc: "Thailands lugna familjeö. Inga fullmånefester, bara långgrunda stränder, billiga thairätter och barnvänliga resorts. Lång resa dit men varje timme värd det.",
    age: "2–15 år", ageMin: 2, ageMax: 15, season: "Nov–Mar", budget: "€€", b: 2, flight: "ca 13 h", rating: 4.6,
    highlights: ["Long Beach — långgrunt i flera kilometer", "Snorkelutflykt till Koh Rok — akvarium på riktigt", "Nattmarknaden i Saladan — mango sticky rice till allt"],
    tip: "Ta nattflyget. Barnen sover bort halva resan och ni landar med jetlaggen halvt avklarad."
  },
  {
    name: "Disneyland Paris", country: "Frankrike", cat: "parks", catLabel: "Nöjesparker", emoji: "🎢",
    img: "photo-1597466599360-3b9775841aec",
    desc: "Det magiska som Disney levererar är svårt att matcha. Barnen glömmer att de har jetlag redan vid entrén. Boka hotell i parken om du kan — morgonöppningen före alla andra är guld värd.",
    age: "3–12 år", ageMin: 3, ageMax: 12, season: "Mar–Jun, Sep", budget: "€€€", b: 3, flight: "ca 2,5 h", rating: 4.5,
    highlights: ["Extra Magic Time — parken nästan tom, bara för hotellgäster", "Paraden — bättre än ni minns den", "Avengers Campus och Star Wars för de äldre barnen"],
    tip: "Ladda ner appen och köp Premier Access till två–tre åk. Värt varenda euro.",
    featured: true
  },
  {
    name: "Legoland Billund", country: "Danmark", cat: "parks", catLabel: "Nöjesparker", emoji: "🎢",
    img: "photo-1587654780291-39c9404d746b",
    desc: "Klassikern. Miniland imponerar på alla åldrar och de nya åkattraktionerna har lyft parken rejält. Kombinera med Lalandia bredvid för en komplett vecka med badland och Lego.",
    age: "2–12 år", ageMin: 2, ageMax: 12, season: "Maj–Sep", budget: "€€", b: 2, flight: "ca 1,5 h", rating: 4.5,
    highlights: ["Miniland — 20 miljoner bitar, vuxna fastnar längst", "Lalandia vägg i vägg — Skandinaviens största badland", "Peppa Pig Park för de allra minsta"],
    tip: "Två dagar i parken räcker. Lägg badlandsdagen i mitten så orkar alla."
  },
  {
    name: "Europa-Park", country: "Tyskland", cat: "parks", catLabel: "Nöjesparker", emoji: "🎢",
    img: "photo-1560713781-d00f6c18f388",
    desc: "Europas bästa nöjespark enligt i princip alla rankingar, och efter ett besök förstår man varför. Enormt utbud för alla åldrar, från karuseller till berg-och-dalbanor som slår Liseberg.",
    age: "3–16 år", ageMin: 3, ageMax: 16, season: "Apr–Okt", budget: "€€", b: 2, flight: "ca 2 h + bil", rating: 4.8,
    highlights: ["15 temaområden byggda som europeiska länder", "Wodan — träbanan som toppar entusiasternas listor", "Rulantica — vattenvärlden intill, värd en egen dag"],
    tip: "Bo på något av parkens hotell. Morgonköerna är hälften så långa som mitt på dagen."
  },
  {
    name: "Liseberg", country: "Göteborg, Sverige", cat: "parks", catLabel: "Nöjesparker", emoji: "🎢",
    img: "photo-1506461883276-594a12b11cf3",
    desc: "Sverigesvängen. Kaniner för de små, Helix för de stora, och atmosfären slår de flesta europeiska parkerna. Jul på Liseberg är dessutom en helt egen upplevelse.",
    age: "1–16 år", ageMin: 1, ageMax: 16, season: "Jun–Aug, Dec", budget: "€", b: 1, flight: "tåg/bil", rating: 4.4,
    highlights: ["Helix i mörkret — sista åket innan stängning", "Kaninlandet — perfekt skalat för småbarn", "Jul på Liseberg — en egen årstid"],
    tip: "Åk på vardagar utanför industrisemestern. Halva köerna, samma park."
  },
  {
    name: "Tivoli", country: "Köpenhamn, Danmark", cat: "parks", catLabel: "Nöjesparker", emoji: "🎢",
    img: "photo-1513622470522-26c3c8a854bc",
    desc: "Världens näst äldsta nöjespark mitt i stan. Charmigt, vackert och perfekt storlek för en dag med barn. Kvällsbelysningen är magisk — stanna tills det mörknar.",
    age: "2–14 år", ageMin: 2, ageMax: 14, season: "Apr–Sep, Dec", budget: "€€", b: 2, flight: "ca 1 h / tåg", rating: 4.4,
    highlights: ["Rutschebanen från 1914 — träklassikern med bromsförare ombord", "Kvällsbelysningen — tusentals lampor när mörkret faller", "Pantomimteatern — gratis föreställningar varje kväll"],
    tip: "Kom vid 15 och stanna till stängning. Tivoli är som bäst i mörker."
  },
  {
    name: "Lofoten", country: "Norge", cat: "nature", catLabel: "Natur & Äventyr", emoji: "🏔️",
    img: "photo-1537519646099-335112f03225",
    desc: "Dramatiska berg som stupar rakt ner i havet. Kajaka mellan fiskebyar, vandra med utsikt som inte känns verklig. Barnen älskade att se havsörnar från båten.",
    age: "5–16 år", ageMin: 5, ageMax: 16, season: "Jun–Aug", budget: "€€€", b: 3, flight: "ca 3 h + bil", rating: 4.7,
    highlights: ["Kajakpaddling mellan röda rorbuar", "Havsörnssafari från Svolvær", "Midnattssol i juni–juli — barnen fattar ingenting, på bästa sätt"],
    tip: "Boka en rorbu, en gammal fiskarstuga. Halva upplevelsen är boendet."
  },
  {
    name: "Dolomiterna", country: "Italien", cat: "nature", catLabel: "Natur & Äventyr", emoji: "🏔️",
    img: "photo-1551632811-561732d1e306",
    desc: "Alpernas vackraste hörn. Vandringsleder anpassade för barn, rifugios med pasta, och bergstoppar som ser ut som en fantasyroman. Funkar överraskande bra med småbarn i bärstol.",
    age: "3–16 år", ageMin: 3, ageMax: 16, season: "Jun–Sep", budget: "€€", b: 2, flight: "ca 2,5 h + bil", rating: 4.8,
    highlights: ["Linbanor som lyfter hela familjen till vandringshöjd", "Rifugios — pasta och paus på 2 000 meter", "Tre Cime — ikonen som går att gå runt med barn"],
    tip: "Basera er i Val Gardena. Flest familjeleder, flest linbanor, bäst pizzor."
  },
  {
    name: "Azorerna", country: "Portugal", cat: "nature", catLabel: "Natur & Äventyr", emoji: "🏔️",
    img: "photo-1526139334526-f591a54b477c",
    desc: "Europas bäst bevarade hemlighet. Vulkankratrar, varmkällor, delfinsafari och en grönska som slår Irland. Nästan inga turister jämfört med det mesta andra.",
    age: "4–16 år", ageMin: 4, ageMax: 16, season: "Jun–Sep", budget: "€€", b: 2, flight: "ca 5,5 h", rating: 4.6,
    highlights: ["Delfin- och valsafari — nästan garanterat napp", "Varma källor i Furnas — bada i 38 grader mitt i naturen", "Kratersjöarna vid Sete Cidades — en blå, en grön"],
    tip: "Vädret byter sig fyra gånger om dagen. Packa lager, inte paraply."
  },
  {
    name: "Costa Rica", country: "Centralamerika", cat: "nature", catLabel: "Natur & Äventyr", emoji: "🏔️",
    img: "photo-1518709766631-a6a7f45921c3",
    desc: "Sengångare i trädtopparna, zipline genom regnskog och vulkaner man kan vandra upp till. Pura Vida-attityden smittar av sig på hela familjen. Vårt bästa äventyrsval hittills.",
    age: "5–16 år", ageMin: 5, ageMax: 16, season: "Dec–Apr", budget: "€€€", b: 3, flight: "ca 14 h", rating: 4.9,
    highlights: ["Sengångare och apor i Manuel Antonio", "Zipline genom molnskogen i Monteverde", "Vulkanen Arenal med varma källor vid foten"],
    tip: "Hyr bil med hög markfrigång. Vägarna är ett äventyr i sig — räkna med dubbel restid.",
    featured: true
  },
  {
    name: "Slovenien", country: "Europa", cat: "nature", catLabel: "Natur & Äventyr", emoji: "🏔️",
    img: "photo-1573155993874-d5d48af862ba",
    desc: "Lilla landet som har allt: Alpvandring, grottor, Adriatiska kusten och Ljubljana som en miniatyr-Prag. Otroligt prisvärt och noll köer överallt.",
    age: "3–15 år", ageMin: 3, ageMax: 15, season: "Maj–Sep", budget: "€", b: 1, flight: "ca 2 h", rating: 4.6,
    highlights: ["Rodda ut till ön i Bledsjön och ring i lyckoklockan", "Postojna-grottan — man åker tåg in i berget", "Ljubljanas bilfria centrum — barnvagnsparadis"],
    tip: "Hela landet på en vecka funkar fint. Inget ligger mer än två timmar bort."
  },
  {
    name: "London", country: "England", cat: "cities", catLabel: "Storstäder", emoji: "🏙️",
    img: "photo-1513635269975-59663e0ac1ad",
    desc: "Natural History Museum ensamt gör resan värd det — och det är gratis. Lägg till Harry Potter-studion, Camden Market och dubbeldäckarbussar. Barnen får sin kulturkick utan att märka det.",
    age: "4–16 år", ageMin: 4, ageMax: 16, season: "Apr–Jun, Sep", budget: "€€€", b: 3, flight: "ca 2,5 h", rating: 4.6,
    highlights: ["Natural History Museum — dinosaurier, gratis entré", "Harry Potter Studio Tour — magi även för vuxna", "Dubbeldäckare, rad ett på övervåningen. Alltid."],
    tip: "Boka Harry Potter-studion månader i förväg. Den säljer alltid slut, alltid."
  },
  {
    name: "Barcelona", country: "Spanien", cat: "cities", catLabel: "Storstäder", emoji: "🏙️",
    img: "photo-1583422409516-2895a77efded",
    desc: "Gaudís byggnader är som att kliva in i en saga. Park Güell, Barceloneta-stranden på eftermiddagen, tapas till middag. Staden har en energi som funkar för alla åldrar.",
    age: "3–16 år", ageMin: 3, ageMax: 16, season: "Apr–Jun, Sep–Okt", budget: "€€", b: 2, flight: "ca 3,5 h", rating: 4.6,
    highlights: ["Park Güell — Gaudí genom barnögon", "Barceloneta på eftermiddagen — storstad och strand samma dag", "Camp Nou för de fotbollsfrälsta"],
    tip: "Sagrada Família: boka tid online och skippa kön. Barnens ljudguide är förvånansvärt bra."
  },
  {
    name: "Tokyo", country: "Japan", cat: "cities", catLabel: "Storstäder", emoji: "🏙️",
    img: "photo-1540959733332-eab4deabeeaf",
    desc: "Kulturkrocken som barn älskar. Robotrestauranger, Pokémon Center, Shibuya-korsningen, och den bästa maten i världen. Otroligt rent och säkert. Dyrt men oförglömligt.",
    age: "5–16 år", ageMin: 5, ageMax: 16, season: "Mar–Maj, Okt–Nov", budget: "€€€", b: 3, flight: "ca 14 h", rating: 4.9,
    highlights: ["Pokémon Center och Nintendo Tokyo i Shibuya", "teamLab Planets — konst man vadar genom", "Shinkansen-dagstur till Hakone med Fuji-vy"],
    tip: "Skaffa Suica-kort till alla direkt på flygplatsen. Tunnelbanan går från stress till nöje."
  },
  {
    name: "New York", country: "USA", cat: "cities", catLabel: "Storstäder", emoji: "🏙️",
    img: "photo-1496442226666-8d4d0e62e6e9",
    desc: "Central Park, Frihetsgudinnan, Broadway-shower och pizza på varje hörn. Intensivt och utmattande men det finns en anledning till att alla vill dit minst en gång.",
    age: "6–16 år", ageMin: 6, ageMax: 16, season: "Apr–Jun, Sep–Okt", budget: "€€€", b: 3, flight: "ca 8,5 h", rating: 4.5,
    highlights: ["Central Park — hyr cyklar och gör en förmiddag av det", "Intrepid — ett riktigt hangarfartyg mitt i stan", "Broadway-matiné — barnversionerna håller världsklass"],
    tip: "Bo i Midtown West. Gångavstånd till det mesta, tunnelbana till resten."
  },
  {
    name: "Amsterdam", country: "Nederländerna", cat: "cities", catLabel: "Storstäder", emoji: "🏙️",
    img: "photo-1534351590666-13e3e96b5017",
    desc: "Platt, cykelvänligt och fullt av grachter att upptäcka med båt. NEMO Science Museum är fantastiskt för barn, och pannkakor till lunch varje dag? Inga protester hemifrån.",
    age: "3–14 år", ageMin: 3, ageMax: 14, season: "Apr–Sep", budget: "€€", b: 2, flight: "ca 2 h", rating: 4.5,
    highlights: ["NEMO Science Museum — fem våningar att pilla på allt", "Kanalbåt — barnens favorittransport", "Vondelpark — lekplatser och pannkakshus"],
    tip: "Hyr cyklar med barnsits eller lådcykel. Staden är bokstavligen byggd för det."
  },
  {
    name: "Lappland", country: "Sverige", cat: "winter", catLabel: "Vinterresor", emoji: "❄️",
    img: "photo-1531366936337-7c912a4589a7",
    desc: "Hundspann, norrsken, snöskoter och tomtens hemvist. Magiskt för barn i alla åldrar, men klä er ordentligt — minus 25 skämtar inte.",
    age: "3–16 år", ageMin: 3, ageMax: 16, season: "Dec–Mar", budget: "€€–€€€", b: 2.5, flight: "ca 1,5 h", rating: 4.8,
    highlights: ["Hundspann genom tyst vinterskog", "Norrsken — med lite tur och tålamod", "Icehotel i Jukkasjärvi — värt ett besök även utan övernattning"],
    tip: "Hyr overaller och vinterkängor på plats. Köp inte hem utrustning ni använder en vecka."
  },
  {
    name: "Österrikiska Alperna", country: "Österrike", cat: "winter", catLabel: "Vinterresor", emoji: "❄️",
    img: "photo-1551524559-8af4e6624178",
    desc: "Perfekta skidorter för familjer: Serfaus-Fiss-Ladis, Sölden, Schladming. Skidskolor som tar hand om barnen på förmiddagen medan ni kör egna åk. Après-ski med kakao istället för öl.",
    age: "3–16 år", ageMin: 3, ageMax: 16, season: "Dec–Mar", budget: "€€€", b: 3, flight: "ca 2,5 h + transfer", rating: 4.7,
    highlights: ["Serfaus — bilfri by med egen liten tunnelbana", "Skidskolor i världsklass, barnen lär sig på tre dagar", "Kälkbanor i mörker — kvällens höjdpunkt"],
    tip: "Boka skidskolan veckor i förväg. De bästa instruktörerna blir fullbokade först."
  },
  {
    name: "Tromsø", country: "Norge", cat: "winter", catLabel: "Vinterresor", emoji: "❄️",
    img: "photo-1483347756197-71ef80e95f73",
    desc: "Norrskenets huvudstad. Kombinera med valsafari i januari-februari och hundspann på fjället. Barnen pratar fortfarande om den gången himlen blev grön.",
    age: "5–16 år", ageMin: 5, ageMax: 16, season: "Nov–Feb", budget: "€€€", b: 3, flight: "ca 3 h", rating: 4.6,
    highlights: ["Norrskensjakt med guide som hittar hålen i molnen", "Valsafari i januari–februari", "Fjellheisen-linbanan i skymningen"],
    tip: "Lägg norrskensturen första kvällen. Då finns fler chanser om molnen strular."
  },
  {
    name: "Rovaniemi", country: "Finland", cat: "winter", catLabel: "Vinterresor", emoji: "❄️",
    img: "photo-1545558014-8692077e9b5c",
    desc: "Jultomtens officiella hemstad. Santa Claus Village är genuint magiskt för de yngre barnen. Husky- och rensafari ingår i standardpaketen. Räkna med att aldrig kunna toppa julklappen.",
    age: "2–10 år", ageMin: 2, ageMax: 10, season: "Dec–Feb", budget: "€€€", b: 3, flight: "ca 2 h", rating: 4.7,
    highlights: ["Santa Claus Village — tomten, på riktigt, året om", "Rensläde genom snötyngd skog", "Korsa polcirkeln till fots — diplom ingår"],
    tip: "December för julmagin, februari för bättre snö och kortare köer till tomten.",
    featured: true
  },
  {
    name: "Chamonix", country: "Frankrike", cat: "winter", catLabel: "Vinterresor", emoji: "❄️",
    img: "photo-1418985991508-e47386d96a71",
    desc: "Mont Blanc som kuliss, världsklass på skidåkning och en mysig alpin by att strosa i efter pistorna. Mer avancerat, bäst för familjer med äldre barn som redan kan stå på skidor.",
    age: "8–16 år", ageMin: 8, ageMax: 16, season: "Dec–Mar", budget: "€€€", b: 3, flight: "ca 2 h + transfer", rating: 4.5,
    highlights: ["Aiguille du Midi — linbana till 3 842 meter", "Mer de Glace — glaciären med istunnel", "Skidåkning med Mont Blanc i blickfånget hela dagen"],
    tip: "Med yngre barn: välj Les Houches-området. Lugnare backar, samma vy."
  },
  {
    name: "Gotland", country: "Sverige", cat: "sweden", catLabel: "Sverige", emoji: "🇸🇪",
    img: "photo-1560089168-6516081f5bf1",
    desc: "Sveriges egen semesterö. Visby inom murarna, Fårö med raukarna, och stränderna vid Tofta. Barnen cyklar fritt, alla äter glass och tempot går ner till noll. Sommar som den ska vara.",
    age: "0–16 år", ageMin: 0, ageMax: 16, season: "Jun–Aug", budget: "€–€€", b: 1.5, flight: "45 min / färja", rating: 4.7,
    highlights: ["Visby ringmur och rosorna i varje gränd", "Raukarna på Fårö — stenskulpturer av naturen själv", "Kneippbyn — Pippi Långstrumps riktiga villa"],
    tip: "Tar ni bilen: boka färjan tidigt. Sommarturerna säljer slut långt i förväg."
  },
  {
    name: "Astrid Lindgrens Värld", country: "Vimmerby, Sverige", cat: "sweden", catLabel: "Sverige", emoji: "🇸🇪",
    img: "photo-1509356843151-3e7d96241e11",
    desc: "Pippi, Emil och Karlsson — allt kommer till liv. Teatern i parken är förvånansvärt bra och Bullerbyn-stugan gör vuxna tårögda. Obligatoriskt minst en gång för svenska barnfamiljer.",
    age: "2–10 år", ageMin: 2, ageMax: 10, season: "Jun–Aug", budget: "€", b: 1, flight: "bil / tåg", rating: 4.6,
    highlights: ["Pippi-föreställningen — kom i god tid, gräset fylls snabbt", "Bullerbyn — nostalgi som tar även vuxna", "Katthult med Emils snickerbod (och nya hyss)"],
    tip: "Bo på campingen intill. Barnen orkar två dagar i parken, lätt."
  },
  {
    name: "Kolmården", country: "Norrköping, Sverige", cat: "sweden", catLabel: "Sverige", emoji: "🇸🇪",
    img: "photo-1546182990-dffeafbe841d",
    desc: "Sveriges bästa djurpark med safari, tropikarium och riktigt bra nyheter varje säsong. Wildfire-berg-och-dalbanan satte en ny standard. Perfekt tvådagarsutflykt från Stockholm.",
    age: "1–14 år", ageMin: 1, ageMax: 14, season: "Maj–Sep", budget: "€–€€", b: 1.5, flight: "1,5 h från Sthlm", rating: 4.5,
    highlights: ["Safari med linbana över savannen", "Wildfire — för de modiga längre barnen", "Bamses värld — allt de minsta behöver"],
    tip: "Kom till öppning. Djuren är piggast på morgonen och köerna kortast."
  },
  {
    name: "Höga Kusten", country: "Ångermanland, Sverige", cat: "sweden", catLabel: "Sverige", emoji: "🇸🇪",
    img: "photo-1441974231531-c6227db76b6e",
    desc: "UNESCO-världsarv med stigar, klippor och Skuleskogen. Höga Kusten-leden har etapper som funkar med barn. Sverige på riktigt, utan folkmassor. Känslan av att vara först på platsen.",
    age: "6–16 år", ageMin: 6, ageMax: 16, season: "Jun–Sep", budget: "€", b: 1, flight: "bil / tåg", rating: 4.6,
    highlights: ["Skuleberget — linbana upp, vandring ner", "Trysunda — skärgårdsidyll utan bilar", "Slåttdalsskrevan — 40 meter djup spricka rakt genom berget"],
    tip: "Tälta nästan var som helst. Allemansrätten är världens bästa reseförmån."
  },
  {
    name: "Stockholms skärgård", country: "Sverige", cat: "sweden", catLabel: "Sverige", emoji: "🇸🇪",
    img: "photo-1508189860359-777d945909ef",
    desc: "24 000 öar. Vaxholm på dagstur eller hyr stuga på Sandhamn för en vecka. Barnen badar, fiskar och hoppar från klippor. Funktionell semester utan flygstress.",
    age: "0–16 år", ageMin: 0, ageMax: 16, season: "Jun–Aug", budget: "€–€€", b: 1.5, flight: "båt från Sthlm", rating: 4.7,
    highlights: ["Vaxholm — enklaste dagsturen med barn", "Hyr stuga på Sandhamn eller Utö en hel vecka", "Klippbad från morgon till kväll"],
    tip: "Waxholmsbolagets båtluffarkort är skärgårdens interrail. Öhoppa en hel vecka."
  }
];

/* ============ STATE ============ */
let activeFilter = 'all';
let searchQuery = '';
let budgetMax = 'all';
let sortBy = 'rec';
let favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem('rmb-favs') || '[]')); } catch (e) {}

const slug = s => s.toLowerCase().replace(/å|ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const bySlug = s => DESTINATIONS.find(d => slug(d.name) === s);
const esc = s => s.replace(/</g, '&lt;');

/* ============ HELPERS ============ */
function mediaHTML(d, cls) {
  return `<div class="card-media ${cls || ''}" data-cat="${d.cat}" data-emoji="${d.emoji}">
    <img src="${IMG(d.img)}" alt="${esc(d.name)}" loading="lazy"
      onerror="this.parentElement.classList.add('img-fallback'); this.remove();">
  </div>`;
}

function heartSVG() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="heart-path" d="M12 21s-7.5-4.9-9.8-9.2C.7 8.9 2.2 5.4 5.5 4.6c2-.5 4 .3 5.2 2 .3.4.9.4 1.2 0 1.2-1.7 3.2-2.5 5.2-2 3.3.8 4.8 4.3 3.3 7.2C18.1 16.1 12 21 12 21z"/></svg>`;
}

function hl(text) {
  const q = searchQuery.trim();
  if (!q) return esc(text);
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return esc(text).replace(new RegExp(`(${safe})`, 'gi'), '<mark>$1</mark>');
}

function saveFavs() {
  try { localStorage.setItem('rmb-favs', JSON.stringify([...favs])); } catch (e) {}
  const el = document.getElementById('favCount');
  el.textContent = favs.size || '';
}

function toggleFav(name, ev) {
  if (ev) ev.stopPropagation();
  favs.has(name) ? favs.delete(name) : favs.add(name);
  saveFavs();
  document.querySelectorAll(`[data-fav="${CSS.escape(name)}"]`).forEach(btn => {
    btn.classList.toggle('faved', favs.has(name));
    if (btn.classList.contains('btn-ghost')) {
      btn.querySelector('.fav-label').textContent = favs.has(name) ? 'Sparad som favorit' : 'Spara som favorit';
    }
  });
  if (activeFilter === 'favs') renderDestinations();
}

function showFavorites() {
  setFilterPill('favs');
  activeFilter = 'favs';
  renderDestinations();
  closeMenu();
  document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
}

/* ============ HERO COLLAGE ============ */
function renderCollage() {
  const picks = ['Kreta', 'Tokyo', 'Lappland', 'Dolomiterna'].map(n => DESTINATIONS.find(d => d.name === n));
  document.getElementById('heroCollage').innerHTML = picks.map(d => `
    <div class="col-img card-media" data-cat="${d.cat}" data-emoji="${d.emoji}">
      <img src="${IMG(d.img)}" alt="" onerror="this.parentElement.classList.add('img-fallback'); this.remove();">
      <span class="col-tag">${d.emoji} ${d.name}</span>
    </div>`).join('');
}

/* ============ FEATURED ============ */
function renderFeatured() {
  const featured = DESTINATIONS.filter(d => d.featured);
  document.getElementById('featuredGrid').innerHTML = featured.map(d => `
    <article class="feat-card reveal" onclick="openDetail('${slug(d.name)}')">
      ${mediaHTML(d)}
      <span class="feat-badge">${d.emoji} ${d.catLabel}</span>
      <button class="fav-heart ${favs.has(d.name) ? 'faved' : ''}" data-fav="${esc(d.name)}" aria-label="Spara ${esc(d.name)} som favorit" onclick="toggleFav('${esc(d.name)}', event)">${heartSVG()}</button>
      <div class="feat-card-inner">
        <h3>${esc(d.name)}</h3>
        <p class="feat-country">${esc(d.country)}</p>
        <p class="feat-desc">${esc(d.desc)}</p>
        <div class="feat-meta">
          <span class="feat-meta-item">👶 <strong>${d.age}</strong></span>
          <span class="feat-meta-item">📅 <strong>${d.season}</strong></span>
          <span class="feat-meta-item">💰 <strong>${d.budget}</strong></span>
          <span class="feat-meta-item">⭐ <strong>${d.rating}</strong></span>
        </div>
      </div>
    </article>`).join('');
}

/* ============ DESTINATION GRID ============ */
function getFiltered() {
  let list = DESTINATIONS.filter(d => {
    const matchesCat = activeFilter === 'all' || (activeFilter === 'favs' ? favs.has(d.name) : d.cat === activeFilter);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.desc.toLowerCase().includes(q) ||
      d.catLabel.toLowerCase().includes(q);
    const matchesBudget = budgetMax === 'all' || d.b <= Number(budgetMax);
    return matchesCat && matchesSearch && matchesBudget;
  });

  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'sv'),
    rating: (a, b) => b.rating - a.rating,
    'budget-asc': (a, b) => a.b - b.b,
    'budget-desc': (a, b) => b.b - a.b
  };
  if (sorters[sortBy]) list = [...list].sort(sorters[sortBy]);
  return list;
}

function renderDestinations() {
  const grid = document.getElementById('destGrid');
  const filtered = getFiltered();
  document.getElementById('destCountNum').textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = activeFilter === 'favs' && favs.size === 0
      ? `<div class="no-results"><p>Inga favoriter ännu</p><span>Klicka på hjärtat på ett resmål så samlas de här.</span></div>`
      : `<div class="no-results"><p>Inga resmål hittades</p><span>Prova att ändra filter eller sökord</span></div>`;
    return;
  }

  grid.innerHTML = filtered.map((d, i) => `
    <article class="dest-card reveal" data-cat="${d.cat}" style="transition-delay: ${Math.min(i * 40, 400)}ms" onclick="openDetail('${slug(d.name)}')">
      ${mediaHTML(d)}
      <span class="dest-cat-chip" data-cat="${d.cat}">${d.catLabel}</span>
      <button class="fav-heart ${favs.has(d.name) ? 'faved' : ''}" data-fav="${esc(d.name)}" aria-label="Spara ${esc(d.name)} som favorit" onclick="toggleFav('${esc(d.name)}', event)">${heartSVG()}</button>
      <div class="dest-card-body">
        <div class="dest-card-top">
          <h3>${hl(d.name)}</h3>
          <span class="dest-card-budget">${d.budget}</span>
        </div>
        <p class="dest-country">${hl(d.country)}</p>
        <p class="dest-desc">${esc(d.desc)}</p>
        <div class="dest-card-meta">
          <span class="meta-tag">👶 <strong>${d.age}</strong></span>
          <span class="meta-tag">📅 <strong>${d.season}</strong></span>
          <span class="meta-tag">✈️ <strong>${d.flight}</strong></span>
          <span class="meta-tag">⭐ <strong>${d.rating}</strong></span>
        </div>
      </div>
    </article>`).join('');

  initReveal();
}

/* ============ DETAIL VIEW ============ */
let lastScrollY = 0;

function openDetail(s, pushHash = true) {
  const d = bySlug(s);
  if (!d) return;
  const similar = DESTINATIONS.filter(x => x.cat === d.cat && x.name !== d.name).slice(0, 4);

  document.getElementById('detailContent').innerHTML = `
    <button class="detail-back" onclick="closeDetail()">← Alla resmål</button>
    <button class="detail-close" onclick="closeDetail()" aria-label="Stäng">✕</button>
    <div class="detail-hero">
      ${mediaHTML(d)}
      <div class="detail-title-wrap">
        <span class="d-chip" style="background: var(--cat-${d.cat})">${d.emoji} ${d.catLabel}</span>
        <h2>${esc(d.name)}</h2>
        <p class="d-country">${esc(d.country)} · ⭐ ${d.rating} i familjebetyg</p>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-facts">
        <div class="fact"><div class="f-label">Passar åldrar</div><div class="f-value">${d.age}</div></div>
        <div class="fact"><div class="f-label">Bästa säsong</div><div class="f-value">${d.season}</div></div>
        <div class="fact"><div class="f-label">Restid</div><div class="f-value">${d.flight}</div></div>
        <div class="fact"><div class="f-label">Budget</div><div class="f-value">${d.budget}</div></div>
      </div>
      <p class="detail-desc">${esc(d.desc)}</p>
      <h3 class="detail-section-title">Missa inte</h3>
      <ul class="highlights">${d.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      <div class="detail-tip">
        <div class="t-label">Förälder till förälder</div>
        <p>${esc(d.tip)}</p>
      </div>
      <div class="detail-actions">
        <button class="btn btn-ghost ${favs.has(d.name) ? 'faved' : ''}" data-fav="${esc(d.name)}" onclick="toggleFav('${esc(d.name)}', event)">
          ♥ <span class="fav-label">${favs.has(d.name) ? 'Sparad som favorit' : 'Spara som favorit'}</span>
        </button>
        <button class="btn btn-primary" onclick="closeDetail(); setTimeout(() => filterByCategory('${d.cat}'), 100)">Fler inom ${d.catLabel} →</button>
      </div>
      ${similar.length ? `
        <h3 class="detail-section-title">Liknande resmål</h3>
        <div class="similar-grid">
          ${similar.map(x => `
            <div class="similar-card" onclick="openDetail('${slug(x.name)}')">
              ${mediaHTML(x)}
              <div class="sim-body">
                <h4>${esc(x.name)}</h4>
                <p class="sim-country">${esc(x.country)} · ${x.budget}</p>
              </div>
            </div>`).join('')}
        </div>` : ''}
    </div>`;

  const view = document.getElementById('detailView');
  if (!view.classList.contains('open')) lastScrollY = window.scrollY;
  view.scrollTop = 0;
  view.classList.add('open');
  document.body.classList.add('no-scroll');
  if (pushHash) history.pushState({ detail: s }, '', `#resmal/${s}`);
}

function closeDetail(fromPop = false) {
  const view = document.getElementById('detailView');
  if (!view.classList.contains('open')) return;
  view.classList.remove('open');
  document.body.classList.remove('no-scroll');
  if (!fromPop && location.hash.startsWith('#resmal/')) history.pushState('', '', location.pathname + location.search);
  window.scrollTo(0, lastScrollY);
}

window.addEventListener('popstate', () => {
  const m = location.hash.match(/^#resmal\/(.+)$/);
  if (m) openDetail(m[1], false);
  else closeDetail(true);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDetail(); hideSuggestions(); }
});

/* ============ FILTERS ============ */
function setFilterPill(cat) {
  document.querySelectorAll('.cat-pill').forEach(p => {
    const on = p.dataset.filter === cat;
    p.classList.toggle('active', on);
    p.setAttribute('aria-selected', on);
  });
}

document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    activeFilter = pill.dataset.filter;
    setFilterPill(activeFilter);
    renderDestinations();
  });
});

function filterByCategory(cat) {
  activeFilter = cat;
  setFilterPill(cat);
  renderDestinations();
  document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('budgetFilter').addEventListener('change', e => {
  budgetMax = e.target.value;
  renderDestinations();
});
document.getElementById('sortSelect').addEventListener('change', e => {
  sortBy = e.target.value;
  renderDestinations();
});

/* ============ SEARCH ============ */
document.getElementById('destSearch').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderDestinations();
});

const heroInput = document.getElementById('heroSearch');
const sugBox = document.getElementById('suggestions');

function hideSuggestions() { sugBox.classList.remove('open'); }

heroInput.addEventListener('input', () => {
  const q = heroInput.value.trim().toLowerCase();
  if (q.length < 2) { hideSuggestions(); return; }
  const matches = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q) ||
    d.catLabel.toLowerCase().includes(q)
  ).slice(0, 6);
  if (!matches.length) { hideSuggestions(); return; }
  sugBox.innerHTML = matches.map(d => `
    <button class="suggestion" role="option" onclick="hideSuggestions(); openDetail('${slug(d.name)}')">
      <span class="s-emoji">${d.emoji}</span>
      <span>
        <span class="s-name">${esc(d.name)}</span><br>
        <span class="s-meta">${esc(d.country)} · ${d.catLabel} · ${d.budget}</span>
      </span>
    </button>`).join('');
  sugBox.classList.add('open');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.hero-search-wrap')) hideSuggestions();
});

function heroSearchGo() {
  const val = heroInput.value.trim();
  hideSuggestions();
  if (!val) return;
  searchQuery = val;
  document.getElementById('destSearch').value = val;
  activeFilter = 'all';
  setFilterPill('all');
  renderDestinations();
  document.getElementById('destinations').scrollIntoView({ behavior: 'smooth' });
}
heroInput.addEventListener('keydown', e => { if (e.key === 'Enter') heroSearchGo(); });

/* ============ QUIZ ============ */
const QUIZ = [
  {
    q: "Hur gamla är barnen?",
    opts: [
      { emoji: "🍼", label: "0–3 år", sub: "Bebis och småbarn", val: 2 },
      { emoji: "🧒", label: "4–7 år", sub: "Förskoleåldern", val: 5 },
      { emoji: "🎒", label: "8–12 år", sub: "Mellanåldern", val: 10 },
      { emoji: "🎧", label: "13+ år", sub: "Tonåringar", val: 14 }
    ]
  },
  {
    q: "Vad lockar mest?",
    opts: [
      { emoji: "🏖️", label: "Sol och bad", sub: "Strand, pool, glass", val: "beach" },
      { emoji: "🎢", label: "Fart och fläkt", sub: "Åkattraktioner och skratt", val: "parks" },
      { emoji: "🏔️", label: "Natur och äventyr", sub: "Vandring, djur, frisk luft", val: "nature" },
      { emoji: "🏙️", label: "Storstadspuls", sub: "Museer, mat, myller", val: "cities" },
      { emoji: "❄️", label: "Snö och vinter", sub: "Skidor, norrsken, tomten", val: "winter" },
      { emoji: "🇸🇪", label: "Nära hemma", sub: "Sverige räcker gott", val: "sweden" }
    ]
  },
  {
    q: "Hur ser reskassan ut?",
    opts: [
      { emoji: "💰", label: "Budget", sub: "Mycket semester för pengarna", val: 1 },
      { emoji: "💰💰", label: "Mellan", sub: "Lagom av allt", val: 2 },
      { emoji: "💰💰💰", label: "Premium", sub: "Nu unnar vi oss", val: 3 }
    ]
  }
];

let quizStep = 0;
let quizAnswers = [];

function renderQuiz() {
  const box = document.getElementById('quizBox');
  if (quizStep >= QUIZ.length) { renderQuizResults(); return; }
  const q = QUIZ[quizStep];
  box.innerHTML = `
    <div class="quiz-progress">${QUIZ.map((_, i) => `<span class="${i < quizStep ? 'done' : ''}"></span>`).join('')}</div>
    <p class="quiz-q">${q.q}</p>
    <div class="quiz-options">
      ${q.opts.map((o, i) => `
        <button class="quiz-opt" onclick="quizPick(${i})">
          <span class="qo-emoji">${o.emoji}</span>
          <span>${o.label}</span>
          <span class="qo-sub">${o.sub}</span>
        </button>`).join('')}
    </div>
    ${quizStep > 0 ? `<button class="quiz-restart" onclick="quizRestart()">Börja om</button>` : ''}`;
}

function quizPick(i) {
  quizAnswers[quizStep] = QUIZ[quizStep].opts[i].val;
  quizStep++;
  renderQuiz();
}

function quizRestart() {
  quizStep = 0;
  quizAnswers = [];
  renderQuiz();
}

function renderQuizResults() {
  const [age, cat, budget] = quizAnswers;
  const scored = DESTINATIONS.map(d => {
    let score = 0;
    if (d.cat === cat) score += 4;
    if (age >= d.ageMin && age <= d.ageMax) score += 3;
    else if (age >= d.ageMin - 2 && age <= d.ageMax + 2) score += 1;
    if (d.b <= budget) score += 2; else score -= (d.b - budget) * 1.5;
    score += d.rating * 0.5;
    return { d, score };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  document.getElementById('quizBox').innerHTML = `
    <div class="quiz-progress">${QUIZ.map(() => `<span class="done"></span>`).join('')}</div>
    <p class="quiz-result-label">Era tre bästa matchningar</p>
    <div class="quiz-results">
      ${scored.map(({ d }) => `
        <div class="similar-card" onclick="openDetail('${slug(d.name)}')">
          ${mediaHTML(d)}
          <div class="sim-body">
            <h4>${d.emoji} ${esc(d.name)}</h4>
            <p class="sim-country">${esc(d.country)} · ${d.budget} · ⭐ ${d.rating}</p>
          </div>
        </div>`).join('')}
    </div>
    <button class="quiz-restart" onclick="quizRestart()">Gör om quizet</button>`;
}

/* ============ NEWSLETTER ============ */
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  e.target.style.display = 'none';
  document.getElementById('newsletterSuccess').style.display = 'block';
});

/* ============ THEME / MENU / MISC ============ */
function toggleTheme() {
  const html = document.documentElement;
  html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem('rmb-theme', html.getAttribute('data-theme')); } catch (e) {}
}

function toggleMenu() {
  document.querySelector('.hamburger').classList.toggle('open');
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMenu() {
  document.querySelector('.hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
}

window.addEventListener('scroll', () => {
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

/* ============ INIT ============ */
(function init() {
  try {
    const saved = localStorage.getItem('rmb-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}

  renderCollage();
  renderFeatured();
  renderDestinations();
  renderQuiz();
  saveFavs();
  initReveal();

  const m = location.hash.match(/^#resmal\/(.+)$/);
  if (m) openDetail(m[1], false);
})();
</script>
</body>
</html>
