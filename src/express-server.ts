// SSR loop lab — express entry. Standard SSR request handler; a single
// GET /loop should wedge the event loop and starve ALL other requests.
import '@angular/compiler';
import express from 'express';
import {renderApplication} from '@angular/platform-server';
import {bootstrap} from './app';

const document =
  '<html><head></head><body><app-root></app-root></body></html>';
const app = express();
const port = 4477;

app.get('/favicon.ico', (_req, res) => res.status(204).end());

// catch-all handler (express 5: no bare '*' route patterns)
app.use(async (req, res) => {
  const t = Date.now();
  try {
    const html = await renderApplication(bootstrap, {
      document,
      url: req.originalUrl,
    });
    console.log(
      `[srv] ${req.originalUrl} -> 200 in ${Date.now() - t}ms (${html.length}b)`,
    );
    res.status(200).send(html);
  } catch (e) {
    console.log(`[srv] ${req.originalUrl} -> 500: ${e && (e.message || e)}`);
    res.status(500).send('SSR error');
  }
});

app.listen(port, () =>
  console.log(`[srv] listening on ${port} (pid ${process.pid})`),
);
