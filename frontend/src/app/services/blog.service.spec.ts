import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ArticleDraft, BlogService, toPublishFailure } from './blog.service';

/** jsdom n'implémente pas `Blob.text()` : lecture par FileReader. */
function readText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  const draft: ArticleDraft = {
    title: 'Combien coûte un site vitrine',
    excerpt: 'Ce que coûte un site vitrine, poste par poste.',
    body: 'Un site vitrine se paie une fois, puis s’héberge chaque mois.',
    author: 'Marius Dudouet',
    categories: ['SITE_VITRINE'],
    imageAlt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('demande une page de la liste sur le chemin routé vers u2-blog', () => {
    service.list(2).subscribe();

    const req = httpMock.expectOne('/api/u2/articles?page=2&size=12');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], page: 2, size: 12, totalItems: 0, totalPages: 0 });
  });

  it('encode le slug, qui vient de la barre d’adresse', () => {
    service.get('../article-categories').subscribe();

    httpMock.expectOne('/api/u2/articles/..%2Farticle-categories').flush({});
  });

  it('publie en multipart : le JSON typé dans `article`, le fichier dans `image`', async () => {
    const image = new File([new Uint8Array([0x89, 0x50])], 'couverture.png', { type: 'image/png' });
    service.publish({ ...draft, imageAlt: 'Une vitrine' }, image).subscribe();

    const req = httpMock.expectOne('/api/u2/articles');
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    const article = body.get('article') as Blob;
    // Sans ce type, Spring ne convertit pas la partie en ArticleDraft (415).
    expect(article.type).toBe('application/json');
    expect(JSON.parse(await readText(article))).toEqual({ ...draft, imageAlt: 'Une vitrine' });
    expect((body.get('image') as File).name).toBe('couverture.png');
    // Le navigateur doit écrire lui-même la frontière du multipart.
    expect(req.request.headers.has('Content-Type')).toBe(false);
    req.flush({});
  });

  it('n’envoie pas de partie `image` sans image', () => {
    service.publish(draft, null).subscribe();

    const req = httpMock.expectOne('/api/u2/articles');
    expect((req.request.body as FormData).has('image')).toBe(false);
    req.flush({});
  });
});

describe('toPublishFailure', () => {
  const failure = (status: number, error: unknown = null) =>
    toPublishFailure(new HttpErrorResponse({ status, error }));

  it('reprend le motif d’un refus en Problem Details', () => {
    expect(failure(400, { status: 400, detail: 'title : trop court' })).toEqual({
      kind: 'rejected',
      detail: 'title : trop court',
    });
  });

  it('tolère un 400 sans corps exploitable', () => {
    expect(failure(400, 'Bad Request')).toEqual({ kind: 'rejected', detail: null });
  });

  it('distingue l’image trop lourde, le réseau et le serveur', () => {
    expect(failure(413)).toEqual({ kind: 'tooLarge' });
    expect(failure(0)).toEqual({ kind: 'offline' });
    expect(failure(502)).toEqual({ kind: 'server' });
  });
});
