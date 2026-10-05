// SSR loop lab — app + routes for reproducing a guard-driven redirect cycle.
// A `canActivate` guard unconditionally redirects to the same route via
// Router.createUrlTree; nothing in the app terminates the cycle.
import '@angular/compiler'; // JIT compilation for this throwaway lab
import {
  ApplicationConfig,
  Component,
  inject,
  mergeApplicationConfig,
} from '@angular/core';
import {provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideServerRendering} from '@angular/platform-server';
import {provideRouter, Router, RouterOutlet, Routes} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<h1>root shell</h1><router-outlet></router-outlet>',
})
export class RootComponent {}

@Component({
  selector: 'app-ok',
  standalone: true,
  template: '<p>ok page</p>',
})
export class OkComponent {}

@Component({
  selector: 'app-loop',
  standalone: true,
  template: '<p>loop target page</p>',
})
export class LoopComponent {}

// Unconditional redirect cycle: each activation of /loop issues a UrlTree
// redirect back to /loop (classic guard-redirect loop shape).
const loopGuard = () => inject(Router).createUrlTree(['/loop']);
// Same cycle shape via canMatch (runs during recognition).
const loopCanMatch = () => inject(Router).createUrlTree(['/loop-cm']);

export const routes: Routes = [
  {path: '', component: OkComponent},
  {path: 'ok', component: OkComponent},
  {path: 'loop', component: LoopComponent, canActivate: [loopGuard]},
  {path: 'loop-cm', component: LoopComponent, canMatch: [loopCanMatch]},
];

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter(routes)],
};

export function bootstrap(context?: unknown) {
  return bootstrapApplication(
    RootComponent,
    mergeApplicationConfig(appConfig, {providers: [provideServerRendering()]}),
    context as never,
  );
}
