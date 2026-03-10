import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/**
 * Service centralisé pour gérer les scripts JSON-LD (Schema.org) de manière SSR-compatible.
 *
 * Utilise le token DOCUMENT d'Angular (fonctionne aussi côté serveur pendant le prerendering)
 * pour que les données structurées soient présentes dans le HTML pré-rendu — visible
 * par Googlebot, les LLM et tout autre crawler.
 *
 * Chaque schéma est identifié par une clé unique. Appeler `setSchema` avec la même clé
 * remplace le script précédent, évitant les doublons lors de la navigation.
 */
@Injectable({ providedIn: 'root' })
export class JsonLdService {
  private readonly document = inject(DOCUMENT);
  private readonly scripts = new Map<string, HTMLScriptElement>();

  /**
   * Injecte ou remplace un script JSON-LD dans le <head>.
   * @param key Identifiant unique du schéma (ex: 'organization', 'faq', 'breadcrumb-faq')
   * @param schema Objet JSON-LD à sérialiser
   */
  setSchema(key: string, schema: Record<string, unknown>): void {
    this.removeSchema(key);

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    script.setAttribute('data-jsonld', key);
    this.document.head.appendChild(script);
    this.scripts.set(key, script);
  }

  /** Supprime un script JSON-LD par sa clé. */
  removeSchema(key: string): void {
    const existing = this.scripts.get(key);
    if (existing) {
      existing.remove();
      this.scripts.delete(key);
    }
    // Supprime aussi les scripts injectés côté serveur (SSR/prerender)
    // qui ne sont pas dans la Map mais présents dans le DOM après hydratation.
    this.document.querySelectorAll(`script[data-jsonld="${key}"]`)
      .forEach(el => el.remove());
  }
}
