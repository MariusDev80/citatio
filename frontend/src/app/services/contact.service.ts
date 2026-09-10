import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Corps envoyé à u1-communication. Les noms de champs sont ceux du record
 * `ContactSubmission` côté Java : les renommer ici casserait la validation
 * serveur, qui rejetterait des champs absents en 400.
 */
export interface ContactSubmission {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  deadline: string;
  message: string;
  /** Consentement RGPD, obligatoire côté serveur. */
  consent: boolean;
  /**
   * Leurre anti-robot. Toujours vide chez un visiteur : le champ est masqué et
   * hors du parcours clavier. Rempli, le serveur écarte la demande en silence.
   */
  website: string;
}

/**
 * Cause d'un envoi en echec, telle que la page doit l'expliquer au visiteur.
 *
 * <p>Un seul etat « erreur » ne suffisait pas : le message affiche etait le meme
 * pour un serveur muet et pour un quota atteint, si bien qu'un visiteur bloque
 * par l'anti-spam lisait « votre message n'est pas parti » sans savoir pourquoi
 * ni quoi faire.
 */
export type ContactFailure =
  /** 429 : quota horaire atteint pour cette connexion. */
  | { kind: 'rateLimited'; retryAfterSeconds: number | null }
  /** Serveur injoignable, hors ligne, requete bloquee. */
  | { kind: 'offline' }
  /** 400 : le serveur a refuse le contenu. Ne devrait pas arriver, le
   *  navigateur valide d'abord ; le signaler plutot que le masquer. */
  | { kind: 'rejected' }
  /** 5xx et tout le reste. */
  | { kind: 'server' };

/**
 * Traduit une reponse HTTP en echec exploitable par la page.
 *
 * <p>`Retry-After` n'est lisible que parce que le serveur l'expose explicitement
 * en CORS (voir CommonWebConfig). S'il manque, on rend `null` et la page
 * retombe sur une formulation sans delai chiffre, plutot que d'inventer une
 * duree.
 */
export function toContactFailure(error: HttpErrorResponse): ContactFailure {
  // status 0 : la requete n'a pas abouti (hors ligne, DNS, blocage).
  if (error.status === 0) {
    return { kind: 'offline' };
  }
  if (error.status === 429) {
    const header = error.headers.get('Retry-After');
    const seconds = header === null ? Number.NaN : Number(header);
    return {
      kind: 'rateLimited',
      retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : null,
    };
  }
  if (error.status === 400) {
    return { kind: 'rejected' };
  }
  return { kind: 'server' };
}

/**
 * Envoi du formulaire de contact vers u1-communication.
 *
 * <p>URL relative et non absolue : en production le site et l'API sont servis
 * par la même gateway Caddy, donc la même origine, et aucun contrôle CORS ne se
 * déclenche. Une URL absolue devrait par ailleurs être connue à la compilation,
 * alors que le domaine appartient à l'infrastructure.
 *
 * <p>En développement avec `ng serve`, l'origine diffère (localhost:4200) :
 * lancer u1-communication avec `CORS_ALLOWED_ORIGINS=http://localhost:4200`,
 * ou passer par un proxy de développement.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  /** Chemin conservé par la gateway (`handle`, pas `handle_path`). */
  private static readonly ENDPOINT = '/api/u1/contact-requests';

  /**
   * Poste la demande. Le serveur répond 202 sans corps : il a enregistré la
   * demande, la notification par email part derrière. Un succès ici veut donc
   * dire « votre message est arrivé », pas « le mail est parti », et c'est
   * exactement ce que la page doit annoncer.
   */
  submit(submission: ContactSubmission): Observable<void> {
    return this.http.post<void>(ContactService.ENDPOINT, submission);
  }
}
