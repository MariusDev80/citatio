import { HttpErrorResponse, HttpHeaders, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ContactService, ContactSubmission, toContactFailure } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const submission: ContactSubmission = {
    name: 'Camille Roy',
    email: 'camille.roy@example.test',
    company: 'Boulangerie Roy',
    projectType: 'Création d’un premier site',
    budget: 'De 1 500 à 2 500 €',
    deadline: 'Dans les 3 mois',
    message: 'Nous voudrions un site vitrine avec nos horaires et nos produits.',
    consent: true,
    website: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('poste sur le chemin routé par la gateway vers u1-communication', () => {
    service.submit(submission).subscribe();

    // Chemin relatif : même origine que le site en production, donc aucun CORS.
    const req = httpMock.expectOne('/api/u1/contact-requests');
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 202, statusText: 'Accepted' });
  });

  it('envoie les champs sous les noms attendus par le record Java', () => {
    service.submit(submission).subscribe();

    const req = httpMock.expectOne('/api/u1/contact-requests');
    // Un renommage ici ferait échouer la validation serveur en 400, sans que
    // rien côté navigateur ne le signale avant la mise en production.
    expect(Object.keys(req.request.body).sort()).toEqual([
      'budget', 'company', 'consent', 'deadline', 'email',
      'message', 'name', 'projectType', 'website',
    ]);
    expect(req.request.body.consent).toBe(true);
    expect(req.request.body.email).toBe('camille.roy@example.test');
    req.flush(null, { status: 202, statusText: 'Accepted' });
  });

  it('classe un 429 et lit le délai de Retry-After', () => {
    const failure = toContactFailure(
      new HttpErrorResponse({
        status: 429,
        headers: new HttpHeaders({ 'Retry-After': '2520' }),
      }),
    );

    expect(failure).toEqual({ kind: 'rateLimited', retryAfterSeconds: 2520 });
  });

  it('rend un délai nul plutôt qu\'inventé quand Retry-After manque', () => {
    // Arrive si la config CORS cesse d'exposer l'en-tête : le navigateur le
    // masque au JavaScript sans qu'aucune erreur ne soit levée.
    const failure = toContactFailure(new HttpErrorResponse({ status: 429 }));

    expect(failure).toEqual({ kind: 'rateLimited', retryAfterSeconds: null });
  });

  it('distingue une requête qui n\'aboutit pas d\'une erreur serveur', () => {
    expect(toContactFailure(new HttpErrorResponse({ status: 0 }))).toEqual({ kind: 'offline' });
    expect(toContactFailure(new HttpErrorResponse({ status: 400 }))).toEqual({ kind: 'rejected' });
    expect(toContactFailure(new HttpErrorResponse({ status: 503 }))).toEqual({ kind: 'server' });
  });

  it('remonte l\'erreur à l\'appelant plutôt que de l\'avaler', () => {
    let failure: HttpErrorResponse | undefined;
    service.submit(submission).subscribe({
      next: () => { throw new Error('ne devrait pas réussir'); },
      error: (error: HttpErrorResponse) => (failure = error),
    });

    httpMock
      .expectOne('/api/u1/contact-requests')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    // Le composant a besoin de savoir : c'est lui qui décide quoi montrer.
    expect(failure?.status).toBe(500);
  });
});
