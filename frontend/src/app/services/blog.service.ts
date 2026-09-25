import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Types du contrat avec u2-blog. Les noms sont ceux des records Java
 * (`ArticleSummary`, `ArticleDetail`, `ArticlePage`, `ArticleDraft`) : les
 * renommer d'un seul côté casserait la lecture ou la validation serveur.
 */
export interface ArticleCategory {
  /** Valeur de l'enum Java, à renvoyer telle quelle à la publication. */
  code: string;
  label: string;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  /** Instant ISO 8601, en UTC. */
  publishedAt: string;
  categories: ArticleCategory[];
  /** Chemin relatif servi par la gateway, `null` sans image. */
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  /** Texte brut, mis en forme par `parseArticleBody`. */
  body: string;
}

export interface ArticlePage {
  items: ArticleSummary[];
  /** Numéro de page, à partir de zéro côté API. */
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ArticleDraft {
  title: string;
  excerpt: string;
  body: string;
  author: string;
  /** Codes de rubrique, un à trois. */
  categories: string[];
  /** Obligatoire côté serveur dès qu'une image est jointe. */
  imageAlt: string | null;
}

/**
 * Poids maximal d'une image, identique à `spring.servlet.multipart.max-file-size`.
 * Vérifié avant l'envoi pour épargner à l'auteur le téléversement complet d'un
 * fichier que le serveur refusera.
 */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Formats acceptés par le serveur, qui les reconnaît à leurs octets. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Cause d'une publication refusée, telle que le formulaire doit l'expliquer.
 * Même découpage que `ContactFailure`, plus le cas de l'image trop lourde.
 */
export type PublishFailure =
  /** 400 : le serveur donne la raison, qu'on affiche à l'auteur. */
  | { kind: 'rejected'; detail: string | null }
  /** 413 : le fichier dépasse la limite du serveur. */
  | { kind: 'tooLarge' }
  | { kind: 'offline' }
  | { kind: 'server' };

export function toPublishFailure(error: HttpErrorResponse): PublishFailure {
  if (error.status === 0) {
    return { kind: 'offline' };
  }
  if (error.status === 413) {
    return { kind: 'tooLarge' };
  }
  if (error.status === 400) {
    // Le corps est un Problem Details. Son `detail` est écrit pour être lu
    // (« le titre doit faire entre 5 et 140 caracteres ») : les auteurs sont
    // l'équipe, lui montrer la raison exacte vaut mieux qu'un message vague.
    const body: unknown = error.error;
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body && typeof body.detail === 'string'
        ? body.detail
        : null;
    return { kind: 'rejected', detail };
  }
  return { kind: 'server' };
}

/**
 * Accès au blog servi par u2-blog.
 *
 * URL relatives, comme `ContactService` : en production le site et l'API
 * partagent la gateway, donc l'origine. En développement, `ng serve` passe
 * par `proxy.conf.json`.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);

  private static readonly ARTICLES = '/api/u2/articles';
  private static readonly CATEGORIES = '/api/u2/article-categories';

  /** @param page numéro de page à partir de zéro */
  list(page: number, size = 12): Observable<ArticlePage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ArticlePage>(BlogService.ARTICLES, { params });
  }

  get(slug: string): Observable<ArticleDetail> {
    // encodeURIComponent : le slug vient de l'URL du navigateur, donc de
    // n'importe qui. Un `../` ne doit pas changer le chemin appelé.
    return this.http.get<ArticleDetail>(`${BlogService.ARTICLES}/${encodeURIComponent(slug)}`);
  }

  categories(): Observable<ArticleCategory[]> {
    return this.http.get<ArticleCategory[]>(BlogService.CATEGORIES);
  }

  /**
   * Publie l'article en multipart : le JSON dans la partie `article`, le
   * fichier dans la partie `image`.
   *
   * La partie JSON est un Blob typé `application/json` : sans ce type, Spring
   * ne sait pas la convertir en `ArticleDraft` et répond 415. Aucun en-tête
   * `Content-Type` n'est posé sur la requête, le navigateur doit y écrire
   * lui-même la frontière du multipart.
   */
  publish(draft: ArticleDraft, image: File | null): Observable<ArticleDetail> {
    const body = new FormData();
    body.append('article', new Blob([JSON.stringify(draft)], { type: 'application/json' }));
    if (image) {
      body.append('image', image, image.name);
    }
    return this.http.post<ArticleDetail>(BlogService.ARTICLES, body);
  }
}
