import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { SeoService } from './seo.service';

// Composant stub minimaliste, uniquement pour le routing de test
@Component({ template: '', standalone: true })
class StubComponent {}

const testRoutes = [
  {
    path: '',
    component: StubComponent,
    data: { seo: { title: 'Accueil : Test', description: 'Description accueil test' } },
  },
  {
    path: 'qui-sommes-nous',
    component: StubComponent,
    data: { seo: { title: 'À propos, Test', description: 'Description à propos test' } },
  },
];

describe('SeoService', () => {
  let service: SeoService;
  let document: Document;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(testRoutes)],
    });
    service = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);
    service.init();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('met à jour le titre et la meta description après navigation', async () => {
    await RouterTestingHarness.create('/');
    expect(document.title).toBe('Accueil : Test');
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('Description accueil test');
  });

  it('met à jour le lien canonical après navigation', async () => {
    const harness = await RouterTestingHarness.create('/');
    await harness.navigateByUrl('/qui-sommes-nous');
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.getAttribute('href')).toContain('qui-sommes-nous');
  });

  it('met à jour les meta OG:title et OG:description', async () => {
    const harness = await RouterTestingHarness.create('/');
    await harness.navigateByUrl('/qui-sommes-nous');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content'))
      .toBe('À propos, Test');
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content'))
      .toBe('Description à propos test');
  });
});
