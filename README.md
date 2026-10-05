# Angular SSR — guard-returned redirect cycle (minimal reproduction)

Minimal SSR app showing `@angular/router` restarting navigation forever when a route guard returns a redirect that forms a cycle.

The `/loop` route has `canActivate: [() => inject(Router).createUrlTree(['/loop'])]`. Nothing in the application iterates — the unbounded restarting comes from the router's redirect handling.

## Run (published `@angular/*` 22.2.0, Node 24)

```sh
npm install
npm run build

# control: settles in ~50ms
node dist/server.cjs /ok

# the cycle: never settles; ~100% CPU until killed
node dist/server.cjs /loop

# same shape via canMatch
node dist/server.cjs /loop-cm

# express SSR: one GET /loop starves every other request on the process
node dist/express.cjs &
curl -m 6 http://127.0.0.1:4477/ok       # 200 in ~50ms
curl -m 6 http://127.0.0.1:4477/loop &   # never completes
curl -m 6 http://127.0.0.1:4477/ok       # also times out once /loop is in flight
```

## Expected (fixed) behavior

With a bound on redirect-driven navigation restarts (see the linked issue and fix PR), `GET /loop` settles immediately — development: `NG04016 "Detected possible infinite redirect"`; production: the navigation is stopped — and the server keeps serving other requests.
