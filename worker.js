/* Res med Barn — minimal edge worker.
   The site is otherwise pure static assets (see wrangler.jsonc). This file
   only exists to 301-redirect the handful of /resmal/ URLs that moved under
   a country folder on 2026-09-30 (see NESTED_COUNTRIES in build.js).
   wrangler.jsonc's assets.run_worker_first lists exactly these paths, so
   this script only ever runs for them — every other request is served
   straight from the ASSETS binding with zero added latency. */

const REDIRECTS = {
  '/resmal/kreta/': '/resmal/grekland/kreta/',
  '/resmal/rhodos/': '/resmal/grekland/rhodos/',
  '/resmal/korfu/': '/resmal/grekland/korfu/',
  '/resmal/mallorca/': '/resmal/spanien/mallorca/',
  '/resmal/barcelona/': '/resmal/spanien/barcelona/',
  '/resmal/costa-blanca/': '/resmal/spanien/costa-blanca/',
  '/resmal/costa-brava/': '/resmal/spanien/costa-brava/',
  '/resmal/disneyland-paris/': '/resmal/frankrike/disneyland-paris/',
  '/resmal/franska-rivieran/': '/resmal/frankrike/franska-rivieran/',
  '/resmal/korsika/': '/resmal/frankrike/korsika/',
  '/resmal/koh-lanta/': '/resmal/thailand/koh-lanta/',
  '/resmal/phuket/': '/resmal/thailand/phuket/',
  '/resmal/ao-nang/': '/resmal/thailand/ao-nang/'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = REDIRECTS[url.pathname];
    if (target) {
      return Response.redirect(url.origin + target, 301);
    }
    // Shouldn't normally be reached (run_worker_first only lists the paths
    // above), but fall through safely to the static assets if it ever is.
    return env.ASSETS.fetch(request);
  }
};
