# Res med Barn — resmedbarn.se

Statisk sajt som byggs från `content.json`. All copy och alla SEO-titlar redigeras i den filen — antingen direkt eller via admin-panelen.

## Struktur

```
content.json        ← all copy + meta titles/descriptions (redigera här)
build.js            ← generator, skapar hela sajten i ./dist
templates/home.html ← startsidan (resmålsutforskaren)
static/styles.css   ← delad CSS för innehållssidor
static/admin.html   ← admin-panelen (→ /admin/)
```

## Cloudflare Pages-inställningar

Ändra i Pages-projektet under **Settings → Builds & deployments**:

| Inställning            | Värde           |
|------------------------|-----------------|
| Build command          | `node build.js` |
| Build output directory | `dist`          |

Varje push till `main` bygger om hela sajten (~15 sek).

## Redigera copy & SEO

1. Öppna **resmedbarn.se/admin/**
2. Ändra titlar/beskrivningar (räknaren varnar vid 60/155 tecken) eller copy
3. Klicka **Ladda ner content.json**
4. Ersätt `content.json` i GitHub-repot (Add file → Upload files)
5. Cloudflare bygger om automatiskt

Admin-panelen är read-only mot sajten (den kan inte skriva något själv) och är noindex + blockad i robots.txt. Vill du ha den privat på riktigt: lägg Cloudflare Access framför `/admin/` (gratis upp till 50 användare).

## Sidstruktur

- `/` — startsida med resmålsutforskaren
- `/guider/` → `/guider/{bebisar,smabarn,barn,tonaringar}/` → `.../{tag,buss,bil,flyg}/`
- `/topplistor/` → `/topplistor/{vagnar,resevagnar,bilbarnstol,tillbehor}/`
- `/om-oss/`, `/kontakt/`
- `/sitemap.xml`, `/robots.txt` genereras automatiskt

## SEO-noteringar (Ahrefs, juli 2026, SE)

Primära keywords per sida ligger inbakade i titlar/H1. Största möjligheterna:

- `resevagn` 7 000/mån KD 0 → /topplistor/resevagnar/
- `bilbarnstol bäst i test` 2 100 KD 7 → /topplistor/bilbarnstol/
- `barnvagn bäst i test` 2 000 KD 1 → /topplistor/vagnar/
- tillbehörsklustret (regnskydd/åkpåse/solskydd/myggnät barnvagn) ~5 000 KD 0–1 → /topplistor/tillbehor/

Framtida sidor värda att bygga: `framåtvänd bilbarnstol` (3 700, KD 0) och `bakåtvänd bilbarnstol` (3 200, KD 4) som egna undersidor, samt `resevagn handbagage` (1 500, KD 0) som egen guide.
