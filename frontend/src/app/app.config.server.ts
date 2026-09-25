import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * `withRoutes(serverRoutes)` est ce qui donne effet à app.routes.server.ts.
 *
 * Il manquait jusqu'à l'arrivée du blog, avec l'ancienne option
 * `"prerender": true` d'angular.json : le build pré-rendait alors toute route
 * sans paramètre trouvée dans le routeur, et les `renderMode` déclarés
 * n'étaient lus par personne. Sans conséquence tant que toutes les pages
 * étaient statiques ; le blog, lui, doit rester hors du pré-rendu, sinon ses
 * requêtes vers l'API partiraient pendant le build.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
