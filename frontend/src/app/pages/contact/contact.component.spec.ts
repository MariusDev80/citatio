import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactComponent } from './contact.component';

/**
 * Les trois états visibles du formulaire.
 *
 * <p>Ces tests valent aussi garde-fou de doctrine : le formulaire a déjà
 * affiché « message envoyé avec succès » alors que rien ne partait. Un succès
 * ne doit apparaître que sur une réponse du serveur, jamais avant.
 */
describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let httpMock: HttpTestingController;

  const ENDPOINT = '/api/u1/contact-requests';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Remplit le formulaire avec un jeu de valeurs valide. */
  function fillValidForm(): void {
    // `contactForm` est protected : accès via l'instance typée en any, comme
    // pour tout test qui pilote l'état interne d'un composant.
    const form = (fixture.componentInstance as any).contactForm;
    form.patchValue({
      name: 'Camille Roy',
      email: 'camille.roy@example.test',
      company: '',
      projectType: 'Refonte d’un site existant',
      budget: '',
      deadline: '',
      message: 'Notre site actuel date de dix ans et ne s’affiche pas sur mobile.',
      consent: true,
      website: '',
    });
  }

  function status(): string {
    return (fixture.componentInstance as any).status();
  }

  function submit(): void {
    (fixture.componentInstance as any).submitForm();
  }

  it('démarre en idle, le formulaire est affiché', () => {
    expect(status()).toBe('idle');
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('ne poste rien tant que le formulaire est invalide', () => {
    submit();

    expect(status()).toBe('idle');
    httpMock.expectNone(ENDPOINT);
  });

  it('exige le consentement RGPD avant tout envoi', () => {
    fillValidForm();
    (fixture.componentInstance as any).contactForm.patchValue({ consent: false });

    submit();

    expect(status()).toBe('idle');
    httpMock.expectNone(ENDPOINT);
  });

  it('passe en sending pendant l\'appel, sans annoncer de succès', () => {
    fillValidForm();
    submit();

    expect(status()).toBe('sending');
    const req = httpMock.expectOne(ENDPOINT);

    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);

    req.flush(null, { status: 202, statusText: 'Accepted' });
  });

  it('affiche l\'accusé de réception à la place du formulaire sur 202', () => {
    fillValidForm();
    submit();
    httpMock.expectOne(ENDPOINT).flush(null, { status: 202, statusText: 'Accepted' });
    fixture.detectChanges();

    expect(status()).toBe('success');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Votre message est arrivé');
  });

  it('déplace le focus sur l\'accusé de réception', () => {
    // Sans ce déplacement, un lecteur d'écran resterait sur un bouton disparu
    // et n'annoncerait jamais que le message est parti.
    fillValidForm();
    submit();
    httpMock.expectOne(ENDPOINT).flush(null, { status: 202, statusText: 'Accepted' });
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h2[tabindex="-1"]');
    expect(heading).not.toBeNull();
    expect(document.activeElement).toBe(heading);
  });

  it('garde le formulaire et propose de réessayer quand l\'envoi échoue', () => {
    fillValidForm();
    submit();
    httpMock
      .expectOne(ENDPOINT)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    expect(status()).toBe('error');
    // Le formulaire reste en place, saisie comprise : rien n'est à retaper.
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('n’est pas parti');
  });

  it('renvoie après un échec, et un second essai peut réussir', () => {
    fillValidForm();
    submit();
    httpMock.expectOne(ENDPOINT).flush(null, { status: 503, statusText: 'Service Unavailable' });

    submit();
    httpMock.expectOne(ENDPOINT).flush(null, { status: 202, statusText: 'Accepted' });
    fixture.detectChanges();

    expect(status()).toBe('success');
  });

  it('le leurre part vide et n\'est pas atteignable au clavier', () => {
    fillValidForm();
    submit();
    const req = httpMock.expectOne(ENDPOINT);

    expect(req.request.body.website).toBe('');
    const honeypot: HTMLInputElement = fixture.nativeElement.querySelector('#website');
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();

    req.flush(null, { status: 202, statusText: 'Accepted' });
  });
});
