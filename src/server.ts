// SSR loop lab — server entry. Renders a single URL with the REAL published
// @angular/platform-server pipeline and reports whether the render settles.
// Usage: node dist/server.cjs [url]
import {bootstrap} from './app';

const url = process.argv[2] || '/ok';
const started = Date.now();
console.log(`[lab] renderApplication url=${url} started`);

// Starvation probe: if the event loop is starved by the redirect cycle,
// these ticks stop appearing entirely.
const tick = setInterval(() => {
  const cpu = process.cpuUsage();
  console.log(
    `[lab] alive tick cpu_user=${(cpu.user / 1e6).toFixed(2)}s cpu_sys=${(cpu.system / 1e6).toFixed(2)}s`,
  );
}, 2000);

import('@angular/platform-server').then(({renderApplication}) => {
  renderApplication(bootstrap, {
    document: '<html><head></head><body><app-root></app-root></body></html>',
    url,
  }).then(
    (html) => {
      clearInterval(tick);
      console.log(`[lab] RESOLVED in ${Date.now() - started}ms htmlBytes=${html.length}`);
      process.exit(0);
    },
    (e) => {
      clearInterval(tick);
      console.log(`[lab] REJECTED in ${Date.now() - started}ms: ${e && (e.message || e)}`);
      process.exit(1);
    },
  );
});
